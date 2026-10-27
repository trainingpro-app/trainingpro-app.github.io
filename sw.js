/* TrainingPro · guarda la app en el celu para que abra rápido.
   Las páginas se piden siempre nuevas (si no hay señal o tarda, usa la guardada);
   las herramientas de Google (Firebase) y las fuentes se guardan y no se vuelven a bajar. */
const V='tp-v13';
const SHELL=['./','./index.html','./atletas.html','./manifest.json','./manifest-atletas.json','./icon-tp-192.png','./icon-cvm-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const fromNet=(req,ms)=>new Promise((ok,ko)=>{const t=setTimeout(ko,ms);fetch(req).then(r=>{clearTimeout(t);ok(r);},e=>{clearTimeout(t);ko(e);});});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const u=new URL(req.url);
  /* páginas de la app: primero internet (hasta 4 s), si no, lo guardado */
  if(u.origin===location.origin){
    e.respondWith(fromNet(req,4000).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(V).then(x=>x.put(req,c));}return r;})
      .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));
    return;
  }
  /* Firebase y fuentes: si ya están guardadas, no se bajan de nuevo */
  if(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/')||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{if(n&&(n.ok||n.type==='opaque')){const c=n.clone();caches.open(V).then(x=>x.put(req,c));}return n;})));
  }
});
