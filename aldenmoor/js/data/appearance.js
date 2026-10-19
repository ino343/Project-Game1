/**
 * Character appearance options (gender, hairstyle, hair color, body/skin color, outfit color).
 * Only values from these lists are accepted, see APPEARANCE.sanitize().
 * Hairstyles are per gender: 13 modern cuts for male, 13 for female (trendy cuts; see legacyStyles for old ids).
 */
const APPEARANCE = {
  genders: [
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
  ],
  hairStyles: {
    male: [
      { id: 'short', name: 'Textured crop' },
      { id: 'taper', name: 'Taper fade' },
      { id: 'twoblock', name: 'Two-block' },
      { id: 'comma', name: 'Comma hair' },
      { id: 'curtains', name: 'Curtains' },
      { id: 'quiff', name: 'Fade quiff' },
      { id: 'slick', name: 'Slick back' },
      { id: 'buzz', name: 'Buzz cut' },
      { id: 'mullet', name: 'Modern mullet' },
      { id: 'manbun', name: 'Top knot' },
      { id: 'curlytop', name: 'Curly top' },
      { id: 'flow', name: 'Wavy flow' },
      { id: 'bald', name: 'Bald' },
    ],
    female: [
      { id: 'butterfly', name: 'Butterfly cut' },
      { id: 'curtainlong', name: 'Curtain bangs' },
      { id: 'wolfcut', name: 'Wolf cut' },
      { id: 'frenchbob', name: 'French bob' },
      { id: 'lob', name: 'Long bob' },
      { id: 'hime', name: 'Hime cut' },
      { id: 'highpony', name: 'Sleek high pony' },
      { id: 'lowbun', name: 'Sleek low bun' },
      { id: 'clawclip', name: 'Claw clip' },
      { id: 'pixie', name: 'Textured pixie' },
      { id: 'twinbuns', name: 'Space buns' },
      { id: 'braid', name: 'Side braid' },
      { id: 'curly', name: 'Curly shag' },
    ],
  },
  // old style ids (saved heroes) -> closest modern cut
  legacyStyles: {
    spiky: 'quiff', sidepart: 'comma', mohawk: 'taper', afro: 'curlytop', undercut: 'slick', messy: 'flow',
    long: 'butterfly', ponytail: 'highpony', bun: 'lowbun', bob: 'frenchbob', twintails: 'twinbuns', fringe: 'hime', wavy: 'curtainlong',
  },
  hairColors: [
    { v: '#1b1b22', n: 'Black' },
    { v: '#4a2e1a', n: 'Dark brown' },
    { v: '#8a5a2a', n: 'Light brown' },
    { v: '#e8c46a', n: 'Blonde' },
    { v: '#c0432a', n: 'Red' },
    { v: '#e6e6ea', n: 'White' },
    { v: '#3b6fd4', n: 'Blue' },
    { v: '#e07ab0', n: 'Pink' },
    { v: '#7a4fd0', n: 'Purple' },
    { v: '#3fa36b', n: 'Green' },
  ],
  skinColors: [
    { v: '#fde3c8', n: 'Fair' },
    { v: '#f4d0a8', n: 'Light' },
    { v: '#e0b088', n: 'Tan' },
    { v: '#c68e62', n: 'Bronze' },
    { v: '#9b6a44', n: 'Brown' },
    { v: '#6b4529', n: 'Deep' },
  ],
  // v: '' means "use the job's own color"
  outfitColors: [
    { v: '', n: 'Job default' },
    { v: '#d84a3a', n: 'Crimson' },
    { v: '#e08a2e', n: 'Orange' },
    { v: '#d9b24a', n: 'Gold' },
    { v: '#4caf6a', n: 'Green' },
    { v: '#2fa4a0', n: 'Teal' },
    { v: '#3b6fd4', n: 'Blue' },
    { v: '#27408b', n: 'Navy' },
    { v: '#7a4fd0', n: 'Purple' },
    { v: '#e07ab0', n: 'Pink' },
    { v: '#e6e6ea', n: 'White' },
    { v: '#7a5230', n: 'Brown' },
    { v: '#2a2a33', n: 'Black' },
  ],
  defaults: { gender: 'male', hairStyle: 'short', hairColor: '#4a2e1a', skinColor: '#f4d0a8', outfitColor: '' },

  stylesFor(gender) {
    return APPEARANCE.hairStyles[gender] || APPEARANCE.hairStyles.male;
  },

  // Returns a valid look; unknown or missing values fall back to the defaults.
  sanitize(look) {
    const l = look || {};
    const d = APPEARANCE.defaults;
    const pick = (list, key, val, fallback) => (list.some((i) => i[key] === val) ? val : fallback);
    const gender = pick(APPEARANCE.genders, 'id', l.gender, d.gender);
    const styles = APPEARANCE.stylesFor(gender);
    return {
      gender,
      hairStyle: pick(styles, 'id', APPEARANCE.legacyStyles[l.hairStyle] || l.hairStyle, styles[0].id),
      hairColor: pick(APPEARANCE.hairColors, 'v', l.hairColor, d.hairColor),
      skinColor: pick(APPEARANCE.skinColors, 'v', l.skinColor, d.skinColor),
      outfitColor: pick(APPEARANCE.outfitColors, 'v', l.outfitColor, d.outfitColor),
    };
  },
};
