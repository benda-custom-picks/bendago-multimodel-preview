(function () {
  'use strict';

  var page = document.body && document.body.getAttribute('data-bcp-build-access-page');
  if (!page) return;

  var accessPrice = 4.90;
  var statusNode = document.querySelector('[data-build-access-status]');

  function cleanPath(value) {
    var path = String(value || '').trim();
    if (!path || path.charAt(0) !== '/' || path.indexOf('//') === 0 || path.indexOf('://') !== -1) return location.pathname;
    return path.slice(0, 180);
  }

  function context() {
    var params = new URLSearchParams(location.search);
    return {
      source_page: cleanPath(params.get('source_page') || location.pathname),
      source_build_key: String(params.get('source_build_key') || '').slice(0, 80),
      source_build_name: String(params.get('source_build_name') || '').slice(0, 120),
      access_price_eur: accessPrice
    };
  }

  function track(name, extra) {
    window.dataLayer = window.dataLayer || [];
    var payload = Object.assign({ event: name }, context(), extra || {});
    window.dataLayer.push(payload);
  }

  function setStatus(message, state) {
    if (!statusNode) return;
    statusNode.textContent = message || '';
    if (state) statusNode.setAttribute('data-state', state);
    else statusNode.removeAttribute('data-state');
  }

  async function getAccessStatus() {
    var response = await fetch('/api/build-access/status', { credentials: 'same-origin', cache: 'no-store' });
    var body = {};
    try { body = await response.json(); } catch (error) {}
    return { ok: response.ok && body && body.access === 'granted', status: response.status, body: body };
  }

  async function beginCheckout(button) {
    var ctx = context();
    button.disabled = true;
    setStatus('Opening secure payment…');
    track('build_access_checkout_started');

    try {
      var response = await fetch('/api/build-access/create-checkout-session', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx)
      });
      var body = await response.json();
      if (!response.ok || !body.checkout_url) throw new Error((body && body.error) || 'Unable to start secure checkout.');
      window.location.assign(body.checkout_url);
    } catch (error) {
      button.disabled = false;
      setStatus(error && error.message ? error.message : 'Unable to start secure checkout.', 'error');
      track('build_access_denied', { deny_reason: 'checkout_start_failed' });
    }
  }

  function initLanding() {
    track('build_access_open');
    var params = new URLSearchParams(location.search);
    if (params.get('payment') === 'stripe_cancelled') {
      setStatus('Payment was cancelled. Your catalog access has not been activated.', 'error');
      track('build_access_denied', { deny_reason: 'payment_cancelled' });
    }

    var button = document.querySelector('[data-build-access-checkout]');
    if (button) button.addEventListener('click', function () { beginCheckout(button); });

    getAccessStatus().then(function (result) {
      if (result.ok) {
        setStatus('Build Access is already active on this browser.', 'success');
        if (button) button.querySelector('span').textContent = 'Build Access is active';
      }
    }).catch(function () {});
  }

  function initReturn() {
    var copy = document.querySelector('[data-build-access-return-copy]');
    var actions = document.querySelector('[data-build-access-return-actions]');
    getAccessStatus().then(function (result) {
      if (!result.ok) {
        setStatus('Payment could not be confirmed on this browser. Return to Build Access and try again.', 'error');
        track('build_access_denied', { deny_reason: 'return_not_authorized' });
        return;
      }
      if (copy) copy.textContent = 'Build Access is active. Your full catalog access is confirmed on this browser.';
      setStatus('Access confirmed.', 'success');
      if (actions) actions.hidden = false;
      track('build_access_paid');
      track('build_access_unlocked');
    }).catch(function () {
      setStatus('We could not verify access right now. Refresh this page once.', 'error');
      track('build_access_denied', { deny_reason: 'return_status_unavailable' });
    });
  }

  if (page === 'landing') initLanding();
  if (page === 'return') initReturn();
})();
