const UI = {
  langBtn: document.getElementById('lang-btn'),
  analyzeBtn: document.getElementById('analyze-btn'),
  journalInput: document.getElementById('journal-input'),
  inputSection: document.getElementById('input-section'),
  loadingSection: document.getElementById('loading-section'),
  resultSection: document.getElementById('result-section'),
  errorMsg: document.getElementById('error-message'),
  
  dominantBadge: document.getElementById('dominant-badge'),
  dominantEmoji: document.getElementById('dominant-emoji'),
  dominantValue: document.getElementById('dominant-value'),
  secondaryBadge: document.getElementById('secondary-badge'),
  secondaryValue: document.getElementById('secondary-value'),
  summaryText: document.getElementById('summary-text'),
  messageText: document.getElementById('message-text'),
  
  musicBtn: document.getElementById('music-btn'),
  resetBtn: document.getElementById('reset-btn')
};

let currentLang = 'en';

const emotionsEmojis = {
  joy: "✨",
  calm: "🌊",
  sadness: "🌧️",
  anxiety: "⚡",
  determination: "🔥",
  exhaustion: "🌫️",
  nostalgia: "🌙",
  gratitude: "🌱",
  love: "❤️",
  anger: "💥",
  confusion: "🤔",
  hope: "🕊️",
  loneliness: "🧊",
  surprise: "🎆"
};

const translations = {
  en: {
    heroTitle: "Feel your day. See your mood.",
    placeholder: "Tell me about your day... what happened? how did you feel?",
    button: "Analyze my day",
    loading: "Reading your emotions...",
    dominant: "Dominant emotion",
    secondary: "Secondary emotion",
    summary: "Your day",
    message: "For you",
    reset: "Write a new day",
    musicOn: "Pause music",
    musicOff: "Play music"
  },
  es: {
    heroTitle: "Siente tu día. Observa tu estado de ánimo.",
    placeholder: "Cuéntame cómo fue tu día... ¿qué pasó? ¿cómo te sentiste?",
    button: "Analizar mi día",
    loading: "Leyendo tus emociones...",
    dominant: "Emoción dominante",
    secondary: "Emoción secundaria",
    summary: "Tu día",
    message: "Para ti",
    reset: "Escribir un nuevo día",
    musicOn: "Pausar música",
    musicOff: "Reproducir música"
  }
};

function updateUIStrings() {
  const t = translations[currentLang];
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      // Don't overwrite icon text like the dominant emoji if it's inside
      // We stored our text safely in child spans or purely text elements
      el.textContent = t[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) {
      el.placeholder = t[key];
    }
  });
  
  // Re-checking music state if Tone is available
  if (window.Tone && window.AuraAudio) {
      const isPlaying = window.Tone.Transport.state === "started";
      UI.musicBtn.textContent = isPlaying ? t.musicOn : t.musicOff;
  } else {
      UI.musicBtn.textContent = t.musicOff;
  }
}

UI.langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'es' : 'en';
  UI.langBtn.textContent = currentLang === 'en' ? 'EN | ES' : 'ES | EN';
  updateUIStrings();
});

UI.analyzeBtn.addEventListener('click', async () => {
  const text = UI.journalInput.value.trim();
  if (!text) return;

  UI.errorMsg.classList.add('hidden');
  UI.inputSection.classList.add('hidden');
  UI.loadingSection.classList.remove('hidden');

  try {
    const result = await window.AuraGemini.analyzeEmotion(text);
    showResult(result);
  } catch (err) {
    UI.errorMsg.textContent = err.message;
    UI.errorMsg.classList.remove('hidden');
    UI.loadingSection.classList.add('hidden');
    UI.inputSection.classList.remove('hidden');
  }
});

const emotionNames = {
  joy: { en: "Joy", es: "Alegría" },
  calm: { en: "Calm", es: "Calma" },
  sadness: { en: "Sadness", es: "Tristeza" },
  anxiety: { en: "Anxiety", es: "Ansiedad" },
  determination: { en: "Determination", es: "Determinación" },
  exhaustion: { en: "Exhaustion", es: "Agotamiento" },
  nostalgia: { en: "Nostalgia", es: "Nostalgia" },
  gratitude: { en: "Gratitude", es: "Gratitud" },
  love: { en: "Love", es: "Enamorado" },
  anger: { en: "Anger", es: "Enojo" },
  confusion: { en: "Confusion", es: "Confusión" },
  hope: { en: "Hope", es: "Esperanza" },
  loneliness: { en: "Loneliness", es: "Soledad" },
  surprise: { en: "Surprise", es: "Sorpresa" }
};

function getEmotionName(emotionId) {
  if (!emotionId || emotionId === "null") return '';
  const translated = emotionNames[emotionId];
  return translated ? translated[currentLang] : capitalize(emotionId);
}

// Listen to language changes to update emotion badges if result is visible
UI.langBtn.addEventListener('click', () => {
  if (!UI.resultSection.classList.contains('hidden')) {
      const domText = UI.dominantValue.getAttribute('data-raw-emotion');
      const secText = UI.secondaryValue.getAttribute('data-raw-emotion');
      if (domText) UI.dominantValue.textContent = getEmotionName(domText);
      if (secText) UI.secondaryValue.textContent = getEmotionName(secText);
  }
});

async function showResult(data) {
  UI.loadingSection.classList.add('hidden');
  UI.resultSection.classList.remove('hidden');

  const domEmotion = data.dominant_emotion;
  UI.dominantEmoji.textContent = emotionsEmojis[domEmotion] || "✨";
  
  // Store the raw id to translate it on the fly if user changes language
  UI.dominantValue.setAttribute('data-raw-emotion', domEmotion);
  UI.dominantValue.textContent = getEmotionName(domEmotion);
  
  if (data.secondary_emotion && data.secondary_emotion !== "null") {
    UI.secondaryValue.setAttribute('data-raw-emotion', data.secondary_emotion);
    UI.secondaryValue.textContent = getEmotionName(data.secondary_emotion);
    UI.secondaryBadge.classList.remove('hidden');
  } else {
    UI.secondaryValue.removeAttribute('data-raw-emotion');
    UI.secondaryBadge.classList.add('hidden');
  }

  UI.summaryText.textContent = data.summary;
  UI.messageText.textContent = data.message;

  window.AuraCanvas.updateState(domEmotion, data.params, data.intensity);
  
  // Ensure Tone Context starts after user interacted in analysis button
  if (Tone.context.state !== 'running') {
      await Tone.start();
  }
  
  await window.AuraAudio.playEmotionMusic(domEmotion, data.params);
  
  updateUIStrings(); // ensures pause music label
}

UI.musicBtn.addEventListener('click', async () => {
  if (Tone.context.state !== 'running') {
      await Tone.start();
  }

  const isPlaying = window.AuraAudio.toggleMusic();
  const t = translations[currentLang];
  UI.musicBtn.textContent = isPlaying ? t.musicOn : t.musicOff;
});

UI.resetBtn.addEventListener('click', () => {
  UI.journalInput.value = '';
  UI.resultSection.classList.add('hidden');
  UI.inputSection.classList.remove('hidden');
  
  window.AuraAudio.stopMusic();
  window.AuraCanvas.updateState('default', {});
  
  updateUIStrings();
});

// Initialize UI strings
updateUIStrings();
