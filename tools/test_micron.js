// node tools/test_micron.js : checks brew-log/micron.js against brew-log/grinders.js
var fs=require("fs"),path=require("path"),vm=require("vm"),assert=require("assert");
var dir=path.join(__dirname,"..","brew-log"),ctx={};
vm.createContext(ctx);
["grinders.js","micron.js"].forEach(function(f){vm.runInContext(fs.readFileSync(path.join(dir,f),"utf8"),ctx)});
var M=ctx.Micron,G=ctx.GRINDERS,fails=0;
function k(n){var x=M.find(n);assert.ok(x,"no grinder "+n);return x}
function t(name,input,um,label){
  var r=M.calc(k(name),input);
  try{
    assert.ok(!r.e,r.e);
    assert.strictEqual(r.um,um);
    if(label!==undefined)assert.strictEqual(r.label,label);
  }catch(e){fails++;console.log("FAIL",name,JSON.stringify(input),"->",JSON.stringify(r),"want",um,label||"")}
}
function bad(name,input){var r=M.calc(k(name),input);if(!r.e){fails++;console.log("FAIL expected error",name,input,JSON.stringify(r))}}

// Keys are unique and every grinder's chart spans lo..hi end to end.
var keys={};M.list.forEach(function(g){assert.ok(!keys[g.key],"dup key "+g.key);keys[g.key]=1});
M.list.forEach(function(g){var i=M.info(g.key);t(g.name,i.first,i.lo);t(g.name,i.last,i.hi)});
assert.strictEqual(G.length,212);
// Every chart label reads back at its own (first) position.
G.forEach(function(g){
  var key=k(g.b+" "+g.m),ts=typeof g.t==="string"?g.t.split("|"):[];
  if(!ts.length)for(var v=g.t[0];v<=g.t[1];v++)ts.push(String(v));
  var seen={};
  ts.forEach(function(lab,i){
    if(seen[lab])return;seen[lab]=1;
    var r=M.calc(key,lab),want=Math.round(g.lo+(g.hi-g.lo)*i/(ts.length-1));
    if(r.e||r.um!==want){fails++;console.log("FAIL label",g.b,g.m,lab,JSON.stringify(r),"want",want)}
  });
});

// Plain click dials: lo + (hi-lo) * clicks / (ticks-1)
t("Comandante C40 MK4","24",654);            // 1090*24/40
t("Comandante C40 MK4","٢٤",654);            // Arabic digits
t("Comandante C40 MK4","24ك",654);
bad("Comandante C40 MK4","41");
t("Mahlkönig EK43 S","7.35",Math.round(180+623*73.5/160)); // between ticks
t("Fiorenzato Pietro","8",770);              // label is "8"
t("Fiorenzato Pietro","10",920);             // label is "10.0"

// 1Zpresso rotation.number.click
t("1Zpresso K-Ultra","3.5",266,"0.3.5");     // 760*35/100
t("1Zpresso K-Ultra","0.3.5",266);
t("1Zpresso K-Ultra","75",570,"0.7.5");      // clicks from zero
t("1Zpresso K-Ultra","75ك",570);
t("1Zpresso Q2 (Heptagonal burrs)","1.5.0",510,"1.5.0"); // 45 clicks of 120
t("1Zpresso Q2 (Heptagonal burrs)","45",510);
t("1Zpresso Q2 (Heptagonal burrs)","c45",510);
t("1Zpresso J-Max","3.0.0",Math.round(1190*270/450));
var r=M.calc(k("1Zpresso J-Max"),"3.5");      // rotation 3 number 5, with 0.3.5 offered as the other reading
assert.strictEqual(r.label,"3.5.0");assert.strictEqual(r.alt,"0.3.5");
t("1Zpresso JX-Pro S","1.5.2",Math.round(915*62/200));

// Source typo fixes
t("Niche Zero","0.65",Math.round(1400*65/113));
t("Varia Evo Hybrid","1+0",Math.round(130+700*72/144));
t("Varia Evo Hybrid","0",130);
t("Orphan Espresso Lido OG","200+20",Math.round(1400*44/280));
t("Weber Workshops KEY Mk1","2.10.0",Math.round(940*200/225));
t("Weber Workshops KEY Mk1","40",Math.round(940*20/225)); // 2 clicks per tick
bad("Weber Workshops KEY Mk1","41");
t("Bodum Bistro 10903","1",365);
t("Bodum Bistro 10903","12",1390);

// KitchenAid: 1 is the coarsest setting, 70 the finest
t("KitchenAid Coffee Grinder 5KCG8433","70",240);
t("KitchenAid Coffee Grinder 5KCG8433","1",1130);

// Encore ESP: macro settings 21-40 cover four chart steps each, read at the first one
t("Baratza Encore ESP","20",460);
t("Baratza Encore ESP","21",Math.round(230+1150*24/100));
t("Baratza Encore ESP","40",1380);

// Letters and other separators
t("Baratza Forté BG","5f",Math.round(230+920*109/259)); // 4*26+5
t("Baratza Forté BG","1C",Math.round(230+920*2/259));
t("Goat Story Arco","1/5",Math.round(1400*65/233));
t("Weber Workshops EG-1","+3.5",Math.round(1400*35/280));
t("Eureka Mignon Specialità","1+2.5",Math.round(195+1205*17/48));

bad("Comandante C40 MK4","abc");
bad("1Zpresso K-Ultra","");

console.log(fails?fails+" failed":"all passed");
process.exit(fails?1:0);
