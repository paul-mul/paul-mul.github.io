(function(){
  'use strict';

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  async function loadJSON(path){
    const res = await fetch(path, {cache: 'no-store'});
    if(!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return await res.json();
  }

  function esc(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function linkHTML(link){
    if(!link || !link.url) return '';
    const label = link.label ? esc(link.label) : esc(link.url);
    return `<a href="${esc(link.url)}" target="_blank" rel="noopener">${label}</a>`;
  }

  function joinLinks(links){
    if(!links || !links.length) return '';
    return links.map(linkHTML).join(' · ');
  }

  function renderNav(current){
    $$('.nav a').forEach(a => {
      if(a.getAttribute('data-nav') === current){
        a.setAttribute('aria-current','page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  function renderFooter(profile){
    const el = $('#footer');
    if(!el) return;
    const links = (profile.contact?.links || []).map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('');
    el.innerHTML = `
      <div>Contact: <span class="muted">${esc(profile.contact?.email || '')}</span></div>
      <div class="smalllinks">${links}</div>
    `;
  }

  function renderHome(data){
    renderNav('home');
    const p = data.profile;

    $('#name').textContent = p.name;
    $('#subtitle').textContent = `${p.title} · ${p.affiliation?.label || ''}`;

    // affiliations pills
    const pills = $('#pills');
    const aff = [
      {label: p.affiliation?.label, url: p.affiliation?.url},
      ...(p.affiliated_with || []),
      ...(p.roles || [])
    ].filter(x => x && x.label && x.url);
    pills.innerHTML = aff.map(x => `
      <span class="pill"><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a></span>
    `).join('');

    $('#bio').textContent = p.bio;
    $('#researchIntro').textContent = p.research_intro;
    $('#interests').innerHTML = (p.interests || []).map(x => `<li>${esc(x)}</li>`).join('');

    const hl = $('#highlight');
    if(p.highlight?.text){
      hl.innerHTML = `<div class="callout">${esc(p.highlight.text)} ${p.highlight.url ? `(<a href="${esc(p.highlight.url)}" target="_blank" rel="noopener">link</a>)` : ''}</div>`;
    }

    // news
    const news = data.news || [];
    const latest = news.slice(0, 8);
    const rest = news.slice(8);

    $('#newsLatest').innerHTML = latest.map(n => `
      <div class="paper">
        <div class="meta">${esc(n.date || '')}</div>
        <div>${esc(n.text || '')}${n.links && n.links.length ? ` <span class="muted">(${joinLinks(n.links)})</span>` : ''}</div>
      </div>
    `).join('');

    const more = $('#newsMore');
    const toggle = $('#newsToggle');
    if(rest.length){
      more.innerHTML = rest.map(n => `
        <div class="paper">
          <div class="meta">${esc(n.date || '')}</div>
          <div>${esc(n.text || '')}${n.links && n.links.length ? ` <span class="muted">(${joinLinks(n.links)})</span>` : ''}</div>
        </div>
      `).join('');
      toggle.hidden = false;
      toggle.addEventListener('click', () => {
        const open = more.hasAttribute('hidden') ? false : true;
        if(open){
          more.setAttribute('hidden','');
          toggle.textContent = 'Show all news';
        }else{
          more.removeAttribute('hidden');
          toggle.textContent = 'Hide news archive';
        }
      });
    }else{
      toggle.hidden = true;
    }

    renderFooter(p);
  }

  function renderResearch(data){
    renderNav('research');
    $('#pubs').innerHTML = (data.publications || []).map(pub => {
      const authors = (pub.authors || []).map(a => a.url
        ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a>`
        : esc(a.name)
      ).join(', ');
      const links = joinLinks(pub.links || []);
      return `
        <div class="paper">
          <h3><a href="${esc(pub.url)}" target="_blank" rel="noopener">${esc(pub.title)}</a></h3>
          <div class="meta">${authors}</div>
          <div class="meta">${esc(pub.venue || '')}</div>
          <div>${esc(pub.summary || '')}</div>
          ${links ? `<div class="btnrow"><span class="notice">${links}</span></div>` : ''}
        </div>
      `;
    }).join('');

    $('#wip').innerHTML = (data.work_in_progress || []).map(w => {
      const authors = (w.authors || []).map(a => a.url
        ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a>`
        : esc(a.name)
      ).join(', ');
      const links = joinLinks(w.links || []);
      return `
        <div class="paper">
          <h3>${esc(w.title)}</h3>
          <div class="meta">${authors}</div>
          ${links ? `<div class="notice">${links}</div>` : ''}
        </div>
      `;
    }).join('');

    renderFooter(data.profile);
  }

  function renderCV(data){
    renderNav('cv');
    const path = data.cv?.path || '/assets/cv/CV_Paul_Muller.pdf';
    $('#cvDownload').setAttribute('href', path);
    $('#cvEmbed').setAttribute('src', path);
    renderFooter(data.profile);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const page = document.body.getAttribute('data-page') || 'home';
    try{
      const data = await loadJSON('/data/site.json');
      if(page === 'home') renderHome(data);
      if(page === 'research') renderResearch(data);
      if(page === 'cv') renderCV(data);
    }catch(err){
      console.error(err);
      const msg = $('#loadError');
      if(msg) msg.hidden = false;
    }
  });
})();
