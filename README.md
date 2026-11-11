# Fashion Jewellery — বাংলার গহনা

A responsive storefront concept for a Bengali gold and silver jewellery house in Baghajatin, Kolkata. Built as plain HTML, CSS and JavaScript, so it can be served from any static host (Cloudflare Pages, GitHub Pages, S3, Netlify).

## Pages

- `index.html` — the storefront: hero, collections, workshop story, shipping and sizing, contact and shopping bag
- `shipping.html`, `returns.html`, `privacy.html`, `terms.html` — customer policy pages
- `style.css` — the maroon, gold and ivory design system, with layout rules for tablet and mobile
- `script.js` — mobile navigation, collection filters, the shopping bag (saved in `localStorage`) and WhatsApp order hand-off
- `images/` — hero, collection and workshop photography plus the favicon

## International customers

- A currency picker in the header switches display between INR, USD and GBP. Prices are held in INR and converted with indicative rates in `CURRENCIES` (edit `script.js` to update them).
- The chosen currency is saved in the browser; the shopping bag and WhatsApp order always quote the INR price, with an approximate conversion in the message.
- Shipping timelines, duties and size conversions are covered on the page and in `shipping.html`.

## Ordering

Customers build a bag and send the order as a WhatsApp message to +91 86977 71768. Availability, delivery and payment are settled in chat; there is no online checkout or newsletter signup.

## Notes

- Photography is AI-generated for this concept and should be replaced with real product shots before launch.
- Prices are placeholder amounts in rupees, and the shipping, returns and privacy wording should be reviewed before launch.
- The contact email `hello@fashion-jewellery.example` is a placeholder — replace it with the real address.
