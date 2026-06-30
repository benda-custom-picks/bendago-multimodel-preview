/* BCP V195 — no product data here. Authorised product documents are served only by the Worker. */
(function(){
  'use strict';
  var body=document.body;
  if(!body || body.getAttribute('data-bcp-access-scope')!=='product') return;
  var slug=String(body.getAttribute('data-bcp-private-product')||'').trim();
  if(!/^order-[a-z0-9-]+\.html$/i.test(slug)) return;
  var moved=false;
  function go(){
    if(moved) return;
    moved=true;
    location.replace('/api/private-product/'+encodeURIComponent(slug)+(location.search||''));
  }
  window.addEventListener('bcp:access-granted',go);
  if(document.documentElement.classList.contains('bcp-access-granted')) go();
}());
