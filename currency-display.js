/* BENDAGO — indicative display currency selector.
   Scope: model universe pages only. Checkout/cart/Stripe remain EUR. */
(function () {
  'use strict';

  var STORAGE_KEY = 'bcp_display_currency_v1';
  var BASE_CURRENCY = 'EUR';
  var EUR_AMOUNT = /([0-9]+(?:[.,][0-9]{1,2})?)\s*€/g;
  var currencies = {
    EUR: { rate: 1, locale: 'fr-FR', label: 'EUR — € Euro', decimals: 2, prefix: '€' },
    USD: { rate: 1.1467, locale: 'en-US', label: 'USD — $ US Dollar', decimals: 2, prefix: '$' },
    JPY: { rate: 184.88, locale: 'ja-JP', label: 'JPY — ¥ Japanese Yen', decimals: 0, prefix: '¥' },
    AUD: { rate: 1.6348, locale: 'en-AU', label: 'AUD — A$ Australian Dollar', decimals: 2, prefix: 'A$' },
    GBP: { rate: 0.86653, locale: 'en-GB', label: 'GBP — £ Pound Sterling', decimals: 2, prefix: '£' },
    PLN: { rate: 4.2615, locale: 'pl-PL', label: 'PLN — zł Polish Złoty', decimals: 2, suffix: ' zł' },
    CHF: { rate: 0.9248, locale: 'de-CH', label: 'CHF — Swiss Franc', decimals: 2, prefix: 'CHF ' },
    CAD: { rate: 1.6228, locale: 'en-CA', label: 'CAD — CA$ Canadian Dollar', decimals: 2, prefix: 'CA$' },
    RUB: { rate: 84.1684, locale: 'ru-RU', label: 'RUB — ₽ Russian Rouble', decimals: 0, suffix: ' ₽' },
    SGD: { rate: 1.4804, locale: 'en-SG', label: 'SGD — S$ Singapore Dollar', decimals: 2, prefix: 'S$' }
  };

  function safeReadCurrency() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return currencies[value] ? value : BASE_CURRENCY;
    } catch (error) {
      return BASE_CURRENCY;
    }
  }

  function safeStoreCurrency(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {}
  }

  function parseEuroAmount(value) {
    return Number(String(value).replace(',', '.'));
  }

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
    var targets = getTargets();
    targets.forEach(function (node) {
      if (!node.dataset.bcpEurOriginal) {
        node.dataset.bcpEurOriginal = node.textContent;
      }
      node.textContent = convertText(node.dataset.bcpEurOriginal, code);
    });

    document.querySelectorAll('[data-currency-select]').forEach(function (select) {
      select.value = code;
    });
    document.querySelectorAll('[data-currency-status]').forEach(function (status) {
      status.textContent = code === BASE_CURRENCY
        ? 'Checkout currency · EUR'
        : 'Indicative display · Checkout remains in EUR';
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
}());
