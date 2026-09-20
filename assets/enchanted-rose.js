/* A textured, articulated bloom. Native scrolling and the project directory remain primary fallbacks. */
(()=>{
 const stage=document.querySelector('.stage'),art=document.querySelector('.rose-art');if(!stage||!art)return;
 const T=window.THREE,pref=matchMedia('(prefers-reduced-motion: reduce)'),panel=document.querySelector('#panel');
 const hint=document.querySelector('#hint'),label=document.querySelector('#label'),controls=art.querySelector('.rose-targets');
 const reset=art.querySelector('.rose-reset'),visited=new Set();
 let ready=false,failed=false;let renderer,raf=0,last=0,visible=true,flight=null,gesture=null,hover=null,turn=0,bloom=0,age=0,awakened=false,activeTime=0;
 let recoil=0,recoilVelocity=0,openingPulse=false;const sparks=[],distantBlooms=[];
 const coreButton=document.createElement('button');coreButton.type='button';coreButton.className='bloom-heart-button';coreButton.textContent='f';coreButton.setAttribute('aria-label','Wake the flower');art.append(coreButton);coreButton.disabled=true;
 const caption=document.createElement('p');caption.className='bloom-invitation';caption.innerHTML='<span>nothing here grows alone</span>one petal. a whole new world.';stage.append(caption);
 const preview=document.createElement('div');preview.className='petal-preview';preview.setAttribute('aria-hidden','true');
 const previewKind=document.createElement('span'),previewName=document.createElement('strong'),previewCopy=document.createElement('p');preview.append(previewKind,previewName,previewCopy);stage.append(preview);
 hint.textContent='drag a petal to pick it';
 function fallback(){failed=true;ready=false;coreButton.disabled=false;art.classList.add('bloom-fallback');coreButton.setAttribute('aria-label','Explore the Florra worlds');coreButton.onclick=()=>document.querySelector('#worlds').scrollIntoView({behavior:pref.matches?'instant':'smooth'});caption.innerHTML='<span>a living garden</span>explore the worlds below.';}
 if(!T){fallback();return;}
 const cv=document.createElement('canvas');cv.className='enchanted-canvas';cv.setAttribute('aria-hidden','true');
 try{renderer=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true,powerPreference:'high-performance'});}catch{fallback();return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.84;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,80);camera.position.set(0,0,16);
 scene.add(new T.HemisphereLight(0xffead0,0x1b301d,.9));
 const key=new T.DirectionalLight(0xffe5ce,1.05);key.position.set(-4,6,8);scene.add(key);
 const rim=new T.DirectionalLight(0xffcf95,.5);rim.position.set(4,2,-2);scene.add(rim);
 const group=new T.Group();group.position.y=1.6;scene.add(group);
 const ring=new T.Group();group.add(ring);
 const loader=new T.TextureLoader();
 const texture=url=>new Promise((resolve,reject)=>loader.load(url,t=>{t.encoding=T.sRGBEncoding;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());resolve(t);},undefined,reject));
 const petals=[],projectPetals=[],buttons=[];let petalTexture;
 const ray=new T.Raycaster(),pointer=new T.Vector2(),projected=new T.Vector3();
 let tx=0,ty=0,mx=0,my=0;
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
 const damp=(a,b,dt,speed)=>a+(b-a)*(1-Math.exp(-dt*speed));
 function geometry(length,width,cup){
  const g=new T.PlaneGeometry(width,length,20,28),p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){
   const u=uv.getX(i)*2-1,v=uv.getY(i);
   p.setXYZ(i,u*width*.5,v*length,
    Math.sin(v*Math.PI)*length*.16+u*u*cup*Math.sin(v*Math.PI)-v*v*.35+u*Math.sin(v*Math.PI)*.07);
  }g.computeVertexNormals();return g;
 }
 function material(color=0xd6aba2){return new T.MeshStandardMaterial({map:petalTexture,color,side:T.DoubleSide,roughness:.86,metalness:0,transparent:false,alphaTest:.22,emissive:0x391509,emissiveIntensity:.025});}
 function petalLayer(n,length,width,z,offset,decorative){
  const geo=geometry(length,width,.58);
  for(let i=0;i<n;i++){
   const hold=new T.Group(),angle=i*Math.PI*2/n+offset;hold.rotation.z=angle;hold.position.z=z;ring.add(hold);
   const mesh=new T.Mesh(geo,material(decorative?0xd6bbb2:0xd6aba2));
   if(decorative&&length<2){mesh.material.color.set(0xffffff);mesh.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat pearl=dot(diffuseColor.rgb,vec3(.35,.45,.20));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(pearl*1.45,pearl*1.12,pearl*.78),.48);');};}
   hold.add(mesh);
   const p={mesh,hold,angle,slot:i,decorative,phase:i*1.7+offset,hot:0,yield:0,world:null,removed:false};
   petals.push(p);if(!decorative)projectPetals.push(p);
  }
 }
 function name(p){if(p?.world==null)return;const w=WORLDS[p.world];label.textContent=w.name;
  previewKind.textContent='world '+String(p.world+1).padStart(2,'0')+' / '+w.tag;previewName.textContent=w.name;previewCopy.textContent=w.one||w.status;
  preview.classList.add('on');stage.classList.add('petal-hovered');}
 function hoverPetal(p){if(hover===p)return;hover=p;if(p){name(p);if(typeof pluck==='function')pluck(p.world);}else{preview.classList.remove('on');stage.classList.remove('petal-hovered');label.classList.remove('on');}resume();}
 function syncGarden(){
  const ids=window.FlorraGarden?.ids();if(!ids)return;visited.clear();ids.forEach(id=>{const index=WORLDS.findIndex(w=>w.id===id);if(index>=0)visited.add(index);});
  if(ready&&!flight){hoverPetal(null);updateControls();resume();}
 }
 addEventListener('florra:garden-ready',syncGarden);addEventListener('florra:garden-change',syncGarden);
 function discovered(index){visited.add(index);window.FlorraGarden?.discover(WORLDS[index].id);}
 function updateControls(){
  const remaining=WORLDS.map((w,i)=>i).filter(i=>!visited.has(i));
  controls.replaceChildren();buttons.length=0;
  const assigned=new Set(projectPetals.filter(p=>!p.removed&&p.world!==null&&!visited.has(p.world)).map(p=>p.world));
  projectPetals.forEach((p,i)=>{
   if(p.removed||p.world===null||visited.has(p.world)){p.world=remaining.find(i=>!assigned.has(i))??null;if(p.world!==null)assigned.add(p.world);p.revealAt=activeTime;}
   p.removed=false;p.mesh.visible=p.world!==null;
   if(p.world===null)return;
   const b=document.createElement('button');b.type='button';b.className='bloom-project-target';b.setAttribute('aria-label','Pick a petal — '+WORLDS[p.world].name);
   b.addEventListener('focus',()=>hoverPetal(p));b.addEventListener('blur',()=>hoverPetal(null));
   b.addEventListener('click',e=>{if(e.detail===0)launch(p,0,0);});
   b.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button>0||gesture||flight)return;gesture={id:e.pointerId,p,x:e.clientX,y:e.clientY,dx:0,dy:0};b.setPointerCapture(e.pointerId);hoverPetal(p);awakened=true;});
   b.addEventListener('pointermove',e=>{if(gesture?.id===e.pointerId){gesture.dx=e.clientX-gesture.x;gesture.dy=e.clientY-gesture.y;}});
   b.addEventListener('pointerup',e=>{if(gesture?.id!==e.pointerId)return;const g=gesture;gesture=null;launch(p,e.clientX-g.x,e.clientY-g.y);});
   b.addEventListener('pointercancel',e=>{if(gesture?.id===e.pointerId)gesture=null;});controls.append(b);buttons.push({b,p});
  });
  reset.hidden=visited.size===0;reset.disabled=!!flight;
  if(remaining.length)coreButton.setAttribute('aria-label',visited.size?'Bloom again':awakened?'Let the flower rest':'Wake the flower');
  if(!remaining.length){hint.textContent='you explored the garden. bloom again.';coreButton.setAttribute('aria-label','Bloom again');}
 }
 function ensureProject(index){
  let p=projectPetals.find(p=>p.world===index&&!p.removed);if(p)return p;
  p=projectPetals.find(p=>p.removed||p.world===null)||projectPetals[0];p.world=index;p.removed=false;p.mesh.visible=true;return p;
 }
 function launch(p,dx,dy){
  if(flight||!p||p.world==null)return;
  const index=p.world;
  if(pref.matches){p.removed=true;p.mesh.visible=false;hoverPetal(null);discovered(index);updateControls();delete document.body.dataset.plucking;open(index);return;}
  scene.updateMatrixWorld(true);
  const clone=p.mesh.clone();p.mesh.matrixWorld.decompose(clone.position,clone.quaternion,clone.scale);scene.add(clone);
  flight={mesh:clone,start:clone.position.clone(),quaternion:clone.quaternion.clone(),scale:clone.scale.clone(),p,index,time:0,dx,dy,duration:Math.max(.8,1.12-Math.hypot(dx,dy)/650),
   angle:Math.hypot(dx,dy)>24?Math.atan2(-dy,dx):.65+(turn%3)*.3};
  p.removed=true;p.mesh.visible=false;reset.disabled=true;turn++;hoverPetal(null);hint.textContent='a world in every petal';coreButton.disabled=true;
  recoilVelocity=-2.2;releasePollen(clone.position,24);art.classList.add('is-picking');
  if(typeof pluck==='function')pluck(index);resume();
 }
 function finishFlight(){
  const f=flight;if(!f)return;scene.remove(f.mesh);flight=null;coreButton.disabled=false;reset.disabled=false;art.classList.remove('is-picking');discovered(f.index);
  updateControls();delete document.body.dataset.plucking;
  hint.textContent=visited.size===WORLDS.length?'you explored the garden. bloom again.':'pick another petal. discover another world.';
  open(f.index);
 }
 // A newer route always wins over a petal that is still in flight.
 function cancelInteraction(){
  if(!flight&&!gesture)return;
  const pointerId=gesture?.id;gesture=null;
  if(pointerId!==undefined)for(const target of [cv,...buttons.map(({b})=>b)]){if(target.hasPointerCapture(pointerId))target.releasePointerCapture(pointerId);}
  if(flight){scene.remove(flight.mesh);flight.p.removed=false;flight=null;}
  art.classList.remove('is-picking');delete document.body.dataset.plucking;coreButton.disabled=false;reset.disabled=false;hoverPetal(null);
  if(ready){updateControls();hint.textContent='drag a petal to pick it';resume();}
 }
 addEventListener('popstate',cancelInteraction);addEventListener('hashchange',cancelInteraction);
 function pick(e){
  const r=cv.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);
  return ray.intersectObjects(projectPetals.filter(p=>p.world!==null&&!p.removed).map(p=>p.mesh)).map(h=>({h,p:projectPetals.find(p=>p.mesh===h.object)})).find(({h})=>h.uv.x>.16&&h.uv.x<.86&&h.uv.y>.18&&h.uv.y<.87)?.p||null;
 }
 cv.addEventListener('pointermove',e=>{
  const r=cv.getBoundingClientRect();tx=clamp((e.clientX-r.left)/r.width*2-1,-1,1);ty=clamp((e.clientY-r.top)/r.height*2-1,-1,1);
  if(gesture){if(gesture.id!==e.pointerId)return;gesture.dx=e.clientX-gesture.x;gesture.dy=e.clientY-gesture.y;return;}
  if(e.pointerType!=='touch')hoverPetal(pick(e));cv.style.cursor=hover?'grab':'default';
 });
 cv.addEventListener('pointerleave',()=>{if(!gesture){hoverPetal(null);tx=ty=0;}});
 cv.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button>0||gesture||flight)return;const p=pick(e);if(!p)return;
  gesture={id:e.pointerId,p,x:e.clientX,y:e.clientY,dx:0,dy:0};cv.setPointerCapture(e.pointerId);hoverPetal(p);awakened=true;
 });
 cv.addEventListener('pointerup',e=>{if(gesture?.id!==e.pointerId)return;const g=gesture;gesture=null;if(cv.hasPointerCapture(e.pointerId))cv.releasePointerCapture(e.pointerId);launch(g.p,e.clientX-g.x,e.clientY-g.y);});
 cv.addEventListener('pointercancel',e=>{if(gesture?.id===e.pointerId)gesture=null;});
 function rebloom(){if(flight)return;hoverPetal(null);visited.clear();projectPetals.forEach(p=>{p.world=null;p.removed=true;});age=0;bloom=0;openingPulse=false;sparks.length=0;awakened=true;window.FlorraGarden?.reset();updateControls();hint.textContent='drag a petal to pick it';resume();}
 reset.addEventListener('click',rebloom);
 coreButton.addEventListener('click',()=>{if(!ready)return;if(visited.size){rebloom();return;}awakened=!awakened;coreButton.setAttribute('aria-label',awakened?'Let the flower rest':'Wake the flower');resume();});
 window.__pluckProject=index=>{
  if(!ready||failed){open(index);return;}
  if(flight)return;if(visited.has(index)){open(index);return;}
  document.body.dataset.plucking='true';close(false);stage.scrollIntoView({behavior:'instant',block:'start'});launch(ensureProject(index),0,0);
 };
 function fit(){const w=art.clientWidth,h=art.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=Math.max(16,10.5/camera.aspect);camera.updateProjectionMatrix();resume();}
 const particlesGeometry=new T.BufferGeometry(),particlePositions=new Float32Array(48*3),seeds=[];
 for(let i=0;i<48;i++){seeds.push({x:Math.sin(i*17.1)*5,y:(i/48)*14-7,z:-2+Math.cos(i*7.3)*2,speed:.06+(i%7)*.014});}
 particlesGeometry.setAttribute('position',new T.BufferAttribute(particlePositions,3));
 const dust=new T.Points(particlesGeometry,new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  vertexShader:'varying float v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(60./-p.z,2.,6.);v=.48;}',
  fragmentShader:'varying float v;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.08,d);gl_FragColor=vec4(1.,.79,.43,a*v);}' }));scene.add(dust);
 const sparkPositions=new Float32Array(96*3),sparkLife=new Float32Array(96),sparkGeometry=new T.BufferGeometry();
 sparkGeometry.setAttribute('position',new T.BufferAttribute(sparkPositions,3));sparkGeometry.setAttribute('life',new T.BufferAttribute(sparkLife,1));
 const pollen=new T.Points(sparkGeometry,new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  vertexShader:'attribute float life;varying float a;void main(){a=life;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(100./-p.z,2.,10.)*life;}',
  fragmentShader:'varying float a;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(1.,.72,.32,smoothstep(.5,.02,d)*a*.7);}' }));scene.add(pollen);
 function releasePollen(origin,count){if(pref.matches)return;for(let i=0;i<count;i++){const a=i*2.399+turn,z=Math.sin(i*7.1);sparks.push({p:origin.clone(),v:new T.Vector3(Math.cos(a)*(1+i%3),Math.sin(a)*(1+i%3)+1,z*1.5),life:1});}if(sparks.length>96)sparks.splice(0,sparks.length-96);}
 let halo,outerHalo;
 function draw(now){
  raf=0;if(!ready||failed)return;if(pref.matches&&flight){finishFlight();return;}if(!visible||document.hidden||panel.classList.contains('open')){last=0;return;}
  const dt=Math.min(.05,last?(now-last)/1000:.016);last=now;activeTime+=dt;age+=dt;
  const t=activeTime,reduced=pref.matches,progress=clamp(age/2.8),intro=progress*progress*(3-2*progress);
  const target=reduced?.9:clamp(intro*(awakened?1:.79)+Math.min(.16,scrollY/innerHeight*.2));
  bloom=reduced?target:damp(bloom,target,dt,5);
  mx=damp(mx,tx,dt,4);my=damp(my,ty,dt,4);
  recoilVelocity+=(-recoil*38-recoilVelocity*7)*dt;recoil+=recoilVelocity*dt;
  group.rotation.y=reduced?0:mx*.21+Math.sin(t*.28)*.025;group.rotation.x=reduced?-.06:-.06-my*.13+recoil*.4;
  group.rotation.z=reduced?0:recoil*.17;
  art.style.setProperty('--stem-sway',reduced?'0deg':(-mx*.85+recoil*3).toFixed(3)+'deg');
  group.scale.setScalar(reduced?1:1+Math.sin(t*.8)*.008);
  ring.rotation.z=reduced?0:Math.sin(t*.13)*.025+(1-intro)*-.3;
  for(const p of petals){
   const hot=p===hover||gesture?.p===p;p.hot=damp(p.hot,hot?1:0,dt,9);
   const neighbor=hover&&!p.decorative&&p!==hover&&Math.abs(Math.atan2(Math.sin(p.angle-hover.angle),Math.cos(p.angle-hover.angle)))<1.1;
   p.yield=damp(p.yield,neighbor?1:0,dt,5);
   const lag=p.decorative?.08+p.slot*.022:p.slot*.02;
   const open=clamp((bloom-lag)*1.22);
   const sway=reduced?0:Math.sin(t*.65+p.phase)*.025;
   p.mesh.rotation.x=(1.43-(p.decorative?.84:1.19)*open)+sway-p.hot*.23+p.yield*.07+recoil*Math.sin(p.phase)*.12;
   p.mesh.rotation.y=(p.decorative?.18:.05)+Math.sin(p.phase)*.045+p.yield*.07;
   p.mesh.rotation.z=reduced?0:Math.sin(t*.38+p.phase)*.016;
   const emerging=reduced?1:clamp((activeTime-(p.revealAt??-10))/.75);
   p.mesh.scale.setScalar((.72+open*.28+p.hot*.035)*Math.max(.015,1-Math.pow(1-emerging,3)));
   p.mesh.position.z=p.hot*.20-p.yield*.055;
   if(gesture?.p===p){p.mesh.position.z+=Math.min(.65,Math.hypot(gesture.dx,gesture.dy)/160);p.mesh.rotation.y+=clamp(gesture.dx/450,-.2,.2);}
   p.mesh.material.emissiveIntensity=.018+p.hot*.12;
  }
  halo.material.opacity=reduced?.12:.13+Math.sin(t*.7)*.025;
  outerHalo.material.opacity=reduced?0:(age<3.4?Math.sin(clamp((age-1.1)/2.3)*Math.PI)*.14:0);
  outerHalo.scale.setScalar(1+clamp((age-1.1)/2.3)*2.6);
  if(!openingPulse&&age>1.75){openingPulse=true;releasePollen(new T.Vector3(0,1.6,2),32);}
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.life-=dt*.57;s.v.y-=dt*.4;s.p.addScaledVector(s.v,dt);s.v.multiplyScalar(Math.exp(-dt*.7));if(s.life<=0)sparks.splice(i,1);}
  sparkLife.fill(0);sparks.forEach((s,i)=>{sparkPositions[i*3]=s.p.x;sparkPositions[i*3+1]=s.p.y;sparkPositions[i*3+2]=s.p.z;sparkLife[i]=reduced?0:s.life;});sparkGeometry.attributes.position.needsUpdate=true;sparkGeometry.attributes.life.needsUpdate=true;
  distantBlooms.forEach((flower,i)=>{flower.material.rotation=reduced?0:Math.sin(t*.4+i)*.025;});
  for(let i=0;i<seeds.length;i++){const s=seeds[i];particlePositions[i*3]=s.x+(reduced?0:Math.sin(t*.2+i)*.16);particlePositions[i*3+1]=reduced?s.y:((s.y+7+t*s.speed)%14)-7;particlePositions[i*3+2]=s.z;}
  particlesGeometry.attributes.position.needsUpdate=true;
  if(flight){const f=flight;f.time+=dt;const u=clamp(f.time/f.duration),pull=clamp(u/.42),ease=1-Math.pow(1-pull,3),throwP=Math.max(0,(u-.42)/.58),travel=throwP*throwP;
   f.mesh.position.copy(f.start);f.mesh.position.z+=ease*5-travel*3;f.mesh.position.x+=Math.cos(f.angle)*travel*15;f.mesh.position.y+=ease*.4+Math.sin(f.angle)*travel*12-travel*travel*5;
   f.mesh.quaternion.copy(f.quaternion);f.mesh.rotateY(ease*.5+travel*3.8);f.mesh.rotateZ(travel*(f.dx<0?-3:3));f.mesh.scale.copy(f.scale).multiplyScalar(1+ease*.12-throwP*.2);
   if(u>.18&&u<.8&&Math.floor(f.time*40)!==f.sparkTick){f.sparkTick=Math.floor(f.time*40);releasePollen(f.mesh.position,1);}if(u===1)finishFlight();
  }
  scene.updateMatrixWorld(true);
  for(const {b,p} of buttons){projected.set(0,2.05,.1);p.mesh.localToWorld(projected);projected.project(camera);b.style.left=((projected.x+1)*50)+'%';b.style.top=((-projected.y+1)*50)+'%';b.disabled=!!flight||p.removed;}
  projected.set(0,0,1.8);group.localToWorld(projected);projected.project(camera);coreButton.style.left=((projected.x+1)*50)+'%';coreButton.style.top=((-projected.y+1)*50)+'%';
  renderer.render(scene,camera);
  if(!reduced&&!panel.classList.contains('open'))raf=requestAnimationFrame(draw);
 }
 function resume(){if(ready&&!failed&&visible&&!document.hidden&&!panel.classList.contains('open')&&!raf)raf=requestAnimationFrame(draw);}
 Promise.all([texture('/assets/rose-petal.png'),texture('/assets/rose-botanical.png')]).then(([petalTex,roseTex])=>{
  petalTexture=petalTex;
  petalLayer(6,3.8,3.0,-.18,.05,false);petalLayer(5,2.8,2.4,.35,.55,true);petalLayer(3,1.8,1.6,.74,.95,true);
  const center=new T.Mesh(new T.PlaneGeometry(2.05,2.05),new T.ShaderMaterial({uniforms:{map:{value:roseTex}},transparent:true,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D map;varying vec2 vUv;void main(){vec4 c=texture2D(map,vec2(.38+vUv.x*.34,.66+vUv.y*.25));float a=1.-smoothstep(.34,.5,length(vUv-.5));gl_FragColor=vec4(c.rgb,c.a*a);}' }));center.position.z=1.55;group.add(center);
  halo=new T.Mesh(new T.RingGeometry(.99,1.006,80),new T.MeshBasicMaterial({color:0xd6bc7d,transparent:true,opacity:.13,side:T.DoubleSide,depthWrite:false}));halo.position.z=1.62;group.add(halo);
  outerHalo=new T.Mesh(new T.RingGeometry(.99,1.002,100),halo.material.clone());outerHalo.position.z=.2;group.add(outerHalo);
  for(let i=0;i<9;i++){const flower=new T.Sprite(new T.SpriteMaterial({map:roseTex,color:0x7b8761,transparent:true,opacity:.36,depthWrite:false}));const s=.32+(i%3)*.11;flower.position.set((i-4)*2.35,-3.6+Math.sin(i*2.1)*.26,-6-i%3);flower.scale.set(s*.66,s,1);scene.add(flower);distantBlooms.push(flower);}
  art.prepend(cv);art.classList.add('enchanted-ready');ready=true;coreButton.disabled=false;syncGarden();updateControls();fit();
  new ResizeObserver(fit).observe(art);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();},{rootMargin:'50px'}).observe(stage);
  new MutationObserver(()=>{if(panel.classList.contains('open'))cancelInteraction();resume();}).observe(panel,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',resume);pref.addEventListener('change',resume);
  resume();
 }).catch(()=>{renderer.dispose();fallback();});
})();
