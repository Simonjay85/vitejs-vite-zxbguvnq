import React, { useState } from 'react';
import { G, iS, bP, bS, bR, ROLES, DTYPE_OPT, SKILL_LEVELS, SKILL_COLOR, safe, uid, rng, skillElo, genCode, teamElo } from '../../../shared/theme';
import { SBadge, GBadge, DBadge, CBadge, Chip, RBadge } from '../../../shared/components/Badge';
import { MBox, Fld, Overlay } from '../../../shared/components/Modal';

// ── Event Modal
export function EventModal({event,onSave,onClose,isNew}: {event?:any,onSave:(e:any)=>void,onClose:()=>void,isNew?:boolean}) {
  const todayStr = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const [name,setName] = useState(event?.name||'');
  const [date,setDate] = useState(event?.date||todayStr());
  const [loc,setLoc] = useState(event?.location||'');
  const [courts,setCourts] = useState<number|'custom'>(event?.courtsCount||5);
  const [customCourts,setCustomCourts] = useState(event?.courtsCount?.toString()||'');
  const [maxPlayers,setMaxPlayers] = useState<number|'inf'|'custom'>(event?.maxPlayers||'inf');
  const [customPlayers,setCustomPlayers] = useState(event?.maxPlayers?.toString()||'');
  const [mode,setMode] = useState(event?.mode||'normal');
  const [updateDupr,setUpdateDupr] = useState(event?.updateDupr||false);
  const [courtFee,setCourtFee] = useState(event?.courtFee||'');
  const [otherFee,setOtherFee] = useState(event?.otherFee||'');
  const [feeNote,setFeeNote] = useState(event?.note||'');

  const save = () => {
    if(!name.trim()) return;
    const finalCourts = courts==='custom'?parseInt(customCourts)||5:courts;
    const finalPlayers = maxPlayers==='custom'?parseInt(customPlayers)||999:maxPlayers==='inf'?999:maxPlayers;
    onSave({...event,name:name.trim(),location:loc.trim(),date,courtsCount:finalCourts,maxPlayers:finalPlayers,mode,updateDupr,courtFee,otherFee,note:feeNote.trim(),id:event?.id||`ev_${uid()}`,createdAt:event?.createdAt||new Date().toISOString()});
    onClose();
  };

  const btnSel = (sel:boolean) => ({padding:'8px 0',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:14,border:`2px solid ${sel?G.accent:G.border}`,background:sel?G.accent+'22':'transparent',color:sel?G.accent:G.muted});

  return <MBox title={isNew?'🗓️ Tạo Event mới':'✏️ Sửa Event'} onClose={onClose} w={560}>
    <Fld label="TÊN EVENT *"><input value={name} onChange={e=>setName(e.target.value)} placeholder="VD: Social Thứ 7 Quận 2..." style={iS} autoFocus/></Fld>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <Fld label="📅 NGÀY"><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={iS}/></Fld>
      <Fld label="📍 ĐỊA ĐIỂM"><input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="Tên sân..." style={iS}/></Fld>
    </div>
    
    <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',gap:16}}>
      <Fld label="🏟️ SỐ SÂN">
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:8}}>
          {[2,3,4,5,6,7,8].map(n=><button key={n} type="button" onClick={()=>setCourts(n)} style={btnSel(courts===n)}>{n}</button>)}
          <button type="button" onClick={()=>setCourts('custom')} style={btnSel(courts==='custom')} title="Tuỳ chỉnh">✏️</button>
        </div>
        {courts==='custom' && <input type="number" value={customCourts} onChange={e=>setCustomCourts(e.target.value)} placeholder="Nhập số sân..." style={{...iS,fontSize:13}}/>}
      </Fld>
      <Fld label="👥 SỐ NGƯỜI DỰ KIẾN">
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:8}}>
          {['inf',8,12,16,20,24,28,32].map(n=><button key={n} type="button" onClick={()=>setMaxPlayers(n as any)} style={btnSel(maxPlayers===n)}>{n==='inf'?'∞':n}</button>)}
        </div>
        {maxPlayers==='custom' || !['inf',8,12,16,20,24,28,32].includes(maxPlayers as any) ? (
          <input type="number" value={customPlayers} onChange={e=>{setCustomPlayers(e.target.value);setMaxPlayers('custom');}} placeholder="Nhập số tuỳ ý (VD: 33)..." style={{...iS,fontSize:13}}/>
        ):<button onClick={()=>setMaxPlayers('custom')} style={{...btnSel(false),width:'100%',padding:'12px',fontSize:13}}>Nhập số tuỳ ý...</button>}
      </Fld>
    </div>

    <Fld label="CHẾ ĐỘ CHƠI">
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        {[{v:'normal',l:'🚀 Thường'},{v:'ladder',l:'📈 Leo thang'},{v:'king',l:'👑 Vua sân'}].map(m=><button key={m.v} type="button" onClick={()=>setMode(m.v)} style={{flex:1,...btnSel(mode===m.v)}}>{m.l}</button>)}
      </div>
      <label style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:G.panel,border:`1px solid ${G.border}`,borderRadius:10,cursor:'pointer'}}>
        <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${updateDupr?G.accent:G.muted}`,background:updateDupr?G.accent:'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>{updateDupr&&<span style={{color:'#000',fontSize:14,fontWeight:900}}>✓</span>}</div>
        <div><div style={{fontWeight:800,fontSize:13,color:G.text}}>Cập nhật điểm DUPR</div><div style={{fontSize:11,color:G.muted}}>Tự động đẩy kết quả lên hệ thống DUPR toàn cầu</div></div>
        <input type="checkbox" checked={updateDupr} onChange={e=>setUpdateDupr(e.target.checked)} style={{display:'none'}}/>
      </label>
    </Fld>

    <div style={{fontSize:11,fontWeight:800,color:G.gold,marginBottom:8,letterSpacing:1}}>💰 CHI PHÍ BUỔI CHƠI</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:12}}>
      <Fld label="GIÁ SÂN (nhập nghìn đ, VD: 500 = 500k)"><input type="number" value={courtFee} onChange={e=>setCourtFee(e.target.value)} placeholder="500" style={iS}/></Fld>
      <Fld label="CHI PHÍ KHÁC (nhập nghìn đ, VD: 200 = 200k)"><input type="number" value={otherFee} onChange={e=>setOtherFee(e.target.value)} placeholder="200" style={iS}/></Fld>
    </div>
    <Fld label="GHI CHÚ CHI PHÍ"><input value={feeNote} onChange={e=>setFeeNote(e.target.value)} placeholder="VD: Áo đồng phục 150k cho thành viên mới..." style={iS}/></Fld>

    <div style={{display:'flex',gap:8,marginTop:8}}>
      <button onClick={save} disabled={!name.trim()} style={{...bP,flex:1,opacity:name.trim()?1:.4,padding:'14px 0',fontSize:15}}>{isNew?'🚀 Tạo Event':'💾 Lưu'}</button>
      <button onClick={onClose} style={{...bS,padding:'14px 24px'}}>Huỷ</button>
    </div>
  </MBox>;
}

// ── QR / Check-in Modal
export function QRModal({players,onRegister,onClose}: {players:any[],onRegister:(p:any)=>void,onClose:()=>void}) {
  const [step,setStep] = useState<'scan'|'form'|'success'>('scan');
  const [form,setForm] = useState({name:'',gender:'M',skill:'3.0',dtype:'any',cwith:'',ctype:'couple'});
  const [err,setErr] = useState(''); const [added,setAdded] = useState<any>(null); const [search,setSearch] = useState(''); const [sname,setSname] = useState('');
  const sf = (k:string,v:string) => setForm(f=>({...f,[k]:v}));
  const checkedIn = players.filter(p=>p&&p.checkedIn&&p.name);
  const filtered = players.filter(p=>p&&p.name&&safe(p.name).toLowerCase().includes(safe(search).toLowerCase()));
  const submit = () => {
    if(!safe(form.name).trim()){setErr('Nhập tên');return;} setErr('');
    const ex = players.find(p=>p&&safe(p.name).toLowerCase()===safe(form.name).toLowerCase().trim());
    let np:any;
    if(ex){const cid=form.cwith?(ex.coupleId||`couple-${uid()}`):ex.coupleId;np={...ex,gender:form.gender,skill:form.skill,dtype:form.dtype,checkedIn:true,coupleId:form.cwith?cid:ex.coupleId,coupleType:form.cwith?form.ctype:ex.coupleType,coupleWithId:form.cwith||null,isNew:false};}
    else{np={id:uid(),name:form.name.trim(),gender:form.gender,skill:form.skill,elo:skillElo(form.skill),dtype:form.dtype,checkedIn:true,gamesPlayed:0,wins:0,lastPartners:[],coupleId:form.cwith?`couple-${uid()}`:null,coupleType:form.cwith?form.ctype:null,coupleWithId:form.cwith||null,createdAt:new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}),isNew:true,viewerCode:genCode()};}
    onRegister(np); setAdded(np); setStep('success');
  };
  return <Overlay onClose={onClose}>
    <div style={{background:G.panel,border:`1px solid ${G.border}`,borderRadius:18,width:490,maxWidth:'96vw',maxHeight:'94vh',overflowY:'auto'}}>
      <div style={{padding:'18px 22px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div><div style={{fontSize:16,fontWeight:800,color:G.text}}>{step==='scan'?'📷 QR Check-in':step==='form'?'📝 Đăng ký':'✅ Check in!'}</div><div style={{fontSize:10,color:G.muted,marginTop:2}}>{step==='scan'?'Quét mã hoặc tìm tên':step==='form'?'Điền thông tin':'Vào hàng chờ'}</div></div>
        <button onClick={onClose} style={{...bS,padding:'4px 9px',fontSize:14}}>✕</button>
      </div>
      <div style={{padding:'14px 22px 22px'}}>
        {step==='scan' && <>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Tìm tên..." style={{...iS,marginBottom:10}}/>
          <div style={{maxHeight:200,overflowY:'auto',display:'flex',flexDirection:'column',gap:5,marginBottom:10}}>
            {filtered.map(p=><div key={p.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:8,background:G.card,border:`1px solid ${p.checkedIn?G.accent+'55':G.border}`}}>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:G.text}}>{safe(p.name)}</div><div style={{display:'flex',gap:3,marginTop:2}}><GBadge gender={p.gender}/><SBadge skill={p.skill}/><DBadge dtype={p.dtype}/></div></div>
              {p.checkedIn?<Chip label="✅ IN" color={G.accent}/>:<button type="button" onClick={()=>{setForm({name:p.name,gender:p.gender,skill:p.skill,dtype:p.dtype||'any',cwith:'',ctype:'couple'});setSname(p.name);setStep('form');}} style={{...bP,fontSize:10,padding:'4px 10px'}}>Đăng ký</button>}
            </div>)}
          </div>
          <button onClick={()=>{setForm({name:safe(search).trim(),gender:'M',skill:'3.0',dtype:'any',cwith:'',ctype:'couple'});setSname('');setStep('form');}} style={{...bP,width:'100%',padding:'10px 0'}}>➕ Thêm người chơi mới</button>
        </>}
        {step==='form' && <>
          {sname && <div style={{padding:'7px 12px',borderRadius:8,background:G.accent+'12',border:`1px solid ${G.accent}33`,marginBottom:14,fontSize:11,color:G.accent,fontWeight:600}}>🎯 Nhận dạng: <strong>{sname}</strong></div>}
          <Fld label="TÊN"><input value={form.name} onChange={e=>{sf('name',e.target.value);setErr('');}} placeholder="VD: Minh Tuấn..." style={iS} autoFocus onKeyDown={e=>e.key==='Enter'&&submit()}/></Fld>
          <Fld label="GIỚI TÍNH"><div style={{display:'flex',gap:7}}>{[{v:'M',l:'♂ Nam',c:'#60a5fa'},{v:'F',l:'♀ Nữ',c:'#f472b6'}].map(g=><button key={g.v} type="button" onClick={()=>sf('gender',g.v)} style={{flex:1,padding:'9px 0',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:13,border:`2px solid ${form.gender===g.v?g.c:G.border}`,background:form.gender===g.v?g.c+'25':'transparent',color:form.gender===g.v?g.c:G.muted}}>{g.l}</button>)}</div></Fld>
          <Fld label="TRÌNH ĐỘ"><div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5}}>{SKILL_LEVELS.map(s=>{const c=SKILL_COLOR[s];const sel=form.skill===s;return <button key={s} type="button" onClick={()=>sf('skill',s)} style={{padding:'8px 3px',borderRadius:7,cursor:'pointer',fontWeight:700,fontSize:11,textAlign:'center',border:`2px solid ${sel?c:G.border}`,background:sel?c+'28':'transparent',color:sel?c:G.muted}}>{s}</button>;})}</div></Fld>
          <Fld label="KIỂU ĐÔI"><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5}}>{DTYPE_OPT.map(d=>{const sel=form.dtype===d.val;return <button key={d.val} type="button" onClick={()=>sf('dtype',d.val)} style={{padding:'7px 3px',borderRadius:7,cursor:'pointer',fontSize:10,fontWeight:700,textAlign:'center',border:`2px solid ${sel?d.color:G.border}`,background:sel?d.color+'22':'transparent',color:sel?d.color:G.muted}}>{d.label}</button>;})}</div></Fld>
          <Fld label="CẶP ĐÔI (tuỳ chọn)">
            <div style={{display:'flex',gap:7,marginBottom:7}}>{[{v:'couple',l:'💑 Couple'},{v:'spouse',l:'💍 Vợ/Chồng'}].map(t=><button key={t.v} type="button" onClick={()=>sf('ctype',t.v)} style={{flex:1,padding:'6px 0',borderRadius:7,cursor:'pointer',fontWeight:700,fontSize:10,border:`2px solid ${form.ctype===t.v?G.pink:G.border}`,background:form.ctype===t.v?G.pink+'22':'transparent',color:form.ctype===t.v?G.pink:G.muted}}>{t.l}</button>)}</div>
            <select value={form.cwith} onChange={e=>sf('cwith',e.target.value)} style={{...iS,fontSize:11}}>
              <option value="">-- Không kết đôi --</option>
              {checkedIn.filter(p=>safe(p.name).toLowerCase()!==safe(form.name).toLowerCase().trim()).map(p=><option key={p.id} value={p.id}>{safe(p.name)} ({p.gender}, {p.skill})</option>)}
            </select>
          </Fld>
          {err && <div style={{color:G.red,fontSize:11,marginBottom:10}}>{err}</div>}
          <div style={{display:'flex',gap:8}}><button onClick={submit} style={{...bP,flex:1,padding:'11px 0'}}>✅ Check in</button><button onClick={()=>setStep('scan')} style={bS}>← Quay lại</button></div>
        </>}
        {step==='success' && added && <>
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:44,marginBottom:12}}>🎉</div>
            <div style={{fontSize:18,fontWeight:900,color:G.accent,marginBottom:4}}>{safe(added.name)}</div>
            <div style={{fontSize:11,color:G.muted,marginBottom:16}}>{added.isNew?'Người chơi mới':'Check in lại'} · Vào hàng chờ ⏳</div>
            <div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:20}}><GBadge gender={added.gender}/><SBadge skill={added.skill}/><DBadge dtype={added.dtype}/></div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>{setStep('scan');setSname('');setSearch('');setAdded(null);}} style={{...bP,flex:1,padding:'11px 0'}}>📷 Check in tiếp</button>
            <button onClick={onClose} style={{...bS,padding:'11px 14px'}}>Xong</button>
          </div>
        </>}
      </div>
    </div>
  </Overlay>;
}

// ── Custom Match Modal
export function CustomModal({players,onAdd,onClose}: {players:any[],onAdd:(m:any)=>void,onClose:()=>void}) {
  const av = players.filter(p=>p&&p.checkedIn&&p.name);
  const [sel,setSel] = useState<string[]>([]); const [dtype,setDtype] = useState('mixed');
  const tog = (id:string) => setSel(p=>p.includes(id)?p.filter(x=>x!==id):[...p.slice(-3),id]);
  const t1 = sel.slice(0,2).map(id=>av.find(p=>p.id===id)).filter(Boolean);
  const t2 = sel.slice(2,4).map(id=>av.find(p=>p.id===id)).filter(Boolean);
  const diff = t1.length===2&&t2.length===2 ? Math.abs(teamElo(t1)-teamElo(t2)) : null;
  return <MBox title="✏️ Custom Match" sub="Chọn 4: 2 đầu=A · 2 sau=B" onClose={onClose} w={520}>
    <div style={{display:'flex',gap:6,marginBottom:12}}>{DTYPE_OPT.map(d=><button key={d.val} type="button" onClick={()=>setDtype(d.val)} style={{flex:1,padding:'6px 4px',borderRadius:7,cursor:'pointer',fontSize:10,fontWeight:700,border:`2px solid ${dtype===d.val?d.color:G.border}`,background:dtype===d.val?d.color+'22':'transparent',color:dtype===d.val?d.color:G.muted}}>{d.label}</button>)}</div>
    <div style={{display:'flex',gap:12,marginBottom:12}}>
      <div style={{flex:1,padding:'8px 10px',borderRadius:9,background:G.accent+'10',border:`1px solid ${G.accent}30`,minHeight:56}}><div style={{fontSize:9,color:G.accent,fontWeight:700,marginBottom:4}}>TEAM A</div>{!t1.length?<div style={{fontSize:10,color:G.dim}}>Chưa chọn</div>:t1.map((p:any)=><div key={p.id} style={{fontSize:11,color:G.text,fontWeight:600}}>{safe(p.name)} <SBadge skill={p.skill}/></div>)}</div>
      <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',gap:3}}><div style={{fontSize:12,fontWeight:800,color:G.dim}}>VS</div>{diff!==null&&<Chip label={`Δ${diff}`} color={diff<40?G.accent:G.gold}/>}</div>
      <div style={{flex:1,padding:'8px 10px',borderRadius:9,background:G.gold+'10',border:`1px solid ${G.gold}30`,minHeight:56}}><div style={{fontSize:9,color:G.gold,fontWeight:700,marginBottom:4}}>TEAM B</div>{!t2.length?<div style={{fontSize:10,color:G.dim}}>Chưa chọn</div>:t2.map((p:any)=><div key={p.id} style={{fontSize:11,color:G.text,fontWeight:600}}>{safe(p.name)} <SBadge skill={p.skill}/></div>)}</div>
    </div>
    <div style={{maxHeight:200,overflowY:'auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:12}}>
      {av.map(p=>{const idx=sel.indexOf(p.id);const s=idx>=0;const tl=s?(idx<2?'A':'B'):null;const c=tl==='A'?G.accent:G.gold;
        return <button key={p.id} type="button" onClick={()=>tog(p.id)} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 9px',borderRadius:8,cursor:'pointer',textAlign:'left',border:`2px solid ${s?c:G.border}`,background:s?c+'18':'transparent'}}>
          {s&&<div style={{width:16,height:16,borderRadius:3,background:c,color:'#fff',fontSize:8,fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{tl}</div>}
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:G.text}}>{safe(p.name)}</div><div style={{display:'flex',gap:2}}><GBadge gender={p.gender}/><SBadge skill={p.skill}/></div></div>
        </button>;})}
    </div>
    <div style={{display:'flex',gap:7}}>
      <button onClick={()=>onAdd({team1:t1,team2:t2,dtype})} disabled={sel.length!==4} style={{...bP,flex:1,opacity:sel.length===4?1:.4}}>✅ Thêm vào Queue</button>
      <button type="button" onClick={()=>setSel([])} style={bS}>Reset</button>
      <button onClick={onClose} style={bS}>Huỷ</button>
    </div>
  </MBox>;
}

// ── Couple Modal
export function CoupleModal({players,setPlayers,onClose}: {players:any[],setPlayers:(fn:(p:any[])=>any[])=>void,onClose:()=>void}) {
  const [sel,setSel] = useState<string[]>([]); const [ct,setCt] = useState('couple');
  const cm: Record<string,any[]> = {};
  players.forEach(p=>{if(p?.coupleId){if(!cm[p.coupleId])cm[p.coupleId]=[];cm[p.coupleId].push(p);}});
  const tog = (id:string) => setSel(p=>p.includes(id)?p.filter(x=>x!==id):[...p.slice(-1),id]);
  const link = () => {if(sel.length!==2)return;const cid=`${ct}-${uid()}`;setPlayers(p=>p.map(x=>sel.includes(x.id)?{...x,coupleId:cid,coupleType:ct}:x));setSel([]);};
  const unlink = (cid:string) => setPlayers(p=>p.map(x=>x.coupleId===cid?{...x,coupleId:null,coupleType:null}:x));
  return <MBox title="💑 Couple / Vợ chồng" onClose={onClose} w={480}>
    {Object.entries(cm).length>0 && <div style={{marginBottom:14}}>{Object.entries(cm).map(([cid,pp])=><div key={cid} style={{display:'flex',alignItems:'center',gap:9,padding:'7px 11px',borderRadius:8,background:G.card,border:`1px solid ${G.pink}44`,marginBottom:6}}>
      <span>{pp[0]?.coupleType==='spouse'?'💍':'💑'}</span>
      <div style={{flex:1,display:'flex',gap:8}}>{pp.map((p:any)=><span key={p.id} style={{fontSize:11,fontWeight:700,color:G.text}}>{safe(p.name)}</span>)}</div>
      <button onClick={()=>unlink(cid)} style={bR}>✕</button>
    </div>)}</div>}
    <div style={{display:'flex',gap:7,marginBottom:9}}>{[{v:'couple',l:'💑 Couple'},{v:'spouse',l:'💍 Vợ/Chồng'}].map(t=><button key={t.v} type="button" onClick={()=>setCt(t.v)} style={{flex:1,padding:'7px 0',borderRadius:7,cursor:'pointer',fontWeight:700,fontSize:11,border:`2px solid ${ct===t.v?G.pink:G.border}`,background:ct===t.v?G.pink+'22':'transparent',color:ct===t.v?G.pink:G.muted}}>{t.l}</button>)}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,maxHeight:220,overflowY:'auto',marginBottom:11}}>
      {players.filter(p=>p&&p.checkedIn&&p.name).map(p=>{const s=sel.includes(p.id);return <button key={p.id} type="button" onClick={()=>tog(p.id)} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 9px',borderRadius:7,cursor:'pointer',textAlign:'left',border:`2px solid ${s?G.pink:G.border}`,background:s?G.pink+'20':'transparent'}}>
        <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:G.text}}>{safe(p.name)}</div><div style={{display:'flex',gap:2}}><GBadge gender={p.gender}/><SBadge skill={p.skill}/></div></div>
        {s&&<span style={{color:G.pink}}>✓</span>}
      </button>;})}
    </div>
    <div style={{display:'flex',gap:7}}>
      <button onClick={link} disabled={sel.length!==2} style={{...bP,flex:1,opacity:sel.length===2?1:.4}}>💑 Kết đôi ({sel.length}/2)</button>
      <button onClick={onClose} style={bS}>Đóng</button>
    </div>
  </MBox>;
}

// ── Admin / Account Modal
export function AdminModal({accounts,setAccounts,me,onClose,toast}: {accounts:any,setAccounts:(fn:any)=>void,me:any,onClose:()=>void,toast:(m:string)=>void}) {
  const [tab,setTab] = useState('hosts'); const [nm,setNm]=useState(''); const [pw,setPw]=useState(''); const [err,setErr]=useState('');
  const [o,setO]=useState(''); const [n,setN]=useState(''); const [c2,setC2]=useState(''); const [perr,setPerr]=useState('');
  const isSA = me?.role===ROLES.SA;
  const addHost = () => {
    if(!nm.trim()){setErr('Nhập tên');return;} if(!pw.trim()){setErr('Nhập mật khẩu');return;}
    if([...(accounts.admins||[]),...(accounts.hosts||[])].some((u:any)=>u.name.toLowerCase()===nm.trim().toLowerCase())){setErr('Tên đã tồn tại');return;}
    setAccounts((p:any)=>({...p,hosts:[...(p.hosts||[]),{id:`h_${uid()}`,name:nm.trim(),role:ROLES.HOST,password:pw.trim()}]}));
    setNm('');setPw('');setErr('');toast(`Host "${nm.trim()}" đã thêm 🎮`);
  };
  const chgPass = () => {
    if(me.password!==o){setPerr('Mật khẩu cũ không đúng');return;}
    if(n.length<4){setPerr('Tối thiểu 4 ký tự');return;}
    if(n!==c2){setPerr('Xác nhận không khớp');return;}
    setAccounts((p:any)=>({...p,admins:(p.admins||[]).map((a:any)=>a.id===me.id?{...a,password:n}:a),hosts:(p.hosts||[]).map((h:any)=>h.id===me.id?{...h,password:n}:h)}));
    setO('');setN('');setC2('');setPerr('');toast('Đã đổi mật khẩu 🔐');
  };
  const regenCode = () => {const c=genCode();setAccounts((p:any)=>({...p,viewerCode:c}));toast(`Mã viewer mới: ${c} 🔄`);};
  return <MBox title="⚙️ Quản lý tài khoản" sub="Phân quyền & Mã truy cập Viewer" onClose={onClose} w={560}>
    <div style={{display:'flex',gap:4,marginBottom:16,borderBottom:`1px solid ${G.border}`,paddingBottom:8}}>
      {['hosts','viewer','pass'].map(t=><button key={t} type="button" onClick={()=>setTab(t)} style={{padding:'5px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:tab===t?G.accent+'22':'transparent',color:tab===t?G.accent:G.muted,borderBottom:tab===t?`2px solid ${G.accent}`:'2px solid transparent'}}>
        {t==='hosts'?'🎮 Hosts':t==='viewer'?'👁 Viewer Code':'🔐 Mật khẩu'}
      </button>)}
    </div>
    {tab==='hosts' && <>
      <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:16}}>
        {(accounts.admins||[]).map((a:any)=><div key={a.id} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 12px',borderRadius:9,background:G.gold+'10',border:`1px solid ${G.gold}33`}}>
          <span>👑</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:800,color:G.gold}}>{a.name}</div></div><RBadge role={a.role}/>
        </div>)}
        {(accounts.hosts||[]).map((h:any)=><div key={h.id} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 12px',borderRadius:9,background:G.panel,border:`1px solid ${G.border}`}}>
          <span>🎮</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:G.text}}>{h.name}</div></div><RBadge role={h.role}/>
          {isSA&&<button onClick={()=>{setAccounts((p:any)=>({...p,hosts:(p.hosts||[]).filter((x:any)=>x.id!==h.id)}));toast('Đã xoá host');}} style={bR}>Xoá</button>}
        </div>)}
      </div>
      {isSA&&<><div style={{fontSize:9,color:G.muted,fontWeight:700,marginBottom:8}}>THÊM HOST</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
          <input value={nm} onChange={e=>{setNm(e.target.value);setErr('');}} placeholder="Tên host..." style={iS}/>
          <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr('');}} placeholder="Mật khẩu..." style={iS}/>
        </div>
        {err&&<div style={{color:G.red,fontSize:11,marginBottom:8}}>{err}</div>}
        <button onClick={addHost} style={{...bP,width:'100%'}}>➕ Thêm Host</button>
      </>}
    </>}
    {tab==='viewer' && <div style={{textAlign:'center',padding:'20px 0'}}>
      <div style={{fontSize:11,color:G.muted,marginBottom:12}}>Chia sẻ mã này cho khán giả</div>
      <div style={{fontSize:44,fontWeight:900,letterSpacing:10,color:G.gold,padding:'16px 24px',borderRadius:14,background:G.gold+'12',border:`2px solid ${G.gold}44`,display:'inline-block',marginBottom:16}}>{accounts?.viewerCode||'??????'}</div>
      {isSA&&<div><button onClick={regenCode} style={{...bS,color:G.gold,border:`1px solid ${G.gold}44`}}>🔄 Tạo mã mới</button></div>}
    </div>}
    {tab==='pass' && <>
      <Fld label="MẬT KHẨU HIỆN TẠI"><input type="password" value={o} onChange={e=>{setO(e.target.value);setPerr('');}} style={iS}/></Fld>
      <Fld label="MẬT KHẨU MỚI"><input type="password" value={n} onChange={e=>{setN(e.target.value);setPerr('');}} style={iS}/></Fld>
      <Fld label="XÁC NHẬN"><input type="password" value={c2} onChange={e=>{setC2(e.target.value);setPerr('');}} style={iS} onKeyDown={e=>e.key==='Enter'&&chgPass()}/></Fld>
      {perr&&<div style={{color:G.red,fontSize:11,marginBottom:10}}>{perr}</div>}
      <button onClick={chgPass} style={{...bP,width:'100%'}}>🔐 Đổi mật khẩu</button>
    </>}
  </MBox>;
}

// ── Viewer Challenge Modal  
export function ViewerChallengeModal({me,players,onChallenge,onClose}: {me:any,players:any[],onChallenge:(d:any)=>void,onClose:()=>void}) {
  const av = players.filter(p=>p&&p.checkedIn&&p.name&&p.id!==me.id);
  const [partner,setPartner]=useState(''); const [opp1,setOpp1]=useState(''); const [opp2,setOpp2]=useState(''); const [err,setErr]=useState('');
  const submit = () => {
    if(!partner||!opp1||!opp2){setErr('Cần chọn đủ 3 người');return;}
    if(new Set([partner,opp1,opp2]).size!==3){setErr('Không thể chọn trùng người');return;}
    const p=av.find((x:any)=>x.id===partner),o1=av.find((x:any)=>x.id===opp1),o2=av.find((x:any)=>x.id===opp2);
    if(p&&o1&&o2){onChallenge({challenger:me,partner:p,opp1:o1,opp2:o2});onClose();}
  };
  return <MBox title="⚔️ Thách đấu 2v2" sub="Gửi yêu cầu khởi tạo trận đấu đến Host" onClose={onClose} w={420}>
    <Fld label="ĐỒNG ĐỘI CỦA BẠN"><select value={partner} onChange={e=>{setPartner(e.target.value);setErr('');}} style={{...iS,padding:'10px'}}><option value="">-- Chọn đồng đội --</option>{av.map((p:any)=><option key={p.id} value={p.id}>{safe(p.name)} ({p.skill})</option>)}</select></Fld>
    <div style={{textAlign:'center',color:G.red,fontWeight:900,margin:'10px 0'}}>VS</div>
    <Fld label="ĐỐI THỦ 1"><select value={opp1} onChange={e=>{setOpp1(e.target.value);setErr('');}} style={{...iS,padding:'10px'}}><option value="">-- Chọn đối thủ 1 --</option>{av.map((p:any)=><option key={p.id} value={p.id}>{safe(p.name)} ({p.skill})</option>)}</select></Fld>
    <Fld label="ĐỐI THỦ 2"><select value={opp2} onChange={e=>{setOpp2(e.target.value);setErr('');}} style={{...iS,padding:'10px'}}><option value="">-- Chọn đối thủ 2 --</option>{av.map((p:any)=><option key={p.id} value={p.id}>{safe(p.name)} ({p.skill})</option>)}</select></Fld>
    {err&&<div style={{color:G.red,fontSize:11,marginBottom:12,padding:'6px 10px',background:G.red+'15',borderRadius:6}}>{err}</div>}
    <div style={{display:'flex',gap:8}}>
      <button onClick={submit} style={{...bP,flex:1,background:`linear-gradient(135deg,${G.purple},${G.pink})`}}>⚔️ Gửi thách đấu</button>
      <button onClick={onClose} style={bS}>Huỷ</button>
    </div>
  </MBox>;
}
