import json
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

# Load data
with open('../results/evaluation_summary.json', 'r') as f:
    data = json.load(f)

metrics = data['metrics']
win_loss = data['win_tie_loss']

# Chart 1: Base vs Finetuned (Grey and Green)
fig, axes = plt.subplots(1, 3, figsize=(18, 5))
fig.suptitle('Base Model vs Fine-tuned — Qwen 2.5 3B Data Science Instruct', fontsize=16, fontweight='bold', y=1.05)

# Subplot 1: Overall Metrics
labels1 = ['Semantic Sim', 'Composite Score']
base_vals1 = [metrics['semantic_similarity']['base'], metrics['composite_score']['base']]
ft_vals1 = [metrics['semantic_similarity']['fine_tuned'], metrics['composite_score']['fine_tuned']]

x = np.arange(len(labels1))
width = 0.35

ax1 = axes[0]
rects1_1 = ax1.bar(x - width/2, base_vals1, width, label='Base model', color='#95a5a6')
rects1_2 = ax1.bar(x + width/2, ft_vals1, width, label='Fine-tuned', color='#2ecc71')

ax1.set_ylabel('Score')
ax1.set_title('Overall Metrics', fontweight='bold')
ax1.set_xticks(x)
ax1.set_xticklabels(labels1)
ax1.set_ylim(0, 1.1)
ax1.legend()
ax1.grid(axis='y', linestyle='--', alpha=0.5)

def autolabel(rects, ax):
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height:.3f}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9)

autolabel(rects1_1, ax1)
autolabel(rects1_2, ax1)

# Subplot 2: Code Quality Metrics
labels2 = ['BLEU', 'ROUGE-L']
base_vals2 = [metrics['bleu']['base'], metrics['rouge_l']['base']]
ft_vals2 = [metrics['bleu']['fine_tuned'], metrics['rouge_l']['fine_tuned']]

x2 = np.arange(len(labels2))

ax2 = axes[1]
rects2_1 = ax2.bar(x2 - width/2, base_vals2, width, label='Base model', color='#95a5a6')
rects2_2 = ax2.bar(x2 + width/2, ft_vals2, width, label='Fine-tuned', color='#2ecc71')

ax2.set_ylabel('Score')
ax2.set_title('Code Quality Metrics', fontweight='bold')
ax2.set_xticks(x2)
ax2.set_xticklabels(labels2)
ax2.set_ylim(0, max(ft_vals2) + 0.15)
ax2.legend()
ax2.grid(axis='y', linestyle='--', alpha=0.5)

autolabel(rects2_1, ax2)
autolabel(rects2_2, ax2)

# Subplot 3: Win/Loss Matrix (Mock Confusion Matrix style)
ax3 = axes[2]
win_matrix = np.array([[win_loss['base_wins'], win_loss['ties']],
                       [win_loss['ties'], win_loss['fine_tuned_wins']]])

sns.heatmap(win_matrix, annot=True, fmt='d', cmap='Greens', cbar=True,
            xticklabels=['Base Win/Tie', 'Fine-tuned Win'],
            yticklabels=['Base Eval', 'Fine-tuned Eval'], ax=ax3)

ax3.set_title('Evaluation Outcome Matrix', fontweight='bold')
ax3.set_ylabel('Model Evaluated')
ax3.set_xlabel('Outcome')

plt.tight_layout()
plt.savefig('../results/charts/12_base_vs_finetuned_comparison.png', dpi=300, bbox_inches='tight')
plt.close()


# Chart 2: Model Evaluation Metrics (Blue colormap, horizontal bars)
# Like image 1
fig2, axes2 = plt.subplots(1, 3, figsize=(18, 5))
fig2.suptitle('Model Evaluation Metrics', fontsize=16, fontweight='bold', y=1.05)

# Subplot 1: Another Matrix (Blue)
ax2_1 = axes2[0]
sns.heatmap(win_matrix, annot=True, fmt='d', cmap='Blues', cbar=True,
            xticklabels=['Base', 'Fine-tuned'],
            yticklabels=['Base', 'Fine-tuned'], ax=ax2_1)
ax2_1.set_title('Win / Loss Matrix', fontweight='bold')

# Subplot 2: Improvement % (Grouped bar chart styled)
labels3 = ['BLEU', 'ROUGE-L', 'Sem. Sim.', 'Composite']
pct_vals = [
    metrics['bleu']['percent_change'],
    metrics['rouge_l']['percent_change'],
    metrics['semantic_similarity']['percent_change'],
    metrics['composite_score']['percent_change']
]

# We want 3 bars per group to mimic the image, but we only have 1 value per metric.
# Let's just make a nice vertical bar chart of percentage improvement.
ax2_2 = axes2[1]
colors = ['#3498db', '#e67e22', '#2ecc71', '#9b59b6']
bars = ax2_2.bar(labels3, pct_vals, color=colors, width=0.6)
ax2_2.set_ylabel('Percentage Improvement (%)')
ax2_2.set_title('Relative Improvement', fontweight='bold')
ax2_2.grid(axis='y', linestyle='--', alpha=0.5)

for bar in bars:
    height = bar.get_height()
    ax2_2.annotate(f'+{height:.1f}%',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 3),
                textcoords="offset points",
                ha='center', va='bottom', fontsize=9, fontweight='bold')
ax2_2.set_ylim(0, max(pct_vals) * 1.15)


# Subplot 3: Absolute Scores (Horizontal bar chart)
ax2_3 = axes2[2]
y_pos = np.arange(len(labels3))
abs_vals = [
    metrics['bleu']['fine_tuned'],
    metrics['rouge_l']['fine_tuned'],
    metrics['semantic_similarity']['fine_tuned'],
    metrics['composite_score']['fine_tuned']
]

bars_h = ax2_3.barh(y_pos, abs_vals, color=['#e74c3c', '#f39c12', '#9b59b6', '#3498db'], height=0.5)
ax2_3.set_yticks(y_pos)
ax2_3.set_yticklabels(labels3)
ax2_3.set_xlabel('Fine-Tuned Score')
ax2_3.set_title('Fine-Tuned Absolute Metrics Summary', fontweight='bold')
ax2_3.grid(axis='x', linestyle='--', alpha=0.5)

for i, bar in enumerate(bars_h):
    width = bar.get_width()
    ax2_3.annotate(f'{width:.3f}',
                xy=(width, bar.get_y() + bar.get_height() / 2),
                xytext=(3, 0),
                textcoords="offset points",
                ha='left', va='center', fontsize=9, fontweight='bold')
ax2_3.set_xlim(0, max(abs_vals) * 1.2)

plt.tight_layout()
plt.savefig('../results/charts/13_model_evaluation_metrics.png', dpi=300, bbox_inches='tight')
plt.close()

print("Charts created successfully!")
