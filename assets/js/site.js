async function loadSiteData() {
  const res = await fetch('/data/site.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load site data.');
  return await res.json();
}

function el(tag, attrs={}, children=[]) {
  const node = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const ch of children) node.append(ch);
  return node;
}

function text(s){ return document.createTextNode(s); }

function link(label, url, cls='badge') {
  if (!url) return el('span', { class: cls }, [text(label)]);
  const a = el('a', { href: url, class: cls, target:'_blank', rel:'noopener noreferrer' }, [text(label)]);
  return a;
}

function renderContact(container, profile){
  const email = profile.contact?.email ?? '';
  const links = profile.contact?.links ?? [];
  container.innerHTML = '';
  container.append(
    el('div', {}, [
      el('div', { class:'mini' }, [text('Contact')]),
      el('div', { style:'margin-top:8px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;' }, [
        el('span', { class:'badge' }, [text(email)]),
        ...links.map(x => link(x.label, x.url))
      ])
    ])
  );
}

function setActiveNav(){
  const path = location.pathname.replace(/\/+$/, '');
  document.querySelectorAll('.nav-links a').forEach(a=>{
    const href = a.getAttribute('href').replace(/\/+$/, '');
    if (href === path || (href === '' && path === '')) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
}

function renderNews(container, news, limit=6){
  container.innerHTML = '';
  const items = news.map(n=>{
    const links = (n.links||[]).map(l=>link(l.label, l.url, 'badge'));
    return el('div', { class:'item' }, [
      el('div', { class:'split' }, [
        el('h3', {}, [text(n.date)]),
        el('div', { class:'meta' }, [])
      ]),
      el('p', {}, [text(n.text)]),
      links.length ? el('div', { class:'badges' }, links) : el('div')
    ]);
  });

  const shown = items.slice(0, limit);
  const hidden = items.slice(limit);

  const list = el('div', { class:'items' }, shown);
  container.append(list);

  if (hidden.length){
    const btn = el('button', { class:'btn', type:'button' }, [text('Show all news')]);
    const hiddenWrap = el('div', { class:'items', style:'display:none; margin-top:14px;' }, hidden);
    btn.addEventListener('click', ()=>{
      const isHidden = hiddenWrap.style.display === 'none';
      hiddenWrap.style.display = isHidden ? '' : 'none';
      btn.textContent = isHidden ? 'Hide news archive' : 'Show all news';
    });
    container.append(el('div', { style:'margin-top:12px;' }, [btn]));
    container.append(hiddenWrap);
  }
}

function fmtAuthors(authors){
  if (!authors || !authors.length) return '';
  return authors.map(a=>{
    if (a.url) return `<a href="${a.url}" target="_blank" rel="noopener noreferrer">${a.name}</a>`;
    return a.name;
  }).join(', ');
}

function renderPublications(container, pubs){
  container.innerHTML = '';
  const items = pubs.map(p=>{
    const badges = (p.links||[]).map(l=>link(l.label, l.url, 'badge'));
    const metaHtml = [];
    if (p.venue) metaHtml.push(p.venue);
    if (p.authors?.length) metaHtml.push(`Joint with ${fmtAuthors(p.authors)}`);
    const meta = metaHtml.join(' • ');
    const item = el('div', { class:'item' }, [
      el('h3', {}, [
        el('a', { href: p.url || '#', target:'_blank', rel:'noopener noreferrer' }, [text(p.title)])
      ]),
      el('div', { class:'meta' }, []),
      el('p', {}, [text(p.summary || '')]),
      badges.length ? el('div', { class:'badges' }, badges) : el('div')
    ]);
    item.querySelector('.meta').innerHTML = meta;
    return item;
  });
  container.append(el('div', { class:'items' }, items));
}

function renderWIP(container, wip){
  container.innerHTML = '';
  const items = (wip||[]).map(w=>{
    const badges = (w.links||[]).map(l=>link(l.label, l.url, 'badge'));
    const item = el('div', { class:'item' }, [
      el('h3', {}, [text(w.title)]),
      el('div', { class:'meta' }, []),
      badges.length ? el('div', { class:'badges' }, badges) : el('div')
    ]);
    item.querySelector('.meta').innerHTML = w.authors?.length ? `With ${fmtAuthors(w.authors)}` : '';
    return item;
  });
  container.append(el('div', { class:'items' }, items));
}

window.Site = { loadSiteData, renderContact, renderNews, renderPublications, renderWIP, setActiveNav };
