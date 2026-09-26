(function(){
    // Al hacer click en un link del sidebar ("Punto N"), abrir automáticamente
    // todas las tarjetas <details class="exercise"> de esa sección.
    var sideLinks = document.querySelectorAll('.side-link');
    sideLinks.forEach(function(link){
      link.addEventListener('click', function(){
        var id = link.getAttribute('href');
        if (!id || id.charAt(0) !== '#') return;
        var section = document.querySelector(id);
        if (!section) return;
        var exercises = section.querySelectorAll('details.exercise');
        exercises.forEach(function(d){ d.open = true; });
      });
    });
  })();

  (function(){
    // Punto 9: descifrador ASCII, carácter por carácter.
    var root = document.getElementById("decoder");
    if (!root) return;
    var codes = root.getAttribute("data-codes").split(/\s+/).map(Number);
    var cellsBox = document.getElementById("dec-cells"), out = document.getElementById("dec-out"),
        cap = document.getElementById("dec-cap"), go = document.getElementById("dec-go"), rs = document.getElementById("dec-reset"), res = document.getElementById("dec-res");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var run = 0, els = [], word = null;
    function pad(n){ return ("000" + n).slice(-3); }
    function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
    function explain(c){
      var ch = String.fromCharCode(c), p = pad(c);
      if (c >= 65 && c <= 90) return p + " = 65 ('A') + " + (c - 65) + " → " + ch;
      if (c >= 97 && c <= 122) return p + " = 97 ('a') + " + (c - 97) + " → " + ch;
      if (c === 32) return p + " → espacio";
      if (c === 33) return p + " → signo de exclamación !";
      return p + " → " + ch;
    }
    codes.forEach(function(c){
      var d = document.createElement("div");
      d.className = "c-cell";
      d.innerHTML = '<div class="code">' + pad(c) + '</div><div class="chr">?</div>';
      cellsBox.appendChild(d); els.push(d);
    });
    function reset(){
      run++; word = null; out.innerHTML = ""; out.classList.remove("typing");
      els.forEach(function(d){ var t = d.querySelector(".chr"); d.className = "c-cell"; t.className = "chr"; t.textContent = "?"; });
      cap.textContent = "Listo para descifrar.";
      res.textContent = "????????"; res.classList.remove("shown");
      go.disabled = false; go.textContent = "Descifrar";
    }
    function reveal(i){
      var c = codes[i], d = els[i], t = d.querySelector(".chr");
      d.classList.remove("active"); d.classList.add("done");
      if (c === 32){
        t.className = "chr sp"; t.textContent = "␣";
        out.appendChild(document.createTextNode(" ")); word = null;
      } else {
        t.textContent = String.fromCharCode(c);
        if (!word){ word = document.createElement("span"); word.className = "word"; out.appendChild(word); }
        var s = document.createElement("span"); s.className = "ch"; s.textContent = t.textContent; word.appendChild(s);
      }
    }
    async function play(){
      reset(); var my = run;
      go.disabled = true; go.textContent = "Descifrando…"; out.classList.add("typing");
      for (var i = 0; i < codes.length; i++){
        if (reduce){ reveal(i); continue; }
        els[i].classList.add("active"); cap.textContent = explain(codes[i]);
        await sleep(260); if (my !== run) return;
        reveal(i);
        await sleep(300); if (my !== run) return;
      }
      out.classList.remove("typing"); cap.textContent = "Mensaje completo.";
      res.textContent = codes.map(function(c){ return String.fromCharCode(c); }).join(""); res.classList.add("shown");
      go.disabled = false; go.textContent = "Descifrar de nuevo";
    }
    go.addEventListener("click", play);
    rs.addEventListener("click", reset);
    reset();
  })();
