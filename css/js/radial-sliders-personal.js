// ──────────────────────────────────────────────────────────────
// 1) Grab all four radial sliders, clockwise order
//    Angles: 270 (top), 360, 90, 180 (evenly spaced quadrants)
// ──────────────────────────────────────────────────────────────
const radialInputs = [
  document.getElementById('slider1'),
  document.getElementById('slider2'),
  document.getElementById('slider3'),
  document.getElementById('slider4')
];

const customThumbs = [
  document.getElementById('thumb1'),
  document.getElementById('thumb2'),
  document.getElementById('thumb3'),
  document.getElementById('thumb4')
];

const linearInputs = [
  document.getElementById('linear1'),
  document.getElementById('linear2'),
  document.getElementById('linear3'),
  document.getElementById('linear4')
];

const linearValues = [
  document.getElementById('linearValue1'),
  document.getElementById('linearValue2'),
  document.getElementById('linearValue3'),
  document.getElementById('linearValue4')
];

const polygon = document.querySelector('.radar-polygon');
const ticksGroup = document.querySelector('.ticks-group');
const radarSize = 400;
const centerX = radarSize / 2;
const centerY = radarSize / 2;
const maxRadius = 200;

const anglesRad = radialInputs.map(inp => {
  const deg = Number(inp.getAttribute('data-angle'));
  return (deg * Math.PI) / 180.0;
});

function valueToPoint(val, angleRad) {
  const fraction = (val - 1) / 9;
  const r = fraction * maxRadius;
  const x = centerX + r * Math.cos(angleRad);
  const y = centerY + r * Math.sin(angleRad);
  return [x, y];
}

function updatePolygon() {
  const pts = radialInputs.map((inp, idx) => {
    const v = parseInt(inp.value, 10);
    return valueToPoint(v, anglesRad[idx]);
  });
  const ptsStr = pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  polygon.setAttribute('points', ptsStr);
}

function onSliderInput(sliderElem) {
  const idx = radialInputs.findIndex(inp => inp.id === sliderElem.id);
  if (idx === -1) return;
  const val = Number(sliderElem.value);

  if (customThumbs[idx]) customThumbs[idx].textContent = val;
  if (linearInputs[idx]) linearInputs[idx].value = val;
  if (linearValues[idx]) linearValues[idx].textContent = val;

  updatePolygon();
  positionSliderAndThumb(idx);

  const container = sliderElem.closest('.radial-slider');
  if (container) {
    container.classList.remove('low', 'mid', 'high');
    if (val < 4) container.classList.add('low');
    else if (val < 8) container.classList.add('mid');
    else container.classList.add('high');
  }

  updateHighestScoreSummary();
}

function syncFromLinear(linearElem) {
  const idx = linearInputs.findIndex(inp => inp.id === linearElem.id);
  if (idx === -1) return;
  const val = Number(linearElem.value);
  if (radialInputs[idx]) radialInputs[idx].value = val;
  if (customThumbs[idx]) customThumbs[idx].textContent = val;
  if (linearValues[idx]) linearValues[idx].textContent = val;
  updatePolygon();
  positionSliderAndThumb(idx);
  updateHighestScoreSummary();
}

function positionSliderAndThumb(idx) {
  const inp = radialInputs[idx];
  const container = inp?.parentElement;
  const thumb = customThumbs[idx];
  if (!inp || !container || !thumb) return;
  const angleDeg = Number(inp.getAttribute('data-angle'));
  const angleRad = (angleDeg * Math.PI) / 180.0;

  container.style.position = 'absolute';
  container.style.left = '50%';
  container.style.top = '50%';
  container.style.transformOrigin = '0 50%';
  container.style.transform = `translateY(-50%) rotate(${angleDeg}deg)`;

  inp.style.width = `${maxRadius}px`;
  inp.style.transformOrigin = 'left center';
  inp.style.transform = 'translateY(-50%)';

  const [x, y] = valueToPoint(Number(inp.value), angleRad);
  thumb.style.left = `${x}px`;
  thumb.style.top = `${y}px`;
  thumb.style.transform = 'translate(-50%, -50%)';
}

function drawTicks() {
  ticksGroup.innerHTML = '';
  radialInputs.forEach((_, idx) => {
    const angleRad = anglesRad[idx];
    for (let i = 1; i <= 10; i++) {
      const [x, y] = valueToPoint(i, angleRad);
      const perpAngle = angleRad + Math.PI / 2;
      const tickLength = 6;
      const dx = (tickLength / 2) * Math.cos(perpAngle);
      const dy = (tickLength / 2) * Math.sin(perpAngle);
      const ns = 'http://www.w3.org/2000/svg';
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', (x - dx).toFixed(1));
      line.setAttribute('y1', (y - dy).toFixed(1));
      line.setAttribute('x2', (x + dx).toFixed(1));
      line.setAttribute('y2', (y + dy).toFixed(1));
      line.setAttribute('stroke', '#ececec');
      line.setAttribute('stroke-width', '2');
      ticksGroup.appendChild(line);
    }
  });
}

function updateHighestScoreSummary() {
  const values = radialInputs.map(inp => parseInt(inp.value, 10));
  const labels = ['Mind', 'Emotional', 'Body', 'Spirit'];
  const minValue = Math.min(...values);
  const minIndexes = values.map((v, i) => v === minValue ? i : -1).filter(i => i !== -1);
  const lowLabels = minIndexes.map(i => labels[i]).join(', ');
  const percent = Math.round((minValue / 10) * 100);

  document.getElementById('top-skill-name').textContent = lowLabels;
  document.getElementById('top-skill-percent').textContent = `${percent}%`;
  const label = document.querySelector('#highest-score-summary div');
  if (label) {
    label.innerHTML = `Lowest Score: <span id="top-skill-name">${lowLabels}</span> (<span id="top-skill-percent">${percent}%</span>)`;
  }
  if (minIndexes.length > 0) {
    showLowestSkillCard(minIndexes[0]);
  }
}

function showLowestSkillCard(index) {
  const cardData = [
    {
      title: 'Mind',
      bullets: [
        'If they’re clear or mentally scrambled',
        'Whether they’re leading their day or losing it',
        'If they’re stuck in busyness over execution'
      ],
      url: 'https://www.adrianagallardo.com/pages/mind'
    },
    {
      title: 'Emotional',
      bullets: [
        'Their biggest internal pattern',
        'Emotional awareness and maturity',
        'How pressure impacts their leadership'
      ],
      url: 'https://www.adrianagallardo.com/pages/emotional'
    },
    {
      title: 'Body',
      bullets: [
        'Energy and performance gaps',
        'Health or routine discipline',
        'If they’re operating at full capacity or dragging'
      ],
      url: 'https://www.adrianagallardo.com/pages/body'
    },
    {
      title: 'Spirit',
      bullets: [
        'If they’re aligned or just executing out of habit',
        'Passion vs burnout',
        'Identity gaps or purpose disconnection'
      ],
      url: 'https://www.adrianagallardo.com/pages/spirit'
    }
  ];

  const card = cardData[index];
  const container = document.getElementById('lowest-skill-card');
  const titleEl = document.getElementById('lowest-skill-title');
  const bulletsEl = document.getElementById('lowest-skill-bullets');

  if (!container || !titleEl || !bulletsEl || !card) return;
  titleEl.textContent = card.title;
  bulletsEl.innerHTML = `
    ${card.bullets.map(b => `<li>${b}</li>`).join('')}
    <li style="margin-top: 12px; list-style: none;">
      <a href="${card.url}" target="_blank" style="display: inline-block; background: #007bff; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Learn More →
      </a>
    </li>
  `;
  container.style.display = 'block';
  container.classList.remove('bounce');
  void container.offsetWidth;
  container.classList.add('bounce');
}

window.addEventListener('DOMContentLoaded', () => {
  if (!polygon || !ticksGroup || radialInputs.some(i => !i) || customThumbs.some(t => !t)) {
    console.error('CRITICAL ERROR: Missing required DOM elements—check your IDs.');
    return;
  }
  drawTicks();
  radialInputs.forEach((inp, idx) => {
    customThumbs[idx].textContent = inp.value;
    positionSliderAndThumb(idx);
  });
  updatePolygon();
  updateHighestScoreSummary();
  radialInputs.forEach(inp => inp?.addEventListener('input', () => onSliderInput(inp)));
  linearInputs.forEach(inp => inp?.addEventListener('input', () => syncFromLinear(inp)));
});
