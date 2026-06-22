/* BENDAGO V127 — indicative display currency selector.
   Scope: model universe pages only. Cart, Worker and Stripe remain EUR.
   Reference-only rates frozen for display; do not use as checkout rates. */
(function () {
  'use strict';

  var STORAGE_KEY = 'bcp_display_currency_v1';
  var BASE_CURRENCY = 'EUR';
  var EUR_AMOUNT = /([0-9]+(?:[.,][0-9]{1,2})?)\s*€/g;
  var currencies = {
    AUD: { rate: 1.6361, locale: 'en-AU', label: 'AUD — A$ Australian Dollar', decimals: 2, prefix: 'A$' },
    BGN: { rate: 1.95583, locale: 'bg-BG', label: 'BGN — лв Bulgarian Lev', decimals: 2, suffix: ' лв' },
    BRL: { rate: 5.9149, locale: 'pt-BR', label: 'BRL — R$ Brazilian Real', decimals: 2, prefix: 'R$' },
    CAD: { rate: 1.6195, locale: 'en-CA', label: 'CAD — CA$ Canadian Dollar', decimals: 2, prefix: 'CA$' },
    CHF: { rate: 0.9236, locale: 'de-CH', label: 'CHF — CHF Swiss Franc', decimals: 2, prefix: 'CHF ' },
    CZK: { rate: 24.212, locale: 'cs-CZ', label: 'CZK — Kč Czech Koruna', decimals: 2, suffix: ' Kč' },
    DKK: { rate: 7.474, locale: 'da-DK', label: 'DKK — kr Danish Krone', decimals: 2, suffix: ' kr' },
    EUR: { rate: 1, locale: 'fr-FR', label: 'EUR — € Euro', decimals: 2, suffix: ' €' },
    GBP: { rate: 0.8648, locale: 'en-GB', label: 'GBP — £ Pound Sterling', decimals: 2, prefix: '£' },
    HUF: { rate: 352.77, locale: 'hu-HU', label: 'HUF — Ft Hungarian Forint', decimals: 0, suffix: ' Ft' },
    JPY: { rate: 184.67, locale: 'ja-JP', label: 'JPY — ¥ Japanese Yen', decimals: 0, prefix: '¥' },
    MYR: { rate: 4.7385, locale: 'ms-MY', label: 'MYR — RM Malaysian Ringgit', decimals: 2, prefix: 'RM' },
    PLN: { rate: 4.2591, locale: 'pl-PL', label: 'PLN — zł Polish Złoty', decimals: 2, suffix: ' zł' },
    RON: { rate: 5.2388, locale: 'ro-RO', label: 'RON — lei Romanian Leu', decimals: 2, suffix: ' lei' },
    RUB: { rate: 84.1684, locale: 'ru-RU', label: 'RUB — ₽ Russian Rouble', decimals: 0, suffix: ' ₽' },
    SEK: { rate: 10.9847, locale: 'sv-SE', label: 'SEK — kr Swedish Krona', decimals: 2, suffix: ' kr' },
    SGD: { rate: 1.4804, locale: 'en-SG', label: 'SGD — S$ Singapore Dollar', decimals: 2, prefix: 'S$' },
    TRY: { rate: 53.05, locale: 'tr-TR', label: 'TRY — ₺ Turkish Lira', decimals: 2, prefix: '₺' },
    UAH: { rate: 51.4631, locale: 'uk-UA', label: 'UAH — ₴ Ukrainian Hryvnia', decimals: 2, suffix: ' ₴' },
    USD: { rate: 1.1455, locale: 'en-US', label: 'USD — $ US Dollar', decimals: 2, prefix: '$' },
    ZAR: { rate: 18.883, locale: 'en-ZA', label: 'ZAR — R South African Rand', decimals: 2, prefix: 'R' }
  };

  function safeReadCurrency() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return currencies[value] ? value : BASE_CURRENCY;
    } catch (error) { return BASE_CURRENCY; }
  }

  function safeStoreCurrency(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch (error) {}
  }

  function parseEuroAmount(value) { return Number(String(value).replace(',', '.')); }

  function formatAmount(eurAmount, code) {
    var config = currencies[code] || currencies[BASE_CURRENCY];
    var amount = eurAmount * config.rate;
    var numeric = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals
    }).format(amount);
    return (config.prefix || '') + numeric + (config.suffix || '');
  }

  function convertText(originalText, code) {
    if (code === BASE_CURRENCY) return originalText;
    return originalText.replace(EUR_AMOUNT, function (match, number) {
      var parsed = parseEuroAmount(number);
      return Number.isFinite(parsed) ? formatAmount(parsed, code) : match;
    });
  }

  function getTargets() {
    return Array.prototype.slice.call(document.querySelectorAll(
      '.model-page .product-meta > strong, .model-page .product-card .small'
    )).filter(function (node) {
      return Boolean(node.dataset.bcpEurOriginal) || /([0-9]+(?:[.,][0-9]{1,2})?)\s*€/.test(node.textContent || '');
    });
  }

  function applyCurrency(code) {
    getTargets().forEach(function (node) {
      if (!node.dataset.bcpEurOriginal) node.dataset.bcpEurOriginal = node.textContent;
      node.textContent = convertText(node.dataset.bcpEurOriginal, code);
    });
    document.querySelectorAll('[data-currency-select]').forEach(function (select) { select.value = code; });
    document.querySelectorAll('[data-currency-status]').forEach(function (status) {
      status.textContent = code === BASE_CURRENCY ? 'Checkout currency · EUR' : 'Indicative display · Checkout remains in EUR';
    });
  }

  function mount() {
    var selectors = document.querySelectorAll('[data-currency-select]');
    if (!selectors.length) return;
    var selected = safeReadCurrency();
    selectors.forEach(function (select) {
      select.value = selected;
      select.addEventListener('change', function () {
        var code = currencies[select.value] ? select.value : BASE_CURRENCY;
        safeStoreCurrency(code);
        applyCurrency(code);
      });
    });
    applyCurrency(selected);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
}());
