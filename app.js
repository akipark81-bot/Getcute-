/* ---------- state & storage ---------- */
const LS_KEY = 'getcute:v1';
const state = load() || {
  coins: 0,
  mood: 'neutral', // 'happy' | 'sad' | 'angry'
  avatar: { hair:'default', top:'basic', bottom:'basic', accessories:[] },
  inventory: { tops:['basic'], bottoms:['basic'], acc:[] },
  workouts: [], // {date, type, minutes, coins}
  food: [],     // {date, item, kcal, coins}
  waterMl: 0,   // today ml
};

function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function load(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)); }catch{ return null; } }
function today(){ return new Date().toISOString().slice(0,10); }

/* ---------- router ---------- */
const routes = {
  home: renderHome,
  avatar: renderAvatar,
  workouts: renderWorkouts,
  food: renderFood,
  calendar: renderCalendar
};
const view = document.getElementById('view');
const wallet = document.getElementById('wallet');

function navigate(route){
  if(!routes[route]) route = 'home';
  // עדכון כפתור פעיל בניווט
  document.querySelectorAll('.bottom-nav button').forEach(b=>{
    b.classList.toggle('is-active', b.dataset.route===route);
  });
  routes[route]();
  updateHeader();
}
function updateHeader(){ wallet.textContent = `💰 ${state.coins}`; }
document.querySelectorAll('.bottom-nav button').forEach(btn=>{
  btn.addEventListener('click', ()=> navigate(btn.dataset.route));
});

/* ---------- screens ---------- */
// 01 Home / Dashboard
function renderHome(){
  const last = state.workouts.filter(w=>w.date===today()).length>0;
  const moodClass = last ? 'mood--good' : 'mood--bad';
  view.innerHTML = `
    <section class="card pop-in">
      <header class="grid cols-2" style="align-items:center">
        <div><h2 style="margin:0">Your avatar</h2><div class="badge ${moodClass}">Mood: ${state.mood}</div></div>
        <img src="assets/avatar.svg" alt="Avatar" style="justify-self:end; width:96px; height:96px" class="bounce"/>
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
  view.querySelector('[data-go="avatar"]').onclick = ()=>navigate('avatar');
}

// 02 Avatar / Wardrobe (שלב ראשון—דוגמא)
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
    </section>
  `;
  // קניה
  view.querySelectorAll('#shop [data-buy]').forEach(el=>{
    el.onclick = ()=>{
      const [cat,item] = el.dataset.buy.split(':');
      const price = (cat==='acc')?8:10;
      if(state.coins<price){ alert('Not enough coins'); return; }
      state.coins -= price;
      const bucket = cat==='top'?'tops':cat==='bottom'?'bottoms':'acc';
      if(!state.inventory[bucket].includes(item)) state.inventory[bucket].push(item);
      save(); updateHeader(); alert('Bought!');
    };
  });
  // ציוד
  view.querySelectorAll('#equip [data-equip]').forEach(el=>{
    el.onclick = ()=>{
      const [cat,item] = el.dataset.equip.split(':');
      if(cat==='acc' && item==='none'){ state.avatar.accessories=[]; }
      else if(cat==='top'){ state.avatar.top=item; }
      else if(cat==='bottom'){ state.avatar.bottom=item; }
      save(); alert('Equipped!');
    };
  });
}

// 03 Workouts
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

// 04 Food & Water (סקיצה ראשונית)
function renderFood(){
  view.innerHTML = `
    <section class="card pop-in">
      <h2>Food & Water</h2>
      <div class="grid cols-3" id="presets">
        <button class="btn" data-k="150">🥗 Salad 150</button>
        <button class="btn" data-k="250">🍚 Bowl 250</button>
        <button class="btn" data-k="90">🍎 Fruit 90</button>
      </div>
      <div style="margin:12px 0" class="grid cols-2">
        <input id="customFood" class="card" placeholder="Custom kcal…" />
        <button class="btn" id="addFood">Add</button>
      </div>
      <div class="grid cols-3" style="align-items:center">
        <div>Water today: <strong id="waterVal">${state.waterMl} ml</strong></div>
        <button class="btn" data-water="250">+250ml</button>
        <button class="btn secondary" data-water="500">+500ml</button>
      </div>
    </section>
  `;
  // presets
  view.querySelectorAll('#presets [data-k]').forEach(b=>{
    b.onclick = ()=> addFood({item:'Preset', kcal:+b.dataset.k});
  });
  view.querySelector('#addFood').onclick = ()=>{
    const v = +view.querySelector('#customFood').value || 0;
    if(v>0) addFood({item:'Custom', kcal:v});
  };
  view.querySelectorAll('[data-water]').forEach(b=>{
    b.onclick = ()=>{
      state.waterMl += +b.dataset.water;
      save();
      view.querySelector('#waterVal').textContent = `${state.waterMl} ml`;
      addCoins(1); // טיפונת מטבעות על שתייה
    };
  });
}

// 05 Calendar / Progress (פשוט: מונה יומי)
function renderCalendar(){
  const todayStr = today();
  const count = state.workouts.filter(w=>w.date===todayStr).length;
  view.innerHTML = `
    <section class="card pop-in">
      <h2>Progress</h2>
      <p>Workouts today: <strong>${count}</strong></p>
      <p>Total coins: <strong>${state.coins}</strong></p>
    </section>
  `;
}

/* ---------- helpers (economy) ---------- */
function addCoins(n){ state.coins += n; save(); updateHeader(); }
function addWorkout({type, minutes}){
  const coins = Math.max(5, Math.round(minutes/4)); // 5–15 לפי משך
  state.workouts.push({date:today(), type, minutes, coins});
  addCoins(coins);
  state.mood = 'happy';
  save();
  alert(`Great! +${coins} coins`);
}
function addFood({item, kcal}){
  const coins = Math.max(1, Math.round(300 - Math.min(kcal,300))/100); // קטנה, 0–3
  state.food.push({date:today(), item, kcal, coins});
  addCoins(coins);
  save();
}

updateHeader();
navigate('home'); // הפעלה ראשונית
