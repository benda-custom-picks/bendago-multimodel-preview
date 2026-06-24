/* BCP V158 — Build Access client. */
(function(){
  'use strict';
  var API_BASE = '/api';
  var PRICE = '€2';
  var root = document.documentElement;
  var body = document.body;
  if (!body) return;
  var scope = body.getAttribute('data-bcp-access-scope') || '';
  function api(path, options){
    return fetch(API_BASE + path, Object.assign({credentials:'same-origin',headers:{'Content-Type':'application/json'}}, options || {})).then(function(res){
      return res.json().catch(function(){return {};}).then(function(data){
        if(!res.ok) throw new Error((data && data.error) || 'Secure catalog access is unavailable.');
        return data;
      });
    });
  }
  function unlockPanel(context){
    var panel=document.createElement('section');
    panel.className='bcp-access-unlock-panel';
    panel.setAttribute('data-bcp-access-panel','1');
    panel.innerHTML='<b>Private catalog access</b><h2>Unlock full catalog · '+PRICE+'</h2><p>Watch the build videos freely. Unlock product cards, prices, options, galleries and cart access across all Benda models for 30 days.</p><button type="button" class="bcp-access-unlock-btn" data-bcp-unlock>Unlock full catalog · '+PRICE+'</button><small>One payment · secure Stripe checkout · not a subscription</small>';
    return panel;
  }
  function insertOnce(anchor, where){
    if(document.querySelector('[data-bcp-access-panel]')) return;
    var panel=unlockPanel();
    if(!anchor){ body.insertBefore(panel, body.firstChild); return; }
    if(where==='before') anchor.parentNode.insertBefore(panel,anchor);
    else anchor.parentNode.insertBefore(panel,anchor.nextSibling);
  }
  function blur(el){ if(el) el.classList.add('bcp-access-blur-target'); }
  function lockHome(){
    insertOnce(document.querySelector('.hero-band'),'after');
  }
  function lockModel(){
    var looks=document.querySelector('#looks');
    insertOnce(looks,'after');
    blur(document.querySelector('#full-look-parts'));
    blur(document.querySelector('#shop-part-by-part .product-grid'));
  }
  function lockGuide(){
    var grid=document.querySelector('.bcp-watch-grid');
    insertOnce(grid,'after');
  }
  function lockProduct(){
    var main=document.querySelector('main');
    insertOnce(main,'before');
    blur(main);
  }
  function lockCart(){
    var main=document.querySelector('main');
    insertOnce(main,'before');
    blur(main);
  }
  function lock(){
    root.classList.remove('bcp-access-pending');
    root.classList.add('bcp-access-locked');
    if(scope==='home') lockHome();
    else if(scope==='model') lockModel();
    else if(scope==='guide') lockGuide();
    else if(scope==='product') lockProduct();
    else if(scope==='cart') lockCart();
  }
  function grant(){ root.classList.remove('bcp-access-pending','bcp-access-locked'); }
  function cleanPath(){
    var p=location.pathname || '/';
    if(!p.startsWith('/') || p.indexOf('//')===0) return '/';
    return p + (location.hash || '');
  }
  function checkout(button){
    if(button) { button.disabled=true; button.textContent='Opening secure checkout…'; }
    api('/build-access/create-checkout-session',{method:'POST',body:JSON.stringify({source_page:cleanPath(),source_build_key:'',source_build_name:''})})
      .then(function(data){ if(!data.checkout_url) throw new Error('Secure checkout could not be created.'); location.assign(data.checkout_url); })
      .catch(function(error){ if(button){button.disabled=false;button.textContent='Unlock full catalog · '+PRICE;} alert(error.message || 'Secure checkout is unavailable.'); });
  }
  function bind(){ document.addEventListener('click',function(event){ var button=event.target.closest('[data-bcp-unlock]'); if(!button)return;event.preventDefault();checkout(button); }); }
  function confirmReturn(){
    var status=document.querySelector('[data-bcp-return-status]');
    var id=new URLSearchParams(location.search).get('session_id') || '';
    if(!id){ if(status)status.textContent='Payment was not completed. You can return to the showroom.'; return; }
    api('/build-access/confirm?session_id='+encodeURIComponent(id)).then(function(data){
      if(status)status.textContent='Access granted. Opening your catalog…';
      var next=(data && data.source_page && String(data.source_page).startsWith('/')) ? data.source_page : '/';
      setTimeout(function(){location.assign(next);},450);
    }).catch(function(error){if(status)status.textContent=error.message || 'We could not confirm access yet.';});
  }
  bind();
  if(scope==='access'){ grant(); return; }
  if(scope==='return'){ grant(); confirmReturn(); return; }
  api('/build-access/status').then(grant).catch(lock);
}());
