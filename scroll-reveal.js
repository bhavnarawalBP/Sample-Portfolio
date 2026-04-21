/* =========================================================
   ABOUT SECTION — progressive word reveal on scroll
   ========================================================= */
(function(){
  const narrative = document.getElementById('narrative');
  if (!narrative) return;

  // Wrap each word in a span (preserving <em> and .highlight-word)
  function wrapWords(node) {
    const frag = document.createDocumentFragment();
    node.childNodes.forEach(child => {
      if (child.nodeType === 3) { // text
        const words = child.textContent.split(/(\s+)/);
        words.forEach(w => {
          if (w.match(/^\s+$/)) {
            frag.appendChild(document.createTextNode(w));
          } else if (w.length) {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = w;
            frag.appendChild(span);
          }
        });
      } else if (child.nodeType === 1) {
        // element (em / highlight-word). Wrap the whole thing as a .word so it reveals as a unit.
        const wrap = document.createElement('span');
        wrap.className = 'word';
        if (child.classList && child.classList.contains('highlight-word')) {
          wrap.classList.add('highlight-word');
          wrap.innerHTML = child.innerHTML;
        } else {
          wrap.appendChild(child.cloneNode(true));
        }
        frag.appendChild(wrap);
      }
    });
    node.innerHTML = '';
    node.appendChild(frag);
  }
  wrapWords(narrative);

  const words = [...narrative.querySelectorAll('.word')];

  // Scroll-driven reveal using getBoundingClientRect math
  function tick() {
    const rect = narrative.getBoundingClientRect();
    const winH = window.innerHeight;
    // start revealing when top of element is 80% down the viewport; finish when bottom reaches 30% of viewport
    const start = winH * 0.85;
    const end = winH * 0.2;
    const progress = (start - rect.top) / (start - (end - rect.height));
    const p = Math.max(0, Math.min(1, progress));
    const count = Math.round(p * words.length);
    words.forEach((w, i) => {
      w.classList.toggle('revealed', i < count);
    });
  }

  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
  tick();

  // Facets fade up
  const facets = document.querySelectorAll('.facet');
  facets.forEach((f, i) => {
    f.style.opacity = '0';
    f.style.transform = 'translateY(24px)';
    f.style.transition = `opacity .7s ${i * 0.12}s, transform .7s ${i * 0.12}s cubic-bezier(.2,.8,.3,1)`;
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.2 });
  facets.forEach(f => io.observe(f));

})();
