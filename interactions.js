/* =========================================================
   INTERACTIONS — project magnetic cursor, easter eggs, toast
   ========================================================= */
(function(){
  // --- magnetic hover for .project-card[data-variant="magnet"] ---
  document.querySelectorAll('.project-card[data-variant="magnet"]').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
      const tx = (e.clientX - r.left - r.width/2) * 0.04;
      const ty = (e.clientY - r.top - r.height/2) * 0.04;
      card.style.transform = `translate(${tx}px, ${ty}px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  // --- click feedback on all project cards (placeholder intention) ---
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // ripple
      const ripple = document.createElement('div');
      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute; left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        width:${size}px; height:${size}px; border-radius:50%;
        background: radial-gradient(circle, rgba(245,215,110,0.3), transparent 60%);
        transform: scale(0); opacity: 1;
        pointer-events: none; z-index: 10;
        transition: transform .8s cubic-bezier(.2,.8,.3,1), opacity .8s;
      `;
      card.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity = '0';
      });
      setTimeout(() => ripple.remove(), 800);

      // toast
      showToast('This one\'s still in the oven 🍞', 'WIP');
    });
  });

  // --- easter eggs ---
  const secrets = {
    found: new Set(JSON.parse(localStorage.getItem('portfolioSecrets') || '[]')),
    total: 5,
  };

  function markFound(key, label) {
    if (secrets.found.has(key)) return;
    secrets.found.add(key);
    localStorage.setItem('portfolioSecrets', JSON.stringify([...secrets.found]));
    showToast(label, `${secrets.found.size}/${secrets.total}`);
  }

  // konami-ish: type "hi"
  let typed = '';
  document.addEventListener('keydown', (e) => {
    typed = (typed + e.key).toLowerCase().slice(-6);
    if (e.key === '?' || typed.endsWith('?')) {
      markFound('qmark', 'Easter egg: the "?" shortcut');
      // briefly highlight all clickable hero items
      document.querySelectorAll('.canvas-item[data-reveal]').forEach((n, i) => {
        n.animate([
          { filter: 'brightness(1)' },
          { filter: 'brightness(1.3) drop-shadow(0 0 12px #f5d76e)' },
          { filter: 'brightness(1)' },
        ], { duration: 900, delay: i * 40, easing: 'ease-out' });
      });
    }
    if (typed.endsWith('margot')) {
      markFound('margot', 'You typed my name. Hi 👋');
    }
    if (typed.endsWith('design')) {
      markFound('design', '"Design is just caring out loud."');
    }
  });

  // triple-click on scroll cue
  let clickCount = 0, clickTimer = null;
  document.querySelector('.scroll-cue')?.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => clickCount = 0, 600);
    if (clickCount >= 3) {
      markFound('tripleScroll', 'Secret: you triple-clicked the scroll cue');
      document.body.animate([
        { filter: 'hue-rotate(0deg)' },
        { filter: 'hue-rotate(25deg)' },
        { filter: 'hue-rotate(0deg)' },
      ], { duration: 800 });
    }
  });

  // discover reveals (counted separately)
  let revealsSeen = 0;
  window.__trackSecret = (type) => {
    if (type === 'reveal') {
      revealsSeen++;
      if (revealsSeen === 3) markFound('threeReveals', 'Three secrets peeked. Curious one.');
      if (revealsSeen >= 8) markFound('eightReveals', 'You\'ve read everything. Bless.');
    }
  };

  // --- toast ---
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastCount = document.getElementById('toastCount');
  let toastTimer = null;
  function showToast(msg, count) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toastCount.textContent = count || '';
    toastCount.style.display = count ? 'inline-block' : 'none';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // --- cursor dot (shows briefly on rapid movement) ---
  const dot = document.getElementById('cursorDot');
  let lastX = 0, lastY = 0, lastT = 0;
  document.addEventListener('pointermove', (e) => {
    const now = performance.now();
    const dt = now - lastT;
    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    const v = dist / Math.max(1, dt);
    if (!dot) return;
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
    if (v > 0.8) {
      dot.style.opacity = '0.8';
    } else {
      dot.style.opacity = '0';
    }
    lastX = e.clientX; lastY = e.clientY; lastT = now;
  });

  // --- welcome easter egg: show hint on first visit ---
  if (!localStorage.getItem('portfolioVisited')) {
    setTimeout(() => {
      showToast('Tip: try dragging the sticky notes', 'hi');
      localStorage.setItem('portfolioVisited', '1');
    }, 2400);
  }

  // --- nav smooth scroll ---
  document.querySelectorAll('.hero-nav a, .footer a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#') && href.length > 1) {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    }
  });

})();
