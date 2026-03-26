import type { CSSProperties } from 'react';
// ── Core palette (Pickleball Hub — Deep Navy + Cyan)
export const G = {
  bg:     "#0a1628",
  panel:  "#111e30",
  card:   "#152035",
  border: "#1e3050",
  accent: "#00e5ff",   // cyan
  blue:   "#1565c0",
  gold:   "#ffc107",
  red:    "#ef5350",
  purple: "#7c4dff",
  pink:   "#f48fb1",
  text:   "#e8f4fd",
  muted:  "#4a6882",
  dim:    "#253d55",
};

// ── Skill system
export const SKILL_LEVELS = ["2.0","2.5","3.0","3.5","3.5+"] as const;
export type SkillLevel = typeof SKILL_LEVELS[number];
export const SKILL_COLOR: Record<string,string> = {
  "2.0":"#8baab8", "2.5":"#4fc3f7", "3.0":"#26a69a", "3.5":"#ffa726", "3.5+":"#ef5350"
};
export const SKILL_DESC: Record<string,string> = {
  "2.0":"Mới bắt đầu", "2.5":"Cơ bản", "3.0":"Trung bình", "3.5":"Khá tốt", "3.5+":"Nâng cao"
};
export const SKILL_ELO: Record<string,number> = {
  "2.0":1050, "2.5":1160, "3.0":1290, "3.5":1420, "3.5+":1570
};

// ── Dtype system
export const DTYPE_OPT = [
  {val:"mixed", label:"⚥ Nam-Nữ",  desc:"1 nam+1 nữ", color:"#7c4dff"},
  {val:"male",  label:"♂ Đôi Nam", desc:"Toàn nam",   color:"#4fc3f7"},
  {val:"female",label:"♀ Đôi Nữ", desc:"Toàn nữ",    color:"#f48fb1"},
  {val:"any",   label:"⭐ Mix",    desc:"Bất kỳ",     color:"#00e5ff"},
] as const;

// ── SEPC Tier system
export const getTier = (k: number) => {
  if(k<0)  return {name:"Hạng Chì", color:"#4a6882", next:0,    prev:-50, icon:"⚙️"};
  if(k<15) return {name:"Đồng",     color:"#cd7f32", next:15,   prev:0,   icon:"🥉"};
  if(k<35) return {name:"Bạc",      color:"#c0c0c0", next:35,   prev:15,  icon:"🥈"};
  if(k<70) return {name:"Vàng",     color:"#ffd700", next:70,   prev:35,  icon:"🥇"};
  return           {name:"Elite",   color:"#00e5ff", next:null, prev:70,  icon:"💎"};
};

// ── Roles
export const ROLES = {SA:"super_admin", HOST:"host", VIEWER:"viewer"} as const;

// ── Component style presets (inline style objects — match new CSS vars)
export const iS: CSSProperties = {
  background: "#0d1e35", border: "1px solid #1e3050", borderRadius: 8,
  padding: "9px 12px", color: "#e8f4fd", fontSize: 13, outline: "none",
  width: "100%", boxSizing: "border-box", fontFamily: "inherit",
};
export const bP: CSSProperties = {
  padding: "9px 18px", borderRadius: 8, border: "none",
  background: "linear-gradient(90deg,#00bcd4,#1565c0)",
  color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12,
  letterSpacing: "0.4px", boxShadow: "0 4px 15px rgba(0,188,212,0.25)",
};
export const bS: CSSProperties = {
  padding: "7px 14px", borderRadius: 8, border: "1px solid #1e3050",
  background: "transparent", color: "#4a6882", fontWeight: 600, cursor: "pointer", fontSize: 11,
};
export const bR: CSSProperties = {
  padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(239,83,80,0.35)",
  background: "transparent", color: "#ef5350", fontWeight: 600, cursor: "pointer", fontSize: 10,
};


// ── Utils
export const safe = (v: any): string => (v && typeof v === "string") ? v : "";
export const uid  = () => Math.random().toString(36).slice(2,9).toUpperCase();
export const rng  = (a: number, b: number) => Math.floor(Math.random()*(b-a+1))+a;
export const nowStr   = () => new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});
export const todayStr = () => new Date().toLocaleDateString("vi-VN",{weekday:"short",day:"2-digit",month:"2-digit",year:"numeric"});
export const genCode  = () => String(Math.floor(100000 + Math.random() * 900000));
export const teamElo  = (t: any[]): number => t?.length ? Math.round(t.reduce((s,p) => s+(p?.elo||0), 0)/t.length) : 0;
export const skillElo = (s: string): number => (SKILL_ELO[s]||1200)+rng(-50,50);
export const validScore = (a: number, b: number): boolean => {
  if(isNaN(a)||isNaN(b)||a<0||b<0||a===b) return false;
  const w=Math.max(a,b), l=Math.min(a,b);
  return l<10 ? w===11 : w-l===2;
};
export const getWinner = (a: number, b: number): number|null => validScore(a,b) ? (a>b?1:2) : null;

export function sepc(player: any, history: any[]): number {
  if(!player||!history) return 0;
  let k=0;
  history.forEach(h => {
    if(!h?.team1||!h?.team2) return;
    const in1=h.team1.some((p:any)=>p?.id===player.id), in2=h.team2.some((p:any)=>p?.id===player.id);
    if(!in1&&!in2) return;
    const won=(in1&&h.winner===1)||(in2&&h.winner===2);
    const my=(in1?h.team1:h.team2).filter(Boolean), opp=(in1?h.team2:h.team1).filter(Boolean);
    const diff=teamElo(opp)-teamElo(my), margin=Math.abs((h.scoreWinner||11)-(h.scoreLoser||0));
    let pts=won?10:-3; pts+=(diff/100)*(won?4:-2); pts+=won?Math.min(margin*0.5,4):-(margin*0.2);
    k+=pts;
  });
  return Math.round(k*10)/10;
}

// ── Legacy Theme export (backwards compat)
export const Theme = {
  colors: {
    bg: G.bg,
    panel: G.panel,
    card: G.card,
    border: G.border,
    text: { primary: G.text, muted: G.muted, dim: G.dim },
    accent: {
      neonGreen: G.accent,
      cyan: G.blue,
      gradient: `linear-gradient(135deg, ${G.accent}, ${G.blue})`,
      glow: G.accent+"25",
      gold: G.gold,
    },
    status: { win: "#22C55E", lose: G.red, warning: G.gold, info: G.blue }
  },
  shadows: {
    glow: `0 8px 32px ${G.accent}25`,
    card: "0 4px 16px rgba(0,0,0,0.2)",
    panel: `0 20px 60px ${G.blue}14`
  },
  radii: { sm: "8px", md: "12px", lg: "16px", xl:"24px", full: "9999px" }
};


