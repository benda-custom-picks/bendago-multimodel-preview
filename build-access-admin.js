/* BCP V160 — private admin catalog access. The key is never stored in GitHub, localStorage or cookies. */
(function(){
  'use strict';
  var form = document.getElementById('bcp-admin-access-form');
  var keyInput = document.getElementById('bcp-admin-access-key');
  var status = document.getElementById('bcp-admin-access-status');
  if(!form || !keyInput) return;

  function setStatus(message, isError){
    if(!status) return;
    status.textContent = message || '';
    status.style.color = isError ? '#ffaaa7' : '#dfe7d2';
  }

  form.addEventListener('submit', function(event){
    event.preventDefault();
    var adminKey = String(keyInput.value || '');
    if(!adminKey){
      setStatus('Enter your admin key.', true);
      keyInput.focus();
      return;
    }

    var button = form.querySelector('button[type="submit"]');
    if(button){ button.disabled = true; button.textContent = 'Unlocking…'; }
    setStatus('');

    fetch('/api/build-access/admin/grant', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_key: adminKey })
    }).then(function(response){
      return response.json().catch(function(){ return {}; }).then(function(data){
        if(!response.ok || !data || !data.ok) throw new Error('Private access could not be granted.');
        return data;
      });
    }).then(function(){
      keyInput.value = '';
      setStatus('Access granted. Opening the catalog…');
      window.setTimeout(function(){ window.location.assign('./index.html'); }, 350);
    }).catch(function(){
      keyInput.value = '';
      setStatus('Private access could not be granted.', true);
      if(button){ button.disabled = false; button.textContent = 'Unlock catalog'; }
    });
  });
}());
