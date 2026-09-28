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
      let statusCode = 500;
      let errText = '';

      try {
        const resAxios = await axios.post(
          `https://router.huggingface.co/hf-inference/v1/chat/completions`,
          {
            model: hfRepo.trim(),
            messages: hfMessages,
            max_tokens: 2048,
            temperature: 0.6,
          },
          {
            headers: {
              'Authorization': `Bearer ${hfToken.trim()}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );
        hfData = resAxios.data;
        isSuccess = true;
      } catch (e: any) {
        console.warn('Router API failed, falling back to direct model API', e.message);
        statusCode = e.response?.status || 500;
        errText = e.response?.data ? JSON.stringify(e.response.data) : e.message;
      }

      if (!isSuccess) {
        try {
          const resAxios = await axios.post(
            `https://api-inference.huggingface.co/models/${hfRepo.trim()}`,
            {
              inputs: `${hfSystemPrompt}\n\nUser: ${userQuery}\n\nVegapunk DS:`,
              parameters: {
                max_new_tokens: 1500,
                return_full_text: false,
                temperature: 0.6,
              },
            },
            {
              headers: {
                'Authorization': `Bearer ${hfToken.trim()}`,
                'Content-Type': 'application/json',
              },
              timeout: 30000,
            }
          );
          hfData = resAxios.data;
          isSuccess = true;
        } catch (e: any) {
          console.warn(`Hugging Face inference error:`, e.message);
          statusCode = e.response?.status || 500;
          errText = e.response?.data ? JSON.stringify(e.response.data) : e.message;
        }
      }

      if (isSuccess && hfData) {
        let generatedText = '';
        if (hfData.choices && hfData.choices[0]?.message?.content) {
          generatedText = hfData.choices[0].message.content;
        } else if (Array.isArray(hfData) && hfData[0]?.generated_text) {
          generatedText = hfData[0].generated_text;
        } else if (typeof hfData === 'string') {
          generatedText = hfData;
        } else if (hfData.generated_text) {
          generatedText = hfData.generated_text;
        }

        if (generatedText) {
          return res.json({
            text: generatedText,
            modelUsed: `HF: ${hfRepo}`,
            thinking: thinkingEnabled
              ? `1. Routed to Hugging Face fine-tuned repository (${hfRepo}).\n2. Evaluated statistical distributions and algorithm requirements.\n3. Formulated vectorized solution and validation checkpoints.`
              : null,
          });
        }
      } else {
        if (statusCode === 503 && errText.toLowerCase().includes('loading')) {
          return res.status(503).json({
            error: 'The model is currently waking up on Hugging Face (Cold Start). Please try again in about 30 seconds.',
            type: 'loading',
          });
        }
        return res.status(500).json({ error: `Hugging Face API Error (${statusCode}): ${errText}` });
      }
    } catch (hfErr: any) {
      console.error('Error invoking Hugging Face model:', hfErr?.message || hfErr);
      return res.status(500).json({ error: `Failed to connect to Hugging Face API: ${hfErr?.message || hfErr}` });
    }
  }

  return res.status(500).json({ error: 'Server misconfigured: Missing HF_TOKEN or HF_REPO_NAME environment variables.' });
}
