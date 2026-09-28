'use strict';
(() => {
  /* =========================================================
     1. 공통 도우미
     ========================================================= */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const boldMarks = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const todayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fmtDate = ts => { const d = new Date(ts); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const wordCount = s => (String(s || '').trim().match(/\S+/g) || []).length;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function openModal(html) { $('#modalBox').innerHTML = html; $('#modal').classList.remove('hidden'); }
  function closeModal() {
    $('#modal').classList.add('hidden'); $('#modalBox').innerHTML = '';
    if (FC) { FC = null; if (route === 'bookmarks') render(true); }
  }
  $('#modal').addEventListener('mousedown', e => { if (e.target.id === 'modal') closeModal(); });

  // 온라인 공유 페이지(claude.ai 안의 틀)에서 열렸는지: 마이크·파일 저장·외부 API가 막혀 있어요
  const ONLINE = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();

  // 방문·이용 통계 (구글 애널리틱스 4). 실제 사이트 주소에서만 집계 → 로컬 테스트는 통계에 안 섞임
  const GA_ID = 'G-HNQEHZ37NN';
  // 개발자 본인 방문 제외: 주소 끝에 ?owner=1 로 한 번 접속하면 그 브라우저는 영구 제외 (?owner=0 으로 해제)
  const OWNER = (() => {
    try {
      const q = new URLSearchParams(location.search).get('owner');
      if (q === '1') localStorage.setItem('sr_owner', '1');
      if (q === '0') localStorage.removeItem('sr_owner');
      if (q !== null) setTimeout(() => toast(q === '1' ? '👑 이 브라우저는 이제 통계에서 빠져요' : '📊 이 브라우저도 다시 통계에 포함돼요'), 600);
      return localStorage.getItem('sr_owner') === '1';
    } catch (e) { return false; }
  })();
  const GA_ON = !!GA_ID && !OWNER && location.hostname === 'rondangmu.github.io';
  if (GA_ON) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { send_page_view: false }); // 화면 전환(#bank 등)마다 직접 page_view를 보냄
    const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  const track = (name, params) => { if (GA_ON) try { gtag('event', name, params || {}); } catch (e) { } };

  // confirm() 대신 쓰는 페이지 안 확인창 (온라인 페이지에서는 confirm이 동작하지 않아요)
  function ask(msg, { ok = '확인', cancel = '취소', danger = false } = {}) {
    return new Promise(res => {
      const el = document.createElement('div');
      el.className = 'ask';
      el.innerHTML = `<div class="ask-box" role="dialog"><p>${esc(msg).replace(/\n/g, '<br>')}</p>
        <div class="row"><span class="spacer"></span><button class="btn" data-a="0">${esc(cancel)}</button><button class="btn ${danger ? 'btn-danger-fill' : 'btn-primary'}" data-a="1">${esc(ok)}</button></div></div>`;
      const done = v => { el.remove(); document.removeEventListener('keydown', key, true); res(v); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); done(true); } };
      el.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) done(b.dataset.a === '1'); else if (e.target === el) done(false); });
      document.addEventListener('keydown', key, true);
      document.body.appendChild(el);
      $('[data-a="1"]', el).focus();
    });
  }

  function copyBox(title, text) {
    openModal(`<h2>${esc(title)} <span class="spacer"></span><button class="btn btn-ghost" data-act="close-modal">✕</button></h2>
      <p class="small muted" style="margin-top:0">온라인 페이지에서는 파일 저장이 막혀 있어요. 아래 내용을 복사해서 메모장 등에 붙여넣어 저장하세요.</p>
      <textarea class="textarea" id="copyBoxTa" rows="12" readonly>${esc(text)}</textarea>
      <div class="row" style="margin-top:10px"><span class="spacer"></span><button class="btn btn-primary" id="copyBoxBtn">📋 전체 복사</button></div>`);
    $('#copyBoxBtn').onclick = () => copyText(text).then(ok => { if (ok) toast('✅ 복사했어요'); else { $('#copyBoxTa').select(); toast('선택된 내용을 Ctrl+C로 복사하세요'); } });
  }
  function download(filename, text, type = 'text/plain') {
    if (ONLINE) return copyBox('📄 ' + filename, text);
    const url = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* =========================================================
     2. 저장소 (브라우저 localStorage)
     ========================================================= */
  const KEY = 'speakingRunner.v1';
  const defaults = () => ({
    custom: [], bookmarks: [], tests: [], days: [], marks: {},
    settings: {
      apiKey: '', model: 'claude-opus-5', voice: '', rate: 0.95, flip: false,
      fbItems: ['level', 'strength', 'grammar', 'improved', 'structure', 'time'],
      fbTarget: 'auto', fbExtra: '', chatMax: 15, chatTokenMax: 60000
    },
    // Claude 채팅방 사용량 추적 (복사·붙여넣기 방식)
    chat: { url: '', count: 0, tokens: 0, started: 0 }
  });
  let S = load();
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      const d = defaults();
      if (!raw) return d;
      return { ...d, ...raw, settings: { ...d.settings, ...(raw.settings || {}) }, chat: { ...d.chat, ...(raw.chat || {}) } };
    } catch (e) { return defaults(); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { toast('⚠️ 저장 공간이 부족해요. 설정에서 백업 후 오래된 기록을 지워 주세요.'); }
    cloudSoon(); // 로그인 중이면 계정에도 저장
  }
  let saveTimer;
  const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); };
  function markDay() { const t = todayStr(); if (!S.days.includes(t)) { S.days.push(t); save(); } }
  function streak() {
    const set = new Set(S.days);
    let n = 0; const d = new Date();
    if (!set.has(todayStr(d))) d.setDate(d.getDate() - 1);
    while (set.has(todayStr(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  /* 녹음 파일은 용량이 커서 새로고침 전까지만 메모리에 보관 */
  const AUDIO = {};

  /* =========================================================
     3. 문제은행 접근
     ========================================================= */
  const PART_START = { 1: 1, 2: 3, 3: 5, 4: 8, 5: 11 };
  const partItems = p => (BANK['part' + p] || []).map(x => ({ ...x, part: p })).concat(S.custom.filter(x => x.part === p));
  const findItem = id => { for (const p of [1, 2, 3, 4, 5]) { const f = partItems(p).find(x => x.id === id); if (f) return f; } return null; };
  const subCount = it => (it.part === 3 || it.part === 4) ? (it.questions || []).length : 1;
  const qTextOf = (it, sub) => it.part === 1 ? it.text : it.part === 2 ? '사진을 보고 최대한 자세히 묘사하세요.' : it.part === 5 ? it.question : (it.questions[sub] || {}).q;
  const respSecs = (part, sub) => { const r = PART_INFO[part].resp; return r[Math.min(sub, r.length - 1)]; };
  // 모범답안: 템플릿 문장 {{ }} + 내용 조각을 조립해서 IM / IH / AL 생성
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  const dot = s => { s = String(s || '').trim(); return /[.!?]$/.test(s) ? s : s + '.'; };
  const T = s => `{{${s}}}`;
  const stripT = s => String(s || '').replace(/\{\{|\}\}/g, '');
  const tplHtml = s => esc(s).replace(/\{\{(.+?)\}\}/g, '<span class="tpl">$1</span>');
  function buildModel(it, sub) {
    if (it.part === 2 && it.place) {
      const base = `${T('This picture was taken')} ${it.place}. ${T('The first thing I see is')} ${it.see}.`;
      const A = `${T(it.a[0])} ${it.a[1]}.`, B = `${T(it.b[0])} ${it.b[1]}.`;
      return {
        IM: `${base} ${A} ${T('In the background,')} ${it.bg}. ${T('It looks')} ${it.feel}.`,
        IH: `${base} ${A} ${B} ${T('In the background,')} ${it.bg}. ${T('Overall, it looks')} ${it.feel}.`,
        AL: `${base} ${A} ${B} ${T('Also,')} ${it.c}. ${T('In the background,')} ${it.bg}. ${T('Overall, it seems like')} ${it.mood}.`
      };
    }
    if (it.part === 3 && it.questions[sub] && it.questions[sub].a) {
      const q = it.questions[sub];
      if (sub < 2) {
        const exT = /^(last|when|yesterday|this|in |on |once|every)/i.test(q.ex) ? 'For example,' : 'Also,';
        return {
          IM: `${cap(q.a)} ${T('because')} ${q.why}.`,
          IH: `${cap(q.a)}. ${T("That's because")} ${q.why}.`,
          AL: `${cap(q.a)}. ${T("That's because")} ${q.why}. ${T(exT)} ${dot(q.ex)}`
        };
      }
      const two = /\btwo\b/.test(q.a) ? '' : ` ${T('I have two reasons.')}`;
      return {
        IM: `${cap(q.a)}. ${T('First,')} ${q.r1}. ${T('Second,')} ${q.r2}.`,
        IH: `${cap(q.a)}.${two} ${T('First,')} ${q.r1}. ${T('Second,')} ${q.r2}. ${T("That's why I think so.")}`,
        AL: `${cap(q.a)}.${two} ${T('First,')} ${q.r1}. ${T('For example,')} ${dot(q.ex)} ${T('Second,')} ${q.r2}. ${T("That's why I think so.")}`
      };
    }
    if (it.part === 4 && it.questions[sub] && it.questions[sub].a) {
      const q = it.questions[sub], a = dot(q.a), plus = q.plus ? ' ' + dot(q.plus) : '';
      if (sub === 0) return { IM: a, IH: a + plus, AL: `${T('Sure.')} ${a}${plus}` };
      if (sub === 1) {
        const fix = /(right|correct)\?$/.test(q.q.trim()) && !/^\{\{(Yes|You don't|I'm afraid|You are not)/.test(q.a);
        return fix
          ? { IM: `${T("That's not correct.")} ${a}`, IH: `${T("I'm sorry, but that's not correct.")} ${a}${plus}`, AL: `${T("I'm afraid you have the wrong information.")} ${a}${plus}` }
          : { IM: a, IH: a + plus, AL: a + plus };
      }
      return { IM: a, IH: `${T('Sure.')} ${a}`, AL: `${T('Sure, let me tell you the details.')} ${a} ${T('I hope this helps.')}` };
    }
    if (it.part === 5 && it.stance) {
      const two = /\btwo\b/.test(it.stance);
      return {
        IM: `${cap(it.stance)}.${two ? '' : ` ${T('I have two reasons.')}`} ${T('First,')} ${it.r1}. ${T('Second,')} ${it.r2}. ${T('So, I think')} ${it.claim}.`,
        IH: `${cap(it.stance)}.${two ? '' : ` ${T('I have two reasons.')}`} ${T('First,')} ${it.r1}. ${T('For example,')} ${dot(it.ex)} ${T('Second,')} ${it.r2}. ${T('For these reasons, I think')} ${it.claim}.`,
        AL: `${cap(it.stance)}.${two ? '' : ` ${T('There are two main reasons.')}`} ${T('First of all,')} ${it.r1}. ${dot(cap(it.r1b))} ${T('For example,')} ${dot(it.ex)} ${T('Second,')} ${it.r2}. ${dot(cap(it.r2b))} ${T('For these reasons, I strongly believe')} ${it.claim}.`
      };
    }
    return ((it.part === 3 || it.part === 4) ? (it.questions[sub] || {}).answers : it.answers) || {};
  }
  const modelRaw = (it, sub) => buildModel(it, sub || 0);
  const modelOf = (it, sub) => { const m = modelRaw(it, sub); const o = {}; for (const k in m) o[k] = stripT(m[k]); return o; };
  // 답변 뼈대 (외우기용 구조표)
  function skeleton(it, sub) {
    let rows = [];
    if (it.part === 5 && it.stance) rows = [['입장', it.stance], ['이유 ①', it.r1], ['덧붙이기', it.r1b], ['예시', it.ex], ['이유 ②', it.r2], ['덧붙이기', it.r2b], ['결론', 'I think ' + it.claim]];
    else if (it.part === 3 && it.questions[sub] && it.questions[sub].a) {
      const q = it.questions[sub];
      rows = sub < 2 ? [['답', q.a], ['이유', q.why], ['예시·추가', q.ex]] : [['의견', q.a], ['이유 ①', q.r1], ['예시', q.ex], ['이유 ②', q.r2]];
    } else if (it.part === 2 && it.place) rows = [['장소', it.place], ['첫인상', it.see], [it.a[0].replace(',', ''), it.a[1]], [it.b[0].replace(',', ''), it.b[1]], ['추가', it.c], ['배경', it.bg], ['느낌', it.feel + ' / ' + it.mood]];
    if (!rows.length) return '';
    const uni = it.part === 5 && it.uni ? `<div class="row" style="margin-top:6px">${it.uni.map(k => UNIVERSAL.find(u => u.id === k)).filter(Boolean).map(u => `<span class="chip chip-mint">만능 이유 ${u.emoji} ${esc(u.ko)}</span>`).join('')}</div>` : '';
    return `<div class="skel"><div class="skel-title">🧩 답변 뼈대 — 이 조각만 외우면 템플릿에 끼워 말할 수 있어요</div>${rows.map(([k, v]) => `<div class="skel-row"><span>${esc(k)}</span><div>${esc(v)}</div></div>`).join('')}${uni}</div>`;
  }
  // Part 1: 가이드 문자열에서 실제 지문 만들기
  BANK.part1.forEach(it => {
    if (it.g && !it.text) {
      it.guide = it.g;
      it.text = it.g.replace(/\*\*/g, '').replace(/[↗↘]/g, '').replace(/\s*\/\/?\s*/g, ' ').replace(/\s+([.,!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
    }
  });
  const partChip = p => `<span class="chip chip-primary">${PART_INFO[p].name} · ${PART_INFO[p].title}</span>`;

  /* =========================================================
     4. 북마크
     ========================================================= */
  const BM_TYPES = { model: '모범답안', my: '내 답안', feedback: 'AI 피드백', ai: 'AI 개선답안', topic: '주제별 공략' };
  const BMREG = {};
  const isBm = key => S.bookmarks.some(b => b.key === key);
  function bmBtn(key, payload, extra = '') {
    BMREG[key] = payload;
    const on = isBm(key);
    return `<button class="bm ${extra} ${on ? 'on' : ''}" data-bm="${esc(key)}" title="${on ? '북마크 해제' : '북마크에 저장'}">${on ? '★' : '☆'}</button>`;
  }
  function toggleBm(key) {
    const i = S.bookmarks.findIndex(b => b.key === key);
    if (i >= 0) { S.bookmarks.splice(i, 1); toast('북마크를 해제했어요'); }
    else {
      let p = BMREG[key];
      if (typeof p === 'function') p = p();
      if (!p || !String(p.content || '').trim()) { toast('저장할 내용이 없어요'); return; }
      S.bookmarks.unshift({ key, ...p, ts: Date.now() });
      markDay();
      track('bookmark_add', { bookmark_type: p.type });
      toast('⭐ 북마크에 저장했어요!');
    }
    save();
    const on = isBm(key);
    $$('[data-bm]').filter(b => b.dataset.bm === key).forEach(b => { b.classList.toggle('on', on); b.textContent = on ? '★' : '☆'; });
    updateBmCount();
    if (route === 'bookmarks') render(true);
  }
  function updateBmCount() { $('#bmCount').textContent = S.bookmarks.length || ''; }

  /* =========================================================
     5. 라우터
     ========================================================= */
  let route = 'home', routeArg = '', opinionFrom = '';
  const VIEWS = {};
  function render(keepScroll) {
    const h = decodeURIComponent(location.hash.slice(1)) || 'home';
    const [r, ...rest] = h.split('/');
    const prev = route + (routeArg ? '/' + routeArg : '');
    route = VIEWS[r] ? r : 'home';
    if (route === 'opinion' && !prev.startsWith('opinion')) opinionFrom = prev; // 의견 보내기 직전 화면 자동 기록
    routeArg = rest.join('/');
    $$('.nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === route));
    const y = window.scrollY;
    $('#view').innerHTML = VIEWS[route](routeArg);
    if (!keepScroll) track('page_view', { page_title: PAGE_NAMES[route] || route, page_location: location.origin + location.pathname + route + (routeArg && !/^t-/.test(routeArg) ? '/' + routeArg : '') });
    window.scrollTo(0, keepScroll ? y : 0);
    updateBmCount();
  }
  window.addEventListener('hashchange', () => render(false));

  /* =========================================================
     6. 문제 · 답안 렌더링 (여러 화면에서 공통 사용)
     ========================================================= */
  function infoTable(it) {
    const t = it.table || { head: [], rows: [] };
    return `<div class="info-title">${esc(it.title)}</div>
      <div class="info-sub">${esc(it.subtitle || '')}</div>
      <table class="info-table">
        ${t.head && t.head.length ? `<thead><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>` : ''}
        <tbody>${(t.rows || []).map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`;
  }
  function infoText(it) {
    const t = it.table || { head: [], rows: [] };
    return [it.title, it.subtitle, (t.head || []).join(' | '), ...(t.rows || []).map(r => r.join(' | '))].filter(Boolean).join('\n');
  }
  function imgTag(it, cls = 'qimg') {
    return `<img class="${cls}" src="${esc(it.img)}" alt="${esc(it.alt || '')}" data-alt="${esc(it.alt || '')}" loading="lazy">`;
  }
  // 사진을 못 불러오면 설명 텍스트로 대체
  document.addEventListener('error', e => {
    const el = e.target;
    if (el.tagName === 'IMG' && (el.classList.contains('qimg') || el.classList.contains('cbt-img'))) {
      const d = document.createElement('div');
      d.className = 'qimg-fallback';
      d.innerHTML = `🖼️ 사진을 불러오지 못했어요 (인터넷 연결을 확인해 주세요).<br><b>사진 설명:</b> ${esc(el.dataset.alt || '설명 없음')}`;
      el.replaceWith(d);
    }
  }, true);

  function questionBody(it) {
    switch (it.part) {
      case 1: return `<div class="readtext">${esc(it.text)}</div>`;
      case 2: { const kw = it.kw || it.keywords || []; return `${imgTag(it)}${kw.length ? `<div class="kw">${kw.map(k => `<span class="chip">${esc(k)}</span>`).join('')}</div>` : ''}`; }
      case 3: return `<div class="intro">${esc(it.intro)}</div>${it.questions.map((q, i) => `<div class="sq"><span class="sq-num">Q${5 + i}</span><div>${esc(q.q)} <span class="muted small">(${respSecs(3, i)}초)</span></div></div>`).join('')}`;
      case 4: return `${infoTable(it)}<div class="intro" style="margin-top:12px">🔊 ${esc(it.narrator || '')}</div>${it.questions.map((q, i) => `<div class="sq"><span class="sq-num">Q${8 + i}</span><div>${esc(q.q)} <span class="muted small">(${respSecs(4, i)}초${i === 2 ? ' · 두 번 들려줌' : ''})</span></div></div>`).join('')}`;
      case 5: return `<div class="q5">${esc(it.question)}</div>`;
    }
    return '';
  }

  function levelBlock(ans, keyBase, meta) {
    const lv = ['IM', 'IH', 'AL'].filter(l => ans && ans[l] && String(ans[l]).trim());
    if (!lv.length) return `<p class="muted small">등록된 모범답안이 없어요.</p>`;
    const def = lv.includes('IH') ? 'IH' : lv[0];
    return `<div class="lvl-wrap">
      <div class="lvl-tabs">${lv.map(l => `<button class="lvl-btn ${l === def ? 'active' : ''}" data-lvl="${l}">${l}</button>`).join('')}</div>
      <span class="muted small" style="margin-left:6px"><span class="tpl">색칠된 부분</span> = 어떤 문제에도 쓰는 템플릿 · ${lv.map(l => `${l} ${wordCount(stripT(ans[l]))}단어`).join(' / ')}</span>
      ${lv.map(l => `<div class="ans lv-${l} ${l === def ? '' : 'hidden'}" data-lvl-panel="${l}">${tplHtml(ans[l])}${bmBtn(`${keyBase}:${l}`, { type: 'model', title: `${meta.title} · ${l}`, sub: meta.sub, content: stripT(ans[l]), part: meta.part })}</div>`).join('')}
    </div>`;
  }

  function answersBody(it, onlySub) {
    const title = `${PART_INFO[it.part].name} · ${it.topic || ''}`;
    if (it.part === 1) {
      return `<h4>🗣️ 끊어 읽기 · 강세 가이드 <span class="muted small">( / 짧게 쉬기, // 길게 쉬기, 굵은 글씨 = 강세, ↗↘ 억양)</span></h4>
        <div class="ans guide">${it.guide ? boldMarks(it.guide) : esc(it.text)}${bmBtn(`model:${it.id}:guide`, { type: 'model', title: `${title} · 읽기 가이드`, sub: '', content: (it.guide || it.text).replace(/\*\*/g, ''), part: 1 })}</div>
        ${it.tips && it.tips.length ? `<h4>💡 발음 포인트</h4><ul class="tip-list">${it.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}`;
    }
    if (it.part === 2 || it.part === 5) {
      return `${skeleton(it, 0)}<h4>📖 레벨별 모범답안</h4>${levelBlock(modelRaw(it, 0), `model:${it.id}:0`, { title, sub: it.part === 5 ? it.question : '사진 묘사', part: it.part })}`;
    }
    const base = PART_START[it.part];
    return it.questions.map((q, i) => (onlySub === undefined || onlySub === i) ? `<h4>Q${base + i}. ${esc(q.q)}</h4>${skeleton(it, i)}${levelBlock(modelRaw(it, i), `model:${it.id}:${i}`, { title: `${title} · Q${base + i}`, sub: q.q, part: it.part })}` : '').join('');
  }

  /* =========================================================
     7. 홈
     ========================================================= */
  VIEWS.home = () => {
    const done = S.tests.filter(t => t.done && t.mode === 'full').length;
    const fbCount = S.tests.reduce((n, t) => n + t.qs.filter(q => q.fb).length, 0);
    const dayIdx = Math.floor(Date.now() / 86400000);
    const u = UNIVERSAL[dayIdx % UNIVERSAL.length];
    const recent = S.tests.slice(0, 4);
    const cheer = pick(['오늘도 한 문제씩, 차근차근! 🎯', '말하는 만큼 늡니다. 오늘도 입 풀고 가볼까요? 🔥', '어제의 나보다 한 문장 더! 💪', '매일 10분이면 충분해요 ☕']);
    return `
      <section class="hero">
        <div class="hero-emoji">🎙️</div>
        <h1>${cheer}</h1>
        <p>실전처럼 풀고, 모범답안과 AI 피드백으로 다듬고, 만능 문장으로 외우기까지.</p>
        <div class="row">
          <a class="btn btn-lg btn-white" href="#mock">⏱️ 실전 모의고사 시작</a>
          <a class="btn btn-lg btn-glass" href="#bank/1">📚 약한 파트 연습</a>
        </div>
      </section>
      <div class="grid grid-4" style="margin-top:16px">
        <div class="stat"><b>🔥 ${streak()}일</b><span>연속 학습</span></div>
        <div class="stat"><b>${done}세트</b><span>완료한 실전 모의고사</span></div>
        <div class="stat"><b>${fbCount}개</b><span>받은 AI 피드백</span></div>
        <div class="stat"><b>${S.bookmarks.length}개</b><span>북마크한 답변</span></div>
      </div>
      <h2 style="margin-top:26px">어디부터 해볼까요?</h2>
      <div class="grid grid-3">
        <a class="go-card" href="#bank/1"><div class="ico" style="background:var(--primary-soft)">📚</div><b>파트별 문제은행</b><span>${[1, 2, 3, 4, 5].reduce((n, p) => n + partItems(p).reduce((m, it) => m + subCount(it), 0), 0)}문항 · 템플릿으로 외우는 IM·IH·AL 답안 · 외운 문제 ${Object.values(S.marks).filter(v => v === 'done').length}개</span></a>
        <a class="go-card" href="#mock"><div class="ico" style="background:var(--coral-soft)">⏱️</div><b>실전 모드</b><span>실제 시험처럼 11문항 · 음성 · 타이머 · 녹음</span></a>
        <a class="go-card" href="#feedback"><div class="ico" style="background:var(--amber-soft)">🤖</div><b>AI 피드백</b><span>내 답변의 레벨 예측 · 교정 · 개선 답안</span></a>
        <a class="go-card" href="#topics"><div class="ico" style="background:var(--mint-soft)">🧠</div><b>주제별 공략</b><span>만능 이유 · 문장 구조 · 주제별 형용사/이유 키워드</span></a>
        <a class="go-card" href="#bookmarks"><div class="ico" style="background:var(--sky-soft)">⭐</div><b>북마크</b><span>모아둔 답변을 카드로 넘기며 외우기</span></a>
        <a class="go-card" href="#bank/5"><div class="ico" style="background:#f3f0ff">💬</div><b>Part 5 집중</b><span>가장 배점 높은 의견 제시 연습</span></a>
      </div>
      <div class="grid grid-2" style="margin-top:18px">
        <div class="daily" style="position:relative">
          <span class="chip chip-mint">오늘의 만능 문장 ${u.emoji} ${esc(u.ko)}</span>
          <div class="en">${esc(u.en)}</div>
          <div class="muted small">+ ${esc(u.plus)}</div>
          ${bmBtn('topic:' + u.id, { type: 'topic', title: `만능 이유 · ${u.ko}`, sub: '', content: `${u.en}\n${u.plus}`, part: 0 })}
        </div>
        <div class="card">
          <h3>최근 기록</h3>
          ${recent.length ? recent.map(t => `<div class="row" style="padding:6px 0;border-bottom:1px dashed var(--line)"><span>${esc(t.title)}</span><span class="muted small">${fmtDate(t.date)}</span><span class="spacer"></span><a class="btn btn-sm btn-soft" href="#feedback/${t.id}">보기</a></div>`).join('') : '<p class="muted small">아직 기록이 없어요. 실전 모드로 첫 세트를 풀어 보세요!</p>'}
        </div>
      </div>`;
  };

  /* =========================================================
     8. 파트별 문제은행
     ========================================================= */
  // 문제은행 카테고리 (Part 3은 묶지 않음). Part 1은 어조 기준 → [id, 이름, 어조]
  const CATS = {
    1: [['notice', '📢 공지·안내 방송', '차분하고 명확하게'], ['ad', '📣 광고', '밝고 활기차게'], ['news', '📰 뉴스·보도', '또박또박 객관적으로'], ['intro', '🎤 인물 소개', '정중하고 환영하는 느낌으로'], ['tour', '🧭 투어·가이드', '친절하게 설명하듯'], ['voice', '☎️ 음성 메시지', '친근한 대화체로']],
    2: [['office', '사무실·회의'], ['food', '식당·카페·주방'], ['shop', '상점·시장'], ['outdoor', '공원·야외'], ['street', '거리·교통·현장'], ['school', '학교·도서관']],
    4: [['event', '행사·프로그램 일정'], ['class', '강의·교육 시간표'], ['interview', '면접 일정'], ['personal', '개인·출장 일정'], ['resume', '이력서'], ['launch', '출시 일정'], ['etc', '여행·기타']],
    5: [['edu', '교육'], ['work', '직장'], ['tech', '기술'], ['life', '생활·여가'], ['society', '사회·환경·건강']]
  };
  const catLabel = c => c[2] ? `${c[1]} (${c[2]})` : c[1];
  // Part 5 주제의 '교육 · ' 같은 앞머리는 카테고리 제목과 겹쳐서 목록에선 뺌
  const shortTopic = it => it.part === 5 ? String(it.topic || '').replace(/^(교육|직장|기술|생활|여가|쇼핑|사회|환경|건강) · /, '') : (it.topic || '');

  VIEWS.bank = arg => {
    const p = [1, 2, 3, 4, 5].includes(+arg) ? +arg : 1;
    const info = PART_INFO[p];
    const items = partItems(p);
    const doneN = items.filter(it => S.marks[it.id] === 'done').length, hardN = items.filter(it => S.marks[it.id] === 'hard').length;
    const timeTxt = p === 4 ? `읽기 ${info.read}초 · 준비 ${info.prep}초 · 답변 ${info.resp.join('/')}초` : `준비 ${info.prep}초 · 답변 ${info.resp.join('/')}초`;
    return `
      <div class="page-head"><h1>📚 파트별 문제은행</h1><p>약한 파트만 골라서 집중 공략! 문제를 보고 먼저 말해 본 뒤 모범답안을 확인하세요.</p></div>
      <div class="tabs">${[1, 2, 3, 4, 5].map(n => `<a class="tab ${n === p ? 'active' : ''}" href="#bank/${n}" style="text-decoration:none">${PART_INFO[n].name} · ${PART_INFO[n].title}<small>${partItems(n).length}</small></a>`).join('')}</div>
      <div class="card part-info">
        <div class="row"><h2 style="margin:0">${info.name} ${info.title} <span class="muted small">${info.en}</span></h2><span class="spacer"></span><button class="btn btn-primary" data-act="add-q" data-part="${p}">＋ 문제 추가</button></div>
        <div class="meta"><span class="chip chip-primary">${info.qnums}</span><span class="chip chip-coral">${timeTxt}</span>${info.criteria.map(c => `<span class="chip">${c}</span>`).join('')}</div>
        <div class="grid ${info.template.length ? 'grid-2' : ''}">
          <div><h3>공략 포인트</h3><ul class="tip-list">${info.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
          ${info.template.length ? `<div><h3>답변 템플릿</h3><div class="template">${info.template.map(t => `<div>${esc(t)}</div>`).join('')}</div></div>` : ''}
        </div>
      </div>
      <div class="card bank-bar">
        <div class="row">
          <input class="input" id="bankSearch" placeholder="🔍 주제·문장으로 찾기 (예: 쇼핑, schedule, 환경)" style="flex:1;min-width:200px">
          <div class="seg" id="bankStatus">
            <button class="active" data-st="all">전체</button><button data-st="new">안 본 것</button><button data-st="hard">😵 어려움</button><button data-st="done">✅ 외움</button>
          </div>
          <button class="btn" data-act="bank-random">🎲 랜덤 한 문제</button>
          <button class="btn btn-ghost" data-act="bank-expand">모두 펼치기</button>
        </div>
        <div class="row small" style="margin-top:10px">
          <span class="muted">외운 문제</span><b>${doneN}/${items.length}</b>
          <div class="meter" style="flex:1;margin:0"><i style="width:${items.length ? Math.round(doneN / items.length * 100) : 0}%"></i></div>
          <span class="muted">어려움 ${hardN}</span>
        </div>
      </div>
      <div style="margin-top:14px" id="bankList">
        ${bankGroups(p, items).map(([cat, list]) => {
          const inner = list.map((it, n) => qcardHtml(it, n, cat)).join('');
          if (!cat) return inner; // Part 3: 묶지 않고 그대로
          const doneC = list.filter(it => S.marks[it.id] === 'done').length;
          return `<details class="cat-group" data-cat="${esc(cat[0])}">
            <summary><span class="cat-name">${esc(catLabel(cat))}</span><span class="spacer"></span><span class="cat-count">${list.length}문제 · 외움 ${doneC}</span></summary>
            <div class="cat-body">${inner}</div></details>`;
        }).join('') || '<div class="empty"><div class="e">📭</div>아직 문제가 없어요.</div>'}
        <div class="empty hidden" id="bankEmpty"><div class="e">🔍</div>조건에 맞는 문제가 없어요.</div>
      </div>`;
  };
  // 카테고리 순서대로 묶기. 카테고리가 없는 문제(내가 추가한 문제 등)는 맨 끝 묶음으로
  function bankGroups(p, items) {
    if (!CATS[p]) return [[null, items]];
    const groups = CATS[p].map(c => [c, items.filter(it => it.cat === c[0])]);
    const rest = items.filter(it => !CATS[p].some(c => c[0] === it.cat));
    if (rest.length) groups.push([['mine', '내가 추가한 문제'], rest]);
    return groups.filter(g => g[1].length);
  }
  function qcardHtml(it, n, cat) {
          const st = S.marks[it.id] || 'new';
          const preview = it.part === 1 ? it.text : it.part === 2 ? (it.alt || '') : it.part === 3 ? it.questions.map(q => q.q).join(' / ') : it.part === 4 ? it.title + ' — ' + it.questions.map(q => q.q).join(' / ') : it.question.replace(/^Do you agree or disagree with the following statement\?\s*/, '').replace(/\n/g, ' ');
          return `
          <div class="qcard collapsed" id="q-${esc(it.id)}" data-st="${st}" data-s="${esc(((cat ? cat[1] + ' ' : '') + it.topic + ' ' + preview).toLowerCase())}">
            <div class="qcard-head" data-act="qcard-toggle">
              <span class="qnum">${n + 1}</span>
              ${it.custom ? '<span class="chip chip-amber">내 문제</span>' : ''}
              <b>${esc(shortTopic(it))}</b>
              <span class="qprev">${esc(preview.slice(0, 90))}</span>
              <span class="spacer"></span>
              <span class="st-btns">
                <button class="st-btn ${st === 'hard' ? 'on hard' : ''}" data-act="mark" data-id="${esc(it.id)}" data-v="hard" title="어려워요">😵</button>
                <button class="st-btn ${st === 'done' ? 'on done' : ''}" data-act="mark" data-id="${esc(it.id)}" data-v="done" title="외웠어요">✅</button>
              </span>
              <span class="caret">▾</span>
            </div>
            <div class="qcard-body">
              ${questionBody(it)}
              <div class="qcard-actions">
                <button class="btn btn-soft" data-act="toggle-ans">📖 모범답안 보기</button>
                <button class="btn" data-act="practice" data-id="${esc(it.id)}">⏱️ 실전처럼 풀기</button>
                ${it.part !== 1 ? `<button class="btn" data-act="write" data-id="${esc(it.id)}">✍️ 답변 쓰고 AI 피드백</button>` : ''}
                ${it.custom ? `<span class="spacer"></span><button class="btn btn-ghost btn-danger" data-act="del-custom" data-id="${esc(it.id)}">🗑 삭제</button>` : ''}
              </div>
              <div class="answers hidden"></div>
            </div>
          </div>`;
  }
  function filterBank() {
    const q = ($('#bankSearch') || {}).value ? $('#bankSearch').value.trim().toLowerCase() : '';
    const st = ($('#bankStatus .active') || {}).dataset ? $('#bankStatus .active').dataset.st : 'all';
    let shown = 0;
    $$('#bankList .qcard').forEach(c => {
      const ok = (!q || c.dataset.s.includes(q)) && (st === 'all' || c.dataset.st === st);
      c.classList.toggle('hidden', !ok); if (ok) shown++;
    });
    // 맞는 문제가 없는 카테고리는 숨기고, 검색·필터 중이면 결과가 있는 카테고리를 펼쳐 보여줌
    const filtering = !!q || st !== 'all';
    $$('#bankList .cat-group').forEach(g => {
      const n = $$('.qcard:not(.hidden)', g).length;
      g.classList.toggle('hidden', n === 0);
      if (filtering && n) g.open = true;
    });
    const e = $('#bankEmpty'); if (e) e.classList.toggle('hidden', shown > 0);
  }
  function openQcard(card) {
    const g = card.closest('.cat-group'); if (g) g.open = true;
    card.classList.remove('collapsed');
    const box = $('.answers', card);
    if (box && !box.dataset.ready) {
      const it = findItem(card.id.slice(2));
      box.innerHTML = answersBody(it); box.dataset.ready = '1';
      track('question_view', { question_id: card.id.slice(2), part: it && it.part }); // 문제·모범답안 열람
    }
  }

  /* ---- 문제 추가 ---- */
  function addQuestionModal(part) {
    part = +part || 1;
    const ansFields = (prefix = 'a') => `
      <label class="field"><span>모범답안 IM (선택)</span><textarea class="textarea" name="${prefix}IM" rows="3"></textarea></label>
      <label class="field"><span>모범답안 IH (선택)</span><textarea class="textarea" name="${prefix}IH" rows="3"></textarea></label>
      <label class="field"><span>모범답안 AL (선택)</span><textarea class="textarea" name="${prefix}AL" rows="3"></textarea></label>`;
    const fields = {
      1: `<label class="field"><span>읽을 지문 *</span><textarea class="textarea" name="text" rows="5" required></textarea></label>`,
      2: `<label class="field"><span>사진 주소(URL)</span><input class="input" name="img" placeholder="https://..."></label>
          <label class="field"><span>또는 내 컴퓨터에서 사진 올리기</span><input type="file" name="file" accept="image/*"></label>
          <label class="field"><span>사진 설명 (사진이 안 보일 때 · AI 피드백 참고용)</span><textarea class="textarea" name="alt" rows="2"></textarea></label>${ansFields()}`,
      3: `<label class="field"><span>상황 설명 *</span><textarea class="textarea" name="intro" rows="2" placeholder="Imagine that a ... is doing research in your area. You have agreed to participate in a telephone interview about ..."></textarea></label>
          ${[5, 6, 7].map(n => `<label class="field"><span>Q${n} 질문 *</span><input class="input" name="q${n}"></label><label class="field"><span>Q${n} 모범답안 (선택)</span><textarea class="textarea" name="ans${n}" rows="2"></textarea></label>`).join('')}`,
      4: `<label class="field"><span>표 제목 *</span><input class="input" name="title"></label>
          <label class="field"><span>부제 (날짜·장소 등)</span><input class="input" name="subtitle"></label>
          <label class="field"><span>표 내용 * <small class="muted">— 한 줄에 한 행, 칸은 | 로 구분. 첫 줄은 머리글</small></span><textarea class="textarea" name="table" rows="6" placeholder="Time | Session | Speaker&#10;9:00 A.M. | Opening | Kim"></textarea></label>
          <label class="field"><span>전화한 사람의 첫 멘트</span><input class="input" name="narrator" placeholder="Hi, I'm ... Can you answer a few questions?"></label>
          ${[8, 9, 10].map(n => `<label class="field"><span>Q${n} 질문 *</span><input class="input" name="q${n}"></label><label class="field"><span>Q${n} 모범답안 (선택)</span><textarea class="textarea" name="ans${n}" rows="2"></textarea></label>`).join('')}`,
      5: `<label class="field"><span>질문 *</span><textarea class="textarea" name="question" rows="4"></textarea></label>${ansFields()}`
    };
    openModal(`
      <h2>＋ 내 문제 추가 <span class="spacer"></span><button class="btn btn-ghost" data-act="close-modal">✕</button></h2>
      <form id="addForm">
        <label class="field"><span>파트</span>
          <select class="select" name="part" id="addPart">${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${n === part ? 'selected' : ''}>${PART_INFO[n].name} · ${PART_INFO[n].title}</option>`).join('')}</select></label>
        <label class="field"><span>주제 (예: 쇼핑, 여행)</span><input class="input" name="topic"></label>
        ${fields[part]}
        <div class="row"><span class="spacer"></span><button type="button" class="btn" data-act="close-modal">취소</button><button class="btn btn-primary">저장하기</button></div>
      </form>`);
    $('#addPart').onchange = e => addQuestionModal(e.target.value);
    $('#addForm').onsubmit = async e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const g = k => String(f.get(k) || '').trim();
      const it = { id: 'c-' + uid(), part, set: 'my', custom: true, topic: g('topic') || '내 문제' };
      if (part === 1) { if (!g('text')) return toast('지문을 입력해 주세요'); it.text = g('text'); }
      if (part === 2) {
        const file = f.get('file');
        if (file && file.size) it.img = await compressImage(file);
        else it.img = g('img');
        if (!it.img) return toast('사진 주소를 넣거나 사진을 올려 주세요');
        it.alt = g('alt'); it.keywords = [];
        it.answers = { IM: g('aIM'), IH: g('aIH'), AL: g('aAL') };
      }
      if (part === 3 || part === 4) {
        const nums = part === 3 ? [5, 6, 7] : [8, 9, 10];
        it.questions = nums.map(n => ({ q: g('q' + n), answers: { IH: g('ans' + n) } }));
        if (it.questions.some(q => !q.q)) return toast('질문 3개를 모두 입력해 주세요');
        if (part === 3) { it.intro = g('intro'); if (!it.intro) return toast('상황 설명을 입력해 주세요'); }
        else {
          it.title = g('title'); it.subtitle = g('subtitle'); it.narrator = g('narrator') || 'Hi, I have a few questions. Can you help me?';
          const lines = g('table').split('\n').map(l => l.trim()).filter(Boolean).map(l => l.split('|').map(c => c.trim()));
          if (!it.title || !lines.length) return toast('표 제목과 내용을 입력해 주세요');
          it.table = { head: lines[0], rows: lines.slice(1) };
        }
      }
      if (part === 5) { if (!g('question')) return toast('질문을 입력해 주세요'); it.question = g('question'); it.answers = { IM: g('aIM'), IH: g('aIH'), AL: g('aAL') }; }
      S.custom.push(it); save(); closeModal();
      toast('✅ 문제를 추가했어요');
      location.hash = '#bank/' + part; render();
    };
  }
  function compressImage(file, max = 1024) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const s = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          res(c.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = rej; img.src = r.result;
      };
      r.onerror = rej; r.readAsDataURL(file);
    });
  }

  /* =========================================================
     9. 실전 모드 (준비 화면)
     ========================================================= */
  VIEWS.mock = () => {
    const tests = S.tests.filter(t => t.mode === 'full').slice(0, 5);
    return `
      <div class="page-head"><h1>⏱️ 실전 모드</h1><p>문제은행에서 무작위로 11문항 1세트를 구성해 실제 시험과 같은 순서·시간으로 진행해요.</p></div>
      <div class="mock-hero">
        <div class="card">
          <h2>시험 진행 순서</h2>
          <div class="flow">
            ${[1, 2, 3, 4, 5].map(p => { const i = PART_INFO[p]; return `<div class="step"><b>${i.name} ${i.title}</b>${i.qnums}<br>${p === 4 ? `읽기 ${i.read}초 · ` : ''}준비 ${i.prep}초<br>답변 ${i.resp.join('/')}초</div>`; }).join('')}
          </div>
          <ul class="tip-list" style="margin-top:14px">
            <li>각 파트 시작 전 <b>Directions(안내)</b>가 음성으로 나와요. 연습 중엔 [다음 ▶]으로 건너뛸 수 있어요.</li>
            <li>음성이 나오는 동안 <b>🔊 재생 시간</b>, 이후 <b>PREPARATION TIME → 삐 소리 → RESPONSE TIME → 삐 + Stop Talking</b> 순서로 진행돼요.</li>
            <li>실제 시험처럼 맨 처음 <b>전체 안내</b>, 맨 끝에 <b>Que. 1~11 확인 화면</b>이 나와요. 녹음했다면 여기서 바로 다시 들을 수 있어요.</li>
            <li>Part 4 질문은 실제 시험처럼 화면에 안 보여요. 음성이 안 들리면 <b>[📄 텍스트로 보기]</b>를 누르세요.</li>
            <li>끝나면 <b>AI 피드백 화면</b>에서 모범답안 확인 · 피드백을 받을 수 있어요.</li>
          </ul>
        </div>
        <div class="card">
          <h2>시작 전 설정</h2>
          ${ONLINE ? '<div class="notice info" style="margin-bottom:10px">🌐 온라인 공유 버전에서는 브라우저 보안 때문에 <b>마이크 녹음이 지원되지 않아요</b>. 타이머로 연습하고, 끝난 뒤 답변을 적어 피드백을 받으세요.</div>' : `<label class="opt"><input type="radio" name="recMode" value="rec" checked><div><b>🎤 녹음하며 풀기</b><span>마이크로 답변을 녹음하고 끝난 뒤 다시 들어요.</span></div></label>`}
          <label class="opt"><input type="radio" name="recMode" value="norec" ${ONLINE ? 'checked' : ''}><div><b>⏱️ 녹음 없이 풀기</b><span>문제 + 타이머만 진행. 끝난 뒤 내 답변을 직접 적어서 AI 피드백을 받아요.</span></div></label>
          <label class="row small ${ONLINE ? 'hidden' : ''}" style="margin:4px 2px 12px"><input type="checkbox" id="optStt" ${SR && !ONLINE ? 'checked' : 'disabled'}> 녹음할 때 자동 받아쓰기 ${SR ? '<span class="muted">(Chrome·Edge 음성인식, 음성이 구글/MS 서버로 전송돼요)</span>' : '<span class="muted">— 이 브라우저는 지원하지 않아요 (Chrome·Edge 권장)</span>'}</label>
          <label class="row small" style="margin:0 2px 14px"><input type="checkbox" id="optFull" checked> 전체 화면으로 진행</label>
          <div class="row">
            <button class="btn" data-act="voice-test">🔊 음성 테스트</button>
            <span class="spacer"></span>
            <button class="btn btn-primary btn-lg" data-act="start-mock">시험 시작 ▶</button>
          </div>
          ${'speechSynthesis' in window ? '' : '<div class="notice" style="margin-top:12px">이 브라우저는 음성(TTS)을 지원하지 않아요. 질문은 텍스트로 표시돼요.</div>'}
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <h3>최근 실전 기록</h3>
        ${tests.length ? tests.map(t => `<div class="row" style="padding:6px 0;border-bottom:1px dashed var(--line)"><span>${esc(t.title)}</span>${t.done ? '<span class="chip chip-mint">완료</span>' : '<span class="chip chip-amber">중단</span>'}<span class="muted small">${fmtDate(t.date)}</span><span class="spacer"></span><a class="btn btn-sm btn-soft" href="#feedback/${t.id}">결과 · 피드백</a></div>`).join('') : '<p class="muted small">아직 기록이 없어요.</p>'}
      </div>`;
  };

  function makeTest(units, mode, title) {
    const qs = [];
    let n = mode === 'full' ? 1 : PART_START[units[0].part];
    units.forEach(u => { for (let s = 0; s < subCount(u); s++) qs.push({ qid: u.id, part: u.part, sub: s, num: n++, my: '', fb: null }); });
    return { id: 't-' + uid(), date: Date.now(), mode, title, recording: false, qs, done: false };
  }
  function buildFullTest() {
    const units = [...shuffle(partItems(1)).slice(0, 2), ...shuffle(partItems(2)).slice(0, 2), pick(partItems(3)), pick(partItems(4)), pick(partItems(5))];
    if (units.some(u => !u)) return null;
    const cnt = S.tests.filter(t => t.mode === 'full').length + 1;
    return { units, test: makeTest(units, 'full', `실전 모의고사 #${cnt}`) };
  }

  /* =========================================================
     10. 음성(TTS) · 효과음
     ========================================================= */
  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    const vs = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
    if (!vs.length) return null;
    const us = vs.filter(v => /en[-_]US/i.test(v.lang));
    const natural = us.filter(v => /Natural/i.test(v.name));
    return vs.find(v => v.name === S.settings.voice)
      // 엣지의 Natural 음성이 가장 사람 같아서 1순위 (여성 안내 음성 → 그 외 Natural 순)
      || ['Aria', 'Jenny', 'Ava', 'Emma', 'Michelle'].map(n => natural.find(v => v.name.includes(n))).find(Boolean)
      || natural[0]
      || us.find(v => /(Online|Google US)/i.test(v.name))
      || us[0] || vs[0];
  }
  // 예전 버전에서 저장된 기계 음성·0.95배속을 한 번만 초기화 → Natural 음성 1.0배속이 기본값이 됨
  if (!S.settings.voiceV2) { S.settings.voice = ''; S.settings.rate = 1; S.settings.voiceV2 = true; save(); }
  const vol = () => Math.min(1, Math.max(0, S.settings.volume == null ? 1 : +S.settings.volume));
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { };
  function speakSimple(text) {
    if (!('speechSynthesis' in window)) return toast('이 브라우저는 음성을 지원하지 않아요');
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(); if (v) u.voice = v;
    u.lang = 'en-US'; u.rate = +S.settings.rate || 1; u.volume = vol();
    speechSynthesis.speak(u);
  }
  let actx;
  function beep() {
    if (!vol()) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = 1000;
      g.gain.setValueAtTime(0.0001, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25 * vol(), actx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.45);
      o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.5);
    } catch (e) { }
  }

  /* =========================================================
     11. CBT 실행기 (실제 시험 화면)
     ========================================================= */
  const DIRECTIONS = {
    1: { t: 'Questions 1–2: Read a Text Aloud', d: 'In this part of the test, you will read aloud the text on the screen. You will have 45 seconds to prepare. Then you will have 45 seconds to read the text aloud.' },
    2: { t: 'Questions 3–4: Describe a Picture', d: 'In this part of the test, you will describe the picture on your screen in as much detail as you can. You will have 45 seconds to prepare your response. Then you will have 30 seconds to speak about the picture.' },
    3: { t: 'Questions 5–7: Respond to Questions', d: 'In this part of the test, you will answer three questions. You will have three seconds to prepare after you hear each question. You will have 15 seconds to respond to Questions 5 and 6, and 30 seconds to respond to Question 7.' },
    4: { t: 'Questions 8–10: Respond to Questions Using Information Provided', d: 'In this part of the test, you will answer three questions based on the information provided. You will have 45 seconds to read the information before the questions begin. You will have three seconds to prepare and 15 seconds to respond to Questions 8 and 9. You will hear Question 10 two times. You will have three seconds to prepare and 30 seconds to respond to Question 10.' },
    5: { t: 'Question 11: Express an Opinion', d: 'In this part of the test, you will give your opinion about a specific topic. Be sure to say as much as you can in the time allowed. You will have 45 seconds to prepare. Then you will have 60 seconds to speak.' }
  };
  // 시험 시작 전 전체 안내 (실제 시험의 Speaking Test Directions 화면 구성을 따름)
  const INTRO = [
    'This is the TOEIC Speaking test. There are eleven questions in this test, and it takes about twenty minutes. Each type of question has its own directions, which tell you how much time you have to prepare and to speak.',
    'Try to say as much as you can in the time given. Speak clearly, and make sure you answer each question as the directions ask.'
  ];
  const INTRO_TABLE = [
    ['1–2', 'Read a text aloud', 'pronunciation<br>intonation and stress'],
    ['3–4', 'Describe a picture', 'all of the above, plus<br>grammar · vocabulary · cohesion'],
    ['5–7', 'Respond to questions', 'all of the above, plus<br>relevance · completeness of content'],
    ['8–10', 'Respond to questions using information provided', 'all of the above'],
    ['11', 'Express an opinion', 'all of the above']
  ];
  let R = null; // 현재 실행 중인 시험 상태

  async function runCBT(units, test, opts) {
    R = { aborted: false, paused: false, skip: false, caption: '', capOpen: false, test, opts, running: true };
    const Rec = { stream: null, mr: null, chunks: [], sr: null, srOn: false, final: '', interim: '', srBroken: false, srResolve: null };
    const cbt = $('#cbt');
    const full = test.mode === 'full';
    cbt.innerHTML = `
      <div class="cbt-top">
        <div class="cbt-logo">TOEIC<br><b>ETS</b></div>
        <div class="title">TOEIC Speaking</div>
        <div class="rec" id="cRec"><i></i>REC</div>
        <div class="qn" id="cQn"></div>
        <button class="cbt-vol" id="cVol">VOLUME</button>
      </div>
      <div class="cbt-volbox hidden" id="cVolBox">🔈<input type="range" id="cVolRange" min="0" max="1" step="0.1" value="${vol()}">🔊</div>
      <div class="cbt-body"><div class="cbt-panel">
        <div id="cContent"></div>
        <div class="cbt-status">
          <div class="cbt-listen" id="cListen"></div>
          <div id="cTimer"></div>
          <div id="cCaption" class="caption hidden"></div>
        </div>
      </div></div>
      <div class="cbt-guide"><b>🔊 안내 스크립트</b><ol id="cGuide"></ol></div>
      <div class="cbt-bottom">
        <button class="cbt-btn" id="cCapBtn">📄 텍스트로 보기</button>
        <button class="cbt-btn" id="cPause">⏸ 일시정지</button>
        <span class="spacer"></span>
        <span class="small" id="cHint" style="color:#555"></span>
        <button class="cbt-btn" id="cSkip">다음 ▶</button>
        <button class="cbt-btn" id="cExit">시험 종료</button>
      </div>
      <div class="cbt-pop hidden" id="cPop"><div class="cbt-pop-box"><div class="hd">TOEIC Speaking</div><div class="bd" id="cPopText"></div></div></div>`;
    cbt.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (opts.fullscreen && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => { });

    const setQn = t => { $('#cQn').textContent = t; };
    const setContent = html => { $('#cContent').innerHTML = html; };
    // 하단 '안내 스크립트' 띠 (실제 시험처럼 번호 붙은 한글 안내)
    const setGuide = (...lines) => { $('#cGuide').innerHTML = lines.map(l => `<li>${l}</li>`).join(''); };
    const showPop = (text, ms) => new Promise(res => {
      $('#cPopText').textContent = text; $('#cPop').classList.remove('hidden');
      setTimeout(() => { $('#cPop').classList.add('hidden'); res(); }, ms);
    });
    $('#cVol').onclick = () => $('#cVolBox').classList.toggle('hidden');
    $('#cVolRange').oninput = e => { S.settings.volume = +e.target.value; saveSoon(); };
    const setTimerHtml = html => { $('#cTimer').innerHTML = html; };
    const renderCaption = () => {
      const c = $('#cCaption');
      c.classList.toggle('hidden', !R.capOpen);
      c.innerHTML = `<b>🔊 음성 텍스트</b>${esc(R.caption || '(아직 재생된 음성이 없어요)')}`;
      $('#cCapBtn').classList.toggle('on', R.capOpen);
    };
    $('#cCapBtn').onclick = () => { R.capOpen = !R.capOpen; renderCaption(); };
    $('#cPause').onclick = () => {
      R.paused = !R.paused;
      $('#cPause').textContent = R.paused ? '▶ 계속하기' : '⏸ 일시정지';
      $('#cPause').classList.toggle('on', R.paused);
      try { R.paused ? speechSynthesis.pause() : speechSynthesis.resume(); } catch (e) { }
      try { if (Rec.mr) R.paused ? Rec.mr.pause() : Rec.mr.resume(); } catch (e) { }
    };
    $('#cSkip').onclick = () => { R.skip = true; };
    $('#cExit').onclick = async () => {
      if (!(await ask('시험을 종료할까요? 지금까지의 답변은 저장돼요.', { ok: '종료하기', cancel: '계속 풀기' }))) return;
      R.aborted = true;
      try { speechSynthesis.cancel(); } catch (e) { }
    };

    const ABORT = {};
    const guard = async p => { await p; if (R.aborted) throw ABORT; };

    // 일시정지·건너뛰기를 반영하는 대기
    const waitMs = ms => new Promise(res => {
      let left = ms, last = performance.now();
      const iv = setInterval(() => {
        const now = performance.now();
        if (!R.paused) left -= now - last;
        last = now;
        if (left <= 0 || R.skip || R.aborted) { R.skip = false; clearInterval(iv); res(); }
      }, 100);
    });

    const fmtT = s => { const m = Math.floor(s / 60), x = s % 60; return `00:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`; };

    const countdown = (kind, secs) => new Promise(res => {
      const label = kind === 'resp' ? 'RESPONSE TIME' : 'PREPARATION TIME';
      setTimerHtml(`<div class="timer-box ${kind}"><div class="lbl">${label}</div><div class="time" id="cTime">${fmtT(secs)}</div><div class="bar"><i id="cBar"></i></div></div>`);
      let left = secs * 1000, last = performance.now();
      const iv = setInterval(() => {
        const now = performance.now();
        if (!R.paused) left -= now - last;
        last = now;
        const t = $('#cTime'), b = $('#cBar');
        if (t) t.textContent = fmtT(Math.ceil(Math.max(0, left) / 1000));
        if (b) b.style.width = Math.max(0, left / (secs * 10)) + '%';
        if (left <= 0 || R.skip || R.aborted) { R.skip = false; clearInterval(iv); res(); }
      }, 100);
    });

    const say = text => new Promise(res => {
      R.caption = text; renderCaption();
      setTimerHtml('');
      const L = $('#cListen');
      const start = performance.now();
      let done = false, iv, to, hard;
      const tick = () => { const s = Math.floor((performance.now() - start) / 1000); L.innerHTML = `<span class="wave"><i></i><i></i><i></i><i></i></span> 음성 재생 중 · ${fmtT(s)}`; };
      tick();
      const finish = () => {
        if (done) return; done = true;
        clearInterval(iv); clearTimeout(to); clearTimeout(hard);
        L.innerHTML = '';
        res();
      };
      const est = Math.max(2500, wordCount(text) * 430 / (+S.settings.rate || 1) + 1500);
      const fallback = () => {
        if (!R.capOpen) { R.capOpen = true; renderCaption(); }
        if (!R.ttsWarned) { R.ttsWarned = true; $('#cHint').textContent = '⚠️ 음성이 재생되지 않아 텍스트로 보여드려요'; }
        waitMs(est).then(finish);
      };
      iv = setInterval(() => {
        tick();
        if (R.skip || R.aborted) { R.skip = false; try { speechSynthesis.cancel(); } catch (e) { } finish(); }
      }, 200);
      if (!('speechSynthesis' in window)) return fallback();
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const v = pickVoice(); if (v) u.voice = v;
        u.lang = 'en-US'; u.rate = +S.settings.rate || 1; u.volume = vol();
        let started = false;
        u.onstart = () => { started = true; };
        u.onend = finish;
        u.onerror = e => { if (e.error === 'interrupted' || e.error === 'canceled') finish(); else fallback(); };
        speechSynthesis.speak(u);
        // Natural(온라인) 음성은 첫 소리가 늦게 나올 수 있어 5초까지 기다림
        to = setTimeout(() => { if (!started && !speechSynthesis.speaking && !done) { speechSynthesis.cancel(); fallback(); } }, 5000);
        hard = setTimeout(() => { if (!R.paused) finish(); }, est * 2 + 4000); // 음성이 멈춰버리는 브라우저 버그 대비
      } catch (e) { fallback(); }
    });

    /* ---- 녹음 + 받아쓰기 ---- */
    function srStart() {
      if (!SR || !opts.transcribe || Rec.srBroken) return;
      Rec.final = ''; Rec.interim = ''; Rec.srOn = true;
      const s = new SR();
      s.lang = 'en-US'; s.continuous = true; s.interimResults = true;
      s.onresult = e => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) Rec.final += r[0].transcript.trim() + ' ';
          else interim += r[0].transcript;
        }
        Rec.interim = interim;
      };
      s.onerror = e => {
        if (['not-allowed', 'service-not-allowed', 'network', 'audio-capture', 'language-not-supported'].includes(e.error)) {
          Rec.srBroken = true;
          $('#cHint').textContent = '⚠️ 자동 받아쓰기를 사용할 수 없어요 (' + e.error + '). 녹음은 계속돼요.';
        }
      };
      s.onend = () => {
        if (Rec.srOn && !Rec.srBroken) { try { s.start(); } catch (_) { } }
        else if (Rec.srResolve) Rec.srResolve();
      };
      Rec.sr = s;
      try { s.start(); } catch (_) { }
    }
    function srStop() {
      return new Promise(r => {
        if (!Rec.sr) return r();
        Rec.srOn = false;
        Rec.srResolve = () => { Rec.srResolve = null; r(); };
        try { Rec.sr.stop(); } catch (_) { Rec.srResolve(); }
        setTimeout(() => { if (Rec.srResolve) Rec.srResolve(); }, 1500);
      });
    }
    function recStart() {
      if (!opts.recording || !Rec.stream) return;
      Rec.chunks = [];
      try {
        Rec.mr = new MediaRecorder(Rec.stream);
        Rec.mr.ondataavailable = e => { if (e.data && e.data.size) Rec.chunks.push(e.data); };
        Rec.mr.start();
      } catch (e) { Rec.mr = null; }
      srStart();
      $('#cRec').classList.add('on');
    }
    async function recStop(qi) {
      if (!opts.recording || !Rec.stream) return;
      $('#cRec').classList.remove('on');
      const jobs = [];
      if (Rec.mr && Rec.mr.state !== 'inactive') {
        jobs.push(new Promise(r => {
          const mr = Rec.mr;
          mr.onstop = () => {
            const blob = new Blob(Rec.chunks, { type: mr.mimeType || 'audio/webm' });
            AUDIO[test.id + ':' + qi] = { url: URL.createObjectURL(blob), type: blob.type };
            r();
          };
          try { mr.stop(); } catch (e) { r(); }
        }));
      }
      if (Rec.sr) jobs.push(srStop());
      await Promise.all(jobs);
      const txt = (Rec.final + ' ' + Rec.interim).replace(/\s+/g, ' ').trim();
      if (txt) test.qs[qi].my = txt;
      Rec.sr = null;
    }

    const answered = new Set();
    // 준비 구간: 짧은 멈춤 → 삐 → 준비 타이머
    async function prep(secs) {
      setGuide('준비 시간입니다. 화면을 보며 답변을 준비하세요.', '준비 시간이 끝나면 삐 소리와 함께 답변 시간이 시작됩니다.');
      await guard(waitMs(300));
      beep();
      await guard(waitMs(300));
      await guard(countdown('prep', secs));
    }
    // 응답 구간: 삐 → 녹음 → 답변 타이머 → 녹음 종료 → 삐 + Stop Talking 팝업 → 다음 문제
    async function respond(qi, secs) {
      setGuide('삐 소리가 나면 답변을 시작하세요.', '답변 시간이 끝나면 녹음이 자동으로 끝나고 다음 문제로 넘어갑니다.');
      await guard(waitMs(200));
      beep();
      await guard(waitMs(500));
      recStart();
      try { await guard(countdown('resp', secs)); }
      finally { await recStop(qi); }
      answered.add(qi);
      beep();
      await showPop('Stop Talking', 1600);
      setTimerHtml('');
      await guard(waitMs(900));
    }

    // 마이크 준비
    if (opts.recording) {
      try { Rec.stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) {
        opts.recording = false;
        toast(ONLINE ? '온라인 페이지에서는 녹음을 쓸 수 없어서 타이머만 진행해요' : '마이크를 쓸 수 없어서 녹음 없이 진행해요 (주소창의 마이크 권한 확인)');
      }
    }
    test.recording = !!opts.recording;
    S.tests.unshift(test); S.tests = S.tests.slice(0, 40); save();

    const qIndex = (u, sub) => test.qs.findIndex(q => q.qid === u.id && q.sub === sub);
    const qLabel = qi => `Question ${test.qs[qi].num}${full ? ' of 11' : ''}`;
    let lastPart = 0;

    try {
      // 시험 전체 안내 (실전 11문항일 때만)
      if (full) {
        setQn('');
        setContent(`<div class="cbt-dir-title">Speaking Test Directions</div><div class="cbt-dir">${esc(INTRO[0])}</div>
          <table class="cbt-intro-table"><tr><th>Question</th><th>Task</th><th>Evaluation Criteria</th></tr>
          ${INTRO_TABLE.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table>
          <div class="cbt-dir">${esc(INTRO[1])}</div>`);
        setGuide('시험 전체 안내입니다. 음성을 잘 들어 주세요.', '안내가 끝나면 자동으로 Questions 1-2가 시작됩니다.');
        await guard(say(INTRO.join(' ')));
        await guard(waitMs(1200));
      }
      for (const u of units) {
        const p = u.part;
        // 파트 안내(Directions)
        if (p !== lastPart) {
          lastPart = p;
          setQn('');
          setContent(`<div class="cbt-dir-title">${DIRECTIONS[p].t}</div><div class="cbt-dir">${esc(DIRECTIONS[p].d)}</div>`);
          setGuide('Directions 화면입니다. 파트 안내 음성을 잘 들어 주세요.', '안내가 끝나면 자동으로 문제가 시작됩니다.');
          await guard(say(DIRECTIONS[p].d));
          await guard(waitMs(1200));
        }

        if (p === 1 || p === 2) {
          const qi = qIndex(u, 0);
          setQn(qLabel(qi));
          setContent(p === 1 ? `<div class="cbt-text">${esc(u.text)}</div>` : imgTag(u, 'cbt-img'));
          setGuide('문제 화면입니다. 안내 음성이 끝나면 준비 시간이 시작됩니다.');
          await guard(waitMs(600));
          await guard(say('Begin preparing now.'));
          await prep(PART_INFO[p].prep);
          setTimerHtml('');
          await guard(say(p === 1 ? 'Begin reading aloud now.' : 'Begin speaking now.'));
          await respond(qi, respSecs(p, 0));
        }

        if (p === 3) {
          for (let s = 0; s < u.questions.length; s++) {
            const qi = qIndex(u, s);
            setQn(qLabel(qi));
            // 첫 문항은 상황 설명을 먼저 읽은 뒤 질문을 보여줌
            setContent(`<div class="cbt-intro">${esc(u.intro)}</div><div class="cbt-q" id="cQ" ${s === 0 ? 'style="visibility:hidden"' : ''}>${esc(u.questions[s].q)}</div>`);
            setGuide('질문을 잘 들어 주세요. 질문이 끝나면 짧은 준비 시간이 주어집니다.');
            await guard(waitMs(500));
            if (s === 0) { await guard(say(u.intro)); await guard(waitMs(500)); $('#cQ').style.visibility = 'visible'; }
            await guard(say(u.questions[s].q));
            await prep(PART_INFO[3].prep);
            await respond(qi, respSecs(3, s));
          }
        }

        if (p === 4) {
          const q0 = qIndex(u, 0);
          setQn(qLabel(q0));
          setContent(infoTable(u));
          R.caption = ''; renderCaption();
          setGuide('화면의 정보를 읽는 시간입니다.', '읽는 시간이 끝나면 음성으로 질문이 나옵니다. 질문은 화면에 표시되지 않습니다.');
          await guard(countdown('prep', PART_INFO[4].read));
          setTimerHtml('');
          await guard(say(u.narrator || ''));
          for (let s = 0; s < u.questions.length; s++) {
            const qi = qIndex(u, s);
            setQn(qLabel(qi));
            const q = u.questions[s].q;
            setGuide(s === 2 ? 'Question 10은 질문을 두 번 들려 드립니다.' : '질문을 잘 들어 주세요. 질문이 끝나면 짧은 준비 시간이 주어집니다.');
            await guard(waitMs(500));
            await guard(say(q));
            if (s === 2) { await guard(waitMs(1200)); await guard(say(q)); }
            await prep(PART_INFO[4].prep);
            await respond(qi, respSecs(4, s));
          }
        }

        if (p === 5) {
          const qi = qIndex(u, 0);
          setQn(qLabel(qi));
          setContent(`<div class="cbt-q">${esc(u.question)}</div>`);
          setGuide('질문을 잘 들어 주세요. 안내 음성이 끝나면 준비 시간이 시작됩니다.');
          await guard(waitMs(600));
          await guard(say(u.question.replace(/•/g, '')));
          await guard(waitMs(400));
          await guard(say('Begin preparing now.'));
          await prep(PART_INFO[5].prep);
          setTimerHtml('');
          await guard(say('Begin speaking now.'));
          await respond(qi, respSecs(5, 0));
        }
        save();
      }
      test.done = true;
      markDay();
      track(full ? 'mock_complete' : 'practice_complete', { recording: !!opts.recording });
    } catch (e) {
      if (e !== ABORT) console.error(e);
    }

    // 종료 처리
    try { speechSynthesis.cancel(); } catch (e) { }
    if (Rec.stream) Rec.stream.getTracks().forEach(t => t.stop());
    save();
    R.running = false;
    setQn('');
    setTimerHtml('');
    $('#cListen').innerHTML = '';
    $('#cPop').classList.add('hidden');
    R.capOpen = false; renderCaption();
    // 마지막 화면: 실제 시험처럼 Que. 1~11 확인 + SUBMIT
    setGuide(`답변을 마친 문항에는 ✔ 표시가 있어요.${test.recording ? ' <b>Que. 버튼</b>을 누르면 내 녹음을 들을 수 있어요.' : ''}`, '<b>SUBMIT</b>을 누르면 결과 · AI 피드백 화면으로 이동합니다.');
    setContent(`<div class="cbt-dir-title" style="margin-top:10px">${test.done ? 'This is the end of the Speaking test.' : 'The test has been stopped.'}</div>
      <p class="cbt-dir" style="text-align:center">${test.done ? '수고하셨어요! 이제 모범답안을 확인하고 AI 피드백을 받아 보세요.' : '지금까지 푼 문항까지 저장했어요.'}</p>
      <div class="cbt-review">${test.qs.map((q, i) => `<button class="cbt-que ${answered.has(i) ? 'done' : ''}" data-qi="${i}">Que.<br>${q.num}</button>`).join('')}</div>
      <button class="cbt-submit" id="cDone">SUBMIT</button>`);
    let player = null;
    $$('.cbt-que').forEach(b => b.onclick = () => {
      const a = AUDIO[test.id + ':' + b.dataset.qi];
      if (player) { player.pause(); $$('.cbt-que').forEach(x => x.classList.remove('playing')); }
      if (!a) return toast(test.recording ? '이 문항은 녹음이 없어요' : '녹음 없이 푼 시험이에요');
      player = new Audio(a.url); player.volume = vol();
      b.classList.add('playing');
      player.onended = () => b.classList.remove('playing');
      player.play().catch(() => b.classList.remove('playing'));
    });
    $('#cSkip').disabled = true; $('#cPause').disabled = true; $('#cExit').disabled = true; $('#cCapBtn').disabled = true;
    $('#cDone').onclick = () => { if (player) player.pause(); closeCBT(); };
  }
  function closeCBT() {
    const id = R && R.test && R.test.id;
    $('#cbt').classList.add('hidden');
    $('#cbt').innerHTML = '';
    document.body.style.overflow = '';
    if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    R = null;
    location.hash = '#feedback/' + id;
    render();
  }
  window.addEventListener('beforeunload', e => { if (R && R.running) { e.preventDefault(); e.returnValue = ''; } });

  /* =========================================================
     12. AI 피드백
     ========================================================= */
  VIEWS.feedback = arg => {
    if (!S.tests.length) {
      return `<div class="page-head"><h1>🤖 AI 피드백</h1><p>실전 모드나 문제은행에서 푼 답변을 AI가 채점하고 다듬어 줘요.</p></div>
        <div class="card empty"><div class="e">🗂️</div><p>아직 푼 문제가 없어요.</p><div class="row" style="justify-content:center"><a class="btn btn-primary" href="#mock">실전 모드 시작</a><a class="btn" href="#bank/1">문제은행에서 골라 쓰기</a></div></div>`;
    }
    const t = S.tests.find(x => x.id === arg) || S.tests[0];
    const hasKey = !!S.settings.apiKey;
    const modeChip = t.mode === 'full' ? '<span class="chip chip-coral">실전 모의고사</span>' : t.mode === 'single' ? '<span class="chip chip-primary">문제별 실전 연습</span>' : '<span class="chip chip-sky">답변 쓰기</span>';
    return `
      <div class="page-head"><h1>🤖 AI 피드백</h1><p>문항별로 내 답변을 확인·수정하고, AI 피드백과 모범답안으로 다듬어 보세요.</p></div>
      <div class="fb-layout">
        <div class="card history">
          <h3>풀이 기록</h3>
          ${S.tests.map(x => `<button class="history-item ${x.id === t.id ? 'active' : ''}" data-act="goto" data-href="#feedback/${x.id}"><b>${esc(x.title)}</b><span>${fmtDate(x.date)} · ${x.qs.filter(q => q.my.trim()).length}/${x.qs.length} 답변 · 피드백 ${x.qs.filter(q => q.fb).length}</span></button>`).join('')}
        </div>
        <div>
          <div class="card" style="margin-bottom:14px">
            <div class="row"><h2 style="margin:0">${esc(t.title)}</h2>${modeChip}${t.recording ? '<span class="chip chip-mint">🎤 녹음</span>' : ''}<span class="muted small">${fmtDate(t.date)}</span>
              <span class="spacer"></span>
              <button class="btn btn-primary" data-act="claude-all" data-id="${t.id}">📋 전체 문항 한 번에 AI에 요청</button>
              ${hasKey && !ONLINE ? `<button class="btn" data-act="fb-all" data-id="${t.id}">🤖 API로 전체 받기</button>` : ''}
              <button class="btn btn-ghost btn-danger" data-act="del-test" data-id="${t.id}">🗑</button></div>
            ${(() => {
              const qs = t.qs.filter(q => q.part !== 1), ans = qs.filter(q => q.my.trim()).length, fb = qs.filter(q => q.fb).length;
              const step = (n, label, on) => `<div class="step-pill ${on ? 'on' : ''}"><b>${n}</b>${label}</div>`;
              return `<div class="steps">${step('①', `답변 적기 ${ans}/${qs.length}`, ans === qs.length && qs.length)}${step('②', '📋 전체 한 번에 요청', S.chat.count > 0)}${step('③', '📥 AI 답변 붙여넣기', !!t.fbAll || fb > 0)}${step('④', `피드백 ${fb}/${qs.length} · ☆ 북마크`, fb === qs.length && qs.length)}</div>`;
            })()}
            ${t.recording && !Object.keys(AUDIO).some(k => k.startsWith(t.id)) ? '<div class="notice info" style="margin-top:12px">녹음 파일은 용량 문제로 새로고침하면 사라져요. 받아쓰기 텍스트는 저장돼 있어요.</div>' : ''}
            <details style="margin-top:10px" ${t.fbAll ? 'open' : ''}><summary class="small" style="cursor:pointer;color:var(--primary);font-weight:600">📥 전체 요청에 대한 AI 답변 붙여넣기 → 문항별로 자동 분리 ${t.fbAll ? '(저장됨)' : ''}</summary>
              ${t.fbAll ? `<div class="fb-result"><div class="fb-level"><span class="chip chip-amber">AI 전체 피드백</span><span class="spacer"></span><span class="muted small">${fmtDate(t.fbAll.ts)}</span><span class="row small">${bmBtn(`fball:${t.id}`, { type: 'feedback', title: `${t.title} · 전체 피드백`, sub: '', content: t.fbAll.text, part: 0 }, 'bm-inline')}</span><button class="btn btn-ghost btn-sm" data-act="fball-clear" data-id="${t.id}">삭제</button></div><div class="fb-text">${esc(t.fbAll.text)}</div></div>` : ''}
              <textarea class="textarea" id="pasteAll" rows="4" placeholder="AI의 답변 전체를 복사해서 붙여넣으세요" style="margin-top:8px"></textarea>
              <div class="row" style="margin-top:6px"><span class="spacer"></span><button class="btn btn-primary btn-sm" data-act="fball-save" data-id="${t.id}">저장</button></div>
            </details>
          </div>
          ${chatPanel()}
          ${fbOptionsPanel()}
          ${t.qs.map((q, i) => fbQuestion(t, q, i)).join('')}
        </div>
      </div>`;
  };

  function fbQuestion(t, q, i) {
    const it = findItem(q.qid);
    if (!it) return `<div class="fb-q"><b>Q${q.num}</b> <span class="muted">삭제된 문제예요.</span></div>`;
    const au = AUDIO[t.id + ':' + i];
    // Part 1은 발음·억양 평가라 답변 입력 없이 읽기 가이드만
    if (it.part === 1) return `
      <div class="fb-q" id="fbq-${i}">
        <div class="row" style="margin-bottom:10px"><span class="chip chip-primary">Q${q.num}</span>${partChip(1)}<b>${esc(it.topic || '')}</b><span class="spacer"></span><span class="muted small">Part 1은 발음·억양 평가라 읽기 가이드로 연습해요</span></div>
        ${au ? `<div class="row" style="margin-bottom:10px"><audio controls src="${au.url}"></audio><a class="btn btn-sm" href="${au.url}" download="Q${q.num}.webm">⬇ 녹음 저장</a><span class="muted small">내 녹음을 가이드와 비교해 들어 보세요</span></div>` : ''}
        <details open><summary>📖 모범답안 (끊어 읽기 · 강세 가이드) 보기</summary>${answersBody(it)}</details>
      </div>`;
    let ctx = '';
    if (it.part === 1) ctx = `<div class="readtext">${esc(it.text)}</div>`;
    if (it.part === 2) ctx = imgTag(it);
    if (it.part === 3) ctx = `<div class="intro">${esc(it.intro)}</div><div class="q5">${esc(it.questions[q.sub].q)}</div>`;
    if (it.part === 4) ctx = `<div class="q5">${esc(it.questions[q.sub].q)}</div><details><summary>📋 제공된 정보(표) 보기</summary>${infoTable(it)}</details>`;
    if (it.part === 5) ctx = `<div class="q5">${esc(it.question)}</div>`;
    const target = Math.round(respSecs(it.part, q.sub) * 2.2);
    const myKey = `my:${t.id}:${i}`;
    BMREG[myKey] = () => ({ type: 'my', title: `${PART_INFO[it.part].name} Q${q.num} · ${it.topic || ''}`, sub: qTextOf(it, q.sub), content: t.qs[i].my, part: it.part });
    return `
      <div class="fb-q" id="fbq-${i}">
        <div class="row" style="margin-bottom:10px"><span class="chip chip-primary">Q${q.num}</span>${partChip(it.part)}<b>${esc(it.topic || '')}</b><span class="spacer"></span><span class="muted small">답변 ${respSecs(it.part, q.sub)}초 · 권장 약 ${target}단어</span></div>
        ${ctx}
        ${au ? `<div class="row" style="margin-top:12px"><audio controls src="${au.url}"></audio><a class="btn btn-sm" href="${au.url}" download="Q${q.num}.${/mp4/.test(au.type) ? 'm4a' : /ogg/.test(au.type) ? 'ogg' : 'webm'}">⬇ 녹음 저장</a></div>` : ''}
        <div style="position:relative;margin-top:12px">
          <label class="small" style="font-weight:700;color:var(--ink-2)">✍️ 내 답변 <span class="muted" id="wc-${i}">(${wordCount(q.my)}단어)</span></label>
          <textarea class="textarea" data-my="${i}" data-test="${t.id}" rows="4" placeholder="${it.part === 1 ? '읽은 내용을 그대로 적거나, 받아쓰기 결과를 확인하세요.' : '내가 말한 답변을 영어로 적어 주세요. (녹음 + 자동 받아쓰기를 쓰면 자동으로 채워져요)'}" style="margin-top:4px">${esc(q.my)}</textarea>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn btn-primary" data-act="claude-one" data-id="${t.id}" data-i="${i}">📋 AI에 피드백 요청</button>
          ${S.settings.apiKey && !ONLINE ? `<button class="btn" data-act="fb-one" data-id="${t.id}" data-i="${i}">🤖 API로 바로 받기</button>` : ''}
          <button class="btn btn-ghost" data-act="paste-toggle" data-i="${i}">📝 AI 답변 붙여넣기</button>
          <span class="spacer"></span>
          <span class="row small">${bmBtn(myKey, BMREG[myKey], 'bm-inline')} 내 답안 북마크</span>
        </div>
        <div class="hidden" id="paste-${i}" style="margin-top:8px">
          <textarea class="textarea" id="pasteTa-${i}" rows="5" placeholder="AI의 답변 전체를 복사해서 붙여넣으세요 (AI 답변 아래의 복사 버튼을 쓰면 편해요)"></textarea>
          <div class="row" style="margin-top:6px"><span class="spacer"></span><button class="btn btn-primary btn-sm" data-act="paste-save" data-id="${t.id}" data-i="${i}">피드백으로 저장</button></div>
        </div>
        <div id="fbres-${i}">${q.fb ? fbResult(t, q, i, it) : ''}</div>
        <details style="margin-top:8px"><summary>📖 모범답안 보기</summary>${answersBody(it, it.part === 3 || it.part === 4 ? q.sub : undefined)}</details>
      </div>`;
  }

  function fbResult(t, q, i, it) {
    const f = q.fb;
    const title = `${PART_INFO[it.part].name} Q${q.num} · ${it.topic || ''}`;
    // Claude 채팅에서 붙여넣은 피드백 (자유 형식 텍스트)
    if (f.text) {
      const improved = extractSection(f.text, '개선 답안');
      return `<div class="fb-result">
        <div class="fb-level"><span class="chip chip-amber">AI 피드백</span><span class="spacer"></span><span class="muted small">${fmtDate(f.ts)}</span>
          <span class="row small">${bmBtn(`fb:${t.id}:${i}`, { type: 'feedback', title, sub: qTextOf(it, q.sub), content: f.text, part: it.part }, 'bm-inline')}</span>
          <button class="btn btn-ghost btn-sm" data-act="fb-clear" data-id="${t.id}" data-i="${i}">삭제</button></div>
        <div class="fb-text">${esc(f.text)}</div>
        ${improved ? `<h4>🚀 개선 답안 <span class="muted small">(피드백에서 자동으로 찾았어요)</span></h4><div class="ans ai">${esc(improved)}${bmBtn(`ai:${t.id}:${i}`, { type: 'ai', title, sub: qTextOf(it, q.sub), content: improved, part: it.part })}</div>` : ''}
      </div>`;
    }
    const fbText = [`[예상 ${f.level} · ${f.score_range}]`, f.summary, '', ...(f.corrections || []).map(c => `✗ ${c.original}\n✓ ${c.corrected}\n  → ${c.explanation}`), '', '구성: ' + f.structure_advice, '시간: ' + f.time_advice].join('\n');
    return `<div class="fb-result">
      <div class="fb-level"><span class="muted small">예상 레벨</span><span class="lv">${esc(f.level)}</span><span class="chip chip-primary">${esc(f.score_range)}</span><span class="spacer"></span><span class="muted small">${esc(f.model || '')} · ${fmtDate(f.ts)}</span>
        <span class="row small">${bmBtn(`fb:${t.id}:${i}`, { type: 'feedback', title, sub: qTextOf(it, q.sub), content: fbText, part: it.part }, 'bm-inline')}</span></div>
      <p style="margin:0 0 8px">${esc(f.summary)}</p>
      ${(f.strengths || []).length ? `<div class="row" style="margin-bottom:6px">${f.strengths.map(s => `<span class="chip chip-mint">👍 ${esc(s)}</span>`).join('')}</div>` : ''}
      <h4>✏️ 문법 · 표현 교정</h4>
      ${(f.corrections || []).length ? `<table class="corr"><tr><th>내 표현</th><th>고친 표현</th><th>설명</th></tr>${f.corrections.map(c => `<tr><td class="from">${esc(c.original)}</td><td class="to">${esc(c.corrected)}</td><td>${esc(c.explanation)}</td></tr>`).join('')}</table>` : '<p class="muted small">고칠 부분이 없어요. 훌륭해요! 🎉</p>'}
      <h4>🚀 개선 답안 <span class="muted small">(내 아이디어를 살려 한 단계 높인 버전)</span></h4>
      <div class="ans ai">${esc(f.improved_answer)}${bmBtn(`ai:${t.id}:${i}`, { type: 'ai', title, sub: qTextOf(it, q.sub), content: f.improved_answer, part: it.part })}</div>
      <div class="grid grid-2" style="margin-top:10px">
        <div><h4>🧱 구성 조언</h4><p class="small" style="margin:0">${esc(f.structure_advice)}</p></div>
        <div><h4>⏱️ 시간 분배 조언</h4><p class="small" style="margin:0">${esc(f.time_advice)}</p></div>
      </div>
    </div>`;
  }

  /* ---------------------------------------------------------
     12-1. Claude 채팅용 프롬프트 (복사 → 붙여넣기 방식)
     --------------------------------------------------------- */
  const FB_ITEMS = [
    { k: 'level', label: '예상 레벨·점수', tag: '[예상 레벨]', desc: '이 답변의 예상 레벨(IM1~AL 등)과 문항 점수, 한두 문장 총평' },
    { k: 'strength', label: '잘한 점', tag: '[잘한 점]', desc: '잘한 점 1~3가지' },
    { k: 'grammar', label: '문법·표현 교정', tag: '[문법·표현 교정]', desc: '"내 표현 → 고친 표현 (이유)" 형식으로 최대 8개' },
    { k: 'improved', label: '개선 답안', tag: '[개선 답안]', desc: '제 아이디어를 살려 목표 레벨로 다듬은 영어 답안 (다른 설명 없이 답안만)' },
    { k: 'structure', label: '구성 조언', tag: '[구성 조언]', desc: '이 문항 유형에 맞는 답변 구성 조언' },
    { k: 'time', label: '시간 분배 조언', tag: '[시간 분배]', desc: '내 단어 수와 권장 단어 수 비교, 준비·답변 시간 활용법' },
    { k: 'pron', label: '발음·억양 주의 단어', tag: '[발음 주의]', desc: '이 답변에서 한국인이 틀리기 쉬운 발음·강세 단어 3~5개 (발음 기호 포함)' },
    { k: 'compare', label: '모범답안과 비교', tag: '[모범답안 비교]', desc: '함께 보낸 참고 모범답안과 비교해서 부족한 점과 가져다 쓸 표현' },
    { k: 'memorize', label: '암기용 핵심 문장', tag: '[암기 문장]', desc: '다른 문제에도 재활용할 수 있는 핵심 영어 문장 3개 (한국어 뜻 포함)' }
  ];
  const selItems = () => FB_ITEMS.filter(x => S.settings.fbItems.includes(x.k));
  const targetLabel = () => S.settings.fbTarget === 'auto' ? '제 현재 수준보다 한 단계 위' : S.settings.fbTarget;

  function promptRules() {
    const extra = S.settings.fbExtra.trim();
    return `당신은 한국인 학습자를 가르치는 토익스피킹 전문 강사입니다. 이 채팅방에서 제가 제 답변을 계속 보낼 테니, 매번 아래 규칙대로 피드백해 주세요.

[규칙]
- 설명은 한국어로, 교정 문장과 개선 답안은 영어로 써 주세요.
- 제 답변은 음성인식이나 직접 입력한 텍스트라서 실제 발음은 들을 수 없어요. 없는 발음 문제를 지어내지 말고, 잘못 인식된 것 같은 단어는 따로 짚어 주세요.
- 레벨 기준(0~200점): AH 200, AM 180~190, AL 160~170, IH 140~150, IM3 130, IM2 120, IM1 110, IL 90~100. 1~10번은 문항당 0~3점, 11번은 0~5점.
- 목표 레벨: ${targetLabel()}
- 개선 답안은 제 아이디어를 살리고, 답변 시간 안에 말할 수 있는 길이(초당 약 2.2~2.5단어)로 써 주세요.
- 아래 항목들을 대괄호 제목 그대로 붙여서 순서대로 써 주세요. (제가 앱에 붙여넣어 정리해요)

[피드백 형식]
${selItems().map((x, n) => `${n + 1}. ${x.tag} ${x.desc}`).join('\n')}${extra ? `\n\n[추가 요청]\n${extra}` : ''}`;
  }
  function promptShort() {
    const extra = S.settings.fbExtra.trim();
    return `(이 채팅방의 규칙대로 피드백해 주세요. 이번 형식: ${selItems().map(x => x.tag).join(' ')} · 목표 레벨: ${targetLabel()}${extra ? ` · 추가 요청: ${extra}` : ''})`;
  }
  function promptQuestion(t, i) {
    const q = t.qs[i], it = findItem(q.qid);
    if (!it) return '';
    const info = PART_INFO[it.part], secs = respSecs(it.part, q.sub);
    const L = [`■ Question ${q.num} — ${info.name} ${info.title} (${info.en})`,
      `준비 시간: ${it.part === 4 ? `표 읽기 ${info.read}초 + ` : ''}${info.prep}초 / 답변 시간: ${secs}초 / 권장 약 ${Math.round(secs * 2.2)}단어`];
    if (it.part === 1) L.push(`[읽을 지문]\n${it.text}`);
    if (it.part === 2) L.push(`[사진] ${/^https?:/.test(it.src || it.img) ? `사진 주소: ${it.src || it.img}\n` : '(사진은 직접 첨부할게요)\n'}사진 설명: ${it.alt || '(설명 없음)'}\n※ 사진을 볼 수 없다면 사진 설명을 기준으로 봐 주세요.`);
    if (it.part === 3) L.push(`[상황] ${it.intro}\n[질문] ${it.questions[q.sub].q}`);
    if (it.part === 4) L.push(`[화면에 제공된 정보]\n${infoText(it)}\n[전화한 사람] ${it.narrator || ''}\n[질문] ${it.questions[q.sub].q}`);
    if (it.part === 5) L.push(`[질문]\n${it.question}`);
    if (S.settings.fbItems.includes('compare')) {
      const ans = modelOf(it, q.sub);
      const lv = ['IM', 'IH', 'AL'].includes(S.settings.fbTarget) ? S.settings.fbTarget : 'IH';
      const ref = ans[lv] || ans.IH || ans.AL || ans.IM;
      if (ref) L.push(`[참고 모범답안]\n${ref}`);
    }
    L.push(`[내 답변] (${wordCount(q.my)}단어)\n${q.my.trim()}`);
    return L.join('\n');
  }
  // 한국어는 글자당 약 1토큰, 영어는 4글자당 약 1토큰으로 어림
  const estTokens = s => { const non = (s.match(/[^\x00-\x7F]/g) || []).length; return Math.round(non + (s.length - non) / 4); };

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) { }
      ta.remove(); return ok;
    }
  }
  function sendToClaude(bodyText) {
    const st = S.settings, c = S.chat;
    if (!selItems().length) return toast('피드백 형식을 하나 이상 선택해 주세요');
    const over = c.count > 0 && (c.count >= st.chatMax || c.tokens >= st.chatTokenMax);
    const fresh = c.count === 0 || over;
    const text = fresh ? `${promptRules()}\n\n==========\n\n${bodyText}` : `${promptShort()}\n\n${bodyText}`;
    const head = over
      ? `<div class="notice">🔄 지금 채팅방이 길어져서 (요청 ${c.count}회 · 약 ${Math.round(c.tokens / 1000)}k 토큰) <b>새 채팅방</b>에서 시작해요. 규칙도 다시 넣었어요.</div>`
      : fresh ? `<div class="notice info">🆕 <b>새 채팅방</b>에서 시작해요. 첫 요청에는 피드백 규칙이 함께 들어가요.</div>`
        : `<div class="notice ok">💬 <b>같은 채팅방</b>으로 보내요 (${c.count + 1}번째 요청 · 한도 ${st.chatMax}회).${c.url ? '' : ' 채팅방 주소를 저장해 두면 창이 닫혀도 같은 방이 열려요.'}</div>`;
    openModal(`
      <h2>📋 AI에 보낼 피드백 요청 <span class="spacer"></span><button class="btn btn-ghost" data-act="close-modal">✕</button></h2>
      ${head}
      <textarea class="textarea" id="reqText" rows="13" style="margin-top:12px;font-size:13.5px">${esc(text)}</textarea>
      <p class="small muted" style="margin:6px 0 0">약 ${Math.round(estTokens(text) / 100) / 10}k 토큰 · 보내기 전에 내용을 자유롭게 고쳐도 돼요.</p>
      <ol class="tip-list small" style="margin-top:10px">
        <li><b>[📋 복사하기]</b> → ChatGPT·Claude·Gemini 등 쓰고 있는 AI의 ${fresh ? '<b>새 채팅방</b>' : '<b>같은 채팅방</b>'}에 <b>Ctrl+V → Enter</b></li>
        ${fresh ? '<li>(선택) 채팅방 주소를 <b>💬 AI 채팅방</b>에 저장해 두면 다음에 [열기]로 바로 이동해요</li>' : ''}
        <li>AI 답변을 복사해 <b>📝 AI 답변 붙여넣기</b>에 넣으면 앱에 저장되고 북마크할 수 있어요</li>
      </ol>
      <div class="row" style="margin-top:14px"><span class="spacer"></span>
        ${!fresh && c.url ? `<a class="btn" href="${esc(c.url)}" target="aiChat" rel="noopener">↗ 채팅방 열기</a>` : ''}
        <button class="btn btn-primary" id="reqCopy">📋 복사하기</button></div>`);
    const commit = () => {
      const v = $('#reqText').value;
      track('ai_feedback_request', { method: 'copy' });
      copyText(v).then(ok => {
        if (!ok) { $('#reqText').select(); return toast('자동 복사가 막혔어요. 선택된 요청문을 Ctrl+C로 복사해 주세요.'); }
        if (fresh) S.chat = { url: '', count: 0, tokens: 0, started: Date.now() };
        S.chat.count++;
        S.chat.tokens += estTokens(v) + 1500; // 요청 + 예상 답변
        save(); markDay();
        setTimeout(closeModal, 50);
        toast(fresh ? '✅ 복사했어요! 쓰고 있는 AI의 새 채팅방에 Ctrl+V 하세요' : '✅ 복사했어요! 같은 채팅방에 Ctrl+V 하세요');
        if (route === 'feedback') { const p = $('#chatPanel'); if (p) p.outerHTML = chatPanel(); }
      });
    };
    $('#reqCopy').onclick = commit;
  }

  function chatPanel() {
    const c = S.chat, st = S.settings;
    const pct = Math.min(100, Math.round(Math.max(c.count / st.chatMax, c.tokens / st.chatTokenMax) * 100));
    const status = c.count === 0
      ? '<span class="chip">대기 중 · 다음 요청은 새 채팅방에서 시작</span>'
      : `<span class="chip ${pct >= 100 ? 'chip-coral' : 'chip-mint'}">${pct >= 100 ? '한도 도달 · 다음 요청은 새 채팅방' : '사용 중'}</span><span class="small muted">요청 ${c.count}/${st.chatMax}회 · 약 ${Math.round(c.tokens / 1000)}k / ${Math.round(st.chatTokenMax / 1000)}k 토큰</span>`;
    return `<div class="card" id="chatPanel" style="margin-bottom:14px">
      <div class="row"><h3 style="margin:0">💬 AI 채팅방</h3>${status}<span class="spacer"></span><button class="btn btn-sm" data-act="chat-reset">🆕 새 채팅방으로 시작</button></div>
      <div class="meter"><i style="width:${pct}%"></i></div>
      <div class="row" style="flex-wrap:nowrap"><input class="input" id="chatUrl" placeholder="쓰고 있는 AI 채팅방 주소 (선택 · 붙여넣어 두면 [열기]로 바로 이동)" value="${esc(c.url)}"><button class="btn" data-act="chat-url">저장</button>${c.url ? `<a class="btn" href="${esc(c.url)}" target="aiChat" rel="noopener">열기</a>` : ''}</div>
      <p class="small muted" style="margin:8px 0 0">모든 요청은 <b>한 채팅방</b>으로 이어서 보내요. 요청 ${st.chatMax}회 또는 약 ${Math.round(st.chatTokenMax / 1000)}k 토큰을 넘기면 다음 요청은 자동으로 새 채팅방에서 규칙과 함께 시작해요.</p>
      <details style="margin-top:6px"><summary class="small" style="cursor:pointer;color:var(--primary)">⚙️ 채팅방 한도 바꾸기</summary>
        <div class="row small" style="margin-top:8px">한 채팅방당 최대 요청 <input class="input" type="number" min="1" max="100" id="chatMax" value="${st.chatMax}" style="width:80px">회 · 최대 약 <input class="input" type="number" min="10" max="500" id="chatTok" value="${Math.round(st.chatTokenMax / 1000)}" style="width:80px">k 토큰</div></details>
    </div>`;
  }

  function fbOptionsPanel() {
    const st = S.settings;
    return `<details class="card" style="margin-bottom:14px" ${st.fbItems.length ? '' : 'open'}>
      <summary style="cursor:pointer;font-weight:700">🎛️ 받고 싶은 피드백 형식 <span class="muted small" style="font-weight:500">— ${selItems().map(x => x.label).join(' · ') || '선택 없음'} · 목표 ${esc(targetLabel())}</span></summary>
      <div class="fb-opts">${FB_ITEMS.map(x => `<label class="fb-opt"><input type="checkbox" data-fbitem="${x.k}" ${st.fbItems.includes(x.k) ? 'checked' : ''}><span><b>${x.label}</b><small>${esc(x.desc)}</small></span></label>`).join('')}</div>
      <div class="grid grid-2" style="margin-top:10px">
        <label class="field"><span>목표 레벨</span>
          <select class="select" id="fbTarget">${[['auto', '자동 (지금보다 한 단계 위)'], ['IM', 'IM'], ['IH', 'IH'], ['AL', 'AL']].map(([v, l]) => `<option value="${v}" ${st.fbTarget === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="field"><span>추가 요청 (자유롭게)</span>
          <textarea class="textarea" id="fbExtra" rows="2" placeholder="예: 쉬운 단어로 고쳐줘 / 필러 표현도 알려줘 / 표로 정리해줘">${esc(st.fbExtra)}</textarea></label>
      </div>
      <p class="small muted" style="margin:0">선택은 자동 저장되고, 다음 요청부터 반영돼요.</p>
    </details>`;
  }

  // 붙여넣은 AI 답변에서 [개선 답안] 부분만 찾아내기
  function extractSection(text, name) {
    const re = new RegExp(`(?:^|\\n)[#*\\s]*\\[${name}\\][*\\s:]*\\n?([\\s\\S]*?)(?=\\n[#*\\s]*\\[[^\\]\\n]{1,20}\\]|$)`);
    const m = String(text).match(re);
    return m ? m[1].replace(/^[\s*]+|[\s*]+$/g, '').replace(/^["“]|["”]$/g, '').trim() : '';
  }

  const FB_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['level', 'score_range', 'summary', 'strengths', 'corrections', 'improved_answer', 'structure_advice', 'time_advice'],
    properties: {
      level: { type: 'string' },
      score_range: { type: 'string' },
      summary: { type: 'string' },
      strengths: { type: 'array', items: { type: 'string' } },
      corrections: {
        type: 'array',
        items: {
          type: 'object', additionalProperties: false,
          required: ['original', 'corrected', 'explanation'],
          properties: { original: { type: 'string' }, corrected: { type: 'string' }, explanation: { type: 'string' } }
        }
      },
      improved_answer: { type: 'string' },
      structure_advice: { type: 'string' },
      time_advice: { type: 'string' }
    }
  };

  const FB_SYSTEM = `You are an experienced TOEIC Speaking instructor who coaches Korean learners. You evaluate ONE response to ONE test question.

Reference — TOEIC Speaking overall levels (0–200): AH 200, AM 180–190, AL 160–170, IH 140–150, IM3 130, IM2 120, IM1 110, IL 90–100, NH 60–80. Questions 1–10 are rated 0–3 each; Question 11 is rated 0–5.
Part criteria: Part 1 (read aloud) pronunciation, intonation and stress; Part 2 (describe a picture) adds grammar, vocabulary, cohesion; Parts 3–4 add relevance and completeness (Part 4 also accuracy of the information); Part 5 adds a clear opinion supported by reasons and examples.

The learner's response is a transcript produced by browser speech recognition or typed by the learner, so pronunciation cannot be heard directly. Do not invent pronunciation problems; you may note words that look mis-recognized.

Fill the fields as follows:
- level: the level this single response would most likely support, e.g. "IM2", "IH", "AL".
- score_range: Korean, e.g. "140~150점대 수준 · 문항 점수 2/3".
- summary: 2–3 sentences in Korean.
- strengths: 1–3 short Korean phrases.
- corrections: up to 8 items. original = the learner's exact words; corrected = natural English; explanation = short Korean reason. Empty array if nothing to fix.
- improved_answer: English. Keep the learner's own ideas, raise it about one level, and keep it speakable within the response time (about 2.2–2.5 words per second). For Part 1, give the original text with pause marks (/) and CAPITALIZED stressed words instead.
- structure_advice: Korean, concrete advice on organization for this question type.
- time_advice: Korean, compare the learner's word count with the target for the response time and advise how to use preparation and response time.`;

  function buildFbContent(it, sub, my) {
    const info = PART_INFO[it.part];
    const secs = respSecs(it.part, sub);
    const num = PART_START[it.part] + (it.part === 3 || it.part === 4 ? sub : 0);
    const lines = [`Question type: ${info.name} — ${info.en} (Question ${num}). Preparation: ${it.part === 4 ? `${info.read}s reading + ` : ''}${info.prep}s. Response time: ${secs}s.`];
    if (it.part === 1) lines.push(`Text to read aloud:\n${it.text}`);
    if (it.part === 2) lines.push(`The picture is attached.${it.alt ? ` Description of the picture: ${it.alt}` : ''}`);
    if (it.part === 3) lines.push(`Situation: ${it.intro}\nQuestion: ${it.questions[sub].q}`);
    if (it.part === 4) lines.push(`Information shown to the test taker:\n${infoText(it)}\n\nCaller: ${it.narrator || ''}\nQuestion: ${it.questions[sub].q}`);
    if (it.part === 5) lines.push(`Question: ${it.question}`);
    lines.push(`\nLearner's response (${wordCount(my)} words):\n"""${my}"""`);
    const content = [];
    if (it.part === 2 && it.img) {
      if (it.img.startsWith('data:')) {
        const m = it.img.match(/^data:(image\/[a-z]+);base64,(.*)$/);
        if (m) content.push({ type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } });
      } else if (/^https?:/.test(it.src || it.img)) content.push({ type: 'image', source: { type: 'url', url: it.src || it.img } });
    }
    content.push({ type: 'text', text: lines.join('\n') });
    return content;
  }

  async function callClaude(content) {
    const model = S.settings.model || 'claude-opus-5';
    const headers = {
      'content-type': 'application/json',
      'x-api-key': S.settings.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    };
    const body = {
      model, max_tokens: 16000, system: FB_SYSTEM,
      messages: [{ role: 'user', content }],
      output_config: { format: { type: 'json_schema', schema: FB_SCHEMA } }
    };
    if (model === 'claude-opus-5') { headers['anthropic-beta'] = 'server-side-fallback-2026-07-01'; body.fallbacks = 'default'; }
    let res;
    try { res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify(body) }); }
    catch (e) { throw new Error('인터넷 연결을 확인해 주세요. (' + e.message + ')'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data.error && data.error.message) || res.statusText;
      if (res.status === 401) throw new Error('API 키가 올바르지 않아요. 설정에서 다시 확인해 주세요.');
      if (res.status === 402 || /credit|billing/i.test(msg)) throw new Error('API 크레딧이 부족해요. console.anthropic.com에서 결제 정보를 확인해 주세요.');
      if (res.status === 429) throw new Error('요청이 너무 많아요. 잠시 후 다시 시도해 주세요.');
      if (res.status === 529 || res.status >= 500) throw new Error('AI 서버가 바빠요. 잠시 후 다시 시도해 주세요.');
      throw new Error(`요청 실패 (${res.status}): ${msg}`);
    }
    if (data.stop_reason === 'refusal') throw new Error('AI가 이 요청에 답하지 않았어요. 답변 내용을 확인해 주세요.');
    const block = (data.content || []).find(b => b.type === 'text');
    if (!block) throw new Error('응답을 읽지 못했어요. 다시 시도해 주세요.');
    let parsed;
    try { parsed = JSON.parse(block.text); } catch (e) { throw new Error('응답 형식이 올바르지 않아요. 다시 시도해 주세요.'); }
    return { ...parsed, model: data.model || model };
  }

  async function feedbackOne(testId, i, btn) {
    const t = S.tests.find(x => x.id === testId);
    if (!t) return;
    track('ai_feedback_request', { method: 'api' });
    const q = t.qs[i];
    const it = findItem(q.qid);
    if (!S.settings.apiKey) { toast('먼저 설정에서 API 키를 입력해 주세요'); settingsModal(); return false; }
    if (!q.my.trim()) { toast(`Q${q.num}: 답변을 먼저 적어 주세요`); return false; }
    if (!it) return false;
    const box = $('#fbres-' + i);
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> 분석 중… (최대 1분)'; }
    if (box) box.innerHTML = `<div class="notice info" style="margin-top:12px"><span class="spinner"></span> AI 선생님이 답변을 읽고 있어요…</div>`;
    let ok = true;
    try {
      const r = await callClaude(buildFbContent(it, q.sub, q.my));
      q.fb = { ...r, ts: Date.now(), answer: q.my };
      save(); markDay();
      if (box) box.innerHTML = fbResult(t, q, i, it);
    } catch (e) {
      ok = false;
      if (box) box.innerHTML = `<div class="notice" style="margin-top:12px">⚠️ ${esc(e.message)}</div>`;
    }
    if (btn) { btn.disabled = false; btn.innerHTML = q.fb ? '🤖 AI 피드백 다시 받기' : '🤖 AI 피드백 받기'; }
    return ok;
  }

  /* =========================================================
     13. 주제별 공략
     ========================================================= */
  let topicCat = '전체';
  const allTopics = () => TOPICS.map(t => ({ ...t, kit: KITS[t.id] })).concat(TOPICS_EXTRA);
  function kitPanels(t) {
    const k = t.kit;
    const tb = (t2, key, label, en, ko) => bmBtn(`kit:${t2.id}:${key}`, { type: 'topic', title: `${t2.title} · ${label}`, sub: '', content: `${en}\n(${ko})`, part: 0 });
    const pairs = (arr, key, label, koFirst) => `<div class="exp-list">${arr.map((x, i) => koFirst
      ? `<div class="exp"><span class="muted">${esc(x[0])}</span> → <span class="en"><b>${esc(x[1])}</b></span>${tb(t, key + i, label, x[1], x[0])}</div>`
      : `<div class="exp"><span class="en"><b>${esc(x[0])}</b></span> <span class="muted">${esc(x[1])}</span>${tb(t, key + i, label, x[0], x[1])}</div>`).join('')}</div>`;
    const P = {};
    if (t.points) P.full = `
      <div class="core"><div class="muted small">💡 핵심 한 줄 — ${esc(t.core.ko)}</div><div class="en">${esc(t.core.en)}</div>${bmBtn(`topic:${t.id}:core`, { type: 'topic', title: `${t.title} · 핵심 한 줄`, sub: '', content: `${t.core.en}\n(${t.core.ko})`, part: 0 })}</div>
      ${t.points.map((p, i) => `<div class="src"><div class="lbl">${esc(p.label)}</div><div><div class="ko">${esc(p.ko)}</div><div class="en">${esc(p.en)}</div></div>${bmBtn(`topic:${t.id}:p${i}`, { type: 'topic', title: `${t.title} · ${p.label}`, sub: '', content: `${p.en}\n(${p.ko})`, part: 0 })}</div>`).join('')}
      <div class="src"><div class="lbl">📎 예시</div><div><div class="ko">${esc(t.example.ko)}</div><div class="en">${esc(t.example.en)}</div></div>${bmBtn(`topic:${t.id}:ex`, { type: 'topic', title: `${t.title} · 예시`, sub: '', content: `${t.example.en}\n(${t.example.ko})`, part: 0 })}</div>
      <h4 style="margin:14px 0 4px">🔑 필수 표현</h4>
      <div class="exp-list">${t.expressions.map((e, i) => `<div class="exp"><span class="en"><b>${esc(e.en)}</b></span> <span class="muted">${esc(e.ko)}</span>${bmBtn(`topic:${t.id}:e${i}`, { type: 'topic', title: `${t.title} · 표현`, sub: '', content: `${e.en}\n(${e.ko})`, part: 0 })}</div>`).join('')}</div>`;
    if (k) {
      P.st = k.st.map(([p, ko, ex], i) => `<div class="kit-st"><div><b class="en">${esc(p)}</b> <span class="muted">${esc(ko)}</span>${ex ? `<div class="kit-ex en">${esc(ex)}</div>` : ''}</div>${tb(t, 'st' + i, '문장 구조', p + (ex ? '\n' + ex : ''), ko)}</div>`).join('');
      P.adj = pairs(k.adj, 'adj', '형용사');
      P.rs = pairs(k.rs, 'rs', '이유 키워드', true);
      P.vn = pairs(k.vn, 'vn', '동사·명사');
    }
    return P;
  }
  VIEWS.topics = () => {
    const flip = S.settings.flip;
    const topics = allTopics();
    const cats = ['전체', ...new Set(topics.map(t => t.cat))];
    const list = topics.filter(t => topicCat === '전체' || t.cat === topicCat);
    const TABS = [['st', '🧱 문장 구조'], ['adj', '🎨 형용사'], ['rs', '🔑 이유 키워드'], ['vn', '📚 동사·명사'], ['full', '✍️ 완성 문장']];
    return `
      <div class="page-head"><h1>🧠 주제별 공략</h1><p>주제마다 <b>문장 구조 · 형용사 · 이유 키워드 · 동사/명사</b>를 모았어요. 조각을 조합해서 즉석으로 문장을 만드는 연습을 해 보세요.</p></div>
      <div class="row" style="margin-bottom:14px">
        <button class="btn ${flip ? 'btn-primary' : ''}" data-act="flip-toggle">${flip ? '🙈 암기 모드 ON — 영어를 눌러서 확인' : '🙈 암기 모드 (영어 가리기)'}</button>
        <input class="input" id="topicSearch" placeholder="🔍 주제 찾기 (예: 환경, 재택, 돈)" style="max-width:280px">
        <span class="muted small">☆ 를 누르면 북마크에 모여요</span>
      </div>
      <div class="${flip ? 'flip' : ''}">
        <h2>⚡ 만능 이유 8종 <span class="muted small">— 어떤 질문이든 이유가 막히면 여기서 꺼내 쓰세요</span></h2>
        <div class="uni-grid">
          ${UNIVERSAL.map(u => `<div class="uni"><span class="e">${u.emoji}</span><b>${esc(u.ko)}</b><div class="en">${esc(u.en)}</div>${bmBtn('topic:' + u.id, { type: 'topic', title: `만능 이유 · ${u.ko}`, sub: '', content: `${u.en}\n${u.plus}`, part: 0 })}</div>`).join('')}
        </div>

        <details class="struct-lib" open>
          <summary><h2 style="display:inline">🧱 만능 문장 구조 라이브러리</h2> <span class="muted small">— 기능별 패턴 ${STRUCTURES.reduce((n, c) => n + c.items.length, 0)}개</span></summary>
          <div class="struct-grid">
            ${STRUCTURES.map((c, ci) => `<div class="struct-card"><h3>${esc(c.cat)}</h3>${c.items.map(([p, ko, ex], i) => `<div class="kit-st"><div><b class="en">${esc(p)}</b> <span class="muted">${esc(ko)}</span>${ex ? `<div class="kit-ex en">${esc(ex)}</div>` : ''}</div>${bmBtn(`struct:${ci}:${i}`, { type: 'topic', title: `문장 구조 · ${c.cat.replace(/^\S+\s/, '')}`, sub: '', content: p + (ex ? '\n' + ex : '') + `\n(${ko})`, part: 0 })}</div>`).join('')}</div>`).join('')}
          </div>
        </details>

        <h2 style="margin-top:26px">📌 빈출 주제 카드 <span class="muted small">${topics.length}개</span></h2>
        <div class="tabs">${cats.map(c => `<button class="tab ${c === topicCat ? 'active' : ''}" data-act="topic-cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
        <div id="topicList">
        ${list.map((t, idx) => {
          const P = kitPanels(t);
          const tabs = TABS.filter(([k]) => P[k]);
          const first = tabs.length ? tabs[0][0] : '';
          return `
          <div class="topic ${idx === 0 ? '' : 'collapsed'}" data-s="${esc((t.title + ' ' + t.cat + ' ' + t.questions.join(' ')).toLowerCase())}">
            <div class="topic-head" data-act="topic-toggle"><span class="e">${t.emoji}</span><div><b>${esc(t.title)}</b><div class="muted small">${esc(t.cat)}${t.kit ? ` · 구조 ${t.kit.st.length} · 형용사 ${t.kit.adj.length} · 이유 ${t.kit.rs.length} · 단어 ${t.kit.vn.length}` : ''}${t.points ? ' · 완성 문장' : ''}</div></div><span class="spacer"></span><span class="muted">▾</span></div>
            <div class="topic-body">
              <ul class="qexamples">${t.questions.map(q => `<li>${esc(q)}</li>`).join('')}</ul>
              ${t.kit && t.kit.core ? `<div class="row" style="margin-bottom:10px">${t.kit.core.map(c => `<span class="chip chip-primary">💡 ${esc(c)}</span>`).join('')}</div>` : ''}
              <div class="ktabs">${tabs.map(([k, l]) => `<button class="ktab ${k === first ? 'active' : ''}" data-act="ktab" data-k="${k}">${l}</button>`).join('')}</div>
              ${tabs.map(([k]) => `<div class="kpanel ${k === first ? '' : 'hidden'}" data-kp="${k}">${P[k]}</div>`).join('')}
            </div>
          </div>`;
        }).join('')}
        </div>
      </div>`;
  };
  function filterTopics() {
    const q = $('#topicSearch').value.trim().toLowerCase();
    $$('#topicList .topic').forEach(c => { const ok = !q || c.dataset.s.includes(q); c.classList.toggle('hidden', !ok); if (ok && q) c.classList.remove('collapsed'); });
  }

  /* =========================================================
     14. 북마크
     ========================================================= */
  let bmFilter = 'all', bmPart = 'all', bmMemo = false, bmDoneF = 'all';
  /* =========================================================
     의견 보내기 — Web3Forms로 개발자 이메일에만 전송 (사이트에는 저장·공개되지 않음)
     ========================================================= */
  // web3forms.com에서 개발자 이메일로 발급받은 Access Key (공개돼도 되는 전송 전용 키)
  const WEB3FORMS_KEY = '4503d05b-f211-4d23-b10d-0f2229f77842';
  const OPINION_TYPES = [['💡 개선 제안', '더 좋아졌으면 하는 점, 있었으면 하는 기능'], ['🐞 오류 신고', '안 되거나 이상하게 동작하는 부분'], ['💬 기타', '어떤 의견이든 좋아요']];
  const PAGE_NAMES = { home: '홈', bank: '파트별 문제은행', mock: '실전 모드', feedback: 'AI 피드백', topics: '주제별 공략', bookmarks: '북마크', opinion: '의견 보내기', privacy: '개인정보 처리 안내' };
  const deviceInfo = () => {
    const ua = navigator.userAgent;
    const kind = /iPhone|iPad|Android|Mobile/i.test(ua) ? '휴대폰·태블릿' : 'PC';
    const br = /Edg\//.test(ua) ? 'Edge' : /SamsungBrowser/.test(ua) ? '삼성 인터넷' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : '기타';
    return `${kind} · ${br} · 화면 ${innerWidth}×${innerHeight}`;
  };
  VIEWS.opinion = arg => {
    if (arg === 'thanks') return `
      <div class="card opinion-thanks">
        <div style="font-size:54px">💌</div>
        <h1>소중한 의견 감사합니다!</h1>
        <p>보내 주신 의견은 개발자만 확인해요.<br>더 좋은 스피킹 러너를 만드는 데 꼭 반영할게요.</p>
        <div class="row" style="justify-content:center;margin-top:18px">
          <a class="btn" href="#opinion">의견 더 보내기</a>
          <a class="btn btn-primary" href="#${esc(opinionFrom || 'home')}">하던 공부 계속하기 ▶</a>
        </div>
      </div>`;
    return `
      <div class="page-head"><h1>📮 의견 보내기</h1><p>불편한 점, 개선할 점, 오류 등 <b>어떤 의견이든</b> 좋아요. 보내 주신 의견은 <b>개발자만</b> 볼 수 있어요.</p></div>
      <form class="card opinion-form" id="opinionForm" novalidate>
        <h3 style="margin-top:0">어떤 의견인가요?</h3>
        <div class="opinion-types">
          ${OPINION_TYPES.map((t, i) => `<label class="opt"><input type="radio" name="opType" value="${t[0]}" ${i === 0 ? 'checked' : ''}><div><b>${t[0]}</b><span>${t[1]}</span></div></label>`).join('')}
        </div>
        <label class="field" style="margin-top:14px"><span>의견 내용</span>
          <textarea class="textarea" id="opMsg" maxlength="3000" rows="7" placeholder="예) 휴대폰에서 실전 모드 타이머가 잘 안 보여요 / 파트 3 문제가 더 많았으면 좋겠어요"></textarea></label>
        <div class="row small muted" style="margin-top:-4px"><span>📍 보내는 화면·기기 정보(${esc(PAGE_NAMES[(opinionFrom || 'home').split('/')[0]] || '홈')} · ${deviceInfo().split(' · ')[0]})가 함께 전달돼요. 개인정보는 받지 않아요.</span><span class="spacer"></span><span id="opCount">0 / 3000</span></div>
        <div class="row" style="margin-top:14px"><span class="spacer"></span><button class="btn btn-primary btn-lg" type="submit" id="opSend">📮 보내기</button></div>
      </form>`;
  };
  document.addEventListener('submit', async e => {
    if (e.target.id !== 'opinionForm') return;
    e.preventDefault();
    const msg = $('#opMsg').value.trim();
    if (msg.length < 2) { toast('의견 내용을 적어 주세요'); $('#opMsg').focus(); return; }
    if (!WEB3FORMS_KEY) { toast('아직 의견 받는 곳이 설정되지 않았어요'); return; }
    const type = ($('input[name=opType]:checked') || {}).value || '💬 기타';
    const from = opinionFrom || 'home';
    const btn = $('#opSend'); btn.disabled = true; btn.textContent = '보내는 중…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[스피킹 러너] ${type.replace(/^\S+\s/, '')} 의견이 도착했어요`,
          from_name: '스피킹 러너 사용자',
          '의견 종류': type,
          '의견 내용': msg,
          '보낸 화면': `${PAGE_NAMES[from.split('/')[0]] || from} (#${from})`,
          '기기': deviceInfo(),
          '보낸 시각': new Date().toLocaleString('ko-KR')
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || res.status);
      track('opinion_send', { opinion_type: type });
      location.hash = '#opinion/thanks';
    } catch (err) {
      btn.disabled = false; btn.textContent = '📮 보내기';
      toast('전송에 실패했어요. 인터넷 연결을 확인하고 다시 눌러 주세요');
    }
  });

  VIEWS.bookmarks = () => {
    const all = S.bookmarks;
    const list = all.filter(b => (bmFilter === 'all' || b.type === bmFilter) && (bmPart === 'all' || String(b.part) === bmPart));
    const count = t => all.filter(b => b.type === t).length;
    const typeChip = { model: 'chip-primary', my: 'chip-sky', feedback: 'chip-amber', ai: 'chip-amber', topic: 'chip-mint' };
    const groups = bmFilter === 'all' ? Object.keys(BM_TYPES).map(k => [k, list.filter(b => b.type === k)]).filter(g => g[1].length) : [[bmFilter, list]];
    return `
      <div class="page-head"><h1>⭐ 북마크</h1><p>모든 화면에서 ☆ 한 답변이 여기 모여요. 카드 모드로 한 장씩 넘기며 외우고, 외운 건 ✅ 체크하세요.</p></div>
      <div class="grid grid-4" style="margin-bottom:14px">
        <div class="stat"><b>${all.length}</b><span>전체 북마크</span></div>
        <div class="stat"><b>${all.filter(b => b.done).length}</b><span>✅ 외운 것</span></div>
        <div class="stat"><b>${all.filter(b => !b.done).length}</b><span>📖 외우는 중</span></div>
        <div class="stat"><b>${all.length ? Math.round(all.filter(b => b.done).length / all.length * 100) : 0}%</b><span>암기 달성률</span></div>
      </div>
      <div class="tabs">
        <button class="tab ${bmFilter === 'all' ? 'active' : ''}" data-act="bm-filter" data-v="all">전체<small>${all.length}</small></button>
        ${Object.entries(BM_TYPES).map(([k, v]) => `<button class="tab ${bmFilter === k ? 'active' : ''}" data-act="bm-filter" data-v="${k}">${v}<small>${count(k)}</small></button>`).join('')}
      </div>
      <div class="row" style="margin-bottom:16px">
        <input class="input" id="bmSearch" placeholder="🔍 북마크 검색" style="max-width:220px">
        <div class="seg" id="bmDone"><button class="${bmDoneF === 'all' ? 'active' : ''}" data-v="all">전체</button><button class="${bmDoneF === 'todo' ? 'active' : ''}" data-v="todo">외우는 중</button><button class="${bmDoneF === 'done' ? 'active' : ''}" data-v="done">✅ 외움</button></div>
        <select class="select" style="width:auto" data-act-change="bm-part">
          <option value="all">모든 파트</option>
          ${[1, 2, 3, 4, 5].map(p => `<option value="${p}" ${bmPart === String(p) ? 'selected' : ''}>${PART_INFO[p].name} ${PART_INFO[p].title}</option>`).join('')}
          <option value="0" ${bmPart === '0' ? 'selected' : ''}>주제별 공략</option>
        </select>
        <button class="btn ${bmMemo ? 'btn-primary' : ''}" data-act="bm-memo">${bmMemo ? '🙈 암기 모드 ON — 눌러서 확인' : '🙈 암기 모드'}</button>
        <span class="spacer"></span>
        <button class="btn btn-primary" data-act="bm-cards" ${list.length ? '' : 'disabled'}>🃏 카드로 외우기</button>
        <button class="btn" data-act="bm-export" ${list.length ? '' : 'disabled'}>📄 텍스트 저장</button>
      </div>
      <div class="${bmMemo ? 'memo-mode' : ''}" id="bmList">
        ${list.length ? groups.map(([k, items]) => `
          <h2 style="margin-top:18px" class="bm-group">${BM_TYPES[k]} <span class="muted small">${items.length}</span></h2>
          ${items.map(b => `<div class="bm-item ${b.done ? 'is-done' : ''}" data-key="${esc(b.key)}" data-done="${b.done ? 'done' : 'todo'}" data-s="${esc((b.title + ' ' + (b.sub || '') + ' ' + b.content).toLowerCase())}">
            <div class="t"><span class="chip ${typeChip[b.type] || ''}">${BM_TYPES[b.type] || ''}</span><b style="color:var(--ink)">${esc(b.title)}</b><span>${fmtDate(b.ts)}</span>
              <button class="done-btn ${b.done ? 'on' : ''}" data-act="bm-done" data-key="${esc(b.key)}">${b.done ? '✅ 외움' : '☐ 외웠어요'}</button></div>
            ${b.sub ? `<div class="muted small" style="margin-bottom:6px">Q. ${esc(String(b.sub).slice(0, 160))}</div>` : ''}
            <div class="c">${esc(b.content)}</div>
            <button class="bm on" data-bm="${esc(b.key)}" title="북마크 해제">★</button>
          </div>`).join('')}`).join('') : `<div class="card empty"><div class="e">⭐</div><p>아직 북마크가 없어요.<br>모범답안·주제 카드·AI 피드백 옆의 ☆ 를 눌러 모아 보세요.</p></div>`}
        <div class="empty hidden" id="bmEmpty"><div class="e">🔍</div>조건에 맞는 북마크가 없어요.</div>
      </div>`;
  };
  function filterBm() {
    const q = $('#bmSearch') ? $('#bmSearch').value.trim().toLowerCase() : '';
    let shown = 0;
    $$('#bmList .bm-item').forEach(c => {
      const ok = (!q || c.dataset.s.includes(q)) && (bmDoneF === 'all' || c.dataset.done === bmDoneF);
      c.classList.toggle('hidden', !ok); if (ok) shown++;
    });
    $$('#bmList .bm-group').forEach(h => {
      let n = h.nextElementSibling, any = false;
      while (n && n.classList.contains('bm-item')) { if (!n.classList.contains('hidden')) any = true; n = n.nextElementSibling; }
      h.classList.toggle('hidden', !any);
    });
    const e = $('#bmEmpty'); if (e) e.classList.toggle('hidden', shown > 0 || !$$('#bmList .bm-item').length);
  }
  // 카드로 외우기 (한 장씩 넘기기)
  let FC = null;
  function flashcards(list) {
    if (!list.length) return toast('카드가 없어요');
    FC = { list, i: 0, show: false };
    openModal('<div id="fcBox"></div>');
    drawFc();
  }
  function drawFc() {
    const box = $('#fcBox'); if (!box || !FC) return;
    const b = FC.list[FC.i];
    box.innerHTML = `
      <div class="row" style="margin-bottom:12px"><span class="chip chip-primary">${FC.i + 1} / ${FC.list.length}</span><span class="chip">${BM_TYPES[b.type] || ''}</span>${b.done ? '<span class="chip chip-mint">✅ 외움</span>' : ''}<span class="spacer"></span><button class="btn btn-ghost" data-act="close-modal">✕</button></div>
      <div class="fc-card" data-act="fc-flip">
        <div class="fc-title">${esc(b.title)}</div>
        ${b.sub ? `<div class="muted small" style="margin-top:4px">Q. ${esc(String(b.sub).slice(0, 200))}</div>` : ''}
        <div class="fc-content ${FC.show ? '' : 'blurred'}">${esc(b.content)}</div>
        ${FC.show ? '' : '<div class="fc-hint">👆 카드를 누르거나 스페이스바로 확인</div>'}
      </div>
      <div class="row" style="margin-top:14px">
        <button class="btn" data-act="fc-prev">◀ 이전</button>
        <button class="btn" data-act="fc-shuffle">🔀 섞기</button>
        <span class="spacer"></span>
        <button class="btn ${b.done ? 'btn-mint' : ''}" data-act="fc-done">${b.done ? '✅ 외움' : '✅ 외웠어요'}</button>
        <button class="btn btn-primary" data-act="fc-next">다음 ▶</button>
      </div>
      <p class="small muted" style="margin:10px 0 0">단축키: 스페이스 = 보기 · ← → = 이전/다음 · Enter = 외웠어요</p>`;
  }
  const fcMove = d => { FC.i = (FC.i + d + FC.list.length) % FC.list.length; FC.show = false; drawFc(); };
  function fcToggleDone() {
    const b = FC.list[FC.i]; b.done = !b.done; save(); markDay(); drawFc();
  }
  document.addEventListener('keydown', e => {
    if (!FC || !$('#fcBox')) return;
    if (e.key === ' ') { e.preventDefault(); FC.show = !FC.show; drawFc(); }
    if (e.key === 'ArrowRight') fcMove(1);
    if (e.key === 'ArrowLeft') fcMove(-1);
    if (e.key === 'Enter') { e.preventDefault(); fcToggleDone(); }
  });

  /* =========================================================
     15. 설정 · 백업
     ========================================================= */
  function settingsModal() {
    const voices = 'speechSynthesis' in window ? speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang)) : [];
    const cur = pickVoice();
    openModal(`
      <h2>⚙️ 설정 · 백업 <span class="spacer"></span><button class="btn btn-ghost" data-act="close-modal">✕</button></h2>
      ${ONLINE ? '<div class="notice info" style="margin-bottom:10px">🌐 온라인 공유 버전이에요. AI 피드백은 <b>📋 AI에 피드백 요청</b>(복사 → 쓰고 있는 AI에 붙여넣기)으로 받을 수 있어요.</div>' : ''}
      <div ${ONLINE ? 'hidden' : ''}>
      <h3>🤖 AI 피드백 (선택)</h3>
      <p class="small muted" style="margin-top:0">API 키가 없어도 AI 피드백 화면의 <b>📋 AI에 피드백 요청</b>으로 ChatGPT·Claude·Gemini 등 쓰고 있는 AI에서 (무료·유료 상관없이) 피드백을 받을 수 있어요. 키를 넣으면 <b>🤖 API로 바로 받기</b> 버튼이 추가로 생겨요.</p>
      <label class="field"><span>Anthropic API 키</span>
        <div class="row" style="flex-wrap:nowrap"><input class="input" id="setKey" type="password" value="${esc(S.settings.apiKey)}" placeholder="sk-ant-..." autocomplete="off"><button class="btn" type="button" id="keyShow">보기</button></div></label>
      <p class="small muted" style="margin-top:-6px">console.anthropic.com → API Keys에서 발급해요. 키는 <b>이 컴퓨터의 브라우저에만</b> 저장되고, 백업 파일에는 포함되지 않아요. 사용량만큼 요금이 나가요.</p>
      <label class="field"><span>AI 모델</span>
        <select class="select" id="setModel">
          <option value="claude-opus-5" ${S.settings.model === 'claude-opus-5' ? 'selected' : ''}>Claude Opus 5 — 가장 정확 (기본)</option>
          <option value="claude-sonnet-5" ${S.settings.model === 'claude-sonnet-5' ? 'selected' : ''}>Claude Sonnet 5 — 빠르고 저렴</option>
          <option value="claude-haiku-4-5" ${S.settings.model === 'claude-haiku-4-5' ? 'selected' : ''}>Claude Haiku 4.5 — 가장 저렴</option>
        </select></label>
      </div>
      <h3 style="margin-top:18px">🔊 시험 음성</h3>
      <label class="field"><span>목소리 ${voices.length ? '' : '<small class="muted">(불러오는 중이거나 지원하지 않는 브라우저예요)</small>'}</span>
        <select class="select" id="setVoice">${voices.map(v => `<option value="${esc(v.name)}" ${cur && cur.name === v.name ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select></label>
      <p class="small muted" style="margin:-6px 0 10px">💡 <b>엣지(Edge)</b>에서는 사람처럼 자연스러운 <b>Natural</b> 음성이 자동으로 선택돼요. 크롬은 기계 음성만 있어요.</p>
      <label class="field"><span>말하기 속도 <b id="rateVal">${S.settings.rate}</b> <small class="muted">(실제 시험은 1.0)</small></span><input type="range" id="setRate" min="0.7" max="1.2" step="0.05" value="${S.settings.rate}" style="width:100%"></label>
      <button class="btn" type="button" id="voiceTest">🔊 들어보기</button>
      <h3 style="margin-top:20px">💾 백업</h3>
      <p class="small muted" style="margin-top:0">내가 추가한 문제 · 북마크 · 풀이 기록 · 피드백을 파일로 저장하거나 불러와요.</p>
      <div class="row">
        <button class="btn" type="button" id="bkExport">⬇ 백업 파일 내보내기</button>
        <label class="btn" style="cursor:pointer">⬆ 백업 불러오기<input type="file" id="bkImport" accept=".json,application/json" hidden></label>
        <span class="spacer"></span>
        <button class="btn btn-ghost btn-danger" type="button" id="bkReset">전체 초기화</button>
      </div>
      ${CLOUD.user ? `<h3 style="margin-top:20px">👤 계정</h3>
      <p class="small muted" style="margin-top:0">${esc(CLOUD.user.email || '')} 로 로그인 중 · 기록이 계정에 동기화되고 있어요. <a href="#privacy" id="privLink">개인정보 처리 안내</a></p>
      <button class="btn btn-ghost btn-danger" type="button" id="acctDel">계정 삭제 (모든 기록 영구 삭제)</button>` : ''}
      <div class="row" style="margin-top:20px"><span class="spacer"></span><button class="btn btn-primary" id="setSave">저장</button></div>`);
    if ($('#acctDel')) { $('#acctDel').onclick = () => { closeModal(); deleteAccount(); }; $('#privLink').onclick = () => closeModal(); }
    $('#keyShow').onclick = () => { const k = $('#setKey'); k.type = k.type === 'password' ? 'text' : 'password'; };
    $('#setRate').oninput = e => { $('#rateVal').textContent = e.target.value; };
    $('#voiceTest').onclick = () => {
      S.settings.voice = $('#setVoice').value || S.settings.voice;
      S.settings.rate = +$('#setRate').value;
      speakSimple('Imagine that a marketing firm is doing research in your area. Begin preparing now.');
    };
    $('#setSave').onclick = () => {
      S.settings.apiKey = $('#setKey').value.trim();
      S.settings.model = $('#setModel').value;
      if ($('#setVoice').value) S.settings.voice = $('#setVoice').value;
      S.settings.rate = +$('#setRate').value;
      save(); closeModal(); toast('✅ 설정을 저장했어요'); render(true);
    };
    $('#bkExport').onclick = () => {
      const data = JSON.parse(JSON.stringify(S));
      data.settings.apiKey = '';
      download(`speaking-runner-backup-${todayStr()}.json`, JSON.stringify(data, null, 2), 'application/json');
    };
    $('#bkImport').onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const r = new FileReader();
      r.onload = async () => {
        try {
          const d = JSON.parse(r.result);
          if (!d || !Array.isArray(d.bookmarks) || !Array.isArray(d.tests)) throw 0;
          if (!(await ask('백업 파일로 지금 데이터를 바꿀까요? (API 키는 유지돼요)', { ok: '바꾸기' }))) return;
          const key = S.settings.apiKey;
          S = { ...defaults(), ...d, settings: { ...defaults().settings, ...(d.settings || {}), apiKey: key } };
          save(); closeModal(); toast('✅ 백업을 불러왔어요'); render();
        } catch (err) { toast('⚠️ 올바른 백업 파일이 아니에요'); }
      };
      r.readAsText(file);
    };
    $('#bkReset').onclick = async () => {
      if (!(await ask('정말 모든 데이터(내 문제·북마크·기록·설정)를 지울까요? 되돌릴 수 없어요.', { ok: '모두 지우기', danger: true }))) return;
      S = defaults(); save(); closeModal(); toast('초기화했어요'); location.hash = '#home'; render();
    };
  }

  /* =========================================================
     16. 클릭 이벤트 모음
     ========================================================= */
  const ACT = {
    'close-modal': () => closeModal(),
    settings: () => settingsModal(),
    goto: el => { location.hash = el.dataset.href; },
    ktab: el => {
      const body = el.closest('.topic-body');
      $$('.ktab', body).forEach(b => b.classList.toggle('active', b === el));
      $$('.kpanel', body).forEach(p => p.classList.toggle('hidden', p.dataset.kp !== el.dataset.k));
    },
    'bm-cards': () => {
      const keys = $$('#bmList .bm-item:not(.hidden)').map(c => c.dataset.key);
      flashcards(keys.map(k => S.bookmarks.find(b => b.key === k)).filter(Boolean));
    },
    'bm-done': el => {
      const b = S.bookmarks.find(x => x.key === el.dataset.key); if (!b) return;
      b.done = !b.done; save(); markDay(); render(true);
      toast(b.done ? '✅ 외운 것으로 표시했어요' : '다시 외우는 중으로 옮겼어요');
    },
    'fc-flip': () => { FC.show = !FC.show; drawFc(); },
    'fc-prev': () => fcMove(-1),
    'fc-next': () => fcMove(1),
    'fc-shuffle': () => { FC.list = shuffle(FC.list); FC.i = 0; FC.show = false; drawFc(); toast('🔀 순서를 섞었어요'); },
    'fc-done': () => fcToggleDone(),
    'qcard-toggle': el => { const c = el.closest('.qcard'); c.classList.contains('collapsed') ? openQcard(c) : c.classList.add('collapsed'); },
    mark: el => {
      const id = el.dataset.id, v = el.dataset.v;
      S.marks[id] = S.marks[id] === v ? 'new' : v; if (S.marks[id] === 'new') delete S.marks[id];
      save(); markDay();
      const c = $('#q-' + CSS.escape(id)), st = S.marks[id] || 'new';
      if (c) { c.dataset.st = st; $$('.st-btn', c).forEach(b => b.classList.toggle('on', b.dataset.v === st)); $$('.st-btn', c).forEach(b => { b.classList.toggle('hard', b.dataset.v === 'hard' && st === 'hard'); b.classList.toggle('done', b.dataset.v === 'done' && st === 'done'); }); }
      toast(st === 'done' ? '✅ 외운 문제로 표시했어요' : st === 'hard' ? '😵 어려운 문제로 표시했어요' : '표시를 지웠어요');
    },
    'bank-random': () => {
      const cards = $$('#bankList .qcard').filter(c => !c.classList.contains('hidden') && c.dataset.st !== 'done');
      const pool = cards.length ? cards : $$('#bankList .qcard:not(.hidden)');
      if (!pool.length) return toast('문제가 없어요');
      $$('#bankList .qcard').forEach(c => c.classList.add('collapsed'));
      const c = pick(pool); openQcard(c); c.scrollIntoView({ behavior: 'smooth', block: 'start' });
      c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 1200);
    },
    'bank-expand': el => {
      const open = el.textContent.includes('펼치기');
      $$('#bankList .qcard:not(.hidden)').forEach(c => open ? openQcard(c) : c.classList.add('collapsed'));
      if (!open) $$('#bankList .cat-group').forEach(g => { g.open = false; });
      el.textContent = open ? '모두 접기' : '모두 펼치기';
    },
    'toggle-ans': el => {
      const box = el.closest('.qcard').querySelector('.answers');
      box.classList.toggle('hidden');
      el.textContent = box.classList.contains('hidden') ? '📖 모범답안 보기' : '🙈 모범답안 숨기기';
    },
    'add-q': el => addQuestionModal(el.dataset.part),
    'del-custom': async el => {
      if (!(await ask('이 문제를 삭제할까요?', { ok: '삭제', danger: true }))) return;
      S.custom = S.custom.filter(x => x.id !== el.dataset.id); save(); render(true); toast('삭제했어요');
    },
    practice: async el => {
      const it = findItem(el.dataset.id); if (!it) return;
      const test = makeTest([it], 'single', `${PART_INFO[it.part].name} 연습 · ${it.topic || ''}`);
      const rec = ONLINE ? false : await ask('🎤 녹음하면서 풀까요?', { ok: '녹음 + 받아쓰기', cancel: '타이머만' });
      track('practice_start', { part: it.part });
      runCBT([it], test, { recording: rec, transcribe: rec && !!SR, fullscreen: false });
    },
    write: el => {
      const it = findItem(el.dataset.id); if (!it) return;
      const test = makeTest([it], 'write', `답변 쓰기 · ${PART_INFO[it.part].name} ${it.topic || ''}`);
      S.tests.unshift(test); save();
      location.hash = '#feedback/' + test.id;
    },
    'voice-test': () => speakSimple('Welcome to the speaking test. Begin preparing now.'),
    'start-mock': () => {
      const built = buildFullTest();
      if (!built) return toast('문제가 부족해요');
      const rec = ($('input[name=recMode]:checked') || {}).value === 'rec';
      track('mock_start', { recording: rec });
      runCBT(built.units, built.test, { recording: rec, transcribe: rec && $('#optStt') && $('#optStt').checked, fullscreen: $('#optFull') && $('#optFull').checked });
    },
    'fb-one': el => feedbackOne(el.dataset.id, +el.dataset.i, el),
    'claude-one': el => {
      const t = S.tests.find(x => x.id === el.dataset.id); if (!t) return;
      const i = +el.dataset.i;
      if (!t.qs[i].my.trim()) return toast(`Q${t.qs[i].num}: 내 답변을 먼저 적어 주세요`);
      sendToClaude(promptQuestion(t, i));
    },
    'claude-all': async el => {
      const t = S.tests.find(x => x.id === el.dataset.id); if (!t) return;
      const idxs = t.qs.map((q, i) => i).filter(i => t.qs[i].part !== 1 && t.qs[i].my.trim());
      if (!idxs.length) return toast('답변이 적힌 문항이 없어요 (Part 1은 제외돼요)');
      const missing = t.qs.filter(q => q.part !== 1 && !q.my.trim()).map(q => 'Q' + q.num);
      if (missing.length && !(await ask(`${missing.join(', ')}은(는) 답변이 비어 있어서 빼고 보낼게요. 계속할까요?`, { ok: '계속' }))) return;
      sendToClaude(`아래 ${idxs.length}개 문항을 각각 피드백해 주세요. 문항마다 "■ Question 번호"로 구분해 주세요.\n\n` + idxs.map(i => promptQuestion(t, i)).join('\n\n----------\n\n'));
    },
    'paste-toggle': el => { const b = $('#paste-' + el.dataset.i); b.classList.toggle('hidden'); if (!b.classList.contains('hidden')) $('textarea', b).focus(); },
    'paste-save': el => {
      const t = S.tests.find(x => x.id === el.dataset.id); if (!t) return;
      const i = +el.dataset.i, txt = $('#pasteTa-' + i).value.trim();
      if (!txt) return toast('AI 답변을 붙여넣어 주세요');
      t.qs[i].fb = { text: txt, ts: Date.now(), source: 'claude' };
      save(); markDay(); render(true); toast('✅ 피드백을 저장했어요');
    },
    'fb-clear': async el => {
      if (!(await ask('이 피드백을 삭제할까요?', { ok: '삭제', danger: true }))) return;
      const t = S.tests.find(x => x.id === el.dataset.id); if (!t) return;
      t.qs[+el.dataset.i].fb = null; save(); render(true);
    },
    'fball-save': el => {
      const t = S.tests.find(x => x.id === el.dataset.id); if (!t) return;
      const txt = $('#pasteAll').value.trim();
      if (!txt) return toast('AI 답변을 붙여넣어 주세요');
      t.fbAll = { text: txt, ts: Date.now() };
      // "■ Question 5" 같은 표시를 찾아 문항별 피드백으로 자동 분리
      const re = /(?:^|\n)[#*>\s-]*■?\s*\**\s*Q(?:uestion)?\s*\.?\s*(\d{1,2})\b/g;
      const marks = [...txt.matchAll(re)];
      let n = 0;
      marks.forEach((m, k) => {
        const q = t.qs.find(x => x.num === +m[1] && x.part !== 1);
        if (!q) return;
        const body = txt.slice(m.index, k + 1 < marks.length ? marks[k + 1].index : undefined).replace(/[\s*#-]+$/, '').trim();
        if (body.length > 20) { q.fb = { text: body, ts: Date.now(), source: 'claude' }; n++; }
      });
      save(); markDay(); render(true);
      toast(n ? `✅ ${n}개 문항에 자동으로 나눠 저장했어요` : '✅ 전체 피드백을 저장했어요 (문항 구분을 찾지 못했어요)');
    },
    'fball-clear': async el => {
      if (!(await ask('전체 피드백을 삭제할까요?', { ok: '삭제', danger: true }))) return;
      const t = S.tests.find(x => x.id === el.dataset.id); if (t) { t.fbAll = null; save(); render(true); }
    },
    'chat-url': () => {
      const v = $('#chatUrl').value.trim();
      if (v && !/^https:\/\//.test(v)) return toast('https:// 로 시작하는 채팅방 주소를 넣어 주세요');
      S.chat.url = v; save(); toast(v ? '✅ 채팅방 주소를 저장했어요' : '주소를 지웠어요');
      $('#chatPanel').outerHTML = chatPanel();
    },
    'chat-reset': async () => {
      if (S.chat.count && !(await ask('다음 요청을 새 채팅방에서 시작할까요?', { ok: '새 채팅방' }))) return;
      S.chat = { url: '', count: 0, tokens: 0, started: 0 }; save();
      $('#chatPanel').outerHTML = chatPanel(); toast('다음 요청은 새 채팅방에서 시작해요');
    },
    'fb-all': async el => {
      const t = S.tests.find(x => x.id === el.dataset.id); if (!t) return;
      if (!S.settings.apiKey) { toast('먼저 설정에서 API 키를 입력해 주세요'); return settingsModal(); }
      const idxs = t.qs.map((q, i) => i).filter(i => t.qs[i].part !== 1 && t.qs[i].my.trim());
      if (!idxs.length) return toast('답변이 적힌 문항이 없어요');
      el.disabled = true;
      for (const [n, i] of idxs.entries()) {
        el.innerHTML = `<span class="spinner"></span> ${n + 1}/${idxs.length} 분석 중…`;
        await feedbackOne(t.id, i, $(`[data-act="fb-one"][data-i="${i}"]`));
      }
      el.disabled = false; el.innerHTML = '🤖 답변 전체 피드백 받기';
      toast('✅ 전체 피드백 완료!');
    },
    'del-test': async el => {
      if (!(await ask('이 기록을 삭제할까요? (북마크한 내용은 남아요)', { ok: '삭제', danger: true }))) return;
      S.tests = S.tests.filter(x => x.id !== el.dataset.id); save();
      location.hash = '#feedback'; render();
    },
    'topic-toggle': el => el.closest('.topic').classList.toggle('collapsed'),
    'topic-cat': el => { topicCat = el.dataset.cat; render(true); },
    'flip-toggle': () => { S.settings.flip = !S.settings.flip; save(); render(true); },
    'bm-filter': el => { bmFilter = el.dataset.v; render(true); },
    'bm-memo': () => { bmMemo = !bmMemo; render(true); },
    'bm-export': () => {
      const list = S.bookmarks.filter(b => (bmFilter === 'all' || b.type === bmFilter) && (bmPart === 'all' || String(b.part) === bmPart));
      const txt = list.map(b => `■ [${BM_TYPES[b.type]}] ${b.title}${b.sub ? `\nQ. ${b.sub}` : ''}\n${b.content}\n`).join('\n');
      download(`bookmarks-${todayStr()}.txt`, txt);
    }
  };

  document.addEventListener('click', e => {
    const bm = e.target.closest('[data-bm]');
    if (bm) { e.preventDefault(); toggleBm(bm.dataset.bm); return; }
    const lv = e.target.closest('.lvl-btn');
    if (lv) {
      const wrap = lv.closest('.lvl-wrap');
      $$('.lvl-btn', wrap).forEach(b => b.classList.toggle('active', b === lv));
      $$('[data-lvl-panel]', wrap).forEach(p => p.classList.toggle('hidden', p.dataset.lvlPanel !== lv.dataset.lvl));
      return;
    }
    // 암기 모드: 가려진 영어 누르면 보이기
    const hidden = e.target.closest('.flip .en, .memo-mode .bm-item .c');
    if (hidden) { hidden.classList.toggle('show'); return; }
    // 세그먼트 버튼 (문제은행 상태 / 북마크 필터)
    const seg = e.target.closest('.seg button');
    if (seg) {
      $$('button', seg.parentElement).forEach(b => b.classList.toggle('active', b === seg));
      if (seg.parentElement.id === 'bankStatus') filterBank();
      if (seg.parentElement.id === 'bmDone') { bmDoneF = seg.dataset.v; filterBm(); }
      return;
    }
    const a = e.target.closest('[data-act]');
    if (a && ACT[a.dataset.act]) { e.preventDefault(); ACT[a.dataset.act](a, e); }
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.actChange === 'bm-part') { bmPart = el.value; render(true); }
    // 피드백 형식 선택 (자동 저장)
    if (el.dataset.fbitem) {
      S.settings.fbItems = $$('[data-fbitem]').filter(c => c.checked).map(c => c.dataset.fbitem);
      save(); refreshFbSummary();
    }
    if (el.id === 'fbTarget') { S.settings.fbTarget = el.value; save(); refreshFbSummary(); }
    if (el.id === 'chatMax') { S.settings.chatMax = Math.max(1, +el.value || 15); save(); $('#chatPanel').outerHTML = chatPanel(); }
    if (el.id === 'chatTok') { S.settings.chatTokenMax = Math.max(10, +el.value || 60) * 1000; save(); $('#chatPanel').outerHTML = chatPanel(); }
  });
  // 내 답변 자동 저장
  function refreshFbSummary() {
    const s = $('.fb-opts') && $('.fb-opts').closest('details').querySelector('summary .muted');
    if (s) s.textContent = `— ${selItems().map(x => x.label).join(' · ') || '선택 없음'} · 목표 ${targetLabel()}`;
  }
  document.addEventListener('input', e => {
    if (e.target.id === 'fbExtra') { S.settings.fbExtra = e.target.value; saveSoon(); return; }
    if (e.target.id === 'bankSearch') { filterBank(); return; }
    if (e.target.id === 'bmSearch') { filterBm(); return; }
    if (e.target.id === 'topicSearch') { filterTopics(); return; }
    if (e.target.id === 'opMsg') { $('#opCount').textContent = `${e.target.value.length} / 3000`; return; }
    const ta = e.target.closest('[data-my]');
    if (!ta) return;
    const t = S.tests.find(x => x.id === ta.dataset.test);
    if (!t) return;
    t.qs[+ta.dataset.my].my = ta.value;
    const wc = $('#wc-' + ta.dataset.my); if (wc) wc.textContent = `(${wordCount(ta.value)}단어)`;
    saveSoon();
  });
  $('#openSettings').onclick = () => { setMenu(false); settingsModal(); };
  // 휴대폰 ☰ 메뉴
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    $('#menuBtn').setAttribute('aria-expanded', open);
  }
  $('#menuBtn').onclick = () => setMenu(!document.body.classList.contains('menu-open'));
  $('#scrim').onclick = () => setMenu(false);
  $('#sidebar').addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  window.addEventListener('hashchange', () => setMenu(false));

  /* =========================================================
     구글 로그인 · 기기 간 기록 동기화 (Firebase, 선택 사항)
     - 로그인 안 하면 지금처럼 이 브라우저에만 저장
     - 로그인하는 순간: 이 브라우저 기록 + 계정 기록을 합침
     - 로그인 중: 바뀔 때마다 계정에 저장, 탭으로 돌아오면 최신 기록을 받아옴
     - 보안: Firestore 규칙으로 각자 users/{내 uid} 문서만 읽고 쓸 수 있음
     ========================================================= */
  const FB_CONFIG = {
    apiKey: 'AIzaSyChlTg1LqehBGKuP5zeI7NEQK0H51YHS8E',
    authDomain: 'speaking-runner.firebaseapp.com',
    projectId: 'speaking-runner',
    storageBucket: 'speaking-runner.firebasestorage.app',
    messagingSenderId: '305134314797',
    appId: '1:305134314797:web:7d9406b28ee469a4779fa4'
  };
  const FB_VER = '10.12.2';
  // 이 기기에만 두는 설정 (계정에 올리지 않음)
  const LOCAL_ONLY = ['apiKey', 'voice', 'voiceV2', 'volume'];
  var CLOUD = { fb: null, user: null, lastSync: 0, busy: false, timer: 0, status: '' };

  async function fbLoad() {
    if (CLOUD.fb) return CLOUD.fb;
    const base = `https://www.gstatic.com/firebasejs/${FB_VER}/`;
    const [A, U, F] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]);
    const app = A.initializeApp(FB_CONFIG);
    CLOUD.fb = { U, F, auth: U.getAuth(app), db: F.getFirestore(app) };
    return CLOUD.fb;
  }
  const cloudPart = () => {
    const settings = { ...S.settings }; LOCAL_ONLY.forEach(k => delete settings[k]);
    return { custom: S.custom, bookmarks: S.bookmarks, tests: S.tests, days: S.days, marks: S.marks, settings, chat: S.chat };
  };
  const keepLocal = () => Object.fromEntries(LOCAL_ONLY.map(k => [k, S.settings[k]]));
  // 두 기록 합치기 (둘 중 하나에만 있는 것도 모두 살림)
  function mergeState(a, b) {
    const byKey = (x, y, k) => { const m = new Map(); [...(y || []), ...(x || [])].forEach(i => m.set(i[k], i)); return [...m.values()]; };
    const marks = { ...(b.marks || {}) };
    Object.entries(a.marks || {}).forEach(([id, v]) => { if (marks[id] !== 'done') marks[id] = v; }); // '외움'을 우선
    return {
      custom: byKey(a.custom, b.custom, 'id'),
      bookmarks: byKey(a.bookmarks, b.bookmarks, 'key').sort((x, y) => (y.ts || 0) - (x.ts || 0)),
      tests: byKey(a.tests, b.tests, 'id').sort((x, y) => (y.date || 0) - (x.date || 0)).slice(0, 40),
      days: [...new Set([...(a.days || []), ...(b.days || [])])].sort(),
      marks,
      settings: { ...(b.settings || {}), ...(a.settings || {}) },
      chat: a.chat || b.chat
    };
  }
  function adopt(part) {
    const loc = keepLocal(), d = defaults();
    S = { ...d, ...part, settings: { ...d.settings, ...(part.settings || {}), ...loc }, chat: { ...d.chat, ...(part.chat || {}) } };
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
  }
  const userRef = () => CLOUD.fb.F.doc(CLOUD.fb.db, 'users', CLOUD.user.uid);
  async function cloudGet() {
    const snap = await CLOUD.fb.F.getDoc(userRef());
    if (!snap.exists()) return null;
    const d = snap.data();
    try { return { updated: d.updated || 0, part: JSON.parse(d.state || '{}') }; } catch (e) { return null; }
  }
  async function cloudPut() {
    const now = Date.now();
    await CLOUD.fb.F.setDoc(userRef(), { state: JSON.stringify(cloudPart()), updated: now, email: CLOUD.user.email || '', name: CLOUD.user.displayName || '' });
    CLOUD.lastSync = now;
    setSync('ok');
  }
  // 로그인 직후 1번: 합치기
  async function cloudLink() {
    setSync('busy');
    const r = await cloudGet();
    const hasLocal = S.bookmarks.length || S.tests.length || S.days.length || Object.keys(S.marks).length || S.custom.length;
    if (r) adopt(hasLocal ? mergeState(cloudPart(), r.part) : r.part);
    await cloudPut();
    render(true);
  }
  // 탭으로 돌아왔을 때: 다른 기기에서 바뀐 게 있으면 받아옴
  async function cloudPull() {
    if (!CLOUD.user || CLOUD.busy) return;
    try {
      const r = await cloudGet();
      if (r && r.updated > CLOUD.lastSync) {
        adopt(r.part); CLOUD.lastSync = r.updated; setSync('ok');
        if (!R) render(true); // 실전 시험 중이면 화면을 건드리지 않음
      }
    } catch (e) { setSync('err'); }
  }
  // 저장할 때마다(1.5초 모아서) 계정에 올림. 그 사이 다른 기기에서 바뀌었으면 먼저 합침
  function cloudSoon() {
    if (!CLOUD || !CLOUD.user) return;
    clearTimeout(CLOUD.timer);
    CLOUD.timer = setTimeout(async () => {
      if (CLOUD.busy) return cloudSoon();
      CLOUD.busy = true; setSync('busy');
      try {
        const r = await cloudGet();
        if (r && r.updated > CLOUD.lastSync) adopt(mergeState(cloudPart(), r.part));
        await cloudPut();
      } catch (e) { setSync('err'); }
      CLOUD.busy = false;
    }, 1500);
  }
  function setSync(s) { CLOUD.status = s; renderAcct(); }

  // 네이버·카카오톡·인스타 등 앱 안 브라우저는 구글이 로그인을 막음 → 외부 브라우저 안내
  const IN_APP = /NAVER|KAKAOTALK|Instagram|FBAN|FBAV|Line\/|DaumApps|everytimeApp|Whale\/.*inapp|; wv\)/i.test(navigator.userAgent);
  function inAppGuide() {
    const url = location.origin + location.pathname;
    const android = /Android/i.test(navigator.userAgent);
    const kakao = /KAKAOTALK/i.test(navigator.userAgent);
    openModal(`
      <h2>🌐 다른 브라우저로 열어 주세요 <span class="spacer"></span><button class="btn btn-ghost" data-act="close-modal">✕</button></h2>
      <p>지금은 <b>네이버·카카오톡 같은 앱 안의 브라우저</b>로 열려 있어요. 이런 곳에서는 <b>구글이 보안상 로그인을 막아서</b> 로그인할 수 없어요.</p>
      <ol class="tip-list">
        <li>화면 오른쪽 위나 아래의 <b>⋮ 또는 ⋯ 메뉴</b>를 누르세요</li>
        <li><b>"다른 브라우저로 열기"</b> (또는 "Chrome으로 열기", "Safari로 열기")를 누르세요</li>
        <li>열린 크롬·사파리에서 다시 <b>구글로 로그인</b>을 누르세요</li>
      </ol>
      <div class="row" style="margin-top:14px">
        ${android ? `<a class="btn btn-primary" href="intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end">크롬으로 바로 열기</a>` : ''}
        ${kakao ? `<a class="btn btn-primary" href="kakaotalk://web/openExternal?url=${encodeURIComponent(url)}">외부 브라우저로 열기</a>` : ''}
        <button class="btn" id="copyUrl">🔗 주소 복사하기</button>
      </div>
      <p class="small muted" style="margin-top:10px">로그인하지 않아도 사이트는 그대로 쓸 수 있어요. 기록은 이 브라우저에만 저장돼요.</p>`);
    $('#copyUrl').onclick = () => copyText(url).then(ok => toast(ok ? '주소를 복사했어요. 크롬·사파리 주소창에 붙여넣으세요' : url));
  }

  async function login() {
    if (IN_APP) return inAppGuide();
    CLOUD.justClicked = true;
    try {
      setSync('busy');
      if (!CLOUD.authReady) await authInit(); // 처음 누를 때 Firebase를 불러옴
      const fb = CLOUD.fb;
      const provider = new fb.U.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await fb.U.signInWithPopup(fb.auth, provider);
      // 이후 처리는 onAuthStateChanged에서
    } catch (e) {
      setSync('');
      const c = e && e.code || '';
      if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return;
      if (c === 'auth/popup-blocked') return toast('팝업이 막혔어요. 주소창 오른쪽의 팝업 차단 아이콘에서 허용해 주세요');
      if (c === 'auth/unauthorized-domain') return toast('로그인 설정이 아직 안 끝났어요 (승인된 도메인)');
      if (/disallowed|web-storage|operation-not-supported/.test(c)) return inAppGuide();
      toast(CLOUD.fb ? '로그인하지 못했어요. 잠시 뒤 다시 시도해 주세요' : '로그인 기능을 불러오지 못했어요. 인터넷 연결을 확인해 주세요');
      console.error(e);
    }
  }
  async function logout() {
    if (!(await ask('로그아웃할까요?\n기록은 계정에 안전하게 저장돼 있고, 이 브라우저에서는 지워져요. 다시 로그인하면 돌아와요.', { ok: '로그아웃' }))) return;
    clearTimeout(CLOUD.timer);
    try { if (CLOUD.user) await cloudPut(); } catch (e) { }
    await CLOUD.fb.U.signOut(CLOUD.fb.auth);
  }
  async function deleteAccount() {
    if (!(await ask('계정과 계정에 저장된 모든 기록(북마크·풀이 기록·피드백)을 영구 삭제할까요? 되돌릴 수 없어요.', { ok: '영구 삭제', danger: true }))) return;
    try {
      await CLOUD.fb.F.deleteDoc(userRef());
      await CLOUD.fb.U.deleteUser(CLOUD.user);
      toast('계정과 기록을 모두 삭제했어요');
    } catch (e) {
      if (e && e.code === 'auth/requires-recent-login') { toast('보안을 위해 로그아웃 후 다시 로그인한 뒤 삭제해 주세요'); return; }
      toast('삭제하지 못했어요. 잠시 뒤 다시 시도해 주세요');
    }
  }

  function renderAcct() {
    const box = $('#acct'); if (!box) return;
    const u = CLOUD.user;
    if (!u) {
      box.innerHTML = `<button class="acct-login" id="acctLogin" ${CLOUD.status === 'busy' ? 'disabled' : ''}>
        <span class="g">G</span><span><b>${CLOUD.status === 'busy' ? '로그인 중…' : '구글로 로그인'}</b><small>기기를 바꿔도 기록이 이어져요</small></span></button>
        <a class="acct-privacy" href="#privacy">개인정보 처리 안내</a>`;
      $('#acctLogin').onclick = () => login();
      return;
    }
    const st = { ok: '☁️ 동기화됨', busy: '⏳ 저장 중…', err: '⚠️ 동기화 실패 · 다시 시도해요' }[CLOUD.status] || '';
    box.innerHTML = `<div class="acct-user">
        ${u.photoURL ? `<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : '<span class="g">👤</span>'}
        <span><b>${esc(u.displayName || u.email || '로그인됨')}</b><small>${st}</small></span></div>
      <div class="acct-links"><button id="acctOut">로그아웃</button> · <a href="#privacy">개인정보</a></div>`;
    $('#acctOut').onclick = logout;
  }

  async function authInit() {
    if (CLOUD.authReady) return;
    const fb = await fbLoad();
    CLOUD.authReady = true;
    fb.U.onAuthStateChanged(fb.auth, async user => {
      const was = CLOUD.user;
      CLOUD.user = user;
      if (user) {
        try { localStorage.setItem('sr_login', '1'); } catch (e) { }
        try {
          if (!was) {
            await cloudLink();
            track('login', { method: 'google' });
            if (CLOUD.justClicked) toast(`👋 ${user.displayName || ''}님, 이제 어느 기기에서든 기록이 이어져요`);
          }
        } catch (e) { setSync('err'); console.error(e); }
      } else {
        try { localStorage.removeItem('sr_login'); } catch (e) { }
        if (was) { adopt({}); render(); toast('로그아웃했어요'); }
      }
      renderAcct();
    });
  }
  // 전에 로그인했던 브라우저면 Firebase를 바로 불러와 로그인 상태를 복원 (아니면 버튼 누를 때만 불러옴)
  renderAcct();
  if ((() => { try { return localStorage.getItem('sr_login') === '1'; } catch (e) { return false; } })()) authInit().catch(() => setSync('err'));
  // 로그인 안 한 사람도 몇 초 뒤 미리 불러 둠 → 버튼을 누르면 바로 팝업이 떠서 사파리 팝업 차단을 피함
  else if (!IN_APP) setTimeout(() => authInit().catch(() => { }), 4000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') cloudPull(); });

  // 개인정보 처리 안내
  VIEWS.privacy = () => `
    <div class="page-head"><h1>🔒 개인정보 처리 안내</h1><p>스피킹 러너는 로그인 없이도 쓸 수 있고, 구글 로그인은 <b>기기 간 기록 동기화</b>를 원하는 분만 선택해서 사용해요.</p></div>
    <div class="card privacy">
      <h3>1. 수집하는 정보</h3>
      <ul><li><b>구글로 로그인한 경우에만:</b> 구글 계정의 이름·이메일 주소·프로필 사진 주소, 구글이 발급하는 계정 식별 번호</li>
      <li>학습 기록: 북마크, 😵/✅ 표시, 풀이 기록과 직접 적은 답변, 붙여넣은 AI 피드백, 공부한 날짜</li>
      <li><b>수집하지 않는 것:</b> 녹음 파일(이 기기에만 잠깐 남고 어디에도 저장·전송되지 않아요), 설정에 넣은 AI API 키</li></ul>
      <h3>2. 이용 목적</h3>
      <ul><li>같은 계정으로 로그인한 여러 기기에서 학습 기록을 이어서 보여 주기 위해서만 사용해요. 광고·마케팅에 쓰거나 다른 곳에 제공하지 않아요.</li></ul>
      <h3>3. 보관 장소와 기간</h3>
      <ul><li>Google Firebase(서울 리전)에 저장되며, 본인만 자기 기록을 읽고 쓸 수 있도록 잠겨 있어요.</li>
      <li>사용자가 <b>계정 삭제</b>를 할 때까지 보관하고, 삭제하면 즉시 영구 삭제돼요.</li></ul>
      <h3>4. 삭제 방법</h3>
      <ul><li>로그인한 상태에서 <b>⚙️ 설정 · 백업 → 계정 삭제</b>를 누르면 계정과 모든 기록이 바로 지워져요.</li>
      <li>직접 삭제가 어려우면 <a href="#opinion">📮 의견 보내기</a>로 요청해 주세요.</li></ul>
      <h3>5. 방문 통계</h3>
      <ul><li>사이트 개선을 위해 Google 애널리틱스로 방문 수·기기 종류 같은 <b>익명 통계</b>를 모아요. 이름·이메일 같은 개인 정보는 통계에 포함되지 않아요.</li></ul>
      <h3>6. 로그인하지 않는 경우</h3>
      <ul><li>모든 기록은 지금 쓰는 브라우저 안에만 저장되고, 어디로도 전송되지 않아요.</li></ul>
      <p class="small muted" style="margin-top:16px">시행일: 2026년 9월 28일</p>
    </div>`;
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) closeModal(); });

  render();
})();
