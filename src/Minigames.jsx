import { useState, useEffect } from "react";

const BOARD_SIZE = 20;

export default function Minigames() {
  const [snake, setSnake] = useState([{x:10, y:10}]);
  const [food, setFood] = useState({x:15, y:15});
  const [dir, setDir] = useState({x:0, y:-1});
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setSnake(s => {
        const head = s[0];
        const newHead = {x: head.x + dir.x, y: head.y + dir.y};
        
        // Wall collision -> Game Over
        if (newHead.x < 0 || newHead.x >= BOARD_SIZE || newHead.y < 0 || newHead.y >= BOARD_SIZE) {
          setPlaying(false);
          return s;
        }
        // Self collision -> Game Over
        if (s.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setPlaying(false);
          return s;
        }
        
        const newSnake = [newHead, ...s];
        
        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(c => c + 1);
          setFood({
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE)
          });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [playing, dir, food]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!playing) return;
      if (['ArrowUp', 'w', 'W'].includes(e.key) && dir.y === 0) setDir({x: 0, y: -1});
      if (['ArrowDown', 's', 'S'].includes(e.key) && dir.y === 0) setDir({x: 0, y: 1});
      if (['ArrowLeft', 'a', 'A'].includes(e.key) && dir.x === 0) setDir({x: -1, y: 0});
      if (['ArrowRight', 'd', 'D'].includes(e.key) && dir.x === 0) setDir({x: 1, y: 0});
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir, playing]);

  const reset = () => {
    setSnake([{x:10, y:10}]);
    setDir({x:0, y:-1});
    setScore(0);
    setPlaying(true);
  };

  return (
    <div style={{background: "#080f1e", borderRadius: 12, padding: 16, border: "1px solid #172840", height: "100%", display: "flex", flexDirection: "column"}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12}}>
        <div style={{fontSize: 14, fontWeight: 900, color: "#a78bfa", letterSpacing: 1}}>🐍 SNAKE GAME</div>
        <div style={{color: "#00c9a7", fontWeight: 700}}>Score: {score}</div>
      </div>
      <div style={{flex: 1, position: "relative", background: "#050d18", border: "2px solid #172840", borderRadius: 8, overflow: "hidden", minHeight: 200}}>
        {!playing && (
          <div style={{position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10}}>
            <div style={{fontSize: 18, color: "white", fontWeight: 800, marginBottom: 12}}>{score > 0 ? `Game Over! Score: ${score}` : "Let's Play"}</div>
            <button onClick={reset} style={{padding: "8px 24px", borderRadius: 8, background: "#a78bfa", color: "#fff", fontWeight: 800, border: "none", cursor: "pointer"}}>PLAY</button>
          </div>
        )}
        {snake.map((seg, i) => (
          <div key={i} style={{position: "absolute", left: `${(seg.x/BOARD_SIZE)*100}%`, top: `${(seg.y/BOARD_SIZE)*100}%`, width: `${(1/BOARD_SIZE)*100}%`, height: `${(1/BOARD_SIZE)*100}%`, background: i === 0 ? "#a78bfa" : "#8b5cf6", borderRadius: 2}} />
        ))}
        <div style={{position: "absolute", left: `${(food.x/BOARD_SIZE)*100}%`, top: `${(food.y/BOARD_SIZE)*100}%`, width: `${(1/BOARD_SIZE)*100}%`, height: `${(1/BOARD_SIZE)*100}%`, background: "#f43f5e", borderRadius: "50%"}} />
      </div>
      <div style={{marginTop: 12, fontSize: 10, color: "#4a6480", textAlign: "center"}}>Use <kbd>W,A,S,D</kbd> or <kbd>Arrow Keys</kbd> to play</div>
    </div>
  );
}
