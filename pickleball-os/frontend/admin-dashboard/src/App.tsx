import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Theme } from '../../shared/theme';

export default function AdminDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [courts, setCourts] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('live');
  const [proposal, setProposal] = useState<any>(null);
  const [qrName, setQrName] = useState('');
  const [qrSkill, setQrSkill] = useState('3.0');
  const [qrCheckedInMsg, setQrCheckedInMsg] = useState('');
  const [kotMatchId, setKotMatchId] = useState('');
  const SESSION_ID = 'SESSION_123';

  const fetchSuggestion = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/matches/suggest/${SESSION_ID}`);
      const data = await res.json();
      if (data.proposal) setProposal(data.proposal);
      else alert('Không đủ người để xếp trận! (Cần 4 người)');
    } catch (e) {
      console.error(e);
    }
  };

  const approveSuggestion = async () => {
    if (!proposal) return;
    try {
      await fetch('http://localhost:5000/api/admin/matches/approve-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          team1PlayerIds: proposal.team1.map((p: any) => p.id),
          team2PlayerIds: proposal.team2.map((p: any) => p.id),
        })
      });
      setProposal(null);
      alert('Đã tạo trận đấu!');
    } catch (e) {
      console.error(e);
      alert('Có lỗi khi tạo!');
    }
  };

  const handleQrCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrName) return;
    try {
      const res = await fetch('http://localhost:5000/api/checkin/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: SESSION_ID, playerName: qrName, skillLevel: qrSkill })
      });
      const data = await res.json();
      if (data.success) {
        setQrCheckedInMsg(`✅ ${qrName} đã check-in thành công!`);
        setQrName('');
        setTimeout(() => setQrCheckedInMsg(''), 4000);
      }
    } catch (e) { console.error(e); }
  };

  const handleKotResult = async (team1Won: boolean) => {
    if (!kotMatchId) return alert('Nhập Match ID trước!');
    try {
      await fetch(`http://localhost:5000/api/admin/matches/${kotMatchId}/king-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team1Won })
      });
      alert(`👑 Đã xử lý kết quả King of the Court!`);
      setKotMatchId('');
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);
    s.emit('join_event', 'live');
    
    s.on('queue:update', (data) => setQueue(data.queueSnapshot || []));
    s.on('court:assign', (data) => setCourts(prev => [...prev.filter(c => c.id !== data.courtId), data]));
    s.on('court:free', (data) => setCourts(prev => prev.filter(c => c.id !== data.courtId)));

    return () => { s.disconnect(); };
  }, []);

  const simulateTraffic = () => {
     setPlayers([
       { id: '1', name: "Aaron Nguyen", skill: "4.0", checkedIn: true },
       { id: '2', name: "John Doe", skill: "3.5", checkedIn: true },
       { id: '3', name: "Sarah Smith", skill: "4.5", checkedIn: false }
     ]);
     setQueue([
       { player: { name: "Aaron Nguyen", skill: "4.0" }, joinedAt: new Date(Date.now() - 500000).toISOString() },
       { player: { name: "Mike Tyson", skill: "3.5" }, joinedAt: new Date(Date.now() - 300000).toISOString() },
       { player: { name: "Sarah Smith", skill: "4.5" }, joinedAt: new Date(Date.now() - 100000).toISOString() }
     ]);
     setCourts([
       { id: 'c1', courtId: '1', teams: [[{name: "Mike"}], [{name: "Tom"}]] },
       { id: 'c2', courtId: '2', teams: [[{name: "Lucy"}], [{name: "Emma"}]] },
       { id: 'c3', courtId: '3', teams: [] },
       { id: 'c4', courtId: '4', teams: [] }
     ]);
  };

  return (
    <div style={{ background: Theme.colors.bg, color: Theme.colors.text.primary, minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: '260px', background: Theme.colors.panel, borderRight: `1px solid ${Theme.colors.border}`, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, background: Theme.colors.accent.gradient, WebkitBackgroundClip: 'text', color: 'transparent', marginBottom: '40px' }}>
          TỔNG ĐÀI QUẢN TRỊ
        </h1>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'live', label: 'Giám sát Trực tiếp', icon: '⚡' },
            { id: 'players', label: 'Quản lý Người chơi', icon: '👥' },
            { id: 'matchmaker', label: 'AI Đề xuất Trận', icon: '🧠' },
            { id: 'kingcourt', label: 'King of the Court', icon: '👑' },
            { id: 'checkin', label: 'QR Check-in', icon: '📷' },
            { id: 'tvmode', label: 'TV Mode (Màn Hình Lớn)', icon: '📺' },
            { id: 'disputes', label: 'Giải quyết Khiếu nại', icon: '⚖️' },
            { id: 'settings', label: 'Cài đặt Hệ thống', icon: '⚙️' }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ 
                textAlign: 'left', border: 'none', cursor: 'pointer', fontSize: '14px',
                color: activeTab === t.id ? Theme.colors.accent.cyan : Theme.colors.text.muted, 
                fontWeight: activeTab === t.id ? 800 : 600, 
                padding: '12px 16px', background: activeTab === t.id ? `${Theme.colors.accent.cyan}15` : 'transparent', 
                borderRadius: Theme.radii.md, transition: 'all 0.2s'
              }}>
              <span style={{marginRight: 8}}>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>
            {activeTab === 'live' && 'Giám sát Trực tiếp'}
            {activeTab === 'players' && 'Danh sách Người chơi'}
            {activeTab === 'matchmaker' && 'AI Đề xuất Trận thông minh'}
            {activeTab === 'kingcourt' && '👑 King of the Court'}
            {activeTab === 'checkin' && '📷 QR Check-in Nhanh'}
            {activeTab === 'tvmode' && 'Chế độ TV (Khán giả)'}
            {activeTab === 'disputes' && 'Giải quyết Khiếu nại kết quả'}
            {activeTab === 'settings' && 'Cài đặt Hệ thống'}
          </h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={simulateTraffic} style={{ background: Theme.colors.accent.gradient, color: '#000', border: 'none', padding: '10px 20px', borderRadius: Theme.radii.md, fontWeight: 800, cursor: 'pointer', fontSize: 13 }}>
              🧪 Chạy Giả lập Dữ liệu
            </button>
            <div style={{ background: Theme.colors.card, padding: '12px 24px', borderRadius: Theme.radii.md, border: `1px solid ${Theme.colors.border}`, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: Theme.colors.text.muted, fontSize: '12px', marginRight: '12px', fontWeight: 700, letterSpacing: 1 }}>ĐANG ĐỢI</span>
              <strong style={{ fontSize: '20px', color: Theme.colors.accent.neonGreen }}>{queue.length}</strong>
            </div>
          </div>
        </div>

        {activeTab === 'live' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: 1, color: Theme.colors.text.muted, margin: 0 }}>SÂN ĐANG ĐÁNH</h3>
                <button style={{background: 'transparent', border:`1px solid ${Theme.colors.accent.cyan}`, color: Theme.colors.accent.cyan, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer'}}>🎲 Tạo ghép trận</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {courts.length === 0 ? <div style={{ color: Theme.colors.text.dim, background: Theme.colors.panel, padding: 30, borderRadius: Theme.radii.xl, textAlign: 'center', gridColumn: 'span 2', border: `1px dashed ${Theme.colors.border}` }}>Không có sân nào đang đánh. Hãy ấn Chạy Giả lập.</div> : null}
                {courts.map(court => (
                  <div key={court.id} style={{ background: Theme.colors.card, border: `1px solid ${Theme.colors.border}`, borderRadius: Theme.radii.xl, padding: '20px', boxShadow: Theme.shadows.card }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                      <strong style={{ fontSize: 18 }}>Sân {court.courtId}</strong>
                      {court.teams.length > 0 ? (
                        <span style={{ fontSize: '11px', fontWeight: 900, background: `${Theme.colors.accent.neonGreen}15`, color: Theme.colors.accent.neonGreen, border: `1px solid ${Theme.colors.accent.neonGreen}55`, padding: '4px 8px', borderRadius: Theme.radii.full, letterSpacing: 1 }}>TRỰC TIẾP</span>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: 900, background: `${Theme.colors.text.muted}15`, color: Theme.colors.text.muted, border: `1px solid ${Theme.colors.text.muted}55`, padding: '4px 8px', borderRadius: Theme.radii.full, letterSpacing: 1 }}>TRỐNG</span>
                      )}
                    </div>
                    {court.teams.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ background: `${Theme.colors.accent.cyan}10`, padding: '12px', borderRadius: Theme.radii.md, border: `1px solid ${Theme.colors.accent.cyan}30`, fontWeight: 700, display: 'flex', justifyContent:'space-between', color: Theme.colors.accent.cyan }}>
                          <span>{(court.teams[0]||[]).map((p:any)=>p.name).join(' & ')}</span>
                          <span>0</span>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 900, color: Theme.colors.text.muted }}>VS</div>
                        <div style={{ background: `${Theme.colors.status.warning}10`, padding: '12px', borderRadius: Theme.radii.md, border: `1px solid ${Theme.colors.status.warning}30`, fontWeight: 700, display: 'flex', justifyContent:'space-between', color: Theme.colors.status.warning }}>
                          <span>{(court.teams[1]||[]).map((p:any)=>p.name).join(' & ')}</span>
                          <span>0</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: Theme.colors.text.dim, padding: '20px 0' }}>Có thể tự do gán trận</div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section style={{ background: Theme.colors.panel, borderRadius: Theme.radii.xl, padding: '24px', border: `1px solid ${Theme.colors.border}`, height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: 1, color: Theme.colors.text.muted, margin: 0 }}>HÀNG CHỜ</h3>
                <span style={{ fontSize: 12, color: Theme.colors.accent.cyan }}>{queue.length} Lượt đợi</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {queue.map((q, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: Theme.colors.card, borderRadius: Theme.radii.md, border: `1px solid ${Theme.colors.border}` }}>
                    <div style={{ color: Theme.colors.text.muted, fontWeight: 900, fontSize: 12 }}>#{i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{q.player.name}</div>
                      <div style={{ fontSize: 11, color: Theme.colors.accent.gold }}>Trình độ: {q.player.skill}</div>
                    </div>
                    <div style={{ color: Theme.colors.status.warning, fontSize: '12px', fontWeight: 800, background: `${Theme.colors.status.warning}15`, padding: '4px 8px', borderRadius: 6 }}>
                      {Math.floor((Date.now() - new Date(q.joinedAt).getTime())/60000)}p chờ
                    </div>
                  </div>
                ))}
                {queue.length === 0 && <div style={{ color: Theme.colors.text.dim, textAlign: 'center', padding: 20 }}>Hàng chờ trống.</div>}
              </div>
              <button style={{marginTop: 16, width: '100%', background: 'transparent', border: `1px dashed ${Theme.colors.accent.cyan}`, color: Theme.colors.accent.cyan, padding: '10px', borderRadius: Theme.radii.md, cursor: 'pointer', fontWeight: 700}}>+ Mời Tham gia (Check-in)</button>
            </section>
          </div>
        )}

        {activeTab === 'players' && (
          <div style={{ background: Theme.colors.card, borderRadius: Theme.radii.xl, border: `1px solid ${Theme.colors.border}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 100px 100px 100px', padding: '12px 20px', background: Theme.colors.panel, fontSize: 13, fontWeight: 700, color: Theme.colors.text.muted, borderBottom: `1px solid ${Theme.colors.border}` }}>
              <div>NGƯỜI CHƠI</div>
              <div>TRÌNH ĐỘ</div>
              <div>TRẠNG THÁI</div>
              <div>THAO TÁC</div>
            </div>
            {players.length === 0 ? <div style={{padding: 40, textAlign: 'center', color: Theme.colors.text.dim}}>Chưa có đăng ký nào.</div> : null}
            {players.map(p => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 100px 100px 100px', padding: '16px 20px', borderBottom: `1px solid ${Theme.colors.border}44`, alignItems: 'center' }}>
                <div style={{ fontWeight: 800 }}>{p.name}</div>
                <div style={{ color: Theme.colors.accent.gold, fontWeight: 700, fontSize: 13 }}>{p.skill}</div>
                <div>{p.checkedIn ? <span style={{color: Theme.colors.accent.neonGreen, fontSize: 12, background: `${Theme.colors.accent.neonGreen}22`, padding: '4px 8px', borderRadius: 12, fontWeight: 700}}>Đã Check-in</span> : <span style={{color: Theme.colors.text.muted, fontSize: 12}}>Vắng mặt</span>}</div>
                <div><button style={{background: 'transparent', border:`1px solid ${Theme.colors.text.muted}55`, color: Theme.colors.text.primary, padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11}}>Sửa</button></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'matchmaker' && (
          <div style={{ background: Theme.colors.card, padding: 40, borderRadius: Theme.radii.xl, border: `1px solid ${Theme.colors.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🧠</div>
            <h3 style={{ fontSize: 24, marginBottom: 10 }}>Hệ thống AI Đề Xuất Trận</h3>
            {!proposal ? (
              <>
                <p style={{ color: Theme.colors.text.muted, maxWidth: 500, margin: '0 auto 30px' }}>
                  Trí thông minh nhân tạo đang giám sát hàng chờ. Khi có 4 người cùng mức ELO tạo thành một cụm tương đồng, nó sẽ tự đề xuất một trận đấu cân bằng nhất tại đây.
                </p>
                <button onClick={fetchSuggestion} style={{ background: Theme.colors.panel, color: Theme.colors.text.primary, border: `1px solid ${Theme.colors.border}`, padding: '12px 24px', borderRadius: Theme.radii.lg, cursor: 'pointer', fontWeight: 700 }}>
                  Cưỡng ép Chạy Thuật Toán
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'left', maxWidth: 600, margin: '0 auto', background: Theme.colors.panel, padding: 24, borderRadius: Theme.radii.lg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h4 style={{ margin: 0, fontSize: 18, color: Theme.colors.text.primary }}>Đề Xuất Mới (Độ Tin Cậy: {(proposal.confidenceScore * 100).toFixed(0)}%)</h4>
                </div>
                
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <div style={{ flex: 1, background: `${Theme.colors.accent.cyan}10`, padding: 16, borderRadius: Theme.radii.md, border: `1px solid ${Theme.colors.accent.cyan}30` }}>
                    <div style={{ fontWeight: 800, color: Theme.colors.accent.cyan, marginBottom: 8 }}>TEAM 1</div>
                    {proposal.team1.map((p: any) => <div key={p.id}>{p.name}</div>)}
                  </div>
                  <div style={{ flex: 1, background: `${Theme.colors.status.warning}10`, padding: 16, borderRadius: Theme.radii.md, border: `1px solid ${Theme.colors.status.warning}30` }}>
                    <div style={{ fontWeight: 800, color: Theme.colors.status.warning, marginBottom: 8 }}>TEAM 2</div>
                    {proposal.team2.map((p: any) => <div key={p.id}>{p.name}</div>)}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: Theme.colors.text.muted, marginBottom: 8 }}>LÝ DO ĐỀ XUẤT:</div>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: Theme.colors.text.primary }}>
                    {proposal.reasons.map((r: string, i: number) => <li key={i} style={{marginBottom: 4}}>{r}</li>)}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={approveSuggestion} style={{ flex: 1, background: Theme.colors.accent.neonGreen, color: '#000', border: 'none', padding: '12px', borderRadius: Theme.radii.md, fontWeight: 800, cursor: 'pointer' }}>
                    ✅ Phê duyệt & Gán Sân
                  </button>
                  <button onClick={() => setProposal(null)} style={{ flex: 1, background: 'transparent', color: Theme.colors.text.primary, border: `1px solid ${Theme.colors.border}`, padding: '12px', borderRadius: Theme.radii.md, fontWeight: 700, cursor: 'pointer' }}>
                    ❌ Từ chối
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'disputes' && (
          <div style={{ padding: 40, color: Theme.colors.text.muted, textAlign: 'center' }}>Không có khiếu nại báo cáo sai điểm nào đang chờ giải quyết.</div>
        )}

        {activeTab === 'checkin' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ background: Theme.colors.card, padding: 32, borderRadius: Theme.radii.xl, border: `1px solid ${Theme.colors.border}`, marginBottom: 24 }}>
              <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>📷</div>
              <p style={{ color: Theme.colors.text.muted, textAlign: 'center', marginBottom: 24 }}>Nhập nhanh thông tin người chơi để check-in và xếp hàng vào đợt chờ.</p>
              <form onSubmit={handleQrCheckin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: Theme.colors.text.muted, marginBottom: 8 }}>HỌ TÊN</label>
                  <input value={qrName} onChange={e => setQrName(e.target.value)} placeholder="Tên người chơi..." style={{ width: '100%', boxSizing: 'border-box', padding: 14, background: Theme.colors.panel, border: `1px solid ${Theme.colors.border}`, color: '#fff', borderRadius: Theme.radii.md, fontSize: 15 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: Theme.colors.text.muted, marginBottom: 8 }}>TRÌNH ĐỘ</label>
                  <select value={qrSkill} onChange={e => setQrSkill(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: 14, background: Theme.colors.panel, border: `1px solid ${Theme.colors.border}`, color: '#fff', borderRadius: Theme.radii.md, fontSize: 15 }}>
                    <option value="2.5">2.5 – Mới chơi</option>
                    <option value="3.0">3.0 – Cơ bản</option>
                    <option value="3.5">3.5 – Trung cấp</option>
                    <option value="4.0">4.0 – Khá</option>
                    <option value="4.5">4.5+ – Chuyên</option>
                  </select>
                </div>
                {qrCheckedInMsg && <div style={{ color: Theme.colors.accent.neonGreen, fontWeight: 700, textAlign: 'center', padding: 12, background: `${Theme.colors.accent.neonGreen}15`, borderRadius: Theme.radii.md }}>{qrCheckedInMsg}</div>}
                <button type="submit" disabled={!qrName} style={{ background: qrName ? Theme.colors.accent.gradient : Theme.colors.panel, color: qrName ? '#000' : Theme.colors.text.muted, border: 'none', padding: 16, borderRadius: Theme.radii.md, fontWeight: 900, fontSize: 15, cursor: qrName ? 'pointer' : 'not-allowed' }}>
                  ✅ Check-in & Xếp Hàng
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'kingcourt' && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ background: `${Theme.colors.accent.gold}10`, border: `2px solid ${Theme.colors.accent.gold}55`, borderRadius: Theme.radii.xl, padding: 32, marginBottom: 24 }}>
              <h3 style={{ color: Theme.colors.accent.gold, fontSize: 20, margin: '0 0 12px' }}>👑 Luật Vua Sân</h3>
              <ul style={{ color: Theme.colors.text.muted, paddingLeft: 20, margin: 0, lineHeight: 2 }}>
                <li><strong>Sân 1</strong> là "Sân Vua" – ai thắng ở đây thì <strong>ở lại</strong>.</li>
                <li>Ai thua ở Sân Vua → bị đưa xuống cuối hàng chờ.</li>
                <li>Các sân khác hoạt động bình thường – cả 2 đội vào hàng chờ sau trận.</li>
              </ul>
            </div>

            <div style={{ background: Theme.colors.card, border: `1px solid ${Theme.colors.border}`, borderRadius: Theme.radii.xl, padding: 32 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>Nhập Kết Quả Trận (Tất cả chế độ)</h3>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: Theme.colors.text.muted, marginBottom: 8 }}>MATCH ID</label>
                <input value={kotMatchId} onChange={e => setKotMatchId(e.target.value)} placeholder="Dán Match ID từ DB..." style={{ width: '100%', boxSizing: 'border-box', padding: 14, background: Theme.colors.panel, border: `1px solid ${Theme.colors.border}`, color: '#fff', borderRadius: Theme.radii.md, fontSize: 14 }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => handleKotResult(true)} style={{ flex: 1, background: Theme.colors.accent.cyan, color: '#000', border: 'none', padding: 16, borderRadius: Theme.radii.md, fontWeight: 900, cursor: 'pointer' }}>Team 1 Thắng 🏆</button>
                <button onClick={() => handleKotResult(false)} style={{ flex: 1, background: Theme.colors.status.warning, color: '#000', border: 'none', padding: 16, borderRadius: Theme.radii.md, fontWeight: 900, cursor: 'pointer' }}>Team 2 Thắng 🏆</button>
              </div>
              <p style={{ color: Theme.colors.text.dim, fontSize: 12, marginTop: 12, textAlign: 'center' }}>Cuối trận, hàng chờ sẽ tự động cập nhật theo luật King of the Court.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'tvmode' && (
          <div style={{ background: '#0B1220', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, padding: '40px', boxSizing: 'border-box', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <h1 style={{ margin: 0, fontSize: 48, fontWeight: 900, color: Theme.colors.accent.neonGreen, textTransform: 'uppercase', letterSpacing: 2 }}>PICKLEBALL LIVE TV</h1>
              <button onClick={() => setActiveTab('live')} style={{ background: 'transparent', color: '#fff', border: `1px solid ${Theme.colors.border}`, padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>Thoát TV Mode</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
               <div>
                 <h2 style={{ fontSize: 24, color: Theme.colors.text.muted, letterSpacing: 2, marginBottom: 20 }}>🔥 CÁC TRẬN ĐANG ĐÁNH</h2>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                   {courts.filter(c => c.teams.length > 0).map((c, i) => (
                     <div key={i} style={{ background: Theme.colors.card, border: `2px solid ${Theme.colors.border}`, borderRadius: Theme.radii.xl, padding: 30 }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: Theme.colors.accent.cyan, marginBottom: 16 }}>SÂN {c.courtId}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 28, fontWeight: 800 }}>{(c.teams[0]||[]).map((p:any)=>p.name).join(' & ')}</div>
                          <div style={{ fontSize: 24, fontWeight: 900, color: Theme.colors.text.muted }}>VS</div>
                          <div style={{ fontSize: 28, fontWeight: 800 }}>{(c.teams[1]||[]).map((p:any)=>p.name).join(' & ')}</div>
                        </div>
                     </div>
                   ))}
                   {courts.filter(c => c.teams.length > 0).length === 0 && <div style={{ fontSize: 24, color: Theme.colors.text.dim }}>Không có trận nào đang diễn ra</div>}
                 </div>
               </div>
               
               <div>
                 <h2 style={{ fontSize: 24, color: Theme.colors.text.muted, letterSpacing: 2, marginBottom: 20 }}>⏳ HÀNG CHỜ TIẾP THEO</h2>
                 <div style={{ background: Theme.colors.panel, borderRadius: Theme.radii.xl, padding: 24, border: `1px solid ${Theme.colors.border}` }}>
                   {queue.slice(0, 8).map((q, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: `1px solid ${Theme.colors.border}`, fontSize: 20, fontWeight: 700 }}>
                       <span style={{ color: Theme.colors.text.muted }}>#{i+1}</span>
                       <span>{q.player.name}</span>
                       <span style={{ color: Theme.colors.accent.gold }}>{q.player.skill}</span>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ padding: 40, color: Theme.colors.text.muted, textAlign: 'center' }}>Cấu hình sự kiện đã được đồng bộ với Database.</div>
        )}

      </main>
    </div>
  );
}
