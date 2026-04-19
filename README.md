# ✨ AURA - Emotional Reflection Web App

**AURA** is an AI-powered web application (using **Gemini**) designed to transform your daily thoughts or experiences into an interactive visual canvas and an ambient generative musical piece. 

More than a simple journal, AURA aims to connect therapeutically and sensorially with fourteen distinct emotional variables through natural language analysis.

**Supported Emotions (14):**
1. ✨ Joy
2. 🌊 Calm
3. 🌧️ Sadness 
4. ⚡ Anxiety
5. 🔥 Determination
6. 🌫️ Exhaustion
7. 🌙 Nostalgia
8. 🌱 Gratitude
9. ❤️ Love
10. 💥 Anger
11. 🤔 Confusion
12. 🕊️ Hope
13. 🧊 Loneliness
14. 🎆 Surprise

---

## 🚀 Creation Process & Engineering

This project was developed under an architecture focused on ultra-high performance without heavy frameworks (Zero-Dependencies in visual Frontend), and maximum cybersecurity on the Backend. The development flow followed these phases:

### 1. The Brain (Gemini API Serverless)
To protect the AI access key against security leaks, we developed a secure proxy using **Vercel Serverless Functions** (`api/analyze.js`). The structure forces *Gemini 2.5 Flash* to emit an extremely strict JSON format containing direct instructions on dominant emotion, intensity levels, visual colors, and abstract parameters in the `params` object.

### 2. The Visual Engine (HTML5 Canvas + Particle Physics)
Instead of relying on heavy third-party graphic libraries, we created our own mathematical system in `js/canvas.js`:
* **Emotion Mapping:** 14 profiles defined with absolute precision. *Example: 'Joy' explodes in fast neon yellow, while 'Loneliness' lets one or two white particles fall with glacial slowness.*
* **Sprites and Emojis:** We mix fast rendering primitives with random rotation of text Emojis (25% of the time thematic emojis float around).
* **Anti-Lag Protections O(N²):** The code draws interactive web-like connections that respond to the user's mouse, but strict "Culling loops" were included to prevent exceeding 250 strokes per graphic frame, guaranteeing a constant 60FPS on mobile devices.

### 3. The Acoustic Design (Generative Tone.js)
The audio experience in `js/audio.js` was redesigned as an ambient lofi machine:
* **Background Pads:** Polychromatic pad structures playing specific chords per emotion (7ths for nostalgia, Pop progressions for hope, and dissonant tritones for anxiety).
* **Generative Melodies:** A second instrument creates melodies with calculated silences and arrhythmic intervals emulating "human breathing". Everything is bathed in huge, dynamically processed spatial reverb.

### 4. The Aesthetic (Ultra Premium Glassmorphism)
The visual file `styles.css` elevates the perception with refined typography (Google Outfit & Syne) and ultra-readable text cards. By emulating opaque crystals (`backdrop-filter: blur(40px) saturate(150%)`) and deep dynamic shadows, a screen was created that rivals the usability required when high-glare particles dance on the background canvas.

---

## 🛠 Environment and Installation (Professional Deployment)

This web app is designed to be instantly published using the **Vercel** ecosystem.

1. FORK or integrate this code using GIT.
2. Log in to [Vercel](https://vercel.com) and import your repository.
3. Before deploying, go to `Settings > Environment Variables`.
4. Define the environment so your AI backend function lives securely:
   ```bash
   Key: GEMINI_API_KEY
   Value: YOUR-KEY-HERE
   ```
5. Press "Deploy". Vercel will automatically enable `/api/analyze` based on the *Node.js 18+* engine without any extra configuration needed.

---

## 🧠 Summary of Features:
- Multi-language UI (Spanish / English dynamically translated).
- Precise identification of **14 distinct emotions**.
- Algorithmic atmospheric auditory generation.
- Visual physics with scalar kinetic algorithms (`Math.random`).
- Zero leaks (100% isolated Backend API).

*Created with passion, logic, and aesthetics.*
