/* BCP V220 — full admin catalog or exact customer-look preview. Safe paste normalization and actionable errors. */
(function(){
  'use strict';
  var form = document.getElementById('bcp-admin-access-form');
  var keyInput = document.getElementById('bcp-admin-access-key');
  var status = document.getElementById('bcp-admin-access-status');
  if(!form || !keyInput) return;

  var previews = [
    ['strong-pure-bob','Customer preview — Strong Pure Bob'],
    ['headlight-fairing','Customer preview — Headlight Fairing Build'],
    ['black-fat-bob','Customer preview — Brutal Bob Build'],
    ['blackout-predator','Customer preview — Blackout Predator'],
    ['storm-rider-66','Customer preview — Storm Rider 66 Build'],
    ['midnight-hunter','Customer preview — Midnight Hunter Build'],
    ['shadow-beast-v4','Customer preview — Shadow Monster Bike']
  ];

  var label = document.createElement('label');
  label.htmlFor = 'bcp-admin-access-mode';
  label.textContent = 'Open as';
  label.style.cssText = 'display:block;text-align:left;margin:14px auto 8px;max-width:390px;color:var(--bcp-access-muted);font-size:.85rem';
  var select = document.createElement('select');
  select.id = 'bcp-admin-access-mode';
  select.name = 'access_mode';
  select.style.cssText = 'width:min(390px,100%);box-sizing:border-box;min-height:50px;border-radius:14px;border:1px solid var(--bcp-access-line);background:#090d14;color:#f7f7f7;padding:0 14px;font:600 1rem/1 system-ui,-apple-system,Segoe UI,sans-serif';
  var full = document.createElement('option');
  full.value = 'admin';
  full.textContent = 'Full admin catalog';
  select.appendChild(full);
  previews.forEach(function(item){ var option=document.createElement('option'); option.value=item[0]; option.textContent=item[1]; select.appendChild(option); });
  var note = document.createElement('p');
  note.id = 'bcp-admin-preview-note';
  note.style.cssText = 'min-height:1.5em;margin:9px auto 0;max-width:390px;color:var(--bcp-access-muted);font-size:.78rem;line-height:1.4;text-align:left';
  var button = form.querySelector('button[type="submit"]');
  form.insertBefore(label, button);
  form.insertBefore(select, button);
  form.insertBefore(note, button);

  function setStatus(message, isError){
    if(!status) return;
    status.textContent = message || '';
    status.style.color = isError ? '#ffaaa7' : '#dfe7d2';
  }
  function refreshCopy(){
    var isPreview = select.value !== 'admin';
    note.textContent = isPreview ? 'Creates a temporary one-look customer view. The cart works, but Stripe checkout is disabled.' : 'Unlocks the full admin catalog on this browser.';
    if(button) button.textContent = isPreview ? 'Open customer preview' : 'Unlock full catalog';
  }
  select.addEventListener('change', refreshCopy);
  refreshCopy();

  function clearPreviewCart(){
    try { localStorage.removeItem('bendago_cart_v1'); } catch(ignore) {}
    try { sessionStorage.removeItem('bcp_active_access_look_v215'); } catch(ignore) {}
    try { sessionStorage.removeItem('bendago_pending_checkout_v149'); } catch(ignore) {}
  }

  form.addEventListener('submit', function(event){
    event.preventDefault();
    var adminKey = String(keyInput.value == null ? '' : keyInput.value).replace(/^\uFEFF/, '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
    if(!adminKey){
      setStatus('Enter your admin key.', true);
      keyInput.focus();
      return;
    }
    var lookKey = String(select.value || 'admin');
    var isPreview = lookKey !== 'admin';
    if(button){ button.disabled = true; button.textContent = isPreview ? 'Opening preview…' : 'Unlocking…'; }
    setStatus('');
    var endpoint = isPreview ? '/api/build-access/admin/preview' : '/api/build-access/admin/grant';
    var payload = isPreview ? { admin_key: adminKey, look_key: lookKey } : { admin_key: adminKey };
    fetch(endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(response){
      return response.json().catch(function(){ return {}; }).then(function(data){
        if(!response.ok || !data || !data.ok) {
          throw new Error((data && data.error) ? String(data.error) : 'Private access could not be granted.');
        }
        return data;
      });
    }).then(function(data){
      keyInput.value = '';
      if(isPreview) clearPreviewCart();
      setStatus(isPreview ? 'Preview granted. Opening selected build…' : 'Full admin access granted. Opening the catalog…');
      window.setTimeout(function(){ window.location.assign(data.redirect_path || './index.html'); }, 250);
    }).catch(function(error){
      /* Preserve the field on failure so a correct key is never silently discarded. */
      setStatus((error && error.message) ? error.message : 'Private access could not be granted.', true);
      if(button){ button.disabled = false; refreshCopy(); }
    });
  });
}());
