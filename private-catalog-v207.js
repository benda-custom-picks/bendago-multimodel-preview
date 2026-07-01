/* BCP V231 — comparison-product modal cleanup; cart/order binding retained. */
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
    if(document.getElementById('bcp-v227-full-configuration-style')) return;
    var style=document.createElement('style');
    style.id='bcp-v227-full-configuration-style';
    style.textContent=''
      +'.bcp-build-summary-v227{margin:14px 0 18px;padding:15px 16px;border:1px solid rgba(224,180,93,.34);border-radius:16px;background:linear-gradient(135deg,rgba(224,180,93,.11),rgba(255,255,255,.025));box-shadow:0 14px 32px rgba(0,0,0,.16)}'
      +'.bcp-build-summary-v227-title{display:block;margin:0 0 10px;color:#fff;font-size:.92rem;font-weight:900;letter-spacing:.04em}'
      +'.bcp-build-summary-v227-list{display:grid;gap:9px;margin:0;padding:0;list-style:none}'
      +'.bcp-build-summary-v227-list li{display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.84);font-size:.92rem;line-height:1.3}'
      +'.bcp-build-summary-v227-icon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 24px;width:24px;height:24px;border:1px solid rgba(224,180,93,.46);border-radius:50%;color:#e0b45d;font-weight:950;font-size:.82rem;background:rgba(224,180,93,.08)}'
      +'.bcp-build-components-heading-v227{margin:22px 0 12px;color:#fff;font-size:1rem;font-weight:900;letter-spacing:.02em}'
      +'.bcp-look-product-grid-v16m.bcp-build-components-grid-v227{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;margin-top:0!important}'
      +'.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227{display:grid!important;grid-template-columns:86px minmax(0,1fr)!important;align-items:center!important;min-height:86px!important;padding:0!important;overflow:hidden!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:14px!important;background:rgba(255,255,255,.028)!important;box-shadow:none!important}'
      +'.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .thumb{display:block!important;width:86px!important;height:86px!important;min-height:86px!important;margin:0!important;border:0!important;border-radius:0!important;background-position:center!important;background-size:cover!important}'
      +'.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227{cursor:pointer!important;outline:none!important;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease!important}'
      +'.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227:hover{transform:translateY(-2px)!important;border-color:rgba(224,180,93,.58)!important;box-shadow:0 12px 28px rgba(0,0,0,.24)!important}'
      +'.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227:focus-visible{border-color:#e0b45d!important;box-shadow:0 0 0 3px rgba(224,180,93,.24)!important}'
      +'.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .body{padding:12px 14px!important;min-width:0!important}'
      +'.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .body h3{margin:0!important;color:#fff!important;font-size:.98rem!important;line-height:1.25!important}'
      +'.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .body h3 a{color:inherit!important;text-decoration:none!important;cursor:pointer!important}'
      +'.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .body>p,.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .product-meta,.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .small,.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .product-details-link,.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .add-preview{display:none!important}'
      +'.bcp-private-product-panel-v229{position:fixed!important;inset:0!important;z-index:2147483000!important;display:none!important;align-items:center!important;justify-content:center!important;padding:18px!important;background:rgba(0,0,0,.78)!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important}'
      +'.bcp-private-product-panel-v229.is-open{display:flex!important}'
      +'.bcp-private-product-panel-dialog-v229{position:relative!important;width:min(1040px,100%)!important;height:min(92vh,920px)!important;overflow:hidden!important;border:1px solid rgba(224,180,93,.54)!important;border-radius:18px!important;background:#090909!important;box-shadow:0 24px 70px rgba(0,0,0,.6)!important}'
      +'.bcp-private-product-panel-frame-v229{display:block!important;width:100%!important;height:100%!important;border:0!important;background:#090909!important}'
      +'.bcp-private-product-panel-close-v229{position:absolute!important;top:10px!important;right:10px!important;z-index:2!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:42px!important;height:42px!important;border:1px solid rgba(224,180,93,.7)!important;border-radius:50%!important;background:rgba(5,5,5,.9)!important;color:#fff!important;font:900 1.45rem/1 system-ui,-apple-system,Segoe UI,sans-serif!important;cursor:pointer!important;box-shadow:0 8px 20px rgba(0,0,0,.35)!important}'
      +'.bcp-private-product-panel-close-v229:hover,.bcp-private-product-panel-close-v229:focus-visible{background:#e0b45d!important;color:#050505!important;outline:none!important}'
      +'body.bcp-private-product-panel-open-v229{overflow:hidden!important}'
      +'.bcp-full-build-cta-v227{margin:20px 0 6px;padding:0}'
      +'.bcp-full-build-cta-v227 .bcp-look-fast-action-v174{display:block!important;margin:0!important}'
      +'.bcp-full-build-cta-v227 .bcp-look-full-add-v16m{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;min-height:54px!important;margin:0!important}'
      +'.bcp-full-build-individual-v227{display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:42px;margin:10px 0 0;color:#e0b45d;text-decoration:none;font-weight:850;font-size:.9rem}'
      +'.bcp-full-build-individual-v227:hover,.bcp-full-build-individual-v227:focus-visible{color:#fff;text-decoration:underline}'
      +'@media(min-width:901px){.bcp-build-summary-v227,.bcp-build-components-heading-v227,.bcp-full-build-cta-v227,.bcp-full-build-individual-v227{grid-column:2!important}.bcp-look-product-grid-v16m.bcp-build-components-grid-v227{grid-column:2!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-auto-rows:1fr!important;gap:14px!important;align-items:stretch!important}.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227{display:flex!important;flex-direction:column!important;align-items:stretch!important;min-height:226px!important;height:100%!important;border-radius:15px!important;overflow:hidden!important}.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .thumb{display:block!important;width:100%!important;height:auto!important;min-height:0!important;aspect-ratio:4 / 3!important;background-position:center!important;background-size:cover!important;border-bottom:1px solid rgba(255,255,255,.11)!important}.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .body{display:flex!important;align-items:flex-start!important;flex:1 1 auto!important;padding:12px 13px 14px!important}.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .body h3{display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;overflow:hidden!important;font-size:.94rem!important;line-height:1.28!important}}'
      +'@media(max-width:640px){.bcp-build-summary-v227{padding:14px}.bcp-build-summary-v227-list li{font-size:.88rem}.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227{grid-template-columns:76px minmax(0,1fr)!important;min-height:76px!important}.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .thumb{width:76px!important;height:76px!important;min-height:76px!important}.bcp-look-product-grid-v16m.bcp-build-components-grid-v227 .bcp-build-component-card-v227 .body{padding:10px 12px!important}.bcp-full-build-cta-v227 .bcp-look-full-add-v16m{min-height:52px!important}}';
    document.head.appendChild(style);
  }
  function safePrivateProductUrl(value){
    try{
      var url=new URL(String(value||''),location.origin);
      if(url.origin!==location.origin) return '';
      if(!/^\/api\/private-product\/order-[a-z0-9-]+\.html$/i.test(url.pathname)) return '';
      return url.pathname+(url.search||'')+(url.hash||'');
    }catch(error){
      return '';
    }
  }
  function getProductDetailUrl(card){
    if(!card) return '';
    var preferred=card.querySelector('.product-details-link[href],.product-card-thumb-link[href],.product-title-link[href]');
    return safePrivateProductUrl(preferred && preferred.getAttribute('href'));
  }

  function applyComparisonProductModalPolicy(frame){
    /* Same-origin private product documents only. This policy is deliberately scoped to
       products that expose a finish-comparison panel inside the modal. */
    if(!frame) return;
    var doc;
    try{ doc=frame.contentDocument; }catch(error){ return; }
    if(!doc || !doc.documentElement || !doc.body) return;
    var comparePanel=doc.querySelector('.product-compare-panel');
    if(!comparePanel) return;

    doc.documentElement.classList.add('bcp-comparison-product-modal-v231');

    /* A comparison must stay between the two finishes. Do not disclose other looks here. */
    doc.querySelectorAll('[class*="used-builds"], [aria-label*="Used in"]').forEach(function(section){
      if(section && section.parentNode) section.parentNode.removeChild(section);
    });

    doc.querySelectorAll('.product-compare-panel .product-compare-card').forEach(function(card){
      var href=String(card.getAttribute('href')||'');
      var copy=card.querySelector('span');
      if(!copy) return;
      if(/order-metal-foot-controls\.html/i.test(href)) copy.textContent='Warmer bronze metal finish.';
      else if(/order-black-foot-control-kit\.html/i.test(href)) copy.textContent='Darker black metal finish.';
      else copy.textContent='Choose the finish that suits your build.';
    });

    /* The original three-column “Style / Price / Flow” block is too narrow inside the
       modal right panel. Convert it to compact, equal horizontal rows. */
    doc.querySelectorAll('.detail-grid .detail').forEach(function(row){
      var heading=row.querySelector('strong');
      if(!heading) return;
      var label=cleanText(heading.textContent,80).toLowerCase();
      if(label.indexOf('price paid')===0) heading.textContent='Price';
      else if(label==='flow') heading.textContent='Checkout';
      else if(label==='style') heading.textContent='Finish';
    });

    if(!doc.getElementById('bcp-comparison-product-modal-v231-style')){
      var style=doc.createElement('style');
      style.id='bcp-comparison-product-modal-v231-style';
      style.textContent=''
        +'html.bcp-comparison-product-modal-v231 .detail-grid{display:grid!important;grid-template-columns:1fr!important;gap:9px!important;margin-top:18px!important}'
        +'html.bcp-comparison-product-modal-v231 .detail-grid .detail{display:grid!important;grid-template-columns:minmax(88px,112px) minmax(0,1fr)!important;column-gap:12px!important;align-items:start!important;min-height:0!important;padding:12px 14px!important}'
        +'html.bcp-comparison-product-modal-v231 .detail-grid .detail strong{margin:0!important;line-height:1.35!important}'
        +'html.bcp-comparison-product-modal-v231 .detail-grid .detail p{margin:0!important;line-height:1.4!important}'
        +'@media(max-width:480px){html.bcp-comparison-product-modal-v231 .detail-grid .detail{grid-template-columns:1fr!important;row-gap:3px!important}}';
      (doc.head||doc.documentElement).appendChild(style);
    }
  }
  function ensurePrivateProductPanel(){
    var existing=document.getElementById('bcp-private-product-panel-v229');
    if(existing) return existing;
    var panel=document.createElement('div');
    panel.id='bcp-private-product-panel-v229';
    panel.className='bcp-private-product-panel-v229';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-hidden','true');
    panel.innerHTML='<div class="bcp-private-product-panel-dialog-v229" role="document"><button class="bcp-private-product-panel-close-v229" type="button" aria-label="Close product gallery">×</button><iframe class="bcp-private-product-panel-frame-v229" title="Product gallery and price"></iframe></div>';
    document.body.appendChild(panel);
    var close=panel.querySelector('.bcp-private-product-panel-close-v229');
    var frame=panel.querySelector('.bcp-private-product-panel-frame-v229');
    function closePanel(){
      if(!panel.classList.contains('is-open')) return;
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden','true');
      document.body.classList.remove('bcp-private-product-panel-open-v229');
      window.setTimeout(function(){ if(frame) frame.src='about:blank'; },160);
      var previous=panel._bcpReturnFocus;
      panel._bcpReturnFocus=null;
      if(previous && typeof previous.focus==='function') previous.focus();
    }
    close.addEventListener('click',closePanel);
    panel.addEventListener('click',function(event){
      if(event.target===panel) closePanel();
    });
    document.addEventListener('keydown',function(event){
      if(event.key==='Escape' && panel.classList.contains('is-open')) closePanel();
    });
    panel._bcpClose=closePanel;
    return panel;
  }
  function openPrivateProductPanel(url,title,trigger,context){
    var safeUrl=safePrivateProductUrl(url);
    if(!safeUrl) return;
    var panel=ensurePrivateProductPanel();
    var frame=panel.querySelector('.bcp-private-product-panel-frame-v229');
    var close=panel.querySelector('.bcp-private-product-panel-close-v229');
    panel._bcpReturnFocus=trigger || document.activeElement;
    panel.setAttribute('aria-label',(title||'Product')+' gallery and price');
    if(frame){
      frame.title=(title||'Product')+' gallery and price';
      frame.onload=function(){
        applyComparisonProductModalPolicy(frame);
      };
      frame.src=safeUrl;
    }
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden','false');
    document.body.classList.add('bcp-private-product-panel-open-v229');
    if(close) close.focus();
    emit('private_look_product_gallery_opened',{
      source_build_key:context && context.key || '',
      source_build_name:context && context.name || '',
      product_name:cleanText(title,120)
    });
  }
  function makeStaticComponentList(grid,context){
    if(!grid || grid.classList.contains('bcp-build-components-grid-v227')) return 0;
    var cards=Array.prototype.slice.call(grid.querySelectorAll('.product-card'));
    grid.classList.add('bcp-build-components-grid-v227');
    cards.forEach(function(card){
      var detailUrl=getProductDetailUrl(card);
      var productTitle=cleanText((card.querySelector('.body h3')||{}).textContent,120) || 'Product';
      card.classList.add('bcp-build-component-card-v227');
      if(detailUrl){
        card.setAttribute('data-bcp-private-product-url',detailUrl);
        card.setAttribute('role','button');
        card.setAttribute('tabindex','0');
        card.setAttribute('aria-label','View gallery and price for '+productTitle);
      }
      card.querySelectorAll('a[href]').forEach(function(link){
        link.removeAttribute('href');
        link.setAttribute('aria-hidden','true');
        link.setAttribute('tabindex','-1');
      });
      card.querySelectorAll('button.add-preview, a.add-preview').forEach(function(action){
        action.setAttribute('aria-hidden','true');
        action.setAttribute('tabindex','-1');
      });
      if(!detailUrl) return;
      function openFromCard(event){
        if(event) event.preventDefault();
        openPrivateProductPanel(detailUrl,productTitle,card,context||{});
      }
      card.addEventListener('click',openFromCard);
      card.addEventListener('keydown',function(event){
        if(event.key==='Enter' || event.key===' '){
          event.preventDefault();
          openFromCard(event);
        }
      });
    });
    return cards.length;
  }
  function buildFullConfigurationPresentation(target){
    if(!target || target.querySelector('.bcp-build-summary-v227')) return;
    var bodyNode=target.querySelector('.bcp-look-parts-body-v16m') || target;
    var titleNode=bodyNode.querySelector('h3');
    var nativeButton=bodyNode.querySelector('[data-add-bundle]');
    var nativeAction=nativeButton && nativeButton.closest ? nativeButton.closest('.bcp-look-fast-action-v174') : null;
    var media=bodyNode.querySelector('.bcp-look-gallery-banner-v16n, .bcp-look-sticky-media-v16m');
    var grid=bodyNode.querySelector('.bcp-look-product-grid-v16m');
    var kicker=bodyNode.querySelector('.bcp-look-kicker-v16m');
    var copy=titleNode ? titleNode.nextElementSibling : null;
    if(!titleNode || !nativeButton || !nativeAction || !media || !grid) return;
    var name=cleanText(titleNode.textContent,100) || 'this build';
    var count=makeStaticComponentList(grid,{key:target.getAttribute('data-cart-look-context')||'',name:name});
    if(kicker) kicker.textContent='Your selected configuration';
    if(copy && copy.tagName==='P') copy.textContent='The exact selected components for this complete build are below.';
    nativeButton.textContent='Complete this build · Save 5%';
    nativeButton.setAttribute('aria-label','Complete the '+name+' build, add all selected parts to cart and receive the 5% Full Build saving');
    /* Keep the look video as the first visual decision. */
    bodyNode.insertBefore(media,bodyNode.firstChild);
    var summary=document.createElement('section');
    summary.className='bcp-build-summary-v227';
    summary.setAttribute('aria-label','Complete '+name+' configuration summary');
    var summaryTitle=document.createElement('strong');
    summaryTitle.className='bcp-build-summary-v227-title';
    summaryTitle.textContent='Your exact '+name+' configuration';
    var list=document.createElement('ul');
    list.className='bcp-build-summary-v227-list';
    [
      [String(count)+' selected component'+(count===1?'':'s'),'▣'],
      ['One complete configuration','✓'],
      ['Full Build saving: 5%','%'],
      ['Motorcycle not included','i']
    ].forEach(function(item){
      var row=document.createElement('li');
      var icon=document.createElement('span');
      icon.className='bcp-build-summary-v227-icon';
      icon.setAttribute('aria-hidden','true');
      icon.textContent=item[1];
      row.appendChild(icon);
      row.appendChild(document.createTextNode(item[0]));
      list.appendChild(row);
    });
    summary.appendChild(summaryTitle);
    summary.appendChild(list);
    var heading=document.createElement('h4');
    heading.className='bcp-build-components-heading-v227';
    heading.textContent='Build components ('+count+')';
    var ctaWrap=document.createElement('div');
    ctaWrap.className='bcp-full-build-cta-v227';
    var individual=document.createElement('a');
    individual.className='bcp-full-build-individual-v227';
    individual.href='#shop-part-by-part';
    individual.textContent='Review individual parts';
    individual.setAttribute('aria-label','Review individual parts and prices instead of completing the '+name+' build');
    individual.addEventListener('click',function(){
      emit('private_look_individual_parts_click',{source_build_key:target.getAttribute('data-cart-look-context')||'',source_build_name:name});
    });
    if(copy && copy.parentNode===bodyNode) copy.insertAdjacentElement('afterend',summary);
    else titleNode.insertAdjacentElement('afterend',summary);
    grid.insertAdjacentElement('beforebegin',heading);
    grid.insertAdjacentElement('afterend',ctaWrap);
    ctaWrap.appendChild(nativeAction);
    ctaWrap.insertAdjacentElement('afterend',individual);
    nativeButton.addEventListener('click',function(){
      emit('complete_look_clicked',{source_build_key:target.getAttribute('data-cart-look-context')||'',source_build_name:name});
      window.setTimeout(function(){
        emit('complete_look_added_to_cart',{source_build_key:target.getAttribute('data-cart-look-context')||'',source_build_name:name});
      },0);
    });
  }
  function routeToSelectedLook(){
    var target=selectedPrivateLook();
    if(!target) return;
    injectStyle();
    buildFullConfigurationPresentation(target);
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
  function injectPrivateVideoPreloadStyle(){
    if(document.getElementById('bcp-v223-private-video-preload-style')) return;
    var style=document.createElement('style');
    style.id='bcp-v223-private-video-preload-style';
    style.textContent=''
      +'.bcp-private-video-frame-v223{background:#050505!important;background-image:none!important}'
      +'.bcp-private-video-frame-v223 video.bcp-private-video-clean-preload-v223{background:#050505!important;background-image:none!important}';
    document.head.appendChild(style);
  }
  function cleanPrivateVideoPreload(rootNode){
    if(!rootNode) return;
    injectPrivateVideoPreloadStyle();
    rootNode.querySelectorAll('video[poster]').forEach(function(video){
      /* Private catalog videos are entitlement-only and are not crawl targets.
         Remove the visible poster before first paint; reveal the decoded MP4 frame only. */
      video.removeAttribute('poster');
      video.classList.add('bcp-private-video-clean-preload-v223');
      var frame=video.closest('.bcp-look-sticky-media-v16m, .bcp-browse-look-banner-v16n, .look-media-video');
      if(frame) frame.classList.add('bcp-private-video-frame-v223');
      function revealDecodedFrame(){
        if(video.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA){
          video.classList.add('bcp-look-video-first-frame-ready');
        }
      }
      video.addEventListener('loadeddata',revealDecodedFrame,{once:true});
      video.addEventListener('playing',revealDecodedFrame,{once:true});
      revealDecodedFrame();
    });
  }
  function hydrate(data){
    var full=document.getElementById('full-look-parts');
    var shop=document.getElementById('shop-part-by-part');
    if(!full || !shop || !data.sections) throw new Error('Private catalog mount unavailable.');
    full.innerHTML=String(data.sections.full_look_html||'');
    shop.innerHTML=String(data.sections.shop_html||'');
    cleanPrivateVideoPreload(full);
    cleanPrivateVideoPreload(shop);
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
  /* V230: cart/order bindings are a protected first step. A visual enhancement must never prevent
     the Full Build CTA or header cart from becoming interactive. */
  function presentSelectedLookSafely(){
    try{
      routeToSelectedLook();
    }catch(error){
      try{ window.dispatchEvent(new CustomEvent('bcp:private-catalog-presentation-degraded')); }catch(ignore){}
    }
  }
  function load(){
    if(catalogMounted){ presentSelectedLookSafely(); return; }
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
      return Promise.allSettled([
        loadScript('/api/private-assets/order-flow.js'),
        loadScript('/api/private-assets/cart-flow.js')
      ]);
    }).then(function(results){
      bindPrivateAssets(results);
      presentSelectedLookSafely();
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
