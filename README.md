Here’s a clean, polished README similar to yours, adapted for a second version (assuming improvements/features added). You can tweak names if needed:

---

# CFG Simplification Teaching Tool (v2)

An improved 2-page web application built with **Python (Flask)** to help students understand **Context-Free Grammar (CFG) simplification** through interactive, step-by-step visualization.

## Project Structure

```
cfg_tool_v2/
├── app.py                  ← Flask backend (enhanced CFG logic)
├── requirements.txt
├── templates/
│   ├── index.html          ← Page 1: Grammar input interface
│   └── result.html         ← Page 2: Interactive step-by-step output
└── static/
    ├── css/
    │   └── style.css       ← Updated UI styling
    └── js/
        ├── main.js         ← Input handling + validation
        └── result.js       ← Step navigation + animations
```

## Quick Setup

```bash
# 1. Navigate into the project folder
cd cfg_tool_v2

# 2. Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
python app.py
```

Then open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your browser.

---

## Features

### 🔹 Page 1: Grammar Input

* Smart text area with symbol buttons (**ε, →, |**)
* Preloaded example grammars for quick testing
* Cursor-aware symbol insertion
* Input validation with clear, student-friendly error messages
* Support for multiple epsilon formats (`ε`, `lambda`, `epsilon`)

### 🔹 Page 2: Step-by-Step Simplification

* **Live Grammar Panel** that updates after every transformation

* **Step 1: Nullable Variables**

  * Identify nullable symbols
  * Generate new productions
  * Visual cues:

    * 🔴 Removed symbols
    * 🟢 Newly derived productions

* **Step 2: Unit Productions**

  * Detect unit pairs
  * Replace with equivalent non-unit productions
  * Visual cues:

    * 🟣 Unit pairs
    * 🟢 Substituted rules

* **Step 3: Useless Symbol Removal**

  * 3a: Remove non-generating symbols
  * 3b: Remove unreachable symbols

* Smooth **step navigation with animations**

* Progress indicators (dots/steps)

* Improved UI for better conceptual understanding

---

## Grammar Format

Write one production per line:

```
S → A B | a
A → ε | a
B → b | B C
C → A B
```

### Rules:

* **Variables (Non-terminals):** Uppercase letters (S, A, B…)
* **Terminals:** Lowercase letters or strings (a, b, ab…)
* **Empty string:** `ε`, `lambda`, or `epsilon`
* **Alternatives:** Use `|`

---

