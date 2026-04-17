/**
 * CFG Tool — Result Page JavaScript v2
 * Features: step-by-step learning, null variable crossing animation,
 * sidebar updates, full PDF export.
 */

let currentStep = 1;
let data = null;

// Step-by-step learning state per step
const learnState = {
  1: { rows: [], revealed: 0 }
};

// ── Entry point ──
window.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('cfg_result');
  if (!raw) {
    showError('No grammar data found. Please go back and enter a grammar first.');
    return;
  }

  data = JSON.parse(raw);
  if (!data.success) {
    showError(data.errors ? data.errors.join(', ') : 'Unknown error.');
    return;
  }

  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';

  // Populate sidebar original grammar
  const origEl = document.getElementById('sidebar-original');
  origEl.innerHTML = `<span class="gp-label">Input</span>` +
    data.original.map(l => escHtml(l)).join('<br>');

  buildStep1();
  buildStep2();
  buildStep3();
  showStep(1);
});

function showError(msg) {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('error-state').style.display = 'block';
  document.getElementById('error-msg').textContent = msg;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Step visibility ──
function showStep(n) {
  currentStep = n;
  [1, 2, 3].forEach(i => {
    document.getElementById(`sec${i}`).style.display = i === n ? 'block' : 'none';
    const sl = document.getElementById(`sl${i}`);
    sl.classList.remove('active', 'done');
    if (i < n) sl.classList.add('done');
    else if (i === n) sl.classList.add('active');

    const hs = document.getElementById(`hstep${i}`);
    hs.classList.remove('active');
    if (i === n) hs.classList.add('active');
  });

  document.querySelectorAll('.nav-dot').forEach((d, i) => {
    d.classList.toggle('active', i + 1 === n);
  });

  document.getElementById('prev-btn').style.display = n === 1 ? 'none' : 'inline-flex';
  const nextBtn = document.getElementById('next-btn');
  if (n === 3) {
    nextBtn.textContent = '✓ Done — go back';
    nextBtn.onclick = () => window.location.href = '/';
  } else {
    nextBtn.textContent = 'Next step →';
    nextBtn.onclick = nextStep;
  }

  updateRightSidebar(n);
  updateCurrentGrammarSidebar(n);
}

function nextStep() { if (currentStep < 3) showStep(currentStep + 1); }
function prevStep() { if (currentStep > 1) showStep(currentStep - 1); }
function goToStep(n) { showStep(n); }

// ── Update right sidebar ──
const stepConcepts = {
  1: {
    title: 'Step 1: ε-productions',
    body: 'Finding all nullable variables and generating new production rules with and without them.',
    tip: 'Use "Reveal next" to see each derived rule one at a time, with crossing animations on removed symbols.'
  },
  2: {
    title: 'Step 2: Unit productions',
    body: 'Replacing rules like A → B by looking up all unit pairs and substituting the actual rules of B.',
    tip: 'A unit chain is a sequence of unit productions. All variables reachable through unit pairs must have their rules merged.'
  },
  3: {
    title: 'Step 3: Useless symbols',
    body: 'Removing non-generating symbols (can\'t produce terminals) then unreachable symbols (not reachable from start).',
    tip: 'Always remove non-generating symbols before unreachable ones — a generating but unreachable symbol can then be removed safely.'
  }
};

function updateRightSidebar(n) {
  const c = stepConcepts[n];
  document.getElementById('right-concept-title').textContent = c.title;
  document.getElementById('right-concept-body').textContent = c.body;
  document.getElementById('right-tip-text').textContent = c.tip;

  // Show nullable info on step 1
  const nullInfo = document.getElementById('right-nullable-info');
  if (n === 1 && data && data.step1.nullable.length > 0) {
    nullInfo.style.display = 'block';
    document.getElementById('right-nullable-list').innerHTML =
      data.step1.nullable.map(v => `<code>${escHtml(v)}</code>`).join(', ');
  } else {
    nullInfo.style.display = 'none';
  }
}

function updateCurrentGrammarSidebar(n) {
  const grammarByStep = {
    1: data ? data.original : [],
    2: data ? data.step1.grammar : [],
    3: data ? data.step2.grammar : []
  };
  const stepNames = { 1: 'before step 1', 2: 'after step 1', 3: 'after step 2' };
  const g = grammarByStep[n] || [];
  document.getElementById('sidebar-step-num').textContent = stepNames[n] || n;
  document.getElementById('sidebar-current-content').innerHTML = g.map(l => escHtml(l)).join('<br>');
}

// ─────────────────────────────────────────────────────────
//  STEP 1 — Null Productions
// ─────────────────────────────────────────────────────────
function buildStep1() {
  const { nullable, steps, grammar } = data.step1;
  document.getElementById('step1-before-grammar').innerHTML = data.original.map(l => escHtml(l)).join('<br>');

  // Nullable badge section
  const nullCard = document.getElementById('step1-nullable');
  if (nullable.length === 0) {
    nullCard.innerHTML = `<div class="sub-card-title">Nullable variables</div>
      <p style="font-size:14px;color:var(--text-mid);">No nullable variables found — this step makes no changes to your grammar.</p>`;
  } else {
    nullCard.innerHTML = `<div class="sub-card-title">Nullable variables (can derive ε)</div>
      <div class="badge-wrap">${
        nullable.map(v => `<span class="var-badge nullable">${escHtml(v)} → ε</span>`).join('')
      }</div>
      <p style="font-size:13px;color:var(--text-mid);margin-top:10px;">For each production containing a nullable variable, new versions are generated — with and without that variable.</p>`;
  }

  // Derivation rows — build all but keep hidden for step-by-step
  const derivDiv = document.getElementById('step1-derivations');
  const allRows = [];

  if (steps.length === 0) {
    derivDiv.innerHTML = '';
  } else {
    let html = `<div class="derivation-section"><div class="sub-card-title">Derived productions (step-by-step)</div>`;
    let rowIndex = 0;
    for (const { variable, derivations } of steps) {
      html += `<div class="deriv-group"><div class="deriv-var">Variable: ${escHtml(variable)}</div>`;
      for (const { original, derived } of derivations) {
        const strikeDelay = 0.15;
        const popDelay = 0.45;

        const origHtml = original.map((s, si) => {
          if (nullable.includes(s) && !derived.includes(s)) {
            return `<span class="sym-removed" style="--strike-delay:${strikeDelay + si*0.08}s">${escHtml(s)}</span>`;
          }
          return `<span class="sym-kept">${escHtml(s)}</span>`;
        }).join(' ');

        const derivHtml = derived.length === 0
          ? `<span class="sym-added" style="--pop-delay:${popDelay}s">ε</span>`
          : derived.map((s, si) => `<span class="sym-added" style="--pop-delay:${popDelay + si*0.1}s">${escHtml(s)}</span>`).join(' ');

        const origStr = original.length === 0 ? 'ε' : '';
        const rowId = `deriv-row-1-${rowIndex}`;
        html += `<div class="deriv-row" id="${rowId}">
          <span style="font-family:var(--font-mono)">${escHtml(variable)}</span>
          <span class="deriv-arrow">→</span>
          <span class="deriv-original">${origStr || origHtml}</span>
          <span class="becomes-arrow">⟹</span>
          <span class="deriv-derived">${derivHtml}</span>
        </div>`;
        allRows.push(rowId);
        rowIndex++;
      }
      html += `</div>`;
    }
    html += `</div>`;
    derivDiv.innerHTML = html;

    // Setup step-by-step learning for step 1
    learnState[1].rows = allRows;
    learnState[1].revealed = 0;

    if (allRows.length > 0) {
      document.getElementById('step1-learn-controls').style.display = 'flex';
      updateLearnProgress(1);
    }
  }

  document.getElementById('step1-grammar').innerHTML = grammar.map(l => escHtml(l)).join('<br>');
}

// ── Step-by-step reveal functions ──
function revealNextDerivation(stepNum) {
  const state = learnState[stepNum];
  if (state.revealed >= state.rows.length) return;

  const rowId = state.rows[state.revealed];
  const row = document.getElementById(rowId);
  if (row) {
    row.classList.add('revealed');
    // Re-trigger animations inside
    row.querySelectorAll('.sym-removed').forEach(el => {
      el.style.animation = 'none';
      void el.offsetWidth; // reflow
      el.style.animation = '';
    });
    row.querySelectorAll('.sym-added').forEach(el => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
  }

  state.revealed++;
  updateLearnProgress(stepNum);
}

function revealAllDerivations(stepNum) {
  const state = learnState[stepNum];
  while (state.revealed < state.rows.length) {
    revealNextDerivation(stepNum);
  }
}

function updateLearnProgress(stepNum) {
  const state = learnState[stepNum];
  const total = state.rows.length;
  const done = state.revealed;
  const pct = total > 0 ? (done / total) * 100 : 0;
  document.getElementById(`step${stepNum}-learn-progress`).textContent = `${done} / ${total}`;
  const fill = document.getElementById(`step${stepNum}-progress-fill`);
  if (fill) fill.style.width = pct + '%';
  const revBtn = document.getElementById(`step${stepNum}-reveal-btn`);
  if (revBtn) revBtn.disabled = done >= total;
}

// ─────────────────────────────────────────────────────────
//  STEP 2 — Unit Productions
// ─────────────────────────────────────────────────────────
function buildStep2() {
  const { steps, grammar } = data.step2;
  document.getElementById('step2-before-grammar').innerHTML = data.step1.grammar.map(l => escHtml(l)).join('<br>');
  const body = document.getElementById('step2-body');

  if (steps.length === 0) {
    body.innerHTML = `<div class="unit-group">
      <p style="font-size:14px;color:var(--text-mid);">No unit productions found — this step makes no changes.</p>
    </div>`;
  } else {
    let html = '';
    for (const { variable, unit_chain, reachable, added_rules } of steps) {
      const chainStr = unit_chain.map(p =>
        `<span class="unit-pair">${escHtml(p.from)} → ${escHtml(p.to)}</span>`
      ).join(' <span style="color:var(--text-muted)">→</span> ');

      const rulesHtml = added_rules.map(r =>
        `<span class="unit-result-rule">${r.length ? r.join(' ') : 'ε'}</span>`
      ).join('');

      html += `<div class="unit-group">
        <div class="unit-header">
          <span style="font-size:13px;font-weight:600;font-family:var(--font-mono);">${escHtml(variable)}</span>
          <span class="unit-chain-label">unit chain:</span>
          ${chainStr || '<span style="color:var(--text-muted);font-size:13px;">none</span>'}
        </div>
        <div class="unit-results">
          Reachable variables: <strong>${reachable.join(', ')}</strong><br>
          New rules for ${escHtml(variable)}: ${rulesHtml || '<em>none</em>'}
        </div>
      </div>`;
    }
    body.innerHTML = html;
  }

  document.getElementById('step2-grammar').innerHTML = grammar.map(l => escHtml(l)).join('<br>');
}

// ─────────────────────────────────────────────────────────
//  STEP 3 — Useless Symbols
// ─────────────────────────────────────────────────────────
function buildStep3() {
  const { non_generating, non_reachable, grammar } = data.step3;
  document.getElementById('step3-before-grammar').innerHTML = data.step2.grammar.map(l => escHtml(l)).join('<br>');

  const body3a = document.getElementById('step3a-body');
  if (non_generating.length === 0) {
    body3a.innerHTML = `<div class="sub-card" style="border-radius:0;">
      <p style="font-size:14px;color:var(--text-mid);">All variables can generate a terminal string. No non-generating symbols to remove.</p>
    </div>`;
  } else {
    body3a.innerHTML = `<div class="sub-card" style="border-radius:0;">
      <div class="sub-card-title">Removed (non-generating)</div>
      <div class="badge-wrap">${
        non_generating.map(v => `<span class="var-badge removed">${escHtml(v)}</span>`).join('')
      }</div>
      <p style="font-size:13px;color:var(--text-mid);margin-top:10px;">These variables cannot produce any string of terminals, so every rule containing them is also removed.</p>
    </div>`;
  }

  const body3b = document.getElementById('step3b-body');
  if (non_reachable.length === 0) {
    body3b.innerHTML = `<div class="sub-card" style="border-radius:0;">
      <p style="font-size:14px;color:var(--text-mid);">All remaining variables are reachable from the start symbol. No unreachable symbols to remove.</p>
    </div>`;
  } else {
    body3b.innerHTML = `<div class="sub-card" style="border-radius:0;">
      <div class="sub-card-title">Removed (unreachable from start)</div>
      <div class="badge-wrap">${
        non_reachable.map(v => `<span class="var-badge removed">${escHtml(v)}</span>`).join('')
      }</div>
      <p style="font-size:13px;color:var(--text-mid);margin-top:10px;">These variables are never generated starting from the start symbol, so they'll never appear in any derivation.</p>
    </div>`;
  }

  document.getElementById('step3-grammar').innerHTML = grammar.map(l => escHtml(l)).join('<br>');
}

// ─────────────────────────────────────────────────────────
//  PDF EXPORT — Full simplification report
// ─────────────────────────────────────────────────────────
function downloadPDF() {
  const btn = document.getElementById('pdf-btn');
  btn.textContent = 'Generating…';
  btn.disabled = true;

  // Show all steps + reveal all derivations
  const sections = document.querySelectorAll('.step-section');
  const nav = document.getElementById('step-nav');
  const learnControls = document.querySelectorAll('.learn-controls');
  const sidebarLeft = document.querySelector('.sidebar-left');
  const sidebarRight = document.querySelector('.sidebar-right');

  const originalDisplays = [];
  sections.forEach(sec => {
    originalDisplays.push(sec.style.display);
    sec.style.display = 'block';
  });

  // Reveal all step-by-step rows
  revealAllDerivations(1);

  // Hide UI chrome
  nav.style.display = 'none';
  learnControls.forEach(lc => lc.style.display = 'none');
  if (sidebarLeft) sidebarLeft.style.display = 'none';
  if (sidebarRight) sidebarRight.style.display = 'none';

  // Build a printable wrapper
  const mainContent = document.getElementById('main-content');

  // Add a cover header for the PDF
  const pdfHeader = document.createElement('div');
  pdfHeader.id = 'pdf-cover-header';
  pdfHeader.style.cssText = 'padding: 20px 0 24px; border-bottom: 2px solid #DDD9CF; margin-bottom: 24px;';
  pdfHeader.innerHTML = `
    <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#9A9388;margin-bottom:6px;">Theory of Computation</div>
    <div style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#18160F;margin-bottom:4px;">CFG Simplification Report</div>
    <div style="font-size:13px;color:#4A4538;margin-bottom:12px;">Generated by CFG Teaching Tool</div>
    <div style="font-family:'Courier New',monospace;font-size:12px;background:#F0EDE6;border:1px solid #DDD9CF;padding:8px 12px;border-radius:4px;">
      <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#9A9388;display:block;margin-bottom:4px;">Original Grammar</span>
      ${data.original.map(l => escHtml(l)).join('<br>')}
    </div>
  `;
  mainContent.insertBefore(pdfHeader, mainContent.firstChild);

  const opt = {
    margin: [12, 12, 12, 12],
    filename: 'CFG_Simplification_Report.pdf',
    image: { type: 'jpeg', quality: 0.97 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(mainContent).save().then(() => {
    // Restore everything
    sections.forEach((sec, i) => { sec.style.display = originalDisplays[i]; });
    nav.style.display = 'flex';
    learnControls.forEach(lc => lc.style.display = 'flex');
    if (sidebarLeft) sidebarLeft.style.display = '';
    if (sidebarRight) sidebarRight.style.display = '';
    const ph = document.getElementById('pdf-cover-header');
    if (ph) ph.remove();

    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10L4.5 6.5M8 10L11.5 6.5M8 10V2M3 14H13" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Export PDF`;
    btn.disabled = false;
  }).catch(err => {
    console.error('PDF error:', err);
    btn.textContent = 'Export PDF';
    btn.disabled = false;
  });
}
