/* Fashion Jewellery — catalogue data for the store */
window.FJ_CATEGORIES = [
  { id: 'earrings',  en: 'Earrings',          bn: 'কানের দুল',      hi: 'कान की बालियाँ', icon: '◈' },
  { id: 'necklaces', en: 'Necklaces',         bn: 'হার ও নেকলেস',   hi: 'हार और नेकलेस', icon: '◉' },
  { id: 'bangles',   en: 'Bangles',           bn: 'চুড়ি ও বালা',    hi: 'चूड़ियाँ',       icon: '◎' },
  { id: 'rings',     en: 'Rings',             bn: 'আংটি',           hi: 'अंगूठी',         icon: '○' },
  { id: 'mangalsutra', en: 'Mangalsutra',     bn: 'মঙ্গলসূত্র',       hi: 'मंगलसूत्र',      icon: '✦' },
  { id: 'nose-pins', en: 'Nose pins',         bn: 'নথ',             hi: 'नथ',             icon: '◇' },
  { id: 'anklets',   en: 'Anklets',           bn: 'নূপুর',          hi: 'पायल',           icon: '❋' },
  { id: 'hair',      en: 'Hair accessories',  bn: 'চুলের গহনা',     hi: 'बालों के गहने',  icon: '✧' },
  { id: 'bridal',    en: 'Bridal sets',       bn: 'বিয়ের সেট',      hi: 'ब्राइडल सेट',    icon: '✺' },
  { id: 'silver',    en: 'Silver & coins',    bn: 'রুপো ও মুদ্রা',   hi: 'चाँदी और सिक्के', icon: '◍' },
  { id: 'men',       en: "Men's jewellery",   bn: 'পুরুষদের গহনা',  hi: 'पुरुषों के गहने', icon: '▣' },
  { id: 'kids',      en: 'Kids',              bn: 'শিশুদের গহনা',   hi: 'बच्चों के गहने',  icon: '✿' }
];

window.FJ_PRODUCTS = [
  /* ---- earrings ---- */
  { id: 'rajbari-jhumka', name: 'The Rajbari Jhumka', bn: 'রাজবাড়ির ঝুমকা', cat: 'earrings', price: 2450, mrp: 3200, rating: 4.6, ratings: 812, metal: 'Gold plated', occasion: 'Bridal', stock: 24, img: 'images/earrings.jpg', badge: 'Bestseller' },
  { id: 'chand-bali', name: 'Chandbali Crescent Earrings', bn: 'চাঁদবালি', cat: 'earrings', price: 1890, mrp: 2400, rating: 4.4, ratings: 431, metal: 'Gold plated', occasion: 'Festive', stock: 31, img: 'images/products/chand-bali.jpg' },
  { id: 'pearl-studs', name: 'Kolkata Pearl Studs', bn: 'মুক্তো দুল', cat: 'earrings', price: 890, mrp: 1200, rating: 4.2, ratings: 268, metal: 'Silver', occasion: 'Everyday', stock: 60, img: 'images/products/pearl-studs.jpg' },
  { id: 'kundan-drop', name: 'Kundan Drop Earrings', bn: 'কুন্দন ঝুমকা', cat: 'earrings', price: 3450, mrp: 4200, rating: 4.7, ratings: 190, metal: 'Kundan', occasion: 'Wedding', stock: 12, img: 'images/products/kundan-drop.jpg' },

  /* ---- necklaces ---- */
  { id: 'debi-haar', name: 'The Debi Haar', bn: 'দেবী হার', cat: 'necklaces', price: 6900, mrp: 8500, rating: 4.8, ratings: 540, metal: 'Antique gold', occasion: 'Temple', stock: 9, img: 'images/necklace.jpg', badge: 'Classic' },
  { id: 'sita-choker', name: 'Sita Choker', bn: 'সীতা চোকার', cat: 'necklaces', price: 4290, mrp: 5400, rating: 4.5, ratings: 322, metal: 'Gold plated', occasion: 'Wedding', stock: 15, img: 'images/products/sita-choker.jpg' },
  { id: 'alpona-chain', name: 'Alpona Chain', bn: 'আলপনা চেন', cat: 'necklaces', price: 1590, mrp: 2100, rating: 4.1, ratings: 148, metal: 'Gold plated', occasion: 'Everyday', stock: 40, img: 'images/products/alpona-chain.jpg' },
  { id: 'raja-rani-set', name: 'Raja Rani Necklace', bn: 'রাজা রানী হার', cat: 'necklaces', price: 9800, mrp: 12500, rating: 4.9, ratings: 96, metal: '22k gold', occasion: 'Bridal', stock: 4, img: 'images/products/raja-rani-set.jpg' },

  /* ---- bangles ---- */
  { id: 'bangla-bala', name: 'The Bangla Bala Set', bn: 'বাংলা বালা', cat: 'bangles', price: 3200, mrp: 4000, rating: 4.6, ratings: 389, metal: 'Gold plated', occasion: 'Everyday', stock: 22, img: 'images/bangles.jpg', badge: 'New' },
  { id: 'shankha-pola', name: 'Shankha Pola Pair', bn: 'শাঁখা পলা', cat: 'bangles', price: 2150, mrp: 2600, rating: 4.4, ratings: 512, metal: 'Conch & coral', occasion: 'Bridal', stock: 35, img: 'images/products/shankha-pola.jpg' },
  { id: 'kankan-gold', name: 'Kankan Gold Bangle', bn: 'কঙ্কণ', cat: 'bangles', price: 5400, mrp: 6600, rating: 4.3, ratings: 174, metal: '22k gold', occasion: 'Festive', stock: 11, img: 'images/products/kankan-gold.jpg' },
  { id: 'meenakari-churi', name: 'Meenakari Churi Stack', bn: 'মিনাকারি চুড়ি', cat: 'bangles', price: 1290, mrp: 1800, rating: 4.0, ratings: 205, metal: 'Meenakari', occasion: 'Festive', stock: 48, img: 'images/products/meenakari-churi.jpg' },

  /* ---- rings ---- */
  { id: 'muse-ring', name: 'The Muse Ring', bn: 'মিউজ আংটি', cat: 'rings', price: 1450, mrp: 1900, rating: 4.5, ratings: 233, metal: 'Gold plated', occasion: 'Everyday', stock: 30, img: 'images/products/muse-ring.jpg' },
  { id: 'kundan-ring', name: 'Kundan Statement Ring', bn: 'কুন্দন আংটি', cat: 'rings', price: 1990, mrp: 2500, rating: 4.2, ratings: 118, metal: 'Kundan', occasion: 'Party', stock: 26, img: 'images/products/kundan-ring.jpg' },
  { id: 'silver-toe-ring', name: 'Silver Toe Ring Pair', bn: 'রুপোর আংটি', cat: 'rings', price: 690, mrp: 950, rating: 4.1, ratings: 342, metal: 'Silver', occasion: 'Bridal', stock: 70, img: 'images/products/silver-toe-ring.jpg' },
  { id: 'solitaire-ring', name: 'Zircon Solitaire Ring', bn: 'সলিটেয়ার আংটি', cat: 'rings', price: 2890, mrp: 3500, rating: 4.7, ratings: 89, metal: 'Rhodium', occasion: 'Gift', stock: 18, img: 'images/products/solitaire-ring.jpg' },

  /* ---- mangalsutra ---- */
  { id: 'bengali-mangalsutra', name: 'Bengali Mangalsutra', bn: 'মঙ্গলসূত্র', cat: 'mangalsutra', price: 3650, mrp: 4500, rating: 4.5, ratings: 276, metal: 'Gold plated', occasion: 'Bridal', stock: 20, img: 'images/products/bengali-mangalsutra.jpg' },
  { id: 'diamond-mangalsutra', name: 'Diamond Look Mangalsutra', bn: 'ডায়মন্ড মঙ্গলসূত্র', cat: 'mangalsutra', price: 4890, mrp: 6200, rating: 4.6, ratings: 143, metal: 'Cz & gold', occasion: 'Daily', stock: 14, img: 'images/products/diamond-mangalsutra.jpg' },
  { id: 'black-bead-chain', name: 'Black Bead Chain', bn: 'কালো পুঁতির চেন', cat: 'mangalsutra', price: 1190, mrp: 1600, rating: 4.0, ratings: 311, metal: 'Gold plated', occasion: 'Daily', stock: 55, img: 'images/products/black-bead-chain.jpg' },

  /* ---- nose pins ---- */
  { id: 'bengali-nath', name: 'Bridal Bengali Nath', bn: 'বিয়ের নথ', cat: 'nose-pins', price: 2790, mrp: 3400, rating: 4.7, ratings: 167, metal: 'Gold plated', occasion: 'Bridal', stock: 16, img: 'images/products/bengali-nath.jpg' },
  { id: 'pearl-nose-pin', name: 'Pearl Nose Pin', bn: 'মুক্তো নথ', cat: 'nose-pins', price: 490, mrp: 700, rating: 4.2, ratings: 402, metal: 'Silver', occasion: 'Everyday', stock: 90, img: 'images/products/pearl-nose-pin.jpg' },
  { id: 'kundan-nose-ring', name: 'Kundan Nose Ring', bn: 'কুন্দন নথ', cat: 'nose-pins', price: 1590, mrp: 2000, rating: 4.3, ratings: 121, metal: 'Kundan', occasion: 'Festive', stock: 28, img: 'images/products/kundan-nose-ring.jpg' },

  /* ---- anklets ---- */
  { id: 'ghungroo-payal', name: 'Ghungroo Payal', bn: 'ঘুঙুর পায়েল', cat: 'anklets', price: 990, mrp: 1400, rating: 4.4, ratings: 588, metal: 'Silver', occasion: 'Everyday', stock: 64, img: 'images/products/ghungroo-payal.jpg' },
  { id: 'silver-chain-anklet', name: 'Silver Chain Anklet', bn: 'রুপোর নূপুর', cat: 'anklets', price: 1350, mrp: 1800, rating: 4.2, ratings: 213, metal: 'Silver', occasion: 'Daily', stock: 39, img: null },
  { id: 'bridal-payal', name: 'Bridal Payal with Bells', bn: 'বিয়ের পায়েল', cat: 'anklets', price: 2190, mrp: 2800, rating: 4.6, ratings: 97, metal: 'Silver', occasion: 'Bridal', stock: 19, img: null },

  /* ---- hair ---- */
  { id: 'alpona-tikka', name: 'Alpona Maang Tikka', bn: 'আলপনা টিকলি', cat: 'hair', price: 1690, mrp: 2200, rating: 4.4, ratings: 156, metal: 'Gold plated', occasion: 'Bridal', stock: 23, img: null },
  { id: 'jhumka-hair-chain', name: 'Jhumka Hair Chain', bn: 'চুলের ঝুমকো', cat: 'hair', price: 2490, mrp: 3100, rating: 4.6, ratings: 88, metal: 'Gold plated', occasion: 'Wedding', stock: 12, img: null },
  { id: 'juda-pin-set', name: 'Juda Pin Set', bn: 'জুড়ার পিন', cat: 'hair', price: 890, mrp: 1200, rating: 4.1, ratings: 301, metal: 'Gold plated', occasion: 'Everyday', stock: 45, img: null },

  /* ---- bridal ---- */
  { id: 'bou-set', name: 'Bou Bridal Set', bn: 'বউ সেট', cat: 'bridal', price: 14500, mrp: 18500, rating: 4.9, ratings: 64, metal: '22k gold', occasion: 'Bridal', stock: 3, img: null, badge: 'Premium' },
  { id: 'holud-set', name: 'Holud Ceremony Set', bn: 'হলুদ সেট', cat: 'bridal', price: 8200, mrp: 10500, rating: 4.7, ratings: 41, metal: 'Gold plated', occasion: 'Bridal', stock: 6, img: null },
  { id: 'reception-set', name: 'Reception Diamond Set', bn: 'রিসেপশন সেট', cat: 'bridal', price: 17900, mrp: 22000, rating: 4.8, ratings: 28, metal: 'Cz & gold', occasion: 'Wedding', stock: 2, img: null },

  /* ---- silver ---- */
  { id: 'silver-coin-10g', name: 'Silver Coin 10 g', bn: 'রুপোর মুদ্রা', cat: 'silver', price: 1150, mrp: 1290, rating: 4.3, ratings: 187, metal: '999 silver', occasion: 'Investment', stock: 120, img: null },
  { id: 'silver-pooja-set', name: 'Silver Pooja Set', bn: 'রুপোর পুজো সেট', cat: 'silver', price: 3490, mrp: 4200, rating: 4.5, ratings: 76, metal: 'Silver', occasion: 'Gift', stock: 17, img: null },
  { id: 'silver-bracelet', name: 'Silver Kada Bracelet', bn: 'রুপোর বালা', cat: 'silver', price: 2690, mrp: 3200, rating: 4.2, ratings: 142, metal: 'Silver', occasion: 'Men', stock: 25, img: null },

  /* ---- men ---- */
  { id: 'men-kada', name: "Men's Gold Kada", bn: 'পুরুষদের কড়া', cat: 'men', price: 4590, mrp: 5600, rating: 4.4, ratings: 133, metal: 'Gold plated', occasion: 'Men', stock: 14, img: null },
  { id: 'men-chain', name: "Men's Link Chain", bn: 'পুরুষদের চেন', cat: 'men', price: 3290, mrp: 4000, rating: 4.1, ratings: 205, metal: 'Stainless steel', occasion: 'Men', stock: 33, img: null },
  { id: 'men-ring', name: "Men's Signet Ring", bn: 'পুরুষদের আংটি', cat: 'men', price: 1890, mrp: 2400, rating: 4.0, ratings: 88, metal: 'Silver', occasion: 'Men', stock: 27, img: null },

  /* ---- kids ---- */
  { id: 'kids-bangle', name: 'Kids Gold Bangle', bn: 'শিশুদের বালা', cat: 'kids', price: 1690, mrp: 2100, rating: 4.5, ratings: 92, metal: 'Gold plated', occasion: 'Gift', stock: 36, img: null },
  { id: 'kids-anklet', name: 'Kids Silver Anklet', bn: 'শিশুদের নূপুর', cat: 'kids', price: 790, mrp: 1050, rating: 4.3, ratings: 158, metal: 'Silver', occasion: 'Gift', stock: 52, img: null },
  { id: 'kids-studs', name: 'Kids Flower Studs', bn: 'শিশুদের দুল', cat: 'kids', price: 590, mrp: 850, rating: 4.2, ratings: 121, metal: 'Silver', occasion: 'Everyday', stock: 61, img: null }
];

window.FJ_REVIEWS = [
  { product: 'rajbari-jhumka', user: 'Ananya S.', rating: 5, title: 'Exactly like my mother\u2019s pair', body: 'Beautiful weight and finish. Wore it for my sister\u2019s wedding and got so many compliments.' },
  { product: 'rajbari-jhumka', user: 'Ritika M.', rating: 4, title: 'Lovely, a little heavy', body: 'The jhumka is stunning but my ears ache after four hours. Worth it for the photos.' },
  { product: 'debi-haar', user: 'Sohini D.', rating: 5, title: 'Temple work is superb', body: 'The carving is crisp and the gold tone matches my mother\u2019s real set.' },
  { product: 'bangla-bala', user: 'Priya G.', rating: 5, title: 'Perfect size', body: 'I ordered 2.6 inches and they fit beautifully with my shankha.' }
];
