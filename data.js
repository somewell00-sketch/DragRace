const ARCHETYPES = {
  "Fashion Queen": {
    description: "Visual afiado, conceito forte e risco de sumir em desafios de palco.",
    stats: { performance: 4, creativity: 9, charisma: 6, nerve: 6 },
    traits: ["Runway Perfectionist", "Fashion Risk Taker", "Overthinks"]
  },
  "Comedy Queen": {
    description: "Carisma natural, timing rápido e perigo quando precisa entregar moda.",
    stats: { performance: 6, creativity: 5, charisma: 9, nerve: 7 },
    traits: ["Comedy Instinct", "Meme Queen", "Too Safe"]
  },
  "Pageant Queen": {
    description: "Polida, confiante e consistente, mas pode parecer calculada demais.",
    stats: { performance: 7, creativity: 6, charisma: 6, nerve: 8 },
    traits: ["Professional", "Competitive", "Charming"]
  },
  "Dancing Diva": {
    description: "Domina o palco e o lip sync, mas sofre quando precisa costurar ou conceituar.",
    stats: { performance: 9, creativity: 4, charisma: 7, nerve: 7 },
    traits: ["Lip Sync Beast", "Bad Dancer", "Competitive"]
  },
  "Club Kid": {
    description: "Estranha, ousada, imprevisível e ótima para televisão.",
    stats: { performance: 6, creativity: 8, charisma: 5, nerve: 8 },
    traits: ["Chaotic Energy", "Fashion Risk Taker", "Unfiltered"]
  },
  "Theatre Queen": {
    description: "Expressiva, musical e boa de cena, mas nem sempre entende moda.",
    stats: { performance: 8, creativity: 5, charisma: 8, nerve: 6 },
    traits: ["Quick Thinker", "Professional", "Cannot Sew"]
  },
  "Baby Queen": {
    description: "Ainda descobrindo sua drag, com espaço para crescer e surpreender.",
    stats: { performance: 6, creativity: 6, charisma: 6, nerve: 6 },
    traits: ["Insecure", "Great Confessional", "Emotional"]
  },
  "Veteran Queen": {
    description: "Experiente e consistente, com risco de parecer previsível.",
    stats: { performance: 7, creativity: 7, charisma: 7, nerve: 7 },
    traits: ["Professional", "Too Safe", "Strategic"]
  }
};

const TRAITS = [
  "Lip Sync Beast", "Runway Perfectionist", "Quick Thinker", "Meme Queen", "Charming",
  "Professional", "Strategic", "Great Confessional", "Fashion Risk Taker", "Comedy Instinct",
  "Insecure", "Overthinks", "Cannot Sew", "Bad Dancer", "Easily Irritated", "Attention Seeker",
  "Shady", "Lazy", "Too Safe", "Meltdown Prone", "Delusional", "Chaotic Energy", "Villain Energy",
  "Emotional", "Competitive", "Unfiltered"
];

const NPC_TEMPLATES = [
  { name: "Ruby Glitz", archetype: "Pageant Queen", entrance: "Beauty, polish, and a contractually obligated smile.", pronouns: "she/her" },
  { name: "Mother Venom", archetype: "Comedy Queen", entrance: "I came to read, roast, and collect prize money.", pronouns: "she/her" },
  { name: "Lola Star", archetype: "Dancing Diva", entrance: "Hope this runway has insurance.", pronouns: "she/her" },
  { name: "Saint Polyester", archetype: "Fashion Queen", entrance: "Cheap fabric, expensive delusion.", pronouns: "they/them" },
  { name: "Electra Shade", archetype: "Club Kid", entrance: "I do not enter rooms. I haunt them.", pronouns: "she/her" },
  { name: "Mimi Melodrama", archetype: "Theatre Queen", entrance: "The spotlight and I have a complicated relationship.", pronouns: "she/her" },
  { name: "Dahlia Damage", archetype: "Club Kid", entrance: "I am the warning label.", pronouns: "they/them" },
  { name: "Bella Bomba", archetype: "Dancing Diva", entrance: "If I fall, pretend it was choreography.", pronouns: "she/her" },
  { name: "Opal Divine", archetype: "Veteran Queen", entrance: "I have survived worse lighting than this.", pronouns: "she/her" },
  { name: "Kitty Couture", archetype: "Fashion Queen", entrance: "Meow means crown in my language.", pronouns: "she/her" },
  { name: "Brenda Briefs", archetype: "Comedy Queen", entrance: "The body is tea, the budget is instant coffee.", pronouns: "she/her" },
  { name: "Nova Noir", archetype: "Baby Queen", entrance: "I am nervous, gorgeous, and legally flammable.", pronouns: "they/them" },
  { name: "Regina Ruckus", archetype: "Veteran Queen", entrance: "I have opinions older than half this cast.", pronouns: "she/her" },
  { name: "Honey Havoc", archetype: "Pageant Queen", entrance: "Sweet face. Sour notes app.", pronouns: "she/her" },
  { name: "Vera Voltage", archetype: "Theatre Queen", entrance: "Some girls enter. I project.", pronouns: "she/her" }
];

const CHALLENGES = [
  { name: "The Improvised Telenovela", type: "acting", description: "A chaotic soap opera where nobody knows who is married, dead, or both.", stats: { performance: 0.45, charisma: 0.35, nerve: 0.20 }, runway: "Entrance to the Funeral" },
  { name: "Trash to Treasure Ball", type: "design", description: "The queens turn discarded materials into questionable couture.", stats: { creativity: 0.70, nerve: 0.20, charisma: 0.10 }, runway: "Recycled Royalty" },
  { name: "Snatch Game Adjacent", type: "snatch", description: "Celebrity impersonations without legal problems.", stats: { charisma: 0.45, nerve: 0.35, performance: 0.20 }, runway: "Night of a Thousand Almosts" },
  { name: "Rusical of the Lost Crown", type: "rusical", description: "A musical history lesson that aggressively ignores history.", stats: { performance: 0.60, charisma: 0.20, nerve: 0.20 }, runway: "Dynasty Drama" },
  { name: "The Branding Bazaar", type: "branding", description: "The queens create a product, a slogan, and a reason anyone should care.", stats: { charisma: 0.45, creativity: 0.35, nerve: 0.20 }, runway: "Executive Excess" },
  { name: "Roast of the Retired Diva", type: "roast", description: "The jokes must burn, but not so much that production needs lawyers.", stats: { charisma: 0.50, nerve: 0.35, performance: 0.15 }, runway: "Smoke and Mirrors" },
  { name: "Family Resemblance Makeover", type: "makeover", description: "The queens turn strangers into drag relatives with feelings and lashes.", stats: { creativity: 0.45, charisma: 0.35, performance: 0.20 }, runway: "Chosen Family" },
  { name: "The Finale Performance", type: "finale", description: "Original verses, choreography, speeches, and one final attempt to look inevitable.", stats: { performance: 0.40, charisma: 0.30, creativity: 0.20, nerve: 0.10 }, runway: "Crowning Eleganza" }
];

const PREP_ACTIONS = [
  { id: "rehearse", label: "Rehearse until your feet hurt", text: "You choose discipline over drama and drill every beat.", effects: { performance: 2, exhaustion: 1, production: -1 } },
  { id: "look", label: "Refine the runway concept", text: "You obsess over the silhouette, the story, and the last rhinestone.", effects: { creativity: 2, queens: -1 } },
  { id: "drama", label: "Start a camera-ready conversation", text: "You pull focus in the Werk Room and make sure the microphones catch it.", effects: { nerve: 1, production: 3, queens: -2, fans: 1 } },
  { id: "help", label: "Help another queen", text: "You offer support, even if it costs you a little time.", effects: { queens: 2, fans: 1, creativity: -1 } },
  { id: "rest", label: "Protect your peace", text: "You stay quiet, conserve energy, and avoid becoming a storyline.", effects: { exhaustion: -2, nerve: 1, production: -1 } }
];

const SOCIAL_ACTIONS = [
  { id: "compliment", label: "Compliment a queen honestly", effects: { queens: 1, fans: 1, production: 0 }, text: "The room softens. Someone needed that." },
  { id: "shade", label: "Throw a little shade", effects: { queens: -1, fans: 1, production: 2 }, text: "The cast gasps, the cameras zoom, and nobody forgets it." },
  { id: "alliance", label: "Quietly form an alliance", effects: { queens: 2, production: 1, nerve: 1 }, text: "A small agreement forms in a corner nobody fully trusts." },
  { id: "isolate", label: "Stay out of it", effects: { queens: 0, production: -1, nerve: -1 }, text: "You avoid the mess, but silence is also an edit." }
];

const LIP_SYNC_SONGS = [
  { title: "Neon Heartbreak", artist: "The Velvet Sirens", type: "pop banger", favors: ["energy", "stunts"], trait: "Lip Sync Beast" },
  { title: "Last Light on the Mirror", artist: "Diva Nocturne", type: "emotional ballad", favors: ["emotion", "lyrics"], trait: "Emotional" },
  { title: "Oops, I Stole the Spotlight", artist: "Kitty Cabaret", type: "campy comedy song", favors: ["humor", "lyrics"], trait: "Comedy Instinct" },
  { title: "Runway Siren", artist: "House of Pulse", type: "dance anthem", favors: ["stunts", "energy"], trait: "Lip Sync Beast" },
  { title: "Crown Me in Thunder", artist: "Electra Divine", type: "dramatic diva song", favors: ["emotion", "energy"], trait: "Competitive" },
  { title: "Glitter After Midnight", artist: "The Disco Saints", type: "old-school disco", favors: ["energy", "humor"], trait: "Professional" }
];

const LIP_SYNC_STRATEGIES = [
  { id: "emotion", label: "Deliver raw emotion" },
  { id: "stunts", label: "Go for stunts and reveals" },
  { id: "lyrics", label: "Focus on every lyric" },
  { id: "humor", label: "Make the judges laugh" },
  { id: "energy", label: "Attack the song with full energy" }
];

const CRITIQUES = {
  win: ["You owned the challenge tonight.", "This was the clearest version of your drag so far.", "You took a risk, and it paid off."],
  high: ["You were close to the win, and the judges noticed.", "A strong week, even if someone else edged you out.", "You gave the producers plenty to work with."],
  safe: ["You did enough to move on.", "Not a disaster, not a breakthrough.", "The judges remember you, but not loudly."],
  low: ["The idea was there, but the execution shook.", "You faded when you needed to sharpen the moment.", "A warning shot from the panel."],
  bottom: ["This was not your strongest week.", "You disappeared in a challenge where you needed to shine.", "The runway could not save the challenge."],
  elim: ["Your drag remains yours. The competition ends here.", "You leave the stage, but not quietly.", "The mirror message becomes part of the season lore."]
};
