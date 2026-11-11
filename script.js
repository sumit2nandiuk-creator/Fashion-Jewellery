/* Fashion Jewellery — shared behaviour: currency, bag, navigation, filters */
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

  /* ------------------------------------------------------------ filters */
  const filters = document.querySelector('.filters');
  if (filters) {
    filters.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        const active = filters.querySelector('.active');
        if (active) active.classList.remove('active');
        button.classList.add('active');
        document.querySelectorAll('.product').forEach(product => {
          product.hidden = button.dataset.filter !== 'all' && product.dataset.category !== button.dataset.filter;
        });
      });
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
  let currencyLocked = false; /* true once the visitor chooses a currency themselves */
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

  /* custom currency dropdown */
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

  /* best guess from the browser when the network lookup is unavailable */
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
      /* Cloudflare Pages exposes the visitor country on the same origin */
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
  const drawer = document.querySelector('.drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  const orderButton = document.querySelector('.whatsapp-order');
  const bagButton = document.querySelector('.bag-button');
  const closeButton = document.querySelector('.close-drawer');
  let bag = [];
  try {
    const saved = JSON.parse(localStorage.getItem('fashion-jewellery-bag') || '[]');
    if (Array.isArray(saved)) bag = saved.filter(item => typeof item.name === 'string' && Number.isFinite(item.price));
  } catch (_) {}

  function toggleBag(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (backdrop) backdrop.hidden = !open;
    if (open && closeButton) closeButton.focus();
  }

  function renderBag() {
    document.querySelectorAll('.bag-count').forEach(el => { el.textContent = String(bag.length); });
    const items = document.querySelector('.bag-items');
    if (items) {
      items.replaceChildren();
      if (!bag.length) {
        const p = document.createElement('p');
        p.textContent = 'Your bag is waiting for a little sparkle.';
        items.append(p);
      }
      bag.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'bag-row';
        const name = document.createElement('span');
        name.textContent = item.name + ' \u2014 ' + money(item.price);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => { bag.splice(index, 1); renderBag(); });
        row.append(name, remove);
        items.append(row);
      });
    }
    const subtotal = document.querySelector('.subtotal');
    if (subtotal) subtotal.textContent = money(bag.reduce((sum, item) => sum + item.price, 0));
    if (orderButton) orderButton.disabled = !bag.length;
    try { localStorage.setItem('fashion-jewellery-bag', JSON.stringify(bag)); } catch (_) {}
  }

  document.querySelectorAll('.add, .add-to-bag').forEach(button => {
    button.addEventListener('click', () => {
      bag.push({ name: button.dataset.name, price: Number(button.dataset.price) });
      renderBag();
      toggleBag(true);
    });
  });
  if (bagButton) bagButton.addEventListener('click', () => toggleBag(true));
  if (closeButton) closeButton.addEventListener('click', () => toggleBag(false));
  if (backdrop) backdrop.addEventListener('click', () => toggleBag(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer && drawer.classList.contains('open')) toggleBag(false);
  });

  if (orderButton) {
    orderButton.addEventListener('click', () => {
      if (!bag.length) return;
      const lines = bag.map(item => '- ' + item.name + ' (' + inrText(item.price) + ')');
      const total = bag.reduce((sum, item) => sum + item.price, 0);
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
