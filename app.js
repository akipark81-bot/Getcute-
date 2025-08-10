// סימון אימון + שמירה מקומית
const msg  = document.getElementById('msg');
const mark = document.getElementById('mark');
const pills = document.querySelectorAll('.pill');

function setMsg(text){ msg.textContent = text; }

const todayKey = () => new Date().toISOString().slice(0,10);
const saved = JSON.parse(localStorage.getItem('getcute') || '{}');
if (saved[todayKey()]) setMsg(`✔ Marked for today (${saved[todayKey()]})`);

pills.forEach(p => p.addEventListener('click', () => {
  pills.forEach(x => x.classList.remove('active'));
  p.classList.add('active');
}));

mark.addEventListener('click', () => {
  const type = document.querySelector('.pill.active')?.dataset.type || 'workout';
  saved[todayKey()] = type;
  localStorage.setItem('getcute', JSON.stringify(saved));
  setMsg(`✔ Marked for today (${type})`);
}));
