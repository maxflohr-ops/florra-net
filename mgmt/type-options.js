(function(){var t=(new URLSearchParams(location.search).get('type')||'').toLowerCase();if(/^[abc]$/.test(t))document.documentElement.setAttribute('data-type',t);
document.addEventListener('DOMContentLoaded',function(){var d=document.createElement('nav');d.className='type-switch';d.setAttribute('aria-label','font options');
[['','now'],['a','A'],['b','B'],['c','C']].forEach(function(o){var a=document.createElement('a');var u=new URL(location.href);if(o[0])u.searchParams.set('type',o[0]);else u.searchParams.delete('type');a.href=u.pathname+u.search+u.hash;a.textContent=o[1];if(o[0]===t||(!o[0]&&!/^[abc]$/.test(t)))a.setAttribute('aria-current','true');d.appendChild(a)});
document.body.appendChild(d);
document.querySelectorAll('a[href^="/"]').forEach(function(a){if(a.closest('.type-switch')||!t)return;var u=new URL(a.href,location.href);u.searchParams.set('type',t);a.href=u.pathname+u.search+u.hash})})})();
