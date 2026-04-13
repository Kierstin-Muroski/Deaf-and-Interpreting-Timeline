const DATA_URL = 'data/timeline_master.csv';

const els = {
  searchInput: document.getElementById('searchInput'),
  priorityFilter: document.getElementById('priorityFilter'),
  verificationFilter: document.getElementById('verificationFilter'),
  eraFilter: document.getElementById('eraFilter'),
  trackFilter: document.getElementById('trackFilter'),
  orgFilter: document.getElementById('orgFilter'),
  geoFilter: document.getElementById('geoFilter'),
  sortFilter: document.getElementById('sortFilter'),
  clearFilters: document.getElementById('clearFilters'),
  timeline: document.getElementById('timeline'),
  template: document.getElementById('eventTemplate'),
  activeFilters: document.getElementById('activeFilters'),
  visibleCount: document.getElementById('visibleCount'),
  totalCount: document.getElementById('totalCount'),
  yearSpan: document.getElementById('yearSpan'),
  emptyState: document.getElementById('emptyState')
};

let rows = [];

function value(row, key) {
  return (row[key] ?? '').toString().trim();
}

function yearNum(row) {
  const n = parseInt(value(row, 'Start_Year'), 10);
  return Number.isFinite(n) ? n : 999999;
}

function displayDate(row) {
  return value(row, 'Display_Date') || value(row, 'Start_Date') || value(row, 'Start_Year') || 'Date unknown';
}

function uniqueValues(key) {
  return [...new Set(rows.map(r => value(r, key)).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function fillSelect(selectEl, items) {
  const existingFirst = selectEl.querySelector('option');
  selectEl.innerHTML = '';
  if (existingFirst) selectEl.appendChild(existingFirst);
  else {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'All';
    selectEl.appendChild(opt);
  }
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    selectEl.appendChild(opt);
  });
}

function buildSearchText(row) {
  return [
    'Entry_ID', 'Display_Date', 'Era', 'Track', 'Geography', 'Organization',
    'Event_Title', 'Description_Verified', 'Why_It_Matters', 'Impact_on_Interpreting',
    'Impact_on_Deaf_Lives', 'Social_Justice_Context', 'Gap_or_Tension',
    'Source_Type', 'Verification_Status', 'Public_Timeline_Priority', 'Notes_For_Expansion'
  ].map(k => value(row, k)).join(' ').toLowerCase();
}

function activeFilterChips() {
  const chips = [];
  const push = (label, val) => { if (val) chips.push(`${label}: ${val}`); };
  push('Search', els.searchInput.value.trim());
  push('Priority', els.priorityFilter.value);
  push('Verification', els.verificationFilter.value);
  push('Era', els.eraFilter.value);
  push('Track', els.trackFilter.value);
  push('Organization', els.orgFilter.value);
  push('Geography', els.geoFilter.value);
  return chips;
}

function renderFilterChips() {
  const chips = activeFilterChips();
  els.activeFilters.innerHTML = chips.map(c => `<span class="chip">${escapeHtml(c)}</span>`).join('');
}

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function filterRows() {
  const q = els.searchInput.value.trim().toLowerCase();
  const priority = els.priorityFilter.value;
  const verification = els.verificationFilter.value;
  const era = els.eraFilter.value;
  const track = els.trackFilter.value;
  const org = els.orgFilter.value;
  const geo = els.geoFilter.value;

  let filtered = rows.filter(row => {
    if (priority && value(row, 'Public_Timeline_Priority') !== priority) return false;
    if (verification && value(row, 'Verification_Status') !== verification) return false;
    if (era && value(row, 'Era') !== era) return false;
    if (track && value(row, 'Track') !== track) return false;
    if (org && value(row, 'Organization') !== org) return false;
    if (geo && value(row, 'Geography') !== geo) return false;
    if (q && !buildSearchText(row).includes(q)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    const dir = els.sortFilter.value === 'desc' ? -1 : 1;
    return (yearNum(a) - yearNum(b)) * dir || displayDate(a).localeCompare(displayDate(b)) * dir;
  });

  return filtered;
}

function renderRow(row) {
  const fragment = els.template.content.cloneNode(true);
  fragment.querySelector('.date').textContent = displayDate(row);
  fragment.querySelector('.era').textContent = value(row, 'Era') || 'No era';
  fragment.querySelector('.track').textContent = value(row, 'Track') || 'No track';
  fragment.querySelector('.org').textContent = value(row, 'Organization') || 'No organization';
  fragment.querySelector('.title').textContent = value(row, 'Event_Title') || '(Untitled event)';
  fragment.querySelector('.description').textContent = value(row, 'Description_Verified') || 'No description provided.';
  fragment.querySelector('.why').textContent = value(row, 'Why_It_Matters') || '—';
  fragment.querySelector('.interpreting').textContent = value(row, 'Impact_on_Interpreting') || '—';
  fragment.querySelector('.deafLives').textContent = value(row, 'Impact_on_Deaf_Lives') || '—';
  fragment.querySelector('.context').textContent = value(row, 'Social_Justice_Context') || '—';
  fragment.querySelector('.gap').textContent = value(row, 'Gap_or_Tension') || '—';

  const metaList = fragment.querySelector('.meta-list');
  [
    ['Entry ID', value(row, 'Entry_ID')],
    ['Geography', value(row, 'Geography')],
    ['Source type', value(row, 'Source_Type')],
    ['Verification', value(row, 'Verification_Status')],
    ['Priority', value(row, 'Public_Timeline_Priority')],
    ['Notes', value(row, 'Notes_For_Expansion')]
  ].filter(([, v]) => v).forEach(([k, v]) => {
    const li = document.createElement('li');
    li.textContent = `${k}: ${v}`;
    metaList.appendChild(li);
  });

  const sources = fragment.querySelector('.sources');
  const source1 = value(row, 'Source_1');
  const source2 = value(row, 'Source_2');
  if (source1 || source2) {
    sources.insertAdjacentHTML('afterbegin', '<h4>Sources</h4>');
    [source1, source2].filter(Boolean).forEach((src, idx) => {
      const a = document.createElement('a');
      a.href = src;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = `Source ${idx + 1}`;
      sources.appendChild(a);
    });
  } else {
    sources.remove();
  }

  return fragment;
}

function render() {
  const filtered = filterRows();
  els.timeline.innerHTML = '';
  filtered.forEach(row => els.timeline.appendChild(renderRow(row)));

  els.visibleCount.textContent = filtered.length.toString();
  els.totalCount.textContent = rows.length.toString();

  const years = rows.map(yearNum).filter(n => Number.isFinite(n) && n !== 999999);
  if (years.length) {
    els.yearSpan.textContent = `${Math.min(...years)}–${Math.max(...years)}`;
  }

  els.emptyState.classList.toggle('hidden', filtered.length > 0);
  renderFilterChips();
}

function bindEvents() {
  [
    els.searchInput,
    els.priorityFilter,
    els.verificationFilter,
    els.eraFilter,
    els.trackFilter,
    els.orgFilter,
    els.geoFilter,
    els.sortFilter
  ].forEach(el => el.addEventListener('input', render));

  els.clearFilters.addEventListener('click', () => {
    els.searchInput.value = '';
    els.priorityFilter.value = '';
    els.verificationFilter.value = '';
    els.eraFilter.value = '';
    els.trackFilter.value = '';
    els.orgFilter.value = '';
    els.geoFilter.value = '';
    els.sortFilter.value = 'asc';
    render();
  });
}

Papa.parse(DATA_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: ({ data }) => {
    rows = data;
    fillSelect(els.verificationFilter, uniqueValues('Verification_Status'));
    fillSelect(els.eraFilter, uniqueValues('Era'));
    fillSelect(els.trackFilter, uniqueValues('Track'));
    fillSelect(els.orgFilter, uniqueValues('Organization'));
    fillSelect(els.geoFilter, uniqueValues('Geography'));
    bindEvents();
    render();
  },
  error: (error) => {
    els.timeline.innerHTML = `<section class="panel"><h2>Could not load data</h2><p>${escapeHtml(error.message)}</p><p>Make sure <code>data/timeline_master.csv</code> is present in the repository.</p></section>`;
  }
});
