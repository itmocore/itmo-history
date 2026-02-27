/* ================================================
   building.js — скрипт для страниц отдельных корпусов
   Читает ID из имени файла, загружает данные из JSON
   ================================================ */

async function loadBuildingPage() {
  // Определяем ID корпуса из пути: buildings/kronverksky.html → kronverksky
  const pathParts = window.location.pathname.split('/');
  const fileName = pathParts[pathParts.length - 1].replace('.html', '');

  try {
    const res = await fetch('../data/buildings.json');
    const buildings = await res.json();
    const building = buildings.find(b => b.id === fileName);

    if (!building) {
      document.title = 'Корпус не найден — ИТМО';
      document.body.innerHTML = '<p style="padding:80px 32px;text-align:center;font-family:sans-serif">Корпус не найден. <a href="../index.html">← На главную</a></p>';
      return;
    }

    // Заполняем заголовок страницы
    document.title = `${building.name} — История ИТМО`;

    // Заполняем hero
    document.getElementById('b-tag').textContent = building.address;
    document.getElementById('b-title').textContent = building.name;
    document.getElementById('b-addr').textContent = building.address;

    // Факты в баре
    document.getElementById('b-year').textContent = building.year;
    document.getElementById('b-style').textContent = building.style;
    document.getElementById('b-joined').textContent = building.joined;

    // История
    const historyEl = document.getElementById('b-history');
    // Разбиваем по абзацам
    building.history.split('\n\n').forEach(para => {
      const p = document.createElement('p');
      p.className = 'building-history-text';
      p.textContent = para.trim();
      historyEl.appendChild(p);
    });

    // Интересные факты
    const factsList = document.getElementById('b-facts-list');
    building.facts.forEach(fact => {
      const li = document.createElement('li');
      li.textContent = fact;
      factsList.appendChild(li);
    });

    // Роль сегодня
    document.getElementById('b-role').textContent = building.role;

    // Источники
    const sourcesList = document.getElementById('b-sources');
    building.sources.forEach((src, i) => {
      const li = document.createElement('li');
      li.textContent = src;
      sourcesList.appendChild(li);
    });

    // Мини-карта корпуса
    if (typeof L !== 'undefined') {
      const mapEl = document.getElementById('building-map');
      if (mapEl) {
        const map = L.map('building-map', {
          center: [building.lat, building.lng],
          zoom: 16,
          zoomControl: true,
          scrollWheelZoom: false
        });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap © CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:18px;height:18px;background:#1a4fd6;border:3px solid white;border-radius:50%;box-shadow:0 3px 12px rgba(26,79,214,0.5)"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });
        L.marker([building.lat, building.lng], { icon })
          .addTo(map)
          .bindPopup(building.address)
          .openPopup();
      }
    }

    // Навигация: предыдущий/следующий корпус
    const idx = buildings.indexOf(building);
    const prevB = buildings[idx - 1];
    const nextB = buildings[idx + 1];
    const navEl = document.getElementById('building-nav');
    if (navEl) {
      if (prevB) {
        const prev = document.createElement('a');
        prev.href = `${prevB.id}.html`;
        prev.className = 'back-btn';
        prev.innerHTML = `← ${prevB.name}`;
        navEl.appendChild(prev);
      } else {
        navEl.appendChild(document.createElement('span'));
      }
      if (nextB) {
        const next = document.createElement('a');
        next.href = `${nextB.id}.html`;
        next.className = 'back-btn';
        next.innerHTML = `${nextB.name} →`;
        navEl.appendChild(next);
      }
    }

    // Анимации
    setTimeout(() => {
      document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    }, 100);

  } catch (e) {
    console.error('Ошибка загрузки данных корпуса:', e);
  }
}

document.addEventListener('DOMContentLoaded', loadBuildingPage);
