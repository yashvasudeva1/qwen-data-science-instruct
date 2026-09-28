import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function runTests() {
  console.log('=== STARTING VEGAPUNK DS MODEL EVALUATION ===\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is not defined in environment!');
    return;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const testPrompts = [
    {
      category: 'Statistical Theory & Math Formulations',
      prompt: 'Derive the optimal variance reduction coefficient theta in CUPED. Explain step-by-step with LaTeX equations ($...$ and $$...$$) and define the variance formula.',
    },
    {
      category: 'Machine Learning Engineering & Vectorization',
      prompt: 'Write a production Python script using XGBoost and Optuna for stratified 5-fold cross-validation with early stopping, PR-AUC metric, and TreeSHAP interpretation.',
    },
    {
      category: 'Causal Inference & Experimentation',
      prompt: 'Compare Doubly Robust Estimation against standard Inverse Probability Weighting (IPW) for estimating Average Treatment Effect (ATE). Detail the mathematical formulation.',
    },
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const test = testPrompts[i];
    console.log(`\n--------------------------------------------------`);
    console.log(`TEST ${i + 1}: ${test.category}`);
    console.log(`Prompt: "${test.prompt}"`);
    console.log(`--------------------------------------------------`);

    const startTime = Date.now();
    try {
      let response;
      const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.8-flash'];
      let modelUsed = '';
      
      for (const m of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: m,
            contents: [
              {
                role: 'user',
                parts: [{ text: test.prompt }],
              },
            ],
            config: {
              systemInstruction: `You are Vegapunk DS, a world-class artificial intelligence fine-tuned on data science, machine learning, and statistical modeling.
Provide thorough, mathematically sound markdown responses with clean headings, formulas written in standard LaTeX notation ($...$ for inline math and $$...$$ for centered display equations), and structured code artifacts when relevant.`,
              temperature: 0.6,
            },
          });
          modelUsed = m;
          break;
        } catch (mErr: any) {
          console.warn(`Model ${m} failed (${mErr?.message?.slice(0, 80)}...), trying next...`);
        }
      }

      if (!response) {
        throw new Error('All model candidates failed');
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      const text = response.text || '';

      console.log(`Status: SUCCESS with ${modelUsed} (${elapsed}s)`);
      console.log(`Output length: ${text.length} characters`);
      
      // Quality checks
      const hasInlineMath = /\$[^\$]+\$/.test(text);
      const hasDisplayMath = /\$\$[\s\S]+?\$\$/.test(text);
      const hasCode = /```[\s\S]*?```/.test(text) || /<antArtifact/.test(text);
      const hasHeadings = /^#{1,4}\s/m.test(text);

      console.log(`Quality Metrics:`);
      console.log(`  - Inline Math ($...$): ${hasInlineMath ? 'PASS' : 'FAIL'}`);
      console.log(`  - Display Math ($$...$$): ${hasDisplayMath ? 'PASS' : 'FAIL'}`);
      console.log(`  - Code / Artifact structure: ${hasCode ? 'PASS' : 'N/A'}`);
      console.log(`  - Headings / Structure: ${hasHeadings ? 'PASS' : 'FAIL'}`);
      console.log(`\nSample Output (First 400 chars):\n${text.slice(0, 400)}...\n`);
    } catch (err: any) {
      console.error(`Test ${i + 1} Failed:`, err?.message || err);
    }
  }

  console.log('\n=== MODEL EVALUATION COMPLETE ===');
}

runTests();
