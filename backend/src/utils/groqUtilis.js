const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn("GROQ_API_KEY not set in environment variables.");
}

const generateEmailHTMLFromTemplate = async (promptContent) => {
  console.log(typeof promptContent);
  console.log(promptContent);
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are an expert email copywriter and HTML email designer.",
          },
          {
            role: "user",
            content: promptContent,
          },
        ],
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "Error generating email HTML via Groq API:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  generateEmailHTMLFromTemplate,
};
