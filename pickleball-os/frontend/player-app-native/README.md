# Pickleball Player App (React Native / Expo)

## Cài đặt

```bash
cd pickleball-os/frontend/player-app-native
npm install
```

### Cấu hình Firebase
Mở `src/firebase.ts` và thay thế `firebaseConfig` với config của project của bạn.

```bash
npx expo start
```

Quét QR bằng Expo Go app, hoặc chạy trên simulator iOS/Android.

## Cấu trúc project

```
App.tsx                          ← Root + Navigation
src/
├── firebase.ts                  ← Firebase RTDB init
├── theme.ts                     ← Design tokens (Deep Navy)
├── store/
│   └── useEventStore.ts         ← Zustand + Firebase subscription
└── screens/
    └── LiveEvent/
        ├── LiveEventScreen.tsx   ← State machine router
        ├── CheckInView.tsx       ← Login (6-digit code)
        ├── QueueView.tsx         ← Queue + AI wait prediction
        └── MatchAssignedView.tsx ← Court flash + team cards
```

## Firebase data schema dự kiến

```
state/
  activeEventId: "ev_XYZ"
  announcement: "Sắp trao giải..."
  events: [{ id, name, courtFee, feePerPerson, date, location }]
  players: [{ id, name, elo, checkedIn, paid, viewerCode }]
  courts: [{ id, name, match: { team1, team2, dtype } }]
  queue: [{ team1, team2, dtype }]
```
