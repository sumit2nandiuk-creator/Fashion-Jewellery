/* Fashion Jewellery — shared behaviour: navigation, currency, bag and cart */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- nav */
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  /* ------------------------------------------------------- sticky header */
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------ filters */
  const filters = document.querySelector('.filters');
  if (filters) {
    const buttons = Array.from(filters.querySelectorAll('button'));
    const products = Array.from(document.querySelectorAll('.product'));

    const applyFilter = (value, updateHash) => {
      const target = buttons.find(button => button.dataset.filter === value) || buttons[0];
      if (!target) return;
      buttons.forEach(button => button.classList.toggle('active', button === target));
      products.forEach(product => {
        product.hidden = target.dataset.filter !== 'all' && product.dataset.category !== target.dataset.filter;
      });
      if (updateHash && window.history && history.replaceState) {
        try { history.replaceState(null, '', '#' + target.dataset.filter); } catch (_) {}
      }
    };

    buttons.forEach(button => {
      button.addEventListener('click', () => applyFilter(button.dataset.filter, true));
    });

    const fromHash = () => (location.hash || '').replace('#', '');
    if (buttons.some(button => button.dataset.filter === fromHash())) applyFilter(fromHash(), false);
    window.addEventListener('hashchange', () => {
      if (buttons.some(button => button.dataset.filter === fromHash())) applyFilter(fromHash(), false);
    });
  }

  /* ----------------------------------------------------------- currency */
  const CURRENCIES = {
    INR: { rate: 1, symbol: '\u20b9', locale: 'en-IN', name: 'Indian rupee' },
    USD: { rate: 1 / 88, symbol: '$', locale: 'en-US', name: 'US dollar' },
    GBP: { rate: 1 / 112, symbol: '\u00a3', locale: 'en-GB', name: 'Pound sterling' }
  };
  const REGION_CURRENCY = { IN: 'INR', GB: 'GBP', US: 'USD', CA: 'USD', AU: 'USD', NZ: 'USD', AE: 'USD', SG: 'USD', IE: 'GBP' };

  let currency = 'INR';
  let currencyLocked = false;
  try {
    const saved = localStorage.getItem('fashion-jewellery-currency');
    if (saved && CURRENCIES[saved]) { currency = saved; currencyLocked = true; }
  } catch (_) {}

  function inrText(amount) {
    return '\u20b9' + Math.round(amount).toLocaleString('en-IN');
  }
  function money(amountInInr) {
    const conf = CURRENCIES[currency];
    const value = amountInInr * conf.rate;
    const rounded = currency === 'INR' ? Math.round(value) : Math.round(value * 100) / 100;
    const formatted = rounded.toLocaleString(conf.locale, currency === 'INR'
      ? { maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return conf.symbol + formatted;
  }
  function renderPrices() {
    document.querySelectorAll('[data-inr]').forEach(el => {
      const amount = Number(el.dataset.inr);
      if (Number.isFinite(amount)) el.textContent = money(amount);
    });
  }

  const picker = document.querySelector('[data-currency-picker]');
  const toggle = picker && picker.querySelector('.currency-toggle');
  const menuList = picker && picker.querySelector('.currency-menu');
  const label = picker && picker.querySelector('.currency-code');
  const options = menuList ? Array.from(menuList.querySelectorAll('[role="option"]')) : [];

  function closePicker(returnFocus) {
    if (!picker || !menuList) return;
    menuList.hidden = true;
    picker.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }
  function openPicker(focusIndex) {
    if (!picker || !menuList) return;
    menuList.hidden = false;
    picker.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    if (typeof focusIndex === 'number' && options[focusIndex]) options[focusIndex].focus();
  }

  function applyCurrency(value, persist) {
    if (!CURRENCIES[value]) return;
    currency = value;
    if (persist) {
      currencyLocked = true;
      try { localStorage.setItem('fashion-jewellery-currency', value); } catch (_) {}
    }
    options.forEach(option => {
      const isSelected = option.dataset.value === value;
      option.setAttribute('aria-selected', String(isSelected));
      option.classList.toggle('selected', isSelected);
    });
    if (label) label.textContent = CURRENCIES[value].symbol + ' ' + value;
    if (toggle) toggle.setAttribute('aria-label', 'Currency: ' + CURRENCIES[value].name);
    renderPrices();
    renderBag();
  }

  function regionCurrency(region) {
    if (!region) return 'INR';
    return REGION_CURRENCY[region] || 'USD';
  }

  function browserRegion() {
    const tags = [].concat(navigator.languages || [], navigator.language || []);
    for (const tag of tags) {
      const parts = String(tag).split('-');
      if (parts.length > 1 && /^[A-Za-z]{2}$/.test(parts[1])) return parts[1].toUpperCase();
    }
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (/Kolkata|Calcutta/.test(tz)) return 'IN';
      if (/^Europe\/London/.test(tz)) return 'GB';
      if (/^America\//.test(tz)) return 'US';
    } catch (_) {}
    return '';
  }

  async function detectCurrency() {
    if (currencyLocked) return;
    let region = '';
    try {
      const response = await fetch('/cdn-cgi/trace', { cache: 'no-store' });
      if (response.ok) {
        const match = (await response.text()).match(/^loc=([A-Z]{2})$/m);
        if (match && !['XX', 'T1'].includes(match[1])) region = match[1];
      }
    } catch (_) {}
    if (!region) region = browserRegion();
    if (currencyLocked) return;
    applyCurrency(regionCurrency(region), false);
  }

  if (picker && toggle && menuList) {
    toggle.addEventListener('click', () => {
      if (menuList.hidden) openPicker(0);
      else closePicker(true);
    });
    options.forEach(option => {
      option.addEventListener('click', () => { applyCurrency(option.dataset.value, true); closePicker(false); toggle.focus(); });
      option.addEventListener('keydown', event => {
        const index = options.indexOf(option);
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); applyCurrency(option.dataset.value, true); closePicker(false); toggle.focus(); }
        else if (event.key === 'ArrowDown') { event.preventDefault(); (options[index + 1] || options[0]).focus(); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); (options[index - 1] || options[options.length - 1]).focus(); }
        else if (event.key === 'Escape') { event.preventDefault(); closePicker(true); }
        else if (event.key === 'Tab') { closePicker(false); }
      });
    });
    document.addEventListener('click', event => {
      if (!menuList.hidden && !picker.contains(event.target)) closePicker(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menuList.hidden) closePicker(true);
    });
  }

  /* ---------------------------------------------------------------- bag */
  const CART_KEY = 'fashion-jewellery-bag';
  const cartIcon = document.querySelector('.bag-button');
  const orderButton = document.querySelector('.whatsapp-order');
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let bag = [];
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (Array.isArray(saved)) {
      saved.forEach(item => {
        if (typeof item.name !== 'string' || !Number.isFinite(item.price)) return;
        const qty = Number.isFinite(item.qty) && item.qty > 0 ? Math.floor(item.qty) : 1;
        const existing = bag.find(line => line.name === item.name && line.price === item.price);
        if (existing) existing.qty += qty;
        else bag.push({ name: item.name, price: item.price, qty, image: item.image || '', url: item.url || '' });
      });
    }
  } catch (_) {}

  const bagCount = () => bag.reduce((total, item) => total + item.qty, 0);
  const bagTotal = () => bag.reduce((total, item) => total + item.price * item.qty, 0);

  function saveBag() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(bag)); } catch (_) {}
  }

  function stepQuantity(item, delta) {
    item.qty += delta;
    if (item.qty < 1) bag = bag.filter(line => line !== item);
    renderBag();
  }

  function removeItem(item) {
    bag = bag.filter(line => line !== item);
    renderBag();
  }

  function makeStepper(item) {
    const wrap = document.createElement('div');
    wrap.className = 'qty';
    const less = document.createElement('button');
    less.type = 'button';
    less.className = 'qty-button';
    less.textContent = '\u2212';
    less.setAttribute('aria-label', 'Decrease quantity of ' + item.name);
    less.addEventListener('click', () => stepQuantity(item, -1));
    const value = document.createElement('span');
    value.className = 'qty-value';
    value.textContent = String(item.qty);
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'qty-button';
    more.textContent = '+';
    more.setAttribute('aria-label', 'Increase quantity of ' + item.name);
    more.addEventListener('click', () => stepQuantity(item, 1));
    wrap.append(less, value, more);
    return wrap;
  }

  function makeRemove(item) {
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'bag-remove';
    remove.title = 'Remove';
    remove.setAttribute('aria-label', 'Remove ' + item.name + ' from bag');
    remove.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3.75 6.75h16.5"/><path d="M9.25 6.75V4.5a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v2.25"/>' +
      '<path d="M6.25 6.75l.85 12.4a1.5 1.5 0 0 0 1.5 1.35h6.8a1.5 1.5 0 0 0 1.5-1.35l.85-12.4"/>' +
      '<path d="M10 10.75v6M14 10.75v6"/></svg>';
    remove.addEventListener('click', () => removeItem(item));
    return remove;
  }

  function renderBag() {
    document.querySelectorAll('.bag-count').forEach(el => { el.textContent = String(bagCount()); });

    document.querySelectorAll('[data-bag-subtotal]').forEach(el => { el.textContent = money(bagTotal()); });
    document.querySelectorAll('[data-bag-count-label]').forEach(el => {
      const n = bagCount();
      el.textContent = n === 0 ? 'No pieces yet' : n + (n === 1 ? ' piece' : ' pieces');
    });

    const page = document.querySelector('[data-cart-page]');
    if (page) {
      const list = page.querySelector('.cart-items');
      const layout = page.querySelector('.cart-layout');
      const empty = page.querySelector('.cart-empty');
      if (list) {
        list.replaceChildren();
        bag.forEach(item => {
          const row = document.createElement('article');
          row.className = 'cart-item';

          const media = document.createElement(item.url ? 'a' : 'div');
          media.className = 'cart-item-media';
          if (item.url) media.setAttribute('href', item.url);
          if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name;
            img.loading = 'lazy';
            media.append(img);
          } else {
            const glyph = document.createElement('span');
            glyph.className = 'cart-item-placeholder';
            glyph.textContent = '\u25c8';
            media.append(glyph);
          }

          const body = document.createElement('div');
          body.className = 'cart-item-body';
          const head = document.createElement('div');
          head.className = 'cart-item-head';
          const name = document.createElement('h2');
          name.className = 'cart-item-name';
          name.textContent = item.name;
          head.append(name, makeRemove(item));

          const unit = document.createElement('p');
          unit.className = 'cart-item-unit';
          unit.textContent = money(item.price) + ' each';

          const foot = document.createElement('div');
          foot.className = 'cart-item-foot';
          const lineTotal = document.createElement('span');
          lineTotal.className = 'cart-line-total';
          lineTotal.textContent = money(item.price * item.qty);
          foot.append(makeStepper(item), lineTotal);

          body.append(head, unit, foot);
          row.append(media, body);
          list.append(row);
        });
      }
      if (layout) layout.hidden = !bag.length;
      if (empty) empty.hidden = Boolean(bag.length);
    }
    if (orderButton) orderButton.disabled = !bag.length;
    saveBag();
  }

  /* ------------------------------------------------- added-to-bag feedback */
  let toast;
  let toastTimer;

  function getToast() {
    if (toast) return toast;
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = '<span class="toast-text"></span><a class="toast-link" href="cart.html">View bag</a>';
    document.body.append(toast);
    return toast;
  }

  function showToast(name) {
    const el = getToast();
    el.querySelector('.toast-text').textContent = 'Added to bag \u2014 ' + name;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }

  function pulseCart() {
    if (!cartIcon) return;
    cartIcon.classList.remove('bump');
    void cartIcon.offsetWidth;
    cartIcon.classList.add('bump');
    setTimeout(() => cartIcon.classList.remove('bump'), 620);
  }

  function flyToCart(source) {
    if (!cartIcon) return;
    if (reduceMotion || !source || typeof source.getBoundingClientRect !== 'function') { pulseCart(); return; }
    const from = source.getBoundingClientRect();
    const to = cartIcon.getBoundingClientRect();
    const chip = document.createElement('span');
    chip.className = 'fly-chip';
    chip.textContent = '+1';
    chip.setAttribute('aria-hidden', 'true');
    chip.style.left = (from.left + from.width / 2) + 'px';
    chip.style.top = (from.top + from.height / 2) + 'px';
    if (typeof chip.animate !== 'function') { pulseCart(); return; }
    document.body.append(chip);
    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    const animation = chip.animate([
      { transform: 'translate(-50%, -50%) scale(.6)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(1.05)', opacity: 1, offset: .18 },
      { transform: 'translate(calc(-50% + ' + dx * .55 + 'px), calc(-50% + ' + (dy * .55 - 60) + 'px)) scale(.9)', opacity: 1, offset: .6 },
      { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.35)', opacity: 0 }
    ], { duration: 760, easing: 'cubic-bezier(.2,.72,.3,1)' });
    animation.onfinish = () => { chip.remove(); pulseCart(); };
  }

  document.querySelectorAll('.add, .add-to-bag').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.dataset.name;
      const price = Number(button.dataset.price);
      const image = button.dataset.image || '';
      const url = button.dataset.url || '';
      const existing = bag.find(item => item.name === name && item.price === price);
      if (existing) existing.qty += 1;
      else bag.push({ name, price, qty: 1, image, url });
      renderBag();
      showToast(name);
      flyToCart(button);
    });
  });

  if (orderButton) {
    orderButton.addEventListener('click', () => {
      if (!bag.length) return;
      const lines = bag.map(item => '- ' + item.name + ' \u00d7 ' + item.qty + ' (' + inrText(item.price * item.qty) + ')');
      const total = bagTotal();
      const converted = currency === 'INR' ? '' : ' (approx. ' + money(total) + ')';
      const message = 'Hello Fashion Jewellery! I\'d like to order:\n' + lines.join('\n') +
        '\nSubtotal: ' + inrText(total) + converted +
        '\nPlease confirm availability, shipping and payment. I understand the final charge is in INR.';
      window.open('https://wa.me/918697771768?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
    });
  }

  if (picker && options.length) applyCurrency(currency, false);
  else renderPrices();
  renderBag();
  detectCurrency();
})();
