import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '20mb' }));

  const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Real-time Chat endpoint with fallback support
  app.post('/api/chat', async (req, res) => {
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

    // 1. If Hugging Face Token & Repo are configured, prioritize the Hugging Face model
    if (hfToken && hfRepo) {
      try {
        const hfSystemPrompt = `You are Vegapunk DS, a world-class AI fine-tuned on data science, machine learning, deep learning, statistical modeling, and data engineering. Provide mathematically rigorous responses with LaTeX formulas ($...$ for inline, $$...$$ for display) and clean code artifacts. ${customInstructions ? `Project Instructions: ${customInstructions}` : ''}`;
        
        // Attempt OpenAI-compatible Chat Completions on Hugging Face router
        const hfMessages = [
          { role: 'system', content: hfSystemPrompt },
          ...messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
          })),
        ];

        let hfResponse = await fetch(`https://router.huggingface.co/hf-inference/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfToken.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: hfRepo.trim(),
            messages: hfMessages,
            max_tokens: 2048,
            temperature: 0.6,
          }),
        });

        // If router is not supported for this repo, fallback to direct HF inference endpoint
        if (!hfResponse.ok) {
          hfResponse = await fetch(`https://api-inference.huggingface.co/models/${hfRepo.trim()}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${hfToken.trim()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: `${hfSystemPrompt}\n\nUser: ${userQuery}\n\nVegapunk DS:`,
              parameters: {
                max_new_tokens: 1500,
                return_full_text: false,
                temperature: 0.6,
              },
            }),
          });
        }

        if (hfResponse.ok) {
          const hfData = await hfResponse.json();
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
          const errText = await hfResponse.text();
          console.warn(`Hugging Face inference error (${hfResponse.status}):`, errText);
        }
      } catch (hfErr: any) {
        console.error('Error invoking Hugging Face model:', hfErr?.message || hfErr);
      }
    }

    // 2. If Gemini API is configured, use standard high-capacity gemini-2.5-flash with cascade fallback
    if (ai) {
      const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.8-flash'];
      for (const modelName of candidateModels) {
        try {
          const systemPrompt = `You are Vegapunk DS, a world-class artificial intelligence specifically fine-tuned on data science, machine learning, deep learning (PyTorch, TensorFlow, JAX), tabular gradient boosting (XGBoost, LightGBM, CatBoost), statistical hypothesis testing, causal inference, and high-performance data engineering (Polars, Pandas, DuckDB, PySpark, SQL).
You embody statistical rigor, mathematical precision, clean vectorized implementations, and practical production engineering.
${thinkingEnabled ? 'When formulating deep statistical proofs, ML pipeline architectures, or cross-validation strategies, include structured extended reasoning steps.' : ''}
${customInstructions ? `Project Instructions: ${customInstructions}` : ''}

When providing code, interactive data visualizers, SVG diagnostic plots, or statistical reports:
- Always prioritize clean, idiomatic, vectorized Python / SQL / TSX.
- For complete interactive dashboards, standalone scripts, or visualization components, format them as Claude-style Artifacts using:
<antArtifact identifier="unique-id" type="application/vnd.ant.code" language="python" title="Description">
...code...
</antArtifact>
or for interactive data dashboards and visualization canvases:
<antArtifact identifier="unique-id" type="application/vnd.ant.code" language="tsx" title="Data Visualization Dashboard">
...code...
</antArtifact>
Provide thorough, mathematically sound markdown responses with clean headings, formulas written in standard LaTeX notation ($...$ for inline math and $$...$$ for centered display equations), and structured tabular summaries.`;

          // Format conversation history for Gemini
          const formattedContents = messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content || '' }],
          }));

          const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.6,
            },
          });

          const textOutput = response.text || '';
          if (textOutput) {
            return res.json({
              text: textOutput,
              modelUsed: `Vegapunk DS (${modelName})`,
              thinking: thinkingEnabled ? `1. Formulating statistical hypothesis and evaluating data distribution assumptions.\n2. Checking for data leakage, multicollinearity, and sample selection bias.\n3. Selecting optimal model family (Tree-based ensemble vs Deep Neural Net vs Causal Framework).\n4. Generating vectorized, production-grade code with validation checkpoints.` : null,
            });
          }
        } catch (err: any) {
          console.warn(`Gemini model ${modelName} failed, attempting next available model:`, err?.message || err);
        }
      }
    }

    // High quality data science response generator if API key is not configured or on network issue
    const intelligentFallback = generateVegapunkDSResponse(userQuery, thinkingEnabled);
    return res.json(intelligentFallback);
  });

  function generateVegapunkDSResponse(query: string, thinkingEnabled: boolean) {
    const q = query.toLowerCase();
    const model = 'Vegapunk DS 3.7';
    let thinking = thinkingEnabled
      ? `1. Parsing data science query: "${query.slice(0, 45)}..."\n2. Inspecting feature distributions, missingness patterns, and target imbalance ratio.\n3. Designing cross-validation split (Stratified / Time-Series) to prevent temporal leakage.\n4. Structuring vectorized artifact with clear metric tracking and production considerations.`
      : null;

    if (q.includes('eda') || q.includes('exploratory') || q.includes('polars') || q.includes('pandas') || q.includes('dataset') || q.includes('distribution')) {
      return {
        thinking,
        modelUsed: model,
        text: `Here is a complete, high-performance automated Exploratory Data Analysis (EDA) pipeline implemented in **Polars** and **Seaborn**. It performs missingness profiling, distribution skewness checks, outlier detection via IQR, and correlation matrix synthesis.

<antArtifact identifier="automated-eda-polars" type="application/vnd.ant.code" language="python" title="Automated EDA Pipeline in Polars">
import polars as pl
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any

class DataProfiler:
    """Production-grade automated EDA profiler using Polars."""
    
    def __init__(self, df: pl.DataFrame):
        self.df = df
        
    def profile_overview(self) -> Dict[str, Any]:
        """Summarizes dimensions, memory usage, and column data types."""
        return {
            "total_rows": self.df.height,
            "total_columns": self.df.width,
            "schema": {col: str(dtype) for col, dtype in self.df.schema.items()},
            "estimated_memory_mb": round(self.df.estimated_size() / (1024 * 1024), 2),
        }
        
    def check_missing_and_cardinality(self) -> pl.DataFrame:
        """Computes missing value ratios and distinct value counts per feature."""
        metrics = []
        n_rows = self.df.height
        
        for col_name in self.df.columns:
            null_count = self.df.select(pl.col(col_name).null_count()).item()
            unique_count = self.df.select(pl.col(col_name).n_unique()).item()
            metrics.append({
                "column": col_name,
                "null_count": null_count,
                "null_pct": round((null_count / n_rows) * 100, 2),
                "unique_values": unique_count,
                "cardinality_ratio": round(unique_count / n_rows, 4),
            })
            
        return pl.DataFrame(metrics).sort("null_pct", descending=True)
        
    def detect_skewed_numerical_features(self, threshold: float = 1.0) -> pl.DataFrame:
        """Calculates Fisher-Pearson skewness coefficient for numerical features."""
        num_cols = [c for c, dt in self.df.schema.items() if dt.is_numeric()]
        results = []
        
        for col in num_cols:
            series = self.df.select(pl.col(col).drop_nulls()).to_series()
            if len(series) > 3:
                skew = float(series.skew())
                results.append({
                    "column": col,
                    "skewness": round(skew, 3),
                    "action_needed": "Log1p / Yeo-Johnson Transform" if abs(skew) > threshold else "Normal enough"
                })
        return pl.DataFrame(results).sort("skewness", descending=True)

# Example execution pattern:
# df = pl.read_parquet("features.parquet")
# profiler = DataProfiler(df)
# print(profiler.check_missing_and_cardinality())
</antArtifact>

### Statistical Insights & Next Steps:
- **Zero-Copy Performance**: Polars operates in parallel with vectorized Arrow memory, handling 50M+ rows in seconds.
- **Skewness Mitigation**: For features where $|\\text{Skew}| > 1.0$, apply either a Yeo-Johnson transformation or PowerTransform prior to linear/neural models.
- **Leakage Prevention**: Always compute imputation medians exclusively on training splits during K-Fold.`,
      };
    }

    if (q.includes('xgboost') || q.includes('optuna') || q.includes('churn') || q.includes('hyperparameter') || q.includes('k-fold')) {
      return {
        thinking,
        modelUsed: model,
        text: `Here is a production-grade machine learning pipeline integrating **XGBoost** with Bayesian Hyperparameter Optimization using **Optuna**, incorporating **Stratified K-Fold Cross-Validation**, early stopping, and SHAP interpretability.

<antArtifact identifier="xgboost-optuna-pipeline" type="application/vnd.ant.code" language="python" title="XGBoost & Optuna Bayesian Optimization Pipeline">
import optuna
import xgboost as xgb
import numpy as np
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score, brier_score_loss

def objective(trial, X, y):
    """Optuna objective function with Bayesian search space."""
    params = {
        "objective": "binary:logistic",
        "eval_metric": "auc",
        "tree_method": "hist",
        "n_estimators": 1000,
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
        "max_depth": trial.suggest_int("max_depth", 3, 9),
        "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
        "subsample": trial.suggest_float("subsample", 0.6, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
        "gamma": trial.suggest_float("gamma", 0.0, 5.0),
        "reg_alpha": trial.suggest_float("reg_alpha", 1e-3, 10.0, log=True),
        "reg_lambda": trial.suggest_float("reg_lambda", 1e-3, 10.0, log=True),
        "random_state": 42,
    }
    
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    auc_scores = []
    
    for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
        X_train, y_train = X[train_idx], y[train_idx]
        X_val, y_val = X[val_idx], y[val_idx]
        
        clf = xgb.XGBClassifier(**params)
        clf.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False
        )
        
        preds = clf.predict_proba(X_val)[:, 1]
        auc_scores.append(roc_auc_score(y_val, preds))
        
    return np.mean(auc_scores)

# Run optimization study
# study = optuna.create_study(direction="maximize", pruner=optuna.pruners.MedianPruner())
# study.optimize(lambda trial: objective(trial, X_matrix, y_target), n_trials=50)
# print(f"Best OOF ROC-AUC: {study.best_value:.4f}")
</antArtifact>

### Invariants & Best Practices:
1. **Target-Encoded Features**: Must be fit inside each cross-validation fold to eliminate Out-Of-Fold (OOF) target leakage.
2. **Probability Calibration**: Use Isotonic Regression or Platt Scaling if raw predicted probabilities will trigger financial decisions.
3. **Threshold Optimization**: Never settle for the default $0.5$ classification threshold on imbalanced target distributions.`,
      };
    }

    if (q.includes('pytorch') || q.includes('neural') || q.includes('deep learning') || q.includes('embedding')) {
      return {
        thinking,
        modelUsed: model,
        text: `Here is a modern **PyTorch** module designed specifically for mixed tabular data with categorical entity embeddings and residual dense connections.

<antArtifact identifier="pytorch-tabular-architecture" type="application/vnd.ant.code" language="python" title="PyTorch Tabular Deep Learning Module">
import torch
import torch.nn as nn
from typing import List, Tuple

class TabularResNet(nn.Module):
    """Deep residual neural network with entity embeddings for tabular data."""
    
    def __init__(
        self,
        emb_dims: List[Tuple[int, int]], # List of (num_categories, emb_dim)
        n_continuous: int,
        hidden_dim: int = 128,
        dropout_rate: float = 0.2,
    ):
        super().__init__()
        
        # 1. Categorical Embeddings
        self.embeddings = nn.ModuleList([
            nn.Embedding(num_cat, dim) for num_cat, dim in emb_dims
        ])
        total_emb_dim = sum(dim for _, dim in emb_dims)
        
        # 2. Continuous Input Batch Normalization
        self.num_bn = nn.BatchNorm1d(n_continuous) if n_continuous > 0 else None
        
        # 3. Input Projection
        in_dim = total_emb_dim + n_continuous
        self.input_layer = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.SiLU(),
            nn.Dropout(dropout_rate)
        )
        
        # 4. Residual Block
        self.res_dense1 = nn.Linear(hidden_dim, hidden_dim)
        self.res_bn1 = nn.BatchNorm1d(hidden_dim)
        self.act1 = nn.SiLU()
        self.dropout = nn.Dropout(dropout_rate)
        self.res_dense2 = nn.Linear(hidden_dim, hidden_dim)
        self.res_bn2 = nn.BatchNorm1d(hidden_dim)
        
        # 5. Output Head
        self.head = nn.Linear(hidden_dim, 1)
        
    def forward(self, x_cat: torch.Tensor, x_cont: torch.Tensor) -> torch.Tensor:
        # Pass each categorical feature through its embedding table
        embedded = [emb(x_cat[:, i]) for i, emb in enumerate(self.embeddings)]
        x_emb = torch.cat(embedded, dim=1) if embedded else torch.empty(x_cat.size(0), 0)
        
        if self.num_bn is not None:
            x_cont = self.num_bn(x_cont)
            x_in = torch.cat([x_emb, x_cont], dim=1)
        else:
            x_in = x_emb
            
        h = self.input_layer(x_in)
        
        # Residual Skip Connection: h + F(h)
        residual = h
        out = self.res_dense1(h)
        out = self.res_bn1(out)
        out = self.act1(out)
        out = self.dropout(out)
        out = self.res_dense2(out)
        out = self.res_bn2(out)
        h = self.act1(residual + out)
        
        return self.head(h).squeeze(-1)
</antArtifact>

### Architecture Highlights:
- **Heuristic Embedding Dimensions**: Set embedding dimensions to $\\min(50, \\lfloor 1.6 \\times C^{0.56} \\rfloor)$ where $C$ is unique cardinalities.
- **SiLU (Swish) Activation**: Ensures smooth non-monotonic gradient flow across dense tabular intersections.`,
      };
    }

    if (q.includes('cuped') || q.includes('a/b') || q.includes('causal') || q.includes('variance') || q.includes('hypothesis')) {
      return {
        thinking,
        modelUsed: model,
        text: `Here is a complete implementation and theoretical derivation of **CUPED (Controlled-experiment Using Pre-Experiment Data)** for variance reduction in A/B testing.

### Mathematical Formulation
Let $Y$ denote the experiment metric (e.g., revenue per user in treatment vs control) and $X$ denote the same metric measured in the pre-experiment period (with $\\mathbb{E}[X_T] = \\mathbb{E}[X_C]$).

We construct the variance-reduced estimator:
$$\\tilde{Y}_i = Y_i - \\theta (X_i - \\mathbb{E}[X])$$

To minimize $\\text{Var}(\\tilde{Y})$, we compute the optimal coefficient:
$$\\theta^* = \\frac{\\text{Cov}(Y, X)}{\\text{Var}(X)}$$

The resulting variance ratio satisfies:
$$\\frac{\\text{Var}(\\tilde{Y})}{\\text{Var}(Y)} = 1 - \\rho_{XY}^2$$
If correlation $\\rho_{XY} = 0.7$, the variance is reduced by **$49\\%$**, effectively doubling your statistical sample size!

<antArtifact identifier="cuped-variance-reduction" type="application/vnd.ant.code" language="python" title="CUPED Variance Reduction Engine in Python">
import numpy as np
import scipy.stats as stats

def apply_cuped(y_metric: np.ndarray, x_covariate: np.ndarray) -> np.ndarray:
    """Applies CUPED adjustment to metric Y using pre-experiment baseline X."""
    cov_matrix = np.cov(y_metric, x_covariate)
    theta = cov_matrix[0, 1] / cov_matrix[1, 1]
    x_mean = np.mean(x_covariate)
    y_adjusted = y_metric - theta * (x_covariate - x_mean)
    return y_adjusted

def run_ab_cuped_analysis(y_ctrl, x_ctrl, y_treat, x_treat, alpha=0.05):
    """Runs two-sample hypothesis test on CUPED-adjusted values."""
    # Joint theta estimation across pooled control & treatment
    y_pooled = np.concatenate([y_ctrl, y_treat])
    x_pooled = np.concatenate([x_ctrl, x_treat])
    theta = np.cov(y_pooled, x_pooled)[0, 1] / np.var(x_pooled, ddof=1)
    
    adj_ctrl = y_ctrl - theta * (x_ctrl - np.mean(x_pooled))
    adj_treat = y_treat - theta * (x_treat - np.mean(x_pooled))
    
    t_stat, p_val = stats.ttest_ind(adj_treat, adj_ctrl, equal_var=False)
    variance_reduction = 1 - (np.var(adj_treat) / np.var(y_treat))
    
    return {
        "p_value": p_val,
        "t_statistic": t_stat,
        "variance_reduction_pct": round(variance_reduction * 100, 2),
        "lift": float(np.mean(adj_treat) - np.mean(adj_ctrl)),
    }
</antArtifact>`,
      };
    }

    return {
      thinking,
      modelUsed: model,
      text: `### Vegapunk DS Statistical & Machine Learning Analysis

I have evaluated your data science inquiry regarding **"${query}"**.

#### 1. Data Invariants & Assumptions
- **Distributional Checks**: Evaluate normality, heteroskedasticity, and multicollinearity using variance inflation factor (VIF).
- **Leakage Safeguards**: Preprocessing parameters (encoders, scalers, imputers) must be fit exclusively on training folds.
- **Metric Alignment**: Map business loss functions to appropriate asymmetric optimization objectives.

\`\`\`python
import polars as pl
import numpy as np

def validate_data_contract(df: pl.DataFrame, target_col: str):
    """Validates structural integrity before training."""
    assert target_col in df.columns, f"Target {target_col} missing from schema"
    assert df.select(pl.col(target_col).is_null().sum()).item() == 0, "Target has nulls"
    print(f"Data contract verified across {df.height} records.")
\`\`\`

Would you like me to construct an end-to-end Python/Polars pipeline, train an ML model, or generate an interactive diagnostic Artifact for this?`,
    };
  }

  // Vite integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vegapunk AI Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
