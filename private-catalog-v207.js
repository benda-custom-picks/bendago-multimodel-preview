/* BCP V216 — selected look catalog plus admin customer preview notice. */
(function(){
  'use strict';
  var body=document.body;
  if(!body || body.getAttribute('data-bcp-access-scope')!=='model') return;
  var model=String(body.getAttribute('data-bcp-private-catalog')||'').trim();
  if(!model) return;
  var loaded=false;
  var catalogMounted=false;
  var requestedLookId='';
  var LOOK_ROUTES={
    'strong-pure-bob-full-build':'look-parts-strong-pure-bob',
    'strong-pure-bob':'look-parts-strong-pure-bob',
    'look-parts-strong-pure-bob':'look-parts-strong-pure-bob',
    'headlight-fairing-full-build':'look-parts-headlight-fairing',
    'headlight-fairing':'look-parts-headlight-fairing',
    'look-parts-headlight-fairing':'look-parts-headlight-fairing',
    'brutal-bob-full-build':'look-parts-brutal-bob',
    'black-fat-bob':'look-parts-brutal-bob',
    'brutal-bob':'look-parts-brutal-bob',
    'look-parts-brutal-bob':'look-parts-brutal-bob',
    'blackout-predator-full-build':'look-parts-blackout-predator',
    'blackout-predator':'look-parts-blackout-predator',
    'look-parts-blackout-predator':'look-parts-blackout-predator',
    'storm-rider-66-full-build':'look-parts-storm-rider-66',
    'storm-rider-66':'look-parts-storm-rider-66',
    'look-parts-storm-rider-66':'look-parts-storm-rider-66',
    'midnight-hunter-full-build':'look-parts-midnight-hunter',
    'midnight-hunter':'look-parts-midnight-hunter',
    'look-parts-midnight-hunter':'look-parts-midnight-hunter',
    'shadow-beast-v4-full-build':'look-parts-shadow-beast-v4',
    'shadow-beast-v4':'look-parts-shadow-beast-v4',
    'look-parts-shadow-beast-v4':'look-parts-shadow-beast-v4'
  };

  function cleanText(value,max){
    return String(value||'').replace(/[\u0000-\u001F\u007F]/g,' ').replace(/\s+/g,' ').trim().slice(0,max||120);
  }
  function emit(name,extra){
    var payload=Object.assign({
      event:name,
      source_page:location.pathname || '/',
      source_scope:'model',
      source_build_key:'',
      source_build_name:''
    },extra||{});
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push(payload);
    if(typeof window.gtag==='function') window.gtag('event',name,payload);
    try{ window.dispatchEvent(new CustomEvent('bcp:conversion',{detail:payload})); }catch(error){}
  }
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
      return r.json().catch(function(){return {};}).then(function(data){
        if(!r.ok || !data || data.ok!==true){
          var error=new Error((data&&data.error)||'Build Access required.');
          error.status=r.status;
          error.code=(r.status===401 || r.status===403) ? 'access_denied' : 'catalog_unavailable';
          throw error;
        }
        return data;
      });
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
  function hashKey(){
    if(requestedLookId) return requestedLookId;
    var raw=(location.hash||'').replace(/^#/,'');
    if(!raw) return '';
    try{return decodeURIComponent(raw);}catch(error){return raw;}
  }
  function setRequestedLook(lookId){
    var key=cleanText(lookId,100);
    if(!key) return;
    requestedLookId=key;
    var targetId=LOOK_ROUTES[key] || key;
    try{ history.replaceState(null,'','#'+encodeURIComponent(targetId)); }catch(error){ location.hash=targetId; }
  }
  function selectedPrivateLook(){
    var key=hashKey();
    var targetId=LOOK_ROUTES[key] || key;
    var target=document.getElementById(targetId);
    if(!target || !target.classList.contains('bcp-look-parts-panel-v16m')) return null;
    return target;
  }
  function injectStyle(){
    if(document.getElementById('bcp-v206-post-access-style')) return;
    var style=document.createElement('style');
    style.id='bcp-v206-post-access-style';
    style.textContent=''
      +'.bcp-post-access-v206{margin:14px 0 18px;padding:16px 18px;border:1px solid rgba(224,180,93,.45);border-radius:16px;background:linear-gradient(135deg,rgba(224,180,93,.14),rgba(255,255,255,.035));box-shadow:0 14px 32px rgba(0,0,0,.18)}'
      +'.bcp-post-access-v206-kicker{display:block;margin-bottom:4px;color:#e0b45d;font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}'
      +'.bcp-post-access-v206 h4{margin:0 0 7px;color:#fff;font-size:clamp(1.15rem,2.4vw,1.55rem);line-height:1.15}'
      +'.bcp-post-access-v206 p{margin:0 0 13px;max-width:62ch;color:rgba(255,255,255,.78);line-height:1.5}'
      +'.bcp-post-access-v206-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
      +'.bcp-post-access-v206 .bcp-look-fast-action-v174{margin:0!important;display:inline-flex!important}'
      +'.bcp-post-access-v206 .bcp-look-full-add-v16m{min-height:48px!important}'
      +'.bcp-post-access-v206-secondary{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 16px;border:1px solid rgba(255,255,255,.32);border-radius:13px;color:#fff;text-decoration:none;font-weight:750}'
      +'.bcp-post-access-v206-secondary:hover,.bcp-post-access-v206-secondary:focus-visible{border-color:#e0b45d;color:#fff}'
      +'@media(max-width:640px){.bcp-post-access-v206{padding:15px}.bcp-post-access-v206-actions{align-items:stretch;flex-direction:column}.bcp-post-access-v206 .bcp-look-fast-action-v174,.bcp-post-access-v206 .bcp-look-full-add-v16m,.bcp-post-access-v206-secondary{display:flex!important;width:100%}}';
    document.head.appendChild(style);
  }
  function insertPostAccessPanel(target){
    if(!target || target.querySelector('.bcp-post-access-v206')) return;
    var bodyNode=target.querySelector('.bcp-look-parts-body-v16m') || target;
    var titleNode=bodyNode.querySelector('h3');
    var nativeButton=bodyNode.querySelector('[data-add-bundle]');
    var nativeAction=nativeButton && nativeButton.closest ? nativeButton.closest('.bcp-look-fast-action-v174') : null;
    if(!titleNode || !nativeButton || !nativeAction) return;
    var name=cleanText(titleNode.textContent,100) || 'this build';
    var panel=document.createElement('section');
    panel.className='bcp-post-access-v206';
    panel.setAttribute('aria-label','Unlocked '+name+' selection');
    var kicker=document.createElement('span'); kicker.className='bcp-post-access-v206-kicker'; kicker.textContent='Your selection is unlocked';
    var heading=document.createElement('h4'); heading.textContent=name;
    var copy=document.createElement('p'); copy.textContent='The exact selected upgrades for this build are ready below. Complete the build in one step, or choose individual parts.';
    var actions=document.createElement('div'); actions.className='bcp-post-access-v206-actions';
    nativeButton.textContent='Complete this build · Save 5%';
    nativeButton.setAttribute('aria-label','Complete the '+name+' build and add selected parts to cart');
    actions.appendChild(nativeAction);
    var individual=document.createElement('a');
    individual.className='bcp-post-access-v206-secondary';
    individual.href='#shop-part-by-part';
    individual.textContent='Choose parts individually';
    individual.setAttribute('aria-label','Choose individual upgrades instead of the complete '+name+' build');
    individual.addEventListener('click',function(){
      emit('private_look_individual_parts_click',{source_build_key:target.getAttribute('data-cart-look-context')||'',source_build_name:name});
    });
    nativeButton.addEventListener('click',function(){
      emit('complete_look_clicked',{source_build_key:target.getAttribute('data-cart-look-context')||'',source_build_name:name});
      window.setTimeout(function(){
        emit('complete_look_added_to_cart',{source_build_key:target.getAttribute('data-cart-look-context')||'',source_build_name:name});
      },0);
    });
    panel.appendChild(kicker); panel.appendChild(heading); panel.appendChild(copy); panel.appendChild(actions);
    titleNode.insertAdjacentElement('afterend',panel);
  }
  function routeToSelectedLook(){
    var target=selectedPrivateLook();
    if(!target) return;
    injectStyle();
    insertPostAccessPanel(target);
    var name=cleanText((target.querySelector('h3')||{}).textContent,100);
    emit('private_look_opened',{source_build_key:target.getAttribute('data-cart-look-context')||'',source_build_name:name});
    window.requestAnimationFrame(function(){
      target.scrollIntoView({behavior:'auto',block:'start'});
    });
  }
  function mountPreviewNotice(data){
    var old=document.getElementById('bcp-customer-preview-notice-v216');
    if(old && old.parentNode) old.parentNode.removeChild(old);
    if(!data || data.preview!==true) return;
    var full=document.getElementById('full-look-parts');
    if(!full || !full.parentNode) return;
    var notice=document.createElement('aside');
    notice.id='bcp-customer-preview-notice-v216';
    notice.setAttribute('role','status');
    notice.style.cssText='margin:14px auto;width:min(1180px,calc(100% - 32px));padding:12px 14px;border:1px solid rgba(246,196,49,.55);border-radius:14px;background:rgba(246,196,49,.11);color:#fff;font:800 .88rem/1.35 system-ui,-apple-system,Segoe UI,sans-serif';
    notice.textContent='Customer preview — '+(data.access_look_name||'selected build')+'. This browser is limited exactly like a customer. Stripe checkout is disabled.';
    full.parentNode.insertBefore(notice,full);
  }
  function hydrate(data){
    var full=document.getElementById('full-look-parts');
    var shop=document.getElementById('shop-part-by-part');
    if(!full || !shop || !data.sections) throw new Error('Private catalog mount unavailable.');
    full.innerHTML=String(data.sections.full_look_html||'');
    shop.innerHTML=String(data.sections.shop_html||'');
    setCatalogVisible(true);
  }
  function bindPrivateAssets(results){
    var orderReady=results[0] && results[0].status==='fulfilled';
    var cartReady=results[1] && results[1].status==='fulfilled';
    if(orderReady && window.BendagoOrderFlow && typeof window.BendagoOrderFlow.bindCatalog==='function') window.BendagoOrderFlow.bindCatalog();
    if(cartReady && window.BendagoCart && typeof window.BendagoCart.bindCatalog==='function') window.BendagoCart.bindCatalog();
    if(!orderReady || !cartReady){
      try{ window.dispatchEvent(new CustomEvent('bcp:private-catalog-assets-degraded')); }catch(error){}
    }
  }
  function load(){
    if(catalogMounted){ routeToSelectedLook(); return; }
    if(loaded) return;
    loaded=true;
    setCatalogVisible(false);
    setCatalogBusy(true);
    privateFetch('/api/private-catalog/'+encodeURIComponent(model)).then(function(data){
      /* Access is confirmed and catalog HTML is mounted before optional runtime assets.
         Asset failures must never hide a paid/admin catalog or revoke its UI state. */
      hydrate(data);
      mountPreviewNotice(data);
      window.BENDAGO_CUSTOMER_PREVIEW = !!(data && data.preview===true);
      /* V215: the paid entitlement owns one exact build. The cart uses this same key for its single sticky video. */
      if (data && data.access_look_key) {
        requestedLookId = String(data.access_look_key);
        window.BENDAGO_ACTIVE_ACCESS_LOOK = requestedLookId;
        try { sessionStorage.setItem('bcp_active_access_look_v215', requestedLookId); } catch (ignore) {}
      } else {
        window.BENDAGO_ACTIVE_ACCESS_LOOK = '';
        try { sessionStorage.removeItem('bcp_active_access_look_v215'); } catch (ignore) {}
      }
      catalogMounted=true;
      setCatalogBusy(false);
      routeToSelectedLook();
      return Promise.allSettled([
        loadScript('/api/private-assets/order-flow.js'),
        loadScript('/api/private-assets/cart-flow.js')
      ]);
    }).then(function(results){
      bindPrivateAssets(results);
      try{ window.dispatchEvent(new CustomEvent('bcp:private-catalog-ready')); }catch(error){}
    }).catch(function(error){
      loaded=false;
      catalogMounted=false;
      setCatalogBusy(false);
      /* Only an explicit entitlement denial returns the front to locked mode.
         A transient catalog failure does not falsely erase a valid admin/paid state. */
      if(error && error.code==='access_denied') showUnavailable();
      else {
        try{ window.dispatchEvent(new CustomEvent('bcp:private-catalog-unavailable')); }catch(ignore){}
      }
    });
  }
  function handlePrivateLookRequest(event){
    var detail=event && event.detail ? event.detail : {};
    setRequestedLook(detail.look_id || '');
    load();
  }
  window.addEventListener('bcp:access-granted',load);
  window.addEventListener('bcp:private-look-request',handlePrivateLookRequest);
  if(document.documentElement.classList.contains('bcp-access-granted')) load();
}());
