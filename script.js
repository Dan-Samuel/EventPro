/* ==========================================================================
   EventPro — script.js
   SPA with hash routing + localStorage CRUD + auth state.
   1) Constants & seed data
   2) Storage (events, registrations, auth)
   3) Helpers / formatters
   4) Templates
   5) Page renderers
   6) Forms & validation
   7) Auth UI (navbars, hamburger, profile dropdown)
   8) Tabs, side menu, toast
   9) Delegated clicks
   10) Router & init
   ========================================================================== */

/* ---------- 1) Constants & seed data ----------------------------------- */
const STORE = {
  EVENTS: 'eventpro:events',
  REGS:   'eventpro:registrations',
  AUTH:   'eventpro:auth',
};

const SEED_EVENTS = [
  { id: 'watercolor', cat: 'Art & Culture', featured: true,
    date: '2026-05-10', time: '14:00',
    title: 'Watercolor Painting Workshop',
    desc: 'Learn the fundamentals of watercolor painting in this hands-on 3-hour workshop led by professional artist Maria Chen. All materials provided.',
    location: 'The Art Studio, 40 Dike St, Port Harcourt',
    capacity: 20, attending: 8, by: 'Maria Chen',
    image: './Resources/jeswin-thomas-zzrlRlPI6iE-unsplash.jpg' },
  { id: 'tech-summit', cat: 'Tech', featured: true,
    date: '2026-06-20', time: '09:00',
    title: 'PH Tech Summit 2026',
    desc: 'The premier technology conference in Port Harcourt, bringing together innovators, founders and engineers from across West Africa.',
    location: 'The Arcane Hall, 10 Prima St, Port Harcourt',
    capacity: 2000, attending: 100, by: 'Jin Fisher',
    image: 'Resources/headway-F2KRf_QfCqw-unsplash.jpg' },
  { id: 'jazz', cat: 'Music', featured: true,
    date: '2026-05-22', time: '19:00',
    title: 'Jazz Under The Stars',
    desc: 'An unforgettable evening of live jazz music in the heart of Golden Gate Park. Featuring three world-class trios.',
    location: 'Golden Gate Park, Port Harcourt',
    image: './Resources/behindthetmuna-0fRn8KHwtAU-unsplash.jpg',
    capacity: 500, attending: 220, by: 'Carl Lewis' },
  { id: 'yoga', cat: 'Sports & Fitness', featured: false,
    date: '2026-05-08', time: '07:00',
    title: 'Sunrise Yoga on the Beach',
    desc: 'Start your weekend right with a rejuvenating yoga session on Baker Beach as the sun rises over the ocean.',
    location: 'Baker Beach, Ikeja, Lagos',
    capacity: 50, attending: 22, by: 'Alexa Brown',
    image: './Resources/alexandra-smielova-X-OZDHpjBwk-unsplash.jpg' },
  { id: 'cooking', cat: 'Food & Drinks', featured: false,
    date: '2026-06-01', time: '11:00',
    title: 'Farm-to-Table Cooking Masterclass',
    desc: 'Join celebrated Chef David Kim for an immersive 4-hour cooking class using only seasonal local ingredients.',
    location: 'Imperial Kitchen, GRA, Port Harcourt',
    capacity: 20, attending: 12, by: 'David Kim',
    image: './Resources/jimmy-dean-Jvw3pxgeiZw-unsplash.jpg' },
  { id: 'business', cat: 'Business', featured: false,
    date: '2026-06-18', time: '15:00',
    title: 'Bay Area Entrepreneurs Meetup',
    desc: 'Monthly gathering of Bay Area entrepreneurs, founders, and aspiring business owners. Share ideas and find collaborators.',
    location: 'WeWork, 44 Monk St, Lagos',
    capacity: 80, attending: 50, by: 'Luke Collins',
    image: './Resources/ninthgrid-AekHsx1SxXQ-unsplash.jpg' },
];

const CAT_ICONS = {
  Music:              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/></svg>',
  Business:           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="1"/><line x1="9" y1="8" x2="9" y2="8.01"/><line x1="15" y1="8" x2="15" y2="8.01"/><line x1="9" y1="13" x2="9" y2="13.01"/><line x1="15" y1="13" x2="15" y2="13.01"/></svg>',
  'Food & Drinks':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11h14a3 3 0 0 1 0 6h-1"/><path d="M4 11v5a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4"/><line x1="8" y1="3" x2="8" y2="6"/><line x1="12" y1="3" x2="12" y2="6"/></svg>',
  'Art & Culture':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20l5-9 4 6 3-4 6 7"/><path d="M3 20h18"/></svg>',
  Tech:               '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>',
  'Sports & Fitness': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v16M18 4v16M3 9h3M3 15h3M18 9h3M18 15h3M6 12h12"/></svg>',
};

const CATEGORIES = [
  { name: 'Music',            cls: 'placeholder--music',    color: '#4f46e5' },
  { name: 'Business',         cls: 'placeholder--business', color: '#475569' },
  { name: 'Food & Drinks',    cls: 'placeholder--food',     color: '#d97706' },
  { name: 'Art & Culture',    cls: 'placeholder--art',      color: '#059669' },
  { name: 'Tech',             cls: 'placeholder--tech',     color: '#a855f7' },
  { name: 'Sports & Fitness', cls: 'placeholder--sports',   color: '#ea580c' },
];

/* ---------- 2) Storage helpers ----------------------------------------- */
const Store = {
  read(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  write(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  remove(key) { localStorage.removeItem(key); },

  // Events
  getEvents() {
    let events = this.read(STORE.EVENTS, null);
    if (!events || events.some(e => !e.image && SEED_EVENTS.find(s => s.id === e.id))) {
      const userCreated = (events || []).filter(e => !SEED_EVENTS.find(s => s.id === e.id));
      events = [...userCreated, ...SEED_EVENTS];
      this.write(STORE.EVENTS, events);
    }
    return events;
  },
  saveEvents(events) { this.write(STORE.EVENTS, events); },
  addEvent(ev)       { const xs = this.getEvents(); xs.unshift(ev); this.saveEvents(xs); },
  findEvent(id)      { return this.getEvents().find(e => e.id === id); },

  // Registrations
  getRegs() { return this.read(STORE.REGS, []) || []; },
  saveRegs(rs) { this.write(STORE.REGS, rs); },
  addReg(reg) {
    const rs = this.getRegs();
    const idx = rs.findIndex(r => r.eventId === reg.eventId);
    if (idx >= 0) rs[idx] = reg; else rs.push(reg);
    this.saveRegs(rs);
  },
  removeReg(eventId) { this.saveRegs(this.getRegs().filter(r => r.eventId !== eventId)); },
  hasReg(eventId)    { return this.getRegs().some(r => r.eventId === eventId); },

  // Auth
  getAuth() { return this.read(STORE.AUTH, null); },
  login(user) { this.write(STORE.AUTH, { isLoggedIn: true, ...user }); },
  logout() { this.remove(STORE.AUTH); },
  isLoggedIn() { return !!(this.getAuth() && this.getAuth().isLoggedIn); },
};

/* ---------- 3) Helpers / formatters ------------------------------------ */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const categoryClass = cat => (CATEGORIES.find(c => c.name === cat) || {}).cls || '';
const categoryIcon  = cat => CAT_ICONS[cat] || '';

// Parse YYYY-MM-DD as local time (avoids UTC off-by-one)
function parseLocalDate(iso) {
  if (!iso) return new Date(NaN);
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
const formatDateLong  = iso => parseLocalDate(iso).toLocaleDateString('en-US',
  { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const formatDateShort = iso => parseLocalDate(iso).toLocaleDateString('en-US',
  { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12  = ((hour + 11) % 12) + 1;
  return `${h12}:${m} ${ampm}`;
}
function isPast(iso) {
  const today = new Date(); today.setHours(0,0,0,0);
  return parseLocalDate(iso) < today;
}

/* ---------- 4) Templates ----------------------------------------------- */
const tplPlaceholder = (cat, modifier = 'placeholder--card') =>
  `<div class="placeholder ${modifier} ${categoryClass(cat)}">${cat || ''}</div>`;

function tplEventCard(e) {
  return `
    <article class="event-card" data-event-id="${e.id}">
      <div class="event-card__media">
        ${e.image
          ? `<img src="${e.image}" alt="${e.title}" class="event-card__img">`
          : tplPlaceholder(e.cat, 'placeholder--card')}
        <div class="event-card__tags">
          <span class="tag">${e.cat}</span>
          ${e.featured ? '<span class="tag tag--blue">Featured</span>' : ''}
        </div>
      </div>
      <div class="event-card__body">
        <div class="event-card__meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>
          ${formatDateShort(e.date)} · ${formatTime(e.time)}
        </div>
        <h3 class="event-card__title">${e.title}</h3>
        <p class="event-card__desc">${e.desc}</p>
        <div class="event-card__info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>
          ${e.location}
        </div>
        <div class="event-card__info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3 3-5 7-5s7 2 7 5"/></svg>
          ${e.attending} / ${e.capacity}
        </div>
      </div>
      <div class="event-card__foot">
        <span class="by">By <strong>${e.by}</strong></span>
        <button class="btn btn--primary btn--sm" data-register-id="${e.id}">Register</button>
      </div>
    </article>
  `;
}

/* ---------- 5) Page renderers ------------------------------------------ */
function renderLanding() {
  $('#catGrid').innerHTML = CATEGORIES.map(c => `
    <a href="#/events" class="cat-card" data-filter-cat="${c.name}">
      <span class="cat-ico" style="background:${c.color}">${categoryIcon(c.name)}</span>
      <span>${c.name}</span>
    </a>
  `).join('');

  const events   = Store.getEvents();
  const featured = events.filter(e => e.featured).slice(0, 3);
  const upcoming = events.slice().sort((a,b) => a.date.localeCompare(b.date)).slice(0, 3);
  $('#featuredList').innerHTML = featured.map(tplEventCard).join('');
  $('#upcomingList').innerHTML = upcoming.map(tplEventCard).join('');
}

function renderAllEvents(filter = {}) {
  let list = Store.getEvents();
  if (filter.cat) list = list.filter(e => e.cat === filter.cat);
  if (filter.q) {
    const q = filter.q.toLowerCase();
    list = list.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.desc.toLowerCase().includes(q)  ||
      e.location.toLowerCase().includes(q));
  }
  const wrap = $('#allEventsList');
  const empty = $('#noEventsMsg');
  if (!list.length) { wrap.innerHTML = ''; empty.hidden = false; }
  else { wrap.innerHTML = list.map(tplEventCard).join(''); empty.hidden = true; }
}

function renderEventDetail(id) {
  const ev = Store.findEvent(id);
  const root = $('#eventDetail');
  if (!ev) { root.innerHTML = `<div class="empty">Event not found.</div>`; return; }
  const registered = Store.hasReg(ev.id);
  root.innerHTML = `
    ${ev.image 
  ? `<img src="${ev.image}" alt="${ev.title}" class="event-card__img">`
  : tplPlaceholder(ev.cat, 'placeholder--hero')
    }
    <div class="tag-row">
      <span class="tag">${ev.cat}</span>
      ${ev.featured ? '<span class="tag tag--blue">Featured</span>' : ''}
    </div>
    <h1 class="detail__title">${ev.title}</h1>
    <p class="detail__desc">${ev.desc}</p>

    <div class="info-row">
      <div class="info-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg></div>
      <div><span class="label">Organized by</span><strong>${ev.by}</strong></div>
    </div>
    <div class="info-row">
      <div class="info-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div><strong>${formatDateLong(ev.date)}</strong><span class="label">${formatTime(ev.time)}</span></div>
    </div>
    <div class="info-row">
      <div class="info-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg></div>
      <div><strong>Location</strong><span class="label">${ev.location}</span></div>
    </div>
    <div class="info-row">
      <div class="info-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3 3-5 7-5s7 2 7 5"/></svg></div>
      <div><strong>Attendees</strong><span class="label">${ev.attending} / ${ev.capacity}</span></div>
    </div>

    <hr/>
    ${ registered
        ? `<button class="btn btn--outline btn--block" data-cancel-id="${ev.id}">✕ Cancel Registration</button>`
        : `<a class="btn btn--primary btn--block" href="#/register?id=${ev.id}">Register Now</a>` }
  `;
}

function renderRegister(eventId) {
  const ev = Store.findEvent(eventId);
  const summary = $('#orderSummary');
  const back = $('#regBackLink');
  if (!ev) { summary.innerHTML = `<div class="empty">Event not found.</div>`; return; }
  back.href = `#/event?id=${ev.id}`;

  // Pre-fill from prior registration or signed-in user
  const existing = Store.getRegs().find(r => r.eventId === ev.id);
  const auth = Store.getAuth();
  if (existing) {
    $('#reg-name').value  = existing.name;
    $('#reg-email').value = existing.email;
    $('#reg-phone').value = existing.phone || '';
  } else if (auth) {
    $('#reg-name').value  = auth.name  || '';
    $('#reg-email').value = auth.email || '';
  }
  $('#registerForm').dataset.eventId = ev.id;

  summary.innerHTML = `
    <h3 class="card__title text-left" style="font-size:18px">Order Summary</h3>
    <div class="summary">
      ${ev.image 
  ? `<img src="${ev.image}" alt="${ev.title}" class="event-card__img">`
  : tplPlaceholder(ev.cat, 'placeholder--thumb')
      }
      <div>
        <strong>${ev.title}</strong>
        <span class="muted">${ev.by}</span>
      </div>
    </div>
    <div class="info-row">
      <div class="info-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div><strong>${formatDateLong(ev.date)}</strong><span class="label">${formatTime(ev.time)}</span></div>
    </div>
    <div class="info-row">
      <div class="info-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg></div>
      <div><strong>Location</strong><span class="label">${ev.location}</span></div>
    </div>
    <div class="total-row"><span class="muted">Total</span><strong>Free</strong></div>
  `;
}

function renderDashboard() {
  const events = Store.getEvents();
  const regs   = Store.getRegs();
  const upcomingCount = regs.filter(r =>
    !isPast(Store.findEvent(r.eventId)?.date || '1970-01-01')).length;

  $('#statsGrid').innerHTML = `
    <div class="stat-card">
      <div class="stat-ico" style="background:var(--grey-100)"><svg viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div><span class="stat-card__label">Total Events</span><strong class="stat-card__num">${events.length}</strong></div>
    </div>
    <div class="stat-card">
      <div class="stat-ico" style="background:var(--indigo-50)"><svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3 3-5 7-5s7 2 7 5"/></svg></div>
      <div><span class="stat-card__label">My Registrations</span><strong class="stat-card__num">${regs.length}</strong></div>
    </div>
    <div class="stat-card">
      <div class="stat-ico" style="background:var(--green-50)"><svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div><span class="stat-card__label">Upcoming</span><strong class="stat-card__num">${upcomingCount}</strong></div>
    </div>`;

  const recent = events.slice(0, 3);
  $('#recentActivity').innerHTML = recent.length
    ? recent.map(e => `
      <div class="activity-card">
        <div><strong>${e.title}</strong><span class="muted">${formatDateShort(e.date)}</span></div>
        <div class="text-right"><strong>${e.attending}/${e.capacity}</strong><span class="muted">Attendees</span></div>
      </div>`).join('')
    : `<div class="empty">No recent activity yet.</div>`;

  // My Events tab
  const myList = $('#myEventsList');
  const myRegs = regs.map(r => ({ reg: r, ev: Store.findEvent(r.eventId) })).filter(x => x.ev);
  myList.innerHTML = myRegs.length
    ? myRegs.map(({ev}) => `
      <article class="ticket-card" data-event-id="${ev.id}">
        <div class="ticket-card__media">
          ${ev.image 
  ? `<img src="${ev.image}" alt="${ev.title}" class="event-card__img">`
  : tplPlaceholder(ev.cat)
          }
          <span class="badge ${isPast(ev.date) ? 'badge--past' : ''}">${isPast(ev.date) ? 'Past' : 'Upcoming'}</span>
        </div>
        <div class="ticket-card__body">
          <h3 class="ticket-card__title">${ev.title}</h3>
          <p class="meta">📅 ${formatDateShort(ev.date)} · ${formatTime(ev.time)}</p>
          <p class="meta">📍 ${ev.location}</p>
          <div class="split-stats">
            <div><strong class="split-stats__num">${ev.attending}</strong><span>Registered</span></div>
            <div class="split-stats__divider"></div>
            <div><strong class="split-stats__num">${ev.capacity}</strong><span>Capacity</span></div>
          </div>
          <div class="two-btn">
            <a class="btn btn--outline" href="#/event?id=${ev.id}">View Page</a>
            <button class="btn btn--grey" data-cancel-id="${ev.id}">Cancel</button>
          </div>
        </div>
      </article>`).join('')
    : `<div class="empty">You haven't registered for any events yet.<br/><a href="#/events" class="link-bold">Browse events →</a></div>`;
}

function renderTickets() {
  const regs = Store.getRegs();
  const all  = regs.map(r => Store.findEvent(r.eventId)).filter(Boolean);
  const upcoming = all.filter(e => !isPast(e.date));
  const past     = all.filter(e =>  isPast(e.date));

  $('#upcomingHeading').textContent = `Upcoming Events (${upcoming.length})`;
  $('#pastHeading').textContent     = `Past Events (${past.length})`;

  const tplTicket = (ev, kind) => `
    <article class="ticket-card" data-event-id="${ev.id}">
      <div class="ticket-card__media">
        ${ev.image 
  ? `<img src="${ev.image}" alt="${ev.title}" class="event-card__img">`
  : tplPlaceholder(ev.cat)
        }
        <span class="badge ${kind === 'past' ? 'badge--past' : ''}">${kind === 'past' ? 'Past' : 'Upcoming'}</span>
      </div>
      <div class="ticket-card__body">
        <h3 class="ticket-card__title">${ev.title}</h3>
        <p class="meta">📅 ${formatDateShort(ev.date)} at ${formatTime(ev.time)}</p>
        <p class="meta">📍 ${ev.location}</p>
        <hr/>
        ${ kind === 'past'
            ? `<a class="btn btn--outline btn--block" href="#/event?id=${ev.id}">↗ View Event</a>`
            : `<div class="two-btn">
                <a class="btn btn--outline" href="#/event?id=${ev.id}">↗ View Event</a>
                <button class="btn btn--link-red" data-cancel-id="${ev.id}">✕ Cancel Ticket</button>
              </div>` }
      </div>
    </article>`;

  $('#upcomingTickets').innerHTML = upcoming.map(e => tplTicket(e, 'upcoming')).join('') ||
    `<div class="empty">No upcoming registrations.</div>`;
  $('#pastTickets').innerHTML = past.map(e => tplTicket(e, 'past')).join('') ||
    `<div class="empty">No past events.</div>`;

  $('#noTicketsMsg').hidden = !!regs.length;
}

/* ---------- 6) Forms & validation -------------------------------------- */
const Validators = {
  required: v => !!v.trim() || 'This field is required',
  email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email',
  minLen:   n => v => v.length >= n || `Must be at least ${n} characters`,
  phone:    v => !v || /^[+\d\s\-()]{6,}$/.test(v) || 'Enter a valid phone number',
};

function setError(field, msg) {
  field.classList.toggle('has-error', !!msg);
  const errEl = field.querySelector('.error');
  if (errEl) errEl.textContent = msg || '';
}
function validateField(input, rules) {
  const field = input.closest('.field');
  for (const rule of rules) {
    const result = rule(input.value);
    if (result !== true) { setError(field, result); return false; }
  }
  setError(field, '');
  return true;
}

function bindForms() {
  $('#signupForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const ok =
      validateField($('#su-name'),  [Validators.required]) &
      validateField($('#su-email'), [Validators.required, Validators.email]) &
      validateField($('#su-pass'),  [Validators.required, Validators.minLen(6)]);
    if (!ok) return;
    Store.login({ name: $('#su-name').value.trim(), email: $('#su-email').value.trim() });
    applyAuthState();
    showToast('Account created — welcome!', 'success');
    location.hash = '#/events';
  });

  $('#signinForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const ok =
      validateField($('#si-email'), [Validators.required, Validators.email]) &
      validateField($('#si-pass'),  [Validators.required]);
    if (!ok) return;
    const email = $('#si-email').value.trim();
    Store.login({ name: email.split('@')[0], email });
    applyAuthState();
    showToast('Signed in', 'success');
    location.hash = '#/events';
  });

  $('#registerForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const eventId = e.currentTarget.dataset.eventId;
    const ok =
      validateField($('#reg-name'),  [Validators.required]) &
      validateField($('#reg-email'), [Validators.required, Validators.email]) &
      validateField($('#reg-phone'), [Validators.phone]);
    if (!ok) return;
    Store.addReg({
      eventId,
      name:  $('#reg-name').value.trim(),
      email: $('#reg-email').value.trim(),
      phone: $('#reg-phone').value.trim(),
      registeredAt: new Date().toISOString(),
    });
    showToast('🎉 Registration confirmed!', 'success');
    location.hash = '#/tickets';
  });

  $('#createForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const ok =
      validateField($('#ev-title'), [Validators.required]) &
      validateField($('#ev-cat'),   [Validators.required]) &
      validateField($('#ev-desc'),  [Validators.required, Validators.minLen(10)]) &
      validateField($('#ev-date'),  [Validators.required]) &
      validateField($('#ev-time'),  [Validators.required]) &
      validateField($('#ev-loc'),   [Validators.required]);
    if (!ok) return;
    const id = ($('#ev-title').value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
                + '-' + Date.now().toString(36)).slice(0, 60);
    const auth = Store.getAuth();
    Store.addEvent({
      id, cat: $('#ev-cat').value, featured: false,
      date: $('#ev-date').value, time: $('#ev-time').value,
      title: $('#ev-title').value.trim(), desc: $('#ev-desc').value.trim(),
      location: $('#ev-loc').value.trim(),
      capacity: parseInt($('#ev-cap').value, 10) || 100,
      attending: 0,
      by: (auth && auth.name) || 'You',
    });
    e.currentTarget.reset();
    showToast('Event published!', 'success');
    location.hash = '#/dashboard';
  });

  $('#searchInput')?.addEventListener('input', e =>
    renderAllEvents({ q: e.target.value, cat: $('#categoryFilter').value }));
  $('#categoryFilter')?.addEventListener('change', e =>
    renderAllEvents({ cat: e.target.value, q: $('#searchInput').value }));
}

/* ---------- 7) Auth UI: navbars, side menu, profile dropdown ----------- */

// Build side-menu items based on auth state
function renderSideMenu() {
  const nav = $('#sideMenuNav');
  const isAuthed = Store.isLoggedIn();
  const items = isAuthed
    ? [
        { href: '#/',         label: 'Home' },
        { href: '#/events',   label: 'Browse Events' },
        { href: '#/events',   label: 'Categories' },
        { href: '#/tickets',  label: 'My Events' },
        { href: '#/dashboard',label: 'Organizer Dashboard' },
        { href: '#/create',   label: 'Create Event' },
        { divider: true },
        { logout: true,       label: 'Logout' },
      ]
    : [
        { href: '#/',         label: 'Home' },
        { href: '#/events',   label: 'Browse Events' },
        { divider: true },
        { href: '#/signin',   label: 'Sign In' },
        { href: '#/signup',   label: 'Sign Up' },
      ];

  nav.innerHTML = items.map(it => {
    if (it.divider) return `<div class="menu-divider"></div>`;
    if (it.logout)  return `<button type="button" class="menu-logout" data-logout>${it.label}</button>`;
    return `<a href="${it.href}" data-close>${it.label}</a>`;
  }).join('');
}

// Apply auth state to body class + populate profile dropdown header
function applyAuthState() {
  const auth = Store.getAuth();
  const authed = !!(auth && auth.isLoggedIn);
  document.body.classList.toggle('is-auth', authed);
  document.body.classList.toggle('is-anon', !authed);
  if (authed) {
    $('#profileName').textContent  = auth.name  || 'Member';
    $('#profileEmail').textContent = auth.email || '';
  }
  renderSideMenu();
}

function bindAuthUI() {
  // Profile dropdown toggle
  const profileBtn  = $('#profileBtn');
  const profileMenu = $('#profileMenu');
  profileBtn?.addEventListener('click', e => {
    e.stopPropagation();
    const open = profileMenu.classList.toggle('is-open');
    profileBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (!profileMenu) return;
    if (!profileMenu.contains(e.target) && e.target !== profileBtn) {
      profileMenu.classList.remove('is-open');
      profileBtn?.setAttribute('aria-expanded', 'false');
    }
  });
  profileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    profileMenu.classList.remove('is-open');
  }));

  // Logout (profile dropdown + side menu both delegated)
  document.addEventListener('click', e => {
    if (e.target.closest('#logoutBtn') || e.target.closest('[data-logout]')) {
      Store.logout();
      applyAuthState();
      closeSideMenu();
      profileMenu?.classList.remove('is-open');
      showToast('Signed out', 'success');
      location.hash = '#/';
    }
  });
}

/* ---------- 8) Tabs, side menu, toast ---------------------------------- */
function bindTabs() {
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      $$('.tab').forEach(t => t.classList.toggle('is-active', t === tab));
      $$('.tab-pane').forEach(p =>
        p.classList.toggle('is-active', p.dataset.pane === target));
    });
  });
}

function openSideMenu()  { $('#sideMenu').classList.add('is-open'); $('#menuBackdrop').classList.add('is-open'); }
function closeSideMenu() { $('#sideMenu').classList.remove('is-open'); $('#menuBackdrop').classList.remove('is-open'); }

function bindMenu() {
  $('#appMenuBtn')?.addEventListener('click', openSideMenu);
  $('#landingMenuBtn')?.addEventListener('click', openSideMenu);
  $('#sideMenuClose')?.addEventListener('click', closeSideMenu);
  $('#menuBackdrop')?.addEventListener('click', closeSideMenu);
  // Delegated close-on-link
  $('#sideMenu')?.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeSideMenu();
  });
}

let toastTimer;
function showToast(msg, kind = '') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast is-show' + (kind ? ` toast--${kind}` : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-show'), 2600);
}

/* ---------- 9) Delegated clicks (cards, register, cancel, cat filter) -- */
function bindDelegatedClicks() {
  document.addEventListener('click', e => {
    // Card → details
    const card = e.target.closest('.event-card, .ticket-card');
    if (card && !e.target.closest('button, a')) {
      const id = card.dataset.eventId;
      if (id) location.hash = `#/event?id=${id}`;
      return;
    }
    // Register button
    const regBtn = e.target.closest('[data-register-id]');
    if (regBtn) {
      e.stopPropagation();
      location.hash = `#/register?id=${regBtn.dataset.registerId}`;
      return;
    }
    // Cancel registration
    const cancelBtn = e.target.closest('[data-cancel-id]');
    if (cancelBtn) {
      e.stopPropagation();
      const id = cancelBtn.dataset.cancelId;
      if (confirm('Cancel your registration for this event?')) {
        Store.removeReg(id);
        showToast('Registration cancelled', 'success');
        route();
      }
      return;
    }
    // Category card (landing) → /events?cat=
    const catBtn = e.target.closest('[data-filter-cat]');
    if (catBtn) {
      e.preventDefault();
      location.hash = `#/events?cat=${encodeURIComponent(catBtn.dataset.filterCat)}`;
    }
  });
}

/* ---------- 10) Router & init ----------------------------------------- */
function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, queryStr] = raw.split('?');
  const params = {};
  if (queryStr) queryStr.split('&').forEach(kv => {
    const [k, v] = kv.split('=');
    params[k] = decodeURIComponent(v || '');
  });
  return { path, params };
}

function route() {
  const { path, params } = parseHash();

  // Pick navbar via body class. App nav also shows on landing if logged in.
  const isLanding = path === '/';
  document.body.classList.toggle('is-landing', isLanding);
  document.body.classList.toggle('is-app',     !isLanding);

  // Footer visibility: only on landing + public/non-auth pages.
  // Hide on internal authenticated screens (dashboard, my tickets, create, register).
  const NO_FOOTER_ROUTES = ['/dashboard', '/tickets', '/create', '/register'];
  document.body.classList.toggle('no-footer', NO_FOOTER_ROUTES.includes(path));

  // Show matching page
  let matched = false;
  $$('.page').forEach(p => {
    const isMatch = p.dataset.route === path;
    p.classList.toggle('is-active', isMatch);
    if (isMatch) matched = true;
  });
  if (!matched) {
    $('.page[data-route="/"]').classList.add('is-active');
    document.body.classList.add('is-landing');
    document.body.classList.remove('is-app');
  }

  // Per-page rendering
  switch (path) {
    case '/':         renderLanding(); break;
    case '/events':
      if (params.cat) $('#categoryFilter').value = params.cat;
      renderAllEvents({ cat: $('#categoryFilter').value, q: $('#searchInput').value });
      break;
    case '/event':    renderEventDetail(params.id); break;
    case '/register': renderRegister(params.id); break;
    case '/dashboard':renderDashboard(); break;
    case '/tickets':  renderTickets(); break;
  }

  // Always close menus on navigation
  closeSideMenu();
  $('#profileMenu')?.classList.remove('is-open');
  window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  Store.getEvents();      // ensure seeded
  applyAuthState();       // initial body class + side-menu items
  bindMenu();
  bindTabs();
  bindForms();
  bindAuthUI();
  bindDelegatedClicks();
  route();
  window.addEventListener('hashchange', route);
});

/* ================================
   PARTICLES BACKGROUND (tsParticles)
================================ */

function initParticles() {
  // Make sure the container exists before running
  const container = document.getElementById("tsparticles");
  if (!container || typeof tsParticles === "undefined") return;

  tsParticles.load("tsparticles", {
    background: {
      color: "transparent"
    },
    fpsLimit: 60,
    particles: {
      number: {
        value: 10
      },
      color: {
        value: ["#3b82f6", "#ffffff"] // blue + white
      },
      shape: {
        type: ["circle", "triangle", "polygon"],
        polygon: {
          sides: 5 // now correctly nested
        }
      },
      opacity: {
        value: 0.5,
        random: true
      },
      size: {
        value: { min: 5, max: 10 }
      },
      links: {
        enable: false
      },
      move: {
        enable: true,
        speed: 0.3, // smoother, more premium feel
        direction: "none",
        outModes: {
          default: "out"
        }
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 0.3
          }
        }
      }
    },
    detectRetina: true
  });
}


/* ================================
   APP INITIALIZATION
================================ */

window.addEventListener("load", () => {
  // Init particles
  initParticles();

  // ===== Your existing functions below =====
  // Example:
  // initNavbar();
  // initDashboard();
});
   
