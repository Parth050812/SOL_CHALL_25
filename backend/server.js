import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post("/generate-quiz/text", async (req, res) => {
  try {
    const { topic,context, numQuestions, difficulty, userId } = req.body;

    if (!topic ||!context || !numQuestions || !difficulty || !userId) {
      return res.status(400).json({ error: "Topic,Context, number of questions, difficulty, and userId are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create a ${difficulty} level quiz on the topic "${topic}" and context "${context}" . Generate ${numQuestions} multiple-choice questions with four answer options each. Return JSON format ONLY:
    
    [
      { "question": "<question text>", "options": ["A) <option1>", "B) <option2>", "C) <option3>", "D) <option4>"], "correctAnswer": "<correctOption>" }
    ]`;

    const aiResponse = await model.generateContent(prompt);
    let responseText = await aiResponse.response.text();

    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    let questions;
    try {
      questions = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert([{ title: topic, questions, user_id: userId }])
      .select();

    if (quizError) {
      console.error("Supabase error:", quizError.message);
      return res.status(500).json({ error: quizError.message });
    }

    res.json({ success: true, quizId: quizData[0].id });
  } catch (err) {
    console.error("Error in /generate-quiz/text:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/chatbot", async (req, res) => {
  try {
    const { question, options, correctAnswer, topic } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      **Quiz Topic:** ${topic}
      **Question:** ${question}
      **Options:**
      ${options.map((opt, i) => `- ${opt}`).join("\n")}
      **Correct Answer:** ${correctAnswer}
      Explain the correct answer in detail. Highlight important points using **bold formatting**. 
      Do **not** use a table format. Provide additional insights related to the topic.
      and end with a proper sentence in bold text give the correct option and answer 
    `;
    const response = await model.generateContent(prompt);

    let text = response.response.candidates[0].content.parts[0].text;

    text = text
      .replace(/\*\*(.*?)\*\*/g, "**$1**") 
      .replace(/\n/g, "\n\n") 
      .replace(/\n\s*\n/g, "\n"); 

    res.json({ response: text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ response: "Error fetching explanation." });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
