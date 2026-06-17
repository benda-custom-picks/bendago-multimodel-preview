/* BENDAGO CART FLOW V1.14 — Stripe-only checkout */
(function () {
  const CART_KEY = 'bendago_cart_v1';
  const CHECKOUT_WORKER_URL = ['https://bendago-', 'sum', 'up-checkout.custom125picks.workers.dev/'].join('');
  const LAUNCH_DISCOUNT_RATE = 0.05;
  const TERMS_VERSION = 'BCP-CGV-2026-06-09-ORDERLOCK';
  const TERMS_URL = 'https://bendacustompicks.com/terms-and-conditions.html';
  const CHECKOUT_TERMS_VISIBLE_TEXT = [
    'Model & parts: I confirm the selected motorcycle model, parts, quantities, colours and options.',
    'Total & delivery country: I confirm the delivery country and full amount before payment.',
    'Custom order: I understand this is a custom-sourced parts order prepared according to my selection.',
    'Processing after payment: I request order processing after Stripe payment confirmation.',
    'Delivery/import: delivery is included unless stated; local import duties, taxes or carrier fees remain my responsibility if applied.',
    'Cancellation policy: once processing, supplier preparation or dispatch preparation has started, cancellation is not automatic and may no longer be possible.',
    'I confirm my model, selected parts/options, delivery country, total amount, custom sourcing, processing after payment and cancellation policy before secure payment.'
  ].join('\n');

  const CHECKOUT_SKU_MAP = {
    'black-striped-clutch-cover': 'black-ribbed-clutch-cover',
    'gold-clutch-flywheel': 'gold-clutch-inner-accent',
    'transparent-clutch-cover': 'clear-clutch-window-cover',
    'future-led-light': 'future-front-light-upgrade',
    'matrix-design-head-light': 'matrix-design-head-light',
    'tank-cover-support-volume': 'tank-volume-cover',
    'closed-metal-hubcap-benda-samurai': 'samurai-wheel-cover',
    'rear-arch-luggage-rack': 'rear-arch-support-rack',
    'metal-foot-controls': 'bronze-foot-control-kit',
    'black-foot-control-kit': 'black-foot-control-kit',
    'double-seat-foot-peg-kit': 'comfort-seat-foot-peg-kit',
    'premium-double-seat': 'premium-comfort-double-seat',
    'ultra-single-seat-comfort': 'ultra-single-seat-comfort',
    'rear-led-seat-comfort': 'rear-led-seat-comfort-plus',
    'brutal-rear-fender-kit': 'brutal-rear-fender-kit',
    'gps-carplay': 'gps-carplay-screen',
    'chrome-engine-cover': 'chrome-air-side-cover',
    'rear-fender': 'rear-clean-fender-kit',
    'left-side-bag-support': 'left-side-travel-bag-kit',
    'left-premium-engine-cover': 'premium-left-engine-cover',
    'dual-exhaust': 'dual-exhaust-custom-kit',
    'right-engine-filter-cover': 'right-engine-side-cover',
    'handlebar-riser': 'comfort-handlebar-riser-kit',
    'fat-bob-bumper': 'fat-bob-front-bumper-kit',
    'top-bumper': 'top-bumper',
    'chassis-protection': 'lower-chassis-protection-plate',
    'headlight-fairing': 'front-fairing-style-kit',
    'double-seat-comfort-premium-plus': 'double-seat-comfort-premium-plus',
    'bumper-top-protect-450': 'bumper-top-protect-450',
    'premium-rear-fender-450': 'premium-rear-fender-450',
    'maverick-air-filter-450': 'maverick-air-filter-450',
    'transparent-gold-clutch-cover-kit-450': 'transparent-gold-clutch-cover-kit-450',
    'madmax-double-exhaust-kit-450': 'madmax-double-exhaust-kit-450',
    'premium-comfort-foot-kit-450': 'premium-comfort-foot-kit-450',
    'headlight-windscreen-cover-kit-450': 'headlight-windscreen-cover-kit-450',
    'premium-transparent-clutch-cover-kit-450': 'premium-transparent-clutch-cover-kit-450',
    'carbon-exhaust-protection-kit-450': 'carbon-exhaust-protection-kit-450',
    'black-shield-armor-kit-450': 'black-shield-armor-kit-450',
    'ghost-kit-maverick-air-filter-v4': 'ghost-kit-maverick-air-filter-v4',
    'ghost-kit-transparent-clutch-cover-v4': 'ghost-kit-transparent-clutch-cover-v4',
    'midnight-beast-kit-v4': 'midnight-beast-kit-v4',
    'midnight-hunter-tank-cover-kit-v4': 'midnight-hunter-tank-cover-kit-v4',
    'tandem-kit-v4': 'tandem-kit-v4'
  };

  const COMPLETE_BUILD_OFFERS = [
    {
      key: 'strong-pure-bob',
      name: 'Strong Pure Bob Complete Build',
      items: [
        { code: 'headlight-fairing' },
        { code: 'chassis-protection' },
        { code: 'top-bumper' },
        { code: 'rear-fender', color_option: 'Black' },
        { code: 'tank-cover-support-volume', color_option: 'Black' },
        { code: 'premium-double-seat' },
        { code: 'left-premium-engine-cover' },
        { code: 'metal-foot-controls' }
      ]
    },
    {
      key: 'headlight-fairing',
      name: 'Headlight Fairing Complete Build',
      items: [
        { code: 'future-led-light' },
        { code: 'chassis-protection' },
        { code: 'top-bumper' },
        { code: 'black-striped-clutch-cover' },
        { code: 'chrome-engine-cover' },
        { code: 'tank-cover-support-volume', color_option: 'Black' },
        { code: 'premium-double-seat' },
        { code: 'black-foot-control-kit' },
      ]
    },
    {
      key: 'black-fat-bob',
      name: 'Brutal Bob Complete Build',
      items: [
        { code: 'right-engine-filter-cover' },
        { code: 'handlebar-riser' },
        { code: 'transparent-clutch-cover' },
        { code: 'gold-clutch-flywheel' },
        { code: 'rear-led-seat-comfort' },
        { code: 'brutal-rear-fender-kit' },
        { code: 'closed-metal-hubcap-benda-samurai' },
        { code: 'dual-exhaust', color_option: 'Chrome' }
      ]
    },
    {
      key: 'blackout-predator',
      name: 'Blackout Predator Complete Build',
      items: [
        { code: 'dual-exhaust', color_option: 'Black' },
        { code: 'maverick-air-filter-cover' },
        { code: 'headlight-fairing', color_option: 'Black' },
        { code: 'black-foot-control-kit' },
        { code: 'tank-cover-support-volume', color_option: 'Black' },
        { code: 'premium-double-seat', color_option: 'Black' }
      ]
    },
    {
      key: 'shadow-beast-v4',
      name: 'Shadow Beast V4',
      items: [
        { code: 'ghost-kit-maverick-air-filter-v4' },
        { code: 'ghost-kit-transparent-clutch-cover-v4' },
        { code: 'midnight-hunter-tank-cover-kit-v4' },
        { code: 'midnight-beast-kit-v4' }
      ]
    },
    {
      key: 'midnight-hunter',
      name: 'Midnight Hunter Build',
      items: [
        { code: 'madmax-double-exhaust-kit-450' },
        { code: 'maverick-air-filter-450' },
        { code: 'premium-comfort-foot-kit-450' },
        { code: 'premium-transparent-clutch-cover-kit-450' },
        { code: 'carbon-exhaust-protection-kit-450' },
        { code: 'black-shield-armor-kit-450' }
      ]
    }
  ];


  const BUNDLE_ADD_TO_CART_ITEMS = {
    'strong-pure-bob-complete': [
      { code: 'headlight-fairing' },
      { code: 'chassis-protection' },
      { code: 'top-bumper' },
      { code: 'rear-fender', options: { color_option: 'Black' } },
      { code: 'tank-cover-support-volume', options: { color_option: 'Black' } },
      { code: 'premium-double-seat' },
      { code: 'left-premium-engine-cover' },
      { code: 'metal-foot-controls' }
    ],
    'strong-pure-bob-essentials': [
      { code: 'rear-fender', options: { color_option: 'Black' } },
      { code: 'tank-cover-support-volume', options: { color_option: 'Black' } }
    ],
    'headlight-fairing-complete': [
      { code: 'future-led-light' },
      { code: 'chassis-protection' },
      { code: 'top-bumper' },
      { code: 'black-striped-clutch-cover' },
      { code: 'chrome-engine-cover' },
      { code: 'tank-cover-support-volume', options: { color_option: 'Black' } },
      { code: 'premium-double-seat' },
      { code: 'black-foot-control-kit' }
    ],
    'headlight-fairing-essentials': [
      { code: 'future-led-light' },
      { code: 'black-striped-clutch-cover' }
    ],
    'brutal-bob-complete': [
      { code: 'right-engine-filter-cover' },
      { code: 'handlebar-riser' },
      { code: 'transparent-clutch-cover' },
      { code: 'gold-clutch-flywheel' },
      { code: 'rear-led-seat-comfort' },
      { code: 'brutal-rear-fender-kit' },
      { code: 'closed-metal-hubcap-benda-samurai' },
      { code: 'dual-exhaust', options: { color_option: 'Chrome' } }
    ],
    'brutal-bob-essentials': [
      { code: 'right-engine-filter-cover' },
      { code: 'closed-metal-hubcap-benda-samurai' }
    ],
    'blackout-predator-complete': [
      { code: 'dual-exhaust', options: { color_option: 'Black' } },
      { code: 'maverick-air-filter-cover' },
      { code: 'headlight-fairing', options: { color_option: 'Black' } },
      { code: 'black-foot-control-kit' },
      { code: 'tank-cover-support-volume', options: { color_option: 'Black' } },
      { code: 'premium-double-seat', options: { color_option: 'Black' } }
    ],
    'blackout-predator-essentials': [
      { code: 'maverick-air-filter-cover' },
      { code: 'tank-cover-support-volume', options: { color_option: 'Black' } }
    ],
    'shadow-beast-v4-complete': [
      { code: 'ghost-kit-maverick-air-filter-v4', options: { color_option: 'Full Black' } },
      { code: 'ghost-kit-transparent-clutch-cover-v4', options: { color_option: 'Black' } },
      { code: 'midnight-hunter-tank-cover-kit-v4' },
      { code: 'midnight-beast-kit-v4' }
    ],
    'shadow-beast-v4-essentials': [
      { code: 'ghost-kit-maverick-air-filter-v4', options: { color_option: 'Full Black' } }
    ],
    'midnight-hunter-complete': [
      { code: 'madmax-double-exhaust-kit-450' },
      { code: 'maverick-air-filter-450' },
      { code: 'premium-comfort-foot-kit-450', options: { color_option: 'Skull Platinum' } },
      { code: 'premium-transparent-clutch-cover-kit-450' },
      { code: 'carbon-exhaust-protection-kit-450' },
      { code: 'black-shield-armor-kit-450' }
    ],
    'midnight-hunter-essentials': [
      { code: 'premium-comfort-foot-kit-450', options: { color_option: 'Skull Platinum' } }
    ]
  };

  function bindBuildBundleButtons() {
    document.querySelectorAll('[data-add-bundle]').forEach(button => {
      if (button.dataset.bundleBound === 'true') return;
      button.dataset.bundleBound = 'true';
      button.addEventListener('click', () => {
        const key = String(button.getAttribute('data-add-bundle') || '').trim();
        const items = BUNDLE_ADD_TO_CART_ITEMS[key];
        if (!items || !items.length) return;
        upsertMany(items);
        const box = button.closest('[data-bundle-box]');
        const msg = box ? box.querySelector('.build-bundle-added') : null;
        if (msg) {
          msg.textContent = key.endsWith('-essentials')
            ? 'Essentials added to cart. You can complete the full look later.'
            : 'Complete look added to cart. Launch Access 5% appears in cart.';
          msg.classList.add('show');
        }
        push('build_bundle_add_click', {
          build_key: key,
          build_name: key.indexOf('midnight-hunter') === 0 ? 'Midnight Hunter Build' : (key.indexOf('shadow-beast-v4') === 0 ? 'Shadow Beast V4' : key),
          cart_count: cartCount()
        });
        openCart();
      });
    });
  }

  /* BENDAGO v55 — append build attribution to checkout GA4 events */
  const BUILD_ATTR_KEY_V55 = 'bendago_build_attribution_v55';

  function readBuildAttributionV55() {
    try {
      const raw = sessionStorage.getItem(BUILD_ATTR_KEY_V55);
      if (!raw) return {};
      const data = JSON.parse(raw);
      if (!data || !data.build_key) return {};
      if (Date.now() - Number(data.saved_at || 0) > 60 * 60 * 1000) return {};
      return data;
    } catch (e) {
      return {};
    }
  }

  function push(eventName, params = {}) {
    window.dataLayer = window.dataLayer || [];
    const payload = { event: eventName, ...params };
    if (/^(cart_checkout_click|stripe_checkout_created|cart_checkout_details_sent|stripe_payment_click)$/.test(eventName)) {
      const attr = readBuildAttributionV55();
      if (attr.build_key) {
        payload.source_build_key = attr.build_key;
        payload.source_build_name = attr.build_name || '';
        payload.source_cta_type = attr.cta_type || '';
        payload.source_page = attr.source_page || '';
        payload.source_url = attr.source_url || '';
      }
    }
    window.dataLayer.push(payload);
  }

  function readCart() {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(cart) ? cart.filter(item => item && item.code && Number(item.qty) > 0) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('bendago:cart-updated'));
  }

  function euroToNumber(value) {
    const match = String(value || '').replace(',', '.').match(/([0-9]+(?:\.[0-9]+)?)/);
    return match ? Number(match[1]) : 0;
  }

  function formatEuro(value) {
    const cents = Math.round((Number(value) || 0) * 100);
    const amount = cents / 100;
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
    return formatted + ' €';
  }

  function normalizeOption(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cleanOption(value) {
    return String(value || '').trim();
  }

  function optionLabel(item) {
    return cleanOption(item && item.color_option);
  }

  function optionText(item) {
    const color = optionLabel(item);
    if (!color) return '';
    if (item && String(item.code || item.product_code || '').trim() === 'maverick-air-filter-cover') return 'Side: ' + color;
    if (item && String(item.code || item.product_code || '').trim() === 'decorative-cover-side') return 'Finish: ' + color;
    if (item && String(item.code || item.product_code || '').trim() === 'premium-comfort-foot-kit-450') return 'Design: ' + color;
    return 'Colour: ' + color;
  }


  function workerSkuFor(code) {
    return CHECKOUT_SKU_MAP[String(code || '').trim()] || String(code || '').trim();
  }

  function productUnit(code) {
    const product = products()[code];
    return product ? euroToNumber(product.price) : 0;
  }

  function matchingQty(lines, required) {
    return lines.reduce((sum, line) => {
      if (line.code !== required.code) return sum;
      if (required.color_option && normalizeOption(line.color_option) !== normalizeOption(required.color_option)) return sum;
      return sum + (Number(line.qty) || 0);
    }, 0);
  }

  function calculateLaunchOffer(lines) {
    const subtotalCents = Math.round((lines || []).reduce((sum, line) => sum + line.line_total, 0) * 100);
    let best = null;

    COMPLETE_BUILD_OFFERS.forEach(build => {
      const eligible = build.items.every(item => matchingQty(lines, item) >= (Number(item.qty) || 1));
      if (!eligible) return;
      const buildSubtotalCents = build.items.reduce((sum, item) => sum + Math.round(productUnit(item.code) * 100) * (Number(item.qty) || 1), 0);
      const discountCents = Math.round(buildSubtotalCents * LAUNCH_DISCOUNT_RATE);
      if (!best || discountCents > best.discountCents) {
        best = { key: build.key, name: build.name, buildSubtotalCents, discountCents };
      }
    });

    const discountCents = best ? best.discountCents : 0;
    return {
      subtotal: subtotalCents / 100,
      discountAmount: discountCents / 100,
      total: (subtotalCents - discountCents) / 100,
      discountApplied: discountCents > 0,
      buildName: best ? best.name : '',
      buildKey: best ? best.key : ''
    };
  }

  function pricingHtml(pricing) {
    if (pricing && pricing.discountApplied) {
      return [
        '<div class="cart-pricing-row"><span>Subtotal</span><strong>' + formatEuro(pricing.subtotal) + '</strong></div>',
        '<div class="cart-pricing-row cart-pricing-discount"><span>Launch Access 5%</span><strong>-' + formatEuro(pricing.discountAmount) + '</strong></div>',
        '<div class="cart-total-row"><span>Total</span><strong>' + formatEuro(pricing.total) + '</strong></div>',
        '<div class="cart-launch-note">Launch Access applied' + (pricing.buildName ? ': ' + escapeHtml(pricing.buildName) : '') + '. No code needed.</div>'
      ].join('');
    }
    return '<div class="cart-total-row"><span>Total</span><strong>' + formatEuro(pricing ? pricing.total : 0) + '</strong></div>';
  }

  function cartSummaryText(lines, pricing) {
    const productLines = lines.map(line => line.product_name + ' x ' + line.qty + (optionText(line) ? ' — ' + optionText(line) : '') + ' — ' + formatEuro(line.line_total));
    if (pricing && pricing.discountApplied) {
      productLines.push('Subtotal — ' + formatEuro(pricing.subtotal));
      productLines.push('Launch Access 5% — -' + formatEuro(pricing.discountAmount));
      productLines.push('Total today — ' + formatEuro(pricing.total));
    }
    return productLines.join('\n');
  }

  function pricingFromCheckout(checkout, fallback) {
    const amount = Number(checkout && checkout.amount);
    const subtotal = Number(checkout && checkout.subtotal);
    const discount = Number(checkout && checkout.discount_amount);
    const applied = !!(checkout && checkout.discount_applied && discount > 0);
    return {
      subtotal: Number.isFinite(subtotal) ? subtotal : (fallback ? fallback.subtotal : amount),
      discountAmount: Number.isFinite(discount) ? discount : 0,
      total: Number.isFinite(amount) ? amount : (fallback ? fallback.total : 0),
      discountApplied: applied,
      buildName: (checkout && checkout.eligible_build_name) || (fallback && fallback.buildName) || '',
      buildKey: (checkout && checkout.eligible_build_key) || (fallback && fallback.buildKey) || ''
    };
  }

async function createStripeCheckout(lines, formData) {
    const pricing = calculateLaunchOffer(lines);
    const payload = {
      customer_email: String((formData && formData.email) || '').trim(),
      customer_name: String((formData && formData.customer_name) || '').trim(),
      terms_acceptance: {
        terms_accepted: String((formData && formData.terms_accepted) || '') === 'true',
        custom_sourcing_accepted: String((formData && formData.custom_sourcing_accepted) || '') === 'true',
        custom_order_accepted: String((formData && formData.custom_order_accepted) || '') === 'true',
        selected_model_accepted: String((formData && formData.selected_model_accepted) || '') === 'true',
        selected_products_colours_options_accepted: String((formData && formData.selected_products_colours_options_accepted) || '') === 'true',
        delivery_country_accepted: String((formData && formData.delivery_country_accepted) || '') === 'true',
        total_amount_accepted: String((formData && formData.total_amount_accepted) || '') === 'true',
        immediate_processing_requested: String((formData && formData.immediate_processing_requested) || '') === 'true',
        cancellation_policy_accepted: String((formData && formData.cancellation_policy_accepted) || '') === 'true',
        terms_version: String((formData && formData.terms_version) || TERMS_VERSION),
        terms_accepted_at: String((formData && formData.terms_accepted_at) || ''),
        terms_page_url: TERMS_URL,
        checkout_page_url: window.location.href
      },
      launch_offer_expected: {
        discount_rate: LAUNCH_DISCOUNT_RATE,
        discount_expected: !!pricing.discountApplied,
        eligible_build_key: pricing.buildKey || '',
        eligible_build_name: pricing.buildName || '',
        subtotal: pricing.subtotal,
        discount_amount: pricing.discountAmount,
        total: pricing.total
      },
      items: lines.map(line => ({
        sku: workerSkuFor(line.product_code || line.code),
        quantity: Math.max(1, Number(line.qty) || 1),
        color_option: line.color_option || ''
      }))
    };

    const response = await fetch(CHECKOUT_WORKER_URL.replace(/\/$/, '') + '/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const rawText = await response.text().catch(() => '');
    let data = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (e) {
      data = { error: rawText || 'Non JSON response from checkout worker' };
    }

    if (!response.ok || !data.checkout_url) {
      const detail =
        (data && data.detail && typeof data.detail === 'string' && data.detail) ||
        (data && data.detail && data.detail.error && data.detail.error.message) ||
        (data && data.detail && data.detail.message) ||
        (data && data.error && data.error.message) ||
        (data && data.error) ||
        rawText ||
        'Stripe checkout creation failed';

      throw new Error('Stripe checkout creation failed: ' + detail);
    }
    return data;
  }




  function termsAcceptanceEvidence(form, formData) {
    const checkbox = form.querySelector('[name="custom_order_terms_acceptance"]');
    const acceptedAt = new Date().toISOString();
    if (!checkbox || !checkbox.checked) {
      if (checkbox) checkbox.focus();
      throw new Error('Please accept the custom order and cancellation policy before secure payment.');
    }

    formData.terms_version = TERMS_VERSION;
    formData.terms_accepted = 'true';
    formData.custom_sourcing_accepted = 'true';
    formData.custom_order_accepted = 'true';
    formData.selected_model_accepted = 'true';
    formData.selected_products_colours_options_accepted = 'true';
    formData.delivery_country_accepted = 'true';
    formData.total_amount_accepted = 'true';
    formData.immediate_processing_requested = 'true';
    formData.cancellation_policy_accepted = 'true';
    formData.terms_accepted_at = acceptedAt;
    formData.terms_page_url = TERMS_URL;

    ['terms_version','terms_accepted_at','custom_sourcing_accepted','custom_order_accepted','selected_model_accepted','selected_products_colours_options_accepted','delivery_country_accepted','total_amount_accepted','immediate_processing_requested','cancellation_policy_accepted'].forEach(name => {
      const input = form.querySelector('[name="' + name + '"]');
      if (!input) return;
      if (name === 'terms_version') input.value = TERMS_VERSION;
      if (name === 'terms_accepted_at') input.value = acceptedAt;
      if (name === 'custom_sourcing_accepted') input.value = 'true';
      if (name === 'custom_order_accepted') input.value = 'true';
      if (name === 'selected_model_accepted') input.value = 'true';
      if (name === 'selected_products_colours_options_accepted') input.value = 'true';
      if (name === 'delivery_country_accepted') input.value = 'true';
      if (name === 'total_amount_accepted') input.value = 'true';
      if (name === 'immediate_processing_requested') input.value = 'true';
      if (name === 'cancellation_policy_accepted') input.value = 'true';
    });

    return {
      terms_accepted: true,
      custom_sourcing_accepted: true,
      custom_order_accepted: true,
      selected_model_accepted: true,
      selected_products_colours_options_accepted: true,
      delivery_country_accepted: true,
      total_amount_accepted: true,
      immediate_processing_requested: true,
      cancellation_policy_accepted: true,
      terms_version: TERMS_VERSION,
      terms_accepted_at: acceptedAt,
      terms_page_url: TERMS_URL,
      checkout_page_url: window.location.href
    };
  }

  function checkoutEvidenceDeviceSnapshot() {
    let timezone = '';
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    return [
      'Checkout page URL: ' + window.location.href,
      'Terms page URL: ' + TERMS_URL,
      'Referrer: ' + (document.referrer || 'direct'),
      'User agent: ' + (navigator.userAgent || ''),
      'Browser language: ' + (navigator.language || ''),
      'Viewport: ' + (window.innerWidth || '') + 'x' + (window.innerHeight || ''),
      'Timezone: ' + timezone
    ].join('\n');
  }

  function buildCheckoutEvidenceBody(options) {
    const formData = options.formData || {};
    const finalPricing = options.finalPricing || {};
    const lines = options.lines || [];
    const cartSummary = options.cartSummary || '';
    const provider = options.provider || '';
    const requestId = options.requestId || '';
    const checkoutId = options.checkoutId || '';
    const stage = options.stage || 'CHECKOUT_EVIDENCE';
    const paymentUrl = options.paymentUrl || '';
    const createdAt = new Date().toISOString();
    const lineCount = lines.reduce((sum, line) => sum + (Number(line.qty) || 0), 0);

    return [
      'BENDAGO CHECKOUT EVIDENCE SNAPSHOT',
      'Evidence stage: ' + stage,
      'Evidence created at: ' + createdAt,
      'Request ID: ' + requestId,
      'Payment provider: ' + provider,
      'Checkout ID: ' + checkoutId,
      paymentUrl ? 'Payment URL / checkout URL: ' + paymentUrl : '',
      '',
      'CUSTOMER / ORDER DETAILS',
      'Customer name: ' + (formData.customer_name || ''),
      'Customer email: ' + (formData.email || formData.customer_email || ''),
      'Phone: ' + (formData.phone || ''),
      'Motorcycle model: ' + (formData.motorcycle_model || ''),
      'Year / version: ' + (formData.year_version || ''),
      'Delivery country: ' + (formData.country || ''),
      'Delivery city/country: ' + (formData.delivery_city_country || ''),
      'Delivery address: ' + (formData.delivery_address || ''),
      '',
      'CART SNAPSHOT',
      cartSummary,
      'Cart item count: ' + String(lineCount),
      'Subtotal: ' + formatEuro(finalPricing.subtotal || finalPricing.total || 0),
      finalPricing.discountApplied ? 'Launch Access discount: -' + formatEuro(finalPricing.discountAmount || 0) : 'Launch Access discount: not applied',
      'Final total accepted before payment: ' + formatEuro(finalPricing.total || 0),
      '',
      'TERMS ACCEPTANCE SNAPSHOT',
      'terms_accepted: ' + (formData.terms_accepted || 'true'),
      'custom_order_accepted: ' + (formData.custom_order_accepted || 'true'),
      'selected_model_accepted: ' + (formData.selected_model_accepted || 'true'),
      'selected_products_colours_options_accepted: ' + (formData.selected_products_colours_options_accepted || 'true'),
      'delivery_country_accepted: ' + (formData.delivery_country_accepted || 'true'),
      'total_amount_accepted: ' + (formData.total_amount_accepted || 'true'),
      'immediate_processing_requested: ' + (formData.immediate_processing_requested || 'true'),
      'cancellation_policy_accepted: ' + (formData.cancellation_policy_accepted || 'true'),
      'Terms version: ' + (formData.terms_version || TERMS_VERSION),
      'Terms accepted at: ' + (formData.terms_accepted_at || ''),
      'Terms page URL: ' + TERMS_URL,
      '',
      'VISIBLE CHECKOUT WORDING ACCEPTED BEFORE PAYMENT',
      CHECKOUT_TERMS_VISIBLE_TEXT,
      '',
      'PROCESSING / CANCELLATION RECORD',
      'Payment received / checkout success triggers order confirmation and custom order processing evidence.',
      'Cancellation is not automatic once order processing, supplier preparation or dispatch preparation has started.',
      '',
      'DEVICE / PAGE SNAPSHOT',
      checkoutEvidenceDeviceSnapshot()
    ].filter(Boolean).join('\n');
  }

  function showCartStatus(type, message) {
    const status = document.getElementById('cartFormStatus');
    if (!status) return;
    status.className = 'status-box show ' + type;
    status.textContent = message;
  }

  function isEmailJsConfigured(cfg) {
    const c = cfg || {};
    const values = [c.publicKey, c.serviceId, c.adminTemplateId, c.clientTemplateId];
    return values.every(function (value) {
      const text = String(value || '').trim();
      return text && !/PASTE_|YOUR_|REPLACE_|XXXX|TODO/i.test(text);
    });
  }

  function getValidatedCartFormData() {
    const form = document.getElementById('cartRequestForm');
    if (!form) throw new Error('Cart form not found');

    const lines = getLines();
    if (!lines.length) throw new Error('Your cart is empty. Choose at least one Benda Napoleon part first.');

    const formData = Object.fromEntries(new FormData(form).entries());
    const termsAcceptance = termsAcceptanceEvidence(form, formData);
    const requiredSelectors = ['customer_name', 'email', 'phone', 'country', 'motorcycle_model', 'year_version', 'delivery_city_country', 'delivery_address'];

    for (const name of requiredSelectors) {
      const value = String(formData[name] || '').trim();
      if (!value) {
        const field = form.querySelector('[name="' + name + '"]');
        if (field) field.focus();
        throw new Error('Please complete all required details before secure checkout.');
      }
    }

    const cfg = window.BENDAGO_EMAILJS_CONFIG || {};

    return { form, formData, lines, cfg, termsAcceptance };
  }

  async function sendStripePreCheckoutEmails(context, checkout) {
    const { formData, lines, cfg } = context;
    const pricing = calculateLaunchOffer(lines);
    const finalPricing = pricingFromCheckout(checkout, pricing);
    const cartSummary = cartSummaryText(lines, finalPricing);
    const first = lines[0];
    const isSingle = lines.length === 1 && first.qty === 1;
    const requestId = checkout.order_id || ('BENDAGO-STRIPE-' + Date.now());
    const checkoutId = checkout.checkout_id || checkout.stripe_session_id || '';
    const checkoutEvidenceBody = buildCheckoutEvidenceBody({
      formData,
      lines,
      finalPricing,
      cartSummary,
      provider: 'Stripe',
      requestId,
      checkoutId,
      paymentUrl: checkout.checkout_url || '',
      stage: 'PRE_PAYMENT_STRIPE_CHECKOUT_CREATED'
    });

    const emailData = {
      ...formData,
      request_id: requestId,
      request_date: new Date().toLocaleString(),
      customer_email: formData.email,
      product_code: isSingle ? first.product_code : 'grouped-cart',
      product_name: isSingle ? first.product_name : 'Grouped Benda Napoleon cart',
      product_short: isSingle ? first.product_short : 'Grouped Benda Napoleon parts',
      price: isSingle ? first.price : formatEuro(finalPricing.total),
      fitment: 'Benda Napoleon 125 / 250',
      delivery_estimate: '10 to 15 business days',
      payment_provider: 'Stripe',
      payment_url: checkout.checkout_url || '',
      stripe_url: checkout.checkout_url || '',
      stripe_session_id: checkout.stripe_session_id || checkout.checkout_id || '',
            checkout_url: checkout.checkout_url || '',
      checkout_id: checkout.checkout_id || checkout.stripe_session_id || '',
      checkout_evidence_id: requestId,
      evidence_email_type: 'PRE_PAYMENT_CHECKOUT_ACCEPTANCE',
      checkout_evidence_body: checkoutEvidenceBody,
      evidence_mail_body: checkoutEvidenceBody,
      message: checkoutEvidenceBody,
      post_payment_evidence_required: 'true',
      cart_summary: cartSummary,
      cart_total: formatEuro(finalPricing.total),
      launch_discount: finalPricing.discountApplied ? formatEuro(finalPricing.discountAmount) : '',
      launch_offer: finalPricing.discountApplied ? 'Launch Access applied: ' + finalPricing.buildName + ' — no code needed' : '',
      cart_count: String(lines.reduce((sum, line) => sum + line.qty, 0)),
      request_page: window.location.href,
      referrer: document.referrer || 'direct',
      terms_accepted: formData.terms_accepted || 'true',
      custom_sourcing_accepted: formData.custom_sourcing_accepted || 'true',
      custom_order_accepted: formData.custom_order_accepted || 'true',
      selected_model_accepted: formData.selected_model_accepted || 'true',
      selected_products_colours_options_accepted: formData.selected_products_colours_options_accepted || 'true',
      delivery_country_accepted: formData.delivery_country_accepted || 'true',
      total_amount_accepted: formData.total_amount_accepted || 'true',
      immediate_processing_requested: formData.immediate_processing_requested || 'true',
      cancellation_policy_accepted: formData.cancellation_policy_accepted || 'true',
      terms_version: formData.terms_version || TERMS_VERSION,
      terms_accepted_at: formData.terms_accepted_at || '',
      terms_page_url: TERMS_URL,
      cancellation_policy_summary: 'Custom parts order accepted before payment. Order processing may start after payment. Cancellation is not automatic once order processing, supplier preparation or dispatch preparation has started. Delivery included unless stated otherwise; local import duties/taxes or carrier fees remain customer responsibility if applied.',
      order_processing_status: 'Payment received. Custom order confirmed. Selected model, parts, colours, options and total amount recorded for processing.',
      order_evidence_summary: 'Customer accepted custom order terms before payment: selected motorcycle model, products, quantities, colours, options, delivery country, total amount and local import/customs responsibility reviewed.',
      order_status_message: 'Checkout details received. Customer continues directly to secure Stripe card checkout.',
      color_option: isSingle ? (first.color_option || formData.color_option || 'To confirm / not applicable') : (formData.color_option || 'See cart summary'),
      tracking_note: 'Tracking details are shared as soon as they are available after shipment.',
      processing_note: 'Order processed after Stripe payment confirmation.'
    };

    if (isEmailJsConfigured(cfg) && window.emailjs && window.emailjs.init && window.emailjs.send) {
      try {
        window.emailjs.init({ publicKey: cfg.publicKey });
        await window.emailjs.send(cfg.serviceId, cfg.adminTemplateId, emailData);
        await window.emailjs.send(cfg.serviceId, cfg.clientTemplateId, emailData);
        push('cart_checkout_email_sent', {
          request_id: emailData.request_id,
          checkout_id: emailData.checkout_id,
          payment_provider: 'stripe'
        });
      } catch (emailErr) {
        console.warn('EmailJS pre-checkout email skipped; Stripe checkout continues.', emailErr);
        push('cart_checkout_email_skipped', {
          request_id: emailData.request_id,
          checkout_id: emailData.checkout_id,
          reason: 'emailjs_send_failed',
          payment_provider: 'stripe'
        });
      }
    } else {
      console.warn('EmailJS not configured; Stripe checkout continues without pre-checkout email.');
      push('cart_checkout_email_skipped', {
        request_id: emailData.request_id,
        checkout_id: emailData.checkout_id,
        reason: 'emailjs_not_configured',
        payment_provider: 'stripe'
      });
    }

    push('stripe_checkout_created', {
      request_id: emailData.request_id,
      checkout_id: emailData.checkout_id,
      cart_total: formatEuro(finalPricing.total),
      cart_count: emailData.cart_count,
      payment_provider: 'stripe'
    });

    push('cart_checkout_details_sent', {
      request_id: emailData.request_id,
      cart_total: formatEuro(finalPricing.total),
      cart_count: emailData.cart_count,
      payment_provider: 'stripe'
    });

    sessionStorage.removeItem('bendago_last_request');
    sessionStorage.removeItem('bendago_last_cart_request');
    sessionStorage.setItem('bendago_last_checkout', JSON.stringify({
      cart_summary: cartSummary.replace(/\n/g, '<br>'),
      cart_total: formatEuro(finalPricing.total),
      email: formData.email,
      customer_name: formData.customer_name,
      request_id: emailData.request_id,
      checkout_id: emailData.checkout_id,
      checkout_url: checkout.checkout_url || '',
      payment_provider: 'Stripe',
      terms_accepted: formData.terms_accepted || 'true',
      terms_version: formData.terms_version || TERMS_VERSION,
      terms_accepted_at: formData.terms_accepted_at || '',
      cancellation_policy_summary: 'Custom order, delivery/import responsibility and cancellation policy accepted before payment.',
      checkout_evidence_id: requestId,
      checkout_evidence_body: checkoutEvidenceBody,
      evidence_mail_body: checkoutEvidenceBody,
      evidence_device_snapshot: checkoutEvidenceDeviceSnapshot(),
      terms_visible_text: CHECKOUT_TERMS_VISIBLE_TEXT,
      post_payment_evidence_pending: 'true'
    }));

    saveCart([]);
    return emailData;
  }

  function updateStripeCheckoutButtonLabel() {
    const button = document.getElementById('stripeCheckoutButton');
    if (!button || button.disabled) return;
    const lines = getLines();
    if (!lines.length) {
      button.textContent = 'Pay securely now';
      button.dataset.readyText = button.textContent;
      return;
    }
    const pricing = calculateLaunchOffer(lines);
    button.textContent = 'Pay securely now — ' + formatEuro(pricing.total);
    button.dataset.readyText = button.textContent;
  }

  function renderStripeCheckoutButton() {
    const button = document.getElementById('stripeCheckoutButton');
    if (!button || button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    updateStripeCheckoutButtonLabel();

    button.addEventListener('click', async () => {
      const originalText = button.dataset.readyText || button.textContent;
      push('stripe_checkout_attempt', { cart_count: cartCount(), payment_provider: 'stripe' });
      try {
        const context = getValidatedCartFormData();
        button.disabled = true;
        button.textContent = 'Creating Stripe checkout…';
        showCartStatus('ok', 'Creating secure Stripe card checkout…');

        const checkout = await createStripeCheckout(context.lines, context.formData);
        const emailData = await sendStripePreCheckoutEmails(context, checkout);

        push('stripe_payment_click', {
          request_id: emailData.request_id,
          checkout_id: checkout.checkout_id || checkout.stripe_session_id || '',
          cart_total: emailData.cart_total,
          cart_count: emailData.cart_count,
          payment_provider: 'stripe'
        });

        showCartStatus('ok', 'Redirecting to secure Stripe checkout…');
        window.location.href = checkout.checkout_url;
      } catch (err) {
        console.error(err);
        push('stripe_checkout_error', { error_message: (err && err.message) ? err.message : 'Stripe checkout could not be created', cart_count: cartCount(), payment_provider: 'stripe' });
        showCartStatus('err', err.message || 'Stripe checkout could not be created. Please contact Benda Custom Picks.');
        button.disabled = false;
        button.textContent = originalText || button.dataset.readyText || 'Pay securely now';
      }
    });
  }

  function products() {
    const map = window.BENDAGO_PRODUCTS || {};
    if (!map['ultra-single-seat-comfort']) {
      map['ultra-single-seat-comfort'] = {
        product_code: 'ultra-single-seat-comfort',
        product_name: 'Ultra Single Seat Comfort',
        product_short: 'Ultra single bobber comfort seat Napoleon 125/250',
        fitment: 'Benda Napoleon 125/250',
        price: '411 €',
        delivery_estimate: '10 to 15 business days',
        image: './ultra-single-seat-comfort-hero.webp',
        stripe_url: ''
      };
    }

    const napoleon450Fallbacks = {
      'double-seat-comfort-premium-plus': {
        product_code: 'double-seat-comfort-premium-plus',
        product_name: 'Kit Double Seat Comfort Premium +',
        product_short: 'Premium double-seat comfort kit for Benda Napoleon 450/500',
        fitment: 'Benda Napoleon 450/500',
        price: '683 €',
        delivery_estimate: '10 to 15 business days',
        image: './double-seat-comfort-premium-plus-hero.png',
        stripe_url: ''
      },
      'bumper-top-protect-450': {
        product_code: 'bumper-top-protect-450',
        product_name: 'Top Bumper Protection',
        product_short: 'Premium top-mounted protection bar for Benda Napoleon 450',
        fitment: 'Benda Napoleon 450',
        price: '459 €',
        delivery_estimate: '10 to 15 business days',
        image: './top-bumper-protection-450-hero.png',
        stripe_url: ''
      },
      'premium-rear-fender-450': {
        product_code: 'premium-rear-fender-450',
        product_name: 'Premium Rear Fender',
        product_short: 'Premium rear fender kit with rear shelf detail for Benda Napoleon 450',
        fitment: 'Benda Napoleon 450',
        price: '323 €',
        delivery_estimate: '10 to 15 business days',
        image: './premium-rear-fender-450-hero.png',
        stripe_url: ''
      },
      'maverick-air-filter-450': {
        product_code: 'maverick-air-filter-450',
        product_name: 'Maverick Air Filter',
        product_short: 'Premium turbine-style air filter upgrade for Benda Napoleon 450/500',
        fitment: 'Benda Napoleon 450/500',
        price: '391 €',
        delivery_estimate: '10 to 15 business days',
        image: './maverick-air-filter-450-hero.png',
        stripe_url: ''
      },
      'transparent-gold-clutch-cover-kit-450': {
        product_code: 'transparent-gold-clutch-cover-kit-450',
        product_name: 'Transparent Gold Clutch Cover Kit',
        product_short: 'Premium black-and-gold clutch cover kit for Benda Napoleon 450/500',
        fitment: 'Benda Napoleon 450/500',
        price: '871 €',
        delivery_estimate: '10 to 15 business days',
        image: './transparent-gold-clutch-cover-kit-450-hero.png',
        stripe_url: ''
      },
      'madmax-double-exhaust-kit-450': {
        product_code: 'madmax-double-exhaust-kit-450',
        product_name: 'Madmax Double Exhaust Kit',
        product_short: 'Madmax-style double exhaust kit for Benda Napoleon 450/500',
        fitment: 'Benda Napoleon 450/500',
        price: '910 €',
        delivery_estimate: '10 to 15 business days',
        image: './madmax-double-exhaust-kit-450-hero.png',
        stripe_url: ''
      },
      'premium-comfort-foot-kit-450': {
        product_code: 'premium-comfort-foot-kit-450',
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
      'headlight-windscreen-cover-kit-450': {
        product_code: 'headlight-windscreen-cover-kit-450',
        product_name: 'Headlight Windscreen Cover Kit',
        product_short: 'Gloss black headlight windscreen cover kit for Benda Napoleon 450/500',
        fitment: 'Benda Napoleon 450/500',
        price: '191 €',
        delivery_estimate: '10 to 15 business days',
        image: './headlight-windscreen-cover-kit-450-hero.png',
        stripe_url: ''
      },
      'premium-transparent-clutch-cover-kit-450': {
        product_code: 'premium-transparent-clutch-cover-kit-450',
        product_name: 'Premium Transparent Clutch Cover Kit',
        product_short: 'Premium transparent clutch cover kit for Benda Napoleon 450/500',
        fitment: 'Benda Napoleon 450/500',
        price: '471 €',
        delivery_estimate: '10 to 15 business days',
        image: './premium-transparent-clutch-cover-kit-450-hero.png',
        stripe_url: ''
      },
      'carbon-exhaust-protection-kit-450': {
        product_code: 'carbon-exhaust-protection-kit-450',
        product_name: 'Carbon Exhaust Protection Kit',
        product_short: 'Carbon-look exhaust heat shield kit for Benda Napoleon 450/500',
        fitment: 'Benda Napoleon 450/500',
        price: '271 €',
        delivery_estimate: '10 to 15 business days',
        image: './carbon-exhaust-protection-kit-450-hero.png',
        stripe_url: ''
      },
      'black-shield-armor-kit-450': {
        product_code: 'black-shield-armor-kit-450',
        product_name: 'Black Shield Armor Kit',
        product_short: 'Black fan heat shield armor kit for Benda Napoleon 450/500',
        fitment: 'Benda Napoleon 450/500',
        price: '271 €',
        delivery_estimate: '10 to 15 business days',
        image: './black-shield-armor-kit-450-hero.png',
        stripe_url: ''
      },
      'midnight-beast-kit-v4': {
        product_code: 'midnight-beast-kit-v4',
        product_name: 'Midnight Beast Kit',
        product_short: 'Complete rear wide wheel conversion kit for Benda Dark Flag V4 950',
        fitment: 'Benda Dark Flag V4 950',
        price: '4961 €',
        delivery_estimate: '10 to 15 business days',
        image: './midnight-beast-kit-v4-hero.png',
        stripe_url: ''
      },
      'midnight-hunter-tank-cover-kit-v4': {
        product_code: 'midnight-hunter-tank-cover-kit-v4',
        product_name: 'Midnight Hunter Tank Cover Kit',
        product_short: 'Complete central, left and right tank cover kit for Benda Dark Flag V4 950',
        fitment: 'Benda Dark Flag V4 950',
        price: '1604 €',
        delivery_estimate: '10 to 15 business days',
        image: './midnight-hunter-tank-cover-kit-v4-hero.png',
        stripe_url: ''
      },
      'tandem-kit-v4': {
        product_code: 'tandem-kit-v4',
        product_name: 'Tandem Kit',
        product_short: 'Foldable rider and passenger backrest kit for Benda Dark Flag V4 950',
        fitment: 'Benda Dark Flag V4 950',
        price: '861 €',
        delivery_estimate: '10 to 15 business days',
        image: './tandem-kit-v4-hero.png',
        stripe_url: ''
      }
    };

    Object.keys(napoleon450Fallbacks).forEach(code => {
      if (!map[code]) map[code] = napoleon450Fallbacks[code];
    });

    return map;
  }


  const PRODUCT_PAGE_MAP = {
    'decorative-cover-side': './order-decorative-cover-side.html',
    'maverick-air-filter-cover': './order-maverick-air-filter-cover.html',
    'black-striped-clutch-cover': './order-black-striped-clutch-cover.html',
    'gold-clutch-flywheel': './order-gold-clutch-flywheel.html',
    'transparent-clutch-cover': './order-transparent-clutch-cover.html',
    'future-led-light': './order-future-led-light.html',
    'matrix-design-head-light': './order-matrix-design-head-light.html',
    'tank-cover-support-volume': './order-tank-cover-support-volume.html',
    'closed-metal-hubcap-benda-samurai': './order-closed-metal-hubcap-benda-samurai.html',
    'rear-arch-luggage-rack': './order-rear-arch-luggage-rack.html',
    'metal-foot-controls': './order-metal-foot-controls.html',
    'black-foot-control-kit': './order-black-foot-control-kit.html',
    'double-seat-foot-peg-kit': './order-double-seat-foot-peg-kit.html',
    'premium-double-seat': './order-premium-double-seat.html',
    'ultra-single-seat-comfort': './order-ultra-single-seat-comfort.html',
    'rear-led-seat-comfort': './order-rear-led-seat-comfort.html',
    'brutal-rear-fender-kit': './order-brutal-rear-fender-kit.html',
    'gps-carplay': './order-gps-carplay.html',
    'chrome-engine-cover': './order-chrome-engine-cover.html',
    'rear-fender': './order-rear-fender.html',
    'left-side-bag-support': './order-left-side-bag-support.html',
    'left-premium-engine-cover': './order-left-premium-engine-cover.html',
    'dual-exhaust': './order-dual-exhaust.html',
    'right-engine-filter-cover': './order-right-engine-filter-cover.html',
    'handlebar-riser': './order-handlebar-riser.html',
    'fat-bob-bumper': './order-fat-bob-bumper.html',
    'top-bumper': './order-top-bumper.html',
    'chassis-protection': './order-chassis-protection.html',
    'headlight-fairing': './order-headlight-fairing.html',
    'double-seat-comfort-premium-plus': './order-kit-double-seat-comfort-premium-plus.html',
    'bumper-top-protect-450': './order-top-bumper-protection-450.html',
    'premium-rear-fender-450': './order-premium-rear-fender-450.html',
    'maverick-air-filter-450': './order-maverick-air-filter-450.html',
    'transparent-gold-clutch-cover-kit-450': './order-transparent-gold-clutch-cover-kit-450.html',
    'madmax-double-exhaust-kit-450': './order-madmax-double-exhaust-kit-450.html',
    'premium-comfort-foot-kit-450': './order-premium-comfort-foot-kit-450.html',
    'headlight-windscreen-cover-kit-450': './order-headlight-windscreen-cover-kit-450.html',
    'premium-transparent-clutch-cover-kit-450': './order-premium-transparent-clutch-cover-kit-450.html',
    'carbon-exhaust-protection-kit-450': './order-carbon-exhaust-protection-kit-450.html',
    'black-shield-armor-kit-450': './order-black-shield-armor-kit-450.html',
    'ghost-kit-transparent-clutch-cover-v4': './order-ghost-kit-transparent-clutch-cover-v4.html',
    'ghost-kit-maverick-air-filter-v4': './order-ghost-kit-maverick-air-filter-v4.html',
    'midnight-beast-kit-v4': './order-midnight-beast-kit-v4.html',
    'midnight-hunter-tank-cover-kit-v4': './order-midnight-hunter-tank-cover-kit-v4.html',
    'tandem-kit-v4': './order-tandem-kit-v4.html'
  };

  function productPageUrl(code) {
    return PRODUCT_PAGE_MAP[String(code || '').trim()] || './benda-napoleon-125-250-custom-parts.html#shop-part-by-part';
  }

  function getLines() {
    const map = products();
    return readCart().map(item => {
      const product = map[item.code];
      if (!product) return null;
      const qty = Math.max(1, Number(item.qty) || 1);
      const unit = euroToNumber(product.price);
      return { ...product, code: item.code, qty, color_option: optionLabel(item), line_total: unit * qty };
    }).filter(Boolean);
  }

  function cartCount() {
    return readCart().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  }


  function encodeSharedCart(cart) {
    const safeCart = (Array.isArray(cart) ? cart : []).map(item => ({
      code: String(item.code || '').trim(),
      qty: Math.max(1, Number(item.qty) || 1),
      color_option: cleanOption(item.color_option)
    })).filter(item => item.code);
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(safeCart))));
    } catch (e) {
      return '';
    }
  }

  function decodeSharedCart(value) {
    if (!value) return [];
    try {
      const decoded = decodeURIComponent(escape(atob(String(value))));
      const parsed = JSON.parse(decoded);
      if (!Array.isArray(parsed)) return [];
      const map = products();
      return parsed.map(item => ({
        code: String(item.code || '').trim(),
        qty: Math.max(1, Number(item.qty) || 1),
        color_option: cleanOption(item.color_option)
      })).filter(item => item.code && map[item.code]);
    } catch (e) {
      return [];
    }
  }

  function sharedCartUrl() {
    const payload = encodeSharedCart(readCart());
    const url = new URL(window.location.href);
    if (payload) url.searchParams.set('cart', payload);
    else url.searchParams.delete('cart');
    url.hash = '';
    return url.toString();
  }

  function loadSharedCartFromUrl() {
    const params = new URLSearchParams(window.location.search || '');
    const payload = params.get('cart');
    if (!payload) return false;
    const next = decodeSharedCart(payload);
    if (!next.length) return false;
    saveCart(next);
    push('shared_cart_loaded', { cart_count: cartCount() });
    try {
      params.delete('cart');
      const cleanUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (e) {}
    return true;
  }

  function itemKey(item) {
    return String(item.code || '') + '::' + optionLabel(item);
  }

  function setQty(key, qty) {
    const next = readCart().map(item => itemKey(item) === key ? { ...item, qty: Number(qty) } : item)
      .filter(item => item.qty > 0);
    saveCart(next);
  }

  function removeItem(key) {
    saveCart(readCart().filter(item => itemKey(item) !== key));
  }

  function clearCart() {
    saveCart([]);
  }

  function addToCart(code, qty = 1, options = {}) {
    const map = products();
    if (!code || !map[code]) return false;
    const colorOption = cleanOption(options.color_option);
    const cart = readCart();
    const existing = cart.find(item => item.code === code && optionLabel(item) === colorOption);
    if (existing) existing.qty += qty;
    else cart.push({ code, qty, color_option: colorOption });
    saveCart(cart);
    push('add_to_cart', {
      product_code: code,
      product_name: map[code].product_name,
      price: map[code].price,
      color_option: colorOption,
      cart_count: cartCount()
    });
    return true;
  }

  function upsertMany(items = []) {
    const map = products();
    const cart = readCart();
    let changed = 0;
    (Array.isArray(items) ? items : []).forEach(item => {
      const code = String(item && item.code || '').trim();
      if (!code || !map[code]) return;
      const colorOption = cleanOption(item.options && item.options.color_option);
      const existing = cart.find(line => line.code === code && optionLabel(line) === colorOption);
      if (existing) {
        existing.qty = Math.max(1, Number(existing.qty) || 1);
      } else {
        cart.push({ code, qty: 1, color_option: colorOption });
        changed += 1;
      }
    });
    saveCart(cart);
    push('cart_bundle_upsert', {
      inserted_count: changed,
      cart_count: cartCount()
    });
    return changed;
  }


  function ensureCartUxStyles() {
    if (document.getElementById('bcp-v84-cart-ux-fix')) return;
    const style = document.createElement('style');
    style.id = 'bcp-v84-cart-ux-fix';
    style.textContent = `
      .cart-overlay{position:fixed!important;inset:0!important;background:rgba(0,0,0,.58)!important;backdrop-filter:blur(8px)!important;opacity:0!important;pointer-events:none!important;transition:opacity .22s ease!important;z-index:9998!important;}
      .cart-overlay.active{opacity:1!important;pointer-events:auto!important;}
      .cart-drawer{position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:auto!important;width:min(500px,calc(100vw - 20px))!important;max-width:500px!important;display:flex!important;flex-direction:column!important;background:#090a0d!important;color:#fff!important;border-left:1px solid rgba(255,255,255,.14)!important;box-shadow:-28px 0 80px rgba(0,0,0,.55)!important;transform:translateX(110%)!important;transition:transform .25s ease!important;z-index:9999!important;overflow:hidden!important;}
      .cart-drawer.active{transform:translateX(0)!important;}
      .cart-head{flex:0 0 auto!important;padding:18px 18px 12px!important;border-bottom:1px solid rgba(255,255,255,.10)!important;}
      .cart-body{flex:1 1 auto!important;overflow-y:auto!important;overscroll-behavior:contain!important;padding:14px 18px!important;}
      .cart-footer{flex:0 0 auto!important;padding:14px 18px 18px!important;border-top:1px solid rgba(255,255,255,.10)!important;background:linear-gradient(180deg,rgba(9,10,13,.88),#090a0d)!important;}
      .cart-line{background:rgba(255,255,255,.045)!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:18px!important;padding:12px!important;}
      .cart-floating-btn,#bendagoCartButton{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}
      body.cart-drawer-open .cart-floating-btn{opacity:0!important;pointer-events:none!important;transform:translateY(8px) scale(.96)!important;}
      .order-cart-link,.cart-pill{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;min-height:38px!important;padding:0 13px!important;border-radius:999px!important;border:1px solid rgba(246,196,49,.38)!important;background:rgba(246,196,49,.11)!important;color:#f6c431!important;text-decoration:none!important;font-weight:950!important;white-space:nowrap!important;}
      .order-cart-link span,.cart-pill span{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:22px!important;height:22px!important;border-radius:999px!important;background:#f6c431!important;color:#100b04!important;font-size:.78rem!important;}
      @media (min-width:901px){.cart-floating-btn{display:none!important;}.cart-drawer{width:min(480px,36vw)!important;}}
      @media (max-width:900px){
        .cart-drawer{top:7px!important;right:7px!important;bottom:7px!important;width:calc(100vw - 14px)!important;max-width:none!important;border-left:1px solid rgba(255,255,255,.14)!important;border-radius:22px!important;}
        .cart-head{padding:14px 14px 10px!important;}
        .cart-head h2{font-size:1.15rem!important;margin:0 0 4px!important;}
        .cart-head p{font-size:.82rem!important;margin:0!important;}
        .cart-body{display:flex!important;flex-direction:row!important;gap:12px!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:x mandatory!important;-webkit-overflow-scrolling:touch!important;padding:14px!important;min-height:210px!important;}
        .cart-line{flex:0 0 min(82vw,340px)!important;scroll-snap-align:start!important;display:grid!important;grid-template-columns:96px minmax(0,1fr)!important;gap:10px!important;align-content:start!important;}
        .cart-line-media{width:96px!important;min-width:96px!important;height:96px!important;border-radius:14px!important;overflow:hidden!important;background:#05070b!important;}
        .cart-line-media img{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important;}
        .cart-footer{padding:12px 14px 14px!important;max-height:48vh!important;overflow-y:auto!important;}
        .cart-checkout-btn,.cart-share-btn{min-height:46px!important;border-radius:14px!important;}
        .cart-floating-btn,#bendagoCartButton{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}
      }
      @media (max-width:430px){.cart-line{flex-basis:86vw!important;grid-template-columns:88px minmax(0,1fr)!important}.cart-line-media{width:88px!important;min-width:88px!important;height:88px!important}.cart-footer{max-height:52vh!important}}
      /* BENDAGO V86 — dynamic no-floating header cart lock */
      .cart-floating-btn,#bendagoCartButton{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}
      .order-header-cart-link,.order-cart-link{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;min-height:34px!important;height:34px!important;padding:0 11px!important;border-radius:999px!important;border:1px solid rgba(217,184,117,.36)!important;background:linear-gradient(180deg,rgba(255,255,255,.052),rgba(255,255,255,.014)),rgba(7,9,13,.88)!important;color:rgba(247,241,232,.94)!important;text-decoration:none!important;font-size:.78rem!important;font-weight:950!important;box-shadow:none!important;white-space:nowrap!important;}
      .order-header-cart-link .cart-count-badge,.order-cart-link .cart-count-badge,.order-header-cart-link [data-cart-count],.order-cart-link [data-cart-count]{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:18px!important;height:18px!important;padding:0 5px!important;border-radius:999px!important;background:#d9b875!important;color:#0d0905!important;font-size:10px!important;font-weight:950!important;line-height:1!important;}
    `;
    document.head.appendChild(style);
  }

  function currentPartsHref() {
    const path = String(window.location.pathname || '').toLowerCase();
    if (path.includes('dark-flag') || path.includes('-v4')) return './benda-dark-flag-v4-custom-parts.html#shop-part-by-part';
    if (path.includes('450') || path.includes('500')) return './benda-napoleon-500-custom-parts.html#shop-part-by-part';
    return './benda-napoleon-125-250-custom-parts.html#shop-part-by-part';
  }

  function bindOpenCartLinks() {
    document.querySelectorAll('[data-open-cart]').forEach(link => {
      if (link.dataset.bcpCartBound === '1') return;
      link.dataset.bcpCartBound = '1';
      link.addEventListener('click', event => {
        event.preventDefault();
        ensureCartUi();
        openCart();
      });
    });
  }

  function ensureCartUi() {
    ensureCartUxStyles();
    if (document.getElementById('bendagoCartButton')) { bindOpenCartLinks(); return; }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'bendagoCartButton';
    btn.className = 'cart-floating-btn';
    btn.innerHTML = '<span class="cart-icon" aria-hidden="true">🛒</span><span class="cart-label">Cart</span><span class="cart-count-badge" data-cart-count>0</span>';
    btn.setAttribute('aria-label', 'Open cart');

    const overlay = document.createElement('div');
    overlay.id = 'bendagoCartOverlay';
    overlay.className = 'cart-overlay';

    const drawer = document.createElement('aside');
    drawer.id = 'bendagoCartDrawer';
    drawer.className = 'cart-drawer';
    drawer.setAttribute('aria-label', 'Benda Custom Picks cart');
    drawer.innerHTML = [
      '<div class="cart-head">',
      '<div><h2>Your cart</h2><p>Swipe selected products, then continue with secure checkout.</p></div>',
      '<button type="button" class="cart-close" data-cart-close aria-label="Close cart">×</button>',
      '</div>',
      '<div class="cart-body" data-cart-body></div>',
      '<div class="cart-footer">',
      '<div class="cart-pricing-block" data-cart-pricing><div class="cart-total-row"><span>Total</span><strong>0 €</strong></div></div>',
      '<div class="cart-note"><strong>Ready to pay securely.</strong><br>Fill your details once, then continue with secure Stripe card checkout. Delivery after payment: 10–15 business days. Local import duties/taxes may apply.</div>',
      '<a class="cart-checkout-btn disabled" data-cart-checkout href="./cart-request.html">Continue to secure payment</a>',
      '<button type="button" class="cart-share-btn" data-cart-share>Copy cart link</button>',
      '<div class="cart-secondary-actions">',
      '<button type="button" class="cart-clear-btn" data-cart-clear>Clear cart</button>',
      '<a class="cart-other-product-btn" href="' + currentPartsHref() + '" data-cart-other-product>Add another product</a>',
      '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(btn);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    btn.addEventListener('click', openCart);
    overlay.addEventListener('click', closeCart);
    drawer.querySelector('[data-cart-close]').addEventListener('click', closeCart);
    drawer.querySelector('[data-cart-clear]').addEventListener('click', () => {
      clearCart();
      renderCartDrawer();
    });

    drawer.querySelector('[data-cart-checkout]').addEventListener('click', () => {
      push('cart_checkout_click', { cart_count: cartCount() });
    });

    const shareBtn = drawer.querySelector('[data-cart-share]');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const originalText = shareBtn.textContent;
        if (!cartCount()) {
          shareBtn.textContent = 'Add a product first';
          window.setTimeout(() => { shareBtn.textContent = originalText; }, 1600);
          return;
        }
        const link = sharedCartUrl();
        let copied = false;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(link);
            copied = true;
          }
        } catch (e) {}
        if (!copied) {
          try {
            const temp = document.createElement('textarea');
            temp.value = link;
            temp.setAttribute('readonly', '');
            temp.style.position = 'fixed';
            temp.style.left = '-9999px';
            document.body.appendChild(temp);
            temp.select();
            copied = document.execCommand('copy');
            document.body.removeChild(temp);
          } catch (e) {}
        }
        shareBtn.textContent = copied ? 'Cart link copied' : 'Copy failed';
        if (copied) push('cart_share_link_copied', { cart_count: cartCount() });
        window.setTimeout(() => { shareBtn.textContent = originalText; }, 1800);
      });
    }

    const otherProductBtn = drawer.querySelector('[data-cart-other-product]');
    if (otherProductBtn) {
      otherProductBtn.addEventListener('click', () => {
        push('cart_add_another_product_click', { cart_count: cartCount() });
        closeCart();
      });
    }

    drawer.addEventListener('click', (event) => {
      const dec = event.target.closest('[data-cart-dec]');
      const inc = event.target.closest('[data-cart-inc]');
      const rem = event.target.closest('[data-cart-remove]');
      if (dec) {
        const key = dec.getAttribute('data-cart-dec');
        const item = readCart().find(x => itemKey(x) === key);
        if (item) setQty(key, (Number(item.qty) || 1) - 1);
      }
      if (inc) {
        const key = inc.getAttribute('data-cart-inc');
        const item = readCart().find(x => itemKey(x) === key);
        if (item) setQty(key, (Number(item.qty) || 1) + 1);
      }
      if (rem) removeItem(rem.getAttribute('data-cart-remove'));
      if (dec || inc || rem) renderCartDrawer();
    });

    renderCartDrawer();
  }

  function openCart() {
    ensureCartUi();
    renderCartDrawer();
    document.body.classList.add('cart-drawer-open');
    document.getElementById('bendagoCartOverlay')?.classList.add('active');
    document.getElementById('bendagoCartDrawer')?.classList.add('active');
  }

  function closeCart() {
    document.body.classList.remove('cart-drawer-open');
    document.getElementById('bendagoCartOverlay')?.classList.remove('active');
    document.getElementById('bendagoCartDrawer')?.classList.remove('active');
  }

  function renderCartDrawer() {
    const lines = getLines();
    const countEls = document.querySelectorAll('[data-cart-count]');
    countEls.forEach(el => { el.textContent = String(cartCount()); });
    const body = document.querySelector('[data-cart-body]');
    const pricingEl = document.querySelector('[data-cart-pricing]');
    const checkout = document.querySelector('[data-cart-checkout]');
    if (!body || !pricingEl || !checkout) return;

    const shareBtn = document.querySelector('[data-cart-share]');
    if (!lines.length) {
      body.innerHTML = '<div class="cart-empty">Your cart is empty. Open a product page and add one or several parts.</div>';
      pricingEl.innerHTML = '<div class="cart-total-row"><span>Total</span><strong>0 €</strong></div>';
      checkout.classList.add('disabled');
      if (shareBtn) shareBtn.disabled = false;
      return;
    }

    const pricing = calculateLaunchOffer(lines);
    body.innerHTML = lines.map(line => {
      const url = productPageUrl(line.code);
      return [
      '<div class="cart-line">',
      '<a class="cart-line-media" href="' + escapeHtml(url) + '" aria-label="View details for ' + escapeHtml(line.product_name) + '"><img src="' + (line.image || './standby-product-visual.png') + '" alt="' + escapeHtml(line.product_name) + '"></a>',
      '<div>',
      '<a class="cart-line-title" href="' + escapeHtml(url) + '">' + escapeHtml(line.product_name) + '</a>',
      '<a class="cart-line-details-link" href="' + escapeHtml(url) + '">View product details</a>',
      optionText(line) ? '<div class="cart-line-option">' + escapeHtml(optionText(line)) + '</div>' : '',
      '<div class="cart-line-price">' + escapeHtml(line.price) + '</div>',
      '<div class="cart-line-actions">',
      '<button class="cart-qty-btn" type="button" data-cart-dec="' + escapeHtml(itemKey(line)) + '">−</button>',
      '<strong>' + line.qty + '</strong>',
      '<button class="cart-qty-btn" type="button" data-cart-inc="' + escapeHtml(itemKey(line)) + '">+</button>',
      '<button class="cart-remove-btn" type="button" data-cart-remove="' + escapeHtml(itemKey(line)) + '">Remove</button>',
      '</div>',
      '</div>',
      '</div>'
      ].join('');
    }).join('');
    pricingEl.innerHTML = pricingHtml(pricing);
    checkout.classList.remove('disabled');
    if (shareBtn) shareBtn.disabled = false;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function renderCartSummary() {
    const box = document.getElementById('cartSummary');
    if (!box) return;
    const lines = getLines();
    if (!lines.length) {
      box.innerHTML = '<h2>Your cart is empty</h2><p>Go back to the parts list and choose at least one Benda Napoleon part.</p><a class="yellow-btn" href="./benda-napoleon-125-250-custom-parts.html#shop-part-by-part">Choose parts</a>';
      return;
    }
    const pricing = calculateLaunchOffer(lines);
    box.innerHTML = '<h2>Selected parts</h2>' + lines.map(line => {
      const url = productPageUrl(line.code);
      return '<div class="cart-summary-row"><span><a class="cart-summary-product-link" href="' + escapeHtml(url) + '">' + escapeHtml(line.product_name) + '</a> × ' + line.qty + (optionText(line) ? ' — ' + escapeHtml(optionText(line)) : '') + '</span><strong>' + formatEuro(line.line_total) + '</strong></div>';
    }).join('') + (pricing.discountApplied ? [
      '<div class="cart-summary-total cart-summary-subtotal"><span>Subtotal</span><strong>' + formatEuro(pricing.subtotal) + '</strong></div>',
      '<div class="cart-summary-total cart-summary-discount"><span>Launch Access 5%</span><strong>-' + formatEuro(pricing.discountAmount) + '</strong></div>',
      '<div class="cart-summary-total"><span>Total today</span><strong>' + formatEuro(pricing.total) + '</strong></div>',
      '<p class="cart-summary-launch-note">Launch Access applied: ' + escapeHtml(pricing.buildName) + '. No code needed.</p>'
    ].join('') : '<div class="cart-summary-total"><span>Total</span><strong>' + formatEuro(pricing.total) + '</strong></div>');
  }

  function bindCartForm() {
    const form = document.getElementById('cartRequestForm');
    if (!form) return;

    renderCartSummary();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';

      try {
        push('stripe_checkout_attempt', { cart_count: cartCount(), payment_provider: 'stripe', submit_source: 'cart_form' });
        const context = getValidatedCartFormData();
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Creating Stripe checkout…';
        }
        showCartStatus('ok', 'Creating secure Stripe card checkout…');

        const checkout = await createStripeCheckout(context.lines, context.formData);
        const emailData = await sendStripePreCheckoutEmails(context, checkout);

        push('stripe_payment_click', {
          request_id: emailData.request_id,
          checkout_id: checkout.checkout_id || checkout.stripe_session_id || '',
          cart_total: emailData.cart_total,
          cart_count: emailData.cart_count,
          payment_provider: 'stripe'
        });

        showCartStatus('ok', 'Redirecting to secure Stripe checkout…');
        window.location.href = checkout.checkout_url;
      } catch (err) {
        console.error(err);
        push('stripe_checkout_error', { error_message: (err && err.message) ? err.message : 'Stripe checkout could not be created', cart_count: cartCount(), payment_provider: 'stripe', submit_source: 'cart_form' });
        showCartStatus('err', err.message || 'Stripe checkout could not be created. Please contact Benda Custom Picks.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText || 'Continue to secure payment';
        }
      }
    });
  }

window.BendagoCart = {
    read: readCart,
    add: addToCart,
    upsertMany: upsertMany,
    open: openCart,
    render: renderCartDrawer,
    clear: clearCart,
    calculateLaunchOffer: calculateLaunchOffer
  };

  document.addEventListener('DOMContentLoaded', () => {
    const sharedCartLoaded = loadSharedCartFromUrl();
    ensureCartUi();
    bindOpenCartLinks();
    bindBuildBundleButtons();
    bindCartForm();
    renderStripeCheckoutButton();
    updateStripeCheckoutButtonLabel();
    if (sharedCartLoaded) openCart();
  });
  window.addEventListener('bendago:cart-updated', function () {
    renderCartDrawer();
    updateStripeCheckoutButtonLabel();
  });
})();
