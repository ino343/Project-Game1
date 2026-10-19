/**
 * Character sprite renderer, shared by the game world and the character-creation preview.
 *
 *   drawAvatar(g, x, y, face, o, t)
 *     g     2D canvas context            (x, y)  position of the feet
 *     face  facing angle (radians)       t       time in seconds (idle animation)
 *     o     { col, hair, tier, job, weapon, moving, walk, swing, swingDur, flash, look }
 *     o.look = { gender, hairStyle, hairColor, skinColor, outfitColor }   (see data/appearance.js)
 *
 * o.wield (optional): seconds the weapon stays out after an attack; when given, the weapon
 *   is hidden unless swinging or recently swung. Without it the weapon is always drawn.
 * o.sit (optional, 0..1): how far the character has sat down; each job has its own sit pose.
 * Without o.look (NPCs) the default skin and o.hair are used.
 * o.gear (optional): equipped items' looks { weapon:{col}, armor:{col,tier}, head:{kind,col,tier} }.
 * o.cos (optional): costume looks { head, body, back } (cosmetic only), see avatar-costume.js.
 */
const AVATAR_SKIN = '#f4d0a8';

// Lighten (k > 0) or darken (k < 0) a #rrggbb color.
function avatarShade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k))));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

// Equipped armor + necklace are never drawn, and the old fantasy class outfits (plates, vests, scarves)
// are replaced by modern streetwear / techwear looks (see avatarModernOutfit). Set to false to bring
// the old fantasy outfits back.
const AVATAR_HIDE_ARMOR = true;

// Modern wardrobe: trousers, shoes and soles per class.
const AVATAR_WARDROBE = {
  waif: { pants: '#3b3d4a', shoe: '#f2f2f2', sole: '#8a93a6' }, // joggers + white sneakers
  assassin: { pants: '#16161d', shoe: '#1d1d26', sole: '#ff4d6d' }, // black cargo + techwear sneakers
  swordsman: { pants: '#4a3a2a', shoe: '#5a3c22', sole: '#2a1a10' }, // brown work pants + leather boots (Mercenary)
  knight: { pants: '#1c1c24', shoe: '#23232c', sole: '#d9b24a' }, // black tactical pants + armored boots (Paladin)
  archer: { pants: '#7a6a45', shoe: '#6b4a2a', sole: '#d8c79a' }, // cargo pants + hiking shoes
  ranger: { pants: '#4a4030', shoe: '#5a3c22', sole: '#2a1a10' }, // field trousers + boots
};

// ready stance: while the weapon is out and the hero is not swinging, it sways gently in the hand
let AVATAR_T = 0;
// Side-view body options (see README "Side view body"): hipUp = how many units the upper body is raised so the legs
// get longer, stance = how far apart the feet stand when idle, kb = idle knee bend, lean = idle forward lean,
// slim = units trimmed from the side-view torso depth, step = near foot lifted a little (relaxed step),
// hem = length of jacket / parka / tasset hems (1 = old, lower shows more leg), head = how far the profile head sits forward.
const AVATAR_SIDE_OPT = { hipUp: 2, stance: 2.2, kb: 0.5, lean: 0.035, slim: 0, step: 0, hem: 0.6, head: 0.8 }; // option E
// Profile sit poses: body lean (+ = forward) and how far [near arm, far arm] reach forward (radians)
const SIT_LEAN = { forward: -0.12, cross: 0.03, kneel: 0, squat: 0.2, hug: 0.12, kneeup: -0.04 };
const SIT_ARMS = { forward: [0.28, 0.1], cross: [0.5, 0.4], kneel: [0.85, 0.8], squat: [0.85, 0.75], hug: [0.8, 0.7], kneeup: [0.75, 0.12] };
let AVATAR_SIDE = false; // true while a side-view (walking left / right) body is being drawn
function avatarReady(o) {
  return o.wield > 0 && !(o.swing > 0) ? Math.sin(AVATAR_T * 2.3) : 0; // -1..1, 0 when not idle-wielding
}

function drawAvatar(g, x, y, face, o, t) {
  AVATAR_T = t;
  const look = o.look || null;
  const skin = look ? look.skinColor : AVATAR_SKIN;
  const hairColor = look ? look.hairColor : o.hair;
  const style = look ? look.hairStyle : 'short';
  const female = !!look && look.gender === 'female';
  const cos = o.cos || null; // costumes (cosmetic gear): { head, body, back }, see avatar-costume.js
  const cosB = cos && cos.body;
  const cloth = cosB ? cosB.c1 : (look && look.outfitColor) || o.col; // main outfit color (player-chosen, or the costume's)
  const bw = female ? 16 : 18; // body width
  const sit = o.moving ? 0 : o.sit || 0;
  const SIT_POSE = { swordsman: 'forward', knight: 'kneel', waif: 'cross', assassin: 'squat', archer: 'hug', ranger: 'kneeup' };
  const SIT_DROP = { swordsman: 8, knight: 10, waif: 9, assassin: 11, archer: 8, ranger: 8 };
  const pose = SIT_POSE[o.job];
  const seated = sit > 0.5 && !!pose;
  const sideFacing = Math.abs(Math.cos(face)) >= 0.62 && Math.sin(face) >= -0.5; // same test as sideView below
  const bob = o.moving ? (sideFacing ? Math.abs(Math.cos(o.walk)) * 2.2 : Math.abs(Math.sin(o.walk)) * 2.6) : Math.sin(t * (sit > 0 ? 1.5 : 2)) * (sit > 0 ? 0.4 : 0.8);
  const stepA = o.moving ? Math.sin(o.walk) : 0; // -1..1 walk cycle
  // attack progress 0..1 (-1 when not attacking); body lunges toward the target and recovers
  const k = o.swing > 0 ? Math.min(1, Math.max(0, 1 - o.swing / o.swingDur)) : -1;
  const lunge = k >= 0 ? Math.sin(k * Math.PI) * 4.5 : 0;
  const atkR = k >= 0 ? Math.sin(k * Math.PI) : 0; // 0..1 how far into the attack stance
  const sx0 = x; // shadow stays on the ground
  x += Math.cos(face) * lunge;
  const gy = y; // feet stay on the ground while the body bobs
  y += Math.sin(face) * lunge * 0.5;
  const fy = y - bob + sit * (SIT_DROP[o.job] || 0);
  let wAlpha = o.wield === undefined ? 1 : o.swing > 0 ? 1 : Math.min(1, Math.max(0, o.wield) / 0.12);
  if (seated) wAlpha = 0; // the weapon becomes a resting prop while seated
  const behind = Math.sin(face) < -0.3; // weapon drawn behind the body
  const facingUp = Math.sin(face) < -0.5; // back view: back of the head and the back of the outfit are visible
  // side view: walking / facing left or right shows a profile body (narrow torso, one arm and the legs in stride)
  const sideView = !facingUp && Math.abs(Math.cos(face)) >= 0.62; // also while seated (profile sit poses, see avatarSitLegsSide)
  const dir = Math.cos(face) >= 0 ? 1 : -1; // 1 = facing right, -1 = facing left
  const bwT = female ? 10.5 : 12; // torso width in side view
  const SO = AVATAR_SIDE_OPT;
  const bt = sideView ? bwT - SO.slim : bw;
  AVATAR_SIDE = sideView;
  const side = Math.cos(face) >= 0 ? -1 : 1; // side that trails behind the character
  const fam = o.job === 'assassin' ? 'waif' : o.job === 'knight' ? 'swordsman' : o.job === 'ranger' ? 'archer' : o.job;
  // Waif / Assassin daggers are held in the hand: the holding arm reaches out to the grip (see avatarHeld)
  // instead of hanging at the side. [left arm, right arm]
  const holdKnife = o.weapon === 'knife' && (o.job === 'waif' || o.job === 'assassin') && wAlpha > 0 && !seated;
  // Sword: the arm on the facing side holds the grip and follows the swing instead of hanging at the side
  const holdSword = o.weapon === 'sword' && wAlpha > 0 && !seated;
  // Bow: the front arm holds the grip; while the string is drawn the back arm pulls it
  const holdBow = o.weapon === 'bow' && wAlpha > 0 && !seated; // also when facing up: the hands keep holding the bow
  const drawing = k >= 0 && k < 0.6;
  const hold = holdBow
    ? (Math.cos(face) >= 0 ? [drawing, true] : [true, drawing])
    : holdSword
    ? [true, true] // two-handed: both arms reach out to the sword grip (see avatarWeapon)
    : !holdKnife ? null : o.job === 'assassin' ? [true, true] : Math.cos(face) >= 0 ? [false, true] : [true, false];
  const ctx = { g, x, fy, bw, female, cloth, o, t, facingUp, sideView, dir, side, seated, t2: o.tier === 2, arm: [0, 0, 0, 0], hold };

  // shadow + tier-2 aura
  g.fillStyle = 'rgba(0,0,0,.28)';
  g.beginPath();
  g.ellipse(sx0, gy + 2, 13 - lunge * 0.3, 5.2, 0, 0, 6.28);
  g.fill();
  if (o.tier === 2) {
    g.strokeStyle = o.col + '88';
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(sx0, gy + 2, 17 + Math.sin(t * 4) * 1.5, 7, 0, 0, 6.28);
    g.stroke();
  }

  // legs + boots: alternate lift and stride, feet stay on the ground
  const liftL = Math.max(0, stepA) * 3.4;
  const liftR = Math.max(0, -stepA) * 3.4;
  const strideX = Math.cos(face) * stepA * 2.2;
  let legCol = fam === 'swordsman' ? (o.tier === 2 ? '#5a5a66' : '#3a3a46') : '#2b2230';
  let bootCol = fam === 'swordsman' ? (o.tier === 2 ? '#e8d27a' : '#aab1bb') : fam === 'archer' ? '#6b4a2a' : '#15111a';
  let soleCol = null;
  const wd = AVATAR_HIDE_ARMOR && AVATAR_WARDROBE[o.job];
  if (wd) {
    legCol = wd.pants;
    bootCol = wd.shoe;
    soleCol = wd.sole;
  }
  if (cosB) {
    if (cosB.pants) legCol = cosB.pants;
    if (cosB.shoe) bootCol = cosB.shoe;
    if (cosB.sole) soleCol = cosB.sole;
  }
  const legFx = { g, x, fy, gy, pose, legCol, bootCol };
  legFx.dir = dir;
  legFx.soleCol = soleCol;
  legFx.female = female;
  if (seated && sideView) avatarSitLegsSide(legFx, 'far');
  else if (seated) avatarSitLegs(legFx, false);
  else if (sideView) avatarSideLegs({ g, x, fy, gy, hipUp: seated ? 0 : SO.hipUp, legCol, bootCol, soleCol, female, dir, stepA, cyc: o.moving ? Math.cos(o.walk) : 0, atk: atkR, lunge });
  else for (const [lx, lift, dir] of [[-6, liftL, 1], [1, liftR, -1]]) {
    // tapered trousers (straight-cut for men, slim-fit for women) + rounded sneakers
    const cx = x + lx + strideX * dir + 2.5;
    const top = fy - 9;
    const bottom = gy - lift;
    const tw = female ? 4.9 : 5.4, aw = female ? 3.6 : 4.5;
    const ank = Math.max(top + 2, bottom - 3);
    avatarPoly(g, [cx - tw / 2, top, cx + tw / 2, top, cx + aw / 2, ank, cx - aw / 2, ank], legCol);
    avatarPoly(g, [cx + 0.5, top, cx + tw / 2, top, cx + aw / 2, ank, cx + 0.3, ank], 'rgba(0,0,0,.16)'); // shaded side
    g.fillStyle = 'rgba(255,255,255,.1)';
    g.fillRect(cx - tw / 2 + 0.5, top, 0.9, Math.max(1, ank - top)); // light edge
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.fillRect(cx - aw / 2, ank - 1.2, aw, 1.2); // ankle cuff
    g.fillStyle = bootCol;
    avatarRound(g, cx - 3.3, bottom - 4.2, 6.8, 4.2, 1.8);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.22)';
    g.fillRect(cx - 2.6, bottom - 3.8, 3.2, 0.9); // shoe shine
    g.fillStyle = 'rgba(0,0,0,.2)';
    g.fillRect(cx + 1.6, bottom - 3.6, 1.8, 2.4); // toe cap shade
    if (soleCol) {
      g.fillStyle = soleCol; // sneaker sole
      g.fillRect(cx - 3.3, bottom - 1.2, 6.8, 1.2);
      g.fillStyle = 'rgba(255,255,255,.4)';
      g.fillRect(cx - 1.6, bottom - 3, 2.6, 0.7); // lace highlight
    }
  }

  // side view: the upper body leans into the walk and folds forward into an attack (everything above the hips)
  const lean = sideView ? (seated ? SIT_LEAN[pose] || 0 : SO.lean + (o.moving ? 0.045 : 0) + atkR * 0.12) : 0;
  g.save();
  if (sideView && !seated && SO.hipUp) g.translate(0, -SO.hipUp); // longer legs: everything above the hips moves up
  if (lean) g.transform(1, 0, -dir * lean, 1, dir * lean * (fy - 8), 0);
  if (behind && wAlpha > 0) avatarHeld(g, x, fy - 18, face, o, wAlpha);
  if (cos && cos.back) avatarCosBack(ctx, cos.back, false); // cape / wings behind the body
  if (fam === 'archer' && !facingUp) avatarQuiver(ctx, false);

  // side view: the arm on the far side swings behind the torso (the near arm is drawn over it, see below)
  const sideArm = (idx, ang) => {
    if (hold && hold[idx]) return;
    g.save();
    g.translate(x, fy - 25);
    g.rotate(ang);
    g.translate(-x, -(fy - 25));
    avatarArm(g, x - 1.5, fy - 25, skin, female, true);
    const sctx = { ...ctx, bw: -3, arm: [0, 0, 0, 0], hold: [true, false] }; // sleeves of arm #1, centred on the shoulder
    if (cosB) avatarCosSleeves(sctx, cosB);
    else avatarSleeves(sctx);
    g.restore();
  };
  if (sideView) sideArm(dir > 0 ? 0 : 1, seated ? -dir * (SIT_ARMS[pose] || [0.3, 0.2])[1] : dir * -stepA * 0.8);

  // body: shaped torso (men: broad shoulders tapering to the waist, women: fitted waist and soft hips)
  avatarTorsoPath(g, x, fy, bt, female);
  g.fillStyle = cloth;
  g.fill();
  g.save();
  g.clip();
  const gl = g.createLinearGradient(x - bt / 2, 0, x + bt / 2, 0);
  gl.addColorStop(0, 'rgba(255,255,255,.12)');
  gl.addColorStop(0.55, 'rgba(255,255,255,0)');
  gl.addColorStop(1, 'rgba(0,0,0,.2)');
  g.fillStyle = gl;
  g.fillRect(x - bt / 2 - 3, fy - 28, bt + 6, 21);
  const gv = g.createLinearGradient(0, fy - 27, 0, fy - 8);
  gv.addColorStop(0, 'rgba(255,255,255,.14)');
  gv.addColorStop(1, 'rgba(0,0,0,.12)');
  g.fillStyle = gv;
  g.fillRect(x - bt / 2 - 3, fy - 28, bt + 6, 21);
  g.fillStyle = 'rgba(0,0,0,.13)';
  g.fillRect(x - bt / 2 - 3, fy - 15, bt + 6, 2.2); // waistline shadow
  if (female) {
    g.fillStyle = 'rgba(0,0,0,.1)';
    g.beginPath();
    g.ellipse(x, fy - 20.2, bt / 2 - 2.8, 1.3, 0, 0, 6.28); // under-bust shading
    g.fill();
  } else {
    g.fillStyle = 'rgba(255,255,255,.08)';
    g.fillRect(x - bt / 2 + 2, fy - 25.6, bt - 4, 1.6); // shoulder line
  }
  g.restore();

  // class outfit details (chest, belt, collar, skirt trim); a costume outfit replaces them
  if (cosB && sideView) {
    g.save(); // costume outfits are narrowed to the side-view torso
    g.translate(x, 0);
    g.scale(bt / bw, 1);
    g.translate(-x, 0);
    avatarCosBody(ctx, cosB);
    g.restore();
  } else if (cosB) avatarCosBody(ctx, cosB);
  else if (AVATAR_HIDE_ARMOR && sideView) {
    g.save();
    avatarTorsoPath(g, x, fy, bt, female);
    g.rect(x - bt / 2 - 7, fy - 36, bt + 14, 9.6);
    g.rect(x - bt / 2 - 7, fy - 8.01, bt + 14, 14);
    g.clip();
    avatarSideOutfit({ g, x, fy, bw: bt, female, cloth, o, dir });
    g.restore();
  } else if (AVATAR_HIDE_ARMOR) {
    // outfit details follow the torso silhouette (collars above and coat tails below the hem stay free)
    g.save();
    avatarTorsoPath(g, x, fy, bw, female);
    g.rect(x - bw / 2 - 7, fy - 36, bw + 14, 9.6);
    g.rect(x - bw / 2 - 7, fy - 8.01, bw + 14, 14);
    g.clip();
    avatarModernOutfit(ctx);
    g.restore();
  }
  else {
    if (fam === 'waif') avatarWaifOutfit(ctx);
    else if (fam === 'swordsman') avatarSwordsmanOutfit(ctx);
    else if (fam === 'archer') avatarArcherOutfit(ctx);
    if (o.gear && o.gear.armor) avatarArmor(ctx);
  }

  if (cos && cos.back) avatarCosBack(ctx, cos.back, true); // back view: wings / cape drawn over the body
  // arms: skin, then sleeves / bracers / gauntlets per class
  // walking: arms swing opposite to the legs; attacking: the arm on the facing side thrusts out
  const raise = k >= 0 ? Math.sin(k * Math.PI) : 0;
  const atkArm = Math.cos(face) >= 0 ? 1 : 0; // 0 = left arm, 1 = right arm
  ctx.arm = [
    -stepA * 2.6 - (atkArm === 0 ? raise * 2 : 0),
    stepA * 2.6 - (atkArm === 1 ? raise * 2 : 0),
    atkArm === 0 ? Math.cos(face) * raise * 3 : 0,
    atkArm === 1 ? Math.cos(face) * raise * 3 : 0,
  ];
  if (!seated && sit > 0 && fam === 'archer' && wAlpha === 0) avatarBowRest(g, x, gy, bw, o, Math.min(1, sit / 0.5));
  if (seated && sideView) {
    // profile sit: the near leg and the resting weapon are drawn without the body lean (the lean tilts only the upper body)
    g.save();
    g.transform(1, 0, dir * lean, 1, -dir * lean * (fy - 8), 0);
    avatarSitLegsSide(legFx, 'near');
    avatarSitPropSide({ g, x, fy, gy, o, dir, lean }, pose);
    g.restore();
  } else if (seated) {
    avatarSitLegs(legFx, true);
    avatarSitProp({ g, x, fy, gy, o, bw }, pose);
    ctx.arm[0] += 3 * sit;
    ctx.arm[1] += 3 * sit;
  }
  if (sideView) sideArm(atkArm, seated ? -dir * (SIT_ARMS[pose] || [0.3, 0.2])[0] : dir * (stepA * 0.8 - raise * 1.1)); // near arm: swings against the legs, thrusts forward when attacking
  else {
    if (!(hold && hold[0])) avatarArm(g, x - bw / 2 - 3 + ctx.arm[2], fy - 25 + ctx.arm[0], skin, female, false);
    if (!(hold && hold[1])) avatarArm(g, x + bw / 2 + ctx.arm[3], fy - 25 + ctx.arm[1], skin, female, true);
    if (cosB) avatarCosSleeves(ctx, cosB);
    else avatarSleeves(ctx);
  }

  // bow hands (drawn over the head so the arms stay visible, also when facing up)
  const bowArms = () => avatarBowHands(g, x, fy, sideView ? 3 : bw, face, skin, wAlpha, k, o, o.job === 'ranger' ? avatarShade(cloth, -0.12) : cloth);
  // head
  if (sideView) {
    g.save(); // profile head: narrower, nudged toward the facing side
    g.translate(x + dir * SO.head, 0);
    g.scale(0.9, 1);
    g.translate(-x, 0);
  }
  if (sideView) avatarHeadSide(g, x, fy, skin, female, dir);
  else avatarHead(g, x, fy, skin, female, 0);
  // job headgear sits behind the hair so the chosen hairstyle stays visible
  if (!AVATAR_HIDE_ARMOR && fam === 'swordsman' && !(o.gear && o.gear.head) && !(cos && cos.head)) {
    g.fillStyle = o.tier === 2 ? '#e8d27a' : '#c9ced4';
    g.beginPath();
    g.arc(x, fy - 41, 9.8, Math.PI, 6.28);
    g.fill();
    if (o.tier === 2) {
      g.fillStyle = '#e0604d';
      g.fillRect(x - 1.5, fy - 54, 3, 8);
    }
  }
  if (sideView) avatarHairSide(g, x, fy, style, hairColor, dir);
  else avatarHair(g, x, fy, style, hairColor, face, facingUp);
  if (cos && cos.head) avatarCosHead(g, x, fy, cos.head, facingUp, t, face, sideView ? dir : 0); // costume hat hides the stat headgear's look
  else {
    if (cosB) avatarCosHood(g, x, fy, cosB);
    if (o.gear && o.gear.head) avatarHeadgear(g, x, fy, o.gear.head, facingUp, sideView ? dir : 0);
  }
  if (sideView) avatarFaceSide(g, x, fy, skin, hairColor, female, dir);
  else if (!facingUp) avatarFace(g, x, fy, face, skin, hairColor, female, 0);
  if (sideView) g.restore();
  // scarf / collar sit in front of the chin
  if (fam === 'waif' && !AVATAR_HIDE_ARMOR) avatarScarf(ctx);
  if (fam === 'archer' && facingUp) avatarQuiver(ctx, true);

  if (!behind && o.weapon && wAlpha > 0) avatarHeld(g, x, fy - 18, face, o, wAlpha);
  if (o.weapon === 'bow' && wAlpha > 0) bowArms();
  g.restore(); // end of the lean
  if (sit > 0.95) {
    // HP (green) and MP (blue) sparkles rise while resting
    for (let i = 0; i < 2; i++) {
      const ph = (t * 0.8 + i * 0.5) % 1;
      const px = x + (i ? 11 : -11);
      const py = fy - 46 - ph * 10;
      g.globalAlpha = 1 - ph;
      g.fillStyle = i ? '#6fa8ff' : '#6fe08a';
      g.fillRect(px - 2, py - 0.6, 4, 1.2);
      g.fillRect(px - 0.6, py - 2, 1.2, 4);
      g.globalAlpha = 1;
    }
  }
  if (o.flash > 0) {
    g.fillStyle = 'rgba(255,70,70,.4)';
    g.beginPath();
    g.arc(x, fy - 22, 16, 0, 6.28);
    g.fill();
  }
}


/* ---------- body shape, arms, head and face ---------- */

// Torso silhouette. Men: broad shoulders tapering to a narrower waist (V-shape). Women: shoulders a bit
// narrower, defined waist and a soft hip line. Outfit details are clipped to this shape.
function avatarTorsoPath(g, x, fy, bw, female) {
  const l = x - bw / 2,
    r = x + bw / 2;
  g.beginPath();
  if (!female) {
    g.moveTo(l + 2.6, fy - 27.6);
    g.lineTo(r - 2.6, fy - 27.6);
    g.quadraticCurveTo(r + 0.4, fy - 27.4, r, fy - 23.6);
    g.bezierCurveTo(r - 0.1, fy - 19.6, r - 1.6, fy - 16.6, r - 1.5, fy - 12.6);
    g.lineTo(r - 1, fy - 9.4);
    g.quadraticCurveTo(r - 1, fy - 8, r - 2.4, fy - 8);
    g.lineTo(l + 2.4, fy - 8);
    g.quadraticCurveTo(l + 1, fy - 8, l + 1, fy - 9.4);
    g.lineTo(l + 1.5, fy - 12.6);
    g.bezierCurveTo(l + 1.6, fy - 16.6, l + 0.1, fy - 19.6, l, fy - 23.6);
    g.quadraticCurveTo(l - 0.4, fy - 27.4, l + 2.6, fy - 27.6);
  } else {
    g.moveTo(l + 2.8, fy - 27.6);
    g.lineTo(r - 2.8, fy - 27.6);
    g.quadraticCurveTo(r + 0.2, fy - 27.4, r - 0.2, fy - 23.8);
    g.bezierCurveTo(r - 0.2, fy - 21.6, r - 1.9, fy - 19.6, r - 2, fy - 16.8);
    g.bezierCurveTo(r - 2.1, fy - 14, r + 1.2, fy - 12, r + 1.4, fy - 8.8);
    g.quadraticCurveTo(r + 1.4, fy - 8, r, fy - 8);
    g.lineTo(l, fy - 8);
    g.quadraticCurveTo(l - 1.4, fy - 8, l - 1.4, fy - 8.8);
    g.bezierCurveTo(l - 1.2, fy - 12, l + 2.1, fy - 14, l + 2, fy - 16.8);
    g.bezierCurveTo(l + 1.9, fy - 19.6, l + 0.2, fy - 21.6, l + 0.2, fy - 23.8);
    g.quadraticCurveTo(l - 0.2, fy - 27.4, l + 2.8, fy - 27.6);
  }
  g.closePath();
}

// Bare arm with a rounded hand (women's arms are slimmer). (ax, ay) = top-left of the arm.
function avatarArm(g, ax, ay, skin, female, right) {
  const w = female ? 2.7 : 3,
    ox = female && !right ? 0.3 : 0;
  g.fillStyle = skin;
  avatarRound(g, ax + ox, ay, w, 10, 1.3);
  g.fill();
  g.fillStyle = 'rgba(80,30,10,.1)';
  g.fillRect(ax + ox + w * 0.55, ay + 1, w * 0.45, 8);
  g.fillStyle = skin;
  g.beginPath();
  g.arc(ax + ox + w / 2, ay + 9.4, 1.8, 0, 6.28);
  g.fill();
}

// Head: squarer jaw for men, softer tapered chin for women, with ears and soft shading.
function avatarHead(g, x, fy, skin, female, sideDir = 0) {
  const sd = avatarShade(skin, -0.16);
  g.fillStyle = sd; // ears
  for (const k of sideDir ? [] : [-1, 1]) {
    g.beginPath();
    g.ellipse(x + k * 9, fy - 33.8, 1.7, 2.3, 0, 0, 6.28);
    g.fill();
  }
  g.fillStyle = skin;
  for (const k of sideDir ? [] : [-1, 1]) {
    g.beginPath();
    g.ellipse(x + k * 9.1, fy - 33.9, 1.1, 1.6, 0, 0, 6.28);
    g.fill();
  }
  if (female && !sideDir) {
    g.fillStyle = '#f2d06a'; // stud earrings
    for (const k of [-1, 1]) {
      g.beginPath();
      g.arc(x + k * 9.1, fy - 31.8, 0.8, 0, 6.28);
      g.fill();
    }
  }
  const head = () => {
    g.beginPath();
    g.moveTo(x - 9, fy - 35);
    g.bezierCurveTo(x - 9, fy - 40.2, x - 5, fy - 44, x, fy - 44);
    g.bezierCurveTo(x + 5, fy - 44, x + 9, fy - 40.2, x + 9, fy - 35);
    if (female) {
      g.bezierCurveTo(x + 8.8, fy - 31, x + 4.4, fy - 25.4, x, fy - 25.4);
      g.bezierCurveTo(x - 4.4, fy - 25.4, x - 8.8, fy - 31, x - 9, fy - 35);
    } else {
      g.bezierCurveTo(x + 9.2, fy - 30, x + 6.8, fy - 25.6, x, fy - 25.6);
      g.bezierCurveTo(x - 6.8, fy - 25.6, x - 9.2, fy - 30, x - 9, fy - 35);
    }
    g.closePath();
  };
  g.fillStyle = skin;
  head();
  g.fill();
  g.save();
  head();
  g.clip();
  const sh = g.createLinearGradient(x - 1, 0, x + 9, 0); // light from the top-left
  sh.addColorStop(0, 'rgba(90,40,20,0)');
  sh.addColorStop(1, 'rgba(90,40,20,.15)');
  g.fillStyle = sh;
  g.fillRect(x - 10, fy - 45, 20, 22);
  g.fillStyle = 'rgba(90,40,20,.12)';
  g.beginPath();
  g.ellipse(x, fy - 24.6, 8, 2.2, 0, 0, 6.28); // soft shadow under the jaw
  g.fill();
  g.restore();
  if (sideDir) {
    // profile: a single ear in the middle of the head, a little behind the cheek
    const ex = x - sideDir * 1.6;
    g.fillStyle = sd;
    g.beginPath();
    g.ellipse(ex, fy - 33, 2, 2.7, 0, 0, 6.28);
    g.fill();
    g.fillStyle = skin;
    g.beginPath();
    g.ellipse(ex + sideDir * 0.2, fy - 33, 1.2, 1.8, 0, 0, 6.28);
    g.fill();
    if (female) {
      g.fillStyle = '#f2d06a';
      g.beginPath();
      g.arc(ex, fy - 30.2, 0.8, 0, 6.28);
      g.fill();
    }
  }
}

// Eyes, brows, nose and mouth. Features slide sideways with the facing direction.
function avatarFace(g, x, fy, face, skin, hairColor, female, sideDir = 0) {
  const ex = sideDir ? sideDir * 3.9 : Math.cos(face) * 2.2,
    sp = sideDir ? 2.6 : 3.2, // eye spacing (narrower in profile)
    ink = '#241c28',
    brow = avatarShade(hairColor, -0.2);
  g.lineCap = 'round';
  for (const k of [-1, 1]) {
    const cx = x + k * sp + ex;
    // brows
    g.strokeStyle = brow;
    if (female) {
      g.lineWidth = 0.8;
      g.beginPath();
      g.moveTo(cx - 1.9, fy - 36.7);
      g.quadraticCurveTo(cx + k * 0.3, fy - 38, cx + 1.9, fy - 37);
      g.stroke();
    } else {
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(cx - 1.9, fy - 36.2);
      g.lineTo(cx + 1.9, fy - 36.6 + (k < 0 ? 0.3 : 0));
      g.stroke();
    }
    // eyes
    g.fillStyle = ink;
    g.beginPath();
    g.ellipse(cx, fy - 33.3, female ? 1.4 : 1.3, female ? 1.9 : 1.7, 0, 0, 6.28);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.9)';
    g.beginPath();
    g.arc(cx - 0.45, fy - 34.1, 0.55, 0, 6.28);
    g.fill();
    if (female) {
      g.strokeStyle = ink; // upper lash line with a small wing
      g.lineWidth = 0.9;
      g.beginPath();
      g.moveTo(cx - 1.7, fy - 34.3);
      g.quadraticCurveTo(cx, fy - 35.6, cx + 1.7, fy - 34.4);
      g.lineTo(cx + k * 2.1, fy - 35);
      g.stroke();
    }
  }
  const mx = x + ex * 0.8;
  if (female) {
    g.fillStyle = 'rgba(255,110,120,.3)'; // blush
    for (const k of [-1, 1]) {
      g.beginPath();
      g.ellipse(x + k * 5.6 + ex * 0.7, fy - 30.2, 2.3, 1.3, 0, 0, 6.28);
      g.fill();
    }
    g.fillStyle = '#d8707c'; // lips
    g.beginPath();
    g.ellipse(mx, fy - 28.6, 1.6, 0.8, 0, 0, 6.28);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.5)';
    g.fillRect(mx - 0.5, fy - 28.9, 0.8, 0.4);
  } else {
    if (!sideDir) {
      g.strokeStyle = avatarShade(skin, -0.22); // nose
      g.lineWidth = 0.8;
      g.beginPath();
      g.moveTo(x + ex * 1.1, fy - 32.2);
      g.lineTo(x + ex * 1.1 + 0.5, fy - 30.2);
      g.stroke();
    }
    g.strokeStyle = '#a65a4e'; // mouth
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(mx - 1.7, fy - 28.4);
    g.quadraticCurveTo(mx, fy - 27.8, mx + 1.7, fy - 28.4);
    g.stroke();
  }
  if (sideDir) {
    // profile nose sticking out past the cheek line
    g.fillStyle = skin;
    g.beginPath();
    g.ellipse(x + sideDir * 8.7, fy - 31.2, female ? 1.5 : 1.9, female ? 1.4 : 1.7, 0, 0, 6.28);
    g.fill();
    g.fillStyle = 'rgba(90,40,20,.18)';
    g.beginPath();
    g.ellipse(x + sideDir * 9.1, fy - 30.2, 1, 0.8, 0, 0, 6.28);
    g.fill();
  }
}

/* ---------- modern class outfits (streetwear / techwear) ---------- */

function avatarPoly(g, pts, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath();
  g.fill();
}

// Waif hoodie, Assassin techwear jacket, Swordsman mercenary leather jacket, Knight tactical paladin armor,
// Archer utility vest, Ranger field parka. Everything is built on the player's outfit color.
function avatarModernOutfit({ g, x, fy, bw, female, cloth, o, facingUp }) {
  const l = x - bw / 2,
    r = x + bw / 2,
    dk = (k) => avatarShade(cloth, k);
  const P = (pts, fill) => avatarPoly(g, pts, fill);
  if (o.job === 'waif' && facingUp) {
    // hoodie from behind: the hood hangs down between the shoulder blades, plain back, ribbed hem, centre seam
    P([x - 7.4, fy - 28, x + 7.4, fy - 28, x + 5.6, fy - 19, x, fy - 16.4, x - 5.6, fy - 19], dk(-0.22));
    P([x - 7.4, fy - 28, x - 0.4, fy - 28, x - 0.4, fy - 16.6, x - 5.6, fy - 19], 'rgba(255,255,255,.08)');
    g.strokeStyle = 'rgba(0,0,0,.3)';
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(x - 5.6, fy - 19);
    g.lineTo(x, fy - 16.4);
    g.lineTo(x + 5.6, fy - 19);
    g.stroke();
    g.fillStyle = 'rgba(0,0,0,.16)';
    g.fillRect(x - 0.4, fy - 16.2, 0.8, 5.4); // back seam
    g.fillStyle = dk(-0.22); // ribbed hem
    g.fillRect(l, fy - 11, bw, 3);
    g.fillStyle = dk(0.35); // back print
    g.fillRect(x - 2.6, fy - 14.6, 5.2, 1);
  } else if (o.job === 'waif') {
    g.fillStyle = dk(-0.3); // hood resting behind the neck
    g.beginPath();
    g.ellipse(x, fy - 27, 8, 3.2, 0, 0, 6.28);
    g.fill();
    g.fillStyle = dk(-0.22); // ribbed hem
    g.fillRect(l, fy - 11, bw, 3);
    P([x - 6, fy - 18, x + 6, fy - 18, x + 7.5, fy - 11, x - 7.5, fy - 11], dk(-0.14)); // kangaroo pocket
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.fillRect(x - 0.5, fy - 18, 1, 7);
    g.fillStyle = '#f4f4f4'; // drawstrings
    g.fillRect(x - 3, fy - 26, 1, 7);
    g.fillRect(x + 2, fy - 26, 1, 7);
    g.fillStyle = dk(0.35); // chest print
    g.fillRect(x - 3, fy - 22.5, 6, 1.2);
  } else if (o.job === 'assassin' && facingUp) {
    // techwear jacket from behind: full back panel, high collar all the way round, X harness, glowing spine seam
    const jacket = dk(-0.62),
      jacketHi = dk(-0.5),
      trim = dk(0.45);
    P([l, fy - 27.5, r, fy - 27.5, r, fy - 11, l, fy - 11], jacket);
    P([l, fy - 27.5, l + 3.4, fy - 27.5, l + 3.4, fy - 11, l, fy - 11], jacketHi);
    P([r, fy - 27.5, r - 3.4, fy - 27.5, r - 3.4, fy - 11, r, fy - 11], jacketHi);
    P([l, fy - 30.4, r, fy - 30.4, r, fy - 26.4, l, fy - 26.4], jacket); // collar
    g.fillStyle = trim;
    g.fillRect(l, fy - 26.6, bw, 0.8);
    g.fillRect(x - 0.4, fy - 25.8, 0.8, 8); // spine seam piping
    g.strokeStyle = '#2b2b36'; // X harness across the back
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(l + 1.5, fy - 25.5);
    g.lineTo(r - 1.5, fy - 13);
    g.moveTo(r - 1.5, fy - 25.5);
    g.lineTo(l + 1.5, fy - 13);
    g.stroke();
    g.strokeStyle = '#c9ced4';
    g.lineWidth = 1;
    g.beginPath();
    g.arc(x, fy - 19.2, 1.7, 0, 6.28);
    g.stroke();
    g.fillStyle = '#2b2b36'; // belt + accent line + hip pouch
    g.fillRect(l, fy - 13.5, bw, 2.6);
    g.fillStyle = '#ff4d6d';
    g.fillRect(l, fy - 11.4, bw, 0.7);
    g.fillStyle = jacketHi;
    g.fillRect(r - 6, fy - 11, 4.6, 4.2);
    g.fillStyle = trim;
    g.fillRect(r - 6, fy - 11, 4.6, 0.8);
  } else if (o.job === 'assassin') {
    // sleek techwear jacket: high stand-up collar (throat and mouth stay uncovered), open V front over the
    // outfit-colour shirt, cross-chest harness, belt with pouch. Straight hem: no cape, no coat tails.
    const jacket = dk(-0.62),
      jacketHi = dk(-0.5),
      trim = dk(0.45);
    P([l, fy - 27, x - 1.5, fy - 27, x - 4.2, fy - 17, x - 3.4, fy - 11, l, fy - 11], jacket); // jacket panels with angled lapels
    P([r, fy - 27, x + 1.5, fy - 27, x + 4.2, fy - 17, x + 3.4, fy - 11, r, fy - 11], jacket);
    P([l, fy - 27, l + 3.4, fy - 27, l + 3.4, fy - 11, l, fy - 11], jacketHi); // darker outer side seams
    P([r, fy - 27, r - 3.4, fy - 27, r - 3.4, fy - 11, r, fy - 11], jacketHi);
    g.strokeStyle = trim; // glowing lapel piping
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(x - 1.5, fy - 27);
    g.lineTo(x - 4.2, fy - 17);
    g.lineTo(x - 3.4, fy - 11);
    g.moveTo(x + 1.5, fy - 27);
    g.lineTo(x + 4.2, fy - 17);
    g.lineTo(x + 3.4, fy - 11);
    g.stroke();
    P([l, fy - 30, l + 3.6, fy - 30.4, x - 2.2, fy - 26.4, l, fy - 26.4], jacket); // high stand-up collar (sides of the neck)
    P([r, fy - 30, r - 3.6, fy - 30.4, x + 2.2, fy - 26.4, r, fy - 26.4], jacket);
    g.fillStyle = trim;
    g.fillRect(l, fy - 26.6, 5, 0.8);
    g.fillRect(r - 5, fy - 26.6, 5, 0.8);
    g.strokeStyle = '#2b2b36'; // cross-chest harness
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(l + 1.5, fy - 25.5);
    g.lineTo(r - 1.5, fy - 13);
    g.moveTo(r - 1.5, fy - 25.5);
    g.lineTo(l + 1.5, fy - 13);
    g.stroke();
    g.strokeStyle = '#c9ced4'; // ring where the straps cross
    g.lineWidth = 1;
    g.beginPath();
    g.arc(x, fy - 19.2, 1.7, 0, 6.28);
    g.stroke();
    g.fillStyle = '#2b2b36'; // belt, buckle, hip pouch
    g.fillRect(l, fy - 13.5, bw, 2.6);
    g.fillStyle = '#ff4d6d';
    g.fillRect(l, fy - 11.4, bw, 0.7);
    g.fillStyle = '#c9ced4';
    g.fillRect(x - 3.4, fy - 13.8, 3, 3.2);
    g.fillStyle = '#14141c';
    g.fillRect(x - 2.6, fy - 13, 1.4, 1.6);
    g.fillStyle = jacketHi;
    g.fillRect(r - 6, fy - 11, 4.6, 4.2);
    g.fillStyle = trim;
    g.fillRect(r - 6, fy - 11, 4.6, 0.8);
  } else if (o.job === 'swordsman') {
    // Mercenary: brown leather jacket over a cream tee, cross-chest strap, belt with a gold buckle,
    // scarf in the outfit colour and a steel pauldron on one shoulder. From behind: plain leather back,
    // yoke seam, scabbard strap across the back and the scarf draped behind the neck.
    const lea = '#6a4426',
      leaD = avatarShade(lea, -0.12);
    const pauldron = () => {
      g.fillStyle = '#8d95a0';
      g.beginPath();
      g.ellipse(l - 1.2, fy - 26.2, 4.6, 3.2, 0, 0, 6.28);
      g.fill();
      g.strokeStyle = '#5a626d';
      g.lineWidth = 0.9;
      g.stroke();
      g.fillStyle = 'rgba(255,255,255,.4)';
      g.fillRect(l - 4, fy - 28, 3.4, 0.9);
    };
    if (facingUp) {
      P([l, fy - 27.5, r, fy - 27.5, r, fy - 9, l, fy - 9], lea);
      P([r, fy - 27.5, x + 0.4, fy - 27.5, x + 0.4, fy - 9, r, fy - 9], leaD); // shaded half
      g.fillStyle = 'rgba(0,0,0,.2)';
      g.fillRect(x - 0.4, fy - 27, 0.8, 18); // centre seam
      g.fillRect(l, fy - 22.4, bw, 0.8); // yoke seam
      g.fillStyle = avatarShade(lea, 0.14);
      g.fillRect(l, fy - 27.5, bw, 1.4); // collar edge
      g.strokeStyle = '#3a2616'; // scabbard strap across the back
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(l + 1, fy - 26.5);
      g.lineTo(r - 1, fy - 12.5);
      g.stroke();
      g.fillStyle = '#d9b24a';
      g.fillRect(x - 1, fy - 19.6, 2, 2);
      g.fillStyle = '#3a2616'; // belt
      g.fillRect(l, fy - 14.4, bw, 2.6);
      g.fillStyle = cloth; // scarf draped behind the neck
      g.fillRect(x - 6.5, fy - 28.2, 13, 2.6);
      P([x - 4, fy - 26, x - 1.2, fy - 26, x - 1.6, fy - 20, x - 3.6, fy - 21], avatarShade(cloth, -0.1));
      P([l, fy - 9, r, fy - 9, r - 0.6, fy - 4, l + 0.6, fy - 4], leaD);
      pauldron();
    } else {
      P([l, fy - 27.5, r, fy - 27.5, r, fy - 9, l, fy - 9], '#e9e2d0'); // cream tee
      P([l, fy - 27.5, x - 1, fy - 27.5, x - 2.6, fy - 9, l, fy - 9], lea); // jacket panels
      P([r, fy - 27.5, x + 2.6, fy - 27.5, x + 1, fy - 9, r, fy - 9], leaD);
      P([x - 6, fy - 29, x - 1, fy - 26.4, x - 3.4, fy - 22, x - 7, fy - 26], avatarShade(lea, 0.12)); // lapels
      P([x + 6, fy - 29, x + 1, fy - 26.4, x + 3.4, fy - 22, x + 7, fy - 26], avatarShade(lea, 0.05));
      g.fillStyle = '#c9ced4'; // zipper teeth
      for (let i = 0; i < 4; i++) g.fillRect(x - 2.3, fy - 24 + i * 3.4, 0.8, 1.4);
      g.strokeStyle = '#3a2616'; // cross-chest strap
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(r - 1, fy - 27);
      g.lineTo(l + 4, fy - 13);
      g.stroke();
      g.fillStyle = '#d9b24a';
      g.fillRect(x + 0.4, fy - 20.4, 1.8, 1.8);
      g.fillStyle = '#3a2616'; // belt + buckle
      g.fillRect(l, fy - 14.4, bw, 2.6);
      g.fillStyle = '#d9b24a';
      g.fillRect(x - 2, fy - 14.6, 4, 3);
      g.fillStyle = cloth; // scarf + hanging tail
      g.fillRect(x - 6.5, fy - 28.2, 13, 2.4);
      P([x + 3, fy - 27, x + 6.4, fy - 27, x + 6, fy - 18, x + 3.6, fy - 20], dk(-0.1));
      P([l, fy - 9, r, fy - 9, r - 0.6, fy - 4, l + 0.6, fy - 4], leaD); // jacket hem
      pauldron();
    }
  } else if (o.job === 'knight') {
    // Tactical Paladin: black tactical top, silver breast- and back-plate with a gold cross, silver pauldrons,
    // tasset plates over the hips, belt with a gold buckle.
    const sil = '#c9ced4',
      gold = '#d9b24a',
      blk = '#1c1c24';
    P([l, fy - 27.5, r, fy - 27.5, r, fy - 10, l, fy - 10], '#2c2c38');
    const plate = [x - 6.4, fy - 27, x + 6.4, fy - 27, x + 5.4, fy - 15, x, fy - 11.4, x - 5.4, fy - 15];
    P(plate, sil);
    P([x - 6.4, fy - 27, x - 0.4, fy - 27, x - 0.4, fy - 12, x - 5.4, fy - 15], 'rgba(255,255,255,.3)'); // light facet
    P([x + 6.4, fy - 27, x + 0.4, fy - 27, x + 0.4, fy - 12, x + 5.4, fy - 15], 'rgba(0,0,0,.18)'); // shaded facet
    if (facingUp) {
      g.fillStyle = 'rgba(0,0,0,.22)'; // spine groove + shoulder-blade lines
      g.fillRect(x - 0.4, fy - 26.4, 0.8, 14);
      g.fillStyle = gold; // small emblem on the back plate
      g.fillRect(x - 0.6, fy - 24, 1.2, 6);
      g.fillRect(x - 2.4, fy - 22, 4.8, 1.2);
    } else {
      g.fillStyle = gold; // cross
      g.fillRect(x - 0.9, fy - 24.6, 1.8, 10);
      g.fillRect(x - 3.4, fy - 21.8, 6.8, 1.8);
    }
    g.strokeStyle = gold; // gold trim
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(plate[0], plate[1]);
    for (let i = 2; i < plate.length; i += 2) g.lineTo(plate[i], plate[i + 1]);
    g.closePath();
    g.stroke();
    g.fillStyle = blk; // belt + buckle
    g.fillRect(l, fy - 13.6, bw, 2.6);
    g.fillStyle = gold;
    g.fillRect(x - 2, fy - 13.8, 4, 3);
    P([l + 1, fy - 11, x - 0.6, fy - 11, x - 1.2, fy - 4.6, l + 2, fy - 5], sil); // tasset plates
    P([r - 1, fy - 11, x + 0.6, fy - 11, x + 1.2, fy - 4.6, r - 2, fy - 5], sil);
    g.fillStyle = gold;
    g.fillRect(l + 1, fy - 11, x - l - 1.6, 0.7);
    g.fillRect(x + 0.6, fy - 11, r - x - 1.6, 0.7);
    for (const sx of [l - 1.6, r + 1.6]) {
      g.fillStyle = sil; // pauldrons
      g.beginPath();
      g.ellipse(sx, fy - 26, 5, 3.6, 0, 0, 6.28);
      g.fill();
      g.strokeStyle = gold;
      g.lineWidth = 1;
      g.stroke();
      g.fillStyle = 'rgba(255,255,255,.4)';
      g.fillRect(sx - 3.4, fy - 28, 4, 0.9);
    }
  } else if (o.job === 'archer' && facingUp) {
    // utility vest from behind: plain back with a yoke, a small patch and the belt (the quiver is drawn over it)
    const vest = '#566a3a';
    P([l + 0.5, fy - 26, r - 0.5, fy - 26, r - 0.5, fy - 12, l + 0.5, fy - 12], vest);
    g.fillStyle = '#3d4b28';
    g.fillRect(l + 0.5, fy - 25.6, bw - 1, 1.6); // yoke
    g.fillRect(x - 0.4, fy - 24, 0.8, 11.6); // back seam
    g.fillStyle = '#8fa066';
    g.fillRect(x - 2.4, fy - 20.4, 4.8, 3); // patch
    g.fillStyle = '#3d4b28';
    g.fillRect(x - 1.4, fy - 19.6, 2.8, 1.4);
    g.fillStyle = '#2a2a2a'; // belt
    g.fillRect(l, fy - 13, bw, 2.2);
  } else if (o.job === 'archer') {
    const vest = '#566a3a';
    P([l + 0.5, fy - 26, x - 3, fy - 26, x - 2, fy - 12, l + 0.5, fy - 12], vest); // utility vest
    P([r - 0.5, fy - 26, x + 3, fy - 26, x + 2, fy - 12, r - 0.5, fy - 12], vest);
    g.fillStyle = '#3d4b28';
    g.fillRect(l + 2, fy - 21, 4.4, 4.2); // chest pockets
    g.fillRect(r - 6.4, fy - 21, 4.4, 4.2);
    g.fillStyle = '#8fa066';
    g.fillRect(l + 2, fy - 21, 4.4, 1);
    g.fillRect(r - 6.4, fy - 21, 4.4, 1);
    g.fillStyle = '#2a2a2a'; // belt + clip
    g.fillRect(l, fy - 13, bw, 2.2);
    g.fillStyle = '#c9ced4';
    g.fillRect(x - 1.5, fy - 13.2, 3, 2.6);
  } else if (o.job === 'ranger' && facingUp) {
    // parka from behind: the hood lies folded on the back, long skirt with a centre vent, plain belt
    P([l, fy - 11, r, fy - 11, r + 0.5, fy - 3, x + 2, fy - 5.5, x - 2, fy - 5.5, l - 0.5, fy - 3], dk(-0.12));
    g.fillStyle = dk(-0.3);
    g.fillRect(x - 0.4, fy - 11, 0.8, 6); // vent
    P([x - 7.6, fy - 28, x + 7.6, fy - 28, x + 5.4, fy - 18, x, fy - 15, x - 5.4, fy - 18], dk(-0.4));
    P([x - 7.6, fy - 28, x - 0.4, fy - 28, x - 0.4, fy - 15.4, x - 5.4, fy - 18], 'rgba(255,255,255,.07)');
    g.strokeStyle = 'rgba(0,0,0,.32)';
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(x - 5.4, fy - 18);
    g.lineTo(x, fy - 15);
    g.lineTo(x + 5.4, fy - 18);
    g.stroke();
    g.fillStyle = '#3a2a1a'; // belt
    g.fillRect(l, fy - 15, bw, 2.4);
    g.fillStyle = '#5a3c22'; // back pouch
    g.fillRect(x - 2.4, fy - 12.4, 4.8, 4.4);
  } else if (o.job === 'ranger') {
    g.fillStyle = dk(-0.38); // hood behind the neck
    g.beginPath();
    g.ellipse(x, fy - 27, 8.6, 3.6, 0, 0, 6.28);
    g.fill();
    P([l, fy - 11, r, fy - 11, r + 0.5, fy - 3, x + 2, fy - 5.5, x - 2, fy - 5.5, l - 0.5, fy - 3], dk(-0.12)); // long parka skirt
    g.fillStyle = dk(-0.3);
    g.fillRect(x - 0.6, fy - 27, 1.2, 16); // zip
    g.fillStyle = '#3a2a1a'; // belt, buckle, pouch
    g.fillRect(l, fy - 15, bw, 2.4);
    g.fillStyle = '#d9b24a';
    g.fillRect(x - 1.8, fy - 15.2, 3.6, 2.8);
    g.fillStyle = '#5a3c22';
    g.fillRect(r - 5.5, fy - 12.4, 4.6, 4.4);
    g.fillStyle = dk(0.3); // flap pockets
    g.fillRect(l + 1.5, fy - 21, 4, 3);
    g.fillRect(r - 5.5, fy - 21, 4, 3);
  }
}

/* ---------- side view (walking / facing left or right) ---------- */

// One tapered limb segment (thigh / shin) from (x1,y1) to (x2,y2).
function avatarLimb(g, x1, y1, w1, x2, y2, w2, col) {
  const dx = x2 - x1,
    dy = y2 - y1,
    l = Math.hypot(dx, dy) || 1,
    nx = -dy / l,
    ny = dx / l;
  g.fillStyle = col;
  g.beginPath();
  g.moveTo(x1 + (nx * w1) / 2, y1 + (ny * w1) / 2);
  g.lineTo(x2 + (nx * w2) / 2, y2 + (ny * w2) / 2);
  g.lineTo(x2 - (nx * w2) / 2, y2 - (ny * w2) / 2);
  g.lineTo(x1 - (nx * w1) / 2, y1 - (ny * w1) / 2);
  g.closePath();
  g.fill();
}

// Legs seen from the side. Walking: a long stride, the swinging leg lifts mid-step with a bent knee and the
// trailing foot rolls onto its toes. Attacking (atk 0..1): a fighting stance, front knee bent, back leg
// pushed out behind, both feet planted. The far leg is drawn darker behind the near one.
// stepA = sin(walk), cyc = cos(walk) (0 when standing), lunge = how far the body has moved forward.
function avatarSideLegs({ g, x, fy, gy, hipUp = 0, legCol, bootCol, soleCol, female, dir, stepA, cyc, atk, lunge }) {
  const tw = female ? 5 : 5.6,
    kw = female ? 4.2 : 4.8,
    aw = female ? 3.5 : 4;
  const s = stepA * (1 - atk * 0.85);
  const SO = AVATAR_SIDE_OPT,
    idle = 1 - Math.min(1, Math.abs(stepA) * 3 + atk * 2); // 1 while standing still, 0 when walking / attacking
  const legs = [
    { rel: -(0.7 + s * 5.4) - atk * 3.6 - SO.stance * idle, lift: Math.max(0, -cyc) * 3.4, far: true },
    { rel: 0.7 + s * 5.4 + atk * 3.2 + SO.stance * idle, lift: Math.max(0, cyc) * 3.4 + SO.step * idle, far: false },
  ];
  for (const L of legs) {
    const shade = (c) => (L.far ? avatarShade(c, -0.24) : c);
    const lift = L.lift * (1 - atk),
      rel = L.rel - lunge * 0.45; // feet stay planted while the body lunges forward
    const top = fy - 9 - hipUp,
      bottom = gy - lift,
      ank = Math.max(top + 2, bottom - 3),
      ax = x + dir * rel;
    // knee: pushed forward, more when the leg is swinging or braced in an attack stance
    const frontBrace = !L.far ? atk * 1.7 : atk * 0.5;
    const kx = (x + ax) / 2 + dir * (0.5 + lift * 0.5 + frontBrace + SO.kb * idle * (L.far ? 0.5 : 1)),
      ky = (top + ank) / 2 - lift * 0.3;
    const col = shade(legCol);
    avatarLimb(g, x, top, tw, kx, ky, kw, col);
    avatarLimb(g, kx, ky, kw, ax, ank, aw, col);
    g.fillStyle = col;
    g.beginPath();
    g.arc(kx, ky, kw / 2, 0, 6.28);
    g.fill();
    g.fillStyle = L.far ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.07)';
    g.beginPath();
    g.arc(kx - dir * 0.5, ky - 0.4, kw / 2 - 1, 0, 6.28);
    g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.fillRect(ax - aw / 2, ank - 1.2, aw, 1.2); // ankle cuff
    // shoe: toe points forward; the heel lifts when the leg trails behind or swings
    const tilt = Math.min(0.62, lift * 0.1 + Math.max(0, -rel - 2.4) * 0.085 * (1 - atk * 0.6));
    g.save();
    g.translate(ax, ank);
    g.scale(dir, 1);
    g.translate(4, 3);
    g.rotate(tilt);
    g.translate(-4, -3);
    g.fillStyle = shade(bootCol);
    avatarRound(g, -2.8, -1.2, 8.4, 4.2, 1.9);
    g.fill();
    if (!L.far) {
      g.fillStyle = 'rgba(255,255,255,.22)';
      g.fillRect(1.6, -0.8, 3.6, 0.9); // shoe shine
      g.fillStyle = 'rgba(0,0,0,.2)';
      g.fillRect(3.9, 0.2, 1.6, 2.2); // toe cap shade
    }
    if (soleCol) {
      g.fillStyle = shade(soleCol);
      g.fillRect(-2.8, 1.8, 8.4, 1.2); // sneaker sole
    }
    g.restore();
  }
}

/* ---------- profile head, face and hair (facing left / right) ----------
 * Everything below is drawn in a right-facing frame (origin = the head's x, fy; u = forward, v = up (negative))
 * and mirrored for left-facing, so one set of shapes serves both directions.
 */
const AVATAR_SIDE_PATHS = new Map();
function avatarSideP(d) {
  let p = AVATAR_SIDE_PATHS.get(d);
  if (!p) AVATAR_SIDE_PATHS.set(d, (p = new Path2D(d)));
  return p;
}

// Profile head: rounded skull, brow, small nose, lips, chin, jaw, neck and one ear.
function avatarHeadSide(g, x, fy, skin, female, dir) {
  const sd = avatarShade(skin, -0.16),
    nose = female ? 10.4 : 11;
  g.save();
  g.translate(x, fy);
  g.scale(dir, 1);
  // neck
  g.fillStyle = avatarShade(skin, -0.12);
  g.fillRect(-4, -30, 6.4, 6);
  const head =
    `M-9.4 -35.4 C-9.4 -41 -5 -44.4 0 -44.4 C5.2 -44.4 8.6 -41.4 8.8 -37.2 C8.9 -36.2 8.7 -35.4 8.9 -34.6 ` +
    `C9.5 -33.6 10.3 -32.4 ${nose} -31.3 C${nose + 0.1} -30.6 ${nose - 0.6} -30 ${nose - 1.6} -29.9 L9 -29.8 ` +
    `C9.5 -29.3 9.5 -28.8 9 -28.5 C9.3 -28.2 9.3 -27.8 8.8 -27.6 ` +
    (female
      ? `C8.8 -26.9 8.3 -26.2 7.2 -25.6 C5.8 -25.2 4.2 -25.4 3 -25.8 C0.6 -26.4 -3 -27.6 -5.6 -30.2 `
      : `C8.9 -26.8 8.6 -26.1 7.6 -25.6 C6.4 -25.2 4.6 -25.3 3.2 -25.7 C0.4 -26.2 -3 -27.2 -5.4 -29.6 `) +
    `C-8 -32.2 -9.4 -33.6 -9.4 -35.4 Z`;
  const hp = avatarSideP(head);
  g.fillStyle = skin;
  g.fill(hp);
  g.save();
  g.clip(hp);
  const sh = g.createLinearGradient(-9, 0, 10, 0); // the back of the head is a touch darker
  sh.addColorStop(0, 'rgba(90,40,20,.2)');
  sh.addColorStop(0.5, 'rgba(90,40,20,0)');
  g.fillStyle = sh;
  g.fillRect(-12, -46, 24, 22);
  g.fillStyle = 'rgba(90,40,20,.13)';
  g.beginPath();
  g.ellipse(2, -24.6, 8, 2.2, 0, 0, 6.28); // soft shadow under the jaw
  g.fill();
  g.restore();
  g.strokeStyle = 'rgba(90,40,20,.22)';
  g.lineWidth = 0.55;
  g.lineJoin = 'round';
  g.stroke(hp);
  // ear
  g.fillStyle = sd;
  g.beginPath();
  g.ellipse(-1.8, -33.2, 2, 2.7, 0.1, 0, 6.28);
  g.fill();
  g.fillStyle = skin;
  g.beginPath();
  g.ellipse(-1.6, -33.1, 1.2, 1.8, 0.1, 0, 6.28);
  g.fill();
  g.strokeStyle = 'rgba(120,60,40,.35)';
  g.lineWidth = 0.5;
  g.beginPath();
  g.moveTo(-2.6, -33.8);
  g.quadraticCurveTo(-1.2, -35, -1, -32.8);
  g.stroke();
  if (female) {
    g.fillStyle = '#f2d06a'; // stud earring
    g.beginPath();
    g.arc(-1.7, -30.3, 0.8, 0, 6.28);
    g.fill();
  }
  g.restore();
}

// Single eye, brow, nostril, mouth and (women) blush and lash wing.
function avatarFaceSide(g, x, fy, skin, hairColor, female, dir) {
  const ink = '#241c28',
    brow = avatarShade(hairColor, -0.2);
  g.save();
  g.translate(x, fy);
  g.scale(dir, 1);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  // brow
  g.strokeStyle = brow;
  g.beginPath();
  if (female) {
    g.lineWidth = 0.85;
    g.moveTo(3, -36.7);
    g.quadraticCurveTo(5.2, -38.3, 7.6, -37);
  } else {
    g.lineWidth = 1.3;
    g.moveTo(3, -36.6);
    g.lineTo(7.6, -37.3);
  }
  g.stroke();
  // eye (an almond seen from the side) with a catch-light
  g.fillStyle = ink;
  g.beginPath();
  g.ellipse(5.3, -33.8, female ? 1.15 : 1.05, female ? 1.8 : 1.6, 0.08, 0, 6.28);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,.92)';
  g.beginPath();
  g.arc(5.0, -34.5, 0.5, 0, 6.28);
  g.fill();
  g.strokeStyle = ink;
  g.lineWidth = female ? 0.9 : 0.75;
  g.beginPath();
  g.moveTo(3.9, -35.3);
  g.quadraticCurveTo(5.5, -36.3, 6.6, -35);
  if (female) {
    g.moveTo(3.9, -35.3);
    g.lineTo(2.6, -36.1); // wing flick at the outer corner
  }
  g.stroke();
  // nostril + shade under the nose
  g.fillStyle = 'rgba(110,50,30,.45)';
  g.beginPath();
  g.ellipse(9.1, -30.7, 0.45, 0.35, 0, 0, 6.28);
  g.fill();
  g.fillStyle = 'rgba(90,40,20,.14)';
  g.beginPath();
  g.ellipse(9.3, -29.6, 1.3, 0.55, 0, 0, 6.28);
  g.fill();
  if (female) {
    g.fillStyle = 'rgba(255,110,120,.3)'; // blush
    g.beginPath();
    g.ellipse(4.2, -30.2, 2.1, 1.3, 0, 0, 6.28);
    g.fill();
    g.fillStyle = '#d8707c'; // lips
    g.beginPath();
    g.ellipse(8.4, -28.2, 1.3, 0.8, 0.1, 0, 6.28);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.5)';
    g.fillRect(8, -28.6, 0.8, 0.35);
  } else {
    g.strokeStyle = '#a65a4e'; // mouth
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(6.4, -28.2);
    g.quadraticCurveTo(7.6, -27.8, 9, -28.3);
    g.stroke();
  }
  g.restore();
}

/* Profile hair. Every style = optional `back` layers (hair hanging behind the head / neck, ponytails, buns), the
 * scalp `cap`, then `front` layers (fringe, side locks, quiffs). Each layer is { d: path, dark: [...], light: [...] }. */
const AVATAR_CAP = {
  std: 'M8.7 -38.2 C9.7 -42.8 5.6 -46.6 0.4 -46.4 C-5.6 -46.2 -10.8 -42.4 -10.6 -35.6 C-10.6 -32.8 -9.2 -30.6 -8 -29.6 L-6.2 -31.8 C-5.4 -34.4 -3.8 -36.6 -2.2 -37.6 C0.4 -38.6 3.6 -38.4 5.6 -39.8 C6.8 -40.4 7.8 -39.8 8.7 -38.2 Z',
  short: 'M8.6 -38.4 C9.1 -42 5.4 -45.4 0.4 -45.3 C-5 -45.2 -9.8 -41.8 -9.8 -35.8 C-9.8 -33.6 -9 -31.8 -8.2 -30.8 L-6.6 -32.4 C-5.6 -34.8 -3.8 -36.8 -2.2 -37.6 C0.4 -38.4 3.6 -38.2 5.6 -39.6 C6.8 -40.2 7.8 -39.6 8.6 -38.4 Z',
  slick: 'M8.4 -38.8 C9.6 -43.4 5.8 -46.8 0.6 -46.8 C-5.8 -46.6 -10.8 -42.6 -10.6 -35.6 C-10.6 -32.8 -9.4 -30.8 -8.2 -29.8 L-6.4 -32 C-5.6 -34.4 -4.2 -36.4 -2.4 -37.4 C0 -38.2 3.2 -38.6 5.4 -40.2 C6.8 -41.2 7.8 -40.4 8.4 -38.8 Z',
  buzz: 'M8.5 -38.6 C9 -41.6 5.4 -44.9 0.4 -44.8 C-5 -44.8 -9.6 -41.6 -9.7 -36 C-9.7 -34 -9 -32.4 -8.4 -31.4 L-6.8 -33 C-5.8 -35 -4 -37 -2.2 -37.8 C0.4 -38.6 3.6 -38.4 5.6 -39.8 C6.8 -40.4 7.8 -39.8 8.5 -38.6 Z',
};
const AVATAR_CAP_DARK = ['M3 -45.8 Q-3 -43.4 -8 -37.4', 'M0 -46.2 Q-6 -43.4 -9.8 -37', 'M5.4 -44.4 Q0.6 -42.4 -3.6 -38.6', 'M-4 -45.6 Q-8.4 -42.6 -9.8 -35.8'];
const AVATAR_CAP_LIGHT = ['M-6 -43.6 Q0 -47.4 5.6 -44.8', 'M-1 -41.6 Q2.6 -43 6 -41.6'];
// hair hanging behind: top at the nape, hem at v, widest at w; flick = how far the ends kick out
const aBack = (v, w = 12.4, flick = 0) =>
  `M-4.4 -36.2 C-9.6 -36.8 ${-w} -31 ${-w} ${v - 8} C${-w} ${v - 3.6} ${-w - flick} ${v - 1} ${-w - flick * 1.6} ${v + flick * 0.5} ` +
  `L${-w + 3.4} ${v + 1} L${-w + 6} ${v - 0.2} L-3 ${v - 1.6} C-2.6 -22 -3.2 -28 -2.8 -33 Z`;
const aBackStr = (v, w = 12.4) => [`M-6 -35 Q${-w + 1} ${(v - 35) / 2} ${-w + 2.4} ${v - 2}`, `M-8.6 -33 Q${-w + 3} ${(v - 33) / 2} ${-w + 5.4} ${v - 1.4}`, `M-4 -33 Q-4.8 ${(v - 33) / 2} -5.6 ${v - 2.6}`];
// a lock framing the face in front of the ear, ending at v
const aSideLock = (v, u = 3.6) => `M-0.2 -38.4 C${u - 1} -37.6 ${u + 0.4} ${(v - 38) / 2} ${u} ${v - 2} C${u - 0.1} ${v - 1.2} ${u - 0.9} ${v + 0.2} ${u - 1.8} ${v} C${u - 2.1} ${v - 3.4} -1 -34.4 -1.4 -37 Z`;
const aBang = (v) => `M8.7 -38.2 C9.4 -37.6 9.6 ${v + 0.6} 9.2 ${v} C7.6 ${v - 0.4} 5.6 ${v - 1.2} 3.8 -38.6 C5.8 -39.6 7.6 -39.8 8.7 -38.2 Z`;
const aBun = (u, v, r) => `M${u - r} ${v} A${r} ${r} 0 1 1 ${u + r} ${v} A${r} ${r} 0 1 1 ${u - r} ${v} Z`;
const aBallStr = (u, v, r) => [`M${u - r * 0.6} ${v - r * 0.5} Q${u} ${v - r * 0.1} ${u + r * 0.6} ${v - r * 0.5}`, `M${u - r * 0.7} ${v + r * 0.1} Q${u} ${v + r * 0.5} ${u + r * 0.7} ${v + r * 0.1}`];

const AVATAR_HAIR_SIDE = {
  /* ---- men ---- */
  short: {
    cap: 'short',
    front: [
      { d: 'M-8.4 -40.6 L-10.2 -45.4 L-4.8 -42.8 Z M-5 -43 L-5 -48.2 L-0.2 -44 Z M-0.8 -44.4 L1.2 -49.4 L4 -43.8 Z M3.4 -43.6 L6.8 -47.4 L7.4 -41.8 Z M6.8 -41.8 L10.8 -43.4 L9.2 -38.8 Z', dark: [] },
      { d: 'M4.4 -39.8 L7.6 -36.4 L9.6 -38.6 C9.4 -39.2 9.1 -38.8 8.7 -38.2 C7.4 -39.6 6 -40.2 4.4 -39.8 Z' },
    ],
  },
  taper: { cap: 'std', front: [{ d: 'M-6 -45.4 C-2 -50.6 6 -49.6 9.8 -43.6 C9.6 -41.6 9.2 -40.6 8.7 -38.2 C7.4 -39.6 6 -40 3 -40.2 C-2 -42 -5 -41 -6 -45.4 Z', light: ['M-3 -46.6 Q2 -49 7 -46'] }], fade: true },
  twoblock: {
    cap: 'std',
    front: [{ d: 'M0 -46.8 C5.6 -47 10.2 -43.4 9.8 -37.4 C9.4 -36.4 8.8 -36.4 8.2 -37.4 C6.6 -38.2 5 -37.6 3.6 -38.4 C2 -38 1 -39.4 -0.6 -42 C-1.8 -44 -1.8 -46 0 -46.8 Z', dark: ['M3.4 -46 Q5.8 -42.6 5.4 -38.8', 'M6.6 -45.4 Q8.8 -42 8.6 -38.2'], light: ['M-0.6 -45.8 Q4 -47.4 7.6 -44.6'] }],
  },
  comma: {
    cap: 'std',
    front: [{ d: 'M8.7 -38.2 C10.2 -38.4 10.6 -35.8 9.4 -34.4 C8.8 -33.8 7.6 -34.4 8 -35.4 C8.4 -36.2 8.6 -36.6 7.6 -37.2 C6 -38 4.4 -38.2 3 -37.8 C4.6 -40 7.4 -40.4 8.7 -38.2 Z', light: ['M4.4 -38.8 Q7 -39.2 8.6 -37'] }, { d: 'M-4 -46 C0 -49.4 7.4 -48.6 9.6 -43.4 C9.4 -41.4 9.2 -40.4 8.7 -38.2 C6 -41.6 -1 -43 -4.6 -42.4 Z', light: ['M-1 -46.8 Q4 -48.6 8 -45'] }],
  },
  curtains: { cap: 'std', front: [{ d: 'M8.7 -38.2 C9.3 -37.4 8.4 -36.8 7.2 -37.6 C5.8 -38.4 3.6 -37.8 2 -36.2 C1.4 -34 1.6 -32 2.4 -30.2 C1.2 -30 0 -31.6 -0.6 -34 C-1 -36 -2 -37.6 -2.4 -38 C0.4 -38.8 3.6 -38.4 5.6 -39.8 C6.8 -40.4 7.8 -39.8 8.7 -38.2 Z', dark: ['M3.6 -38 Q2.6 -34 3 -31'] }] },
  quiff: {
    cap: 'std',
    front: [{ d: 'M-3 -45.6 C0 -52.4 9 -53.2 12.2 -48 C13 -45.2 11.2 -42.4 9.6 -41 L8.7 -38.2 C7.6 -40.2 5 -41.2 2 -41.4 C-1.4 -41.6 -3.4 -43.4 -3 -45.6 Z', dark: ['M0 -48.4 Q6 -50.4 10.6 -46.4', 'M2 -45.2 Q7 -47 9.6 -43.6'], light: ['M-1 -47.6 Q5 -52 11 -48.4'] }],
  },
  slick: { cap: 'slick', front: [{ d: 'M8.4 -38.8 C8.8 -40.8 7.4 -41.8 5.6 -41.2 C3 -40.4 0 -40.4 -2.6 -38.6 C-1 -41.6 3 -42.8 6 -42.4 C7.6 -42.2 8.6 -41 8.4 -38.8 Z', light: ['M-1 -41 Q3 -42.4 7 -41.8'] }] },
  buzz: { cap: 'buzz', front: [], buzz: true },
  mullet: { back: [{ d: aBack(-22, 11.4, 0), dark: aBackStr(-22, 11.4) }], cap: 'std', front: [{ d: 'M8.7 -38.2 C9 -37.2 8.6 -36.4 7.6 -37 C6 -37.8 4 -37.4 2.6 -38 C4 -40 7.4 -40.2 8.7 -38.2 Z' }] },
  manbun: { back: [{ d: aBun(-1.6, -49.6, 3.7), dark: aBallStr(-1.6, -49.6, 3.7), light: ['M-3.6 -52 Q-1.6 -53.4 0.4 -52'] }], cap: 'slick', front: [{ d: 'M-4.4 -46.2 L2 -46.4 L1.4 -45.4 L-4.2 -45.2 Z', fill: '#2a2230' }] },
  curlytop: {
    cap: 'short',
    front: [{ d: 'M-8 -42 A3.4 3.4 0 1 1 -3.6 -46.6 A3.4 3.4 0 1 1 1.4 -48 A3.4 3.4 0 1 1 6.4 -46.6 A3.4 3.4 0 1 1 9.4 -42.4 A3 3 0 1 1 8.2 -39.6 C6 -40 5 -40.2 3.6 -40.6 C-1 -42 -4 -41.4 -8 -42 Z', dark: ['M-5.4 -44.6 Q-3.6 -43.2 -2 -44.6', 'M-0.4 -46 Q1.4 -44.6 3.2 -46', 'M4 -44.6 Q5.8 -43.2 7.4 -44.8'], light: ['M-6.4 -46.6 Q-3.8 -48.6 -1.6 -47.2', 'M2 -49.4 Q4.6 -49.4 6 -47.6'] }],
  },
  flow: {
    back: [{ d: aBack(-26, 11.6, 0.6), dark: aBackStr(-26, 11.6) }],
    cap: 'std',
    front: [{ d: 'M8.7 -38.2 C9.6 -37.2 9.2 -35.6 8 -35.8 C6.6 -36.8 5 -37.6 3 -37.8 C1 -37.4 -1 -36.8 -2.4 -36 L-2.2 -37.6 C0.4 -38.6 3.6 -38.4 5.6 -39.8 C6.8 -40.4 7.8 -39.8 8.7 -38.2 Z', dark: ['M7.6 -37.6 Q5 -38 2.6 -37.4'] }],
  },
  bald: null,
  /* ---- women ---- */
  butterfly: { back: [{ d: aBack(-16, 12.8, 1.6), dark: aBackStr(-16, 12.8), light: ['M-9.8 -33 Q-12 -26 -11 -19'] }], cap: 'std', front: [{ d: aBang(-37.4), dark: [] }, { d: aSideLock(-27, 3.4), light: ['M1 -37 Q2.6 -33 2.4 -29'] }] },
  curtainlong: { back: [{ d: aBack(-12, 12.6, 0.6), dark: aBackStr(-12, 12.6) }], cap: 'std', front: [{ d: 'M8.7 -38.2 C9 -37.6 8 -36.8 6.8 -37.4 C5.4 -38.2 3.6 -37.4 2.4 -36 C1.4 -33 1.6 -30 2.4 -26.6 C1 -26.4 -0.4 -29.6 -0.8 -33 C-1.2 -35.6 -1.8 -37 -2.4 -37.8 C0.4 -38.8 3.6 -38.4 5.6 -39.8 C6.8 -40.4 7.8 -39.8 8.7 -38.2 Z', dark: ['M3 -37 Q2.4 -32 3 -28'] }] },
  wolfcut: { back: [{ d: aBack(-19, 12.6, 2.2) + ' M-10.8 -22 L-14.4 -19 L-11.6 -18.6 Z M-8 -20 L-10.4 -16 L-6.8 -18.2 Z', dark: aBackStr(-19, 12.6) }], cap: 'std', front: [{ d: 'M-5 -45 C-1 -49.4 7.6 -49 10.4 -43 C10 -41.6 9.4 -40 8.7 -38.2 L7.6 -36.2 L6 -38 L4.2 -36 L2.6 -38.4 L0.6 -36.4 L-0.8 -38.8 C-4 -40.4 -5.6 -42.4 -5 -45 Z', dark: ['M2 -46.6 Q4 -42.6 3.6 -38.6', 'M6 -45.8 Q7.6 -42.4 7 -38.4'], light: ['M-2 -46.6 Q3 -49 8 -46'] }, { d: aSideLock(-29, 3.2) }] },
  frenchbob: { back: [{ d: aBack(-25.4, 11.4, -0.6), dark: aBackStr(-25.4, 11.4) }], cap: 'std', front: [{ d: 'M8.9 -38 C10 -37 9.8 -36.6 9.2 -36.4 C7.4 -36.8 5.4 -37 3.6 -36.8 C1.6 -36.6 0 -36.6 -1.6 -36.2 L-2.2 -37.6 C0.4 -38.6 3.6 -38.4 5.6 -39.8 C6.8 -40.4 7.8 -39.8 8.9 -38 Z' }, { d: aSideLock(-26.4, 3.8) }] },
  lob: { back: [{ d: aBack(-22, 12, 1.8), dark: aBackStr(-22, 12) }], cap: 'std', front: [{ d: 'M8.7 -38.2 C9.4 -37.4 8.6 -36.6 7.2 -37.2 C5.6 -37.8 3.8 -37.4 2.4 -36.4 C1.4 -34 1.6 -31.4 2.6 -28.4 C1.4 -28.2 0 -30.6 -0.6 -33.4 C-1 -35.4 -1.6 -37 -2.2 -37.6 C0.4 -38.6 3.6 -38.4 5.6 -39.8 C6.8 -40.4 7.8 -39.8 8.7 -38.2 Z' }] },
  hime: { back: [{ d: aBack(-11, 12.4, 0), dark: aBackStr(-11, 12.4) }], cap: 'std', front: [{ d: 'M8.9 -38 C10.2 -37.2 10.2 -36.4 9.4 -36.2 C7.6 -36.6 5.6 -36.8 3.8 -36.6 C1.8 -36.4 0 -36.4 -1.6 -36.2 L-2.2 -37.6 C0.4 -38.6 3.6 -38.4 5.6 -39.8 C6.8 -40.4 7.8 -39.8 8.9 -38 Z' }, { d: aSideLock(-24.6, 3.6), light: ['M1.2 -37 Q2.6 -32 2.4 -27'] }] },
  highpony: {
    back: [{ d: 'M-8.6 -43.6 C-13.8 -46.4 -17.4 -42 -16.4 -36.6 C-15.6 -32 -13.4 -28.4 -11.2 -25.2 C-10 -27 -9.4 -29.4 -9.4 -32 C-8.6 -36 -8.4 -40 -8.6 -43.6 Z', dark: ['M-12 -43.6 Q-14.6 -37 -11.6 -27.6', 'M-10 -44 Q-11.6 -36 -10 -30'], light: ['M-13.6 -42.6 Q-15.4 -38 -14 -33'] }],
    cap: 'slick',
    front: [{ d: 'M-8.4 -43.8 L-11 -44.2 L-11.2 -40.8 L-8.6 -40.4 Z', fill: '#e07ab0' }, { d: 'M8.4 -38.8 C8.8 -40 7.4 -40.4 5.6 -40 C3 -39.4 0.6 -38.8 -1.4 -37.6 C0.6 -39.8 4 -41 6.4 -41 C7.8 -41 8.6 -40 8.4 -38.8 Z' }],
  },
  lowbun: { back: [{ d: aBun(-11.4, -30.4, 3.9), dark: aBallStr(-11.4, -30.4, 3.9), light: ['M-13.6 -32.6 Q-11.6 -34 -9.6 -32.8'] }], cap: 'slick', front: [{ d: 'M-10.6 -32.4 L-8.2 -29.6 L-9.8 -28.2 L-12.4 -31 Z', fill: '#e07ab0' }] },
  clawclip: { back: [{ d: aBack(-20, 12, 1.2), dark: aBackStr(-20, 12) }], cap: 'std', front: [{ d: 'M-12.4 -42.4 L-8.6 -43.6 L-7.4 -37.6 L-11.2 -36.6 Z', fill: '#d9b24a', dark: ['M-11.4 -41 L-9.6 -41.6', 'M-10.8 -38.8 L-8.8 -39.4'] }, { d: aSideLock(-28.4, 3.2) }] },
  pixie: { cap: 'short', front: [{ d: 'M8.6 -38.4 C9.8 -37.4 9.4 -35.8 8.4 -36 C7 -36.8 5 -37.2 3.2 -37.8 C4.6 -40 7.4 -40.4 8.6 -38.4 Z' }, { d: 'M-7.4 -41.6 L-8.8 -45.6 L-4 -43.6 Z M-4.4 -44 L-3.8 -47.8 L0 -44.8 Z M-0.4 -45 L1.8 -48.4 L3.6 -44.2 Z' }], nape: true },
  twinbuns: {
    back: [{ d: aBun(-3.2, -47.2, 3.9), fill: 'DARK', dark: [] }, { d: aBun(-0.4, -47.6, 4.1), dark: aBallStr(-0.4, -47.6, 4.1), light: ['M-2.6 -50 Q-0.4 -51.6 1.8 -50'] }],
    cap: 'slick',
    front: [{ d: 'M8.4 -38.8 C9.2 -37.8 8.4 -36.8 7 -37.4 C5.6 -38 4 -37.8 2.6 -38.4 C4 -40.2 7 -40.4 8.4 -38.8 Z' }],
  },
  braid: {
    back: [{ d: 'M-8.4 -33 C-14 -30 -13.6 -23 -11 -18 C-9 -14.4 -7 -11.6 -4.8 -10 C-3.8 -11.8 -4.2 -14 -4.8 -16 C-5.4 -20 -4.8 -26 -4.6 -31 Z', dark: ['M-12 -29 Q-9.6 -22 -6.6 -14', 'M-10.4 -30 Q-8.4 -22 -6 -13', 'M-8.6 -23.6 L-6.2 -25', 'M-9.4 -19.6 L-6.8 -21', 'M-8.4 -15.6 L-5.8 -17'], light: ['M-12.4 -27 Q-10.6 -21 -8.4 -16'] }],
    cap: 'std',
    front: [{ d: 'M-6.4 -33.6 L-2.4 -31.6 L-3.4 -29.4 L-7.6 -31.4 Z', fill: '#e07ab0' }, { d: 'M8.7 -38.2 C9.4 -37.6 8.6 -36.6 7.2 -37.2 C5.6 -37.8 3.8 -37.2 2.4 -36 L-2.2 -37.6 C0.4 -38.6 3.6 -38.4 5.6 -39.8 C6.8 -40.4 7.8 -39.8 8.7 -38.2 Z' }],
  },
  curly: {
    back: [{ d: 'M-6 -37 C-12 -41 -15 -36 -13 -32 C-16.6 -30 -15 -25 -12.4 -24.4 C-14 -20.4 -10.6 -17.6 -7.6 -19.4 C-6 -17.6 -3.4 -19 -3.4 -21.4 C-2.4 -26 -3 -32 -3 -35 Z', dark: ['M-12 -35 Q-10 -33 -8 -35', 'M-12.6 -28.6 Q-10 -26.6 -7.6 -28.6', 'M-10 -22.4 Q-7.6 -20.6 -5.6 -22.4'], light: ['M-13 -36.4 Q-11 -38.6 -8.6 -37'] }],
    cap: 'std',
    front: [{ d: 'M-7 -42.6 A3.6 3.6 0 1 1 -2.4 -46.8 A3.6 3.6 0 1 1 3 -48.2 A3.6 3.6 0 1 1 8 -45.6 A3.2 3.2 0 1 1 9.8 -41.2 A2.8 2.8 0 1 1 8.5 -38.4 C6 -39.6 4.4 -39.8 2.6 -39.6 C-2 -41 -5 -40.6 -7 -42.6 Z', dark: ['M-4.6 -45 Q-2.6 -43.4 -0.8 -45', 'M1 -46.4 Q3 -44.8 4.8 -46.4', 'M5.6 -44 Q7.4 -42.6 8.4 -44.4'], light: ['M-5.8 -46.6 Q-3 -48.8 -0.8 -47.4', 'M3 -49.4 Q5.6 -49.4 7 -47.6'] }, { d: aSideLock(-29, 3.2) }],
  },
};

function avatarHairSide(g, x, fy, style, color, dir) {
  const def = AVATAR_HAIR_SIDE[style];
  if (!def) return; // bald (or an unknown style)
  const lum = parseInt(color.slice(1, 3), 16) * 0.3 + parseInt(color.slice(3, 5), 16) * 0.59 + parseInt(color.slice(5, 7), 16) * 0.11;
  const D = avatarShade(color, -0.36),
    L = avatarShade(color, lum < 90 ? 0.6 : 0.38),
    OUT = avatarShade(color, -0.55);
  g.save();
  g.translate(x, fy);
  g.scale(dir, 1);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const layer = (l, alpha) => {
    const p = avatarSideP(l.d);
    g.globalAlpha = alpha === undefined ? 1 : alpha;
    g.fillStyle = l.fill === 'DARK' ? D : l.fill || color;
    g.fill(p);
    g.save();
    g.clip(p);
    const sh = g.createLinearGradient(-13, 0, 11, 0); // back / far side darker, front a touch lighter
    sh.addColorStop(0, 'rgba(0,0,0,.34)');
    sh.addColorStop(0.55, 'rgba(0,0,0,0)');
    sh.addColorStop(1, 'rgba(255,255,255,.07)');
    g.fillStyle = sh;
    g.fillRect(-20, -58, 36, 50);
    g.strokeStyle = D;
    g.lineWidth = 0.7;
    for (const s of l.dark || []) g.stroke(avatarSideP(s));
    g.strokeStyle = L;
    g.lineWidth = 0.85;
    for (const s of l.light || []) g.stroke(avatarSideP(s));
    g.restore();
    g.strokeStyle = OUT;
    g.globalAlpha = (alpha === undefined ? 1 : alpha) * 0.45;
    g.lineWidth = 0.6;
    g.stroke(p);
    g.globalAlpha = 1;
  };
  for (const l of def.back || []) layer(l);
  const capD = AVATAR_CAP[def.cap || 'std'];
  layer({ d: capD, dark: AVATAR_CAP_DARK, light: AVATAR_CAP_LIGHT });
  if (def.fade) {
    // taper fade: skin shows through where the sides and nape are cut close
    g.save();
    g.clip(avatarSideP(capD));
    g.fillStyle = 'rgba(244,208,168,.5)';
    g.beginPath();
    g.moveTo(-12, -37);
    g.bezierCurveTo(-6, -36, -2, -37.5, 0, -39);
    g.lineTo(-2, -27);
    g.lineTo(-12, -27);
    g.fill();
    g.restore();
  }
  if (def.nape) {
    g.save();
    g.clip(avatarSideP(capD));
    g.fillStyle = 'rgba(0,0,0,.14)';
    g.fillRect(-12, -35, 10, 8);
    g.restore();
  }
  if (def.buzz) {
    g.save();
    g.clip(avatarSideP(capD));
    g.fillStyle = 'rgba(244,208,168,.38)';
    g.fillRect(-12, -46, 24, 20);
    g.restore();
  }
  for (const l of def.front || []) layer(l);
  g.restore();
}

// Class outfits in profile (the torso is already filled with the outfit colour and the clip is set).
// Every class gets its own side look: where the pockets, straps, buckles, hood and plates sit when seen from the side.
function avatarSideOutfit({ g, x, fy, bw, female, cloth, o, dir }) {
  const d = dir,
    h = bw / 2,
    l = x - h,
    r = x + h,
    dk = (k) => avatarShade(cloth, k);
  const X = (v) => x + d * v; // v > 0: toward the front of the body, v < 0: toward the back
  const P = (pts, fill) => avatarPoly(g, pts, fill);
  const R = (a, y, w, ht, fill) => {
    g.fillStyle = fill;
    g.fillRect(Math.min(X(a), X(a + w)), y, w, ht);
  };
  const line = (pts, col, w) => {
    g.strokeStyle = col;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
    g.stroke();
  };
  const oval = (cx, cy, rx, ry, fill) => {
    g.fillStyle = fill;
    g.beginPath();
    g.ellipse(cx, cy, rx, ry, 0, 0, 6.28);
    g.fill();
  };
  if (o.job === 'waif') {
    // hoodie: hood bunched at the back of the neck, pocket + drawstring on the front, ribbed hem
    oval(X(-3.4), fy - 27, 4.8, 3.3, dk(-0.3));
    R(-h, fy - 11, bw, 3, dk(-0.22));
    R(-1.6, fy - 26, 1, 15, 'rgba(0,0,0,.14)'); // side seam
    P([X(0.8), fy - 18, X(h + 0.5), fy - 17, X(h + 0.5), fy - 11, X(0.8), fy - 11], dk(-0.14));
    R(0.8, fy - 18, h - 0.3, 0.8, 'rgba(0,0,0,.2)');
    R(h - 3, fy - 26, 1, 7, '#f4f4f4');
  } else if (o.job === 'assassin') {
    // techwear jacket in profile: dark panel, glowing front piping, stand-up collar, harness strap, belt + hip pouch
    const jacket = dk(-0.62),
      jacketHi = dk(-0.5),
      trim = dk(0.45);
    P([l, fy - 27.5, r, fy - 27.5, r, fy - 11, l, fy - 11], jacket);
    R(-h, fy - 27.5, 2.6, 16.5, jacketHi); // back seam
    line([X(h - 0.8), fy - 27, X(h - 0.8), fy - 11], trim, 0.9);
    P([X(-h), fy - 30.4, X(2.4), fy - 30.4, X(3), fy - 26.4, X(-h), fy - 26.4], jacket); // collar
    R(-h, fy - 26.6, h + 3, 0.8, trim);
    line([X(-h + 1), fy - 25.5, X(h - 1), fy - 13], '#2b2b36', 1.8); // harness strap
    R(-h, fy - 13.5, bw, 2.6, '#2b2b36'); // belt
    R(-h, fy - 11.4, bw, 0.7, '#ff4d6d');
    R(h - 3.2, fy - 13.8, 3, 3.2, '#c9ced4'); // buckle
    R(-3.4, fy - 11, 5, 4.2, jacketHi); // hip pouch
    R(-3.4, fy - 11, 5, 0.8, trim);
  } else if (o.job === 'swordsman') {
    // mercenary: leather jacket with the cream tee peeking at the front, strap, belt + gold buckle, scarf tail, pauldron
    const lea = '#6a4426',
      leaD = avatarShade(lea, -0.12);
    P([l, fy - 27.5, r, fy - 27.5, r, fy - 9, l, fy - 9], lea);
    R(-h, fy - 27.5, h - 1, 18.5, leaD); // shaded back half
    R(h - 1.8, fy - 27.5, 1.8, 18, '#e9e2d0'); // tee at the opening
    P([X(2.4), fy - 29, X(h + 1), fy - 27, X(h - 0.4), fy - 22.4, X(1.6), fy - 25], avatarShade(lea, 0.12)); // lapel
    line([X(-h + 0.6), fy - 26.4, X(h - 0.8), fy - 13.4], '#3a2616', 1.6); // strap
    R(-h, fy - 14.4, bw, 2.6, '#3a2616'); // belt
    R(h - 3.4, fy - 14.6, 3.4, 3, '#d9b24a');
    R(-h, fy - 28.2, bw - 0.6, 2.4, cloth); // scarf
    P([X(-h - 0.4), fy - 27, X(-h + 3), fy - 27, X(-h + 2.6), fy - 17, X(-h - 0.6), fy - 19.4], dk(-0.1)); // scarf tail
    P([l, fy - 9, r, fy - 9, r - 0.6, fy - 9 + 5 * AVATAR_SIDE_OPT.hem, l + 0.6, fy - 9 + 5 * AVATAR_SIDE_OPT.hem], leaD); // hem
    oval(x, fy - 26.2, 4.2, 3, '#8d95a0'); // pauldron
    g.strokeStyle = '#5a626d';
    g.lineWidth = 0.9;
    g.beginPath();
    g.ellipse(x, fy - 26.2, 4.2, 3, 0, 0, 6.28);
    g.stroke();
    R(-2, fy - 28, 3.4, 0.9, 'rgba(255,255,255,.4)');
  } else if (o.job === 'knight') {
    // paladin: black top, breast plate at the front, back plate behind, tasset over the hip, pauldron, gold trim
    const sil = '#c9ced4',
      gold = '#d9b24a',
      blk = '#1c1c24';
    P([l, fy - 27.5, r, fy - 27.5, r, fy - 10, l, fy - 10], '#2c2c38');
    const front = [X(-0.6), fy - 27, X(h + 0.4), fy - 27, X(h - 0.2), fy - 15, X(1.8), fy - 11.6, X(-0.6), fy - 12];
    P(front, sil);
    P([X(-0.6), fy - 27, X(h + 0.4), fy - 27, X(h + 0.4), fy - 25, X(-0.6), fy - 25.4], 'rgba(255,255,255,.3)');
    P([X(-h + 0.2), fy - 27, X(-h + 3.2), fy - 27, X(-h + 3.4), fy - 13.4, X(-h + 0.4), fy - 14], avatarShade(sil, -0.15)); // back plate
    g.strokeStyle = gold;
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(front[0], front[1]);
    for (let i = 2; i < front.length; i += 2) g.lineTo(front[i], front[i + 1]);
    g.closePath();
    g.stroke();
    R(h - 2.4, fy - 22, 1.6, 6, gold); // edge of the cross
    R(-h, fy - 13.6, bw, 2.6, blk); // belt
    R(h - 3.6, fy - 13.8, 3.4, 3, gold);
    P([X(-4), fy - 11, X(4), fy - 11, X(3.4), fy - 11 + 6.4 * AVATAR_SIDE_OPT.hem, X(-3.4), fy - 11 + 6 * AVATAR_SIDE_OPT.hem], sil); // tasset
    R(-4, fy - 11, 8, 0.7, gold);
    oval(x, fy - 26, 4.4, 3.6, sil); // pauldron
    g.strokeStyle = gold;
    g.lineWidth = 1;
    g.beginPath();
    g.ellipse(x, fy - 26, 4.4, 3.6, 0, 0, 6.28);
    g.stroke();
    R(-2.4, fy - 28, 4, 0.9, 'rgba(255,255,255,.4)');
  } else if (o.job === 'archer') {
    // utility vest: chest pocket + belt clip at the front, darker back half
    const vest = '#566a3a';
    P([l + 0.5, fy - 26, r - 0.5, fy - 26, r - 0.5, fy - 12, l + 0.5, fy - 12], vest);
    R(-h + 0.5, fy - 26, 5, 14, 'rgba(0,0,0,.13)');
    R(1.8, fy - 21, 3.6, 4.2, '#3d4b28'); // chest pocket
    R(1.8, fy - 21, 3.6, 1, '#8fa066');
    R(-h, fy - 13, bw, 2.2, '#2a2a2a'); // belt
    R(h - 3.2, fy - 13.2, 2.6, 2.6, '#c9ced4'); // clip
  } else if (o.job === 'ranger') {
    // parka: hood bunched behind the neck, long skirt with a side slit, zip at the front, belt + side pouch
    oval(X(-3.4), fy - 27, 5.2, 3.5, dk(-0.38));
    P([l, fy - 11, r, fy - 11, r + 0.4, fy - 11 + 7.6 * AVATAR_SIDE_OPT.hem, l - 0.4, fy - 11 + 7.6 * AVATAR_SIDE_OPT.hem], dk(-0.12)); // skirt
    R(-0.6, fy - 11, 0.8, 7.6 * AVATAR_SIDE_OPT.hem, dk(-0.3)); // slit
    R(h - 1.8, fy - 27, 1.2, 16, dk(-0.3)); // zip
    R(-h, fy - 15, bw, 2.4, '#3a2a1a'); // belt
    R(h - 3.6, fy - 15.2, 2.8, 2.8, '#d9b24a');
    R(-3.6, fy - 12.4, 4.6, 4.4, '#5a3c22'); // side pouch
    R(0.4, fy - 21, 4, 3, dk(0.3)); // flap pocket
  }
}

/* ---------- class outfits (original fantasy versions, used when AVATAR_HIDE_ARMOR is false) ---------- */

// Waif / Assassin: leather vest with crossed straps (Waif) or a dark high-collared coat (Assassin).
function avatarWaifOutfit({ g, x, fy, bw, female, cloth, t2 }) {
  const l = x - bw / 2;
  if (!t2) {
    // open vest over a lighter shirt
    g.fillStyle = avatarShade(cloth, 0.35);
    g.fillRect(x - 3, fy - 27, 6, 13);
    g.fillStyle = '#5b3c24';
    g.beginPath(); // vest panels
    g.moveTo(l, fy - 27);
    g.lineTo(x - 3, fy - 27);
    g.lineTo(x - 1, fy - 14);
    g.lineTo(l, fy - 14);
    g.fill();
    g.beginPath();
    g.moveTo(l + bw, fy - 27);
    g.lineTo(x + 3, fy - 27);
    g.lineTo(x + 1, fy - 14);
    g.lineTo(l + bw, fy - 14);
    g.fill();
    g.strokeStyle = '#3a2616'; // lacing
    g.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.moveTo(x - 2, fy - 24 + i * 4);
      g.lineTo(x + 2, fy - 22 + i * 4);
      g.stroke();
    }
    // belt + buckle + pouch
    g.fillStyle = '#3a2616';
    g.fillRect(l, fy - 14, bw, 3);
    g.fillStyle = '#d9b24a';
    g.fillRect(x - 2, fy - 14, 4, 3);
    g.fillStyle = '#6b4a2a';
    g.fillRect(l + bw - 6, fy - 12, 5, 5);
    if (female) {
      g.fillStyle = avatarShade(cloth, -0.3);
      g.fillRect(x - 10, fy - 6.5, 20, 1.5);
    }
  } else {
    // assassin coat: dark lapels, silver studs, red sash, pauldron, coat tails
    g.fillStyle = '#17122e';
    g.beginPath();
    g.moveTo(l, fy - 27);
    g.lineTo(x - 1, fy - 27);
    g.lineTo(x - 4, fy - 12);
    g.lineTo(l, fy - 12);
    g.fill();
    g.beginPath();
    g.moveTo(l + bw, fy - 27);
    g.lineTo(x + 1, fy - 27);
    g.lineTo(x + 4, fy - 12);
    g.lineTo(l + bw, fy - 12);
    g.fill();
    g.fillStyle = '#c9ced4'; // studs
    for (let i = 0; i < 3; i++) {
      g.fillRect(x - 0.7, fy - 24 + i * 4, 1.4, 1.4);
    }
    g.fillStyle = '#b3263a'; // sash
    g.beginPath();
    g.moveTo(l, fy - 15);
    g.lineTo(l + bw, fy - 15);
    g.lineTo(l + bw, fy - 11);
    g.lineTo(l, fy - 11);
    g.fill();
    g.fillRect(x + 2, fy - 11, 3, 8); // hanging sash end
    g.fillStyle = '#7a1626';
    g.fillRect(x + 2, fy - 5, 3, 1.5);
    g.fillStyle = '#2a2140'; // shoulder pauldron
    g.beginPath();
    g.ellipse(l - 1, fy - 25, 4.5, 3.2, 0, 0, 6.28);
    g.fill();
    g.strokeStyle = '#c9ced4';
    g.lineWidth = 1;
    g.stroke();
    if (female) {
      g.fillStyle = '#17122e';
      g.fillRect(x - 10, fy - 7, 20, 2);
    } else {
      g.fillStyle = '#17122e'; // coat tails
      g.beginPath();
      g.moveTo(l, fy - 9);
      g.lineTo(l + bw, fy - 9);
      g.lineTo(l + bw - 1, fy - 3);
      g.lineTo(x + 3, fy - 5);
      g.lineTo(x, fy - 3);
      g.lineTo(x - 3, fy - 5);
      g.lineTo(l + 1, fy - 3);
      g.fill();
    }
  }
}

function avatarScarf({ g, x, fy, bw, cloth, t2, side, facingUp }) {
  if (t2) {
    // raised collar
    g.fillStyle = '#17122e';
    g.beginPath();
    g.moveTo(x - 8, fy - 27);
    g.lineTo(x - 6, fy - 31);
    g.lineTo(x - 2, fy - 27);
    g.lineTo(x + 2, fy - 27);
    g.lineTo(x + 6, fy - 31);
    g.lineTo(x + 8, fy - 27);
    g.fill();
    return;
  }
  g.fillStyle = avatarShade(cloth, -0.25);
  g.fillRect(x - 7, fy - 28, 14, 3.5);
  g.fillStyle = avatarShade(cloth, -0.1);
  g.beginPath(); // scarf tail
  g.moveTo(x + side * 6, fy - 26);
  g.lineTo(x + side * 10, fy - 25);
  g.lineTo(x + side * 11, fy - 17);
  g.lineTo(x + side * 7, fy - 19);
  g.fill();
}

// Swordsman / Knight: steel chest plate and pauldrons; Knight is gold-trimmed with a cross tabard.
function avatarSwordsmanOutfit({ g, x, fy, bw, female, cloth, t2 }) {
  const l = x - bw / 2;
  const steel = t2 ? '#e8d27a' : '#c9ced4';
  const steelDk = t2 ? '#b8923a' : '#8d95a0';
  // chest plate
  g.fillStyle = steel;
  avatarRound(g, l + 2, fy - 26, bw - 4, 11, 3);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)';
  g.fillRect(l + 3, fy - 25, 3, 8);
  g.fillStyle = steelDk;
  g.fillRect(x - 0.5, fy - 26, 1, 11);
  // belt
  g.fillStyle = '#4a3220';
  g.fillRect(l, fy - 14.5, bw, 3.5);
  g.fillStyle = '#d9b24a';
  g.fillRect(x - 2.5, fy - 14.5, 5, 3.5);
  // tabard (outfit color) hanging below the belt
  g.fillStyle = cloth;
  g.beginPath();
  g.moveTo(x - 4.5, fy - 11);
  g.lineTo(x + 4.5, fy - 11);
  g.lineTo(x + 4, fy - 3);
  g.lineTo(x, fy - 5);
  g.lineTo(x - 4, fy - 3);
  g.fill();
  if (t2) {
    g.fillStyle = '#fff6d0'; // cross emblem
    g.fillRect(x - 0.8, fy - 10, 1.6, 5);
    g.fillRect(x - 2.2, fy - 8.5, 4.4, 1.6);
    g.fillStyle = cloth; // chest cross
    g.fillRect(x - 0.8, fy - 24, 1.6, 7);
    g.fillRect(x - 3, fy - 22, 6, 1.6);
  } else {
    g.fillStyle = 'rgba(0,0,0,.25)';
    g.fillRect(x - 0.5, fy - 11, 1, 7);
  }
  // pauldrons
  for (const sx of [l - 1.5, l + bw + 1.5]) {
    g.fillStyle = steel;
    g.beginPath();
    g.ellipse(sx, fy - 25, 4.8, 3.6, 0, 0, 6.28);
    g.fill();
    g.strokeStyle = steelDk;
    g.lineWidth = 1;
    g.stroke();
    if (t2) {
      g.fillStyle = '#e0604d';
      g.fillRect(sx - 0.8, fy - 26, 1.6, 2.4);
    }
  }
  if (female) {
    g.fillStyle = steelDk; // skirt plates
    g.fillRect(x - 10, fy - 7, 20, 2);
    g.fillStyle = cloth;
    g.fillRect(x - 3, fy - 13, 6, 8);
  }
}

// Archer / Ranger: tunic with leather vest, collar and belt pouch; Ranger adds a leaf-edged mantle.
function avatarArcherOutfit({ g, x, fy, bw, female, cloth, t2 }) {
  const l = x - bw / 2;
  const leather = t2 ? '#5a3c22' : '#7a5230';
  // leather vest
  g.fillStyle = leather;
  g.beginPath();
  g.moveTo(l + 1, fy - 26);
  g.lineTo(x - 3, fy - 26);
  g.lineTo(x - 1.5, fy - 14);
  g.lineTo(l + 1, fy - 14);
  g.fill();
  g.beginPath();
  g.moveTo(l + bw - 1, fy - 26);
  g.lineTo(x + 3, fy - 26);
  g.lineTo(x + 1.5, fy - 14);
  g.lineTo(l + bw - 1, fy - 14);
  g.fill();
  g.strokeStyle = '#d8c79a'; // lacing
  g.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.moveTo(x - 2, fy - 24 + i * 3);
    g.lineTo(x + 2, fy - 22.5 + i * 3);
    g.stroke();
  }
  // belt, buckle, pouch
  g.fillStyle = '#3a2616';
  g.fillRect(l, fy - 14.5, bw, 3);
  g.fillStyle = '#d9b24a';
  g.fillRect(x - 2, fy - 14.5, 4, 3);
  g.fillStyle = leather;
  g.fillRect(l + bw - 6, fy - 12, 5, 5);
  g.fillStyle = '#d8c79a';
  g.fillRect(l + bw - 4.5, fy - 12, 2, 1.2);
  // leaf-trim collar
  g.fillStyle = avatarShade(cloth, 0.3);
  g.beginPath();
  g.moveTo(x - 7, fy - 27);
  g.lineTo(x - 3, fy - 24);
  g.lineTo(x, fy - 27);
  g.lineTo(x + 3, fy - 24);
  g.lineTo(x + 7, fy - 27);
  g.fill();
  if (t2) {
    // ranger mantle over the shoulders, zig-zag leaf hem
    g.fillStyle = avatarShade(cloth, -0.25);
    g.beginPath();
    g.moveTo(l - 4, fy - 26);
    g.lineTo(l + bw + 4, fy - 26);
    g.lineTo(l + bw + 4, fy - 19);
    for (let i = 0; i < 6; i++) {
      g.lineTo(l + bw + 4 - ((bw + 8) * (i + 0.5)) / 6, fy - 15);
      g.lineTo(l + bw + 4 - ((bw + 8) * (i + 1)) / 6, fy - 19);
    }
    g.fill();
    g.fillStyle = '#d9b24a'; // clasp
    g.beginPath();
    g.arc(x, fy - 25, 1.8, 0, 6.28);
    g.fill();
  }
  if (female) {
    g.fillStyle = avatarShade(cloth, 0.3);
    for (let i = 0; i < 5; i++) {
      g.beginPath(); // leaf-cut hem
      g.moveTo(x - 10 + i * 4, fy - 5);
      g.lineTo(x - 8 + i * 4, fy - 2.5);
      g.lineTo(x - 6 + i * 4, fy - 5);
      g.fill();
    }
  }
}

// Quiver strapped across the back; peeks over the shoulder from the front, drawn on the back when facing away.
function avatarQuiver({ g, x, fy, side, t2, sideView }, onBack) {
  const qx = onBack ? x : sideView ? x + side * 4 : x - side * 7; // side view: slung on the back (trailing side)
  g.save();
  g.translate(qx, fy - 17);
  g.rotate(onBack ? 0.35 : side * 0.35);
  g.fillStyle = '#5a3c22';
  g.fillRect(-3, -13, 6, 18);
  g.fillStyle = '#3a2616';
  g.fillRect(-3, -13, 6, 2);
  g.fillStyle = t2 ? '#bff0ff' : '#e8e0c8'; // fletching
  g.fillRect(-2.2, -17, 1.6, 4);
  g.fillRect(0.2, -16, 1.6, 3);
  g.fillStyle = '#c0432a';
  g.fillRect(-0.4, -18, 1.2, 4);
  g.restore();
  if (onBack) {
    g.strokeStyle = '#3a2616'; // strap
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x - 8, fy - 26);
    g.lineTo(x + 8, fy - 12);
    g.stroke();
  }
}

function avatarSleeves({ g, x, fy, bw, cloth, o, t2, arm, hold }) {
  const fam = o.job;
  if (AVATAR_HIDE_ARMOR) return avatarModernSleeves({ g, x, fy, bw, cloth, o, arm, hold });
  const arms = [x - bw / 2 - 3, x + bw / 2];
  for (let i = 0; i < 2; i++) {
    if (hold && hold[i]) continue;
    const ax = arms[i] + arm[2 + i];
    const y0 = fy + arm[i]; // vertical swing offset of this arm
    if (fam === 'swordsman' || fam === 'knight') {
      g.fillStyle = t2 ? '#e8d27a' : '#c9ced4'; // gauntlets
      g.fillRect(ax - 0.5, y0 - 19, 4, 5);
      g.fillStyle = 'rgba(0,0,0,.25)';
      g.fillRect(ax - 0.5, y0 - 19, 4, 1);
      g.fillStyle = cloth;
      g.fillRect(ax, y0 - 25, 3, 5);
    } else if (fam === 'archer' || fam === 'ranger') {
      g.fillStyle = cloth;
      g.fillRect(ax, y0 - 25, 3, 4);
      g.fillStyle = '#6b4a2a'; // leather bracers
      g.fillRect(ax - 0.5, y0 - 19, 4, 5);
      g.fillStyle = '#d8c79a';
      g.fillRect(ax - 0.5, y0 - 17, 4, 0.8);
    } else if (fam === 'assassin') {
      g.fillStyle = '#17122e'; // long dark sleeves with wrist wraps
      g.fillRect(ax, y0 - 25, 3, 8);
      g.fillStyle = '#c9ced4';
      g.fillRect(ax - 0.3, y0 - 18, 3.6, 1.2);
    } else {
      g.fillStyle = cloth; // waif: short sleeves + wrist wraps
      g.fillRect(ax, y0 - 25, 3, 4);
      g.fillStyle = '#5b3c24';
      g.fillRect(ax - 0.3, y0 - 18, 3.6, 2.2);
    }
  }
}

function avatarModernSleeves({ g, x, fy, bw, cloth, o, arm, hold }) {
  const arms = [x - bw / 2 - 3, x + bw / 2];
  const dk = (k) => avatarShade(cloth, k);
  for (let i = 0; i < 2; i++) {
    if (hold && hold[i]) continue; // this arm is reaching out to a dagger
    const ax = arms[i] + arm[2 + i];
    const y0 = fy + arm[i];
    const sl = (c, h = 8) => {
      g.fillStyle = c;
      g.fillRect(ax - 0.2, y0 - 25.5, 3.4, h);
    };
    const cuff = (c, y = 18.2, h = 2) => {
      g.fillStyle = c;
      g.fillRect(ax - 0.5, y0 - y, 4, h);
    };
    switch (o.job) {
      case 'waif': // hoodie sleeves + ribbed cuffs
        sl(cloth);
        cuff(dk(-0.25));
        break;
      case 'assassin': // dark jacket sleeves, shoulder pad, accent stripe, wrist strap with a buckle
        sl(dk(-0.62));
        g.fillStyle = dk(-0.5);
        g.fillRect(ax - 0.8, y0 - 26.4, 4.6, 2.6);
        g.fillStyle = dk(0.45);
        g.fillRect(ax - 0.8, y0 - 24, 4.6, 0.7);
        g.fillRect(ax - 0.2, y0 - 21.6, 3.4, 0.8);
        cuff('#2b2b36', 19, 1.8);
        g.fillStyle = '#c9ced4';
        g.fillRect(ax + 0.7, y0 - 19.2, 1.6, 1.2);
        break;
      case 'swordsman': // mercenary: cream tee sleeves with leather shoulder yokes and strap cuffs
        sl('#e9e2d0', 6);
        cuff('#3a2616', 19.2, 2.4);
        g.fillStyle = '#6a4426';
        g.fillRect(ax - 0.2, y0 - 25.5, 3.4, 2.6);
        break;
      case 'knight': // paladin: black sleeves with silver vambraces and a gold line
        sl('#1c1c24');
        cuff('#c9ced4', 20, 3.4);
        g.fillStyle = '#d9b24a';
        g.fillRect(ax - 0.5, y0 - 20, 4, 0.7);
        break;
      case 'archer': // tee sleeves, fingerless gloves
        sl(cloth, 4);
        cuff('#2a2a2a', 19, 4.6);
        break;
      case 'ranger': // parka sleeves with strap cuffs
        sl(dk(-0.12));
        cuff('#5a3c22', 19, 2);
        g.fillStyle = '#d9b24a';
        g.fillRect(ax + 0.6, y0 - 19, 1.6, 1.2);
        break;
      default:
        sl(cloth, 4);
    }
  }
}

/* ---------- hair ---------- */

// Male and female styles are different sets (modern cuts), see APPEARANCE.hairStyles.
// Every style is built from layered SVG-path shapes (origin = feet-anchored head frame: x, fy; the head is
// centred at (0,-35), radius 9). Each layer gets a body colour, a darker strand pass, a light highlight pass,
// a soft shadow on the far side and a thin contour, so the hair reads as real locks instead of flat blobs.
const AVATAR_HAIR_PATHS = new Map();
const AVATAR_HEADP = new Path2D('M-9 -35 C-9 -40.2 -5 -44 0 -44 C5 -44 9 -40.2 9 -35 C9.2 -30 6.8 -25.6 0 -25.6 C-6.8 -25.6 -9.2 -30 -9 -35 Z');
function avatarMirrorPath(d) {
  return d.replace(/(-?\d*\.?\d+)\s+(-?\d*\.?\d+)/g, (m, a, b) => -a + ' ' + b);
}
// outer scalp volume: top = crown height, w = half width, sy = temple height, inner = hairline back to the start
function avatarHairVol(top, w, sy, inner) {
  return `M${-w} ${sy} C${-w - 1.4} ${top + 5} ${-w + 3.6} ${top} 0 ${top} C${w - 3.6} ${top} ${w + 1.4} ${top + 5} ${w} ${sy} ${inner} Z`;
}
const AVATAR_HAIRLINE = {
  crop: 'L8.9 -34.8 C8.6 -37.8 7 -39.4 4.8 -40.2 C2.6 -38.8 -0.8 -39.2 -3.4 -40.6 C-5.8 -39.8 -7.9 -38 -8.9 -34.8 L-9.9 -33.4',
  side: 'L9 -35 C8.8 -38.4 6.4 -40.6 2.2 -40.8 C0.6 -37.6 -3.8 -36.2 -9 -35.4 L-9.9 -33.4',
  slick: 'L9 -35 C8.8 -39 6 -41.6 0 -41.8 C-6 -41.6 -8.8 -39 -9 -35 L-9.9 -33.4',
  messy: 'L9 -34 L8 -38 L6.4 -35.6 L4.6 -39.4 L2.4 -36 L0.2 -40.4 L-2 -36.2 L-4.2 -39.6 L-6 -36 L-8 -38.4 L-9 -34 L-9.9 -33.4',
  curtain: 'L9.2 -34.6 C9 -37.8 7.6 -39.4 5.6 -38.8 C3.6 -38 1.6 -39.6 0 -41.2 C-1.6 -39.6 -3.6 -38 -5.6 -38.8 C-7.6 -39.4 -9 -37.8 -9.2 -34.6 L-10 -33.4',
  bangs: 'L9.4 -34.2 C8 -37.4 4 -38.6 0 -38.6 C-4 -38.6 -8 -37.4 -9.4 -34.2 L-10 -33.4',
  swept: 'L9.2 -34.6 C9 -38.2 6.6 -40.4 3 -40.6 C-0.4 -38.8 -5 -37.4 -9.2 -35.6 L-10 -33.4',
  pulled: 'L9 -35 C8.8 -39.4 5.6 -42 0 -42.2 C-5.6 -42 -8.8 -39.4 -9 -35 L-9.9 -33.4',
};

function avatarHair(g, x, fy, style, color, face, facingUp) {
  if (style === 'bald') return;
  const PI = Math.PI;
  const s = Math.cos(face) >= 0 ? -1 : 1; // side that trails behind the head
  const lum = parseInt(color.slice(1, 3), 16) * 0.3 + parseInt(color.slice(3, 5), 16) * 0.59 + parseInt(color.slice(5, 7), 16) * 0.11;
  const D = avatarShade(color, -0.34), // strand shadow
    L = avatarShade(color, lum < 90 ? 0.6 : 0.36); // highlight
  const path = (d) => {
    let p = AVATAR_HAIR_PATHS.get(d);
    if (!p) AVATAR_HAIR_PATHS.set(d, (p = new Path2D(d)));
    return p;
  };
  const a0 = g.globalAlpha;
  // one hair layer: o.dark / o.light = strand strokes, o.m = mirror to the trailing side, o.two = also draw the mirrored copy,
  // o.c = fill colour, o.a = opacity, o.out = false to skip the contour
  const layer = (d, o = {}) => {
    if (o.two) {
      layer(d, { ...o, two: false });
      layer(avatarMirrorPath(d), { ...o, two: false, dark: (o.dark || []).map(avatarMirrorPath), light: (o.light || []).map(avatarMirrorPath) });
      return;
    }
    const p = path(d),
      al = a0 * (o.a === undefined ? 1 : o.a);
    g.save();
    g.translate(x, fy);
    if (o.m) g.scale(s, 1);
    if (o.fs !== false && o.out !== false && !facingUp) {
      // soft cast shadow of the hair onto the forehead / cheeks (clipped to the head)
      g.save();
      g.clip(AVATAR_HEADP);
      g.translate(0.5, 1.5);
      g.globalAlpha = al * 0.2;
      g.fillStyle = '#4a2010';
      g.fill(p);
      g.restore();
    }
    g.globalAlpha = al;
    g.fillStyle = o.c || color;
    g.fill(p);
    g.save();
    g.clip(p);
    const vg = g.createLinearGradient(0, -54, 0, -24); // top-lit: lighter crown, darker ends
    vg.addColorStop(0, 'rgba(255,255,255,.13)');
    vg.addColorStop(0.5, 'rgba(255,255,255,0)');
    vg.addColorStop(1, 'rgba(0,0,0,.16)');
    g.fillStyle = vg;
    g.fillRect(-24, -70, 48, 100);
    const sh = g.createLinearGradient(-3, 0, 9, 0); // light comes from the top-left: far side is a touch darker
    sh.addColorStop(0, 'rgba(0,0,0,0)');
    sh.addColorStop(1, 'rgba(0,0,0,.2)');
    g.fillStyle = sh;
    g.fillRect(-3, -70, 60, 100);
    g.lineCap = 'round';
    g.lineWidth = 0.9;
    g.strokeStyle = D;
    g.globalAlpha = al * 0.62;
    for (const q of o.dark || []) g.stroke(path(q));
    g.lineWidth = 0.95;
    g.strokeStyle = L;
    g.globalAlpha = al * 0.38;
    for (const q of o.light || []) g.stroke(path(q));
    if (o.shine) {
      // glossy specular band
      g.lineWidth = 1.7;
      g.strokeStyle = '#ffffff';
      g.globalAlpha = al * (lum < 90 ? 0.3 : 0.22);
      for (const q of o.shine) g.stroke(path(q));
    }
    g.restore();
    if (o.out !== false && !facingUp) {
      g.lineWidth = 0.7;
      g.strokeStyle = D;
      g.globalAlpha = al * 0.3;
      g.stroke(p);
    }
    g.restore();
  };
  const ring = (cx, cy, r, o = {}) => layer(`M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} Z`, o);
  const tie = (cx, cy, w, h, c) => {
    g.save();
    g.translate(x, fy);
    g.fillStyle = c;
    g.beginPath();
    g.ellipse(cx, cy, w, h, 0, 0, 6.28);
    g.fill();
    g.restore();
  };
  const V = avatarHairVol,
    H = AVATAR_HAIRLINE;
  // fan of strand curves from one root point to several tips
  const fan = (fx, fy2, tos, bend = 0) => tos.map(([tx, ty]) => `M${fx} ${fy2} Q${(fx + tx) / 2 + bend} ${(fy2 + ty) / 2 - 1.4} ${tx} ${ty}`);
  const faint = style === 'taper' || style === 'curlytop';

  // back of the head: the same hair colour all round, with a crown whorl and a few strands
  if (facingUp) {
    g.globalAlpha = a0 * (faint ? 0.45 : 1);
    layer('M-9.4 -35 A9.4 9.4 0 1 1 9.4 -35 A9.4 9.4 0 1 1 -9.4 -35 Z', {
      dark: ['M0 -44 Q-1.6 -39 0.4 -33', 'M-5 -42 Q-6.4 -37 -5 -31.6', 'M5 -42 Q6.6 -37 5 -31.6'],
      light: ['M-6 -41 Q-2 -45.6 3.6 -43.6'],
    });
    g.globalAlpha = a0;
  }

  switch (style) {
    /* ================= male: modern cuts ================= */
    case 'short': // textured crop with a choppy fringe
      layer(V(-47.4, 9.9, -33.4, H.crop), {
        dark: [...fan(0, -47.6, [[-8.4, -37.6], [-6, -40], [-3.4, -40.4], [-0.6, -39.4], [2.4, -40.4], [5.4, -39.6], [8, -38]], 0), 'M-8.2 -43 Q-9 -39.4 -8.2 -36', 'M8.2 -43 Q9 -39.4 8.2 -36'],
        light: ['M-7 -44.6 Q-1 -49.2 6 -45', 'M-2 -44 Q1 -46 3.6 -44.4', 'M-5 -42.6 Q-3 -44.4 -0.6 -43.8'],
        shine: ['M-4.6 -46.6 Q0 -48.6 4.4 -46.6'],
      });
      layer('M-6.6 -44.4 L-5.6 -47.6 L-3.2 -45.2 L-1.6 -48.6 L0.6 -45.6 L2.8 -48.2 L4.2 -45.4 L6.8 -46.8 L6.4 -43.4 Z', {
        dark: ['M-5.6 -47.6 L-4.6 -45.4', 'M-1.6 -48.6 L-0.6 -45.6', 'M2.8 -48.2 L3.2 -45.6'],
        light: ['M-4.6 -47 L-3.8 -45.8', 'M3.6 -47 L4.6 -45.6'],
        fs: false,
      });
      break;
    case 'taper': // low taper fade, textured volume on top
      layer(V(-45, 9.4, -33.2, 'L9.2 -35 C8.8 -37.4 6.8 -38.8 0 -39 C-6.8 -38.8 -8.8 -37.4 -9.2 -35 L-9.4 -33.2'), { a: 0.26, out: false, fs: false });
      layer(V(-45.6, 9.4, -33.8, 'L9.1 -36.4 C8.7 -38.8 6.8 -40.2 0 -40.4 C-6.8 -40.2 -8.7 -38.8 -9.1 -36.4 L-9.4 -33.8'), { a: 0.4, out: false, fs: false });
      layer('M-8.6 -40.6 C-9.8 -47.2 -4.2 -51 2 -50.4 C7.8 -49.8 9.8 -45.6 8.8 -40.6 C6.8 -42.8 3.4 -43.8 0.4 -43.2 C-3 -42.6 -6.4 -42.2 -8.6 -40.6 Z', {
        dark: ['M-6 -43 Q-5.6 -47.6 -2.4 -50', 'M-2 -43.4 Q-0.8 -47.8 2.4 -50.2', 'M2 -43.6 Q4 -47.4 6.6 -49', 'M5.6 -43 Q7.8 -45.6 8.6 -48'],
        light: ['M-6.6 -45.6 Q-2 -50.6 5.6 -49.4', 'M-1.4 -47 Q3 -50 7.6 -47'],
        shine: ['M-4 -48.4 Q1 -50.2 6 -48'],
      });
      break;
    case 'twoblock': // K-style two-block curtains over short sides
      layer(V(-48, 10.2, -33, H.curtain), {
        dark: ['M0 -47.4 Q-0.6 -44 0 -41.2', 'M-3.4 -46.6 Q-5 -42.4 -5.6 -38.8', 'M3.4 -46.6 Q5 -42.4 5.6 -38.8', 'M-7.4 -44.4 Q-9 -40.6 -9 -36', 'M7.4 -44.4 Q9 -40.6 9 -36', 'M-1.8 -46 Q-3 -43 -3.2 -40', 'M1.8 -46 Q3 -43 3.2 -40'],
        light: ['M-6.6 -44.6 Q-1 -49.4 6 -44.8', 'M-2.4 -43.6 Q-4.4 -41.6 -4.6 -39.6', 'M2.4 -43.6 Q4.4 -41.6 4.6 -39.6'],
        shine: ['M-5.6 -46.4 Q0 -49.4 5.6 -46.4'],
      });
      break;
    case 'comma': // Korean comma hair: a curled lock sweeps across the forehead
      layer(V(-47.8, 10, -33.2, 'L9 -35 C8.8 -39 6.6 -41 2.4 -41.4 C-1 -41.8 -5.4 -40.6 -9 -35.4 L-9.9 -33.4'), {
        dark: ['M2.6 -47.4 Q2.4 -44 2.2 -41.4', 'M5.6 -46.4 Q7.6 -43 8.6 -38.8', 'M-2 -47 Q-6 -45.4 -8.6 -39.4', 'M-3 -47.4 Q-7.6 -44 -9 -37.6'],
        light: ['M-1 -47 Q-6 -45 -8.8 -40.4', 'M4.4 -47.4 Q8 -45 9 -40.4'],
        shine: ['M-4 -47.6 Q2 -50 7 -46.6'],
      });
      layer('M-0.6 -46.4 C-5.4 -45.4 -7 -41.4 -5 -38 C-3.8 -36 -1.4 -36 -0.8 -37.8 C-2.4 -38 -3.4 -40 -2.6 -42.2 C-1.6 -44 0.8 -44.8 3.2 -44.4 Z', {
        dark: ['M-0.4 -45.4 Q-4.4 -44 -4.6 -39.4', 'M0.6 -44.6 Q-2 -43.4 -2.6 -40'],
        light: ['M-1.4 -45.8 Q-5 -44 -5.4 -40'],
      });
      break;
    case 'curtains': // 90s middle-part curtains that frame the face
      layer(V(-47.8, 10.2, -33, H.curtain), {
        dark: ['M0 -47.6 Q-0.4 -44 0 -41.2', 'M-3.6 -46.6 Q-6 -42.6 -8.4 -38.4', 'M3.6 -46.6 Q6 -42.6 8.4 -38.4', 'M-6.4 -45 Q-9 -41.4 -9.4 -36.4', 'M6.4 -45 Q9 -41.4 9.4 -36.4'],
        light: ['M-6.4 -44.6 Q-1 -49.8 6.2 -44.8', 'M-1.6 -43.4 Q-5 -42.4 -7.4 -39.4', 'M1.6 -43.4 Q5 -42.4 7.4 -39.4'],
        shine: ['M-5.6 -46.6 Q0 -49.6 5.6 -46.6'],
      });
      layer('M9.6 -38.4 C11.8 -34.6 11.4 -30 9.6 -27 C8.2 -28.4 7.4 -30.6 6.6 -33 C7.8 -34.8 9 -36.4 9.6 -38.4 Z', {
        two: true,
        dark: ['M10 -35 Q10.6 -31 9 -28', 'M8.6 -34 Q9 -31 8 -29.2'],
        light: ['M10.6 -34 Q10.8 -31.4 9.8 -29.4'],
      });
      break;
    case 'quiff': // mid fade with a lifted pompadour-style quiff
      layer(V(-45.6, 9.4, -33.8, 'L9 -35.4 C8.6 -38.2 6.6 -39.8 0 -40 C-6.6 -39.8 -8.6 -38.2 -9 -35.4 L-9.4 -33.8'), { a: 0.34, out: false, fs: false });
      layer('M-9.4 -34.6 C-10.8 -42.2 -6.4 -45.6 -2.6 -46.6 C-1.4 -51 5.4 -54 9.6 -49.2 C11.6 -46.6 10.8 -40.4 9.4 -34.6 L8.6 -36.4 C8.4 -39 7 -40.8 4.6 -41.4 C2.4 -40 -1 -40.4 -3.6 -41.6 C-6 -41 -7.8 -39 -8.6 -36.4 Z', {
        dark: ['M-5 -45.4 Q-3 -42 -3.4 -41', 'M-0.6 -48.4 Q1.6 -43.8 1.4 -40.4', 'M3.4 -50.4 Q5.6 -44.4 4.8 -41', 'M7.2 -48.6 Q8.8 -44.4 8.2 -39', 'M-8.4 -42.4 Q-9 -38.4 -8.4 -36'],
        light: ['M-1.6 -49 Q3 -52.6 8.2 -48.8', 'M-6.6 -44 Q-3 -46.8 -1 -46.4', 'M1 -47.4 Q4 -49 6.4 -47'],
        shine: ['M0.6 -51 Q5 -52 8.4 -49'],
      });
      break;
    case 'slick': // slicked-back taper, glossy
      layer(V(-45.6, 9.4, -33.8, 'L9 -35.4 C8.6 -38.2 6.6 -39.8 0 -40 C-6.6 -39.8 -8.6 -38.2 -9 -35.4 L-9.4 -33.8'), { a: 0.3, out: false, fs: false });
      layer(V(-47.8, 9.8, -33.8, H.slick), {
        dark: ['M-6.6 -41.4 Q-3 -46.4 3 -47.4', 'M-4 -41.6 Q-0.6 -45.6 5.6 -45.8', 'M-1 -41.8 Q2.6 -44.4 7.6 -43', 'M2 -41.8 Q5 -43.4 8.6 -41.4', 'M-8.4 -39 Q-8.8 -36 -8.4 -34', 'M-0.4 -47.6 Q-1.6 -44.4 -0.8 -41.8'],
        light: ['M-5.6 -43.4 Q-1 -48.2 5.6 -46.6', 'M-2 -43 Q2 -46 7.4 -44.4'],
        shine: ['M-5 -45 Q0 -49 6.4 -46', 'M-1 -43.6 Q3 -46 8 -43.8'],
      });
      break;
    case 'buzz': // buzz cut with a sharp, faded hairline
      layer(V(-45.8, 9.5, -34, 'L9 -35.6 C8.6 -38.4 6.5 -40 0 -40.2 C-6.5 -40 -8.6 -38.4 -9 -35.6 L-9.5 -34'), {
        dark: ['M-6 -43 L-5.4 -41', 'M-2 -44.8 L-2 -42', 'M2 -44.8 L2.2 -42', 'M6 -43 L5.6 -41', 'M-8.4 -39.4 L-8.6 -37.4', 'M8.4 -39.4 L8.6 -37.4', 'M-4 -44.4 L-3.8 -42.4', 'M4 -44.4 L4.2 -42.4'],
        light: ['M-5 -44.4 Q0 -46.8 5 -44.4'],
      });
      break;
    case 'mullet': { // modern mullet / shaggy: textured top, longer nape
      if (facingUp)
        layer('M-10.4 -36 C-11.6 -30 -11 -25 -8.6 -22.6 L-6.6 -19.4 L-4.2 -22.4 L-1.6 -18.6 L0.8 -22.4 L3.4 -18.8 L5.8 -22.4 L8 -19.6 L9 -22.8 C11.4 -25 11.8 -30 10.4 -36 C8 -45 -8 -45 -10.4 -36 Z', {
          dark: ['M-6 -34 Q-6.6 -26 -5 -20', 'M0 -33 Q0.4 -26 0 -19.6', 'M6 -34 Q6.6 -26 5 -20'],
          light: ['M-3 -30 Q-3.6 -25 -3 -21'],
        });
      layer(V(-48.6, 10.6, -33, H.curtain), {
        dark: ['M0 -48.4 Q-0.4 -44 0 -41.2', 'M-3.6 -47.4 Q-5.4 -42.6 -5.8 -38.8', 'M3.6 -47.4 Q5.4 -42.6 5.8 -38.8', 'M-8 -45 Q-9.8 -40.4 -9.6 -35.6', 'M8 -45 Q9.8 -40.4 9.6 -35.6'],
        light: ['M-6.8 -45.6 Q-1 -50.8 6.4 -45.6', 'M-1.4 -44 Q-4.6 -42.6 -7 -39.4'],
        shine: ['M-5 -47.6 Q0 -50.4 5 -47.6'],
      });
      layer('M9.8 -38 C12.4 -34.4 12.2 -29.4 10.6 -25.4 L11 -21.6 L8.6 -24.4 L7.6 -20.6 L6.6 -25.4 C7.4 -28.4 7.2 -31.4 6.4 -34 C7.8 -35 9 -36.4 9.8 -38 Z', {
        two: true,
        dark: ['M10.4 -35 Q11 -29.6 9.6 -24.4', 'M8.6 -33.4 Q9 -29 8.2 -25.4'],
        light: ['M11 -33 Q11.4 -28.6 10.6 -25'],
      });
      break;
    }
    case 'manbun': // top knot with a faded undercut
      layer(V(-45.4, 9.4, -33.8, 'L9 -35.6 C8.6 -38.4 6.6 -40 0 -40.2 C-6.6 -40 -8.6 -38.4 -9 -35.6 L-9.4 -33.8'), { a: 0.32, out: false, fs: false });
      ring(0, -51, 5.2, { dark: ['M-3.4 -53.4 Q0 -48 3.4 -53.2', 'M-3 -50.6 Q0 -46 3 -50.8', 'M-4 -51 Q-3 -48 -1 -46.6'], light: ['M-3.4 -54.6 Q0 -56.6 3.4 -54.6'] });
      layer('M-8.6 -40.4 C-9.4 -45.4 -5.4 -48.4 0 -48.4 C5.4 -48.4 9.4 -45.4 8.6 -40.4 C6.2 -42.4 3 -43.4 0 -43.2 C-3 -43.4 -6.2 -42.4 -8.6 -40.4 Z', {
        dark: ['M-4 -46.4 Q-1 -48.4 0 -47.4', 'M4 -46.4 Q1 -48.4 0 -47.4', 'M-7 -43.4 Q-4.6 -46 -1.6 -47', 'M7 -43.4 Q4.6 -46 1.6 -47'],
        light: ['M-6.2 -44.4 Q0 -49.4 6.2 -44.4'],
        shine: ['M-4.4 -46.4 Q0 -48.8 4.4 -46.4'],
      });
      tie(0, -47, 4, 1.2, '#2a2230');
      break;
    case 'curlytop': { // curly top over a high fade
      layer(V(-45.4, 9.4, -33.8, 'L9 -35.4 C8.6 -38.2 6.6 -39.8 0 -40 C-6.6 -39.8 -8.6 -38.2 -9 -35.4 L-9.4 -33.8'), { a: 0.3, out: false, fs: false });
      const cs = [[-8.2, -41.6], [8.2, -41.6], [-5.2, -45.6], [5.2, -45.6], [0, -47.2], [-2.8, -43.6], [2.8, -43.6], [-7.4, -45], [7.4, -45], [0, -50.6], [-3.6, -49], [3.6, -49]];
      for (const [cx, cy] of cs.slice(0, 9))
        ring(cx, cy, 3.5, { dark: [`M${cx - 2} ${cy + 0.8} A2.2 2.2 0 0 1 ${cx + 2} ${cy - 0.6}`], light: [`M${cx - 2.2} ${cy - 1.2} Q${cx} ${cy - 3.2} ${cx + 2.2} ${cy - 1.2}`] });
      for (const [cx, cy] of cs.slice(9))
        ring(cx, cy, 3.2, { dark: [`M${cx - 2} ${cy + 0.8} A2.2 2.2 0 0 1 ${cx + 2} ${cy - 0.6}`], light: [`M${cx - 2} ${cy - 1.2} Q${cx} ${cy - 3} ${cx + 2} ${cy - 1.2}`] });
      layer('M-8 -41 C-6 -43 -3 -43.6 0 -43 C3 -43.6 6 -43 8 -41 C5 -41.8 3.6 -41 0 -41.4 C-3.6 -41 -5 -41.8 -8 -41 Z', { out: false, light: ['M-5 -42.4 Q0 -44 5 -42.4'] });
      break;
    }
    case 'flow': // medium wavy flow swept back, tucked behind the ears
      if (facingUp)
        layer('M-10.4 -36 C-12.4 -30 -11.6 -25 -9.6 -22.4 C-6 -20.4 -3.4 -23 0 -21.4 C3.4 -23 6 -20.4 9.6 -22.4 C11.6 -25 12.4 -30 10.4 -36 C8 -45 -8 -45 -10.4 -36 Z', {
          dark: ['M-6 -34 Q-7.6 -28 -5 -22.4', 'M0 -33 Q1.6 -27 0 -21.8', 'M6 -34 Q7.6 -28 5 -22.4'],
          light: ['M-3 -30 Q-4.4 -26 -3 -22.6', 'M3.4 -30 Q4.8 -26 3.4 -22.6'],
        });
      layer(V(-48.4, 10.4, -33, 'L9.2 -35 C9 -39.4 6.6 -42 2.4 -42.4 C-1.6 -42.6 -6.4 -41 -9.2 -35.6 L-10 -33.4'), {
        dark: [...fan(3.4, -48, [[-8.8, -38.4], [-5.6, -41.8], [-2, -42.4], [3, -42.4], [6.6, -41.2], [8.8, -37.6]], 0), 'M-9 -40 Q-10.4 -36 -9.6 -33.4'],
        light: ['M-5.6 -46 Q0 -50.6 6.6 -46.4', 'M-2 -45 Q-6 -43.4 -8.2 -39.6'],
        shine: ['M-4.6 -47.8 Q1 -50.6 6.6 -47'],
      });
      layer('M9.6 -38.4 C12.4 -35.4 12.6 -31 11 -27.4 C9.4 -26.6 8.4 -28 8.8 -29.6 C7.6 -30.6 6.8 -32.4 6.4 -34.4 C7.8 -35.2 9 -36.6 9.6 -38.4 Z', {
        two: true,
        dark: ['M10.2 -35.6 Q11.4 -31.6 10 -28.4', 'M8.4 -34.6 Q9.4 -31.6 8.6 -29.6'],
        light: ['M11 -34 Q11.8 -31.2 10.8 -29'],
      });
      break;

    /* ================= female: modern cuts ================= */
    case 'butterfly': { // layered butterfly cut: long, voluminous, face-framing
      if (facingUp)
        layer('M-10.6 -36 C-13.4 -28 -12.8 -20 -10.4 -15.6 L-8 -12.4 L-5.4 -16 L-2.4 -12 L0.2 -16 L2.8 -12 L5.6 -16 L8.2 -12.4 L10.4 -15.6 C12.8 -20 13.4 -28 10.6 -36 C8 -45.4 -8 -45.4 -10.6 -36 Z', {
          dark: ['M-6 -34 Q-7 -24 -5.4 -15', 'M0 -33 Q0.6 -24 0 -14', 'M6 -34 Q7 -24 5.4 -15', 'M-8.6 -32 Q-10 -24 -9 -17', 'M8.6 -32 Q10 -24 9 -17'],
          light: ['M-3 -30 Q-3.8 -24 -3 -17', 'M3.4 -30 Q4.2 -24 3.4 -17'],
        });
      layer(V(-48, 10.4, -33, H.curtain), {
        dark: ['M0 -47.8 Q-0.4 -44 0 -41.2', 'M-3.6 -46.8 Q-5.6 -42.6 -7.8 -38.4', 'M3.6 -46.8 Q5.6 -42.6 7.8 -38.4', 'M-7.8 -44.4 Q-9.6 -40.4 -9.4 -35.6', 'M7.8 -44.4 Q9.6 -40.4 9.4 -35.6'],
        light: ['M-6.6 -45 Q-1 -50 6.4 -45', 'M-1.6 -43.6 Q-5 -42.4 -7.6 -39.2', 'M1.6 -43.6 Q5 -42.4 7.6 -39.2'],
        shine: ['M-5.6 -47 Q0 -50 5.6 -47'],
      });
      layer('M9.4 -37.6 C13 -33.4 13.8 -25.6 12 -18.4 L13.6 -14.4 L10.6 -16.6 L9.6 -12.6 L8 -17 C8.6 -22 8.4 -28 6.4 -33.8 C7.6 -34.8 8.8 -36.2 9.4 -37.6 Z', {
        two: true,
        dark: ['M10.2 -34.4 Q12 -26.4 10.6 -17.4', 'M8.4 -33.4 Q9.6 -26.4 8.8 -19'],
        light: ['M11.4 -32.4 Q12.6 -26 11.6 -19.4'],
      });
      layer('M8.4 -39 C11.4 -36 10.8 -32 8.2 -29.4 C7.6 -31.6 7 -33.6 6.2 -35.4 C7.2 -36.4 7.8 -37.6 8.4 -39 Z', { two: true, light: ['M9.4 -36.6 Q9.8 -33.6 8.6 -31.4'], out: false });
      break;
    }
    case 'curtainlong': // long smooth hair with curtain bangs
      if (facingUp)
        layer('M-10.4 -36 C-12.8 -28 -12.4 -20 -8.6 -15.4 C-4 -13.6 4 -13.6 8.6 -15.4 C12.4 -20 12.8 -28 10.4 -36 C8 -45 -8 -45 -10.4 -36 Z', {
          dark: ['M-6 -34 Q-6.6 -24 -5 -16', 'M0 -33 Q0.4 -24 0 -15', 'M6 -34 Q6.6 -24 5 -16'],
          light: ['M-3 -30 Q-3.6 -24 -3 -18', 'M3.4 -30 Q4 -24 3.4 -18'],
        });
      layer(V(-47.8, 10.2, -33, 'L9.4 -34.6 C9.2 -37.6 8.2 -39.6 6.8 -40.4 C5 -38.6 2.4 -40.6 0 -43 C-2.4 -40.6 -5 -38.6 -6.8 -40.4 C-8.2 -39.6 -9.2 -37.6 -9.4 -34.6 L-10 -33.4'), {
        dark: ['M0 -47.6 Q-0.4 -44.6 0 -43', 'M-3.6 -46.6 Q-5.4 -43 -6.8 -40.6', 'M3.6 -46.6 Q5.4 -43 6.8 -40.6', 'M-7.8 -44.4 Q-9.4 -40.4 -9.2 -35.6', 'M7.8 -44.4 Q9.4 -40.4 9.2 -35.6'],
        light: ['M-6.4 -44.8 Q-1 -50 6.2 -44.8'],
        shine: ['M-5.4 -46.8 Q0 -49.8 5.4 -46.8'],
      });
      layer('M0.4 -43.4 C-1.4 -44.6 -4.6 -45.2 -8.6 -42 C-10 -40.4 -10.2 -37.4 -9.8 -34.4 C-7.6 -37.8 -4 -40.4 0.4 -43.4 Z', {
        two: true,
        dark: ['M-1 -43.4 Q-5 -42.6 -8.4 -38.6', 'M-2.2 -43.8 Q-6 -43.4 -9 -39.4'],
        light: ['M-1.4 -44 Q-5.2 -44 -8.8 -41'],
      });
      layer('M9.6 -37 C12.6 -33 13 -25 11 -17.4 C10.2 -15 7.4 -15.4 7.8 -17.8 C9 -23 8.4 -29 6.6 -33.6 C7.8 -34.6 9 -35.8 9.6 -37 Z', {
        two: true,
        dark: ['M10.2 -34 Q11 -26 9.2 -18', 'M8.6 -33 Q9.2 -26 8.8 -20'],
        light: ['M10.8 -32 Q11.4 -26 10.2 -20'],
      });
      break;
    case 'wolfcut': // layered shag with wispy ends
      if (facingUp)
        layer('M-10.6 -36 C-12.6 -30 -12 -24 -9.6 -21 L-7.6 -17.4 L-4.8 -21.4 L-2 -16.6 L0.4 -21.6 L3 -16.8 L5.6 -21.4 L8 -17.4 L9.8 -21 C12.2 -24 12.8 -30 10.6 -36 C8 -45.4 -8 -45.4 -10.6 -36 Z', {
          dark: ['M-6 -34 Q-6.6 -26 -5 -20', 'M0 -33 Q0.4 -26 0 -19', 'M6 -34 Q6.6 -26 5 -20'],
          light: ['M-3 -30 Q-3.6 -25 -3 -21'],
        });
      layer(V(-48.4, 10.8, -33, H.curtain), {
        dark: ['M0 -48 Q-0.4 -44 0 -41.2', 'M-3.6 -47 Q-5.2 -42.6 -5.6 -38.8', 'M3.6 -47 Q5.2 -42.6 5.6 -38.8', 'M-8 -45 Q-9.6 -40.4 -9.4 -35.6', 'M8 -45 Q9.6 -40.4 9.4 -35.6', 'M-2 -46.6 Q-3.4 -43.4 -3.4 -40.6'],
        light: ['M-6.8 -45.2 Q-1 -50.4 6.4 -45.4', 'M-9.4 -40 Q-9.6 -37 -9 -35'],
        shine: ['M-5.4 -47.4 Q0 -50.6 5.4 -47.4'],
      });
      layer('M9.8 -38 C12.6 -34 13 -28 11.6 -23.4 L12.6 -19.2 L9.6 -22 L9.2 -17.2 L7.4 -22.6 C8.2 -26.6 7.6 -30.6 6.4 -34 C7.8 -34.8 9 -36.2 9.8 -38 Z', {
        two: true,
        dark: ['M10.4 -34.6 Q11.2 -28.6 10 -23', 'M8.6 -33 Q9 -27.4 8.4 -23.4'],
        light: ['M11 -32 Q11.6 -27.6 10.8 -24'],
      });
      break;
    case 'frenchbob': // chin-length French bob, inward curl, wispy micro-bangs
      if (facingUp)
        layer('M-10.4 -36 C-11.6 -30 -10.6 -26 -8 -24.6 C-3 -23.4 3 -23.4 8 -24.6 C10.6 -26 11.6 -30 10.4 -36 C8 -45 -8 -45 -10.4 -36 Z', {
          dark: ['M-5 -34 Q-5.6 -29 -4 -25', 'M5 -34 Q5.6 -29 4 -25'],
          light: ['M0 -33 Q0.4 -29 0 -25'],
        });
      layer(V(-47.8, 10.2, -33, 'L9.4 -34.4 C8 -37.4 4 -38.2 0 -38 C-4 -38.2 -8 -37.4 -9.4 -34.4 L-10 -33.4'), {
        dark: [...fan(0, -47.8, [[-9, -37], [-6.4, -38.4], [-3.4, -38.2], [0, -38], [3.4, -38.2], [6.4, -38.4], [9, -37]], 0)],
        light: ['M-6.4 -44.8 Q0 -49.6 6.4 -44.8', 'M-6.4 -41.4 Q0 -43.2 6.4 -41.4'],
        shine: ['M-5.4 -47 Q0 -49.8 5.4 -47'],
      });
      layer('M9.6 -37 C12.6 -34 12.4 -28.6 9.8 -25 C8.4 -24 6.4 -24.4 5.8 -26 C7.6 -26.6 7.4 -29 6.8 -31 C6.4 -32.4 6.2 -33.4 6 -34.4 Z', {
        two: true,
        dark: ['M10 -33 Q10.8 -29 9 -26', 'M8.4 -32.4 Q8.8 -29 7.4 -26.6'],
        light: ['M10.8 -33 Q11.2 -30 10 -27.4'],
      });
      break;
    case 'lob': // shoulder-grazing long bob, side swept, ends flick out
      if (facingUp)
        layer('M-10.4 -36 C-12 -30 -12.4 -24 -11.4 -20.4 C-7 -18.4 -3 -20.4 0 -19.4 C3 -20.4 7 -18.4 11.4 -20.4 C12.4 -24 12 -30 10.4 -36 C8 -45 -8 -45 -10.4 -36 Z', {
          dark: ['M-5 -34 Q-6 -27 -4 -20.6', 'M5 -34 Q6 -27 4 -20.6'],
          light: ['M0 -33 Q0.4 -27 0 -20.6'],
        });
      layer(V(-47.8, 10.2, -33, H.swept), {
        dark: ['M3 -46.8 Q2.6 -43.6 3 -40.6', 'M2.6 -46.2 Q-3.6 -45 -8.8 -37.6', 'M2 -45.2 Q-2.4 -43 -7 -38.4', 'M5.6 -45.6 Q8 -42.6 8.6 -38', 'M-8 -43 Q-9.4 -39 -9.2 -35'],
        light: ['M-1 -46.8 Q-6 -44.4 -9 -38.6', 'M5 -46.6 Q8.2 -44.6 9 -40'],
        shine: ['M-4.6 -47.4 Q1 -50 6.6 -46.6'],
      });
      layer('M9.6 -37 C13 -33.4 13.2 -27.4 12.2 -22.6 C12.6 -20.6 13.8 -19.8 14.8 -19.4 C12 -17.8 9 -17.8 7.6 -20.4 C8.4 -25 8 -30 6.4 -33.8 C7.8 -34.8 8.8 -35.8 9.6 -37 Z', {
        two: true,
        dark: ['M10.2 -34 Q11.6 -28 10.4 -21.6', 'M8.4 -33 Q9.2 -27 8.6 -21'],
        light: ['M11.4 -32 Q12.4 -27 11.8 -22'],
      });
      break;
    case 'hime': // hime cut: blunt bangs, cheek-length sidelocks, long straight back
      if (facingUp)
        layer('M-10.4 -36 C-12.8 -28 -12.4 -20 -9.6 -14.6 C-4 -12.8 4 -12.8 9.6 -14.6 C12.4 -20 12.8 -28 10.4 -36 C8 -45 -8 -45 -10.4 -36 Z', {
          dark: ['M-6 -34 Q-6.6 -24 -5.4 -15', 'M0 -33 Q0.4 -24 0 -14', 'M6 -34 Q6.6 -24 5.4 -15'],
          light: ['M-3 -30 Q-3.6 -24 -3 -16'],
        });
      layer(V(-47.6, 10.2, -33, H.bangs), {
        dark: ['M-4.4 -46.6 Q-5.2 -42 -4.8 -38.8', 'M0 -47.4 Q0 -43 0 -38.8', 'M4.4 -46.6 Q5.2 -42 4.8 -38.8', 'M-8 -44 Q-9 -40 -9 -36', 'M8 -44 Q9 -40 9 -36'],
        light: ['M-6.4 -44.6 Q0 -49.4 6.4 -44.6', 'M-6 -41.2 Q0 -43 6 -41.2'],
        shine: ['M-5.4 -46.8 Q0 -49.6 5.4 -46.8'],
      });
      layer('M9.8 -37.6 C11.6 -34 11.4 -28.6 10.4 -22.4 L8.2 -22.8 C8.2 -27.8 7.6 -31.4 6.6 -34.4 Z', {
        two: true,
        dark: ['M10 -34 Q10.6 -29 9.6 -23.4', 'M8.6 -33 Q8.8 -29 8.2 -24'],
        light: ['M10.8 -33 Q11 -29 10.4 -25'],
      });
      layer('M9.6 -37 C13 -33 13.4 -24 11.8 -15.8 C11 -13.6 8.6 -14 9 -16.4 C10 -22 9.4 -28 6.4 -33.6 C7.8 -34.6 8.8 -35.8 9.6 -37 Z', {
        two: true,
        dark: ['M10.8 -33.6 Q12 -25 10.6 -17'],
        light: ['M11.6 -31 Q12.6 -25 11.6 -18.6'],
        a: 0.96,
      });
      break;
    case 'highpony': // sleek high ponytail
      layer(V(-47.2, 9.9, -33.4, H.pulled), {
        dark: ['M-4 -45.4 Q-1 -48.4 0 -47.4', 'M4 -45.4 Q1 -48.4 0 -47.4', 'M-8 -42.4 Q-5 -45.4 -2 -46.6', 'M8 -42.4 Q5 -45.4 2 -46.6', 'M-8.8 -38.4 Q-6 -43 -1 -46'],
        light: ['M-6.4 -43.8 Q0 -49 6.4 -43.8', 'M-3 -44 Q1 -47 6 -43'],
        shine: ['M-5 -45.4 Q0 -48.6 5 -45'],
      });
      layer('M2.4 -49.4 C8.8 -53 16.6 -48.4 17.4 -38 C17.8 -32 15.4 -27 12.6 -24.6 C12.4 -28 13.2 -31.6 11.2 -35.6 C9.4 -39.4 5.6 -43 1.4 -45 Z', {
        m: true,
        dark: ['M4 -48.4 Q12.6 -48.4 14.8 -38', 'M5.6 -46 Q11 -44 12.4 -37', 'M3.6 -47.6 Q14 -45.4 16 -34', 'M12.4 -37 Q14 -32 12.8 -27'],
        light: ['M5 -50 Q13 -50 15.8 -40', 'M8 -46 Q13.4 -43 14.4 -36'],
        shine: ['M6 -50.4 Q13 -49.6 15.6 -42'],
      });
      tie(2.4, -47.4, 1.4, 2.8, '#ff7aa8');
      tie(2.4, -47.4, 0.6, 1.4, '#ffd0e0');
      break;
    case 'lowbun': // sleek centre-part low bun with face-framing tendrils
      layer(V(-47.2, 9.9, -33.4, H.slick), {
        dark: ['M0 -47.6 Q-0.4 -44.4 0 -41.8', 'M-6.6 -42.6 Q-3 -46.4 -0.6 -47', 'M6.6 -42.6 Q3 -46.4 0.6 -47', 'M-8.8 -38.8 Q-6 -43.6 -2 -45.8', 'M8.8 -38.8 Q6 -43.6 2 -45.8'],
        light: ['M-5.6 -43.8 Q-3 -47.4 -0.8 -47.8', 'M5.6 -43.8 Q3 -47.4 0.8 -47.8'],
        shine: ['M-6 -45 Q-3 -48.4 -0.6 -48', 'M6 -45 Q3 -48.4 0.6 -48'],
      });
      layer('M9.2 -34.4 C11.2 -31 11.6 -26.8 10.6 -23.4 L9.4 -23.8 C9.8 -27 9.4 -30 8 -32.6 Z', { two: true, light: ['M10.2 -32 Q10.6 -28.6 10 -25'], out: false });
      if (facingUp) ring(0, -31, 5.6, { dark: ['M-3.6 -33 Q0 -27.4 3.6 -32.8', 'M-3.4 -30 Q0 -25.2 3.4 -29.8'], light: ['M-3.4 -34.2 Q0 -36 3.4 -34.2'], shine: ['M-2.6 -34 Q0 -35.4 2.6 -34'] });
      layer('M10.4 -33 C16.6 -35 19 -28.4 16.4 -22.6 C14.4 -18.6 10.2 -19.6 9.8 -23.4 C12.2 -24 13.4 -27.2 10.4 -33 Z', {
        m: true, // the bun sits at the back of the head: it shows on the trailing side
        dark: ['M12.4 -30.4 Q15.8 -27 13.4 -22.4', 'M11.4 -26.4 Q14 -24 11.8 -21'],
        light: ['M12.6 -33 Q16.6 -31.6 16 -26.4'],
        shine: ['M13 -32.4 Q17 -30.4 16.2 -26'],
      });
      tie(10.2, -27, 1.4, 3, '#ffd0e0');
      break;
    case 'clawclip': // claw-clip updo: gathered twist with a fanned top and loose strands
      layer('M-5.8 -46 L-7.6 -52.6 L-4.6 -50.6 L-3.8 -56.4 L-1.2 -51.6 L1.4 -57 L3 -51.4 L6 -55 L5.8 -48 Z', {
        dark: ['M-6.4 -49 L-4.2 -46.4', 'M-3.6 -53.4 L-2.2 -47', 'M1.4 -54.6 L1.6 -47', 'M5.4 -51.6 L3.6 -47'],
        light: ['M-4.6 -52 L-3.4 -48.6', 'M1.2 -55.6 L2.2 -50', 'M4.4 -53.2 L4.8 -50'],
      });
      layer(V(-47.2, 9.9, -33.4, H.swept), {
        dark: ['M3 -46.8 Q2.6 -43.6 3 -40.6', 'M2.6 -46.2 Q-3.6 -45 -8.8 -37.6', 'M2 -45.2 Q-2.4 -43 -7 -38.4', 'M5.6 -45.6 Q8 -42.6 8.6 -38'],
        light: ['M-1 -46.8 Q-6 -44.4 -9 -38.6', 'M5 -46.6 Q8.2 -44.6 9 -40'],
        shine: ['M-4.6 -47.2 Q1 -49.8 6.6 -46.4'],
      });
      layer('M9.4 -37 C11.4 -33.4 11.4 -29.6 10.2 -25.6 L8.6 -26 C9.2 -29.6 8.4 -32 6.6 -34.4 Z', { two: true, light: ['M10.4 -33.4 Q10.8 -30 10 -27'], dark: ['M9.8 -34 Q10.2 -30 9.4 -27'] });
      g.save(); // the clip itself
      g.translate(x, fy - 47.4);
      g.fillStyle = '#e9a08a';
      avatarRound(g, -5.6, -1.6, 11.2, 3.6, 1.4);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,.45)';
      g.fillRect(-4.6, -1.2, 9, 0.8);
      g.fillStyle = 'rgba(80,30,20,.45)';
      for (let i = -4; i <= 4; i += 2) g.fillRect(i - 0.3, 0.2, 0.7, 1.6); // teeth
      g.restore();
      break;
    case 'pixie': // textured pixie with a feathered fringe
      layer(V(-47.2, 9.8, -33.4, 'L9 -34 L8.6 -38 L6.4 -36 L4.4 -40 L1.6 -36 L-0.8 -40.4 L-3 -36.4 L-5.8 -39.4 L-7.4 -35.8 L-9 -37.6 L-9 -34 L-9.8 -33.4'), {
        dark: ['M-4 -46.6 Q-5 -43 -4 -39.8', 'M1 -47.2 Q0.4 -43.4 1.4 -39.6', 'M5 -46 Q6.4 -42.6 5.2 -38.6', 'M-8.4 -43 Q-9.2 -39 -8.8 -36.6'],
        light: ['M-6.6 -44.4 Q0 -49 6.6 -44.6'],
        shine: ['M-4.6 -46.6 Q0 -48.8 4.6 -46.4'],
      });
      layer('M-9 -40 L-6.6 -48.2 L-3.4 -43 L1 -50 L4.4 -43 L8.4 -47.4 L9.4 -39 Z', { dark: ['M-3.4 -43 L-3 -47', 'M4.4 -43 L5 -47', 'M1 -50 L1.4 -45'], light: ['M-5.4 -46.6 L-4.6 -44', 'M1 -49 L1.6 -45'], fs: false });
      layer('M9.6 -38 C11.4 -35.6 11.4 -32 10.2 -29.6 L8.6 -31.4 L8.2 -34.6 Z', { two: true, out: false, light: ['M10.2 -35 L9.6 -32'] });
      break;
    case 'twinbuns': // Y2K space buns with scrunchies and wispy bangs
      for (const k of [-1, 1])
        ring(k * 7.4, -48, 4.6, {
          dark: [`M${k * 7.4 - 3} -50.2 Q${k * 7.4} -45.6 ${k * 7.4 + 3} -50`, `M${k * 7.4 - 2.6} -47 Q${k * 7.4} -43.6 ${k * 7.4 + 2.6} -47`],
          light: [`M${k * 7.4 - 3} -51 Q${k * 7.4} -52.8 ${k * 7.4 + 3} -51`],
        });
      layer(V(-46.6, 9.9, -33.4, H.curtain), {
        dark: ['M0 -46.4 Q-0.4 -44 0 -41.2', 'M-3.4 -45.6 Q-5 -42.4 -5.6 -38.8', 'M3.4 -45.6 Q5 -42.4 5.6 -38.8', 'M-7.6 -43 Q-9 -39.4 -9 -35.6', 'M7.6 -43 Q9 -39.4 9 -35.6'],
        light: ['M-6.4 -43.8 Q0 -48.6 6.4 -43.8'],
        shine: ['M-5 -45.6 Q0 -48.2 5 -45.6'],
      });
      layer('M-5 -41.4 L-4 -37.2 L-2.6 -41.2 L-1 -36.8 L0.4 -41 L2 -36.8 L3.2 -41 L4.6 -37.2 L5.2 -41.4 Z', { out: false, dark: ['M-1 -41 L-1 -37.4', 'M2 -41 L2 -37.4'], fs: false });
      for (const k of [-1, 1]) {
        tie(k * 7.4, -44.8, 4.6, 1.5, '#ff7aa8');
        tie(k * 7.4, -44.8, 3.2, 0.5, '#ffd0e0');
      }
      layer('M9.2 -36 C10.4 -33 10.2 -30 9 -27.6 C8.6 -29.6 8.4 -32 7.8 -34.4 Z', { two: true });
      break;
    case 'braid': // side fishtail braid draped over the shoulder with a ribbon
      layer(V(-47.6, 9.9, -33.4, H.curtain), {
        dark: ['M0 -47 Q-0.4 -44 0 -41.2', 'M-3.4 -46.4 Q-5 -42.6 -5.6 -38.8', 'M3.4 -46.4 Q5 -42.6 5.6 -38.8', 'M-7.6 -44 Q-9.2 -40.4 -9.2 -35.6', 'M7.6 -44 Q9.2 -40.4 9.2 -35.6'],
        light: ['M-6.4 -44.4 Q0 -49 6.4 -44.4', 'M-1.6 -43.4 Q-4.6 -42 -7 -39'],
        shine: ['M-5.4 -46.6 Q0 -49.2 5.4 -46.6'],
      });
      layer('M8 -38 C10.6 -33 10.6 -29 9.4 -26 C8.2 -28 7.6 -31 6.6 -34.4 Z', { two: true });
      for (let i = 0; i < 7; i++) {
        const cy = -34 + i * 3.4,
          w = 3.1 - i * 0.12;
        layer(`M${8.4 - w} ${cy} C${8.4 - w} ${cy - 2.4} ${8.4 + w} ${cy - 2.4} ${8.4 + w} ${cy} C${8.4 + w} ${cy + 2.4} ${8.4 - w} ${cy + 2.4} ${8.4 - w} ${cy} Z`, {
          m: true,
          dark: [`M${8.4 - w + 1} ${cy - 1.6} L${8.4 + w - 1} ${cy + 1.2}`],
          light: [`M${8.4 + w - 1} ${cy - 1.6} L${8.4 - w + 1} ${cy + 1.2}`],
          fs: false,
        });
      }
      g.save();
      g.translate(x + s * 8.4, fy - 10.4);
      g.fillStyle = '#c0432a';
      g.beginPath();
      g.ellipse(0, 0, 2.6, 1.8, 0, 0, 6.28);
      g.fill();
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(-2.4, 3.6);
      g.lineTo(0.4, 2.6);
      g.lineTo(2.6, 3.8);
      g.closePath();
      g.fill();
      g.restore();
      break;
    case 'curly': { // curly shag: bouncy ringlets with face-framing curls
      const curls = [[-5.6, -45.4], [0, -48], [5.6, -45.4], [-9.6, -40.6], [9.6, -40.6], [-11, -34.6], [11, -34.6], [-11.4, -28.8], [11.4, -28.8], [-10.6, -23.4], [10.6, -23.4], [-9.2, -19], [9.2, -19]];
      if (facingUp) layer('M-10.4 -36 C-13 -30 -12.6 -22 -9 -17.4 C-4 -15.6 4 -15.6 9 -17.4 C12.6 -22 13 -30 10.4 -36 C8 -45 -8 -45 -10.4 -36 Z', {});
      layer(V(-47.4, 10, -33, H.curtain), { dark: ['M0 -47 Q-0.4 -44 0 -41.2'], light: ['M-6.4 -44.2 Q0 -49 6.4 -44.2'] });
      for (const [cx, cy] of curls) ring(cx, cy, 3.8, { dark: [`M${cx - 2.2} ${cy + 0.6} A2.4 2.4 0 0 1 ${cx + 2.2} ${cy - 0.6}`, `M${cx - 1.4} ${cy + 2} A1.6 1.6 0 0 0 ${cx + 1.6} ${cy + 1.4}`], light: [`M${cx - 2.4} ${cy - 1.2} Q${cx} ${cy - 3.4} ${cx + 2.4} ${cy - 1.2}`] });
      for (const [cx, cy] of [[-4, -41], [4, -41], [-7, -38.4], [7, -38.4]]) ring(cx, cy, 2.4, { light: [`M${cx - 1.4} ${cy - 0.8} Q${cx} ${cy - 2} ${cx + 1.4} ${cy - 0.8}`], fs: false });
      layer(V(-46.4, 9.6, -33.4, H.curtain), { out: false, light: ['M-5 -44 Q0 -47.6 5 -44'], fs: false });
      break;
    }
  }
}

/* ---------- sit poses (one per job) ---------- */

// front=false draws the parts behind the torso, front=true the parts in front of it.
function avatarSitLegs({ g, x, fy, gy, pose, legCol, bootCol }, front) {
  const hy = fy - 9; // hip height
  const leg = (pts) => {
    g.strokeStyle = legCol;
    g.lineWidth = 5;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
    g.stroke();
    g.lineCap = 'butt';
  };
  const boot = (bx, by, w = 6) => {
    g.fillStyle = bootCol;
    g.fillRect(bx, by, w, 4);
  };
  if (pose === 'forward') {
    // swordsman: relaxed, legs stretched out toward the viewer
    if (front) return;
    leg([[x - 3.5, hy], [x - 5.5, hy + 8]]);
    leg([[x + 3.5, hy], [x + 5.5, hy + 8]]);
    boot(x - 9, hy + 8);
    boot(x + 3, hy + 8);
  } else if (pose === 'cross') {
    // waif: cross-legged
    if (!front) {
      leg([[x - 4, hy], [x - 12, hy + 5]]);
      leg([[x + 4, hy], [x + 12, hy + 5]]);
    } else {
      leg([[x - 12, hy + 5], [x + 3, hy + 8]]);
      leg([[x + 12, hy + 5], [x - 3, hy + 8]]);
      boot(x + 1, hy + 7);
      boot(x - 7, hy + 7);
    }
  } else if (pose === 'kneel') {
    // knight: on one knee
    if (front) return;
    leg([[x + 3, hy], [x + 9, hy + 6]]);
    boot(x + 6, hy + 6);
    leg([[x - 3, hy], [x - 8, hy + 4], [x - 13, hy + 5]]);
    boot(x - 18, hy + 3, 5);
  } else if (pose === 'squat') {
    // assassin: low crouch, feet wide
    if (front) return;
    leg([[x - 3, hy], [x - 9.5, hy - 1], [x - 7.5, hy + 8]]);
    leg([[x + 3, hy], [x + 9.5, hy - 1], [x + 7.5, hy + 8]]);
    boot(x - 11, hy + 8);
    boot(x + 5, hy + 8);
  } else if (pose === 'hug') {
    // archer: knees up, bow across them
    if (!front) {
      leg([[x - 8, hy - 2], [x - 6, hy + 7]]);
      leg([[x + 8, hy - 2], [x + 6, hy + 7]]);
      boot(x - 9, hy + 7);
      boot(x + 3, hy + 7);
    } else {
      leg([[x - 3, hy + 1], [x - 8, hy - 3]]);
      leg([[x + 3, hy + 1], [x + 8, hy - 3]]);
    }
  } else if (pose === 'kneeup') {
    // ranger: one leg stretched out, one knee up
    if (!front) {
      leg([[x - 3, hy], [x - 10, hy + 8]]);
      boot(x - 14, hy + 8);
      leg([[x + 8, hy - 3], [x + 6, hy + 8]]);
      boot(x + 3, hy + 7);
    } else leg([[x + 3, hy + 1], [x + 8, hy - 3]]);
  }
}


// Profile (left / right) sit poses. Same six class poses as the front view, seen from the side: u = forward, v = down
// from the hip. Far leg is drawn behind the body ('far'), near leg after it ('near').
const SIT_SIDE = {
  forward: { far: [[0, 1], [8, 2.4], [15.5, 3.4]], near: [[0, 1], [7, -0.5], [13, 3.4]], ff: [-0.3, 0], flip: [0, 0] },
  cross: { far: [[0, 1.5], [8.5, 2.6], [3, 3.8]], near: [[0, 1.5], [10, 3], [5.2, 4]], ff: [0.1, 0.1], flip: [0, 0] },
  kneel: { far: [[0, 1], [-1, 3.2], [-9.5, 3.4]], near: [[0, 1], [8, -1.5], [9, 3.4]], ff: [0.15, 0], flip: [1, 0] },
  squat: { far: [[0, 1], [8, -3.5], [6, 2.2]], near: [[0, 1], [7, -4.5], [4.5, 2.2]], ff: [-0.5, -0.5], flip: [0, 0] },
  hug: { far: [[0, 1], [7.5, -4], [6, 3.2]], near: [[0, 1], [8.5, -5], [6.5, 3.2]], ff: [0, 0], flip: [0, 0] },
  kneeup: { far: [[0, 1], [8, 2.4], [15.5, 3.4]], near: [[0, 1], [8, -4.5], [6, 3.2]], ff: [-0.3, 0], flip: [0, 0] },
};
function avatarSitLegsSide({ g, x, fy, dir, pose, legCol, bootCol, soleCol }, which) {
  const d = SIT_SIDE[pose];
  if (!d) return;
  const hy = fy - 9,
    far = which === 'far',
    pts = d[which],
    col = far ? avatarShade(legCol, -0.24) : legCol;
  g.save();
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = col;
  g.lineWidth = 5;
  g.beginPath();
  pts.forEach(([u, v], i) => (i ? g.lineTo(x + dir * u, hy + v) : g.moveTo(x + dir * u, hy + v)));
  g.stroke();
  if (!far) {
    g.strokeStyle = 'rgba(255,255,255,.09)'; // soft light along the top of the thigh
    g.lineWidth = 1.4;
    g.beginPath();
    pts.forEach(([u, v], i) => (i ? g.lineTo(x + dir * u, hy + v - 1.5) : g.moveTo(x + dir * u, hy + v - 1.5)));
    g.stroke();
  }
  g.restore();
  // shoe at the ankle, toe forward (or backward for a kneeling shin)
  const [au, av] = pts[pts.length - 1];
  const sd = d.flip[far ? 0 : 1] ? -dir : dir;
  g.save();
  g.translate(x + dir * au, hy + av);
  g.scale(sd, 1);
  g.rotate(d.ff[far ? 0 : 1]);
  g.fillStyle = far ? avatarShade(bootCol, -0.24) : bootCol;
  avatarRound(g, -2.6, -1.6, 8.2, 4.2, 1.9);
  g.fill();
  if (!far) {
    g.fillStyle = 'rgba(255,255,255,.22)';
    g.fillRect(0.6, -1.2, 3.6, 0.9);
  }
  if (soleCol) {
    g.fillStyle = far ? avatarShade(soleCol, -0.24) : soleCol;
    g.fillRect(-2.6, 1.4, 8.2, 1.2);
  }
  g.restore();
}

// The class weapon next to the profile-seated character (drawn before the arms so the hands grip it).
function avatarSitPropSide({ g, x, fy, gy, o, dir, lean }, pose) {
  const t2 = o.tier === 2,
    hy = fy - 9,
    X = (u) => x + dir * u;
  if (pose === 'kneel') {
    // sword planted in front of the knee, both hands on the pommel
    const u = 10.5;
    g.fillStyle = t2 ? '#fff1a8' : '#e8eef2';
    g.beginPath();
    g.moveTo(X(u - 2), hy - 8);
    g.lineTo(X(u + 2), hy - 8);
    g.lineTo(X(u + 1.2), hy + 5);
    g.lineTo(X(u), hy + 7);
    g.lineTo(X(u - 1.2), hy + 5);
    g.fill();
    g.fillStyle = '#d9b24a';
    g.fillRect(X(u) - 4, hy - 10.5, 8, 2.6);
    g.fillStyle = '#6b4a2a';
    g.fillRect(X(u) - 1.3, hy - 16, 2.6, 5.5);
    g.fillStyle = '#d9b24a';
    g.beginPath();
    g.arc(X(u), hy - 16.6, 1.8, 0, 6.28);
    g.fill();
  } else if (pose === 'forward') {
    // sword laid on the ground behind him
    g.fillStyle = '#e8eef2';
    g.beginPath();
    g.moveTo(X(-6), hy + 2.4);
    g.lineTo(X(-27), hy + 2.9);
    g.lineTo(X(-30), hy + 4);
    g.lineTo(X(-27), hy + 5.1);
    g.lineTo(X(-6), hy + 5.6);
    g.fill();
    g.fillStyle = '#d9b24a';
    g.fillRect(X(-6) - (dir > 0 ? 3 : 0), hy + 0.6, 3, 7);
    g.fillStyle = '#6b4a2a';
    g.fillRect(X(-1.5) - (dir > 0 ? 3 : 0), hy + 3, 4.5, 2.6);
  } else if (pose === 'cross') {
    // knife stuck in the ground in front of her
    const u = 17;
    g.fillStyle = '#6b4a2a';
    g.fillRect(X(u) - 1.5, hy - 3.5, 3, 5.5);
    g.fillStyle = '#e8eef2';
    g.beginPath();
    g.moveTo(X(u) - 2.3, hy + 2);
    g.lineTo(X(u) + 2.3, hy + 2);
    g.lineTo(X(u), hy + 9);
    g.fill();
  } else if (pose === 'squat') {
    // dagger in a reverse grip, held at the knee
    const u = 11.2 + lean * 8;
    g.fillStyle = '#6b4a2a';
    g.fillRect(X(u) - 1.5, hy - 12.5, 3, 4.5);
    g.fillStyle = '#b9a4ff';
    g.beginPath();
    g.moveTo(X(u) - 2.1, hy - 8);
    g.lineTo(X(u) + 2.1, hy - 8);
    g.lineTo(X(u), hy + 2.5);
    g.fill();
  } else if (pose === 'hug' || pose === 'kneeup') {
    // bow standing upright in front of the feet
    avatarWeapon(g, X(pose === 'hug' ? 15 : 17), gy - 6, dir > 0 ? 0 : Math.PI, { ...o, weapon: 'bow', swing: 0 }, 1);
  }
}

// The class weapon rests next to / on the seated character.
function avatarSitProp({ g, x, fy, gy, o, bw }, pose) {
  const t2 = o.tier === 2;
  if (pose === 'kneel') {
    // sword planted in front, tip on the ground
    const top = fy - 13;
    g.fillStyle = t2 ? '#fff1a8' : '#e8eef2';
    g.beginPath();
    g.moveTo(x - 2.5, top);
    g.lineTo(x + 2.5, top);
    g.lineTo(x + 3.5, gy + 7);
    g.lineTo(x + 1.5, gy + 10);
    g.lineTo(x - 0.5, gy + 7);
    g.fill();
    g.fillStyle = '#d9b24a';
    g.fillRect(x - 6, top - 3, 12, 3);
    g.fillStyle = '#6b4a2a';
    g.fillRect(x - 1.5, top - 9, 3, 6);
    g.fillStyle = '#d9b24a';
    g.beginPath();
    g.arc(x, top - 10, 2, 0, 6.28);
    g.fill();
  } else if (pose === 'forward') {
    // sword laid across the lap
    g.save();
    g.translate(x, fy - 6);
    g.rotate(-0.1);
    g.fillStyle = '#e8eef2';
    g.fillRect(-20, -2, 30, 4);
    g.beginPath();
    g.moveTo(-20, -2);
    g.lineTo(-25, 0);
    g.lineTo(-20, 2);
    g.fill();
    g.fillStyle = '#d9b24a';
    g.fillRect(10, -5, 3, 10);
    g.fillStyle = '#6b4a2a';
    g.fillRect(13, -1.5, 7, 3);
    g.restore();
  } else if (pose === 'cross') {
    // knife stuck in the ground beside her/him
    g.fillStyle = '#6b4a2a';
    g.fillRect(x + 14, gy - 7, 3, 6);
    g.fillStyle = '#e8eef2';
    g.beginPath();
    g.moveTo(x + 13.2, gy - 1);
    g.lineTo(x + 17.8, gy - 1);
    g.lineTo(x + 15.5, gy + 7);
    g.fill();
  } else if (pose === 'squat') {
    // dagger held in a reverse grip
    g.fillStyle = '#6b4a2a';
    g.fillRect(x + 10, fy - 12, 3, 4);
    g.fillStyle = '#b9a4ff';
    g.beginPath();
    g.moveTo(x + 9.5, fy - 8);
    g.lineTo(x + 13.5, fy - 8);
    g.lineTo(x + 11.5, fy + 3);
    g.fill();
  } else if (pose === 'hug') {
    avatarBowRest(g, x, gy, bw, o, 1); // bow held upright beside
  } else if (pose === 'kneeup') {
    avatarBowRest(g, x, gy, bw, o, 1); // bow held upright beside
  }
}

// Bow standing upright on the ground right next to the character; the hanging arm covers the grip.
function avatarBowRest(g, x, gy, bw, o, alpha) {
  avatarWeapon(g, x + bw / 2 - 13.5, gy - 6, 0, { ...o, weapon: 'bow', swing: 0 }, alpha);
}

// Front hand (arm reaches out to the grip) and, while drawing, the string hand.
// Aiming up (back to the camera): the bow and both hands reach further out ahead of the character so they
// clear the head instead of hanging in front of the body.
function avatarBowLead(face) {
  return 14 * Math.max(0, Math.min(1, (-Math.sin(face) - 0.1) / 0.8));
}
function avatarBowHands(g, x, fy, bw, face, skin, alpha, k, o, sleeve) {
  const c = Math.cos(face),
    sn = Math.sin(face),
    lead = avatarBowLead(face);
  const cx = x + c * (2 + lead),
    cy = fy - 22 + sn * (1 + lead) + avatarReady(o) * 0.9; // bow centre (same as avatarWeapon)
  const grip = [cx + c * 13, cy + sn * 13];
  const sh = [x + (c >= 0 ? bw / 2 + 1.5 : -bw / 2 - 1.5), fy - 22];
  g.save();
  g.globalAlpha = alpha;
  g.strokeStyle = skin;
  g.fillStyle = skin;
  g.lineCap = 'round';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(sh[0], sh[1]);
  g.lineTo(grip[0], grip[1]);
  g.stroke();
  g.beginPath();
  g.arc(grip[0], grip[1], 2.6, 0, 6.28);
  g.fill();
  const draw = k < 0 ? 0 : k < 0.6 ? k / 0.6 : 0;
  if (draw > 0) {
    const m = -3 + 14 - draw * 13; // string midpoint along the aim line
    const hx = cx + c * m,
      hy = cy + sn * m;
    // back arm: shoulder -> string hand, so the whole arm visibly pulls back as the bow is drawn
    const bs = [x + (c >= 0 ? -bw / 2 - 1.5 : bw / 2 + 1.5), fy - 22];
    const mx = bs[0] + (hx - bs[0]) * 0.5,
      my = bs[1] + (hy - bs[1]) * 0.5 + 1;
    g.strokeStyle = sleeve || skin;
    g.beginPath();
    g.moveTo(bs[0], bs[1]);
    g.lineTo(mx, my);
    g.stroke();
    g.strokeStyle = skin;
    g.beginPath();
    g.moveTo(mx, my);
    g.lineTo(hx, hy);
    g.stroke();
    g.beginPath();
    g.arc(hx, hy, 2.2, 0, 6.28);
    g.fill();
  }
  g.restore();
}

function avatarRound(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// Waif: one dagger in the hand on the facing side. Assassin: a dagger in each hand (one per side of the
// body); only the arm that is attacking swings, the other keeps its dagger ready. In both cases the arm
// reaches out from the shoulder and the hand grips the dagger handle.
function avatarHeld(g, x, y, face, o, alpha) {
  const knife = o.weapon === 'knife' && (o.job === 'assassin' || o.job === 'waif');
  const sword = o.weapon === 'sword';
  if (!knife && !sword) return avatarWeapon(g, x, y, face, o, alpha);
  const look = o.look || null;
  const female = !!look && look.gender === 'female';
  const hw = AVATAR_SIDE ? 2.5 : (female ? 16 : 18) / 2 + 1.5; // shoulder distance from the body centre
  const cloth = (look && look.outfitColor) || o.col;
  const skin = look ? look.skinColor : AVATAR_SKIN;
  if (sword) {
    const sd = Math.cos(face) >= 0 ? 1 : -1;
    const sl = o.job === 'knight' ? avatarShade(cloth, -0.1) : '#f1ede0'; // same sleeve as the resting arm
    return avatarWeapon(g, x, y, face, o, alpha, { sx: x + sd * hw, sy: y - 5, sx2: x - sd * hw, skin, sleeve: sl });
  }
  const sleeve = o.job === 'assassin' ? avatarShade(cloth, -0.62) : cloth;
  if (o.job === 'waif') {
    const sd = Math.cos(face) >= 0 ? 1 : -1;
    return avatarWeapon(g, x, y, face, o, alpha, { sx: x + sd * hw, sy: y - 5, skin, sleeve });
  }
  const px = Math.abs(Math.sin(face)), // facing up / down: each dagger stays on its own side of the body
    py = Math.cos(face); // facing left / right: they sit one above the other
  const striking = o.swing > 0 ? (o.swingArm ? 1 : 0) : -1;
  for (let i = 0; i < 2; i++) {
    const side = i ? 1 : -1; // left arm / right arm
    const ao = striking === i ? o : { ...o, swing: 0 };
    avatarWeapon(g, x + px * side * 5, y + py * side * 3, face, ao, alpha, { sx: x + side * hw, sy: y - 5, skin, sleeve });
  }
}

/* ---------- held weapon = the same drawing as the shop / inventory icon ---------- */
// Melee icons are repainted upright (blade up) and the bow icons without their tilt, onto a transparent sprite.
const AVATAR_WEAPON_SPRITES = {};
const AVATAR_BOW_STRING_X = { archer_weapon_1: 27.2, archer_weapon_2: 31, archer_weapon_3: 30.2, archer_weapon_4: 28, archer_weapon_5: 32, archer_weapon_6: 30, archer_weapon_7: 28.2, archer_weapon_8: 32, archer_weapon_9: 29 };
const AVATAR_WEAPON_ART = {
  // the pair / double icons show two blades; the character holds just one of them
  waif_weapon_7: (g) => {
    g.translate(28, 40);
    g.scale(1.3, 1.3);
    iconKatar(g, '#aab0d6', '#1d2040', '#e8c35a');
    ICON_SPRITE.L = 38;
  },
  waif_weapon_8: (g, c) => {
    g.translate(24, 43);
    iconPath(g, (p) => { p.moveTo(-3.4, 0); p.bezierCurveTo(-5, -13, -1, -25, 10, -31); p.bezierCurveTo(5.5, -21, 4.5, -10, 3.4, 0); p.closePath(); }, iconSteel(g, -4, 8, '#e8d9a8'), 'rgba(0,0,0,.6)');
    iconPath(g, (p) => { p.moveTo(3.2, -2); p.bezierCurveTo(4.5, -12, 5.5, -21, 10, -31); }, null, c, 1.2);
    iconBar(g, 0, 10, 2.4, '#b08a3a');
    iconGrip(g, 2.4, 8, 3.8, '#1b2330', '#43f0e0');
    iconCircle(g, 0, 12.4, 2.2, null, '#b08a3a', 1.3);
    ICON_SPRITE.L = 46;
  },
};
function avatarWeaponSprite(w, bow) {
  if (typeof ITEM_ART === 'undefined' || typeof ICON_SPRITE === 'undefined' || !w || !w.id) return null;
  if (AVATAR_WEAPON_SPRITES[w.id] !== undefined) return AVATAR_WEAPON_SPRITES[w.id];
  const art = (!bow && AVATAR_WEAPON_ART[w.id]) || ITEM_ART[w.id];
  let res = null;
  if (art) {
    const R = 3,
      cv = document.createElement('canvas');
    cv.width = cv.height = 56 * R;
    const c = cv.getContext('2d');
    c.scale(R, R);
    c.lineJoin = 'round';
    c.lineCap = 'round';
    if (bow) {
      let n = 0; // drop the icon's own tilt (the first rotate) so the bow points straight along the aim line
      const rot = c.rotate.bind(c);
      c.rotate = (a) => (n++ ? rot(a) : undefined);
    }
    ICON_SPRITE = { L: 0 };
    try {
      art(c, w.col, w.tier || 1, w);
      if (bow || ICON_SPRITE.L) res = { cv, L: ICON_SPRITE.L };
    } catch (e) {
      res = null;
    }
    ICON_SPRITE = null;
  }
  AVATAR_WEAPON_SPRITES[w.id] = res;
  return res;
}
// g is already translated to the hand and rotated by the attack angle `a`; +x = the way the weapon points
function avatarDrawWeaponSprite(g, spr, o, a) {
  const flip = Math.cos(a) < 0 ? -1 : 1; // keep the drawing the right way up when facing left
  if (o.weapon === 'bow') {
    // the shop icon has its belly on the left; the held bow must bulge AWAY from the archer, so it is mirrored
    const s = 0.62;
    g.scale(1, flip);
    g.translate(7, 0);
    g.scale(-s, s);
    g.drawImage(spr.cv, -(AVATAR_BOW_STRING_X[o.gear.weapon.id] || 28), -28, 56, 56);
    return;
  }
  const L = spr.L,
    s = (o.weapon === 'knife' ? 30 : 44) / L,
    py = 28 + L / 2 - (o.weapon === 'knife' ? 0.22 : 0.14) * L; // pivot on the grip
  g.rotate(Math.PI / 2);
  g.scale(flip, 1);
  g.scale(s, s);
  g.drawImage(spr.cv, -28, -py, 56, 56);
}

function avatarWeapon(g, x, y, face, o, alpha = 1, hand = null) {
  const gearCol = o.gear && o.gear.weapon ? o.gear.weapon.col : null; // equipped weapon's blade / limb color
  // attack progress 0..1; melee blades wind up, snap through the arc and ease out
  const k = o.swing > 0 ? Math.min(1, Math.max(0, 1 - o.swing / o.swingDur)) : -1;
  const ease = k < 0 ? 0.5 : 1 - Math.pow(1 - k, 3);
  const rdy = avatarReady(o);
  let a = face;
  let thrust = 0;
  if (o.weapon === 'sword') {
    if (k >= 0) a += -1.25 + 2.5 * ease;
    else a += -0.5 + rdy * 0.07; // idle: blade tilts up and down
  } else if (o.weapon === 'knife') {
    if (k >= 0) {
      a += -0.55 + 1.1 * ease;
      thrust = Math.sin(k * Math.PI) * 9;
    } else a += -0.3 + rdy * 0.1; // idle: dagger flicks gently
  }
  g.save();
  g.globalAlpha = alpha;
  // the bow is held at shoulder height with the grip ~13px out, so a hand can really hold it
  if (o.weapon === 'bow') {
    const lead = avatarBowLead(face);
    g.translate(x + Math.cos(face) * (2 + lead), y - 4 + Math.sin(face) * (1 + lead) + rdy * 0.9);
  }
  let tx = x + Math.cos(face) * (8 + thrust),
    ty = y + Math.sin(face) * (4 + thrust * 0.5);
  if (hand && k < 0 && rdy) {
    // idle: the hand rises and falls a little with the weapon
    tx += (Math.cos(a) - Math.cos(face)) * 4;
    ty += (Math.sin(a) - Math.sin(face)) * 4 + rdy * 0.8;
  }
  if (o.weapon === 'knife' && hand && k >= 0) {
    // the hand sweeps across with the slash (on top of the forward thrust)
    tx += (Math.cos(a) - Math.cos(face)) * 6;
    ty += (Math.sin(a) - Math.sin(face)) * 6;
  }
  if (o.weapon === 'sword' && hand) {
    // the hand carries the blade: it sweeps along the cut and punches forward at the peak of the swing
    const reach = 4 + (k >= 0 ? Math.sin(k * Math.PI) * 4 : 0);
    tx = x + Math.cos(face) * 4 + Math.cos(a) * reach;
    ty = y - 1 + Math.sin(face) * 2 + Math.sin(a) * reach;
  }
  if (o.weapon !== 'bow') g.translate(tx, ty);
  g.rotate(a);
  const spr = o.gear && o.gear.weapon ? avatarWeaponSprite(o.gear.weapon, o.weapon === 'bow') : null;
  if (spr) avatarDrawWeaponSprite(g, spr, o, a);
  else if (o.weapon === 'knife') {
    g.fillStyle = '#6b4a2a';
    g.fillRect(2, -2, 6, 4);
    g.fillStyle = gearCol || (o.tier === 2 ? '#b9a4ff' : '#e8eef2');
    g.beginPath();
    g.moveTo(8, -3);
    g.lineTo(22, 0);
    g.lineTo(8, 3);
    g.fill();
  } else if (o.weapon === 'sword') {
    g.fillStyle = '#6b4a2a';
    g.fillRect(0, -2, 7, 4);
    g.fillStyle = '#d9b24a';
    g.fillRect(7, -6, 3, 12);
    g.fillStyle = gearCol || (o.tier === 2 ? '#fff1a8' : '#e8eef2');
    g.fillRect(10, -2.5, 26, 5);
    g.beginPath();
    g.moveTo(36, -2.5);
    g.lineTo(41, 0);
    g.lineTo(36, 2.5);
    g.fill();
  } else if (o.weapon === 'bow') {
    // draw the string back, then release with a small recoil
    const draw = k < 0 ? 0 : k < 0.6 ? k / 0.6 : 0;
    const recoil = k >= 0.6 ? Math.sin(((k - 0.6) / 0.4) * Math.PI) * 2.5 : 0;
    const bx = -3 - recoil; // arc centre; the belly (grip) sits 13px out
    g.strokeStyle = gearCol || (o.tier === 2 ? '#bff0ff' : '#8a5a2a');
    g.lineWidth = 3;
    g.beginPath();
    g.arc(bx, 0, 16, -1.2, 1.2);
    g.stroke();
    const tx = bx + 16 * Math.cos(1.2);
    const ty = 16 * Math.sin(1.2);
    const mid = bx + 14 - draw * 13;
    g.strokeStyle = '#ddd';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(tx, -ty);
    g.lineTo(mid, 0);
    g.lineTo(tx, ty);
    g.stroke();
    if (draw > 0) {
      g.strokeStyle = '#d8c79a'; // nocked arrow
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(mid, 0);
      g.lineTo(bx + 22, 0);
      g.stroke();
      g.fillStyle = gearCol || (o.tier === 2 ? '#bff0ff' : '#e8eef2');
      g.beginPath();
      g.moveTo(bx + 22, -2.5);
      g.lineTo(bx + 27, 0);
      g.lineTo(bx + 22, 2.5);
      g.fill();
    }
  }
  g.restore();
  if (hand && (o.weapon === 'knife' || o.weapon === 'sword')) {
    // the arm reaches from the shoulder to the handle and the fist closes around it
    // swords are two-handed: the main hand at the grip, the off hand just behind it toward the pommel
    const arms = [{ gl: o.weapon === 'sword' ? 1 : 5, sx: hand.sx, sy: hand.sy }];
    if (o.weapon === 'sword' && hand.sx2 !== undefined) arms.unshift({ gl: -5.5, sx: hand.sx2, sy: hand.sy });
    g.save();
    g.globalAlpha = alpha;
    g.lineCap = 'round';
    for (const A of arms) {
      const gx = tx + Math.cos(a) * A.gl,
        gy = ty + Math.sin(a) * A.gl;
      const mx = A.sx + (gx - A.sx) * 0.55,
        my = A.sy + (gy - A.sy) * 0.55;
      g.lineWidth = 3.4;
      g.strokeStyle = hand.sleeve; // sleeve up to the forearm
      g.beginPath();
      g.moveTo(A.sx, A.sy);
      g.lineTo(mx, my);
      g.stroke();
      g.strokeStyle = hand.skin; // bare forearm
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(mx, my);
      g.lineTo(gx, gy);
      g.stroke();
      g.fillStyle = hand.skin; // fist wrapped around the grip
      g.beginPath();
      g.arc(gx, gy, 2.5, 0, 6.28);
      g.fill();
      g.fillStyle = 'rgba(0,0,0,.18)';
      g.fillRect(gx - 1.6, gy + 0.4, 3.2, 0.7);
    }
    g.restore();
  }
}

/* ---------- equipment looks (armor plates + headgear), drawn over the class outfit ---------- */

// Armor: chest plate with trim, shoulder pads from tier 2, gold belt from tier 4, gem from tier 5.
function avatarArmor({ g, x, fy, bw, o }) {
  const a = o.gear.armor,
    t = a.tier || 1,
    dark = avatarShade(a.col, -0.45);
  g.fillStyle = a.col;
  g.globalAlpha = 0.9;
  avatarRound(g, x - bw / 2 + 2, fy - 26, bw - 4, 11, 3);
  g.fill();
  g.globalAlpha = 1;
  g.fillStyle = dark;
  g.fillRect(x - 0.6, fy - 26, 1.2, 11);
  g.fillRect(x - bw / 2 + 2, fy - 16, bw - 4, 1.2);
  g.fillStyle = 'rgba(255,255,255,.28)';
  g.fillRect(x - bw / 2 + 3, fy - 25, bw - 6, 2);
  if (t >= 2)
    for (const sx of [-1, 1]) {
      g.fillStyle = a.col;
      avatarRound(g, x + sx * (bw / 2 + 0.5) - 3.5, fy - 28, 7, 5, 2);
      g.fill();
      g.fillStyle = dark;
      g.fillRect(x + sx * (bw / 2 + 0.5) - 3.5, fy - 24, 7, 1);
    }
  if (t >= 4) {
    g.fillStyle = '#ffe27a';
    g.fillRect(x - bw / 2, fy - 14.5, bw, 1.8);
  }
  if (t >= 5) {
    g.fillStyle = '#ff5a7a';
    g.beginPath();
    g.arc(x, fy - 21, 1.8, 0, 6.28);
    g.fill();
  }
}

// Headgear: hood (waif), helm (swordsman), feather cap / circlet (archer).
// The character wears the SAME drawing as the shop / inventory icon (ITEM_ART), painted once onto a
// transparent sprite and scaled to fit the head. Falls back to the simple shapes below if no art exists.
const AVATAR_HEAD_SPRITES = {};
const AVATAR_HEAD_SCALE = 0.62;
const AVATAR_HEAD_LIFT = 7; // px the hat is raised so it rests ON the head and the hair stays visible // icon is 56px with the head centred at (28,30)
function avatarHeadSprite(h) {
  if (typeof ITEM_ART === 'undefined' || !h.id || !ITEM_ART[h.id]) return null;
  if (AVATAR_HEAD_SPRITES[h.id]) return AVATAR_HEAD_SPRITES[h.id];
  const R = 3,
    cv = document.createElement('canvas');
  cv.width = cv.height = 56 * R;
  const c = cv.getContext('2d');
  c.scale(R, R);
  c.lineJoin = 'round';
  c.lineCap = 'round';
  ITEM_ART[h.id](c, h.col, h.tier || 1, h);
  return (AVATAR_HEAD_SPRITES[h.id] = cv);
}
// Side view of a headgear icon. The icon is treated as a solid of revolution: every row of the icon is a circle whose
// radius is that row's half-width, and the circle is turned 90 degrees. The silhouette stays the same, but the front
// of the hat (emblem, visor, crest, stripes) slides to the facing edge and gets compressed, the sides of the hat
// stretch across the middle, and the back half is a slightly darker mirror. Built once per item (facing right).
const AVATAR_HEAD_PROFILE = {};
function avatarHeadProfile(h, spr) {
  if (AVATAR_HEAD_PROFILE[h.id]) return AVATAR_HEAD_PROFILE[h.id];
  const W = spr.width,
    H = spr.height,
    cx = W / 2;
  const src = spr.getContext('2d').getImageData(0, 0, W, H).data;
  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  const c = out.getContext('2d');
  const img = c.createImageData(W, H);
  const dst = img.data;
  const A = (xx, yy) => src[(yy * W + xx) * 4 + 3];
  for (let yy = 0; yy < H; yy++) {
    let xl = -1,
      xr = -1;
    for (let xx = 0; xx < W; xx++)
      if (A(xx, yy) > 20) {
        if (xl < 0) xl = xx;
        xr = xx;
      }
    if (xl < 0) continue;
    const w = Math.max(cx - xl, xr - cx, 2); // half-width of this row
    for (let xx = xl; xx <= xr; xx++) {
      if (A(xx, yy) <= 20) continue; // keep the silhouette (and any holes) of the icon
      const u = (xx + 0.5 - cx) / w;
      const uc = Math.max(-1, Math.min(1, u));
      const sg = Math.sqrt(1 - uc * uc) * (uc > 0 ? 1 : -1); // front half: right half of the row, back half: left half
      let sx = Math.round(cx + sg * Math.max(1, w - 8)); // sample inside the outline so the dark rim does not smear across the middle
      sx = Math.max(xl, Math.min(xr, sx));
      if (Math.abs(xx + 0.5 - cx) > w - 3 || A(sx, yy) <= 20) sx = xx; // keep the outline ring / holes as they are
      const a = (yy * W + sx) * 4,
        b = (yy * W + xx) * 4;
      dst[b] = src[a];
      dst[b + 1] = src[a + 1];
      dst[b + 2] = src[a + 2];
      dst[b + 3] = src[(yy * W + xx) * 4 + 3];
    }
  }
  c.putImageData(img, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  const gr = c.createLinearGradient(cx - W * 0.4, 0, cx + W * 0.4, 0);
  gr.addColorStop(0, 'rgba(0,0,0,.28)'); // back of the hat is a little darker, the front a little lighter
  gr.addColorStop(0.5, 'rgba(0,0,0,.05)');
  gr.addColorStop(1, 'rgba(255,255,255,.1)');
  c.fillStyle = gr;
  c.fillRect(0, 0, W, H);
  return (AVATAR_HEAD_PROFILE[h.id] = out);
}
function avatarHeadgear(g, x, fy, h, facingUp, sideDir = 0) {
  const spr = avatarHeadSprite(h);
  if (spr) {
    const s = AVATAR_HEAD_SCALE;
    if (sideDir && !facingUp) {
      g.save();
      g.translate(x, 0);
      g.scale(sideDir, 1);
      g.translate(-x, 0);
      g.drawImage(avatarHeadProfile(h, spr), x - 28 * s, fy - 36 - 30 * s - AVATAR_HEAD_LIFT, 56 * s, 56 * s);
      g.restore();
      return;
    }
    g.drawImage(spr, x - 28 * s, fy - 36 - 30 * s - AVATAR_HEAD_LIFT, 56 * s, 56 * s);
    return;
  }
  const t = h.tier || 1,
    dark = avatarShade(h.col, -0.4),
    cy = fy - 36;
  if (h.kind === 'hood') {
    g.fillStyle = h.col;
    g.beginPath();
    g.arc(x, cy - 1, 10.6, Math.PI, 6.28);
    g.lineTo(x + 10.6, cy + 4);
    g.lineTo(x + 8.2, cy + 5);
    g.lineTo(x + 8.2, cy - 1);
    g.lineTo(x - 8.2, cy - 1);
    g.lineTo(x - 8.2, cy + 5);
    g.lineTo(x - 10.6, cy + 4);
    g.closePath();
    g.fill();
    g.fillStyle = dark;
    g.fillRect(x - 10.6, cy - 2.5, 21.2, 1.6);
    if (t >= 3) {
      g.fillStyle = '#ffe27a';
      g.fillRect(x - 9, cy - 4.5, 18, 1);
    }
    if (t >= 5) {
      g.fillStyle = '#ff5a7a';
      g.beginPath();
      g.arc(x, cy - 7, 1.7, 0, 6.28);
      g.fill();
    }
  } else if (h.kind === 'helm') {
    g.fillStyle = h.col;
    g.beginPath();
    g.arc(x, cy - 1, 10.4, Math.PI, 6.28);
    g.fill();
    g.fillStyle = dark;
    g.fillRect(x - 10.4, cy - 2.5, 20.8, 2.6);
    if (!facingUp) g.fillRect(x - 1, cy - 1, 2, 6.5);
    if (t >= 3) {
      g.fillStyle = '#e0483a';
      g.fillRect(x - 1.6, cy - 17, 3.2, 8);
      g.fillRect(x - 5, cy - 11.5, 10, 2.2);
    }
    if (t >= 5) {
      g.fillStyle = '#ffe27a';
      for (const sx of [-1, 1]) {
        g.beginPath();
        g.moveTo(x + sx * 10, cy - 4);
        g.lineTo(x + sx * 17, cy - 11);
        g.lineTo(x + sx * 12.5, cy - 2);
        g.closePath();
        g.fill();
      }
    }
  } else if (t < 3) {
    // feather cap
    g.fillStyle = h.col;
    g.beginPath();
    g.arc(x, cy - 2, 9.6, Math.PI, 6.28);
    g.fill();
    g.fillStyle = dark;
    g.beginPath();
    g.ellipse(x, cy - 2, 13, 3.2, 0, 0, 6.28);
    g.fill();
    g.fillStyle = '#e8f6ff';
    g.beginPath();
    g.moveTo(x + 5, cy - 8);
    g.quadraticCurveTo(x + 15, cy - 16, x + 12, cy - 22);
    g.quadraticCurveTo(x + 8, cy - 15, x + 5, cy - 8);
    g.fill();
  } else {
    // circlet / tiara: band, small leaf points and a gem
    g.strokeStyle = h.col;
    g.lineWidth = 2.2;
    g.beginPath();
    g.arc(x, cy + 1, 9.6, Math.PI * 1.08, Math.PI * 1.92);
    g.stroke();
    g.fillStyle = h.col;
    for (const sx of [-1, 1]) {
      g.beginPath();
      g.moveTo(x + sx * 6.5, cy - 7.5);
      g.lineTo(x + sx * 8.5, cy - 14);
      g.lineTo(x + sx * 3.5, cy - 9.5);
      g.closePath();
      g.fill();
    }
    g.fillStyle = t >= 5 ? '#ff5a7a' : '#7fe3ff';
    g.beginPath();
    g.arc(x, cy - 9.5, 2.1, 0, 6.28);
    g.fill();
  }
}
