import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('./assets/hcm-chat.js',import.meta.url),'utf8');
function setup(fetch) {
  class Element {
    constructor(){this.listeners={};this.children=[];this.value='';this.checked=false;this.disabled=false;this.classList={add(){},remove(){}};}
    addEventListener(event,fn){this.listeners[event]=fn;}
    append(...nodes){this.children.push(...nodes);}
    replaceChildren(){this.children=[];}
    focus(){this.focused=true;}
    scrollIntoView(){this.scrolled=true;}
    querySelectorAll(){return [];}
    fire(event){return this.listeners[event]({preventDefault(){}});}
  }
  const ids=['hcm-welcome','hcm-chat-form','hcm-message','hcm-consent','hcm-send','hcm-messages','hcm-chat-status','hcm-human','hcm-clear','hcm-guided-note'];
  const els=Object.fromEntries(ids.map(id=>[id,new Element()]));
  const choices=new Element(), safety=new Element();els['hcm-welcome'].querySelector=()=>choices;
  const document={getElementById:id=>els[id],querySelectorAll:()=>[safety],createElement:()=>new Element(),createTextNode:text=>({textContent:text})};
  vm.runInNewContext(source,{document,fetch,AbortController,setTimeout,clearTimeout});
  return {els,safety,send:()=>els['hcm-chat-form'].fire('submit')};
}
test('consent blocks network transmission',async()=>{let calls=0;const s=setup(()=>{calls++});s.els['hcm-message'].value='I feel lonely';await s.send();assert.equal(calls,0);assert.equal(s.els['hcm-consent'].focused,true);});
test('explicit danger works offline and without consent',async()=>{let calls=0;const s=setup(()=>{calls++});s.els['hcm-message'].value='I want to die';await s.send();assert.equal(calls,0);assert.equal(s.els['hcm-message'].disabled,true);assert.equal(s.els['hcm-human'].focused,true);});
test('human-help action cancels pending reply and prevents late content',async()=>{let finish,signal;const s=setup((url,options)=>{signal=options.signal;return new Promise(resolve=>finish=resolve)});s.els['hcm-consent'].checked=true;s.els['hcm-message'].value='I feel alone';const pending=s.send();s.safety.fire('click');assert.equal(signal.aborted,true);finish({ok:true,json:async()=>({mode:'chat',reply:'late'})});await pending;assert.equal(s.els['hcm-messages'].children.length,1);assert.equal(s.els['hcm-send'].disabled,true);});
test('clear removes history before subsequent request',async()=>{const payloads=[];const s=setup(async(url,options)=>{payloads.push(JSON.parse(options.body));return{ok:true,json:async()=>({mode:'chat',reply:'A reply'})}});s.els['hcm-consent'].checked=true;s.els['hcm-message'].value='First message';await s.send();s.els['hcm-clear'].fire('click');assert.equal(s.els['hcm-messages'].children.length,0);s.els['hcm-message'].value='New message';await s.send();assert.equal(payloads[1].messages.length,1);assert.equal(payloads[1].messages[0].content,'New message');});
test('server semantic risk pauses chat',async()=>{const s=setup(async()=>({ok:true,json:async()=>({mode:'human',reply:'Please reach a trusted person'})}));s.els['hcm-consent'].checked=true;s.els['hcm-message'].value='I wish I could disappear forever';await s.send();assert.equal(s.els['hcm-human'].focused,true);assert.equal(s.els['hcm-send'].disabled,true);});
test('service failure keeps retry text and available help',async()=>{const s=setup(async()=>{throw Error('offline')});s.els['hcm-consent'].checked=true;s.els['hcm-message'].value='Hello';await s.send();assert.equal(s.els['hcm-message'].value,'Hello');assert.equal(s.els['hcm-send'].disabled,false);s.safety.fire('click');assert.equal(s.els['hcm-human'].focused,true);});
