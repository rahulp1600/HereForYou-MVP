import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/mentor", async (req, res) => {
  try {
    const { message } = req.body;

    const resp = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a warm, concise mental health companion. Be supportive, not clinical.",
          },
          { role: "user", content: message },
        ],
        max_tokens: 120,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiText = resp.data.choices[0].message.content;
    res.json({ reply: aiText });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ reply: "Sorry, the AI mentor is unavailable." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log("AI server on http://localhost:" + PORT));
