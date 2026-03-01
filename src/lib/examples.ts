import { BrandbookData } from "./types";

export const saasExample: BrandbookData = {
  schemaVersion: "2.0",
  brandName: "CloudFlow",
  industry: "SaaS / B2B Software",
  brandConcept: {
    purpose: "Simplificar a gestão de fluxos de trabalho complexos de TI.",
    mission: "Fornecer ferramentas intuitivas que capacitem equipes técnicas a operarem com máxima eficiência.",
    vision: "Ser a plataforma padrão global para orquestração de nuvem híbrida.",
    uniqueValueProposition: "Orquestração de nuvem híbrida tão simples quanto arrastar e soltar, focada na redução imediata do atrito do desenvolvedor.",
    reasonsToBelieve: [
      "Integração nativa com AWS, Azure e GCP",
      "Redução de 40% no tempo de setup de ambientes",
      "SOC2 Type II Certified"
    ],
    userPsychographics: "CTOs e DevOps que temem perder controle sobre a infraestrutura e sofrem de 'burnout' com ferramentas complexas demais.",
    values: ["Simplicidade", "Confiança", "Agilidade", "Transparência"],
    personality: ["Profissional", "Especialista", "Acessível", "Inovadora"],
    toneOfVoice: "Claro, objetivo, orientativo e seguro. Voz ativa e no tempo presente."
  },
  positioning: {
    category: "Plataforma de Automação DevOps / Orquestração de Infra",
    targetMarket: "Times de TI e Plataforma (mid-market e enterprise) com stack multi-cloud",
    positioningStatement: "Para times DevOps que precisam reduzir atrito e risco operacional, CloudFlow é a plataforma de orquestração que simplifica workflows complexos com visibilidade e governança — sem sacrificar velocidade.",
    primaryDifferentiators: [
      "Automação visual (drag-and-drop) + modo avançado via YAML/CLI",
      "Governança e auditoria prontas para compliance",
      "Integrações nativas com AWS/Azure/GCP e tooling DevOps",
    ],
    competitiveAlternatives: [
      "Scripts internos e pipelines frágeis",
      "Ferramentas de CI/CD genéricas",
      "Plataformas de automação com curva de aprendizado alta",
    ],
    reasonsToBelieve: [
      "Redução de 40% no tempo de setup de ambientes",
      "SOC2 Type II Certified",
      "Templates prontos para os fluxos mais comuns de cloud",
    ],
  },
  audiencePersonas: [
    {
      name: "Marina",
      role: "CTO",
      context: "Precisa de previsibilidade, compliance e custo controlado em um roadmap agressivo.",
      goals: ["Governança", "Reduzir riscos", "Acelerar entregas"],
      painPoints: ["Ferramentas desconectadas", "Falta de auditoria", "Deploys inconsistentes"],
      objections: ["Tempo de adoção", "Segurança", "Lock-in"],
      channels: ["LinkedIn", "Eventos de tecnologia", "Webinars"],
    },
    {
      name: "Rafael",
      role: "DevOps Lead",
      context: "Equipe vive apagando incêndio; quer padronizar deploy e observabilidade.",
      goals: ["Padronizar pipelines", "Diminuir toil", "Aumentar confiabilidade"],
      painPoints: ["Alert fatigue", "Pipelines quebradiços", "Config sprawl"],
      objections: ["Integração com stack atual", "Performance", "Preço"],
      channels: ["GitHub", "Comunidades DevOps", "YouTube"],
    },
    {
      name: "Ana",
      role: "Platform Engineer",
      context: "Cuida de self-service interno e quer UX boa para devs.",
      goals: ["Self-service", "Experiência do dev", "Automação segura"],
      painPoints: ["Documentação defasada", "Ambientes inconsistentes", "Permissões confusas"],
      objections: ["Flexibilidade", "Customização", "Observabilidade"],
      channels: ["Docs", "Slack/Discord", "Blog técnico"],
    },
  ],
  verbalIdentity: {
    tagline: "Orquestre. GovernE. Entregue mais rápido.",
    oneLiner: "CloudFlow simplifica a automação multi-cloud com visibilidade e governança de ponta a ponta.",
    brandVoiceTraits: ["confiante", "técnica", "objetiva", "parceira"],
    messagingPillars: [
      {
        title: "Simplicidade com profundidade",
        description: "Interface visual para começar rápido, com poder total para casos avançados.",
        proofPoints: ["drag-and-drop + YAML", "templates prontos", "boas práticas embutidas"],
        exampleCopy: ["Do zero ao deploy em minutos — com controle total."]
      },
      {
        title: "Governança e confiança",
        description: "Rastreabilidade e auditoria para operar com segurança em escala.",
        proofPoints: ["auditoria", "papéis e permissões", "logs estruturados"],
        exampleCopy: ["Menos risco. Mais previsibilidade."]
      },
      {
        title: "Produtividade DevOps",
        description: "Reduza toil e libere o time para trabalho de alto impacto.",
        proofPoints: ["padronização", "automação", "observabilidade"],
        exampleCopy: ["Pare de apagar incêndios. Automatize com padrão."]
      }
    ],
    vocabulary: {
      preferred: ["governança", "orquestração", "confiabilidade", "observabilidade", "self-service"],
      avoid: ["mágica", "milagre", "fácil demais", "sem esforço", "um clique"],
    },
    doDont: {
      do: ["Use frases curtas", "Explique conceitos com clareza", "Mostre resultado mensurável"],
      dont: ["Prometer 100% sem exceções", "Jargão sem explicar", "Humor em contexto crítico"],
    },
    sampleHeadlines: [
      "Automação multi-cloud com governança de verdade.",
      "Da complexidade ao controle: workflows claros e auditáveis.",
      "Padronize deploys sem travar o time."
    ],
    sampleCTAs: ["Ver demo", "Começar agora", "Falar com especialista", "Baixar whitepaper"],
  },
  logo: {
    primary: "https://placehold.co/800x400/ffffff/2563eb?text=CloudFlow+Primary",
    secondary: "https://placehold.co/400x400/2563eb/ffffff?text=CF+Secondary",
    symbol: "https://placehold.co/200x200/ffffff/2563eb?text=Cloud+Node+Icon",
    favicon: "Deve ser legível em 16x16px, usando a primeira letra 'C' com espessura reforçada.",
    clearSpace: "Espaçamento mínimo igual à altura da letra 'C' do logotipo.",
    minimumSize: "Digital: 80px. Impresso: 20mm.",
    incorrectUsages: [
      "Não achatar",
      "Não usar clichês (foguetes, engrenagens)",
      "Não colocar sobre fundos complexos sem box de proteção"
    ]
  },
  logoVariants: {
    horizontal: "https://placehold.co/1200x400/ffffff/2563eb?text=CloudFlow+Horizontal",
    stacked: "https://placehold.co/600x600/ffffff/2563eb?text=CloudFlow+Stacked",
    mono: "https://placehold.co/800x400/ffffff/111827?text=CloudFlow+Mono",
    negative: "https://placehold.co/800x400/0f172a/ffffff?text=CloudFlow+Negative",
    markOnly: "https://placehold.co/400x400/ffffff/2563eb?text=CF+Mark",
    wordmarkOnly: "https://placehold.co/900x300/ffffff/2563eb?text=CloudFlow+Wordmark",
  },
  colors: {
    primary: [
      { name: "Trust Blue (Brand-600)", hex: "#2563EB", rgb: "37, 99, 235", cmyk: "84, 58, 0, 8" },
      { name: "Deep Space (Navy-900)", hex: "#0F172A", rgb: "15, 23, 42", cmyk: "90, 75, 45, 75" }
    ],
    secondary: [
      { name: "Slate Gray (Gray-500)", hex: "#64748B", rgb: "100, 116, 139", cmyk: "60, 45, 35, 10" },
      { name: "Cloud White", hex: "#FFFFFF", rgb: "255, 255, 255", cmyk: "0, 0, 0, 0" }
    ],
    semantic: {
      success: { name: "Green-500", hex: "#10B981", rgb: "16, 185, 129", cmyk: "76, 0, 61, 0" },
      error: { name: "Red-500", hex: "#EF4444", rgb: "239, 68, 68", cmyk: "0, 85, 80, 0" },
      warning: { name: "Amber-500", hex: "#F59E0B", rgb: "245, 158, 11", cmyk: "0, 40, 100, 0" },
      info: { name: "Blue-400", hex: "#3B82F6", rgb: "59, 130, 246", cmyk: "70, 45, 0, 0" }
    },
    dataViz: [
      { name: "Chart Purple", hex: "#8B5CF6", rgb: "139, 92, 246", cmyk: "60, 70, 0, 0" },
      { name: "Chart Teal", hex: "#14B8A6", rgb: "20, 184, 166", cmyk: "75, 0, 40, 0" }
    ]
  },
  typography: {
    marketing: { name: "Inter", usage: "Títulos de Landing Page, Hero sections", weights: ["Bold", "ExtraBold", "Black"] },
    ui: { name: "Roboto", usage: "Menus, botões, modais, texto corrido", weights: ["Regular", "Medium"] },
    monospace: { name: "Fira Code", usage: "Snippets de código, IDs de recursos, números de tabelas", weights: ["Regular"] }
  },
  typographyScale: [
    { name: "H1", fontRole: "marketing", size: "48px", lineHeight: "56px", fontWeight: "800", letterSpacing: "-0.02em", usage: "Hero / títulos principais" },
    { name: "H2", fontRole: "marketing", size: "32px", lineHeight: "40px", fontWeight: "800", letterSpacing: "-0.01em", usage: "Seções e headlines" },
    { name: "H3", fontRole: "ui", size: "20px", lineHeight: "28px", fontWeight: "700", usage: "Títulos em cards" },
    { name: "Body", fontRole: "ui", size: "16px", lineHeight: "24px", fontWeight: "400", usage: "Texto corrido" },
    { name: "Caption", fontRole: "ui", size: "12px", lineHeight: "16px", fontWeight: "500", usage: "Rótulos e meta" },
    { name: "Code", fontRole: "monospace", size: "13px", lineHeight: "18px", fontWeight: "400", usage: "IDs, logs, exemplos" },
  ],
  designTokens: {
    spacing: ["Sp-Sm: 8px", "Sp-Md: 16px", "Sp-Lg: 24px", "Sp-Xl: 32px"],
    borderRadii: ["Radius-Sm: 4px", "Radius-Md: 6px (Botões)", "Radius-Lg: 12px (Cards)"]
  },
  uiGuidelines: {
    layoutGrid: "Grid 12 col (desktop), 6 col (tablet), 4 col (mobile). Container max 1200px.",
    spacingDensity: "Confortável (SaaS). Respiro alto em dashboards; densidade média em tabelas.",
    iconographyStyle: "Outline 24px, stroke 1.5px, cantos levemente arredondados.",
    illustrationStyle: "Blueprint/isométrico, monocromático com acento Trust Blue.",
    dataVizGuidelines: "Use até 6 cores; sempre legendas claras; padrões para daltonismo; tooltip com valores exatos.",
    components: [
      {
        name: "Button",
        usage: "Ação primária sempre única por tela.",
        states: ["default", "hover", "pressed", "disabled", "loading"],
        do: ["Use verbo de ação", "Mostre loading no próprio botão"],
        dont: ["Dois primários lado a lado", "Texto genérico como 'Enviar'"],
        accessibilityNotes: ["Focus ring visível", "Alvo mínimo 44px"],
      },
      {
        name: "Input",
        usage: "Formulários e filtros.",
        states: ["default", "focus", "error", "disabled"],
        do: ["Use label sempre", "Erro com texto objetivo"],
        dont: ["Placeholder como label", "Erros vagos"],
        accessibilityNotes: ["Associe label e aria-describedby", "Mensagem de erro persistente"],
      },
      {
        name: "Card",
        usage: "Agrupar conteúdo e KPIs.",
        states: ["default", "hover"],
        do: ["Títulos curtos", "Espaçamento consistente"],
        dont: ["Card clicável sem affordance", "Sombras excessivas"],
        accessibilityNotes: ["Ordem de tab correta", "Foco em cards interativos"],
      },
    ],
  },
  uxPatterns: {
    onboarding: "Utilizar 'Progressive Disclosure' para não sobrecarregar o usuário.",
    emptyStates: "Obrigatório: 1) Ilustração 'Blueprint', 2) Texto claro do motivo, 3) CTA primário.",
    dashboardLayout: "Padrão de leitura F. KPIs vitais no topo esquerdo. Cards com muito respiro.",
    modalsAndDrawers: "Modais centrais apenas para ações destrutivas. Drawers laterais para detalhes."
  },
  microcopy: {
    buttonRules: "Omitir artigos, usar Sentence Case (ex: 'Criar servidor').",
    errorMessages: "Nunca culpar o usuário. Substituir 'Senha errada' por 'A senha não confere. Tente novamente.'",
    emptyStateCopy: "Focar na próxima ação acionável. Ex: 'Comece conectando sua conta AWS.'"
  },
  accessibility: {
    contrastRules: "Taxa de contraste mínima de 4.5:1 (WCAG AA) para textos em botões primários.",
    focusStates: "Obrigatório anel de foco (outline: 2px solid Trust Blue) em todos os elementos clicáveis.",
    colorIndependence: "Estados de erro devem sempre vir acompanhados de ícones e nunca depender apenas da cor."
  },
  motion: {
    transitions: "Rápidas e secas (150ms-200ms ease-out) para transmitir alta performance.",
    microinteractions: "Botões devem ter efeito de 'press' (scale 0.98) e feedback de loading interno.",
    loadingStates: "Proibido tela branca. Utilizar 'Skeleton Screens' cinza claro."
  },
  keyVisual: {
    elements: [
      "Linhas conectivas abstratas representando fluxos (Blueprint Look)",
      "Mockups de interface limpos flutuantes",
      "Glows sutis em Trust Blue em fundos escuros"
    ],
    photographyStyle: "Foco em pessoas colaborando em ambiente corporativo moderno. Tons iluminados.",
    iconography: "Pixel Grid 24x24px. Estilo Outline (traço 1.5px), cantos levemente arredondados.",
    illustrations: "Estilo 'Blueprint': diagramas esquemáticos e isométricos para transmitir rigor técnico.",
    marketingArchitecture: "Hierarquia: Claim em Inter ExtraBold + Subtítulo em Gray-500 + CTA primário + Prova Social."
  },
  applications: [
    {
      type: "Dashboard Vazio (Empty State)",
      description: "Tela inicial do usuário recém-cadastrado. Ilustração Blueprint, microcopy orientativo e CTA claro.",
      imagePlaceholder: "https://placehold.co/1200x800/f8fafc/2563eb?text=Empty+State+Dashboard",
      imageKey: "app_mockup"
    },
    {
      type: "Modal de Confirmação (Destrutivo)",
      description: "Modal aplicando regras de A11y, cores semânticas de erro e UX Writing livre de culpa.",
      imagePlaceholder: "https://placehold.co/800x600/ffffff/ef4444?text=Destructive+Modal",
      imageKey: "app_mockup"
    },
    {
      type: "Hero Section (Landing Page)",
      description: "Arquitetura de Marketing: Título forte, mockup flutuante da UI e logos de clientes.",
      imagePlaceholder: "https://placehold.co/1200x600/0f172a/3b82f6?text=Dark+Hero+Section",
      imageKey: "hero_visual"
    }
  ],
  productionGuidelines: {
    fileNamingConvention: "cloudflow_[tipo]_[plataforma]_[tamanho]_[versao]_[data] (ex: cloudflow_logo_svg_primary_2026-03-01)",
    handoffChecklist: [
      "Logos em SVG + PNG transparente",
      "Paleta com HEX/RGB/CMYK + tokens",
      "Fontes listadas + links Google Fonts",
      "Component guidelines + estados",
      "Templates de social e email",
    ],
    printSpecs: {
      colorProfile: "CMYK (FOGRA39 ou perfil local)",
      resolution: "300 dpi",
      bleed: "3 mm",
      safeMargin: "3–5 mm",
      notes: "Converter fontes em curvas quando necessário e revisar overprint.",
    },
    digitalSpecs: {
      colorSpace: "sRGB",
      exportScales: ["1x", "2x"],
      formats: ["SVG", "PNG-24", "JPG"],
      compressionGuidelines: "Preferir SVG para ícones/logos; PNG para UI; JPG para fotos (80–85% qualidade).",
      notes: "Garantir contraste e verificar dark mode quando aplicável.",
    },
    deliverables: [
      { asset: "Logo pack", formats: ["SVG", "PNG"], specs: "Primary/secondary/mono/negative + mark/word." },
      { asset: "Social templates", formats: ["Figma", "PNG"], specs: "1:1 e 16:9 com safe zones." },
      { asset: "Email header", formats: ["PNG", "JPG"], specs: "600px largura, 2x export." },
    ],
  },
  imageGenerationBriefing: {
    visualStyle: "Swiss International Style meets modern SaaS design system. Clean geometric precision, monochromatic navy-blue palette with electric blue accents, no decorative elements.",
    colorMood: "Cool, authoritative and tech-forward. Deep space navy (#0F172A) backgrounds with Trust Blue (#2563EB) as electric accent. Cold grays as supporting neutrals.",
    compositionNotes: "Asymmetric grid-based layouts with deliberate white space. Rule of thirds respected. Data and UI elements as primary visual subjects.",
    moodKeywords: ["precise", "trustworthy", "scalable", "professional", "innovative"],
    artisticReferences: "Dieter Rams industrial design principles + Swiss Grid typography system + Linear app aesthetic + Vercel brand photography",
    avoidElements: "Warm colors, organic shapes, stock photo clichés, fake teamwork photos, excessive gradients, drop shadows, decorative borders",
    logoStyleGuide: "Abstract geometric node/cloud icon. Thin-weight Inter ExtraBold wordmark. Maximum 2 colors: Trust Blue on white, or white on navy. Sharp angles, no rounded corners on icon.",
    photographyMood: "Controlled studio with dark seamless background (#0F172A), blue rim lighting on tech products. Lifestyle: modern open-plan office, natural north light, shallow DOF.",
    patternStyle: "Isometric grid lines or circuit-board inspired tessellation in Trust Blue on transparent/navy background. Subtle, low opacity.",
    marketingVisualLanguage: "Code snippets as decorative graphic elements. UI component cards floating with subtle glow. Bold Inter ExtraBold claims. Terminal/CLI aesthetics in hero sections.",
    negativePrompt: "blurry, low quality, watermark, stock photo, fake smile, warm colors, retro, vintage, handwriting, decorative ornaments, gradients unless purposeful, overexposed, jpeg artifacts"
  }
};

export const barExample: BrandbookData = {
  schemaVersion: "2.0",
  brandName: "Neon Tokyo Bar",
  industry: "Nightlife & Bar",
  brandConcept: {
    purpose: "Oferecer uma imersão na cultura cyberpunk e vida noturna de Tóquio.",
    mission: "Proporcionar experiências sensoriais únicas através de coquetéis inovadores e ambiente imersivo.",
    vision: "Ser referência nacional em bares temáticos e mixologia asiática.",
    values: ["Inovação", "Autenticidade", "Imersão", "Excelência", "Atmosfera"],
    personality: ["Vibrante", "Misterioso", "Moderno", "Ousado"],
    toneOfVoice: "Direto, noturno, provocativo e tecnológico."
  },
  positioning: {
    category: "Bar Temático / Nightlife Experience",
    targetMarket: "Jovens adultos 21–35 que buscam experiências imersivas e estética cyberpunk",
    positioningStatement: "Para quem quer viver a noite como uma experiência cinematográfica, Neon Tokyo Bar é o destino que combina mixologia autoral e atmosfera cyberpunk em um ambiente imersivo e fotografável.",
    primaryDifferentiators: ["Cenografia neon", "Drinks autorais", "Conteúdo instagramável"],
    competitiveAlternatives: ["Bares tradicionais", "Baladas genéricas", "Cocktail bars clássicos"],
    reasonsToBelieve: ["Carta sazonal", "Ambientação com iluminação profissional", "Eventos temáticos"],
  },
  audiencePersonas: [
    {
      name: "Luiza",
      role: "Criadora de conteúdo",
      context: "Busca lugares 'instagramáveis' e experiências com estética forte.",
      goals: ["Fotos e vídeos", "Experiência única", "Drinks diferentes"],
      painPoints: ["Ambientes sem identidade", "Drinks comuns", "Música ruim"],
      objections: ["Fila", "Preço", "Localização"],
      channels: ["Instagram", "TikTok", "Indicação de amigos"],
    },
    {
      name: "Bruno",
      role: "Entusiasta de coquetelaria",
      context: "Valoriza drinks bem executados e carta assinada.",
      goals: ["Provar novidades", "Qualidade", "Ambiente"],
      painPoints: ["Drinks mal balanceados", "Atendimento lento"],
      objections: ["Consistência", "Lotação"],
      channels: ["Google Maps", "Blogs", "Instagram"],
    },
  ],
  verbalIdentity: {
    tagline: "A noite tem neon. E tem gosto.",
    oneLiner: "Um bar imersivo cyberpunk com mixologia autoral e atmosfera cinematográfica.",
    brandVoiceTraits: ["provocativa", "urbana", "sensorial", "misteriosa"],
    messagingPillars: [
      { title: "Imersão", description: "Ambiente como set de filme.", proofPoints: ["luz", "som", "cenografia"], exampleCopy: ["Entre no subsolo de Tóquio. Sem sair da cidade."] },
      { title: "Mixologia", description: "Drinks autorais e sazonais.", proofPoints: ["carta viva", "ingredientes premium"], exampleCopy: ["Um drink, um portal."] },
      { title: "Fotografável", description: "Cenas prontas para conteúdo.", proofPoints: ["neon", "bokeh", "contraste"], exampleCopy: ["Seu feed vai brilhar."] },
    ],
    vocabulary: { preferred: ["neon", "noite", "glitch", "cena", "ritual"], avoid: ["fofinho", "clean", "minimal" ] },
    doDont: { do: ["Frases curtas", "Metáforas urbanas", "Convites diretos"], dont: ["Tom corporativo", "Textos longos", "Emojis em excesso"] },
    sampleHeadlines: ["Drinks que parecem luz.", "A noite é uma experiência.", "Cyberpunk no copo."],
    sampleCTAs: ["Reservar agora", "Ver carta", "Como chegar", "Ver eventos"],
  },
  logo: {
    primary: "https://placehold.co/800x400/1a1a1a/ff00ff?text=Neon+Tokyo+Primary+Logo",
    secondary: "https://placehold.co/400x400/1a1a1a/00ffff?text=NT+Secondary",
    symbol: "https://placehold.co/200x200/1a1a1a/ff00ff?text=Kanji+Symbol",
    clearSpace: "O respiro mínimo deve ser equivalente à altura do símbolo (kanji) presente no logo.",
    minimumSize: "Digital: 120px de largura. Impresso: 30mm de largura.",
    incorrectUsages: [
      "Não alterar as proporções",
      "Não aplicar sobre fundos claros sem a versão invertida",
      "Não alterar as cores do neon"
    ]
  },
  logoVariants: {
    horizontal: "https://placehold.co/1200x400/0d0d0d/ff00ff?text=Neon+Tokyo+Horizontal",
    stacked: "https://placehold.co/600x600/0d0d0d/00ffff?text=Neon+Tokyo+Stacked",
    mono: "https://placehold.co/800x400/0d0d0d/ffffff?text=Neon+Tokyo+Mono",
    negative: "https://placehold.co/800x400/ffffff/0d0d0d?text=Neon+Tokyo+Negative",
    markOnly: "https://placehold.co/400x400/0d0d0d/ff00ff?text=NT+Mark",
    wordmarkOnly: "https://placehold.co/900x300/0d0d0d/ff00ff?text=Neon+Tokyo+Wordmark",
  },
  colors: {
    primary: [
      { name: "Neon Pink", hex: "#FF00FF", rgb: "255, 0, 255", cmyk: "0, 100, 0, 0" },
      { name: "Cyber Black", hex: "#0D0D0D", rgb: "13, 13, 13", cmyk: "75, 68, 67, 90" }
    ],
    secondary: [
      { name: "Electric Blue", hex: "#00FFFF", rgb: "0, 255, 255", cmyk: "100, 0, 0, 0" }
    ]
  },
  typography: {
    primary: { name: "Orbitron", usage: "Títulos, letreiros e destaques principais", weights: ["Medium", "Bold", "Black"] },
    secondary: { name: "Inter", usage: "Textos de apoio, cardápios e descrições", weights: ["Regular", "Medium"] }
  },
  typographyScale: [
    { name: "H1", fontRole: "primary", size: "56px", lineHeight: "64px", fontWeight: "800", letterSpacing: "-0.02em", usage: "Letreiros, posters" },
    { name: "H2", fontRole: "primary", size: "32px", lineHeight: "40px", fontWeight: "700", usage: "Headers e chamadas" },
    { name: "H3", fontRole: "primary", size: "24px", lineHeight: "32px", fontWeight: "700", usage: "Destaques e sessões" },
    { name: "Body", fontRole: "secondary", size: "16px", lineHeight: "24px", fontWeight: "400", usage: "Descrições" },
    { name: "Caption", fontRole: "secondary", size: "12px", lineHeight: "16px", fontWeight: "500", usage: "Rótulos" },
  ],
  uiGuidelines: {
    layoutGrid: "Grid livre para posters; para digital, 12 col com safe zones para texto.",
    spacingDensity: "Alta energia: blocos grandes, pouco texto.",
    iconographyStyle: "Neon outline com glow sutil; ícones simples.",
    illustrationStyle: "Glitch/cyber shapes, scanlines e grids.",
    dataVizGuidelines: "Quando houver, usar poucos dados e alto contraste (magenta/cyan em preto).",
    components: [
      { name: "CTA", usage: "Botões e links de reserva", states: ["default", "hover", "active"], do: ["Texto curto", "Contraste alto"], dont: ["Mais de um CTA primário"], accessibilityNotes: ["Contraste AA", "Tamanho mínimo 44px"] },
      { name: "Card de evento", usage: "Agenda e programação", states: ["default", "hover"], do: ["Imagem forte", "Data destacada"], dont: ["Muito texto"], accessibilityNotes: ["Alt text nas imagens"] },
    ],
  },
  uxPatterns: {
    onboarding: "Entrada rápida: reservar mesa em 2 cliques, com opção de cadastro depois.",
    emptyStates: "Sempre com microcopy e CTA: 'Ver carta', 'Ver eventos', 'Reservar'.",
    dashboardLayout: "Para páginas digitais: hero grande + cards de eventos + destaque de drinks.",
    modalsAndDrawers: "Modal apenas para confirmação de reserva e consentimentos."
  },
  microcopy: {
    buttonRules: "Usar verbos diretos e curtos (ex: 'Reservar', 'Ver carta').",
    errorMessages: "Tom noturno mas respeitoso. Ex: 'Algo saiu do ar — tenta de novo em instantes.'",
    emptyStateCopy: "Sempre conduzir para ação: 'Ainda sem eventos hoje. Veja a agenda da semana.'"
  },
  accessibility: {
    contrastRules: "Garantir contraste mínimo 4.5:1 em textos sobre fundos escuros com neon.",
    focusStates: "Focus ring visível em todos os CTAs, com alto contraste.",
    colorIndependence: "Não depender só de magenta/cyan para estados; usar ícones e texto."
  },
  motion: {
    transitions: "Transições rápidas (150–200ms) com easing suave para sensação futurista.",
    microinteractions: "Glows sutis em hover e press; feedback imediato em reserva.",
    loadingStates: "Skeletons escuros com brilho suave; evitar spinners longos."
  },
  keyVisual: {
    elements: [
      "Luzes de neon brilhantes contra fundos escuros",
      "Texturas de concreto e metal escovado",
      "Elementos gráficos glitch e cyberpunk",
      "Kanjis sobrepostos de forma assimétrica"
    ],
    photographyStyle: "Fotografia noturna, alto contraste, iluminação colorida dramática (rosa/azul), estilo cinematográfico."
  },
  applications: [
    {
      type: "Cardápio de Drinks",
      description: "Cardápio com fundo escuro e tipografia luminosa, detalhes em acrílico.",
      imagePlaceholder: "https://placehold.co/800x600/0d0d0d/ff00ff?text=Mockup+Menu",
      imageKey: "brand_collateral"
    },
    {
      type: "Bolacha de Chopp / Copos",
      description: "Porta-copos pretos com o símbolo em verniz localizado ou neon print.",
      imagePlaceholder: "https://placehold.co/800x600/0d0d0d/00ffff?text=Mockup+Coaster",
      imageKey: "brand_collateral"
    },
    {
      type: "Redes Sociais",
      description: "Posts de Instagram focados em fotos de drinks com iluminação dramática.",
      imagePlaceholder: "https://placehold.co/800x600/1a1a1a/ff00ff?text=Mockup+Instagram",
      imageKey: "social_post_square"
    }
  ],
  productionGuidelines: {
    fileNamingConvention: "neontokyo_[tipo]_[tamanho]_[variante]_[data]",
    handoffChecklist: ["Logo variants", "Paleta neon", "Templates social", "Arquivos de impressão"],
    printSpecs: {
      colorProfile: "CMYK",
      resolution: "300 dpi",
      bleed: "3 mm",
      safeMargin: "5 mm",
      notes: "Evitar preto chapado total; preferir rich black quando aplicável.",
    },
    digitalSpecs: {
      colorSpace: "sRGB",
      exportScales: ["1x", "2x"],
      formats: ["PNG", "JPG"],
      compressionGuidelines: "Preservar gradientes/glow com PNG quando necessário.",
      notes: "Testar legibilidade em telas pequenas e no modo escuro.",
    },
    deliverables: [
      { asset: "Post 1:1", formats: ["PNG", "Figma"], specs: "1080×1080 com safe zone." },
      { asset: "Story 9:16", formats: ["PNG", "Figma"], specs: "1080×1920; evitar UI do Instagram." },
    ],
  },
  imageGenerationBriefing: {
    visualStyle: "Neon cyberpunk with analog film grain. Blade Runner 2049 meets Tokyo underground club aesthetic. High contrast, dark environments with saturated neon light sources.",
    colorMood: "Pitch-black darkness (#0D0D0D) punctuated by electric magenta (#FF00FF) and cyan (#00FFFF) neon glows. No natural light. Artificial, urban night atmosphere.",
    compositionNotes: "Off-center dynamic compositions. Deep shadows with light-painted subjects. Bokeh neon signs in background. Dramatic top-down or Dutch angle shots.",
    moodKeywords: ["nocturnal", "electric", "mysterious", "immersive", "cyberpunk"],
    artisticReferences: "Blade Runner 2049 cinematography (Roger Deakins) + Tokyo nightlife photography by Liam Wong + Akira anime aesthetic + Wong Kar-wai neon-soaked scenes",
    avoidElements: "Natural daylight, pastel colors, organic textures, clean white backgrounds, corporate aesthetics, flat design, minimalism",
    logoStyleGuide: "Neon-tube style logotype with glow effect. Orbitron Bold for main wordmark. Neon Pink (#FF00FF) primary with Cyan (#00FFFF) accent. Dark background always. Optional kanji element.",
    photographyMood: "Long exposure night photography, neon light painting, smoke machine atmospherics. Drinks photographed on dark surfaces with neon rim lighting from below or behind.",
    patternStyle: "Glitch-effect scanlines or neon grid pattern. Horizontal scanline texture or matrix-style rain effect using magenta/cyan on black.",
    marketingVisualLanguage: "Oversized Orbitron typography with neon glow text-shadow. Glitch distortion on key elements. Film grain overlay. Kanji characters as decorative graphic elements.",
    negativePrompt: "daylight, white background, pastel, minimal, corporate, clean, sterile, happy family, natural light, countryside, vintage sepia, watercolor, illustration without neon"
  }
};

export const sushiExample: BrandbookData = {
  schemaVersion: "2.0",
  brandName: "Kansai Sushi & Izakaya",
  industry: "Restaurante Japonês / Gastronomia",
  brandConcept: {
    purpose: "Trazer a autêntica experiência dos izakayas de Osaka para o ocidente.",
    mission: "Servir culinária japonesa tradicional com toques contemporâneos, em um ambiente acolhedor.",
    vision: "Ser reconhecido como o principal destino gastronômico japonês da cidade.",
    values: ["Tradição", "Qualidade dos Ingredientes", "Hospitalidade", "Atenção aos Detalhes", "Alegria"],
    personality: ["Acolhedor", "Tradicional", "Vibrante", "Cuidadoso"],
    toneOfVoice: "Respeitoso, convidativo, apaixonado pela cultura e educativo."
  },
  positioning: {
    category: "Restaurante Japonês / Izakaya",
    targetMarket: "Público que valoriza autenticidade, ingredientes frescos e experiência cultural",
    positioningStatement: "Para quem busca a experiência real de um izakaya de Osaka, Kansai Sushi & Izakaya oferece culinária tradicional com cuidado artesanal e hospitalidade japonesa.",
    primaryDifferentiators: ["Autenticidade", "Ingredientes frescos", "Hospitalidade"],
    competitiveAlternatives: ["Rodízios genéricos", "Sushi fast-food", "Restaurantes asiáticos mistos"],
    reasonsToBelieve: ["Menu sazonal", "Técnicas tradicionais", "Seleção de saquês"],
  },
  audiencePersonas: [
    {
      name: "Helena",
      role: "Foodie",
      context: "Busca experiências autênticas e recomenda para amigos.",
      goals: ["Qualidade", "Autenticidade", "Ambiente"],
      painPoints: ["Restaurantes turísticos", "Ingredientes ruins"],
      objections: ["Preço", "Reserva"],
      channels: ["Instagram", "Google Maps", "Blog de gastronomia"],
    },
    {
      name: "Kenji",
      role: "Nikkei / apreciador de cultura japonesa",
      context: "Quer referências tradicionais e respeito cultural.",
      goals: ["Tradição", "Detalhes", "Atendimento"],
      painPoints: ["Ocidentalização exagerada"],
      objections: ["Fidelidade", "Consistência"],
      channels: ["Comunidade local", "Indicação"],
    },
  ],
  verbalIdentity: {
    tagline: "Tradição, frescor e hospitalidade.",
    oneLiner: "Izakaya autêntico com ingredientes frescos e técnicas tradicionais japonesas.",
    brandVoiceTraits: ["respeitosa", "calma", "educativa", "acolhedora"],
    messagingPillars: [
      { title: "Autenticidade", description: "Tradição japonesa sem caricatura.", proofPoints: ["técnicas", "ingredientes"], exampleCopy: ["Sabor verdadeiro, sem atalhos."] },
      { title: "Artesanato", description: "Detalhes e cuidado em cada etapa.", proofPoints: ["corte", "temperatura", "arroz"], exampleCopy: ["Cada peça é preparada no tempo certo."] },
      { title: "Hospitalidade", description: "Omotenashi: receber bem é parte do prato.", proofPoints: ["serviço", "ritual"], exampleCopy: ["Sente-se. Nós cuidamos do resto."] },
    ],
    vocabulary: { preferred: ["omotenashi", "sazonal", "artesanal", "tradição"], avoid: ["fast", "promo", "rodízio" ] },
    doDont: { do: ["Tom calmo", "Explique termos", "Convide"], dont: ["Gírias", "Tom agressivo", "Exageros"] },
    sampleHeadlines: ["O sabor do Kansai.", "Tradição que acolhe.", "Frescor em silêncio."],
    sampleCTAs: ["Reservar", "Ver menu", "Conhecer o izakaya", "Falar com a casa"],
  },
  logo: {
    primary: "https://placehold.co/800x400/8b0000/ffffff?text=Kansai+Primary+Logo",
    secondary: "https://placehold.co/400x400/ffffff/8b0000?text=Kansai+Vertical",
    symbol: "https://placehold.co/200x200/8b0000/ffffff?text=Family+Crest+(Kamon)",
    clearSpace: "A área de proteção deve ser do tamanho do símbolo principal (Kamon) em todos os lados.",
    minimumSize: "Digital: 100px de largura. Impresso: 25mm de largura.",
    incorrectUsages: [
      "Não distorcer o círculo do Kamon",
      "Não utilizar cores não aprovadas (ex: verde, azul)",
      "Não remover o nome do logotipo nas aplicações oficiais"
    ]
  },
  logoVariants: {
    horizontal: "https://placehold.co/1200x400/f5f5dc/8b0000?text=Kansai+Horizontal",
    stacked: "https://placehold.co/600x600/f5f5dc/8b0000?text=Kansai+Stacked",
    mono: "https://placehold.co/800x400/f5f5dc/1a1a1a?text=Kansai+Mono",
    negative: "https://placehold.co/800x400/1a1a1a/f5f5dc?text=Kansai+Negative",
    markOnly: "https://placehold.co/400x400/8b0000/f5f5dc?text=Kamon",
    wordmarkOnly: "https://placehold.co/900x300/f5f5dc/8b0000?text=Kansai+Wordmark",
  },
  colors: {
    primary: [
      { name: "Urushi Red", hex: "#8B0000", rgb: "139, 0, 0", cmyk: "24, 100, 100, 27" },
      { name: "Washi White", hex: "#F5F5DC", rgb: "245, 245, 220", cmyk: "3, 2, 12, 0" }
    ],
    secondary: [
      { name: "Sumi Black", hex: "#1A1A1A", rgb: "26, 26, 26", cmyk: "73, 67, 66, 80" },
      { name: "Matcha Green", hex: "#4A5D23", rgb: "74, 93, 35", cmyk: "65, 36, 100, 31" }
    ]
  },
  typography: {
    primary: { name: "Noto Serif JP", usage: "Títulos de Cardápio, Nomes de Pratos", weights: ["Regular", "Bold"] },
    secondary: { name: "Lato", usage: "Descrições de pratos, informações de contato", weights: ["Light", "Regular", "Bold"] }
  },
  typographyScale: [
    { name: "H1", fontRole: "primary", size: "44px", lineHeight: "52px", fontWeight: "700", letterSpacing: "-0.01em", usage: "Capa e títulos" },
    { name: "H2", fontRole: "primary", size: "28px", lineHeight: "36px", fontWeight: "700", usage: "Seções" },
    { name: "H3", fontRole: "primary", size: "20px", lineHeight: "28px", fontWeight: "700", usage: "Subseções e destaques" },
    { name: "Body", fontRole: "secondary", size: "16px", lineHeight: "26px", fontWeight: "400", usage: "Textos" },
    { name: "Caption", fontRole: "secondary", size: "12px", lineHeight: "16px", fontWeight: "500", usage: "Notas" },
  ],
  uiGuidelines: {
    layoutGrid: "Layout tradicional e calmo: grades simples, bastante respiro e alinhamento consistente.",
    spacingDensity: "Baixa densidade (premium).",
    iconographyStyle: "Ícones minimalistas, traço fino, inspiração em selos japoneses.",
    illustrationStyle: "Sumi-e / brush strokes suaves, textura de washi.",
    dataVizGuidelines: "Evitar dataviz. Se necessário, monocromático com acento Urushi Red.",
    components: [
      { name: "Menu item", usage: "Cardápio", states: ["default", "hover"], do: ["Nome em destaque", "Descrição curta"], dont: ["Poluição visual"], accessibilityNotes: ["Contraste e tamanho de fonte"] },
      { name: "Reserva", usage: "CTA", states: ["default", "hover", "disabled"], do: ["Rótulo claro"], dont: ["Termos genéricos"], accessibilityNotes: ["Alvo 44px"] },
    ],
  },
  uxPatterns: {
    onboarding: "Fluxo de reserva simples e respeitoso: escolher dia, horário, pessoas, confirmar.",
    emptyStates: "Sempre orientar: 'Ainda sem mesas nesse horário. Tente outro horário.'",
    dashboardLayout: "Para digital: cardápio + reservas + localização + destaque de saquês.",
    modalsAndDrawers: "Modal para confirmação de reserva e políticas."
  },
  microcopy: {
    buttonRules: "Botões curtos e claros (ex: 'Reservar', 'Ver menu').",
    errorMessages: "Educativo e calmo, sem culpa. Ex: 'Não conseguimos confirmar agora. Tente novamente.'",
    emptyStateCopy: "Sempre oferecer alternativa: 'Veja o menu da semana' ou 'Entre em contato'."
  },
  accessibility: {
    contrastRules: "Contraste mínimo 4.5:1 principalmente sobre texturas de washi.",
    focusStates: "Focus ring discreto porém visível; evitar perder em fundos texturizados.",
    colorIndependence: "Usar ícones e texto para status de reserva (confirmada/pendente)."
  },
  motion: {
    transitions: "Transições suaves (200–250ms) para sensação artesanal.",
    microinteractions: "Feedback sutil em hover/press, sem exageros.",
    loadingStates: "Skeletons leves; evitar animações chamativas."
  },
  keyVisual: {
    elements: [
      "Pinceladas de sumi-e (tinta tradicional)",
      "Texturas de papel washi ao fundo",
      "Padrões geométricos japoneses clássicos (Seigaiha ou Asanoha)",
      "Fotografias macro de ingredientes frescos"
    ],
    photographyStyle: "Foco nos detalhes e texturas (arroz, peixe fresco, cerâmicas). Iluminação quente e direcional."
  },
  applications: [
    {
      type: "Cardápio Principal",
      description: "Capa em couro sintético vermelho escuro ou madeira com logo em baixo relevo.",
      imagePlaceholder: "https://placehold.co/800x600/f5f5dc/8b0000?text=Mockup+Cardapio",
      imageKey: "brand_collateral"
    },
    {
      type: "Hashi e Embalagem Delivery",
      description: "Embalagens em papel kraft ou branco com o padrão Asanoha sutil.",
      imagePlaceholder: "https://placehold.co/800x600/8b0000/ffffff?text=Mockup+Delivery",
      imageKey: "brand_collateral"
    },
    {
      type: "Uniformes",
      description: "Aventais pretos ou cru (algodão) com o símbolo bordado em vermelho no peito.",
      imagePlaceholder: "https://placehold.co/800x600/1a1a1a/8b0000?text=Mockup+Uniforme",
      imageKey: "hero_lifestyle"
    }
  ],
  productionGuidelines: {
    fileNamingConvention: "kansai_[tipo]_[tamanho]_[variante]_[data]",
    handoffChecklist: ["Logo pack", "Cardápio templates", "Pattern Asanoha", "Assets social"],
    printSpecs: {
      colorProfile: "CMYK",
      resolution: "300 dpi",
      bleed: "3 mm",
      safeMargin: "5 mm",
      notes: "Textura de washi pode exigir prova de impressão.",
    },
    digitalSpecs: {
      colorSpace: "sRGB",
      exportScales: ["1x", "2x"],
      formats: ["PNG", "JPG", "SVG"],
      compressionGuidelines: "Preservar textura em JPG 85% ou PNG quando necessário.",
      notes: "Evitar oversharpen em fotos de comida.",
    },
    deliverables: [
      { asset: "Cardápio", formats: ["PDF", "INDD"], specs: "Versão impressão + digital." },
      { asset: "Posts", formats: ["PNG", "Figma"], specs: "Templates com textura washi." },
    ],
  },
  imageGenerationBriefing: {
    visualStyle: "Wabi-sabi Japanese aesthetics meets contemporary fine dining. Handcrafted textures, imperfect beauty, restrained elegance. Traditional ink wash calligraphy combined with modern gastronomic photography.",
    colorMood: "Deep lacquer red (#8B0000) on warm cream (#F5F5DC) and sumi black. Warm candlelit atmosphere. Muted earthy matcha accent. No cold tones — all warmth and intimacy.",
    compositionNotes: "Zen-inspired negative space. Off-center subjects with natural asymmetric balance. Overhead shots for food, intimate 45° for atmosphere. Deliberate emptiness as design element.",
    moodKeywords: ["authentic", "artisanal", "intimate", "traditional", "warm"],
    artisticReferences: "Hiroshi Sugimoto photography minimalism + traditional Edo-period painting aesthetic + Nobu Matsuhisa food photography + Wabi-sabi interior design references",
    avoidElements: "Bright fluorescent lighting, modern corporate interiors, cold blue tones, plastic materials, fast-food aesthetics, overly styled Westernized Japanese food",
    logoStyleGuide: "Circular Kamon (family crest) symbol in Urushi Red on cream/white. Noto Serif JP wordmark below in deep red. Traditional seal aesthetic. Maximum 2 colors. No gradients.",
    photographyMood: "Warm directional candlelight or window light from 45°. Natural props: ceramic bowls, wooden chopsticks, linen cloth, washi paper. Macro textures of fresh ingredients. Slightly desaturated, film-like treatment.",
    patternStyle: "Traditional Asanoha (hemp leaf) or Seigaiha (wave scale) geometric pattern in Urushi Red at low opacity on cream. Hand-drawn quality, slightly irregular strokes.",
    marketingVisualLanguage: "Noto Serif JP headlines as prominent graphic elements. Ink-brush stroke backgrounds. Negative space as premium quality signal. Washi paper texture overlays on all digital assets.",
    negativePrompt: "bright white studio, cold lighting, modern minimalist, plastic, fast food, cartoon sushi, fake Japanese, chopsticks in rice (offensive), blue tones, neon, cyberpunk, watermark, oversaturated"
  }
};
