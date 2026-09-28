/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Conversation,
  Message,
  VegapunkModel,
  UserProfile,
  Attachment,
  Project,
} from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import MessageItem from './components/MessageItem';
import SettingsModal from './components/SettingsModal';
import ProjectsModal from './components/ProjectsModal';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import LandingPage from './components/LandingPage';
import VegapunkLogo from './components/VegapunkLogo';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Compass,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  BarChart3,
  Database,
  Binary,
} from 'lucide-react';

const INITIAL_USER: UserProfile = {
  name: 'Yash Vasudev',
  email: 'vasudevyash@gmail.com',
  plan: 'pro',
  usagePercentage: 18,
};

const INITIAL_PROJECT: Project = {
  id: 'punk_records_ds',
  name: 'Data Science & ML Research Lab',
  description: 'Specialized intelligence knowledge base for statistical modeling, ML engineering, and data pipelines.',
  customInstructions:
    'You are Vegapunk DS, fine-tuned on data science, advanced statistics, and machine learning. Prioritize vectorized operations (Polars/NumPy), strict cross-validation, mathematical transparency, and production-grade pipelines.',
  filesCount: 3,
  color: '#2563EB',
};

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    title: 'Customer Churn Prediction with XGBoost & SHAP',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
    model: 'vegapunk-3.7-datascience',
    isStarred: true,
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'How should I build a production customer churn model with XGBoost, Stratified K-Fold CV, and SHAP explainability?',
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        id: 'm2',
        role: 'assistant',
        modelUsed: 'Vegapunk DS 3.7',
        thinkingDuration: 3.6,
        thinking:
          '1. Assessed tabular churn dynamics: severe class imbalance, survival temporal dependencies, and business cost asymmetry.\n2. Formulated 5-Fold Stratified CV pipeline with out-of-fold probability calibration.\n3. Integrated TreeSHAP for local and global feature attribution.',
        timestamp: Date.now() - 3600000 * 2 + 1000,
        content: `Here is a complete, production-grade churn prediction pipeline using **XGBoost** and **SHAP** with leak-free cross-validation.

<antArtifact identifier="xgboost-churn-shap" type="application/vnd.ant.code" language="python" title="XGBoost Churn Prediction & SHAP Analysis">
import numpy as np
import polars as pl
import xgboost as xgb
import shap
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score, average_precision_score

def train_churn_model(X: np.ndarray, y: np.ndarray, feature_names: list[str]):
    """Trains an XGBoost model across Stratified K-Fold splits with SHAP summary."""
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    oof_preds = np.zeros(len(y))
    models = []
    
    # Calculate scale_pos_weight for imbalance: (negatives / positives)
    scale_pos = (len(y) - np.sum(y)) / np.sum(y)
    
    params = {
        "objective": "binary:logistic",
        "eval_metric": "aucpr",
        "scale_pos_weight": scale_pos,
        "max_depth": 5,
        "learning_rate": 0.05,
        "subsample": 0.85,
        "colsample_bytree": 0.8,
        "tree_method": "hist",
        "random_state": 42,
    }
    
    for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
        X_train, y_train = X[train_idx], y[train_idx]
        X_val, y_val = X[val_idx], y[val_idx]
        
        model = xgb.XGBClassifier(**params, n_estimators=800)
        model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False
        )
        
        oof_preds[val_idx] = model.predict_proba(X_val)[:, 1]
        models.append(model)
        
    print(f"Overall OOF ROC-AUC: {roc_auc_score(y, oof_preds):.4f}")
    print(f"Overall OOF PR-AUC:  {average_precision_score(y, oof_preds):.4f}")
    
    # Compute SHAP values on validation set
    explainer = shap.TreeExplainer(models[0])
    shap_values = explainer.shap_values(X[val_idx])
    
    return models, oof_preds, shap_values
</antArtifact>

### Key Data Science Invariants:
- **Optimization Metric**: For high-churn imbalance ($< 15\\%$ positive rate), optimize for **PR-AUC (Average Precision)** rather than ROC-AUC.
- **Leakage Prevention**: Never impute missing values or scale features prior to the cross-validation loop.
- **TreeSHAP**: Tree-based SHAP provides exact Shapley values in polynomial time $\\mathcal{O}(TLD^2)$.`,
      },
    ],
  },
  {
    id: 'conv_2',
    title: 'A/B Testing & CUPED Variance Reduction',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    model: 'vegapunk-3.7-datascience',
    messages: [
      {
        id: 'm3',
        role: 'user',
        content: 'Explain how CUPED accelerates statistical significance in online experimentation.',
        timestamp: Date.now() - 86400000,
      },
      {
        id: 'm4',
        role: 'assistant',
        modelUsed: 'Vegapunk DS 3.7',
        thinkingDuration: 4.2,
        thinking:
          '1. Explored variance reduction via auxiliary control covariates.\n2. Deduced optimal shrinkage factor theta = Cov(Y, X) / Var(X).\n3. Connected variance drop directly to sample size requirements.',
        timestamp: Date.now() - 86400000 + 2000,
        content: `### CUPED Variance Reduction Formulation

**CUPED** (Controlled-experiment Using Pre-Experiment Data) exploits correlation with pre-experiment user behavioral metrics to dramatically shrink metric variance without introducing bias.

#### 1. Adjusted Metric Definition
For each unit $i$, the CUPED adjusted response metric $\\tilde{Y}_i$ is defined as:

$$\\tilde{Y}_i = Y_i - \\hat{\\theta}(X_i - \\mathbb{E}[X])$$

where $X_i$ is a pre-experiment covariate measured *before* treatment assignment, ensuring $\\mathbb{E}[X_i]$ is invariant between control and treatment groups.

#### 2. Optimal Shrinkage Coefficient $\\hat{\\theta}$
Minimizing the variance $\\text{Var}(\\tilde{Y})$ with respect to $\\theta$ yields the ordinary least squares solution:

$$\\hat{\\theta} = \\frac{\\text{Cov}(Y, X)}{\\text{Var}(X)} = \\rho \\cdot \\frac{\\sigma_Y}{\\sigma_X}$$

#### 3. Resulting Variance Reduction
Substituting the optimal $\\hat{\\theta}^*$ back into the variance equation:

$$\\text{Var}(\\tilde{Y}) = \\text{Var}(Y) \\cdot (1 - \\rho^2)$$

#### 4. Practical Impact on Sample Size
Because required sample size $N$ is directly proportional to metric variance $\\sigma^2$:

$$\\frac{N_{\\text{CUPED}}}{N_{\\text{standard}}} \\approx 1 - \\rho^2$$

> **Key Takeaway**: When baseline metric correlation $\\rho = 0.7$, the variance is slashed by **$51\\%$**, cutting required experimentation time in half.`,
      },
    ],
  },
];

export default function App() {
  // Navigation View State: 'landing' | 'chat' | 'login' | 'signup'
  const [currentView, setCurrentView] = useState<'landing' | 'chat' | 'login' | 'signup'>(() => {
    return localStorage.getItem('vegapunk_user') ? 'chat' : 'landing';
  });
  const [pendingPrompt, setPendingPrompt] = useState<string>('');

  // Core Chat State
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('vp_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_CONVERSATIONS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('vegapunk_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [project, setProject] = useState<Project>(INITIAL_PROJECT);
  const selectedModel: VegapunkModel = 'vegapunk-3.7-datascience';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [inputDraft, setInputDraft] = useState('');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('vp_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsProjectsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (activeConversationId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, activeConversationId, isLoading]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Dynamic greeting based on current local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user.name.split(' ')[0] || 'there';
    if (hour < 12) return `Good morning, ${firstName}`;
    if (hour < 18) return `Good afternoon, ${firstName}`;
    return `Good evening, ${firstName}`;
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleToggleStarConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isStarred: !c.isStarred } : c))
    );
  };

  // Send Message Flow
  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    if (!text.trim() && attachments.length === 0) return;
    setInputDraft('');

    const userMessage: Message = {
      id: `m_${Date.now()}`,
      role: 'user',
      content: text,
      attachments,
      timestamp: Date.now(),
    };

    let targetConvId = activeConversationId;
    let updatedConversations = [...conversations];

    if (!targetConvId) {
      // Create new conversation
      const newTitle = text.slice(0, 36) || 'New Conversation';
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        title: newTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: selectedModel,
        messages: [userMessage],
      };
      targetConvId = newConv.id;
      updatedConversations = [newConv, ...conversations];
      setConversations(updatedConversations);
      setActiveConversationId(newConv.id);
    } else {
      // Append to active conversation
      updatedConversations = conversations.map((c) => {
        if (c.id === targetConvId) {
          return {
            ...c,
            updatedAt: Date.now(),
            messages: [...c.messages, userMessage],
          };
        }
        return c;
      });
      setConversations(updatedConversations);
    }

    setIsLoading(true);

    try {
      const currentConv = updatedConversations.find((c) => c.id === targetConvId);
      const conversationHistory = currentConv ? currentConv.messages : [userMessage];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          model: selectedModel,
          thinkingEnabled: false,
          customInstructions: project.customInstructions,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: Message = {
        id: `m_asst_${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: Date.now(),
        modelUsed: data.modelUsed || selectedModel,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              updatedAt: Date.now(),
              messages: [...c.messages, assistantMessage],
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Failed to receive response:', err);
      // Fallback message
      const fallbackMessage: Message = {
        id: `m_err_${Date.now()}`,
        role: 'assistant',
        content: `I have processed your inquiry: "${text}".\n\nWhat would you like to explore next?`,
        timestamp: Date.now(),
        modelUsed: selectedModel,
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === targetConvId ? { ...c, messages: [...c.messages, fallbackMessage] } : c))
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate Response Action
  const handleRegenerate = async (messageId: string) => {
    if (!activeConversation || isLoading) return;
    const msgIndex = activeConversation.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Slice conversation history up to before this assistant message
    const historyForApi = activeConversation.messages.slice(0, msgIndex);
    if (historyForApi.length === 0) return;

    // Remove the message and subsequent ones
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            updatedAt: Date.now(),
            messages: historyForApi,
          };
        }
        return c;
      })
    );

    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi,
          model: selectedModel,
          thinkingEnabled: false,
          customInstructions: project.customInstructions,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const newAssistantMsg: Message = {
        id: `m_asst_${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: Date.now(),
        modelUsed: data.modelUsed || selectedModel,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              updatedAt: Date.now(),
              messages: [...historyForApi, newAssistantMsg],
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Failed to regenerate response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (email: string) => {
    const name = email.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase()) || 'User';
    const newUser = user ? { ...user, email, name } : { ...INITIAL_USER, email, name };
    setUser(newUser);
    localStorage.setItem('vegapunk_user', JSON.stringify(newUser));
    setCurrentView('chat');
    if (pendingPrompt) {
      const promptToSend = pendingPrompt;
      setPendingPrompt('');
      setTimeout(() => {
        handleSendMessage(promptToSend, []);
      }, 300);
    }
  };

  const handleSignUpSuccess = (email: string) => {
    const name = email.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase()) || 'New User';
    const newUser = user ? { ...user, email, name } : { ...INITIAL_USER, email, name };
    setUser(newUser);
    localStorage.setItem('vegapunk_user', JSON.stringify(newUser));
    setCurrentView('chat');
    if (pendingPrompt) {
      const promptToSend = pendingPrompt;
      setPendingPrompt('');
      setTimeout(() => {
        handleSendMessage(promptToSend, []);
      }, 300);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vegapunk_user');
    setCurrentView('landing');
  };

  // Render Landing Page View
  if (currentView === 'landing') {
    return (
      <LandingPage
        onGoToLogin={() => setCurrentView('login')}
        onGoToSignUp={() => setCurrentView('signup')}
        onQuickStart={(initialPrompt?: string) => {
          if (initialPrompt) {
            setPendingPrompt(initialPrompt);
          }
          setCurrentView('login');
        }}
      />
    );
  }

  // Render Authentication Views
  if (currentView === 'login') {
    return (
      <LoginPage
        onLogin={handleLoginSuccess}
        onNavigateToSignUp={() => setCurrentView('signup')}
        onNavigateToHome={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <SignUpPage
        onSignUp={handleSignUpSuccess}
        onNavigateToLogin={() => setCurrentView('login')}
        onNavigateToHome={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF9F5] text-slate-800 font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onToggleStarConversation={handleToggleStarConversation}
        user={user!}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onLogout={handleLogout}
        onGoToHome={() => setCurrentView('landing')}
      />

      {/* Main Center Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          conversationTitle={activeConversation?.title}
          onGoToHome={() => setCurrentView('landing')}
        />

        {/* Content View: Main Chat Stream */}
        <div className="flex-1 flex min-w-0 overflow-hidden relative">
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
            {!activeConversationId ? (
              /* Claude.ai/new Landing Experience */
              <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-3xl mx-auto w-full">
                {/* Greeting Lockup */}
                <div className="text-center mb-8 sm:mb-10 select-none">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center mx-auto mb-4 shadow-xs">
                    <VegapunkLogo size={28} variant="mark" />
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-slate-900 mb-2">
                    {getGreeting()}
                  </h1>
                  <p className="text-sm text-slate-500 max-w-lg mx-auto">
                    What data science problems, statistical models, or ML pipelines shall we explore today?
                  </p>
                </div>

                {/* Primary Input */}
                <div className="w-full mb-8">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    initialValue={inputDraft}
                  />
                </div>

                {/* Quick Starter Prompt Cards for Data Science */}
                <div className="w-full max-w-3xl px-4 grid grid-cols-1 sm:grid-cols-2 gap-3 select-none">
                  <button
                    onClick={() =>
                      handleSendMessage(
                        'Generate a complete Python script using Polars and Seaborn for automated exploratory data analysis (EDA). Include distribution plots, missing value heatmap, skewness detection, and correlation matrix analysis with clear output formatting.',
                        []
                      )
                    }
                    className="p-3.5 bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-xs rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        Automated EDA in Polars
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Profile missingness, skewness, outliers, and distribution correlations with zero-copy speed.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleSendMessage(
                        'Write a production-ready Python pipeline using XGBoost and Optuna for hyperparameter optimization on tabular data. Include Stratified K-Fold cross-validation, early stopping, ROC-AUC metric tracking, and SHAP feature importance extraction.',
                        []
                      )
                    }
                    className="p-3.5 bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-xs rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        XGBoost & Optuna Tuning
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Stratified K-Fold cross-validation with early stopping, pruning, and TreeSHAP interpretation.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleSendMessage(
                        'Build a modular PyTorch neural network architecture for mixed tabular data. Implement entity embeddings for categorical features, batch normalization, skip connections, and a custom training loop with learning rate scheduling.',
                        []
                      )
                    }
                    className="p-3.5 bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-xs rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        PyTorch Tabular Embeddings
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Entity embeddings for high-cardinality features with residual skip connections and SiLU activations.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleSendMessage(
                        'Explain and implement CUPED (Controlled-experiment Using Pre-Experiment Data) variance reduction for A/B testing in Python. Include sample size calculation, power analysis, and synthetic experiment simulation.',
                        []
                      )
                    }
                    className="p-3.5 bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-xs rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Binary className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        A/B Testing & CUPED Analysis
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Shrink variance via baseline covariates to cut required sample size and accelerate statistical power.
                    </p>
                  </button>
                </div>
              </div>
            ) : activeConversation ? (
              /* Active In-Conversation Stream */
              <div className="flex-1 flex flex-col justify-between">
                <div className="py-6 overflow-y-auto space-y-2">
                  {activeConversation.messages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      onRegenerate={() => handleRegenerate(message.id)}
                      onEditUserMessage={(text) => setInputDraft(text)}
                    />
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex gap-3.5 px-4 max-w-3xl mx-auto w-full my-4">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                        <VegapunkLogo size={18} variant="mark" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          <span>Vegapunk is generating response...</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                          <div
                            className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                            style={{ animationDelay: '0.4s' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Fixed Bottom Input in Chat */}
                <div className="sticky bottom-0 bg-gradient-to-t from-[#FAF9F5] via-[#FAF9F5]/90 to-transparent pt-4 pb-4">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    placeholder="Reply to Vegapunk..."
                    initialValue={inputDraft}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user!}
        onUpdateUser={(updated) => {
          if (user) {
            const newUser = { ...user, ...updated };
            setUser(newUser);
            localStorage.setItem('vegapunk_user', JSON.stringify(newUser));
          }
        }}
      />

      <ProjectsModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        project={project}
        onUpdateProject={setProject}
      />
    </div>
  );
}
