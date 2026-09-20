const concepts = [
  {id:'helix',name:'Double Helix',tag:'GEKREUZTE LOOP-FEEDS',rank:1,scores:[9,8,7,8,7],total:39,copy:'Zwei gegensinnig geführte Loop-Rampen teilen den knappen oberen Bauraum, aber weder Einlauf noch Rücklauf. Der mittige Saucer schaltet zwischen Lock und kontrolliertem Pop-Feed.',paths:['M85 455 C38 355 48 125 164 74 C252 35 360 76 355 175 C350 262 230 270 190 190','M375 455 C420 345 405 124 294 76 C200 34 99 77 108 178 C116 256 228 267 270 190'],nodes:[[85,455],[375,455],[230,280]],flow:['Linker Innenloop steigt auf +76 mm und kreuzt den Gegenloop kollisionsfrei.','Rechter Außenloop fällt über die Gegenrampe zur linken Inlane zurück.','Beide Loops gemeinsam qualifizieren den mittigen Saucer als Lock.','Nach zwei Locks startet der nächste qualifizierte Saucer-Treffer den 3-Ball-Multiball.'],special:'Ungewöhnlich ist die spiegelverkehrte Zielseite: Jeder Loop belohnt Präzision mit einem kontrollierten Schuss auf derselben Flipperseite.',edge:'Web: Überkreuzungen nutzen Z-Ebenen und geführte Rampensegmente. Godot: identische Pfade als Curve3D; keine Logikänderung nötig.'},
  {id:'switchback',name:'Switchback Spine',tag:'SERPENTINEN-RÜCKLAUF',rank:3,scores:[8,7,6,7,7],total:35,copy:'Eine ansteigende Mittelrampe schaltet über zwei Diverter zwischen kurzem Wiederholungsschuss, Seitentransfer und langem Außenrücklauf.',paths:['M88 455 C126 360 130 300 205 260 S320 155 360 72','M370 455 C322 382 300 332 228 292 S118 178 94 80'],nodes:[[88,455],[370,455],[228,292]],flow:['Rechter Flipper trifft die zentrale Switchback-Rampe.','Diverter A liefert den kurzen Feed zum rechten oberen Miniflipper.','Diverter B kreuzt auf +38 mm und speist den linken Außenorbit.','Dritter Treffer erreicht den Gipfel-Lock; der Rücklauf wechselt danach die Seite.'],special:'Ein identischer Einlauf erzeugt erst durch präzise Folgeschüsse drei unterschiedliche Abschlussbahnen.',edge:'Web: Der mechanische Diverter wird als zustandsabhängige Pfadweiche simuliert. Godot: separate Gate-Collider und AnimationPlayer.'},
  {id:'crossfeed',name:'Crossfeed Delta',tag:'DREIFACH-DIVERTER',rank:2,scores:[9,9,6,7,5],total:36,copy:'Drei Fächer-Schüsse speisen einen gemeinsamen Hochpunkt; ein rotierender Diverter verteilt in drei vollständig verschiedene Rückläufe.',paths:['M72 452 Q92 210 230 92 Q368 210 390 452','M128 455 Q178 280 230 95 Q286 280 332 455'],nodes:[[72,452],[390,452],[230,95]],flow:['Linker Orbit, Mittelrampe und rechter Scoop erreichen denselben Hochpunkt auf verschiedenen Einläufen.','Der Diverter speist wahlweise linke Inlane, rechten Loop oder mittigen Pop-Bereich.','Nach drei verschiedenen Einläufen öffnet der Delta-Lock.','Multiball gibt jede Kugel über einen anderen Rücklauf frei.'],special:'Nicht der Schuss, sondern die Kombination aus Einlauf und aktuell sichtbarer Diverterstellung bestimmt den Rücklauf.',edge:'Web: Der rotierende Hochpunkt wird diskret in drei Zustände zerlegt. Echtes Timing am bewegten Bauteil erfordert später Godot-3D-Physik.'}
];
const colors=['#56e5dd','#ffb84d'];
const grid=document.querySelector('#conceptGrid');
grid.innerHTML=concepts.map((c,i)=>`<article class="concept" data-id="${c.id}"><svg viewBox="0 0 460 560" role="img" aria-label="Maßstäbliche Draufsicht ${c.name}"><path d="M55 500 L405 500 L420 45 L40 45 Z" fill="none" stroke="#284250" stroke-width="3"/><g fill="none" stroke-linecap="round">${c.paths.map((p,j)=>`<path d="${p}" stroke="${colors[j]}" stroke-width="12" opacity=".86"/>`).join('')}</g>${c.nodes.map(n=>`<circle cx="${n[0]}" cy="${n[1]}" r="13" fill="#071018" stroke="#ff6767" stroke-width="5"/>`).join('')}<path d="M125 505 L205 470 M335 505 L255 470" stroke="#f4f0df" stroke-width="13" stroke-linecap="round"/><text x="22" y="535" fill="#9baeb6" font-size="12">439 mm</text><text x="426" y="290" fill="#9baeb6" font-size="12" transform="rotate(90 426 290)">771 mm</text></svg><div class="height-profile" title="Höhenplan: Spielfeld, +38 mm, +76 mm"><i></i><i></i><i></i></div><p class="metric">RANG ${c.rank} · ${c.tag} · ${c.total}/50</p><h3>${c.name}</h3><p>${c.copy}</p></article>`).join('');
document.querySelector('#decision').innerHTML=`<table><thead><tr><th>Rang / Layout</th><th>Schussvielfalt</th><th>Platz</th><th>Physiksicherheit</th><th>Lesbarkeit</th><th>Aufwand</th><th>Gesamt</th></tr></thead><tbody>${[...concepts].sort((a,b)=>b.total-a.total).map(c=>`<tr><td>${c.rank}. ${c.name}</td>${c.scores.map(v=>`<td>${v}/10</td>`).join('')}<td><b>${c.total}/50</b></td></tr>`).join('')}</tbody></table><p class="note">Bewertung: 10 ist jeweils günstig; bei Physik und Aufwand bedeutet ein hoher Wert geringes Risiko beziehungsweise geringe Komplexität. Double Helix gewinnt durch eigenständige Schüsse, klar lesbare Rückläufe und ein direkt portierbares Drei-Ebenen-Modell.</p>`;
function selectConcept(index){const c=concepts[index];document.querySelectorAll('.tab').forEach((b,i)=>b.classList.toggle('active',i===index));document.querySelector('#layoutDetail').innerHTML=`<p class="kicker">LAYOUT 0${index+1} · RANG ${c.rank}</p><h2>${c.name}</h2><p>${c.copy}</p><div class="score-grid"><span>Schussvielfalt <b>${c.scores[0]}</b></span><span>Platzbedarf <b>${c.scores[1]}</b></span><span>Physiksicherheit <b>${c.scores[2]}</b></span><span>Lesbarkeit <b>${c.scores[3]}</b></span><span>Aufwand <b>${c.scores[4]}</b></span><span class="total">Gesamt <b>${c.total}/50</b></span></div><div class="mechanics"><h3>Ballfluss</h3><ol>${c.flow.map(x=>`<li>${x}</li>`).join('')}</ol><h3>Besonderheit</h3><p>${c.special}</p><h3>2,5D / Godot</h3><p>${c.edge}</p></div>`}
document.querySelectorAll('.tab').forEach((b,i)=>b.addEventListener('click',()=>selectConcept(i)));document.querySelectorAll('.concept').forEach((card,i)=>card.addEventListener('click',()=>{selectConcept(i);document.querySelector('.panel').scrollIntoView({behavior:'smooth',block:'start'})}));selectConcept(0);

const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),scoreEl=document.querySelector('#score'),ballsEl=document.querySelector('#balls'),locksEl=document.querySelector('#locks'),qualifierEl=document.querySelector('#qualifier'),modeEl=document.querySelector('#mode'),debugPanel=document.querySelector('#debugPanel'),debugReadout=document.querySelector('#debugReadout'),eventLog=document.querySelector('#eventLog');
const W=920,H=1520,R=24,PF_CENTER=412,keys={left:false,right:false,plunger:false},tuning={gravity:820,bounce:.72,rampMin:720};let running=false,score=0,reserve=3,locks=0,last=0,acc=0,charge=0,balls=[],loopLit={left:false,right:false},ballSaveUntil=0,simTime=0,debug=false,rngState=0x1a2b3c4d,effects=[];
const sound={ctx:null,master:null,rollGain:null,rollFilter:null,enabled:true,volume:.55};
const bumpers=[{x:330,y:610,r:45},{x:494,y:610,r:45},{x:412,y:486,r:42}],posts=[{x:168,y:1120,r:20},{x:656,y:1120,r:20},{x:292,y:1040,r:18},{x:532,y:1040,r:18}];
const walls=[[70,100,70,1170],[70,100,850,100],[850,100,850,1420],[70,1170,242,1325],[242,1325,272,1470],[755,1170,582,1325],[582,1325,552,1470],[755,1420,850,1420],[755,1420,755,650],[755,500,755,100]];
const oneWayGate=[755,500,755,650];
const aprons=[[[70,1170],[242,1325],[272,1470],[70,1470]],[[755,1170],[582,1325],[552,1470],[755,1470]]];
const slings=[[[150,990],[265,1080],[180,1150]],[[674,990],[559,1080],[644,1150]]];
const rampPaths={left:[[225,1080],[100,810],[110,300],[385,190],[690,250],[640,600],[540,1120]],right:[[599,1080],[724,810],[714,300],[439,190],[134,250],[184,600],[284,1120]]};
const plungerPath=[[812,1340],[812,1040],[812,720],[790,610],[690,590]];
const flippers={left:{x:242,y:1325,len:130,a:.28,target:.28,omega:0},right:{x:582,y:1325,len:130,a:Math.PI-.28,target:Math.PI-.28,omega:0}};
function makeBall(x=812,y=1340,held=true){return{x,y,vx:0,vy:0,z:0,ramp:null,t:0,held,launching:false,shooter:held||x>755,saucer:0,saucerMode:'feed',pivotStuck:0,trail:[]}}
function random(){rngState^=rngState<<13;rngState^=rngState>>>17;rngState^=rngState<<5;return(rngState>>>0)/4294967296}
function ensureAudio(){if(!sound.enabled)return;if(!sound.ctx){const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return;sound.ctx=new AudioContextClass();sound.master=sound.ctx.createGain();sound.master.gain.value=sound.volume;sound.master.connect(sound.ctx.destination);const length=sound.ctx.sampleRate*2,buffer=sound.ctx.createBuffer(1,length,sound.ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=Math.sin(i*12.9898)*.55+Math.sin(i*78.233)*.25;const source=sound.ctx.createBufferSource();source.buffer=buffer;source.loop=true;sound.rollFilter=sound.ctx.createBiquadFilter();sound.rollFilter.type='bandpass';sound.rollGain=sound.ctx.createGain();sound.rollGain.gain.value=0;source.connect(sound.rollFilter).connect(sound.rollGain).connect(sound.master);source.start()}if(sound.ctx.state==='suspended')sound.ctx.resume()}
function tone(freq,duration=.08,type='sine',gain=.08,slide=1){if(!sound.enabled)return;ensureAudio();if(!sound.ctx)return;const now=sound.ctx.currentTime,osc=sound.ctx.createOscillator(),amp=sound.ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(Math.max(30,freq*slide),now+duration);amp.gain.setValueAtTime(gain,now);amp.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(amp).connect(sound.master);osc.start(now);osc.stop(now+duration)}
function noiseHit(freq=900,duration=.05,gain=.07){if(!sound.enabled)return;ensureAudio();if(!sound.ctx)return;const frames=Math.max(1,Math.floor(sound.ctx.sampleRate*duration)),buffer=sound.ctx.createBuffer(1,frames,sound.ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<frames;i++)data[i]=Math.sin((i+1)*91.7)*Math.exp(-i/frames*3);const source=sound.ctx.createBufferSource(),filter=sound.ctx.createBiquadFilter(),amp=sound.ctx.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=1.8;amp.gain.value=gain;source.connect(filter).connect(amp).connect(sound.master);source.start()}
function playSound(name,intensity=1){const variation=.92+((rngState>>>8)%17)/100;switch(name){case'charge':tone(95,.16,'sawtooth',.035*intensity,1.8);break;case'launch':noiseHit(520,.09,.11*intensity);tone(120,.14,'triangle',.09*intensity,.55);break;case'wall':noiseHit(1050*variation,.035,.035*intensity);break;case'post':tone(720*variation,.05,'triangle',.055*intensity,1.25);break;case'bumper':tone(150*variation,.13,'square',.075*intensity,2.2);break;case'flipper':noiseHit(430,.045,.08);tone(85,.055,'square',.055,.7);break;case'sling':tone(260*variation,.09,'square',.06,1.7);break;case'ramp':tone(310,.12,'triangle',.045,1.5);break;case'feed':tone(540,.12,'sine',.06,.7);break;case'lock':tone(190,.22,'square',.09,1.9);setTimeout(()=>tone(380,.18,'triangle',.07,1.5),80);break;case'drain':tone(180,.35,'sawtooth',.06,.35);break;case'multiball':tone(220,.18,'square',.08,2);setTimeout(()=>tone(440,.25,'square',.075,2),100)}}
function updateRolling(){if(!sound.ctx||!sound.rollGain)return;const moving=balls.filter(b=>!b.held&&!b.launching&&!b.ramp&&!b.saucer),speed=moving.reduce((m,b)=>Math.max(m,Math.hypot(b.vx,b.vy)),0),now=sound.ctx.currentTime;sound.rollGain.gain.setTargetAtTime(sound.enabled?Math.min(.035,Math.max(0,speed-80)/40000):0,now,.04);sound.rollFilter.frequency.setTargetAtTime(160+Math.min(900,speed*.45),now,.04)}
function burst(x,y,color,count=12){for(let i=0;i<count;i++){const a=i/count*Math.PI*2+random()*.25,s=80+random()*240;effects.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+random()*.3,max:.65,color})}}
function logEvent(message){const item=document.createElement('li');item.textContent=`${simTime.toFixed(1)} s · ${message}`;eventLog.prepend(item);while(eventLog.children.length>8)eventLog.lastElementChild.remove()}
function setMode(message){modeEl.textContent=message;logEvent(message)}
function resetGame(){score=0;reserve=3;locks=0;loopLit={left:false,right:false};ballSaveUntil=0;simTime=0;rngState=0x1a2b3c4d;effects=[];balls=[makeBall()];eventLog.replaceChildren();updateHud('PLUNGER LADEN');logEvent('SPIEL ZURÜCKGESETZT')}
function start(){ensureAudio();if(!running){resetGame();running=true;last=performance.now();requestAnimationFrame(frame);tone(220,.16,'triangle',.055,1.8)}document.querySelector('.canvas-overlay').classList.add('hidden')}
function updateHud(message){scoreEl.textContent=String(score).padStart(6,'0');ballsEl.textContent=reserve;locksEl.textContent=`${locks}/2`;qualifierEl.textContent=loopLit.left&&loopLit.right?(locks===2?'MULTIBALL':'LOCK'):`${loopLit.left?'L':''}${loopLit.right?'R':''}`||'–';if(message&&modeEl.textContent!==message){modeEl.textContent=message;logEvent(message)}}
function launch(){const b=balls.find(v=>v.held);if(!b)return;const power=charge;b.held=false;b.launching=true;b.shooter=true;b.t=0;b.launchSpeed=.82+power/170;b.vx=b.vy=0;charge=0;ballSaveUntil=Math.max(ballSaveUntil,simTime+8);playSound('launch',.7+power/170);updateHud('PLUNGER LÄUFT')}
function frame(now){if(!running)return;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){step(1/120);acc-=1/120}draw();requestAnimationFrame(frame)}
function step(dt){
 simTime+=dt;effects.forEach(e=>{e.life-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.96;e.vy*=.96});effects=effects.filter(e=>e.life>0);flippers.left.target=keys.left?-.48:.28;flippers.right.target=keys.right?Math.PI+.48:Math.PI-.28;for(const f of Object.values(flippers)){const previous=f.a,delta=f.target-f.a,maxStep=10*dt;f.a+=Math.max(-maxStep,Math.min(maxStep,delta));f.omega=(f.a-previous)/dt}if(keys.plunger)charge=Math.min(100,charge+dt*70);
 for(const b of balls){if(b.held){b.x=812;b.y=1340+charge*.65;continue}if(b.launching){advancePlunger(b,dt);continue}if(b.saucer>0){b.saucer-=dt;b.x=PF_CENTER;b.y=770;if(b.saucer<=0)resolveSaucer(b);continue}if(b.ramp){advanceRamp(b,dt);continue}b.vy+=tuning.gravity*dt;b.vx*=.999;b.vy*=.999;const speed=Math.hypot(b.vx,b.vy);if(speed>1850){b.vx*=1850/speed;b.vy*=1850/speed}b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.shooter&&b.y<650&&b.vy<0){b.shooter=false;b.x=690;b.y=620;b.vx=-500;b.vy=-650;updateHud('PLUNGER-FEED')}for(const w of walls)if(collideSegment(b,...w,12,tuning.bounce)&&simTime-(b.lastWall||0)>.075){b.lastWall=simTime;playSound('wall',Math.min(1.4,speed/700))}if(!b.shooter)collideSegment(b,...oneWayGate,12,.6);slings.forEach((sling,i)=>collideSling(b,sling,i));for(const p of posts)if(collideCircle(b,p,1.01,80)&&simTime-(b.lastPost||0)>.1){b.lastPost=simTime;playSound('post');burst(p.x,p.y,'#ffb84d',5)}for(const p of bumpers)if(collideCircle(b,p,1.05,450)){score+=250;playSound('bumper');burst(p.x,p.y,'#56e5dd',14);updateHud('BUMPER +250')}collideFlipper(b,flippers.left);collideFlipper(b,flippers.right);preventPivotTrap(b,dt);if(b.saucer<=0&&Math.hypot(b.x-PF_CENTER,b.y-770)<62){if(saucerBesetzt(b))collideCircle(b,{x:PF_CENTER,y:770,r:R},1,60);else if(simTime>=(b.saucerReady||0)&&Math.hypot(b.vx,b.vy)<1050)enterSaucer(b)}tryRamp(b);b.trail.push([b.x,b.y,b.z]);if(b.trail.length>10)b.trail.shift()}
 collideBalls();balls=balls.filter(b=>!b.locked);const drained=balls.filter(b=>b.y>=H+60);balls=balls.filter(b=>b.y<H+60);if(drained.length)handleDrain(drained.length);updateRolling();updateDebug()
}
function tryRamp(b){const left=b.x>145&&b.x<305&&b.y>940&&b.y<1160,right=b.x>519&&b.x<679&&b.y>940&&b.y<1160;if((left||right)&&b.vy<-420){if(b.vy>-tuning.rampMin){b.vy=440;b.vx+=(left?1:-1)*100;updateHud('RAMPE ZU LANGSAM');return}b.ramp=left?'left':'right';b.t=0;b.rampSpeed=Math.min(.55,Math.max(.31,-b.vy/2600));b.vx=b.vy=0;playSound('ramp');updateHud('RAMPE +38 MM')}}
function advancePlunger(b,dt){b.t+=dt*b.launchSpeed;const u=Math.min(1,b.t),pos=catmull(plungerPath,u);b.x=pos.x;b.y=pos.y;b.trail.push([b.x,b.y,0]);if(b.trail.length>10)b.trail.shift();if(u>=1){b.launching=false;b.shooter=false;b.vx=-500;b.vy=-650;playSound('feed');burst(b.x,b.y,'#56e5dd',8);updateHud('PLUNGER-FEED')}}
function advanceRamp(b,dt){b.t+=dt*b.rampSpeed;const rampName=b.ramp,path=rampPaths[rampName],u=Math.min(1,b.t),pos=catmull(path,u);b.x=pos.x;b.y=pos.y;b.z=Math.sin(Math.PI*u)*76;if(u>.48&&u<.52)updateHud('KREUZUNG +76 MM');if(u>=1){b.ramp=null;b.z=0;b.vy=520;b.vx=b.x<PF_CENTER?-110:110;score+=1500;loopLit[rampName]=true;playSound('feed');burst(b.x,b.y,rampName==='left'?'#56e5dd':'#ffb84d',10);updateHud(loopLit.left&&loopLit.right?'LOCK BEREIT':`${rampName==='left'?'LINKER':'RECHTER'} LOOP +1500`)}}
function catmull(points,t){const n=points.length-1,s=t*n,i=Math.min(n-1,Math.floor(s)),u=s-i,p0=points[Math.max(0,i-1)],p1=points[i],p2=points[Math.min(n,i+1)],p3=points[Math.min(n,i+2)],u2=u*u,u3=u2*u;return{x:.5*((2*p1[0])+(-p0[0]+p2[0])*u+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*u2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*u3),y:.5*((2*p1[1])+(-p0[1]+p2[1])*u+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*u2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*u3)}}
function saucerBesetzt(self){return balls.some(o=>o!==self&&o.saucer>0)}
function enterSaucer(b){b.saucer=.72;b.vx=b.vy=0;b.saucerMode=loopLit.left&&loopLit.right?(locks<2?'lock':'multiball'):'feed';score+=500;playSound(b.saucerMode==='feed'?'feed':'lock');burst(PF_CENTER,770,b.saucerMode==='feed'?'#55a8ff':'#ff6767',b.saucerMode==='feed'?7:18);updateHud(b.saucerMode==='feed'?'SAUCER-FEED · KEIN LOCK':b.saucerMode==='lock'?'BALL LOCKED · WIRD GESPEICHERT':'MULTIBALL START')}
function resolveSaucer(b){b.saucer=0;b.saucerReady=simTime+.6;if(b.saucerMode==='feed'){b.vx=(random()-.5)*220;b.vy=-760;updateHud('SAUCER-FEED · KUGEL FREI');return}loopLit={left:false,right:false};if(b.saucerMode==='lock'){locks++;score+=2000;b.locked=true;balls.push(makeBall());updateHud(`BALL LOCKED · ${locks}/2 GESPEICHERT`);return}locks=0;score+=5000;b.vy=-520;b.vx=0;const left=makeBall(PF_CENTER-45,720,false),right=makeBall(PF_CENTER+45,720,false);left.vx=-240;left.vy=-520;right.vx=240;right.vy=-520;balls.push(left,right);ballSaveUntil=simTime+10;playSound('multiball');updateHud('3-BALL MULTIBALL · SAVE 10 S')}
function handleDrain(count){playSound('drain');if(simTime<ballSaveUntil){if(balls.length){for(let i=0;i<count;i++){const saved=makeBall(PF_CENTER+(i-(count-1)/2)*56,700,false);saved.vx=(i-(count-1)/2)*180;saved.vy=-520;balls.push(saved)}updateHud(`BALL SAVE · ${count} KUGEL${count===1?'':'N'} ZURÜCK`)}else{balls.push(makeBall());updateHud('BALL SAVE · ERNEUT ABSCHIESSEN')}return}if(balls.length){updateHud(`MULTIBALL · ${balls.length} KUGEL${balls.length===1?'':'N'}`);return}if(reserve>1){reserve--;balls.push(makeBall());updateHud('NÄCHSTER BALL')}else{reserve=0;running=false;updateHud('GAME OVER');document.querySelector('.canvas-overlay').classList.remove('hidden');document.querySelector('#startButton').textContent='Neues Spiel'}}
function updateDebug(){if(!debug)return;const b=balls[0],save=Math.max(0,ballSaveUntil-simTime),lights=`${loopLit.left?'L':''}${loopLit.right?'R':''}`||'–';if(!b){debugReadout.textContent=`Keine aktive Kugel · Loops ${lights}`;return}const state=b.launching?'plunger':b.ramp?`ramp:${b.ramp}`:b.saucer>0?'saucer':'ground';debugReadout.textContent=`x ${b.x.toFixed(0)} · y ${b.y.toFixed(0)} · v ${Math.hypot(b.vx,b.vy).toFixed(0)} · ${state} · Loops ${lights} · Save ${save.toFixed(1)} s`}
function collideCircle(b,c,bounce=1,kick=0){const dx=b.x-c.x,dy=b.y-c.y,d=Math.hypot(dx,dy),min=R+c.r;if(d>=min||d===0)return false;const nx=dx/d,ny=dy/d,over=min-d;b.x+=nx*over;b.y+=ny*over;const dot=b.vx*nx+b.vy*ny;if(dot<0){b.vx-=1.8*dot*nx;b.vy-=1.8*dot*ny}b.vx=b.vx*bounce+nx*kick;b.vy=b.vy*bounce+ny*kick;return true}
function collideSegment(b,x1,y1,x2,y2,width=10,bounce=.8){const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy,t=Math.max(0,Math.min(1,((b.x-x1)*dx+(b.y-y1)*dy)/l2)),px=x1+t*dx,py=y1+t*dy,ox=b.x-px,oy=b.y-py,d=Math.hypot(ox,oy),min=R+width;if(d>=min||d===0)return false;const nx=ox/d,ny=oy/d;b.x=px+nx*min;b.y=py+ny*min;const dot=b.vx*nx+b.vy*ny;if(dot<0){b.vx-=(1+bounce)*dot*nx;b.vy-=(1+bounce)*dot*ny}return true}
function collideSling(b,sling,index){let hit=false;for(let i=0;i<sling.length;i++){const a=sling[i],c=sling[(i+1)%sling.length];hit=collideSegment(b,a[0],a[1],c[0],c[1],10,.84)||hit}if(!hit||simTime-(b.lastSling||0)<.16)return;const cx=sling.reduce((sum,p)=>sum+p[0],0)/sling.length,cy=sling.reduce((sum,p)=>sum+p[1],0)/sling.length,dx=b.x-cx,dy=b.y-cy,d=Math.hypot(dx,dy)||1;b.vx+=dx/d*150;b.vy+=dy/d*150-70;b.lastSling=simTime;score+=50;playSound('sling');burst(b.x,b.y,index?'#ffb84d':'#56e5dd',9);updateHud(`SLING ${index?'RECHTS':'LINKS'} +50`)}
function preventPivotTrap(b,dt){const pivot=Math.abs(b.x-flippers.left.x)<Math.abs(b.x-flippers.right.x)?flippers.left:flippers.right,d=Math.hypot(b.x-pivot.x,b.y-pivot.y),speed=Math.hypot(b.vx,b.vy);if(d<68&&speed<65){b.pivotStuck+=dt;if(b.pivotStuck>.65){b.vx=pivot===flippers.left?190:-190;b.vy=-230;b.pivotStuck=0;updateHud('PIVOT-SAVE')}}else b.pivotStuck=0}
function collideFlipper(b,f){const ex=f.x+Math.cos(f.a)*f.len,ey=f.y+Math.sin(f.a)*f.len;if(!collideSegment(b,f.x,f.y,ex,ey,18,.82)||Math.abs(f.omega)<1)return;const dx=ex-f.x,dy=ey-f.y,t=Math.max(.15,Math.min(1,((b.x-f.x)*dx+(b.y-f.y)*dy)/(f.len*f.len))),radius=f.len*t,svx=-Math.sin(f.a)*f.omega*radius,svy=Math.cos(f.a)*f.omega*radius;if(svy<0){b.vx+=svx*.8;b.vy+=svy*.95-70;score+=10;if(simTime-(b.lastFlipper||0)>.08){b.lastFlipper=simTime;playSound('flipper');burst(b.x,b.y,'#f4f0df',6)}}}
function collideBalls(){for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){const a=balls[i],b=balls[j];if(a.ramp||b.ramp||a.saucer>0||b.saucer>0||Math.abs(a.z-b.z)>R*2)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>0&&d<R*2){const nx=dx/d,ny=dy/d,p=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(p>0){a.vx-=p*nx;a.vy-=p*ny;b.vx+=p*nx;b.vy+=p*ny}const o=(R*2-d)/2;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o}}}
/* ---------- 3D-Renderer: perspektivische Projektion des geneigten Spielfelds ----------
   Weltkoordinaten bleiben unveraendert: x/y = Spielfeldebene (Physik), z = Hoehe in mm.
   z wird ausschliesslich von advanceRamp() geschrieben und hier nur gelesen.            */
/* Kamera: Blickwinkel 50 Grad (flacher als eine reine Draufsicht), Abstand 1750.
   focal ist so gewaehlt, dass die Tischbreite an der Naheckkante 800 px einnimmt,
   horizon so, dass diese Kante auf Bildzeile 1442 faellt. Tischspitze landet bei 429,
   darueber steht die Backbox. Naher Massstab 1.026, ferner 0.582 - der Ball wird
   dadurch im Flipperbereich 14 % und im Oberfeld 25 % groesser als in V2. */
const view={camDist:1750,camH:2085.6,focal:1846.2,slope:Math.tan(6.5*Math.PI/180),horizon:-691.2,zScale:1.3};
/* Hoehen in Welt-Pixeln. Der Ballmittelpunkt liegt um R ueber der Flaeche, auf der er rollt. */
const BALL_LIFT=R/view.zScale,FLIPPER_H=18,SLING_H=30;
const LIGHT=[-0.45,-0.89];
function proj(x,y,z=0){const fwd=H-y,d=view.camDist+fwd,s=view.focal/d;return{x:W/2+(x-W/2)*s,y:view.horizon+(view.camH-z*view.zScale-fwd*view.slope)*s,s}}
function shade(hex,f,a=1){const n=parseInt(hex.slice(1),16),r=Math.min(255,(n>>16&255)*f)|0,g=Math.min(255,(n>>8&255)*f)|0,b=Math.min(255,(n&255)*f)|0;return a<1?`rgba(${r},${g},${b},${a})`:`rgb(${r},${g},${b})`}
function poly(pts,fill,stroke,lw=2){if(pts.length<3)return;ctx.beginPath();for(let i=0;i<pts.length;i++)i?ctx.lineTo(pts[i].x,pts[i].y):ctx.moveTo(pts[i].x,pts[i].y);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function ringPts(cx,cy,r,z,n=24){const out=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;out.push(proj(cx+Math.cos(a)*r,cy+Math.sin(a)*r,z))}return out}
function groundShadow(cx,cy,r,alpha=.42){poly(ringPts(cx+r*.22,cy+r*.3,r*1.06,0),`rgba(0,0,0,${alpha})`,null)}
function glowAt(x,y,r){for(const e of effects)if(Math.abs(e.x-x)<r&&Math.abs(e.y-y)<r)return true;return false}
function segQuad(x1,y1,x2,y2,hw){const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy)||1,nx=-dy/l*hw,ny=dx/l*hw;return[[x1+nx,y1+ny],[x2+nx,y2+ny],[x2-nx,y2-ny],[x1-nx,y1-ny]]}
function worldLine(x1,y1,z1,x2,y2,z2,color,lw){const a=proj(x1,y1,z1),b=proj(x2,y2,z2);ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
function label(text,x,y,z,color,size=18,align='center'){const p=proj(x,y,z);ctx.save();ctx.textAlign=align;ctx.fillStyle=color;ctx.font=`800 ${Math.max(9,size*p.s)}px ui-monospace,monospace`;ctx.fillText(text,p.x,p.y);ctx.restore()}
/* Extrudiertes Polygon: Seitenflaechen nach Tiefe sortiert (Maler-Algorithmus), dann Deckflaeche. */
function prism(pts,zBottom,zTop,topFill,sideColor,edge,lw=1.6){
 const n=pts.length,cx=pts.reduce((s,p)=>s+p[0],0)/n,cy=pts.reduce((s,p)=>s+p[1],0)/n;
 const lo=pts.map(p=>proj(p[0],p[1],zBottom)),hi=pts.map(p=>proj(p[0],p[1],zTop)),faces=[];
 for(let i=0;i<n;i++){const j=(i+1)%n,mx=(pts[i][0]+pts[j][0])/2,my=(pts[i][1]+pts[j][1])/2;
  let ox=mx-cx,oy=my-cy;const ol=Math.hypot(ox,oy)||1;ox/=ol;oy/=ol;
  faces.push({depth:my,f:.38+.62*Math.max(0,ox*LIGHT[0]+oy*LIGHT[1]),q:[lo[i],lo[j],hi[j],hi[i]]})}
 faces.sort((a,b)=>a.depth-b.depth);
 for(const fc of faces)poly(fc.q,shade(sideColor,fc.f),shade(sideColor,fc.f*.68),1);
 poly(hi,topFill,edge,lw);
 return hi;
}
function cylinder(cx,cy,r,zBottom,zTop,topFill,sideColor,edge,lw=2,n=22){
 const segs=[];
 for(let i=0;i<n;i++){const a0=i/n*Math.PI*2,a1=(i+1)/n*Math.PI*2,am=(a0+a1)/2;
  segs.push({depth:Math.sin(am),f:.34+.66*Math.max(0,Math.cos(am)*LIGHT[0]+Math.sin(am)*LIGHT[1]),
   q:[proj(cx+Math.cos(a0)*r,cy+Math.sin(a0)*r,zBottom),proj(cx+Math.cos(a1)*r,cy+Math.sin(a1)*r,zBottom),
      proj(cx+Math.cos(a1)*r,cy+Math.sin(a1)*r,zTop),proj(cx+Math.cos(a0)*r,cy+Math.sin(a0)*r,zTop)]})}
 segs.sort((a,b)=>a.depth-b.depth);
 for(const s of segs)poly(s.q,shade(sideColor,s.f),null);
 const cap=ringPts(cx,cy,r,zTop,n);poly(cap,topFill,edge,lw);return cap;
}

function draw(){
 ctx.save();ctx.clearRect(0,0,W,H);ctx.lineCap='round';ctx.lineJoin='round';
 drawBackdrop();drawCabinet();drawFloor();drawAprons();drawPlungerLane();
 drawSaucer();drawGate();drawSlings();drawWalls();
 for(const p of posts)drawPost(p);
 for(const p of bumpers)drawBumper(p);
 drawFlipper(flippers.left);drawFlipper(flippers.right);
 balls.filter(b=>!b.ramp).sort((a,b)=>a.y-b.y).forEach(drawBall);
 drawRamps();
 balls.filter(b=>b.ramp).sort((a,b)=>a.y-b.y).forEach(drawBall);
 drawEffects();if(debug)drawDiagnostics();
 ctx.restore();drawRuleStatus();
}
function drawBackdrop(){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#04090e');g.addColorStop(.45,'#071119');g.addColorStop(1,'#020508');
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const glow=ctx.createRadialGradient(W/2,140,20,W/2,200,640);glow.addColorStop(0,'#56e5dd1f');glow.addColorStop(1,'#56e5dd00');
 ctx.fillStyle=glow;ctx.fillRect(0,0,W,560);
}
/* Backbox am oberen Tischende: gibt der Szene Tiefe und traegt den Spielzustand. */
function drawCabinet(){
 const back=[proj(60,92,0),proj(860,92,0),proj(860,92,300),proj(60,92,300)];
 const g=ctx.createLinearGradient(0,back[2].y,0,back[0].y);g.addColorStop(0,'#0d2b3a');g.addColorStop(1,'#061319');
 poly(back,g,'#1d4b5e',2);
 label('DOUBLE HELIX',PF_CENTER,92,210,'#56e5dd',38);
 label('439 x 771 MM  ·  6,5 GRAD',PF_CENTER,92,150,'#3e6f7d',19);
 const qualified=loopLit.left&&loopLit.right;
 label(qualified?(locks===2?'MULTIBALL BEREIT':'LOCK IST SCHARF'):`LOCKS ${locks}/2`,PF_CENTER,92,88,qualified?'#ff8f8f':'#2f5563',22);
 poly([proj(60,92,0),proj(60,1480,0),proj(60,1480,46),proj(60,92,46)],'#0a1a22','#16323f',1.5);
 poly([proj(860,92,0),proj(860,1480,0),proj(860,1480,46),proj(860,92,46)],'#0a1a22','#16323f',1.5);
}
function drawFloor(){
 const c=[proj(70,100,0),proj(850,100,0),proj(850,1470,0),proj(70,1470,0)];
 const g=ctx.createLinearGradient(0,c[0].y,0,c[2].y);
 g.addColorStop(0,'#17414f');g.addColorStop(.35,'#0e2b39');g.addColorStop(.75,'#0a1f2b');g.addColorStop(1,'#071620');
 poly(c,g,'#20505f',2);
 ctx.save();ctx.strokeStyle='#ffffff0e';ctx.lineWidth=1;
 for(let x=150;x<850;x+=100){const a=proj(x,100,0),b=proj(x,1470,0);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
 for(let y=180;y<1470;y+=100){const a=proj(70,y,0),b=proj(850,y,0);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
 ctx.restore();
 poly(ringPts(PF_CENTER,608,208,1,30),null,loopLit.left||loopLit.right?'#56e5dd2a':'#ffffff0c',3);
 label('L-LOOP',175,940,2,loopLit.left?'#56e5dd':'#2f5563',22);
 label('R-LOOP',649,940,2,loopLit.right?'#ffb84d':'#5c4c33',22);
 label('+76 MM',175,990,2,'#24505e',15);
 label('+76 MM',649,990,2,'#5c4c33',15);
}
function drawWalls(){
 const order=walls.map(w=>({w,depth:Math.min(w[1],w[3])})).sort((a,b)=>a.depth-b.depth);
 for(const o of order)prism(segQuad(o.w[0],o.w[1],o.w[2],o.w[3],11),0,58,'#7d95a1','#3c525d','#a9c0ca',1.4);
}
function drawAprons(){for(const apron of aprons)prism(apron.map(p=>[p[0],p[1]]),0,22,'#122a36','#0a1a23','#1d4353',1.5)}
function drawPlungerLane(){
 for(let i=0;i<plungerPath.length-1;i++)worldLine(plungerPath[i][0],plungerPath[i][1],1,plungerPath[i+1][0],plungerPath[i+1][1],1,'#123342',2);
 const rodTop=1352+charge*.65;
 prism(segQuad(812,1466,812,rodTop,12),4,26,keys.plunger?'#ffd591':'#b0996f','#6b5a3f','#ffe6bd',1.2);
 cylinder(812,rodTop,19,0,30,keys.plunger?'#ffb84d':'#8a7550','#5e4b31','#ffd9a0',1.5,16);
 if(charge>0)label(`${Math.round(charge)} %`,812,1500,44,'#ffb84d',20);
}
function drawGate(){
 ctx.save();ctx.setLineDash([12,9]);
 worldLine(oneWayGate[0],oneWayGate[1],0,oneWayGate[2],oneWayGate[3],0,'#56e5dd55',3);
 worldLine(oneWayGate[0],oneWayGate[1],34,oneWayGate[2],oneWayGate[3],34,'#56e5dd',4);
 ctx.setLineDash([]);
 worldLine(oneWayGate[0],oneWayGate[1],0,oneWayGate[0],oneWayGate[1],34,'#56e5dd88',2);
 worldLine(oneWayGate[2],oneWayGate[3],0,oneWayGate[2],oneWayGate[3],34,'#56e5dd88',2);
 poly([proj(742,575,18),proj(772,557,18),proj(772,593,18)],'#56e5dd','#b9fffa',1);
 ctx.restore();
}
function drawSlings(){
 for(let s=0;s<slings.length;s++){
  const color=s?'#ffb84d':'#56e5dd',pts=slings[s].map(p=>[p[0],p[1]]),
   cx=pts.reduce((v,p)=>v+p[0],0)/3,cy=pts.reduce((v,p)=>v+p[1],0)/3,hot=glowAt(cx,cy,110);
  prism(pts,0,SLING_H,shade(color,hot?1:.6),shade(color,hot?.8:.42),hot?'#ffffff':color,hot?4:2.5);
 }
}
function drawPost(p){
 groundShadow(p.x,p.y,p.r,.4);
 cylinder(p.x,p.y,p.r,0,40,'#ffd9a0','#a3742c','#ffe0a8',2.5);
 cylinder(p.x,p.y,p.r*.55,40,48,'#2a1d0c','#6b4c1c','#ffb84d',1.5,14);
}
function drawBumper(p){
 const hot=glowAt(p.x,p.y,p.r+34);
 groundShadow(p.x,p.y,p.r,.45);
 poly(ringPts(p.x,p.y,p.r*1.28,1,28),null,hot?'#b9fffa':'#56e5dd4d',hot?6:3);
 cylinder(p.x,p.y,p.r,0,34,shade('#164252',hot?1.7:1),'#123b49','#56e5dd',2.5);
 cylinder(p.x,p.y,p.r*.72,34,56,hot?'#e8fffd':'#3aa9a3','#1c6a6b','#b9fffa',2,18);
 cylinder(p.x,p.y,p.r*.26,56,66,hot?'#ffffff':'#8ff0e8','#2f8f8a','#e8fffd',1.5,12);
}
function drawSaucer(){
 const qualified=loopLit.left&&loopLit.right;
 ctx.save();if(qualified){ctx.shadowBlur=26;ctx.shadowColor='#ff6767'}
 poly(ringPts(PF_CENTER,770,70,0,28),'#04101788',qualified?'#ff6767':'#5d3034',10);
 ctx.restore();
 poly(ringPts(PF_CENTER,770,52,-26,26),'#020a0f','#1a2c33',2);
 label(qualified?(locks===2?'MULTI':'LOCK'):'SAUCER',PF_CENTER,770,6,qualified?'#ff9a9a':'#7d4f52',24);
 for(let i=0;i<locks;i++){
  const lx=PF_CENTER+(i?26:-26),p=proj(lx,838,11/view.zScale),r=11*p.s;
  poly(ringPts(lx,838,13,0,14),'#00000055',null);
  const g=ctx.createRadialGradient(p.x-r*.35,p.y-r*.4,r*.15,p.x,p.y,r);
  g.addColorStop(0,'#ffffff');g.addColorStop(.4,'#c6d8dd');g.addColorStop(1,'#46585f');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#ff6767';ctx.lineWidth=2;ctx.stroke();
 }
}
function drawFlipper(f){
 const ex=f.x+Math.cos(f.a)*f.len,ey=f.y+Math.sin(f.a)*f.len,pts=[];
 for(let i=0;i<=9;i++){const a=f.a+Math.PI/2+i/9*Math.PI;pts.push([f.x+Math.cos(a)*20,f.y+Math.sin(a)*20])}
 for(let i=0;i<=9;i++){const a=f.a-Math.PI/2+i/9*Math.PI;pts.push([ex+Math.cos(a)*11,ey+Math.sin(a)*11])}
 ctx.save();ctx.globalAlpha=.45;poly(pts.map(p=>proj(p[0]+7,p[1]+9,0)),'#000',null);ctx.restore();
 prism(pts,0,FLIPPER_H,'#f4f0df','#9c9684','#ffffff',1.6);
 cylinder(f.x,f.y,10,0,FLIPPER_H+12,'#ff6767','#8c2f2f','#ffaaaa',2,14);
}
function drawBall(b){
 const p=proj(b.x,b.y,b.z+BALL_LIFT),r=R*p.s;
 ctx.save();
 for(let i=0;i<b.trail.length;i++){const t=b.trail[i],tp=proj(t[0],t[1],(t[2]||0)+BALL_LIFT);
  ctx.globalAlpha=i/b.trail.length*.2;ctx.fillStyle=b.ramp?'#ffb84d':'#56e5dd';
  ctx.beginPath();ctx.arc(tp.x,tp.y,r*.55,0,Math.PI*2);ctx.fill()}
 ctx.restore();
 const drop=Math.max(.14,.5-b.z/240);
 poly(ringPts(b.x+6+b.z*.05,b.y+10+b.z*.06,R*(1+b.z/420),0,16),`rgba(0,0,0,${drop})`,null);
 if(b.z>6)worldLine(b.x,b.y,0,b.x,b.y,b.z,'#ffb84d33',2);
 const g=ctx.createRadialGradient(p.x-r*.36,p.y-r*.42,r*.12,p.x,p.y,r);
 g.addColorStop(0,'#ffffff');g.addColorStop(.28,'#dbe9ed');g.addColorStop(.72,'#8ea4ad');g.addColorStop(1,'#2e3d45');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#eaf7fa66';ctx.lineWidth=1;ctx.stroke();
 ctx.fillStyle='#ffffff99';ctx.beginPath();ctx.ellipse(p.x-r*.3,p.y-r*.45,r*.26,r*.15,-.6,0,Math.PI*2);ctx.fill();
 if(b.z>4)label(`+${Math.round(b.z)} mm`,b.x,b.y,b.z+BALL_LIFT+44,'#ffca73',17);
}
/* Rampen als schwebende Baender: Bodenschatten, Stuetzen, Deck, zwei Seitenwaende. */
function drawRamps(){
 drawRamp(rampPaths.left,'#56e5dd');
 drawRamp(rampPaths.right,'#ffb84d');
}
function drawRamp(path,color){
 const N=56,hw=27,rail=16,lo=[],hi=[],ro=[],ri=[],shA=[],shB=[],mid=[];
 for(let i=0;i<=N;i++){
  const u=i/N,p=catmull(path,u),pa=catmull(path,Math.max(0,u-1/N)),pb=catmull(path,Math.min(1,u+1/N));
  const dx=pb.x-pa.x,dy=pb.y-pa.y,l=Math.hypot(dx,dy)||1,nx=-dy/l*hw,ny=dx/l*hw,z=Math.sin(Math.PI*u)*76;
  lo.push(proj(p.x+nx,p.y+ny,z));hi.push(proj(p.x+nx,p.y+ny,z+rail));
  ro.push(proj(p.x-nx,p.y-ny,z));ri.push(proj(p.x-nx,p.y-ny,z+rail));
  shA.push(proj(p.x+nx+z*.05,p.y+ny+z*.06,0));shB.push(proj(p.x-nx+z*.05,p.y-ny+z*.06,0));
  mid.push({x:p.x,y:p.y,z});
 }
 ctx.save();
 poly(shA.concat(shB.slice().reverse()),'rgba(0,0,0,0.3)',null);
 for(let i=3;i<N-2;i+=7){const m=mid[i];if(m.z<10)continue;
  const a=proj(m.x,m.y,0),c=proj(m.x,m.y,m.z);
  ctx.strokeStyle='#14313f';ctx.lineWidth=Math.max(2,7*c.s);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(c.x,c.y);ctx.stroke()}
 const deck=lo.concat(ro.slice().reverse());
 let top=1e9,bot=-1e9;for(const d of deck){if(d.y<top)top=d.y;if(d.y>bot)bot=d.y}
 const g=ctx.createLinearGradient(0,top,0,bot);
 g.addColorStop(0,shade(color,.9,.55));g.addColorStop(.5,shade(color,.55,.46));g.addColorStop(1,shade(color,.34,.4));
 poly(deck,g,null);
 ctx.strokeStyle=shade(color,.9,.35);ctx.lineWidth=2;ctx.setLineDash([16,14]);
 ctx.beginPath();for(let i=0;i<=N;i++){const c=proj(mid[i].x,mid[i].y,mid[i].z+1);i?ctx.lineTo(c.x,c.y):ctx.moveTo(c.x,c.y)}ctx.stroke();ctx.setLineDash([]);
 const rails=[{pts:lo.concat(hi.slice().reverse()),edge:hi,depth:lo.reduce((s,p)=>s+p.y,0)/lo.length},
              {pts:ro.concat(ri.slice().reverse()),edge:ri,depth:ro.reduce((s,p)=>s+p.y,0)/ro.length}];
 rails.sort((a,b)=>a.depth-b.depth);
 for(const rl of rails){
  poly(rl.pts,shade(color,.35,.55),null);
  ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();
  for(let i=0;i<=N;i++)i?ctx.lineTo(rl.edge[i].x,rl.edge[i].y):ctx.moveTo(rl.edge[0].x,rl.edge[0].y);
  ctx.stroke();
 }
 ctx.restore();
}
function drawRuleStatus(){
 ctx.save();ctx.font='800 22px ui-monospace,monospace';ctx.textAlign='left';
 ctx.fillStyle=loopLit.left?'#56e5dd':'#3d525c';ctx.fillText(`L-LOOP ${loopLit.left?'LIT':'AUS'}`,34,1505);
 ctx.textAlign='right';ctx.fillStyle=loopLit.right?'#ffb84d':'#3d525c';ctx.fillText(`R-LOOP ${loopLit.right?'LIT':'AUS'}`,886,1505);
 if(simTime<ballSaveUntil){ctx.textAlign='center';ctx.fillStyle='#56e5dd';ctx.fillText(`BALL SAVE ${Math.ceil(ballSaveUntil-simTime)} s`,W/2,1505)}
 ctx.restore();
}
function drawEffects(){
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(const e of effects){const p=proj(e.x,e.y,e.z||0),k=Math.max(0,e.life/e.max);
  ctx.globalAlpha=k;ctx.fillStyle=e.color;ctx.beginPath();ctx.arc(p.x,p.y,(3+9*(1-k))*p.s,0,Math.PI*2);ctx.fill()}
 ctx.restore();ctx.globalAlpha=1;
}
function drawDiagnostics(){
 ctx.save();ctx.setLineDash([9,7]);
 for(const w of walls)worldLine(w[0],w[1],0,w[2],w[3],0,'#ff4fd8',2.5);
 worldLine(oneWayGate[0],oneWayGate[1],0,oneWayGate[2],oneWayGate[3],0,'#ff4fd8',2.5);
 for(const sling of slings)poly(sling.map(p=>proj(p[0],p[1],0)),null,'#ff4fd8',2.5);
 for(const p of posts.concat(bumpers))poly(ringPts(p.x,p.y,R+p.r,0,26),null,'#ff4fd8',2.5);
 poly(ringPts(PF_CENTER,770,62,0,26),null,'#ff4fd8',2.5);
 ctx.setLineDash([]);ctx.textAlign='left';ctx.fillStyle='#ff4fd8';
 for(const b of balls){
  const a=proj(b.x,b.y,b.z),c=proj(b.x+b.vx*.12,b.y+b.vy*.12,b.z);
  ctx.strokeStyle='#ff4fd8';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(c.x,c.y);ctx.stroke();
  ctx.font=`800 ${Math.max(10,16*a.s)}px ui-monospace,monospace`;ctx.fillText(`${Math.hypot(b.vx,b.vy).toFixed(0)}`,a.x+22*a.s,a.y-20*a.s);
 }
 ctx.restore();
}
function setKey(code,on){if(['ArrowLeft','KeyA'].includes(code))keys.left=on;if(['ArrowRight','KeyD'].includes(code))keys.right=on;if(code==='Space'){const wasPressed=keys.plunger;keys.plunger=on;if(on&&!wasPressed)playSound('charge');if(!on&&wasPressed)launch()}}
function toggleDebug(){debug=!debug;debugPanel.hidden=!debug;const button=document.querySelector('#debugToggle');button.textContent=`Diagnose: ${debug?'An':'Aus'}`;button.setAttribute('aria-pressed',String(debug));updateDebug();draw()}
function toggleAudio(){sound.enabled=!sound.enabled;if(sound.enabled)ensureAudio();if(sound.master)sound.master.gain.setTargetAtTime(sound.enabled?sound.volume:0,sound.ctx.currentTime,.03);const button=document.querySelector('#audioToggle');button.textContent=`Audio: ${sound.enabled?'An':'Aus'}`;button.setAttribute('aria-pressed',String(!sound.enabled))}
function clearInputs(){keys.left=keys.right=keys.plunger=false;charge=0}
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown'].includes(e.code)){e.preventDefault();return}if(e.code==='F2'){e.preventDefault();if(!e.repeat)toggleDebug();return}if(['ArrowLeft','ArrowRight','Space','KeyA','KeyD'].includes(e.code)){e.preventDefault();if(!running)start();setKey(e.code,true)}});addEventListener('keyup',e=>setKey(e.code,false));addEventListener('blur',clearInputs);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInputs()});
function bindHold(id,key){const el=document.querySelector(id);el.addEventListener('pointerdown',e=>{e.preventDefault();if(!running)start();keys[key]=true;if(key==='plunger')playSound('charge');el.setPointerCapture(e.pointerId)});el.addEventListener('pointerup',()=>{keys[key]=false;if(key==='plunger')launch()});el.addEventListener('pointercancel',()=>keys[key]=false)}
bindHold('#leftButton','left');bindHold('#rightButton','right');bindHold('#launchButton','plunger');
/* Beruehrsteuerung auf der Spielflaeche: linke Haelfte linker Flipper, rechte Haelfte
   rechter Flipper. Auf dem Telefon liegen keine zwei Finger auf kleinen Schaltflaechen,
   deshalb ist die halbe Flaeche das Ziel. Mehrere Finger werden ueber pointerId
   getrennt gefuehrt, beide Flipper lassen sich also gleichzeitig halten.
   Haengt eine Kugel am Plunger, spannt jede Beruehrung stattdessen den Plunger. */
const touchSide=new Map();
function surfaceDown(e){
 if(e.pointerType!=='touch')return;   /* Maus und Stift bleiben aussen vor */
 e.preventDefault();
 if(!running){start();return}
 if(balls.some(b=>b.held)){touchSide.set(e.pointerId,'plunger');keys.plunger=true;playSound('charge')}
 else{const r=canvas.getBoundingClientRect(),side=(e.clientX-r.left)<r.width/2?'left':'right';
  touchSide.set(e.pointerId,side);keys[side]=true}
 try{canvas.setPointerCapture(e.pointerId)}catch(err){}
}
function surfaceUp(e){
 const side=touchSide.get(e.pointerId);if(!side)return;
 touchSide.delete(e.pointerId);
 if(side==='plunger'){keys.plunger=false;launch()}else keys[side]=false;
}
canvas.addEventListener('pointerdown',surfaceDown);
canvas.addEventListener('pointerup',surfaceUp);
canvas.addEventListener('pointercancel',surfaceUp);
canvas.addEventListener('lostpointercapture',surfaceUp);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
document.querySelector('#startButton').addEventListener('click',start);
function bindRange(id,key,out,format=v=>v){const el=document.querySelector(id);el.addEventListener('input',()=>{tuning[key]=key==='bounce'?+el.value/100:+el.value;document.querySelector(out).textContent=format(el.value)})}
bindRange('#gravity','gravity','#gravityOut');bindRange('#bounce','bounce','#bounceOut',v=>`${v}%`);bindRange('#rampMin','rampMin','#rampOut');
document.querySelector('#debugToggle').addEventListener('click',toggleDebug);
document.querySelector('#audioToggle').addEventListener('click',toggleAudio);document.querySelector('#volume').addEventListener('input',e=>{sound.volume=+e.target.value/100;document.querySelector('#volumeOut').textContent=`${e.target.value}%`;if(sound.master&&sound.enabled)sound.master.gain.setTargetAtTime(sound.volume,sound.ctx.currentTime,.03)});
document.querySelector('#multiballTest').addEventListener('click',()=>{if(!running)start();locks=0;loopLit={left:false,right:false};balls=[];balls.push(makeBall(PF_CENTER-60,690,false),makeBall(PF_CENTER,720,false),makeBall(PF_CENTER+60,690,false));balls.forEach((b,i)=>{b.vx=(i-1)*240;b.vy=-520});ballSaveUntil=simTime+10;playSound('multiball');updateHud('MULTIBALL-TEST · SAVE 10 S')});
document.querySelector('#resetGame').addEventListener('click',()=>{if(!running){running=true;last=performance.now();requestAnimationFrame(frame)}resetGame();document.querySelector('.canvas-overlay').classList.add('hidden')});resetGame();draw();
