import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Theme } from '../../shared/theme';

export default function PlayerApp() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [queueStatus, setQueueStatus] = useState({ waiting: 0, estimatedMins: 0 });
  const [matchAssigned, setMatchAssigned] = useState<any>(null);

  useEffect(() => {
    // Connect to WebSocket API Gateway
    const s = io('http://localhost:5000');
    setSocket(s);
    
    // Subscribe to Event Room
    s.emit('join_event', 'live');
    
    s.on('queue:update', (data) => {
      setQueueStatus({
        waiting: data.queueSnapshot.length,
        estimatedMins: data.estimatedWaitTime
      });
    });

    s.on('court:assign', (data) => {
      // Check if current user is in match
      const myId = 'dummy-player-id';
      const isMe = data.teams.some((team: any[]) => team.some(p => p.id === myId));
      if (isMe) setMatchAssigned(data);
    });

    return () => { s.disconnect(); };
  }, []);

  return (
    <div style={{ background: Theme.colors.bg, color: Theme.colors.text.primary, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '20px', background: Theme.colors.panel, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${Theme.colors.border}`, position: 'sticky', top: 0 }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, background: Theme.colors.accent.gradient, WebkitBackgroundClip: 'text', color: 'transparent' }}>
          PICKLEBALL HUB
        </h1>
      </header>
      
      <main style={{ padding: '20px' }}>
        {matchAssigned ? (
          <div style={{ background: Theme.colors.card, border: `1px solid ${Theme.colors.accent.neonGreen}`, borderRadius: Theme.radii.xl, padding: '24px', boxShadow: Theme.shadows.glow, textAlign: 'center' }}>
            <h2 style={{ color: Theme.colors.accent.neonGreen, fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>PROCEED TO COURT {matchAssigned.courtId}</h2>
            <p style={{ color: Theme.colors.text.muted }}>Fairness Confidence: {matchAssigned.confidenceScore}%</p>
            {/* Render Match Form here later */}
            <button style={{ background: Theme.colors.accent.gradient, padding: '16px 32px', borderRadius: Theme.radii.lg, border: 'none', color: '#0B1220', fontWeight: 900, marginTop: '20px', width: '100%' }}>SUBMIT SCORE</button>
          </div>
        ) : (
          <div>
            <div style={{ background: Theme.colors.card, borderRadius: Theme.radii.xl, padding: '20px', border: `1px solid ${Theme.colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: Theme.colors.text.muted, fontWeight: 700 }}>AI ESTIMATED WAIT TIME</div>
              <div style={{ fontSize: '48px', fontWeight: 900, background: Theme.colors.accent.gradient, WebkitBackgroundClip: 'text', color: 'transparent' }}>
                ~{queueStatus.estimatedMins} min
              </div>
              <div style={{ marginTop: '12px', background: Theme.colors.panel, padding: '8px 16px', borderRadius: Theme.radii.full, fontSize: '12px', color: Theme.colors.text.muted }}>
                {queueStatus.waiting} players ahead of you
              </div>
            </div>

            <button style={{ background: Theme.colors.panel, border: `1px solid ${Theme.colors.status.lose}55`, color: Theme.colors.status.lose, padding: '16px', borderRadius: Theme.radii.lg, width: '100%', marginTop: '24px', fontWeight: 700 }}>
              Leave Queue (Resting)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
