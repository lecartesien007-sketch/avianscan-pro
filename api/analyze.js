export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Seul le POST est autorisé' });
  }

  try {
    const { image, type } = JSON.parse(req.body);
    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = type === 'carnet' 
      ? "Tu es un expert en gestion avicole. Extrais les données de ce carnet (mortalité, nourriture, ponte) et présente-les sous forme de tableau propre avec un conseil financier."
      : "Tu es un vétérinaire avicole. Analyse ces fientes, identifie d'éventuels signes de maladie (coccidiose, etc.) et donne une recommandation immédiate.";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: image } }
          ]
        }]
      })
    });

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ result: resultText });
  } catch (error) {
    res.status(500).json({ error: "L'analyse a échoué", details: error.message });
  }
}
