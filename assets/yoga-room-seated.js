const $=id=>document.getElementById(id);
const phases=[{name:'Breathe in',duration:4,hint:'Gently, through your nose.',from:[100,65],to:[500,65]},{name:'Hold after inhale',duration:4,hint:'Keep your shoulders soft.',from:[500,65],to:[500,285]},{name:'Breathe out',duration:6,hint:'Slowly. Let the breath go.',from:[500,285],to:[100,285]},{name:'Hold after exhale',duration:4,hint:'A comfortable pause. No strain.',from:[100,285],to:[100,65]}];
let running=false,elapsed=0,started=0,frame=0,lastPhase=-1,completed=false;
const edges=[...document.querySelectorAll('.edge')];
$('still').checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
function paint(seconds){
 const total=Number($('length').value)*18;
 $('progress').style.width=`${Math.min(100,seconds/total*100)}%`;
 if(seconds>=total){running=false;completed=true;elapsed=total;$('phase').textContent='Carry this calm.';$('count').textContent='✓';$('hint').textContent='Return to your natural breathing.';$('toggle').textContent='Begin again';$('length').disabled=false;$('status').textContent=`${$('length').value} breaths complete. Take your time.`;edges.forEach(e=>e.classList.remove('active'));return;}
 let t=seconds%18,i=0;while(t>=phases[i].duration){t-=phases[i].duration;i++;}
 const p=phases[i];if(i!==lastPhase){$('phase').textContent=p.name;$('hint').textContent=p.hint;edges.forEach((e,n)=>e.classList.toggle('active',n===i));lastPhase=i;}
 $('count').textContent=Math.max(1,Math.ceil(p.duration-t));
 const u=$('still').checked?0:t/p.duration;
 $('dot').style.visibility=$('still').checked?'hidden':'visible';
 $('dot').setAttribute('transform',`translate(${p.from[0]+(p.to[0]-p.from[0])*u} ${p.from[1]+(p.to[1]-p.from[1])*u})`);
 const remain=Math.ceil(total-seconds);$('status').textContent=`Breath ${Math.floor(seconds/18)+1} of ${$('length').value} · ${Math.floor(remain/60)}:${String(remain%60).padStart(2,'0')} remaining`;
}
function tick(now){if(!running)return;paint(elapsed+(now-started)/1000);if(running)frame=requestAnimationFrame(tick);}
function pause(){if(!running)return;elapsed+=(performance.now()-started)/1000;running=false;cancelAnimationFrame(frame);paint(elapsed);if(completed)return;$('toggle').textContent='Resume breathing';$('phase').textContent='Take your time.';$('hint').textContent='Breathe naturally while paused.';lastPhase=-1;}
function reset(){running=false;cancelAnimationFrame(frame);elapsed=0;completed=false;lastPhase=-1;$('length').disabled=false;$('toggle').textContent='Begin breathing';$('phase').textContent='Arrive here.';$('count').textContent='18';$('hint').textContent='seconds. one full breath.';$('status').textContent='No hurry. Start when you’re ready.';$('progress').style.width='0%';$('dot').setAttribute('transform','translate(100 65)');edges.forEach(e=>e.classList.remove('active'));}
$('toggle').addEventListener('click',()=>{if(running){pause();return;}if(completed)reset();window.stopStandingForSeated?.();running=true;lastPhase=-1;started=performance.now();$('length').disabled=true;$('toggle').textContent='Pause breathing';tick(started);});
$('reset').addEventListener('click',reset);$('length').addEventListener('change',reset);
$('still').addEventListener('change',()=>{$('dot').style.visibility=$('still').checked?'hidden':'visible';});
$('dot').style.visibility=$('still').checked?'hidden':'visible';
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
