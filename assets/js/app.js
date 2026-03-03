(function(){
  function el(tag, attrs={}, children=[]){
    const e=document.createElement(tag);
    for(const [k,v] of Object.entries(attrs||{})){
      if(k==="class") e.className=v;
      else if(k==="html") e.innerHTML=v;
      else if(k.startsWith("on") && typeof v==="function") e.addEventListener(k.slice(2), v);
      else e.setAttribute(k,v);
    }
    for(const c of (Array.isArray(children)?children:[children])){
      if(c==null) continue;
      if(typeof c==="string") e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    }
    return e;
  }

  function link(label, url){
    return el("a",{href:url, target:"_blank", rel:"noopener noreferrer"}, label);
  }

  function renderPills(container, items){
    if(!items || !items.length) return;
    const row = el("div",{class:"row"});
    items.forEach(it=>{
      row.appendChild(el("a",{class:"pill", href:it.url, target:"_blank", rel:"noopener noreferrer"}, it.label));
    });
    container.appendChild(row);
  }

  function renderNews(listEl, news){
    listEl.innerHTML="";
    news.forEach(n=>{
      const links = (n.links||[]).map((l,i)=> el("span",{}, [
        (i? " · ":""),
        link(l.label, l.url)
      ]));
      listEl.appendChild(el("div",{class:"item"},[
        el("div",{class:"meta"}, n.date),
        el("div",{},[
          el("span",{}, n.text + " "),
          ...links
        ])
      ]));
    });
  }

  function renderPubs(listEl, pubs){
    listEl.innerHTML="";
    pubs.forEach(p=>{
      const authorBits = (p.authors||[]).map((a,i)=> {
        const name = a.name || "";
        const node = a.url ? link(name, a.url) : el("span",{}, name);
        return el("span",{}, [ i? ", ":"", node ]);
      });
      const extraLinks = (p.links||[]).map((l,i)=> el("span",{}, [
        (i? " · ":""),
        link(l.label, l.url)
      ]));
      listEl.appendChild(el("div",{class:"item"},[
        el("div",{class:"item-title"}, [link(p.title, p.url)]),
        el("div",{class:"meta"}, [
          ...authorBits,
          p.venue ? " · " + p.venue : ""
        ]),
        p.summary ? el("div",{class:"section"}, p.summary) : null,
        (p.links && p.links.length) ? el("div",{class:"section"}, extraLinks) : null
      ]));
    });
  }

  function renderWip(listEl, wip){
    listEl.innerHTML="";
    (wip||[]).forEach(w=>{
      const authorBits = (w.authors||[]).map((a,i)=> {
        const name = a.name || "";
        const node = a.url ? link(name, a.url) : el("span",{}, name);
        return el("span",{}, [ i? ", ":"", node ]);
      });
      const links = (w.links||[]).map((l,i)=> el("span",{}, [
        (i? " · ":""),
        link(l.label, l.url)
      ]));
      listEl.appendChild(el("div",{class:"item"},[
        el("div",{class:"item-title"}, w.title),
        el("div",{class:"meta"}, authorBits),
        (w.links && w.links.length) ? el("div",{class:"section"}, links) : null
      ]));
    });
  }

  function boot(){
    const data = window.__SITE_DATA__;
    if(!data) return;

    // header
    const nameEl = document.querySelector("[data-name]");
    if(nameEl) nameEl.textContent = data.profile?.name || "";

    const titleEl = document.querySelector("[data-title]");
    if(titleEl){
      const t = data.profile?.title || "";
      const aff = data.profile?.affiliation;
      if(aff?.url) titleEl.innerHTML = `${t} · <a href="${aff.url}" target="_blank" rel="noopener noreferrer">${aff.label}</a>`;
      else titleEl.textContent = t;
    }

    const bioEl = document.querySelector("[data-bio]");
    if(bioEl) bioEl.textContent = data.profile?.bio || "";

    const affPills = document.querySelector("[data-affiliations]");
    if(affPills) renderPills(affPills, data.profile?.affiliations || []);

    const rolePills = document.querySelector("[data-roles]");
    if(rolePills) renderPills(rolePills, data.profile?.roles || []);

    const highlightEl = document.querySelector("[data-highlight]");
    if(highlightEl && data.profile?.highlight){
      highlightEl.innerHTML = `<a href="${data.profile.highlight.url}" target="_blank" rel="noopener noreferrer">${data.profile.highlight.text}</a>`;
    }

    const interestsEl = document.querySelector("[data-interests]");
    if(interestsEl){
      interestsEl.innerHTML="";
      (data.profile?.interests || []).forEach(i=> interestsEl.appendChild(el("li",{}, i)));
    }

    const contactEl = document.querySelector("[data-contact]");
    if(contactEl){
      const email = data.profile?.contact?.email || "";
      const links = data.profile?.contact?.links || [];
      contactEl.innerHTML="";
      contactEl.appendChild(el("div",{}, [el("span",{class:"muted"},"Email: "), el("span",{}, email)]));
      if(links.length){
        const row=el("div",{class:"row"});
        links.forEach(l=> row.appendChild(el("a",{class:"pill", href:l.url, target:"_blank", rel:"noopener noreferrer"}, l.label)));
        contactEl.appendChild(row);
      }
    }

    // sections
    const newsEl = document.querySelector("[data-news]");
    if(newsEl) renderNews(newsEl, data.news||[]);

    const pubsEl = document.querySelector("[data-pubs]");
    if(pubsEl) renderPubs(pubsEl, data.publications||[]);

    const wipEl = document.querySelector("[data-wip]");
    if(wipEl) renderWip(wipEl, data.work_in_progress||[]);

    const cvLink = document.querySelector("[data-cv-link]");
    if(cvLink && data.cv?.path) cvLink.setAttribute("href", data.cv.path);

    const yearEl = document.querySelector("[data-year]");
    if(yearEl) yearEl.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();