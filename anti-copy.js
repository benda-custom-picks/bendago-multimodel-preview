/* BENDAGO — global anti-copy friction + gallery fixes
   Scope:
   - Reduce casual image/video saving on homepage, hero, product cards and galleries.
   - Preserve forms, buttons, links and video controls.
   - Keep existing Gold/Black clutch gallery repair logic.
   Note: this is friction, not DRM.
*/
(function () {
  function norm(v) {
    return String(v || '').toLowerCase();
  }

  function pageText() {
    return norm([
      window.location.pathname,
      document.title,
      document.querySelector('h1') ? document.querySelector('h1').textContent : ''
    ].join(' '));
  }

  function isGoldClutchPage() {
    var h = pageText();
    return (
      h.includes('gold clutch') ||
      h.includes('gold flywheel') ||
      h.includes('gold clutch inner accent') ||
      h.includes('order-gold-clutch-flywheel')
    );
  }

  function isBlackClutchPage() {
    var h = pageText();
    return (
      h.includes('black striped clutch') ||
      h.includes('black ribbed clutch') ||
      h.includes('order-black-striped-clutch-cover')
    );
  }

  function mainImage() {
    return (
      document.querySelector('#mainProductImage') ||
      document.querySelector('.main-product-img') ||
      document.querySelector('.media-card > img') ||
      document.querySelector('.product-main img')
    );
  }

  function thumbs() {
    return Array.prototype.slice.call(
      document.querySelectorAll('.product-thumb, .thumb, .gallery button, .gallery a')
    ).filter(function (el) {
      return !!el.querySelector('img');
    });
  }

  function thumbSrc(thumb) {
    var img = thumb ? thumb.querySelector('img') : null;
    return (
      thumb.getAttribute('data-img') ||
      thumb.getAttribute('data-src') ||
      thumb.getAttribute('href') ||
      (img ? img.getAttribute('src') : '') ||
      ''
    );
  }

  function thumbInfo(thumb) {
    var img = thumb ? thumb.querySelector('img') : null;
    return norm([
      thumb ? thumb.getAttribute('data-img') : '',
      thumb ? thumb.getAttribute('data-src') : '',
      thumb ? thumb.getAttribute('href') : '',
      thumb ? thumb.getAttribute('aria-label') : '',
      img ? img.getAttribute('src') : '',
      img ? img.getAttribute('alt') : '',
      img ? img.getAttribute('title') : ''
    ].join(' '));
  }

  function activateThumb(thumb) {
    var src = thumbSrc(thumb);
    var img = thumb.querySelector('img');
    var main = mainImage();
    if (!src || !main) return;

    main.setAttribute('src', src);
    if (img && img.getAttribute('alt')) {
      main.setAttribute('alt', img.getAttribute('alt'));
    }

    thumbs().forEach(function (t) {
      if (t.classList) t.classList.remove('active');
    });
    if (thumb.classList) thumb.classList.add('active');

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'product_gallery_click',
      product_page: isGoldClutchPage() ? 'gold_clutch_inner_accent' : 'product',
      image_src: src
    });
  }

  function bindGalleryZoom() {
    var gallery = document.querySelector('.gallery');
    if (!gallery || gallery.getAttribute('data-bendago-zoom-bound') === '1') return;

    gallery.setAttribute('data-bendago-zoom-bound', '1');
    gallery.addEventListener('click', function (event) {
      var thumb = event.target.closest('.product-thumb, .thumb, button, a');
      if (!thumb || !gallery.contains(thumb)) return;
      if (!thumb.querySelector('img')) return;

      event.preventDefault();
      activateThumb(thumb);
    });
  }

  function addGoldDiscThumbIfMissing() {
    if (!isGoldClutchPage()) return;

    var gallery = document.querySelector('.gallery');
    if (!gallery) return;

    var existing = norm(gallery.innerHTML);
    if (existing.includes('gold-clutch-inner-accent-gallery-05.webp')) return;

    var sample = thumbs()[0];
    var thumb;

    if (sample) {
      thumb = sample.cloneNode(true);
      if (thumb.classList) thumb.classList.remove('active');
      thumb.setAttribute('data-img', './gold-clutch-inner-accent-gallery-05.webp');
      thumb.setAttribute('aria-label', 'Gold Clutch Inner Accent studio product photo');
      if (thumb.tagName.toLowerCase() === 'a') {
        thumb.setAttribute('href', './gold-clutch-inner-accent-gallery-05.webp');
      }
      var img = thumb.querySelector('img');
      if (img) {
        img.setAttribute('src', './gold-clutch-inner-accent-gallery-05.webp');
        img.setAttribute('alt', 'Gold Clutch Inner Accent studio product photo');
        img.setAttribute('loading', 'lazy');
      }
    } else {
      thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'product-thumb';
      thumb.setAttribute('data-img', './gold-clutch-inner-accent-gallery-05.webp');
      thumb.setAttribute('aria-label', 'Gold Clutch Inner Accent studio product photo');
      var im = document.createElement('img');
      im.setAttribute('src', './gold-clutch-inner-accent-gallery-05.webp');
      im.setAttribute('alt', 'Gold Clutch Inner Accent studio product photo');
      im.setAttribute('loading', 'lazy');
      thumb.appendChild(im);
    }

    gallery.appendChild(thumb);
  }

  function removeYellowDiscFromBlackClutch() {
    if (!isBlackClutchPage()) return;

    var done = false;
    thumbs().forEach(function (thumb) {
      if (done) return;
      var info = thumbInfo(thumb);
      var wrong = (
        info.includes('gold-clutch') ||
        info.includes('gold clutch') ||
        info.includes('gold-flywheel') ||
        info.includes('gold flywheel') ||
        info.includes('gold-inner') ||
        info.includes('gold inner') ||
        info.includes('inner accent')
      );
      if (!wrong) return;

      var src = thumbSrc(thumb);
      var main = mainImage();
      thumb.remove();
      done = true;

      if (main && src && norm(main.getAttribute('src')) === norm(src)) {
        var first = thumbs()[0];
        if (first) activateThumb(first);
      }
    });
  }

  var MEDIA_SELECTOR = [
    'img',
    'video',
    'picture',
    '.hero',
    '.hero-card',
    '.hero-photo',
    '.hero-visual',
    '.build-showcase-video',
    '.build-card',
    '.featured-media',
    '.featured-thumb',
    '.media-card',
    '.media-stage',
    '.preview-placeholder',
    '.main-product-img',
    '.main-product-video',
    '.product-thumb',
    '.product-thumb img',
    '.gallery',
    '.video-preview',
    '.video-shell'
  ].join(',');

  function isMediaTarget(target) {
    return !!(target && target.closest && target.closest(MEDIA_SELECTOR));
  }

  function isFormTarget(target) {
    return !!(target && target.closest && target.closest('input, textarea, select, option, button, a, [contenteditable="true"]'));
  }

  function antiCopyFriction() {
    document.querySelectorAll(MEDIA_SELECTOR).forEach(function (el) {
      el.setAttribute('draggable', 'false');
      el.setAttribute('ondragstart', 'return false');
      el.style.webkitUserDrag = 'none';
      el.style.userDrag = 'none';
      el.style.webkitTouchCallout = 'none';
      el.style.webkitUserSelect = 'none';
      el.style.userSelect = 'none';
    });
  }

  function bindAntiCopyEvents() {
    if (document.documentElement.getAttribute('data-bendago-anti-copy-bound') === '1') return;
    document.documentElement.setAttribute('data-bendago-anti-copy-bound', '1');

    document.addEventListener('contextmenu', function (event) {
      if (isMediaTarget(event.target)) {
        event.preventDefault();
        return false;
      }
    }, true);

    document.addEventListener('dragstart', function (event) {
      if (isMediaTarget(event.target)) {
        event.preventDefault();
        return false;
      }
    }, true);

    document.addEventListener('selectstart', function (event) {
      if (!isFormTarget(event.target) && isMediaTarget(event.target)) {
        event.preventDefault();
        return false;
      }
    }, true);

    document.addEventListener('keydown', function (event) {
      var key = norm(event.key);
      if ((event.ctrlKey || event.metaKey) && ['s', 'u'].includes(key)) {
        event.preventDefault();
        return false;
      }
    }, true);
  }

  function run() {
    antiCopyFriction();
    bindAntiCopyEvents();
    addGoldDiscThumbIfMissing();
    bindGalleryZoom();
    removeYellowDiscFromBlackClutch();
    setTimeout(function () {
      antiCopyFriction();
      addGoldDiscThumbIfMissing();
      bindGalleryZoom();
      removeYellowDiscFromBlackClutch();
    }, 300);
    setTimeout(function () {
      antiCopyFriction();
      addGoldDiscThumbIfMissing();
      bindGalleryZoom();
      removeYellowDiscFromBlackClutch();
    }, 900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
