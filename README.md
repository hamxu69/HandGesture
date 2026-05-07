# ✋ HandSense — Real-Time Gesture Recognition

A browser-based hand gesture recognizer powered by **MediaPipe Tasks Vision**.  
Runs 100% client-side — no backend, no server, no data sent anywhere.

## 🎯 Recognized Gestures

| Gesture | Description |
|---|---|
| ✋ Open Palm | All 5 fingers extended |
| ✊ Fist | All fingers curled |
| ✌️ Peace Sign | Index + middle extended |
| 👍 Thumbs Up | Only thumb extended |
| 👆 Pointing | Only index extended |

## 🚀 Deploy to Vercel (1 minute)

### Option A — Vercel CLI
```bash
npm i -g vercel
vercel
```
Follow the prompts. Done.

### Option B — Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your repo → click **Deploy**

> The `vercel.json` sets the required COOP/COEP headers automatically.

## 🖥️ Run Locally

Just open `index.html` via a local server (required for webcam access):

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```
Then visit `http://localhost:8080`.

> **Note:** Opening `index.html` directly as a `file://` URL will block camera access in most browsers.

## 🛠️ Tech Stack

- [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) — hand landmark detection
- Vanilla HTML + CSS + JS — zero build step, zero dependencies
- Pure geometric finger-state logic — no ML model training needed for gesture classification

## 📐 How It Works

MediaPipe detects 21 hand landmarks per frame. Gesture logic uses a simple geometric rule:

> **A finger is "extended" when its TIP is farther from the wrist than its PIP (middle) joint.**

This is computed for all 5 fingers, producing a `true/false` state vector that maps directly to each gesture.
