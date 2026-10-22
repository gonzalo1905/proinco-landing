(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('menu');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  };
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Active section in nav ---------- */
  const navLinks = [...menu.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Service tabs ---------- */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });
  // Hero sector shortcuts open the matching tab
  document.querySelectorAll('[data-tab-link]').forEach((link) => {
    link.addEventListener('click', () => {
      const tab = document.getElementById('tab-' + link.dataset.tabLink);
      if (tab) selectTab(tab);
    });
  });

  /* ---------- Reveal on scroll (only for items still below the fold) ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const items = [...document.querySelectorAll('.reveal')]
      .filter((el) => el.getBoundingClientRect().top > window.innerHeight);
    items.forEach((el) => el.classList.add('is-pending'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-pending');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Altimeter count-up ---------- */
  const alt = document.querySelector('[data-count]');
  if (alt && !reduceMotion) {
    const target = Number(alt.dataset.count);
    const fmt = new Intl.NumberFormat('en-US');
    const start = performance.now();
    const dur = 1600;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      alt.textContent = fmt.format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Client marquee: duplicate the list for a seamless loop ---------- */
  const track = document.querySelector('.marquee__track');
  if (track && !reduceMotion) {
    const clone = track.firstElementChild.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('img').forEach((img) => { img.alt = ''; });
    track.appendChild(clone);
  }

  /* ---------- Contact form → opens the visitor's mail client ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const TO = 'ti@grupoproinco.com';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach((input) => {
      const ok = input.checkValidity() && input.value.trim() !== '';
      input.closest('.field').classList.toggle('is-invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      status.textContent = 'Complete su nombre, un correo válido y el detalle del proyecto.';
      status.classList.add('is-error');
      firstInvalid.focus();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const subject = `Solicitud de cotización · ${d.servicio}${d.empresa ? ' · ' + d.empresa : ''}`;
    const lines = [`Nombre: ${d.nombre}`];
    if (d.empresa) lines.push(`Empresa: ${d.empresa}`);
    lines.push(`Correo: ${d.email}`);
    if (d.telefono) lines.push(`Teléfono: ${d.telefono}`);
    lines.push(`Servicio: ${d.servicio}`, '', d.mensaje);
    const body = lines.join('\n');
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.classList.remove('is-error');
    status.textContent = `Se abrió su aplicación de correo con la solicitud lista. Si no se abrió, escríbanos a ${TO}.`;
  });
  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field');
    if (field && field.classList.contains('is-invalid') && e.target.checkValidity()) field.classList.remove('is-invalid');
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
