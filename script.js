const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', open); menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); });
nav.addEventListener('click', event => { if (event.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open menu'); } });
document.querySelectorAll('.filters button').forEach(button => button.addEventListener('click', () => { document.querySelector('.filters .active').classList.remove('active'); button.classList.add('active'); document.querySelectorAll('.product').forEach(product => { product.hidden = button.dataset.filter !== 'all' && product.dataset.category !== button.dataset.filter; }); }));

const drawer = document.querySelector('.drawer');
const backdrop = document.querySelector('.drawer-backdrop');
const orderButton = document.querySelector('.whatsapp-order');
let bag = [];
try { const saved = JSON.parse(localStorage.getItem('fashion-jewellery-bag') || '[]'); if (Array.isArray(saved)) bag = saved.filter(item => typeof item.name === 'string' && Number.isFinite(item.price)); } catch (_) {}
function toggleBag(open) {
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  backdrop.hidden = !open;
  if (open) document.querySelector('.close-drawer').focus();
}
function renderBag() {
  document.querySelectorAll('.bag-count').forEach(el => el.textContent = bag.length);
  const items = document.querySelector('.bag-items');
  items.replaceChildren();
  if (!bag.length) { const p = document.createElement('p'); p.textContent = 'Your bag is waiting for a little sparkle.'; items.append(p); }
  bag.forEach((item, index) => {
    const row = document.createElement('div'); row.className = 'bag-row';
    const name = document.createElement('span'); name.textContent = `${item.name} — ₹${item.price}`;
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove';
    remove.addEventListener('click', () => { bag.splice(index, 1); renderBag(); });
    row.append(name, remove); items.append(row);
  });
  document.querySelector('.subtotal').textContent = '₹' + bag.reduce((sum, item) => sum + item.price, 0);
  orderButton.disabled = !bag.length;
  try { localStorage.setItem('fashion-jewellery-bag', JSON.stringify(bag)); } catch (_) {}
}
document.querySelectorAll('.add').forEach(button => button.addEventListener('click', () => { bag.push({name: button.dataset.name, price: Number(button.dataset.price)}); renderBag(); toggleBag(true); }));
document.querySelector('.bag-button').addEventListener('click', () => toggleBag(true));
document.querySelector('.close-drawer').addEventListener('click', () => toggleBag(false));
backdrop.addEventListener('click', () => toggleBag(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) toggleBag(false); });
orderButton.addEventListener('click', () => {
  if (!bag.length) return;
  const lines = bag.map(item => `- ${item.name} (₹${item.price})`);
  const total = bag.reduce((sum, item) => sum + item.price, 0);
  const message = `Hello Fashion Jewellery! I'd like to order:\n${lines.join('\n')}\nSubtotal: ₹${total}\nPlease confirm availability, delivery and final price.`;
  window.open(`https://wa.me/918420386752?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
renderBag();
