/* FIXALL callfixall.com 2026 site script (lives in the GLOBAL HEADER block). Namespace fxr. */
(function(){
  function ready(fn){ if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn);} else {fn();} }
  ready(function(){
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var touch=window.matchMedia('(hover: none)').matches;
    var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
    var page=$('.fxr'); var root=document.documentElement;
    var nav=$('#fxrNav'), prog=$('#fxrProgress'), burger=$('#fxrBurger'), mmenu=$('#fxrMenu'), mbar=$('#fxrMbar'), rocky=$('#fxrRocky');

    function scrollTo(t){ if(!t) return; closeMenu(); t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'}); }
    document.addEventListener('click',function(e){
      var a=e.target.closest('a[href^="#"], a[href^="/#"]'); if(!a) return;
      var href=a.getAttribute('href'); var id=href.replace(/^\//,'');
      if(id.length<2) return; var t=document.getElementById(id.slice(1)); if(!t) return;
      e.preventDefault(); scrollTo(t); if(history.replaceState) history.replaceState(null,'',id);
    });
    if(location.hash&&document.getElementById(location.hash.slice(1))){ setTimeout(function(){ var t=document.getElementById(location.hash.slice(1)); if(t) t.scrollIntoView({block:'start'}); },400); }

    /* ---- nav ---- */
    var last=0;
    function onScroll(){
      var y=window.scrollY||window.pageYOffset, h=document.documentElement.scrollHeight-window.innerHeight;
      if(prog) prog.style.transform='scaleX('+(h>0?y/h:0)+')';
      if(nav){ nav.classList.toggle('small',y>80); nav.classList.toggle('hide',y>600&&y>last&&!root.classList.contains('fxr-menu-open')); }
      last=y;
    }
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
    /* never clip the Call button (11/4): if the full bar is wider than the screen, fold the menu into the burger.
       Measured as if the logo were full size (it shrinks from 150 to 98 px on scroll), so the menu doesn't flip while scrolling. */
    var bar=nav&&$('.bar',nav), pill=nav&&$('.fxr-pill',nav), right=nav&&$('.right',nav);
    function fitNav(){
      if(!bar||!pill||!right) return;
      nav.classList.remove('compact');
      if(getComputedStyle(pill).display==='none') return;
      var lim=bar.getBoundingClientRect().right-parseFloat(getComputedStyle(bar).paddingRight);
      var extra=nav.classList.contains('small')?(150-98)*1374/1400:0;
      if(right.getBoundingClientRect().right+extra>lim+0.5) nav.classList.add('compact');
    }
    fitNav(); window.addEventListener('resize',fitNav,{passive:true}); window.addEventListener('load',fitNav);
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fitNav);
    function openMenu(){ root.classList.add('fxr-menu-open'); if(burger) burger.setAttribute('aria-expanded','true'); }
    function closeMenu(){ if(!root.classList.contains('fxr-menu-open')) return; root.classList.remove('fxr-menu-open'); if(burger) burger.setAttribute('aria-expanded','false'); }
    if(burger) burger.addEventListener('click',function(){ root.classList.contains('fxr-menu-open')?closeMenu():openMenu(); });
    if(mmenu) $$('a',mmenu).forEach(function(a){ a.addEventListener('click',closeMenu); });
    var drops=$$('.fxr-pill li.has-drop');
    function closeDrops(){ drops.forEach(function(li){ li.classList.remove('open'); var b=li.querySelector('button'); if(b) b.setAttribute('aria-expanded','false'); }); }
    drops.forEach(function(li){ var b=li.querySelector('button'); if(!b) return; b.addEventListener('click',function(e){ e.stopPropagation(); var o=li.classList.contains('open'); closeDrops(); if(!o){ li.classList.add('open'); b.setAttribute('aria-expanded','true'); } }); });
    document.addEventListener('click',function(e){ if(!e.target.closest('.fxr-pill li.has-drop')) closeDrops(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ closeDrops(); closeMenu(); } });

    /* ---- tap events (site redo §7, 2026-10-28): GTM-PRS94G4W turns these into GA4 events and the click-to-call conversion ---- */
    window.dataLayer=window.dataLayer||[];
    var slug=(page&&page.getAttribute('data-page'))||location.pathname.replace(/^\/|\/$/g,'')||'home';
    document.addEventListener('click',function(e){
      var a=e.target.closest('a'); if(!a) return;
      var h=a.getAttribute('href')||'', ev=/^tel:/.test(h)?'fxr_call_click':/^sms:/.test(h)?'fxr_text_click':/#quote$/.test(h)?'fxr_quote_click':'';
      if(ev) window.dataLayer.push({event:ev,fxr_page:slug,fxr_where:(a.closest('.fxr-mbar')?'mobile-bar':a.closest('.fxr-nav,.fxr-mmenu')?'nav':a.closest('.fxr-hero')?'hero':'page')});
    },true);

    if(!page){ return; } /* old pages: nav only */

    /* Rocky's helper lives on the homepage only (site redo §3: nothing between the visitor and the form) */
    if(rocky&&page.getAttribute('data-page')!=='home'){ rocky.parentNode.removeChild(rocky); rocky=null; }

    /* ---- a missing photo must never show a broken-image icon: drop it and let the panel gradient show ---- */
    $$('img',page).forEach(function(im){ im.addEventListener('error',function(){ im.style.display='none'; },{once:true}); if(im.complete&&im.naturalWidth===0) im.style.display='none'; });

    /* ---- paint nudge (2026-10-08) ---- */
    /* Live in GHL, Chrome decoded the hero photo and the .fxr-vbg backgrounds but did not paint that layer for 10-15 s unless a
       style change invalidated it (navy hero on first view). Any style change on the section fixes it, so nudge the section's
       z-index once its image has loaded (and again on window load). The nudge stays off .media's transform. */
    function nudge(sec){ if(!sec) return; requestAnimationFrame(function(){ sec.style.zIndex='1'; requestAnimationFrame(function(){ sec.style.zIndex=''; }); }); }
    $$('.fxr-hero .media img, .fxr-vbg img').forEach(function(img){
      var sec=img.closest('.fxr-hero, .fxr-hasv'); var go=function(){ nudge(sec); };
      if(img.complete&&img.naturalWidth) go(); else img.addEventListener('load',go);
      if(img.decode) img.decode().then(go).catch(function(){});
    });
    window.addEventListener('load',function(){ $$('.fxr-hero, .fxr-hasv').forEach(nudge); });
    /* ---- videos ---- */
    function playV(v){ var p=v.play&&v.play(); if(p&&p.catch) p.catch(function(){}); }
    function loadV(v){ if(v.dataset.src&&!v.getAttribute('src')){ v.setAttribute('src',v.dataset.src); v.load(); } }
    /* spec §6.3 (site redo 10/28): the hero loop plays on desktop only, after the page has loaded, never on cellular or Save-Data */
    var conn=navigator.connection||{}, slow=!!(conn.saveData||conn.type==='cellular'||/2g|3g/.test(conn.effectiveType||''));
    var desk=window.matchMedia('(min-width:1101px)').matches;
    $$('.fxr-hero .media video').forEach(function(v){
      if(reduce||slow||!desk){ v.remove(); return; }
      v.addEventListener('error',function(){ v.remove(); },true);
      v.addEventListener('playing',function(){ v.classList.add('on'); });
      var go=function(){ loadV(v); playV(v); };
      if(document.readyState==='complete') go(); else window.addEventListener('load',go);
    });
    if('IntersectionObserver' in window&&!reduce&&!slow){
      var vio=new IntersectionObserver(function(es){ es.forEach(function(e){ var v=e.target; if(e.isIntersecting){ loadV(v); playV(v); v.addEventListener('playing',function(){ v.classList.add('on'); }); } else { if(!v.paused) v.pause(); } }); },{rootMargin:'200px 0px'});
      $$('.fxr-vbg video').forEach(function(v){ v.addEventListener('error',function(){ v.remove(); },true); vio.observe(v); });
    }
    $$('.fxr-tile').forEach(function(t){
      var v=t.querySelector('video.tv'); if(!v||reduce) return;
      var on=function(){ loadV(v); playV(v); t.classList.add('playing'); }, off=function(){ v.pause(); t.classList.remove('playing'); };
      if(touch){ if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting?on():off(); }); },{threshold:.6}).observe(t); } }
      else { t.addEventListener('mouseenter',on); t.addEventListener('mouseleave',off); }
    });

    /* ---- reveal ---- */
    if(!reduce&&'IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('shown'); e.target.classList.remove('armed'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -8% 0px'});
      $$('.rv',page).forEach(function(el,i){ if(el.getBoundingClientRect().top>window.innerHeight*0.9){ el.classList.add('armed'); var p=el.parentElement; el.style.transitionDelay=((p&&(p.classList.contains('fxr-bento')||p.classList.contains('fxr-tgrid')||p.classList.contains('fxr-plans')||p.classList.contains('fxr-supp')))?(i%3)*0.08:0)+'s'; io.observe(el); } });
    }

    /* ---- statement word light-up ---- */
    var st=$('.fxr-statement p.stmt');
    if(st){
      (function split(node){ [].slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){ var frag=document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(function(w){ if(!w) return; if(/^\s+$/.test(w)){ frag.appendChild(document.createTextNode(w)); } else { var s=document.createElement('span'); s.className='w'+(node.classList&&node.classList.contains('hl')?' hl':''); s.textContent=w; frag.appendChild(s); } }); n.replaceWith(frag); }
        else if(n.nodeType===1){ split(n); }
      }); })(st);
      var ws=$$('.w',st);
      function lightWords(){ var r=st.getBoundingClientRect(),vh=window.innerHeight; var pr=(vh*0.85-r.top)/(r.height+vh*0.35); pr=Math.max(0,Math.min(1,pr)); var n=Math.round(pr*ws.length); ws.forEach(function(w,i){ w.classList.toggle('lit',reduce||i<n); }); }
      window.addEventListener('scroll',lightWords,{passive:true}); lightWords();
    }

    /* ---- tile glow + tilt, button magnet ---- */
    if(!touch&&!reduce){
      $$('.fxr-tile').forEach(function(t){
        t.addEventListener('mousemove',function(e){ var r=t.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top; t.style.setProperty('--mx',x+'px'); t.style.setProperty('--my',y+'px'); t.style.transform='perspective(1200px) rotateX('+((y/r.height-.5)*-4)+'deg) rotateY('+((x/r.width-.5)*4)+'deg)'; });
        t.addEventListener('mouseleave',function(){ t.style.transform=''; });
      });
      $$('.fxr-btn-glow,.fxr-spin',page).forEach(function(b){
        b.addEventListener('mousemove',function(e){ var r=b.getBoundingClientRect(); b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.25)+'px)'; });
        b.addEventListener('mouseleave',function(){ b.style.transform=''; });
      });
    }

    /* ---- before / after ---- */
    var cmp=$('.fxr-compare'), rng=cmp&&cmp.querySelector('input[type=range]');
    if(cmp&&rng){
      function setPos(v){ cmp.style.setProperty('--pos',v+'%'); }
      rng.addEventListener('input',function(){ setPos(rng.value); }); setPos(50);
      $$('.fxr-tabs button[data-before]').forEach(function(b){ b.addEventListener('click',function(){
        $$('.fxr-tabs button[data-before]').forEach(function(x){ x.setAttribute('aria-pressed',x===b); });
        var bi=cmp.querySelector('img.before'), ai=cmp.querySelector('img.after'), cap=cmp.querySelector('.cap');
        if(bi){ bi.src=b.dataset.before; bi.alt=b.dataset.altb||''; } if(ai){ ai.src=b.dataset.after; ai.alt=b.dataset.alta||''; }
        if(cap){ cap.innerHTML=''; var s=document.createElement('strong'); s.textContent=b.dataset.cap||''; var t=document.createElement('span'); t.textContent=b.dataset.town||''; cap.appendChild(s); cap.appendChild(t); }
        setPos(50); rng.value=50;
      }); });
    }

    /* ---- counters: the final number, no count-up (GSAP is out, site redo 2026-10-28) ---- */
    $$('.count[data-to]',page).forEach(function(c){ var to=parseFloat(c.dataset.to), dec=+(c.dataset.dec||0); if(!isNaN(to)) c.textContent=to.toFixed(dec); });

    /* ---- process timeline: each step lights up as it scrolls in ---- */
    var tl=$('.fxr-tl'), fill=tl&&tl.querySelector('.fill');
    if(tl){
      if(fill) fill.style.transform='none';
      var stps=$$('.fxr-stp',tl);
      if(!reduce&&'IntersectionObserver' in window){
        var sio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('act'); sio.unobserve(e.target); } }); },{rootMargin:'0px 0px -38% 0px'});
        stps.forEach(function(st){ sio.observe(st); });
      } else { stps.forEach(function(st){ st.classList.add('act'); }); }
    }

    /* ---- mobile bar: hide while the form card is in view ---- */
    var fcard=$('.fxr-fcard');
    if(mbar&&fcard&&'IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ mbar.classList.toggle('hide',e.isIntersecting); }); },{threshold:.15}).observe(fcard); }

    /* ---- quote form on screen: Rocky and the chat bubble step aside (the bottom bar already does) ---- */
    var onForm=false;
    function applyAway(){ if(rocky) rocky.classList.toggle('away',onForm); var cw=document.querySelector('chat-widget'); if(cw) cw.classList.toggle('fxr-away',onForm); }
    if('IntersectionObserver' in window){
      var nForm=0, fio=new IntersectionObserver(function(es){ es.forEach(function(e){ nForm+=e.isIntersecting?1:(e.target._fxrSeen?-1:0); e.target._fxrSeen=e.isIntersecting; }); if(nForm<0) nForm=0; onForm=nForm>0; applyAway(); });
      $$('.fxr-fcard',page).forEach(function(c){ fio.observe(c); });
    }

    /* ---- GHL chat bubble: on phones sit above the Call/Text/Quote bar (styles injected into its shadow root) ---- */
    (function(){
      function lift(){
        var cw=document.querySelector('chat-widget');
        if(!cw||!cw.shadowRoot) return false;
        if(cw.shadowRoot.getElementById('fxr-chat-lift')) return true;
        var st=document.createElement('style'); st.id='fxr-chat-lift';
        st.textContent='@media (max-width:760px){#lc_text-widget,#lc_text-widget--btn{bottom:calc(86px + env(safe-area-inset-bottom,0px))!important}:host(.fxr-away:not([data-active="true"])) #lc_text-widget,:host(.fxr-away:not([data-active="true"])) #lc_text-widget--btn{opacity:0!important;pointer-events:none!important;transition:opacity .25s}}';
        cw.shadowRoot.appendChild(st); applyAway(); return true;
      }
      if(!lift()){ var n=0, tm=setInterval(function(){ if(lift()||++n>60) clearInterval(tm); },500); }
    })();

    /* ---- Rocky helper ---- */
    if(rocky){
      var rMsg=$('#fxrRockyMsg'), rCta=$('#fxrRockyCta'), rT=null;
      function bubble(){ rocky.classList.remove('min'); clearTimeout(rT); rT=setTimeout(function(){ rocky.classList.add('min'); },9000); }
      /* phones: the chat greeting lives bottom-left, so Rocky's bubble waits for a tap instead of popping up on its own */
      var phoneMQ=window.matchMedia('(max-width:760px)');
      function autoBubble(){ if(phoneMQ.matches){ rocky.classList.add('min'); return; } bubble(); }
      var rockyArmed=false;
      function armRocky(){ if(rockyArmed) return; if((window.scrollY||0) < window.innerHeight*0.55) return; rockyArmed=true; rocky.classList.add('show'); autoBubble(); }
      window.addEventListener('scroll',armRocky,{passive:true});
      setTimeout(armRocky,3500);
      var rx=$('#fxrRockyX'); if(rx) rx.addEventListener('click',function(){ rocky.classList.add('min'); });
      var rg=$('#fxrRockyGuy'); if(rg) rg.addEventListener('click',function(){ if(rocky.classList.contains('min')){ bubble(); } else { var t=document.getElementById((rCta&&rCta.getAttribute('href')||'#quote').replace(/^\/?#/,'')); if(t) scrollTo(t); else location.href='/contact'; } });
      if('IntersectionObserver' in window){
        var rio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return; var d=e.target.dataset.rocky; if(d==='hide'){ rocky.classList.remove('show'); return; } rockyArmed=true; rocky.classList.add('show'); var parts=d.split('|'); if(parts.length>=3&&rMsg&&rMsg.textContent!==parts[0]){ rMsg.textContent=parts[0]; rCta.textContent=parts[1]; rCta.setAttribute('href',parts[2]); autoBubble(); } }); },{threshold:.35});
        $$('[data-rocky]',page).forEach(function(el){ if(el.classList.contains('fxr-hero')) return; rio.observe(el); });
      }
    }

    /* ---- membership join buttons -> quote form ---- */
    $$('[data-plan]',page).forEach(function(a){ a.addEventListener('click',function(){ var m=$('#fxrRockyMsg'); if(m&&rocky){ m.textContent='Tell us "'+a.dataset.plan+'" in the form and the office sets it up on your first visit.'; rocky.classList.add('show'); rocky.classList.remove('min'); } }); });

  });
})();
