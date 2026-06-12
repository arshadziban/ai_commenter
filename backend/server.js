import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
  question: 60,
};

// Comment styles (used when no commentText in body)
const COMMENT_STYLES = {
  professional: (postText, lang) =>
    `Read this post and write ONE very concise professional comment (MAX 15-20 words). Focus on the core insight or news. Contribute one brief perspective. No fluff. ${lang} Return ONLY the comment text:\n\n${postText}`,
  friendly: (postText, lang) =>
    `Read this post and write ONE short, human comment (MAX 15 words). Respond to the story with a quick, supportive observation. Keep it very punchy. ${lang} Return ONLY the comment text:\n\n${postText}`,
  collaboration: (postText, lang) =>
    `Read this post and write ONE concise professional comment (MAX 20 words). Acknowledge a point and suggest a chat. Keep it brief and authentic. ${lang} Return ONLY the comment text:\n\n${postText}`,
  insightful: (postText, lang) =>
    `Read this post and write ONE insightful comment (MAX 20 words). Identify a deeper trend, implication, or angle others might miss. Sound sharp but not arrogant. ${lang} Return ONLY the comment text:\n\n${postText}`,
  curious: (postText, lang) =>
    `Read this post and write ONE curious comment (MAX 20 words). Ask a thoughtful follow-up question that moves the conversation forward. Show genuine interest. ${lang} Return ONLY the comment text:\n\n${postText}`,
  supportive: (postText, lang) =>
    `Read this post and write ONE supportive comment (MAX 15 words). Offer genuine encouragement or appreciation. Be warm but not over-the-top. ${lang} Return ONLY the comment text:\n\n${postText}`,
  constructive: (postText, lang) =>
    `Read this post and write ONE constructive comment (MAX 20 words). Offer a respectful counterpoint or alternative perspective. Be polite and evidence-based. ${lang} Return ONLY the comment text:\n\n${postText}`,
  enthusiastic: (postText, lang) =>
    `Read this post and write ONE enthusiastic comment (MAX 15 words). React with genuine excitement and energy. Use an exclamation. ${lang} Return ONLY the comment text:\n\n${postText}`,
  witty: (postText, lang) =>
    `Read this post and write ONE witty comment (MAX 15 words). Make a clever observation or playful joke about the content. Keep it smart, not mean. ${lang} Return ONLY the comment text:\n\n${postText}`,
  empathetic: (postText, lang) =>
    `Read this post and write ONE empathetic comment (MAX 20 words). Connect with the human side of the post. Show you understand their experience. ${lang} Return ONLY the comment text:\n\n${postText}`,
  thoughtful: (postText, lang) =>
    `Read this post and write ONE thoughtful comment (MAX 20 words). Offer a reflective, balanced take. Consider nuance and acknowledge complexity. ${lang} Return ONLY the comment text:\n\n${postText}`,
  minimal: (postText, lang) =>
    `Read this post and write ONE ultra-short comment (MAX 8 words). A quick reaction or one-liner. Punchy, memorable, stops the scroll. ${lang} Return ONLY the comment text:\n\n${postText}`,
  question: (postText, lang) =>
    `Read this post and write ONE curious follow-up question (MAX 20 words). The answer must NOT already be in the post — ask something the author hasn't mentioned yet, so they are compelled to reply and share more. ${lang} Return ONLY the question text:\n\n${postText}`,
};

function buildReplyContext(postText, commentText, parentCommentText) {
  let ctx = `Post: "${postText}"`;
  if (parentCommentText) ctx += `\nMain comment: "${parentCommentText}"`;
  if (commentText) ctx += `\nReplying to: "${commentText}"`;
  return ctx;
}

// Reply intents (used when commentText is present in body)
const REPLY_STYLES = {
  thank_you: (postText, commentText, parentCommentText, lang) =>
    `${buildReplyContext(postText, commentText, parentCommentText)}\n\nWrite ONE genuine thank-you reply (MAX 15 words). Express real gratitude, not just a generic thanks. ${lang} Return ONLY the reply text.`,
  welcome: (postText, commentText, parentCommentText, lang) =>
    `${buildReplyContext(postText, commentText, parentCommentText)}\n\nWrite ONE warm "you're welcome" reply (MAX 15 words). The person has thanked you — respond graciously and make them feel it was no trouble. Do NOT say "thank you". ${lang} Return ONLY the reply text.`,
  question: (postText, commentText, parentCommentText, lang) =>
    `${buildReplyContext(postText, commentText, parentCommentText)}\n\nWrite ONE curious follow-up question (MAX 20 words) inspired by the post: "${postText}". The answer must NOT already be in the post — ask something the author hasn't mentioned yet, so they are compelled to reply and share more. ${lang} Return ONLY the question text.`,
  agree: (postText, commentText, parentCommentText, lang) =>
    `${buildReplyContext(postText, commentText, parentCommentText)}\n\nWrite ONE reply that agrees (MAX 15 words). Validate the point and briefly add why you agree. Keep it natural. ${lang} Return ONLY the reply text.`,
  disagree: (postText, commentText, parentCommentText, lang) =>
    `${buildReplyContext(postText, commentText, parentCommentText)}\n\nWrite ONE respectful reply that politely disagrees (MAX 20 words). Offer a brief counter-argument. Stay civil and constructive. ${lang} Return ONLY the reply text.`,
  add_insight: (postText, commentText, parentCommentText, lang) =>
    `${buildReplyContext(postText, commentText, parentCommentText)}\n\nWrite ONE reply that adds insight (MAX 20 words). Add a new angle, fact, or perspective. ${lang} Return ONLY the reply text.`,
  compliment: (postText, commentText, parentCommentText, lang) =>
    `${buildReplyContext(postText, commentText, parentCommentText)}\n\nWrite ONE genuine compliment reply (MAX 15 words). Praise a specific point or insight, not a vague "great comment". ${lang} Return ONLY the reply text.`,
  funny: (postText, commentText, parentCommentText, lang) =>
    `${buildReplyContext(postText, commentText, parentCommentText)}\n\nWrite ONE witty, light-hearted reply (MAX 15 words). A clever, playful reaction. Keep it friendly, not sarcastic. ${lang} Return ONLY the reply text.`,
  keep_in_touch: (postText, commentText, parentCommentText, lang) =>
    `${buildReplyContext(postText, commentText, parentCommentText)}\n\nWrite ONE reply that opens the door to connect further (MAX 20 words). Invite a DM or further conversation naturally. ${lang} Return ONLY the reply text.`,
};

function cleanOutput(text) {
  return text
    .replace(/\*\*Option \d+.*?\*\*/gi, '')
    .replace(/^>\s*/gm, '')
    .replace(/\*\*/g, '')
    .split('\n')[0]
    .trim();
}

const REPLY_TOKEN_LIMITS = {
  thank_you: 60,
  welcome: 60,
  question: 80,
  agree: 60,
  disagree: 80,
  add_insight: 80,
  compliment: 60,
  funny: 60,
  keep_in_touch: 80,
};

app.post("/generate", async (req, res) => {
  const { postText, commentText, parentCommentText, type, isReply: isReplyFlag } = req.body;

  if (!postText || typeof postText !== "string" || postText.trim().length < 10) {
    return res.status(400).json({ error: "Invalid post text" });
  }
  if (postText.length > 10000) {
    return res.status(400).json({ error: "Post text too long" });
  }

  const isReply = isReplyFlag === true || (typeof commentText === "string" && commentText.trim().length >= 2);

  if (isReply) {
    if (!REPLY_STYLES[type]) return res.status(400).json({ error: "Invalid reply type" });
    if (commentText && commentText.length > 2000) return res.status(400).json({ error: "Comment text too long" });
  } else {
    if (!COMMENT_STYLES[type]) return res.status(400).json({ error: "Invalid comment type" });
  }

  const safeCommentText = (commentText || "").trim();
  const safeParentCommentText = (parentCommentText || "").trim();

  const lang = isReply
    ? "Detect the language of the post and reply in that same language."
    : "Detect the language of the post and write the comment in that same language.";

  const prompt = isReply
    ? REPLY_STYLES[type](postText.trim(), safeCommentText, safeParentCommentText, lang)
    : COMMENT_STYLES[type](postText.trim(), lang);

  const maxTokens = isReply ? (REPLY_TOKEN_LIMITS[type] || 80) : (TOKEN_LIMITS[type] || 80);

  const systemMsg = isReply
    ? "You are a helpful assistant that writes single, concise LinkedIn comment replies. Your reply MUST be directly relevant to the post content provided. Return ONLY the reply text without any options, labels, or formatting."
    : "You are a helpful assistant that writes single, concise LinkedIn comments. Return ONLY the comment text without any options, labels, or formatting.";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error ${response.status}:`, errorText);
      return res.status(500).json({ error: `API error: ${response.status}` });
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message) {
      return res.status(500).json({ error: "Invalid API response" });
    }

    res.json({ comment: cleanOutput(data.choices[0].message.content) });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate" });
  }
});

app.listen(3001, () => {
  console.log("AI Comment Generator backend running on port 3001");
});
