// ---------- Auto-Sim zum Balancing ----------
// Spielt Partien ohne Oberfläche durch. Lernkarten, Puffer, Überstunden und Flurfunk bleiben außen vor.
function simulate(n,strat,s){
  const res={games:n,won:0,lostStanding:0,avgProject:0,avgStanding:0,rolls:0,ones:0,succ:0,fails:0,projectReached:0,follow:0};
  const tw=s.dice==='2d6';const d6=()=>1+Math.floor(Math.random()*6);
  const rollFn=()=>{const d=tw?[d6(),d6()]:[d6()];return{t:d.reduce((a,b)=>a+b,0),f:d.every(x=>x===1),c:d.every(x=>x===6)}};
  const thr=tw?7:4;const ev=String(s.events).split(',').map(x=>+x||1);const pdA=String(s.pd).split(',').map(x=>+x);const pd=pr=>(pdA[pr<3?0:pr<6?1:2]||[4,5,7][pr<3?0:pr<6?1:2])+(tw?3:0);const bereit=s.bereit+(tw?3:0);
  const wp=s.wagnisPlus||0;
  for(let g=0;g<n;g++){
    let lern=0;let deck=buildDeck();mapDifficulty(deck,s);let discard=[],open=[],standing=s.standingStart,project=0,restr=false,sched=[],debt=0,ms=[];
    const draw=(card)=>{let e;if(card){e=mkCard(card);mapDifficulty([e],s);res.follow++}else{if(!deck.length){deck=shuffle(discard);discard=[]}if(!deck.length)return;e=deck.shift()}if(e.id===8)e.diff+=debt;open.push(e)};
    const eigs=shuffle(EIGENARTEN.map(x=>x.key));
    const pl=ROLES.map((r,i)=>({...r,chips:s.chips,extra:0,eig:s.eigenarten?eigs[i]:null,exh:0,out:false}));
    const setSt=v=>{standing=Math.max(0,Math.min(s.standingMax,v))};
    const setPr=v=>{const from=project;project=Math.max(0,Math.min(s.projectTarget,v));if(s.kopplung)MILESTONES.forEach(m=>{if(from<m&&project>=m&&!ms.includes(m)){ms.push(m);setSt(standing+1)}})};
    const base=(p,e)=>{let b=0;const k=p.eig;
      if(e){if(FOCUS_MATCH[p.focus].includes(e.type)||(p.abilityKey==='standby'&&e.type==='Störung'))b+=2}
      else{b+=(p.focus==='Projekt'?2:0)-open.filter(x=>x.type==='Störung').length;if(s.kopplung&&standing<=SKEPSIS)b--}
      if(k==='perfekt')b--;if(k==='hase'&&e&&e.id>=100)b+=2;if(k==='folien'&&e&&e.type==='Störung')b--;if(k==='sinn'&&e&&e.type==='Störung')b--;if(k==='hase'&&e&&e.type==='Chance')b--;
      if(k==='zahlen'&&e)b+=e.type==='Politik'?1:e.type==='Team'?-2:0;if(k==='kaffee'&&e)b+=e.type==='Team'?2:e.type==='Politik'?-1:0;
      return b};
    for(let round=1;round<=s.rounds;round++){
      for(let k=0;k<(ev[Math.min(round,ev.length)-1]||1);k++)draw();
      sched.filter(x=>x.round<=round).forEach(x=>draw(CARD(x.card)));sched=sched.filter(x=>x.round>round);
      const heavy=open.filter(e=>e.type!=='Chance').length;const pAtStart=project;
      pl.forEach(p=>{p.side=p.focus==='Projekt'?'project':p.focus==='Team'&&heavy<2?'project':'standing';p.noPair=false;p.done=false;p.acted=false;p.helps=0;p.used=false});
      let critUsed=false,acted=true,pActed=false,sActed=false;
      const crit=()=>{if(!s.critOnce||!critUsed){setSt(standing+1);critUsed=true}};
      const after=r=>{if(r.c)crit();if(r.f){res.ones++;draw()}};
      const help=h=>{h.helps++;if(h.eig==='neinsagen'&&h.helps%2===0)h.exh++};
      const applyFx=(p,o,e)=>{if(o.standing)setSt(standing+o.standing);if(o.project)setPr(project+o.project);if(o.chipsAll)pl.forEach(x=>x.chips+=o.chipsAll);if(o.later)sched.push({round:round+o.later.delay,card:o.later.card});if(o.nachbar){debt++;const c8=open.find(x=>x.id===8);if(c8)c8.diff++;if(!deck.some(x=>x.id===8)&&!c8)sched.push({round:round+1,card:109})}if(o.noPair){const t=pl.find(x=>x.key===o.noPair);if(t)t.noPair=true}if(o.endRound)p.done=true;if(o.nextChips)p.extra+=o.nextChips;if(o.escalateNow&&e){e.diff++;setSt(standing-(s.escPen||1))}if(o.resolve&&e&&open.includes(e)){open=open.filter(x=>x!==e);if(e.id<100)discard.push(e)}};
      while(acted){acted=false;
        for(const p of pl){
          if(p.chips<1||p.done||p.out)continue;
          const matchCard=open.find(e=>FOCUS_MATCH[p.focus].includes(e.type)||(p.abilityKey==='standby'&&e.type==='Störung'));
          const target=p.side==='standing'?(matchCard||open[0]||null):null;
          const helper=()=>pl.find(x=>x!==p&&x.chips>0&&x.side===p.side&&!x.noPair&&!x.out);
          if(p.side==='standing'&&!target){p.chips--;acted=true;p.acted=true;sActed=true;const r=rollFn();res.rolls++;if(r.t+(p.eig==='perfekt'?-1:0)>=bereit)setSt(standing+1);after(r);continue}
          const e=target;const list=e?e.opts:PROJECT_OPTS.filter(x=>!(x.id==='s'&&p.eig==='perfekt')).map(x=>({...x,chips:x.id==='g'?(project>=6?3:2)+(p.eig==='perfekt'?1:0):x.chips,project:x.id==='g'&&p.eig==='perfekt'?2:x.project}));
          const cost=o=>{let c=o.chips||1;if(e&&!o.payer){if(p.eig==='delegier'&&e.to===p.key&&!o.roll)c++;}return c};
          const payerOf=o=>o.payer&&o.payer!==p.key?pl.find(x=>x.key===o.payer):p;
          const afford=o=>{const py=payerOf(o);if(py!==p)return py.chips>=cost(o)&&!py.out;const h=helper();return p.chips+(h&&cost(o)>=2&&!o.roll?1:0)>=cost(o)};
          let det=list.filter(o=>!o.roll&&afford(o)),wag=list.filter(o=>o.roll&&afford(o));
          if(p.eig==='bauch'&&!p.acted&&wag.length)det=[];
          let o=null;
          if(strat==='sicher'){o=det.filter(x=>!x.later&&!x.nachbar&&!x.standing&&!(x.project<0)).sort((a,b)=>cost(b)-cost(a))[0]||det.sort((a,b)=>cost(b)-cost(a))[0]||wag[0]}
          else if(strat==='billig'){o=det.sort((a,b)=>cost(a)-cost(b))[0]||wag[0]}
          else if(strat==='wagnis'){o=wag[0]||det[0]}
          else if(strat==='klug'){
            const wg=wag[0];const wd=(e?e.diff:pd(project))+wp;const need=wd-base(p,e)-(p.eig==='bauch'?0:1);const ch=tw?0.5:Math.max(0,Math.min(1,(7-need)/6));
            const cheapOk=det.filter(x=>cost(x)===1&&!x.later&&!(x.project<0)&&(!x.standing||standing>=6)&&(!x.nachbar||debt===0)&&(payerOf(x)===p||!x.noPair||round>3));
            const safe=det.filter(x=>!x.later&&!x.nachbar&&!x.standing&&!(x.project<0)).sort((a,b)=>cost(b)-cost(a))[0];
            o=(wg&&ch>=0.67)?wg:(cheapOk[0]||safe||det.sort((a,b)=>cost(a)-cost(b))[0]||wg);
          }
          else{o=det.filter(x=>!x.later&&!x.nachbar&&!x.standing&&!(x.project<0)&&(payerOf(x)!==p||p.chips>=cost(x))).sort((a,b)=>cost(b)-cost(a))[0]||det.sort((a,b)=>cost(a)-cost(b))[0]||wag[0]}
          if(!o){p.done=true;continue}
          acted=true;p.acted=true;if(e)sActed=true;else pActed=true;const py=payerOf(o);let c=cost(o);
          if(py!==p){py.chips-=c}else{const h=helper();if(c>=2&&h&&!o.roll&&(p.chips<c||strat!=='wagnis')){h.chips--;help(h);c--}p.chips-=c}
          if(o.roll){
            const diff=(e?e.diff:pd(project))+wp;let b=base(p,e)+(p.eig==='bauch'?0:1);const h=helper();if(h&&strat!=='wagnis'&&h.chips>1){h.chips--;help(h);b+=(s.helpB||1)+(h.eig==='neinsagen'?1:0)}
            if(lern>0&&p.eig!=='hase'){lern--;b++}let r=rollFn();res.rolls++;let ok=r.t+b>=diff;
            if(!ok&&p.eig==='bauch'&&!p.used&&p.chips>0){after(r);p.used=true;p.chips--;r=rollFn();res.rolls++;ok=r.t+b>=diff}
            if(ok){res.succ++;if(e)applyFx(p,o,e);else setPr(project+1)}else{res.fails++;if(e)applyFx(p,{...o.roll.fail},e)}after(r)}
          else applyFx(p,e?o:{...o,resolve:false},e);
        }}
      const prio=s.prio?(Math.random()<.5?'standing':'project'):null;const pen=(s.escPen||1)+(prio==='standing'?1:0);
      let ruhe=pl.some(p=>p.eig==='ruhe');
      const keep=[];open.forEach(e=>{if(e.type==='Chance'){if(e.id<100)discard.push(e);return}if(ruhe){ruhe=false;e.diff+=2}else{setSt(standing-pen);e.diff++}keep.push(e)});open=keep;
      if(s.stillstand){if(!pActed)setPr(project-(prio==='project'?2:1));if(!sActed)setSt(standing-(prio==='standing'?2:1))}
      if(prio==='project'&&project<=pAtStart)setSt(standing-1);
      const fol=pl.some(p=>p.eig==='folien');const cr=rollFn();res.rolls++;if(cr.t+(fol?2:0)>=thr)setSt(standing+1);else if(s.callFail)setSt(standing-1);
      lern+=pl.some(p=>p.eig==='sinn')?2:1;const carry=p=>p.eig==='feierabend'&&p.chips>0?1:0;
      const newChips=p=>{const out=p.exh>=3;if(out)p.exh=0;p.out=out;return out?0:Math.max(0,s.chips+p.extra+carry(p)-(restr?1:0))};
      if(standing<=0){if(!restr){restr=true;pl.forEach(p=>{p.chips=newChips(p);p.extra=0});continue}else break}
      if(restr)break;pl.forEach(p=>{p.chips=newChips(p);p.extra=0});
    }
    const won=project>=s.projectTarget&&standing>0;if(won)res.won++;if(standing<=0)res.lostStanding++;if(project>=s.projectTarget)res.projectReached++;res.avgProject+=project;res.avgStanding+=standing;
  }
  res.avgProject/=n;res.avgStanding/=n;return res;
}
