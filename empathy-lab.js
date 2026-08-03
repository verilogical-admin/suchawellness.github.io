const empathyLabAccessKey = "suchaEmpathyLabAccess.v1";
const empathyLabProgressKey = "suchaEmpathyLabProgress.v1";
const empathyLabPlanId = "empathy_lab_yearly_1000";
const empathyLabProduct = "SuchaEmpathyLabPremium";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const modes = {
  cognitive: {
    label: "Cognitive empathy",
    lenses: [
      ["Facts", "What do we know without guessing?"],
      ["Thoughts", "What might they be thinking or assuming?"],
      ["Beliefs", "What rule or story may be guiding them?"],
      ["Check", "What question would test the read?"]
    ]
  },
  emotional: {
    label: "Emotional empathy",
    lenses: [
      ["Emotion cue", "What feeling is visible in words or behavior?"],
      ["Body clue", "What might posture, pace, or silence suggest?"],
      ["Intensity", "How strong might the feeling be?"],
      ["Careful mirror", "How can you reflect without claiming certainty?"]
    ]
  },
  compassionate: {
    label: "Compassionate empathy",
    lenses: [
      ["Need", "What support might be wanted?"],
      ["Consent", "Should you ask before helping?"],
      ["Boundary", "What help is yours to offer?"],
      ["Action", "What small next step is kind and realistic?"]
    ]
  },
  synchrony: {
    label: "Synchrony empathy",
    lenses: [
      ["Timing", "Are they fast, slow, delayed, or avoidant?"],
      ["Tone", "Does tone match the words?"],
      ["Rhythm", "Do they move toward, away, or around the issue?"],
      ["Adjustment", "Should you slow down, soften, clarify, or pause?"]
    ]
  }
};

const scenarios = [
  {
    title: "Late reply",
    text: "A friend replies after two days: \"Sorry, just busy.\" You feel brushed off.",
    model: {
      cognitive: "They may be overwhelmed, avoidant, unsure what to say, or genuinely busy. The fact is only that the reply was delayed.",
      emotional: "Possible feelings: guilt, tiredness, pressure, distance, or embarrassment.",
      compassionate: "A helpful response asks whether they need space or support without demanding immediate closeness.",
      synchrony: "The timing is delayed and the wording is short. That mismatch invites a gentle check, not a verdict."
    }
  },
  {
    title: "Quiet manager",
    text: "Your manager says, \"Fine, send it,\" but their tone is flat and they stop making eye contact.",
    model: {
      cognitive: "They may disagree, feel rushed, be thinking through risk, or be distracted by another pressure.",
      emotional: "Possible feelings: concern, irritation, fatigue, or guardedness.",
      compassionate: "You can offer a low-pressure check: \"I sense there may be a concern. Want me to revise anything before sending?\"",
      synchrony: "Words say yes, tone and eye contact suggest hesitation. The useful cue is mismatch."
    }
  },
  {
    title: "Partner says nothing",
    text: "Your partner says, \"Do whatever you want,\" then becomes quiet.",
    model: {
      cognitive: "They may feel unheard, may not want conflict, or may be testing whether their preference matters.",
      emotional: "Possible feelings: hurt, resignation, anger, fear of being too much.",
      compassionate: "Pause the decision and invite the hidden preference: \"I do care what you want. Can we slow down?\"",
      synchrony: "The phrase closes the topic, but silence keeps the emotion active."
    }
  },
  {
    title: "Client keeps changing details",
    text: "A client keeps adding small changes and says, \"This should only take a minute.\"",
    model: {
      cognitive: "They may underestimate effort, feel anxious about quality, or be avoiding a bigger revision conversation.",
      emotional: "Possible feelings: urgency, uncertainty, perfectionism, or pressure from someone else.",
      compassionate: "Help by creating clarity: \"I can do these changes. Let us group them and confirm scope.\"",
      synchrony: "Repeated small asks suggest the real need may be reassurance or control."
    }
  }
];

const roomScenarios = [
  {
    text: "In a meeting, someone says \"great idea\" quickly, looks down, and changes the subject.",
    cues: ["tone", "timing", "mismatch", "check"],
    explanation: "The words are positive, but speed, looking down, and topic change create a mismatch. A good read stays tentative."
  },
  {
    text: "A teammate asks many detailed questions after a new plan is announced by a senior leader.",
    cues: ["words", "context", "power", "need"],
    explanation: "Questions may signal resistance, but the power context matters. They may need safety, clarity, or permission to raise risk."
  },
  {
    text: "A friend laughs while describing something painful, then says, \"Anyway, it's stupid.\"",
    cues: ["tone", "mismatch", "need", "check"],
    explanation: "Humor and dismissal can protect vulnerability. Check gently instead of pushing."
  }
];

const characterPalette = [
  ["#27483f", "#c79a4b"],
  ["#4b2f34", "#d98f83"],
  ["#283a52", "#8da9c4"],
  ["#514124", "#d9b66d"],
  ["#3e344a", "#b8a8d4"],
  ["#315247", "#83bba7"],
  ["#5a3530", "#d7a092"],
  ["#29343d", "#aebdca"]
];

const throneCharacters = [
  { name: "Tyrion Lannister", house: "House Lannister", initials: "TL", scores: { cognitive: 10, emotional: 7, compassionate: 7, syncretic: 9 }, note: "Reads incentives, shame, pride, and danger with rare precision. His empathy is sharpest when strategy and wounded tenderness work together." },
  { name: "Daenerys Targaryen", house: "House Targaryen", initials: "DT", scores: { cognitive: 7, emotional: 8, compassionate: 8, syncretic: 7 }, note: "Often feels suffering intensely and wants liberation, but power and certainty can narrow her ability to revise a read." },
  { name: "Jon Snow", house: "House Stark", initials: "JS", scores: { cognitive: 7, emotional: 7, compassionate: 9, syncretic: 8 }, note: "Compassionate empathy leads. He is best at honoring pain across enemy lines, even when politics demands colder calculation." },
  { name: "Arya Stark", house: "House Stark", initials: "AS", scores: { cognitive: 8, emotional: 5, compassionate: 5, syncretic: 9 }, note: "A master of micro-cues, threat reading, and adaptation. Her empathy is more perceptive than soft, built for survival." },
  { name: "Sansa Stark", house: "House Stark", initials: "SS", scores: { cognitive: 9, emotional: 8, compassionate: 7, syncretic: 9 }, note: "Her people-reading matures through painful pattern recognition. She becomes especially strong at power, timing, and hidden intent." },
  { name: "Bran Stark", house: "House Stark", initials: "BS", scores: { cognitive: 9, emotional: 3, compassionate: 4, syncretic: 10 }, note: "High syncretic perspective through vast pattern awareness, but low emotional warmth. He sees systems more easily than feelings." },
  { name: "Catelyn Stark", house: "House Stark", initials: "CS", scores: { cognitive: 7, emotional: 9, compassionate: 8, syncretic: 7 }, note: "Emotionally attuned and fiercely protective. Her reads are powerful, though family fear can overwhelm strategic distance." },
  { name: "Ned Stark", house: "House Stark", initials: "NS", scores: { cognitive: 6, emotional: 7, compassionate: 8, syncretic: 5 }, note: "Kind, honorable, and humane, but less fluid at reading deceptive social systems. Good heart, costly blind spots." },
  { name: "Cersei Lannister", house: "House Lannister", initials: "CL", scores: { cognitive: 8, emotional: 5, compassionate: 2, syncretic: 7 }, note: "Excellent at suspicion, pride, vulnerability, and leverage. Compassion stays low because care is usually filtered through possession and control." },
  { name: "Jaime Lannister", house: "House Lannister", initials: "JL", scores: { cognitive: 7, emotional: 7, compassionate: 6, syncretic: 7 }, note: "Begins defended and cynical, but grows in emotional recognition. His empathy is strongest when loyalty becomes conscience." },
  { name: "Tywin Lannister", house: "House Lannister", initials: "TW", scores: { cognitive: 10, emotional: 3, compassionate: 1, syncretic: 8 }, note: "A formidable reader of incentives and status, with almost no compassionate softness. Strategic empathy without mercy." },
  { name: "Varys", house: "The Spider", initials: "V", scores: { cognitive: 10, emotional: 7, compassionate: 7, syncretic: 10 }, note: "Elite pattern reader. His empathy spans networks, public suffering, and long-game outcomes, though it can become abstract." },
  { name: "Petyr Baelish", house: "Littlefinger", initials: "PB", scores: { cognitive: 10, emotional: 6, compassionate: 1, syncretic: 9 }, note: "Brilliant at desire, insecurity, and opportunity. His empathy is extractive: he understands people mainly to move them." },
  { name: "Brienne of Tarth", house: "House Tarth", initials: "BT", scores: { cognitive: 6, emotional: 8, compassionate: 10, syncretic: 7 }, note: "Deep compassionate empathy with strong loyalty and moral steadiness. She may miss manipulation, but rarely misses dignity." },
  { name: "Samwell Tarly", house: "House Tarly", initials: "ST", scores: { cognitive: 8, emotional: 8, compassionate: 9, syncretic: 7 }, note: "A gentle integrator: notices fear, knowledge gaps, and practical ways to help. His empathy is warm and useful." },
  { name: "Margaery Tyrell", house: "House Tyrell", initials: "MT", scores: { cognitive: 9, emotional: 8, compassionate: 6, syncretic: 9 }, note: "Socially fluent and emotionally observant. Her warmth may be strategic, but the read of the room is excellent." },
  { name: "Olenna Tyrell", house: "House Tyrell", initials: "OT", scores: { cognitive: 10, emotional: 7, compassionate: 5, syncretic: 9 }, note: "Fast, witty, and socially exact. She reads motives and absurdity beautifully, with selective compassion." },
  { name: "Theon Greyjoy", house: "House Greyjoy", initials: "TG", scores: { cognitive: 5, emotional: 8, compassionate: 6, syncretic: 6 }, note: "Emotionally intense and identity-hungry. His empathy improves when shame becomes remorse rather than performance." },
  { name: "Yara Greyjoy", house: "House Greyjoy", initials: "YG", scores: { cognitive: 7, emotional: 7, compassionate: 7, syncretic: 8 }, note: "Direct, pragmatic, and better at reading loyalty through action than through polished words." },
  { name: "Davos Seaworth", house: "Onion Knight", initials: "DS", scores: { cognitive: 8, emotional: 8, compassionate: 9, syncretic: 8 }, note: "One of the healthiest empathy profiles: grounded, plain-spoken, humane, and able to challenge power without losing care." },
  { name: "Melisandre", house: "Red Priestess", initials: "M", scores: { cognitive: 7, emotional: 4, compassionate: 3, syncretic: 9 }, note: "High symbolic and pattern empathy, low humility when interpretation becomes certainty. A cautionary card for over-reading signs." },
  { name: "Jorah Mormont", house: "House Mormont", initials: "JM", scores: { cognitive: 6, emotional: 8, compassionate: 8, syncretic: 6 }, note: "Devoted and emotionally sensitive, though attachment can distort his reading. Care is high, objectivity less so." },
  { name: "Sandor Clegane", house: "The Hound", initials: "SC", scores: { cognitive: 7, emotional: 6, compassionate: 6, syncretic: 8 }, note: "Rough exterior, strong threat-reading, hidden care. He senses hypocrisy and fear faster than tenderness." },
  { name: "Bronn", house: "Sellsword", initials: "B", scores: { cognitive: 8, emotional: 5, compassionate: 3, syncretic: 8 }, note: "Reads motives, risk, and advantage with comic speed. More adaptive than caring, but rarely naive." },
  { name: "Missandei", house: "Naath", initials: "MI", scores: { cognitive: 8, emotional: 9, compassionate: 9, syncretic: 8 }, note: "Graceful emotional and compassionate empathy. She reads language, pain, loyalty, and dignity with quiet accuracy." },
  { name: "Grey Worm", house: "Unsullied", initials: "GW", scores: { cognitive: 7, emotional: 6, compassionate: 7, syncretic: 7 }, note: "Disciplined and restrained, with empathy emerging through trust and attachment rather than open expressiveness." },
  { name: "Tormund Giantsbane", house: "Free Folk", initials: "TG", scores: { cognitive: 6, emotional: 8, compassionate: 7, syncretic: 8 }, note: "Emotionally direct, socially bold, and often surprisingly attuned once you translate the volume." },
  { name: "Ygritte", house: "Free Folk", initials: "Y", scores: { cognitive: 7, emotional: 8, compassionate: 6, syncretic: 8 }, note: "Strong emotional read and cultural attunement. She spots naivete quickly and tests whether people understand context." },
  { name: "Oberyn Martell", house: "House Martell", initials: "OM", scores: { cognitive: 8, emotional: 9, compassionate: 7, syncretic: 9 }, note: "Emotionally vivid, socially perceptive, and excellent at reading masks. His empathy is passionate, sometimes risky." },
  { name: "Ellaria Sand", house: "Dorne", initials: "ES", scores: { cognitive: 6, emotional: 9, compassionate: 4, syncretic: 7 }, note: "High emotional intensity and grief perception, but pain can narrow compassion into vengeance." },
  { name: "Ramsay Bolton", house: "House Bolton", initials: "RB", scores: { cognitive: 8, emotional: 4, compassionate: 0, syncretic: 7 }, note: "A dark example of cognitive empathy used for harm. He reads fear well, but lacks compassionate restraint." },
  { name: "Joffrey Baratheon", house: "House Baratheon", initials: "JB", scores: { cognitive: 3, emotional: 2, compassionate: 0, syncretic: 2 }, note: "Low empathy across the board. Often reacts from insecurity, domination, and impulse rather than accurate people-reading." },
  { name: "Robb Stark", house: "House Stark", initials: "RS", scores: { cognitive: 6, emotional: 8, compassionate: 7, syncretic: 6 }, note: "Warm, brave, and emotionally sincere. His empathy for individuals can overpower his read of political consequence." },
  { name: "Rickon Stark", house: "House Stark", initials: "RS", scores: { cognitive: 4, emotional: 7, compassionate: 5, syncretic: 4 }, note: "A child under trauma: emotion is vivid, but reflective perspective-taking is still developing." },
  { name: "Lyanna Mormont", house: "House Mormont", initials: "LM", scores: { cognitive: 8, emotional: 6, compassionate: 7, syncretic: 8 }, note: "Small frame, huge room-read. She notices weakness, evasion, and loyalty signals fast." },
  { name: "Jeor Mormont", house: "Night's Watch", initials: "JM", scores: { cognitive: 8, emotional: 6, compassionate: 7, syncretic: 8 }, note: "A disciplined institutional reader who understands morale, duty, and the cost of command." },
  { name: "Maester Aemon", house: "Night's Watch", initials: "MA", scores: { cognitive: 9, emotional: 8, compassionate: 9, syncretic: 9 }, note: "Wise, humble, and emotionally spacious. He reads pain without needing to control it." },
  { name: "Alliser Thorne", house: "Night's Watch", initials: "AT", scores: { cognitive: 6, emotional: 3, compassionate: 2, syncretic: 5 }, note: "Reads discipline and threat, but bitterness blocks curiosity about inner experience." },
  { name: "Eddison Tollett", house: "Night's Watch", initials: "ET", scores: { cognitive: 7, emotional: 6, compassionate: 6, syncretic: 8 }, note: "Dry humor and gloom become social attunement: he reads morale by noticing what everyone refuses to say." },
  { name: "Gilly", house: "Free Folk", initials: "G", scores: { cognitive: 6, emotional: 8, compassionate: 9, syncretic: 7 }, note: "Trauma-aware and tender. Her empathy grows through safety, learning, and fierce protection." },
  { name: "Mance Rayder", house: "Free Folk", initials: "MR", scores: { cognitive: 9, emotional: 8, compassionate: 8, syncretic: 10 }, note: "Exceptional cultural empathy: he unites people by reading pride, fear, freedom, and survival across factions." },
  { name: "Osha", house: "Free Folk", initials: "O", scores: { cognitive: 7, emotional: 7, compassionate: 8, syncretic: 8 }, note: "Practical, alert, and protective. She reads danger through lived experience more than theory." },
  { name: "Hodor", house: "House Stark", initials: "H", scores: { cognitive: 3, emotional: 7, compassionate: 8, syncretic: 5 }, note: "Limited verbal expression, but strong loyalty and gentle responsiveness. A reminder that empathy is not only words." },
  { name: "Meera Reed", house: "House Reed", initials: "MR", scores: { cognitive: 7, emotional: 7, compassionate: 8, syncretic: 8 }, note: "Protective, observant, and grounded under uncanny pressure. She reads needs while moving." },
  { name: "Jojen Reed", house: "House Reed", initials: "JR", scores: { cognitive: 8, emotional: 5, compassionate: 6, syncretic: 9 }, note: "High symbolic pattern-reading, quieter emotional warmth. He sees paths more than ordinary moods." },
  { name: "Robert Baratheon", house: "House Baratheon", initials: "RB", scores: { cognitive: 5, emotional: 5, compassionate: 4, syncretic: 5 }, note: "Can read appetite, courage, and insult, but avoids deeper feeling. Charisma masks emotional neglect." },
  { name: "Stannis Baratheon", house: "House Baratheon", initials: "SB", scores: { cognitive: 8, emotional: 3, compassionate: 3, syncretic: 6 }, note: "Rigid cognitive empathy: understands duty and incentives, but struggles to metabolize tenderness." },
  { name: "Shireen Baratheon", house: "House Baratheon", initials: "SB", scores: { cognitive: 7, emotional: 9, compassionate: 10, syncretic: 7 }, note: "Gentle, curious, and deeply humane. One of the clearest compassionate empathy profiles." },
  { name: "Selyse Baratheon", house: "House Baratheon", initials: "SB", scores: { cognitive: 4, emotional: 4, compassionate: 2, syncretic: 5 }, note: "Her reads are filtered through shame, doctrine, and fear, narrowing compassion." },
  { name: "Renly Baratheon", house: "House Baratheon", initials: "RB", scores: { cognitive: 7, emotional: 7, compassionate: 5, syncretic: 8 }, note: "Charming and socially perceptive, good at mood and optics, less strong at sacrifice." },
  { name: "Loras Tyrell", house: "House Tyrell", initials: "LT", scores: { cognitive: 6, emotional: 7, compassionate: 6, syncretic: 7 }, note: "Sensitive and socially polished, but pride and romance can blur risk assessment." },
  { name: "Lysa Arryn", house: "House Arryn", initials: "LA", scores: { cognitive: 4, emotional: 8, compassionate: 3, syncretic: 4 }, note: "Emotionally intense but poorly regulated. Feeling is high; accurate interpretation is low." },
  { name: "Robin Arryn", house: "House Arryn", initials: "RA", scores: { cognitive: 3, emotional: 5, compassionate: 2, syncretic: 3 }, note: "Immaturity and insulation limit empathy. He reacts more than he reads." },
  { name: "Walder Frey", house: "House Frey", initials: "WF", scores: { cognitive: 8, emotional: 3, compassionate: 0, syncretic: 7 }, note: "Reads grievance, insult, and leverage well, with almost no generous interpretation." },
  { name: "Roose Bolton", house: "House Bolton", initials: "RB", scores: { cognitive: 9, emotional: 2, compassionate: 0, syncretic: 8 }, note: "Cold strategic empathy. He understands fear and advantage without warmth." },
  { name: "Talisa Stark", house: "House Stark", initials: "TS", scores: { cognitive: 7, emotional: 8, compassionate: 9, syncretic: 7 }, note: "Care-oriented and emotionally direct, with empathy expressed through practical healing." },
  { name: "Shae", house: "King's Landing", initials: "S", scores: { cognitive: 7, emotional: 8, compassionate: 5, syncretic: 7 }, note: "Reads affection, insecurity, and status pressure sharply, but hurt can turn understanding into retaliation." },
  { name: "Podrick Payne", house: "House Payne", initials: "PP", scores: { cognitive: 6, emotional: 8, compassionate: 9, syncretic: 7 }, note: "Quietly kind and responsive. He learns people through service, loyalty, and attention." },
  { name: "Gendry", house: "King's Landing", initials: "G", scores: { cognitive: 6, emotional: 7, compassionate: 7, syncretic: 6 }, note: "Plainspoken and decent, with growing ability to read class, danger, and affection." },
  { name: "Hot Pie", house: "Riverlands", initials: "HP", scores: { cognitive: 4, emotional: 7, compassionate: 7, syncretic: 5 }, note: "Simple, warm, and food-as-care oriented. Not a master strategist, but emotionally friendly." },
  { name: "Jaqen H'ghar", house: "Faceless Men", initials: "JH", scores: { cognitive: 9, emotional: 3, compassionate: 2, syncretic: 10 }, note: "An extreme syncretic reader of identity, timing, and role, with minimal ordinary attachment." },
  { name: "Syrio Forel", house: "Braavos", initials: "SF", scores: { cognitive: 8, emotional: 6, compassionate: 8, syncretic: 9 }, note: "Trains perception itself: seeing, timing, and disciplined response. A true read-the-room teacher." },
  { name: "Beric Dondarrion", house: "Brotherhood", initials: "BD", scores: { cognitive: 7, emotional: 7, compassionate: 8, syncretic: 8 }, note: "Compassion survives disillusionment. He reads purpose through suffering." },
  { name: "Thoros of Myr", house: "Brotherhood", initials: "TM", scores: { cognitive: 7, emotional: 7, compassionate: 7, syncretic: 8 }, note: "Warm, flawed, and spiritually attuned. His empathy is practical, earthy, and remorse-aware." },
  { name: "Grand Maester Pycelle", house: "Citadel", initials: "GP", scores: { cognitive: 7, emotional: 3, compassionate: 2, syncretic: 6 }, note: "Performs weakness while reading power. His empathy is mostly self-protective." },
  { name: "Qyburn", house: "Citadel", initials: "Q", scores: { cognitive: 9, emotional: 2, compassionate: 1, syncretic: 8 }, note: "Curious and perceptive, but empathy detaches from ethics. A cautionary intellect card." },
  { name: "High Sparrow", house: "Faith Militant", initials: "HS", scores: { cognitive: 8, emotional: 6, compassionate: 3, syncretic: 8 }, note: "Reads guilt, status, and hunger for meaning with eerie skill, then channels it into control." },
  { name: "Septa Unella", house: "Faith Militant", initials: "SU", scores: { cognitive: 5, emotional: 2, compassionate: 0, syncretic: 4 }, note: "Low empathic flexibility. She reads shame only as a tool of punishment." },
  { name: "Tommen Baratheon", house: "House Baratheon", initials: "TB", scores: { cognitive: 4, emotional: 8, compassionate: 7, syncretic: 4 }, note: "Kind and emotionally impressionable, but not strong enough at motive-reading to resist manipulation." },
  { name: "Myrcella Baratheon", house: "House Baratheon", initials: "MB", scores: { cognitive: 6, emotional: 8, compassionate: 8, syncretic: 6 }, note: "Gentle and emotionally receptive, with empathy shaped by innocence more than strategy." },
  { name: "Barristan Selmy", house: "Kingsguard", initials: "BS", scores: { cognitive: 8, emotional: 6, compassionate: 7, syncretic: 7 }, note: "Honor plus experience: he reads character through action, duty, and restraint." },
  { name: "Khal Drogo", house: "Dothraki", initials: "KD", scores: { cognitive: 5, emotional: 7, compassionate: 5, syncretic: 6 }, note: "Emotionally powerful within his own culture, less flexible across worlds until trust changes him." },
  { name: "Viserys Targaryen", house: "House Targaryen", initials: "VT", scores: { cognitive: 3, emotional: 4, compassionate: 0, syncretic: 2 }, note: "Entitlement blocks empathy. He reads status fantasies more than actual people." },
  { name: "Daario Naharis", house: "Second Sons", initials: "DN", scores: { cognitive: 7, emotional: 7, compassionate: 5, syncretic: 8 }, note: "Flirtatious, adaptive, and tactical. Reads desire and danger better than moral consequence." },
  { name: "Hizdahr zo Loraq", house: "Meereen", initials: "HL", scores: { cognitive: 8, emotional: 5, compassionate: 4, syncretic: 8 }, note: "Good cultural and political reader, but care is often tangled with preservation of class interests." },
  { name: "Euron Greyjoy", house: "House Greyjoy", initials: "EG", scores: { cognitive: 7, emotional: 2, compassionate: 0, syncretic: 7 }, note: "Chaotic but not clueless: reads spectacle, fear, and appetite, with little human care." },
  { name: "Balon Greyjoy", house: "House Greyjoy", initials: "BG", scores: { cognitive: 5, emotional: 3, compassionate: 1, syncretic: 5 }, note: "Rigid pride narrows his people-reading. He understands grievance more than relationship." },
  { name: "The Waif", house: "Faceless Men", initials: "W", scores: { cognitive: 8, emotional: 2, compassionate: 0, syncretic: 8 }, note: "Excellent at testing weakness and identity performance, with very low compassionate response." },
  { name: "Yoren", house: "Night's Watch", initials: "Y", scores: { cognitive: 7, emotional: 6, compassionate: 7, syncretic: 7 }, note: "Rough, practical protector. He reads danger on the road and knows when kindness must be disguised." },
  { name: "Maester Luwin", house: "Winterfell", initials: "ML", scores: { cognitive: 8, emotional: 8, compassionate: 9, syncretic: 8 }, note: "A steady caregiver profile: wise, emotionally warm, and attentive to children's needs." },
  { name: "Janos Slynt", house: "City Watch", initials: "JS", scores: { cognitive: 4, emotional: 2, compassionate: 0, syncretic: 3 }, note: "Poor empathy under pressure. Reads hierarchy enough to flatter upward, not enough to understand people." },
  { name: "Lancel Lannister", house: "House Lannister", initials: "LL", scores: { cognitive: 5, emotional: 6, compassionate: 4, syncretic: 5 }, note: "Guilt-sensitive and easily redirected. Empathy is unstable because identity is unstable." },
  { name: "Meryn Trant", house: "Kingsguard", initials: "MT", scores: { cognitive: 4, emotional: 1, compassionate: 0, syncretic: 3 }, note: "Low empathy and low restraint. A card for authority without attunement." },
  { name: "Mace Tyrell", house: "House Tyrell", initials: "MT", scores: { cognitive: 4, emotional: 6, compassionate: 5, syncretic: 5 }, note: "Often socially buoyant but not especially perceptive. He benefits from wiser readers around him." },
  { name: "Randyll Tarly", house: "House Tarly", initials: "RT", scores: { cognitive: 6, emotional: 2, compassionate: 1, syncretic: 5 }, note: "Rigid status-based reading. He understands discipline but discounts vulnerability." },
  { name: "Dickon Tarly", house: "House Tarly", initials: "DT", scores: { cognitive: 5, emotional: 6, compassionate: 5, syncretic: 5 }, note: "Decent but unformed, pulled by family loyalty and martial identity." },
  { name: "Blackfish Tully", house: "House Tully", initials: "BT", scores: { cognitive: 8, emotional: 6, compassionate: 6, syncretic: 8 }, note: "Hard-headed but perceptive. Reads honor, siege pressure, and family politics with veteran clarity." },
  { name: "Edmure Tully", house: "House Tully", initials: "ET", scores: { cognitive: 5, emotional: 7, compassionate: 6, syncretic: 5 }, note: "Emotionally earnest and often well-meaning, but his situational read lags behind his intent." },
  { name: "Ros", house: "King's Landing", initials: "R", scores: { cognitive: 8, emotional: 7, compassionate: 6, syncretic: 8 }, note: "A strong reader of power, danger, and hidden desire because survival requires social precision." },
  { name: "Irri", house: "Dothraki", initials: "I", scores: { cognitive: 5, emotional: 7, compassionate: 7, syncretic: 6 }, note: "Attuned through service, culture, and proximity. Her empathy is quiet and relational." },
  { name: "Doreah", house: "Essos", initials: "D", scores: { cognitive: 7, emotional: 7, compassionate: 4, syncretic: 7 }, note: "Socially perceptive and intimate-reader skilled, though self-preservation shifts her loyalties." },
  { name: "Xaro Xhoan Daxos", house: "Qarth", initials: "XD", scores: { cognitive: 8, emotional: 4, compassionate: 1, syncretic: 8 }, note: "Reads longing and spectacle expertly, but empathy is transactional." },
  { name: "The Spice King", house: "Qarth", initials: "SK", scores: { cognitive: 7, emotional: 3, compassionate: 1, syncretic: 6 }, note: "Good at commercial caution, low in emotional generosity." },
  { name: "Mirri Maz Duur", house: "Lhazareen", initials: "MM", scores: { cognitive: 8, emotional: 8, compassionate: 4, syncretic: 8 }, note: "Reads grief, violence, and power from the harmed side. Compassion is complicated by revenge." },
  { name: "Brother Ray", house: "Riverlands", initials: "BR", scores: { cognitive: 7, emotional: 8, compassionate: 9, syncretic: 8 }, note: "A restorative empathy card: sees trauma, guilt, and the possibility of gentler identity." },
  { name: "Myranda", house: "House Bolton", initials: "M", scores: { cognitive: 6, emotional: 3, compassionate: 0, syncretic: 5 }, note: "Reads fear and jealousy, but care is almost entirely absent." },
  { name: "Harrenhal Polliver", house: "Lannister Men", initials: "P", scores: { cognitive: 4, emotional: 1, compassionate: 0, syncretic: 3 }, note: "A low-empathy intimidation card: understands power only as threat." },
  { name: "Illyrio Mopatis", house: "Pentos", initials: "IM", scores: { cognitive: 8, emotional: 4, compassionate: 2, syncretic: 8 }, note: "Reads ambition, exile, and opportunity like a broker. Warmth is difficult to separate from agenda." }
];

let currentMode = "cognitive";
let scenarioIndex = 0;
let roomIndex = 0;
let characterFilter = "all";
let characterSearch = "";

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function escapeXml(value) {
  return escapeHtml(value);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function activeAccess() {
  const access = loadJson(empathyLabAccessKey, null);
  if (!access) return null;
  if (access.expiresAt && Number(access.expiresAt) < Date.now()) return null;
  return access;
}

function hasAccess() {
  return Boolean(activeAccess());
}

function setStatus(message) {
  const status = $("#empathy-lab-status");
  if (status) status.textContent = message;
}

function updateGate() {
  const access = activeAccess();
  $$("[data-premium-required]").forEach((section) => {
    section.classList.toggle("premium-locked", !access);
    section.querySelectorAll("input, textarea, select, button").forEach((control) => {
      control.disabled = !access;
    });
  });
  if (!access) {
    setStatus("Premium unlocks the interactive tools below.");
    return;
  }
  const date = access.expiresAt ? new Date(access.expiresAt).toLocaleDateString() : "";
  setStatus(`Empathy Lab Premium active${access.email ? ` for ${access.email}` : ""}${date ? ` until ${date}` : ""}.`);
  const checkout = $("#empathy-lab-checkout-button");
  if (checkout) {
    checkout.textContent = "Premium active";
    checkout.disabled = true;
  }
}

async function redeemCoupon() {
  const email = normalizeEmail($("#empathy-lab-email")?.value);
  const code = String($("#empathy-lab-coupon")?.value || "").trim().toUpperCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid billing email.");
  if (!code) throw new Error("Enter an Empathy Lab premium coupon code.");
  const button = $("#empathy-lab-coupon-button");
  button.disabled = true;
  setStatus("Checking Empathy Lab coupon...");
  try {
    const response = await fetch("/api/empathy-lab/redeem-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email, product: empathyLabProduct })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || "Coupon could not be redeemed.");
    saveJson(empathyLabAccessKey, {
      source: data.source || "admin_coupon",
      product: data.product || empathyLabProduct,
      planId: data.planId || empathyLabPlanId,
      email: data.email || email,
      couponHash: data.couponHash,
      redeemedAt: data.redeemedAt || Date.now(),
      expiresAt: data.expiresAt,
      accessDays: data.accessDays,
      price: "Coupon"
    });
    $("#empathy-lab-coupon").value = "";
    updateGate();
  } finally {
    button.disabled = false;
  }
}

async function ensureRazorpayLoaded() {
  if (typeof Razorpay !== "undefined") return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(typeof Razorpay !== "undefined");
    script.onerror = () => resolve(false);
    document.head.append(script);
    window.setTimeout(() => resolve(typeof Razorpay !== "undefined"), 7000);
  });
}

async function startCheckout() {
  if (location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    throw new Error("Open the live site to use Razorpay Checkout.");
  }
  const email = normalizeEmail($("#empathy-lab-email")?.value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid billing email.");
  const ready = await ensureRazorpayLoaded();
  if (!ready) throw new Error("Razorpay Checkout could not load.");
  const button = $("#empathy-lab-checkout-button");
  button.disabled = true;
  setStatus("Opening secure Razorpay checkout...");
  try {
    const orderResponse = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: empathyLabPlanId, product: empathyLabProduct, email, amountUsd: 1000 })
    });
    const checkout = await orderResponse.json().catch(() => ({}));
    if (!orderResponse.ok) throw new Error(checkout.error || "Could not create checkout.");
    const rz = new Razorpay({
      key: checkout.keyId,
      name: "Sucha™ Wellness",
      description: "Empathy Lab Premium - $1000/year",
      amount: checkout.amount,
      currency: checkout.currency || "USD",
      order_id: checkout.orderId,
      prefill: { email },
      theme: { color: "#2f7d70" },
      handler: async (response) => {
        const verifyResponse = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: empathyLabPlanId,
            product: empathyLabProduct,
            email,
            checkoutMode: checkout.mode || "order",
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });
        const verified = await verifyResponse.json().catch(() => ({}));
        if (!verifyResponse.ok || verified.ok === false) throw new Error(verified.error || "Payment verification failed.");
        saveJson(empathyLabAccessKey, {
          source: verified.source || "razorpay_order",
          product: verified.product || empathyLabProduct,
          planId: verified.planId || empathyLabPlanId,
          email: verified.email || email,
          paymentId: verified.razorpayPaymentId || response.razorpay_payment_id,
          orderId: verified.razorpayOrderId || response.razorpay_order_id,
          purchasedAt: verified.purchasedAt || Date.now(),
          expiresAt: verified.expiresAt || checkout.expiresAt,
          guaranteeEndsAt: verified.guaranteeEndsAt || checkout.guaranteeEndsAt,
          price: verified.price || "$1000/year"
        });
        updateGate();
      },
      modal: { ondismiss: () => { button.disabled = false; updateGate(); } }
    });
    rz.on("payment.failed", (event) => {
      button.disabled = false;
      setStatus(`Razorpay payment failed: ${event.error?.description || "Try again."}`);
    });
    rz.open();
  } catch (error) {
    button.disabled = false;
    throw error;
  }
}

function renderScenario() {
  const scenario = scenarios[scenarioIndex % scenarios.length];
  const mode = modes[currentMode];
  $("#mode-label").textContent = mode.label;
  $("#scenario-title").textContent = scenario.title;
  $("#scenario-text").textContent = scenario.text;
  $("#lens-grid").innerHTML = mode.lenses.map(([title, copy]) => `
    <article class="lens-card"><b>${title}</b><span>${copy}</span></article>
  `).join("");
  $("#practice-result").textContent = "Write your read, then score it.";
}

function revealModelRead() {
  const scenario = scenarios[scenarioIndex % scenarios.length];
  $("#practice-result").innerHTML = `<strong>Model ${modes[currentMode].label.toLowerCase()} read:</strong> ${escapeHtml(scenario.model[currentMode])}`;
}

function scorePractice() {
  const first = $("#first-read").value.trim();
  const alternatives = $("#alt-reads").value.trim();
  const question = $("#check-question").value.trim();
  const altCount = alternatives.split(/\n+/).filter(Boolean).length;
  let score = 0;
  if (first.length > 12) score += 1;
  if (altCount >= 2) score += 2;
  if (/\?|wonder|might|could|maybe|may be|possible/i.test(question)) score += 2;
  if (/\b(always|never|obvious|clearly|definitely|they are|he is|she is)\b/i.test(first)) score -= 1;
  score = Math.max(0, Math.min(5, score));
  const message = score >= 4
    ? "Strong practice. You created alternatives and used a check-it question instead of certainty."
    : score >= 2
      ? "Good start. Add more alternative hypotheses and make your checking question gentler."
      : "Slow down the first read. Separate facts from assumptions, then create at least three possibilities.";
  const progress = loadJson(empathyLabProgressKey, []);
  progress.push({ mode: currentMode, score, createdAt: new Date().toISOString() });
  saveJson(empathyLabProgressKey, progress.slice(-100));
  $("#practice-result").innerHTML = `<strong>Practice score: ${score}/5.</strong> ${message}`;
}

function renderRoom() {
  const room = roomScenarios[roomIndex % roomScenarios.length];
  $("#room-scenario").textContent = room.text;
  const cues = ["words", "tone", "timing", "mismatch", "context", "power", "need", "check"];
  $("#cue-options").innerHTML = cues.map((cue) => (
    `<button class="choice" type="button" data-cue="${cue}">${cue[0].toUpperCase()}${cue.slice(1)}</button>`
  )).join("");
  $$(".cue-pill").forEach((pill) => pill.classList.remove("active"));
  $("#cue-result").textContent = "Select the cues you would pay attention to.";
}

function checkCues() {
  const room = roomScenarios[roomIndex % roomScenarios.length];
  const selected = $$("[data-cue].selected").map((button) => button.dataset.cue);
  const hits = selected.filter((cue) => room.cues.includes(cue)).length;
  const misses = room.cues.filter((cue) => !selected.includes(cue));
  $$(".cue-pill").forEach((pill) => {
    pill.classList.toggle("active", room.cues.includes(pill.dataset.cuePill));
  });
  $("#cue-result").innerHTML = `<strong>${hits}/${room.cues.length} key cues noticed.</strong> ${escapeHtml(room.explanation)} ${misses.length ? `Also look for: ${misses.join(", ")}.` : "You caught the main cue pattern."}`;
}

function scoreText(text) {
  const fields = {
    cognitive: ["think", "assume", "believe", "expect", "mean", "intend", "because", "maybe", "might", "possible"],
    emotional: ["feel", "hurt", "sad", "angry", "anxious", "afraid", "shame", "guilt", "tired", "overwhelmed"],
    compassionate: ["help", "support", "need", "care", "offer", "ask", "boundary", "space", "safe", "next step"],
    synchrony: ["tone", "timing", "pause", "silence", "eye", "body", "fast", "slow", "short", "mismatch"]
  };
  const lower = text.toLowerCase();
  return Object.fromEntries(Object.entries(fields).map(([key, words]) => [
    key,
    words.reduce((sum, word) => sum + (lower.match(new RegExp(`\\b${word}\\b`, "g"))?.length || 0), 0)
  ]));
}

function analyzeRealSituation() {
  const text = $("#real-text").value.trim();
  const scores = scoreText(text);
  const max = Math.max(1, ...Object.values(scores));
  Object.entries(scores).forEach(([key, value]) => {
    $(`#score-${key}`).textContent = value;
    $(`#meter-${key}`).style.width = `${Math.round((value / max) * 100)}%`;
  });
  const hasCertainty = /\b(always|never|obvious|clearly|definitely|I know they|they just)\b/i.test(text);
  const hasMismatch = /\b(but|however|although|tone|silence|paused|looked away|short reply)\b/i.test(text);
  const likelyFocus = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || "cognitive";
  const check = hasMismatch
    ? "I may be reading this wrong, but I noticed the words and tone did not fully match. Is there something you are hesitant about?"
    : "I may be wrong, but I want to understand your side better. What is most important for you here?";
  $("#real-result").innerHTML = `
    <p><strong>Likely training focus:</strong> ${modes[likelyFocus].label}.</p>
    <p><strong>Reading risk:</strong> ${hasCertainty ? "Your wording contains high-certainty assumptions. Convert them into hypotheses before responding." : "Your read leaves room for uncertainty, which is good empathy practice."}</p>
    <p><strong>Cue note:</strong> ${hasMismatch ? "There may be a mismatch cue. Notice tone/timing alongside the words." : "Add more context, tone, timing, or body cues for a stronger read."}</p>
    <p><strong>Check-it response:</strong> ${check}</p>
  `;
}

function dominantComponent(character) {
  return Object.entries(character.scores).sort((a, b) => b[1] - a[1])[0][0];
}

const portraitTraits = {
  "Tyrion Lannister": { hair: "#c99a54", skin: "#d8a477", cloak: "#6b1f25", symbol: "goblet", stature: "compact", scar: true },
  "Daenerys Targaryen": { hair: "#f3ead1", skin: "#ecd0ad", cloak: "#f4efe4", symbol: "dragon", longHair: true, crown: true, braid: true },
  "Jon Snow": { hair: "#151516", skin: "#d2a17d", cloak: "#202729", symbol: "snow", beard: true, fur: true },
  "Arya Stark": { hair: "#30231f", skin: "#d6a17e", cloak: "#33423f", symbol: "needle", shortHair: true, scar: true },
  "Sansa Stark": { hair: "#b95f3b", skin: "#e0ad86", cloak: "#33485b", symbol: "wolf", longHair: true, braid: true },
  "Bran Stark": { hair: "#4a2e24", skin: "#d6a47e", cloak: "#263a45", symbol: "raven", shortHair: true },
  "Catelyn Stark": { hair: "#9b4e36", skin: "#dfad88", cloak: "#3b4d5e", symbol: "river", longHair: true },
  "Ned Stark": { hair: "#3a3029", skin: "#c99675", cloak: "#263030", symbol: "ice", beard: true, fur: true },
  "Cersei Lannister": { hair: "#e1c06b", skin: "#e4b78f", cloak: "#8a2627", symbol: "lion", longHair: true, crown: true },
  "Jaime Lannister": { hair: "#d8b466", skin: "#ddb184", cloak: "#87302f", symbol: "goldhand", beard: true },
  "Tywin Lannister": { hair: "#c7c2b5", skin: "#c99675", cloak: "#4b1f24", symbol: "lion", beard: true, armor: true },
  "Varys": { hair: "#d6c6aa", skin: "#d5a37c", cloak: "#604b78", symbol: "scroll" },
  "Petyr Baelish": { hair: "#3b2b26", skin: "#d09a76", cloak: "#2d3545", symbol: "dagger", beard: true },
  "Brienne of Tarth": { hair: "#d9b66c", skin: "#dca984", cloak: "#4d5966", symbol: "sword", shortHair: true, armor: true, scar: true },
  "Samwell Tarly": { hair: "#4a3229", skin: "#dca982", cloak: "#2d3e38", symbol: "book", shortHair: true },
  "Margaery Tyrell": { hair: "#b78343", skin: "#e2b389", cloak: "#2f6d53", symbol: "rose", longHair: true, crown: true },
  "Olenna Tyrell": { hair: "#d8d1c5", skin: "#d5a882", cloak: "#536d40", symbol: "rose", crown: true },
  "Theon Greyjoy": { hair: "#3a2723", skin: "#c58d6c", cloak: "#303b43", symbol: "kraken", beard: true, scar: true },
  "Yara Greyjoy": { hair: "#2b2422", skin: "#c58f6d", cloak: "#2d3c46", symbol: "kraken", shortHair: true },
  "Davos Seaworth": { hair: "#5a4537", skin: "#c99270", cloak: "#384845", symbol: "onion", beard: true },
  "Melisandre": { hair: "#9d2e2b", skin: "#e0a27d", cloak: "#8b1f27", symbol: "flame", longHair: true, jewel: true },
  "Jorah Mormont": { hair: "#c1b7a0", skin: "#c99674", cloak: "#4d5148", symbol: "bear", beard: true, armor: true },
  "Sandor Clegane": { hair: "#2b211e", skin: "#bd8466", cloak: "#2f3537", symbol: "hound", beard: true, scar: true },
  "Bronn": { hair: "#3b2a22", skin: "#c98f68", cloak: "#3d3c30", symbol: "coin", beard: true },
  "Missandei": { hair: "#171312", skin: "#8f5f47", cloak: "#6b556f", symbol: "waves", longHair: true },
  "Grey Worm": { hair: "#1d1715", skin: "#7a4f3c", cloak: "#3e4650", symbol: "spear", armor: true },
  "Tormund Giantsbane": { hair: "#c45c32", skin: "#d19a75", cloak: "#6a3b2d", symbol: "horn", beard: true, fur: true },
  "Ygritte": { hair: "#b94f32", skin: "#d69a72", cloak: "#5a3c33", symbol: "bow", longHair: true, fur: true },
  "Oberyn Martell": { hair: "#2e211e", skin: "#b77b5a", cloak: "#a46a25", symbol: "sun", beard: true },
  "Ellaria Sand": { hair: "#2a1d1a", skin: "#ad7455", cloak: "#9c6235", symbol: "sun", longHair: true },
  "Ramsay Bolton": { hair: "#241f1d", skin: "#c99573", cloak: "#3a2d32", symbol: "blade", shortHair: true, scar: true },
  "Joffrey Baratheon": { hair: "#e0bc63", skin: "#e2ad82", cloak: "#8b2530", symbol: "stag", crown: true }
};

function portraitForCharacter(character, index, palette) {
  const hairColors = ["#211815", "#4b3026", "#d7b76f", "#e8d7b0", "#161616", "#8b5a37", "#c9c9c2", "#6e4a35"];
  const skinColors = ["#d7a47b", "#c58f69", "#e2b890", "#b98261", "#f0c9a1", "#a66f55"];
  const cloakColors = ["#1f3f38", "#5a2f34", "#243752", "#6b5529", "#3e354e", "#26323c", "#783b32", "#425449"];
  const traits = portraitTraits[character.name] || {};
  const hair = traits.hair || hairColors[index % hairColors.length];
  const skin = traits.skin || skinColors[(index + character.name.length) % skinColors.length];
  const cloak = traits.cloak || cloakColors[(index + character.house.length) % cloakColors.length];
  const longHair = traits.longHair ?? /Daenerys|Sansa|Cersei|Catelyn|Margaery|Olenna|Melisandre|Missandei|Ygritte|Ellaria|Arya|Yara/.test(character.name);
  const shortHair = traits.shortHair;
  const beard = traits.beard ?? /Jon|Ned|Tywin|Davos|Jorah|Sandor|Bronn|Tormund|Oberyn|Ramsay/.test(character.name);
  const crown = traits.crown ?? /Daenerys|Cersei|Joffrey|Margaery/.test(character.name);
  const scar = traits.scar ?? /Tyrion|Sandor|Theon|Arya|Brienne/.test(character.name);
  const sigil = traits.symbol || (character.house.includes("Stark") ? "wolf"
    : character.house.includes("Lannister") ? "lion"
      : character.house.includes("Targaryen") ? "dragon"
        : character.house.includes("Tyrell") ? "rose"
          : character.house.includes("Greyjoy") ? "kraken"
            : character.house.includes("Martell") || character.house.includes("Dorne") ? "sun"
              : character.house.includes("Bolton") ? "blade"
                : "star");
  const motif = {
    wolf: `<path d="M60 62l18 14 18-14 10 38-28 24-28-24z" fill="rgba(255,255,255,.18)"/>`,
    lion: `<circle cx="78" cy="88" r="32" fill="rgba(255,255,255,.16)"/><path d="M62 78h34l-7 32H69z" fill="rgba(255,255,255,.18)"/>`,
    dragon: `<path d="M48 98c22-54 64-32 70-4-22-8-34 6-45 24-4-18-14-24-25-20z" fill="rgba(255,255,255,.18)"/>`,
    rose: `<g fill="rgba(255,255,255,.18)"><circle cx="78" cy="88" r="12"/><circle cx="62" cy="88" r="12"/><circle cx="94" cy="88" r="12"/><circle cx="78" cy="72" r="12"/><circle cx="78" cy="104" r="12"/></g>`,
    kraken: `<path d="M78 56c23 22 23 48 0 78-23-30-23-56 0-78zm-28 36c-16 2-24 10-30 24m86-24c16 2 24 10 30 24" stroke="rgba(255,255,255,.2)" stroke-width="10" fill="none" stroke-linecap="round"/>`,
    sun: `<circle cx="78" cy="88" r="18" fill="rgba(255,255,255,.18)"/><path d="M78 48v20M78 108v20M38 88h20M98 88h20M50 60l14 14M92 102l14 14M106 60L92 74M64 102l-14 14" stroke="rgba(255,255,255,.2)" stroke-width="8" stroke-linecap="round"/>`,
    blade: `<path d="M76 42l9 72-9 24-9-24z" fill="rgba(255,255,255,.2)"/>`,
    star: `<path d="M78 48l12 28 30 2-23 19 7 30-26-16-26 16 7-30-23-19 30-2z" fill="rgba(255,255,255,.16)"/>`,
    goblet: `<path d="M58 58h42c0 28-8 42-18 48v20h18v10H58v-10h18v-20C66 100 58 86 58 58z" fill="rgba(255,255,255,.2)"/>`,
    snow: `<path d="M78 48v82M42 68l72 42M114 68l-72 42" stroke="rgba(255,255,255,.28)" stroke-width="8" stroke-linecap="round"/>`,
    needle: `<path d="M78 42l5 92h-10z" fill="rgba(255,255,255,.24)"/><circle cx="78" cy="132" r="9" fill="rgba(255,255,255,.18)"/>`,
    raven: `<path d="M42 96c28-42 60-42 82 0-30-16-54-16-82 0zM76 68l12 40-24-2z" fill="rgba(255,255,255,.18)"/>`,
    river: `<path d="M30 84c18-16 34-16 52 0s34 16 52 0M30 112c18-16 34-16 52 0s34 16 52 0" stroke="rgba(255,255,255,.22)" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    ice: `<path d="M78 38l16 40-16 64-16-64z" fill="rgba(255,255,255,.22)"/>`,
    goldhand: `<path d="M68 54h20v44h12v24H56V98h12z" fill="rgba(255,255,255,.24)"/>`,
    scroll: `<path d="M48 58h60v66H48z" fill="rgba(255,255,255,.18)"/><path d="M58 78h40M58 96h32" stroke="rgba(255,255,255,.3)" stroke-width="5" stroke-linecap="round"/>`,
    dagger: `<path d="M78 42l8 70-8 24-8-24zM58 116h40" stroke="rgba(255,255,255,.24)" stroke-width="9" stroke-linecap="round" fill="none"/>`,
    sword: `<path d="M78 34l7 100h-14zM54 112h48" stroke="rgba(255,255,255,.25)" stroke-width="9" stroke-linecap="round" fill="none"/>`,
    book: `<path d="M36 66c20-8 34-6 42 4 8-10 22-12 42-4v66c-20-8-34-6-42 4-8-10-22-12-42-4z" fill="rgba(255,255,255,.18)"/>`,
    onion: `<path d="M78 48c22 18 28 40 18 70-8 20-28 20-36 0-10-30-4-52 18-70z" fill="rgba(255,255,255,.2)"/>`,
    flame: `<path d="M78 136c-34-30-12-52-4-70 6 20 24 24 14 0 34 36 22 62-10 70z" fill="rgba(255,255,255,.23)"/>`,
    bear: `<circle cx="78" cy="92" r="32" fill="rgba(255,255,255,.16)"/><circle cx="52" cy="66" r="13" fill="rgba(255,255,255,.16)"/><circle cx="104" cy="66" r="13" fill="rgba(255,255,255,.16)"/>`,
    hound: `<path d="M52 66l26-16 26 16 12 46-38 22-38-22z" fill="rgba(255,255,255,.17)"/>`,
    coin: `<circle cx="78" cy="88" r="34" fill="rgba(255,255,255,.18)"/><text x="78" y="102" text-anchor="middle" font-family="Georgia,serif" font-size="42" fill="rgba(255,255,255,.24)">$</text>`,
    waves: `<path d="M28 86c18-14 32-14 48 0s30 14 48 0M28 114c18-14 32-14 48 0s30 14 48 0" stroke="rgba(255,255,255,.24)" stroke-width="9" fill="none" stroke-linecap="round"/>`,
    spear: `<path d="M78 34l6 104h-12zM66 52l12-18 12 18" fill="rgba(255,255,255,.24)"/>`,
    horn: `<path d="M44 88c22-36 52-42 86-16-32 6-48 22-58 50z" fill="rgba(255,255,255,.18)"/>`,
    bow: `<path d="M52 42c42 40 42 68 0 108M52 42c18 34 18 74 0 108" stroke="rgba(255,255,255,.24)" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    stag: `<path d="M78 78c20-26 36-28 52-20-18 12-26 26-28 42l-24 34-24-34c-2-16-10-30-28-42 16-8 32-6 52 20z" fill="rgba(255,255,255,.18)"/>`
  }[sigil];
  const hairShape = longHair
    ? `<path d="M78 156c0-72 38-106 84-106s82 34 82 106c0 62-20 108-42 136H120c-24-34-42-76-42-136z" fill="${hair}"/>`
    : shortHair
      ? `<path d="M92 126c12-46 44-68 70-68s56 18 66 62c-42-22-86-20-136 6z" fill="${hair}"/>`
      : `<path d="M88 132c12-56 45-82 74-82 46 0 76 30 78 84-40-24-92-26-152-2z" fill="${hair}"/>`;
  const accessory = [
    traits.fur ? `<path d="M54 316c28-34 64-50 106-50s78 16 106 50c-44-16-80-18-106-8-26-10-62-8-106 8z" fill="rgba(236,232,219,.64)"/>` : "",
    traits.armor ? `<path d="M92 326h136l-24 64H116z" fill="rgba(210,214,214,.34)"/><path d="M112 332h96M122 354h76" stroke="rgba(255,255,255,.34)" stroke-width="5" stroke-linecap="round"/>` : "",
    traits.braid ? `<path d="M114 120c24 40 24 110-4 174M210 120c-24 40-24 110 4 174" stroke="rgba(255,255,255,.2)" stroke-width="8" stroke-linecap="round"/>` : "",
    traits.jewel ? `<circle cx="162" cy="304" r="11" fill="#b82b35" stroke="#f1c76d" stroke-width="4"/>` : ""
  ].join("");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 400" role="img" aria-label="Stylized fantasy portrait of ${escapeXml(character.name)}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="${palette[0]}" offset="0"/>
      <stop stop-color="${palette[1]}" offset="1"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="26%" r="68%">
      <stop stop-color="rgba(255,255,255,.72)" offset="0"/>
      <stop stop-color="rgba(255,255,255,0)" offset="1"/>
    </radialGradient>
  </defs>
  <rect width="320" height="400" rx="10" fill="url(#bg)"/>
  <rect width="320" height="400" fill="url(#glow)"/>
  <g transform="translate(4 8) scale(1.45)">${motif}</g>
  <circle cx="58" cy="54" r="2" fill="rgba(255,255,255,.42)"/><circle cx="263" cy="82" r="2.4" fill="rgba(255,255,255,.32)"/><circle cx="246" cy="36" r="1.8" fill="rgba(255,255,255,.35)"/>
  <path d="M50 382c16-84 64-126 110-126s94 42 110 126z" fill="${cloak}"/>
  <path d="M86 392c18-72 46-102 74-102s56 30 74 102z" fill="rgba(255,253,246,.18)"/>
  ${hairShape}
  <path d="M104 150c0-46 24-78 58-78s58 32 58 78v44c0 42-26 78-58 78s-58-36-58-78z" fill="${skin}"/>
  <path d="M112 150c20-34 54-45 104-28 0-40-25-68-58-68-35 0-58 29-58 72 0 8 4 17 12 24z" fill="${hair}"/>
  ${longHair ? `<path d="M88 150c-20 68-14 124 28 168-14-60-6-114 14-162zM234 150c20 68 14 124-28 168 14-60 6-114-14-162z" fill="${hair}"/>` : ""}
  ${accessory}
  <ellipse cx="137" cy="171" rx="8" ry="5" fill="#241f1d"/>
  <ellipse cx="184" cy="171" rx="8" ry="5" fill="#241f1d"/>
  <path d="M145 207c12 8 24 8 36 0" stroke="#6f4435" stroke-width="5" stroke-linecap="round" fill="none"/>
  <path d="M160 178l-7 22 12 2" stroke="#855d48" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  ${beard ? `<path d="M117 207c14 42 72 42 88 0-12 60-78 68-88 0z" fill="${hair}" opacity=".72"/>` : ""}
  ${scar ? `<path d="M199 138l-24 60" stroke="#8c4a43" stroke-width="5" stroke-linecap="round" opacity=".8"/>` : ""}
  ${crown ? `<path d="M112 78l22 20 27-28 27 28 22-20 4 36H108z" fill="#d7b66e" stroke="rgba(70,47,18,.35)" stroke-width="3"/>` : ""}
  <path d="M86 336c24-26 48-38 74-38s50 12 74 38" stroke="rgba(255,253,246,.34)" stroke-width="10" stroke-linecap="round" fill="none"/>
  <text x="160" y="366" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="rgba(255,253,246,.9)" opacity=".92">${escapeXml(character.initials)}</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderCharacters() {
  const grid = $("#character-grid");
  if (!grid) return;
  const byComponent = characterFilter === "all"
    ? throneCharacters
    : throneCharacters.filter((character) => dominantComponent(character) === characterFilter);
  const query = characterSearch.trim().toLowerCase();
  const filtered = query
    ? byComponent.filter((character) => {
      const dominant = dominantComponent(character);
      const haystack = [
        character.name,
        character.house,
        character.initials,
        dominant,
        character.note,
        Object.entries(character.scores).map(([key, value]) => `${key} ${value}`).join(" ")
      ].join(" ").toLowerCase();
      return haystack.includes(query);
    })
    : byComponent;
  $("#character-count").textContent = `${filtered.length} character${filtered.length === 1 ? "" : "s"} shown`;
  const searchButton = $("#character-search-button");
  if (searchButton) {
    searchButton.textContent = query ? "Clear" : "Search";
    searchButton.dataset.mode = query ? "clear" : "search";
  }
  grid.innerHTML = filtered.map((character, index) => {
    const palette = characterPalette[index % characterPalette.length];
    const dominant = dominantComponent(character);
    const portrait = portraitForCharacter(character, index, palette);
    const scores = [
      ["Cognitive", "cognitive", "#2f7d70"],
      ["Emotional", "emotional", "#d98f83"],
      ["Compassionate", "compassionate", "#c79a4b"],
      ["Syncretic", "syncretic", "#526f8f"]
    ].map(([label, key, color]) => `
      <div class="mini-score">
        <span>${label}</span>
        <div class="mini-meter"><i style="--score-color:${color};--score-width:${character.scores[key] * 10}%"></i></div>
        <b>${character.scores[key]}</b>
      </div>
    `).join("");
    return `
      <button class="character-card ${dominant === "syncretic" ? "featured" : ""}" type="button" data-character="${escapeHtml(character.name)}" style="--portrait-a:${palette[0]};--portrait-b:${palette[1]}">
        <img class="character-photo" src="${portrait}" alt="Stylized fantasy portrait of ${escapeHtml(character.name)}" loading="lazy">
        <h3>${escapeHtml(character.name)}</h3>
        <div class="character-house">${escapeHtml(character.house)} · ${dominant}</div>
        <div class="character-scores">${scores}</div>
        <p class="character-note">${escapeHtml(character.note)}</p>
      </button>
    `;
  }).join("");
  if (!filtered.length) {
    grid.innerHTML = `<article class="panel"><h3>No match yet</h3><p class="section-copy">Try another name, house, cue, or empathy component.</p></article>`;
  }
}

function showCharacterDetail(name) {
  const character = throneCharacters.find((item) => item.name === name);
  if (!character) return;
  const dominant = dominantComponent(character);
  const strongest = dominant === "syncretic"
    ? "syncretic attunement: pattern, timing, culture, power, and body-level context"
    : `${dominant} empathy`;
  $("#character-detail").innerHTML = `
    <strong>${escapeHtml(character.name)}:</strong>
    strongest in ${escapeHtml(strongest)}.
    Cognitive ${character.scores.cognitive}/10, emotional ${character.scores.emotional}/10,
    compassionate ${character.scores.compassionate}/10, syncretic ${character.scores.syncretic}/10.
    ${escapeHtml(character.note)}
  `;
}

function boot() {
  updateGate();
  renderScenario();
  renderRoom();
  renderCharacters();

  $$(".tool-tab").forEach((button) => button.addEventListener("click", () => {
    currentMode = button.dataset.mode;
    $$(".tool-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
    renderScenario();
  }));
  $("#next-scenario").addEventListener("click", () => {
    scenarioIndex += 1;
    renderScenario();
  });
  $("#reveal-model").addEventListener("click", revealModelRead);
  $("#score-practice").addEventListener("click", scorePractice);
  $("#cue-options").addEventListener("click", (event) => {
    const button = event.target.closest("[data-cue]");
    if (button) button.classList.toggle("selected");
  });
  $("#check-cues").addEventListener("click", checkCues);
  $("#next-room").addEventListener("click", () => {
    roomIndex += 1;
    renderRoom();
  });
  $("#analyze-real").addEventListener("click", analyzeRealSituation);
  $$(".character-tab").forEach((button) => button.addEventListener("click", () => {
    characterFilter = button.dataset.characterFilter;
    $$(".character-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
    renderCharacters();
    $("#character-detail").textContent = "Choose a character card to see the empathy read.";
  }));
  $("#character-search").addEventListener("input", (event) => {
    characterSearch = event.target.value;
    renderCharacters();
  });
  $("#character-search").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      characterSearch = event.currentTarget.value;
      renderCharacters();
    }
  });
  $("#character-search-button").addEventListener("click", () => {
    const input = $("#character-search");
    if (characterSearch.trim()) {
      characterSearch = "";
      input.value = "";
    } else {
      characterSearch = input.value;
    }
    renderCharacters();
    $("#character-detail").textContent = "Choose a character card to see the empathy read.";
  });
  $("#character-grid").addEventListener("click", (event) => {
    const card = event.target.closest("[data-character]");
    if (card) showCharacterDetail(card.dataset.character);
  });
  $("#empathy-lab-coupon-button").addEventListener("click", () => {
    redeemCoupon().catch((error) => setStatus(error.message || "Coupon could not be redeemed."));
  });
  $("#empathy-lab-checkout-button").addEventListener("click", () => {
    startCheckout().catch((error) => setStatus(error.message || "Could not start checkout."));
  });
}

document.addEventListener("DOMContentLoaded", boot);
