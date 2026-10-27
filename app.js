/* LPDB — catálogo estático. Dados em /data (config.js e produtos.js). */
(function () {
  'use strict';

  var PAGE = document.body.getAttribute('data-page') || 'home';
  var PLACEHOLDERS = 8;                 // cartões reservados enquanto não há produtos
  var SIZES = [480, 960, 1600];         // larguras geradas na etapa de processamento das fotos
  var cfg = {};
  var produtos = [];

  /* ---------- utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function preco(v) {
    if (typeof v !== 'number' || !isFinite(v)) return null;
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /* Fotos: "pasta/arquivo" -> img/produtos/pasta/arquivo-480.webp, -960.webp, -1600.webp */
  function fotoSrc(base, w) { return 'img/produtos/' + base + '-' + w + '.webp'; }
  function fotoSrcset(base) { return SIZES.map(function (w) { return fotoSrc(base, w) + ' ' + w + 'w'; }).join(', '); }
  function fotoBase(f) { return typeof f === 'string' ? f : f.src; }
  function fotoAlt(f, p) { return (f && f.alt) || p.nome || 'Óculos LPDB'; }

  /* ---------- WhatsApp ---------- */
  function waNumero() {
    var n = cfg.whatsappLoja && cfg.whatsappLoja.numero;
    n = n ? String(n).replace(/\D/g, '') : '';
    return n.length >= 10 ? n : '';
  }
  function waLink(p) {
    var n = waNumero();
    if (!n) return '';
    var msg = 'Olá! Tenho interesse em um modelo da LPDB.';
    if (p) {
      msg = (cfg.mensagemWhatsapp || 'Olá! Tenho interesse no modelo {nome} (código {codigo}).')
        .replace('{nome}', p.nome || '').replace('{codigo}', p.codigo || '');
      if (!p.codigo) msg = msg.replace(/\s*\(código\s*\)/i, '');
    }
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(msg);
  }
  function setupWa(el, p) {
    var link = waLink(p);
    if (link) { el.href = link; el.target = '_blank'; el.rel = 'noopener'; el.removeAttribute('aria-disabled'); el.classList.remove('is-off'); }
    else { el.setAttribute('aria-disabled', 'true'); el.classList.add('is-off'); el.addEventListener('click', function (e) { e.preventDefault(); toast('O WhatsApp da loja estará disponível em breve.'); }); }
  }

  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 3200);
  }

  /* ---------- menu ---------- */
  function initMenu() {
    var b = $('#burger'), m = $('#menu'), h = $('.site-header');
    if (!b) return;
    function close() { b.setAttribute('aria-expanded', 'false'); m.classList.remove('open'); document.body.classList.remove('lock'); }
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open)); m.classList.toggle('open', open); document.body.classList.toggle('lock', open);
    });
    $$('a', m).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    function onScroll() { h.classList.toggle('scrolled', window.scrollY > 40); }
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- links oficiais vindos de config.json ---------- */
  function applyConfig() {
    if (cfg.instagram && cfg.instagram.url) {
      $$('#link-instagram,[data-link="instagram"]').forEach(function (a) { a.href = cfg.instagram.url; });
    }
    if (cfg.grupoWhatsapp) $$('#link-grupo,[data-link="grupo"]').forEach(function (a) { a.href = cfg.grupoWhatsapp; });
    $$('[data-wa="geral"]').forEach(function (a) { var l = waLink(null); if (l) { a.href = l; a.target = '_blank'; a.rel = 'noopener'; } else { a.addEventListener('click', function (e) { e.preventDefault(); toast('O WhatsApp da loja estará disponível em breve.'); }); a.setAttribute('aria-disabled', 'true'); a.classList.add('is-off'); } });
    var y = $('#ano'); if (y) y.textContent = new Date().getFullYear();

    var loja = cfg.loja || {};
    var end = $('#loja-endereco'), hor = $('#loja-horario'), btn = $('#btn-mapa'), mapa = $('#mapa');
    if (end && loja.endereco) { end.textContent = loja.endereco; end.classList.remove('pending'); }
    if (hor && loja.horario) { hor.textContent = loja.horario; hor.classList.remove('pending'); }
    if (btn) {
      if (loja.linkMapa) { btn.href = loja.linkMapa; btn.target = '_blank'; btn.rel = 'noopener'; btn.removeAttribute('aria-disabled'); }
      else btn.addEventListener('click', function (e) { e.preventDefault(); toast('O endereço e o mapa serão informados em breve.'); });
    }
    if (mapa && loja.embedMapa) {
      mapa.innerHTML = '<iframe title="Mapa da loja LPDB" src="' + esc(loja.embedMapa) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
    }
  }

  /* ---------- catálogo ---------- */
  function cardHTML(p) {
    var fotos = p.fotos || [];
    var capa = fotos[0] ? fotoBase(fotos[0]) : null;
    var pr = preco(p.preco);
    var img = capa
      ? '<img src="' + fotoSrc(capa, 480) + '" srcset="' + fotoSrcset(capa) + '" sizes="(min-width:1100px) 25vw, (min-width:700px) 33vw, 50vw" alt="' + esc(fotoAlt(fotos[0], p)) + '" width="480" height="480" loading="lazy" decoding="async">'
      : '<span class="ph-label">Foto em breve</span>';
    return '<a class="card" href="produto.html?id=' + encodeURIComponent(p.id) + '" data-id="' + esc(p.id) + '">' +
      '<span class="card-img">' + img + '</span>' +
      '<span class="card-body">' +
        (p.categoria ? '<span class="card-cat">' + esc(p.categoria) + '</span>' : '') +
        '<span class="card-name">' + esc(p.nome || 'Modelo') + '</span>' +
        '<span class="card-meta">' + (p.codigo ? '<span>Cód. ' + esc(p.codigo) + '</span>' : '<span></span>') + '<b>' + (pr || 'Consulte') + '</b></span>' +
      '</span></a>';
  }
  function placeholderHTML(i) {
    return '<div class="card card-ph" aria-hidden="true"><span class="card-img"><span class="ph-label">Espaço reservado</span></span>' +
      '<span class="card-body"><span class="card-cat">Categoria</span><span class="card-name">Modelo ' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="card-meta"><span>Cód. —</span><b>—</b></span></span></div>';
  }

  function initCatalog() {
    var grid = $('#grid'); if (!grid) return;
    var count = $('#catalogo-count'), aviso = $('#catalogo-aviso'), tb = $('#toolbar'), chips = $('#chips'), busca = $('#busca');
    var filtro = 'Todos', termo = '';

    if (!produtos.length) {
      grid.innerHTML = Array.apply(null, Array(PLACEHOLDERS)).map(function (_, i) { return placeholderHTML(i); }).join('');
      aviso.hidden = false;
      count.textContent = 'Catálogo em preparação.';
      return;
    }
    var cats = ['Todos'];
    produtos.forEach(function (p) { if (p.categoria && cats.indexOf(p.categoria) < 0) cats.push(p.categoria); });
    if (cats.length > 2) {
      tb.hidden = false;
      chips.innerHTML = cats.map(function (c) { return '<button type="button" class="chip' + (c === 'Todos' ? ' on' : '') + '" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join('');
      chips.addEventListener('click', function (e) {
        var b = e.target.closest('.chip'); if (!b) return;
        filtro = b.getAttribute('data-c');
        $$('.chip', chips).forEach(function (x) { x.classList.toggle('on', x === b); }); render();
      });
    } else if (produtos.length > 8) tb.hidden = false;
    if (!tb.hidden) busca.addEventListener('input', function () { termo = busca.value.trim().toLowerCase(); render(); });
    else $('.search', tb).hidden = true;

    function render() {
      var lista = produtos.filter(function (p) {
        if (filtro !== 'Todos' && p.categoria !== filtro) return false;
        if (termo && ((p.nome || '') + ' ' + (p.codigo || '')).toLowerCase().indexOf(termo) < 0) return false;
        return true;
      });
      grid.innerHTML = lista.length ? lista.map(cardHTML).join('') : '<p class="empty">Nenhum modelo encontrado.</p>';
      count.textContent = lista.length + (lista.length === 1 ? ' modelo' : ' modelos');
    }
    render();
  }

  /* ---------- página de produto ---------- */
  function initProduct() {
    if (PAGE !== 'produto') return;
    var id = new URLSearchParams(location.search).get('id');
    var p = produtos.filter(function (x) { return x.id === id; })[0];
    var aviso = $('#produto-aviso');
    var preview = !p;
    if (preview) {
      aviso.hidden = false;
      aviso.textContent = id ? 'Modelo não encontrado. Exibindo a estrutura da página em modo de pré-visualização.' : 'Pré-visualização da estrutura da página de produto. Os dados reais virão do catálogo.';
      p = { id: '', nome: 'Nome do modelo', codigo: '', categoria: 'Categoria', preco: null, descricao: '', fotos: [] };
    }
    document.title = (preview ? 'Modelo' : p.nome) + ' — LPDB';
    $('#p-nome').textContent = p.nome || 'Modelo';
    $('#p-categoria').textContent = p.categoria || 'Óculos';
    $('#p-codigo').textContent = p.codigo ? 'Cód. ' + p.codigo : (preview ? 'Cód. —' : '');
    $('#p-codigo').hidden = !p.codigo && !preview;
    $('#p-preco').textContent = preco(p.preco) || 'Consulte o preço';
    var d = $('#p-descricao'); if (p.descricao) d.textContent = p.descricao; else d.hidden = true;

    var main = $('#galeria-principal'), th = $('#galeria-thumbs');
    var fotos = p.fotos || [];
    if (!fotos.length) {
      main.innerHTML = '<div class="ph-box"><span class="ph-label">' + (preview ? 'Espaço reservado para a foto principal' : 'Fotos em breve') + '</span></div>';
      th.innerHTML = [1, 2, 3, 4].map(function () { return '<span class="thumb ph-box"></span>'; }).join('');
    } else {
      var show = function (i) {
        var b = fotoBase(fotos[i]);
        main.innerHTML = '<img src="' + fotoSrc(b, 960) + '" srcset="' + fotoSrcset(b) + '" sizes="(min-width:900px) 50vw, 100vw" alt="' + esc(fotoAlt(fotos[i], p)) + '" ' + (i === 0 ? 'fetchpriority="high"' : '') + '>';
        $$('.thumb', th).forEach(function (t, k) { t.classList.toggle('on', k === i); t.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      };
      th.innerHTML = fotos.length > 1 ? fotos.map(function (f, i) {
        var b = fotoBase(f);
        return '<button type="button" class="thumb" data-i="' + i + '" aria-label="Ver foto ' + (i + 1) + '"><img src="' + fotoSrc(b, 480) + '" alt="" loading="lazy" decoding="async"></button>';
      }).join('') : '';
      th.addEventListener('click', function (e) { var b = e.target.closest('.thumb'); if (b) show(+b.getAttribute('data-i')); });
      show(0);
    }

    var wa = $('#p-wa');
    setupWa(wa, preview ? null : p);
    if (!waNumero()) $('#p-wa-hint').hidden = false;
  }

  /* ---------- início ---------- */
  initMenu();
  cfg = window.LPDB_CONFIG || {};
  produtos = Array.isArray(window.LPDB_PRODUTOS) ? window.LPDB_PRODUTOS : [];
  applyConfig(); initCatalog(); initProduct();
})();
