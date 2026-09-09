
# Qwen2.5-3B Data Science Fine-tuning Evaluation

## Dataset

Dataset:
ed001/ds-coder-instruct-v1

Evaluation examples:
100

## Overall Results

| Metric | Base | Fine-tuned | Improvement |
|---|---:|---:|---:|
| ROUGE-L | 0.2535 | 0.4231 | +66.89% |\n| BLEU | 0.0855 | 0.1791 | +109.49% |\n| Semantic Similarity | 0.7001 | 0.7883 | +12.60% |\n| Composite Score | 0.4432 | 0.5569 | +25.65% |\n

## Pairwise Results

Fine-tuned wins: 86

Base wins: 14

Ties: 0

Fine-tuned win rate: 86.00%

## Composite Score

Base:
0.4432

Fine-tuned:
0.5569

Relative improvement:
25.65%

## Important Caveat

This benchmark evaluates outputs using ROUGE-L, BLEU,
semantic similarity, and a composite score.

These metrics do not establish that generated Data Science
code is executable or correct.

The evaluation examples are derived from the same dataset
split methodology used during training rather than a
completely independent external benchmark.

Therefore these results demonstrate a strong fine-tuning
signal, but should not be treated as a definitive
production-quality benchmark.

## Recommended Next Step

Evaluate both models on a genuinely unseen Data Science
test set and, where code is generated, execute the code
against test cases whenever possible.
