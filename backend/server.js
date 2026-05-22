import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PROMPTS = {
  professional: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE very concise professional comment (MAX 15-20 words). Focus on the core insight or news. Contribute one brief perspective. No fluff. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
  
  friendly: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE short, human comment (MAX 15 words). Respond to the story with a quick, supportive observation. Keep it very punchy. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
  
  collaboration: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE concise professional comment (MAX 20 words). Acknowledge a point and suggest a chat. Keep it brief and authentic. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
  
  insightful: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE insightful comment (MAX 20 words). Identify a deeper trend, implication, or angle others might miss. Sound sharp but not arrogant. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
  
  curious: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE curious comment (MAX 20 words). Ask a thoughtful follow-up question that moves the conversation forward. Show genuine interest. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
  
  supportive: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE supportive comment (MAX 15 words). Offer genuine encouragement or appreciation. Be warm but not over-the-top. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
  
  constructive: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE constructive comment (MAX 20 words). Offer a respectful counterpoint or alternative perspective. Be polite and evidence-based. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
  
  enthusiastic: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE enthusiastic comment (MAX 15 words). React with genuine excitement and energy. Use an exclamation. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
  
  witty: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE witty comment (MAX 15 words). Make a clever observation or playful joke about the content. Keep it smart, not mean. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
  
  empathetic: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE empathetic comment (MAX 20 words). Connect with the human side of the post. Show you understand their experience. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
  
  thoughtful: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE thoughtful comment (MAX 20 words). Offer a reflective, balanced take. Consider nuance and acknowledge complexity. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
  
  minimal: (postRef, postText, languageInstruction) => 
    `Read this ${postRef} and write ONE ultra-short comment (MAX 8 words). A quick reaction or one-liner. Punchy, memorable, stops the scroll. ${languageInstruction} Return ONLY the comment text:\n\n${postText}`,
};

const TOKEN_LIMITS = {
  professional: 80,
  friendly: 60,
  collaboration: 80,
  insightful: 80,
  curious: 80,
  supportive: 60,
  constructive: 80,
  enthusiastic: 60,
  witty: 60,
  empathetic: 80,
  thoughtful: 80,
  minimal: 40,
};

app.post("/generate", async (req, res) => {
  const { postText, type, language = "en" } = req.body;

  let prompt;
  let maxTokens;
  
  const languageInstruction = language === "bn" 
    ? "Write the comment in Bengali language." 
    : "Write the comment in English language.";
  
  const postRef = "post";
  
  if (PROMPTS[type]) {
    prompt = PROMPTS[type](postRef, postText, languageInstruction);
    maxTokens = TOKEN_LIMITS[type] || 80;
  } else {
    return res.status(400).json({ error: "Invalid comment type" });
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
  console.log("AI Comment Generator backend running on port 5000");
});
