import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || 'placeholder' });

export async function analyzePatientCase(patientData: any) {
  if (!apiKey || apiKey === 'placeholder') {
    // Return mock data if no API key
    return {
      confidence: 88,
      differentials: [
        { name: "Simulated Diagnosis A", prob: 88 },
        { name: "Simulated Diagnosis B", prob: 12 }
      ],
      riskLevel: "HIGH RISK",
      riskScore: 85,
      chain: [
        "1. Missing API Key - falling back to simulated analysis",
        "2. Please configure Gemini API key in AI Studio",
        "3. Proceeding with simulated clinical reasoning"
      ],
      actions: [
        { title: "Configure API Key", desc: "Set GEMINI_API_KEY to enable real AI.", type: "alert" }
      ]
    };
  }

  const prompt = `You are the MEDOS AI Master Supervisor, an advanced clinical reasoning engine.
Analyze this patient data and provide a highly technical, medical-grade diagnostic analysis.

PATIENT DATA:
Age/Gender: ${patientData.ageGender}
Status: ${patientData.status}
Vitals: ${JSON.stringify(patientData.vitals)}
Notes/Symptoms: ${patientData.notes || 'None provided'}

Output EXACTLY in this JSON format (no markdown formatting, just the raw JSON object string):
{
  "confidence": <number 0-100>,
  "riskLevel": "<short string, e.g., CRITICAL, MODERATE, STABLE>",
  "riskScore": <number 0-100>,
  "differentials": [
    { "name": "<Disease name>", "prob": <number 0-100> }
  ],
  "chain": [
    "<string explaining reasoning step 1>",
    "<string explaining reasoning step 2>"
  ],
  "actions": [
    { "title": "<action title>", "desc": "<action description>", "type": "alert" | "check" }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini AI Error:", err);
    throw err;
  }
}
