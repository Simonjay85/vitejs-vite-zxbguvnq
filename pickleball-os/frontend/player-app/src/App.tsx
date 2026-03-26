import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function PlayerApp() {
  const [socket, setSocket] = useState<any>(null);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER matching the screenshot's 'WELLCOME BACK' look */}
      <header style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {step !== 'checkin' ? (
          <>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--card)', border: '2px solid var(--neon)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              🏓
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                WELCOME BACK,
              </div>
              <div style={{ fontSize: 18, fontFamily: '"Bebas Neue", sans-serif', letterSpacing: 1.5, color: '#fff' }}>
                {playerInfo.name.toUpperCase()}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', width: '100%' }}>
             <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8 }}>PICKLEBALL HUB - ACTIVE SESSION</div>
             <h1 style={{ fontSize: '3rem', margin: 0, lineHeight: 1 }}>JOIN THE<br/><span style={{color: 'var(--neon)'}}>COURT QUEUE</span></h1>
          </div>
        )}
      </header>
      
      <main style={{ padding: '0 24px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {step === 'checkin' && (
          <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20, border: 'none' }}>
              <div>
                <label>FULL NAME</label>
                <input type="text" value={playerInfo.name} onChange={e => setPlayerInfo({...playerInfo, name: e.target.value})} placeholder="Enter your name" autoFocus />
              </div>

              <div>
                <label>SELF-RATED SKILL (DUPR)</label>
                <select value={playerInfo.skill} onChange={e => setPlayerInfo({...playerInfo, skill: e.target.value})}>
                  <option value="2.5">2.5 (Beginner)</option>
                  <option value="3.0">3.0 (Novice)</option>
                  <option value="3.5">3.5 (Intermediate)</option>
                  <option value="4.0">4.0 (Advanced)</option>
                  <option value="4.5">4.5+ (Pro)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={!playerInfo.name} style={{ width: '100%', padding: '18px 20px', fontSize: 15 }}>
              JOIN QUEUE NOW
            </button>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>FIRST TIME PLAYING? <span style={{color: '#fff', textDecoration: 'underline'}}>VIEW RULES</span></div>
          </form>
        )}

        {step === 'queue' && (
          <div style={{ animation: 'slideIn 0.4s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
               <div className="stat-card">
                  <div className="stat-card__value" style={{color: 'var(--neon)'}}>{queueStatus.waiting}</div>
                  <div className="stat-card__label">AHEAD OF YOU</div>
               </div>
               <div className="stat-card">
                  <div className="stat-card__value">{queueStatus.estimatedMins}<span style={{fontSize:16}}>m</span></div>
                  <div className="stat-card__label">WAIT TIME</div>
               </div>
            </div>

            <div className="card" style={{ textAlign: 'center', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: `radial-gradient(circle, rgba(212,255,0,0.1) 0%, transparent 60%)`, animation: 'pulse 3s infinite' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: 8 }}>PREPARING<br/>YOUR MATCH</h2>
                <p style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>Please stay near the courts. The AI matchmaker will assign you shortly.</p>
              </div>
            </div>

            <button onClick={debugForceMatch} className="btn-secondary" style={{ width: '100%', borderStyle: 'dashed', marginBottom: 12 }}>
              🔧 SIMULATE MATCH (DEBUG)
            </button>
            <button onClick={() => setStep('checkin')} className="btn-secondary" style={{ width: '100%', color: 'var(--red)', borderColor: 'rgba(235,87,87,0.3)' }}>
              LEAVE QUEUE
            </button>
          </div>
        )}

        {step === 'playing' && matchAssigned && (
          <div style={{ animation: 'fadeUp 0.4s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
               <span className="chip chip-neon" style={{ marginBottom: 16 }}>MATCH READY</span>
               <h1 style={{ fontSize: '4rem', margin: 0, textShadow: 'var(--glow-neon)', color: 'var(--neon)' }}>COURT {matchAssigned.courtId}</h1>
            </div>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <div style={{ flex: 1 }}>
                   <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', marginBottom: 8 }}>TEAM 1</div>
                   {matchAssigned.teams[0].map((p:any,i:number) => <div key={i} style={{fontSize: 16, fontWeight: 700, fontFamily: '"Bebas Neue", sans-serif'}}>{p.name}</div>)}
                 </div>
                 <div style={{ fontSize: 24, fontFamily: '"Bebas Neue", sans-serif', color: 'var(--neon)', opacity: 0.5 }}>VS</div>
                 <div style={{ flex: 1, textAlign: 'right' }}>
                   <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', marginBottom: 8 }}>TEAM 2</div>
                   {matchAssigned.teams[1].map((p:any,i:number) => <div key={i} style={{fontSize: 16, fontWeight: 700, fontFamily: '"Bebas Neue", sans-serif'}}>{p.name}</div>)}
                 </div>
               </div>
            </div>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="section-label" style={{ textAlign: 'center', marginBottom: 0 }}>RECORD RESULT</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
                 <div style={{ textAlign: 'center' }}>
                   <input type="number" value={scores.team1} onChange={e => setScores({...scores, team1: parseInt(e.target.value)||0})} 
                     style={{ width: 80, height: 80, fontSize: '3rem', fontFamily: '"Bebas Neue", sans-serif', textAlign: 'center', padding: 0 }} />
                 </div>
                 <div style={{ textAlign: 'center' }}>
                   <input type="number" value={scores.team2} onChange={e => setScores({...scores, team2: parseInt(e.target.value)||0})} 
                     style={{ width: 80, height: 80, fontSize: '3rem', fontFamily: '"Bebas Neue", sans-serif', textAlign: 'center', padding: 0 }} />
                 </div>
              </div>
            </div>
            
            <button onClick={submitScore} className="btn-primary" style={{ width: '100%', padding: '20px', fontSize: 18 }}>
              SUBMIT SCORE
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
