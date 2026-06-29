// BENDAGO / Benda Custom Picks — Cloudflare Worker Stripe Checkout
// Version: V136 Fender identity split: original Brutal Rear Fender Kit restored; Metal Fender family uses dedicated SKUs and Brutal Bob uses Metal Minimalist
// Version: V21 all SKUs / Stripe-only / full builds + Midnight Beast Launch Access 5% + expanded Storm Rider 66 + Brutal Bob Black Foot Control
// Version: V149 paid product webhook: Stripe checkout email/address/phone confirmation after payment only
// Version: V155 worldwide Stripe Checkout allowed countries
// Version: V158 Build Access €2 + staged product-checkout enforcement via BUILD_ACCESS_ENFORCED
// Version: V160 private admin browser access via BUILD_ACCESS_ADMIN_KEY (no Stripe charge)
// Version: V181 direct Stripe Checkout from cart drawer; cart-request removed from product checkout flow
// Required Cloudflare secret: STRIPE_SECRET_KEY
// Optional variables: SUCCESS_URL, CANCEL_URL, ALLOWED_ORIGINS
// Build Access V137 additional requirements:
//   KV binding: BUILD_ACCESS_KV
//   Secrets: BUILD_ACCESS_TOKEN_SECRET, STRIPE_WEBHOOK_SECRET, BUILD_ACCESS_ADMIN_KEY
//   Optional variables: BUILD_ACCESS_SUCCESS_URL, BUILD_ACCESS_CANCEL_URL,
//   BUILD_ACCESS_TTL_SECONDS, BUILD_ACCESS_INTENT_TTL_SECONDS, BUILD_ACCESS_ADMIN_TTL_SECONDS, WEBHOOK_TOLERANCE_SECONDS

const CURRENCY = 'eur';
const LAUNCH_DISCOUNT_RATE = 0.05;
const TERMS_VERSION = 'BCP-CGV-2026-06-09-ORDERLOCK';
const DEFAULT_SUCCESS_URL = 'https://bendacustompicks.com/thank-you.html?payment=stripe_success&session_id={CHECKOUT_SESSION_ID}';
const DEFAULT_CANCEL_URL = 'https://bendacustompicks.com/?payment=stripe_cancelled';
const DEFAULT_ALLOWED_ORIGINS = [
  'https://bendacustompicks.com',
  'https://www.bendacustompicks.com',
  'https://custom125picks.github.io'
];

// Build Access V137 — one-off full catalog access for all three Benda universes.
const BUILD_ACCESS_AMOUNT_CENTS = 200;
const BUILD_ACCESS_PRODUCT_NAME = 'Benda Custom Picks — Full Catalog Access (30 days)';
const BUILD_ACCESS_PRODUCT_DESCRIPTION = 'One-off access to the full Benda catalog across Napoleon 125/250, Napoleon 450/500 and Dark Flag V4.';
const DEFAULT_BUILD_ACCESS_SUCCESS_URL = 'https://bendacustompicks.com/build-access-return.html?session_id={CHECKOUT_SESSION_ID}';
const DEFAULT_BUILD_ACCESS_CANCEL_URL = 'https://bendacustompicks.com/build-access.html?payment=stripe_cancelled';
const DEFAULT_BUILD_ACCESS_TTL_SECONDS = 60 * 60 * 24 * 30;
const DEFAULT_BUILD_ACCESS_INTENT_TTL_SECONDS = 60 * 60 * 2;
const DEFAULT_WEBHOOK_TOLERANCE_SECONDS = 60 * 5;
const BUILD_ACCESS_COOKIE = 'bcp_build_access';
const BUILD_ACCESS_INTENT_COOKIE = 'bcp_build_access_intent';
const BUILD_ACCESS_ADMIN_COOKIE = 'bcp_build_access_admin';
const BUILD_ACCESS_RECORD_PREFIX = 'build-access:session:';
const BUILD_ACCESS_INTENT_PREFIX = 'build-access:intent:';
const BUILD_ACCESS_ADMIN_RECORD_PREFIX = 'build-access:admin:';
const DEFAULT_BUILD_ACCESS_ADMIN_TTL_SECONDS = 60 * 60 * 24 * 365;
// V158 safety switch: deploy false, test the paid access path, then set Cloudflare variable BUILD_ACCESS_ENFORCED=true.
const DEFAULT_BUILD_ACCESS_ENFORCED = false;

// V149 — paid product orders. EmailJS is called from the signed Stripe webhook only.
const PRODUCT_ORDER_RECORD_PREFIX = 'product-order:session:';
const EMAILJS_SEND_URL = 'https://api.emailjs.com/api/v1.0/email/send';
const DEFAULT_EMAILJS_CONFIG = Object.freeze({
  publicKey: 'DbupZPmtwVCiRtqVB',
  serviceId: 'service_o8p5iha',
  adminTemplateId: 'template_58pf9k5',
  clientTemplateId: 'template_kur9869'
});
const PRODUCT_ORDER_EMAIL_DELAY_MS = 1100;

// V155 — worldwide Stripe shipping: complete current Stripe Checkout allowed_countries enum.
const STRIPE_WORLDWIDE_SHIPPING_COUNTRIES = Object.freeze([
  'AC',
  'AD',
  'AE',
  'AF',
  'AG',
  'AI',
  'AL',
  'AM',
  'AO',
  'AQ',
  'AR',
  'AT',
  'AU',
  'AW',
  'AX',
  'AZ',
  'BA',
  'BB',
  'BD',
  'BE',
  'BF',
  'BG',
  'BH',
  'BI',
  'BJ',
  'BL',
  'BM',
  'BN',
  'BO',
  'BQ',
  'BR',
  'BS',
  'BT',
  'BV',
  'BW',
  'BY',
  'BZ',
  'CA',
  'CD',
  'CF',
  'CG',
  'CH',
  'CI',
  'CK',
  'CL',
  'CM',
  'CN',
  'CO',
  'CR',
  'CV',
  'CW',
  'CY',
  'CZ',
  'DE',
  'DJ',
  'DK',
  'DM',
  'DO',
  'DZ',
  'EC',
  'EE',
  'EG',
  'EH',
  'ER',
  'ES',
  'ET',
  'FI',
  'FJ',
  'FK',
  'FO',
  'FR',
  'GA',
  'GB',
  'GD',
  'GE',
  'GF',
  'GG',
  'GH',
  'GI',
  'GL',
  'GM',
  'GN',
  'GP',
  'GQ',
  'GR',
  'GS',
  'GT',
  'GU',
  'GW',
  'GY',
  'HK',
  'HN',
  'HR',
  'HT',
  'HU',
  'ID',
  'IE',
  'IL',
  'IM',
  'IN',
  'IO',
  'IQ',
  'IS',
  'IT',
  'JE',
  'JM',
  'JO',
  'JP',
  'KE',
  'KG',
  'KH',
  'KI',
  'KM',
  'KN',
  'KR',
  'KW',
  'KY',
  'KZ',
  'LA',
  'LB',
  'LC',
  'LI',
  'LK',
  'LR',
  'LS',
  'LT',
  'LU',
  'LV',
  'LY',
  'MA',
  'MC',
  'MD',
  'ME',
  'MF',
  'MG',
  'MK',
  'ML',
  'MM',
  'MN',
  'MO',
  'MQ',
  'MR',
  'MS',
  'MT',
  'MU',
  'MV',
  'MW',
  'MX',
  'MY',
  'MZ',
  'NA',
  'NC',
  'NE',
  'NG',
  'NI',
  'NL',
  'NO',
  'NP',
  'NR',
  'NU',
  'NZ',
  'OM',
  'PA',
  'PE',
  'PF',
  'PG',
  'PH',
  'PK',
  'PL',
  'PM',
  'PN',
  'PR',
  'PS',
  'PT',
  'PY',
  'QA',
  'RE',
  'RO',
  'RS',
  'RU',
  'RW',
  'SA',
  'SB',
  'SC',
  'SD',
  'SE',
  'SG',
  'SH',
  'SI',
  'SJ',
  'SK',
  'SL',
  'SM',
  'SN',
  'SO',
  'SR',
  'SS',
  'ST',
  'SV',
  'SX',
  'SZ',
  'TA',
  'TC',
  'TD',
  'TF',
  'TG',
  'TH',
  'TJ',
  'TK',
  'TL',
  'TM',
  'TN',
  'TO',
  'TR',
  'TT',
  'TV',
  'TW',
  'TZ',
  'UA',
  'UG',
  'US',
  'UY',
  'UZ',
  'VA',
  'VC',
  'VE',
  'VG',
  'VN',
  'VU',
  'WF',
  'WS',
  'XK',
  'YE',
  'YT',
  'ZA',
  'ZM',
  'ZW',
  'ZZ',
]);

const PRODUCT_CATALOG = {
  // Napoleon 125/250
  'maverick-air-filter-cover': { name: 'Maverick Air Filter Cover', amount: 20485 },
  'decorative-cover-side': { name: 'Decorative Cover Side', amount: 13855 },
  'black-ribbed-clutch-cover': { name: 'Black Ribbed Clutch Cover', amount: 22015 },
  'gold-clutch-inner-accent': { name: 'Gold Clutch Inner Accent', amount: 24565 },
  'clear-clutch-window-cover': { name: 'Clear Clutch Window Cover', amount: 24565 },
  'future-front-light-upgrade': { name: 'Future Front Light Upgrade', amount: 24565 },
  'matrix-design-head-light': { name: 'MatriX Design Head Light', amount: 15640 },
  'tank-volume-cover': { name: 'Tank Volume Cover', amount: 24565 },
  'samurai-wheel-cover': { name: 'Samurai Wheel Cover', amount: 27965 },
  'rear-arch-support-rack': { name: 'Rear Arch Support Rack', amount: 27285 },
  'bronze-foot-control-kit': { name: 'Bronze Foot Control Kit', amount: 38165 },
  'black-foot-control-kit': { name: 'Black Foot Control Kit', amount: 38165 },
  'comfort-seat-foot-peg-kit': { name: 'Comfort Seat & Foot Peg Kit', amount: 61965 },
  'premium-comfort-double-seat': { name: 'Premium Comfort Double Seat', amount: 81685 },
  'ultra-single-seat-comfort': { name: 'Ultra Single Seat Comfort', amount: 34935 },
  'brutal-rear-fender-kit': { name: 'Brutal Rear Fender Kit', amount: 24650 },
  'brutal-rear-metal-fender-minimalist': { name: 'Brutal Rear Metal Fender', amount: 63700 },
  'brutal-rear-metal-fender-fixed-rack': { name: 'Brutal Rear Metal Fender', amount: 69100 },
  'brutal-rear-metal-fender-separate-rack': { name: 'Brutal Rear Metal Fender', amount: 69100 },
  'gps-carplay-screen': { name: 'GPS / CarPlay Screen', amount: 13515 },
  'chrome-air-side-cover': { name: 'Chrome Air Side Cover', amount: 33065 },
  'rear-clean-fender-kit': { name: 'Rear Clean Fender Kit', amount: 36465 },
  'left-side-travel-bag-kit': { name: 'Left Side Travel Bag Kit', amount: 29665 },
  'premium-left-engine-cover': { name: 'Premium Left Engine Cover', amount: 33915 },
  'dual-exhaust-custom-kit': { name: 'Dual Exhaust Custom Kit', amount: 63665 },
  'right-engine-side-cover': { name: 'Right Engine Side Cover', amount: 21165 },
  'comfort-handlebar-riser-kit': { name: 'Comfort Handlebar Riser Kit', amount: 30515 },
  'fat-bob-front-bumper-kit': { name: 'Fat Bob Front Bumper Kit', amount: 44285 },
  'top-bumper': { name: 'Top Bumper', amount: 35530 },
  'lower-chassis-protection-plate': { name: 'Lower Chassis Protection Plate', amount: 38165 },
  'front-fairing-style-kit': { name: 'Front Fairing Style Kit', amount: 16915 },
  'rear-led-seat-comfort-plus': { name: 'Rear LED Seat Comfort +', amount: 45730 },
  'cafe-holder-napoleon-125-250': { name: 'Café Holder', amount: 9100 },
  'ghost-metal-cover-napoleon-125-250': { name: 'Ghost Metal Cover', amount: 14280 },

  // Napoleon 450/500
  'double-seat-comfort-premium-plus': { name: 'Kit Double Seat Comfort Premium +', amount: 58055 },
  'bumper-top-protect-450': { name: 'Top Bumper Protection', amount: 39015 },
  'premium-rear-fender-450': { name: 'Premium Rear Fender', amount: 27455 },
  'maverick-air-filter-450': { name: 'Maverick Air Filter', amount: 33235 },
  'transparent-gold-clutch-cover-kit-450': { name: 'Transparent Gold Clutch Cover Kit', amount: 74035 },
  'madmax-double-exhaust-kit-450': { name: 'Madmax Double Exhaust Kit', amount: 77350 },
  'premium-comfort-foot-kit-450': { name: 'Premium Comfort Foot Kit', amount: 23035 },
  'headlight-windscreen-cover-kit-450': { name: 'Headlight Windscreen Cover Kit', amount: 16235 },
  'premium-transparent-clutch-cover-kit-450': { name: 'Premium Transparent Clutch Cover Kit', amount: 40035 },
  'carbon-exhaust-protection-kit-450': { name: 'Carbon Exhaust Protection Kit', amount: 23035 },
  'black-shield-armor-kit-450': { name: 'Black Shield Armor Kit', amount: 23035 },

  'chrome-air-filter-450-500-sr66': { name: 'Chrome Air Filter', amount: 34510 },
  'black-night-clutch-cover-450-500-sr66': { name: 'Black Night Clutch Cover', amount: 15130 },
  'brutal-storm-exhaust-450-500-sr66': { name: 'Brutal Storm Exhaust', amount: 180600 },

  // Dark Flag V4 / Darkflag
  'ghost-kit-maverick-air-filter-v4': { name: 'Ghost Kit | Maverick Air Filter', amount: 34935 },
  'ghost-kit-transparent-clutch-cover-v4': { name: 'Ghost Kit | Transparent Clutch Cover', amount: 40885 },
  'midnight-beast-kit-v4': { name: 'Midnight Beast Kit', amount: 421685 },
  'midnight-hunter-tank-cover-kit-v4': { name: 'Midnight Hunter Tank Cover Kit', amount: 136340 },
  'tandem-kit-v4': { name: 'Tandem Kit', amount: 73185 },
  'aircraft-metal-cover-v4': { name: 'Aircraft Metal Cover', amount: 10880 },
  'ghost-metal-cover-v4': { name: 'Ghost Metal Cover', amount: 14280 },
  'ghost-aluminium-cnc-chain-cover-left-v4': { name: 'Ghost Aluminium CNC Chain Cover Left', amount: 25670 },
  'transparent-air-filter-cover-aluminium-v4': { name: 'Transparent Air Filter Cover Aluminium', amount: 24990 },
  'transparent-air-filter-cover-filter-only-v4': { name: 'Filter Only — Transparent Air Filter Cover', amount: 9180 },
  'ghost-exhaust-heat-shield-v4': { name: 'Ghost Exhaust Heat Shield', amount: 15385 },
  'aluminum-front-fork-protector-darkflag-500-v4': { name: 'Aluminum Front Fork Protector Darkflag 500', amount: 40715 },
  'ghost-protector-darkflag-950-v4': { name: 'Ghost Protector Darkflag 950', amount: 37485 }
};

const SKU_ALIASES = {
  'black-striped-clutch-cover': 'black-ribbed-clutch-cover',
  'gold-clutch-flywheel': 'gold-clutch-inner-accent',
  'transparent-clutch-cover': 'clear-clutch-window-cover',
  'future-led-light': 'future-front-light-upgrade',
  'tank-cover-support-volume': 'tank-volume-cover',
  'closed-metal-hubcap-benda-samurai': 'samurai-wheel-cover',
  'rear-arch-luggage-rack': 'rear-arch-support-rack',
  'metal-foot-controls': 'bronze-foot-control-kit',
  'double-seat-foot-peg-kit': 'comfort-seat-foot-peg-kit',
  'premium-double-seat': 'premium-comfort-double-seat',
  'rear-led-seat-comfort': 'rear-led-seat-comfort-plus',
  'gps-carplay': 'gps-carplay-screen',
  'chrome-engine-cover': 'chrome-air-side-cover',
  'rear-fender': 'rear-clean-fender-kit',
  'left-side-bag-support': 'left-side-travel-bag-kit',
  'left-premium-engine-cover': 'premium-left-engine-cover',
  'dual-exhaust': 'dual-exhaust-custom-kit',
  'right-engine-filter-cover': 'right-engine-side-cover',
  'handlebar-riser': 'comfort-handlebar-riser-kit',
  'fat-bob-bumper': 'fat-bob-front-bumper-kit',
  'chassis-protection': 'lower-chassis-protection-plate',
  'headlight-fairing': 'front-fairing-style-kit',
  'top-bumper-protection-450': 'bumper-top-protect-450'
};

const COMPLETE_BUILD_RULES = [
  {
    key: 'strong-pure-bob',
    name: 'Strong Pure Bob Complete Build',
    skus: [
      'front-fairing-style-kit',
      'lower-chassis-protection-plate',
      'top-bumper',
      'rear-clean-fender-kit',
      'tank-volume-cover',
      'premium-comfort-double-seat',
      'premium-left-engine-cover',
      'bronze-foot-control-kit'
    ]
  },
  {
    key: 'headlight-fairing',
    name: 'Headlight Fairing Complete Build',
    skus: [
      'future-front-light-upgrade',
      'lower-chassis-protection-plate',
      'top-bumper',
      'black-ribbed-clutch-cover',
      'chrome-air-side-cover',
      'tank-volume-cover',
      'premium-comfort-double-seat',
      'black-foot-control-kit'
    ]
  },
  {
    key: 'black-fat-bob',
    name: 'Brutal Bob Complete Build',
    skus: [
      'right-engine-side-cover',
      'comfort-handlebar-riser-kit',
      'clear-clutch-window-cover',
      'gold-clutch-inner-accent',
      'comfort-seat-foot-peg-kit',
      'brutal-rear-metal-fender-minimalist',
      'samurai-wheel-cover',
      'dual-exhaust-custom-kit',
      'black-foot-control-kit'
    ]
  },
  {
    key: 'brutal-bob',
    name: 'Brutal Bob Complete Build',
    alias_of: 'black-fat-bob',
    skus: [
      'right-engine-side-cover',
      'comfort-handlebar-riser-kit',
      'clear-clutch-window-cover',
      'gold-clutch-inner-accent',
      'comfort-seat-foot-peg-kit',
      'brutal-rear-metal-fender-minimalist',
      'samurai-wheel-cover',
      'dual-exhaust-custom-kit',
      'black-foot-control-kit'
    ]
  },
  {
    key: 'blackout-predator',
    name: 'Blackout Predator Complete Build',
    skus: [
      'dual-exhaust-custom-kit',
      'maverick-air-filter-cover',
      'ghost-metal-cover-napoleon-125-250',
      'front-fairing-style-kit',
      'black-foot-control-kit',
      'tank-volume-cover',
      'premium-comfort-double-seat'
    ]
  },
  {
    key: 'storm-rider-66',
    name: 'Storm Rider 66 Complete Build',
    skus: [
      'chrome-air-filter-450-500-sr66',
      'black-night-clutch-cover-450-500-sr66',
      'brutal-storm-exhaust-450-500-sr66',
      'premium-comfort-foot-kit-450'
    ]
  },
  {
    key: 'shadow-beast-v4',
    name: 'Shadow Monster Bike Complete Build',
    skus: [
      'ghost-kit-maverick-air-filter-v4',
      'ghost-kit-transparent-clutch-cover-v4',
      'aircraft-metal-cover-v4',
      'ghost-metal-cover-v4',
      'ghost-aluminium-cnc-chain-cover-left-v4',
      'midnight-hunter-tank-cover-kit-v4'
    ]
  },
  {
    key: 'shadow-monster-bike',
    name: 'Shadow Monster Bike Complete Build',
    alias_of: 'shadow-beast-v4',
    skus: [
      'ghost-kit-maverick-air-filter-v4',
      'ghost-kit-transparent-clutch-cover-v4',
      'aircraft-metal-cover-v4',
      'ghost-metal-cover-v4',
      'ghost-aluminium-cnc-chain-cover-left-v4',
      'midnight-hunter-tank-cover-kit-v4'
    ]
  },
  {
    key: 'midnight-hunter',
    name: 'Midnight Hunter Complete Build',
    skus: [
      'madmax-double-exhaust-kit-450',
      'maverick-air-filter-450',
      'premium-comfort-foot-kit-450',
      'premium-transparent-clutch-cover-kit-450',
      'carbon-exhaust-protection-kit-450',
      'black-shield-armor-kit-450'
    ]
  }
];

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    // The Worker runs on bendacustompicks.com/api/* for first-party signed cookies,
    // while direct workers.dev calls remain supported for controlled testing.
    const pathname = url.pathname.startsWith('/api/') ? url.pathname.slice(4) : url.pathname;

    try {
      // Stripe webhooks use Stripe-Signature verification and never need browser CORS.
      if (request.method === 'POST' && pathname === '/stripe/webhook') {
        return await handleStripeWebhook(request, env);
      }

      // Build Access endpoints are additive. Existing product checkout remains untouched below.
      if (request.method === 'POST' && pathname === '/build-access/create-checkout-session') {
        return await createBuildAccessCheckout(request, env, cors);
      }

      if (request.method === 'GET' && pathname === '/build-access/confirm') {
        return await confirmBuildAccess(request, env, cors, url);
      }

      if (request.method === 'POST' && pathname === '/build-access/admin/grant') {
        return await grantAdminBuildAccess(request, env, cors);
      }

      if (request.method === 'GET' && (pathname === '/build-access/status' || pathname === '/build-access/authorize')) {
        return await getBuildAccessStatus(request, env, cors);
      }

      if (request.method === 'POST' && pathname === '/build-access/logout') {
        return await logoutBuildAccess(env, cors);
      }

      if (request.method === 'GET' && pathname === '/') {
        return json({
          ok: true,
          stripe: Boolean(env.STRIPE_SECRET_KEY),
          currency: CURRENCY,
          sku_count: Object.keys(PRODUCT_CATALOG).length,
          launch_discount_rate: LAUNCH_DISCOUNT_RATE,
          build_access_ready: Boolean(env.BUILD_ACCESS_KV && env.BUILD_ACCESS_TOKEN_SECRET && env.STRIPE_WEBHOOK_SECRET),
          build_access_admin_ready: Boolean(env.BUILD_ACCESS_KV && env.BUILD_ACCESS_TOKEN_SECRET && env.BUILD_ACCESS_ADMIN_KEY),
          build_access_enforced: buildAccessEnforced(env)
        }, 200, cors);
      }

      if (request.method === 'POST' && pathname === '/stripe/create-checkout-session') {
        return await createStripeCheckout(request, env, cors);
      }

      return json({ ok: false, error: 'Not found' }, 404, cors);
    } catch (error) {
      return json({
        ok: false,
        error: error && error.message ? error.message : String(error)
      }, 500, cors);
    }
  }
};


async function createBuildAccessCheckout(request, env, cors) {
  requireBuildAccessConfig(env);

  const body = await readJson(request);
  const sourcePage = cleanRelativePath(body.source_page || '/', 180);
  const sourceBuildKey = cleanText(body.source_build_key || '', 80);
  const sourceBuildName = cleanText(body.source_build_name || '', 120);
  const intentId = crypto.randomUUID();
  const intentTtl = accessIntentTtlSeconds(env);
  const now = unixNow();

  const intent = {
    version: 1,
    intent_id: intentId,
    created_at: now,
    expires_at: now + intentTtl,
    source_page: sourcePage,
    source_build_key: sourceBuildKey,
    source_build_name: sourceBuildName,
    stripe_session_id: '',
    status: 'created'
  };

  await putBuildAccessIntent(env, intent, intentTtl);

  const successUrl = buildAccessSuccessUrl(env);
  const cancelUrl = buildAccessCancelUrl(env);
  const params = [
    ['mode', 'payment'],
    ['success_url', successUrl],
    ['cancel_url', cancelUrl],
    ['customer_creation', 'always'],
    ['payment_method_types[0]', 'card'],
    ['metadata[purchase_type]', 'build_access'],
    ['metadata[build_access_intent_id]', intentId],
    ['metadata[source_page]', sourcePage],
    ['metadata[source_build_key]', sourceBuildKey],
    ['metadata[source_build_name]', sourceBuildName],
    ['line_items[0][quantity]', '1'],
    ['line_items[0][price_data][currency]', CURRENCY],
    ['line_items[0][price_data][unit_amount]', String(BUILD_ACCESS_AMOUNT_CENTS)],
    ['line_items[0][price_data][product_data][name]', BUILD_ACCESS_PRODUCT_NAME],
    ['line_items[0][price_data][product_data][description]', BUILD_ACCESS_PRODUCT_DESCRIPTION]
  ];

  const session = await stripePost('/v1/checkout/sessions', env.STRIPE_SECRET_KEY, params);
  intent.stripe_session_id = cleanStripeSessionId(session.id);
  intent.status = 'checkout_created';
  await putBuildAccessIntent(env, intent, intentTtl);

  const intentCookie = await makeSignedCookieValue(intentId, now + intentTtl, env.BUILD_ACCESS_TOKEN_SECRET, 'intent');
  const headers = withCors(cors, {
    'Set-Cookie': serializeCookie(BUILD_ACCESS_INTENT_COOKIE, intentCookie, {
      maxAge: intentTtl,
      httpOnly: true,
      sameSite: 'Lax'
    })
  });

  return json({
    ok: true,
    checkout_url: session.url,
    stripe_session_id: session.id,
    product: 'build_access',
    access_price_eur: centsToEuro(BUILD_ACCESS_AMOUNT_CENTS),
    source_page: sourcePage,
    source_build_key: sourceBuildKey,
    source_build_name: sourceBuildName
  }, 200, headers);
}

async function confirmBuildAccess(request, env, cors, url) {
  requireBuildAccessConfig(env);

  const sessionId = cleanStripeSessionId(url.searchParams.get('session_id') || '');
  if (!sessionId) return buildAccessDenied(cors, 'Invalid Stripe session.');

  const intentId = await readSignedCookie(request, BUILD_ACCESS_INTENT_COOKIE, env.BUILD_ACCESS_TOKEN_SECRET, 'intent');
  if (!intentId) return buildAccessDenied(cors, 'This checkout return is not linked to the browser that started payment.');

  const intent = await getBuildAccessIntent(env, intentId);
  if (!intent || intent.expires_at <= unixNow()) return buildAccessDenied(cors, 'This checkout return has expired.');
  if (intent.stripe_session_id && intent.stripe_session_id !== sessionId) return buildAccessDenied(cors, 'Checkout session mismatch.');

  const session = await stripeGet('/v1/checkout/sessions/' + encodeURIComponent(sessionId), env.STRIPE_SECRET_KEY);
  if (!isPaidBuildAccessSession(session)) return buildAccessDenied(cors, 'Payment is not confirmed yet.');
  if (cleanText(session.metadata && session.metadata.build_access_intent_id, 120) !== intentId) {
    return buildAccessDenied(cors, 'Checkout intent mismatch.');
  }

  const entitlement = await grantBuildAccessFromSession(session, env);
  const expiresAt = entitlement.expires_at;
  const accessCookie = await makeSignedCookieValue(sessionId, expiresAt, env.BUILD_ACCESS_TOKEN_SECRET, 'access');
  return jsonWithSetCookies({
    ok: true,
    access: 'granted',
    product: 'build_access',
    access_price_eur: centsToEuro(BUILD_ACCESS_AMOUNT_CENTS),
    expires_at: expiresAt,
    source_page: entitlement.source_page || '',
    source_build_key: entitlement.source_build_key || '',
    source_build_name: entitlement.source_build_name || ''
  }, 200, cors, [
    serializeCookie(BUILD_ACCESS_COOKIE, accessCookie, {
      maxAge: Math.max(1, expiresAt - unixNow()),
      httpOnly: true,
      sameSite: 'Lax'
    }),
    clearCookie(BUILD_ACCESS_INTENT_COOKIE)
  ]);
}

async function grantAdminBuildAccess(request, env, cors) {
  requireBuildAccessAdminConfig(env);

  const body = await readJson(request);
  const submittedKey = String(body.admin_key || '');
  const expectedKey = String(env.BUILD_ACCESS_ADMIN_KEY || '');
  if (!submittedKey || !expectedKey || !timingSafeEqual(submittedKey, expectedKey)) {
    return json({ ok: false, error: 'Private access could not be granted.' }, 401, cors);
  }

  const now = unixNow();
  const ttl = buildAccessAdminTtlSeconds(env);
  const adminId = 'adm_' + crypto.randomUUID();
  const record = {
    version: 1,
    status: 'admin',
    product: 'build_access',
    access_type: 'admin',
    admin_id: adminId,
    granted_at: now,
    expires_at: now + ttl,
    updated_at: now
  };

  await putBuildAccessAdminRecord(env, record, ttl);
  const accessCookie = await makeSignedCookieValue(adminId, record.expires_at, env.BUILD_ACCESS_TOKEN_SECRET, 'admin');
  return jsonWithSetCookies({
    ok: true,
    access: 'granted',
    access_type: 'admin',
    product: 'build_access',
    expires_at: record.expires_at
  }, 200, cors, [
    serializeCookie(BUILD_ACCESS_ADMIN_COOKIE, accessCookie, {
      maxAge: Math.max(1, record.expires_at - unixNow()),
      httpOnly: true,
      sameSite: 'Lax'
    })
  ]);
}

async function getValidBuildAccessEntitlement(request, env) {
  const sessionId = await readSignedCookie(request, BUILD_ACCESS_COOKIE, env.BUILD_ACCESS_TOKEN_SECRET, 'access');
  if (sessionId) {
    const paidEntitlement = await getBuildAccessRecord(env, sessionId);
    if (paidEntitlement && paidEntitlement.status === 'paid' && paidEntitlement.expires_at > unixNow()) {
      return { entitlement: paidEntitlement, access_type: 'paid' };
    }
  }

  const adminId = await readSignedCookie(request, BUILD_ACCESS_ADMIN_COOKIE, env.BUILD_ACCESS_TOKEN_SECRET, 'admin');
  if (adminId) {
    const adminEntitlement = await getBuildAccessAdminRecord(env, adminId);
    if (adminEntitlement && adminEntitlement.status === 'admin' && adminEntitlement.expires_at > unixNow()) {
      return { entitlement: adminEntitlement, access_type: 'admin' };
    }
  }

  return null;
}

async function getBuildAccessStatus(request, env, cors) {
  requireBuildAccessConfig(env);

  const access = await getValidBuildAccessEntitlement(request, env);
  if (!access) return buildAccessDenied(cors, 'Build Access required.');

  const entitlement = access.entitlement;
  return json({
    ok: true,
    access: 'granted',
    access_type: access.access_type,
    product: 'build_access',
    access_price_eur: access.access_type === 'admin' ? 0 : centsToEuro(BUILD_ACCESS_AMOUNT_CENTS),
    expires_at: entitlement.expires_at,
    source_page: entitlement.source_page || '',
    source_build_key: entitlement.source_build_key || '',
    source_build_name: entitlement.source_build_name || ''
  }, 200, cors);
}

async function logoutBuildAccess(env, cors) {
  requireBuildAccessConfig(env);
  return jsonWithSetCookies({ ok: true, access: 'cleared' }, 200, cors, [
    clearCookie(BUILD_ACCESS_COOKIE),
    clearCookie(BUILD_ACCESS_ADMIN_COOKIE),
    clearCookie(BUILD_ACCESS_INTENT_COOKIE)
  ]);
}

async function handleStripeWebhook(request, env) {
  requireStripeWebhookConfig(env);

  const signature = request.headers.get('Stripe-Signature') || '';
  const payload = await request.text();
  const verified = await verifyStripeWebhookSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET, webhookToleranceSeconds(env));
  if (!verified) return new Response(JSON.stringify({ ok: false, error: 'Invalid Stripe webhook signature' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });

  let event;
  try {
    event = JSON.parse(payload);
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid webhook JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  const session = event && event.data && event.data.object;
  const paidEvent = event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded';

  if (paidEvent && isPaidBuildAccessSession(session)) {
    requireBuildAccessConfig(env);
    await grantBuildAccessFromSession(session, env);
  }

  if (paidEvent && isPaidProductOrderSession(session)) {
    await fulfillPaidProductOrder(session, env);
  }

  return new Response(JSON.stringify({ ok: true, received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

function isPaidBuildAccessSession(session) {
  if (!session || session.object !== 'checkout.session') return false;
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return false;
  return cleanText(session.metadata && session.metadata.purchase_type, 80) === 'build_access';
}

function isPaidProductOrderSession(session) {
  if (!session || session.object !== 'checkout.session') return false;
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return false;
  return cleanText(session.metadata && session.metadata.purchase_type, 80) === 'product_order';
}

async function grantBuildAccessFromSession(session, env) {
  const sessionId = cleanStripeSessionId(session.id);
  if (!sessionId) throw new Error('Invalid Build Access Stripe session');

  const now = unixNow();
  const ttl = buildAccessTtlSeconds(env);
  const existing = await getBuildAccessRecord(env, sessionId);
  const email = cleanEmail((session.customer_details && session.customer_details.email) || session.customer_email || '');
  if (!email) throw new Error('Build Access payment does not include a customer email');

  const record = {
    version: 1,
    status: 'paid',
    product: 'build_access',
    stripe_session_id: sessionId,
    stripe_payment_status: session.payment_status,
    email_hash: await sha256Hex(email.toLowerCase()),
    source_page: cleanRelativePath(session.metadata && session.metadata.source_page || '/', 180),
    source_build_key: cleanText(session.metadata && session.metadata.source_build_key || '', 80),
    source_build_name: cleanText(session.metadata && session.metadata.source_build_name || '', 120),
    granted_at: existing && existing.granted_at ? existing.granted_at : now,
    expires_at: existing && existing.expires_at && existing.expires_at > now ? existing.expires_at : now + ttl,
    updated_at: now
  };

  await putBuildAccessRecord(env, record, Math.max(60, record.expires_at - now));
  return record;
}


async function fulfillPaidProductOrder(eventSession, env) {
  const sessionId = cleanStripeSessionId(eventSession && eventSession.id);
  if (!sessionId) throw new Error('Invalid product order Stripe session');

  const session = await stripeGet(
    '/v1/checkout/sessions/' + encodeURIComponent(sessionId) +
    '?expand[]=customer&expand[]=payment_intent',
    env.STRIPE_SECRET_KEY
  );

  if (!isPaidProductOrderSession(session)) return;

  const lineItems = await getStripeCheckoutLineItems(sessionId, env);
  if (!lineItems.length) throw new Error('Paid product order has no Stripe line items');

  const customer = extractPaidOrderCustomer(session);
  if (!customer.email) throw new Error('Paid product order does not include a customer email');
  if (!customer.address_text) throw new Error('Paid product order does not include a shipping address');

  const now = unixNow();
  const ttl = buildAccessTtlSeconds(env);
  let record = await getProductOrderRecord(env, sessionId);

  if (!record) {
    record = {
      version: 1,
      status: 'paid_pending_notification',
      product: 'product_order',
      stripe_session_id: sessionId,
      order_id: cleanText(session.metadata && session.metadata.order_id, 120),
      stripe_payment_status: session.payment_status,
      amount_total: Number(session.amount_total || 0),
      email_hash: await sha256Hex(customer.email.toLowerCase()),
      admin_email_sent: false,
      client_email_sent: false,
      created_at: now,
      updated_at: now
    };
    await putProductOrderRecord(env, record, ttl);
  }

  const emailData = buildPaidProductOrderEmailData(session, lineItems, customer);
  const emailConfig = getEmailJsConfig(env);

  if (!record.admin_email_sent) {
    await sendEmailJsTemplate(emailConfig, emailConfig.adminTemplateId, emailData);
    record.admin_email_sent = true;
    record.updated_at = unixNow();
    await putProductOrderRecord(env, record, ttl);
  }

  if (!record.client_email_sent) {
    await delay(PRODUCT_ORDER_EMAIL_DELAY_MS);
    await sendEmailJsTemplate(emailConfig, emailConfig.clientTemplateId, emailData);
    record.client_email_sent = true;
    record.updated_at = unixNow();
    await putProductOrderRecord(env, record, ttl);
  }

  record.status = 'paid_notified';
  record.updated_at = unixNow();
  await putProductOrderRecord(env, record, ttl);
}

async function getStripeCheckoutLineItems(sessionId, env) {
  const data = await stripeGet(
    '/v1/checkout/sessions/' + encodeURIComponent(sessionId) +
    '/line_items?limit=100&expand[]=data.price.product',
    env.STRIPE_SECRET_KEY
  );
  return Array.isArray(data && data.data) ? data.data : [];
}

function extractPaidOrderCustomer(session) {
  const customerDetails = (session && session.customer_details) || {};
  const collected = (session && session.collected_information) || {};
  const shippingDetails = collected.shipping_details || (session && session.shipping_details) || {};
  const shippingAddress = shippingDetails.address || {};
  const customerAddress = customerDetails.address || {};
  const address = shippingAddress.line1 ? shippingAddress : customerAddress;
  const name = cleanText(shippingDetails.name || customerDetails.name || '', 160);
  const email = cleanEmail(customerDetails.email || session.customer_email || '');
  const phone = cleanText(shippingDetails.phone || customerDetails.phone || '', 80);
  const addressText = formatStripeAddress(address);

  return {
    name: name || 'Stripe customer',
    email,
    phone,
    country: cleanText(address.country || '', 80),
    city: cleanText(address.city || '', 120),
    postal_code: cleanText(address.postal_code || '', 40),
    state: cleanText(address.state || '', 120),
    line1: cleanText(address.line1 || '', 180),
    line2: cleanText(address.line2 || '', 180),
    address_text: addressText
  };
}

function formatStripeAddress(address) {
  const value = address || {};
  return [
    cleanText(value.line1 || '', 180),
    cleanText(value.line2 || '', 180),
    [cleanText(value.postal_code || '', 40), cleanText(value.city || '', 120)].filter(Boolean).join(' '),
    cleanText(value.state || '', 120),
    cleanText(value.country || '', 80)
  ].filter(Boolean).join(', ');
}

function buildPaidProductOrderEmailData(session, lineItems, customer) {
  const metadata = (session && session.metadata) || {};
  const orderId = cleanText(metadata.order_id || '', 120) || cleanStripeSessionId(session && session.id);
  const paidLines = (lineItems || []).map(normalizePaidStripeLineItem).filter(Boolean);
  const cartSummary = paidLines.map(function (line) {
    const option = line.option ? ' — Option: ' + line.option : '';
    return line.name + ' x ' + line.quantity + option + ' — ' + formatEuroCents(line.amount_total);
  }).join('\n');
  const model = inferPaidOrderFitment(paidLines);
  const subtotal = Number(session && session.amount_subtotal || metadata.cart_subtotal_cents || 0);
  const discount = Number((session && session.total_details && session.total_details.amount_discount) || metadata.discount_cents || 0);
  const total = Number(session && session.amount_total || metadata.total_cents || 0);
  const paidAt = new Date().toISOString();
  const termsVersion = cleanText(metadata.terms_version || TERMS_VERSION, 80);
  const itemCount = paidLines.reduce(function (sum, line) { return sum + line.quantity; }, 0);
  const evidence = [
    'BENDAGO PAID ORDER CONFIRMATION',
    'Status: PAID',
    'Paid at: ' + paidAt,
    'Order ID: ' + orderId,
    'Stripe session ID: ' + cleanStripeSessionId(session && session.id),
    'Payment status: ' + cleanText(session && session.payment_status || '', 40),
    '',
    'CUSTOMER',
    'Name: ' + customer.name,
    'Email: ' + customer.email,
    'Phone: ' + (customer.phone || 'Not provided'),
    '',
    'SHIPPING ADDRESS FROM STRIPE',
    customer.address_text,
    '',
    'PAID CART',
    cartSummary,
    'Cart item count: ' + String(itemCount),
    'Subtotal: ' + formatEuroCents(subtotal),
    discount > 0 ? 'Launch Access discount: -' + formatEuroCents(discount) : 'Launch Access discount: not applied',
    'Total paid: ' + formatEuroCents(total),
    '',
    'TERMS ACCEPTANCE',
    'Terms version: ' + termsVersion,
    'Terms accepted before Stripe checkout: ' + cleanText(metadata.selected_options_ok || 'true', 10),
    'Processing after payment requested: ' + cleanText(metadata.processing_requested || 'true', 10),
    'Cancellation policy accepted: ' + cleanText(metadata.cancel_policy_accepted || 'true', 10),
    '',
    'FULFILMENT',
    'Payment was confirmed by Stripe webhook. Prepare the custom-sourced order only after this PAID notice.',
    'Delivery estimate: 10 to 15 business days. Tracking details are shared after dispatch.'
  ].join('\n');

  return {
    request_id: orderId,
    request_date: paidAt,
    customer_name: customer.name,
    customer_email: customer.email,
    email: customer.email,
    phone: customer.phone || 'Not provided',
    country: customer.country || '',
    delivery_city_country: [customer.city, customer.country].filter(Boolean).join(', '),
    delivery_address: customer.address_text,
    motorcycle_model: model,
    year_version: 'Collected from selected product fitment',
    color_option: paidLines.length === 1 ? (paidLines[0].option || 'Not applicable') : 'See paid cart summary',
    product_code: paidLines.length === 1 ? paidLines[0].sku : 'grouped-cart',
    product_name: paidLines.length === 1 ? paidLines[0].name : 'Grouped Benda Custom Picks paid order',
    product_short: paidLines.length === 1 ? paidLines[0].name : 'Grouped Benda Custom Picks parts',
    price: formatEuroCents(total),
    fitment: model,
    delivery_estimate: '10 to 15 business days',
    payment_provider: 'Stripe',
    payment_status: 'PAID',
    payment_url: '',
    stripe_url: '',
    stripe_session_id: cleanStripeSessionId(session && session.id),
    checkout_url: '',
    checkout_id: cleanStripeSessionId(session && session.id),
    stripe_payment_intent: cleanText(session && session.payment_intent && session.payment_intent.id || session && session.payment_intent || '', 200),
    checkout_evidence_id: orderId,
    evidence_email_type: 'PAID_ORDER_CONFIRMATION',
    checkout_evidence_body: evidence,
    evidence_mail_body: evidence,
    message: evidence,
    post_payment_evidence_required: 'false',
    cart_summary: cartSummary,
    cart_total: formatEuroCents(total),
    paid_total: formatEuroCents(total),
    launch_discount: discount > 0 ? formatEuroCents(discount) : '',
    launch_offer: discount > 0 ? 'Launch Access 5% applied — no code needed' : '',
    cart_count: String(itemCount),
    request_page: 'Stripe Checkout',
    referrer: '',
    terms_accepted: cleanText(metadata.selected_options_ok || 'true', 10),
    custom_sourcing_accepted: 'true',
    custom_order_accepted: 'true',
    selected_model_accepted: 'true',
    selected_products_colours_options_accepted: cleanText(metadata.selected_options_ok || 'true', 10),
    delivery_country_accepted: 'true',
    total_amount_accepted: 'true',
    immediate_processing_requested: cleanText(metadata.processing_requested || 'true', 10),
    cancellation_policy_accepted: cleanText(metadata.cancel_policy_accepted || 'true', 10),
    terms_version: termsVersion,
    terms_accepted_at: paidAt,
    terms_page_url: 'https://bendacustompicks.com/terms-and-conditions.html',
    cancellation_policy_summary: 'Custom order terms were accepted before Stripe checkout. Payment is confirmed. Cancellation is not automatic once order processing, supplier preparation or dispatch preparation has started.',
    order_processing_status: 'PAID — ready for manual order processing.',
    order_evidence_summary: 'Stripe webhook confirmed payment. Shipping address, contact details, selected items, options and total paid are recorded above.',
    order_status_message: 'Payment confirmed by Stripe. Your custom order is now recorded for processing.',
    tracking_note: 'Tracking details are shared as soon as they are available after shipment.',
    processing_note: 'Process only after this PAID Stripe webhook confirmation.'
  };
}

function normalizePaidStripeLineItem(item) {
  const price = item && item.price || {};
  const product = price && price.product && typeof price.product === 'object' ? price.product : {};
  const metadata = product.metadata || {};
  const sku = cleanText(metadata.sku || '', 120);
  const option = cleanText(metadata.option || '', 120);
  const name = cleanText(item && item.description || product.name || sku || 'Benda part', 240);
  const quantity = Math.max(1, Number.parseInt(item && item.quantity || 1, 10) || 1);
  const amountTotal = Math.max(0, Number(item && item.amount_total || 0));
  return { sku, option, name, quantity, amount_total: amountTotal };
}

function inferPaidOrderFitment(lines) {
  const napoleon450Skus = new Set([
    'double-seat-comfort-premium-plus',
    'bumper-top-protect-450',
    'premium-rear-fender-450',
    'maverick-air-filter-450',
    'transparent-gold-clutch-cover-kit-450',
    'madmax-double-exhaust-kit-450',
    'premium-comfort-foot-kit-450',
    'headlight-windscreen-cover-kit-450',
    'premium-transparent-clutch-cover-kit-450',
    'carbon-exhaust-protection-kit-450',
    'black-shield-armor-kit-450',
    'chrome-air-filter-450-500-sr66',
    'black-night-clutch-cover-450-500-sr66',
    'brutal-storm-exhaust-450-500-sr66'
  ]);
  const models = Array.from(new Set((lines || []).map(function (line) {
    const sku = cleanText(line && line.sku || '', 120);
    if (/-v4$/.test(sku)) return 'Benda Dark Flag V4';
    if (napoleon450Skus.has(sku)) return 'Benda Napoleon 450/500';
    return sku ? 'Benda Napoleon 125/250' : '';
  }).filter(Boolean)));
  if (models.length === 1) return models[0];
  if (models.length > 1) return 'Mixed Benda model cart';
  return 'Benda model shown in paid cart';
}

function formatEuroCents(cents) {
  const amount = Math.max(0, Number(cents || 0)) / 100;
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2
  }) + ' €';
}

function getEmailJsConfig(env) {
  const config = {
    publicKey: cleanText(env.EMAILJS_PUBLIC_KEY || DEFAULT_EMAILJS_CONFIG.publicKey, 200),
    serviceId: cleanText(env.EMAILJS_SERVICE_ID || DEFAULT_EMAILJS_CONFIG.serviceId, 200),
    adminTemplateId: cleanText(env.EMAILJS_ADMIN_TEMPLATE_ID || DEFAULT_EMAILJS_CONFIG.adminTemplateId, 200),
    clientTemplateId: cleanText(env.EMAILJS_CLIENT_TEMPLATE_ID || DEFAULT_EMAILJS_CONFIG.clientTemplateId, 200)
  };
  if (!config.publicKey || !config.serviceId || !config.adminTemplateId || !config.clientTemplateId) {
    throw new Error('Missing EmailJS paid-order configuration');
  }
  return config;
}

async function sendEmailJsTemplate(config, templateId, templateParams) {
  const response = await fetch(EMAILJS_SEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: config.serviceId,
      template_id: templateId,
      user_id: config.publicKey,
      template_params: templateParams
    })
  });
  const text = await response.text();
  if (!response.ok) throw new Error('EmailJS error: ' + (text || response.status));
  return text;
}

function delay(milliseconds) {
  return new Promise(function (resolve) { setTimeout(resolve, milliseconds); });
}

async function getProductOrderRecord(env, sessionId) {
  return getKvJson(env.BUILD_ACCESS_KV, PRODUCT_ORDER_RECORD_PREFIX + sessionId);
}

async function putProductOrderRecord(env, record, ttl) {
  await env.BUILD_ACCESS_KV.put(PRODUCT_ORDER_RECORD_PREFIX + record.stripe_session_id, JSON.stringify(record), {
    expirationTtl: Math.max(60, ttl)
  });
}

function requireStripeWebhookConfig(env) {
  if (!env.STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
  if (!env.BUILD_ACCESS_KV || typeof env.BUILD_ACCESS_KV.get !== 'function') throw new Error('Missing BUILD_ACCESS_KV binding');
  if (!cleanText(env.STRIPE_WEBHOOK_SECRET, 500)) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
}

function requireBuildAccessConfig(env) {
  if (!env.STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
  if (!env.BUILD_ACCESS_KV || typeof env.BUILD_ACCESS_KV.get !== 'function') throw new Error('Missing BUILD_ACCESS_KV binding');
  if (!cleanText(env.BUILD_ACCESS_TOKEN_SECRET, 500)) throw new Error('Missing BUILD_ACCESS_TOKEN_SECRET');
  if (!cleanText(env.STRIPE_WEBHOOK_SECRET, 500)) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
}

function requireBuildAccessAdminConfig(env) {
  if (!env.BUILD_ACCESS_KV || typeof env.BUILD_ACCESS_KV.get !== 'function') throw new Error('Missing BUILD_ACCESS_KV binding');
  if (!cleanText(env.BUILD_ACCESS_TOKEN_SECRET, 500)) throw new Error('Missing BUILD_ACCESS_TOKEN_SECRET');
  if (!cleanText(env.BUILD_ACCESS_ADMIN_KEY, 500)) throw new Error('Missing BUILD_ACCESS_ADMIN_KEY');
}

async function putBuildAccessIntent(env, intent, ttl) {
  await env.BUILD_ACCESS_KV.put(BUILD_ACCESS_INTENT_PREFIX + intent.intent_id, JSON.stringify(intent), {
    expirationTtl: Math.max(60, ttl)
  });
}

async function getBuildAccessIntent(env, intentId) {
  return getKvJson(env.BUILD_ACCESS_KV, BUILD_ACCESS_INTENT_PREFIX + intentId);
}

async function putBuildAccessRecord(env, record, ttl) {
  await env.BUILD_ACCESS_KV.put(BUILD_ACCESS_RECORD_PREFIX + record.stripe_session_id, JSON.stringify(record), {
    expirationTtl: Math.max(60, ttl)
  });
}

async function getBuildAccessRecord(env, sessionId) {
  return getKvJson(env.BUILD_ACCESS_KV, BUILD_ACCESS_RECORD_PREFIX + sessionId);
}

async function putBuildAccessAdminRecord(env, record, ttl) {
  await env.BUILD_ACCESS_KV.put(BUILD_ACCESS_ADMIN_RECORD_PREFIX + record.admin_id, JSON.stringify(record), {
    expirationTtl: Math.max(60, ttl)
  });
}

async function getBuildAccessAdminRecord(env, adminId) {
  return getKvJson(env.BUILD_ACCESS_KV, BUILD_ACCESS_ADMIN_RECORD_PREFIX + adminId);
}

async function getKvJson(kv, key) {
  const value = await kv.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function buildAccessSuccessUrl(env) {
  const value = cleanText(env.BUILD_ACCESS_SUCCESS_URL || DEFAULT_BUILD_ACCESS_SUCCESS_URL, 500);
  return value.includes('{CHECKOUT_SESSION_ID}') ? value : value + (value.includes('?') ? '&' : '?') + 'session_id={CHECKOUT_SESSION_ID}';
}

function buildAccessCancelUrl(env) {
  return cleanText(env.BUILD_ACCESS_CANCEL_URL || DEFAULT_BUILD_ACCESS_CANCEL_URL, 500);
}

function buildAccessTtlSeconds(env) {
  return clampInteger(env.BUILD_ACCESS_TTL_SECONDS, DEFAULT_BUILD_ACCESS_TTL_SECONDS, 60 * 60 * 24, 60 * 60 * 24 * 365);
}

function accessIntentTtlSeconds(env) {
  return clampInteger(env.BUILD_ACCESS_INTENT_TTL_SECONDS, DEFAULT_BUILD_ACCESS_INTENT_TTL_SECONDS, 60 * 10, 60 * 60 * 6);
}

function buildAccessAdminTtlSeconds(env) {
  return clampInteger(env.BUILD_ACCESS_ADMIN_TTL_SECONDS, DEFAULT_BUILD_ACCESS_ADMIN_TTL_SECONDS, 60 * 60 * 24, 60 * 60 * 24 * 365 * 2);
}

function webhookToleranceSeconds(env) {
  return clampInteger(env.WEBHOOK_TOLERANCE_SECONDS, DEFAULT_WEBHOOK_TOLERANCE_SECONDS, 60, 60 * 30);
}

function clampInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function unixNow() {
  return Math.floor(Date.now() / 1000);
}

function cleanStripeSessionId(value) {
  const id = cleanText(value, 300);
  return /^cs_(?:test|live)_[A-Za-z0-9]+$/.test(id) ? id : '';
}

function cleanAdminAccessId(value) {
  const id = cleanText(value, 120);
  return /^adm_[A-Za-z0-9-]{16,100}$/.test(id) ? id : '';
}

function cleanRelativePath(value, maxLength) {
  const path = cleanText(value, maxLength);
  if (!path || !path.startsWith('/') || path.startsWith('//') || /:\/\//.test(path)) return '/';
  return path;
}

async function makeSignedCookieValue(id, expiresAt, secret, purpose) {
  const payload = purpose + '.' + id + '.' + String(expiresAt);
  const signature = await hmacBase64Url(secret, payload);
  return base64UrlEncode(payload) + '.' + signature;
}

async function readSignedCookie(request, cookieName, secret, purpose) {
  const raw = readCookie(request.headers.get('Cookie') || '', cookieName);
  if (!raw) return '';
  const splitAt = raw.lastIndexOf('.');
  if (splitAt <= 0) return '';

  const encodedPayload = raw.slice(0, splitAt);
  const signature = raw.slice(splitAt + 1);
  let payload;
  try {
    payload = base64UrlDecode(encodedPayload);
  } catch (error) {
    return '';
  }

  const expected = await hmacBase64Url(secret, payload);
  if (!timingSafeEqual(expected, signature)) return '';

  const parts = payload.split('.');
  if (parts.length !== 3 || parts[0] !== purpose) return '';
  const id = purpose === 'access' ? cleanStripeSessionId(parts[1]) : (purpose === 'admin' ? cleanAdminAccessId(parts[1]) : cleanText(parts[1], 120));
  const expiresAt = Number.parseInt(parts[2], 10);
  if (!id || !Number.isFinite(expiresAt) || expiresAt <= unixNow()) return '';
  return id;
}

function readCookie(header, name) {
  const needle = name + '=';
  const parts = String(header || '').split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(needle)) return trimmed.slice(needle.length);
  }
  return '';
}

function serializeCookie(name, value, options) {
  const parts = [name + '=' + value, 'Path=/', 'Secure'];
  if (options && options.httpOnly) parts.push('HttpOnly');
  parts.push('SameSite=' + ((options && options.sameSite) || 'Lax'));
  if (options && options.maxAge !== undefined) parts.push('Max-Age=' + Math.max(0, Math.floor(options.maxAge)));
  return parts.join('; ');
}

function clearCookie(name) {
  return serializeCookie(name, '', { maxAge: 0, httpOnly: true, sameSite: 'Lax' });
}

function withCors(cors, headers) {
  return Object.assign({}, cors || {}, headers || {});
}

function buildAccessDenied(cors, message) {
  return json({
    ok: false,
    access: 'denied',
    error: message,
    product: 'build_access',
    access_price_eur: centsToEuro(BUILD_ACCESS_AMOUNT_CENTS)
  }, 403, cors);
}

async function verifyStripeWebhookSignature(payload, signatureHeader, secret, toleranceSeconds) {
  const fields = String(signatureHeader || '').split(',').map(part => part.trim());
  let timestamp = '';
  const signatures = [];

  for (const field of fields) {
    const separator = field.indexOf('=');
    if (separator <= 0) continue;
    const key = field.slice(0, separator);
    const value = field.slice(separator + 1);
    if (key === 't') timestamp = value;
    if (key === 'v1') signatures.push(value);
  }

  const ts = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ts) || !signatures.length || Math.abs(unixNow() - ts) > toleranceSeconds) return false;

  const expected = await hmacHex(secret, timestamp + '.' + payload);
  return signatures.some(signature => timingSafeEqual(expected, signature));
}

async function hmacBase64Url(secret, value) {
  const bytes = await hmacBytes(secret, value);
  return bytesToBase64Url(bytes);
}

async function hmacHex(secret, value) {
  const bytes = await hmacBytes(secret, value);
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hmacBytes(secret, value) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(String(secret)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(String(value)));
  return new Uint8Array(signature);
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(value)));
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function base64UrlEncode(value) {
  const bytes = new TextEncoder().encode(String(value));
  return bytesToBase64Url(bytes);
}

function bytesToBase64Url(bytes) {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function timingSafeEqual(left, right) {
  const a = new TextEncoder().encode(String(left));
  const b = new TextEncoder().encode(String(right));
  let diff = a.length ^ b.length;
  const max = Math.max(a.length, b.length);
  for (let index = 0; index < max; index += 1) {
    diff |= (a[index % (a.length || 1)] || 0) ^ (b[index % (b.length || 1)] || 0);
  }
  return diff === 0;
}


function buildAccessEnforced(env) {
  const value = cleanText(env.BUILD_ACCESS_ENFORCED, 40).toLowerCase();
  if (!value) return DEFAULT_BUILD_ACCESS_ENFORCED;
  return value === 'true' || value === '1' || value === 'yes';
}

async function requireBuildAccessForProductCheckout(request, env, cors) {
  if (!buildAccessEnforced(env)) return null;
  requireBuildAccessConfig(env);

  const access = await getValidBuildAccessEntitlement(request, env);
  if (!access) {
    return json({
      ok: false,
      access: 'denied',
      error: 'Full catalog access is required before secure product checkout.',
      product: 'build_access',
      access_price_eur: centsToEuro(BUILD_ACCESS_AMOUNT_CENTS)
    }, 403, cors);
  }
  return null;
}

function productCheckoutSuccessUrl(body, env) {
  const configured = cleanText(env.SUCCESS_URL || '', 1000);
  const requested = cleanText(body && body.return_urls && body.return_urls.success_url || '', 1000);
  return safeProductCheckoutReturnUrl(requested || configured, DEFAULT_SUCCESS_URL, true);
}

function productCheckoutCancelUrl(body, env) {
  const configured = cleanText(env.CANCEL_URL || '', 1000);
  const requested = cleanText(body && body.return_urls && body.return_urls.cancel_url || '', 1000);
  return safeProductCheckoutReturnUrl(requested || configured, DEFAULT_CANCEL_URL, false);
}

function safeProductCheckoutReturnUrl(candidate, fallback, requireSessionId) {
  const value = cleanText(candidate, 1000);
  if (!value) return fallback;
  try {
    const parsed = new URL(value);
    if (!DEFAULT_ALLOWED_ORIGINS.includes(parsed.origin)) return fallback;
    if (/\/cart-request\.html$/i.test(parsed.pathname)) return fallback;
    if (requireSessionId && !parsed.searchParams.get('session_id')) {
      parsed.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
    }
    return parsed.toString();
  } catch (error) {
    return fallback;
  }
}

async function createStripeCheckout(request, env, cors) {
  const accessBlock = await requireBuildAccessForProductCheckout(request, env, cors);
  if (accessBlock) return accessBlock;

  if (!env.STRIPE_SECRET_KEY) {
    return json({ ok: false, error: 'Missing STRIPE_SECRET_KEY' }, 500, cors);
  }

  const body = await readJson(request);
  const normalized = normalizeItems(body.items || []);
  if (!normalized.length) {
    return json({ ok: false, error: 'Cart is empty' }, 400, cors);
  }

  const pricing = calculatePricing(normalized);
  const customerEmail = cleanEmail(body.customer_email);
  const customerName = cleanText(body.customer_name, 120);
  const terms = body.terms_acceptance || {};
  const orderId = makeOrderId();
  const successUrl = productCheckoutSuccessUrl(body, env);
  const cancelUrl = productCheckoutCancelUrl(body, env);

  const lineItems = [];
  normalized.forEach((item, index) => {
    const product = PRODUCT_CATALOG[item.sku];
    lineItems.push(['line_items[' + index + '][quantity]', String(item.quantity)]);
    lineItems.push(['line_items[' + index + '][price_data][currency]', CURRENCY]);
    lineItems.push(['line_items[' + index + '][price_data][unit_amount]', String(product.amount)]);
    lineItems.push(['line_items[' + index + '][price_data][product_data][name]', product.name]);

    const option = item.color_option ? 'Option: ' + item.color_option : 'Selected Benda upgrade';
    lineItems.push(['line_items[' + index + '][price_data][product_data][description]', option]);
    lineItems.push(['line_items[' + index + '][price_data][product_data][metadata][sku]', item.sku]);

    if (item.color_option) {
      lineItems.push(['line_items[' + index + '][price_data][product_data][metadata][option]', item.color_option]);
    }
  });

  let couponId = '';
  if (pricing.discount_cents > 0) {
    const coupon = await stripePost('/v1/coupons', env.STRIPE_SECRET_KEY, [
      ['amount_off', String(pricing.discount_cents)],
      ['currency', CURRENCY],
      ['duration', 'once'],
      ['name', 'Launch Access 5%'],
      ['metadata[order_id]', orderId],
      ['metadata[build_key]', pricing.eligible_build_key]
    ]);
    couponId = coupon.id;
  }

  const params = [
    ['mode', 'payment'],
    ['success_url', successUrl],
    ['cancel_url', cancelUrl],
    ['customer_creation', 'always'],
    ['billing_address_collection', 'auto'],
    ['phone_number_collection[enabled]', 'true'],
    ...STRIPE_WORLDWIDE_SHIPPING_COUNTRIES.map((countryCode, index) => [
      'shipping_address_collection[allowed_countries][' + index + ']',
      countryCode
    ]),
    ['metadata[purchase_type]', 'product_order'],
    ['metadata[order_id]', orderId],
    ['metadata[terms_version]', cleanText(terms.terms_version || TERMS_VERSION, 40)],
    ['metadata[selected_options_ok]', boolText(terms.selected_products_colours_options_accepted)],
    ['metadata[processing_requested]', boolText(terms.immediate_processing_requested)],
    ['metadata[cancel_policy_accepted]', boolText(terms.cancellation_policy_accepted)],
    ['metadata[eligible_build_key]', cleanText(pricing.eligible_build_key || '', 40)],
    ['metadata[cart_subtotal_cents]', String(pricing.subtotal_cents)],
    ['metadata[discount_cents]', String(pricing.discount_cents)],
    ['metadata[total_cents]', String(pricing.total_cents)],
    ['metadata[item_count]', String(normalized.reduce((sum, item) => sum + item.quantity, 0))]
  ];

  if (customerEmail) params.push(['customer_email', customerEmail]);
  if (customerName) params.push(['metadata[customer_name]', cleanText(customerName, 500)]);
  if (couponId) params.push(['discounts[0][coupon]', couponId]);

  lineItems.forEach(pair => params.push(pair));

  const session = await stripePost('/v1/checkout/sessions', env.STRIPE_SECRET_KEY, params);

  return json({
    ok: true,
    checkout_url: session.url,
    checkout_id: session.id,
    stripe_session_id: session.id,
    order_id: orderId,
    currency: CURRENCY,
    subtotal: centsToEuro(pricing.subtotal_cents),
    discount_amount: centsToEuro(pricing.discount_cents),
    amount: centsToEuro(pricing.total_cents),
    discount_applied: pricing.discount_cents > 0,
    eligible_build_key: pricing.eligible_build_key,
    eligible_build_name: pricing.eligible_build_name
  }, 200, cors);
}

function normalizeItems(items) {
  if (!Array.isArray(items)) throw new Error('Invalid items payload');

  const lines = [];

  items.forEach((raw) => {
    const inputSku = cleanText(raw && (raw.sku || raw.product_code || raw.code), 120);
    const color_option = cleanText(raw.color_option || raw.option || '', 120);
    const sku = normalizeSku(inputSku, color_option);
    const product = PRODUCT_CATALOG[sku];

    if (!product) throw new Error('Unknown SKU: ' + inputSku);

    const quantity = Math.max(1, Math.min(20, Number.parseInt(raw.quantity || raw.qty || 1, 10) || 1));

    lines.push({ sku, quantity, color_option });
  });

  return mergeSameSku(lines);
}

function normalizeSku(value, option) {
  const key = cleanText(value, 120);
  const normalized = SKU_ALIASES[key] || key;
  /* V136 migration: V32/V34 used the historical SKU for the Metal Fender.
     Only a concrete Metal style identifies an unambiguous legacy Metal line. */
  if (normalized === 'brutal-rear-fender-kit') {
    const style = cleanText(option, 120);
    if (style === 'Minimalist') return 'brutal-rear-metal-fender-minimalist';
    if (style === 'With Fixed Luggage Rack') return 'brutal-rear-metal-fender-fixed-rack';
    if (style === 'With Separate Luggage Rack') return 'brutal-rear-metal-fender-separate-rack';
  }
  return normalized;
}

function mergeSameSku(lines) {
  const map = new Map();

  lines.forEach((line) => {
    const key = line.sku + '||' + line.color_option;
    const existing = map.get(key);

    if (existing) existing.quantity += line.quantity;
    else map.set(key, { ...line });
  });

  return Array.from(map.values());
}

function calculatePricing(lines) {
  const subtotal = lines.reduce((sum, line) => {
    const product = PRODUCT_CATALOG[line.sku];
    return sum + product.amount * line.quantity;
  }, 0);

  // Shared SKUs may appear in several look rules; findEligibleBuild returns one best eligible build only, so two full-build discounts never stack.
  const build = findEligibleBuild(lines);
  const buildSubtotal = build ? build.skus.reduce((sum, sku) => {
    const product = PRODUCT_CATALOG[sku];
    return sum + (product ? product.amount : 0);
  }, 0) : 0;
  const buildDiscount = build ? Math.round(buildSubtotal * LAUNCH_DISCOUNT_RATE) : 0;

  // Midnight Beast remains a standalone premium product. Its Launch Access applies only to this SKU line.
  const midnightBeastSubtotal = lines.reduce((sum, line) => {
    if (line.sku !== 'midnight-beast-kit-v4') return sum;
    const product = PRODUCT_CATALOG[line.sku];
    return sum + product.amount * line.quantity;
  }, 0);
  const midnightBeastDiscount = Math.round(midnightBeastSubtotal * LAUNCH_DISCOUNT_RATE);
  const discount = buildDiscount + midnightBeastDiscount;

  const eligibilityKeys = [];
  const eligibilityNames = [];
  if (build) {
    eligibilityKeys.push(build.key);
    eligibilityNames.push(build.name);
  }
  if (midnightBeastDiscount > 0) {
    eligibilityKeys.push('midnight-beast-kit-v4');
    eligibilityNames.push('Midnight Beast Kit');
  }

  return {
    subtotal_cents: subtotal,
    discount_cents: discount,
    total_cents: Math.max(0, subtotal - discount),
    eligible_build_key: eligibilityKeys.join('+'),
    eligible_build_name: eligibilityNames.join(' + ')
  };
}

function findEligibleBuild(lines) {
  const counts = {};
  let bestRule = null;
  let bestSubtotal = -1;

  lines.forEach((line) => {
    counts[line.sku] = (counts[line.sku] || 0) + line.quantity;
  });

  COMPLETE_BUILD_RULES.forEach((rule) => {
    const eligible = rule.skus.every((sku) => (counts[sku] || 0) >= 1);
    if (!eligible) return;
    const subtotal = rule.skus.reduce((sum, sku) => {
      const product = PRODUCT_CATALOG[sku];
      return sum + (product ? product.amount : 0);
    }, 0);
    if (subtotal > bestSubtotal) {
      bestRule = rule;
      bestSubtotal = subtotal;
    }
  });

  return bestRule;
}

function skuQtySignature(lines) {
  const counter = {};

  lines.forEach((line) => {
    counter[line.sku] = (counter[line.sku] || 0) + line.quantity;
  });

  return Object.keys(counter)
    .sort()
    .map(sku => sku + ':' + counter[sku])
    .join('|');
}

async function stripePost(path, secret, params) {
  const body = new URLSearchParams();

  params.forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== '') {
      body.append(key, String(value));
    }
  });

  const response = await fetch('https://api.stripe.com' + path, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + secret,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data && data.error && data.error.message ? data.error.message : text;
    throw new Error('Stripe error: ' + message);
  }

  return data;
}

async function stripeGet(path, secret) {
  const response = await fetch('https://api.stripe.com' + path, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + secret }
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data && data.error && data.error.message ? data.error.message : text;
    throw new Error('Stripe error: ' + message);
  }

  return data;
}

async function readJson(request) {
  const text = await request.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON body');
  }
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const configured = cleanText(env.ALLOWED_ORIGINS || '', 1000);
  const allowList = configured
    ? configured.split(',').map(s => s.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;

  const allowedOrigin = allowList.includes(origin) ? origin : allowList[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), { status, headers });
}

function jsonWithSetCookies(payload, status, headers, cookies) {
  const responseHeaders = new Headers(headers || {});
  (cookies || []).forEach(cookie => responseHeaders.append('Set-Cookie', cookie));
  return new Response(JSON.stringify(payload), { status, headers: responseHeaders });
}

function makeOrderId() {
  return 'BCP-' +
    new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14) +
    '-' +
    Math.random().toString(36).slice(2, 8).toUpperCase();
}

function centsToEuro(cents) {
  return Math.round(cents) / 100;
}

function boolText(value) {
  return value === true || value === 'true' ? 'true' : 'false';
}

function cleanEmail(value) {
  const email = cleanText(value, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength || 500);
}
