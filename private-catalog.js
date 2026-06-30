/* BCP V205 — private slots become visible only after authenticated catalog data is mounted. */
(function(){
  'use strict';
  var body=document.body;
  if(!body || body.getAttribute('data-bcp-access-scope')!=='model') return;
  var model=String(body.getAttribute('data-bcp-private-catalog')||'').trim();
  if(!model) return;
  var loaded=false;
  function loadScript(src){
    return new Promise(function(resolve,reject){
      if(document.querySelector('script[data-bcp-private-src="'+src+'"]')) return resolve();
      var s=document.createElement('script');
      s.src=src; s.async=false; s.setAttribute('data-bcp-private-src',src);
      s.onload=function(){resolve();}; s.onerror=function(){reject(new Error('Private catalog asset unavailable.'));};
      document.head.appendChild(s);
    });
  }
  function privateFetch(path){
    return fetch(path,{credentials:'same-origin',cache:'no-store',headers:{'Accept':'application/json'}}).then(function(r){
      return r.json().catch(function(){return {};}).then(function(data){ if(!r.ok || !data || data.ok!==true) throw new Error((data&&data.error)||'Build Access required.'); return data; });
    });
  }
  function setCatalogBusy(isBusy){
    ['full-look-parts','shop-part-by-part'].forEach(function(id){
      var slot=document.getElementById(id);
      if(slot) slot.setAttribute('aria-busy',isBusy ? 'true' : 'false');
    });
  }
  function setCatalogVisible(isVisible){
    ['full-look-parts','shop-part-by-part'].forEach(function(id){
      var slot=document.getElementById(id);
      if(!slot) return;
      slot.hidden=!isVisible;
      if(isVisible) slot.style.display='';
    });
  }
  function showUnavailable(){
    var full=document.getElementById('full-look-parts');
    var shop=document.getElementById('shop-part-by-part');
    [full,shop].forEach(function(el){ if(el){el.innerHTML=''; el.hidden=true; el.style.display='none';} });
    setCatalogBusy(false);
    document.documentElement.classList.remove('bcp-access-granted');
    document.documentElement.classList.add('bcp-access-locked');
  }
  function restoreDeepLookAnchor(){
    var raw=(location.hash||'').replace(/^#/,'');
    if(!raw) return;
    var map={
      'strong-pure-bob-full-build':'look-parts-strong-pure-bob',
      'headlight-fairing-full-build':'look-parts-headlight-fairing',
      'brutal-bob-full-build':'look-parts-brutal-bob',
      'blackout-predator-full-build':'look-parts-blackout-predator',
      'storm-rider-66-full-build':'look-parts-storm-rider-66',
      'midnight-hunter-full-build':'look-parts-midnight-hunter',
      'shadow-beast-v4-full-build':'look-parts-shadow-beast-v4'
    };
    var targetId=map[raw] || raw;
    var target=document.getElementById(targetId);
    if(!target) return;
    window.requestAnimationFrame(function(){
      target.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }
  function hydrate(data){
    var full=document.getElementById('full-look-parts');
    var shop=document.getElementById('shop-part-by-part');
    if(!full || !shop || !data.sections) throw new Error('Private catalog mount unavailable.');
    full.innerHTML=String(data.sections.full_look_html||'');
    shop.innerHTML=String(data.sections.shop_html||'');
    setCatalogVisible(true);
  }
  function load(){
    if(loaded) return;
    loaded=true;
    setCatalogVisible(false);
    setCatalogBusy(true);
    privateFetch('/api/private-catalog/'+encodeURIComponent(model)).then(function(data){
      hydrate(data);
      setCatalogBusy(false);
      restoreDeepLookAnchor();
      return loadScript('/api/private-assets/order-flow.js');
    }).then(function(){
      return loadScript('/api/private-assets/cart-flow.js');
    }).then(function(){
      if(window.BendagoOrderFlow && typeof window.BendagoOrderFlow.bindCatalog==='function') window.BendagoOrderFlow.bindCatalog();
      if(window.BendagoCart && typeof window.BendagoCart.bindCatalog==='function') window.BendagoCart.bindCatalog();
      window.dispatchEvent(new CustomEvent('bcp:private-catalog-ready'));
    }).catch(function(){
      loaded=false;
      showUnavailable();
    });
  }
  window.addEventListener('bcp:access-granted',load);
  if(document.documentElement.classList.contains('bcp-access-granted')) load();
}());
