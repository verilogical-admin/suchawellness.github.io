(() => {
  'use strict';
  const root = document.getElementById('hcm-welcome');
  if (!root) return;
  const choices = root.querySelector('.hcm-choices');
  const form = document.getElementById('hcm-chat-form');
  const input = document.getElementById('hcm-message');
  const consent = document.getElementById('hcm-consent');
  const send = document.getElementById('hcm-send');
  const log = document.getElementById('hcm-messages');
  const status = document.getElementById('hcm-chat-status');
  const help = document.getElementById('hcm-human');
  let messages = [], pending = null, humanMode = false, revision = 0;
  const risk = text => /suicid|self[ -]?harm|kill\s+(myself|me)|hurt\s+myself|end\s+(my\s+life|it\s+all)|want\s+to\s+die|don[’']?t\s+(want\s+to\s+(live|wake)|feel\s+safe)|better\s+off\s+without\s+me|overdos|आत्महत्या|खुदकुशी|मरना चाहता|मरना चाहती/i.test(text.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g,''));
  function add(role, text) {
    const p = document.createElement('p'); p.className = 'hcm-bubble ' + role;
    const label = document.createElement('strong'); label.textContent = role === 'user' ? 'You: ' : 'HeyChandMama · AI: ';
    p.append(label, document.createTextNode(text)); log.append(p); log.scrollTop = log.scrollHeight;
  }
  function humanHelp() {
    humanMode = true; revision++; pending?.abort(); pending = null;
    input.disabled = true; send.disabled = true;
    status.textContent = 'Please connect with a real person now. The AI conversation is paused; help is available below.';
    help.classList.add('hcm-help-active'); help.focus();
    help.scrollIntoView({block:'start',behavior:'auto'});
  }
  choices.querySelectorAll('details').forEach(detail => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'hcm-choice';
    button.textContent = detail.querySelector('summary').textContent;
    button.addEventListener('click', () => { if(humanMode) return humanHelp(); input.value = button.textContent; input.focus(); });
    detail.replaceWith(button);
  });
  document.querySelectorAll('a[href="#hcm-human"]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); humanHelp(); }));
  document.getElementById('hcm-clear').addEventListener('click', () => {
    revision++; pending?.abort(); pending=null; messages=[]; log.replaceChildren(); input.value='';
    humanMode=false; input.disabled=false; send.disabled=false; status.textContent='Conversation cleared from this page.';
    help.classList.remove('hcm-help-active'); input.focus();
  });
  form.hidden = false;
  document.getElementById('hcm-guided-note').textContent = 'I’m an AI companion, not a person, therapist or emergency service. I can listen and help you find a small next step. If you feel unsafe, use Get human help now.';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const text=input.value.trim(); if(!text||pending||humanMode) return;
    if(risk(text)) { add('user',text); input.value=''; humanHelp(); return; }
    if(!consent.checked) { status.textContent='Please read and accept the AI privacy notice before sending.'; consent.focus(); return; }
    const next=[...messages,{role:'user',content:text}].slice(-11);
    add('user',text); input.value=''; send.disabled=true; input.disabled=true;
    status.textContent='Preparing a reply… You can reach human help at any time.';
    const controller=new AbortController(); pending=controller; const current=revision;
    const timer=setTimeout(()=>controller.abort(),45000);
    try {
      const response=await fetch('/api/hcm/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next,consent:true}),signal:controller.signal,cache:'no-store'});
      const data=await response.json(); if(current!==revision) return;
      if(data.mode==='human') { add('assistant',data.reply); humanHelp(); return; }
      if(!response.ok||data.mode!=='chat'||typeof data.reply!=='string') throw new Error('unavailable');
      add('assistant',data.reply); messages=[...next,{role:'assistant',content:data.reply}]; status.textContent='';
    } catch {
      if(current!==revision) return;
      status.textContent='The AI couldn’t reply. Your message was not added to the next conversation request. Please try again shortly, or use the human-help options below. There is nothing to buy.';
      input.value=text;
    } finally {
      clearTimeout(timer);
      if(current===revision) { pending=null; send.disabled=humanMode; input.disabled=humanMode; if(!humanMode) input.focus(); }
    }
  });
})();
