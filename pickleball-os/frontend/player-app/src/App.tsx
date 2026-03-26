import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Theme } from '../../shared/theme';

export default function PlayerApp() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [step, setStep] = useState<'checkin' | 'queue' | 'playing'>('checkin');
  const [playerInfo, setPlayerInfo] = useState({ name: '', skill: '3.0' });
  const [queueStatus, setQueueStatus] = useState({ waiting: 0, estimatedMins: 0 });
  const [matchAssigned, setMatchAssigned] = useState<any>(null);
  const [scores, setScores] = useState({ team1: 0, team2: 0 });

  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);
    return () => { s.disconnect(); };
  }, []);

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInfo.name) return;
    
    socket?.emit('join_event', 'live');
    // Simulate immediate backend queue assignment
    setStep('queue');
    setQueueStatus({ waiting: Math.floor(Math.random() * 10) + 1, estimatedMins: 12 });
  };

  const debugForceMatch = () => {
    setMatchAssigned({ id: 'match_123', courtId: '3', confidenceScore: 92, teams: [[{name: playerInfo.name}, {name: "ProBot"}], [{name: "Alpha"}, {name: "Beta"}]] });
    setStep('playing');
  };

  const submitScore = async () => {
    if (!matchAssigned?.id) {
       setStep('queue');
       return;
    }
    try {
      await fetch(`http://localhost:5000/api/matches/${matchAssigned.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1Score: scores.team1,
          team2Score: scores.team2,
          submittedBy: playerInfo.name
        })
      });
      setStep('queue');
      setScores({team1: 0, team2: 0});
      setMatchAssigned(null);
    } catch (e) {
      console.error(e);
      alert('Error submitting score');
    }
  };

  return (
    <div style={{ background: Theme.colors.bg, color: Theme.colors.text.primary, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '20px', background: Theme.colors.panel, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${Theme.colors.border}`, position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, background: Theme.colors.accent.gradient, WebkitBackgroundClip: 'text', color: 'transparent' }}>
          PICKLEBALL HUB
        </h1>
        {step !== 'checkin' && <div style={{ fontSize: 13, fontWeight: 700 }}>{playerInfo.name}</div>}
      </header>
      
      <main style={{ padding: '20px' }}>
        {step === 'checkin' && (
          <form onSubmit={handleCheckIn} style={{ background: Theme.colors.card, padding: 30, borderRadius: Theme.radii.xl, border: `1px solid ${Theme.colors.border}`, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Welcome! 👋</h2>
            <p style={{ color: Theme.colors.text.muted, margin: 0, fontSize: 14 }}>Let's get you checked in to the active session.</p>
            
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: Theme.colors.text.muted, marginBottom: 8 }}>FULL NAME</label>
              <input type="text" value={playerInfo.name} onChange={e => setPlayerInfo({...playerInfo, name: e.target.value})} placeholder="e.g. Ben Johns" autoFocus
                style={{ width: '100%', boxSizing: 'border-box', padding: 14, background: Theme.colors.panel, border: `1px solid ${Theme.colors.border}`, color: '#fff', borderRadius: Theme.radii.md, fontSize: 16 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: Theme.colors.text.muted, marginBottom: 8 }}>SELF-RATED SKILL (DUPR)</label>
              <select value={playerInfo.skill} onChange={e => setPlayerInfo({...playerInfo, skill: e.target.value})}
                style={{ width: '100%', boxSizing: 'border-box', padding: 14, background: Theme.colors.panel, border: `1px solid ${Theme.colors.border}`, color: '#fff', borderRadius: Theme.radii.md, fontSize: 16 }}>
                <option value="2.5">2.5 (Beginner)</option>
                <option value="3.0">3.0 (Novice)</option>
                <option value="3.5">3.5 (Intermediate)</option>
                <option value="4.0">4.0 (Advanced)</option>
                <option value="4.5">4.5+ (Pro)</option>
              </select>
            </div>

            <button type="submit" disabled={!playerInfo.name} style={{ background: playerInfo.name ? Theme.colors.accent.gradient : Theme.colors.panel, color: playerInfo.name ? '#000' : Theme.colors.text.muted, border: 'none', padding: 16, borderRadius: Theme.radii.lg, fontWeight: 900, fontSize: 16, cursor: playerInfo.name ? 'pointer' : 'not-allowed', marginTop: 10 }}>
              JOIN QUEUE
            </button>
          </form>
        )}

        {step === 'queue' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ background: Theme.colors.card, borderRadius: Theme.radii.xl, padding: '40px 20px', border: `1px solid ${Theme.colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              {/* Animated glow background */}
              <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: `radial-gradient(circle, ${Theme.colors.accent.cyan}15 0%, transparent 50%)`, animation: 'pulse 4s infinite' }} />
              
              <div style={{ fontSize: '12px', color: Theme.colors.text.muted, fontWeight: 800, letterSpacing: 2, position: 'relative' }}>AI ESTIMATED WAIT TIME</div>
              <div style={{ fontSize: '64px', fontWeight: 900, background: Theme.colors.accent.gradient, WebkitBackgroundClip: 'text', color: 'transparent', margin: '16px 0', position: 'relative', lineHeight: 1 }}>
                ~{queueStatus.estimatedMins}<span style={{fontSize: 24}}>m</span>
              </div>
              <div style={{ background: Theme.colors.panel, padding: '10px 20px', borderRadius: Theme.radii.full, fontSize: '13px', color: Theme.colors.text.muted, fontWeight: 600, position: 'relative', border: `1px solid ${Theme.colors.border}` }}>
                <strong style={{color: '#fff'}}>{queueStatus.waiting}</strong> players ahead of you
              </div>
            </div>

            <button onClick={debugForceMatch} style={{ background: 'transparent', border: `1px dashed ${Theme.colors.border}`, color: Theme.colors.text.muted, padding: '16px', borderRadius: Theme.radii.lg, width: '100%', marginTop: '24px', fontSize: 12, cursor: 'pointer' }}>
              🔧 (Debug) Simulate Match Assignment
            </button>

            <button onClick={() => setStep('checkin')} style={{ background: Theme.colors.panel, border: `1px solid ${Theme.colors.status.lose}55`, color: Theme.colors.status.lose, padding: '16px', borderRadius: Theme.radii.lg, width: '100%', marginTop: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Leave Queue (Resting)
            </button>
          </div>
        )}

        {step === 'playing' && matchAssigned && (
          <div style={{ background: Theme.colors.card, border: `1px solid ${Theme.colors.accent.neonGreen}`, borderRadius: Theme.radii.xl, padding: '30px 20px', boxShadow: Theme.shadows.glow, textAlign: 'center', animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <div style={{ display: 'inline-block', background: `${Theme.colors.accent.neonGreen}20`, color: Theme.colors.accent.neonGreen, padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 900, marginBottom: 16 }}>MATCH READY</div>
            
            <h2 style={{ color: '#fff', fontSize: '32px', fontWeight: 900, margin: '0 0 8px 0' }}>PROCEED TO<br/><span style={{color: Theme.colors.accent.neonGreen, fontSize: 56}}>COURT {matchAssigned.courtId}</span></h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', alignItems: 'center', gap: 10, marginTop: 30, marginBottom: 30 }}>
               <div style={{ background: Theme.colors.panel, padding: 16, borderRadius: Theme.radii.md }}>
                 {matchAssigned.teams[0].map((p:any,i:number) => <div key={i} style={{fontWeight: 700, margin: '4px 0'}}>{p.name}</div>)}
               </div>
               <div style={{ fontWeight: 900, color: Theme.colors.text.muted, fontSize: 13 }}>VS</div>
               <div style={{ background: Theme.colors.panel, padding: 16, borderRadius: Theme.radii.md }}>
                 {matchAssigned.teams[1].map((p:any,i:number) => <div key={i} style={{fontWeight: 700, margin: '4px 0'}}>{p.name}</div>)}
               </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: 12, fontWeight: 700, color: Theme.colors.text.muted, marginBottom: 8 }}>TEAM 1</div>
                 <input type="number" value={scores.team1} onChange={e => setScores({...scores, team1: parseInt(e.target.value)||0})} style={{ width: 60, padding: 12, background: Theme.colors.panel, border: `1px solid ${Theme.colors.border}`, color: '#fff', borderRadius: Theme.radii.md, fontSize: 24, textAlign: 'center' }} />
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: 12, fontWeight: 700, color: Theme.colors.text.muted, marginBottom: 8 }}>TEAM 2</div>
                 <input type="number" value={scores.team2} onChange={e => setScores({...scores, team2: parseInt(e.target.value)||0})} style={{ width: 60, padding: 12, background: Theme.colors.panel, border: `1px solid ${Theme.colors.border}`, color: '#fff', borderRadius: Theme.radii.md, fontSize: 24, textAlign: 'center' }} />
               </div>
            </div>
            
            <button onClick={submitScore} style={{ background: Theme.colors.accent.gradient, padding: '18px', borderRadius: Theme.radii.lg, border: 'none', color: '#0B1220', fontWeight: 900, width: '100%', fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0, 255, 178, 0.4)' }}>
              SUBMIT SCORE
            </button>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0% { opacity: 0.5; transform: scale(0.95); } 50% { opacity: 0.8; transform: scale(1); } 100% { opacity: 0.5; transform: scale(0.95); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
