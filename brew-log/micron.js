// Grind setting -> estimated particle size (µm), from the chart table in grinders.js.
// Each tick on a grinder's chart is one equal step between its finest (lo) and
// coarsest (hi) micron value; a repeated label is read at its first position.
var Micron=(function(){
  function norm(s){
    return String(s).replace(/[٠-٩]/g,function(d){return d.charCodeAt(0)-1632}).replace(/[۰-۹]/g,function(d){return d.charCodeAt(0)-1776})
      .replace(/[٫,،]/g,".").replace(/\s+/g,"").toUpperCase().replace(/^\+/,"");
  }
  // "0.3.5" -> "3.5", "3.0.0" -> "3", "1+0.5" -> "1.0.5": drops leading/trailing zero groups.
  function canon(s){
    var t=s.replace(/[+\/]/g,".").replace(/(\.0+)+$/,""),l=t.replace(/^(0+\.)+/,"");
    return {c:l||"0",lead:t.length-l.length};
  }
  function groups(s){return s.split(/[.+\/]/).map(Number)}
  var NUM=/^\d+(\.\d+)?$/,CLK=/^(?:C|ك)?(\d+)(C|CLICKS?|ك|كليك|كليكات)?$/;

  var list=GRINDERS.map(function(g){
    var k=(g.b+" "+g.m).toLowerCase().replace(/\+/g," plus").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    return {key:k,name:g.b+" "+g.m,raw:g};
  });
  var byKey={};list.forEach(function(g){byKey[g.key]=g});

  function prep(g){
    if(g.t)return g;
    var r=g.raw,t=typeof r.t==="string"?r.t.split("|"):[];
    if(!t.length)for(var v=r.t[0];v<=r.t[1];v++)t.push(String(v));
    g.t=t;g.lo=r.lo;g.hi=r.hi;g.z=r.z||[];
    g.n=t.map(norm);g.first=Object.create(null);g.dup=false;
    g.n.forEach(function(s,i){if(s in g.first)g.dup=true;else g.first[s]=i});
    // Evenly spaced plain numbers (EK43 0-16, DF64 0-90, KitchenAid 70..1): values between ticks interpolate.
    g.lin=null;
    if(g.n.every(function(s){return NUM.test(s)})){
      var a=g.n.map(Number),st=a[1]-a[0],ok=st!==0;
      for(var i=1;ok&&i<a.length;i++)ok=Math.abs(a[i]-a[i-1]-st)<1e-9;
      if(ok)g.lin={a:a[0],b:a[a.length-1],st:st};
    }
    // Step count from zero: needs a chart that starts at 0 and moves one fixed step per tick.
    g.step=0;
    var p0=groups(g.n[0]),p1=groups(g.n[1]);
    if(!g.lin&&!g.dup&&p0.every(function(x){return x===0})&&p1.slice(0,-1).every(function(x){return x===0})&&p1[p1.length-1]>0)g.step=p1[p1.length-1];
    return g;
  }
  function um(g,i){return Math.round(g.lo+(g.hi-g.lo)*i/(g.t.length-1))}
  function result(g,i,via,extra){
    var u=um(g,i),r={um:u,i:i,via:via,label:g.t[Math.round(i)]};
    r.zone=g.z.filter(function(z){return u>=z[1]&&u<=z[2]}).map(function(z){return z[0]}).join("، ");
    r.methods=BREW_METHODS.filter(function(m){return u>=m.min&&u<=m.max}).map(function(m){return m.l});
    for(var k in extra)r[k]=extra[k];
    return r;
  }

  function calc(key,input){
    var g=byKey[key];if(!g)return {e:"طاحونة غير معروفة"};
    prep(g);
    var s=norm(input);if(!s)return {e:"اكتب درجة الطحن"};
    // 1. The label exactly as the grinder's chart writes it (checked first: Baratza has labels like 1C).
    if(s in g.first)return result(g,g.first[s],"exact");
    var m=CLK.exec(s),forced=!!(m&&(m[2]||/^[Cك]/.test(s)));
    if(forced)s=m[1];
    // 2. Plain numbers on an evenly spaced dial, including values between ticks.
    if(g.lin&&NUM.test(s)){
      var v=Number(s),f=(v-g.lin.a)/g.lin.st;
      if(f<-1e-9||f>g.t.length-1+1e-9)return {e:"خارج مدى الطاحونة ("+g.t[0]+" إلى "+g.t[g.t.length-1]+")"};
      f=Math.min(Math.max(f,0),g.t.length-1);
      return result(g,f,"num",{between:Math.abs(f-Math.round(f))>1e-9});
    }
    // 3. Same setting with zero groups dropped or added: 3.5 = 0.3.5, 3 = 3.0.0, 1/5 = 1.5.
    if(!forced){
      var c=canon(s),hits=[];
      g.n.forEach(function(t,i){var k=canon(t);if(k.c===c.c&&g.first[t]===i)hits.push({i:i,d:Math.abs(k.lead-c.lead)})});
      if(hits.length){
        // Ambiguous on 1Zpresso style dials (3.5 = rotation 3 number 5, or number 3 click 5): prefer the reading that
        // keeps the user's leading groups, and report the other one.
        hits.sort(function(a,b){return a.d-b.d||a.i-b.i});
        return result(g,hits[0].i,"canon",hits.length>1?{alt:g.t[hits[1].i]}:{});
      }
    }
    // 4. A whole number of clicks counted from zero.
    if(g.step&&/^\d+$/.test(s)){
      var n=Number(s);
      if(n%g.step)return {e:"عدد الكليكات لازم يكون من مضاعفات "+g.step+" في هذي الطاحونة"};
      if(n/g.step>g.t.length-1)return {e:"أكثر من آخر إعداد في الجدول ("+g.t[g.t.length-1]+")"};
      return result(g,n/g.step,"clicks",{clicks:n});
    }
    return {e:"ما لقيت هذا الإعداد في جدول الطاحونة. "+hint(key)};
  }

  function hint(key){
    var g=byKey[key];if(!g)return "";
    prep(g);
    var t=g.t,ex=[t[Math.round((t.length-1)*0.4)],t[Math.round((t.length-1)*0.6)]].filter(function(x,i,a){return a.indexOf(x)===i});
    var h="الإعداد من "+t[0]+" إلى "+t[t.length-1]+"، مثل "+ex.join(" أو ");
    if(g.step)h+="، أو عدد الكليكات من الصفر مثل "+(g.step*Math.round((t.length-1)*0.4))+"ك";
    return h;
  }
  function info(key){var g=byKey[key];if(!g)return null;prep(g);return {name:g.name,lo:g.lo,hi:g.hi,first:g.t[0],last:g.t[g.t.length-1],ph:g.t[Math.round((g.t.length-1)*0.4)]}}
  function find(name){var n=String(name).toLowerCase();for(var i=0;i<list.length;i++)if(list[i].name.toLowerCase()===n)return list[i].key;return ""}

  return {list:list,calc:calc,hint:hint,info:info,find:find,norm:norm};
})();
