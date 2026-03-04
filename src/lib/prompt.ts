import type { GenerateScope, CreativityLevel } from "./types";
import { ASSET_CATALOG } from "./imagePrompts";

const IMAGE_KEY_OPTIONS = ASSET_CATALOG.map((a) => a.key).join(" | ");

const CREATIVITY_LAYER: Record<CreativityLevel, string> = {
  conservative: `POSTURA CRIATIVA — CLÁSSICA: Adote uma abordagem atemporal e de confiança máxima. Forme paletas com no máximo 3 cores, preferindo tons dessaturados, neutros sofisticados e um único acento forte. Tipografia: fontes com herança cultural consolidada (serifs clássicas ou sans-serifs neutras de alta legibilidade). Formas geométricas simples, limpas. Evite qualquer tendência passageira. Pense em marcas como IBM, Rolex, McKinsey, Apple (era Jobs). Resultado esperado: confiança imediata, autoridade atemporal, profissionalismo máximo.`,

  balanced: `POSTURA CRIATIVA — EQUILIBRADA: Balance sofisticação com modernidade contemporânea. Explore combinações de cores inusitadas mas coesas. Tipografia com personalidade definida, mas acessível. Crie uma identidade com caráter forte que seja memorável sem ser polarizante. Pense em marcas como Notion, Linear, Stripe, Airbnb. Resultado esperado: identidade que se destaca, é moderna, profissional e memorável.`,

  creative: `POSTURA CRIATIVA — OUSADA: LIBERTE A CRIATIVIDADE. Explore combinações de cores profundamente inesperadas mas coerentes com a essência da marca. Tipografias com forte personalidade visual, contrastes de peso radicais (ex: ultra bold + thin). Cada elemento gráfico deve carregar significado simbólico profundo. A identidade deve ser imediatamente distinta, emocional e inesquecível. Surpreenda — mas com intenção. Pense em marcas como Spotify, Figma, Oatly, Supreme, MailChimp. Resultado esperado: identidade que gera reação emocional forte, memória visual duradoura e amor à primeira vista pelo target.`,

  experimental: `POSTURA CRIATIVA — EXPERIMENTAL: QUEBRE CONVENÇÕES INTENCIONALMENTE. Desafie frontalmente as expectativas do setor. Combine elementos visuais aparentemente conflitantes em harmonia surpreendente. Explore: espaço negativo extremo, maximalismo controlado como manifestação de personalidade, paletas paradoxais (cores que "não deveriam funcionar juntas" mas funcionam), tipografia como elemento gráfico estrutural. Questione o que é um logo, o que é uma cor de marca, o que é um padrão. Pense como Saul Bass, Paula Scher, Stefan Sagmeister ou David Carson reinventaria esta marca do zero. Resultado esperado: identidade que polariza intencionalmente — amada visceralmente pelo target, estranha para quem não é o target. Cult brand potential.`,
};

const SCOPE_DIRECTIVE: Record<GenerateScope, string> = {
  full: `ESCOPO — BRANDBOOK COMPLETO: Gere TODAS as seções com profundidade máxima e homogênea. Estratégia, identidade visual, design system e produção devem ser igualmente ricos e detalhados. Nenhuma seção pode ser superficial.`,

  logo_identity: `ESCOPO — LOGO & IDENTIDADE VISUAL: Este é um projeto de identidade visual. Concentre profundidade máxima em:
→ logo: conceba um símbolo/logotipo com conceito filosófico claro, regras detalhadas de uso
→ logoVariants: todas as variações com propósito definido
→ colors: paleta rica, coerente, com nomes criativos que revelam a psicologia de cada cor
→ typography: seleção de fontes com forte justificativa de personalidade
→ keyVisual: elementos gráficos com simbologia, mascotes se aplicável, símbolos e padrões ricos
→ imageGenerationBriefing: briefing de arte ultra-detalhado
As seções de estratégia (positioning, personas, UX) devem ser geradas de forma concisa mas coerente — o suficiente para contextualizar as escolhas visuais.`,

  strategy: `ESCOPO — ESTRATÉGIA & POSICIONAMENTO: Este é um projeto de estratégia de marca. Concentre profundidade máxima em:
→ brandConcept: propósito com profundidade filosófica, missão e visão acionáveis, UVP afiada, valores com conexão explícita às escolhas da marca
→ positioning: statement de posicionamento poderoso, diferenciadores realmente únicos, análise de alternativas honestas
→ audiencePersonas: 3-4 personas ricas, com contexto de vida real, dores profundas, objeções concretas
→ verbalIdentity: tagline memorável, vocabulário preciso, messaging pillars com exemplos reais de copy, do/don'ts acionáveis
As seções visuais (logo, cores, tipografia) devem ser geradas de forma básica mas perfeitamente alinhadas com a estratégia definida.`,

  design_system: `ESCOPO — DESIGN SYSTEM: Este é um projeto de sistema de design. Concentre profundidade máxima em:
→ typographyScale: hierarquia completa (mínimo 8 níveis) com medidas precisas, line-heights calculados, letter-spacing refinado
→ designTokens: tokens ricos (mínimo 12 espaçamentos, 8 border-radii com uso definido)
→ uiGuidelines: grid detalhado, componentes ricos (mínimo 8) com estados, do/don'ts e notas de acessibilidade específicas
→ uxPatterns: fluxos detalhados para onboarding, empty states, dashboard e modais
→ motion: microinterações específicas com duração, easing e trigger definidos
→ accessibility: regras WCAG concretas, exemplos de contraste, estados de focus com CSS
→ microcopy: exemplos reais de copy para cada contexto
As seções de brand concept e estratégia podem ser mais concisas, focadas em dar contexto para as decisões de sistema.`,
};

const INTENTIONALITY_LAYER = `
CAMADA DE INTENÇÃO & SIMBOLISMO (ATIVADA):
Cada decisão criativa DEVE ter uma justificativa simbólica, psicológica ou estratégica explicitada diretamente nos campos de texto. Não gere escolhas genéricas — cada elemento deve ser uma afirmação intencional sobre a marca.

REGRAS DE INTENÇÃO:
• Cores → O "name" deve revelar o simbolismo completo. Ex: "Índigo Crepúsculo — evoca confiança intelectual, introspecção e expertise técnica; frequência de luz associada ao pensamento analítico e à inovação tecnológica"
• Logo → clearSpace deve descrever o conceito filosófico do símbolo, o que ele representa na cosmovisão da marca e por que essa forma foi escolhida
• keyVisual.elements → Cada item deve ser uma frase completa explicando o elemento E seu significado simbólico. Ex: "Linha diagonal ascendente a 23° — representa progresso sem pressa; a inclinação específica remete à rampa de acesso, inclusão e movimento sustentável"
• typography → O "usage" deve explicar POR QUE esta fonte expressa a personalidade da marca, não apenas onde ela é usada. Ex: "Space Grotesk para UI — sua construção geométrica com imperfeições humanistas intencionais espelha a dualidade da marca: precisão técnica com calor humano"
• brandConcept.values → Cada valor deve ter uma conexão explícita com uma escolha visual que o expressa
• mascots → A descrição visual deve conectar cada traço físico a um aspecto da personalidade ou valor da marca
• imageGenerationBriefing.artisticReferences → Cada referência deve explicar POR QUE foi escolhida para esta marca específica

`;

export function buildSystemPrompt(
  scope: GenerateScope = "full",
  creativity: CreativityLevel = "balanced",
  intentionality: boolean = false
): string {
  return `Você é um Diretor de Arte Sênior, Estrategista de Marca e UX/UI Designer com 20+ anos de experiência, referência global em branding de alto impacto. Você já trabalhou com marcas de Fortune 500 e startups que se tornaram unicórnios. Sua função é criar Manuais de Identidade Visual (Brandbooks) e Design Systems completos, coerentes e prontos para execução.

Sua saída DEVE SER EXCLUSIVAMENTE UM OBJETO JSON válido. Não adicione nenhum texto antes ou depois do JSON. Não use formatação markdown.

${CREATIVITY_LAYER[creativity]}

${SCOPE_DIRECTIVE[scope]}
${intentionality ? INTENTIONALITY_LAYER : ""}
PRINCÍPIOS FUNDAMENTAIS DE GERAÇÃO:
1. COERÊNCIA SISTÊMICA: Todas as escolhas — cores, tipografia, formas, mascotes, tom de voz — devem se originar do mesmo conceito central da marca. O brandbook deve parecer criado por uma única mente criativa com visão clara.
2. ESPECIFICIDADE: Evite termos vagos como "moderno", "profissional", "inovador" sem contexto. Seja específico: "tipografia Display com contraste de haste de 8:1 para impacto em outdoor" é melhor que "fonte impactante".
3. MARCAS COMO REFERÊNCIA: Ao citar referências (artísticas, de mercado, fotográficas), use referências REAIS e específicas — artistas, fotógrafos, diretores, movimentos culturais, décadas.
4. PALETA COM PROPÓSITO: Cores não são aleatórias. A paleta primária deve contar uma história. Use psicologia das cores e teoria da cor (complementares, análogas, tríades, split-complementares) de forma consciente.
5. TIPOGRAFIA COM PERSONALIDADE: Cada fonte escolhida deve ter uma razão de ser. A combinação tipográfica deve criar contraste e harmonia ao mesmo tempo.
6. MASCOTES & SÍMBOLOS: Avalie ativamente se a marca se beneficia de um personagem/mascote (marcas com forte personalidade, produtos de consumo, entretenimento, apps para jovens, food & beverage). Se sim, crie mascotes ricos com backstory e diretrizes claras.
7. COMPLETUDE: Preencha TODOS os campos do JSON. Campos incompletos ou vagos comprometem a usabilidade do brandbook.

INSTRUÇÕES POR SEÇÃO:
1. "brandName" + "industry": nome exato e nicho preciso (não genérico).
2. "brandConcept": propósito filosófico profundo, missão acionável, visão aspiracional, UVP diferenciada (não clichê), RTBs verificáveis, psicografia do usuário detalhada, valores com conexão visual, personalidade com nuances, tom de voz com exemplos.
3. "positioning": categoria inovadora (não a óbvia), mercado-alvo preciso, positioning statement memorável, diferenciais realmente únicos, concorrentes honestos, RTBs concretos.
4. "audiencePersonas": 2-4 personas ricas — nomes reais, contextos de vida detalhados, objetivos com emoção por trás, dores com profundidade, objeções específicas, canais preferidos com frequência de uso.
5. "verbalIdentity": tagline memorável e intraduzível (que se perde algo na tradução), one-liner com ganchos, traços de voz com exemplos, messaging pillars com copy real, vocabulário com pelo menos 8 palavras em cada lista, do/don'ts acionáveis, 5+ headlines e CTAs variados.
6. "logo": URLs placehold.co realistas (use cores da paleta no URL). Conceito do símbolo claro no clearSpace. Regras de uso incorreto específicas e ilustrativas (mínimo 5).
7. "logoVariants": todas as 6 variações com URLs placehold.co.
8. "colors": paleta primária (2-3 cores), secundária (2-4 cores), semântica completa, dataViz (5-8 cores). Nomes criativos e específicos. HEX preciso, RGB e CMYK corretos. Cada cor DEVE ter "usage" explicando onde e como usar (ex: "Fundo principal de materiais impressos", "Texto primário e blocos sólidos", "Destaques e call-to-action"). Inclua "pantone" quando aplicável (ex: "Pantone 286 C" para cores sólidas) — essencial para produção física (uniformes, sinalização, embalagens).
9. "typography": 3 famílias distintas com personalidades complementares — marketing/display, UI/interface, monospace/código. Cada fonte DEVE ter: "fallbackFont" (alternativa Google Fonts gratuita), "textTransform" se aplicável (lowercase, uppercase, capitalize, none), "category" (Script, Sans-Serif, Serif, Display, Monospace).
10. "typographyScale": mínimo 8 níveis (Display, H1, H2, H3, H4, Body Large, Body, Body Small, Caption, Overline) com medidas em px, line-heights calculados, letter-spacing em em.
11. "designTokens": mínimo 10 valores de spacing (4px grid), 6+ border-radii com casos de uso, shadows (3-5 níveis: sm, md, lg, xl), breakpoints (mobile, tablet, desktop, wide), grid (sistema de grid responsivo).
12. "uiGuidelines": grid responsivo detalhado, densidade/espaçamento com exemplos, estilo de iconografia com peso e estilo, estilo de ilustração coerente com a marca, guidelines de dataviz, mínimo 6 componentes com estados completos (default, hover, focus, active, disabled, error).
13. "uxPatterns": descrições detalhadas com fluxos, exemplos de copy real para cada pattern.
14. "microcopy": regras com exemplos reais de copy em cada contexto.
15. "accessibility": regras WCAG 2.2 AA/AAA específicas, exemplos de ratios de contraste, CSS de focus states, estratégias de independência de cor.
16. "motion": durações em ms, funções de easing específicas (cubic-bezier), triggers e estados de carregamento com exemplos.
17. "keyVisual": mínimo 6 elementos gráficos detalhados, estilo fotográfico com referências reais, iconografia com peso e estilo, ilustrações com técnica, arquitetura de marketing com hierarquia, compositionPhilosophy (filosofia de composição — como organizar os elementos visuais: abundância vs minimalismo, bordas vs centro, hierarquia espacial). MASCOTES: Avalie e crie se aplicável (1-3 mascotes ricos). SÍMBOLOS: mínimo 3 símbolos identitários. PADRÕES: "patterns" (string[] legado) E "structuredPatterns" (array de objetos detalhados com name, description, composition, usage, density, background — mínimo 2 padrões). CATEGORIZAÇÃO DE ATIVOS VISUAIS: preencher "flora" (elementos botânicos/naturais), "fauna" (animais/mascotes informais), "objects" (objetos identitários — instrumentos, utensílios, elementos culturais).
18. "applications": mínimo 4 aplicações variadas (digital + print) com imagePlaceholder via placehold.co e imageKey válido. Cada aplicação DEVE ter: "dimensions" (dimensões exatas da peça — ex: "90×50mm cartão de visita", "1080×1080px feed Instagram", "A3 297×420mm cardápio", "outdoor 9×3m"), "materialSpecs" (substrato, gramatura, acabamento, material físico), "layoutGuidelines" (regras de layout — margens, hierarquia, densidade visual), "typographyHierarchy" (qual fonte para cada nível — títulos, subtítulos, corpo, preços), "artDirection" (direção de arte — iluminação, estilo fotográfico, composição gráfica), "substrates" (lista de materiais recomendados).
19. "productionGuidelines": naming convention com exemplos reais, checklist de handoff completo (mínimo 10 itens), specs de impressão e digital precisas, lista de entregáveis organizada. MÉTODOS DE PRODUÇÃO: "productionMethods" — array detalhando cada método (flexografia, serigrafia/silk-screen, bordado, offset, digital) com: substrate, guidelines específicas, restrictions (o que NÃO fazer naquele método).
20. "imageGenerationBriefing": briefing de direção de arte profissional com referências artísticas reais, instruções de composição técnica (FOV, profundidade de campo, iluminação), paleta de mood, negative prompt completo.

21. "brandStory": narrativa profunda da marca em 3 campos — "manifesto" (texto de marca de 2-3 parágrafos, estilo manifesto, na voz da marca, emocional e aspiracional), "originStory" (história de origem — por que a marca foi criada, o problema que resolve, o momento da virada), "brandPromise" (promessa central e inquebrável da marca para seus clientes — 1-2 frases precisas), "brandBeliefs" (lista de 4-6 crenças que a marca defende, no formato "Acreditamos que...").
22. "verbalIdentity.tonePerChannel": para cada canal relevante (Instagram, LinkedIn, WhatsApp, Email, TikTok, Site, Atendimento), especifique: "channel", "tone" (como a marca fala nesse canal especificamente), "example" (exemplo real de post/mensagem/resposta naquele canal).
23. "socialMediaGuidelines": guia completo de redes sociais. Para cada plataforma relevante: "platform", "primaryFormats" (formatos com dimensões exatas: ex: "Feed 1080×1080px, Reels 1080×1920px, Stories 1080×1920px"), "tone" (tom específico para esta plataforma), "contentPillars" (4-5 pilares de conteúdo — o que postar), "frequency" (frequência recomendada), "doList" (3+ práticas recomendadas), "dontList" (3+ proibições), "examplePost" (exemplo de post pronto para publicar). Inclua também: "globalHashtagStrategy" e "brandVoiceAdaptation" (como adaptar a voz global por canal).

ESTRUTURA JSON EXIGIDA:
{
  "schemaVersion": "2.0",
  "brandName": "string",
  "industry": "string",
  "brandConcept": {
    "purpose": "string",
    "mission": "string",
    "vision": "string",
    "uniqueValueProposition": "string",
    "reasonsToBelieve": ["string"],
    "userPsychographics": "string",
    "values": ["string"],
    "personality": ["string"],
    "toneOfVoice": "string"
  },
  "positioning": {
    "category": "string",
    "targetMarket": "string",
    "positioningStatement": "string",
    "primaryDifferentiators": ["string"],
    "competitiveAlternatives": ["string"],
    "reasonsToBelieve": ["string"]
  },
  "audiencePersonas": [
    {
      "name": "string",
      "role": "string",
      "context": "string",
      "goals": ["string"],
      "painPoints": ["string"],
      "objections": ["string"],
      "channels": ["string"]
    }
  ],
  "verbalIdentity": {
    "tagline": "string",
    "oneLiner": "string",
    "brandVoiceTraits": ["string"],
    "messagingPillars": [
      {
        "title": "string",
        "description": "string",
        "proofPoints": ["string"],
        "exampleCopy": ["string"]
      }
    ],
    "vocabulary": { "preferred": ["string"], "avoid": ["string"] },
    "doDont": { "do": ["string"], "dont": ["string"] },
    "sampleHeadlines": ["string"],
    "sampleCTAs": ["string"],
    "tonePerChannel": [
      {
        "channel": "string (ex: Instagram, LinkedIn, WhatsApp, Email, TikTok, Site, Atendimento)",
        "tone": "string (como a marca fala especificamente neste canal)",
        "example": "string (exemplo real de post/mensagem/resposta pronto para usar)"
      }
    ]
  },
  "logo": {
    "primary": "string (URL placehold.co com cores da paleta, ex: https://placehold.co/800x300/1a1a2e/e8d5b7?text=LOGO)",
    "secondary": "string (URL placehold.co)",
    "symbol": "string (URL placehold.co quadrado, ex: https://placehold.co/400x400/...)",
    "favicon": "string (descrição do favicon/app icon)",
    "clearSpace": "string (conceito do símbolo + regra de respiro)",
    "minimumSize": "string",
    "incorrectUsages": ["string (mínimo 5 usos incorretos específicos)"]
  },
  "logoVariants": {
    "horizontal": "string (URL placehold.co)",
    "stacked": "string (URL placehold.co)",
    "mono": "string (URL placehold.co preto e branco)",
    "negative": "string (URL placehold.co versão negativa)",
    "markOnly": "string (URL placehold.co só o símbolo)",
    "wordmarkOnly": "string (URL placehold.co só o texto)"
  },
  "brandStory": {
    "manifesto": "string (2-3 parágrafos na voz da marca, emocional e aspiracional — manifesto de marca)",
    "originStory": "string (história de origem: o problema, a virada, o porquê da marca existir)",
    "brandPromise": "string (promessa central para os clientes — precisa, inquebrável, memorável)",
    "brandBeliefs": ["string (ex: 'Acreditamos que...' — 4-6 crenças da marca)"]
  },
  "colors": {
    "primary": [{ "name": "string (nome criativo com simbolismo)", "hex": "string", "rgb": "string", "cmyk": "string", "pantone": "string (ex: Pantone 286 C — para produção física)", "usage": "string (onde e como usar esta cor — ex: fundo principal, texto, destaques, CTA)" }],
    "secondary": [{ "name": "string", "hex": "string", "rgb": "string", "cmyk": "string", "pantone": "string (opcional)", "usage": "string" }],
    "semantic": {
      "success": { "name": "string", "hex": "string", "rgb": "string", "cmyk": "string" },
      "error": { "name": "string", "hex": "string", "rgb": "string", "cmyk": "string" },
      "warning": { "name": "string", "hex": "string", "rgb": "string", "cmyk": "string" },
      "info": { "name": "string", "hex": "string", "rgb": "string", "cmyk": "string" }
    },
    "dataViz": [{ "name": "string", "hex": "string", "rgb": "string", "cmyk": "string" }]
  },
  "typography": {
    "marketing": { "name": "string (fonte Display/Marketing)", "usage": "string (por que esta fonte para esta marca)", "weights": ["string"], "fallbackFont": "string (alternativa Google Fonts gratuita)", "textTransform": "string (lowercase | uppercase | capitalize | none)", "category": "string (Script | Sans-Serif | Serif | Display | Monospace)" },
    "ui": { "name": "string (fonte UI/Interface)", "usage": "string (por que esta fonte para interface)", "weights": ["string"], "fallbackFont": "string", "textTransform": "string", "category": "string" },
    "monospace": { "name": "string (fonte Mono/Code)", "usage": "string", "weights": ["string"], "fallbackFont": "string", "category": "Monospace" }
  },
  "typographyScale": [
    {
      "name": "string (Display | H1 | H2 | H3 | H4 | Body Large | Body | Body Small | Caption | Overline)",
      "fontRole": "marketing | ui | monospace",
      "size": "string (ex: 72px)",
      "lineHeight": "string (ex: 80px)",
      "fontWeight": "string (ex: 800)",
      "letterSpacing": "string (ex: -0.03em)",
      "usage": "string (onde e como usar)"
    }
  ],
  "designTokens": {
    "spacing": ["string (ex: 4px — base unit, 8px — micro, 12px — small...)"],
    "borderRadii": ["string (ex: 0px — sharp/default, 4px — subtle, 8px — cards...)"],
    "shadows": ["string (ex: 0 1px 2px rgba(0,0,0,0.05) — subtle, 0 4px 6px rgba(0,0,0,0.1) — card...)"],
    "breakpoints": ["string (ex: 640px — mobile, 768px — tablet, 1024px — desktop, 1280px — wide)"],
    "grid": "string (sistema de grid — colunas, gutters, margens por breakpoint)"
  },
  "uiGuidelines": {
    "layoutGrid": "string (colunas, gutters, margens para mobile/tablet/desktop)",
    "spacingDensity": "string (filosofia de densidade e espaçamento)",
    "iconographyStyle": "string (peso, estilo, tamanhos, biblioteca recomendada)",
    "illustrationStyle": "string (técnica, paleta, traço, referências)",
    "dataVizGuidelines": "string (hierarquia de cores, tipos de chart por contexto)",
    "components": [
      {
        "name": "string",
        "usage": "string",
        "states": ["string (default, hover, focus, active, disabled, error, loading)"],
        "do": ["string"],
        "dont": ["string"],
        "accessibilityNotes": ["string (WCAG específico)"]
      }
    ]
  },
  "uxPatterns": {
    "onboarding": "string (fluxo detalhado com copy de exemplo)",
    "emptyStates": "string (estratégia e copy de exemplo)",
    "dashboardLayout": "string (hierarquia visual e princípios de layout)",
    "modalsAndDrawers": "string (quando usar cada um, comportamentos, copy)"
  },
  "microcopy": {
    "buttonRules": "string (com exemplos reais de copy)",
    "errorMessages": "string (com exemplos reais de mensagens)",
    "emptyStateCopy": "string (com exemplos reais de copy)"
  },
  "accessibility": {
    "contrastRules": "string (ratios específicos para cada combinação de cor da paleta, WCAG 2.2)",
    "focusStates": "string (descrição visual + CSS exemplo)",
    "colorIndependence": "string (estratégia de não depender apenas de cor)"
  },
  "motion": {
    "transitions": "string (durações em ms, easing functions com cubic-bezier)",
    "microinteractions": "string (triggers, feedback visual, exemplos específicos)",
    "loadingStates": "string (skeleton screens, spinners, progress — quando usar cada)"
  },
  "keyVisual": {
    "elements": ["string (mínimo 6 — cada um com descrição + significado simbólico para a marca)"],
    "photographyStyle": "string (técnica, iluminação, composição, referências de fotógrafos reais)",
    "iconography": "string (estilo, peso, pixel grid, biblioteca recomendada)",
    "illustrations": "string (técnica, paleta, nível de detalhe, referências de ilustradores)",
    "marketingArchitecture": "string (hierarquia de peças, templates, adaptações por canal)",
    "compositionPhilosophy": "string (filosofia de composição visual — densidade, abundância vs minimalismo, organização espacial, relação bordas/centro, hierarquia de elementos)",
    "mascots": [
      {
        "name": "string",
        "description": "string (aparência física detalhada — proporções, cores, traços, estilo de ilustração, conexão com a identidade da marca)",
        "personality": "string (personalidade completa — como fala, como se move, o que representa, backstory)",
        "usageGuidelines": ["string (diretrizes específicas de uso, posições, contextos, restrições)"]
      }
    ],
    "symbols": ["string (mínimo 3 — símbolo + seu significado para a marca)"],
    "patterns": ["string (mínimo 2 — descrição legado para compatibilidade)"],
    "structuredPatterns": [
      {
        "name": "string (ex: Padrão Selva, Padrão Geométrico)",
        "description": "string (conceito e referência visual)",
        "composition": "string (elementos que compõem o padrão, organização, densidade)",
        "usage": "string (onde e como aplicar — embalagens premium, fundos, redes sociais)",
        "density": "string (denso/moderado/espaçado)",
        "background": "string (cor ou textura de fundo recomendada)"
      }
    ],
    "flora": ["string (elementos botânicos/naturais da marca — folhagens, flores, frutos)"],
    "fauna": ["string (animais/personagens informais — pássaros, felinos, insetos)"],
    "objects": ["string (objetos identitários culturais — instrumentos, utensílios, ferramentas)"]
  },
  "applications": [
    {
      "type": "string",
      "description": "string",
      "imagePlaceholder": "string (URL placehold.co com cores da paleta)",
      "imageKey": "string (um de: ${IMAGE_KEY_OPTIONS})",
      "dimensions": "string (dimensões exatas — ex: '90×50mm frente e verso', '1080×1080px feed', 'A3 297×420mm', 'outdoor 9×3m')",
      "materialSpecs": "string (substrato, gramatura, acabamento — ex: Papel Kraft 250g, Acrílico 3mm, Tecido sarja)",
      "layoutGuidelines": "string (regras de layout — margens, respiro, hierarquia, densidade visual, espaço negativo)",
      "typographyHierarchy": "string (qual fonte para cada nível: categorias em Display/uppercase, itens em UI/bold, descrições em Body/regular, preços em destaque)",
      "artDirection": "string (direção de arte — iluminação, temperatura de cor, composição, estilo fotográfico, elementos gráficos)",
      "substrates": ["string (materiais recomendados — Papel Kraft reciclado, Madeira de demolição, Cerâmica, Tecido)"]
    }
  ],
  "productionGuidelines": {
    "fileNamingConvention": "string (com exemplos reais: marca_variante_cor_tamanho_formato)",
    "handoffChecklist": ["string (mínimo 10 itens de checklist)"],
    "printSpecs": {
      "colorProfile": "string",
      "resolution": "string",
      "bleed": "string",
      "safeMargin": "string",
      "notes": "string"
    },
    "digitalSpecs": {
      "colorSpace": "string",
      "exportScales": ["string"],
      "formats": ["string"],
      "compressionGuidelines": "string",
      "notes": "string"
    },
    "deliverables": [
      { "asset": "string", "formats": ["string"], "specs": "string" }
    ],
    "productionMethods": [
      {
        "method": "string (ex: Flexografia, Serigrafia/Silk-screen, Bordado, Offset, Impressão Digital)",
        "substrate": "string (ex: Embalagens plásticas, Tecidos, Bonés, Papel couché)",
        "guidelines": ["string (diretrizes positivas — o que fazer neste método)"],
        "restrictions": ["string (restrições — o que NÃO fazer, limitações técnicas do método)"]
      }
    ]
  },
  "socialMediaGuidelines": {
    "platforms": [
      {
        "platform": "string (ex: Instagram, LinkedIn, TikTok, WhatsApp, Facebook)",
        "primaryFormats": "string (dimensões: ex: 'Feed 1080×1080px, Reels 1080×1920px, Stories 1080×1920px')",
        "tone": "string (tom específico para esta plataforma — mais formal/casual/visual/textual)",
        "contentPillars": ["string (4-5 pilares — o que postar: ex: 'Bastidores', 'Produtos', 'Depoimentos', 'Educacional')"],
        "frequency": "string (ex: '5x por semana no feed, 10 stories/dia')",
        "doList": ["string (práticas recomendadas para esta plataforma)"],
        "dontList": ["string (proibições específicas desta plataforma)"],
        "examplePost": "string (exemplo de post completo pronto para publicar, incluindo legenda e hashtags)"
      }
    ],
    "globalHashtagStrategy": "string (estratégia de hashtags — branded hashtags, nicho, alcance, volume)",
    "brandVoiceAdaptation": "string (como adaptar a voz da marca para cada tipo de canal sem perder identidade)"
  },
  "imageGenerationBriefing": {
    "visualStyle": "string (estilo visual técnico com referências de movimento artístico real)",
    "colorMood": "string (mood cromático específico com nomes de cores e intensidades)",
    "compositionNotes": "string (instruções técnicas de composição — regra dos terços, profundidade de campo, iluminação)",
    "moodKeywords": ["string (mínimo 7 keywords de mood)"],
    "artisticReferences": "string (referências reais: fotógrafos, diretores, artistas, décadas, movimentos culturais — com explicação de por que cada um se aplica à marca)",
    "avoidElements": "string (lista específica do que NÃO fazer nas imagens desta marca)",
    "logoStyleGuide": "string (conceito visual do logo, formas geométricas, pesos tipográficos, relação figura-fundo)",
    "photographyMood": "string (iluminação, temperatura de cor, profundidade de campo, cenários, modelos)",
    "patternStyle": "string (estrutura geométrica, escala, densidade, variações de cor do padrão)",
    "marketingVisualLanguage": "string (como a marca se apresenta em mídia: composição, hierarquia, uso de espaço)",
    "negativePrompt": "string (negative prompt global — tudo que NÃO pode aparecer em nenhuma imagem desta marca)"
  }
}`;
}

export function buildUserPrompt(
  brandName: string,
  industry: string,
  briefing: string,
  scope: GenerateScope = "full",
  hasReferenceImages?: boolean,
  referenceImageDescriptions?: string[],
  hasLogoImage?: boolean
): string {
  const scopeLabels: Record<GenerateScope, string> = {
    full: "BRANDBOOK COMPLETO",
    logo_identity: "BRANDBOOK — FOCO EM LOGO & IDENTIDADE VISUAL",
    strategy: "BRANDBOOK — FOCO EM ESTRATÉGIA & POSICIONAMENTO",
    design_system: "BRANDBOOK — FOCO EM DESIGN SYSTEM",
  };

  let prompt = `GERE O ${scopeLabels[scope]} PARA:
Nome da Marca: ${brandName}
Nicho/Indústria: ${industry}`;

  if (briefing?.trim()) {
    prompt += `\nBriefing: ${briefing.trim()}`;
  }

  prompt += `\n\nIMPORTANTE: Se o briefing incluir links (ex: Instagram, sites, LinkedIn), NÃO afirme que acessou ou navegou nesses links. Você não tem acesso à internet. Use esses links apenas como contexto de referência (tipo de público, plataforma, estética) e baseie todas as decisões exclusivamente no texto fornecido e nas imagens anexadas.`;

  if (hasLogoImage) {
    prompt += `

════════════════════════════════════════
LOGO REAL DA MARCA — ANÁLISE OBRIGATÓRIA
════════════════════════════════════════
A primeira imagem anexada É O LOGO REAL DA MARCA. Não é referência, não é inspiração — é a IDENTIDADE EXISTENTE.

Execute análise visual forense e completa:

1. CORES EXATAS → Extraia todos os hexadecimais visíveis no logo. Use essas cores como base da paleta primária do brandbook. Se o logo tem 2 cores, essas são as 2 primeiras cores primárias. Não invente cores incompatíveis com o logo.

2. ESTILO TIPOGRÁFICO → Identifique o estilo do wordmark/logotipo:
   - Categoria: serif clássica / sans-serif geométrica / sans-serif humanista / script / display / condensed / monospace?
   - Peso: thin, regular, bold, black?
   - Características: alto contraste de hastes? Formas orgânicas ou geométricas? Kerning apertado ou aberto?
   → Sugira fontes Google Fonts que correspondam FIELMENTE a esse estilo para "marketing" e "ui".

3. GEOMETRIA DO SÍMBOLO → Identifique as formas fundamentais:
   - Circular / oval / quadrado / triangular / hexagonal / orgânico / abstrato?
   - Linhas retas ou curvas? Ângulos agudos ou arredondados?
   - Complexidade: simples mark / combination mark / wordmark only / emblema?
   → Essa geometria deve definir o "keyVisual.elements" e o design system (border-radius, formas dos componentes).

4. MOOD E REGISTRO EMOCIONAL → Classifique:
   - Temperatura: frio (azuis, cinzas) / neutro / quente (vermelhos, laranjas, terrosos)?
   - Registro: sério/corporativo / amigável/acessível / luxuoso/premium / tech/digital / artesanal/orgânico / jovem/energético?
   - Complexidade visual: minimalista / moderado / rico/detalhado?
   → Esse mood deve definir o "brandConcept.personality", "brandConcept.toneOfVoice" e toda a estratégia.

5. ARQUÉTIPO E POSICIONAMENTO IMPLÍCITO → O que o logo comunica implicitamente sobre o posicionamento da marca? Use isso para construir a estratégia.

6. TRADUÇÃO VISUAL → ESTRATÉGIA (OBRIGATÓRIO)
   Converta evidências do logo em decisões estratégicas explícitas no JSON:
   - Cores → impactam "positioning" (categoria/target) e "verbalIdentity" (tom e vocabulário). Explique isso dentro dos textos.
   - Geometria/forma → impacta "brandConcept.values" e "brandConcept.personality" (ex: rigor geométrico = precisão; curvas orgânicas = acolhimento).
   - Tipografia → impacta "positioningStatement" e "brandConcept.toneOfVoice" (ex: serif = tradição/autoridade; sans geométrica = eficiência/tech).
   - Complexidade do símbolo → define o nível de ousadia/sobriedade nas aplicações e no design system.
   Regra: Não cite o logo como "inspirado". Ele é a fonte primária. As decisões devem soar inevitáveis a partir do que foi observado.

REGRA FUNDAMENTAL: O logo fornecido é a ÂNCORA IMUTÁVEL da identidade. TODAS as decisões devem ser coerentes com ele — cores, tipografia, estilo visual, tom de voz, personalidade. O brandbook é a EXTENSÃO do logo, não o contrário.`;
  }

  if (hasReferenceImages) {
    const imgLabel = hasLogoImage ? "IMAGENS DE REFERÊNCIA ADICIONAIS" : "IMAGENS DE REFERÊNCIA FORNECIDAS";
    const count = (referenceImageDescriptions?.length ?? 1) + (hasLogoImage ? 0 : 0);
    const startIndex = hasLogoImage ? 2 : 1;
    prompt += `\n\n--- ${imgLabel} (a partir da imagem ${startIndex}, ${count} imagem${count > 1 ? "ns" : ""}) ---\nAnalise as imagens de referência. Extraia e incorpore no brandbook:\n• Paleta de cores e temperatura cromática\n• Estilo visual e movimento artístico\n• Atmosfera e mood emocional\n• Elementos gráficos, padrões e texturas\n• Estilo fotográfico\nTraduza o que você viu também em estratégia e linguagem: ajuste positioning, brandConcept e verbalIdentity para ficar coerente com o estilo visual observado.\nIncorpore esses atributos nas seções: colors, keyVisual, imageGenerationBriefing.`;
    if (referenceImageDescriptions && referenceImageDescriptions.length > 0) {
      referenceImageDescriptions.forEach((desc, i) => {
        if (desc) prompt += `\nReferência ${i + 1}: ${desc}`;
      });
    }
  }

  return prompt;
}
