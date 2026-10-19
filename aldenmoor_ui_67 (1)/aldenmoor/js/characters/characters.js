/**
 * Character selection page: list slots, create (with appearance customization)
 * and delete heroes, then hand the chosen hero to the game page.
 */
(() => {
  'use strict';

  const user = Store.Session.getUser();
  if (!user) {
    location.replace('login.html');
    return;
  }

  const MAX = Store.Characters.MAX_SLOTS;
  const FIRST_JOBS = Object.keys(JOBS).filter((id) => JOBS[id].tier === 1);

  const slotsEl = $('#slots');
  const panel = $('#createPanel');
  const form = $('#createForm');
  const nameInput = $('#heroName');
  const classesEl = $('#classes');
  const preview = $('#preview');
  const msg = $('#createMsg');

  let selectedJob = FIRST_JOBS[0];
  let look = { ...APPEARANCE.defaults };
  let pendingDelete = null;
  let deleteTimer = 0;
  let previewFrame = 0;

  /* ---------- small DOM helpers ---------- */
  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function button(className, text, onClick) {
    const b = el('button', className, text);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  /* ---------- avatar painting ---------- */
  function paintAvatar(canvas, jobId, lk, t, scale, fx, fy, face = Math.PI / 2) {
    const g = canvas.getContext('2d');
    const j = JOBS[jobId] || JOBS.waif;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(scale, 0, 0, scale, 0, 0);
    drawAvatar(
      g,
      fx,
      fy,
      face, // facing angle: front by default
      {
        col: j.col,
        hair: j.hair,
        tier: j.tier,
        job: jobId,
        weapon: j.weapon,
        moving: false,
        walk: 0,
        swing: 0,
        swingDur: 0.2,
        flash: 0,
        look: lk,
      },
      t,
    );
  }

  /* ---------- slots ---------- */
  const PIN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

  function renderSlots() {
    slotsEl.replaceChildren();
    const list = Store.Characters.list(user);
    for (let i = 0; i < MAX; i++) slotsEl.appendChild(list[i] ? filledSlot(list[i], i) : emptySlot(i));
    $('#slotCount').textContent = list.length + ' / ' + MAX;
  }

  function filledSlot(c, i) {
    const job = JOBS[c.job] || JOBS.waif;
    const card = el('article', 'hero');
    card.style.setProperty('--jc', job.col);

    const stage = el('div', 'stage');
    const avatar = el('canvas', 'avatar');
    avatar.width = 160;
    avatar.height = 168;
    avatar.setAttribute('aria-hidden', 'true');
    paintAvatar(avatar, c.job, APPEARANCE.sanitize(c.look), 0, 2.4, 33, 62);
    stage.append(el('span', 'slot-no', 'Slot ' + (i + 1)), avatar);

    const chips = el('div', 'chips');
    chips.append(el('span', 'chip lvl', 'Lv ' + (Number.isFinite(c.lvl) ? c.lvl : 1)), el('span', 'chip job', job.name));
    const loc = el('p', 'loc');
    loc.insertAdjacentHTML('beforeend', PIN);
    loc.append((MAPDEF[c.map] || MAPDEF.village).name);
    const info = el('div', 'hero-info');
    info.append(el('h3', '', c.name), chips, loc);

    const confirming = pendingDelete === c.id;
    const actions = el('div', 'actions');
    actions.append(
      button('primary', 'Play', () => {
        Store.Session.setActive(c.id);
        location.href = 'game.html';
      }),
      button(confirming ? 'ghost danger' : 'ghost', confirming ? 'Confirm delete?' : 'Delete', () => {
        clearTimeout(deleteTimer);
        if (confirming) {
          Store.Characters.remove(user, c.id);
          pendingDelete = null;
        } else {
          pendingDelete = c.id;
          deleteTimer = setTimeout(() => {
            pendingDelete = null;
            renderSlots();
          }, 4000);
        }
        renderSlots();
      }),
    );
    card.append(stage, info, actions);
    return card;
  }

  function emptySlot(i) {
    const card = el('article', 'hero empty');
    const b = button('new', '', openCreate);
    b.append(el('span', 'plus', '+'), el('span', '', 'New character'), el('small', '', 'Slot ' + (i + 1) + ' is empty'));
    card.append(b);
    return card;
  }

  /* ---------- appearance choices ---------- */
  const CHOICES = {
    gender: {
      box: $('#genders'),
      cls: 'seg-btn',
      items: APPEARANCE.genders.map((g) => ({ value: g.id, label: g.name })),
    },
    hairStyle: {
      box: $('#hairStyles'),
      cls: 'seg-btn',
      items: [], // depends on gender, see rebuildHairStyles()
    },
    hairColor: {
      box: $('#hairColors'),
      cls: 'swatch',
      items: APPEARANCE.hairColors.map((c) => ({ value: c.v, label: c.n, color: c.v })),
    },
    skinColor: {
      box: $('#skinColors'),
      cls: 'swatch',
      items: APPEARANCE.skinColors.map((c) => ({ value: c.v, label: c.n, color: c.v })),
    },
    outfitColor: {
      box: $('#outfitColors'),
      cls: 'swatch',
      items: APPEARANCE.outfitColors.map((c) => ({ value: c.v, label: c.n, color: c.v || JOBS[selectedJob].col })),
    },
  };

  function makeChoiceButton(key, c, it) {
    const b = button(c.cls, it.color ? '' : it.label, () => {
      look[key] = it.value;
      if (key === 'gender') rebuildHairStyles();
      syncChoices();
    });
    b.dataset.value = it.value;
    if (it.color) {
      b.style.background = it.color;
      b.title = it.label;
      b.setAttribute('aria-label', it.label);
    }
    return b;
  }
  function buildChoices() {
    rebuildHairStyles();
    for (const [key, c] of Object.entries(CHOICES)) {
      if (key === 'hairStyle') continue;
      for (const it of c.items) c.box.appendChild(makeChoiceButton(key, c, it));
    }
  }
  // Male and female have different hairstyle lists.
  function rebuildHairStyles() {
    const c = CHOICES.hairStyle;
    c.items = APPEARANCE.stylesFor(look.gender).map((s) => ({ value: s.id, label: s.name }));
    if (!c.items.some((i) => i.value === look.hairStyle)) look.hairStyle = c.items[0].value;
    c.box.replaceChildren(...c.items.map((it) => makeChoiceButton('hairStyle', c, it)));
  }
  // The "job default" outfit swatch shows the selected job's color.
  function syncOutfitDefault() {
    const first = CHOICES.outfitColor.box.firstElementChild;
    if (first) first.style.background = JOBS[selectedJob].col;
  }
  function syncChoices() {
    for (const [key, c] of Object.entries(CHOICES)) {
      for (const b of c.box.children) b.setAttribute('aria-pressed', String(b.dataset.value === look[key]));
    }
  }
  function randomize() {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const gender = pick(APPEARANCE.genders).id;
    look = {
      gender,
      hairStyle: pick(APPEARANCE.stylesFor(gender)).id,
      hairColor: pick(APPEARANCE.hairColors).v,
      skinColor: pick(APPEARANCE.skinColors).v,
      outfitColor: pick(APPEARANCE.outfitColors).v,
    };
    rebuildHairStyles();
    syncChoices();
  }

  /* ---------- job cards ---------- */
  function buildClassCards() {
    for (const id of FIRST_JOBS) {
      const j = JOBS[id];
      const b = el('button', 'cls');
      b.type = 'button';
      b.dataset.job = id;
      b.style.setProperty('--jc', j.col);
      const next = el('span', '', '2nd job: ');
      next.append(el('b', 'next', JOBS[j.next].name));
      b.append(el('em', '', j.tag), el('b', '', j.name), el('span', '', j.d), next);
      b.addEventListener('click', () => selectJob(id));
      classesEl.appendChild(b);
    }
    selectJob(selectedJob);
  }
  function selectJob(id) {
    selectedJob = id;
    syncOutfitDefault();
    for (const b of classesEl.children) b.setAttribute('aria-pressed', String(b.dataset.job === id));
  }

  /* ---------- create panel ---------- */
  /* ---------- rotate the preview (buttons, drag, arrow keys) ---------- */
  const VIEWS = [
    { name: 'Front', face: Math.PI / 2 },
    { name: 'Right', face: 0 },
    { name: 'Back', face: -Math.PI / 2 },
    { name: 'Left', face: Math.PI },
  ];
  let viewIdx = 0;
  const viewLabel = $('#viewLabel');
  function setView(i) {
    viewIdx = (i + VIEWS.length) % VIEWS.length;
    if (viewLabel) viewLabel.textContent = VIEWS[viewIdx].name;
  }
  $('#rotLeft').addEventListener('click', () => setView(viewIdx - 1));
  $('#rotRight').addEventListener('click', () => setView(viewIdx + 1));
  $('#rotFront').addEventListener('click', () => setView(0));
  preview.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') setView(viewIdx - 1);
    else if (e.key === 'ArrowRight') setView(viewIdx + 1);
    else return;
    e.preventDefault();
  });
  let dragX = null;
  preview.addEventListener('pointerdown', (e) => {
    dragX = e.clientX;
    preview.setPointerCapture(e.pointerId);
    preview.focus();
  });
  preview.addEventListener('pointermove', (e) => {
    if (dragX === null) return;
    const dx = e.clientX - dragX;
    if (Math.abs(dx) >= 36) {
      setView(viewIdx + (dx > 0 ? -1 : 1)); // drag right = turn the character toward the right
      dragX = e.clientX;
    }
  });
  const endDrag = () => (dragX = null);
  preview.addEventListener('pointerup', endDrag);
  preview.addEventListener('pointercancel', endDrag);

  function previewLoop() {
    if (panel.hidden) {
      previewFrame = 0;
      return;
    }
    paintAvatar(preview, selectedJob, look, performance.now() / 1000, 2.5, 34, 78, VIEWS[viewIdx].face);
    previewFrame = requestAnimationFrame(previewLoop);
  }

  function openCreate() {
    msg.hidden = true;
    nameInput.value = '';
    look = { ...APPEARANCE.defaults };
    rebuildHairStyles();
    syncChoices();
    setView(0);
    panel.hidden = false;
    document.body.classList.add('modal-open');
    if (!previewFrame) previewFrame = requestAnimationFrame(previewLoop);
    nameInput.focus();
  }
  function closeCreate() {
    panel.hidden = true;
    document.body.classList.remove('modal-open');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim().replace(/\s+/g, ' ');
    if (!/^[\p{L}\p{N} _-]{2,12}$/u.test(name)) {
      msg.textContent = 'Name must be 2-12 characters (letters, numbers, spaces, _ or -).';
      msg.hidden = false;
      return;
    }
    const res = Store.Characters.create(user, { name, job: selectedJob, look: APPEARANCE.sanitize(look) });
    if (!res.ok) {
      msg.textContent = res.error;
      msg.hidden = false;
      return;
    }
    closeCreate();
    renderSlots();
  });
  $('#cancelCreate').addEventListener('click', closeCreate);
  $('#closeCreate').addEventListener('click', closeCreate);
  panel.addEventListener('pointerdown', (e) => {
    if (e.target === panel) closeCreate();
  });
  $('#randomize').addEventListener('click', randomize);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCreate();
  });

  /* ---------- top bar ---------- */
  $('#who').textContent = Store.Session.getDisplayName();
  $('#job2Lv').textContent = JOB2LV;
  $('#logout').addEventListener('click', () => {
    Store.Session.logout();
    location.replace('login.html');
  });

  Store.Session.clearActive();
  buildChoices();
  buildClassCards();
  syncChoices();
  renderSlots();
  MenuMusic.start();
})();
