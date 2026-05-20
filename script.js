let gameState = null;
const app = document.getElementById("app");

const clone = (value) => JSON.parse(JSON.stringify(value));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (array) => array[Math.floor(Math.random() * array.length)];
const shuffle = (array) => clone(array).sort(() => Math.random() - 0.5);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const activeQueens = () => gameState.cast.filter(q => !q.eliminated);
const player = () => gameState.player;

const CHALLENGE_APPROACHES = {
  acting: [
    { id: "lead", label: "Demand the protagonist role", text: "You fight for the biggest role. Huge visibility, huge target.", risk: 0.42, reward: 12, fail: -10, stats: { performance: 1, nerve: 1 } },
    { id: "improvise", label: "Improvise and steal little moments", text: "You trust instinct more than the script.", risk: 0.34, reward: 10, fail: -8, stats: { charisma: 1 } },
    { id: "support", label: "Play support and make the scene work", text: "You avoid chaos and try to be reliable.", risk: 0.18, reward: 5, fail: -3, stats: { performance: 1 } }
  ],
  design: [
    { id: "high_concept", label: "Build an ambitious silhouette", text: "A risky construction moment that could become iconic.", risk: 0.45, reward: 14, fail: -12, stats: { creativity: 1 } },
    { id: "polish", label: "Keep it polished and wearable", text: "Less shocking, but harder to criticize.", risk: 0.16, reward: 5, fail: -3, stats: { nerve: 1 } },
    { id: "craft", label: "Craft from scraps", text: "You improvise with materials and try to charm the judges.", risk: 0.32, reward: 9, fail: -7, stats: { creativity: 1, charisma: 1 } }
  ],
  snatch: [
    { id: "absurd", label: "Go absurd and unpredictable", text: "You go big, strange and memeable.", risk: 0.42, reward: 13, fail: -11, stats: { charisma: 1 } },
    { id: "smart", label: "Play a sharp, controlled character", text: "You aim for references and timing.", risk: 0.24, reward: 7, fail: -5, stats: { nerve: 1 } },
    { id: "safe", label: "Stick to a safe celebrity impression", text: "You avoid disaster, but maybe also avoid greatness.", risk: 0.12, reward: 3, fail: -2, stats: { performance: 1 } }
  ],
  rusical: [
    { id: "solo", label: "Fight for a solo moment", text: "You ask for the section everyone will remember.", risk: 0.38, reward: 12, fail: -9, stats: { performance: 1 } },
    { id: "choreo", label: "Prioritize choreography", text: "You rehearse the body before the face.", risk: 0.28, reward: 8, fail: -6, stats: { performance: 1, nerve: 1 } },
    { id: "character", label: "Focus on character comedy", text: "You try to make your part memorable even if it is small.", risk: 0.26, reward: 8, fail: -5, stats: { charisma: 1 } }
  ],
  branding: [
    { id: "meme", label: "Make it memeable", text: "You build the product around a ridiculous catchphrase.", risk: 0.34, reward: 10, fail: -7, stats: { charisma: 1 } },
    { id: "personal", label: "Make it deeply personal", text: "You sell a real story, not just a joke.", risk: 0.25, reward: 8, fail: -5, stats: { creativity: 1 } },
    { id: "luxury", label: "Sell polished luxury", text: "You try to look expensive and executive.", risk: 0.22, reward: 7, fail: -4, stats: { nerve: 1 } }
  ],
  roast: [
    { id: "mean", label: "Go brutally shady", text: "The jokes cut deep. Maybe too deep.", risk: 0.44, reward: 13, fail: -12, stats: { nerve: 1 } },
    { id: "warm", label: "Roast with warmth", text: "You punch, then hug.", risk: 0.18, reward: 6, fail: -3, stats: { charisma: 1 } },
    { id: "self", label: "Roast yourself first", text: "You use vulnerability as armor.", risk: 0.25, reward: 8, fail: -5, stats: { performance: 1 } }
  ],
  makeover: [
    { id: "family", label: "Prioritize family resemblance", text: "The pair looks connected, even if the fashion is quieter.", risk: 0.18, reward: 6, fail: -3, stats: { creativity: 1 } },
    { id: "fashion", label: "Prioritize the fashion statement", text: "You risk the family connection for a stronger runway.", risk: 0.36, reward: 11, fail: -8, stats: { creativity: 1, nerve: 1 } },
    { id: "heart", label: "Prioritize emotional storytelling", text: "You make the makeover feel personal.", risk: 0.24, reward: 8, fail: -5, stats: { charisma: 1 } }
  ]
};

const RUNWAY_CHOICES = [
  { id: "signature", label: "Signature look", text: "A reliable look that represents your drag clearly.", budget: 100, score: 62, originality: 5, polish: 6, risk: 0.12 },
  { id: "designer", label: "Call a designer contact", text: "A more expensive, polished runway package.", budget: 320, score: 76, originality: 6, polish: 9, risk: 0.10 },
  { id: "craft", label: "Craft it yourself", text: "Cheaper, personal, and risky under pressure.", budget: 60, score: 58, originality: 8, polish: 4, risk: 0.34 },
  { id: "stunt", label: "Reveal/stunt runway", text: "A big television moment that could break or become iconic.", budget: 220, score: 68, originality: 9, polish: 6, risk: 0.42 },
  { id: "reuse", label: "Rework an old look", text: "Budget friendly, but the judges may clock the repetition.", budget: 20, score: 52, originality: 3, polish: 5, risk: 0.22, reused: true }
];

function init() {
  const save = localStorage.getItem("dragRealitySave");
  showStart(Boolean(save));
}

function makeQueen(base, isPlayer = false) {
  const archetype = ARCHETYPES[base.archetype];
  const stats = clone(base.stats || archetype.stats);
  const traits = base.traits ? clone(base.traits) : shuffle(archetype.traits).slice(0, 2);
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${base.name}-${Math.random()}`,
    name: base.name,
    pronouns: base.pronouns || "she/her",
    archetype: base.archetype,
    dragStyle: base.dragStyle || "Signature Drag",
    stats,
    traits,
    entrance: base.entrance || "I came to compete, narrate, and look expensive.",
    reputation: { judges: 0, queens: 0, fans: 0, production: 0 },
    mental: { confidence: 50, stress: 20, burnout: 0, motivation: 55 },
    wardrobe: { budget: isPlayer ? 1200 : rand(450, 1400), usedThemes: [], pieces: [] },
    progression: { sewing: 0, comedy: 0, branding: 0, performance: 0, fashion: 0 },
    spotlight: 0,
    exhaustion: 0,
    relationships: {},
    trackRecord: [],
    wins: 0,
    highs: 0,
    bottoms: 0,
    eliminated: false,
    isPlayer
  };
}

function migrateQueen(q) {
  q.mental ||= { confidence: 50, stress: 20, burnout: q.exhaustion || 0, motivation: 55 };
  q.wardrobe ||= { budget: q.isPlayer ? 1200 : rand(450, 1400), usedThemes: [], pieces: [] };
  q.progression ||= { sewing: 0, comedy: 0, branding: 0, performance: 0, fashion: 0 };
  q.reputation ||= { judges: 0, queens: 0, fans: 0, production: 0 };
}

function showStart(hasSave) {
  app.innerHTML = `
    <section class="hero tv-fade">
      <div class="kicker">first person drag reality sim</div>
      <h1>Drag Reality Simulator</h1>
      <p>Crie sua queen, entre no Werk Room, tome decisões de desafio, prepare looks de runway, sobreviva a críticas, lip syncs e arcos emocionais.</p>
      <div class="row">
        <button onclick="showCreateQueen()">New Season</button>
        <button class="secondary" onclick="loadGame()" ${hasSave ? "" : "disabled"}>Continue</button>
        <button class="secondary" onclick="showCredits()">Credits</button>
      </div>
    </section>`;
}

function showCredits() {
  app.innerHTML = `
    <section class="panel tv-fade">
      <h2>Credits</h2>
      <p>Protótipo em HTML, CSS e JavaScript puro. Não usa músicas, nomes de jurados ou elementos protegidos específicos de franquias reais. A estrutura é inspirada em reality competitions de drag.</p>
      <button onclick="showStart(Boolean(localStorage.getItem('dragRealitySave')))">Back</button>
    </section>`;
}

function showCreateQueen() {
  const archetypeOptions = Object.keys(ARCHETYPES).map(a => `<option value="${a}">${a}</option>`).join("");
  const traitOptions = TRAITS.map(t => `<option value="${t}">${t}</option>`).join("");
  app.innerHTML = `
    <section class="two-col tv-fade">
      <div class="panel">
        <div class="kicker">create your queen</div>
        <h2>Who walks into the Werk Room?</h2>
        <div class="form-field"><label>Drag name</label><input id="queen-name" value="Velvet Aurora" maxlength="32" /></div>
        <div class="form-field"><label>Pronouns</label><select id="pronouns"><option>she/her</option><option>they/them</option><option>he/him</option></select></div>
        <div class="form-field"><label>Archetype</label><select id="archetype" onchange="updateArchetypePreview()">${archetypeOptions}</select></div>
        <div class="form-field"><label>Main trait</label><select id="trait">${traitOptions}</select></div>
        <div class="form-field"><label>Drag style</label><input id="drag-style" value="Glamour with a strange little twist" maxlength="64" /></div>
        <button onclick="startSeason()">Enter the competition</button>
      </div>
      <aside class="panel" id="archetype-preview"></aside>
    </section>`;
  updateArchetypePreview();
}

function updateArchetypePreview() {
  const selected = document.getElementById("archetype").value;
  const archetype = ARCHETYPES[selected];
  document.getElementById("archetype-preview").innerHTML = `
    <div class="kicker">archetype preview</div>
    <h3>${selected}</h3>
    <p>${archetype.description}</p>
    ${renderStats({ stats: archetype.stats })}
    <p>${archetype.traits.map(t => `<span class="badge">${t}</span>`).join("")}</p>`;
}

function startSeason() {
  const chosenArchetype = document.getElementById("archetype").value;
  const playerQueen = makeQueen({
    name: document.getElementById("queen-name").value.trim() || "Velvet Aurora",
    pronouns: document.getElementById("pronouns").value,
    archetype: chosenArchetype,
    dragStyle: document.getElementById("drag-style").value.trim(),
    traits: [document.getElementById("trait").value, pick(ARCHETYPES[chosenArchetype].traits)]
  }, true);
  const npcs = shuffle(NPC_TEMPLATES).slice(0, 11).map(q => makeQueen(q));
  const cast = shuffle([playerQueen, ...npcs]);
  for (const q of cast) {
    q.relationships = Object.fromEntries(cast.filter(o => o.id !== q.id).map(o => [o.id, {
      affinity: rand(-1, 1), rivalry: 0, trust: rand(0, 2), alliance: false
    }]));
  }
  gameState = {
    episode: 1,
    cast,
    player: playerQueen,
    eliminatedQueens: [],
    history: [],
    currentChallenge: null,
    phase: "cast",
    spectatorMode: false,
    seasonTone: pick(["Messy Season", "Fashion Season", "Redemption Season", "Battle Season"])
  };
  saveGame();
  showMeetCast();
}

function showMeetCast() {
  app.innerHTML = `
    <section class="panel tv-fade">
      <div class="kicker">${gameState.seasonTone}</div>
      <h2>Meet the Cast</h2>
      <p>Twelve queens enter. Every episode now has Werk Room choices, challenge decisions, runway scoring, critiques and a staged placement reveal.</p>
      <div class="grid">${gameState.cast.map(renderQueenCard).join("")}</div>
      <div class="footer-actions"><button onclick="showEpisodeIntro()">Start Episode 1</button></div>
    </section>`;
}

function renderQueenCard(q) {
  return `<article class="queen-card">
    <div class="kicker">${q.isPlayer ? "you" : q.archetype}</div>
    <h3>${q.name}</h3>
    <p>“${q.entrance}”</p>
    <p>${q.traits.map(t => `<span class="badge">${t}</span>`).join("")}</p>
    ${renderStats(q)}
  </article>`;
}

function renderStats(q) {
  return Object.entries(q.stats).map(([key, value]) => `
    <div class="stat"><div class="stat-top"><span>${labelStat(key)}</span><b>${value}</b></div><div class="bar"><span style="width:${value * 10}%"></span></div></div>
  `).join("");
}

function labelStat(key) {
  return ({ performance: "Performance", creativity: "Creativity", charisma: "Charisma", nerve: "Nerve" })[key] || key;
}

function showEpisodeIntro() {
  const alive = activeQueens();
  if (alive.length <= 4) return showFinale();
  if (gameState.spectatorMode || player().eliminated) return showSpectatorEpisodeIntro();
  const challenge = CHALLENGES[(gameState.episode - 1) % (CHALLENGES.length - 1)];
  gameState.currentChallenge = clone(challenge);
  gameState.temp = { prep: null, social: null, approach: null, runwayChoice: null, results: null, lip: null, revealStep: 0 };
  app.innerHTML = `
    <section class="two-col tv-fade">
      <div class="panel">
        <div class="kicker">episode ${gameState.episode}</div>
        <h2>${challenge.name}</h2>
        <p>${challenge.description}</p>
        <p><b>Runway:</b> ${challenge.runway}</p>
        <h3>Before the challenge, what do you do?</h3>
        ${PREP_ACTIONS.map(a => `<button class="choice-card" onclick="choosePrep('${a.id}')">${a.label}<small>${a.text}</small></button>`).join("")}
      </div>
      <aside class="panel">${renderPlayerPanel()}</aside>
    </section>`;
}


function showSpectatorEpisodeIntro() {
  const alive = activeQueens();
  if (alive.length <= 4) return showFinale();
  const challenge = CHALLENGES[(gameState.episode - 1) % (CHALLENGES.length - 1)];
  gameState.currentChallenge = clone(challenge);
  gameState.temp = { prep: null, social: null, approach: null, runwayChoice: null, results: null, lip: null, revealStep: 0, spectator: true };
  const focusQueens = shuffle(alive).slice(0, Math.min(3, alive.length));
  app.innerHTML = `
    <section class="two-col tv-fade">
      <div class="panel">
        <div class="kicker">spectator mode · episode ${gameState.episode}</div>
        <h2>${challenge.name}</h2>
        <p>${challenge.description}</p>
        <p><b>Runway:</b> ${challenge.runway}</p>
        <p>You are no longer making choices, but the season continues episode by episode. The remaining queens will make their own challenge, runway and lip sync decisions.</p>
        <h3>Werk Room focus</h3>
        ${focusQueens.map(q => `<div class="announcement safe-card"><b>${q.name}</b><span>${spectatorConfessional(q)}</span></div>`).join("")}
        <div class="footer-actions row">
          <button onclick="watchSpectatorChallenge()">Watch the challenge and runway</button>
          <button class="secondary" onclick="showStart(Boolean(localStorage.getItem('dragRealitySave')))">Main menu</button>
        </div>
      </div>
      <aside class="panel">${renderRemainingQueensPanel()}</aside>
    </section>`;
}

function spectatorConfessional(q) {
  migrateQueen(q);
  if (q.wins > 1) return "I know the crown is starting to look like mine.";
  if (q.bottoms > 1) return "One more mistake and this whole dream could collapse.";
  if (q.mental.stress > 65) return "The pressure is getting louder than the music.";
  if (q.mental.confidence > 70) return "Tonight feels like a chance to take control of the season.";
  return pick(["I need the judges to finally remember my name.", "Nobody is safe when the runway lights come on.", "This is the episode where the story can change."]);
}

function renderRemainingQueensPanel() {
  return `<div class="kicker">still competing</div><h3>${activeQueens().length} queens remain</h3>${activeQueens().map(q => `<div class="result-row"><span>${q.name}</span><span class="badge ${q.wins ? 'win' : q.bottoms ? 'bottom' : 'safe'}">${q.wins} WIN · ${q.bottoms} BTM</span></div>`).join("")}`;
}

function watchSpectatorChallenge() {
  resolveChallenge();
}

function renderPlayerPanel() {
  const q = player();
  migrateQueen(q);
  return `<div class="kicker">your queen</div><h3>${q.name}</h3><p>${q.dragStyle}</p>${renderStats(q)}
    <div class="mini-grid">
      <span><b>Confidence</b><br>${q.mental.confidence}</span>
      <span><b>Stress</b><br>${q.mental.stress}</span>
      <span><b>Burnout</b><br>${q.mental.burnout}</span>
      <span><b>Budget</b><br>$${q.wardrobe.budget}</span>
    </div>
    <p>${q.traits.map(t => `<span class="badge">${t}</span>`).join("")}</p>
    <p><b>Fans:</b> ${q.reputation.fans} · <b>Production:</b> ${q.reputation.production} · <b>Queens:</b> ${q.reputation.queens}</p>`;
}

function choosePrep(id) {
  const action = PREP_ACTIONS.find(a => a.id === id);
  gameState.temp.prep = action;
  applyEffects(player(), action.effects);
  applyMentalFromPrep(player(), id);
  saveGame();
  app.innerHTML = `
    <section class="two-col tv-fade">
      <div class="panel">
        <div class="kicker">werk room</div>
        <h2>${action.label}</h2>
        <p>${action.text}</p>
        <h3>How do you handle the cast?</h3>
        ${SOCIAL_ACTIONS.map(a => `<button class="choice-card" onclick="chooseSocial('${a.id}')">${a.label}<small>${a.text}</small></button>`).join("")}
      </div>
      <aside class="panel">${renderPlayerPanel()}</aside>
    </section>`;
}

function chooseSocial(id) {
  const action = SOCIAL_ACTIONS.find(a => a.id === id);
  gameState.temp.social = action;
  applyEffects(player(), action.effects);
  if (id === "compliment" || id === "alliance") adjustMental(player(), { stress: -4, confidence: 2 });
  if (id === "shade") adjustMental(player(), { stress: 4, confidence: 3 });
  if (id === "isolate") adjustMental(player(), { stress: 1, confidence: -2 });
  const target = pick(activeQueens().filter(q => !q.isPlayer));
  if (target) adjustRelationship(player(), target.id, action.effects.queens || 0);
  showChallengeChoices();
}

function showChallengeChoices() {
  const challenge = gameState.currentChallenge;
  const choices = CHALLENGE_APPROACHES[challenge.type] || CHALLENGE_APPROACHES.acting;
  app.innerHTML = `
    <section class="two-col tv-fade">
      <div class="panel">
        <div class="kicker">main challenge decision</div>
        <h2>${challenge.name}</h2>
        <p>Os atributos ajudam, mas a sua decisão muda o episódio. Escolha entre segurança, risco e televisão.</p>
        ${choices.map(c => `<button class="choice-card" onclick="chooseChallengeApproach('${c.id}')">${c.label}<small>${c.text}</small></button>`).join("")}
      </div>
      <aside class="panel">${renderPlayerPanel()}</aside>
    </section>`;
}

function chooseChallengeApproach(id) {
  const choices = CHALLENGE_APPROACHES[gameState.currentChallenge.type] || CHALLENGE_APPROACHES.acting;
  const approach = choices.find(c => c.id === id);
  const failed = Math.random() < approach.risk + (player().mental.stress / 300) + (player().mental.burnout / 350) - (player().mental.confidence / 500);
  const bonus = failed ? approach.fail : approach.reward;
  gameState.temp.approach = { ...approach, failed, bonus };
  Object.entries(approach.stats || {}).forEach(([stat, value]) => player().stats[stat] = clamp(player().stats[stat] + value, 1, 10));
  adjustMental(player(), failed ? { confidence: -8, stress: 8 } : { confidence: 8, stress: -3 });
  showRunwayChoices();
}

function showRunwayChoices() {
  const q = player();
  const choices = RUNWAY_CHOICES.map(choice => ({ ...choice, disabled: q.wardrobe.budget < choice.budget }));
  app.innerHTML = `
    <section class="two-col tv-fade runway-stage">
      <div class="panel">
        <div class="kicker">runway preparation</div>
        <h2>${gameState.currentChallenge.runway}</h2>
        <p>A runway agora influencia o resultado final do desafio entre <b>-10%</b> e <b>+20%</b>. Um look forte pode salvar uma queen, e um look ruim pode derrubar alguém.</p>
        ${choices.map(c => `<button class="choice-card" onclick="chooseRunway('${c.id}')" ${c.disabled ? "disabled" : ""}>${c.label}<small>${c.text} · Cost: $${c.budget}${c.disabled ? " · not enough budget" : ""}</small></button>`).join("")}
      </div>
      <aside class="panel">${renderPlayerPanel()}</aside>
    </section>`;
}

function chooseRunway(id) {
  const choice = RUNWAY_CHOICES.find(c => c.id === id);
  player().wardrobe.budget = Math.max(0, player().wardrobe.budget - choice.budget);
  gameState.temp.runwayChoice = choice;
  resolveChallenge();
}

function applyEffects(q, effects) {
  migrateQueen(q);
  for (const [key, value] of Object.entries(effects)) {
    if (key in q.stats) q.stats[key] = clamp(q.stats[key] + value, 1, 10);
    else if (key in q.reputation) q.reputation[key] += value;
    else if (key === "exhaustion") q.mental.burnout = clamp(q.mental.burnout + value * 8, 0, 100);
    else q[key] = (q[key] || 0) + value;
  }
}

function applyMentalFromPrep(q, id) {
  const map = {
    rehearse: { stress: 4, burnout: 8, confidence: 3 },
    look: { stress: 3, confidence: 4 },
    drama: { stress: 8, confidence: 5 },
    help: { stress: -4, burnout: 4, motivation: 4 },
    rest: { stress: -8, burnout: -14, confidence: 1 }
  };
  adjustMental(q, map[id] || {});
}

function adjustMental(q, changes) {
  migrateQueen(q);
  for (const [key, value] of Object.entries(changes)) q.mental[key] = clamp(q.mental[key] + value, 0, 100);
}

function adjustRelationship(q, id, value) {
  const current = q.relationships[id];
  if (typeof current === "number") q.relationships[id] = clamp(current + value, -5, 5);
  else if (current) {
    current.affinity = clamp((current.affinity || 0) + value, -5, 5);
    current.trust = clamp((current.trust || 0) + Math.max(0, value), 0, 5);
    current.rivalry = clamp((current.rivalry || 0) + Math.max(0, -value), 0, 5);
  }
}

function resolveChallenge() {
  const challenge = gameState.currentChallenge;
  const raw = activeQueens().map(q => {
    migrateQueen(q);
    const challengeScore = calculateChallengeScore(q, challenge);
    const runway = calculateRunwayScore(q, challenge);
    const runwayModifier = calculateRunwayModifier(runway.score);
    const finalScore = Number((challengeScore * runwayModifier).toFixed(1));
    return { queen: q, challengeScore, runwayScore: runway.score, runwayModifier, runwayNote: runway.note, score: finalScore };
  });
  const results = raw.sort((a, b) => b.score - a.score);
  assignPlacements(results);
  gameState.temp.results = results;
  gameState.temp.revealStep = 0;
  saveGame();
  showRunwayCeremony();
}

function calculateChallengeScore(q, challenge) {
  let score = 0;
  for (const [stat, weight] of Object.entries(challenge.stats)) score += q.stats[stat] * weight * 10;
  score += traitBonus(q, challenge);
  score += q.reputation.production * 0.35;
  score += q.reputation.fans * 0.12;
  score += (q.mental.confidence - 50) * 0.12;
  score -= q.mental.stress * 0.07;
  score -= q.mental.burnout * 0.10;
  if (q.isPlayer && gameState.temp.approach) score += gameState.temp.approach.bonus;
  if (!q.isPlayer) score += npcDecisionBonus(q, challenge);
  if (gameState.seasonTone === "Fashion Season") score += (q.stats.creativity - 5) * 0.4;
  if (gameState.seasonTone === "Messy Season") score += q.reputation.production * 0.25;
  if (gameState.seasonTone === "Battle Season") score += (q.stats.nerve - 5) * 0.35;
  score += rand(-20, 20) / 10;
  q.spotlight += Math.max(0, Math.round((score - 45) / 12)) + (q.traits.includes("Great Confessional") ? 1 : 0);
  return Number(score.toFixed(1));
}

function npcDecisionBonus(q, challenge) {
  let risk = q.stats.nerve / 18 + (q.traits.includes("Fashion Risk Taker") || q.traits.includes("Chaotic Energy") ? 0.2 : 0);
  risk -= q.mental.stress / 300;
  const goesBig = Math.random() < risk;
  if (goesBig) return Math.random() < 0.6 ? rand(5, 12) : -rand(4, 11);
  return rand(-2, 5);
}

function calculateRunwayScore(q, challenge) {
  let base = q.stats.creativity * 7 + q.stats.nerve * 2 + q.reputation.judges * 0.8 + rand(-10, 10);
  let note = "solid runway package";
  if (q.traits.includes("Runway Perfectionist")) { base += 12; note = "polished and expensive"; }
  if (q.traits.includes("Fashion Risk Taker")) { base += rand(-8, 16); note = "risky fashion choice"; }
  if (q.traits.includes("Cannot Sew") && ["design", "makeover"].includes(challenge.type)) { base -= 12; note = "construction problems"; }
  if (gameState.seasonTone === "Fashion Season") base += 6;
  if (q.isPlayer && gameState.temp.runwayChoice) {
    const c = gameState.temp.runwayChoice;
    base = base * 0.45 + c.score * 0.55;
    if (Math.random() < c.risk) { base -= rand(8, 22); note = `${c.label}: the risk did not fully land`; }
    else { base += rand(0, 12); note = `${c.label}: ${c.text}`; }
    if (c.reused || q.wardrobe.usedThemes.includes(challenge.runway)) { base -= 12; note += " Judges noticed repetition."; }
    q.wardrobe.usedThemes.push(challenge.runway);
  } else if (!q.isPlayer) {
    const npcLook = pick(RUNWAY_CHOICES);
    base = base * 0.55 + npcLook.score * 0.45;
    if (Math.random() < npcLook.risk) base -= rand(4, 14);
    if (q.wardrobe.usedThemes.includes(challenge.runway)) base -= 10;
    q.wardrobe.usedThemes.push(challenge.runway);
  }
  base -= q.mental.burnout * 0.05;
  return { score: clamp(Number(base.toFixed(1)), 0, 100), note };
}

function calculateRunwayModifier(runwayScore) {
  return Number((0.9 + (runwayScore / 100) * 0.3).toFixed(3));
}

function traitBonus(q, challenge) {
  let bonus = 0;
  const t = q.traits;
  if (challenge.type === "design" || challenge.type === "makeover") {
    if (t.includes("Runway Perfectionist")) bonus += 5;
    if (t.includes("Fashion Risk Taker")) bonus += rand(-2, 6);
    if (t.includes("Cannot Sew")) bonus -= 5;
  }
  if (["acting", "snatch", "roast", "branding"].includes(challenge.type)) {
    if (t.includes("Comedy Instinct")) bonus += 5;
    if (t.includes("Quick Thinker")) bonus += 3;
    if (t.includes("Meme Queen")) bonus += 2;
  }
  if (challenge.type === "rusical" || challenge.type === "finale") {
    if (t.includes("Professional")) bonus += 3;
    if (t.includes("Bad Dancer")) bonus -= 4;
  }
  if (t.includes("Overthinks")) bonus -= rand(0, 3);
  if (t.includes("Meltdown Prone")) bonus -= rand(0, 5);
  if (t.includes("Chaotic Energy")) bonus += rand(-4, 5);
  if (t.includes("Competitive")) bonus += 2;
  if (t.includes("Too Safe")) bonus -= 1;
  return bonus;
}

function assignPlacements(results) {
  results.forEach((r, i) => {
    if (i === 0) r.placement = "WIN";
    else if (i <= 2) r.placement = "HIGH";
    else if (i >= results.length - 2) r.placement = "BTM2";
    else if (i === results.length - 3) r.placement = "LOW";
    else r.placement = "SAFE";
  });
}

function showRunwayCeremony() {
  const step = gameState.temp.revealStep || 0;
  const results = gameState.temp.results;
  const safe = results.filter(r => r.placement === "SAFE");
  const top = results.filter(r => ["WIN", "HIGH"].includes(r.placement));
  const winner = results.find(r => r.placement === "WIN");
  const low = results.find(r => r.placement === "LOW");
  const bottom = results.filter(r => r.placement === "BTM2");
  const pages = [
    {
      kicker: "runway",
      title: gameState.currentChallenge.runway,
      body: `<p>The queens walk the runway. Their looks now modify the challenge score from <b>-10%</b> to <b>+20%</b>.</p>${renderRunwayScoreCards(results)}`,
      button: "Call the queens forward"
    },
    {
      kicker: "judges' panel",
      title: "Some of you are safe",
      body: `<p>The judges call the queens one by one.</p>${safe.length ? safe.map(r => `<div class="announcement safe-card"><b>${r.queen.name}</b>, you are safe.</div>`).join("") : `<p>No one is simply safe tonight.</p>`}`,
      button: "Announce the tops"
    },
    {
      kicker: "top queens",
      title: "The three best queens of the week",
      body: `${top.map(r => `<div class="announcement top-card"><b>${r.queen.name}</b><span>${r.placement === "WIN" ? "Top performance" : "High placement"}</span></div>`).join("")}`,
      button: "Reveal the winner"
    },
    {
      kicker: "winner reveal",
      title: `${winner.queen.name}, condragulations`,
      body: `<p>You are the winner of this week's challenge.</p><div class="winner-spotlight">${winner.queen.name}</div>` ,
      button: "Announce the bottoms"
    },
    {
      kicker: "bottom queens",
      title: "The three weakest critiques",
      body: `${low ? `<div class="announcement low-card"><b>${low.queen.name}</b>, your performance worried the judges, but you are safe.</div>` : ""}${bottom.map(r => `<div class="announcement bottom-card"><b>${r.queen.name}</b>, you are up for elimination.</div>`).join("")}`,
      button: "Go to lip sync"
    }
  ];
  const page = pages[step];
  app.innerHTML = `
    <section class="panel tv-fade runway-stage">
      <div class="lower-third">${page.kicker}</div>
      <h2>${page.title}</h2>
      ${page.body}
      <div class="footer-actions row">
        <button onclick="nextRunwayReveal()">${page.button}</button>
        <button class="secondary" onclick="showTrackRecord()">Track record</button>
      </div>
    </section>`;
}

function nextRunwayReveal() {
  gameState.temp.revealStep = (gameState.temp.revealStep || 0) + 1;
  if (gameState.temp.revealStep <= 4) return showRunwayCeremony();
  const bottom = gameState.temp.results.filter(r => r.placement === "BTM2");
  if (bottom.some(r => r.queen.isPlayer)) showPlayerLipSync(bottom);
  else showNpcLipSyncIntro(bottom);
}

function renderRunwayScoreCards(results) {
  return `<div class="grid">${results.map(r => `<article class="card runway-card">
    <div class="kicker">${r.queen.name}</div>
    <h3>${Math.round((r.runwayModifier - 1) * 100)}%</h3>
    <p>${r.runwayNote}</p>
    <p><span class="badge">Runway ${r.runwayScore}</span><span class="badge">Final ${r.score}</span></p>
  </article>`).join("")}</div>`;
}

function showPlayerLipSync(bottom) {
  const song = pick(LIP_SYNC_SONGS);
  gameState.temp.lip = { song };
  app.innerHTML = `
    <section class="two-col tv-fade lip-sync-stage">
      <div class="panel">
        <div class="kicker">bottom two</div>
        <h2>Lip sync for your life</h2>
        <p>You are in the bottom against <b>${bottom.find(r => !r.queen.isPlayer).queen.name}</b>. The song is a <b>${song.type}</b>.</p>
        <h3>Choose your strategy</h3>
        ${LIP_SYNC_STRATEGIES.map(s => `<button class="choice-card" onclick="resolvePlayerLipSync('${s.id}')">${s.label}</button>`).join("")}
      </div>
      <aside class="panel">${renderResultsSummary(false)}</aside>
    </section>`;
}

function showNpcLipSyncIntro(bottom) {
  const song = pick(LIP_SYNC_SONGS);
  gameState.temp.lip = { song };
  app.innerHTML = `
    <section class="panel tv-fade lip-sync-stage">
      <div class="kicker">lip sync for your life</div>
      <h2>${bottom.map(r => r.queen.name).join(" vs ")}</h2>
      <p>The bottom two prepare for a <b>${song.type}</b>. You watch from the back, knowing the edit is still recording reactions.</p>
      <div class="footer-actions"><button onclick="resolveNpcLipSync()">Start the lip sync</button></div>
    </section>`;
}

function resolvePlayerLipSync(strategy) {
  gameState.temp.lip.strategy = strategy;
  const bottom = gameState.temp.results.filter(r => r.placement === "BTM2");
  finishLipSync(bottom, strategy);
}

function resolveNpcLipSync() {
  const bottom = gameState.temp.results.filter(r => r.placement === "BTM2");
  finishLipSync(bottom, pick(LIP_SYNC_STRATEGIES).id);
}


function finishLipSync(bottom, playerStrategy) {
  const song = gameState.temp.lip?.song || pick(LIP_SYNC_SONGS);
  const lipResults = bottom.map(r => {
    const strategy = r.queen.isPlayer ? playerStrategy : pick(LIP_SYNC_STRATEGIES).id;
    const event = lipSyncEvent(strategy, r.queen);
    return { queen: r.queen, strategy, event, score: lipSyncScore(r.queen, song, strategy, event) };
  }).sort((a, b) => b.score - a.score);
  gameState.temp.pendingLipSync = {
    song,
    lipResults: lipResults.map(r => ({ queenId: r.queen.id, strategy: r.strategy, event: r.event, score: r.score })),
    eliminatedId: lipResults[1].queen.id
  };
  saveGame();
  showLipSyncPerformance();
}

function showLipSyncPerformance() {
  const pending = gameState.temp.pendingLipSync;
  const lipResults = pending.lipResults.map(r => ({ ...r, queen: gameState.cast.find(q => q.id === r.queenId) }));
  const winner = lipResults[0];
  const eliminated = lipResults[1];
  app.innerHTML = `
    <section class="panel tv-fade lip-sync-stage cinematic">
      <div class="lower-third">lip sync for your life</div>
      <h2>${lipResults.map(r => r.queen.name).join(" vs ")}</h2>
      <p>The song is a <b>${pending.song.type}</b>. The lights drop, the back of the stage glows, and the judges watch every beat.</p>
      <div class="lip-battle">
        ${lipResults.map(r => renderLipSyncBeat(r)).join("")}
      </div>
      <div class="announcement top-card"><b>${winner.queen.name}</b><span>Shantay, you stay.</span></div>
      <div class="announcement bottom-card"><b>${eliminated.queen.name}</b><span>Sashay away.</span></div>
      <div class="footer-actions row">
        <button onclick="concludeLipSyncEpisode()">Continue to episode results</button>
        <button class="secondary" onclick="showTrackRecord()">Track record</button>
      </div>
    </section>`;
}

function renderLipSyncBeat(r) {
  const strategy = strategyLabel(r.strategy);
  const flavor = {
    emotion: "sells the song through the eyes, holding the room in a quiet grip",
    stunts: "throws the body into the beat, betting everything on spectacle",
    lyrics: "locks into every lyric like the words were written for them",
    humor: "turns the stage into a joke with a sharp punchline",
    energy: "charges across the stage with full-body urgency"
  }[r.strategy] || "performs with focus";
  return `<article class="card lip-card"><div class="kicker">${r.queen.name}</div><h3>${strategy}</h3><p>${r.queen.name} ${flavor}. Then, ${r.event.text}.</p><p><span class="badge">Lip sync score ${r.score}</span></p></article>`;
}

function concludeLipSyncEpisode() {
  const pending = gameState.temp.pendingLipSync;
  const lipResults = pending.lipResults.map(r => ({ ...r, queen: gameState.cast.find(q => q.id === r.queenId) })).sort((a,b) => b.score - a.score);
  const eliminated = gameState.cast.find(q => q.id === pending.eliminatedId);
  eliminated.eliminated = true;
  eliminated.trackRecord.push({ episode: gameState.episode, challenge: gameState.currentChallenge.name, placement: "ELIM" });
  gameState.eliminatedQueens.push(eliminated);
  for (const r of gameState.temp.results) {
    updateMentalAfterPlacement(r.queen, r.queen.id === eliminated.id ? "ELIM" : r.placement);
    if (r.queen.id === eliminated.id) continue;
    r.queen.trackRecord.push({ episode: gameState.episode, challenge: gameState.currentChallenge.name, placement: r.placement });
    if (r.placement === "WIN") { r.queen.wins++; r.queen.reputation.judges += 2; r.queen.reputation.fans += 2; gainProgress(r.queen, gameState.currentChallenge.type, 2); }
    if (r.placement === "HIGH") { r.queen.highs++; r.queen.reputation.fans += 1; gainProgress(r.queen, gameState.currentChallenge.type, 1); }
    if (r.placement === "BTM2") r.queen.bottoms++;
  }
  progressNonPlayerQueens();
  const episodeLog = {
    episode: gameState.episode,
    challenge: gameState.currentChallenge,
    results: gameState.temp.results.map(r => ({ id: r.queen.id, name: r.queen.name, score: r.score, challengeScore: r.challengeScore, runwayScore: r.runwayScore, runwayModifier: r.runwayModifier, placement: r.placement })),
    lipResults: lipResults.map(r => ({ name: r.queen.name, score: r.score, strategy: r.strategy, event: r.event.text })),
    eliminated: eliminated.name,
    prep: gameState.temp.prep,
    social: gameState.temp.social,
    approach: gameState.temp.approach,
    runwayChoice: gameState.temp.runwayChoice
  };
  gameState.history.push(episodeLog);
  gameState.episode++;
  saveGame();
  showEpisodeResults(episodeLog);
}

function progressNonPlayerQueens() {
  for (const q of activeQueens().filter(q => !q.isPlayer)) {
    migrateQueen(q);
    const last = q.trackRecord.at(-1)?.placement || "SAFE";
    const growth = last === "WIN" ? 2 : last === "HIGH" ? 1 : Math.random() < 0.45 ? 1 : 0;
    if (!growth) {
      adjustMental(q, { burnout: -3, stress: -2 });
      continue;
    }
    const stat = pick(["performance", "creativity", "charisma", "nerve"]);
    q.stats[stat] = clamp(q.stats[stat] + 1, 1, 10);
    const prog = pick(Object.keys(q.progression));
    q.progression[prog] = clamp(q.progression[prog] + growth, 0, 5);
    adjustMental(q, { confidence: 3 + growth, motivation: 2, burnout: -2 });
  }
}

function lipSyncEvent(strategy, q) {
  const events = {
    emotion: [{ text: "emotional connection lands", bonus: 5 }, { text: "the moment feels forced", bonus: -5 }],
    stunts: [{ text: "the reveal works", bonus: 8 }, { text: "the stunt slips", bonus: -10 }],
    lyrics: [{ text: "every lyric is precise", bonus: 5 }, { text: "a line gets lost", bonus: -6 }],
    humor: [{ text: "the judges laugh", bonus: 6 }, { text: "the joke distracts from the song", bonus: -5 }],
    energy: [{ text: "the stage belongs to them", bonus: 6 }, { text: "the energy becomes frantic", bonus: -5 }]
  };
  const chance = strategy === "stunts" ? 0.42 : 0.28;
  if (Math.random() > chance) return { text: "clean performance", bonus: 0 };
  const pool = events[strategy] || events.energy;
  return pick(pool);
}

function lipSyncScore(q, song, strategy, event) {
  let score = q.stats.performance * 1.2 + q.stats.nerve + rand(-3, 3);
  score += (q.mental.confidence - 50) * 0.04;
  score -= q.mental.stress * 0.03;
  if (song.favors.includes(strategy)) score += 4;
  if (q.traits.includes(song.trait)) score += 4;
  if (q.traits.includes("Lip Sync Beast")) score += 4;
  if (q.traits.includes("Bad Dancer") && ["stunts", "energy"].includes(strategy)) score -= 3;
  if (q.traits.includes("Meltdown Prone")) score -= rand(0, 4);
  if (q.traits.includes("Emotional") && strategy === "emotion") score += 3;
  score += event.bonus;
  return Number(score.toFixed(1));
}

function updateMentalAfterPlacement(q, placement) {
  const effects = {
    WIN: { confidence: 14, stress: -8, motivation: 6 },
    HIGH: { confidence: 8, stress: -3, motivation: 3 },
    SAFE: { confidence: 0, stress: -1, burnout: -2 },
    LOW: { confidence: -6, stress: 8 },
    BTM2: { confidence: -10, stress: 12, burnout: 6 },
    ELIM: { confidence: -20, stress: 20 }
  };
  adjustMental(q, effects[placement] || {});
}

function gainProgress(q, challengeType, amount) {
  migrateQueen(q);
  const map = { design: "sewing", makeover: "fashion", snatch: "comedy", roast: "comedy", branding: "branding", acting: "performance", rusical: "performance" };
  const key = map[challengeType] || "performance";
  q.progression[key] = clamp(q.progression[key] + amount, 0, 5);
}

function showEpisodeResults(log) {
  const playerEliminated = player().eliminated;
  app.innerHTML = `
    <section class="two-col tv-fade">
      <div class="panel">
        <div class="kicker">episode results</div>
        <h2>${log.challenge.name}</h2>
        <p>${log.prep?.text || "The episode plays out."}</p>
        <p>${log.social?.text || "The cast watches the edit form around them."}</p>
        ${log.approach ? `<p><b>Challenge choice:</b> ${log.approach.label}. ${log.approach.failed ? "The risk hurt you." : "The decision paid off."}</p>` : ""}
        ${renderResultsSummary(true)}
        <div class="panel lip-sync-stage" style="margin-top:14px">
          <h3>Lip sync</h3>
          <p>${log.lipResults.map(r => `<b>${r.name}</b> used ${strategyLabel(r.strategy)}. Moment: ${r.event}. Score: ${r.score}`).join("<br>")}</p>
          <p><b>${log.eliminated}</b> sashays away.</p>
        </div>
        <div class="footer-actions row">
          ${renderPostEpisodeActions(log)}
        </div>
      </div>
      <aside class="panel"><h3>Judges say</h3>${renderCritiques()}</aside>
    </section>`;
}


function renderPostEpisodeActions(log) {
  const justEliminated = log.eliminated === player().name;
  if (justEliminated && !gameState.spectatorMode) {
    return `<button onclick="showStart(Boolean(localStorage.getItem('dragRealitySave')))">Return to main menu</button><button onclick="continueAsSpectator()">Continue watching the season</button><button class="secondary" onclick="showTrackRecord()">Track record</button>`;
  }
  if (player().eliminated || gameState.spectatorMode) {
    const next = activeQueens().length <= 4 ? "Go to finale" : "Watch next episode";
    return `<button onclick="continueAsSpectator()">${next}</button><button class="secondary" onclick="showTrackRecord()">Track record</button><button class="secondary" onclick="showStart(Boolean(localStorage.getItem('dragRealitySave')))">Main menu</button>`;
  }
  return `<button onclick="showProgressionChoice()">Progress your queen</button><button class="secondary" onclick="showTrackRecord()">Track record</button>`;
}

function continueAsSpectator() {
  gameState.spectatorMode = true;
  saveGame();
  if (activeQueens().length <= 4) return showFinale();
  showEpisodeIntro();
}

function showProgressionChoice() {
  const q = player();
  if (q.eliminated) return showEpisodeIntro();
  const options = [
    ["sewing", "Practice sewing"], ["comedy", "Work on comedy"], ["branding", "Refine branding"], ["performance", "Train performance"], ["fashion", "Study runway styling"]
  ];
  app.innerHTML = `
    <section class="two-col tv-fade">
      <div class="panel">
        <div class="kicker">after the episode</div>
        <h2>How do you grow?</h2>
        <p>Your queen can improve over the season. Choose one area to develop before the next episode.</p>
        ${options.map(([id, label]) => `<button class="choice-card" onclick="chooseProgression('${id}')">${label}<small>Current level: ${q.progression[id]}</small></button>`).join("")}
      </div>
      <aside class="panel">${renderPlayerPanel()}</aside>
    </section>`;
}

function chooseProgression(id) {
  const q = player();
  q.progression[id] = clamp(q.progression[id] + 1, 0, 5);
  if (id === "sewing" || id === "fashion") q.stats.creativity = clamp(q.stats.creativity + 1, 1, 10);
  if (id === "comedy" || id === "branding") q.stats.charisma = clamp(q.stats.charisma + 1, 1, 10);
  if (id === "performance") q.stats.performance = clamp(q.stats.performance + 1, 1, 10);
  adjustMental(q, { motivation: 4, burnout: -5 });
  saveGame();
  showEpisodeIntro();
}

function strategyLabel(id) {
  return LIP_SYNC_STRATEGIES.find(s => s.id === id)?.label.toLowerCase() || id;
}

function renderResultsSummary(showScores) {
  const results = gameState.temp?.results || gameState.history.at(-1)?.results?.map(r => ({ queen: { name: r.name }, placement: r.placement, score: r.score, runwayScore: r.runwayScore })) || [];
  return `<div>${results.map((r, index) => `<div class="result-row"><b>${index + 1}</b><span>${r.queen.name}</span><span class="badge ${placementClass(r.placement)}">${r.placement}${showScores ? ` · ${r.score}` : ""}</span></div>`).join("")}</div>`;
}

function placementClass(p) { return p === "WIN" ? "win" : p === "HIGH" ? "high" : p === "BTM2" ? "bottom" : p === "ELIM" ? "elim" : p === "SAFE" ? "safe" : p === "LOW" ? "low" : ""; }

function renderCritiques() {
  const results = gameState.temp?.results || [];
  const pResult = results.find(r => r.queen.isPlayer);
  if (!pResult) return `<p>The judges keep talking, but your lipstick message is already on the mirror.</p>`;
  const key = pResult.placement === "WIN" ? "win" : pResult.placement === "HIGH" ? "high" : pResult.placement === "LOW" ? "low" : pResult.placement === "BTM2" ? "bottom" : "safe";
  return `<p>“${pick(CRITIQUES[key])}”</p><p><b>Challenge:</b> ${pResult.challengeScore} · <b>Runway:</b> ${pResult.runwayScore} · <b>Modifier:</b> ${Math.round((pResult.runwayModifier - 1) * 100)}%</p><p>Your edit this week feels like: <b>${editLabel(player())}</b>.</p>`;
}

function editLabel(q) {
  if (q.reputation.production > 8) return "main character chaos";
  if (q.wins > 1) return "front-runner";
  if (q.bottoms > 1) return "survivor arc";
  if (q.reputation.queens < -3) return "villain-adjacent";
  return "still developing";
}

function showTrackRecord() {
  const episodes = Math.max(...gameState.cast.map(q => q.trackRecord.length), gameState.history.length, 1);
  const headers = Array.from({ length: episodes }, (_, i) => `<th>Ep ${i + 1}</th>`).join("");
  const rows = [...gameState.cast].sort((a,b) => (a.eliminated === b.eliminated ? b.wins - a.wins : a.eliminated - b.eliminated)).map(q => `
    <tr><td><b>${q.name}</b>${q.isPlayer ? " · you" : ""}</td>${Array.from({ length: episodes }, (_, i) => {
      const rec = q.trackRecord.find(r => r.episode === i + 1);
      return `<td><span class="badge ${placementClass(rec?.placement || '')}">${rec?.placement || ""}</span></td>`;
    }).join("")}</tr>`).join("");
  app.innerHTML = `
    <section class="panel tv-fade">
      <div class="kicker">season history</div>
      <h2>Track Record</h2>
      <div style="overflow:auto"><table class="track-table"><thead><tr><th>Queen</th>${headers}</tr></thead><tbody>${rows}</tbody></table></div>
      <div class="footer-actions row">
        ${activeQueens().length <= 4 ? `<button onclick="showFinale()">Go to finale</button>` : `<button onclick="showEpisodeIntro()">Continue season</button>`}
        <button class="secondary" onclick="showStart(Boolean(localStorage.getItem('dragRealitySave')))">Main menu</button>
      </div>
    </section>`;
}

function showFinale() {
  const finalists = activeQueens();
  const finale = CHALLENGES.find(c => c.type === "finale");
  const results = finalists.map(q => ({ queen: q, score: finaleScore(q, finale) })).sort((a,b) => b.score - a.score);
  const winner = results[0].queen;
  if (!gameState.winner) {
    gameState.winner = winner.name;
    results.forEach((r, i) => r.queen.trackRecord.push({ episode: gameState.episode, challenge: finale.name, placement: i === 0 ? "WIN" : "FINAL" }));
    saveGame();
  }
  app.innerHTML = `
    <section class="panel tv-fade">
      <div class="kicker">grand finale</div>
      <h2>${winner.name} wins the crown</h2>
      <p>The finale considers track record, fan response, storyline, growth, and one last performance. ${winner.isPlayer ? "You did it." : player().eliminated ? "Your season ended earlier, but the cameras still catch your reaction." : "You made the finale, but the final edit belonged to someone else."}</p>
      ${results.map((r, i) => `<div class="result-row"><b>${i + 1}</b><span>${r.queen.name}</span><span class="badge ${i === 0 ? 'win' : 'safe'}">${r.score}</span></div>`).join("")}
      <div class="footer-actions row"><button onclick="showTrackRecord()">Final track record</button><button class="danger" onclick="deleteSaveAndRestart()">New season</button></div>
    </section>`;
}

function finaleScore(q, finale) {
  migrateQueen(q);
  return Number((calculateChallengeScore(q, finale) + q.wins * 7 + q.highs * 2 - q.bottoms * 3 + q.reputation.fans * 1.4 + q.reputation.production * 0.8 + q.spotlight * 0.6 + Object.values(q.progression).reduce((a,b) => a + b, 0)).toFixed(1));
}

function saveGame() {
  localStorage.setItem("dragRealitySave", JSON.stringify(gameState));
}

function loadGame() {
  const save = localStorage.getItem("dragRealitySave");
  if (!save) return showStart(false);
  gameState = JSON.parse(save);
  gameState.cast.forEach(migrateQueen);
  gameState.player = gameState.cast.find(q => q.isPlayer) || gameState.player;
  gameState.spectatorMode ||= false;
  showTrackRecord();
}

function deleteSaveAndRestart() {
  localStorage.removeItem("dragRealitySave");
  gameState = null;
  showCreateQueen();
}

init();
