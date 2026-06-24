/* BENDAGO V163 — adaptive product-gallery anti-copy friction
   Scope:
   - Product gallery images only: reduce casual save / drag / long-press and Lens-ready screenshots.
   - Preserve main-image zoom/lightbox, thumbnails, MP4/video controls, cart, Build Access and checkout.
   - This is friction, not DRM: any image visible in a browser can still be captured.
*/
(function () {
  'use strict';

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
    return h.includes('gold clutch') || h.includes('gold flywheel') || h.includes('gold clutch inner accent') || h.includes('order-gold-clutch-flywheel');
  }

  function isBlackClutchPage() {
    var h = pageText();
    return h.includes('black striped clutch') || h.includes('black ribbed clutch') || h.includes('order-black-striped-clutch-cover');
  }

  function mainImage() {
    return document.querySelector('#mainProductImage') || document.querySelector('.main-product-img') || document.querySelector('.media-card > img') || document.querySelector('.product-main img');
  }

  function thumbs() {
    return Array.prototype.slice.call(document.querySelectorAll('.product-thumb, .thumb, .gallery button, .gallery a')).filter(function (el) {
      return !!el.querySelector('img');
    });
  }

  function thumbSrc(thumb) {
    var img = thumb ? thumb.querySelector('img') : null;
    return thumb.getAttribute('data-img') || thumb.getAttribute('data-src') || thumb.getAttribute('href') || (img ? img.getAttribute('src') : '') || '';
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
    if (img && img.getAttribute('alt')) main.setAttribute('alt', img.getAttribute('alt'));

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
      if (!thumb || !gallery.contains(thumb) || !thumb.querySelector('img')) return;
      event.preventDefault();
      activateThumb(thumb);
    });
  }

  function addGoldDiscThumbIfMissing() {
    if (!isGoldClutchPage()) return;
    var gallery = document.querySelector('.gallery');
    if (!gallery || norm(gallery.innerHTML).includes('gold-clutch-inner-accent-gallery-05.webp')) return;

    var sample = thumbs()[0];
    var thumb;
    if (sample) {
      thumb = sample.cloneNode(true);
      if (thumb.classList) thumb.classList.remove('active');
      thumb.setAttribute('data-img', './gold-clutch-inner-accent-gallery-05.webp');
      thumb.setAttribute('aria-label', 'Gold Clutch Inner Accent studio product photo');
      if (thumb.tagName.toLowerCase() === 'a') thumb.setAttribute('href', './gold-clutch-inner-accent-gallery-05.webp');
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
      var wrong = info.includes('gold-clutch') || info.includes('gold clutch') || info.includes('gold-flywheel') || info.includes('gold flywheel') || info.includes('gold-inner') || info.includes('gold inner') || info.includes('inner accent');
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

  var PRODUCT_IMAGE_SELECTOR = [
    '#mainProductImage',
    '.media-card .product-thumb img',
    '.media-card .thumb-row img',
    '.gallery .product-thumb img',
    '.gallery .thumb img'
  ].join(',');

  function isVideoContext(node) {
    return !!(node && node.closest && node.closest('video, .video-shell, .video-preview, .main-product-video, [data-type="video"]'));
  }

  function productImageTarget(node) {
    if (!node || !node.closest) return null;
    var img = node.closest('img');
    if (!img || !img.matches(PRODUCT_IMAGE_SELECTOR) || isVideoContext(img)) return null;
    return img;
  }

  function injectV163Styles() {
    if (document.getElementById('bcp-anti-copy-v163-style')) return;
    var style = document.createElement('style');
    style.id = 'bcp-anti-copy-v163-style';
    style.textContent = [
      '.bcp-anti-copy-host{position:relative!important;}',
      '.bcp-anti-copy-static{-webkit-user-drag:none!important;user-drag:none!important;-webkit-touch-callout:none!important;-webkit-user-select:none!important;user-select:none!important;}',
      '.bcp-anti-copy-product-mark{position:absolute!important;z-index:8!important;display:block!important;overflow:hidden!important;pointer-events:none!important;border-radius:inherit!important;isolation:isolate!important;}',
      '.bcp-anti-copy-product-mark:after{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,.07),transparent 45%,rgba(0,0,0,.05));}',
      '.bcp-anti-copy-product-mark span{position:absolute;left:50%;width:190%;display:block;white-space:nowrap;text-align:center;transform:translateX(-50%) rotate(-22deg);font:800 clamp(10px,1.8vw,22px)/1.1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.16em;color:rgba(231,198,118,.36);text-shadow:0 1px 3px rgba(0,0,0,.85),0 0 10px rgba(0,0,0,.55);}',
      '.bcp-anti-copy-product-mark span:nth-child(1){top:18%;}',
      '.bcp-anti-copy-product-mark span:nth-child(2){top:48%;}',
      '.bcp-anti-copy-product-mark span:nth-child(3){top:78%;}',
      '.bcp-anti-copy-lightbox-mark{position:absolute!important;inset:0!important;z-index:3!important;overflow:hidden!important;pointer-events:none!important;}',
      '.bcp-anti-copy-lightbox-mark span{position:absolute;left:50%;width:190%;display:block;white-space:nowrap;text-align:center;transform:translateX(-50%) rotate(-22deg);font:800 clamp(13px,2.2vw,30px)/1.1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.17em;color:rgba(231,198,118,.42);text-shadow:0 2px 6px rgba(0,0,0,.9),0 0 12px rgba(0,0,0,.62);}',
      '.bcp-anti-copy-lightbox-mark span:nth-child(1){top:24%;}',
      '.bcp-anti-copy-lightbox-mark span:nth-child(2){top:50%;}',
      '.bcp-anti-copy-lightbox-mark span:nth-child(3){top:76%;}',
      '.bcp-gallery-lightbox-close{z-index:20002!important;}',
      '.bcp-gallery-lightbox-caption{z-index:4!important;}'
    ].join('');
    document.head.appendChild(style);
  }

  function watermarkText() {
    return 'BENDA CUSTOM PICKS · PRIVATE CATALOG';
  }

  function markContent(mark) {
    for (var i = 0; i < 3; i += 1) {
      var line = document.createElement('span');
      line.textContent = watermarkText();
      mark.appendChild(line);
    }
  }

  function syncMainMark(mark, image) {
    if (!mark || !image) return;
    mark.style.left = image.offsetLeft + 'px';
    mark.style.top = image.offsetTop + 'px';
    mark.style.width = image.offsetWidth + 'px';
    mark.style.height = image.offsetHeight + 'px';
  }

  function ensureMainWatermark() {
    var image = mainImage();
    if (!image || image.getAttribute('data-bcp-main-watermarked') === '1') return;
    var host = image.closest('.media-card') || image.parentElement;
    if (!host) return;

    host.classList.add('bcp-anti-copy-host');
    image.classList.add('bcp-anti-copy-static');
    image.setAttribute('draggable', 'false');
    image.setAttribute('ondragstart', 'return false');

    var mark = document.createElement('div');
    mark.className = 'bcp-anti-copy-product-mark';
    mark.setAttribute('aria-hidden', 'true');
    markContent(mark);
    host.appendChild(mark);
    image.setAttribute('data-bcp-main-watermarked', '1');

    function sync() { syncMainMark(mark, image); }
    image.addEventListener('load', sync);
    window.addEventListener('resize', sync, { passive: true });
    if (window.ResizeObserver) {
      var observer = new ResizeObserver(sync);
      observer.observe(image);
      observer.observe(host);
    }
    sync();
  }

  function ensureLightboxWatermark() {
    var inner = document.querySelector('.bcp-gallery-lightbox-inner');
    if (!inner || inner.getAttribute('data-bcp-lightbox-watermarked') === '1') return;
    var mark = document.createElement('div');
    mark.className = 'bcp-anti-copy-lightbox-mark';
    mark.setAttribute('aria-hidden', 'true');
    markContent(mark);
    inner.appendChild(mark);
    inner.setAttribute('data-bcp-lightbox-watermarked', '1');
  }

  function protectProductGalleryImages() {
    document.querySelectorAll(PRODUCT_IMAGE_SELECTOR).forEach(function (image) {
      if (isVideoContext(image)) return;
      image.classList.add('bcp-anti-copy-static');
      image.setAttribute('draggable', 'false');
      image.setAttribute('ondragstart', 'return false');
    });
    ensureMainWatermark();
    ensureLightboxWatermark();
  }

  function watchDynamicGallery() {
    if (!window.MutationObserver || !document.body || document.body.getAttribute('data-bcp-anti-copy-v163-watch') === '1') return;
    document.body.setAttribute('data-bcp-anti-copy-v163-watch', '1');

    var scheduled = false;
    function refresh() {
      scheduled = false;
      ensureLightboxWatermark();
      protectProductGalleryImages();
    }

    var observer = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i += 1) {
        var nodes = records[i].addedNodes || [];
        for (var j = 0; j < nodes.length; j += 1) {
          var node = nodes[j];
          if (!node || node.nodeType !== 1) continue;
          if ((node.matches && (node.matches('.bcp-gallery-lightbox, .bcp-gallery-lightbox-inner, #mainProductImage') || node.querySelector('.bcp-gallery-lightbox-inner, #mainProductImage'))) && !scheduled) {
            scheduled = true;
            window.setTimeout(refresh, 0);
            return;
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function bindAntiCopyEvents() {
    if (document.documentElement.getAttribute('data-bendago-anti-copy-v163-bound') === '1') return;
    document.documentElement.setAttribute('data-bendago-anti-copy-v163-bound', '1');

    document.addEventListener('contextmenu', function (event) {
      if (productImageTarget(event.target)) event.preventDefault();
    }, true);

    document.addEventListener('dragstart', function (event) {
      if (productImageTarget(event.target)) event.preventDefault();
    }, true);

    document.addEventListener('selectstart', function (event) {
      if (productImageTarget(event.target)) event.preventDefault();
    }, true);

    document.addEventListener('keydown', function (event) {
      var key = norm(event.key);
      if ((event.ctrlKey || event.metaKey) && (key === 's' || key === 'u')) event.preventDefault();
    }, true);
  }

  function run() {
    injectV163Styles();
    bindAntiCopyEvents();
    addGoldDiscThumbIfMissing();
    bindGalleryZoom();
    removeYellowDiscFromBlackClutch();
    protectProductGalleryImages();
    watchDynamicGallery();

    setTimeout(function () {
      addGoldDiscThumbIfMissing();
      bindGalleryZoom();
      removeYellowDiscFromBlackClutch();
      protectProductGalleryImages();
    }, 300);

    setTimeout(function () {
      addGoldDiscThumbIfMissing();
      bindGalleryZoom();
      removeYellowDiscFromBlackClutch();
      protectProductGalleryImages();
    }, 900);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
