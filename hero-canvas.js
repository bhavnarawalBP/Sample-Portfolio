/* =========================================================
   HERO CANVAS — draggable cutting-mat items
   ========================================================= */
(function(){
  const root = document.getElementById('canvasItems');
  if (!root) return;

  // --- rulers ---
  const rulerTop = document.getElementById('rulerTop');
  const rulerLeft = document.getElementById('rulerLeft');
  const W = window.innerWidth, H = window.innerHeight;
  const ticksX = Math.ceil(W / 32);
  const ticksY = Math.ceil(H / 32);
  for (let i = 0; i < ticksX; i++) {
    const t = document.createElement('div');
    t.className = 'tick' + (i % 5 === 0 ? ' major' : '');
    if (i % 5 === 0 && i > 0) {
      const l = document.createElement('span');
      l.className = 'label';
      l.textContent = i * 32 + 'px';
      t.appendChild(l);
    }
    rulerTop.appendChild(t);
  }
  for (let i = 0; i < ticksY; i++) {
    const t = document.createElement('div');
    t.className = 'tick' + (i % 5 === 0 ? ' major' : '');
    rulerLeft.appendChild(t);
  }

  // --- item definitions ---
  // positions are in vw/vh-ish percentages so it scales; each has a `reveal` string
  const items = [
    // Sticky notes
    {
      type: 'sticky', variant: 'yellow',
      x: 8, y: 18, rot: -6,
      tag: 'PRINCIPLE 01',
      body: '"Good design survives being explained to a skeptical PM."',
      reveal: { title: 'A Margot-ism', body: 'I keep a running doc of design principles that earned their keep. This is №1.' }
    },
    {
      type: 'sticky', variant: 'pink',
      x: 71, y: 12, rot: 5,
      tag: 'OBSESSION',
      body: 'Empty states deserve better. Fight me.',
      reveal: { title: 'Hot take', body: 'I once shipped a 400-error page so good it got screenshotted in a conference talk. Peak career moment.' }
    },
    {
      type: 'sticky', variant: 'mint',
      x: 14, y: 62, rot: 3,
      tag: 'TO DO',
      body: '· learn welding\n· new portfolio (lol)\n· call mum',
      reveal: { title: 'Actual list on my desk', body: 'The welding class starts in May. The portfolio is… you\'re looking at it.' }
    },
    {
      type: 'sticky', variant: 'blue',
      x: 58, y: 68, rot: -4,
      tag: 'IDEA · 03.26',
      body: 'what if cursors had mood?',
      reveal: { title: 'Sunday brain', body: 'Tiny prototype coming soon. The cursor gets sad if you idle for 30s. Useful? TBD. Fun? Yes.' }
    },

    // Index card / idea
    {
      type: 'index', x: 36, y: 8, rot: -2,
      label: 'Product Idea № 047',
      body: 'A grocery app that knows when you\'re hungry-shopping.',
      reveal: { title: 'Idea №47 of 312', body: 'I keep all my half-baked product ideas in a notebook. Some are bad. Some are just early.' }
    },
    {
      type: 'index', x: 76, y: 54, rot: 4,
      label: 'Design Brief',
      body: 'Make the loading state feel like a wink, not an apology.',
      reveal: { title: 'A brief I wrote myself', body: 'The best briefs are one sentence. The best designers pick a fight with that sentence.' }
    },

    // Torn paper quote
    {
      type: 'torn', x: 42, y: 40, rot: -3,
      body: '"Design is just caring out loud."',
      attr: '— from a notebook, page 14',
      reveal: { title: 'Origin unknown', body: 'I\'ve been quoting this for years. No one knows where it\'s from. Possibly me, at 2am.' }
    },

    // Polaroid
    {
      type: 'polaroid', x: 24, y: 32, rot: -5,
      caption: 'ikea hack, 2021',
      imgBg: 'linear-gradient(135deg, #d97437 0%, #b45a23 100%)',
      imgContent: 'svg-desk',
      reveal: { title: 'The desk I built', body: 'Two Alex drawers, a butcher block, and a weekend. Still holding up in 2026.' }
    },
    {
      type: 'polaroid', x: 62, y: 28, rot: 4,
      caption: 'pencil test №8',
      imgBg: '#1a1d1a',
      imgContent: 'svg-sketch',
      reveal: { title: 'Still sketch', body: 'I still do Monday-morning pen warmups. 20 minutes, no screens. It works.' }
    },

    // Tool chips
    { type: 'chip', x: 8, y: 84, label: 'Figma', color: '#a259ff', reveal: { title: 'Tool of choice', body: 'Variables + auto-layout + modes = my love language. I\'m in here ~5 hrs/day.' } },
    { type: 'chip', x: 20, y: 88, label: 'Linear', color: '#5e6ad2', reveal: { title: 'Task-tracker hero', body: 'Opinionated defaults. Keyboard-first. The only PM tool that feels designed.' } },
    { type: 'chip', x: 31, y: 84, label: 'Framer', color: '#0055ff', reveal: { title: 'Protos & portfolios', body: 'Where my weirder ideas get tested. This portfolio? No — that\'s just HTML.' } },
    { type: 'chip', x: 42, y: 88, label: 'Cursor', color: '#000', reveal: { title: 'AI pair-programmer', body: 'My vibe-code velocity went 4x. Design isn\'t just pixels anymore.' } },
    { type: 'chip', x: 53, y: 84, label: 'Raycast', color: '#ff6363', reveal: { title: 'Command palette = brain', body: 'If it takes more than 2 clicks, I\'ve built a Raycast command for it.' } },

    // Doodles (svg)
    { type: 'doodle', x: 52, y: 18, rot: 0, svg: 'spiral', reveal: { title: 'A meeting-note spiral', body: 'I draw these when people talk about roadmaps. It helps. Somehow.' } },
    { type: 'doodle', x: 86, y: 76, rot: 0, svg: 'arrow', reveal: { title: 'Forward', body: 'The simplest doodle. Drawn on every napkin I\'ve ever touched.' } },
    { type: 'doodle', x: 6, y: 44, rot: 0, svg: 'face', reveal: { title: 'Self-portrait, 2s version', body: 'A dot, a dot, a curve. Good enough.' } },

    // Tape strip
    { type: 'tape', x: 38, y: 74, rot: -8, reveal: null },
    { type: 'tape', x: 82, y: 44, rot: 12, reveal: null },
  ];

  // --- item builders ---
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  const svgs = {
    spiral: `<svg class="doodle" width="90" height="90" viewBox="0 0 90 90"><path d="M45 45 m-4 0 a4 4 0 1 1 8 0 a8 8 0 1 1 -16 0 a12 12 0 1 1 24 0 a16 16 0 1 1 -32 0 a20 20 0 1 1 40 0" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/></svg>`,
    arrow: `<svg class="doodle" width="120" height="60" viewBox="0 0 120 60"><path d="M8 40 Q 35 8, 70 32 T 108 28 M 100 18 L 108 28 L 98 34" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/></svg>`,
    face: `<svg class="doodle" width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="28" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="32" cy="36" r="1.6" fill="#fff"/><circle cx="48" cy="36" r="1.6" fill="#fff"/><path d="M30 48 Q 40 56, 50 48" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    desk: `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><rect width="100" height="100" fill="#d97437"/><rect x="10" y="50" width="80" height="6" fill="#8b4513"/><rect x="14" y="56" width="22" height="30" fill="#fff" opacity="0.15"/><rect x="64" y="56" width="22" height="30" fill="#fff" opacity="0.15"/><rect x="28" y="30" width="44" height="20" fill="#1a1d1a" opacity="0.6"/><circle cx="50" cy="40" r="3" fill="#7dd87d"/></svg>`,
    sketch: `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><rect width="100" height="100" fill="#1a1d1a"/><path d="M20 70 Q 30 30, 50 40 T 80 30" fill="none" stroke="#f4efe4" stroke-width="1.2"/><path d="M22 78 Q 40 50, 60 55 T 82 48" fill="none" stroke="#f4efe4" stroke-width="1" opacity="0.6"/><circle cx="30" cy="28" r="8" fill="none" stroke="#f4efe4" stroke-width="1"/></svg>`,
  };

  function build(item, idx) {
    let node;
    if (item.type === 'sticky') {
      node = el('div', `canvas-item sticky ${item.variant}`,
        `<span class="tag">${item.tag}</span>${item.body.replace(/\n/g,'<br>')}`);
    } else if (item.type === 'index') {
      node = el('div', 'canvas-item index-card',
        `<span class="label">${item.label}</span><div class="body">${item.body}</div>`);
    } else if (item.type === 'torn') {
      node = el('div', 'canvas-item torn-paper',
        `${item.body}<span class="attr">${item.attr}</span>`);
    } else if (item.type === 'polaroid') {
      const imgSvg = item.imgContent === 'svg-desk' ? svgs.desk :
                     item.imgContent === 'svg-sketch' ? svgs.sketch : '';
      node = el('div', 'canvas-item polaroid',
        `<div class="photo" style="background:${item.imgBg};">${imgSvg}</div>
         <div class="caption">${item.caption}</div>`);
    } else if (item.type === 'chip') {
      node = el('div', 'canvas-item tool-chip',
        `<span class="swatch" style="background:${item.color};"></span>${item.label}`);
    } else if (item.type === 'doodle') {
      node = el('div', 'canvas-item', svgs[item.svg]);
    } else if (item.type === 'tape') {
      node = el('div', 'canvas-item tape');
    } else {
      return;
    }

    // position
    node.style.left = item.x + '%';
    node.style.top = item.y + '%';
    node.style.transform = `rotate(${item.rot || 0}deg)`;
    node.style.zIndex = 10 + idx;
    node.dataset.baseRot = item.rot || 0;
    node.dataset.idx = idx;
    if (item.reveal) {
      node.dataset.reveal = JSON.stringify(item.reveal);
    }

    // entrance stagger
    node.style.opacity = '0';
    node.style.transition = `opacity .6s ${0.05 * idx + 0.3}s, transform .7s ${0.05 * idx + 0.3}s cubic-bezier(.2,.9,.3,1.2)`;
    const finalTransform = node.style.transform;
    node.style.transform = `rotate(${(item.rot||0) - 10}deg) translateY(-20px) scale(0.85)`;

    root.appendChild(node);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        node.style.opacity = '1';
        node.style.transform = finalTransform;
      });
    });
  }

  items.forEach(build);

  // --- drag logic ---
  let activeBubble = null;
  function closeBubble() {
    if (activeBubble) {
      activeBubble.classList.remove('show');
      const b = activeBubble;
      activeBubble = null;
      setTimeout(() => b.remove(), 250);
    }
  }

  let zCounter = 200;
  let dragState = null;
  let clickCandidate = null;

  document.addEventListener('pointerdown', (e) => {
    const node = e.target.closest('.canvas-item');
    if (!node || !node.closest('.hero')) return;

    // Bring to front
    zCounter++;
    node.style.zIndex = zCounter;

    const rect = node.getBoundingClientRect();
    const heroRect = document.querySelector('.hero').getBoundingClientRect();

    dragState = {
      node,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      heroRect,
      moved: false,
      baseRot: parseFloat(node.dataset.baseRot) || 0,
    };
    clickCandidate = node;
    node.classList.add('dragging');
    // keep current rotation during drag until real movement
    node.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('pointermove', (e) => {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragState.moved = true;

    const { node, offsetX, offsetY, heroRect, baseRot } = dragState;
    const x = e.clientX - heroRect.left - offsetX;
    const y = e.clientY - heroRect.top - offsetY;

    // convert to % for responsiveness preservation (but store as px via left/top)
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    // add a subtle tilt based on velocity
    const tilt = Math.max(-8, Math.min(8, dx * 0.04));
    node.style.transform = `rotate(${baseRot + tilt}deg)`;
  });

  document.addEventListener('pointerup', (e) => {
    if (!dragState) return;
    const { node, moved, baseRot } = dragState;
    node.classList.remove('dragging');
    node.style.transition = '';
    node.style.transform = `rotate(${baseRot}deg)`;

    // if no drag movement → treat as click (reveal)
    if (!moved && clickCandidate === node) {
      const revealJson = node.dataset.reveal;
      if (revealJson) {
        closeBubble();
        const rev = JSON.parse(revealJson);
        const bubble = document.createElement('div');
        bubble.className = 'reveal-bubble';
        bubble.innerHTML = `<div class="badge">${rev.title.toUpperCase()}</div>${rev.body}`;
        const rect = node.getBoundingClientRect();
        const heroRect = document.querySelector('.hero').getBoundingClientRect();
        bubble.style.left = (rect.left - heroRect.left + rect.width/2 - 30) + 'px';
        bubble.style.top = (rect.top - heroRect.top + rect.height + 14) + 'px';
        document.querySelector('.hero').appendChild(bubble);
        activeBubble = bubble;
        requestAnimationFrame(() => bubble.classList.add('show'));
        // auto close
        setTimeout(() => { if (activeBubble === bubble) closeBubble(); }, 4200);

        // tally easter eggs
        window.__trackSecret && window.__trackSecret('reveal');
      } else {
        // tape clicked — little wiggle
        node.animate([
          { transform: `rotate(${baseRot}deg)` },
          { transform: `rotate(${baseRot + 8}deg)` },
          { transform: `rotate(${baseRot - 6}deg)` },
          { transform: `rotate(${baseRot}deg)` },
        ], { duration: 400, easing: 'ease-out' });
      }
    } else {
      closeBubble();
    }

    dragState = null;
    clickCandidate = null;
  });

  // close bubble on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.canvas-item')) closeBubble();
  });

  // close on scroll
  window.addEventListener('scroll', closeBubble, { passive: true });

})();
