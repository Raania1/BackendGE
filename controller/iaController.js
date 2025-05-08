import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,

});

export const generateDescription = async (req, res) => {
  const { keywords } = req.body;

  if (!keywords || !Array.isArray(keywords)) {
    return res.status(400).json({ error: "Le champ 'keywords' est requis et doit être un tableau." });
  }

  const prompt = `Voici des mots-clés : ${keywords.join(", ")}. Rédige une description professionnelle pour un prestataire de service à partir de ces mots.`;

  try {
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    const description = response.choices[0].message.content;
    res.json({ description });
  } catch (error) {
    console.error("Erreur OpenAI :", error.message);
    res.status(500).json({ error: "Erreur lors de la génération de la description." });
  }
};
