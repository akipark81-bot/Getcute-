const APP_VERSION = '10';

// --- State -------------------------------------------------------
const defaultState = {
  coins: 0,
  skin: 3, hair: 2, eyes: 3,
  top: 1, bottom: 1, skirt: 0, dress: 0,
  shoes: 1
};
let avatarState = loadState();

// --- Utils -------------------------------------------------------
function saveState(){
  localStorage.setItem('gc_state', JSON.stringify(avatarState));
}
function loadState(){
  try{
    const raw = localStorage.getItem('gc_state');
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  }catch(e){ return { ...defaultState }; }
}
function setUse(id, sym){ const u = document.getElementById(id); if(u) u.setAttribute('href', '#'+sym); }

// draw avatar based on state
function applyAvatar(state=avatarState){
  // logic: אם יש שמלה, מסתירים top/bottom/skirt
  if(state.dress && state.dress > 0){
    setUse('dressUse',  `dress_${state.dress}`);
    setUse('topUse',    'none');
    setUse('bottomUse', 'none');
    setUse('skirtUse',  'none');
  }else{
    setUse('dressUse',  'dress_0'); // ריק
    setUse('topUse',    `top_${state.top||1}`);
    if(state.skirt && state.skirt>0){
      setUse('skirtUse',  `skirt_${state.skirt}`);
      setUse('bottomUse', 'none');
    }else{
      setUse('skirtUse',  'skirt_0');
      setUse('bottomUse', `bottom_${state.bottom||1}`);
    }
  }
  setUse('skinUse',  `skin_${state.skin||3}`);
  setUse('hairUse',  `hair_${state.hair||1}`);
  setUse('eyesUse',  `eyes_${state.eyes||1}`);
  setUse('shoesUse', `shoes_${state.shoes||1}`);

  const coinsEl = document.getElementById('coins');
  if(coinsEl) coinsEl.textContent = String(state.coins||0);
}

// --- Load parts library ------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('parts-wrap');
  if (!wrap) return;

  fetch('assets/avatar_parts.svg?v='+APP_VERSION)
    .then(r => r.text())
    .then(txt => {
      wrap.innerHTML = txt;   // מטעין את כל ה-symbols לדף
      applyAvatar();
    })
    .catch(err => console.warn('Failed loading avatar_parts.svg', err));
});

// --- Tabs --------------------------------------------------------
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.tabs button[data-tab]');
  if(!btn) return;
  const target = btn.dataset.tab;
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active', b===btn));
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active', v.id===target));
});

// --- SW (אפשר לבטל זמנית אם רוצים) ------------------------------
if ('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}
