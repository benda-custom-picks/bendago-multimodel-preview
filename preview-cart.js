
(function(){
  const KEY='bendago_multimodel_preview_cart_v1';
  const products={
    'nap125250-look-pack':{name:'Napoleon 125/250 preview look pack',price:'Preview',img:'assets/napoleon-125-250.jpg'},
    'nap500-black-bobber':{name:'Napoleon 500 Black Bobber preview pack',price:'Preview',img:'assets/napoleon-500.jpg'},
    'nap500-premium-cruiser':{name:'Napoleon 500 Premium Cruiser preview pack',price:'Preview',img:'assets/napoleon-500.jpg'},
    'darkflag-shadow-beast':{name:'Dark Flag V4 Shadow Beast preview pack',price:'Preview',img:'assets/darkflag-v4.jpg'},
    'darkflag-midnight-reaper':{name:'Dark Flag V4 Midnight Reaper preview pack',price:'Preview',img:'assets/darkflag-v4.jpg'}
  };
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
  function save(c){localStorage.setItem(KEY,JSON.stringify(c));render()}
  function add(code){if(!products[code])return;const c=read();const x=c.find(i=>i.code===code);if(x)x.qty+=1;else c.push({code,qty:1});save(c);open()}
  function clear(){save([])}
  function count(){return read().reduce((s,i)=>s+(Number(i.qty)||0),0)}
  function ensure(){if(document.getElementById('previewCart'))return;document.body.insertAdjacentHTML('beforeend',`<aside id="previewCart" class="cart-drawer"><div class="cart-head"><div><h2>Preview cart</h2><small>Architecture preview — live Stripe disabled.</small></div><button class="close-cart" data-close-cart>×</button></div><div class="cart-body" data-cart-body></div><div class="cart-footer"><button type="button" data-clear-cart>Clear preview cart</button><a href="cart-request.html">View preview checkout</a></div></aside>`);document.querySelector('[data-close-cart]').onclick=close;document.querySelector('[data-clear-cart]').onclick=clear;}
  function render(){document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=count());ensure();const body=document.querySelector('[data-cart-body]');const c=read();if(!c.length){body.innerHTML='<div class="cart-empty">No preview item yet.</div>';return;}body.innerHTML=c.map(i=>{const p=products[i.code]||{};return `<div class="cart-line"><img src="${p.img||'assets/napoleon-125-250.jpg'}" alt=""><div><strong>${p.name||i.code}</strong><span>${p.price||'Preview'} · qty ${i.qty}</span></div></div>`}).join('')}
  function open(){ensure();render();document.getElementById('previewCart').classList.add('active')}
  function close(){document.getElementById('previewCart')?.classList.remove('active')}
  document.addEventListener('click',e=>{const a=e.target.closest('[data-add-preview]');if(a){e.preventDefault();add(a.getAttribute('data-add-preview'));}const b=e.target.closest('[data-open-cart]');if(b){e.preventDefault();open();}});
  document.addEventListener('DOMContentLoaded',render);
})();
