// Generic quiz helper with visual feedback
// Usage: attachQuiz(formId, buttonId, scoreId, answers, options)
// answers: { q1: 'A', q2: 'C', ... }
// options: { showHints: true }
(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function clearFeedback(labels) {
    labels.forEach(l => l.classList.remove('quiz-correct', 'quiz-incorrect', 'quiz-correct-hint'));
  }

  function attachQuiz(formId, buttonId, scoreId, answers, options) {
    const form = document.getElementById(formId);
    const btn = document.getElementById(buttonId);
    const scoreEl = document.getElementById(scoreId);
    if (!form || !btn) return;

    btn.addEventListener('click', () => {
      let score = 0;
      const keys = Object.keys(answers || {});
      keys.forEach((key) => {
        const inputs = $all(`input[name="${key}"]`, form);
        const labels = inputs.map(inp => inp.closest('label')).filter(Boolean);
        clearFeedback(labels);

        inputs.forEach((inp) => {
          const label = inp.closest('label');
          if (!label) return;
          // Show hint for the correct alternative
          if (options && options.showHints && inp.value === answers[key]) {
            label.classList.add('quiz-correct-hint');
          }
          // Visual feedback for selection
          if (inp.checked) {
            if (inp.value === answers[key]) {
              label.classList.add('quiz-correct');
              score += 1;
            } else {
              label.classList.add('quiz-incorrect');
            }
          }
        });
      });

      if (scoreEl) {
        const total = Object.keys(answers || {}).length;
        scoreEl.textContent = `Você acertou ${score} de ${total}.`;
      }
    });
  }

  // Expose globally
  window.attachQuiz = attachQuiz;

  // Auto-initialize quizzes declared via data attributes
  function autoInit() {
    const forms = document.querySelectorAll('form[data-quiz-answers]');
    forms.forEach((form) => {
      try {
        const json = form.getAttribute('data-quiz-answers');
        if (!json) return;
        const answers = JSON.parse(json);
        const btnSel = form.getAttribute('data-quiz-button') || 'button[type="button"], button[type="submit"]';
        const scoreSel = form.getAttribute('data-quiz-score') || '[data-quiz-score]';
        const btn = form.querySelector(btnSel) || (btnSel.startsWith('#') ? document.querySelector(btnSel) : null);
        const scoreEl = form.querySelector(scoreSel) || (scoreSel.startsWith('#') ? document.querySelector(scoreSel) : null);
        // If IDs are used, prefer global query by ID; else, ensure we have elements
        if (!btn || !scoreEl) return;
        // Generate unique IDs if missing (for attachQuiz signature)
        if (!form.id) form.id = 'quiz-' + Math.random().toString(36).slice(2,8);
        if (!btn.id) btn.id = form.id + '-btn';
        if (!scoreEl.id) scoreEl.id = form.id + '-score';
        attachQuiz(form.id, btn.id, scoreEl.id, answers, { showHints: true });
      } catch (e) {
        // Silently skip malformed JSON to avoid breaking the page
      }
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    autoInit();
  } else {
    document.addEventListener('DOMContentLoaded', autoInit);
  }
})();
