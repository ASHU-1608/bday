(() => {
  const $ = (s) => document.querySelector(s);
  const intro = $('#intro'), stage = $('#stage'), book = $('#book');
  const leaves = [...document.querySelectorAll('.leaf')];
  const prev = $('#prev'), next = $('#next'), counter = $('#counter');
  let flipped = 0; // how many leaves are turned

  /* ---------- floating hearts in the background ---------- */
  const floaters = $('#floaters');
  const glyphs = ['\u2665', '\u2665', '\u2726', '\u2661'];
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('span');
    el.className = 'floater';
    el.textContent = glyphs[i % glyphs.length];
    el.style.left = Math.random() * 100 + '%';
    el.style.fontSize = 10 + Math.random() * 22 + 'px';
    el.style.animationDuration = 11 + Math.random() * 14 + 's';
    el.style.animationDelay = -Math.random() * 22 + 's';
    el.style.setProperty('--sway', (Math.random() * 120 - 60) + 'px');
    floaters.appendChild(el);
  }

  /* ---------- scale the book to fit any screen ---------- */
  function fit() {
    const s = Math.min((innerWidth - 24) / 640, (innerHeight - 170) / 460, 1.35);
    document.documentElement.style.setProperty('--s', Math.max(s, 0.3));
  }
  addEventListener('resize', fit);
  fit();

  /* ---------- heart burst ---------- */
  function burst(x, y, n = 18) {
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'burst';
      h.textContent = i % 3 ? '\u2665' : '\u2726';
      const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 150;
      h.style.left = x + 'px';
      h.style.top = y + 'px';
      h.style.fontSize = 14 + Math.random() * 18 + 'px';
      h.style.setProperty('--x', Math.cos(a) * d + 'px');
      h.style.setProperty('--y', Math.sin(a) * d - 40 + 'px');
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1400);
    }
  }

  /* ---------- page turning ---------- */
  function render() {
    leaves.forEach((leaf, i) => {
      const isFlipped = i < flipped;
      leaf.classList.toggle('flipped', isFlipped);
      // turned pages stack up on the left, unturned ones on the right
      leaf.style.zIndex = isFlipped ? i + 1 : leaves.length - i;
    });
    book.classList.toggle('closed', flipped === 0);
    prev.disabled = flipped === 0;
    next.disabled = flipped === leaves.length;
    counter.textContent = '\u2665 '.repeat(flipped) + '\u2661 '.repeat(leaves.length - flipped);
  }

  function go(dir) {
    const n = flipped + dir;
    if (n < 0 || n > leaves.length) return;
    flipped = n;
    render();
    if (flipped === leaves.length) {
      const r = book.getBoundingClientRect();
      burst(r.left + r.width * 0.5, r.top + r.height * 0.45, 26);
    }
  }

  // click the right page to go forward, the left page to go back
  leaves.forEach((leaf, i) => {
    leaf.querySelector('.front').addEventListener('click', () => { if (i === flipped) go(1); });
    leaf.querySelector('.back').addEventListener('click', () => { if (i === flipped - 1) go(-1); });
  });
  next.addEventListener('click', () => go(1));
  prev.addEventListener('click', () => go(-1));

  $('#replay').addEventListener('click', () => {
    // flip everything back one by one for a nice rewind
    const rewind = setInterval(() => {
      if (flipped === 0) return clearInterval(rewind);
      go(-1);
    }, 260);
  });

  addEventListener('keydown', (e) => {
    if (stage.classList.contains('hidden')) return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  // swipe on phones
  let startX = null;
  stage.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    startX = null;
  });

  /* ---------- open the card ---------- */
  $('#openBtn').addEventListener('click', (e) => {
    burst(e.clientX, e.clientY, 22);
    intro.classList.add('leave');
    setTimeout(() => {
      intro.classList.add('hidden');
      stage.classList.remove('hidden');
      fit();
    }, 650);
  });

  render();
})();
