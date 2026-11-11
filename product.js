/* Fashion Jewellery — product gallery and full-screen image viewer */
(function () {
  'use strict';

  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  const mainImage = gallery.querySelector('.gallery-image');
  const openButton = gallery.querySelector('.gallery-open');
  const thumbs = Array.from(gallery.querySelectorAll('.thumb'));
  const images = thumbs.map(thumb => ({
    src: thumb.dataset.full,
    alt: (mainImage && mainImage.alt) || ''
  }));
  let index = 0;

  function showImage(next) {
    index = (next + images.length) % images.length;
    if (mainImage) mainImage.src = images[index].src;
    thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === index));
  }

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => showImage(Number(thumb.dataset.index) || 0));
  });

  /* ------------------------------------------------------------ lightbox */
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Product image viewer');
  overlay.hidden = true;
  overlay.innerHTML = [
    '<button class="lightbox-close" type="button" aria-label="Close image viewer">&times;</button>',
    '<button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">&#8249;</button>',
    '<figure class="lightbox-figure"><img class="lightbox-image" alt=""><figcaption class="lightbox-count"></figcaption></figure>',
    '<button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">&#8250;</button>'
  ].join('');
  document.body.append(overlay);

  const lightboxImage = overlay.querySelector('.lightbox-image');
  const counter = overlay.querySelector('.lightbox-count');
  const closeButton = overlay.querySelector('.lightbox-close');
  const prevButton = overlay.querySelector('.lightbox-prev');
  const nextButton = overlay.querySelector('.lightbox-next');
  let lastFocused = null;

  function paint() {
    lightboxImage.src = images[index].src;
    lightboxImage.alt = images[index].alt;
    counter.textContent = (index + 1) + ' / ' + images.length;
  }
  function open() {
    lastFocused = document.activeElement;
    paint();
    overlay.hidden = false;
    document.body.classList.add('lightbox-open');
    closeButton.focus();
  }
  function close() {
    overlay.hidden = true;
    document.body.classList.remove('lightbox-open');
    if (lastFocused) lastFocused.focus();
  }
  function step(direction) { index = (index + direction + images.length) % images.length; paint(); showImage(index); }

  if (openButton) openButton.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  prevButton.addEventListener('click', () => step(-1));
  nextButton.addEventListener('click', () => step(1));
  overlay.addEventListener('click', event => {
    if (event.target === overlay || event.target.classList.contains('lightbox-figure')) close();
  });
  document.addEventListener('keydown', event => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    else if (event.key === 'Tab') {
      const focusable = [closeButton, prevButton, nextButton];
      const current = focusable.indexOf(document.activeElement);
      event.preventDefault();
      const next = event.shiftKey ? (current <= 0 ? focusable.length - 1 : current - 1) : (current + 1) % focusable.length;
      focusable[next].focus();
    }
  });

  /* swipe between images */
  let startX = null;
  overlay.addEventListener('touchstart', event => { startX = event.touches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend', event => {
    if (startX === null) return;
    const delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 40) step(delta < 0 ? 1 : -1);
    startX = null;
  }, { passive: true });
})();
