/* ========= GetCute v11 ========= */

const APP_VERSION = '11';
const LS_KEY = 'getcute:v1';

/* ---- state ---- */
function defaultState(){
  return {
    coins: 0,
    skin: 3, hair: 2, eyes: 3,
    top: 1, bottom: 1, skirt: 0, dress: 0,
    shoes: 1,
    mood: 'neutral',
    avatar: { hair:'default', top:'basic', bottom:'basic', accessories:[] },
    inventory: { tops:['basic'], bottoms:['basic'], acc:[] },
    workouts: [],           // {date, type, minutes, coins}
    food: [],               // {date, item, kcal, coins}
    waterML: 0              // today only
  };
}

function save(state){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function load(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)) || defaultState(); }catch{ return defaultState(); } }
function today(){ return new Date().toISOString().slice(0,10); }

let state = load();

/* ---- DOM refs ---- */
const view   = document.getElementById('view');
const wallet = document.getElementById('wallet');

/* ---- router ---- */
const routes = {
  home: renderHome,
  avatar: renderAvatar,
  workouts: renderWorkouts,
  food: renderFood,
  calendar: renderCalendar,
};

function navigate(route){
  if(!routes[route]) route = 'home';
  document.querySelectorAll('.bottom-nav button').forEach(b=>{
    b.classList.toggle('is-active', b.dataset.route===route);
  });
  routes[route]();
  updateHeader();
}
function updateHeader(){ wallet.textContent = `💰 ${state.coins}`; }

/* ---- events: nav ---- */
document.querySelectorAll('.bottom-nav button').forEach(btn=>{
  btn.addEventListener('click', ()=> navigate(btn.dataset.route));
});

/* -------- screens -------- */

/* 01 Home */
function renderHome(){
  const last = state.workouts.filter(w=>w.date===today()).length>0;
  const moodClass = last ? 'mood--good' : 'mood--bad';
  view.innerHTML = `
    <section class="card pop-in">
      <header class="grid cols-2" style="align-items:center">
        <div><h2 style="margin:0">Your avatar</h2><div class="badge ${moodClass}"></div></div>
        <img src="assets/avatar.svg" alt="Avatar" style="justify-self:end;width:96px;height:96px"/>
      </header>
      <div style="margin-top:12px" class="grid cols-2">
        <button class="btn" id="quick-ok">✨ I worked out</button>
        <button class="btn secondary" data-go="avatar">Change outfit</button>
      </div>
    </section>
  `;
  view.querySelector('#quick-ok').onclick = ()=>{
    addWorkout({type:'Quick', minutes:10});
  };
  view.querySelector('[data-go="avatar"]').onclick = ()=> navigate('avatar');
}

/* 02 Avatar (Wardrobe) */
function renderAvatar(){
  view.innerHTML = `
    <section class="card pop-in">
      <h2>Wardrobe</h2>
      <div class="grid cols-3" id="shop">
        <button class="btn" data-buy="top:peach">Buy Peach Top (💰10)</button>
        <button class="btn" data-buy="bottom:skirt">Buy Skirt (💰10)</button>
        <button class="btn" data-buy="acc:stars">Buy Stars ✨ (💰8)</button>
      </div>

      <hr style="margin:14px 0; border:none; border-top:1px dashed #f4c1e6">

      <div class="grid cols-3" id="equip">
        <button class="btn secondary" data-equip="top:basic">Top: Basic</button>
        <button class="btn secondary" data-equip="bottom:basic">Bottom: Basic</button>
        <button class="btn secondary" data-equip="acc:none">No accessories</button>
      </div>

      <div class="avatar-stage" style="margin-top:16px">
        <div id="parts-wrap" aria-hidden="true" style="display:none"></div>
        <svg id="avatar-svg" viewBox="0 0 300 360" class="avatar-svg">
          <use id="skinUse"   href="#skin_3"></use>
          <use id="hairUse"   href="#hair_2"></use>
          <use id="eyesUse"   href="#eyes_3"></use>
          <use id="dressUse"  href="#dress_0"></use>
          <use id="topUse"    href="#top_1"></use>
          <use id="bottomUse" href="#bottom_1"></use>
          <use id="skirtUse"  href="#skirt_0"></use>
          <use id="shoesUse"  href="#shoes_1"></use>
        </svg>
      </div>
    </section>
  `;

  // טוענים את ספריית החלקים (ה-symbols) ואז מציירים את המצב
  fetch('assets/avatar_parts.svg?v='+APP_VERSION)
    .then(r=>r.text())
    .then(txt => {
      document.getElementById('parts-wrap').innerHTML = txt;
      applyAvatar();
    })
    .catch(err => console.warn('Failed loading avatar_parts.svg', err));

  // קניה
  view.querySelectorAll('#shop [data-buy]').forEach(el=>{
    el.onclick = ()=>{
      const [cat,item] = el.dataset.buy.split(':');
      const price = (cat==='acc'?8:10);
      if(state.coins < price){ alert('Not enough coins'); return; }
      state.coins -= price;
      if(cat==='top') state.inventory.tops.push(item);
      if(cat==='bottom') state.inventory.bottoms.push(item);
      if(cat==='acc') state.inventory.acc.push(item);
      save(state); updateHeader(); alert('Purchased!');
    };
  });

  // לבישה
  view.querySelectorAll('#equip [data-equip]').forEach(el=>{
    el.onclick = ()=>{
      const [cat,item] = el.dataset.equip.split(':');
      if(cat==='acc' && item==='none'){ state.avatar.accessories=[]; }
      else if(cat==='top'){ state.avatar.top=item; }
      else if(cat==='bottom'){ state.avatar.bottom=item; }
      save(state); applyAvatar(); alert('Equipped!');
    };
  });
}

/* ציור האבטר על סמך state */
function applyAvatar(){
  const s = state;
  // לוגיקה: אם יש שמלה – היא גוברת על top/bottom/skirt
  if(s.dress && s.dress>0){
    setUse('dressUse',  `dress_${s.dress}`);
    setUse('topUse',    'none');
    setUse('bottomUse', 'none');
    setUse('skirtUse',  'none');
  }else{
    setUse('dressUse',  'dress_0');
    setUse('topUse',    `top_${s.top||1}`);
    if(s.skirt && s.skirt>0){
      setUse('skirtUse',  `skirt_${s.skirt}`);
      setUse('bottomUse', 'none');
    }else{
      setUse('skirtUse',  'skirt_0');
      setUse('bottomUse', `bottom_${s.bottom||1}`);
    }
  }
  setUse('skinUse',  `skin_${s.skin||3}`);
  setUse('hairUse',  `hair_${s.hair||1}`);
  setUse('eyesUse',  `eyes_${s.eyes||1}`);
  setUse('shoesUse', `shoes_${s.shoes||1}`);
}
function setUse(id, sym){
  const u = document.getElementById(id);
  if(u) u.setAttribute('href', `#${sym}`);
}

/* 03 Workouts (מינימלי בינתיים) */
function renderWorkouts(){
  view.innerHTML = `
    <section class="card pop-in">
      <h2>Workouts</h2>
      <div class="grid cols-2" id="types">
        <button class="btn" data-type="Walk">🚶 Walk</button>
        <button class="btn" data-type="Yoga">🧘 Yoga</button>
        <button class="btn" data-type="Strength">🏋️ Strength</button>
        <button class="btn" data-type="Cardio">🏃 Cardio</button>
      </div>
    </section>
  `;
  view.querySelectorAll('[data-type]').forEach(b=>{
    b.onclick = ()=> addWorkout({type:b.dataset.type, minutes:20});
  });
}

/* 04 Food + 05 Calendar – שמורות למימוש הבא */
function renderFood(){ view.innerHTML = `<section class="card pop-in"><h2>Food</h2><p>Coming soon.</p></section>`; }
function renderCalendar(){ view.innerHTML = `<section class="card pop-in"><h2>Calendar</h2><p>Coming soon.</p></section>`; }

/* כללים */
function addWorkout({type, minutes}){
  state.workouts.push({date:today(), type, minutes, coins:5});
  state.coins += 5;
  save(state); updateHeader();
  alert('Great job! +5 💰');
}

/* אתחול ראשון */
navigate('home');
updateHeader();
