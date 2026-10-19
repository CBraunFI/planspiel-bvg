// 3D-Spielbrett für die Vorstellungsseite: langsam rotierender Tisch mit Brett, Karten, Figuren, Chips und Würfeln.
// Beschriftungen und Karten kommen aus SZENARIEN (js/website.js) und werden beim Szenario-Wechsel neu gezeichnet.
// Three.js r128 (global THREE). Ohne WebGL zeigt die Seite einen Hinweis statt der Szene.

window.Brett3D=(function(){
  const canvas=document.getElementById('brett3d');
  if(!canvas||!window.THREE)return null;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true})}catch(e){document.getElementById('scene-fallback').hidden=false;canvas.hidden=true;return null}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputEncoding=THREE.sRGBEncoding;

  const INK='#241f1b',PAPER='#f3eadb',PAPER2='#e9dcc0',WOOD=0x8a5a2d,WOOD2=0x6e4522,MUST='#d0a033';
  const TYPECOL={'Störung':'#b8452b','Team':'#2f6f6a','Politik':'#6a4c93','Chance':'#6f7040'};
  const ROLECOL=['#2f6f6a','#b8452b','#6a4c93','#6f7040'];
  const HAND='"Shantell Sans", cursive, sans-serif';

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,0.1,100);
  camera.position.set(0,12.5,14.5);camera.lookAt(0,-0.6,0.6);

  scene.add(new THREE.HemisphereLight(0xfff4e0,0x8a7a60,0.85));
  const sun=new THREE.DirectionalLight(0xfff1dc,0.9);sun.position.set(6,12,5);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-9;sun.shadow.camera.right=9;sun.shadow.camera.top=9;sun.shadow.camera.bottom=-9;sun.shadow.bias=-0.0008;
  scene.add(sun);

  const table=new THREE.Group();scene.add(table);

  // Tischplatte (Schatten fangen)
  const tabletop=new THREE.Mesh(new THREE.CylinderGeometry(9.5,9.5,0.3,64),new THREE.MeshStandardMaterial({color:0xcdb68a,roughness:0.95}));
  tabletop.position.y=-0.45;tabletop.receiveShadow=true;table.add(tabletop);

  // ---------- Canvas-Texturen ----------
  function makeTex(w,h,draw){
    const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
  }
  function rrect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
  function wrap(g,text,x,y,maxW,lh,maxLines){const words=text.split(' ');let line='',lines=[];for(const w of words){const t=line?line+' '+w:w;if(g.measureText(t).width>maxW&&line){lines.push(line);line=w}else line=t}lines.push(line);if(maxLines&&lines.length>maxLines){lines=lines.slice(0,maxLines);lines[maxLines-1]=lines[maxLines-1].replace(/\s*\S*$/,' …')}lines.forEach((l,i)=>g.fillText(l,x,y+i*lh));return lines.length}

  // Brettoberfläche: Rundenleiste links, zwei Leisten in der Mitte, Stapelfelder rechts
  function boardTexture(s){
    return makeTex(2048,1280,(g,W,H)=>{
      g.fillStyle=PAPER;g.fillRect(0,0,W,H);
      g.strokeStyle='rgba(36,31,27,.05)';g.lineWidth=2;for(let x=0;x<W;x+=76){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}
      g.fillStyle=INK;g.textBaseline='top';
      // Titel
      g.font=`800 54px ${HAND}`;g.fillText(s.bereich,70,54);
      g.font=`600 30px ${HAND}`;g.fillStyle='#5a4d42';g.fillText(s.projekt+'   ·   eine Runde = ein '+s.runde,70,120);
      // Rundenleiste
      const rx=70,ry=230,rw=420,cell=96;
      g.fillStyle='#5a4d42';g.font=`800 26px ${HAND}`;g.fillText((s.runde.toUpperCase())+'N',rx,ry-40);
      for(let i=0;i<4;i++){const y=ry+i*(cell+14);g.fillStyle=i===1?'#fff2cf':PAPER2;g.strokeStyle=INK;g.lineWidth=5;rrect(g,rx,y,rw,cell,10);g.fill();g.stroke();
        g.fillStyle=INK;g.font=`800 40px ${HAND}`;g.fillText(String(i+1),rx+20,y+24);g.font=`600 24px ${HAND}`;g.fillStyle='#5a4d42';g.fillText(s.runde+' '+(i+1),rx+70,y+34)}
      // Leisten
      const tx=580,tw=1140;
      function track(y,label,n,colorFn){g.fillStyle=INK;g.font=`800 34px ${HAND}`;g.fillText(label,tx,y-50);const cw=(tw-(n-1)*10)/n;
        for(let i=0;i<n;i++){const x=tx+i*(cw+10);g.fillStyle=colorFn(i);g.strokeStyle=INK;g.lineWidth=5;rrect(g,x,y,cw,120,10);g.fill();g.stroke();g.fillStyle='#5a4d42';g.font=`800 24px ${HAND}`;g.fillText(String(i),x+10,y+6)}}
      track(300,'VERTRAUEN DER LEITUNG',11,i=>i===0?'#c98a78':i<=3?'#f3d3c8':'#dfe9e4');
      track(560,'PROJEKT  ·  '+s.projekt.toUpperCase(),9,i=>i<3?'#ece6c9':i<6?'#dfe3c2':'#cdd4a6');
      g.fillStyle=MUST;g.font=`800 44px ${HAND}`;[3,6].forEach(m=>{const cw=(tw-80)/9;g.fillText('★',tx+m*(cw+10)+cw-48,560+62)});
      g.font=`600 24px ${HAND}`;g.fillStyle='#5a4d42';g.fillText('Anlauf',tx,700);g.fillText('Kernarbeit',tx+3*(tw/9),700);g.fillText('Abschluss',tx+6*(tw/9),700);
      // Stapelfelder
      const sy=820;[['EREIGNISSE',580],['ABLAGE',840],[s.nachbar.toUpperCase(),1100],['PUFFER',1460]].forEach(([l,x])=>{g.setLineDash([14,10]);g.strokeStyle='#8c7d6b';g.lineWidth=5;rrect(g,x,sy,220,300,14);g.stroke();g.setLineDash([]);g.fillStyle='#5a4d42';g.font=`800 22px ${HAND}`;wrap(g,l,x+16,sy+16,190,26,2)});
      g.fillStyle=s.akzent;rrect(g,W-110,70,40,40,20);g.fill();
      g.fillStyle='#5a4d42';g.font=`600 24px ${HAND}`;g.textAlign='right';g.fillText(s.vorstand+' ruft jede Runde an',W-130,80);g.textAlign='left';
    });
  }
  function cardTexture(k){
    return makeTex(512,720,(g,W,H)=>{
      g.fillStyle=PAPER;rrect(g,0,0,W,H,28);g.fill();g.strokeStyle=INK;g.lineWidth=12;rrect(g,6,6,W-12,H-12,24);g.stroke();
      g.fillStyle=TYPECOL[k.type]||INK;g.fillRect(12,12,W-24,88);g.fillStyle=INK;g.fillRect(12,100,W-24,8);
      g.fillStyle=PAPER;g.font=`800 36px ${HAND}`;g.textBaseline='middle';g.fillText(k.type.toUpperCase(),40,56);
      // Hürde
      g.fillStyle=PAPER;rrect(g,W-110,22,70,70,14);g.fill();g.setLineDash([10,6]);g.strokeStyle='#b8452b';g.lineWidth=6;rrect(g,W-110,22,70,70,14);g.stroke();g.setLineDash([]);
      g.fillStyle='#b8452b';g.font=`800 40px ${HAND}`;g.textAlign='center';g.fillText(String(k.diff||6),W-75,60);
      // Bildfeld
      g.fillStyle=PAPER2;rrect(g,W/2-90,150,180,180,20);g.fill();g.strokeStyle=INK;g.lineWidth=7;rrect(g,W/2-90,150,180,180,20);g.stroke();
      g.strokeStyle=INK;g.lineWidth=10;g.lineCap='round';g.beginPath();g.moveTo(W/2-60,270);g.lineTo(W/2-20,220);g.lineTo(W/2+10,260);g.lineTo(W/2+60,200);g.stroke();
      g.fillStyle=INK;g.font=`800 44px ${HAND}`;g.textBaseline='top';wrap(g,k.title,W/2,370,W-70,50,3);
      g.textAlign='left';g.fillStyle='#5a4d42';g.font=`600 24px ${HAND}`;g.setLineDash([8,8]);g.strokeStyle='#8c7d6b';g.lineWidth=4;g.beginPath();g.moveTo(30,H-110);g.lineTo(W-30,H-110);g.stroke();g.setLineDash([]);
      g.fillText('liegen lassen:  Vertrauen −2',40,H-80);
    });
  }
  const backTex=makeTex(512,720,(g,W,H)=>{g.fillStyle='#6e4522';rrect(g,0,0,W,H,28);g.fill();g.strokeStyle=INK;g.lineWidth=12;rrect(g,6,6,W-12,H-12,24);g.stroke();g.setLineDash([16,12]);g.strokeStyle=MUST;g.lineWidth=8;rrect(g,50,50,W-100,H-100,16);g.stroke();g.setLineDash([]);g.fillStyle=MUST;g.font=`800 120px ${HAND}`;g.textAlign='center';g.textBaseline='middle';g.fillText('?',W/2,H/2)});
  const dieTex=makeTex(256,256,(g,W,H)=>{g.fillStyle=PAPER;g.fillRect(0,0,W,H);g.strokeStyle=INK;g.lineWidth=14;rrect(g,8,8,W-16,H-16,40);g.stroke();g.fillStyle=INK;[[72,72],[184,72],[72,184],[184,184],[128,128]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,22,0,7);g.fill()})});

  // ---------- Geometrie ----------
  const boardW=10,boardD=6.25,boardH=0.28;
  const frame=new THREE.Mesh(new THREE.BoxGeometry(boardW+0.5,boardH,boardD+0.5),new THREE.MeshStandardMaterial({color:WOOD,roughness:0.8}));
  frame.position.y=-0.3+boardH/2;frame.castShadow=true;frame.receiveShadow=true;table.add(frame);
  const inner=new THREE.Mesh(new THREE.BoxGeometry(boardW+0.2,0.02,boardD+0.2),new THREE.MeshStandardMaterial({color:WOOD2,roughness:0.8}));
  inner.position.y=-0.3+boardH+0.01;table.add(inner);
  const boardMat=new THREE.MeshStandardMaterial({roughness:0.9});
  const board=new THREE.Mesh(new THREE.BoxGeometry(boardW,0.03,boardD),boardMat);
  board.position.y=-0.3+boardH+0.03;board.receiveShadow=true;table.add(board);
  const top=board.position.y+0.015;

  // Brettkoordinaten (Textur 2048×1280) in Weltkoordinaten
  const bx=u=>(u/2048-0.5)*boardW,bz=v=>(v/1280-0.5)*boardD;

  // Karten
  const cardMats=[];
  function card(x,z,rot,faceUp,tex){
    const geo=new THREE.BoxGeometry(1.1,0.025,1.55);
    const side=new THREE.MeshStandardMaterial({color:0xf3eadb,roughness:0.9});
    const face=new THREE.MeshStandardMaterial({map:faceUp?tex:backTex,roughness:0.85});
    const m=new THREE.Mesh(geo,[side,side,face,side,side,side]);
    m.position.set(x,top+0.013,z);m.rotation.y=rot;m.castShadow=true;m.receiveShadow=true;table.add(m);
    if(faceUp)cardMats.push(face);return m;
  }
  // Ereignisstapel
  for(let i=0;i<7;i++){const m=card(bx(690),bz(970),(i%2?0.03:-0.03)*(i+1),false);m.position.y=top+0.013+i*0.026}
  // Ablage (eine verdeckte Karte, verschoben)
  card(bx(950),bz(980),0.18,false);
  // Offene Karten auf dem Tisch, zwischen den Leisten und dem Vorderrand
  const openPos=[[bx(1160),bz(990),-0.12],[bx(1400),bz(1000),0.08],[bx(1650),bz(980),-0.06],[bx(1870),bz(1010),0.14]];
  const openCards=openPos.map(([x,z,r])=>card(x,z,r,true,backTex));

  // Figuren (Leisten) und Rollenfiguren
  function pawn(color,scale){
    const g=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color,roughness:0.55});
    const base=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.26,0.1,24),mat);base.position.y=0.05;
    const body=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.5,24),mat);body.position.y=0.35;
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.15,24,16),mat);head.position.y=0.68;
    [base,body,head].forEach(p=>{p.castShadow=true;g.add(p)});g.scale.setScalar(scale||1);return g;
  }
  const pawnV=pawn(0x2f6f6a);pawnV.position.set(bx(580+6*(1140/11)+50),top,bz(360));table.add(pawnV);
  const pawnP=pawn(0x6f7040);pawnP.position.set(bx(580+2*(1140/9)+60),top,bz(620));table.add(pawnP);
  // Vier Rollenfiguren am Brettrand, wie Spieler:innen an ihren Plätzen
  const seats=[[-4.2,3.9],[-1.4,3.9],[1.4,3.9],[4.2,3.9]];
  seats.forEach(([x,z],i)=>{const p=pawn(new THREE.Color(ROLECOL[i]).getHex(),1.25);p.position.set(x,-0.3,z);table.add(p);
    const t=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.04,1.3),new THREE.MeshStandardMaterial({color:0xf3eadb,roughness:0.9}));t.position.set(x,-0.28,z+0.1);t.receiveShadow=true;table.add(t);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.045,0.18),new THREE.MeshStandardMaterial({color:new THREE.Color(ROLECOL[i])}));stripe.position.set(x,-0.275,z-0.55);table.add(stripe)});
  // Chips
  const chipMat=new THREE.MeshStandardMaterial({color:0xd0a033,roughness:0.5});
  function chip(x,y,z){const c=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.06,28),chipMat);c.position.set(x,y,z);c.castShadow=true;table.add(c)}
  seats.forEach(([x,z])=>{for(let i=0;i<3;i++)chip(x-0.8+i*0.42,-0.23,z+0.5)});
  [[0,0],[0.1,1],[-0.05,2]].forEach(([dx,i])=>chip(bx(1570)+dx,top+0.03+i*0.065,bz(970)));
  chip(bx(1250),top+0.03,bz(1100));chip(bx(1330),top+0.03,bz(1130));
  // Puffer-Schale
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.4,0.22,32,1,true),new THREE.MeshStandardMaterial({color:0xd6c9a8,roughness:0.9,side:THREE.DoubleSide}));
  bowl.position.set(bx(1570),top+0.11,bz(970));table.add(bowl);
  // Würfel
  const dieMat=new THREE.MeshStandardMaterial({map:dieTex,roughness:0.6});
  [[bx(1800),bz(760),0.4],[bx(1880),bz(830),1.1]].forEach(([x,z,r])=>{const d=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.36,0.36),dieMat);d.position.set(x,top+0.18,z);d.rotation.y=r;d.castShadow=true;table.add(d)});
  // Sanduhr
  const glass=new THREE.MeshStandardMaterial({color:0xe9f2f0,roughness:0.2,transparent:true,opacity:0.6});
  const hg=new THREE.Group();[0.28,-0.28].forEach(dy=>{const c=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.5,20),glass);c.position.y=dy;c.rotation.x=dy>0?Math.PI:0;hg.add(c)});
  [0.55,-0.55].forEach(dy=>{const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.24,0.05,20),new THREE.MeshStandardMaterial({color:WOOD2}));cap.position.y=dy;hg.add(cap)});
  hg.position.set(bx(1950),top+0.58,bz(460));hg.children.forEach(c=>c.castShadow=true);table.add(hg);

  // ---------- Szenario-Wechsel ----------
  let bump=0;
  function setScene(s){
    if(boardMat.map)boardMat.map.dispose();boardMat.map=boardTexture(s);boardMat.needsUpdate=true;
    s.karten.forEach((k,i)=>{const m=cardMats[i];if(!m)return;if(m.map&&m.map!==backTex)m.map.dispose();m.map=cardTexture(k);m.needsUpdate=true});
    inner.material.color.set(s.akzent).lerp(new THREE.Color(WOOD2),0.55);
    bump=1;
  }

  // ---------- Animation ----------
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let auto=reduced?0:0.09,angle=0.35,drag=null,visible=true,last=performance.now();
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,a:angle};canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{if(drag)angle=drag.a+(e.clientX-drag.x)*0.008});
  canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
  new IntersectionObserver(en=>visible=en[0].isIntersecting,{threshold:0.05}).observe(canvas);
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;if(canvas.width!==Math.floor(w*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}
  function frameLoop(now){
    requestAnimationFrame(frameLoop);if(!visible)return;const dt=Math.min(0.05,(now-last)/1000);last=now;resize();
    if(!drag)angle+=auto*dt;table.rotation.y=angle;
    if(bump>0){bump=Math.max(0,bump-dt*2.2);const s=1+Math.sin(bump*Math.PI)*0.03;openCards.forEach(c=>{c.position.y=top+0.013+Math.sin(bump*Math.PI)*0.25});table.scale.setScalar(s)}
    renderer.render(scene,camera);
  }
  requestAnimationFrame(frameLoop);

  // Erst zeichnen, wenn die Handschrift geladen ist, sonst steht Fallback-Schrift auf den Texturen
  const api={setScene(s){api.current=s;setScene(s)},current:null};
  if(document.fonts&&document.fonts.load){document.fonts.load(`800 40px "Shantell Sans"`).then(()=>{if(api.current)setScene(api.current)}).catch(()=>{})}
  return api;
})();
// Falls website.js schon ein Szenario gesetzt hat, bevor die Szene stand:
if(window.Brett3D&&typeof SZENARIEN!=='undefined'&&typeof currentScene!=='undefined')Brett3D.setScene(SZ(currentScene));
