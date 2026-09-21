import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const code=await readFile('assets/soundtrack.js','utf8');
class Element{
 constructor(){this.listeners={};this.attributes={};this.children=[];this.hidden=false;this.textContent='';}
 addEventListener(type,listener){(this.listeners[type]??=[]).push(listener);}
 emit(type,event={}){for(const listener of this.listeners[type]||[])listener(event);}
 setAttribute(name,value){this.attributes[name]=value;}
 insertAdjacentElement(position,element){this.children.push(element);}
}
function setup(hasButton=true){
 const button=new Element(),document=new Element(),window=new Element(),instances=[],frames=new Map();let now=0,nextFrame=0;
 document.hidden=false;document.getElementById=id=>id==='snd'&&hasButton?button:null;document.createElement=()=>new Element();
 class FakeAudio extends Element{
  constructor(){super();this.paused=true;this.currentTime=0;this.error=null;this.requests=[];this.sources=[];instances.push(this);}
  set src(value){this.sources.push(value);this.error=null;}get src(){return this.sources.at(-1)||'';}
  play(){this.paused=false;return new Promise((resolve,reject)=>this.requests.push({resolve,reject}));}
  pause(){this.paused=true;this.emit('pause');}
 }
 vm.runInNewContext(code,{document,Audio:FakeAudio,Promise,performance:{now:()=>now},addEventListener:window.addEventListener.bind(window),requestAnimationFrame:fn=>{frames.set(++nextFrame,fn);return nextFrame;},cancelAnimationFrame:id=>frames.delete(id)});
 const tick=ms=>{now+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));};
 return{button,document,window,instances,audio:instances[0],tick,click:()=>button.emit('click')};
}
const flush=async()=>{await Promise.resolve();await Promise.resolve();};
const state=setup(),{button,audio,document,tick,click}=state;
assert.equal(audio.src,'','initialization must not assign a media URL');
assert.equal(audio.requests.length,0);assert.equal(audio.preload,'none');assert.equal(audio.autoplay,false);
assert.equal(audio.id,'florra-soundtrack');assert.equal(audio.hidden,true);
assert(button.children.includes(audio),'native audio must be mounted for inspection');
click();assert.equal(audio.sources.length,1);assert.equal(button.textContent,'sound · loading');
click();assert.equal(audio.paused,true);audio.requests[0].resolve();await flush();
assert.equal(button.textContent,'sound · off');assert.equal(audio.paused,true,'late success cannot override off');
click();click();click();
audio.requests[1].reject({name:'AbortError'});audio.requests[2].resolve();await flush();tick(650);
assert.equal(button.textContent,'sound · on');assert.equal(button.attributes['aria-pressed'],'true');assert.equal(audio.volume,.35);assert.equal(audio.loop,true);
assert.equal(audio.sources.length,1,'normal toggles must preserve the loaded source');
audio.currentTime=37;click();tick(175);assert(audio.volume>0&&audio.volume<.35);tick(175);
assert.equal(audio.paused,true);assert.equal(audio.currentTime,37);assert.equal(audio.loop,false);
click();audio.requests[3].resolve();await flush();tick(650);
document.hidden=true;document.emit('visibilitychange');assert.equal(audio.paused,true);assert.equal(audio.currentTime,37);assert.equal(audio.volume,0);
document.hidden=false;document.emit('visibilitychange');assert.equal(audio.requests.length,5);
audio.requests[4].reject({name:'NotAllowedError'});await flush();
assert.equal(button.textContent,'sound · off');assert.equal(button.attributes['aria-pressed'],'false');
assert(button.children.find(element=>element.id==='soundtrack-status').textContent.includes('blocked'));
document.hidden=true;document.emit('visibilitychange');document.hidden=false;document.emit('visibilitychange');
assert.equal(audio.requests.length,5,'visibility cannot resume music after a failed play');
click();audio.requests[5].resolve();await flush();audio.error={code:2};audio.emit('error');
assert.equal(button.textContent,'sound · off');assert.equal(audio.paused,true);assert.equal(audio.loop,false);
assert(button.children.find(element=>element.className==='soundtrack-credit').hidden);
assert.equal(setup(false).instances.length,0,'pages without a sound button must not create a player');
console.log('Soundtrack checked: lazy media loading, toggle races, fades, pause position, visibility, playback rejection and network errors.');
