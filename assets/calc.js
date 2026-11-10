/* FIXALL Roofing & Exteriors ballpark calculator. Every number comes from the #fxr-pricing block (data/pricing.json, Matt's
   ranges, Joe 11/9). Totals round to the nearest display_round ($500), like Matt's calculator. Budgeting only, never a quote. */
(function(){
  function ready(fn){ if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn);} else {fn();} }
  ready(function(){
    var cfgEl=document.getElementById('fxr-pricing'); if(!cfgEl) return;
    var P; try{ P=JSON.parse(cfgEl.textContent); }catch(e){ return; }
    var R=P.display_round||500;
    var money=function(n){ return '$'+(Math.round(n/R)*R).toLocaleString('en-US'); };
    [].slice.call(document.querySelectorAll('.fxr-calc[data-key]')).forEach(function(c){
      var T=P[c.getAttribute('data-key')]; if(!T) return;
      var q=function(s){ return c.querySelector(s); }, qa=function(s){ return [].slice.call(c.querySelectorAll(s)); };
      var eLo=q('[data-c=lo]'), eHi=q('[data-c=hi]'), eSum=q('[data-c=sum]'), size=q('input[type=range]'), out=q('[data-c=sizeo]');
      function compute(){
        var tier=+((q('input[data-r=tier]:checked')||{value:0}).value), lo=0, hi=0, d;
        if(T.rows){
          var row=+((q('input[data-r=row]:checked')||{value:0}).value), r=T.rows[row].tiers[tier];
          lo=r[0]; hi=r[1]; d=T.tiers[tier][0]+', '+T.rows[row].label.toLowerCase()+' home ('+T.rows[row].hint+')';
        } else if(size){
          var n=+size.value, p=T.per[tier];
          lo=n*p[0]; hi=n*p[1];
          if(out) out.textContent=n.toLocaleString('en-US')+' '+T.unit;
          size.style.setProperty('--fill',((n-T.min)/(T.max-T.min)*100)+'%');
          d=T.tiers[tier][0]+', '+n.toLocaleString('en-US')+' '+T.unit;
        }
        var ex=qa('input[data-lo]:checked');
        ex.forEach(function(x){ lo+=+x.getAttribute('data-lo'); hi+=+x.getAttribute('data-hi'); });
        if(ex.length) d+=', plus '+ex.length+' add-on'+(ex.length>1?'s':'');
        if(eLo) eLo.textContent=money(lo); if(eHi) eHi.textContent=money(hi); if(eSum) eSum.textContent=d+'.';
      }
      qa('input').forEach(function(i){ i.addEventListener(i.type==='range'?'input':'change',compute); });
      compute();
    });
  });
})();
