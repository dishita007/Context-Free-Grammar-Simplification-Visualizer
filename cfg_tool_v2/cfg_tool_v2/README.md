# CFG Simplification Teaching Tool v2

A step-by-step interactive tool for learning Context-Free Grammar simplification.

## Features

- **Full-width 3-column layout** — sidebar navigation, main content, and reference panel
- **Null variable crossing animation** — watch ε symbols get struck through in real time
- **Step-by-step learning mode** — reveal derivations one at a time with "Reveal next"
- **PDF export** — export the full simplification report as a formatted PDF
- **Three simplification steps:**
  1. Remove ε-productions (null/nullable variables)
  2. Remove unit productions
  3. Remove useless symbols (non-generating + unreachable)

## Running the app

```bash
pip install -r requirements.txt
python app.py
```

Then open http://localhost:5000

## Grammar format

One production per line:
```
S → A B | a
A → ε | a
B → b | B C
C → A B
```
