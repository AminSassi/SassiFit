const EX=[{id:'pushups',name:'Push-ups'},{id:'situps',name:'Sit-ups'},{id:'pullups',name:'Pull-ups'},{id:'squats',name:'Squats'}];
const MSG=["Get off the couch.","Your muscles are waiting.","No excuses.","Every rep counts.","Time to sweat."];
const HOURS=[8,12,18,21];
const RING=339.3;
let S=load();

function load(){
  const t=new Date().toDateString(),s=JSON.parse(localStorage.getItem('sf')||'{}');
  if(s.date!==t){
    const c=s.custom||[],r={};
    [...EX,...c].forEach(e=>r[e.id]=0);
    const n={date:t,goal:s.goal||100,reps:r,custom:c,hist:s.hist||[],done:{},tl:[],best:s.best||0,most:s.most||0,days:s.days||0,lastDone:null};
    if(s.date){const tot=Object.values(s.reps||{}).reduce((a,b)=>a+b,0);if(tot>=(EX.length+c.length)*(s.goal||100)){const h=s.hist||[];if(!h.includes(s.date)){h.push(s.date);n.hist=h;n.days=(s.days||0)+1}n.best=Math.max(s.best||0,streak(h))}n.most=Math.max(s.most||0,tot)}
    return n;
  }
  if(!s.done)s.done={};if(!s.tl)s.tl=[];return s;
}

function save(){localStorage.setItem('sf',JSON.stringify(S))}
function all(){return[...EX,...(S.custom||[])]}

function add(id,n){
  S.reps[id]=Math.max(0,(S.reps[id]||0)+n);
  if(n>0){const e=all().find(x=>x.id===id),t=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});S.tl.push({t,nm:e?e.name:id,n});if(S.tl.length>40)S.tl.shift()}
  save();render();if(navigator.vibrate)navigator.vibrate(n>0?8:4);
  const r=S.reps[id]||0,g=S.goal;
  if(r>=g&&!S.done[id]){S.done[id]=true;save();toast((e=>e?e.name:'')(all().find(x=>x.id===id))+' complete');if(navigator.vibrate)navigator.vibrate(25)}
  else if(r<g&&S.done[id]){delete S.done[id];save()}
  dayCheck();
}

function dayCheck(){
  const e=all(),tot=e.reduce((s,x)=>s+(S.reps[x.id]||0),0);
  if(tot>=e.length*S.goal&&S.lastDone!==S.date){
    S.lastDone=S.date;const h=S.hist||[];
    if(!h.includes(S.date)){h.push(S.date);S.hist=h;S.days=(S.days||0)+1}
    S.best=Math.max(S.best||0,streak(h));S.most=Math.max(S.most||0,tot);save();toast('Daily goal achieved!');
  }
}

function streak(h){
  if(!h||!h.length)return 0;let s=0;const t=new Date();t.setHours(0,0,0,0);
  for(let i=0;i<365;i++){const d=new Date(t);d.setDate(d.getDate()-i);if(h.includes(d.toDateString()))s++;else if(i>0)break}return s;
}

function resetAll(){all().forEach(e=>S.reps[e.id]=0);S.done={};S.tl=[];save();render()}

function toast(m){const o=document.querySelector('.toast');if(o)o.remove();const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),250)},1800)}

function render(){
  const e=all(),tot=e.reduce((s,x)=>s+(S.reps[x.id]||0),0),g=e.length*S.goal,pct=Math.min(100,Math.round(tot/g*100)),rem=Math.max(0,g-tot),done=tot>=g;
  const h=new Date().getHours();document.getElementById('greeting').textContent=h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening';
  if(done){document.getElementById('heroProgress').style.display='none';document.getElementById('heroDone').style.display=''}
  else{document.getElementById('heroProgress').style.display='';document.getElementById('heroDone').style.display='none';document.getElementById('ring').style.strokeDashoffset=RING-RING*pct/100;document.getElementById('ringPct').textContent=pct+'%';document.getElementById('heroSub').textContent=rem+' reps remaining'}
  const s=streak(S.hist||[]),sl=document.getElementById('streak');
  if(s>0){document.getElementById('streakText').textContent='🔥 '+s+' day streak';sl.style.display=''}else sl.style.display='none';
  const c=document.getElementById('cards');c.innerHTML='';
  e.forEach(x=>{const r=S.reps[x.id]||0,p=Math.min(100,Math.round(r/S.goal*100)),d=r>=S.goal;const el=document.createElement('div');el.className='card'+(d?' card-done':'');el.innerHTML=`<div class="card-top"><span class="card-name">${x.name}</span><span class="card-reps"><b>${r}</b> / ${S.goal}</span></div><div class="card-bar"><div class="card-fill" style="width:${p}%"></div></div><div class="card-btns"><button class="btn btn-m" onclick="add('${x.id}',-1)">−</button><button class="btn btn-p" onclick="add('${x.id}',10)">+10</button><button class="btn" onclick="add('${x.id}',50)">+50</button></div>`;c.appendChild(el)});
  const sm=document.getElementById('summaryRows');sm.innerHTML='';e.forEach(x=>{const r=S.reps[x.id]||0;sm.innerHTML+=`<div class="sum-row"><span class="sum-ex">${x.name}</span><span class="sum-val">${r}</span></div>`});
  document.getElementById('summaryTotal').innerHTML=`<span>Total</span><b>${tot} reps</b>`;
}

function openHistory(){
  const c=document.getElementById('historyContent'),cs=streak(S.hist||[]);
  c.innerHTML=`<div class="rec" style="margin-bottom:20px;text-align:center"><div class="rec-v" style="font-size:36px">${cs}</div><div class="rec-l">Current Streak</div></div>`;
  const hist=S.hist||[],now=new Date();
  for(let m=0;m<6;m++){const d=new Date(now.getFullYear(),now.getMonth()-m,1),y=d.getFullYear(),mo=d.getMonth(),first=new Date(y,mo,1).getDay(),days=new Date(y,mo+1,0).getDate(),nm=d.toLocaleDateString('en-US',{month:'long',year:'numeric'});let h=`<div class="hm"><div class="hm-label">${nm}</div><div class="hm-grid">`;for(let i=0;i<first;i++)h+='<div class="hm-day"></div>';for(let day=1;day<=days;day++){const ds=new Date(y,mo,day).toDateString();h+=`<div class="hm-day${hist.includes(ds)?' on':''}${m===0&&day===now.getDate()?' now':''}"></div>`}c.innerHTML+=h+'</div></div>'}
  c.innerHTML+=`<div class="rec-grid"><div class="rec"><div class="rec-v">${S.best||0}</div><div class="rec-l">Best Streak</div></div><div class="rec"><div class="rec-v">${S.days||0}</div><div class="rec-l">Days Done</div></div><div class="rec"><div class="rec-v">${S.most||0}</div><div class="rec-l">Most Reps</div></div></div>`;
  document.getElementById('historyModal').classList.add('open');
}
function closeHistory(){document.getElementById('historyModal').classList.remove('open')}

function openSettings(){document.getElementById('goalInput').value=S.goal;updateNotif();renderCustom();document.getElementById('settingsModal').classList.add('open')}
function closeSettings(){document.getElementById('settingsModal').classList.remove('open')}
function saveGoal(){const v=parseInt(document.getElementById('goalInput').value);if(v>0){S.goal=v;save();render();closeSettings()}}

function renderCustom(){const l=document.getElementById('customList');l.innerHTML='';(S.custom||[]).forEach(e=>{l.innerHTML+=`<div class="cust-row"><span style="font-weight:600;font-size:15px">${e.name}</span><button class="cust-rm" onclick="rmCustom('${e.id}')">Remove</button></div>`})}
function addCustom(){const i=document.getElementById('customInput'),n=i.value.trim();if(!n)return;const id='c'+Date.now();if(!S.custom)S.custom=[];S.custom.push({id,name:n});S.reps[id]=0;save();i.value='';renderCustom();render()}
function rmCustom(id){S.custom=(S.custom||[]).filter(e=>e.id!==id);delete S.reps[id];save();renderCustom();render()}

function isIOS(){return/iPad|iPhone|iPod/.test(navigator.userAgent)}

function updateNotif(){
  const b=document.getElementById('notifBtn'),info=document.getElementById('notifInfo');
  if(!('Notification' in window)){b.textContent='Not Supported';return}
  if(Notification.permission==='granted'){b.textContent='✓ Enabled';b.style.color='#30d158';if(info)info.textContent='8AM, 12PM, 6PM, 9PM when open.'}
  else if(Notification.permission==='denied'){b.textContent='Blocked';b.style.color='#ff4444';if(info)info.textContent='Enable in browser settings.'}
  else{b.textContent='Enable Notifications';if(info)info.textContent=(isIOS()&&!window.navigator.standalone)?'Install to Home Screen for reminders.':''}
}
function requestNotifications(){if(!('Notification' in window))return;Notification.requestPermission().then(p=>{if(p==='granted'){S.notifs=true;save();new Notification('SassiFit',{body:'Reminders on.'})}updateNotif()})}
function checkReminders(){if(Notification.permission!=='granted')return;const n=new Date();if(HOURS.includes(n.getHours())&&n.getMinutes()===0){const t=all().reduce((s,e)=>s+(S.reps[e.id]||0),0);if(t<all().length*S.goal)new Notification('SassiFit',{body:MSG[Math.floor(Math.random()*MSG.length)]})}}

render();updateNotif();setInterval(checkReminders,60000);
