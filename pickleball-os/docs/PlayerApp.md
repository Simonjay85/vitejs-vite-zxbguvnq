# Player App Interface Map
**Tech Stack**: React Native (Expo) or Next.js PWA, TailwindCSS (Deep Navy Theme), Zustand + Socket.io-client

The Player App focuses on an Apple Fitness/Strava style mobile experience.

## 1. Authentication & Onboarding
- **Screen**: Splash & Login via OAuth (Google/Apple).
- **Screen**: Profile Creation (Avatar, Display Name, Gender, Initial Self-Rating).
- **Style**: Glossy gradients (`linear-gradient(135deg, #00E0FF, #00FFA3)`), massive call-to-actions.

## 2. Main Navigation Tabs

### Tab 1: Live Event (Home)
- **Check-in View**: Huge `Scan QR` button or `Check In GPS` button.
- **Queue State**: 
  - Once checked in, displays `WAITING IN QUEUE`.
  - Shows AI prediction wait time: `预计 wait time: ~14 mins`.
  - Glass card showing other friends currently queued.
- **Match Assigned State**:
  - Screen flashes Cyan/Green.
  - Huge Text: `PROCEED TO COURT 4`.
  - Team A & B breakdown with Win Predictor (e.g. `Fairness: 51/49%`).

### Tab 2: Score Input
- **Active Form**:
  - Activated automatically when they reach the court.
  - Huge `PLUS` and `MINUS` buttons for Team A and Team B scores.
  - `SUBMIT WIN` triggers a confetti animation (`#00FFA3`) and updates Redis queue logic immediately.

### Tab 3: Leaderboard & Social (Strava Feed)
- **Feed View**: 
  - Chronological matches played locally. 
  - AI Recap posts: "Minh just hit a 5-match win streak!"
- **Leaderboard View**: List of all checked-in players ordered by Current Session ELO.

### Tab 4: Player Profile
- **Hero Tracker**: ELO graph mirroring an Apple Fitness stock chart.
- **Match History**: Infinite scroll of recent wins/losses and performance delta (e.g., `+12 points`, `-4 points`).
- **Partner Lock Options**: "Always play with X", "Don't play with Y" (Config panel).
