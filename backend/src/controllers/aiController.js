const https = require("https");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1";

// Helper function to make HTTPS requests
function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: data ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (data) {
      options.headers["Content-Length"] = Buffer.byteLength(data);
    }

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => { responseData += chunk; });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

// Function to get available models
async function getAvailableModels() {
  try {
    const url = `${GEMINI_BASE_URL}/models?key=${GEMINI_API_KEY}`;
    const response = await makeRequest(url);
    return response.models || [];
  } catch (err) {
    console.error("Error fetching models:", err);
    return [];
  }
}

exports.generateContent = async (req, res) => {
  const { postId, brief } = req.body;

  if (!brief) return res.status(400).json({ message: "Brief is required" });

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ message: "GEMINI_API_KEY not configured" });
  }

  try {
    // First, get available models
    const availableModels = await getAvailableModels();
    console.log("Available models:", availableModels.map(m => m.name));

    // Filter models that support generateContent
    const usableModels = availableModels.filter(model => 
      model.supportedGenerationMethods?.includes("generateContent")
    ).map(model => model.name.replace("models/", ""));

    if (usableModels.length === 0) {
      return res.status(500).json({
        message: "No models available with generateContent support",
        availableModels: availableModels.map(m => m.name),
        hint: "Your API key might not have access to Gemini models. Check https://aistudio.google.com/app/apikey"
      });
    }

    // Try each available model
    let lastError = null;
    for (const modelName of usableModels) {
      try {
        const prompt = `You are an AI content writer for blogs/case studies. Write content based on: ${brief}`;

        const apiUrl = `${GEMINI_BASE_URL}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
        
        const requestData = JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        });

        const response = await makeRequest(apiUrl, requestData);

        if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
          const generatedText = response.candidates[0].content.parts[0].text;
          return res.json({ ok: true, generatedText, model: modelName });
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (err) {
        lastError = err;
        console.log(`Model ${modelName} failed:`, err.message);
        // Continue to next model
        continue;
      }
    }

    // If all models failed
    console.error("All available models failed:", lastError);
    res.status(500).json({ 
      message: lastError?.message || "AI generation failed",
      error: "All available models failed to generate content.",
      availableModels: usableModels,
      lastError: lastError?.message
    });

  } catch (err) {
    console.error("Error in generateContent:", err);
    res.status(500).json({ 
      message: err.message || "Failed to generate content",
      error: "Could not fetch available models or generate content"
    });
  }
};

// Helper endpoint to check API key status and list available models
exports.listModels = async (req, res) => {
  try {
    const availableModels = await getAvailableModels();
    const usableModels = availableModels
      .filter(model => model.supportedGenerationMethods?.includes("generateContent"))
      .map(model => ({
        name: model.name.replace("models/", ""),
        displayName: model.displayName,
        description: model.description
      }));

    res.json({
      apiKeySet: !!GEMINI_API_KEY,
      apiKeyPrefix: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 15) + "..." : "Not set",
      apiKeyLength: GEMINI_API_KEY ? GEMINI_API_KEY.length : 0,
      totalModels: availableModels.length,
      usableModels: usableModels,
      allModels: availableModels.map(m => ({
        name: m.name,
        displayName: m.displayName,
        supportedMethods: m.supportedGenerationMethods
      })),
      note: usableModels.length > 0 
        ? "These models are available and will be used for generation."
        : "No models with generateContent support found. Check your API key."
    });
  } catch (err) {
    console.error("Error listing models:", err);
    res.status(500).json({ 
      error: err.message,
      hint: "Could not fetch models. Check your GEMINI_API_KEY."
    });
  }
};
