import React, { useState, useEffect, useRef } from 'react';
import { G, bP, bS, safe, genCode, fmtVND } from '../../shared/theme';

// ── Simple Firebase polling via REST (no SDK needed in player app)
const FB_URL = (typeof window !== 'undefined' && (window as any).__FIREBASE_URL__) || 'https://your-project-default-rtdb.firebaseio.com';
const fbGet = async (path: string) => {
  try {
    const r = await fetch(`${FB_URL}/${path}.json`);
    return r.ok ? r.json() : null;
  } catch { return null; }
};

const POLL_MS = 5000;

// ───────────────────────────────────────────
// ViewerPaymentModal
// ───────────────────────────────────────────
function ViewerPaymentModal({ me, activeEvent, onSubmit, onClose }: any) {
  const [method, setMethod] = useState<'transfer'|'cash'|'qr_auto'>('transfer');
  const [bill, setBill] = useState<string|null>(null);
  const [sending, setSending] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setBill(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const submit = () => {
    setSending(true);
    onSubmit({ method, bill });
    setTimeout(() => setSending(false), 600);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: G.panel, borderRadius: 20, width: '100%', maxWidth: 420, padding: 24, border: `1px solid ${G.border}` }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: G.gold, marginBottom: 4 }}>💰 Thanh toán lệ phí</div>
        {activeEvent && (
          <div style={{ fontSize: 12, color: G.muted, marginBottom: 16 }}>
            Event: {activeEvent.name} · {activeEvent.feePerPerson > 0 ? fmtVND(activeEvent.feePerPerson) : 'Liên hệ Host'}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {([['transfer', '🏦 Chuyển khoản'], ['cash', '💵 Tiền mặt'], ['qr_auto', '📱 QR Momo']] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setMethod(v)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `2px solid ${method === v ? G.accent : G.border}`,
              background: method === v ? G.accent + '18' : 'transparent',
              color: method === v ? G.accent : G.muted
            }}>{l}</button>
          ))}
        </div>

        {method === 'transfer' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 8 }}>Upload ảnh biên lai chuyển khoản:</div>
            <input type="file" accept="image/*" onChange={handleFile} style={{ fontSize: 12, color: G.text }} />
            {bill && <img src={bill} alt="bill" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', marginTop: 8, borderRadius: 8 }} />}
          </div>
        )}

        {method === 'cash' && (
          <div style={{ background: G.gold + '18', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: G.gold }}>
            💵 Vui lòng gặp trực tiếp Host để nộp tiền mặt. Host sẽ xác nhận thanh toán cho bạn.
          </div>
        )}

        {method === 'qr_auto' && activeEvent?.qrUrl && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <img src={activeEvent.qrUrl} alt="QR" style={{ width: 180, height: 180, borderRadius: 12, border: `2px solid ${G.gold}` }} />
            <div style={{ fontSize: 11, color: G.muted, marginTop: 8 }}>Quét mã để chuyển khoản</div>
            <input type="file" accept="image/*" onChange={handleFile} style={{ fontSize: 11, color: G.text, marginTop: 8 }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={submit} disabled={sending || (method === 'transfer' && !bill)}
            style={{ ...bP, flex: 1, opacity: (sending || (method === 'transfer' && !bill)) ? 0.5 : 1 }}>
            {sending ? '⏳ Đang gửi...' : 'Gửi yêu cầu 📤'}
          </button>
          <button type="button" onClick={onClose} style={bS}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// LoginScreen
// ───────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (code: string) => void }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('code');
    if (c && /^\d{6}$/.test(c)) onLogin(c);
  }, []);

  const tryLogin = () => {
    if (!/^\d{6}$/.test(code)) { setErr('Mã phải là 6 chữ số'); return; }
    onLogin(code);
  };

  return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'Inter,system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400, background: G.panel, borderRadius: 24, padding: 32, border: `1px solid ${G.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🏓</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>PICKLEBALL HUB</div>
          <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>Đăng nhập để xem sân & theo dõi trận đấu</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, letterSpacing: 1, display: 'block', marginBottom: 8 }}>MÃ TRUY CẬP (6 SỐ)</label>
          <input
            type="tel" pattern="[0-9]*" value={code} maxLength={6}
            onChange={e => { setCode(e.target.value.replace(/[^0-9]/g, '')); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && tryLogin()}
            placeholder="VD: 123456"
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${G.border}`, background: G.card, color: G.text, fontSize: 22, textAlign: 'center', letterSpacing: 8, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {err && <div style={{ color: G.red, fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{err}</div>}

        <button type="button" onClick={tryLogin} style={{ ...bP, width: '100%', padding: '14px', fontSize: 15, borderRadius: 12 }}>
          Đăng nhập vào event 👁
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: G.muted }}>
          Mã cá nhân được giao sau khi check-in · Mã chung do Host cấp
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// Main App
// ───────────────────────────────────────────
export default function PlayerApp() {
  const [viewerCode, setViewerCode] = useState<string | null>(null);
  const [dbState, setDbState] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [payDone, setPayDone] = useState(false);
  const [vtab, setVtab] = useState('courts');
  const pollRef = useRef<any>(null);

  // Poll Firebase for updates
  const pollDb = async () => {
    const db = await fbGet('state');
    if (db) setDbState(db);
  };

  useEffect(() => {
    if (!viewerCode) return;
    pollDb();
    pollRef.current = setInterval(pollDb, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [viewerCode]);

  // Resolve "me" from viewerCode once dbState loads
  useEffect(() => {
    if (!dbState || !viewerCode) return;
    const players: any[] = Array.isArray(dbState.players) ? dbState.players : Object.values(dbState.players || {});
    const found = players.find((p: any) => String(p.viewerCode) === String(viewerCode) || String(dbState.accounts?.viewerCode) === String(viewerCode));
    if (found) setMe(found);
    else if (String(dbState.accounts?.viewerCode) === String(viewerCode)) setMe({ id: 'v_guest', name: 'Khán giả', isGuest: true });
  }, [dbState, viewerCode]);

  if (!viewerCode) return <LoginScreen onLogin={setViewerCode} />;

  if (!dbState || !me) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'Inter,system-ui,sans-serif' }}>
      <div style={{ fontSize: 32 }}>⏳</div>
      <div style={{ color: G.muted, fontSize: 14 }}>Đang xác thực mã...</div>
      <button onClick={() => setViewerCode(null)} style={{ ...bS, fontSize: 12, marginTop: 8 }}>← Quay lại</button>
    </div>
  );

  const players: any[] = Array.isArray(dbState.players) ? dbState.players : Object.values(dbState.players || {});
  const courts: any[] = Array.isArray(dbState.courts) ? dbState.courts : Object.values(dbState.courts || {});
  const queue: any[] = Array.isArray(dbState.queue) ? dbState.queue : [];
  const events: any[] = Array.isArray(dbState.events) ? dbState.events : Object.values(dbState.events || {});
  const history: any[] = Array.isArray(dbState.history) ? dbState.history : [];
  const announcement: string = dbState.announcement || '';
  const activeEventId: string | null = dbState.activeEventId || null;
  const activeEvent = events.find(e => e.id === activeEventId) || null;
  const myPlayer = players.find(p => p.id === me.id) || me;

  const liveCourts = courts.filter(c => c.match);
  const checkedInCount = players.filter(p => p.checkedIn).length;

  const perPerson = activeEvent
    ? (activeEvent.feePerPerson > 0 ? activeEvent.feePerPerson
      : ((Number(activeEvent.courtFee) || 0) + (Number(activeEvent.extraFee) || 0)) / (checkedInCount || 1))
    : 0;

  const VTABS = [
    { id: 'courts', l: '🏟️ Sân Live' },
    { id: 'queue', l: '⚔️ Queue' },
    { id: 'event', l: '📅 Sự kiện' },
    { id: 'leaderboard', l: '🏆 Xếp hạng' },
  ];

  const handlePaySubmit = ({ method, bill }: any) => {
    // In a real app this would POST to Firebase paymentAlerts
    setPayDone(true);
    setShowPayment(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: G.bg, color: G.text, fontFamily: 'Inter,system-ui,sans-serif' }}>
      {/* Announcement banner */}
      {announcement && (
        <div style={{ background: G.red, color: '#fff', padding: '8px 16px', fontWeight: 800, fontSize: 14 }}>
          <marquee scrollAmount={6}>📢 THÔNG BÁO: {announcement}</marquee>
        </div>
      )}

      {/* Header */}
      <header style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', background: G.panel, borderBottom: `1px solid ${G.border}`, position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${G.purple},${G.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
            {me.isGuest ? '👁' : '🏓'}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, color: '#fff' }}>{safe(myPlayer?.name) || 'Khán giả'}</div>
            <div style={{ fontSize: 9, color: G.muted }}>{activeEvent ? activeEvent.name : 'Chưa có event'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: G.accent + '18', color: G.accent, fontWeight: 700 }}>✅ {checkedInCount}</span>
          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: G.red + '18', color: G.red, fontWeight: 700 }}>🔴 {liveCourts.length}</span>
          <button onClick={() => setViewerCode(null)} style={{ ...bS, fontSize: 10, padding: '4px 10px' }}>← Thoát</button>
        </div>
      </header>

      {/* Payment prompt */}
      {!me.isGuest && myPlayer.checkedIn && !myPlayer.paid && !payDone && (
        <div style={{ background: G.gold + '18', borderBottom: `1px solid ${G.gold}44`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: G.gold }}>⚠️ Bạn chưa hoàn tất lệ phí sân</div>
            <div style={{ fontSize: 11, color: G.muted }}>Đang chờ Host xác nhận thanh toán...</div>
          </div>
          <button type="button" onClick={() => setShowPayment(true)} style={{ ...bP, background: `linear-gradient(135deg,${G.gold},${G.red})`, fontSize: 11, padding: '7px 14px' }}>
            Thanh toán 💳
          </button>
        </div>
      )}

      {/* Nav */}
      <nav style={{ display: 'flex', gap: 2, padding: '4px 12px', background: G.panel, borderBottom: `1px solid ${G.border}`, overflowX: 'auto' }}>
        {VTABS.map(t => (
          <button key={t.id} type="button" onClick={() => setVtab(t.id)} style={{
            padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
            whiteSpace: 'nowrap', background: vtab === t.id ? G.gold + '22' : 'transparent',
            color: vtab === t.id ? G.gold : G.muted, borderBottom: vtab === t.id ? `2px solid ${G.gold}` : '2px solid transparent'
          }}>{t.l}</button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: '12px 14px' }}>

        {/* Courts tab */}
        {vtab === 'courts' && (
          <div>
            {!liveCourts.length && <div style={{ textAlign: 'center', color: G.muted, padding: '40px 0', fontSize: 13 }}>Hiện không có sân nào đang đấu</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {courts.map(c => (
                <div key={c.id} style={{ background: G.card, borderRadius: 14, border: `1px solid ${c.match ? G.accent + '66' : G.border}`, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: c.match ? 10 : 0 }}>
                    <div style={{ fontWeight: 800, color: c.match ? G.accent : G.muted, fontSize: 14 }}>{c.name}</div>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 6, fontWeight: 700,
                      background: c.match ? G.accent + '22' : G.muted + '22',
                      color: c.match ? G.accent : G.muted
                    }}>{c.match ? '🔴 Đang đấu' : '⬜ Trống'}</span>
                  </div>
                  {c.match && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: G.text }}>
                        {(c.match.team1 || []).filter(Boolean).map((p: any) => safe(p.name)).join(' & ')}
                      </div>
                      <div style={{ fontSize: 12, color: G.muted }}>VS</div>
                      <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: G.gold, textAlign: 'right' }}>
                        {(c.match.team2 || []).filter(Boolean).map((p: any) => safe(p.name)).join(' & ')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Queue tab */}
        {vtab === 'queue' && (
          <div>
            {!queue.length && <div style={{ textAlign: 'center', color: G.muted, padding: '40px 0', fontSize: 13 }}>Hàng chờ trống</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {queue.map((q: any, i: number) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: G.card, border: `1px solid ${G.border}`, display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                  <span style={{ fontSize: 10, color: G.muted, fontWeight: 700, minWidth: 20 }}>#{i + 1}</span>
                  <span style={{ color: G.accent }}>{(q.team1 || []).filter(Boolean).map((p: any) => safe(p.name)).join(' & ')}</span>
                  <span style={{ color: G.dim }}>vs</span>
                  <span style={{ color: G.gold }}>{(q.team2 || []).filter(Boolean).map((p: any) => safe(p.name)).join(' & ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event tab */}
        {vtab === 'event' && (
          <div>
            {!activeEvent && <div style={{ textAlign: 'center', color: G.muted, padding: '40px 0', fontSize: 13 }}>Chưa có event nào đang chạy</div>}
            {activeEvent && (
              <div style={{ background: G.panel, borderRadius: 16, border: `1px solid ${G.accent}44`, padding: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 4 }}>🗓️ {activeEvent.name}</div>
                <div style={{ fontSize: 12, color: G.muted, marginBottom: 16 }}>📍 {activeEvent.location || 'Chưa có địa điểm'} · {activeEvent.date}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { l: '👥 Số người', v: `${checkedInCount} người` },
                    { l: '💰 Phí/người', v: perPerson > 0 ? fmtVND(Math.ceil(perPerson)) : 'Chưa tính' },
                    { l: '🏟️ Giá sân', v: activeEvent.courtFee ? fmtVND(Number(activeEvent.courtFee)) : 'Chưa có' },
                    { l: '🧾 Chi phí khác', v: activeEvent.extraFee ? fmtVND(Number(activeEvent.extraFee)) : '—' },
                  ].map(s => (
                    <div key={s.l} style={{ padding: '10px 12px', borderRadius: 10, background: G.card, border: `1px solid ${G.border}` }}>
                      <div style={{ fontSize: 9, color: G.muted, marginBottom: 3 }}>{s.l}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard tab */}
        {vtab === 'leaderboard' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: G.text, marginBottom: 12 }}>🏆 Xếp hạng hôm nay</div>
            {players.filter(p => p.name).sort((a, b) => (b.elo || 0) - (a.elo || 0)).slice(0, 20).map((p: any, i: number) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: G.card, border: `1px solid ${G.border}`, marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: i < 3 ? G.gold : G.muted, minWidth: 20 }}>#{i + 1}</div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: G.text }}>{safe(p.name)}</div>
                <div style={{ fontSize: 12, color: G.accent, fontWeight: 700 }}>{p.elo || 0} ELO</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Payment modal */}
      {showPayment && (
        <ViewerPaymentModal
          me={myPlayer}
          activeEvent={activeEvent}
          onSubmit={handlePaySubmit}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
