/* Fashion Jewellery — store app (no build step, data in localStorage) */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ utils */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const money = value => '₹' + Math.round(Number(value) || 0).toLocaleString('en-IN');
  const pct = (price, mrp) => (mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : 0);
  const uid = prefix => prefix + Math.random().toString(36).slice(2, 7).toUpperCase();
  const today = () => new Date().toISOString().slice(0, 10);
  const dayOffset = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

  const LS = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw == null ? fallback : JSON.parse(raw); }
      catch (e) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} },
    del(key) { try { localStorage.removeItem(key); } catch (e) {} }
  };

  /* ------------------------------------------------------------------ state */
  const CATEGORIES = window.FJ_CATEGORIES;
  const BASE_PRODUCTS = window.FJ_PRODUCTS;

  let products = LS.get('fj_products', null) || BASE_PRODUCTS.map(p => Object.assign({}, p));
  let users = LS.get('fj_users', null);
  let orders = LS.get('fj_orders', null);
  let reviews = LS.get('fj_reviews', null) || window.FJ_REVIEWS.slice();
  let session = LS.get('fj_session', null);
  let cart = LS.get('fj_cart', []);
  let wishlist = LS.get('fj_wishlist', []);
  let lang = LS.get('fj_lang', 'en');
  let settings = LS.get('fj_settings', { freeDeliveryOver: 999, deliveryFee: 49 });
  const filters = { price: 'all', metal: [], occasion: [], rating: false, sort: 'relevance' };
  let adminTab = 'dashboard';

  if (!users) {
    users = [
      { name: 'Store Admin', email: 'admin@fashionjewellery.in', phone: '8697771768', password: 'admin123', role: 'admin', addresses: [] },
      { name: 'Ananya Sen', email: 'ananya@example.com', phone: '9876543210', password: 'ananya123', role: 'customer',
        addresses: [{ name: 'Ananya Sen', phone: '9876543210', line: '14B, Sarat Chatterjee Road', city: 'Kolkata', state: 'West Bengal', pin: '700086' }] }
    ];
    LS.set('fj_users', users);
  }
  if (!orders) {
    orders = [
      { id: 'FJ-24081', user: 'ananya@example.com', date: dayOffset(-1), status: 'Delivered', payment: 'upi',
        items: [{ id: 'rajbari-jhumka', qty: 1, price: 2450, name: 'The Rajbari Jhumka' }],
        address: { name: 'Ananya Sen', phone: '9876543210', line: '14B, Sarat Chatterjee Road', city: 'Kolkata', state: 'West Bengal', pin: '700086' } },
      { id: 'FJ-24079', user: 'ananya@example.com', date: dayOffset(-3), status: 'Shipped', payment: 'cod',
        items: [{ id: 'debi-haar', qty: 1, price: 6900, name: 'The Debi Haar' }, { id: 'muse-ring', qty: 2, price: 1450, name: 'The Muse Ring' }],
        address: { name: 'Ananya Sen', phone: '9876543210', line: '14B, Sarat Chatterjee Road', city: 'Kolkata', state: 'West Bengal', pin: '700086' } },
      { id: 'FJ-24075', user: 'ananya@example.com', date: dayOffset(-5), status: 'Ordered', payment: 'card',
        items: [{ id: 'bangla-bala', qty: 1, price: 3200, name: 'The Bangla Bala Set' }],
        address: { name: 'Ananya Sen', phone: '9876543210', line: '14B, Sarat Chatterjee Road', city: 'Kolkata', state: 'West Bengal', pin: '700086' } }
    ];
    LS.set('fj_orders', orders);
  }

  const saveCart = () => LS.set('fj_cart', cart);
  const saveWish = () => LS.set('fj_wishlist', wishlist);
  const saveOrders = () => LS.set('fj_orders', orders);
  const saveUsers = () => LS.set('fj_users', users);
  const saveProducts = () => LS.set('fj_products', products);

  const currentUser = () => users.find(u => u.email === session) || null;
  const isAdmin = () => { const u = currentUser(); return Boolean(u && u.role === 'admin'); };
  const product = id => products.find(p => p.id === id);
  const cat = id => CATEGORIES.find(c => c.id === id);

  /* -------------------------------------------------------------------- i18n */
  function t(key, vars) {
    const table = window.FJ_STRINGS[lang] || window.FJ_STRINGS.en;
    let text = table[key] != null ? table[key] : (window.FJ_STRINGS.en[key] != null ? window.FJ_STRINGS.en[key] : key);
    if (vars) Object.keys(vars).forEach(k => { text = text.replace('{' + k + '}', vars[k]); });
    return text;
  }
  const catName = id => { const c = cat(id); return c ? (c[lang] || c.en) : id; };
  const prodName = p => (lang === 'bn' && p.bn ? p.bn : p.name);

  function applyI18n() {
    document.documentElement.lang = lang === 'bn' ? 'bn' : lang === 'hi' ? 'hi' : 'en';
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    const code = $('#langCode'); if (code) code.textContent = lang.toUpperCase();
    $$('#langMenu [data-lang]').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    const hello = $('#helloLine');
    if (hello) {
      const user = currentUser();
      hello.textContent = user ? user.name.split(' ')[0] : t('hello');
    }
  }

  /* ------------------------------------------------------------------ header */
  function renderCategoryBar() {
    const bar = $('#catBar'); if (!bar) return;
    bar.innerHTML = '<a class="all-btn" href="#/c/all"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' + esc(t('all')) + '</a>' +
      CATEGORIES.map(c => '<a href="#/c/' + c.id + '">' + esc(catName(c.id)) + '</a>').join('');
    const foot = $('#footCats');
    if (foot) foot.innerHTML = CATEGORIES.slice(0, 6).map(c => '<a href="#/c/' + c.id + '">' + esc(catName(c.id)) + '</a>').join('');
    const sel = $('#searchCat');
    if (sel) {
      const current = sel.value;
      sel.innerHTML = '<option value="">' + esc(t('all')) + '</option>' +
        CATEGORIES.map(c => '<option value="' + c.id + '">' + esc(catName(c.id)) + '</option>').join('');
      sel.value = current || '';
      if (sel._cselSync) sel._cselSync();
    }
  }

  function syncCategoryBar() {
    const { parts } = parseHash();
    let here = parts[0] === 'c' ? (parts[1] || 'all') : '';
    if (parts[0] === 'p') { const p = product(parts[1]); here = p ? p.cat : ''; }
    $$('#catBar a').forEach(el => {
      const id = (el.getAttribute('href') || '').replace('#/c/', '');
      const on = Boolean(here) && id === here;
      el.classList.toggle('active', on);
      if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
  }

  function updateChrome() {
    const count = cart.reduce((n, line) => n + line.qty, 0);
    const badge = $('#cartCount'); if (badge) badge.textContent = String(count);
    const badge2 = $('#cartCount2'); if (badge2) { badge2.textContent = String(count); badge2.hidden = count === 0; }
    const wishBadge = $('#wishCount'); if (wishBadge) { wishBadge.textContent = String(wishlist.length); wishBadge.hidden = wishlist.length === 0; }
    const user = currentUser();
    const top = $('#accountMenuTop');
    if (top) {
      top.innerHTML = user
        ? '<h4>' + esc(t('hello') + ', ' + user.name.split(' ')[0]) + '</h4>' +
          '<button type="button" data-act="signout">' + esc(t('signOut')) + '</button>' +
          (user.role === 'admin' ? '<a href="#/admin">' + esc(t('admin')) + '</a>' : '')
        : '<h4>' + esc(t('welcomeBack')) + '</h4>' +
          '<button type="button" data-act="open-auth" data-mode="in">' + esc(t('signIn')) + '</button>' +
          '<button type="button" data-act="open-auth" data-mode="up">' + esc(t('signUp')) + '</button>';
    }
    applyI18n();
  }

  /* --------------------------------------------------------------- components */
  function starRow(p, compact) {
    const full = Math.round(p.rating);
    const stars = '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
    return '<span class="stars"><span class="s" aria-hidden="true">' + stars + '</span>' +
      '<b>' + p.rating.toFixed(1) + '</b>' +
      '<span>(' + p.ratings.toLocaleString('en-IN') + ')</span>' + (compact ? '' : '') + '</span>';
  }

  function priceBlock(p, big) {
    const off = pct(p.price, p.mrp);
    return '<div class="price"><span><span class="cur">₹</span>' + p.price.toLocaleString('en-IN') + '</span>' +
      (p.mrp && p.mrp > p.price ? '<span class="mrp">' + money(p.mrp) + '</span><span class="off">' + off + '% off</span>' : '') +
      '</div>';
  }

  function art(p, cls) {
    if (p.img) return '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy">';
    const initials = p.name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    return '<div class="ph">' + initials + '<small>' + esc((cat(p.cat) || {}).en || '') + '</small></div>';
  }

  function productCard(p) {
    return '<article class="prod">' +
      '<div class="prod-media">' +
        '<a href="#/p/' + p.id + '" aria-label="' + esc(p.name) + '">' + art(p) + '</a>' +
        (p.badge ? '<span class="badge-tag">' + esc(p.badge) + '</span>' : '') +
        '<button class="wish-btn" type="button" data-act="wish" data-id="' + p.id + '" aria-label="Wishlist">' + (wishlist.includes(p.id) ? '♥' : '♡') + '</button>' +
      '</div>' +
      '<div class="prod-body">' +
        '<h3 class="prod-title"><a href="#/p/' + p.id + '">' + esc(prodName(p)) + '</a></h3>' +
        (lang !== 'bn' && p.bn ? '<span class="prod-bn" lang="bn">' + esc(p.bn) + '</span>' : '') +
        starRow(p) +
        priceBlock(p) +
        (p.stock > 0 ? '<button class="add" type="button" data-act="add" data-id="' + p.id + '">' + esc(t('addToCart')) + '</button>'
                     : '<button class="add" type="button" disabled>' + esc(t('outOfStock')) + '</button>') +
      '</div></article>';
  }

  function grid(items) {
    const sorted = sortProducts(items.slice());
    if (!sorted.length) return '<div class="card"><p>' + esc(t('noResults')) + '</p></div>';
    return '<div class="prod-grid">' + sorted.map(productCard).join('') + '</div>';
  }

  function sortProducts(items) {
    switch (filters.sort) {
      case 'price-asc': return items.sort((a, b) => a.price - b.price);
      case 'price-desc': return items.sort((a, b) => b.price - a.price);
      case 'rating': return items.sort((a, b) => b.rating - a.rating);
      case 'new': return items.sort((a, b) => (b.badge === 'New') - (a.badge === 'New') || a.id.localeCompare(b.id));
      default: return items.sort((a, b) => b.ratings - a.ratings);
    }
  }

  function matchesFilters(p) {
    if (filters.price === 'under1' && p.price >= 1000) return false;
    if (filters.price === '1to3' && (p.price < 1000 || p.price > 3000)) return false;
    if (filters.price === '3to6' && (p.price < 3000 || p.price > 6000)) return false;
    if (filters.price === '6plus' && p.price < 6000) return false;
    if (filters.metal.length && !filters.metal.includes(p.metal)) return false;
    if (filters.occasion.length && !filters.occasion.includes(p.occasion)) return false;
    if (filters.rating && p.rating < 4) return false;
    return true;
  }

  const METALS = ['Gold plated', '22k gold', 'Antique gold', 'Silver', 'Kundan', 'Cz & gold'];
  const OCCASIONS = ['Everyday', 'Festive', 'Bridal', 'Wedding', 'Gift', 'Men'];

  /* ------------------------------------------------------------------- views */
  function viewHome() {
    const deals = products.filter(p => pct(p.price, p.mrp) >= 25).slice(0, 8);
    const best = products.slice().sort((a, b) => b.rating - a.rating).slice(0, 8);
    const seen = new Set();
    const fresh = products.filter(p => p.badge === 'New' || p.badge === 'Premium').concat(products)
      .filter(p => (seen.has(p.id) ? false : seen.add(p.id))).slice(0, 8);

    return '<section class="hero">' +
        '<div><p class="eyebrow">HANDCRAFTED IN BAGHAJATIN, KOLKATA</p>' +
        '<h1>Gold and silver jewellery,<br><em>made in Bengal.</em></h1>' +
        '<p>Earrings, necklaces, bangles and bridal sets shaped by karigars whose families have done this for generations. Free India delivery over ₹999.</p>' +
        '<div class="hero-actions"><a class="btn btn-cart" href="#/c/all">' + esc(t('browseAll')) + '</a>' +
        '<a class="btn btn-line" href="#/c/bridal">' + esc(t('browseAll')) + ' · ' + esc(catName('bridal')) + '</a></div></div>' +
        '<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 120 120"><path d="M34 34h52l20 24-46 48-46-48 20-24Z"/><path d="M34 34l26 72 26-72M12 58h96M46 20h28l12 14H34l12-14Z"/><path d="M34 34l12 24M86 34L74 58"/></svg></div>' +
      '</section>' +

      '<section class="section card"><div class="card-head"><h2>' + esc(t('shopByCategory')) + '</h2>' +
        '<a href="#/browse">' + esc(t('seeAll')) + '</a></div>' +
        '<div class="tiles">' + CATEGORIES.map(c =>
          '<a class="tile" href="#/c/' + c.id + '"><span class="tile-art" aria-hidden="true">' + catArt(c) + '</span>' +
          '<span class="tile-body"><b>' + esc(catName(c.id)) + '</b></span></a>').join('') +
        '</div></section>' +

      '<section class="section card"><div class="card-head"><h2>' + esc(t('deals')) + '</h2><a href="#/c/all">' + esc(t('seeAll')) + '</a></div>' +
        '<div class="prod-grid">' + deals.map(productCard).join('') + '</div></section>' +

      '<section class="section card"><div class="card-head"><h2>' + esc(t('bestsellers')) + '</h2><a href="#/c/all">' + esc(t('seeAll')) + '</a></div>' +
        '<div class="prod-grid">' + best.map(productCard).join('') + '</div></section>' +

      '<section class="section card"><div class="card-head"><h2>' + esc(t('newArrivals')) + '</h2><a href="#/c/all">' + esc(t('seeAll')) + '</a></div>' +
        '<div class="prod-grid">' + fresh.map(productCard).join('') + '</div></section>';
  }

  function activeFilterCount() {
    return (filters.price !== 'all' ? 1 : 0) + filters.metal.length + filters.occasion.length + (filters.rating ? 1 : 0);
  }

  const PRICE_BANDS = () => [['all', t('allPrices')], ['under1', 'Under ₹1,000'], ['1to3', '₹1,000 – ₹3,000'], ['3to6', '₹3,000 – ₹6,000'], ['6plus', '₹6,000 & above']];

  function filterModal() {
    const chips = (name, list, current) => list.map(v => {
      const on = current.includes(v);
      return '<label class="fchip"><input type="checkbox" name="' + name + '" value="' + esc(v) + '"' +
        (on ? ' checked' : '') + '><span>' + esc(v) + '</span></label>';
    }).join('');

    openModal('<h2>' + esc(t('filters')) + '</h2>' +
      '<form data-form="filters" class="filters-panel">' +
        '<div class="fgroup"><h3>' + esc(t('priceRange')) + '</h3>' +
          PRICE_BANDS().map(o => '<label class="fchip"><input type="radio" name="price" value="' + o[0] + '"' +
            (filters.price === o[0] ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>').join('') +
        '</div>' +
        '<div class="fgroup"><h3>' + esc(t('metal')) + '</h3>' + chips('metal', METALS, filters.metal) + '</div>' +
        '<div class="fgroup"><h3>' + esc(t('occasion')) + '</h3>' + chips('occasion', OCCASIONS, filters.occasion) + '</div>' +
        '<label class="frow"><input type="checkbox" name="rating"' + (filters.rating ? ' checked' : '') + '> 4★ &amp; above</label>' +
        '<div class="modal-actions">' +
          '<button type="button" class="btn btn-line" data-act="clear-filters">' + esc(t('clearFilters')) + '</button>' +
          '<button type="submit" class="btn btn-cart">' + esc(t('showResults')) + '</button>' +
        '</div>' +
      '</form>', true);
  }

  function viewListing(catId, query) {
    let items = products.slice();
    let title = t('browseAll');

    if (query) {
      const q = query.toLowerCase();
      items = items.filter(p => (p.name + ' ' + (p.bn || '') + ' ' + catName(p.cat) + ' ' + p.metal + ' ' + p.occasion).toLowerCase().includes(q));
      title = '“' + query + '”';
    } else if (catId && catId !== 'all') {
      items = items.filter(p => p.cat === catId);
      title = catName(catId);
    }
    const filtered = items.filter(matchesFilters);
    const sortOpts = [['relevance', t('relevance')], ['price-asc', t('priceLow')], ['price-desc', t('priceHigh')], ['rating', t('avgRating')], ['new', t('newArrivals')]];
    const n = activeFilterCount();

    return '<section class="section">' +
      '<div class="results-head"><h1>' + esc(title) +
        ' <span class="res-count">· ' + t('results', { n: filtered.length }) + '</span></h1>' +
        '<div class="head-tools">' +
          '<select class="sort-select" data-change="sort" aria-label="' + esc(t('sortBy')) + '">' +
            sortOpts.map(o => '<option value="' + o[0] + '"' + (filters.sort === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') +
          '</select>' +
          '<button class="btn btn-line filter-btn" type="button" data-act="open-filters">' +
            esc(t('filters')) + (n ? '<span class="fcount">' + n + '</span>' : '') +
          '</button>' +
        '</div></div>' +
      '<div class="listing">' + grid(filtered) + '</div></section>';
  }

  function viewProduct(id) {
    const p = product(id);
    if (!p) return '<div class="card"><h2>Product not found</h2><p><a class="linkish" href="#/c/all">Back to all pieces</a></p></div>';
    const rel = products.filter(x => x.id !== p.id && (x.cat === p.cat || x.occasion === p.occasion)).slice(0, 6);
    const revs = reviews.filter(r => r.product === p.id);
    const deliveryDate = new Date(Date.now() + 3 * 864e5).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    return '<nav style="font-size:12px;color:#7a6552;padding:10px 0"><a href="#/">Home</a> › <a href="#/c/' + p.cat + '">' + esc(catName(p.cat)) + '</a> › ' + esc(p.name) + '</nav>' +
      '<div class="pd">' +
        '<div class="pd-gallery">' +
          '<div class="pd-thumbs">' + [0, 1, 2].map(i => '<button class="pd-thumb' + (i === 0 ? ' active' : '') + '" type="button">' + art(p) + '</button>').join('') + '</div>' +
          '<div class="pd-main">' + art(p) + '</div>' +
        '</div>' +
        '<div class="pd-info">' +
          '<h1>' + esc(prodName(p)) + '</h1>' +
          (lang !== 'bn' && p.bn ? '<div class="bn" lang="bn">' + esc(p.bn) + '</div>' : '') +
          '<div>' + starRow(p) + ' · <a class="linkish" href="#reviews">' + t('reviewsTitle') + '</a></div>' +
          '<div class="pd-price">' + priceBlock(p) + '<div style="font-size:12px;color:#7a6552">Inclusive of all taxes</div></div>' +
          '<ul class="pd-notes" style="padding-left:18px">' +
            '<li>' + esc(p.metal) + ' finish, hand-finished in our Kolkata workshop</li>' +
            '<li>' + esc(t('freeDelivery')) + ' over ₹' + settings.freeDeliveryOver + '</li>' +
            '<li>' + esc(t('deliveryBy')) + ' <b>' + deliveryDate + '</b></li>' +
            '<li>14-day returns on unworn pieces</li>' +
          '</ul>' +
          '<h2 style="font-size:16px;margin:16px 0 8px">' + esc(t('about')) + '</h2>' +
          '<p style="font-size:13.5px;color:#54402f">A ' + esc(p.occasion.toLowerCase()) + ' piece from our ' + esc(catName(p.cat).toLowerCase()) + ' range, ' +
            esc(p.metal.toLowerCase()) + ' on a base of brass and copper, finished by hand so no two pieces are identical. Store in the pouch provided, away from perfume and water.</p>' +
          '<h2 style="font-size:16px;margin:18px 0 8px">' + esc(t('specs')) + '</h2>' +
          '<table class="spec-table"><tr><th>' + esc(t('metal')) + '</th><td>' + esc(p.metal) + '</td></tr>' +
            '<tr><th>' + esc(t('occasion')) + '</th><td>' + esc(p.occasion) + '</td></tr>' +
            '<tr><th>' + esc(t('category')) + '</th><td>' + esc(catName(p.cat)) + '</td></tr>' +
            '<tr><th>' + esc(t('stock')) + '</th><td>' + (p.stock > 0 ? p.stock + ' in stock' : esc(t('outOfStock'))) + '</td></tr></table>' +
        '</div>' +
        '<aside class="buybox">' + priceBlock(p, true) +
          '<div class="stock' + (p.stock < 8 ? ' low' : '') + '">' + (p.stock > 0 ? (p.stock < 8 ? t('onlyLeft', { n: p.stock }) : t('inStock')) : t('outOfStock')) + '</div>' +
          '<div style="font-size:13px">' + esc(t('deliveryBy')) + ' <b>' + deliveryDate + '</b></div>' +
          '<select id="pdQty" aria-label="Quantity">' + Array.from({ length: 6 }, (_, i) => '<option value="' + (i + 1) + '">' + (i + 1) + '</option>').join('') + '</select>' +
          '<button class="btn btn-cart btn-block" data-act="add" data-id="' + p.id + '">' + esc(t('addToCart')) + '</button>' +
          '<div style="height:8px"></div>' +
          '<button class="btn btn-buy btn-block" data-act="buy" data-id="' + p.id + '">' + esc(t('buyNow')) + '</button>' +
          '<div style="height:10px"></div>' +
          '<button class="linkish" data-act="wish" data-id="' + p.id + '">' + (wishlist.includes(p.id) ? '♥ Saved' : '♡ Add to ' + esc(t('wishlist').toLowerCase())) + '</button>' +
          '<div class="hint" style="margin-top:10px">Secure mock payment · UPI, card or cash on delivery</div>' +
        '</aside>' +
      '</div>' +
      '<section class="section card" id="reviews"><h2>' + esc(t('reviewsTitle')) + '</h2>' +
        (revs.length ? revs.map(r => '<div class="review"><b>' + esc(r.user) + '</b> · <span class="stars"><span class="s">' + '★'.repeat(r.rating) + '</span></span><br><b>' + esc(r.title) + '</b><p>' + esc(r.body) + '</p></div>').join('')
                     : '<p style="color:#7a6552">' + esc(t('noResults')) + '</p>') +
      '</section>' +
      (rel.length ? '<section class="section card"><h2>' + esc(t('related')) + '</h2><div class="prod-grid">' + rel.map(productCard).join('') + '</div></section>' : '');
  }

  function cartTotals() {
    const subtotal = cart.reduce((sum, line) => { const p = product(line.id); return sum + (p ? p.price * line.qty : 0); }, 0);
    const delivery = subtotal === 0 || subtotal >= settings.freeDeliveryOver ? 0 : settings.deliveryFee;
    return { subtotal, delivery, total: subtotal + delivery };
  }

  function viewCart() {
    if (!cart.length) {
      return '<section class="section card" style="text-align:center;padding:40px"><h2>' + esc(t('emptyCart')) + '</h2>' +
        '<p><a class="btn btn-cart" href="#/c/all">' + esc(t('continue')) + '</a></p></section>';
    }
    const totals = cartTotals();
    const rows = cart.map(line => {
      const p = product(line.id); if (!p) return '';
      return '<div class="cart-row"><div class="thumb"><a href="#/p/' + p.id + '">' + art(p) + '</a></div>' +
        '<div><h3><a href="#/p/' + p.id + '">' + esc(prodName(p)) + '</a></h3>' +
        '<div class="muted">' + esc(p.metal) + ' · ' + esc(catName(p.cat)) + '</div>' +
        '<div style="margin:6px 0">' + (p.stock > 0 ? '<span style="color:#39684c;font-size:13px">' + esc(t('inStock')) + '</span>' : '<span style="color:#7a1225">' + esc(t('outOfStock')) + '</span>') + '</div>' +
        '<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">' +
          '<select class="qty-select" data-change="cart-qty" data-id="' + p.id + '" aria-label="Quantity">' +
            Array.from({ length: 10 }, (_, i) => '<option value="' + (i + 1) + '"' + (line.qty === i + 1 ? ' selected' : '') + '>' + (i + 1) + '</option>').join('') + '</select>' +
          '<button class="linkish" data-act="remove" data-id="' + p.id + '">' + esc(t('remove')) + '</button>' +
          '<button class="linkish" data-act="save-later" data-id="' + p.id + '">' + esc(t('saveForLater')) + '</button>' +
        '</div></div>' +
        '<div style="text-align:right;font-size:18px;font-weight:600">' + money(p.price * line.qty) + '</div></div>';
    }).join('');

    return '<section class="section"><h1 style="font-size:24px;margin:0 0 12px">' + esc(t('cartTitle')) + '</h1>' +
      '<div class="cart-grid"><div class="card">' + rows + '</div>' +
      '<aside class="summary"><div class="row"><span>' + esc(t('subtotal')) + ' (' + cart.reduce((n, l) => n + l.qty, 0) + ')</span><b>' + money(totals.subtotal) + '</b></div>' +
        '<div class="row"><span>' + esc(t('deliveryFee')) + '</span><b>' + (totals.delivery ? money(totals.delivery) : esc(t('free'))) + '</b></div>' +
        '<div class="row total"><span>' + esc(t('total')) + '</span><span>' + money(totals.total) + '</span></div>' +
        '<button class="btn btn-cart btn-block" style="margin-top:12px" data-act="checkout">' + esc(t('checkout')) + '</button>' +
        '<p class="hint" style="margin-top:10px">Free delivery over ₹' + settings.freeDeliveryOver + '. Taxes included.</p></aside></div></section>';
  }

  function orderCard(order, admin) {
    const pill = order.status === 'Cancelled' ? 'cancelled' : order.status === 'Shipped' ? 'shipped' : '';
    const thumbs = order.items.map(i => { const p = product(i.id); return p ? '<div style="width:64px;height:64px;border:1px solid #e9dcc7;border-radius:6px;overflow:hidden">' + art(p) + '</div>' : ''; }).join('');
    const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
    return '<article class="order-card"><div class="order-head">' +
      '<div><span>' + esc(t('orderId')) + '</span><b>' + esc(order.id) + '</b></div>' +
      '<div><span>' + esc(t('placedOn')) + '</span><b>' + new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + '</b></div>' +
      (admin ? '<div><span>Customer</span><b>' + esc(order.user) + '</b></div>' : '') +
      '<div><span>' + esc(t('total')) + '</span><b>' + money(total) + '</b></div>' +
      '<div><span>' + esc(t('statusLabel')) + '</span><b><span class="status-pill ' + pill + '">' + esc(order.status) + '</span></b></div>' +
      '</div><div class="order-body"><div style="display:flex;gap:8px;flex-wrap:wrap">' + thumbs + '</div>' +
      '<div style="margin-left:auto;display:flex;gap:10px;flex-wrap:wrap">' +
        '<button class="btn btn-line" data-act="track" data-id="' + order.id + '">' + esc(t('trackOrder')) + '</button>' +
        (order.status !== 'Cancelled' && order.status !== 'Delivered' ? '<button class="btn btn-line" data-act="cancel-order" data-id="' + order.id + '">' + esc(t('cancelOrder')) + '</button>' : '') +
      '</div></div></article>';
  }

  function viewOrders() {
    const user = currentUser();
    if (!user) return signInPrompt('orders');
    const mine = orders.filter(o => o.user === user.email).slice().reverse();
    if (!mine.length) return '<section class="section card" style="text-align:center;padding:40px"><h2>' + esc(t('noOrders')) + '</h2><p><a class="btn btn-cart" href="#/c/all">' + esc(t('continue')) + '</a></p></section>';
    return '<section class="section"><h1 style="font-size:24px;margin:0 0 12px">' + esc(t('ordersTitle')) + '</h1>' + mine.map(o => orderCard(o)).join('') + '</section>';
  }

  function viewOrder(id) {
    const user = currentUser();
    const order = orders.find(o => o.id === id);
    if (!order || !user || (order.user !== user.email && !isAdmin())) {
      return '<section class="section card"><h2>' + esc(t('noOrders')) + '</h2><p><a class="btn btn-cart" href="#/orders">' + esc(t('ordersTitle')) + '</a></p></section>';
    }
    const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
    return '<section class="section card" style="text-align:center"><div style="font-size:40px">✔</div>' +
      '<h1 style="font-size:24px;margin:6px 0">' + esc(t('orderPlaced')) + '</h1>' +
      '<p>' + esc(t('thanks')) + '</p>' +
      '<p style="font-size:15px"><b>' + esc(t('orderId')) + ' ' + esc(order.id) + '</b> · ' + money(total) + ' · ' + esc(order.payment.toUpperCase()) + '</p>' +
      '<p><a class="btn btn-cart" href="#/orders">' + esc(t('ordersTitle')) + '</a> <a class="btn btn-line" href="#/c/all">' + esc(t('continue')) + '</a></p></section>' +
      '<section class="section"><h2 style="font-size:18px">' + esc(t('deliveryAddress')) + '</h2>' +
      '<p style="font-size:14px">' + esc(order.address.name) + '<br>' + esc(order.address.line) + '<br>' + esc(order.address.city) + ', ' + esc(order.address.state) + ' ' + esc(order.address.pin) + '<br>' + esc(order.address.phone) + '</p></section>';
  }

  function addressBlock(a) {
    return '<div style="font-size:13.5px;line-height:1.6"><b>' + esc(a.name) + '</b><br>' + esc(a.line) + '<br>' + esc(a.city) + ', ' + esc(a.state) + ' ' + esc(a.pin) + '<br>Phone: ' + esc(a.phone) + '</div>';
  }

  function viewCheckout() {
    const user = currentUser();
    if (!user) return signInPrompt('checkout');
    if (!cart.length) return '<section class="section card"><h2>' + esc(t('emptyCart')) + '</h2></section>';

    const totals = cartTotals();
    const addresses = user.addresses || [];
    const selected = addresses[0];

    return '<section class="section"><h1 style="font-size:24px;margin:0 0 14px">' + esc(t('checkoutTitle')) + '</h1>' +
      '<form data-form="checkout"><div class="cart-grid"><div>' +
        '<div class="card" style="margin-bottom:14px"><h2 style="font-size:17px">1. ' + esc(t('deliveryAddress')) + '</h2>' +
          (addresses.length ? addresses.map((a, i) => '<label style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #e9dcc7"><input type="radio" name="address" value="' + i + '"' + (i === 0 ? ' checked' : '') + '>' + addressBlock(a) + '</label>').join('')
            : '<p class="hint">No saved address yet — add one below.</p>') +
          '<details style="margin-top:10px"' + (addresses.length ? '' : ' open') + '><summary style="cursor:pointer;color:#8a2436;font-size:13px">' + esc(t('addAddressBtn')) + '</summary>' +
          '<div class="form-grid" style="margin-top:10px">' +
            '<div class="field"><label>Name</label><input name="name" value="' + esc(user.name) + '"></div>' +
            '<div class="field"><label>' + esc(t('phone')) + '</label><input name="phone" value="' + esc(user.phone || '') + '"></div>' +
            '<div class="field full"><label>' + esc(t('address1')) + '</label><input name="line" placeholder="House, street, area"></div>' +
            '<div class="field"><label>' + esc(t('city')) + '</label><input name="city" value="Kolkata"></div>' +
            '<div class="field"><label>' + esc(t('state')) + '</label><input name="state" value="West Bengal"></div>' +
            '<div class="field"><label>' + esc(t('pin')) + '</label><input name="pin" value="700086"></div>' +
          '</div></details></div>' +
        '<div class="card"><h2 style="font-size:17px">2. ' + esc(t('paymentMethod')) + '</h2>' +
          '<label style="display:block;padding:8px 0"><input type="radio" name="payment" value="card" checked> ' + esc(t('card')) + '</label>' +
          '<div class="form-grid" style="margin:4px 0 12px 22px">' +
            '<div class="field full"><label>' + esc(t('cardNumber')) + '</label><input name="card" placeholder="4111 1111 1111 1111" value="4111 1111 1111 1111"></div>' +
            '<div class="field"><label>' + esc(t('expiry')) + '</label><input name="exp" placeholder="12/28" value="12/28"></div>' +
            '<div class="field"><label>' + esc(t('cvv')) + '</label><input name="cvv" placeholder="123" value="123"></div>' +
          '</div>' +
          '<label style="display:block;padding:8px 0"><input type="radio" name="payment" value="upi"> ' + esc(t('upi')) + '</label>' +
          '<div class="field" style="margin:4px 0 12px 22px"><label>' + esc(t('upiId')) + '</label><input name="upi" placeholder="name@upi"></div>' +
          '<label style="display:block;padding:8px 0"><input type="radio" name="payment" value="cod"> ' + esc(t('cod')) + '</label>' +
          '<div class="notice">' + esc(t('mockPayNote')) + '</div></div>' +
      '</div>' +
      '<aside class="summary"><h2 style="font-size:17px;margin:0 0 10px">' + esc(t('orderSummary')) + '</h2>' +
        '<div class="row"><span>' + esc(t('items')) + '</span><b>' + money(totals.subtotal) + '</b></div>' +
        '<div class="row"><span>' + esc(t('deliveryFee')) + '</span><b>' + (totals.delivery ? money(totals.delivery) : esc(t('free'))) + '</b></div>' +
        '<div class="row total"><span>' + esc(t('total')) + '</span><span>' + money(totals.total) + '</span></div>' +
        '<button class="btn btn-cart btn-block" style="margin-top:12px" type="submit">' + esc(t('placeOrder')) + '</button></aside>' +
      '</div></form></section>';
  }

  function signInPrompt(next) {
    return '<section class="section card" style="max-width:460px;margin:20px auto">' +
      '<h2>' + esc(t('signInFirst')) + '</h2><p><a class="btn btn-cart" data-act="open-auth" data-mode="in">' + esc(t('signIn')) + '</a> ' +
      '<a class="btn btn-line" data-act="open-auth" data-mode="up">' + esc(t('signUp')) + '</a></p>' +
      '<p class="hint">Demo account: ananya@example.com / ananya123 · Admin: admin@fashionjewellery.in / admin123</p></section>';
  }

  function viewAccount() {
    const user = currentUser();
    if (!user) {
      return '<section class="section card" style="max-width:420px;margin:20px auto">' +
        '<h2>' + esc(t('welcomeBack')) + '</h2>' +
        '<p><button class="btn btn-cart btn-block" data-act="open-auth" data-mode="in">' + esc(t('signIn')) + '</button></p>' +
        '<p style="text-align:center;font-size:13px">' + esc(t('newHere')) + ' <button class="linkish" data-act="open-auth" data-mode="up">' + esc(t('signUp')) + '</button></p></section>';
    }
    return '<section class="section"><h1 style="font-size:24px;margin:0 0 14px">' + esc(t('accountTitle')) + '</h1>' +
      '<div class="cart-grid"><div class="card"><h2 style="font-size:17px">' + esc(user.name) + '</h2>' +
        '<p style="font-size:13.5px;color:#7a6552">' + esc(user.email) + ' · ' + esc(user.phone || '') + '</p>' +
        '<h3 style="font-size:15px;margin:16px 0 8px">' + esc(t('savedAddress')) + '</h3>' +
        (user.addresses && user.addresses.length ? user.addresses.map(addressBlock).join('<hr style="border:0;border-top:1px solid #e9dcc7;margin:10px 0">') : '<p class="hint">No address saved yet.</p>') +
        '<p style="margin-top:16px"><button class="btn btn-line" data-act="add-address">' + esc(t('addAddressBtn')) + '</button> ' +
        '<button class="btn btn-line" data-act="signout">' + esc(t('signOut')) + '</button></p></div>' +
      '<aside class="summary"><h2 style="font-size:17px;margin:0 0 10px">' + esc(t('ordersTitle')) + '</h2>' +
        '<p style="font-size:14px">' + orders.filter(o => o.user === user.email).length + ' ' + esc(t('orders').toLowerCase()) + '</p>' +
        '<a class="btn btn-line btn-block" href="#/orders">' + esc(t('viewDetails')) + '</a>' +
        '<a class="btn btn-line btn-block" style="margin-top:8px" href="#/wishlist">' + esc(t('wishlist')) + '</a>' +
        (user.role === 'admin' ? '<a class="btn btn-dark btn-block" style="margin-top:8px" href="#/admin">' + esc(t('admin')) + '</a>' : '') +
      '</aside></div></section>';
  }

  function viewWishlist() {
    const items = wishlist.map(product).filter(Boolean);
    return '<section class="section"><h1 style="font-size:24px;margin:0 0 12px">' + esc(t('wishlistTitle')) + '</h1>' +
      (items.length ? '<div class="prod-grid">' + items.map(productCard).join('') + '</div>'
        : '<div class="card"><p>' + esc(t('emptyWishlist')) + '</p><a class="btn btn-cart" href="#/c/all">' + esc(t('continue')) + '</a></div>') + '</section>';
  }

  /* ---------------------------------------------------------- browse & profile */
  let lastListingKey = null;

  function applyListingQuery(query) {
    const key = query.toString();
    if (key === lastListingKey) return;
    lastListingKey = key;
    filters.price = query.get('price') || 'all';
    filters.sort = query.get('sort') || 'relevance';
    filters.metal = [];
    filters.occasion = query.get('occasion') ? [query.get('occasion')] : [];
    filters.rating = query.get('rating') === '1';
  }

  function viewBrowse() {
    const tiles = CATEGORIES.map(c => {
      return '<a class="browse-tile" href="#/c/' + c.id + '">' +
        '<span class="bt-ico" aria-hidden="true">' + catArt(c) + '</span>' +
        '<b>' + esc(catName(c.id)) + '</b></a>';
    }).join('');

    const rail = '<aside class="browse-rail"><h4>' + esc(t('allCats')) + '</h4>' +
      '<a class="active" href="#/browse">' + esc(t('allCats')) + '</a>' +
      CATEGORIES.map(c => '<a href="#/c/' + c.id + '">' + esc(catName(c.id)) + '</a>').join('') + '</aside>';

    return '<section class="browse">' + rail + '<div class="browse-main">' +
      '<h2>' + esc(t('topCats')) + '</h2><div class="browse-grid">' + tiles + '</div>' +
      '<h2>' + esc(t('explore')) + '</h2><div class="chip-row">' +
        '<a class="chip" href="#/c/all?price=under1">' + esc(t('under999')) + '</a>' +
        '<a class="chip" href="#/c/all?price=1to3">₹1,000 – ₹3,000</a>' +
        '<a class="chip" href="#/c/all?sort=rating">' + esc(t('bestsellers')) + '</a>' +
        '<a class="chip" href="#/c/all?occasion=Gift">' + esc(t('gifts')) + '</a>' +
        '<a class="chip" href="#/c/bridal">' + esc(catName('bridal')) + '</a>' +
        '<a class="chip" href="#/c/silver">' + esc(catName('silver')) + '</a>' +
      '</div></div></section>';
  }

  const CAT_HERO = {
    earrings: 'images/products/chand-bali.jpg',
    necklaces: 'images/products/sita-choker.jpg',
    bangles: 'images/products/kankan-gold.jpg',
    rings: 'images/products/solitaire-ring.jpg',
    mangalsutra: 'images/products/bengali-mangalsutra.jpg',
    'nose-pins': 'images/products/bengali-nath.jpg',
    anklets: 'images/products/ghungroo-payal.jpg',
    hair: 'images/products/alpona-tikka.jpg',
    bridal: 'images/products/bou-set.jpg',
    silver: 'images/products/silver-coin-10g.jpg',
    men: 'images/products/men-kada.jpg',
    kids: 'images/products/kids-studs.jpg'
  };

  function catArt(c) {
    let src = CAT_HERO[c.id];
    if (!src) { const p = products.find(x => x.cat === c.id && x.img); src = p ? p.img : ''; }
    return src
      ? '<img src="' + esc(src) + '" alt="" loading="lazy" style="width:100%;height:auto;display:block">'
      : esc(c.icon);
  }

  function miniCard(p) {
    return '<a class="mini" href="#/p/' + p.id + '"><span class="mini-art">' + art(p) + '</span>' +
      '<b>' + esc(prodName(p)) + '</b><span>' + money(p.price) + '</span></a>';
  }

  function viewProfile() {
    const user = currentUser();
    if (!user) {
      return '<section class="section"><div class="profile-head">' +
          '<span class="avatar">FJ</span>' +
          '<div><h1>' + esc(t('greet')) + '</h1><p>' + esc(t('profileGuest')) + '</p></div>' +
          '<button class="btn btn-buy" type="button" data-act="open-auth" data-mode="in">' + esc(t('signIn')) + '</button>' +
        '</div>' +
        '<div class="card" style="margin-top:16px;max-width:520px">' +
          '<p style="font-size:13.5px">' + esc(t('newHere')) + ' ' +
            '<button class="linkish" type="button" data-act="open-auth" data-mode="up">' + esc(t('signUp')) + '</button></p>' +
          '<p class="hint">Demo account: ananya@example.com / ananya123 · Admin: admin@fashionjewellery.in / admin123</p>' +
        '</div></section>';
    }

    const mine = orders.filter(o => o.user === user.email).slice().reverse();
    const initials = user.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const bought = [];
    mine.forEach(o => o.items.forEach(i => { if (!bought.includes(i.id)) bought.push(i.id); }));
    const again = bought.map(product).filter(Boolean).slice(0, 4);
    const suggestions = products.slice().sort((a, b) => b.rating - a.rating).slice(0, 4);

    const chips = [
      ['#/orders', t('ordersTitle'), mine.length + ' ' + t('orders').toLowerCase(), '<path d="M5 4h14v16l-7-4-7 4V4Z"/>'],
      ['#/wishlist', t('wishlist'), wishlist.length + ' ' + t('items').toLowerCase(), '<path d="M12 20s-7.2-4.5-7.2-9.3A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.2 2.7C19.2 15.5 12 20 12 20Z"/>'],
      ['#/account', t('savedAddress'), ((user.addresses || []).length) + ' ' + t('items').toLowerCase(), '<path d="M12 21c4.2-4.4 6.5-7.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 13.4 7.8 16.6 12 21Z"/><circle cx="12" cy="10.4" r="2.4"/>'],
      [isAdmin() ? '#/admin' : '#/browse', isAdmin() ? t('admin') : t('browseTitle'), isAdmin() ? t('adminDash') : t('allCats'), '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>']
    ].map(([href, label, meta, path]) => '<a class="profile-chip" href="' + href + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg>' +
        '<b>' + esc(label) + '</b><small>' + esc(meta) + '</small></a>').join('');

    return '<section class="section"><div class="profile-head">' +
        '<span class="avatar" aria-hidden="true">' + esc(initials) + '</span>' +
        '<div><h1>' + esc(t('greet')) + ', ' + esc(user.name.split(' ')[0]) + '</h1>' +
          '<p>' + esc(user.email) + (user.phone ? ' · ' + esc(user.phone) : '') + '</p></div>' +
        '<button class="btn btn-line" type="button" data-act="signout">' + esc(t('signOut')) + '</button>' +
      '</div>' +
      '<div class="profile-chips">' + chips + '</div>' +

      '<div class="card" style="margin-top:16px"><div class="card-head"><h2>' + esc(t('ordersTitle')) + '</h2>' +
        '<a href="#/orders">' + esc(t('seeAll')) + '</a></div>' +
        (mine.length ? mine.slice(0, 2).map(o => orderCard(o)).join('')
          : '<p class="empty-note">' + esc(t('noOrders')) + '</p>') +
      '</div>' +

      '<div class="card" style="margin-top:16px"><div class="card-head"><h2>' +
        esc(again.length ? t('buyAgain') : t('bestsellers')) + '</h2>' +
        '<a href="#/c/all">' + esc(t('seeAll')) + '</a></div>' +
        '<div class="mini-grid">' + (again.length ? again : suggestions).map(miniCard).join('') + '</div>' +
      '</div>' +

      '<div class="card" style="margin-top:16px"><div class="card-head"><h2>' + esc(t('yourDetails')) + '</h2>' +
        '<a href="#/account">' + esc(t('accountTitle')) + '</a></div>' +
        '<p style="font-size:13.5px;color:var(--ink-2);margin:0 0 12px">' + esc(user.name) + '<br>' + esc(user.email) +
          (user.phone ? '<br>' + esc(user.phone) : '') + '</p>' +
        ((user.addresses || []).length
          ? user.addresses.map(a => '<div class="addr"><b>' + esc(a.name) + '</b><br>' + esc(a.line) + '<br>' +
              esc(a.city) + ', ' + esc(a.state) + ' ' + esc(a.pin) + '<br>' + esc(a.phone) + '</div>').join('')
          : '<p class="empty-note">' + esc(t('savedAddress')) + ': —</p>') +
        '<button class="btn btn-line" type="button" data-act="add-address">' + esc(t('addAddressBtn')) + '</button>' +
      '</div></section>';
  }

  /* ------------------------------------------------------------------- admin */
  function viewAdmin() {
    if (!isAdmin()) {
      return '<section class="section card" style="max-width:420px;margin:20px auto"><h2>' + esc(t('adminLogin')) + '</h2>' +
        '<form data-form="admin-login"><div class="field"><label>' + esc(t('email')) + '</label><input name="email" type="email" value="admin@fashionjewellery.in"></div>' +
        '<div class="field" style="margin-top:8px"><label>' + esc(t('password')) + '</label><input name="password" type="password" value="admin123"></div>' +
        '<button class="btn btn-cart btn-block" style="margin-top:12px" type="submit">' + esc(t('signIn')) + '</button></form>' +
        '<p class="hint" style="margin-top:10px">' + esc(t('adminHint')) + '</p></section>';
    }

    const tabs = [['dashboard', t('adminDash')], ['products', t('adminProducts')], ['orders', t('adminOrders')], ['users', t('adminUsers')], ['settings', t('adminSettings')]];
    const side = '<aside class="admin-side">' + tabs.map(([id, label]) =>
      '<a href="#/admin?tab=' + id + '" class="' + (adminTab === id ? 'active' : '') + '">' + esc(label) + '</a>').join('') + '</aside>';

    let body = '';
    if (adminTab === 'dashboard') {
      const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.items.reduce((x, i) => x + i.price * i.qty, 0), 0);
      const avg = orders.length ? Math.round(revenue / orders.length) : 0;
      const days = Array.from({ length: 7 }, (_, i) => dayOffset(i - 6));
      const series = days.map(d => orders.filter(o => o.date === d && o.status !== 'Cancelled').reduce((s, o) => s + o.items.reduce((x, i) => x + i.price * i.qty, 0), 0));
      const max = Math.max.apply(null, series.concat([1]));
      body = '<div class="stats">' +
          '<div class="stat"><span>' + esc(t('revenue')) + '</span><b>' + money(revenue) + '</b></div>' +
          '<div class="stat"><span>' + esc(t('totalOrders')) + '</span><b>' + orders.length + '</b></div>' +
          '<div class="stat"><span>' + esc(t('totalUsers')) + '</span><b>' + users.filter(u => u.role !== 'admin').length + '</b></div>' +
          '<div class="stat"><span>' + esc(t('totalProducts')) + '</span><b>' + products.length + '</b></div>' +
        '</div>' +
        '<div class="chart-wrap" style="margin-top:14px"><h3 style="margin:0;font-size:15px">' + esc(t('last7')) + '</h3>' +
          '<div class="chart">' + series.map((v, i) => '<div class="bar" style="height:' + Math.max(4, Math.round(v / max * 100)) + '%"><span>' + days[i].slice(5) + '</span></div>').join('') + '</div></div>' +
        '<div class="stats" style="margin-top:14px"><div class="stat"><span>' + esc(t('avgOrder')) + '</span><b>' + money(avg) + '</b></div>' +
          '<div class="stat"><span>' + esc(t('lowStock')) + '</span><b>' + products.filter(p => p.stock < 10).length + '</b></div></div>';
    } else if (adminTab === 'products') {
      body = '<div class="card-head"><h2 style="margin:0;font-size:18px">' + esc(t('adminProducts')) + ' (' + products.length + ')</h2>' +
          '<button class="btn btn-cart" data-act="new-product">＋ ' + esc(t('addProduct')) + '</button></div>' +
        '<div class="table-wrap"><table class="grid"><thead><tr><th>' + esc(t('productName')) + '</th><th>' + esc(t('category')) + '</th><th>' + esc(t('priceCol')) + '</th><th>' + esc(t('stock')) + '</th><th></th></tr></thead><tbody>' +
        products.map(p => '<tr><td><b>' + esc(p.name) + '</b><div class="hint">' + esc(p.id) + '</div></td><td>' + esc(catName(p.cat)) + '</td><td>' + money(p.price) + '</td>' +
          '<td' + (p.stock < 10 ? ' style="color:#7a1225;font-weight:600"' : '') + '>' + p.stock + '</td>' +
          '<td style="white-space:nowrap"><button class="linkish" data-act="edit-product" data-id="' + p.id + '">' + esc(t('edit')) + '</button> · ' +
          '<button class="linkish" data-act="delete-product" data-id="' + p.id + '">' + esc(t('delete')) + '</button></td></tr>').join('') +
        '</tbody></table></div>';
    } else if (adminTab === 'orders') {
      body = '<h2 style="margin:0 0 12px;font-size:18px">' + esc(t('adminOrders')) + '</h2>' +
        '<div class="table-wrap"><table class="grid"><thead><tr><th>' + esc(t('orderId')) + '</th><th>Customer</th><th>' + esc(t('placedOn')) + '</th><th>' + esc(t('total')) + '</th><th>' + esc(t('statusLabel')) + '</th></tr></thead><tbody>' +
        orders.slice().reverse().map(o => { const total = o.items.reduce((s, i) => s + i.price * i.qty, 0);
          return '<tr><td><b>' + esc(o.id) + '</b></td><td>' + esc(o.user) + '</td><td>' + esc(o.date) + '</td><td>' + money(total) + '</td>' +
            '<td><select class="qty-select" data-change="order-status" data-id="' + o.id + '">' +
            ['Ordered', 'Shipped', 'Delivered', 'Cancelled'].map(s => '<option' + (o.status === s ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></td></tr>'; }).join('') +
        '</tbody></table></div>';
    } else if (adminTab === 'users') {
      body = '<h2 style="margin:0 0 12px;font-size:18px">' + esc(t('adminUsers')) + '</h2>' +
        '<div class="table-wrap"><table class="grid"><thead><tr><th>Name</th><th>' + esc(t('email')) + '</th><th>' + esc(t('phone')) + '</th><th>' + esc(t('totalOrders')) + '</th><th></th></tr></thead><tbody>' +
        users.map(u => '<tr><td><b>' + esc(u.name) + '</b>' + (u.role === 'admin' ? ' <span class="status-pill">admin</span>' : '') + '</td><td>' + esc(u.email) + '</td><td>' + esc(u.phone || '—') + '</td>' +
          '<td>' + orders.filter(o => o.user === u.email).length + '</td>' +
          '<td>' + (u.role === 'admin' ? '' : '<button class="linkish" data-act="delete-user" data-id="' + esc(u.email) + '">' + esc(t('delete')) + '</button>') + '</td></tr>').join('') +
        '</tbody></table></div>';
    } else {
      body = '<h2 style="margin:0 0 12px;font-size:18px">' + esc(t('adminSettings')) + '</h2>' +
        '<form class="card" data-form="settings" style="max-width:420px">' +
        '<div class="field"><label>Free delivery over (₹)</label><input name="freeDeliveryOver" type="number" value="' + settings.freeDeliveryOver + '"></div>' +
        '<div class="field" style="margin-top:8px"><label>Delivery fee (₹)</label><input name="deliveryFee" type="number" value="' + settings.deliveryFee + '"></div>' +
        '<button class="btn btn-cart" style="margin-top:12px" type="submit">' + esc(t('save')) + '</button></form>' +
        '<div class="card" style="max-width:420px;margin-top:14px"><h3 style="margin:0 0 6px;font-size:15px">Demo data</h3>' +
        '<p class="hint">Products, users and orders are stored in this browser. Resetting restores the sample catalogue.</p>' +
        '<button class="btn btn-line" data-act="reset-data">Reset demo data</button></div>';
    }

    return '<section class="section"><h1 style="font-size:24px;margin:0 0 14px">' + esc(t('admin')) + '</h1>' +
      '<div class="admin">' + side + '<div>' + body + '</div></div></section>';
  }

  /* ------------------------------------------------------------------ router */
  function parseHash() {
    const raw = (location.hash || '#/').replace(/^#\/?/, '');
    const [pathPart, queryPart] = raw.split('?');
    return { parts: pathPart.split('/').filter(Boolean), query: new URLSearchParams(queryPart || '') };
  }

  function syncTabs() {
    const top = (location.hash || '#/').replace(/^#\/?/, '').split('?')[0].split('/')[0];
    const map = {
      '': 'home', browse: 'browse', c: 'browse', s: 'browse', p: 'browse',
      wishlist: 'wishlist', cart: 'cart', checkout: 'cart',
      profile: 'profile', account: 'profile', orders: 'profile', order: 'profile', admin: 'profile'
    };
    const active = map[top] || '';
    $$('.tab').forEach(el => {
      const on = el.dataset.tab === active;
      el.classList.toggle('active', on);
      if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
  }

  function render() {
    const { parts, query } = parseHash();
    const view = $('#view');
    let html = '';

    if (!parts.length) html = viewHome();
    else if (parts[0] === 'c') { applyListingQuery(query); html = viewListing(parts[1] || 'all'); }
    else if (parts[0] === 's') html = viewListing(null, decodeURIComponent(parts.slice(1).join('/')));
    else if (parts[0] === 'p') html = viewProduct(parts[1]);
    else if (parts[0] === 'cart') html = viewCart();
    else if (parts[0] === 'checkout') html = viewCheckout();
    else if (parts[0] === 'orders') html = viewOrders();
    else if (parts[0] === 'order') html = viewOrder(parts[1]);
    else if (parts[0] === 'wishlist') html = viewWishlist();
    else if (parts[0] === 'browse') html = viewBrowse();
    else if (parts[0] === 'profile') html = viewProfile();
    else if (parts[0] === 'account') html = viewAccount();
    else if (parts[0] === 'admin') {
      const tab = query.get('tab');
      if (tab) adminTab = tab;
      html = viewAdmin();
    } else html = viewHome();

    view.innerHTML = html;
    updateChrome();
    syncTabs();
    syncCategoryBar();
    enhanceSelects(document);
    try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (e) {}
  }

  /* ------------------------------------------------------------------ modals */
  function openModal(html, wide) {
    const backdrop = $('#modal'), body = $('#modalBody');
    body.className = 'modal' + (wide ? ' wide' : '');
    body.innerHTML = '<button class="close" type="button" data-act="close-modal" aria-label="Close">×</button>' + html;
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    enhanceSelects(body);
    const first = body.querySelector('input,button:not(.close)');
    if (first) first.focus();
  }
  function closeModal() {
    const backdrop = $('#modal');
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    $('#modalBody').innerHTML = '';
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function authModal(mode) {
    const isUp = mode === 'up';
    openModal(
      '<h2>' + esc(isUp ? t('signUp') : t('signIn')) + '</h2>' +
      '<p class="hint">' + esc(t('welcomeBack')) + '</p>' +
      '<form data-form="' + (isUp ? 'signup' : 'signin') + '">' +
        (isUp ? '<div class="field"><label>' + esc(t('name')) + '</label><input name="name" required></div>' : '') +
        '<div class="field" style="margin-top:8px"><label>' + esc(t('email')) + '</label><input name="email" type="email" required value="' + (isUp ? '' : 'ananya@example.com') + '"></div>' +
        '<div class="field" style="margin-top:8px"><label>' + esc(t('password')) + '</label><input name="password" type="password" required value="' + (isUp ? '' : 'ananya123') + '"></div>' +
        (isUp ? '<div class="field" style="margin-top:8px"><label>' + esc(t('phone')) + '</label><input name="phone"></div>' : '') +
        '<button class="btn btn-cart btn-block" style="margin-top:12px" type="submit">' + esc(isUp ? t('signUpAction') : t('signInAction')) + '</button>' +
      '</form>' +
      '<div class="divider">or</div>' +
      '<div class="social">' +
        '<button type="button" data-act="social" data-provider="Google">G  Continue with Google</button>' +
        '<button type="button" data-act="social" data-provider="Facebook">f  Continue with Facebook</button>' +
        '<button type="button" data-act="social" data-provider="Apple">  Continue with Apple</button>' +
      '</div>' +
      '<p class="hint" style="margin-top:10px">' + esc(t('socialNote')) + '</p>' +
      '<p style="text-align:center;font-size:13px;margin-top:12px">' + esc(isUp ? t('haveAccount') : t('newHere')) + ' ' +
      '<button class="linkish" data-act="open-auth" data-mode="' + (isUp ? 'in' : 'up') + '">' + esc(isUp ? t('signIn') : t('signUp')) + '</button></p>'
    );
  }

  function addressModal() {
    const user = currentUser();
    openModal('<h2>' + esc(t('addAddressBtn')) + '</h2>' +
      '<form data-form="address"><div class="form-grid" style="margin-top:8px">' +
      '<div class="field"><label>' + esc(t('name')) + '</label><input name="name" required value="' + esc(user ? user.name : '') + '"></div>' +
      '<div class="field"><label>' + esc(t('phone')) + '</label><input name="phone" required value="' + esc(user ? (user.phone || '') : '') + '"></div>' +
      '<div class="field full"><label>' + esc(t('address1')) + '</label><input name="line" required></div>' +
      '<div class="field"><label>' + esc(t('city')) + '</label><input name="city" required value="Kolkata"></div>' +
      '<div class="field"><label>' + esc(t('state')) + '</label><input name="state" required value="West Bengal"></div>' +
      '<div class="field"><label>' + esc(t('pin')) + '</label><input name="pin" required value="700086"></div>' +
      '</div><button class="btn btn-cart btn-block" style="margin-top:12px" type="submit">' + esc(t('save')) + '</button></form>', true);
  }

  function productModal(id) {
    const p = id ? product(id) : { id: '', name: '', bn: '', cat: CATEGORIES[0].id, price: '', mrp: '', rating: 4.2, ratings: 0, metal: METALS[0], occasion: OCCASIONS[0], stock: 10, img: '', badge: '' };
    openModal('<h2>' + esc(id ? t('edit') : t('addProduct')) + '</h2>' +
      '<form data-form="product" data-id="' + esc(id || '') + '"><div class="form-grid" style="margin-top:8px">' +
      '<div class="field full"><label>' + esc(t('productName')) + '</label><input name="name" required value="' + esc(p.name) + '"></div>' +
      '<div class="field"><label>Bengali name</label><input name="bn" value="' + esc(p.bn || '') + '"></div>' +
      '<div class="field"><label>' + esc(t('category')) + '</label><select name="cat">' + CATEGORIES.map(c => '<option value="' + c.id + '"' + (p.cat === c.id ? ' selected' : '') + '>' + esc(c.en) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>' + esc(t('priceCol')) + '</label><input name="price" type="number" required value="' + esc(p.price) + '"></div>' +
      '<div class="field"><label>M.R.P.</label><input name="mrp" type="number" value="' + esc(p.mrp || '') + '"></div>' +
      '<div class="field"><label>' + esc(t('stock')) + '</label><input name="stock" type="number" value="' + esc(p.stock) + '"></div>' +
      '<div class="field"><label>' + esc(t('metal')) + '</label><input name="metal" value="' + esc(p.metal) + '"></div>' +
      '<div class="field"><label>' + esc(t('occasion')) + '</label><input name="occasion" value="' + esc(p.occasion) + '"></div>' +
      '<div class="field"><label>' + esc(t('badge')) + '</label><input name="badge" value="' + esc(p.badge || '') + '"></div>' +
      '<div class="field full"><label>' + esc(t('productImage')) + '</label><input name="img" placeholder="images/earrings.jpg" value="' + esc(p.img || '') + '"></div>' +
      '</div><button class="btn btn-cart btn-block" style="margin-top:12px" type="submit">' + esc(t('saveProduct')) + '</button></form>', true);
  }

  /* ------------------------------------------------------------------ actions */
  /* --------------------------------------------------------- custom selects */
  function enhanceSelect(sel) {
    if (!sel || sel.dataset.csel === '1') return;
    sel.dataset.csel = '1';
    const wrap = document.createElement('div');
    wrap.className = 'csel';
    wrap.innerHTML = '<button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false">' +
      '<span class="csel-label"></span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>' +
      '<div class="csel-menu" role="listbox"></div>';
    sel.parentNode.insertBefore(wrap, sel);
    const btn = wrap.querySelector('.csel-btn');
    const menu = wrap.querySelector('.csel-menu');
    const label = wrap.querySelector('.csel-label');
    wrap.insertBefore(sel, menu);

    const sync = () => {
      const opt = sel.options[sel.selectedIndex];
      label.textContent = opt ? opt.text : '';
      menu.innerHTML = Array.from(sel.options).map(o =>
        '<button type="button" role="option" aria-selected="' + (o.value === sel.value) + '"' +
        ' class="csel-opt' + (o.value === sel.value ? ' is-on' : '') + '" data-val="' + esc(o.value) + '">' +
        esc(o.text) + '</button>').join('');
    };
    sel._cselSync = sync;
    sel.addEventListener('change', sync);

    btn.addEventListener('click', ev => {
      ev.stopPropagation();
      const willOpen = !wrap.classList.contains('open');
      $$('.csel.open').forEach(w => {
        w.classList.remove('open');
        const b = w.querySelector('.csel-btn'); if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!willOpen) return;
      wrap.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      wrap.classList.remove('up');
      const r = btn.getBoundingClientRect();
      const menuH = Math.min(280, sel.options.length * 42 + 12);
      if (r.bottom + menuH + 16 > window.innerHeight && r.top > menuH + 16) wrap.classList.add('up');
    });

    menu.addEventListener('click', ev => {
      const opt = ev.target.closest('.csel-opt'); if (!opt) return;
      ev.stopPropagation();
      sel.value = opt.dataset.val;
      wrap.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
    });

    sync();
  }

  function enhanceSelects(root) {
    $$('select', root || document).forEach(enhanceSelect);
  }

  function closeDropdowns() {
    $$('.csel.open').forEach(w => {
      w.classList.remove('open');
      const b = w.querySelector('.csel-btn'); if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  /* --------------------------------------------------------- header menus */
  function placeMenu(menu, trigger) {
    const r = trigger.getBoundingClientRect();
    const margin = 12;
    const gap = 8;
    menu.style.width = 'auto';
    menu.style.maxWidth = (window.innerWidth - margin * 2) + 'px';
    menu.style.top = '0px';
    const w = menu.offsetWidth || 170;
    const h = menu.offsetHeight || 200;
    menu.style.left = Math.max(margin, Math.min(r.right - w, window.innerWidth - w - margin)) + 'px';
    let top = r.bottom + gap;
    if (top + h > window.innerHeight - margin) top = Math.max(margin, r.top - h - gap);
    menu.style.top = top + 'px';
  }

  /* ------------------------------------------------------- add-to-cart motion */
  const prefersReducedMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  function cartTargets() {
    return [$('.cart-link'), $('.tab[data-tab="cart"]')].filter(el => {
      if (!el || typeof el.getBoundingClientRect !== 'function') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  }

  function pulseCart() {
    cartTargets().forEach(el => {
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 700);
    });
  }

  function flyToCart(source) {
    if (prefersReducedMotion() || !source || typeof source.getBoundingClientRect !== 'function') { pulseCart(); return; }
    const target = cartTargets()[0];
    const from = source.getBoundingClientRect();
    if (!target || (!from.width && !from.height)) { pulseCart(); return; }
    const to = target.getBoundingClientRect();
    const chip = document.createElement('span');
    chip.className = 'fly-chip';
    chip.textContent = '+1';
    chip.setAttribute('aria-hidden', 'true');
    chip.style.left = (from.left + from.width / 2) + 'px';
    chip.style.top = (from.top + from.height / 2) + 'px';
    document.body.appendChild(chip);

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      if (typeof chip.remove === 'function') chip.remove();
      pulseCart();
    };

    if (typeof chip.animate !== 'function') { done(); return; }

    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    const animation = chip.animate([
      { transform: 'translate(-50%, -50%) scale(.6)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(1.05)', opacity: 1, offset: .18 },
      { transform: 'translate(calc(-50% + ' + (dx * .55) + 'px), calc(-50% + ' + (dy * .55 - 60) + 'px)) scale(.9)', opacity: 1, offset: .6 },
      { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.35)', opacity: 0 }
    ], { duration: 780, easing: 'cubic-bezier(.2,.72,.3,1)' });
    animation.onfinish = done;
    animation.oncancel = done;
    setTimeout(done, 1200);
  }

  function addToCart(id, qty) {
    const line = cart.find(l => l.id === id);
    if (line) line.qty = Math.min(10, line.qty + (qty || 1));
    else cart.push({ id, qty: qty || 1 });
    saveCart(); updateChrome();
    toast(t('addedToCart'));
  }

  function toggleWish(id) {
    const i = wishlist.indexOf(id);
    if (i > -1) wishlist.splice(i, 1); else wishlist.push(id);
    saveWish(); render();
    toast(i > -1 ? t('removed') : t('addedToCart'));
  }

  function signIn(email, password) {
    const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
    if (!user) { toast('Email or password is incorrect'); return false; }
    session = user.email; LS.set('fj_session', session); closeModal(); render();
    toast('Signed in as ' + user.name);
    return true;
  }

  function signUp(data) {
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) { toast('That email is already registered'); return false; }
    const user = { name: data.name, email: data.email, phone: data.phone || '', password: data.password, role: 'customer', addresses: [] };
    users.push(user); saveUsers();
    session = user.email; LS.set('fj_session', session); closeModal(); render();
    toast('Account created');
    return true;
  }

  function socialSignIn(provider) {
    const email = provider.toLowerCase() + '.user@example.com';
    let user = users.find(u => u.email === email);
    if (!user) {
      user = { name: provider + ' User', email, phone: '', password: uid('sso'), role: 'customer', addresses: [] };
      users.push(user); saveUsers();
    }
    session = user.email; LS.set('fj_session', session); closeModal(); render();
    toast('Signed in with ' + provider);
  }

  function placeOrder(form) {
    const user = currentUser();
    if (!user) { location.hash = '#/account'; return; }
    const data = new FormData(form);
    let address = (user.addresses || [])[0];
    const addressIndex = data.get('address');
    if (addressIndex != null && user.addresses[addressIndex]) address = user.addresses[addressIndex];
    else if (data.get('line')) {
      address = { name: data.get('name'), phone: data.get('phone'), line: data.get('line'), city: data.get('city'), state: data.get('state'), pin: data.get('pin') };
      user.addresses = user.addresses || [];
      user.addresses.push(address); saveUsers();
    }
    if (!address) { toast('Please add a delivery address'); return; }

    const totals = cartTotals();
    const order = {
      id: uid('FJ-'), user: user.email, date: today(), status: 'Ordered',
      payment: data.get('payment') || 'card', address,
      items: cart.map(line => { const p = product(line.id); return { id: line.id, qty: line.qty, price: p.price, name: p.name }; })
    };
    orders.push(order); saveOrders();
    cart = []; saveCart();
    location.hash = '#/order/' + order.id;
  }

  /* ------------------------------------------------------------------ events */
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-act]');
    const menuButton = event.target.closest('[data-act="toggle-menu"]');

    if (!trigger) {
      $$('.menu.open').forEach(m => m.classList.remove('open'));
      return;
    }
    const act = trigger.dataset.act;
    const id = trigger.dataset.id;

    if (act !== 'toggle-menu') $$('.menu.open').forEach(m => m.classList.remove('open'));

    switch (act) {
      case 'toggle-menu': {
        event.stopPropagation();
        const menu = document.getElementById(trigger.dataset.menu);
        const open = menu.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(open));
        $$('.menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
        if (open) placeMenu(menu, trigger);
        break;
      }
      case 'lang':
        lang = trigger.dataset.lang; LS.set('fj_lang', lang);
        $$('.menu.open').forEach(m => m.classList.remove('open'));
        renderCategoryBar(); render();
        toast(t('langLabel') + ': ' + ({ en: 'English', bn: 'বাংলা', hi: 'हिन्दी' })[lang]);
        break;
      case 'add': {
        const qtySel = $('#pdQty');
        addToCart(id, qtySel ? Number(qtySel.value) : 1);
        flyToCart(trigger);
        break;
      }
      case 'buy':
        addToCart(id, 1);
        location.hash = '#/checkout';
        break;
      case 'wish': toggleWish(id); break;
      case 'remove':
        cart = cart.filter(l => l.id !== id); saveCart(); updateChrome(); render(); toast(t('removed'));
        break;
      case 'save-later':
        cart = cart.filter(l => l.id !== id); saveCart();
        if (!wishlist.includes(id)) wishlist.push(id);
        saveWish(); updateChrome(); render(); toast(t('wishlistTitle'));
        break;
      case 'checkout': location.hash = '#/checkout'; break;
      case 'open-auth': authModal(trigger.dataset.mode || 'in'); break;
      case 'social': socialSignIn(trigger.dataset.provider); break;
      case 'signout':
        session = null; LS.del('fj_session'); render(); toast(t('signOut'));
        break;
      case 'close-modal': closeModal(); break;
      case 'add-address': addressModal(); break;
      case 'top': {
        const smooth = !prefersReducedMotion();
        try { window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' }); }
        catch (e) { window.scrollTo(0, 0); }
        break;
      }
      case 'open-filters': filterModal(); break;
      case 'clear-filters':
        filters.price = 'all'; filters.metal = []; filters.occasion = []; filters.rating = false;
        closeModal(); render();
        break;
      case 'track': {
        const order = orders.find(o => o.id === id);
        if (order) openModal('<h2>' + esc(t('trackOrder')) + ' · ' + esc(order.id) + '</h2>' +
          '<ol style="font-size:14px;line-height:1.9;padding-left:20px">' +
          ['Ordered', 'Shipped', 'Delivered'].map(s => '<li' + (s === order.status ? ' style="font-weight:700;color:#39684c"' : '') + '>' + esc(s) + '</li>').join('') +
          '</ol><p class="hint">Mock tracking for demo purposes.</p>');
        break;
      }
      case 'cancel-order': {
        const order = orders.find(o => o.id === id);
        if (order) { order.status = 'Cancelled'; saveOrders(); render(); toast('Order cancelled'); }
        break;
      }
      case 'delete-user': {
        users = users.filter(u => u.email !== id || u.role === 'admin');
        saveUsers(); render(); toast('User removed');
        break;
      }
      case 'new-product': productModal(null); break;
      case 'edit-product': productModal(id); break;
      case 'delete-product':
        if (confirm(t('confirmDelete'))) {
          products = products.filter(p => p.id !== id); saveProducts();
          cart = cart.filter(l => l.id !== id); saveCart();
          render(); toast(t('removed'));
        }
        break;
      case 'reset-data':
        if (confirm('Reset demo products, users and orders?')) {
          LS.del('fj_products'); LS.del('fj_users'); LS.del('fj_orders'); LS.del('fj_cart'); LS.del('fj_wishlist'); LS.del('fj_session');
          location.reload();
        }
        break;
      default: break;
    }
  });

  document.addEventListener('change', event => {
    const el = event.target.closest('[data-change]');
    if (!el) return;
    const kind = el.dataset.change;
    if (kind === 'price') { filters.price = el.value; render(); }
    else if (kind === 'sort') { filters.sort = el.value; render(); }
    else if (kind === 'metal') { filters.metal = $$('[data-change="metal"]:checked').map(x => x.value); render(); }
    else if (kind === 'occasion') { filters.occasion = $$('[data-change="occasion"]:checked').map(x => x.value); render(); }
    else if (kind === 'rating') { filters.rating = el.checked; render(); }
    else if (kind === 'cart-qty') {
      const line = cart.find(l => l.id === el.dataset.id);
      if (line) { line.qty = Number(el.value); saveCart(); updateChrome(); render(); }
    }
    else if (kind === 'order-status') {
      const order = orders.find(o => o.id === el.dataset.id);
      if (order) { order.status = el.value; saveOrders(); render(); toast('Status updated'); }
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form) return;
    event.preventDefault();
    const kind = form.dataset.form;
    const data = Object.fromEntries(new FormData(form).entries());

    if (kind === 'signin') signIn(data.email, data.password);
    else if (kind === 'signup') signUp(data);
    else if (kind === 'admin-login') signIn(data.email, data.password);
    else if (kind === 'address') {
      const user = currentUser(); if (!user) return;
      user.addresses = user.addresses || [];
      user.addresses.push({ name: data.name, phone: data.phone, line: data.line, city: data.city, state: data.state, pin: data.pin });
      saveUsers(); closeModal(); render(); toast(t('save'));
    }
    else if (kind === 'product') {
      const id = form.dataset.id;
      const payload = {
        name: data.name, bn: data.bn, cat: data.cat, price: Number(data.price) || 0, mrp: Number(data.mrp) || 0,
        stock: Number(data.stock) || 0, metal: data.metal || 'Gold plated', occasion: data.occasion || 'Everyday',
        badge: data.badge || '', img: data.img || null
      };
      if (id) Object.assign(product(id), payload);
      else products.push(Object.assign({ id: uid('fj-').toLowerCase(), rating: 4.2, ratings: 0 }, payload));
      saveProducts(); closeModal(); render(); toast(t('saveProduct'));
    }
    else if (kind === 'filters') {
      const fd = new FormData(form);
      filters.price = fd.get('price') || 'all';
      filters.metal = fd.getAll('metal').map(String);
      filters.occasion = fd.getAll('occasion').map(String);
      filters.rating = fd.get('rating') === 'on';
      closeModal(); render();
    }
    else if (kind === 'checkout') placeOrder(form);
    else if (kind === 'settings') {
      settings = { freeDeliveryOver: Number(data.freeDeliveryOver) || 999, deliveryFee: Number(data.deliveryFee) || 49 };
      LS.set('fj_settings', settings); render(); toast(t('save'));
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeModal(); $$('.menu.open').forEach(m => m.classList.remove('open')); closeDropdowns(); }
  });

  $('#modal').addEventListener('click', event => { if (event.target.id === 'modal') closeModal(); });

  $('#searchForm').addEventListener('submit', event => {
    event.preventDefault();
    const q = $('#searchInput').value.trim();
    const c = $('#searchCat').value;
    if (q) location.hash = '#/s/' + encodeURIComponent(q);
    else if (c) location.hash = '#/c/' + c;
    else location.hash = '#/c/all';
  });

  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.csel')) closeDropdowns();
    if (!event.target.closest('.menu-wrap')) $$('.menu.open').forEach(m => m.classList.remove('open'));
  }, true);

  window.addEventListener('scroll', () => {
    closeDropdowns();
    $$('.menu.open').forEach(m => m.classList.remove('open'));
  }, { passive: true });

  window.addEventListener('hashchange', render);

  /* -------------------------------------------------------------------- init */
  if (!['en', 'bn', 'hi'].includes(lang)) lang = 'en';
  renderCategoryBar();
  render();
})();
