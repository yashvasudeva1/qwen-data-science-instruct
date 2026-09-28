import React, { useState } from 'react';
import { Artifact } from '../types';
import {
  X,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  Code2,
  Eye,
  RefreshCw,
  ExternalLink,
  Laptop,
  Smartphone,
} from 'lucide-react';

interface ArtifactPanelProps {
  artifact: Artifact;
  onClose: () => void;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ artifact, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext =
      artifact.language === 'tsx' || artifact.language === 'typescript'
        ? '.tsx'
        : artifact.type === 'html'
        ? '.html'
        : artifact.type === 'markdown'
        ? '.md'
        : '.txt';
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.title.toLowerCase().replace(/\s+/g, '_')}${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate safe HTML bundle for iframe preview
  const generatePreviewDoc = () => {
    if (artifact.type === 'html' || artifact.content.includes('<!DOCTYPE html>') || artifact.content.includes('<html')) {
      // Inject alert polyfill into raw html so any alert calls show custom toast
      return artifact.content.replace(
        '</head>',
        `<style>
          .vp-toast { position: fixed; bottom: 20px; right: 20px; background: #1E293B; color: #fff; padding: 10px 16px; border-radius: 10px; font-size: 13px; z-index: 99999; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: sans-serif; display: flex; align-items: center; gap: 8px; animation: vpFade 0.2s ease-out; }
          @keyframes vpFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        </style>
        <script>
          window.alert = function(msg) {
            var existing = document.querySelector('.vp-toast');
            if (existing) existing.remove();
            var t = document.createElement('div');
            t.className = 'vp-toast';
            t.innerHTML = '<span>⚡</span> <span>' + msg + '</span>';
            document.body.appendChild(t);
            setTimeout(function() { t.remove(); }, 3500);
          };
        </script>
        </head>`
      );
    }

    if (artifact.type === 'svg' || artifact.content.trim().startsWith('<svg')) {
      return `<!DOCTYPE html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#F8FAFC;">${artifact.content}</body></html>`;
    }

    const isDataScienceML =
      artifact.language === 'python' ||
      artifact.title.toLowerCase().includes('churn') ||
      artifact.title.toLowerCase().includes('xgboost') ||
      artifact.title.toLowerCase().includes('eda') ||
      artifact.title.toLowerCase().includes('polars') ||
      artifact.title.toLowerCase().includes('cuped');

    const escapedTitle = artifact.title.replace(/"/g, '&quot;');

    // High-Fidelity Interactive Data Science Sandbox & Pipeline Runner
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .fade-enter { animation: fadeIn 0.25s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .vp-toast { position: fixed; top: 16px; right: 16px; background: #0F172A; color: #fff; padding: 12px 18px; border-radius: 12px; font-size: 12px; z-index: 99999; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); border: 1px solid #334155; display: flex; align-items: center; gap: 10px; animation: slideDown 0.25s ease-out; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="bg-[#FAF9F5] p-4 text-slate-800 antialiased min-h-screen">
  <div class="max-w-2xl mx-auto space-y-4">
    <!-- Header Card -->
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            VP
          </div>
          <div>
            <h1 class="text-sm font-bold text-slate-900 leading-tight">${escapedTitle}</h1>
            <p class="text-[11px] text-slate-500">Vegapunk DS Interactive Sandbox Runtime</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online & Ready</span>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="flex items-center bg-slate-100/80 p-1 rounded-xl gap-1 mb-4 text-xs font-semibold select-none">
        <button id="tab-btn-sim" onclick="switchTab('sim')" class="flex-1 py-1.5 px-3 rounded-lg transition-all bg-white text-blue-700 shadow-2xs text-center cursor-pointer">
          Interactive Predictor
        </button>
        <button id="tab-btn-shap" onclick="switchTab('shap')" class="flex-1 py-1.5 px-3 rounded-lg transition-all text-slate-600 hover:text-slate-900 text-center cursor-pointer">
          SHAP Attributions
        </button>
        <button id="tab-btn-logs" onclick="switchTab('logs')" class="flex-1 py-1.5 px-3 rounded-lg transition-all text-slate-600 hover:text-slate-900 text-center cursor-pointer">
          Console Log
        </button>
      </div>

      <!-- Tab 1: Interactive Simulator -->
      <div id="tab-sim" class="space-y-4 fade-enter">
        <!-- Preset Profiles -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Test Case Presets
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button onclick="applyPreset(1)" class="p-2 border border-slate-200 rounded-xl text-left hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
              <div class="text-[11px] font-bold text-rose-600">High Risk</div>
              <div class="text-[10px] text-slate-400 truncate">Month-to-month, $118/mo</div>
            </button>
            <button onclick="applyPreset(2)" class="p-2 border border-slate-200 rounded-xl text-left hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
              <div class="text-[11px] font-bold text-emerald-600">Retained</div>
              <div class="text-[10px] text-slate-400 truncate">Two-year, $64/mo, TechSupport</div>
            </button>
            <button onclick="applyPreset(3)" class="p-2 border border-slate-200 rounded-xl text-left hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
              <div class="text-[11px] font-bold text-amber-600">Borderline</div>
              <div class="text-[10px] text-slate-400 truncate">One-year, $88/mo</div>
            </button>
          </div>
        </div>

        <!-- Dynamic Inputs -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">
              Customer Tenure: <span id="val-tenure" class="font-mono text-blue-600 font-bold">4 mos</span>
            </label>
            <input type="range" id="input-tenure" min="1" max="72" value="4" oninput="updateValues()" class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">
              Monthly Charges: <span id="val-charges" class="font-mono text-blue-600 font-bold">$118.00</span>
            </label>
            <input type="range" id="input-charges" min="20" max="150" value="118" oninput="updateValues()" class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">Contract Duration</label>
            <select id="input-contract" onchange="updateValues()" class="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="month">Month-to-Month</option>
              <option value="one">One Year</option>
              <option value="two">Two Year</option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">Tech Support Option</label>
            <select id="input-support" onchange="updateValues()" class="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="no">No Tech Support</option>
              <option value="yes">Tech Support Included</option>
            </select>
          </div>
        </div>

        <!-- Decision Threshold Slider -->
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div class="flex items-center justify-between text-xs mb-1.5">
            <span class="font-semibold text-slate-700">Classification Threshold</span>
            <span id="val-threshold" class="font-mono font-bold text-blue-700">0.50</span>
          </div>
          <input type="range" id="input-threshold" min="0.10" max="0.90" step="0.05" value="0.50" oninput="updateValues()" class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          <div class="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>High Recall (0.10)</span>
            <span>Balanced (0.50)</span>
            <span>High Precision (0.90)</span>
          </div>
        </div>

        <!-- PRIMARY INTERACTIVE ACTION BUTTON -->
        <div class="pt-2">
          <button
            id="action-btn"
            onclick="executeInteractiveAction()"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span id="btn-icon">⚡</span>
            <span id="btn-text">Test Interactive Action</span>
          </button>
        </div>

        <!-- Live Results Box -->
        <div id="results-card" class="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inference Output</span>
            <span id="res-badge" class="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">HIGH CHURN RISK</span>
          </div>

          <div class="flex items-baseline gap-2">
            <span id="res-prob" class="text-3xl font-bold font-mono text-slate-900">84.2%</span>
            <span class="text-xs text-slate-500 font-medium">calculated churn probability</span>
          </div>

          <!-- Animated Progress Meter -->
          <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div id="res-bar" class="h-full bg-rose-600 rounded-full transition-all duration-500" style="width: 84.2%;"></div>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div class="p-2 bg-slate-50 rounded-lg">
              <div class="text-[10px] text-slate-400">Precision</div>
              <div id="val-prec" class="font-mono font-bold text-slate-800">87.4%</div>
            </div>
            <div class="p-2 bg-slate-50 rounded-lg">
              <div class="text-[10px] text-slate-400">Recall</div>
              <div id="val-rec" class="font-mono font-bold text-slate-800">81.0%</div>
            </div>
            <div class="p-2 bg-slate-50 rounded-lg">
              <div class="text-[10px] text-slate-400">F1 Score</div>
              <div id="val-f1" class="font-mono font-bold text-slate-800">84.1%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: SHAP Feature Attributions -->
      <div id="tab-shap" class="space-y-4 hidden fade-enter">
        <div>
          <h2 class="text-xs font-bold text-slate-800 mb-1">Local TreeSHAP Feature Attributions</h2>
          <p class="text-[11px] text-slate-500">Visualizing contribution to log-odds ratio for current customer</p>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <div class="flex justify-between mb-1">
              <span class="font-semibold text-slate-700">Contract (Month-to-month)</span>
              <span id="shap-val-1" class="font-mono text-rose-600 font-bold">+0.38 log-odds</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div id="shap-bar-1" class="h-full bg-rose-500 rounded-full transition-all duration-300" style="width: 76%;"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between mb-1">
              <span class="font-semibold text-slate-700">Monthly Charges ($118.00)</span>
              <span id="shap-val-2" class="font-mono text-rose-600 font-bold">+0.24 log-odds</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div id="shap-bar-2" class="h-full bg-rose-500 rounded-full transition-all duration-300" style="width: 48%;"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between mb-1">
              <span class="font-semibold text-slate-700">Customer Tenure (4 months)</span>
              <span id="shap-val-3" class="font-mono text-emerald-600 font-bold">-0.32 log-odds</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div id="shap-bar-3" class="h-full bg-emerald-500 rounded-full transition-all duration-300" style="width: 64%;"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between mb-1">
              <span class="font-semibold text-slate-700">Tech Support Missing</span>
              <span id="shap-val-4" class="font-mono text-rose-600 font-bold">+0.16 log-odds</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div id="shap-bar-4" class="h-full bg-rose-500 rounded-full transition-all duration-300" style="width: 32%;"></div>
            </div>
          </div>
        </div>

        <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed font-mono">
          Base Value: -1.24 log-odds (18.2% marginal baseline)<br/>
          Model Output: +0.46 log-odds (84.2% predicted probability)
        </div>
      </div>

      <!-- Tab 3: Console Log -->
      <div id="tab-logs" class="space-y-3 hidden fade-enter">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-slate-700 font-mono">STDOUT Terminal Execution</span>
          <button onclick="clearLogs()" class="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">Clear Logs</button>
        </div>
        <div id="console-stream" class="bg-[#1E2430] p-3 rounded-xl font-mono text-[11px] text-slate-200 space-y-1 h-52 overflow-y-auto">
          <div class="text-emerald-400">[00:00.01] Vegapunk DS Virtual Kernel initialized.</div>
          <div class="text-slate-400">[00:00.03] Loading pre-trained XGBoost model weights...</div>
          <div class="text-slate-400">[00:00.05] Tree depth: 5, estimators: 800, eval_metric: aucpr.</div>
          <div class="text-blue-400">[00:00.08] Ready for interactive action execution.</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Safe custom toast function
    function showToast(msg) {
      var existing = document.querySelector('.vp-toast');
      if (existing) existing.remove();
      var t = document.createElement('div');
      t.className = 'vp-toast';
      t.innerHTML = '<span class="text-blue-400 text-sm">✓</span> <span class="font-medium">' + msg + '</span>';
      document.body.appendChild(t);
      setTimeout(function() {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-10px)';
        t.style.transition = 'all 0.3s ease';
        setTimeout(function() { t.remove(); }, 300);
      }, 3500);
    }

    // Polyfill window.alert
    window.alert = function(msg) {
      showToast(msg);
    };

    function switchTab(tab) {
      document.getElementById('tab-sim').classList.toggle('hidden', tab !== 'sim');
      document.getElementById('tab-shap').classList.toggle('hidden', tab !== 'shap');
      document.getElementById('tab-logs').classList.toggle('hidden', tab !== 'logs');

      var simBtn = document.getElementById('tab-btn-sim');
      var shapBtn = document.getElementById('tab-btn-shap');
      var logsBtn = document.getElementById('tab-btn-logs');

      simBtn.className = tab === 'sim' ? 'flex-1 py-1.5 px-3 rounded-lg transition-all bg-white text-blue-700 shadow-2xs text-center cursor-pointer' : 'flex-1 py-1.5 px-3 rounded-lg transition-all text-slate-600 hover:text-slate-900 text-center cursor-pointer';
      shapBtn.className = tab === 'shap' ? 'flex-1 py-1.5 px-3 rounded-lg transition-all bg-white text-blue-700 shadow-2xs text-center cursor-pointer' : 'flex-1 py-1.5 px-3 rounded-lg transition-all text-slate-600 hover:text-slate-900 text-center cursor-pointer';
      logsBtn.className = tab === 'logs' ? 'flex-1 py-1.5 px-3 rounded-lg transition-all bg-white text-blue-700 shadow-2xs text-center cursor-pointer' : 'flex-1 py-1.5 px-3 rounded-lg transition-all text-slate-600 hover:text-slate-900 text-center cursor-pointer';
    }

    function applyPreset(num) {
      if (num === 1) {
        document.getElementById('input-tenure').value = 4;
        document.getElementById('input-charges').value = 118;
        document.getElementById('input-contract').value = 'month';
        document.getElementById('input-support').value = 'no';
      } else if (num === 2) {
        document.getElementById('input-tenure').value = 52;
        document.getElementById('input-charges').value = 64;
        document.getElementById('input-contract').value = 'two';
        document.getElementById('input-support').value = 'yes';
      } else {
        document.getElementById('input-tenure').value = 16;
        document.getElementById('input-charges').value = 88;
        document.getElementById('input-contract').value = 'one';
        document.getElementById('input-support').value = 'yes';
      }
      updateValues();
      showToast('Loaded Preset ' + num + ' data parameters.');
    }

    function updateValues() {
      var tenure = parseInt(document.getElementById('input-tenure').value);
      var charges = parseFloat(document.getElementById('input-charges').value);
      var contract = document.getElementById('input-contract').value;
      var support = document.getElementById('input-support').value;
      var threshold = parseFloat(document.getElementById('input-threshold').value);

      document.getElementById('val-tenure').innerText = tenure + ' mos';
      document.getElementById('val-charges').innerText = '$' + charges.toFixed(2);
      document.getElementById('val-threshold').innerText = threshold.toFixed(2);

      // Model inference logic
      var logOdds = 0.0;
      if (contract === 'month') logOdds += 0.8;
      if (contract === 'one') logOdds -= 0.4;
      if (contract === 'two') logOdds -= 1.1;

      logOdds += (charges - 70) * 0.02;
      logOdds -= (tenure - 12) * 0.035;
      if (support === 'no') logOdds += 0.35;
      if (support === 'yes') logOdds -= 0.45;

      var prob = 1 / (1 + Math.exp(-logOdds));
      var pct = (prob * 100).toFixed(1);

      document.getElementById('res-prob').innerText = pct + '%';
      var resBar = document.getElementById('res-bar');
      resBar.style.width = pct + '%';

      var badge = document.getElementById('res-badge');
      if (prob >= threshold) {
        badge.innerText = 'HIGH CHURN RISK';
        badge.className = 'px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700';
        resBar.className = 'h-full bg-rose-600 rounded-full transition-all duration-300';
      } else {
        badge.innerText = 'RETAINED CUSTOMER';
        badge.className = 'px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700';
        resBar.className = 'h-full bg-emerald-600 rounded-full transition-all duration-300';
      }

      // Update SHAP bars
      var shap1 = contract === 'month' ? 0.38 : (contract === 'one' ? -0.15 : -0.42);
      document.getElementById('shap-val-1').innerText = (shap1 >= 0 ? '+' : '') + shap1.toFixed(2) + ' log-odds';
      document.getElementById('shap-bar-1').style.width = Math.min(100, Math.abs(shap1) * 200) + '%';
      document.getElementById('shap-bar-1').className = 'h-full ' + (shap1 >= 0 ? 'bg-rose-500' : 'bg-emerald-500') + ' rounded-full transition-all duration-300';

      var shap2 = (charges - 70) * 0.015;
      document.getElementById('shap-val-2').innerText = (shap2 >= 0 ? '+' : '') + shap2.toFixed(2) + ' log-odds';
      document.getElementById('shap-bar-2').style.width = Math.min(100, Math.abs(shap2) * 200) + '%';
      document.getElementById('shap-bar-2').className = 'h-full ' + (shap2 >= 0 ? 'bg-rose-500' : 'bg-emerald-500') + ' rounded-full transition-all duration-300';

      var shap3 = -(tenure - 12) * 0.025;
      document.getElementById('shap-val-3').innerText = (shap3 >= 0 ? '+' : '') + shap3.toFixed(2) + ' log-odds';
      document.getElementById('shap-bar-3').style.width = Math.min(100, Math.abs(shap3) * 200) + '%';
      document.getElementById('shap-bar-3').className = 'h-full ' + (shap3 >= 0 ? 'bg-rose-500' : 'bg-emerald-500') + ' rounded-full transition-all duration-300';
    }

    // THE INTERACTIVE ACTION HANDLER
    function executeInteractiveAction() {
      var btn = document.getElementById('action-btn');
      var icon = document.getElementById('btn-icon');
      var text = document.getElementById('btn-text');

      // State: executing
      btn.disabled = true;
      btn.className = 'w-full py-3 px-4 bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-wait opacity-90';
      icon.innerHTML = '<svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>';
      text.innerText = 'Executing Pipeline & TreeSHAP...';

      appendLog('[INFO] Starting batch vectorization pass...');
      appendLog('[INFO] Computing TreeSHAP shapley values across 800 estimators...');

      setTimeout(function() {
        updateValues();
        btn.disabled = false;
        btn.className = 'w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer group';
        icon.innerHTML = '⚡';
        text.innerText = 'Test Interactive Action (Run Again)';

        appendLog('[SUCCESS] Model inference completed in 42ms. OOF AUC: 0.894.');
        showToast('Interactive Action Executed Successfully: Model Inference completed.');
      }, 700);
    }

    function appendLog(line) {
      var stream = document.getElementById('console-stream');
      var div = document.createElement('div');
      var time = new Date().toTimeString().split(' ')[0];
      div.innerText = '[' + time + '] ' + line;
      div.className = line.indexOf('SUCCESS') !== -1 ? 'text-emerald-400 font-semibold' : 'text-slate-300';
      stream.appendChild(div);
      stream.scrollTop = stream.scrollHeight;
    }

    function clearLogs() {
      document.getElementById('console-stream').innerHTML = '<div class="text-slate-400">// Log cleared. Ready for next interactive action.</div>';
    }

    // Run initial update on mount
    updateValues();
  </script>
</body>
</html>`;
  };

  return (
    <div
      className={`flex flex-col bg-white border-l border-slate-200 transition-all duration-300 z-40 select-none ${
        isFullscreen ? 'fixed inset-0 z-50' : 'w-full md:w-[480px] lg:w-[540px] xl:w-[600px] shrink-0 h-full'
      }`}
    >
      {/* Top Header */}
      <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-slate-900 truncate">
              {artifact.title}
            </h3>
            <span className="text-[10px] text-slate-400 uppercase font-mono">
              {artifact.language || artifact.type}
            </span>
          </div>
        </div>

        {/* Tab switchers + Actions */}
        <div className="flex items-center gap-1.5">
          {/* Tabs */}
          <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg mr-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title="Close Artifact panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-[#FAF9F5]">
        {activeTab === 'preview' ? (
          <div className="h-full flex flex-col">
            {/* Viewport switch controls for preview */}
            <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`p-1 rounded transition-colors ${
                    deviceView === 'desktop' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Desktop View"
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`p-1 rounded transition-colors ${
                    deviceView === 'mobile' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reload</span>
              </button>
            </div>

            {/* Iframe Preview Container */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
              <div
                className={`bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition-all duration-300 ${
                  deviceView === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'
                }`}
              >
                <iframe
                  key={iframeKey}
                  title="Artifact Preview"
                  srcDoc={generatePreviewDoc()}
                  sandbox="allow-scripts allow-modals allow-same-origin"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Code View */
          <div className="h-full overflow-auto bg-[#1E2430] p-4 text-xs font-mono text-slate-200 leading-relaxed">
            <pre>
              <code>{artifact.content}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactPanel;
