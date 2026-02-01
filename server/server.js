const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: process.env.SYSTEM_PROMPT || "Default system prompt"
                },
                {
                    role: "user",
                    content: message
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 150,
        });

        const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

        res.json({ reply });

    } catch (error) {
        console.error("Error in chat endpoint:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
