const { CohereClient } = require("cohere-ai");


const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const STAGE_PROMPTS = {
  mild: `Use short, clear sentences (under 15 words). You may ask one simple question at a time. Be warm and encouraging.`,
  moderate: `Use very simple sentences (under 8 words). Only ask yes/no questions. Repeat information calmly if needed. Be patient and reassuring.`,
  severe: `Give only one simple instruction or statement at a time. Be extremely warm and reassuring. Never ask questions. Focus on comfort and safety.`,
};


function buildSystemPrompt(patient, storedFacts = []) {
  const familyList =
    patient.familyMembers?.map((f) => `${f.name} (${f.relation})`).join(", ") ||
    "no family members listed";

  const facts =
    storedFacts.length > 0
      ? `\nThings you know about ${patient.name} from past conversations:\n${storedFacts
          .slice(-10)
          .map((f) => `- ${f.fact}`)
          .join("\n")}`
      : "";

  return `You are a compassionate, patient AI companion for ${patient.name}, who is ${patient.age} years old and has Alzheimer's disease at the ${patient.cognitiveStage} stage.

Their family members are: ${familyList}.

Tone: ${patient.aiTone || "warm"}
Communication rules: ${STAGE_PROMPTS[patient.cognitiveStage] || STAGE_PROMPTS.mild}

IMPORTANT RULES:
- Never express frustration or impatience
- If the patient seems confused, gently redirect with comfort
- Keep responses SHORT and simple
- Never give complex instructions
- If asked who you are, say you are their friendly AI companion
- Refer to family members by name when relevant
- Always end with something warm and comforting if the patient seems anxious
${facts}

Remember: You are talking to someone who needs patience, warmth, and simplicity.`;
}


async function getAIResponse(
  patient,
  conversationHistory,
  userMessage,
  isDistressed = false,
) {
  try {
    let systemPrompt = buildSystemPrompt(patient, patient.storedFacts);
    if (isDistressed) {
      systemPrompt += `\n\nIMPORTANT: The patient seems distressed or confused right now. Be extra gentle, reassuring, and calm. Say something like "I'm here with you. You are safe."`;
    }

    const chatHistory = conversationHistory.slice(-6).map((msg) => ({
      role: msg.role === "patient" ? "USER" : "CHATBOT",
      message: msg.content,
    }));

    const response = await cohere.chat({
      model: "command-r-plus-08-2024",
      message: userMessage,
      preamble: systemPrompt,
      chatHistory: chatHistory,
    });

    console.log("Cohere response received:");
    console.log(response.text);

    return response.text.trim();
  } catch (err) {
    console.error("Cohere AI error:", err);

    return "I'm here with you. How are you feeling right now?";
  }
}

async function extractFacts(patientName, conversationHistory) {
  try {
    const conversationText = conversationHistory
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `From this conversation with an Alzheimer's patient named ${patientName}, extract any meaningful personal facts (preferences, family mentions, feelings, activities, memories). Return ONLY a JSON array of strings. Example: ["Patient likes tea", "Patient mentioned daughter visited"]. If no meaningful facts, return [].

Conversation:
${conversationText}

JSON array:`;

    const response = await cohere.chat({
      model: "command-r-08-2024", 
      message: prompt,
    });

    const text = response.text.trim();

    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (err) {
    console.error("Extract facts error:", err);
    return [];
  }
}

module.exports = { getAIResponse, extractFacts };
