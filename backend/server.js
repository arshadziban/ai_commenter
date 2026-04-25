import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  const { postText, type, language = "en" } = req.body;

  let prompt;
  let maxTokens;
  
  const languageInstruction = language === "bn" 
    ? "Write the comment in Bengali language." 
    : "Write the comment in English language.";
  
  if (type === "professional") {
    prompt = `Write ONE short professional LinkedIn comment (1-2 sentences) for this post. ${languageInstruction} Return ONLY the comment text, no options, no labels, no explanations:\n\n${postText}`;
    maxTokens = 80;
  } else if (type === "friendly") {
    prompt = `Write ONE short friendly LinkedIn comment (1-2 sentences) for this post. ${languageInstruction} Return ONLY the comment text, no options, no labels, no explanations:\n\n${postText}`;
    maxTokens = 80;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that writes single, concise LinkedIn comments. Return ONLY the comment text without any options, labels, or formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: `API error: ${response.status}` });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: "Invalid API response" });
    }

    let comment = data.choices[0].message.content.trim();
    
    // Clean up the comment - remove any option labels or formatting
    comment = comment.replace(/\*\*Option \d+.*?\*\*/gi, '');
    comment = comment.replace(/^>\s*/gm, '');
    comment = comment.replace(/\*\*/g, '');
    comment = comment.split('\n')[0]; // Take only first line if multiple
    comment = comment.trim();

    res.json({ comment });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate comment" });
  }
});

app.listen(5000, () => {
  // Server running silently
});
