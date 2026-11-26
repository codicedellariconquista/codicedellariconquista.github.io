/* Quiz Reconquista IT (/quiz/): 6 perguntas fixas, avanço automático ao tocar (260 ms), «Indietro»,
   barra de progresso, carregamento de 2,2 s com 4 itens e resultado por fase.
   No fim, o botão do resultado leva para a VSL: split 50/50 (a mesma regra da raiz) → /yt/ (var=A) ou /v/ (var=B),
   com a query do anúncio inteira (utm_*, src, sck, fbclid, lab_teste…) + var + quiz_result=<fase>.
   quiz_result está no PARAM_BLOCKLIST do rq-config: não vai para o checkout; var sim.
   Respostas: o script do painel já registra (evento qz) pelos atributos data-lab-quiz / data-lab-pergunta / data-lab-resposta. */
(function () {
  var Q = window.RQ_QUIZ, QS = Q.QS, FASES = Q.FASES;
  var A = {}, cur = 0, root = document.getElementById('rq');
  var holder = document.getElementById('rq-qs');
  var sent = {};
  function track(ev, data) {
    try { if (typeof window.fbq === 'function') window.fbq('trackCustom', ev, data || {}); } catch (e) {}
  }
  function labEventId(tipo) {
    try { if (typeof window.__labEventId === 'function') return window.__labEventId(tipo); } catch (e) {}
    var m = document.cookie.match(/(?:^|; )_lab_s=([^;]*)/);
    if (!m) return null;
    try { return tipo + '.' + decodeURIComponent(m[1]); } catch (e) { return tipo + '.' + m[1]; }
  }
  function whenLabSession(fn) {
    var done = false;
    function go(force) {
      var ready = !!labEventId('vc');
      if (ready && !done) { done = true; fn(true); return; }
      if (force && !done) { done = true; fn(false); }
    }
    go();
    if (done) return;
    var n = 0;
    var t = setInterval(function () {
      n += 1;
      if (labEventId('vc')) { clearInterval(t); go(); }
      else if (n >= 80) { clearInterval(t); go(true); }
    }, 50);
  }
  /* ViewContent no início do quiz, com o mesmo eventID vc.<sessão> da CAPI do painel. Sem fallback inventado: se a sessão não chegar, não dispara. */
  whenLabSession(function (ok) {
    if (!ok || typeof window.fbq !== 'function') return;
    var id = labEventId('vc');
    if (!id) return;
    try { window.fbq('track', 'ViewContent', { rq_variant: 'quiz' }, { eventID: id }); } catch (e) {}
  });
  /* Split 50/50 igual ao da raiz: ?var=A|B força; senão cookie/localStorage rq_var (variante fixa); senão sorteio. */
  function pickVariant() {
    var C = window.RQ_CONFIG, qs = new URLSearchParams(location.search);
    function ok(x) { x = (x || '').toUpperCase(); return x === 'A' || x === 'B' ? x : null; }
    function ck() { var m = document.cookie.match(new RegExp('(?:^|; )' + C.VARIANT_KEY + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : null; }
    function ls() { try { return localStorage.getItem(C.VARIANT_KEY); } catch (e) { return null; } }
    function rnd() { try { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; } catch (e) { return Math.random(); } }
    var v = ok(qs.get(C.VARIANT_PARAM)) || ok(ck()) || ok(ls());
    if (!v) v = rnd() < C.SPLIT_A ? 'A' : 'B';
    try { document.cookie = C.VARIANT_KEY + '=' + encodeURIComponent(v) + '; max-age=' + C.VARIANT_DAYS * 86400 + '; path=/; SameSite=Lax'; } catch (e) {}
    try { localStorage.setItem(C.VARIANT_KEY, v); } catch (e) {}
    return v;
  }
  function step(n) { if (sent['s' + n]) return; sent['s' + n] = 1; track('QuizStep', { step: n, total: QS.length, rq_variant: 'quiz' }); }

  QS.forEach(function (q, idx) {
    var s = document.createElement('section'); s.className = 'step'; s.setAttribute('data-step', 'q' + (idx + 1));
    var h = '<div data-lab-pergunta="q' + (idx + 1) + '-' + q.k + '"><div class="qtitle">' + q.t + '</div><div class="qhint">' + q.h + '</div><div class="opts">';
    q.o.forEach(function (o) { h += '<button class="opt" type="button" data-k="' + q.k + '" data-v="' + o[0] + '" data-lab-resposta="' + o[2].replace(/"/g, '&quot;') + '"><span class="e">' + (window.RQ_ICON ? RQ_ICON(o[1]) : '') + '</span><span>' + o[2] + '</span></button>'; });
    h += '</div></div>' + (idx > 0 ? '<button class="back" type="button" data-back>‹ Indietro</button>' : '');
    s.innerHTML = h; holder.appendChild(s);
  });

  if (window.RQ_ICON) RQ_ICON.paint(root);

  function setProgress(n) {
    var prog = document.getElementById('rq-prog');
    var bar = document.getElementById('rq-bar');
    var lab = document.getElementById('rq-qstep');
    var onQ = n >= 1 && n <= QS.length;
    if (prog) prog.hidden = !onQ;
    if (!onQ || !bar) return;
    var pct = (n / QS.length) * 100;
    bar.style.width = pct + '%';
    if (lab) lab.textContent = n + '/' + QS.length;
    var wrap = bar.parentNode;
    if (wrap && wrap.setAttribute) { wrap.setAttribute('aria-valuenow', String(n)); wrap.setAttribute('aria-valuemax', String(QS.length)); }
  }
  function show(name) {
    root.querySelectorAll('.step').forEach(function (s) { s.classList.toggle('on', s.getAttribute('data-step') === name); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function go(n) {
    cur = n;
    if (n > QS.length) { setProgress(0); show('loading'); finish(); }
    else { show('q' + n); setProgress(n); step(n); }
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (b) { go(+b.getAttribute('data-go')); return; }
    var bk = e.target.closest('[data-back]'); if (bk) { go(Math.max(1, cur - 1)); return; }
    var o = e.target.closest('.opt'); if (o) {
      o.parentNode.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('sel'); }); o.classList.add('sel');
      A[o.getAttribute('data-k')] = o.getAttribute('data-v');
      setTimeout(function () { go(cur + 1); }, 260);
    }
  });

  function finish() {
    var lis = root.querySelectorAll('.loading li'); lis.forEach(function (l) { l.classList.remove('ok'); });
    lis.forEach(function (l, i) { setTimeout(function () { l.classList.add('ok'); }, 450 * (i + 1)); });
    setTimeout(function () {
      var f = Q.fase(A), F = FASES[f];
      document.getElementById('rq-chip').textContent = 'La tua fase: ' + F.n;
      document.getElementById('rq-rtitle').innerHTML = F.title;
      document.getElementById('rq-rwhat').textContent = F.what;
      var d = document.getElementById('rq-rdo'); d.textContent = F.do;
      document.getElementById('rq-rdont').textContent = F.dont;
      root.querySelectorAll('.res .meter span').forEach(function (s, i) { s.classList.toggle('on', i === F.i); });
      document.getElementById('rq-rnotes').innerHTML = Q.notes(A, f).map(function (x) {
        return '<p>' + x + '</p>';
      }).join('');
      try { localStorage.setItem('rq_quiz_fase', f); localStorage.setItem('rq_quiz_respostas', JSON.stringify(A)); } catch (e) {}
      var v = pickVariant(), C = window.RQ_CONFIG;
      var u = new URL('../' + (v === 'A' ? C.PATH_A : C.PATH_B), location.href);
      new URLSearchParams(location.search).forEach(function (val, k) { if (!u.searchParams.has(k)) u.searchParams.set(k, val); });
      u.searchParams.set(C.VARIANT_PARAM, v);
      u.searchParams.set('quiz_result', f);
      document.getElementById('rq-tooffer').href = u.toString();
      track('QuizComplete', { fase: f, rq_variant: 'quiz', rq_assigned: v });
      show('result');
    }, 2200);
  }
})();
