/* ===========================
   GIS Editor Slide UI
   app.js
   =========================== */

/* ---------- Aspect Ratios ---------- */
const RATIOS = {
  '16:9': '16/9',
  '16:10': '16/10',
  '4:3': '4/3',
  '3:2': '3/2',
  '1:1': '1/1',
};

/* ---------- Panel Data ---------- */
const PANELS = {
  node: {
    dotIndex: 0,
    badge: { label: 'NODE_ID', value: '' },
    title: '<strong>NODE</strong><br>속성 편집',
    subtitle: '교차로 (NODE)',
    desc: '교차로 노드의 기본 속성 정보를\n확인하고 수정할 수 있습니다.',
    tag: 'NODE_EDIT · 피처 속성',
    dialogTitle: 'NODE_EDIT - 피처 속성',
    fields: [
      { label: 'NODE_ID', value: '9990000001', readonly: true },
      { label: 'NODE_KNM', value: '', placeholder: '노드명 입력' },
      { label: 'NODE_TYPE', value: '', type: 'select', options: [{ v: '1', t: '일반교차로' }, { v: '2', t: '회전교차로' }] },
    ]
  },
  station: {
    dotIndex: 1,
    badge: { label: 'STN_ID', value: '' },
    title: '<strong>STATION</strong><br>속성 편집',
    subtitle: '정류장 (STATION)',
    desc: '정류소의 기본 속성 정보를\n확인하고 수정할 수 있습니다.',
    tag: 'STATION_EDIT · 피처 속성',
    dialogTitle: 'STATION_EDIT - 피처 속성',
    fields: [
      { label: 'STATION_ID', value: '360000001', readonly: true },
      { label: 'MOBILE_NO', value: '360001', placeholder: '정류소 번호 입력' },
      { label: 'STATION_KNM', value: '', placeholder: '정류소명 입력' },
      { label: 'STATION_TYPE', value: '', type: 'select', options: [{ v: '1', t: '일반버스' }, { v: '2', t: '마을버스' }] },
      { label: 'CENTER_YN', value: '', type: 'select', options: [{ v: 'Y', t: 'Y' }, { v: 'N', t: 'N' }] },
    ]
  },
  link: {
    dotIndex: 2,
    badge: { label: 'LINK_ID', value: '' },
    title: '<strong>LINK</strong><br>속성 편집',
    subtitle: '링크 (LINK)',
    desc: '링크의 기본 속성 정보를\n확인하고 수정할 수 있습니다.',
    tag: 'LINK_EDIT · 피처 속성',
    dialogTitle: 'LINK_EDIT - 피처 속성',
    fields: [
      { label: 'LINK_ID', value: '9990000001', readonly: true },
      { label: 'F_NODE', value: '9090807', readonly: true },
      { label: 'T_NODE', value: '9090812', readonly: true, isSwapTarget: true },
    ]
  }
};

/* --- runtime state (값 변경 유지) --- */
const STATE = {};
Object.keys(PANELS).forEach(k => {
  STATE[k] = PANELS[k].fields.map(f => f.value);
});

/* ---------- Build single field row ---------- */
function buildField(f, panelKey, idx) {
  const val = STATE[panelKey][idx];
  const isActive = f.isActive;
  const isReadonly = f.readonly;
  const showCheck = isActive;

  const activeClass = isActive ? ' active-field' : '';
  const readonlyClass = isReadonly ? ' readonly-field' : '';

  let inputHtml = '';
  let swapHtml = '';

  // Select Box 렌더링
  if (f.type === 'select') {
    const opts = f.options.map(o => `<option value="${o.v}" ${val === o.v ? 'selected' : ''}>${o.t}</option>`).join('');
    inputHtml = `<select id="input-${panelKey}-${idx}" data-panel="${panelKey}" data-idx="${idx}">${opts}</select>`;
  } else {
    // Input 렌더링
    inputHtml = `
      <input
        type="text"
        id="input-${panelKey}-${idx}"
        value="${escHtml(val)}"
        placeholder="${f.placeholder || ''}"
        data-panel="${panelKey}"
        data-idx="${idx}"
        ${isReadonly ? 'readonly' : ''}
      />
    `;
  }

  // 지우기 버튼 (읽기 전용이거나 Select 박스면 숨김)
  const clearBtnHtml = (isReadonly || f.type === 'select')
    ? ''
    : `<button class="clear-btn" data-panel="${panelKey}" data-idx="${idx}" title="지우기">×</button>`;

  // 변환(Swap) 버튼 (T_NODE 필드 위에 렌더링)
  if (f.isSwapTarget) {
    swapHtml = `
      <div class="swap-row">
        <button class="swap-btn" id="swap-nodes" title="F_NODE와 T_NODE 교환">⇅ 변환</button>
      </div>
    `;
  }

  return `
    ${swapHtml}
    <div class="field-row">
      <span class="field-label">${f.label}</span>
      <div class="input-wrap${activeClass}${readonlyClass}">
        ${inputHtml}
        ${clearBtnHtml}
      </div>
      <div class="check-col">
        ${showCheck ? '<span class="check-mark">✓</span>' : ''}
      </div>
    </div>`;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ---------- Status ---------- */
function buildStatus(panelKey) {
  const fields = PANELS[panelKey].fields;
  const vals = STATE[panelKey];
  const filled = vals.filter(v => v !== '').length;
  const empty = vals.filter(v => v === '').length;

  return `
    <div class="status-list">
      <div class="status-item"><span class="status-dot filled"></span>${filled}개 필드 입력됨</div>
      <div class="status-item"><span class="status-dot empty"></span>${empty}개 필드 미입력</div>
    </div>`;
}

/* ---------- Render Panel ---------- */
function renderPanel(key) {
  const data = PANELS[key];

  /* left col */
  document.getElementById('lc-subtitle').textContent = data.subtitle;
  document.getElementById('lc-title').innerHTML = data.title;
  document.getElementById('lc-desc').innerHTML = data.desc.replace(/\n/g, '<br>');
  document.getElementById('lc-badge-label').textContent = data.badge.label;
  document.getElementById('lc-badge-value').textContent = data.badge.value;

  /* header tag */
  document.getElementById('header-tag').textContent = data.tag;
  document.getElementById('dialog-title').textContent = data.dialogTitle;

  /* fields */
  const grid = document.getElementById('fields-grid');
  grid.innerHTML = data.fields.map((f, i) => buildField(f, key, i)).join('');

  /* bind input & select events */
  grid.querySelectorAll('input[data-panel], select[data-panel]').forEach(el => {
    // Select는 change, Input은 input 이벤트로 처리
    const eventType = el.tagName === 'SELECT' ? 'change' : 'input';

    el.addEventListener(eventType, e => {
      STATE[e.target.dataset.panel][+e.target.dataset.idx] = e.target.value;
      refreshStatus(key);
    });

    el.addEventListener('focus', e => {
      // 읽기 전용이나 셀렉트박스는 포커스 효과 제외
      if (!e.target.readOnly && e.target.tagName !== 'SELECT') {
        e.target.closest('.input-wrap').classList.add('active-field');
      }
    });

    el.addEventListener('blur', e => {
      if (!e.target.closest('.field-row').querySelector('.check-mark')) {
        e.target.closest('.input-wrap').classList.remove('active-field');
      }
    });
  });

  /* bind clear buttons */
  grid.querySelectorAll('.clear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.panel;
      const i = +btn.dataset.idx;
      STATE[p][i] = '';
      document.getElementById(`input-${p}-${i}`).value = '';
      refreshStatus(p);
    });
  });

  /* bind swap button (Link 패널 전용) */
  if (key === 'link') {
    const swapBtn = document.getElementById('swap-nodes');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        // F_NODE (index 1), T_NODE (index 2)
        const temp = STATE['link'][1];
        STATE['link'][1] = STATE['link'][2];
        STATE['link'][2] = temp;
        // 값 바뀐 후 화면 다시 렌더링
        renderPanel('link');
      });
    }
  }

  /* status & dots */
  document.getElementById('status-slot').innerHTML = buildStatus(key);
  document.querySelectorAll('.ft-dots span').forEach((dot, i) => {
    dot.classList.toggle('active', i === data.dotIndex);
  });
}

function refreshStatus(key) {
  document.getElementById('status-slot').innerHTML = buildStatus(key);
}

/* ---------- Tab Switch ---------- */
function switchTab(key) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === key);
  });
  renderPanel(key);
}

/* ---------- Aspect Ratio ---------- */
function applyRatio(label) {
  const val = RATIOS[label] || '16/9';
  const slide = document.querySelector('.slide-wrap');
  slide.style.aspectRatio = val;
  document.documentElement.style.setProperty('--slide-aspect', val);
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  const sel = document.getElementById('ratio-select');
  sel.addEventListener('change', () => applyRatio(sel.value));

  switchTab('node');
  initDialog();
});

/* =====================================================
   Draggable + resizable dialog inside .right-col
   ===================================================== */
function initDialog() {
  const dialog = document.querySelector('.qgis-dialog');
  const titlebar = dialog.querySelector('.dialog-titlebar');
  const container = document.querySelector('.right-col');

  let placed = false;
  function placeInitial() {
    if (placed) return;
    const cr = container.getBoundingClientRect();
    if (cr.width === 0) return;
    const initW = Math.min(cr.width * 0.72, 520);
    const initH = Math.min(cr.height * 0.84, 440);
    const initL = (cr.width - initW) / 2;
    const initT = (cr.height - initH) / 2;

    dialog.style.width = initW + 'px';
    dialog.style.height = initH + 'px';
    dialog.style.left = initL + 'px';
    dialog.style.top = initT + 'px';
    placed = true;
  }
  placeInitial();
  new ResizeObserver(() => { placeInitial(); }).observe(container);

  let dragActive = false;
  let resizeActive = false;
  let resizeDir = '';

  let startX = 0, startY = 0;
  let startLeft = 0, startTop = 0;
  let startW = 0, startH = 0;

  titlebar.addEventListener('mousedown', e => {
    if (e.target.closest('.dialog-win-btns')) return;
    dragActive = true;

    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseFloat(getComputedStyle(dialog).left) || 0;
    startTop = parseFloat(getComputedStyle(dialog).top) || 0;

    dialog.classList.add('dragging');
    e.preventDefault();
  });

  const resizers = dialog.querySelectorAll('.resizer');
  resizers.forEach(resizer => {
    resizer.addEventListener('mousedown', e => {
      resizeActive = true;
      resizeDir = e.target.dataset.dir;

      startX = e.clientX;
      startY = e.clientY;
      startW = dialog.offsetWidth;
      startH = dialog.offsetHeight;

      e.preventDefault();
    });
  });

  document.addEventListener('mousemove', e => {
    if (!dragActive && !resizeActive) return;

    const cr = container.getBoundingClientRect();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (dragActive) {
      let newL = startLeft + dx;
      let newT = startTop + dy;
      const maxL = cr.width - dialog.offsetWidth;
      const maxT = cr.height - dialog.offsetHeight;
      newL = Math.max(0, Math.min(newL, maxL));
      newT = Math.max(0, Math.min(newT, maxT));

      dialog.style.left = newL + 'px';
      dialog.style.top = newT + 'px';
    }

    if (resizeActive) {
      const currentLeft = parseFloat(getComputedStyle(dialog).left) || 0;
      const currentTop = parseFloat(getComputedStyle(dialog).top) || 0;

      if (resizeDir === 'r' || resizeDir === 'br') {
        let newW = startW + dx;
        const maxW = cr.width - currentLeft;
        newW = Math.min(newW, maxW);
        dialog.style.width = newW + 'px';
      }

      if (resizeDir === 'b' || resizeDir === 'br') {
        let newH = startH + dy;
        const maxH = cr.height - currentTop;
        newH = Math.min(newH, maxH);
        dialog.style.height = newH + 'px';
      }
    }
  });

  document.addEventListener('mouseup', () => {
    dragActive = false;
    resizeActive = false;
    dialog.classList.remove('dragging');
  });

  new ResizeObserver(() => {
    const cr = container.getBoundingClientRect();
    const curL = parseFloat(dialog.style.left) || 0;
    const curT = parseFloat(dialog.style.top) || 0;
    const maxL = cr.width - dialog.offsetWidth;
    const maxT = cr.height - dialog.offsetHeight;
    if (curL > maxL) dialog.style.left = Math.max(0, maxL) + 'px';
    if (curT > maxT) dialog.style.top = Math.max(0, maxT) + 'px';
  }).observe(dialog);
}