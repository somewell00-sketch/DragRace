let gameState = null;
const app = document.getElementById("app");

const clone = (value) => JSON.parse(JSON.stringify(value));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (array) => array[Math.floor(Math.random() * array.length)];
const shuffle = (array) => clone(array).sort(() => Math.random() - 0.5);
const activeQueens = () => gameState.cast.filter(q => !q.eliminated);
const player = () => gameState.player;

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

function showStart(hasSave) {
  app.innerHTML = `
    <section class="hero">
      <div class="kicker">first person drag reality sim</div>
      <h1>Drag Reality Simulator</h1>
      <p>Crie sua queen, entre no Werk Room, faça escolhas de preparação e sobreviva a desafios, runways, críticas, lip syncs e edição de reality show.</p>
      <div class="row">
        <button onclick="showCreateQueen()">New Season</button>
        <button class="secondary" onclick="loadGame()" ${hasSave ? "" : "disabled"}>Continue</button>
        <button class="secondary" onclick="showCredits()">Credits</button>
      </div>
    </section>`;
}

function showCredits() {
  app.innerHTML = `
    <section class="panel">
      <h2>Credits</h2>
      <p>Protótipo em HTML, CSS e JavaScript puro. Não usa músicas, nomes de jurados ou elementos protegidos específicos de franquias reais. A estrutura é inspirada em reality competitions de drag.</p>
      <button onclick="showStart(Boolean(localStorage.getItem('dragRealitySave')))">Back</button>
    </section>`;
}

function showCreateQueen() {
  const archetypeOptions = Object.keys(ARCHETYPES).map(a => `<option value="${a}">${a}</option>`).join("");
  const traitOptions = TRAITS.map(t => `<option value="${t}">${t}</option>`).join("");
  app.innerHTML = `
    <section class="two-col">
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
    q.relationships = Object.fromEntries(cast.filter(o => o.id !== q.id).map(o => [o.id, rand(-1, 1)]));
  }
  gameState = {
    episode: 1,
    cast,
    player: playerQueen,
    eliminatedQueens: [],
    history: [],
    currentChallenge: null,
    phase: "cast",
    seasonTone: pick(["Messy Season", "Fashion Season", "Redemption Season", "Battle Season"])
  };
  saveGame();
  showMeetCast();
}

function showMeetCast() {
  app.innerHTML = `
    <section class="panel">
      <div class="kicker">${gameState.seasonTone}</div>
      <h2>Meet the Cast</h2>
      <p>Twelve queens enter. Every episode has a main challenge, runway, critiques and a bottom two lip sync until the finale.</p>
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
  const challenge = CHALLENGES[(gameState.episode - 1) % (CHALLENGES.length - 1)];
  gameState.currentChallenge = clone(challenge);
  gameState.temp = { prep: null, social: null, results: null, lip: null };
  app.innerHTML = `
    <section class="two-col">
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

function renderPlayerPanel() {
  const q = player();
  return `<div class="kicker">your queen</div><h3>${q.name}</h3><p>${q.dragStyle}</p>${renderStats(q)}<p>${q.traits.map(t => `<span class="badge">${t}</span>`).join("")}</p><p><b>Fans:</b> ${q.reputation.fans} · <b>Production:</b> ${q.reputation.production} · <b>Queens:</b> ${q.reputation.queens}</p>`;
}

function choosePrep(id) {
  const action = PREP_ACTIONS.find(a => a.id === id);
  gameState.temp.prep = action;
  applyEffects(player(), action.effects);
  saveGame();
  app.innerHTML = `
    <section class="two-col">
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
  const target = pick(activeQueens().filter(q => !q.isPlayer));
  if (target) {
    player().relationships[target.id] = Math.max(-5, Math.min(5, (player().relationships[target.id] || 0) + (action.effects.queens || 0)));
  }
  resolveChallenge();
}

function applyEffects(q, effects) {
  for (const [key, value] of Object.entries(effects)) {
    if (key in q.stats) q.stats[key] = Math.max(1, Math.min(10, q.stats[key] + value));
    else if (key in q.reputation) q.reputation[key] += value;
    else q[key] = (q[key] || 0) + value;
  }
}

function resolveChallenge() {
  const challenge = gameState.currentChallenge;
  const results = activeQueens().map(q => ({ queen: q, score: calculateChallengeScore(q, challenge) })).sort((a, b) => b.score - a.score);
  assignPlacements(results);
  gameState.temp.results = results;
  const bottom = results.filter(r => r.placement === "BTM2");
  if (bottom.some(r => r.queen.isPlayer)) showPlayerLipSync(bottom);
  else resolveNpcLipSync(bottom, results);
}

function calculateChallengeScore(q, challenge) {
  let score = 0;
  for (const [stat, weight] of Object.entries(challenge.stats)) score += q.stats[stat] * weight * 10;
  score += traitBonus(q, challenge);
  score += q.reputation.production * 0.35;
  score += q.reputation.fans * 0.12;
  score -= Math.max(0, q.exhaustion || 0) * 0.8;
  if (gameState.seasonTone === "Fashion Season") score += (q.stats.creativity - 5) * 0.4;
  if (gameState.seasonTone === "Messy Season") score += q.reputation.production * 0.25;
  if (gameState.seasonTone === "Battle Season") score += (q.stats.nerve - 5) * 0.35;
  score += rand(-20, 20) / 10;
  q.spotlight += Math.max(0, Math.round((score - 45) / 12)) + (q.traits.includes("Great Confessional") ? 1 : 0);
  return Number(score.toFixed(1));
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

function showPlayerLipSync(bottom) {
  const song = pick(LIP_SYNC_SONGS);
  gameState.temp.lip = { song };
  app.innerHTML = `
    <section class="two-col">
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

function resolvePlayerLipSync(strategy) {
  gameState.temp.lip.strategy = strategy;
  const bottom = gameState.temp.results.filter(r => r.placement === "BTM2");
  finishLipSync(bottom, strategy);
}

function resolveNpcLipSync(bottom) {
  finishLipSync(bottom, pick(LIP_SYNC_STRATEGIES).id);
}

function finishLipSync(bottom, playerStrategy) {
  const song = gameState.temp.lip?.song || pick(LIP_SYNC_SONGS);
  const lipResults = bottom.map(r => {
    const strategy = r.queen.isPlayer ? playerStrategy : pick(LIP_SYNC_STRATEGIES).id;
    return { queen: r.queen, strategy, score: lipSyncScore(r.queen, song, strategy) };
  }).sort((a, b) => b.score - a.score);
  const eliminated = lipResults[1].queen;
  eliminated.eliminated = true;
  eliminated.trackRecord.push({ episode: gameState.episode, challenge: gameState.currentChallenge.name, placement: "ELIM" });
  gameState.eliminatedQueens.push(eliminated);
  for (const r of gameState.temp.results) {
    if (r.queen.id === eliminated.id) continue;
    r.queen.trackRecord.push({ episode: gameState.episode, challenge: gameState.currentChallenge.name, placement: r.placement });
    if (r.placement === "WIN") { r.queen.wins++; r.queen.reputation.judges += 2; r.queen.reputation.fans += 2; }
    if (r.placement === "HIGH") { r.queen.highs++; r.queen.reputation.fans += 1; }
    if (r.placement === "BTM2") r.queen.bottoms++;
  }
  const episodeLog = {
    episode: gameState.episode,
    challenge: gameState.currentChallenge,
    results: gameState.temp.results.map(r => ({ id: r.queen.id, name: r.queen.name, score: r.score, placement: r.placement })),
    lipResults: lipResults.map(r => ({ name: r.queen.name, score: r.score, strategy: r.strategy })),
    eliminated: eliminated.name,
    prep: gameState.temp.prep,
    social: gameState.temp.social
  };
  gameState.history.push(episodeLog);
  gameState.episode++;
  saveGame();
  showEpisodeResults(episodeLog);
}

function lipSyncScore(q, song, strategy) {
  let score = q.stats.performance * 1.2 + q.stats.nerve + rand(-3, 3);
  if (song.favors.includes(strategy)) score += 4;
  if (q.traits.includes(song.trait)) score += 4;
  if (q.traits.includes("Lip Sync Beast")) score += 4;
  if (q.traits.includes("Bad Dancer") && ["stunts", "energy"].includes(strategy)) score -= 3;
  if (q.traits.includes("Meltdown Prone")) score -= rand(0, 4);
  if (q.traits.includes("Emotional") && strategy === "emotion") score += 3;
  return Number(score.toFixed(1));
}

function showEpisodeResults(log) {
  const playerEliminated = player().eliminated;
  app.innerHTML = `
    <section class="two-col">
      <div class="panel">
        <div class="kicker">episode results</div>
        <h2>${log.challenge.name}</h2>
        <p>${gameState.temp?.prep?.text || "The episode plays out."}</p>
        <p>${gameState.temp?.social?.text || "The cast watches the edit form around them."}</p>
        ${renderResultsSummary(true)}
        <div class="panel" style="margin-top:14px">
          <h3>Lip sync</h3>
          <p>${log.lipResults.map(r => `<b>${r.name}</b> used ${strategyLabel(r.strategy)} and scored ${r.score}`).join("<br>")}</p>
          <p><b>${log.eliminated}</b> sashays away.</p>
        </div>
        <div class="footer-actions row">
          ${playerEliminated ? `<button onclick="showTrackRecord()">See the season continue</button>` : `<button onclick="showEpisodeIntro()">Next episode</button>`}
          <button class="secondary" onclick="showTrackRecord()">Track record</button>
        </div>
      </div>
      <aside class="panel"><h3>Judges say</h3>${renderCritiques()}</aside>
    </section>`;
}

function strategyLabel(id) {
  return LIP_SYNC_STRATEGIES.find(s => s.id === id)?.label.toLowerCase() || id;
}

function renderResultsSummary(showScores) {
  const results = gameState.temp.results || gameState.history.at(-1)?.results?.map(r => ({ queen: { name: r.name }, placement: r.placement, score: r.score })) || [];
  return `<div>${results.map((r, index) => `<div class="result-row"><b>${index + 1}</b><span>${r.queen.name}</span><span class="badge ${placementClass(r.placement)}">${r.placement}${showScores ? ` · ${r.score}` : ""}</span></div>`).join("")}</div>`;
}

function placementClass(p) { return p === "WIN" ? "win" : p === "HIGH" ? "high" : p === "BTM2" ? "bottom" : p === "ELIM" ? "elim" : p === "SAFE" ? "safe" : ""; }

function renderCritiques() {
  const results = gameState.temp.results || [];
  const pResult = results.find(r => r.queen.isPlayer);
  if (!pResult) return `<p>The judges keep talking, but your lipstick message is already on the mirror.</p>`;
  const key = pResult.placement === "WIN" ? "win" : pResult.placement === "HIGH" ? "high" : pResult.placement === "LOW" ? "low" : pResult.placement === "BTM2" ? "bottom" : "safe";
  return `<p>“${pick(CRITIQUES[key])}”</p><p>Your edit this week feels like: <b>${editLabel(player())}</b>.</p>`;
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
    <section class="panel">
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
    <section class="panel">
      <div class="kicker">grand finale</div>
      <h2>${winner.name} wins the crown</h2>
      <p>The finale considers track record, fan response, storyline, and one last performance. ${winner.isPlayer ? "You did it." : player().eliminated ? "Your season ended earlier, but the cameras still catch your reaction." : "You made the finale, but the final edit belonged to someone else."}</p>
      ${results.map((r, i) => `<div class="result-row"><b>${i + 1}</b><span>${r.queen.name}</span><span class="badge ${i === 0 ? 'win' : 'safe'}">${r.score}</span></div>`).join("")}
      <div class="footer-actions row"><button onclick="showTrackRecord()">Final track record</button><button class="danger" onclick="deleteSaveAndRestart()">New season</button></div>
    </section>`;
}

function finaleScore(q, finale) {
  return Number((calculateChallengeScore(q, finale) + q.wins * 7 + q.highs * 2 - q.bottoms * 3 + q.reputation.fans * 1.4 + q.reputation.production * 0.8 + q.spotlight * 0.6).toFixed(1));
}

function saveGame() {
  localStorage.setItem("dragRealitySave", JSON.stringify(gameState));
}

function loadGame() {
  const save = localStorage.getItem("dragRealitySave");
  if (!save) return showStart(false);
  gameState = JSON.parse(save);
  showTrackRecord();
}

function deleteSaveAndRestart() {
  localStorage.removeItem("dragRealitySave");
  gameState = null;
  showCreateQueen();
}

init();
