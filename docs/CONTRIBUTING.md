# Contributing to the Prompt Engineering Research Laboratory

We welcome contributions from AI safety researchers, alignment engineers, and prompting experts! To keep results scientifically rigorous, please adhere to these guidelines.

---

## 1. Code of Conduct & Rigor
We treat prompt engineering as systems engineering. Contributions should prioritize objective data over speculative optimization. Ensure that:
- Any new prompt strategy added is grounded in academic literature (cite relevant preprints in PRs).
- Templates remain general-purpose and contain the standard `[TASK_INPUT]` placeholder.

---

## 2. Dynamic Placeholders Rule
Every prompt template contribution must handle dynamic insertion. Ensure the template utilizes:
- `[TASK_INPUT]` — Essential placeholder for task questions.
- `[CONTEXT]` — Optional placeholder for context/RAP.
- `[EXAMPLES]` — Optional placeholder for Few-Shot templates.

---

## 3. Pull Request (PR) Quality Checks
Before submitting a PR to integrate a new strategy or dataset task:
1. **Linter validation**:
   ```bash
   npm run lint
   ```
2. **Build compilation**:
   ```bash
   npm run build
   ```
3. **Local benchmark evaluation**: Execute several local trials with your new prompt configuration to verify that secondary judges parse metrics without formatting exceptions.

---

## 4. Peer Review Process
All submitted strategies will undergo empirical stress testing against our adversarial and jailbreak datasets. A baseline accuracy gain of $>5\%$ or a safety alignment improvement of $>10\%$ against Zero-Shot baselines is highly encouraged for successful integration.
