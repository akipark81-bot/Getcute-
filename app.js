// טוען את ספריית החלקים כ-inline כדי ש-<use href="#..."> יעבוד בכל דפדפן
fetch('assets/avatar_parts.svg')
  .then(r => r.text())
  .then(txt => {
    document.getElementById('parts-wrap').innerHTML = txt;
    initAvatar();
  })
  .catch(err => console.error('parts load failed', err));

function setHref(id, val) {
  document.getElementById(id).setAttribute('href', val || '');
}

function initAvatar() {
  // ברירות מחדל לתצוגה
  const state = {
    skin:   '#skin_3',
    hair:   '#hair_2',
    eyes:   '#eyes_3',
    top:    '#top_1',
    bottom: '#bottom_2',
    dress:  '',           // אם בוחרים שמלה: לשים '#dress_1' ולנקות top/bottom
    shoes:  '#shoes_1'
  };
  setHref('skinUse',   state.skin);
  setHref('hairUse',   state.hair);
  setHref('eyesUse',   state.eyes);
  setHref('topUse',    state.top);
  setHref('bottomUse', state.bottom);
  setHref('dressUse',  state.dress);
  setHref('shoesUse',  state.shoes);
  console.log('avatar ready');
}

// דוגמה: בעתיד, החלפות
// setHref('hairUse', '#hair_5');
// setHref('eyesUse', '#eyes_4');
