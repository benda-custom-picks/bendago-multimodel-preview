/* BENDAGO ORDER + CART CHECKOUT FLOW */
const BENDAGO_PRODUCTS = {
  "tandem-kit-v4": {
    product_code: "tandem-kit-v4",
    product_name: 'Tandem Kit',
    product_short: 'Foldable rider and passenger backrest kit for Benda Dark Flag V4 950',
    fitment: 'Benda Dark Flag V4 950',
    price: '861 €',
    delivery_estimate: '10 to 15 business days',
    image: './tandem-kit-v4-hero.png',
    stripe_url: ''
  },
  "midnight-hunter-tank-cover-kit-v4": {
    product_code: "midnight-hunter-tank-cover-kit-v4",
    product_name: 'Midnight Hunter Tank Cover Kit',
    product_short: 'Complete central, left and right tank cover kit for Benda Dark Flag V4 950',
    fitment: 'Benda Dark Flag V4 950',
    price: '1604 €',
    delivery_estimate: '10 to 15 business days',
    image: './midnight-hunter-tank-cover-kit-v4-hero.png',
    stripe_url: ''
  },
  "midnight-beast-kit-v4": {
    product_code: "midnight-beast-kit-v4",
    product_name: 'Midnight Beast Kit',
    product_short: 'Complete rear wide wheel conversion kit for Benda Dark Flag V4 950',
    fitment: 'Benda Dark Flag V4 950',
    price: '4961 €',
    delivery_estimate: '10 to 15 business days',
    image: './midnight-beast-kit-v4-hero.png',
    stripe_url: ''
  },
  "ghost-kit-maverick-air-filter-v4": {
    product_code: "ghost-kit-maverick-air-filter-v4",
    product_name: 'Ghost Kit | Maverick Air Filter',
    product_short: 'Turbine-style Maverick air filter for Dark Flag V4',
    fitment: 'Benda Dark Flag V4 950',
    price: '411 €',
    delivery_estimate: '10 to 15 business days',
    image: './ghost-kit-maverick-air-filter-v4-hero.png',
    stripe_url: '',
    color_required: true,
    color_options: 'Full Black / Platinum Silver'
  },
  "ghost-kit-transparent-clutch-cover-v4": {
    product_code: "ghost-kit-transparent-clutch-cover-v4",
    product_name: 'Ghost Kit | Transparent Clutch Cover',
    product_short: 'Transparent clutch cover kit for Dark Flag V4',
    fitment: 'Benda Dark Flag V4 950',
    price: '481 €',
    delivery_estimate: '10 to 15 business days',
    image: './ghost-kit-darkflag-v4-engine-overview.png',
    stripe_url: '',
    color_required: true,
    color_options: 'Black / Gold / Green'
  },
  "black-shield-armor-kit-450": {
    product_code: "black-shield-armor-kit-450",
    product_name: 'Black Shield Armor Kit',
    product_short: 'Black fan heat shield armor kit for Benda Napoleon 450/500',
    fitment: 'Benda Napoleon 450/500',
    price: '271 €',
    delivery_estimate: '10 to 15 business days',
    image: './black-shield-armor-kit-450-hero.png',
    stripe_url: ''
  },
  "carbon-exhaust-protection-kit-450": {
    product_code: "carbon-exhaust-protection-kit-450",
    product_name: 'Carbon Exhaust Protection Kit',
    product_short: 'Carbon-look exhaust heat shield kit for Benda Napoleon 450/500',
    fitment: 'Benda Napoleon 450/500',
    price: '271 €',
    delivery_estimate: '10 to 15 business days',
    image: './carbon-exhaust-protection-kit-450-hero.png',
    stripe_url: ''
  },
  "premium-transparent-clutch-cover-kit-450": {
    product_code: "premium-transparent-clutch-cover-kit-450",
    product_name: 'Premium Transparent Clutch Cover Kit',
    product_short: 'Premium transparent clutch cover kit for Benda Napoleon 450/500',
    fitment: 'Benda Napoleon 450/500',
    price: '471 €',
    delivery_estimate: '10 to 15 business days',
    image: './premium-transparent-clutch-cover-kit-450-hero.png',
    stripe_url: ''
  },
  "premium-comfort-foot-kit-450": {
    product_code: "premium-comfort-foot-kit-450",
    product_name: 'Premium Comfort Foot Kit',
    product_short: 'Premium wide foot kit with selectable designs for Benda Napoleon 450/500',
    fitment: 'Benda Napoleon 450/500',
    price: '271 €',
    delivery_estimate: '10 to 15 business days',
    image: './premium-comfort-foot-kit-450-skull-platinum.png',
    stripe_url: '',
    color_required: true,
    color_options: 'Black Strass / Skull Platinum / Gold Look / Design Black'
  },
  "headlight-windscreen-cover-kit-450": {
    product_code: "headlight-windscreen-cover-kit-450",
    product_name: 'Headlight Windscreen Cover Kit',
    product_short: 'Gloss black headlight windscreen cover kit for Benda Napoleon 450/500',
    fitment: 'Benda Napoleon 450/500',
    price: '191 €',
    delivery_estimate: '10 to 15 business days',
    image: './headlight-windscreen-cover-kit-450-hero.png',
    stripe_url: ''
  },
  "premium-rear-fender-450": {
    product_code: "premium-rear-fender-450",
    product_name: 'Premium Rear Fender',
    product_short: 'Premium rear fender kit Napoleon 450',
    fitment: 'Benda Napoleon 450',
    price: '323 €',
    delivery_estimate: '10 to 15 business days',
    image: './premium-rear-fender-450-hero.png',
    stripe_url: ''
  },
  "bumper-top-protect-450": {
    product_code: "bumper-top-protect-450",
    product_name: 'Top Bumper Protection',
    product_short: 'Top protection bar Napoleon 450',
    fitment: 'Benda Napoleon 450',
    price: '459 €',
    delivery_estimate: '10 to 15 business days',
    image: './top-bumper-protection-450-hero.png',
    stripe_url: ''
  },
  "double-seat-comfort-premium-plus": {
    product_code: "double-seat-comfort-premium-plus",
    product_name: 'Kit Double Seat Comfort Premium +',
    product_short: 'Premium double-seat comfort kit Napoleon 450/500',
    fitment: 'Benda Napoleon 450/500',
    price: '683 €',
    delivery_estimate: '10 to 15 business days',
    image: './double-seat-comfort-premium-plus-hero.png',
    stripe_url: ''
  },
  "maverick-air-filter-cover": {
    product_code: "maverick-air-filter-cover",
    product_name: 'Maverick Air Filter Cover',
    product_short: 'Maverick turbine air filter cover Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '241 €',
    delivery_estimate: '10 to 15 business days',
    image: './maverick-air-filter-cover-hero.webp',
    stripe_url: '',
    color_required: true,
    color_options: "Right / Left"
  },

  "decorative-cover-side": {
    product_code: "decorative-cover-side",
    product_name: 'Decorative Cover Side',
    product_short: 'Decorative side cover detail Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '163 €',
    delivery_estimate: '10 to 15 business days',
    image: './decorative-cover-side-gold-hero.webp',
    stripe_url: '',
    color_required: true,
    color_options: "Gold / Black Magic"
  },
  "black-striped-clutch-cover": {
    product_code: "black-striped-clutch-cover",
    product_name: 'Black Ribbed Clutch Cover',
    product_short: 'Black ribbed clutch cover Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '259 €',
    delivery_estimate: '10 to 15 business days',
    image: './black-striped-clutch-cover-retouched-1.webp',
    stripe_url: ''
  },
  "gold-clutch-flywheel": {
    product_code: "gold-clutch-flywheel",
    product_name: 'Gold Clutch Inner Accent',
    product_short: 'Gold inner clutch accent Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '289 €',
    delivery_estimate: '10 to 15 business days',
    image: './gold-clutch-flywheel-retouched-1.webp',
    stripe_url: ''
  },
  "transparent-clutch-cover": {
    product_code: "transparent-clutch-cover",
    product_name: 'Clear Clutch Window Cover',
    product_short: 'Transparent clutch window cover Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '289 €',
    delivery_estimate: '10 to 15 business days',
    image: './transparent-clutch-cover-retouched-1.webp',
    stripe_url: ''
  },
  "future-led-light": {
    product_code: "future-led-light",
    product_name: 'Future Front Light Upgrade',
    product_short: 'Future LED front light Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '289 €',
    delivery_estimate: '10 to 15 business days',
    image: './future-led-light-retouched-1.webp',
    stripe_url: ''
  },
  "matrix-design-head-light": {
    product_code: "matrix-design-head-light",
    product_name: 'MatriX Design Head Light',
    product_short: 'MatriX design head light Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '184 €',
    delivery_estimate: '10 to 15 business days',
    image: './matrix-headlight-hero.webp',
    stripe_url: '',
    color_required: true,
    color_options: "Yellow / Red"
  },
  "tank-cover-support-volume": {
    product_code: "tank-cover-support-volume",
    product_name: 'Tank Volume Cover',
    product_short: 'Tank cover / support volume Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '289 €',
    delivery_estimate: '10 to 15 business days',
    image: './tank-cover-retouched-1.webp',
    stripe_url: ''
  ,
    color_required: true,
    color_options: "Black / Green / Grey"
  },
  "closed-metal-hubcap-benda-samurai": {
    product_code: "closed-metal-hubcap-benda-samurai",
    product_name: 'Samurai Wheel Cover',
    product_short: 'Closed metal hubcap / Samurai wheel cover',
    fitment: 'Benda Napoleon 125/250',
    price: '329 €',
    delivery_estimate: '10 to 15 business days',
    image: './closed-metal-hubcap-retouched-1.webp',
    stripe_url: ''
  },
  "rear-arch-luggage-rack": {
    product_code: "rear-arch-luggage-rack",
    product_name: 'Rear Arch Support Rack',
    product_short: 'Rear arch support rack Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '321 €',
    delivery_estimate: '10 to 15 business days',
    image: './rear-arch-luggage-rack-retouched-1.webp',
    stripe_url: ''
  },
  "metal-foot-controls": {
    product_code: "metal-foot-controls",
    product_name: 'Bronze Foot Control Kit',
    product_short: 'Metal gear/brake foot controls Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '449 €',
    delivery_estimate: '10 to 15 business days',
    image: './metal-foot-controls-hero.webp',
    stripe_url: ''
  },
  "black-foot-control-kit": {
    product_code: "black-foot-control-kit",
    product_name: 'Black Foot Control Kit',
    product_short: 'Black foot control kit Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '449 €',
    delivery_estimate: '10 to 15 business days',
    image: './black-foot-control-hero-5.webp',
    stripe_url: ''
  },
  "double-seat-foot-peg-kit": {
    product_code: "double-seat-foot-peg-kit",
    product_name: 'Comfort Seat & Foot Peg Kit',
    product_short: 'Comfort seat and foot peg kit Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '729 €',
    delivery_estimate: '10 to 15 business days',
    image: './premium-double-seat-hero-v3.webp',
    stripe_url: '',
    color_required: true,
    color_options: "Black / Brown"
  },
  "premium-double-seat": {
    product_code: "premium-double-seat",
    product_name: 'Premium Comfort Double Seat',
    product_short: 'Premium comfort double seat Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '961 €',
    delivery_estimate: '10 to 15 business days',
    image: './premium-double-seat-hero-v3.webp',
    stripe_url: '',
    color_required: true,
    color_options: 'Black / Brown'
  },
  "ultra-single-seat-comfort": {
    product_code: "ultra-single-seat-comfort",
    product_name: 'Ultra Single Seat Comfort',
    product_short: 'Ultra single bobber comfort seat Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '411 €',
    delivery_estimate: '10 to 15 business days',
    image: './ultra-single-seat-comfort-hero.webp',
    stripe_url: ''
  },
  "brutal-rear-fender-kit": {
    product_code: "brutal-rear-fender-kit",
    product_name: 'Brutal Rear Fender Kit',
    product_short: 'Brutal rear fender kit Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '290 €',
    delivery_estimate: '10 to 15 business days',
    image: './brutal-rear-fender-hero-clean.webp',
    stripe_url: ''
  },

  "gps-carplay": {
    product_code: "gps-carplay",
    product_name: 'GPS / CarPlay screen for Benda Napoleon 125/250',
    product_short: 'GPS / CarPlay screen Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '159 €',
    delivery_estimate: '10 to 15 business days',
    image: './carplay-benda.webp',
    stripe_url: ''
  },
  "chrome-engine-cover": {
    product_code: "chrome-engine-cover",
    product_name: 'Chrome Air Side Cover',
    product_short: 'Chrome left-side air filter cover Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '389 €',
    delivery_estimate: '10 to 15 business days',
    image: './air_filter_cover_chrome_left_01_detail.png',
    stripe_url: ''
  },
  "rear-fender": {
    product_code: "rear-fender",
    product_name: 'Rear Clean Fender Kit',
    product_short: 'Rear clean fender kit Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '429 €',
    delivery_estimate: '10 to 15 business days',
    image: './rear_fender_05_side_profile.png',
    stripe_url: ''
  },
  "left-side-bag-support": {
    product_code: "left-side-bag-support",
    product_name: 'Left Side Travel Bag Kit',
    product_short: 'Left side travel bag and support Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '349 €',
    delivery_estimate: '10 to 15 business days',
    image: './left_side_bag_00_mount_bar_detail.png',
    stripe_url: ''
  },
  "left-premium-engine-cover": {
    product_code: "left-premium-engine-cover",
    product_name: 'Premium Left Engine Cover',
    product_short: 'Premium left engine cover Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '399 €',
    delivery_estimate: '10 to 15 business days',
    image: './left-engine-cover-2-closeup.png',
    stripe_url: ''
  },
  "dual-exhaust": {
    product_code: "dual-exhaust",
    product_name: 'Dual Exhaust Custom Kit',
    product_short: 'Dual exhaust custom kit Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '749 €',
    delivery_estimate: '10 to 15 business days',
    image: './dual-exhaust-card-hero.webp',
    stripe_url: ''
  },
  "right-engine-filter-cover": {
    product_code: "right-engine-filter-cover",
    product_name: 'Right Engine Side Cover',
    product_short: 'Right engine filter-style cover Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '249 €',
    delivery_estimate: '10 to 15 business days',
    image: './right-engine-filter-04.png',
    stripe_url: ''
  },
  "handlebar-riser": {
    product_code: "handlebar-riser",
    product_name: 'Comfort Handlebar Riser Kit',
    product_short: 'Comfort handlebar riser kit Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '359 €',
    delivery_estimate: '10 to 15 business days',
    image: './handlebar-riser-gallery-04.webp',
    stripe_url: ''
  },
  "fat-bob-bumper": {
    product_code: "fat-bob-bumper",
    product_name: 'Fat Bob Front Bumper Kit',
    product_short: 'Fat Bob front bumper kit Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '521 €',
    delivery_estimate: '10 to 15 business days',
    image: './fat-bob-bumper-hero-v2.webp',
    stripe_url: ''
  },
  "top-bumper": {
    product_code: "top-bumper",
    product_name: 'Top Bumper',
    product_short: 'Top bumper protection kit Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '418 €',
    delivery_estimate: '10 to 15 business days',
    image: './top-bumper-hero.webp',
    stripe_url: ''
  },
  "chassis-protection": {
    product_code: "chassis-protection",
    product_name: 'Lower Chassis Protection Plate',
    product_short: 'Lower chassis protection plate Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '449 €',
    delivery_estimate: '10 to 15 business days',
    image: './chassis-protection-featured.webp',
    stripe_url: ''
  },
  "rear-led-seat-comfort": {
    product_code: "rear-led-seat-comfort",
    product_name: 'Rear Led Seat Comfort +',
    product_short: 'Premium rear LED comfort seat Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '538 €',
    delivery_estimate: '10 to 15 business days',
    image: './rear-led-seat-comfort-card-hero.png',
    stripe_url: ''
  },
  "headlight-fairing": {
    product_code: "headlight-fairing",
    product_name: 'Front Fairing Style Kit',
    product_short: 'Front fairing style kit Napoleon 125/250',
    fitment: 'Benda Napoleon 125/250',
    price: '199 €',
    delivery_estimate: '10 to 15 business days',
    image: './fairing-hero.png',
    stripe_url: ''
  }
};

window.BENDAGO_PRODUCTS = BENDAGO_PRODUCTS;

function bendagoPush(eventName, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}

function getProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const part = params.get('part') || 'headlight-fairing';
  return BENDAGO_PRODUCTS[part] || BENDAGO_PRODUCTS['headlight-fairing'];
}

function setValue(name, value) {
  const el = document.querySelector(`[name="${name}"]`);
  if (el) el.value = value || '';
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value || '';
}

const BENDAGO_CART_KEY = 'bendago_cart_v1';

function bendagoReadCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(BENDAGO_CART_KEY) || '[]');
    return Array.isArray(cart) ? cart.filter(item => item && item.code && item.qty > 0) : [];
  } catch (e) {
    return [];
  }
}

function bendagoSaveCart(cart) {
  localStorage.setItem(BENDAGO_CART_KEY, JSON.stringify(cart));
}

function bendagoProductCodeFromLink(link) {
  try {
    const href = link.getAttribute('href') || '';
    const url = new URL(href, window.location.href);
    const part = url.searchParams.get('part');
    if (part) return part;
  } catch (e) {}
  const current = String(window.location.pathname || '').match(/order-([^/]+)\.html$/);
  return current ? current[1] : '';
}

function bendagoAddOneToCart(code, options = {}) {
  if (!code) return false;
  if (window.BendagoCart && typeof window.BendagoCart.add === 'function') {
    return window.BendagoCart.add(code, 1, options);
  }
  return false;
}


function bendagoSelectedProductOptions(link) {
  const scope = link.closest('.info-card') || document;
  const result = {};
  const requiredMissing = [];

  scope.querySelectorAll('[data-product-option-select]').forEach(select => {
    const key = select.getAttribute('data-product-option-select') || 'option';
    const label = select.getAttribute('data-product-option-label') || 'Option';
    const value = (select.value || '').trim();

    if (select.hasAttribute('data-product-option-required') && !value) {
      requiredMissing.push(label);
    }

    if (value) result[key] = value;
  });

  if (!result.color_option) {
    const linkColour = (link.getAttribute('data-selected-colour') || link.getAttribute('data-selected-color') || '').trim();
    const selectedColourText = scope.querySelector('#selectedColor');
    const activeColourButton = scope.querySelector('.color-option.active');
    const activeTankButton = scope.querySelector('.tank-color-option.is-selected');
    const inferredColour = linkColour ||
      (selectedColourText ? selectedColourText.textContent.trim() : '') ||
      (activeColourButton ? (activeColourButton.getAttribute('data-color') || activeColourButton.textContent).trim() : '') ||
      (activeTankButton ? (activeTankButton.getAttribute('data-colour') || activeTankButton.textContent).trim() : '');
    if (inferredColour) result.color_option = inferredColour;
  }

  return { options: result, requiredMissing };
}

function bendagoShowProductOptionError(link, message) {
  const scope = link.closest('.info-card') || document;
  let box = scope.querySelector('[data-product-option-error]');
  if (!box) {
    box = document.createElement('div');
    box.setAttribute('data-product-option-error', '');
    box.style.cssText = 'margin:10px 0 0;color:#fca5a5;font-size:13px;font-weight:800;';
    link.insertAdjacentElement('beforebegin', box);
  }
  box.textContent = message;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-order-product]').forEach(el => {
    el.addEventListener('click', () => {
      bendagoPush('order_product_view_click', {
        product_name: el.getAttribute('data-order-product'),
        product_url: el.href || window.location.href
      });
    });
  });

  document.querySelectorAll('.product-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      if ((btn.getAttribute('data-type') || '').toLowerCase() === 'video') return;
      const src = btn.getAttribute('data-src');
      const main = document.querySelector('#mainProductImage');
      if (src && main) main.src = src;
    });
  });

  /* BENDAGO MICRO CONVERSION HELPERS */
  document.querySelectorAll('.price-line').forEach(box => {
    if (!box.querySelector('.price-included-note')) {
      box.insertAdjacentHTML('beforeend', '<p class="price-included-note">Price includes delivery. Payment opens after cart confirmation.</p>');
    }
  });

  document.querySelectorAll('.order-footer .order-wrap').forEach(node => {
    node.textContent = 'Independent custom parts selection — not affiliated with Benda or the brands mentioned.';
  });


  document.querySelectorAll('[data-add-preview]').forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      if (button.disabled || button.hasAttribute('data-add-disabled')) return;
      const code = (button.getAttribute('data-add-preview') || '').trim();
      if (!code) return;
      const added = bendagoAddOneToCart(code, {});
      bendagoPush('model_card_add_to_cart', {
        product_code: code,
        product_name: (window.BENDAGO_PRODUCTS && window.BENDAGO_PRODUCTS[code] && window.BENDAGO_PRODUCTS[code].product_name) || code,
        source_page: window.location.pathname || ''
      });
      if (added && window.BendagoCart && typeof window.BendagoCart.open === 'function') {
        window.BendagoCart.open();
      }
    });
  });

  document.querySelectorAll('.js-request-link').forEach(link => {
    link.textContent = 'Add to cart';
    link.setAttribute('aria-label', 'Add to cart');
    if (!link.nextElementSibling || !link.nextElementSibling.classList || !link.nextElementSibling.classList.contains('stripe-secure-note')) {
      link.insertAdjacentHTML('afterend', '<p class="stripe-secure-note">Secure card payment by Stripe.</p>');
    }
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const code = bendagoProductCodeFromLink(link);
      const selected = bendagoSelectedProductOptions(link);
      if (selected.requiredMissing.length) {
        bendagoShowProductOptionError(link, 'Choose the required option before adding to cart: ' + selected.requiredMissing.join(', ') + '.');
        return;
      }
      const added = bendagoAddOneToCart(code, selected.options);
      bendagoPush('product_detail_add_to_cart', {
        product_code: code,
        product_name: link.getAttribute('data-product-name') || document.title,
        product_url: window.location.href,
        color_option: selected.options.color_option || ''
      });
      if (added && window.BendagoCart && typeof window.BendagoCart.open === 'function') {
        window.BendagoCart.open();
      } else if (!added) {
        window.location.href = link.getAttribute('href') || './cart-request.html';
      }
    });
  });

  const form = document.getElementById('orderRequestForm');
  if (!form) return;

  const product = getProductFromUrl();
  setText('[data-product-name-text]', product.product_name);
  setText('[data-product-fitment-text]', product.fitment);
  const miniImg = document.querySelector('[data-product-image]');
  if (miniImg) miniImg.src = product.image;

  const colorField = document.getElementById('colorOptionField');
  const colorSelect = document.getElementById('colorOptionSelect');
  if (colorField && colorSelect) {
    const label = colorField.querySelector('label');
    if (product.color_required) {
      if (label) label.textContent = 'Tank cover colour *';
      colorSelect.required = true;
      const first = colorSelect.querySelector('option[value=""]');
      if (first) first.textContent = 'Choose colour';
    } else {
      if (label) label.textContent = 'Colour / option';
      colorSelect.required = false;
      const first = colorSelect.querySelector('option[value=""]');
      if (first) first.textContent = 'To confirm / not applicable';
    }
  }

  setValue('product_code', product.product_code);
  setValue('product_name', product.product_name);
  setValue('product_short', product.product_short);
  setValue('price', product.price);
  setValue('fitment', product.fitment);
  setValue('delivery_estimate', product.delivery_estimate);
  setValue('request_page', window.location.href);
  setValue('referrer', document.referrer || 'direct');
  setValue('stripe_url', product.stripe_url);
  setValue('payment_url', product.stripe_url);
  setValue('payment_provider', 'Stripe');

  const qs = new URLSearchParams(window.location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content'].forEach(key => setValue(key, qs.get(key) || ''));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const status = document.getElementById('formStatus');
    const submitBtn = form.querySelector('[type="submit"]');
    const cfg = window.BENDAGO_EMAILJS_CONFIG || {};

    function showStatus(type, message) {
      if (!status) return;
      status.className = 'status-box show ' + type;
      status.textContent = message;
    }

    if (!cfg.publicKey || cfg.publicKey.includes('PASTE_') || !cfg.serviceId || cfg.serviceId.includes('PASTE_')) {
      showStatus('err', 'EmailJS is not configured yet. Replace the placeholders in emailjs-config.js first.');
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.request_id = 'BENDAGO-' + Date.now();
    data.request_date = new Date().toLocaleString();
    data.customer_email = data.email;
    data.stripe_url = product.stripe_url;
    data.payment_url = product.stripe_url;
    data.payment_provider = 'Stripe';
    data.order_status_message = 'Checkout details received. Continue to secure Stripe card payment.';
    data.tracking_note = 'Tracking details are shared as soon as they are available after shipment.';
    data.processing_note = 'Order processed after secure Stripe payment confirmation.';

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Continuing checkout…';
      showStatus('ok', 'Preparing secure checkout…');

      if (window.emailjs && emailjs.init) emailjs.init({ publicKey: cfg.publicKey });

      await emailjs.send(cfg.serviceId, cfg.adminTemplateId, data);
      await emailjs.send(cfg.serviceId, cfg.clientTemplateId, data);

      bendagoPush('order_details_confirmed', {
        product_name: data.product_name,
        product_code: data.product_code,
        customer_country: data.country || '',
        request_id: data.request_id,
        payment_provider: 'stripe'
      });

      sessionStorage.setItem('bendago_last_request', JSON.stringify({
        product_name: data.product_name,
        price: data.price,
        customer_name: data.customer_name,
        email: data.email,
        color_option: data.color_option || 'To confirm / not applicable',
        request_id: data.request_id,
        stripe_url: product.stripe_url
      }));

      window.location.href = './thank-you.html?request_id=' + encodeURIComponent(data.request_id);
    } catch (err) {
      console.error(err);
      showStatus('err', 'Checkout details could not be sent. Check EmailJS keys/templates, then try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Continue to secure payment';
    }
  });
});


/* BENDAGO V86 PRODUCT GALLERY LIGHTBOX */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var main = document.getElementById('mainProductImage');
    if (!main) return;

    var box = document.querySelector('.bcp-gallery-lightbox');
    if (!box) {
      box = document.createElement('div');
      box.className = 'bcp-gallery-lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', 'Product image full view');
      box.innerHTML = '<div class="bcp-gallery-lightbox-inner"><img class="bcp-gallery-lightbox-img" alt=""><button class="bcp-gallery-lightbox-close" type="button" aria-label="Close image view">×</button><div class="bcp-gallery-lightbox-caption"></div></div>';
      document.body.appendChild(box);
    }

    var img = box.querySelector('.bcp-gallery-lightbox-img');
    var close = box.querySelector('.bcp-gallery-lightbox-close');
    var caption = box.querySelector('.bcp-gallery-lightbox-caption');

    function open(src, alt) {
      if (!src || !img) return;
      img.src = src;
      img.alt = alt || 'Product image';
      if (caption) caption.textContent = alt || '';
      box.classList.add('is-open');
      document.body.classList.add('bcp-lightbox-open');
    }

    function closeBox() {
      box.classList.remove('is-open');
      document.body.classList.remove('bcp-lightbox-open');
    }

    main.addEventListener('click', function () {
      open(main.currentSrc || main.src, main.alt || document.title || 'Product image');
    });

    document.querySelectorAll('.product-thumb').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if ((btn.getAttribute('data-type') || '').toLowerCase() === 'video') return;
        var src = btn.getAttribute('data-src') || (btn.querySelector('img') && btn.querySelector('img').src) || '';
        if (src && main) {
          main.src = src;
          var thumbImg = btn.querySelector('img');
          if (thumbImg && thumbImg.alt) main.alt = thumbImg.alt;
        }
      });
    });

    if (close) close.addEventListener('click', closeBox);
    box.addEventListener('click', function (event) {
      if (event.target === box) closeBox();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && box.classList.contains('is-open')) closeBox();
    });
  });
})();
/* END BENDAGO V86 PRODUCT GALLERY LIGHTBOX */
