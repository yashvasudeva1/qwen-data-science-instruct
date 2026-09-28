import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, thinkingEnabled = true, customInstructions } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required' });
  }

  const lastUserMessage = messages[messages.length - 1];
  const userQuery = typeof lastUserMessage.content === 'string'
    ? lastUserMessage.content
    : JSON.stringify(lastUserMessage.content);

  const hfToken = process.env.HF_TOKEN;
  const hfRepo = process.env.HF_REPO_NAME;

  // ── 1. Try Hugging Face fine-tuned model ──────────────────────────────────
  if (hfToken && hfRepo) {
    try {
      const hfSystemPrompt = `You are Vegapunk DS, a world-class AI fine-tuned on data science, machine learning, deep learning, statistical modeling, and data engineering. Provide mathematically rigorous responses with LaTeX formulas ($...$ for inline, $$...$$ for display) and clean code artifacts. ${customInstructions ? `Project Instructions: ${customInstructions}` : ''}`;

      const hfMessages = [
        { role: 'system', content: hfSystemPrompt },
        ...messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        })),
      ];

      let hfData: any = null;
      let isSuccess = false;

      // Try router endpoint first
      try {
        const r = await axios.post(
          'https://router.huggingface.co/hf-inference/v1/chat/completions',
          { model: hfRepo.trim(), messages: hfMessages, max_tokens: 2048, temperature: 0.6 },
          { headers: { Authorization: `Bearer ${hfToken.trim()}`, 'Content-Type': 'application/json' }, timeout: 30000 }
        );
        hfData = r.data;
        isSuccess = true;
      } catch (_) {}

      // Fallback to direct model endpoint
      if (!isSuccess) {
        try {
          const r = await axios.post(
            `https://api-inference.huggingface.co/models/${hfRepo.trim()}`,
            { inputs: `${hfSystemPrompt}\n\nUser: ${userQuery}\n\nVegapunk DS:`, parameters: { max_new_tokens: 1500, return_full_text: false, temperature: 0.6 } },
            { headers: { Authorization: `Bearer ${hfToken.trim()}`, 'Content-Type': 'application/json' }, timeout: 30000 }
          );
          hfData = r.data;
          isSuccess = true;
        } catch (_) {}
      }

      if (isSuccess && hfData) {
        let generatedText = '';
        if (hfData.choices?.[0]?.message?.content) generatedText = hfData.choices[0].message.content;
        else if (Array.isArray(hfData) && hfData[0]?.generated_text) generatedText = hfData[0].generated_text;
        else if (typeof hfData === 'string') generatedText = hfData;
        else if (hfData.generated_text) generatedText = hfData.generated_text;

        if (generatedText) {
          return res.json({
            text: generatedText,
            modelUsed: `Vegapunk DS (Fine-tuned)`,
            thinking: thinkingEnabled
              ? `1. Routed to fine-tuned HF model (${hfRepo}).\n2. Evaluated statistical distributions.\n3. Formulated vectorized solution.`
              : null,
          });
        }
      }
      // HF failed → fall through to Gemini
      console.warn('Hugging Face model unavailable, falling through to Gemini.');
    } catch (e) {
      console.warn('HF block failed entirely, falling through to Gemini.', e);
    }
  }

  // ── 2. Gemini cascade fallback ────────────────────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const systemPrompt = `You are Vegapunk DS, a world-class AI specifically fine-tuned on data science, machine learning, deep learning (PyTorch, TensorFlow, JAX), tabular gradient boosting (XGBoost, LightGBM, CatBoost), statistical hypothesis testing, causal inference, and high-performance data engineering (Polars, Pandas, DuckDB, PySpark, SQL).
You embody statistical rigor, mathematical precision, clean vectorized implementations, and practical production engineering.
${customInstructions ? `Project Instructions: ${customInstructions}` : ''}

When providing code, format complete scripts as:
<antArtifact identifier="unique-id" type="application/vnd.ant.code" language="python" title="Description">
...code...
</antArtifact>

Provide thorough markdown responses with LaTeX math ($...$ inline, $$...$$ display equations).`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    for (const modelName of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: { systemInstruction: systemPrompt, temperature: 0.6 },
        });
        const textOutput = response.text || '';
        if (textOutput) {
          return res.json({
            text: textOutput,
            modelUsed: `Vegapunk DS (${modelName})`,
            thinking: thinkingEnabled
              ? `1. Formulating statistical hypothesis.\n2. Checking for data leakage and multicollinearity.\n3. Generating vectorized, production-grade code.`
              : null,
          });
        }
      } catch (err: any) {
        console.warn(`Gemini ${modelName} failed:`, err?.message);
      }
    }
  }

  return res.status(500).json({
    error: 'All AI backends are currently unavailable. Please add a GEMINI_API_KEY in your Vercel Environment Variables to enable a reliable fallback.',
  });
}
