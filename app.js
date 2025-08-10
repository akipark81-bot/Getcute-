// ------- STATE -------
const state = {
  hair: 1,
  eyes: 1,
  top: 1,
  bottom: 1,
  dress: 0,   // 0=אין, 1..6 = שמלה
  shoes: 1,
  skinIndex: 1,
  coins: 0
};

const SKIN_TONES = ["#FFE6D8","#FAD9C1","#F2C6A8","#E6B08E","#C98F6A","#9E6D4E"]; // 6 טונים
const MAX = { hair:6, eyes:6, top:6, bottom:6, dress:6, shoes:6 };

// ------- BUILD -------
const avatar = document.getElementById('avatar');
const coinsEl = document.getElementById('coins');

function setCSSVars(){
  // נעשה tint לפי מצב
  avatar.style.setProperty('--skin', SKIN_TONES[state.skinIndex-1]);
}
function useSym(id){ return `<use href="assets/avatar_parts.svg#${id}"></use>`; }

function render(){
  setCSSVars();
  const layers = [];

  // גוף (בסיס)
  layers.push(useSym('body'));
  // עיניים
  layers.push(useSym(`eyes-${state.eyes}`));
  // שיער
  layers.push(useSym(`hair-${state.hair}`));
  // בגדים: אם יש dress – הוא מכסה טופ/תחתון
  if(state.dress>0){
    layers.push(useSym(`dress-${state.dress}`));
  }else{
    layers.push(useSym(`top-${state.top}`));
    layers.push(useSym(`bottom-${state.bottom}`));
  }
  // נעליים
  layers.push(useSym(`shoes-${state.shoes}`));

  avatar.innerHTML = layers.join('\n');
  coinsEl.textContent = state.coins;
}

// ------- CONTROLS -------
function setCounterText(key){
  document.getElementById(key+'Val').textContent =
    `${state[key]}/${MAX[key]}`;
}
function attachControls(){
  document.querySelectorAll('.controls').forEach(ctrl=>{
    const key = ctrl.dataset.key;
    const prev = ctrl.querySelector('.prev');
    const next = ctrl.querySelector('.next');
    prev.addEventListener('click', ()=>{
      if(key==='dress'){
        state.dress = (state.dress+MAX.dress)%(MAX.dress+1); // כולל 0
      }else{
        state[key] = state[key]-1; if(state[key]<1) state[key]=MAX[key];
      }
      setCounterText(key);
      render();
    });
    next.addEventListener('click', ()=>{
      if(key==='dress'){
        state.dress = (state.dress+1)%(MAX.dress+1); // 0..6
      }else{
        state[key] = state[key]+1; if(state[key]>MAX[key]) state[key]=1;
      }
      setCounterText(key);
      render();
    });
    setCounterText(key);
  });

  // skin swatches
  const wrap = document.getElementById('skinSwatches');
  SKIN_TONES.forEach((c,i)=>{
    const b = document.createElement('button');
    b.style.background = c;
    b.title = `Skin ${i+1}`;
    b.addEventListener('click', ()=>{
      state.skinIndex = i+1;
      render();
    });
    wrap.appendChild(b);
  });
}

// סימולציה קטנה להרוויח "מטבעות" כשמחליפים (סתם כדי לראות תזוזה)
function earn(n=1){ state.coins += n; coinsEl.textContent = state.coins; }
['hair','eyes','top','bottom','dress','shoes'].forEach(k=>{
  document.addEventListener('click', e=>{
    if(e.target.closest(`[data-key="${k}"] .prev`) || e.target.closest(`[data-key="${k}"] .next`)){
      earn(1);
    }
  });
});

// ------- INIT -------
attachControls();
render();
