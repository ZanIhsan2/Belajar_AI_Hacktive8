import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const model = process.env.MODEL || "gemini-2.5-flash-lite";
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static("../client"));

app.get("/", (req, res) => {
  res.send("Hello Hacktiv8!");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { conversation } = req.body;

    // Validasi conversation exist dan berupa array
    if (!conversation || !Array.isArray(conversation)) {
      res.status(400).json({
        error: "Conversation is required",
      });
      return;
    }

    // Mapping data sesuai format
    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        temperature: 0.9,
        systemInstructions: "Jawab hanya menggunakan bahasa Indonesia.",
      },
    });

    // Debug: log response structure
    console.log(
      "Response object structure:",
      JSON.stringify(response, null, 2),
    );

    // Try to extract text from response
    let result;
    if (response.text && typeof response.text === "function") {
      result = response.text();
    } else if (response.text && typeof response.text === "string") {
      result = response.text;
    } else if (response.candidates && response.candidates[0]) {
      result = response.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unable to extract text from API response");
    }

    res.status(200).json({ result });
  } catch (error) {
    console.error("API Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
