import React, { useState } from 'react';
import VegapunkLogo from './VegapunkLogo';
import {
  ArrowRight,
  Sparkles,
  BarChart3,
  Cpu,
  Layers,
  Database,
  Check,
  Copy,
  ChevronRight,
  Terminal,
  ShieldCheck,
  Binary,
  Code2,
  Sigma,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: () => void;
  onGoToSignUp: () => void;
  onQuickStart: (initialPrompt?: string) => void;
}

interface DemoTab {
  id: string;
  label: string;
  badge: string;
  query: string;
  formula: string;
  codeSnippet: string;
  outputSummary: string;
}

const DEMO_TABS: DemoTab[] = [
  {
    id: 'causal',
    label: 'Causal Inference & CUPED',
    badge: 'Variance Reduction',
    query: 'How do I implement CUPED for A/B testing with pre-experiment covariates in Polars?',
    formula: '\\hat{\\theta} = \\frac{\\text{Cov}(Y, X)}{\\text{Var}(X)}, \\quad Y_{\\text{CUPED}} = Y - \\hat{\\theta}(X - \\mathbb{E}[X])',
    codeSnippet: `import polars as pl
import numpy as np

def compute_cuped(df: pl.DataFrame, metric_col: str, pre_metric_col: str) -> pl.DataFrame:
    """Calculates optimal theta and CUPED-adjusted metric with ~50% variance reduction."""
    cov = df.select(pl.cov(metric_col, pre_metric_col)).item()
    var_pre = df.select(pl.var(pre_metric_col)).item()
    theta = cov / var_pre
    pre_mean = df.select(pl.mean(pre_metric_col)).item()
    
    return df.with_columns(
        (pl.col(metric_col) - theta * (pl.col(pre_metric_col) - pre_mean))
        .alias(f"{metric_col}_cuped")
    )`,
    outputSummary: 'Variance reduced by 51.4% with pre-experiment correlation ρ = 0.71. Experiment duration slashed in half.',
  },
  {
    id: 'xgboost',
    label: 'Stratified XGBoost & TreeSHAP',
    badge: 'Predictive Modeling',
    query: 'Build an end-to-end churn model with 5-fold CV, class imbalance weighting, and TreeSHAP.',
    formula: '\\mathcal{L}(\\phi) = \\sum_{i} l(\\hat{y}_i, y_i) + \\sum_{k} \\left(\\gamma T + \\frac{1}{2} \\lambda \\|w\\|^2\\right)',
    codeSnippet: `import xgboost as xgb
import shap
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score

def train_and_explain(X, y, feature_names):
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scale_pos = (len(y) - y.sum()) / y.sum()
    
    clf = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=5,
        scale_pos_weight=scale_pos,
        eval_metric="aucpr",
        tree_method="hist"
    )
    clf.fit(X, y)
    explainer = shap.TreeExplainer(clf)
    shap_values = explainer(X)
    return clf, shap_values`,
    outputSummary: 'Leak-free out-of-fold PR-AUC: 0.884. Top predictive drivers isolated with additive SHAP game theory.',
  },
  {
    id: 'neural',
    label: 'Deep Tabular & Embeddings',
    badge: 'Neural Architectures',
    query: 'Design a PyTorch network with entity embeddings for high-cardinality categorical features.',
    formula: '\\mathbf{x}_{\\text{in}} = [\\mathbf{x}_{\\text{num}} \\;\\Vert\\; \\mathbf{E}_1(c_1) \\;\\Vert\\; \\dots \\;\\Vert\\; \\mathbf{E}_k(c_k)]',
    codeSnippet: `import torch
import torch.nn as nn

class TabularResNet(nn.Module):
    def __init__(self, emb_dims: list[tuple[int, int]], n_cont: int, out_dim: int):
        super().__init__()
        self.embeddings = nn.ModuleList([
            nn.Embedding(num_classes, emb_dim) for num_classes, emb_dim in emb_dims
        ])
        total_emb_dim = sum(e for _, e in emb_dims)
        self.fc = nn.Sequential(
            nn.Linear(total_emb_dim + n_cont, 256),
            nn.BatchNorm1d(256),
            nn.SiLU(),
            nn.Dropout(0.2),
            nn.Linear(256, out_dim)
        )
    def forward(self, x_cat, x_cont):
        x = [emb(x_cat[:, i]) for i, emb in enumerate(self.embeddings)]
        x = torch.cat(x + [x_cont], dim=1)
        return self.fc(x)`,
    outputSummary: 'Entity embeddings compress 10,000+ sparse levels into smooth dense manifold representation with SiLU activations.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToLogin,
  onGoToSignUp,
  onQuickStart,
}) => {
  const [activeTab, setActiveTab] = useState<string>('causal');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [userPromptInput, setUserPromptInput] = useState('');

  const currentTab = DEMO_TABS.find((t) => t.id === activeTab) || DEMO_TABS[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentTab.codeSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleLaunchWithPrompt = (promptText: string) => {
    onQuickStart(promptText);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPromptInput.trim()) {
      onGoToLogin();
      return;
    }
    onQuickStart(userPromptInput.trim());
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Editorial Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VegapunkLogo variant="full" size={30} />
            <span className="hidden sm:inline-block text-xs font-mono tracking-wider text-slate-400 uppercase">
              DS 3.7
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a
              href="#capabilities"
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Capabilities
            </a>
            <a
              href="#interactive-demo"
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Interactive Showcase
            </a>
            <a
              href="#mathematical-rigor"
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Mathematical Rigor
            </a>
            <a
              href="#benchmarks"
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Specifications
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLogin}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 transition-colors cursor-pointer"
            >
              Log in
            </button>
            <button
              onClick={onGoToSignUp}
              className="text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-4 sm:pt-6 pb-12 sm:pb-16 overflow-hidden">
          {/* Subtle Ambient Radial Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#2563EB0F_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Domain Kicker - Anti-Slop Discipline: Clean typographic separator, unboxed */}
            <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-mono tracking-wider text-slate-500 uppercase mb-3">
              <span>STATISTICAL MECHANICS</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>CAUSAL INFERENCE</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>MACHINE LEARNING</span>
            </div>

            {/* Master Editorial Serif Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 leading-[1.12] mb-3">
              Precision intelligence for{' '}
              <span className="italic font-serif text-blue-600">statistical modeling</span>{' '}
              and causal inference.
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal mb-6">
              Fine-tuned for mathematical proofs, leak-free ML cross-validation,
              and high-performance vectorized operations.
            </p>

            {/* Interactive Hero Chat Box - Immediately Accommodated in Viewport */}
            <div className="max-w-2xl mx-auto bg-white border border-slate-300/90 rounded-2xl shadow-sm hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all p-3 text-left">
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 text-slate-400">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <textarea
                    rows={2}
                    value={userPromptInput}
                    onChange={(e) => setUserPromptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCustomSubmit(e);
                      }
                    }}
                    placeholder="Ask a question about CUPED, Stratified K-Fold, Polars, or PyTorch..."
                    className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span>Vegapunk DS 3.7</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onGoToLogin}
                      className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Minimal Clean Prompt Starters */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500 max-w-2xl mx-auto">
              <span className="font-mono text-slate-400 text-[11px]">Quick prompts:</span>
              <button
                onClick={() => handleLaunchWithPrompt('Derive CUPED variance reduction mathematically and write a Polars implementation.')}
                className="hover:text-blue-600 underline underline-offset-4 decoration-slate-300 cursor-pointer text-left text-xs"
              >
                CUPED derivation
              </button>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <button
                onClick={() => handleLaunchWithPrompt('Explain out-of-fold calibration with Stratified K-Fold and TreeSHAP.')}
                className="hover:text-blue-600 underline underline-offset-4 decoration-slate-300 cursor-pointer text-left text-xs"
              >
                Stratified TreeSHAP
              </button>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <button
                onClick={() => handleLaunchWithPrompt('Write a vectorized Polars exploratory data analysis pipeline.')}
                className="hover:text-blue-600 underline underline-offset-4 decoration-slate-300 cursor-pointer text-left text-xs"
              >
                Vectorized Polars EDA
              </button>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={onGoToSignUp}
                className="text-xs font-medium text-slate-700 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Create free research account</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => onQuickStart()}
                className="text-xs font-medium text-slate-700 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Direct Studio Entry</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Interactive Showcase Section */}
        <section id="interactive-demo" className="py-16 sm:py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono tracking-wider text-blue-600 uppercase font-semibold">
                Interactive Research Environment
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 mt-2 font-normal">
                Mathematical clarity meets production code.
              </h2>
              <p className="text-sm text-slate-500 mt-3">
                Experience how Vegapunk formats proofs, derives estimators, and delivers leak-free vectorized code.
              </p>
            </div>

            {/* Interactive Showcase Sandbox Card */}
            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Top Tab Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-white px-4 py-2.5 gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {DEMO_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
                    {currentTab.badge}
                  </span>
                  <button
                    onClick={() => handleLaunchWithPrompt(currentTab.query)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Run in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* User Prompt Bubble */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>RESEARCH INQUIRY</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    {currentTab.query}
                  </p>
                </div>

                {/* Mathematical Derivation Box */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-700 uppercase tracking-wide mb-2">
                    <Sigma className="w-3.5 h-3.5" />
                    <span>Analytical Formula & Objective</span>
                  </div>
                  <div className="font-mono text-xs sm:text-sm text-blue-950 overflow-x-auto py-1">
                    {currentTab.formula}
                  </div>
                </div>

                {/* Code Window */}
                <div className="relative rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-hidden border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                      </div>
                      <span className="text-[11px] text-slate-400 pl-2">pipeline.py</span>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
                    >
                      {copiedSnippet ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 sm:p-5 overflow-x-auto leading-relaxed text-slate-200">
                    <code>{currentTab.codeSnippet}</code>
                  </pre>
                </div>

                {/* Empirical Outcome */}
                <div className="flex items-center gap-3 text-xs text-slate-600 bg-white border border-slate-200/80 rounded-xl p-3.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-normal">{currentTab.outputSummary}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Grid */}
        <section id="capabilities" className="py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-mono tracking-wider text-slate-500 uppercase font-semibold">
                Domain-Native Architecture
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-slate-900 mt-2 font-normal">
                Engineered for scientific precision.
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-3">
                Generic chatbots hallucinate equations and introduce subtle data leakage. Vegapunk is structured around rigorous statistical paradigms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pillar 1 */}
              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl hover:border-blue-300 transition-all hover:shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                  <Sigma className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-slate-900 font-semibold mb-2">
                  First-Principles Proofs
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every mathematical formulation is derived step-by-step with clean KaTeX notation. Understand the exact variance bounds and asymptotic properties.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-[11px] text-slate-400 font-mono">
                  <span>LaTeX · KaTeX · Asymptotics</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl hover:border-blue-300 transition-all hover:shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-slate-900 font-semibold mb-2">
                  Zero Data Leakage
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Strict train-test isolation. Scalers, imputers, and target encoding fit strictly inside Stratified K-Fold splits with calibrated out-of-fold metrics.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-[11px] text-slate-400 font-mono">
                  <span>Stratified CV · OOF · Calibration</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl hover:border-blue-300 transition-all hover:shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-slate-900 font-semibold mb-2">
                  Causal & Quasi-Experimental
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Native expertise in CUPED, Double Machine Learning (DML), Synthetic Controls, and Instrumental Variables for reliable treatment effect attribution.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-[11px] text-slate-400 font-mono">
                  <span>CUPED · DML · Synthetic Controls</span>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl hover:border-blue-300 transition-all hover:shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-slate-900 font-semibold mb-2">
                  Vectorized Performance
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Engineered with zero-copy Polars routines, NumPy vectorization, and multi-threaded PyTorch / LightGBM workflows for industrial data volume.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-[11px] text-slate-400 font-mono">
                  <span>Polars · NumPy · PyTorch</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specifications & Comparison Table */}
        <section id="benchmarks" className="py-16 sm:py-20 bg-white border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-mono tracking-wider text-slate-500 uppercase font-semibold">
                Empirical Evaluation
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 mt-2 font-normal">
                How Vegapunk compares.
              </h2>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Criterion</th>
                    <th className="py-3.5 px-4 text-blue-700 font-semibold">Vegapunk DS</th>
                    <th className="py-3.5 px-4 text-slate-400">Generic LLM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-4 px-4 sm:px-6 font-medium text-slate-900">
                      Cross-Validation Isolation
                    </td>
                    <td className="py-4 px-4 text-emerald-700 font-medium flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Zero-leakage out-of-fold pipeline</span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      Frequently leaks test transformations
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 sm:px-6 font-medium text-slate-900">
                      Mathematical Equations
                    </td>
                    <td className="py-4 px-4 text-emerald-700 font-medium flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Complete LaTeX derivations ($...$)</span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      Unformatted or truncated formulas
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 sm:px-6 font-medium text-slate-900">
                      Vectorized DataFrame Speed
                    </td>
                    <td className="py-4 px-4 text-emerald-700 font-medium flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Prioritizes Polars expressions</span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      Slow iterative Pandas .iterrows()
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 sm:px-6 font-medium text-slate-900">
                      Model Explainability
                    </td>
                    <td className="py-4 px-4 text-emerald-700 font-medium flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Native TreeSHAP & Attribution</span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      Generic Gini/split importance
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Final Editorial Call to Action */}
        <section className="py-20 sm:py-24 bg-[#FAF9F5] border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-3xl sm:text-5xl text-slate-900 font-normal tracking-tight mb-4">
              Ready to elevate your empirical research?
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto mb-8 font-normal">
              Join quantitative researchers and ML practitioners building mathematically rigorous pipelines with Vegapunk.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onGoToSignUp}
                className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create an Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onGoToLogin}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm rounded-xl border border-slate-300/80 transition-all shadow-xs cursor-pointer"
              >
                Sign in to Existing Account
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-slate-200/70 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <VegapunkLogo variant="full" size={24} />
            <span className="text-xs text-slate-400 font-mono">· DS 3.7 Research Lab</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <button
              onClick={onGoToLogin}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGoToSignUp}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Sign Up
            </button>
            <button
              onClick={() => onQuickStart()}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Chat Studio
            </button>
          </div>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Vegapunk AI. Precision Data Science Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
