export type SupportedLanguage = "es" | "en" | "pt";

export interface FaqEntry {
  q: string;
  a: string;
}

export interface Translation {
  appName: string;
  tagline: string;
  drawerHome: string;
  drawerPlay: string;
  privacyPolicyLabel: string;
  loadingLabel: string;

  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  daysWithoutPlayingMessage: (days: number) => string;
  readyToPlayMessage: string;
  playButton: string;
  removeAdsButton: string;
  removeAdsButtonBuying: string;

  categoriesTitle: string;
  categoryFruitsLabel: string;
  categoryFruitsDescription: string;
  categoryNumbersLabel: string;
  categoryNumbersDescription: string;
  categoryLettersLabel: string;
  categoryLettersDescription: string;

  recordTitle: string;
  recordEmptyBody: string;
  recordScoreCaption: (score: number) => string;
  recordFruitHighlightCaption: (n: number) => string;
  recordFruitClearsCaption: (n: number) => string;
  recordNumberHighlightCaption: (n: number) => string;
  recordNumberClearsCaption: (n: number) => string;
  recordWordsCaption: (n: number) => string;
  recordLongestWordCaption: (word: string) => string;
  shareRecordText: (score: number) => string;

  whatIsTitle: string;
  whatIsBody: string;
  howToPlayTitle: string;
  howToPlayFruits: string;
  howToPlayNumbers: string;
  howToPlayLetters: string;

  faqTitle: string;
  faq: FaqEntry[];

  scoreLabel: string;
  hintFruits: string;
  hintLetters: string;
  hintNumbers: (floor: number) => string;
  goalsTitle: string;
  wordsListTitle: string;
  wordsListEmpty: string;
  numberGoalNext: (value: number) => string;
  numberGoalsComplete: string;
  pauseButtonLabel: string;
  resumeButtonLabel: string;
  pausedOverlayTitle: string;
  vowelsLabel: string;
  consonantsLabel: string;

  gameOverTitle: string;
  gameOverBody: (score: number) => string;
  newBestLabel: string;
  continueWithAdButton: string;
  rewardedAdConfirmButton: string;
  rewardedAdSkipButton: string;
  rewardedAdWaitLabel: (seconds: number) => string;
  playAgainButton: string;
  backToHomeButton: string;

  privacyTitle: string;
  privacySections: { heading: string; body: string }[];
}

const es: Translation = {
  appName: "Embocalo",
  tagline: "dispará · embocá · sumá puntos",
  drawerHome: "Inicio",
  drawerPlay: "Jugar",
  privacyPolicyLabel: "Privacidad",
  loadingLabel: "Cargando...",

  greetingMorning: "Buenos días ☀️",
  greetingAfternoon: "Buenas tardes 🌤️",
  greetingEvening: "Buenas noches 🌙",
  daysWithoutPlayingMessage: (days) => (days <= 0 ? "¿Volvemos a jugar?" : days === 1 ? "Hace 1 día que no jugás" : `Hace ${days} días que no jugás`),
  readyToPlayMessage: "¿Listo para jugar Embocalo?",
  playButton: "Jugar",
  removeAdsButton: "Sacar los anuncios",
  removeAdsButtonBuying: "Redirigiendo...",

  categoriesTitle: "Formas de jugar",
  categoryFruitsLabel: "Mandale fruta",
  categoryFruitsDescription: "Disparále a grupos de 3 o más frutas iguales para explotarlas",
  categoryNumbersLabel: "Sumando números",
  categoryNumbersDescription: "Pegá números y recorré con el dedo los que sumen la meta",
  categoryLettersLabel: "Formar palabras",
  categoryLettersDescription: "Elegí vocales y consonantes, armá palabras y borralas con swipe",

  recordTitle: "Récord",
  recordEmptyBody: "Todavía no jugaste esta modalidad",
  recordScoreCaption: (score) => `${score} puntos`,
  recordFruitHighlightCaption: (n) => `Grupo más grande: ${n} frutas`,
  recordFruitClearsCaption: (n) => `${n} grupos explotados`,
  recordNumberHighlightCaption: (n) => `Meta más alta: ${n}`,
  recordNumberClearsCaption: (n) => `${n} sumas acertadas`,
  recordWordsCaption: (n) => `Más palabras en una partida: ${n}`,
  recordLongestWordCaption: (word) => `Palabra más larga: ${word} (${word.length} letras)`,
  shareRecordText: (score) => `¡Hice ${score} puntos en Embocalo! 🎯`,

  whatIsTitle: "¿Qué es Embocalo?",
  whatIsBody:
    "Embocalo es un bubble-shooter: apuntás con el dedo y disparás burbujas hacia un tablero hexagonal que baja de a poco. Elegí entre tres modalidades — frutas, números o letras — cada una con su propia forma de despejar el tablero antes de que el techo te alcance.",
  howToPlayTitle: "¿Cómo se juega?",
  howToPlayFruits: "Arrastrá desde el disparador para apuntar y soltá para tirar. Si juntás 3 o más frutas iguales conectadas, explotan solas.",
  howToPlayNumbers: "Disparás un número a la vez (no elegís cuál). Para borrarlos, arrastrá el dedo sobre números conectados que sumen la meta pedida.",
  howToPlayLetters: "Elegí una vocal y una consonante con las flechas de cada disparador. Para borrar letras, arrastrá el dedo sobre una cadena conectada que forme una palabra real.",

  faqTitle: "Preguntas frecuentes",
  faq: [
    { q: "¿Qué pasa si el techo me alcanza?", a: "Se termina la partida — podés ver un anuncio para despejar las 2 filas más cercanas al disparador y seguir jugando, o empezar una nueva." },
    { q: "¿Las tres modalidades se juegan distinto?", a: "Sí. En frutas, los grupos de 3+ explotan solos al disparar. En números y letras, disparar solo pega la burbuja — borrarlas es un swipe aparte, como en el resto de los juegos de Boludeando." },
    { q: "¿Necesito internet para jugar?", a: "Una vez que la página cargó, podés seguir jugando sin conexión. Algunas funciones (compartir resultado, anuncios) sí la necesitan." },
    { q: "¿En qué idiomas está disponible?", a: "Español, inglés y portugués — el diccionario de letras cambia según el idioma elegido." },
  ],

  scoreLabel: "Puntos",
  wordsListTitle: "Palabras encontradas",
  wordsListEmpty: "Todavía no formaste ninguna palabra",
  hintFruits: "Arrastrá desde abajo para apuntar y soltá para disparar — un toque sin arrastrar tira derecho.",
  hintLetters: "Arrastrá el dedo sobre las letras conectadas para armar una palabra y soltá para borrarla.",
  hintNumbers: (floor) => `Arrastrá números conectados que sumen ${floor} o ${floor + 1} y soltá para borrarlos (${floor + 1} sube la meta).`,
  goalsTitle: "Metas",
  numberGoalNext: (value) => `Meta: lográ una suma de ${value} o más`,
  numberGoalsComplete: "¡Cumpliste todas las metas!",
  pauseButtonLabel: "Pausar",
  resumeButtonLabel: "Reanudar",
  pausedOverlayTitle: "Pausado",
  vowelsLabel: "Vocales",
  consonantsLabel: "Consonantes",

  gameOverTitle: "Se llenó el tablero",
  gameOverBody: (score) => `Puntaje: ${score}`,
  newBestLabel: "¡Nuevo récord!",
  continueWithAdButton: "Ver anuncio y seguir jugando",
  rewardedAdConfirmButton: "Confirmar",
  rewardedAdSkipButton: "Omitir",
  rewardedAdWaitLabel: (seconds) => `Esperá ${seconds}s...`,
  playAgainButton: "Jugar de nuevo",
  backToHomeButton: "Volver al inicio",

  privacyTitle: "Política de privacidad",
  privacySections: [
    { heading: "Qué datos recolectamos", body: "Embocalo no requiere registro ni cuenta. Guardamos localmente en tu navegador (localStorage) tu mejor puntaje por modalidad y el idioma elegido — estos datos nunca salen de tu dispositivo." },
    { heading: "Google AdSense", body: "Usamos Google AdSense para mostrar anuncios. AdSense puede usar cookies para mostrar anuncios relevantes según tu actividad en otros sitios. Podés administrar tus preferencias de anuncios en adssettings.google.com." },
    { heading: "Cookies", body: "Usamos cookies técnicas propias (preferencia de idioma) y de terceros (Google AdSense, Google Analytics) para medir el uso del sitio y mostrar publicidad." },
    { heading: "Servicios de terceros", body: "Este juego forma parte de la red de juegos de Boludeando y puede mostrar anuncios propios de otros juegos del hub, gestionados por nuestra plataforma Boludeando Ads, y procesar pagos de anunciantes vía MercadoPago." },
    { heading: "Anuncios recompensados", body: "Al elegir ver un anuncio recompensado, se te muestra una pieza publicitaria (propia o de un anunciante) a cambio de un beneficio dentro del juego. No se recolecta información personal adicional por este mecanismo." },
    { heading: "Menores de edad", body: "Embocalo no está dirigido específicamente a menores de 13 años y no recolectamos a sabiendas información personal de menores." },
    { heading: "Cambios en esta política", body: "Podemos actualizar esta política ocasionalmente. Los cambios se publican en esta misma página." },
    { heading: "Contacto", body: "Para consultas sobre privacidad, escribinos a boludeando.app@gmail.com." },
  ],
};

const en: Translation = {
  appName: "Embocalo",
  tagline: "shoot · pop · score",
  drawerHome: "Home",
  drawerPlay: "Play",
  privacyPolicyLabel: "Privacy",
  loadingLabel: "Loading...",

  greetingMorning: "Good morning ☀️",
  greetingAfternoon: "Good afternoon 🌤️",
  greetingEvening: "Good evening 🌙",
  daysWithoutPlayingMessage: (days) => (days <= 0 ? "Ready for another round?" : days === 1 ? "It's been 1 day since you played" : `It's been ${days} days since you played`),
  readyToPlayMessage: "Ready to play Embocalo?",
  playButton: "Play",
  removeAdsButton: "Remove ads",
  removeAdsButtonBuying: "Redirecting...",

  categoriesTitle: "Ways to play",
  categoryFruitsLabel: "Smash Fruit",
  categoryFruitsDescription: "Shoot groups of 3 or more matching fruits to pop them",
  categoryNumbersLabel: "Add It Up",
  categoryNumbersDescription: "Stick numbers, then swipe a chain that adds up to the goal",
  categoryLettersLabel: "Spell It Out",
  categoryLettersDescription: "Pick vowels and consonants, spell words, clear them with a swipe",

  recordTitle: "Best run",
  recordEmptyBody: "You haven't played this mode yet",
  recordScoreCaption: (score) => `${score} points`,
  recordFruitHighlightCaption: (n) => `Biggest group: ${n} fruits`,
  recordFruitClearsCaption: (n) => `${n} groups popped`,
  recordNumberHighlightCaption: (n) => `Highest goal: ${n}`,
  recordNumberClearsCaption: (n) => `${n} correct sums`,
  recordWordsCaption: (n) => `Most words in one run: ${n}`,
  recordLongestWordCaption: (word) => `Longest word: ${word} (${word.length} letters)`,
  shareRecordText: (score) => `I scored ${score} points in Embocalo! 🎯`,

  whatIsTitle: "What is Embocalo?",
  whatIsBody:
    "Embocalo is a bubble shooter: aim with your finger and shoot bubbles at a hex board that slowly drops. Pick one of three modes — fruits, numbers, or letters — each with its own way to clear the board before the ceiling reaches you.",
  howToPlayTitle: "How to play",
  howToPlayFruits: "Drag from the shooter to aim and release to fire. Connect 3 or more matching fruits and they pop on their own.",
  howToPlayNumbers: "You fire one number at a time (no choice). To clear them, swipe across connected numbers that add up to the current goal.",
  howToPlayLetters: "Pick a vowel and a consonant with each shooter's arrows. To clear letters, swipe across a connected chain that spells a real word.",

  faqTitle: "Frequently asked questions",
  faq: [
    { q: "What happens if the ceiling reaches me?", a: "The run ends — you can watch an ad to clear the 2 rows closest to the shooter and keep playing, or start a new run." },
    { q: "Do the three modes play differently?", a: "Yes. In fruits, groups of 3+ pop on their own when you shoot. In numbers and letters, shooting only sticks the bubble — clearing is a separate swipe, same as the rest of Boludeando's games." },
    { q: "Do I need internet to play?", a: "Once the page loads, you can keep playing offline. Some features (sharing your score, ads) do need a connection." },
    { q: "What languages are available?", a: "Spanish, English, and Portuguese — the letters dictionary changes with your chosen language." },
  ],

  scoreLabel: "Score",
  wordsListTitle: "Words found",
  wordsListEmpty: "You haven't spelled a word yet",
  hintFruits: "Drag from below to aim and release to fire — a tap without dragging shoots straight up.",
  hintLetters: "Drag your finger across connected letters to spell a word, release to clear it.",
  hintNumbers: (floor) => `Drag across connected numbers that add up to ${floor} or ${floor + 1} and release to clear them (${floor + 1} raises the goal).`,
  goalsTitle: "Goals",
  numberGoalNext: (value) => `Goal: reach a sum of ${value} or more`,
  numberGoalsComplete: "You've reached every goal!",
  pauseButtonLabel: "Pause",
  resumeButtonLabel: "Resume",
  pausedOverlayTitle: "Paused",
  vowelsLabel: "Vowels",
  consonantsLabel: "Consonants",

  gameOverTitle: "The board filled up",
  gameOverBody: (score) => `Score: ${score}`,
  newBestLabel: "New best!",
  continueWithAdButton: "Watch an ad and keep playing",
  rewardedAdConfirmButton: "Confirm",
  rewardedAdSkipButton: "Skip",
  rewardedAdWaitLabel: (seconds) => `Wait ${seconds}s...`,
  playAgainButton: "Play again",
  backToHomeButton: "Back to home",

  privacyTitle: "Privacy Policy",
  privacySections: [
    { heading: "What data we collect", body: "Embocalo doesn't require sign-up or an account. We store your best score per mode and your chosen language locally in your browser (localStorage) — this data never leaves your device." },
    { heading: "Google AdSense", body: "We use Google AdSense to show ads. AdSense may use cookies to show relevant ads based on your activity on other sites. You can manage your ad preferences at adssettings.google.com." },
    { heading: "Cookies", body: "We use our own technical cookies (language preference) and third-party cookies (Google AdSense, Google Analytics) to measure site usage and show advertising." },
    { heading: "Third-party services", body: "This game is part of Boludeando's network of games and may show ads from other games in the hub, managed by our in-house platform Boludeando Ads, and process advertiser payments via MercadoPago." },
    { heading: "Rewarded ads", body: "When you choose to watch a rewarded ad, you're shown an ad creative (ours or an advertiser's) in exchange for an in-game benefit. No additional personal information is collected through this mechanism." },
    { heading: "Children", body: "Embocalo is not specifically directed at children under 13 and we do not knowingly collect personal information from children." },
    { heading: "Changes to this policy", body: "We may update this policy from time to time. Changes are posted on this same page." },
    { heading: "Contact", body: "For privacy questions, email us at boludeando.app@gmail.com." },
  ],
};

const pt: Translation = {
  appName: "Embocalo",
  tagline: "atire · encaixe · pontue",
  drawerHome: "Início",
  drawerPlay: "Jogar",
  privacyPolicyLabel: "Privacidade",
  loadingLabel: "Carregando...",

  greetingMorning: "Bom dia ☀️",
  greetingAfternoon: "Boa tarde 🌤️",
  greetingEvening: "Boa noite 🌙",
  daysWithoutPlayingMessage: (days) => (days <= 0 ? "Vamos jogar de novo?" : days === 1 ? "Faz 1 dia que você não joga" : `Faz ${days} dias que você não joga`),
  readyToPlayMessage: "Pronto para jogar Embocalo?",
  playButton: "Jogar",
  removeAdsButton: "Remover anúncios",
  removeAdsButtonBuying: "Redirecionando...",

  categoriesTitle: "Formas de jogar",
  categoryFruitsLabel: "Mete Fruta",
  categoryFruitsDescription: "Dispare em grupos de 3 ou mais frutas iguais para estourá-las",
  categoryNumbersLabel: "Somando Números",
  categoryNumbersDescription: "Cole números e deslize o dedo pelos que somam a meta",
  categoryLettersLabel: "Formar Palavras",
  categoryLettersDescription: "Escolha vogais e consoantes, forme palavras e apague com um deslize",

  recordTitle: "Melhor partida",
  recordEmptyBody: "Você ainda não jogou esse modo",
  recordScoreCaption: (score) => `${score} pontos`,
  recordFruitHighlightCaption: (n) => `Maior grupo: ${n} frutas`,
  recordFruitClearsCaption: (n) => `${n} grupos estourados`,
  recordNumberHighlightCaption: (n) => `Meta mais alta: ${n}`,
  recordNumberClearsCaption: (n) => `${n} somas certas`,
  recordWordsCaption: (n) => `Mais palavras em uma partida: ${n}`,
  recordLongestWordCaption: (word) => `Palavra mais longa: ${word} (${word.length} letras)`,
  shareRecordText: (score) => `Fiz ${score} pontos no Embocalo! 🎯`,

  whatIsTitle: "O que é Embocalo?",
  whatIsBody:
    "Embocalo é um bubble-shooter: você aponta com o dedo e dispara bolhas num tabuleiro hexagonal que desce de pouco em pouco. Escolha entre três modos — frutas, números ou letras — cada um com sua própria forma de limpar o tabuleiro antes que o teto te alcance.",
  howToPlayTitle: "Como jogar",
  howToPlayFruits: "Arraste a partir do disparador para apontar e solte para disparar. Ao conectar 3 ou mais frutas iguais, elas estouram sozinhas.",
  howToPlayNumbers: "Você dispara um número por vez (sem escolha). Para apagá-los, deslize o dedo por números conectados que somem a meta atual.",
  howToPlayLetters: "Escolha uma vogal e uma consoante com as flechas de cada disparador. Para apagar letras, deslize o dedo por uma cadeia conectada que forme uma palavra real.",

  faqTitle: "Perguntas frequentes",
  faq: [
    { q: "O que acontece se o teto me alcançar?", a: "A partida termina — você pode assistir a um anúncio para limpar as 2 fileiras mais próximas do disparador e continuar jogando, ou começar uma nova partida." },
    { q: "Os três modos se jogam de forma diferente?", a: "Sim. Em frutas, grupos de 3+ estouram sozinhos ao disparar. Em números e letras, disparar só cola a bolha — apagar é um deslize separado, igual aos outros jogos do Boludeando." },
    { q: "Preciso de internet para jogar?", a: "Depois que a página carregar, você pode continuar jogando offline. Alguns recursos (compartilhar resultado, anúncios) precisam de conexão." },
    { q: "Em quais idiomas está disponível?", a: "Espanhol, inglês e português — o dicionário de letras muda conforme o idioma escolhido." },
  ],

  scoreLabel: "Pontos",
  wordsListTitle: "Palavras encontradas",
  wordsListEmpty: "Você ainda não formou nenhuma palavra",
  hintFruits: "Arraste a partir de baixo para apontar e solte para disparar — um toque sem arrastar dispara para cima.",
  hintLetters: "Arraste o dedo pelas letras conectadas para formar uma palavra e solte para apagá-la.",
  hintNumbers: (floor) => `Arraste por números conectados que somem ${floor} ou ${floor + 1} e solte para apagá-los (${floor + 1} sobe a meta).`,
  goalsTitle: "Metas",
  numberGoalNext: (value) => `Meta: alcance uma soma de ${value} ou mais`,
  numberGoalsComplete: "Você cumpriu todas as metas!",
  pauseButtonLabel: "Pausar",
  resumeButtonLabel: "Retomar",
  pausedOverlayTitle: "Pausado",
  vowelsLabel: "Vogais",
  consonantsLabel: "Consoantes",

  gameOverTitle: "O tabuleiro lotou",
  gameOverBody: (score) => `Pontuação: ${score}`,
  newBestLabel: "Novo recorde!",
  continueWithAdButton: "Ver anúncio e continuar jogando",
  rewardedAdConfirmButton: "Confirmar",
  rewardedAdSkipButton: "Pular",
  rewardedAdWaitLabel: (seconds) => `Espere ${seconds}s...`,
  playAgainButton: "Jogar de novo",
  backToHomeButton: "Voltar ao início",

  privacyTitle: "Política de Privacidade",
  privacySections: [
    { heading: "Quais dados coletamos", body: "O Embocalo não exige cadastro nem conta. Guardamos localmente no seu navegador (localStorage) sua melhor pontuação por modo e o idioma escolhido — esses dados nunca saem do seu dispositivo." },
    { heading: "Google AdSense", body: "Usamos o Google AdSense para exibir anúncios. O AdSense pode usar cookies para mostrar anúncios relevantes com base na sua atividade em outros sites. Você pode gerenciar suas preferências em adssettings.google.com." },
    { heading: "Cookies", body: "Usamos cookies técnicos próprios (preferência de idioma) e de terceiros (Google AdSense, Google Analytics) para medir o uso do site e exibir publicidade." },
    { heading: "Serviços de terceiros", body: "Este jogo faz parte da rede de jogos do Boludeando e pode exibir anúncios de outros jogos do hub, gerenciados pela nossa plataforma própria Boludeando Ads, e processar pagamentos de anunciantes via MercadoPago." },
    { heading: "Anúncios recompensados", body: "Ao optar por ver um anúncio recompensado, você vê uma peça publicitária (nossa ou de um anunciante) em troca de um benefício dentro do jogo. Nenhuma informação pessoal adicional é coletada por esse mecanismo." },
    { heading: "Menores de idade", body: "O Embocalo não é direcionado especificamente a menores de 13 anos e não coletamos intencionalmente informações pessoais de menores." },
    { heading: "Mudanças nesta política", body: "Podemos atualizar esta política ocasionalmente. As mudanças são publicadas nesta mesma página." },
    { heading: "Contato", body: "Para dúvidas sobre privacidade, escreva para boludeando.app@gmail.com." },
  ],
};

export const TRANSLATIONS: Record<SupportedLanguage, Translation> = { es, en, pt };

export const AVAILABLE_LANGUAGES: { code: SupportedLanguage; name: string; flag: string }[] = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
];
