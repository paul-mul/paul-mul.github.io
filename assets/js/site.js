(function(){
  function el(tag, attrs={}, children=[]){
    const n=document.createElement(tag);
    for(const [k,v] of Object.entries(attrs||{})){
      if(k==="class") n.className=v;
      else if(k==="html") n.innerHTML=v;
      else if(k.startsWith("on") && typeof v==="function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for(const c of (children||[])){
      if(c==null) continue;
      n.appendChild(typeof c==="string" ? document.createTextNode(c) : c);
    }
    return n;
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

  async function loadSiteData(){
    // 1) try embedded JSON
    const embedded = document.getElementById("site-data");
    if(embedded && embedded.textContent.trim()){
      try{ return JSON.parse(embedded.textContent); }catch(e){}
    }
    // 2) try fetch (cache-bust)
    try{
      const res = await fetch("/data/site.json?v="+Date.now(), {cache:"no-store"});
      if(res.ok) return await res.json();
    }catch(e){}
    // 3) last attempt: relative fetch (in case of subpath)
    try{
      const rel = new URL("data/site.json?v="+Date.now(), document.baseURI).toString();
      const res = await fetch(rel, {cache:"no-store"});
      if(res.ok) return await res.json();
    }catch(e){}
    return null;
  }

  function setActiveNav(){
    const path = location.pathname.replace(/\/+$/,"/"); // normalize
    document.querySelectorAll("[data-nav]").forEach(a=>{
      const target = a.getAttribute("href");
      if(!target) return;
      const t = new URL(target, location.origin).pathname.replace(/\/+$/,"/");
      if(t===path) a.setAttribute("aria-current","page");
    });
  }

  function renderHome(data){
    const p=data.profile;
    document.getElementById("name").textContent = p.name;
    document.getElementById("titleline").textContent = `${p.title}, ${p.affiliation}`;
    const aff = document.getElementById("affiliations");
    aff.innerHTML="";
    for(const a of (p.affiliations||[])){
      aff.appendChild(el("a",{href:a.url,target:"_blank",rel:"noopener"},[a.label]));
      aff.appendChild(document.createTextNode(" · "));
    }
    if(aff.lastChild) aff.removeChild(aff.lastChild);

    const about=document.getElementById("about");
    about.innerHTML="";
    about.appendChild(el("p",{},[p.bio]));
    about.appendChild(el("p",{},[p.research_intro]));
    const ul=el("ul",{class:"list"});
    (p.interests||[]).forEach(i=>ul.appendChild(el("li",{},[i])));
    about.appendChild(ul);

    const highlight=document.getElementById("highlight");
    highlight.innerHTML="";
    if(p.highlight && p.highlight.text){
      highlight.appendChild(el("div",{class:"card"},[
        el("div",{class:"meta"},["Highlight"]),
        el("div",{},[
          p.highlight.url ? el("a",{href:p.highlight.url,target:"_blank",rel:"noopener"},[p.highlight.text]) : p.highlight.text
        ])
      ]));
    }

    const news=document.getElementById("news");
    news.innerHTML="";
    const items=data.news||[];
    if(!items.length){ news.appendChild(el("p",{class:"muted"},["No news items found."])); return; }
    items.slice(0,25).forEach(n=>{
      const links=(n.links||[]).map(l=>el("a",{href:l.url,target:"_blank",rel:"noopener"},[l.label]));
      const linkSpan = el("span",{},[]);
      links.forEach((a,idx)=>{ if(idx) linkSpan.appendChild(document.createTextNode(" · ")); linkSpan.appendChild(a); });
      news.appendChild(el("div",{class:"card"},[
        el("div",{class:"meta"},[n.date]),
        el("div",{},[n.text]),
        (n.links&&n.links.length)? el("div",{class:"pills"},[(linkSpan)]) : null
      ]));
    });

    renderFooter(data);
  }

  function renderResearch(data){
    const pubs=document.getElementById("pubs");
    pubs.innerHTML="";
    (data.publications||[]).forEach(pub=>{
      const authors = (pub.authors||[]).map(a => a.url ? `<a href="${escapeHtml(a.url)}" target="_blank" rel="noopener">${escapeHtml(a.name)}</a>` : escapeHtml(a.name)).join(", ");
      const extras = pub.links||[];
      const extraEl = extras.length ? el("div",{class:"pills"}, extras.map(l=>el("a",{class:"pill",href:l.url,target:"_blank",rel:"noopener"},[l.label]))) : null;
      pubs.appendChild(el("div",{class:"card"},[
        el("h3",{},[ el("a",{href:pub.url,target:"_blank",rel:"noopener"},[pub.title]) ]),
        el("div",{class:"meta",html: authors}),
        pub.venue ? el("div",{class:"meta"},[pub.venue]) : null,
        pub.summary ? el("p",{},[pub.summary]) : null,
        extraEl
      ]));
    });

    const wip=document.getElementById("wip");
    wip.innerHTML="";
    (data.work_in_progress||[]).forEach(item=>{
      const authors = (item.authors||[]).map(a => a.url ? `<a href="${escapeHtml(a.url)}" target="_blank" rel="noopener">${escapeHtml(a.name)}</a>` : escapeHtml(a.name)).join(", ");
      const links = (item.links||[]).map(l=>el("a",{class:"pill",href:l.url,target:"_blank",rel:"noopener"},[l.label]));
      wip.appendChild(el("div",{class:"card"},[
        el("h3",{},[item.title]),
        el("div",{class:"meta",html: authors}),
        links.length ? el("div",{class:"pills"}, links) : null
      ]));
    });

    renderFooter(data);
  }

  function renderCV(data){
    const cvPath = data.cv && data.cv.path ? data.cv.path : "/assets/cv/CV_Paul_Muller.pdf";
    const dl=document.getElementById("cv-download");
    dl.setAttribute("href", cvPath);
    const frame=document.getElementById("cv-frame");
    frame.setAttribute("src", cvPath);
    renderFooter(data);
  }

  function renderFooter(data){
    const p=data.profile;
    const f=document.getElementById("footer");
    if(!f) return;
    f.innerHTML="";
    const left = el("div",{},[
      el("span",{class:"muted"},["Contact: "]),
      el("span",{},[p.contact?.email || ""])
    ]);
    const right = el("div",{},[]);
    (p.contact?.links||[]).forEach((l,idx)=>{
      if(idx) right.appendChild(document.createTextNode(" · "));
      right.appendChild(el("a",{href:l.url,target:"_blank",rel:"noopener"},[l.label]));
    });
    f.appendChild(left);
    f.appendChild(el("div",{style:"margin-top:6px"},[right]));
  }

  async function boot(page){
    setActiveNav();
    const data = await loadSiteData();
    if(!data){
      const msg = document.getElementById("load-error");
      if(msg) msg.style.display="block";
      return;
    }
    if(page==="home") renderHome(data);
    if(page==="research") renderResearch(data);
    if(page==="cv") renderCV(data);
  }

  window.SiteBoot = { boot };
})();
