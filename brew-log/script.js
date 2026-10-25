window.onerror=function(m,u,l){var e=document.getElementById("jserr");if(e)e.textContent=String(m)+" (line "+l+")"};

var $=function(i){return document.getElementById(i)};
$("jsmsg").style.display="none";
var scores=[["الحلاوة","sw"],["الحمضية","ac"],["القوام","bd"],["المرارة","bt"],["النظافة","cl"]];
var adjs=["أنعم","أخشن","حرارة أعلى","حرارة أقل","ريشيو أطول","ريشيو أقصر","صب أهدأ","صب أعنف","تغيير فلتر","تغيير ماء","تغيير أداة"];
var sl=$("sliders");
scores.forEach(function(s){var d=document.createElement("div");d.className="sl";d.innerHTML='<span>'+s[0]+'</span><input type="range" min="0" max="10" value="5" id="'+s[1]+'" data-touched="0" aria-label="'+s[0]+'"><b id="'+s[1]+'v" role="button" tabindex="0" title="اضغط للمسح">—</b>';sl.appendChild(d)});
// A tap without dragging still counts as a rating; tapping the number clears it.
function untouch(id){$(id).value=5;$(id).dataset.touched="0";render()}
sl.addEventListener("click",function(e){var t=e.target;if(t.type==="range"){t.dataset.touched="1";render()}else if(t.tagName==="B"&&$(t.id.slice(0,-1)).dataset.touched==="1")untouch(t.id.slice(0,-1))});
sl.addEventListener("keydown",function(e){if(e.target.tagName==="B"&&(e.key==="Enter"||e.key===" ")){e.preventDefault();untouch(e.target.id.slice(0,-1))}});
adjs.forEach(function(a){var l=document.createElement("label");l.innerHTML='<input type="checkbox" value="'+a+'"> '+a;$("adj").appendChild(l)});

function addPour(v){var d=document.createElement("div");d.className="pour";
d.innerHTML='<div class="ac"><input class="a" type="number" min="0" step="10" inputmode="numeric" enterkeyhint="next" placeholder="50" aria-label="الكمية بالمل"><span>مل</span></div><div class="tc"><input class="t" type="text" inputmode="numeric" enterkeyhint="next" autocomplete="off" placeholder="0:45" aria-label="مدة الصبّة"><span class="tm" dir="ltr"></span></div><div class="nt"><input type="text" enterkeyhint="next" placeholder="تفتيح أو صب بطيء" aria-label="ملاحظة"></div><button type="button" class="btn del" title="حذف الصبّة" aria-label="حذف الصبّة">✕</button>';
if(v){d.querySelector(".a").value=v[0]||"";d.querySelector(".t").value=v[1]||"";d.querySelector(".nt input").value=v[2]||""}
$("pours").appendChild(d)}
function parseT(v){v=v.replace(/[٠-٩]/g,function(d){return d.charCodeAt(0)-1632}).replace(/[.,٫،;]/g,":");
if(!/^\d+(:\d{1,2})?$/.test(v))return null;
if(v.indexOf(":")>-1){var a=v.split(":"),x=+a[1];return x>59?null:+a[0]*60+x}
var ss=+v.slice(-2),mm=v.length>2?+v.slice(0,-2):0;return ss>59?null:mm*60+ss}
function fmtT(v){if(v==="")return"";var n=Math.max(0,Math.round(+v));var m=Math.floor(n/60),r=n%60;return m+":"+(r<10?"0":"")+r}
$("pours").addEventListener("click",function(e){var b=e.target.closest(".del");if(b){b.parentNode.remove();render()}});
addPour();addPour();
$("addPour").onclick=function(){addPour();render()};

// Grinders with a chart in grinders.js are converted by micron.js (estimated particle size).
// EX holds the rest: a few with only the maker's burr travel per click, and ones with no number at all.
var POP=["1Zpresso K-Ultra","1Zpresso J-Ultra","1Zpresso J-Max S","1Zpresso X-Ultra","1Zpresso ZP6 Special","1Zpresso K-Max","1Zpresso K-Plus","1Zpresso Q2 (Heptagonal burrs)","1Zpresso Q Air","1Zpresso JX-Pro S","1Zpresso X-Pro S","Comandante C40 MK4","Comandante C40 MK4 (with Red Clix)","Comandante C60 Baracuda","KINGrinder K1","KINGrinder K6","Timemore C3","Timemore Sculptor 064","Timemore Sculptor 064S","Timemore Sculptor 078","Timemore Sculptor 078S","Fiorenzato Pietro","Fellow Ode Brew Grinder Gen 1","Fellow Ode Brew Grinder Gen 2","Weber Workshops EG-1","Weber Workshops KEY Mk1","Varia VS3 (Gen 2)","Option-O Lagom P64","Option-O Lagom Mini (Moonshine burrs)","Option-O Lagom Mini (Obsidian burrs)","Mahlkönig EK43 S","Eureka Atom 75","Eureka Mignon Specialità","Turin DF54","Turin DF64 (Gen 2)","Turin DF64V","Turin DF83","Turin DF83V","Baratza Encore","Baratza Sette 30","Baratza Forté BG","Wilfa Svart"].map(Micron.find);
var TAG={"fiorenzato-pietro":"Pietro"};
var ND="ما لقيت رقم ميكرون منشور لها، فما أحوّل عشان ما أخمّن.";
var EX={"x-c5": {"l": "Timemore C5 Pro", "um": 31, "f": "clk", "ph": "12", "h": "اكتب عدد الكليكات من نقطة الصفر (48 كليك = لفة)", "s": "Timemore الرسمي"}, "x-millab": {"l": "Millab M01", "um": 12.5, "f": "n10", "ph": "8.0", "h": "اكتب رقم.كليك مثل 3.5 (كل رقم = 10 كليكات)", "s": "Millab الرسمي"}, "x-a2": {"l": "Femobook A2", "um": 18, "f": "clk", "ph": "60", "h": "اكتب عدد الكليكات من الصفر (40 كليك = لفة)", "s": "Femobook الرسمي"}, "x-jeplus": {"l": "1Zpresso JE-Plus", "um": 12.5, "f": "top", "ph": "1.5", "h": "كليكات من الصفر مثل 60، أو لفة.رقم مثل 1.5 (4 كليكات لكل رقم، 40 كليك = لفة)", "s": "1Zpresso الرسمي"}};
["Monolith Flat Max","Monolith MC","Monolith SDRM","Lagom P100","Lagom 01","Lagom P80","Lagom Casa","Comandante Tigershark","Mavo Z Pro","Mavo Phoenix Pro","Mahlkönig X64 SD","Eureka Single Dose","Varia VS6","Milo Play","GE83","G64","GZZT Z63","Hibrew G5","G5 mini","Starseeker edge plus","Potu-F Ghost Burr","E55","Codex D7","Storm","MX Cool aries","A4Z","E-pro"].forEach(function(l,i){EX["x-nd"+i]={l:l,nd:l==="Comandante Tigershark"?"ما تأكدت من مواصفاتها فما أحوّل. إذا هي C40 MK4 اختر C40 MK4.":l==="E-pro"?"ما عرفت أي طاحونة هذي بالضبط، ولا لقيت لها رقم موثق.":ND}});
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function grName(k){var g=Micron.info(k);return g?g.name:EX[k]?EX[k].l:""}
var gs=$("grinder");
function opts(keys){return keys.map(function(k){return'<option value="'+k+'">'+esc(grName(k))+'</option>'}).join("")}
var exk=Object.keys(EX);
var allKeys=Micron.list.map(function(g){return g.key}).concat(exk);
var ALIAS=[["كماندنتي","comandante"],["كوماندانتي","comandante"],["تايمور","timemore"],["تايمر","timemore"],["كينقرايندر","kingrinder"],["كنقرايندر","kingrinder"],["فيلو","fellow"],["لاقوم","lagom"],["نيش","niche"],["باراتزا","baratza"],["يوريكا","eureka"],["ويبر","weber"],["فاريا","varia"],["زبريسو","1zpresso"],["زيبريسو","1zpresso"]];
function gnorm(q){q=String(q).toLowerCase();ALIAS.forEach(function(a){q=q.split(a[0]).join(a[1])});return q.replace(/[\s\-_.()+]/g,"")}
// The search box narrows the long list; with one match it is picked straight away.
function buildGrinders(q){
  var cur=gs.value,n=gnorm(q||"");
  if(!n){gs.innerHTML='<option value="">—</option>'
    +'<optgroup label="الأكثر استخداماً">'+opts(POP)+'</optgroup>'
    +'<optgroup label="كل الطواحين (A-Z)">'+opts(Micron.list.map(function(g){return g.key}))+'</optgroup>'
    +'<optgroup label="حركة البر فقط، مو حجم حبيبات">'+opts(exk.filter(function(k){return !EX[k].nd}))+'</optgroup>'
    +'<optgroup label="بدون رقم ميكرون">'+opts(exk.filter(function(k){return EX[k].nd}))+'</optgroup>'
    +'<option value="__o">طاحونة ثانية</option>';gs.value=cur;return}
  var hit=allKeys.filter(function(k){return gnorm(grName(k)).indexOf(n)>-1});
  var keep=cur&&cur!=="__o"&&hit.indexOf(cur)<0?[cur]:[];
  gs.innerHTML='<option value="">'+(hit.length?"— "+hit.length+" نتيجة —":"— ما لقيت، جرّب اسم ثاني —")+'</option>'+opts(keep.concat(hit))+'<option value="__o">طاحونة ثانية</option>';
  gs.value=hit.length===1?hit[0]:cur;
}
buildGrinders("");
$("gq").addEventListener("input",function(e){e.stopPropagation();buildGrinders(this.value);render()});
function clicks(g,s){
  s=Micron.norm(s);
  var p=s.split("."),a=p.map(Number);
  if(p.some(function(x){return x===""})||a.some(isNaN))return{e:"الرقم غير مفهوم"};
  if(g.f==="clk")return p.length>1?{e:"اكتب عدد الكليكات كامل بدون نقطة، مثل 90"}:{c:a[0]};
  if(g.f==="n10"){
    if(p.length===1)return{c:a[0]*10};
    if(p.length===2&&p[1].length===1)return{c:a[0]*10+a[1]};
    return{e:"الصيغة رقم.كليك والكليك من 0 إلى 9، مثل 3.5"};
  }
  if(g.f==="top"){
    if(p.length===1)return{c:a[0]};
    if(p.length===2&&p[1].length===1)return{c:a[0]*40+a[1]*4};
    return{e:"الصيغة كليكات فقط، أو لفة.رقم مثل 1.5"};
  }
}
// Returns the text added to the post after the grind setting, or "" when there is nothing to add.
function mic(){
  var k=$("grinder").value,s=$("grind").value.trim(),el=$("micv"),x=EX[k],g=!x&&Micron.info(k);
  if(!g&&!x){$("grind").placeholder="مثل 24";el.innerHTML='<span class="hint">اختر الطاحونة وبعدين اكتب الرقم عشان يتحول لميكرون</span>';return""}
  if(x&&x.nd){$("grind").placeholder="مثل 24";el.innerHTML='<b>'+esc(x.l)+'</b><br><span class="hint">'+x.nd+'</span>';return""}
  if(x){
    $("grind").placeholder=x.ph;
    var hx='<b>'+esc(x.l)+'</b>: '+x.um+' µm حركة بر لكل كليك <span class="hint">('+x.s+'، ما لها جدول حجم حبيبات فهذا مو قابل للمقارنة مع باقي الطواحين)</span>';
    if(!s){el.innerHTML=hx+'<br><span class="hint">'+x.h+'</span>';return""}
    var c=clicks(x,s);
    if(c.e){el.innerHTML=hx+'<br><span style="color:#d9534f">'+c.e+'</span>';return""}
    var n=Math.round(c.c*x.um);
    el.innerHTML=hx+'<br><span class="big">≈ '+n+' µm</span> <span class="hint">حركة بر: '+c.c+' × '+x.um+'</span>';
    return"≈"+n+" µm حركة بر";
  }
  $("grind").placeholder=g.ph;
  var head='<b>'+esc(g.name)+'</b> <span class="hint">من '+g.lo+' إلى '+g.hi+' µm</span>';
  if(!s){el.innerHTML=head+'<br><span class="hint">'+esc(Micron.hint(k))+'</span>';return""}
  var r=Micron.calc(k,s);
  if(r.e){el.innerHTML=head+'<br><span style="color:#d9534f">'+esc(r.e)+'</span>';return""}
  var how=r.via==="clicks"?r.clicks+" كليك من الصفر = "+r.label:r.between?"بين إعدادين في الجدول":"الإعداد "+r.label;
  el.innerHTML=head+'<br><span class="big">≈ '+r.um+' µm</span> <span class="hint">'+esc(how)+'</span>'
    +(r.alt?'<br><span class="hint">إذا تقصد '+esc(r.alt)+' اكتبها كاملة</span>':'')
    +(r.zone?'<br><span class="hint">على الطاحونة: '+esc(r.zone)+'</span>':'')
    +(r.methods.length?'<br><span class="hint">يناسب عادة: <span class="methods">'+esc(r.methods.slice(0,3).join("، "))+'</span></span>':'');
  return"≈"+r.um+" µm";
}
function val(i){var e=$(i);if(e.tagName==="SELECT"){if(e.value==="__o")return $(i+"_o").value.trim();if(i==="grinder"&&e.value)return grName(e.value)}return e.value.trim()}
function line(k,v){return v?k+": "+v:""}
function fmtDate(v){if(!v)return"";var p=v.split("-");return p[2]+"/"+p[1]+"/"+p[0]}

function render(){
  document.querySelectorAll("select[data-o]").forEach(function(s){$(s.id+"_o").hidden=s.value!=="__o"});
  var mu=mic();
  var tl=[];["method","origin","process","grinder"].forEach(function(i){var v=$(i).value;if(v&&v!=="__o"){var tg=i==="grinder"?TAG[v]:v;if(i==="method"&&["V60","Orea","Pulsar","AeroPress"].indexOf(v)<0)tg="";if(tg)tl.push(tg)}else if(v==="__o"&&i==="process")tl.push("معالجة-أخرى");else if(v==="__o"&&i==="origin")tl.push("دولة أخرى")});
  $("tags").innerHTML=tl.length?tl.map(function(t){return'<span class="tg">'+t+'</span>'}).join(""):'<span class="hint">تظهر هنا بعد ما تختار</span>';
  var d=+val("dose"),y=+val("yield");
  $("ratio").textContent=(d>0&&y>0)?"النسبة: 1:"+(y/d).toFixed(1):"";
  var head=[val("roaster")?"["+val("roaster")+"]":"",val("coffee")].filter(Boolean).join(" ");
  var t=head?head+(val("method")?" — "+val("method"):""):"";
  $("title").textContent=t||"العنوان يظهر هنا بعد ما تكتب المحمصة والمحصول";
  // Empty fields are dropped inside each block so they leave no blank lines in the post.
  var coffee=[line("المحمصة",val("roaster")),line("المحصول",val("coffee")),line("البلد",val("origin")),line("المعالجة",val("process")),line("السلالة",val("variety")),line("درجة التحميص",val("level")),line("تاريخ التحميص",fmtDate(val("roast")))].filter(Boolean);
  var brew=[line("طريقة التحضير",val("method")),line("الأداة",val("tool")),line("الفلتر",val("filter")),line("الطاحونة",val("grinder")),line("درجة الطحن",val("grind")?val("grind")+(mu&&$("addmic").checked?" ("+mu+")":""):""),
    line("الماء",val("water")),line("الحرارة",val("temp")?val("temp")+"°":""),line("الجرعة",val("dose")?val("dose")+" غ":""),line("الناتج",val("yield")?val("yield")+" غ":""),
    (d>0&&y>0)?"النسبة: 1:"+(y/d).toFixed(1):"",line("الوقت الكلي",val("time"))].filter(Boolean);
  var L=coffee.concat(coffee.length&&brew.length?[""]:[],brew);
  var run=0;var ps=[].slice.call(document.querySelectorAll(".pour")).map(function(p){var a=p.querySelector(".a").value.trim(),t=p.querySelector(".t").value.trim(),b=p.querySelector(".nt input").value.trim(),f="",bad=false;if(t!==""){var sec=parseT(t);if(sec===null)bad=true;else{run+=sec;f=fmtT(run)}}p.querySelector(".tm").textContent=bad?"؟ مثل 1:20":(f?"= "+f:"");var parts=[a?a+" مل":"",f,b].filter(Boolean);return parts.length?"- "+parts.join(" | "):""}).filter(Boolean);
  if(ps.length){L.push("","الوصفة:");L=L.concat(ps)}
  var sc=[];
  scores.forEach(function(s){var e=$(s[1]);if(e.dataset.touched==="1")sc.push(s[0]+": "+e.value+"/10");$(s[1]+"v").textContent=e.dataset.touched==="1"?e.value+"/10":"—"});
  if(val("taste")||sc.length){L.push("");if(val("taste"))L.push(line("الطعم",val("taste")));L=L.concat(sc)}
  if(val("notes"))L.push("",line("ملاحظات عامة",val("notes")));
  var ch=[].slice.call(document.querySelectorAll("#adj input:checked")).map(function(c){return"- "+c.value});
  if(ch.length){L.push("","وش يحتاج تعديل؟");L=L.concat(ch)}
  var o=$("out");o.value=L.join("\n").replace(/^\n+/,"").replace(/\n{3,}/g,"\n\n");
  o.style.height="auto";o.style.height=o.scrollHeight+2+"px";
  save();
}
document.addEventListener("input",function(e){if(e.target.type==="range")e.target.dataset.touched="1";render()});
document.addEventListener("change",render);

// Feedback shows in a toast so it is seen even when the side panel is off screen.
var toastT;
function toast(msg,act,ms){
  var t=$("toast");t.textContent=msg;
  if(act){var b=document.createElement("button");b.type="button";b.textContent=act[0];b.onclick=function(){t.hidden=true;act[1]()};t.appendChild(b)}
  t.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},ms||2500);
}
function copy(text,label){
  function ok(){$("msg").textContent="تم نسخ "+label+" ✓";toast("تم نسخ "+label+" ✓")}
  function no(){toast("ما اننسخ، حدد النص وانسخه يدوي")}
  function fb(){var ta=document.createElement("textarea");ta.value=text;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();try{document.execCommand("copy")?ok():no()}catch(e){no()}document.body.removeChild(ta)}
  try{navigator.clipboard.writeText(text).then(ok,fb)}catch(e){fb()}
}
// Added to the copied post only. <...> stops Discord from showing a link preview card.
var SITE="https://h2beanbook.vercel.app";
function postText(){var t=$("out").value;return t?t+"\n\n☕✨ **عجبك؟ سوّ سجلك بنفسك!**\n👉 <"+SITE+">":""}
function titleText(){var t=$("title").textContent;return t.indexOf("يظهر هنا")<0?t:""}
$("copyAll").onclick=function(){var t=postText();if(t)copy(t,"النص");else toast("النص فاضي، عبّ الحقول أول")};
$("copyTitle").onclick=function(){var t=titleText();if(t)copy(t,"العنوان");else toast("اكتب المحمصة والمحصول عشان يطلع العنوان")};
$("copyBoth").onclick=function(){var t=[titleText(),postText()].filter(Boolean).join("\n\n");if(t)copy(t,"العنوان والنص");else toast("ما فيه شي ينسخ، عبّ الحقول أول")};
if(navigator.share){$("share").hidden=false;$("share").onclick=function(){var t=postText();if(!t){toast("النص فاضي، عبّ الحقول أول");return}navigator.share({text:t}).catch(function(){})}}

// The whole form is kept in this browser so switching apps or reloading loses nothing.
var DRAFT="brewlog-draft-v1";
function snap(){
  var v={};
  document.querySelectorAll("main input[id],main select[id],main textarea[id]").forEach(function(e){if(e.id!=="gq"&&e.type!=="range")v[e.id]=e.type==="checkbox"?e.checked:e.value});
  var r={};scores.forEach(function(x){r[x[1]]=[$(x[1]).value,$(x[1]).dataset.touched]});
  var p=[].slice.call(document.querySelectorAll(".pour")).map(function(d){return[d.querySelector(".a").value,d.querySelector(".t").value,d.querySelector(".nt input").value]});
  var a=[].slice.call(document.querySelectorAll("#adj input:checked")).map(function(c){return c.value});
  return {v:v,r:r,p:p,a:a};
}
function load(st){
  $("gq").value="";buildGrinders("");
  Object.keys(st.v||{}).forEach(function(id){var e=$(id);if(!e)return;if(e.type==="checkbox")e.checked=!!st.v[id];else e.value=st.v[id]});
  Object.keys(st.r||{}).forEach(function(id){if($(id)){$(id).value=st.r[id][0];$(id).dataset.touched=st.r[id][1]==="1"?"1":"0"}});
  $("pours").innerHTML="";(st.p&&st.p.length?st.p:[0,0]).forEach(function(x){addPour(x||null)});
  document.querySelectorAll("#adj input").forEach(function(c){c.checked=(st.a||[]).indexOf(c.value)>-1});
}
var loaded=false;
function save(){if(!loaded)return;try{localStorage.setItem(DRAFT,JSON.stringify(snap()))}catch(e){}}
function clearForm(){
  document.querySelectorAll("input[type=text],input[type=search],input[type=number],input[type=date],textarea:not(#out)").forEach(function(e){e.value=""});
  document.querySelectorAll("#adj input").forEach(function(c){c.checked=false});
  buildGrinders("");
  document.querySelectorAll("select").forEach(function(x){x.selectedIndex=0});
  $("addmic").checked=true;
  scores.forEach(function(s){$(s[1]).value=5;$(s[1]).dataset.touched="0"});
  $("pours").innerHTML="";addPour();addPour();
}
// Reset is one tap away from the copy buttons, so it can be undone for a few seconds.
$("reset").onclick=function(){var before=snap();clearForm();render();toast("انمسح كل شي",["تراجع",function(){load(before);render();toast("رجع كل شي ✓")}],7000)};

// Enter jumps to the next field instead of doing nothing.
document.querySelectorAll("main input").forEach(function(e){if(!/^(checkbox|range)$/.test(e.type))e.setAttribute("enterkeyhint","next")});
document.addEventListener("keydown",function(e){
  var t=e.target;if(e.key!=="Enter"||e.isComposing||t.tagName!=="INPUT"||/^(checkbox|range)$/.test(t.type))return;
  e.preventDefault();
  var f=[].slice.call(document.querySelectorAll("main input,main select,main textarea")).filter(function(x){return x.offsetParent&&!/^(checkbox|range)$/.test(x.type)});
  var i=f.indexOf(t);if(f[i+1])f[i+1].focus();else t.blur();
});
function isDark(){var t=document.documentElement.getAttribute("data-theme");if(t)return t==="dark";return !!(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches)}
function themeLabel(){var d=isDark();$("theme").textContent=d?"☀️ فاتح":"🌙 داكن";document.documentElement.style.colorScheme=d?"dark":"light"}
try{var st=localStorage.getItem("theme");if(st==="dark"||st==="light")document.documentElement.setAttribute("data-theme",st)}catch(e){}
$("theme").onclick=function(){var t=isDark()?"light":"dark";document.documentElement.setAttribute("data-theme",t);try{localStorage.setItem("theme",t)}catch(e){}themeLabel()};
themeLabel();
try{var dr=localStorage.getItem(DRAFT);if(dr)load(JSON.parse(dr))}catch(e){}
loaded=true;
render();
