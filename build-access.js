/* BCP V159 — Build Access client + direct GA4 tracking (no GTM event tag required). */
(function(){
  'use strict';
  var API_BASE = '/api';
  var PRICE = '€2';
  var PRICE_EUR = 2;
  var GA4_MEASUREMENT_ID = 'G-ZF5JHJ7388';
  var GA4_SCRIPT_ID = 'bcp-build-access-ga4';
  var root = document.documentElement;
  var body = document.body;
  if (!body) return;
  var scope = body.getAttribute('data-bcp-access-scope') || '';
  var activeSourceSection = '';
  var clickedLookCard = null;
  var firedLockedViews = Object.create(null);
  var pendingContextKey = 'bcp_build_access_tracking_context_v159';

  function cleanText(value, maxLength){
    return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength || 100);
  }
  function cleanPath(){
    var p = location.pathname || '/';
    if(!p.startsWith('/') || p.indexOf('//') === 0) p = '/';
    return p + (location.hash || '');
  }
  function directLookCard(){
    if(scope !== 'model') return null;
    var rawHash = (location.hash || '').replace(/^#/, '');
    if(!rawHash) return null;
    var id = '';
    try{ id = decodeURIComponent(rawHash); }catch(error){ id = rawHash; }
    var target = document.getElementById(id);
    if(!target) return null;
    if(target.classList && target.classList.contains('look-card')) return target;
    return target.closest ? target.closest('.look-card') : null;
  }
  function selectedLookCard(){ return directLookCard() || clickedLookCard; }
  function directLookName(){
    var look = selectedLookCard();
    if(!look) return '';
    var title = look.querySelector('h3');
    return cleanText(title ? title.textContent : '', 120);
  }
  function sourceBuildKey(){
    var look = selectedLookCard();
    if(look && look.id) return cleanText(look.id, 80);
    var hash = cleanText((location.hash || '').replace(/^#/, ''), 80);
    if(hash) return hash;
    var file = cleanText((location.pathname || '').split('/').pop() || '', 120).replace(/\.html$/i, '');
    if(scope === 'guide') return file.replace(/-benda-(napoleon|dark-flag).*/i, '').replace(/-custom-build$/i, '');
    return '';
  }
  function sourceBuildName(){
    var directName = directLookName();
    if(directName) return directName;
    var h1 = document.querySelector('h1');
    return cleanText(h1 ? h1.textContent : '', 120);
  }
  function defaultSourceSection(){
    if(scope === 'model') return 'full_look';
    if(scope === 'guide') return 'build_guide';
    if(scope === 'product') return 'product_page';
    if(scope === 'cart') return 'cart';
    if(scope === 'home') return 'home';
    if(scope === 'access') return 'access_page';
    if(scope === 'return') return 'payment_return';
    return 'catalog';
  }
  function currentSourceSection(){ return activeSourceSection || defaultSourceSection(); }
  function eventPayload(extra){
    var payload = {
      source_page: cleanPath(),
      source_scope: cleanText(scope || 'unknown', 40),
      source_section: cleanText(currentSourceSection(), 60),
      source_build_key: cleanText(sourceBuildKey(), 80),
      source_build_name: cleanText(sourceBuildName(), 120),
      access_price_eur: PRICE_EUR,
      access_price_cents: 200
    };
    Object.keys(extra || {}).forEach(function(key){
      if(extra[key] !== undefined && extra[key] !== null && extra[key] !== '') payload[key] = extra[key];
    });
    return payload;
  }
  function initDirectGa4(){
    if(window.__bcpBuildAccessGa4Ready) return;
    window.dataLayer = window.dataLayer || [];
    if(typeof window.gtag !== 'function'){
      window.gtag = function(){ window.dataLayer.push(arguments); };
    }
    window.gtag('js', new Date());
    /* send_page_view=false prevents a duplicate page view beside the existing GTM setup. */
    window.gtag('config', GA4_MEASUREMENT_ID, { send_page_view: false });
    if(!document.getElementById(GA4_SCRIPT_ID)){
      var script = document.createElement('script');
      script.id = GA4_SCRIPT_ID;
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_MEASUREMENT_ID);
      document.head.appendChild(script);
    }
    window.__bcpBuildAccessGa4Ready = true;
  }
  function track(eventName, extra){
    var payload = eventPayload(extra);
    initDirectGa4();
    /* Debug visibility in GTM without relying on a GTM custom-event tag for delivery. */
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: 'bcp_build_access_tracking', bcp_event_name: eventName }, payload));
    if(typeof window.gtag === 'function') window.gtag('event', eventName, payload);
  }
  function rememberCheckoutContext(){
    try{
      sessionStorage.setItem(pendingContextKey, JSON.stringify(eventPayload({ checkout_initiated: true })));
    }catch(error){}
  }
  function readCheckoutContext(){
    try{
      var raw = sessionStorage.getItem(pendingContextKey);
      return raw ? JSON.parse(raw) : {};
    }catch(error){ return {}; }
  }
  function clearCheckoutContext(){
    try{ sessionStorage.removeItem(pendingContextKey); }catch(error){}
  }
  function markLockedView(section){
    section = cleanText(section || defaultSourceSection(), 60);
    activeSourceSection = section;
    if(firedLockedViews[section]) return;
    firedLockedViews[section] = true;
    track('build_access_view_locked', { source_section: section });
  }
  function observeLockedTarget(el, section){
    if(!el) return;
    if(!('IntersectionObserver' in window)) return;
    var seen = false;
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting && entry.intersectionRatio >= 0.15){
          activeSourceSection = section;
          if(!seen){ seen = true; markLockedView(section); }
        }
      });
    }, { threshold: [0.15] });
    observer.observe(el);
  }
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
    panel.setAttribute('data-bcp-source-section', context || defaultSourceSection());
    panel.innerHTML='<b>Custom parts only · motorcycle not included</b><h2>Unlock the exact parts for this build</h2><p>See the exact parts list, options, galleries and cart access for 30 days. The motorcycle shown is not for sale.</p><button type="button" class="bcp-access-unlock-btn" data-bcp-unlock>Unlock exact parts list · '+PRICE+'</button><small>Custom parts only · One payment · Secure Stripe checkout · Not a subscription</small>';
    return panel;
  }
  function insertOnce(anchor, where, context){
    if(document.querySelector('[data-bcp-access-panel]')) return;
    var panel=unlockPanel(context);
    if(!anchor){ body.insertBefore(panel, body.firstChild); return; }
    if(where==='before') anchor.parentNode.insertBefore(panel,anchor);
    else anchor.parentNode.insertBefore(panel,anchor.nextSibling);
  }
  function blur(el){ if(el) el.classList.add('bcp-access-blur-target'); }
  function lockHome(){
    insertOnce(document.querySelector('.hero-band'),'after','home');
    markLockedView('home');
  }
  function lockModel(){
    var looks=document.querySelector('#looks');
    var fullLook=document.querySelector('#full-look-parts');
    var individual=document.querySelector('#shop-part-by-part .product-grid');
    var look=directLookCard();
    var lookContext=look && look.id ? look.id : 'full_look';
    if(look) insertOnce(look,'after',lookContext);
    else insertOnce(looks,'after','full_look');
    blur(fullLook);
    blur(individual);
    if(fullLook){ markLockedView(lookContext); observeLockedTarget(fullLook,'full_look'); }
    if(individual){ observeLockedTarget(individual,'individual_upgrades'); }
  }
  function lockGuide(){
    var grid=document.querySelector('.bcp-watch-grid');
    insertOnce(grid,'after','build_guide');
    markLockedView('build_guide');
  }
  function lockProduct(){
    var main=document.querySelector('main');
    insertOnce(main,'before','product_page');
    blur(main);
    markLockedView('product_page');
  }
  function lockCart(){
    var main=document.querySelector('main');
    insertOnce(main,'before','cart');
    blur(main);
    markLockedView('cart');
  }
  function lock(){
    root.classList.remove('bcp-access-pending');
    /* V162: SEO build-guide pages stay fully public. Build Access applies only to catalog, product and cart surfaces. */
    if(scope==='guide') return;
    root.classList.add('bcp-access-locked');
    if(scope==='home') lockHome();
    else if(scope==='model') lockModel();
    else if(scope==='product') lockProduct();
    else if(scope==='cart') lockCart();
  }
  function grant(){ root.classList.remove('bcp-access-pending','bcp-access-locked'); }
  function checkout(button){
    var panel = button && button.closest ? button.closest('[data-bcp-access-panel]') : null;
    if(panel && panel.getAttribute('data-bcp-source-section')) activeSourceSection = panel.getAttribute('data-bcp-source-section');
    track('build_access_checkout_click');
    rememberCheckoutContext();
    if(button) { button.disabled=true; button.textContent='Opening secure checkout…'; }
    api('/build-access/create-checkout-session',{method:'POST',body:JSON.stringify({source_page:cleanPath(),source_build_key:sourceBuildKey(),source_build_name:sourceBuildName()})})
      .then(function(data){
        if(!data.checkout_url) throw new Error('Secure checkout could not be created.');
        track('build_access_checkout_created');
        location.assign(data.checkout_url);
      })
      .catch(function(error){
        track('build_access_checkout_error', { error_stage: 'create_checkout' });
        if(button){button.disabled=false;button.textContent=button.getAttribute('data-bcp-unlock-label') || 'Unlock exact parts list · '+PRICE;}
        alert(error.message || 'Secure checkout is unavailable.');
      });
  }
  function setPanelBuildCopy(panel, lookCard){
    if(!panel || !lookCard) return;
    var titleNode=lookCard.querySelector('.look-body h3');
    var buildName=cleanText(titleNode ? titleNode.textContent : '', 90);
    if(!buildName) return;
    var kicker=panel.querySelector('b');
    var title=panel.querySelector('h2');
    var copy=panel.querySelector('p');
    var button=panel.querySelector('[data-bcp-unlock]');
    if(kicker) kicker.textContent='Custom parts only · motorcycle not included';
    if(title) title.textContent='Unlock exact parts for '+buildName;
    if(copy) copy.textContent='See the exact parts used on this build, options, galleries and cart access for 30 days. Motorcycle not included.';
    if(button){
      var label='Unlock exact parts list · '+PRICE;
      button.textContent=label;
      button.setAttribute('data-bcp-unlock-label',label);
    }
  }
  function scrollToLockedAccessPanel(lookCta){
    if(!root.classList.contains('bcp-access-locked')) return false;
    var panel=document.querySelector('[data-bcp-access-panel]');
    if(!panel) return false;
    var lookCard=lookCta && lookCta.closest ? lookCta.closest('.look-card') : null;
    if(lookCard){
      clickedLookCard=lookCard;
      var lookContext=lookCard.id || 'full_look';
      panel.setAttribute('data-bcp-source-section',lookContext);
      setPanelBuildCopy(panel,lookCard);
      activeSourceSection=lookContext;
      if(lookCard.parentNode && panel.previousElementSibling!==lookCard) lookCard.parentNode.insertBefore(panel,lookCard.nextSibling);
    }else{
      var context=panel.getAttribute('data-bcp-source-section');
      if(context) activeSourceSection=context;
    }
    panel.scrollIntoView({behavior:'smooth',block:'center'});
    window.setTimeout(function(){
      var button=panel.querySelector('[data-bcp-unlock]');
      if(button && typeof button.focus==='function') button.focus({preventScroll:true});
    },420);
    return true;
  }
  function bind(){
    document.addEventListener('click',function(event){
      var lookCta=event.target.closest('.bcp-look-scroll-link-v16m');
      if(lookCta && scrollToLockedAccessPanel(lookCta)){
        event.preventDefault();
        return;
      }
      var button=event.target.closest('[data-bcp-unlock]');
      if(!button)return;
      event.preventDefault();
      checkout(button);
    });
  }
  function confirmReturn(){
    var status=document.querySelector('[data-bcp-return-status]');
    var id=new URLSearchParams(location.search).get('session_id') || '';
    if(!id){
      if(status)status.textContent='Payment was not completed. You can return to the showroom.';
      return;
    }
    api('/build-access/confirm?session_id='+encodeURIComponent(id)).then(function(data){
      var remembered = readCheckoutContext();
      if(remembered && remembered.source_section) activeSourceSection = remembered.source_section;
      if(status)status.textContent='Access granted. Opening your catalog…';
      track('build_access_paid', { source_page: cleanText((remembered && remembered.source_page) || cleanPath(), 180), source_scope: cleanText((remembered && remembered.source_scope) || scope, 40), source_section: cleanText((remembered && remembered.source_section) || currentSourceSection(), 60), source_build_key: cleanText((remembered && remembered.source_build_key) || sourceBuildKey(), 80), source_build_name: cleanText((remembered && remembered.source_build_name) || sourceBuildName(), 120) });
      clearCheckoutContext();
      var next=(data && data.source_page && String(data.source_page).startsWith('/')) ? data.source_page : '/';
      setTimeout(function(){location.assign(next);},700);
    }).catch(function(error){
      track('build_access_checkout_error', { error_stage: 'confirm_access' });
      if(status)status.textContent=error.message || 'We could not confirm access yet.';
    });
  }
  bind();
  if(scope==='access'){ grant(); return; }
  if(scope==='return'){ grant(); confirmReturn(); return; }
  api('/build-access/status').then(grant).catch(lock);
}());
