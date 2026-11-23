(()=>{const v=new URLSearchParams(location.search).get('rose');if(/^[123]$/.test(v))document.documentElement.dataset.rose=v;
addEventListener('DOMContentLoaded',()=>{const h=document.querySelector('.hero');if(h&&!h.querySelector('.rose-frame')){const f=document.createElement('div');f.className='rose-frame';f.setAttribute('aria-hidden','true');h.prepend(f)}
const n=document.createElement('nav');n.className='rose-switch';n.setAttribute('aria-label','rose options');
[['now',''],['1','1'],['2','2'],['3','3']].forEach(([l,k])=>{const a=document.createElement('a');a.textContent=l;a.href=k?'/?rose='+k:'/';if((v||'')===k)a.setAttribute('aria-current','true');n.append(a)});document.body.append(n)})})();
