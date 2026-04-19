export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Journal text is required." });
  }

  // The API key is safely hidden inside Vercel's Environment Variables
  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: "Server missing GEMINI_API_KEY environment variable." });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const prompt = `Analyze the following text where a person describes their day.
Identify the dominant emotions and respond ONLY with a valid JSON object 
using this exact structure, no extra text, no markdown, no code blocks:

{
  "dominant_emotion": "[one of: joy, calm, sadness, anxiety, determination, exhaustion, nostalgia, gratitude, love, anger, confusion, hope, loneliness, surprise]",
  "secondary_emotion": "[same options or null]",
  "intensity": [number between 0.1 and 1.0],
  "summary": "[2-3 sentences describing the day emotionally, written in the same language as the user's text]",
  "message": "[1-2 sentence empathetic and encouraging message, written in the same language as the user's text]",
  "params": {
    "particle_speed": [0.1 to 1.0],
    "particle_count": [20 to 200],
    "particle_size": [1 to 6],
    "tempo_bpm": [40 to 150],
    "musical_scale": "[major, minor, pentatonic, chromatic]",
    "wave_type": "[sine, triangle, square, sawtooth]"
  }
}

User text: "${text.replace(/"/g, '\\"')}"`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Gemini Error: ${errorText}` });
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        return res.status(403).json({ error: "Response blocked or empty from Gemini." });
    }

    let resultText = data.candidates[0].content.parts[0].text;
    
    try {
        const parsedData = JSON.parse(resultText);
        return res.status(200).json(parsedData);
    } catch (e) {
        return res.status(500).json({ error: "Gemini returned text, but not a valid JSON." });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
