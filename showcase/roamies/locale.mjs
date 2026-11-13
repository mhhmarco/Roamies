// Shared, deliberately additive localization layer. English remains the fallback so an
// incomplete catalog never hides a feature or changes protocol/tool identifiers.
const CATALOG = {
  it: {
    'Roamies roaming the desktop': 'Roamies sul desktop',
    'Message for Roamie': 'Messaggio per Roamie',
    'Panel': 'Pannello', 'Home': 'Inizio', 'Memory': 'Memoria', 'Settings': 'Impostazioni',
    'Model': 'Modello', 'Appearance': 'Aspetto', 'Voice': 'Voce', 'Behavior': 'Comportamento',
    'About': 'Informazioni', "What's new": 'Novità', 'Actions': 'Azioni', 'Recent': 'Recenti',
    'Ask': 'Chiedi', 'Show list': 'Mostra elenco', 'Ask about an area': 'Chiedi informazioni su un’area',
    'Stop': 'Interrompi', 'New chat': 'Nuova conversazione', 'Show': 'Mostra', 'Quit': 'Esci',
    'Nothing yet…': 'Ancora niente…', 'Nothing here yet.': 'Non c’è ancora nulla.',
    'Previous page': 'Pagina precedente', 'Next page': 'Pagina successiva',
    'What I remember': 'Cosa ricordo', 'Commitments': 'Impegni', 'Get to know me': 'Parliamo di te',
    'Forget': 'Dimentica', 'Forget everything': 'Dimentica tutto', 'Done': 'Fatto', 'Drop': 'Rimuovi',
    'Sign in': 'Accedi', 'Connect': 'Connetti', 'Add key': 'Aggiungi chiave', 'Change key': 'Cambia chiave',
    'Cancel': 'Annulla', 'Save': 'Salva', 'Open': 'Apri', 'Copy': 'Copia', 'Confirm': 'Conferma',
    'Text only': 'Solo testo', 'Voice and text': 'Voce e testo', 'Spoken replies': 'Risposte vocali',
    'Voice provider': 'Servizio vocale', 'Sound effects': 'Effetti sonori',
    'Allow file edits and commands': 'Consenti modifiche ai file e comandi',
    'Auto-listen': 'Ascolto automatico', 'Wake word': 'Parola di attivazione',
    'Open at login': 'Apri all’accesso', 'Check for updates': 'Cerca aggiornamenti',
    'Check again': 'Controlla di nuovo', 'Up to date': 'Aggiornato', 'Updating…': 'Aggiornamento…',
    'Searching the web': 'Ricerca sul web', 'Writing it up': 'Sto preparando la risposta',
    'Listening…': 'In ascolto…', 'Thinking': 'Sto pensando', 'Ready': 'Pronto',
    'Hi, I’m Roamie.': 'Ciao, sono Roamie.', 'Hi, I\'m Roamie.': 'Ciao, sono Roamie.',
    'Let me help': 'Lascia che ti aiuti', 'Give me a brain': 'Scegli un’IA',
    'How should I reply?': 'Come preferisci che risponda?', 'Here’s what I can do': 'Ecco cosa so fare',
    "Here's what I can do": 'Ecco cosa so fare', 'Your shortcuts': 'Le tue scorciatoie',
    'Talk to me': 'Parlami', 'Type to me': 'Scrivimi', 'Show or hide me': 'Mostrami o nascondimi',
    'Find me up here': 'Mi trovi qui sopra', 'Back': 'Indietro', 'Continue': 'Continua',
    'Skip for now': 'Salta per ora', 'Let’s go': 'Andiamo', "Let's go": 'Andiamo',
    'Search the web': 'Cerca sul web', 'Graphs': 'Grafici', 'Timelines': 'Linee del tempo',
    'Science': 'Scienza', '3D models': 'Modelli 3D', 'Plans and lists': 'Piani ed elenchi',
    'Your answer': 'La tua risposta', 'Type your answer…': 'Scrivi la tua risposta…',
    'Forget:': 'Dimentica:', 'Search what I remember': 'Cerca nei miei ricordi',
    'Ask me anything…': 'Chiedimi qualsiasi cosa…', 'What about this?': 'Che cosa ne pensi?',
    'What is this? Explain it simply.': 'Che cos’è? Spiegamelo in modo semplice.',
  },
};

export const SUPPORTED_LOCALES = Object.freeze(['en', 'it']);
const normalize = (locale) => String(locale ?? '').toLowerCase().split(/[-_]/)[0];

export function detectLocale({ stored, preferred } = {}) {
  const saved = normalize(stored);
  if (SUPPORTED_LOCALES.includes(saved)) return saved;
  const system = normalize(preferred ?? globalThis.navigator?.language ?? Intl.DateTimeFormat().resolvedOptions().locale);
  return SUPPORTED_LOCALES.includes(system) ? system : 'en';
}

export function translate(text, locale = 'en') {
  const language = normalize(locale);
  return CATALOG[language]?.[String(text)] ?? String(text);
}

export function createLocale(locale = 'en') {
  const language = detectLocale({ stored: locale, preferred: locale });
  return Object.freeze({
    locale: language,
    t: (text) => translate(text, language),
    date: (value, options = {}) => new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-US', options).format(value),
    time: (value, options = { hour: '2-digit', minute: '2-digit' }) => new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-US', options).format(value),
  });
}

/** Install translations for accessible labels and literal DOM text without changing app protocol data. */
export function installLocale({ document = globalThis.document, locale, storage = globalThis.localStorage } = {}) {
  if (!document) return null;
  let current = detectLocale({ stored: locale ?? storage?.getItem('roamies.locale'), preferred: document.documentElement.lang || globalThis.navigator?.language });
  const apply = () => {
    document.documentElement.lang = current;
    const walker = document.createTreeWalker(document.body, globalThis.NodeFilter?.SHOW_TEXT ?? 4);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement?.closest('script,style,code,pre')) {
        const translated = translate(node.nodeValue.trim(), current);
        if (translated !== node.nodeValue.trim()) node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), translated);
      }
    }
    for (const el of document.querySelectorAll('[aria-label],[title],[placeholder]')) {
      for (const attr of ['aria-label', 'title', 'placeholder']) if (el.hasAttribute(attr)) el.setAttribute(attr, translate(el.getAttribute(attr), current));
    }
  };
  apply();
  const Observer = globalThis.MutationObserver;
  const observer = Observer ? new Observer(() => apply()) : null;
  observer?.observe(document.body, { childList: true, subtree: true, characterData: true });
  return Object.freeze({
    get locale() { return current; },
    t: (text) => translate(text, current),
    setLocale(next) {
      const normalized = normalize(next);
      if (!SUPPORTED_LOCALES.includes(normalized)) throw new RangeError(`Unsupported Roamies locale: ${next}`);
      current = normalized;
      storage?.setItem('roamies.locale', current);
      apply();
      return current;
    },
    disconnect: () => observer?.disconnect(),
  });
}
