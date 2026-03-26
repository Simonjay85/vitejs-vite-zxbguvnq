import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Theme } from '../../shared/theme';

export default function AdminDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [courts, setCourts] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);
    s.emit('join_event', 'live');
    
    s.on('queue:update', (data) => setQueue(data.queueSnapshot));
    s.on('court:assign', (data) => setCourts(prev => [...prev.filter(c => c.id !== data.courtId), data]));
    s.on('court:free', (data) => setCourts(prev => prev.filter(c => c.id !== data.courtId)));

    return () => { s.disconnect(); };
  }, []);

  return (
    <div style={{ background: Theme.colors.bg, color: Theme.colors.text.primary, minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: Theme.colors.panel, borderRight: `1px solid ${Theme.colors.border}`, padding: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, background: Theme.colors.accent.gradient, WebkitBackgroundClip: 'text', color: 'transparent', marginBottom: '40px' }}>
          OPERATIONS HQ
        </h1>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: Theme.colors.accent.cyan, fontWeight: 700, padding: '12px', background: `${Theme.colors.accent.cyan}15`, borderRadius: Theme.radii.md }}>Live Monitoring</div>
          <div style={{ color: Theme.colors.text.muted, fontWeight: 700, padding: '12px' }}>AI Matchmaker</div>
          <div style={{ color: Theme.colors.text.muted, fontWeight: 700, padding: '12px' }}>Dispute Resolution</div>
          <div style={{ color: Theme.colors.text.muted, fontWeight: 700, padding: '12px' }}>Settings</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Live Monitoring</h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ background: Theme.colors.card, padding: '12px 24px', borderRadius: Theme.radii.md, border: `1px solid ${Theme.colors.border}` }}>
              <span style={{ color: Theme.colors.text.muted, fontSize: '13px', marginRight: '8px' }}>QUEUE DEPTH</span>
              <strong style={{ fontSize: '18px' }}>{queue.length}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
          {/* Active Courts */}
          <section>
            <h3 style={{ fontSize: '16px', color: Theme.colors.text.muted, marginBottom: '16px' }}>ACTIVE COURTS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {courts.length === 0 ? <div style={{ color: Theme.colors.text.dim }}>No active matches.</div> : null}
              {courts.map(court => (
                <div key={court.id} style={{ background: Theme.colors.card, border: `1px solid ${Theme.colors.border}`, borderRadius: Theme.radii.xl, padding: '20px', boxShadow: Theme.shadows.card }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <strong>Court {court.courtId}</strong>
                    <span style={{ fontSize: '12px', background: `${Theme.colors.accent.neonGreen}15`, color: Theme.colors.accent.neonGreen, border: `1px solid ${Theme.colors.accent.neonGreen}55`, padding: '4px 8px', borderRadius: Theme.radii.full }}>LIVE</span>
                  </div>
                  {/* Team Stubs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ background: `${Theme.colors.accent.cyan}10`, padding: '10px', borderRadius: Theme.radii.md, border: `1px solid ${Theme.colors.accent.cyan}30` }}>Team A</div>
                    <div style={{ textAlign: 'center', fontSize: '12px', color: Theme.colors.text.muted }}>VS</div>
                    <div style={{ background: `${Theme.colors.status.warning}10`, padding: '10px', borderRadius: Theme.radii.md, border: `1px solid ${Theme.colors.status.warning}30` }}>Team B</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Master Queue */}
          <section style={{ background: Theme.colors.panel, borderRadius: Theme.radii.xl, padding: '24px', border: `1px solid ${Theme.colors.border}` }}>
            <h3 style={{ fontSize: '16px', color: Theme.colors.text.muted, marginBottom: '16px' }}>MASTER QUEUE</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {queue.map((q, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: Theme.colors.card, borderRadius: Theme.radii.md, border: `1px solid ${Theme.colors.border}` }}>
                  <span>{q.player.name}</span>
                  <span style={{ color: Theme.colors.text.muted, fontSize: '13px' }}>{Math.floor((Date.now() - new Date(q.joinedAt).getTime())/60000)}m wait</span>
                </div>
              ))}
              {queue.length === 0 && <div style={{ color: Theme.colors.text.dim }}>Queue is empty.</div>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
