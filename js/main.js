/* ================================================
   ИТМО: История корпусов — main.js
   Отвечает за: карту, карточки, анимации, таймлайн
   ================================================ */

// ---- Данные о корпусах (загружаем из JSON) ----
let buildings = [];

async function loadBuildings() {
  try {
    const res = await fetch('../data/buildings.json');
    buildings = await res.json();
    initCards();
    initMap();
    initHeroMiniMap();
  } catch (e) {
    console.error('Не удалось загрузить данные корпусов:', e);
  }
}

// ---- Инициализация карточек ----
function initCards() {
  const grid = document.getElementById('buildings-grid');
  if (!grid) return;

  // Первые 5 карточек подсвечиваем, отображаем все
  buildings.forEach((b, i) => {
    const card = document.createElement('article');
    card.className = 'building-card fade-up';
    if (i > 0) card.classList.add(`fade-up-delay-${Math.min(i, 4)}`);
    card.innerHTML = `
      <div class="card-img">
        <div class="card-img-placeholder">${b.name[0]}</div>
        <div class="card-img-year">${b.year}</div>
      </div>
      <div class="card-body">
        <div class="card-address">${b.address}</div>
        <h3 class="card-name">${b.name}</h3>
        <p class="card-desc">${b.summary}</p>
        <div class="card-meta">
          <span>🏛 ${b.style.split(',')[0]}</span>
          <span>📅 ИТМО с ${b.joined}</span>
        </div>
        <div class="card-link">Читать историю →</div>
      </div>
    `;
    card.addEventListener('click', () => {
      window.location.href = `../buildings/${b.id}.html`;
    });
    grid.appendChild(card);
  });

  // Запускаем наблюдатель после добавления карточек
  observeFadeElements();
}

// ---- Инициализация главной карты ----
function initMap() {
  const mapEl = document.getElementById('main-map');
  if (!mapEl || typeof L === 'undefined') return;

  // Центр — центр Петербурга
  const map = L.map('main-map', {
    center: [59.940, 30.310],
    zoom: 13,
    zoomControl: true,
    scrollWheelZoom: false
  });

  // Тайлы OpenStreetMap — светлый стиль
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Добавляем маркеры для каждого корпуса
  buildings.forEach(b => {
    // Кастомная иконка
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width: 16px; height: 16px;
        background: #1a4fd6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 3px 10px rgba(26,79,214,0.5);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -12]
    });

    const marker = L.marker([b.lat, b.lng], { icon }).addTo(map);
    marker.bindPopup(`
      <div class="popup-inner">
        <div class="popup-year">${b.year} — ${b.style.split(',')[0]}</div>
        <div class="popup-name">${b.name}</div>
        <div class="popup-addr">${b.address}</div>
        <a href="buildings/${b.id}.html" class="popup-btn">Подробнее →</a>
      </div>
    `, { maxWidth: 240 });
  });
}

// ---- Мини-карта в hero ----
function initHeroMiniMap() {
  const mapEl = document.getElementById('hero-mini-map');
  if (!mapEl || typeof L === 'undefined') return;

  const map = L.map('hero-mini-map', {
    center: [59.938, 30.310],
    zoom: 13,
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,
    keyboard: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  buildings.forEach(b => {
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width: 12px; height: 12px;
        background: #1a4fd6;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(26,79,214,0.4);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
    L.marker([b.lat, b.lng], { icon }).addTo(map);
  });
}

// ---- Анимации появления при скролле ----
function observeFadeElements() {
  const elements = document.querySelectorAll('.fade-up');

  if (!('IntersectionObserver' in window)) {
    // Фолбэк для старых браузеров
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Перестаём наблюдать после появления
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// ---- Таймлайн ----
function initTimeline() {
  const track = document.getElementById('timeline-track');
  if (!track) return;

  const events = [
    { year: 1900, title: 'Основание', text: 'Открытие Петербургского ремесленного училища — предшественника ИТМО' },
    { year: 1918, title: 'Реорганизация', text: 'Советская власть преобразует учебное заведение, появляется технический уклон' },
    { year: 1930, title: 'ЛИТМО', text: 'Создан Ленинградский институт точной механики и оптики — ЛИТМО' },
    { year: 1948, title: 'Новый корпус', text: 'Присоединение здания на ул. Ломоносова, расширение физических лабораторий' },
    { year: 1955, title: 'Рост кампуса', text: 'Корпус на пер. Гривцова передан гуманитарным кафедрам' },
    { year: 1962, title: 'IT-эпоха', text: 'Биржевая линия: первый вычислительный центр вуза с ЭВМ БЭСМ' },
    { year: 1971, title: 'Фотоника', text: 'Корпус на ул. Чайковского — рождение лазерных и оптических лабораторий' },
    { year: 1993, title: 'Университет', text: 'ЛИТМО получает статус университета и становится СПбГУ ИТМО' },
    { year: 2009, title: 'Национальный', text: 'Статус национального исследовательского университета' },
    { year: 2013, title: 'ИТМО', text: 'Ребрендинг: университет получает название ИТМО' },
    { year: 2015, title: 'Top-100', text: 'Вхождение в программу «5-100», курс на мировые рейтинги' },
    { year: 2021, title: 'Кампус', text: 'Начало строительства нового кампуса ИТМО Хайпарк в Петергофе' }
  ];

  events.forEach((ev, i) => {
    const item = document.createElement('div');
    item.className = 'timeline-item fade-up';
    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-year">${ev.year}</div>
      <div class="timeline-title">${ev.title}</div>
      <div class="timeline-text">${ev.text}</div>
    `;
    track.appendChild(item);
  });

  // Запускаем наблюдатель для таймлайна тоже
  observeFadeElements();
}

// ---- Плавная прокрутка по ссылкам ----
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ---- Старт ----
document.addEventListener('DOMContentLoaded', () => {
  // Сначала делаем статические элементы видимыми через observer
  observeFadeElements();
  initSmoothScroll();
  initTimeline();
  // Данные и карта загружаются асинхронно
  loadBuildings();
});
