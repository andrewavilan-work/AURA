/**
 * Analyzes text securely via Vercel Serverless Function.
 * The API key is safely hidden on the server environment.
 * @param {string} text - User's journal entry
 * @returns {Promise<Object>} JSON response parsed
 */
async function analyzeEmotion(text) {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: Vercel server error.`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Fallback to plain text if server didn't respond json
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error("Exception in analyzeEmotion:", error);
    throw new Error(error.message || "Failed to process your feelings on the server. Please try again.");
  }
}

// Global exposure
window.AuraGemini = {
  analyzeEmotion
};
