# Admin Dashboard Interface Map
**Tech Stack**: Next.js, TailwindCSS (Deep Navy Theme), Zustand (State), Socket.io-client

The Admin dashboard is a desktop-optimized command center for the Host.

## 1. Global Navigation & Status Bar
- Shows active Venue, connected clients (Websocket heartbeat)
- Global Stats: Total Queue Size, Active Match Count, Dispute Alerts (🔴)

## 2. Views / Screens

### A. Live Operations Center (Default)
Displays the real-time event status.
- **Active Courts Grid**: 
  - Glassmorphic `#111827` cards with Cyan glow.
  - Live MM:SS timer running.
  - Quick actions: `Force Stop`, `Swap Player`.
- **Matchmaker Panel (AI Integration)**:
  - Sidebar showing the NEXT generated `MatchProposal`.
  - Admin sees the *Fairness Confidence* `(85%)` and *Explanation Reasons*.
  - Buttons: `[Override]`, `[Regenerate]`, `[Assign to Court 2]`.
- **Live Queue Table**:
  - Highlights players waiting > 20 mins in Orange/Red.

### B. Dispute Management
- When opposing teams enter conflicting scores (e.g. A says `11-9`, B says `5-11`).
- Admin resolves by selecting the true score.

### C. Analytics & Configuration
- Live chart of ELO distribution.
- Config panel to modify the `RuleConfig` JSON hot-swapping matchmaking constraints:
  - Sliders for `Prioritize Skill Balance` vs `Prioritize Queue Times`.

## State Sync
Zustand stores the state of `courts` and `queue`. App listens to Redis `court:assign` and `queue:update` events via the API Gateway WebSocket wrapper.
