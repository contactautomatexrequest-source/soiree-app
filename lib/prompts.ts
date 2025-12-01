// Prompts métier-spécifiques pour générer les réponses aux avis
// Système optimisé pour des réponses contextuelles, humaines et non répétitives

// Variations d'ouvertures pour éviter la répétition
const OPENING_VARIATIONS = [
  "Bonjour",
  "Bonjour et merci",
  "Merci",
  "Merci beaucoup",
  "Bonjour, merci",
  "Nous vous remercions",
  "Un grand merci",
  "Merci infiniment",
];

// Variations de clôtures
const CLOSING_VARIATIONS = [
  "Au plaisir de vous revoir",
  "À très bientôt",
  "Nous espérons vous revoir",
  "Au plaisir de vous accueillir à nouveau",
  "Nous serons ravis de vous revoir",
  "En espérant vous revoir bientôt",
  "Nous vous attendons avec plaisir",
  "À bientôt",
];

// Instructions selon la note
function getNoteInstructions(note: number | null | undefined): string {
  if (!note) {
    return `Analyse d'abord le texte de l'avis pour déterminer si l'avis est positif, neutre ou négatif.
    Adapte ensuite ton ton en conséquence.`;
  }

  switch (note) {
    case 5:
      return `L'avis est EXCELLENT (5 étoiles). 
      - Utilise un ton chaleureux, authentique et valorisant.
      - Remercie sincèrement et spécifiquement (mentionne ce qui a plu si c'est clair dans l'avis).
      - Invite légèrement à revenir, sans être insistant.
      - Sois bref et joyeux, comme si tu étais vraiment content.`;

    case 4:
      return `L'avis est TRÈS POSITIF (4 étoiles).
      - Remercie chaleureusement.
      - Montre que tu es ouvert aux suggestions d'amélioration (même si l'avis est déjà très positif).
      - Invite à revenir.
      - Ton professionnel et reconnaissant.`;

    case 3:
      return `L'avis est NEUTRE/MIXTE (3 étoiles).
      - Remercie pour le retour.
      - Montre que tu prends en compte les remarques (positives et négatives si présentes).
      - Demande subtilement plus de détails si nécessaire pour améliorer.
      - Ton neutre, compréhensif, sans défensif.`;

    case 2:
      return `L'avis est NÉGATIF (2 étoiles).
      - Ton EMPATHIQUE et reconnaissant du problème.
      - Ne minimise JAMAIS la plainte.
      - Reconnais le problème sans excuses vagues.
      - Propose une solution concrète ou un échange privé.
      - Montre ta volonté de réparation.
      - Sois sincère, pas défensif.`;

    case 1:
      return `L'avis est TRÈS NÉGATIF (1 étoile).
      - Ton TRÈS EMPATHIQUE, reconnaissant et responsable.
      - Prends TOUTE la responsabilité, sans justification.
      - Ne contredis JAMAIS le client.
      - Propose immédiatement un échange privé pour réparer.
      - Montre ta volonté de comprendre et corriger.
      - Sois humble, sincère, et orienté solution.`;

    default:
      return `Adapte ton ton selon le sentiment exprimé dans l'avis.`;
  }
}

// Instructions de variation pour éviter la répétition
const VARIATION_INSTRUCTIONS = `
RÈGLES STRICTES DE VARIATION (OBLIGATOIRES) :
1. JAMAIS de répétition : chaque réponse doit être UNIQUE dans sa structure.
2. Varie TOUJOURS :
   - La phrase d'ouverture (utilise différentes formules de remerciement).
   - La façon de reformuler le problème ou le compliment.
   - La proposition de solution ou d'amélioration.
   - La phrase de clôture.
3. Deux réponses consécutives ne doivent JAMAIS se ressembler.
4. Sois créatif dans la formulation, tout en restant professionnel.
`;

// Instructions de personnalisation contextuelle
const CONTEXT_INSTRUCTIONS = `
PERSONNALISATION CONTEXTUELLE (OBLIGATOIRE) :
1. Si un prénom est mentionné dans l'avis, utilise-le naturellement.
2. Si un service, produit ou détail précis est mentionné, fais-y référence explicitement.
3. Si un problème spécifique est évoqué, réponds-y DIRECTEMENT, sans généralités vagues.
4. Montre que tu as LU et COMPRIS l'avis spécifique, pas juste répondu de manière générique.
`;

// Instructions de ton naturel
const TONE_INSTRUCTIONS = `
TON NATUREL ET HUMAIN (OBLIGATOIRE) :
1. Écris comme un VRAI humain qui répond, pas comme un robot.
2. Sois professionnel MAIS simple, jamais juridique ni marketing.
3. Évite les phrases trop longues ou trop complexes.
4. Reste concis (maximum 120 mots, idéalement 80-100 mots).
5. Utilise un langage naturel, comme si tu parlais au client.
6. Pas de jargon professionnel, pas de formules toutes faites.
`;

// Instructions de protection de l'image
const IMAGE_PROTECTION = `
PROTECTION DE L'IMAGE (OBLIGATOIRE) :
1. Ne JAMAIS contredire frontalement un client.
2. Ne JAMAIS minimiser une plainte.
3. Toujours valoriser la relation, même en cas d'avis très négatif.
4. En cas de problème sérieux (1-2 étoiles), invite toujours à un échange privé.
5. Montre que l'entreprise est attentive et soucieuse de la satisfaction client.
`;

// Prompts métier-spécifiques
const PROMPTS_BY_METIER: Record<string, string> = {
  restaurant: `Tu es un expert en communication pour restaurants. Tu rédiges des réponses professionnelles aux avis Google en français.
Ton style doit être adapté au ton choisi (neutre, chaleureux, premium, commercial).
Pour les restaurants, sois attentif aux mentions de : qualité des plats, service, ambiance, prix, hygiène, attente, accueil.
Réponds toujours de manière constructive, même aux avis négatifs.`,

  coiffeur: `Tu es un expert en communication pour salons de coiffure et barbiers. Tu rédiges des réponses professionnelles aux avis Google en français.
Ton style doit être adapté au ton choisi (neutre, chaleureux, premium, commercial).
Pour les coiffeurs, sois attentif aux mentions de : qualité de la coupe, conseil, accueil, prix, disponibilité, résultat, ambiance.
Réponds toujours de manière constructive, même aux avis négatifs.`,

  garage: `Tu es un expert en communication pour garages automobiles. Tu rédiges des réponses professionnelles aux avis Google en français.
Ton style doit être adapté au ton choisi (neutre, chaleureux, premium, commercial).
Pour les garages, sois attentif aux mentions de : qualité des réparations, transparence des devis, délais, prix, confiance, conseil, accueil.
Réponds toujours de manière constructive, même aux avis négatifs.`,

  photographe: `Tu es un expert en communication pour photographes. Tu rédiges des réponses professionnelles aux avis Google en français.
Ton style doit être adapté au ton choisi (neutre, chaleureux, premium, commercial).
Pour les photographes, sois attentif aux mentions de : qualité des photos, créativité, relation client, prix, délais de livraison, satisfaction, ambiance.
Réponds toujours de manière constructive, même aux avis négatifs.`,

  coach: `Tu es un expert en communication pour coachs sportifs et bien-être. Tu rédiges des réponses professionnelles aux avis Google en français.
Ton style doit être adapté au ton choisi (neutre, chaleureux, premium, commercial).
Pour les coachs, sois attentif aux mentions de : qualité de l'accompagnement, résultats, motivation, relation client, prix, disponibilité, méthode.
Réponds toujours de manière constructive, même aux avis négatifs.`,
};

const TON_INSTRUCTIONS: Record<string, string> = {
  neutre: `Ton NEUTRE : professionnel, factuel, sans effusion. Reste courtois mais sobre.`,
  chaleureux: `Ton CHALEUREUX : amical, proche, authentique. Montre de l'empathie et de la bienveillance.`,
  premium: `Ton PREMIUM : élégant, raffiné, attentionné. Montre l'excellence et le soin apporté.`,
  commercial: `Ton COMMERCIAL : dynamique, positif, orienté résultats. Mets en avant les bénéfices et la satisfaction.`,
};

// Fonction pour extraire le prénom de l'avis (si présent)
function extractName(contenuAvis: string): string | null {
  // Patterns simples pour détecter des prénoms français courants
  const commonNames = [
    "Marie", "Jean", "Pierre", "Sophie", "Thomas", "Julie", "Nicolas", "Camille",
    "Antoine", "Laura", "Lucas", "Emma", "Alexandre", "Claire", "Maxime", "Sarah",
    "Paul", "Léa", "Hugo", "Manon", "Louis", "Chloé", "Romain", "Marion",
  ];
  
  const words = contenuAvis.split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[.,!?;:()"]/g, "");
    if (commonNames.includes(cleanWord)) {
      return cleanWord;
    }
  }
  return null;
}

// Fonction pour détecter la note depuis le texte si elle n'est pas fournie
function detectNoteFromText(contenuAvis: string): number | null {
  const lowerText = contenuAvis.toLowerCase();
  
  // Mots-clés très positifs (5 étoiles)
  if (
    lowerText.includes("excellent") ||
    lowerText.includes("parfait") ||
    lowerText.includes("génial") ||
    lowerText.includes("merveilleux") ||
    lowerText.includes("fantastique") ||
    lowerText.includes("exceptionnel") ||
    lowerText.includes("au top") ||
    lowerText.includes("je recommande vivement")
  ) {
    return 5;
  }
  
  // Mots-clés très négatifs (1 étoile)
  if (
    lowerText.includes("décevant") ||
    lowerText.includes("horrible") ||
    lowerText.includes("catastrophique") ||
    lowerText.includes("nul") ||
    lowerText.includes("à éviter") ||
    lowerText.includes("très mauvais") ||
    lowerText.includes("déplorable") ||
    lowerText.includes("je ne recommande pas")
  ) {
    return 1;
  }
  
  // Mots-clés négatifs (2 étoiles)
  if (
    lowerText.includes("mauvais") ||
    lowerText.includes("déçu") ||
    lowerText.includes("problème") ||
    lowerText.includes("insatisfait") ||
    lowerText.includes("pas content") ||
    lowerText.includes("décevant")
  ) {
    return 2;
  }
  
  // Mots-clés positifs (4 étoiles)
  if (
    lowerText.includes("très bien") ||
    lowerText.includes("satisfait") ||
    lowerText.includes("content") ||
    lowerText.includes("bon") ||
    lowerText.includes("sympa") ||
    lowerText.includes("agréable")
  ) {
    return 4;
  }
  
  // Par défaut, neutre (3 étoiles) si aucun indice clair
  return null;
}

export function buildPrompt(
  metier: string,
  tonMarque: string,
  nomEtablissement: string,
  ville: string,
  contenuAvis: string,
  note?: number | null
): string {
  const promptMetier = PROMPTS_BY_METIER[metier] || PROMPTS_BY_METIER.restaurant;
  const instructionTon = TON_INSTRUCTIONS[tonMarque] || TON_INSTRUCTIONS.chaleureux;

  // Détecter la note si elle n'est pas fournie
  let finalNote = note;
  if (!finalNote) {
    finalNote = detectNoteFromText(contenuAvis);
  }

  // Extraire le prénom si présent
  const prenom = extractName(contenuAvis);
  const prenomInstruction = prenom ? `\n- Prénom détecté dans l'avis : ${prenom} (utilise-le naturellement dans ta réponse)` : "";

  // Instructions selon la note
  const noteInstructions = getNoteInstructions(finalNote);

  // Sélectionner aléatoirement une ouverture et une clôture pour la variation
  const randomOpening = OPENING_VARIATIONS[Math.floor(Math.random() * OPENING_VARIATIONS.length)];
  const randomClosing = CLOSING_VARIATIONS[Math.floor(Math.random() * CLOSING_VARIATIONS.length)];

  return `${promptMetier}

${instructionTon}

${VARIATION_INSTRUCTIONS}

${CONTEXT_INSTRUCTIONS}

${TONE_INSTRUCTIONS}

${IMAGE_PROTECTION}

${noteInstructions}

CONTEXTE :
- Établissement : ${nomEtablissement}
- Ville : ${ville}
${finalNote ? `- Note de l'avis : ${finalNote}/5 étoiles` : "- Note : à déterminer depuis le texte"}
${prenomInstruction}

AVIS À RÉPONDRE :
"${contenuAvis}"

INSTRUCTIONS FINALES :
1. Réponds en français, de manière professionnelle et humaine.
2. Adapte ton style au ton choisi (${tonMarque}).
3. Sois concis (maximum 120 mots, idéalement 80-100 mots).
4. Varie ta structure : utilise différentes ouvertures et clôtures.
5. Réponds DIRECTEMENT au contenu spécifique de l'avis, pas de manière générique.
6. Si l'avis est négatif (1-2 étoiles), propose un échange privé.
7. Signe la réponse au nom de ${nomEtablissement}.
8. Ne génère QUE la réponse, sans commentaire ni explication.
9. Exemples d'ouvertures variées : "${randomOpening}", "${OPENING_VARIATIONS[Math.floor(Math.random() * OPENING_VARIATIONS.length)]}"
10. Exemples de clôtures variées : "${randomClosing}", "${CLOSING_VARIATIONS[Math.floor(Math.random() * CLOSING_VARIATIONS.length)]}"

IMPORTANT : Cette réponse doit être UNIQUE. Ne réutilise JAMAIS les mêmes phrases ou structures que les réponses précédentes.`;
}
