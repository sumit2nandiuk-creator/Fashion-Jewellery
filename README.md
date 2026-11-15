# Fashion Jewellery — বাংলার গহনা

A responsive storefront concept for a Bengali gold and silver jewellery house in Baghajatin, Kolkata. Built as plain HTML, CSS and JavaScript, so it can be served from any static host (Cloudflare Pages, GitHub Pages, S3, Netlify).

## Pages

- `index.html` — the storefront: hero, collections, workshop story, shipping and sizing, contact and bag
- `collections.html` — the full shop page: filter tabs (all pieces, earrings, necklaces, bangles & rings), product grid and a styling CTA
- `cart.html` — a full bag page with line items, quantity steppers, totals and the WhatsApp order hand-off
- `product-jhumka.html`, `product-haar.html`, `product-bala.html` — item detail pages with a thumbnail gallery, full-screen image viewer and add-to-bag
- `shipping.html`, `returns.html`, `privacy.html`, `terms.html` — customer policy pages
- `style.css` — the maroon, gold and ivory design system, with layout rules for tablet and mobile
- `script.js` — mobile navigation, collection filters, the custom currency dropdown, the shopping bag (quantities merged per piece, saved in `localStorage`, +1 fly-to-cart animation and toast) and the WhatsApp order hand-off
- `product.js` — product gallery thumbnails and the full-screen image viewer (keyboard arrows, Escape, swipe)
- `images/` — hero, collection and workshop photography plus the favicon

## International customers

- A custom currency dropdown in the header switches display between INR, USD and GBP. On a first visit the currency is chosen automatically from the visitor's country (via Cloudflare's `/cdn-cgi/trace`, with a browser language/timezone fallback); an explicit choice is remembered and always wins. Prices are held in INR and converted with indicative rates in `CURRENCIES` (edit `script.js` to update them).
- The chosen currency is saved in the browser; the shopping bag and WhatsApp order always quote the INR price, with an approximate conversion in the message.
- Shipping timelines, duties and size conversions are covered on the page and in `shipping.html`.

## Ordering

Customers build a bag and send the order as a WhatsApp message to +91 86977 71768. Availability, delivery and payment are settled in chat; there is no online checkout or newsletter signup.

## Notes

- Photography is AI-generated for this concept and should be replaced with real product shots before launch.
- Prices are placeholder amounts in rupees, and the shipping, returns and privacy wording should be reviewed before launch.
- The contact email `hello@fashion-jewellery.example` is a placeholder — replace it with the real address.

## Documentation

- `docs/Fashion-Jewellery-Website-Estimate.pdf` — client-facing project estimate and scope sheet
- `docs/website-estimate.md` — the same estimate as editable Markdown
- `docs/logos/` — the chosen emblem logo (master, 1200 px lockup and seal-only mark)
- `docs/build-estimate-pdf.py` — regenerates the PDF (`python3 docs/build-estimate-pdf.py`, needs `fpdf2`)

## Store — Amazon-style shop (`shop.html`)

A separate, fully client-side storefront: catalogue, cart, checkout, accounts, orders and an admin panel. No server, no build step — everything is plain HTML, CSS and JavaScript with state in `localStorage`.

| File | What it does |
|---|---|
| `shop.html` | App shell: top bar, search, category strip, view container, footer, modal and toast hosts |
| `shop.css` | Store styles (Amazon-style layout, buttons, cards, tables, modals) |
| `data.js` | 12 jewellery categories and 40 sample products, plus sample reviews |
| `i18n.js` | Interface strings in English, Bengali and Hindi |
| `app.js` | Router, cart, wishlist, accounts, checkout, orders and the admin panel |

### Routes

`#/` home · `#/c/<category>` listing · `#/s/<query>` search · `#/p/<id>` product · `#/cart` · `#/checkout` · `#/order/<id>` confirmation · `#/orders` · `#/wishlist` · `#/account` · `#/admin`

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | `ananya@example.com` | `ananya123` |
| Admin | `admin@fashionjewellery.in` | `admin123` |

Social sign-in buttons (Google, Facebook, Apple) create a mock account locally — no request leaves the browser. Checkout is a demo: card, UPI and cash-on-delivery options record an order but never charge anything.

### Language

The globe button in the top bar switches the interface between English (default), Bengali and Hindi. The choice is remembered in `localStorage` under `fj_lang`.

### Admin panel

Dashboard (revenue, orders, customers, low stock, seven-day chart), product add/edit/delete, order status changes, customer list and delivery settings. Data lives in `fj_products`, `fj_users`, `fj_orders`, `fj_cart`, `fj_wishlist`, `fj_session`, `fj_settings`; "Reset demo data" in Settings restores the sample set.

### Images

Three products use the real studio photographs (`images/earrings.jpg`, `necklace.jpg`, `bangles.jpg`). The rest render an initialled placeholder tile until photography is ready — add an `img` path in the admin product form to switch one over.
