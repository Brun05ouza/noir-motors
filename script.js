// Smooth scroll uses native layout, so the existing viewport observers still work.
(() => {
  if (typeof Lenis !== 'function') return;
  const root = document.documentElement;
  const lenis = new Lenis({
    autoRaf: true,
    anchors: true,
    lerp: 0.085,
    smoothWheel: true,
    syncTouch: false,
    respectReducedMotion: true,
    prevent: node => node instanceof Element && Boolean(node.closest('dialog'))
  });
  window.lenis = lenis;
  let locked;
  const syncLock = () => {
    const next = root.classList.contains('is-loading') || root.classList.contains('is-revealing') || Boolean(document.querySelector('dialog[open]'));
    if (next === locked) return;
    locked = next;
    if (locked) lenis.stop();
    else { lenis.resize(); lenis.start(); }
  };
  new MutationObserver(syncLock).observe(root, { attributes: true, attributeFilter: ['class'] });
  document.querySelectorAll('dialog').forEach(dialog => {
    new MutationObserver(syncLock).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  });
  syncLock();
})();

(() => {
  const root = document.documentElement;
  const loader = document.querySelector('.loader');
  const main = document.querySelector('main');
  const footer = document.querySelector('.site-footer');
  const counter = document.querySelector('#load-percentage');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!root.classList.contains('is-loading') || !loader) return;

  main.inert = true;
  footer.inert = true;
  const started = performance.now();
  const minimumDuration = reducedMotion ? 400 : 1800;
  const assets = [...document.querySelectorAll('.showcase img:not([data-later-take])')].map(image => image.decode().catch(() => {}));
  if (document.fonts) assets.push(document.fonts.ready);
  let settled = 0;
  let displayed = 0;
  let lastFrame = started;
  let finished = false;
  assets.forEach(asset => Promise.resolve(asset).finally(() => { settled += 1; }));

  function reveal() {
    if (finished || !loader.isConnected) return;
    finished = true;
    clearTimeout(window.noirLoaderFallback);
    counter.textContent = '100';
    setTimeout(() => {
      root.classList.add('is-revealing');
      root.classList.remove('is-loading');
      main.inert = false;
      footer.inert = false;
      loader.setAttribute('aria-hidden', 'true');
      setTimeout(() => window.dispatchEvent(new Event('noir:ready')), reducedMotion ? 0 : 800);
      setTimeout(() => {
        loader.remove();
        root.classList.remove('is-revealing');
      }, reducedMotion ? 250 : 1900);
    }, reducedMotion ? 0 : 220);
  }

  function tick(now) {
    if (!loader.isConnected || !root.classList.contains('is-loading')) return;
    const elapsed = now - started;
    const target = assets.length ? 10 + 90 * settled / assets.length : 100;
    const timeLimit = Math.min(100, elapsed / minimumDuration * 100);
    displayed += (Math.min(target, timeLimit) - displayed) * (1 - Math.exp(-(now - lastFrame) / 90));
    lastFrame = now;
    counter.textContent = String(Math.floor(displayed));
    if ((settled === assets.length && displayed >= 99.5) || elapsed >= 6000) reveal();
    else requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// Only the supplied models are included in this first collection.
(() => {
  const dialog = document.querySelector('.vehicle-dialog');
  const heading = document.querySelector('#vehicle-dialog-title');
  const overview = document.querySelector('.collection-overview');
  const detail = document.querySelector('.vehicle-detail-view');
  const photo = document.querySelector('.dialog-car-photo');
  const category = document.querySelector('.dialog-car-category');
  const models = {
    porsche: { name: 'Porsche 911 Carrera', category: 'Sports Coupe', alt: 'Porsche 911 laranja em estúdio' },
    mercedes: { name: 'Mercedes-AMG GT', category: 'Grand Tourer', alt: 'Mercedes-AMG GT prateada em estúdio' }
  };
  function openOverview() {
    heading.textContent = 'Find your next drive';
    overview.hidden = false;
    detail.hidden = true;
    if (!dialog.open) dialog.showModal();
  }
  document.querySelector('[data-collection]').addEventListener('click', openOverview);
  document.querySelector('.back-to-collection').addEventListener('click', openOverview);
  document.querySelectorAll('[data-vehicle]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.vehicle;
      const model = models[key];
      heading.textContent = model.name;
      category.textContent = `Category: ${model.category}`;
      photo.className = `dialog-car-photo vehicle-art vehicle-art--${key}`;
      photo.querySelector('img').alt = model.alt;
      overview.hidden = true;
      detail.hidden = false;
      if (!dialog.open) dialog.showModal();
      else document.querySelector('.vehicle-dialog-close').focus();
    });
  });
  document.querySelector('.vehicle-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
})();

(() => {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = document.querySelectorAll('.vehicle-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const images = [...entry.target.querySelectorAll('img')];
      Promise.allSettled(images.map(image => {
        image.loading = 'eager';
        return image.decode();
      })).then(() => {
        requestAnimationFrame(() => entry.target.classList.add('car-entered'));
      });
    });
  }, { threshold: .25, rootMargin: '0px 0px -20px 0px' });
  cards.forEach(card => {
    card.classList.add('car-ready');
    card.addEventListener('focusin', () => {
      card.classList.add('car-entered');
      observer.unobserve(card);
    });
  });
  const observe = () => cards.forEach(card => observer.observe(card));
  if (document.documentElement.classList.contains('is-loading')) window.addEventListener('noir:ready', observe, { once: true });
  else observe();
})();

(() => {
  const showcase = document.querySelector('.showcase');
  const slides = [...document.querySelectorAll('.take-slide')];
  const heroTakes = [...document.querySelectorAll('.hero-take')];
  const button = document.querySelector('.takes-pause');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches;
  let visible = true;
  let ready = false;
  let timer;
  let index = 0;
  let heroIndex = -1;
  let ticks = 0;
  function sync() {
    clearInterval(timer);
    const playing = ready && !paused && visible && !document.hidden;
    showcase.classList.toggle('takes-running', playing);
    showcase.classList.toggle('takes-paused', !playing);
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Reproduzir takes do carro' : 'Pausar takes do carro');
    button.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
    if (!playing) return;
    timer = setInterval(() => {
      const next = (index + 1) % slides.length;
      const image = slides[next].querySelector('img');
      if (image.complete && image.naturalWidth) {
        slides[index].classList.remove('is-active');
        slides[index].setAttribute('aria-hidden', 'true');
        slides[next].classList.add('is-active');
        slides[next].removeAttribute('aria-hidden');
        index = next;
      }
      ticks += 1;
      if (ticks % 2 === 0) {
        heroIndex = (heroIndex + 1) % (heroTakes.length + 1);
        heroTakes.forEach((take, i) => {
          const img = take.querySelector('img');
          take.classList.toggle('is-active', i === heroIndex && img.complete && img.naturalWidth > 0);
        });
      }
    }, 5500);
  }
  button.addEventListener('click', () => { paused = !paused; sync(); });
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', () => { paused = motion.matches; sync(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: .1 }).observe(showcase);
  }
  const start = () => {
    setTimeout(() => { ready = true; sync(); }, 1200);
  };
  if (document.documentElement.classList.contains('is-loading')) window.addEventListener('noir:ready', start, { once: true });
  else start();
  sync();
})();

(() => {
  const details = {
    wheels: { title: 'O detalhe muda tudo.', description: 'Rodas grafite e um toque de vermelho. O contraste que completa a presença.', origin: '25% 72%', alt: 'Detalhe das rodas grafite e do acabamento perolado' },
    silhouette: { title: 'Uma linha contínua.', description: 'Teto escuro, vidro e carroceria se encontram em uma silhueta desenhada para o olhar percorrer.', origin: '55% 40%', alt: 'Detalhe da linha do teto e da silhueta do cupê' },
    front: { title: 'Presença à primeira vista.', description: 'Superfícies esculpidas e proporções baixas. Um desenho que se reconhece antes da partida.', origin: '83% 62%', alt: 'Detalhe do desenho frontal e da roda dianteira do cupê' }
  };
  const buttons = [...document.querySelectorAll('[data-detail]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    const detail = details[button.dataset.detail];
    document.querySelector('#detail-title').textContent = detail.title;
    document.querySelector('#detail-description').textContent = detail.description;
    const image = document.querySelector('.wheel-detail img');
    image.style.transformOrigin = detail.origin;
    image.style.objectPosition = button.dataset.detail === 'front' ? '100% 50%' : button.dataset.detail === 'silhouette' ? '50% 50%' : '0% 50%';
    image.alt = detail.alt;
    buttons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  }));
})();

// Editorial chapters reveal once, as they enter the viewport.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || reducedMotion.matches) return;
  const groups = [
    ['.experience h2', 0, 'up'],
    ['.experience-image', 0, 'up'],
    ['.experience-column:nth-child(2)', 80, 'up'],
    ['.experience-column:nth-child(3)', 160, 'up'],
    ['.direction-portrait', 0, 'photo'],
    ['.direction-statement', 100, 'right'],
    ['.footer-main', 0, 'up'],
    ['.footer-meta', 80, 'up']
  ];
  const targets = groups.map(([selector, delay, direction]) => {
    const element = document.querySelector(selector);
    element.classList.add('chapter-reveal', `chapter-reveal--${direction}`);
    element.style.setProperty('--chapter-delay', `${delay}ms`);
    return element;
  });
  const revealed = new WeakSet();
  const reveal = element => {
    if (revealed.has(element)) return;
    revealed.add(element);
    observer.unobserve(element);
    if (!element.matches('.direction-portrait')) {
      element.classList.add('chapter-visible');
      return;
    }
    const image = element.querySelector('img');
    image.loading = 'eager';
    image.decode().catch(() => {}).then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => element.classList.add('chapter-visible'));
      });
    });
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, { threshold: .12, rootMargin: '0px 0px -24px 0px' });
  targets.forEach(element => element.addEventListener('focusin', () => reveal(element)));
  const start = () => targets.forEach(element => observer.observe(element));
  if (document.documentElement.classList.contains('is-loading')) window.addEventListener('noir:ready', start, { once: true });
  else start();
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) targets.forEach(reveal);
  });
})();

document.querySelector('#footer-year').textContent = new Date().getFullYear();

(() => {
  const section = document.querySelector('.performance-editorial');
  const controls = section.querySelector('.performance-controls');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || motion.matches) return;
  section.classList.add('performance-ready');
  controls.inert = true;
  let started = false;
  let timer;
  const finish = () => {
    section.classList.add('performance-car-in', 'performance-controls-in');
    controls.inert = false;
  };
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting) || started) return;
    started = true;
    observer.disconnect();
    Promise.allSettled([...section.querySelectorAll('.performance-scene img')].map(image => {
      image.loading = 'eager';
      return image.decode();
    })).then(() => {
      if (motion.matches) { finish(); return; }
      section.classList.add('performance-car-in');
      timer = setTimeout(finish, 1700);
    });
  }, { threshold: .2, rootMargin: '0px 0px -24px 0px' });
  const start = () => observer.observe(section);
  if (document.documentElement.classList.contains('is-loading')) window.addEventListener('noir:ready', start, { once: true });
  else start();
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    clearTimeout(timer);
    observer.disconnect();
    finish();
  });
})();
