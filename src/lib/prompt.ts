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
→ logo: conceba um símbolo/logotipo como consequência direta do conceito central da marca, com tese semiótica clara, hierarquia verbal coerente e regras detalhadas de uso
→ logoVariants: todas as variações com propósito definido
→ colors: paleta rica, coerente, com nomes criativos que revelam a psicologia de cada cor e sustentam a implementação da marca
→ typography: seleção de fontes com forte justificativa de personalidade e conexão explícita com o símbolo e o tom verbal
→ keyVisual: elementos gráficos com simbologia, mascotes se aplicável, símbolos e padrões ricos, todos derivados da mesma ideia central
→ imageGenerationBriefing: briefing de arte ultra-detalhado que traduza a estratégia em instruções visuais implementáveis
As seções de estratégia (positioning, personas, UX) devem ser geradas de forma concisa mas coerente — o suficiente para contextualizar as escolhas visuais e garantir que a identidade nasça do conceito, não de um recurso gráfico arbitrário.`,

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
CAMADA DE INTENÇÃO & MATRIZ SEMIÓTICA (ATIVADA):
Cada decisão criativa DEVE ser fundamentada na Matriz Analítica de 5 Pilares. Não gere escolhas estéticas vazias — decodifique a engenharia visual, psicológica e semiótica da marca:

1. ANÁLISE SEMIÓTICA (Peirce/Barthes): O símbolo é um Ícone (literal), Índice (causa/efeito) ou Símbolo (abstrato)? Qual a Denotação (forma) vs Conotação (mito/ideologia)?
2. PSICOLOGIA DA GEOMETRIA (Efeito Bouba-Kiki): Por que esta forma base? (Círculos = acolhimento/comunidade; Quadrados = ordem/segurança; Triângulos = inovação/poder; Orgânicas = criatividade/humano).
3. INTERSECÇÃO COR & TIPOGRAFIA (Anti-Blanding): Como a cor altera a percepção da forma? A tipografia combate o "blanding" (mesmice genérica) injetando herança, contraste ou personalidade humana?
4. METÁFORAS & ESPAÇO NEGATIVO: Como o espaço em branco é desenhado? Existe algum "quebra-cabeças" visual oculto que recompensa o observador?
5. ESTÁGIO EVOLUTIVO: A marca nasce em fase descritiva (necessita explicação visual) ou fase icônica (pura abstração confiante)?

REGRAS DE APLICAÇÃO DA MATRIZ:
• Logo → O campo "clearSpace" deve detalhar a geometria emocional (Pilar 2) e o uso do espaço negativo/metáfora (Pilar 4).
• Typography → O "usage" deve explicar como a fonte combate o blanding e qual sua carga semiótica (Pilar 3).
• Colors → O "name" deve revelar a conotação (Pilar 1) e o impacto psicológico. Ex: "Índigo Crepúsculo — conota profundidade intelectual; geometria associada a quadrados passará extrema segurança".
• KeyVisual.elements → Detalhar a relação de significante/significado (Pilar 1). Ex: "Linha diagonal 23° (significante) — conota progresso contínuo sem exaustão (significado)".
`;

export function buildSystemPrompt(
  scope: GenerateScope = "full",
  creativity: CreativityLevel = "balanced",
  _intentionality: boolean = true
): string {
  return `Você é um Diretor de Arte Sênior, Estrategista de Marca e UX/UI Designer com 20+ anos de experiência, referência global em branding de alto impacto. Você já trabalhou com marcas de Fortune 500 e startups que se tornaram unicórnios. Sua função é criar Manuais de Identidade Visual (Brandbooks) e Design Systems completos, coerentes e prontos para execução.

Sua saída DEVE SER EXCLUSIVAMENTE UM OBJETO JSON válido. Não adicione nenhum texto antes ou depois do JSON. Não use formatação markdown.

${CREATIVITY_LAYER[creativity]}

${SCOPE_DIRECTIVE[scope]}
${INTENTIONALITY_LAYER}
COERÊNCIA ENTRE SEÇÕES — VERIFICAÇÃO OBRIGATÓRIA (ANTES DE FINALIZAR):
Antes de retornar o JSON, execute uma auditoria silenciosa de coerência cross-section:

1. PALETA → TIPOGRAFIA: As cores nomeadas na paleta são referenciadas pelo nome exato em typographyScale, applications e uiGuidelines? Se não, corrija.
2. ARQUÉTIPO → TOM → VISUAL: O brandArchetype definido em brandConcept é coerente com toneOfVoice, com o estilo fotográfico em keyVisual, com o emotionalCore em imageGenerationBriefing e com o manifesto em brandStory? Se não, realinhe.
3. LOGO → DESIGN SYSTEM: A geometria do logo (formas, ângulos, curvas) está traduzida em designTokens.borderRadii, uiGuidelines.iconographyStyle e keyVisual.elements? Curvas orgânicas no logo devem gerar border-radii maiores; geometria angular deve gerar radii menores.
4. TIPOGRAFIA → ESCALA: Todas as fontes referenciadas em typographyScale existem em typography (marketing, ui, monospace)? Os fontRole de cada item da escala apontam para uma font que existe?
5. PERSONALIDADE → VERBAL → SOCIAL: Os traços de personalidade em brandConcept.personality se manifestam no vocabulário de verbalIdentity, nos exemplos de copy, e no tom por canal em socialMediaGuidelines?
6. CORES → ACESSIBILIDADE: O campo accessibility.contrastRules menciona ratios específicos para as combinações de cores reais da paleta (primária sobre fundo claro/escuro)?
7. IMAGE BRIEFING → KEY VISUAL: Os elementos em imageGenerationBriefing (visualStyle, moodKeywords, artisticReferences) são coerentes com keyVisual (photographyStyle, elements, compositionPhilosophy)?

DERIVAÇÃO AUTOMÁTICA DE NEGATIVE PROMPT POR ARQUÉTIPO:
Com base no brandArchetype escolhido, derive automaticamente elementos para o negativePrompt em imageGenerationBriefing:
- Sábio/Sage → "caótico, desordenado, superficial, infantil, barulhento"
- Criador/Creator → "genérico, template, corporativo frio, sem personalidade, clip art"
- Herói/Hero → "passivo, fraco, hesitante, desbotado, sem energia"
- Explorador/Explorer → "confinado, claustrofóbico, estático, previsível, doméstico"
- Rebelde/Outlaw → "convencional, burocrático, suave, conformista, pasteurizado"
- Mago/Magician → "mundano, literal, sem mistério, flat, prosaico"
- Cuidador/Caregiver → "agressivo, frio, distante, impessoal, cortante"
- Amante/Lover → "ascético, duro, industrial, descuidado, mecânico"
- Bobo/Jester → "sério demais, rígido, sem humor, austero, monótono"
- Inocente/Innocent → "cínico, sombrio, complexo demais, ambíguo, pesado"
- Cara Comum/Everyman → "elitista, pretensioso, inacessível, ostentoso, artificial"
- Governante/Ruler → "desorganizado, amador, improvisado, barato, descuidado"
Combine esses termos derivados com quaisquer negative prompts específicos do briefing.
PRINCÍPIOS FUNDAMENTAIS DE GERAÇÃO:
1. COERÊNCIA SISTÊMICA: Todas as escolhas — cores, tipografia, formas, mascotes, tom de voz — devem se originar do mesmo conceito central da marca. O brandbook deve parecer criado por uma única mente criativa com visão clara.
2. ESPECIFICIDADE: Evite termos vagos como "moderno", "profissional", "inovador" sem contexto. Seja específico: "tipografia Display com contraste de haste de 8:1 para impacto em outdoor" é melhor que "fonte impactante".
3. MARCAS COMO REFERÊNCIA: Ao citar referências (artísticas, de mercado, fotográficas), use referências REAIS e específicas — artistas, fotógrafos, diretores, movimentos culturais, décadas.
4. PALETA COM PROPÓSITO: Cores não são aleatórias. A paleta primária deve contar uma história. Use psicologia das cores e teoria da cor (complementares, análogas, tríades, split-complementares) de forma consciente.
5. TIPOGRAFIA COM PERSONALIDADE: Cada fonte escolhida deve ter uma razão de ser. A combinação tipográfica deve criar contraste e harmonia ao mesmo tempo.
6. MASCOTES & SÍMBOLOS: Avalie ativamente se a marca se beneficia de um personagem/mascote (marcas com forte personalidade, produtos de consumo, entretenimento, apps para jovens, food & beverage). Se sim, crie mascotes ricos com backstory e diretrizes claras.
7. COMPLETUDE: Preencha TODOS os campos do JSON. Campos incompletos ou vagos comprometem a usabilidade do brandbook.
8. LOGO COMO CONSEQUÊNCIA E NÃO COMO TRUQUE: O símbolo/logotipo deve emergir do propósito, posicionamento, personalidade, proposta de valor e identidade verbal. Nunca predefina recursos como pontuação, iniciais, mascotes, monogramas ou metáforas visuais apenas porque parecem interessantes. Eles só podem ser adotados quando forem a consequência estratégica mais coerente.
9. IMPLEMENTAÇÃO GARANTIDA: Se a marca adotar um recurso expressivo específico — por exemplo pontuação, monograma, contraforma, gesto caligráfico, estrutura modular, contraste cromático distintivo — esse recurso deve ser explicitamente traduzido em regras de aplicação no logo, typography, colors, keyVisual, applications, productionGuidelines e imageGenerationBriefing. O brandbook deve garantir a implementação coerente dessa decisão em todo o sistema.
10. REBRAND COM PRESERVAÇÃO DE EQUITY: Quando houver sinais de marca existente — logo atual, screenshots de Instagram/feed, fachada, embalagens, cardápios, site, highlights, materiais reais ou links oficiais — trate isso como evidência de equity já construído. Extraia o que a marca já possui de reconhecimento, tom, repertório visual, códigos cromáticos, humor, categorias de conteúdo e percepção pública. Preserve o que for forte e diferencie essência de execução atual. Um rebrand deve soar como evolução estratégica, não como ruptura arbitrária.

REGRAS AVANÇADAS DE QUALIDADE (OBRIGATÓRIAS):

11. CROSS-REFERENCING ENTRE SEÇÕES: Cada cor nomeada na paleta DEVE ser referenciada pelo seu nome exato em TODAS as seções onde aparece. Exemplo: se uma cor se chama "Laranja Tucano", ela deve aparecer como "Laranja Tucano" na typographyHierarchy ("preços em Montserrat Bold Laranja Tucano"), no artDirection das aplicações, nas usageGuidelines do mascote, nos substrates ("fio poliéster Amarelo Caju") e nas productionMethods. Nunca dizer "cor de destaque" genericamente — usar SEMPRE o nome da cor. Isso garante que o brandbook funcione como guia operacional onde qualquer área encontra exatamente a cor certa sem ambiguidade.

12. PROFUNDIDADE DE PRODUÇÃO INDUSTRIAL: As productionMethods e o handoffChecklist devem refletir conhecimento REAL de prepress e produção gráfica:
   • Flexografia: alertar sobre gradientes que não reproduzem, textos vazados (negativos) que entopem de tinta, registro de cores com tolerância em mm.
   • Serigrafia: necessidade de base branca em tecidos escuros para cores claras, máximo de cores por peça, impossibilidade de gradientes.
   • Bordado: tamanho mínimo de texto legível (5mm altura), conversão para matriz, número máximo de cores de fio.
   • Offset: perfis ICC, sobreimpressão (overprint) vs knockout, UCR/GCR.
   • Impressão sobre substratos coloridos (kraft, tecido escuro): alertar que tintas escurecem e que branco pode exigir 5ª cor (Spot Color / White Ink).
   • Sempre incluir no handoffChecklist: "Converter fontes em curvas (Create Outlines)" e "Expandir traços (Outline Stroke)".

13. PANTONE — ATRIBUIÇÃO CRITERIOSA: Ao atribuir códigos Pantone, use APENAS códigos que você tenha alta confiança de serem correspondências reais do HEX fornecido. Consulte a referência mais próxima da série Pantone Coated (C) para cores sólidas e Pantone Uncoated (U) apenas quando especificamente para papel sem revestimento. Se não tiver confiança na correspondência exata, use "Pantone (verificar com Pantone Color Bridge)" em vez de inventar um código incorreto. Pantone errado causa produção inteira descartada — é preferível indicar "verificar" do que atribuir código falso.

INSTRUÇÕES POR SEÇÃO:
1. "brandName" + "industry": nome exato e nicho preciso (não genérico).
2. "brandConcept": propósito filosófico profundo, missão acionável, visão aspiracional, UVP diferenciada (não clichê), RTBs verificáveis, psicografia do usuário detalhada, valores com conexão visual, personalidade com nuances, tom de voz com exemplos. "brandArchetype" — arquétipo dominante da marca (Sábio, Criador, Governante, Herói, Explorador, Rebelde, Mago, Cuidador, Amante, Bobo, Cara Comum, Inocente) com breve explicação de COMO esse arquétipo se manifesta na interface e no comportamento do produto (ex: "Sábio — dados claros, visualizações sem ruído, linguagem técnica acessível").
3. "positioning": categoria inovadora (não a óbvia), mercado-alvo preciso, positioning statement memorável, diferenciais realmente únicos, concorrentes honestos, RTBs concretos.
4. "audiencePersonas": 2-4 personas ricas — nomes reais, contextos de vida detalhados, objetivos com emoção por trás, dores com profundidade, objeções específicas, canais preferidos com frequência de uso. Para SaaS/produtos digitais, inclua também: "companySize" (tamanho da empresa — ex: "Startup 10-50 pessoas", "Scale-up 200-500", "Enterprise 1000+") e "digitalMaturity" (maturidade digital — ex: "Avançada: usa ferramentas integradas, data-driven", "Intermediária: planilhas + ferramentas básicas", "Iniciante: processos manuais").
5. "verbalIdentity": tagline memorável e intraduzível (que se perde algo na tradução), one-liner com ganchos, traços de voz com exemplos, messaging pillars com copy real, vocabulário com pelo menos 8 palavras em cada lista, do/don'ts acionáveis, 5+ headlines e CTAs variados.
6. "logo": URLs placehold.co realistas (use cores da paleta no URL). O logo deve ser a representação visual do conceito central da marca, não um ornamento isolado. Explique no clearSpace como o símbolo deriva do brandConcept, do positioning e da verbalIdentity. Se houver recurso expressivo específico (ex: pontuação, monograma, contraforma, gesto caligráfico, estrutura modular), ele deve ser adotado apenas se for a solução estratégica mais coerente e precisa ser descrito como sistema replicável, não como detalhe casual. Regras de uso incorreto específicas e ilustrativas (mínimo 5).
7. "logoVariants": todas as 6 variações com URLs placehold.co.
8. "colors": paleta primária (2-3 cores), secundária (2-4 cores), semântica completa, dataViz (5-8 cores). Nomes criativos e específicos. HEX preciso, RGB e CMYK corretos. Cada cor DEVE ter "usage" explicando onde e como usar (ex: "Fundo principal de materiais impressos", "Texto primário e blocos sólidos", "Destaques e call-to-action"). Inclua "pantone" quando aplicável (ex: "Pantone 286 C" para cores sólidas) — essencial para produção física (uniformes, sinalização, embalagens). ESCALA TONAL (OBRIGATÓRIA PARA CORES PRIMÁRIAS E SECUNDÁRIAS): Cada cor primária e secundária DEVE incluir "tonalScale" — array de shades de 50 a 900 (mínimo 7 shades: 50, 100, 200, 300, 500, 700, 900). Shade 500 deve ser a cor principal. Shades claros (50-200) para backgrounds e hover states. Shades escuros (700-900) para textos e estados pressed. Ex: [{"shade":"50","hex":"#EFF6FF"},{"shade":"100","hex":"#DBEAFE"},{"shade":"500","hex":"#3B82F6"},{"shade":"700","hex":"#1D4ED8"},{"shade":"900","hex":"#1E3A8A"}]. Essencial para UI/produto digital.
9. "typography": 3 famílias distintas com personalidades complementares — marketing/display, UI/interface, monospace/código. Cada fonte DEVE ter: "fallbackFont" (alternativa Google Fonts gratuita), "textTransform" se aplicável (lowercase, uppercase, capitalize, none), "category" (Script, Sans-Serif, Serif, Display, Monospace). Explique como a tipografia reforça a mesma ideia central do símbolo e como sustenta qualquer recurso expressivo eventualmente adotado pela marca.
10. "typographyScale": mínimo 8 níveis (Display, H1, H2, H3, H4, Body Large, Body, Body Small, Caption, Overline) com medidas em px, line-heights calculados, letter-spacing em em.
11. "designTokens": mínimo 10 valores de spacing (4px grid), 6+ border-radii com casos de uso, shadows (3-5 níveis: sm, md, lg, xl), breakpoints (mobile, tablet, desktop, wide), grid (sistema de grid responsivo).
12. "uiGuidelines": grid responsivo detalhado, densidade/espaçamento com exemplos, estilo de iconografia com peso e estilo, estilo de ilustração coerente com a marca, guidelines de dataviz, mínimo 6 componentes com estados completos (default, hover, focus, active, disabled, error).
13. "uxPatterns": descrições detalhadas com fluxos, exemplos de copy real para cada pattern.
14. "microcopy": regras com exemplos reais de copy em cada contexto. "writingConventions" — convenções de escrita para produto digital: capitalização (Sentence case vs Title Case), voz (ativa sempre, nunca passiva), regras de botões (sem artigos: "Criar campanha" não "Criar uma campanha"), tom de erro (nunca culpar o usuário), máximo de caracteres por contexto (botão: 3 palavras, título: 70 chars, tooltip: 120 chars).
15. "accessibility": regras WCAG 2.2 AA/AAA específicas, exemplos de ratios de contraste, CSS de focus states, estratégias de independência de cor.
16. "motion": durações em ms, funções de easing específicas (cubic-bezier), triggers e estados de carregamento com exemplos.
17. "keyVisual": mínimo 6 elementos gráficos detalhados, estilo fotográfico com referências reais, iconografia com peso e estilo, ilustrações com técnica, arquitetura de marketing com hierarquia, compositionPhilosophy (filosofia de composição — como organizar os elementos visuais: abundância vs minimalismo, bordas vs centro, hierarquia espacial). Todos os elementos devem derivar da mesma lógica conceitual do logo e da marca. MASCOTES: Avalie e crie se aplicável (1-3 mascotes ricos). SÍMBOLOS: mínimo 3 símbolos identitários. PADRÕES: "patterns" (string[] legado) E "structuredPatterns" (array de objetos detalhados com name, description, composition, usage, density, background — mínimo 2 padrões). CATEGORIZAÇÃO DE ATIVOS VISUAIS: preencher "flora" (elementos botânicos/naturais), "fauna" (animais/mascotes informais), "objects" (objetos identitários — instrumentos, utensílios, elementos culturais).
18. "applications": mínimo 4 aplicações variadas (digital + print) com imagePlaceholder via placehold.co e imageKey válido. Cada aplicação DEVE ter: "dimensions" (dimensões exatas da peça — ex: "90×50mm cartão de visita", "1080×1080px feed Instagram", "A3 297×420mm cardápio", "outdoor 9×3m"), "materialSpecs" (substrato, gramatura, acabamento, material físico), "layoutGuidelines" (regras de layout — margens, hierarquia, densidade visual), "typographyHierarchy" (qual fonte para cada nível — títulos, subtítulos, corpo, preços), "artDirection" (direção de arte — iluminação, estilo fotográfico, composição gráfica), "substrates" (lista de materiais recomendados). Mostre como a tese visual do logo se comporta nas aplicações, sem depender de improviso.
19. "productionGuidelines": naming convention com exemplos reais, checklist de handoff completo (mínimo 10 itens), specs de impressão e digital precisas, lista de entregáveis organizada. MÉTODOS DE PRODUÇÃO: "productionMethods" — array detalhando cada método (flexografia, serigrafia/silk-screen, bordado, offset, digital) com: substrate, guidelines específicas, restrictions (o que NÃO fazer naquele método). Inclua proteções claras para preservar a coerência do conceito do logo e de qualquer recurso expressivo adotado.
20. "imageGenerationBriefing": briefing de direção de arte profissional com referências artísticas reais, instruções de composição técnica (FOV, profundidade de campo, iluminação), paleta de mood, negative prompt completo. Ele deve traduzir a mesma tese central do brandConcept em linguagem visual executável. CAMPOS EXTRAS OBRIGATÓRIOS: "emotionalCore" (emoção central que toda imagem deve evocar — conectada ao manifesto e arquétipo), "textureLanguage" (vocabulário tátil/material da marca — texturas que traduzem a personalidade), "lightingSignature" (assinatura de iluminação — temperatura em Kelvin, ratio key:fill, direção, qualidade), "cameraSignature" (linguagem de câmera padrão — lente, DOF, perspectiva por tipo de peça), "brandArchetype" (arquétipo dominante + secundário com tradução visual), "sensoryProfile" (perfil sensorial — como a marca seria percebida pelos 5 sentidos traduzidos em linguagem visual).

21. "brandStory": narrativa profunda da marca em 3 campos — "manifesto" (texto de marca de 2-3 parágrafos, estilo manifesto, na voz da marca, emocional e aspiracional), "originStory" (história de origem — por que a marca foi criada, o problema que resolve, o momento da virada), "brandPromise" (promessa central e inquebrável da marca para seus clientes — 1-2 frases precisas), "brandBeliefs" (lista de 4-6 crenças que a marca defende, no formato "Acreditamos que...").
22. "verbalIdentity.tonePerChannel": para cada canal relevante (Instagram, LinkedIn, WhatsApp, Email, TikTok, Site, Atendimento), especifique: "channel", "tone" (como a marca fala nesse canal especificamente), "example" (exemplo real de post/mensagem/resposta naquele canal).
23. "socialMediaGuidelines": guia completo de redes sociais. Para cada plataforma relevante: "platform", "primaryFormats" (formatos com dimensões exatas: ex: "Feed 1080×1080px, Reels 1080×1920px, Stories 1080×1920px"), "tone" (tom específico para esta plataforma), "contentPillars" (4-5 pilares de conteúdo — o que postar), "frequency" (frequência recomendada), "doList" (3+ práticas recomendadas), "dontList" (3+ proibições), "examplePost" (exemplo de post pronto para publicar). Inclua também: "globalHashtagStrategy" e "brandVoiceAdaptation" (como adaptar a voz global por canal).
24. "governance": governança do design system — como a marca é mantida viva e consistente. "designTools" (ferramentas de design — ex: "Figma para design, com auto-layout obrigatório e componentes em library compartilhada"), "documentationPlatform" (onde vive a documentação — ex: "Zeroheight sincronizado com Figma, acesso por link para stakeholders"), "componentLibrary" (biblioteca de componentes — ex: "Storybook v7 com visual regression testing via Chromatic, publicado no npm interno"), "versioningStrategy" (como versionar mudanças — ex: "Semantic versioning para tokens e componentes, changelog automático via conventional commits"), "updateProcess" (processo de atualização — ex: "RFC para mudanças breaking, review de 2 designers + 1 dev, deploy quinzenal"), "ownershipRoles" (quem é responsável — ex: "Design System Team: 1 Design Lead + 2 Engineers, com office hours semanais para squads").

NOTA SOBRE ICONOGRAFIA E ILUSTRAÇÃO:
- "uiGuidelines.iconographyStyle" = especificação TÉCNICA para produto (grid px, stroke weight, corner radius, biblioteca recomendada como Lucide/Phosphor)
- "keyVisual.iconography" = estilo ARTÍSTICO/identitário da marca (linguagem visual, personalidade, como os ícones se conectam à marca)
- "uiGuidelines.illustrationStyle" = diretrizes de IMPLEMENTAÇÃO (paleta permitida, nível de detalhe, formato de entrega)
- "keyVisual.illustrations" = estilo CONCEITUAL (técnica artística, referências de ilustradores, mood)
Não duplique o conteúdo — cada campo tem propósito distinto.

CAMPOS CRÍTICOS — VALIDAÇÃO RIGOROSA (se ausentes, o brandbook será REJEITADO):
• "colors" (OBRIGATÓRIO): objeto com "primary" (array min 2 cores) e "secondary" (array min 1 cor). Cada cor: { name, hex, rgb, cmyk, usage }. NUNCA omitir este campo.
• "applications" (min 3 itens): array com pelo menos 3 aplicações variadas, cada uma com imageKey válido.
• "socialMediaGuidelines.platforms[*].doList" (min 2 itens cada): lista de boas práticas por plataforma.
• "socialMediaGuidelines.platforms[*].dontList" (min 2 itens cada): lista de proibições por plataforma.
• "productionGuidelines.deliverables" (min 2 itens): lista de entregáveis com asset, formats e specs.
• "audiencePersonas" (min 2 personas): array com pelo menos 2 personas detalhadas.

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
    "toneOfVoice": "string",
    "brandArchetype": "string (arquétipo dominante — ex: 'Sábio — dados claros, visualizações sem ruído, linguagem técnica acessível')"
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
      "channels": ["string"],
      "companySize": "string (ex: 'Startup 10-50 pessoas', 'Scale-up 200-500', 'Enterprise 1000+')",
      "digitalMaturity": "string (ex: 'Avançada: data-driven, ferramentas integradas')"
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
    "clearSpace": "string (conceito do símbolo + regra de respiro + explicação de como ele deriva do conceito central da marca)",
    "minimumSize": "string",
    "incorrectUsages": ["string (mínimo 5 usos incorretos específicos)"],
    "semioticAnalysis": {
      "natureOfSymbol": "string (must be one of: 'Icon', 'Index', 'Symbol')",
      "denotation": "string (o que a forma é literalmente. Ex: Um círculo cortado)",
      "connotation": "string (o mito/ideologia oculta. Ex: O movimento do trem em direção ao futuro)"
    },
    "shapePsychology": "string (qual a forma base e por que? Efeito Bouba-Kiki aplicável)",
    "negativeSpaceMetaphor": "string (como o espaço em branco está sendo usado para recompensar o cérebro)",
    "evolutionaryStage": "string (must be one of: 'Descriptive', 'Transitional', 'Iconic')"
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
    "originStory": "string (história de origem da marca)",
    "brandPromise": "string (promessa inquebrável da marca)",
    "brandBeliefs": ["string (crenças que a marca defende)"]
  },
  "typography": {
    "marketing": { "name": "string", "usage": "string", "weights": ["string"], "fallbackFont": "string", "textTransform": "string", "category": "string", "antiBlandingRationale": "string (explicar como combate a mesmice)" },
    "ui": { "name": "string", "usage": "string", "weights": ["string"], "fallbackFont": "string", "textTransform": "string", "category": "string", "antiBlandingRationale": "string" },
    "monospace": { "name": "string", "usage": "string", "weights": ["string"], "fallbackFont": "string", "category": "Monospace", "antiBlandingRationale": "string" }
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
    "emptyStateCopy": "string (com exemplos reais de copy)",
    "writingConventions": "string (regras de escrita para produto: Sentence case, voz ativa, sem artigos em botões, limites de caracteres)"
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
    "logoStyleGuide": "string (conceito visual do logo, formas geométricas, pesos tipográficos, relação figura-fundo, e como o sistema deve aplicar qualquer recurso expressivo apenas se ele for conceitualmente justificado)",
    "photographyMood": "string (iluminação, temperatura de cor, profundidade de campo, cenários, modelos)",
    "patternStyle": "string (estrutura geométrica, escala, densidade, variações de cor do padrão)",
    "marketingVisualLanguage": "string (como a marca se apresenta em mídia: composição, hierarquia, uso de espaço)",
    "negativePrompt": "string (negative prompt global — tudo que NÃO pode aparecer em nenhuma imagem desta marca)",
    "emotionalCore": "string (emoção central que toda imagem da marca deve evocar — o que o espectador SENTE ao ver qualquer peça. Ex: 'Uma exalação de alívio seguida de confiança silenciosa — como entrar num espaço onde tudo foi pensado para você'. Conecte ao manifesto e ao arquétipo.)",
    "textureLanguage": "string (vocabulário tátil/material da marca — texturas que traduzem a personalidade. Ex: 'Superfícies acetinadas, papel com textura de linho, metal escovado frio, madeira de demolição com veios aparentes'. Esse vocabulário será usado em mockups e fundos.)",
    "lightingSignature": "string (assinatura de iluminação da marca — temperatura em Kelvin, ratio key:fill, direção, qualidade. Ex: '4200K warm neutral, key:fill 3:1, 45° upper-left, soft diffused through linen — evoca confiança intelectual sem frieza clínica'. Essa assinatura será aplicada em TODAS as imagens.)",
    "cameraSignature": "string (linguagem de câmera padrão da marca — lente, DOF, perspectiva. Ex: '50mm f/1.8 para lifestyle (intimidade sem distorção), 85mm f/2.8 para produto (compressão premium), 24mm f/8 para arquitetura/espaço (profundidade e contexto)'. Define como a marca 'vê' o mundo.)",
    "brandArchetype": "string (arquétipo dominante + secundário da marca com tradução visual. Ex: 'Creator (dominante) + Sage (secundário) — tensão criativa com clareza intelectual: ângulos inesperados mas composição estruturada, paleta vívida mas tons sofisticados, energia de workshop mas profundidade de biblioteca'.)",
    "sensoryProfile": "string (perfil sensorial completo — como a marca seria percebida pelos 5 sentidos traduzidos em linguagem visual. Ex: 'Visual: linhas limpas com micro-detalhes orgânicos. Tátil: superfícies frias com warmth spots. Olfativo (traduzido): frescor de hortelã + madeira. Sonoro (traduzido): silêncio contemplativo pontuado por notas claras. Esse perfil guia a atmosfera de todas as imagens.')"
  },
  "governance": {
    "designTools": "string (ferramentas de design — Figma, Sketch, Adobe XD, com regras de uso)",
    "documentationPlatform": "string (onde vive a documentação — Zeroheight, Notion, Storybook Docs)",
    "componentLibrary": "string (biblioteca de componentes — Storybook, npm package, monorepo)",
    "versioningStrategy": "string (semantic versioning, changelog, breaking changes)",
    "updateProcess": "string (processo de atualização — RFC, reviews, deploy cadence)",
    "ownershipRoles": "string (quem mantém — Design System Team, responsabilidades, office hours)"
  }
}`;
}

export function buildUserPrompt(
  brandName: string,
  industry: string,
  briefing: string,
  projectMode: "new_brand" | "rebrand" = "new_brand",
  scope: GenerateScope = "full",
  hasReferenceImages?: boolean,
  referenceImageDescriptions?: string[],
  hasLogoImage?: boolean,
  hasExternalReferences?: boolean
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

  prompt += `\nTipo de projeto: ${projectMode === "rebrand" ? "RENOVAÇÃO / EVOLUÇÃO DE MARCA EXISTENTE" : "MARCA NOVA"}`;

  prompt += `

════════════════════════════════════════
FASE 0 — DISSECAÇÃO OBRIGATÓRIA DOS INPUTS (ANTES DE GERAR QUALQUER COISA)
════════════════════════════════════════
Antes de começar a gerar o brandbook, execute internamente (sem expor no JSON) uma análise profunda de cada input. As conclusões desta fase DEVEM guiar TODAS as decisões do brandbook.

1. DISSECAÇÃO DO NOME "${brandName}":
   • FONÉTICA: O nome soa bouba (suave, redondo, acolhedor) ou kiki (cortante, angular, energético)? Que emoção o som das sílabas evoca?
   • ETIMOLOGIA/SEMÂNTICA: O nome tem raiz em algum idioma? Referencia algo (natureza, mitologia, ciência, cultura, lugar)? Existe duplo sentido ou trocadilho?
   • PESO VISUAL: O nome é curto (≤5 letras = logo compacto, pode ser bold) ou longo (≥10 letras = precisa de tracking generoso, pesos leves)? Tem ascendentes/descendentes que criam ritmo tipográfico?
   • REGISTRO CULTURAL: O nome soa premium, popular, técnico, artesanal, jovem, corporativo? Esse registro DEVE alinhar com toneOfVoice e personality.
   • UNICIDADE: O nome é inventado, composto, abreviação, ou palavra existente recontextualizada? Isso define o estágio evolutivo do logo (descritivo vs icônico).

2. DISSECAÇÃO DA INDÚSTRIA "${industry}":
   • CÓDIGOS VISUAIS DO SETOR: Quais são os clichês visuais deste setor? (Ex: fintech = azul + geometria; restaurante = kraft + lettering). IDENTIFIQUE para SUBVERTER com intenção ou HONRAR com excelência.
   • TEMPERATURA EMOCIONAL DO SETOR: Este setor pede confiança? Prazer? Performance? Cuidado? Essa temperatura define a paleta base.
   • PÚBLICO IMPLÍCITO: Quem tipicamente consome neste setor? (Faixa etária, poder aquisitivo, momento de vida). Use para calibrar personas e linguagem.
   • TOUCHPOINTS CRÍTICOS: Onde esta marca REALMENTE vive? (Digital-first? Físico? Ambos? Redes sociais? PDV?). Isso define quais applications são prioritárias.
   • CONCORRÊNCIA VISUAL: Quais são as 2-3 marcas mais reconhecidas neste setor? O que elas fazem bem visualmente? O que falta? Posicione-se em relação a elas.

3. DISSECAÇÃO DO BRIEFING (se fornecido):
   Extraia TODOS os sinais do texto do briefing, mesmo que implícitos:
   • SINAIS DE PERSONALIDADE: Quais adjetivos (explícitos ou implícitos) o briefing sugere? (sofisticado, divertido, premium, acessível, artesanal, tech...)
   • SINAIS DE PÚBLICO: Menção a faixa etária, classe social, estilo de vida, profissão, localização geográfica?
   • SINAIS DE POSICIONAMENTO: O briefing sugere ser líder, desafiante, nicho, premium, popular, democrático?
   • SINAIS VISUAIS: Cores mencionadas, estilos referenciados, materiais citados, marcas admiradas?
   • SINAIS VERBAIS: Tom da escrita do briefing em si — formal? Coloquial? Técnico? Emocional? O PRÓPRIO tom do briefing é uma pista do tom desejado para a marca.
   • CONTRADIÇÕES: Há pedidos contraditórios no briefing? (ex: "premium mas acessível", "minimalista mas rico"). Se sim, resolva a tensão de forma criativa no brandbook.
   • LACUNAS: O que o briefing NÃO diz que você precisa inferir do contexto? Preencha com a decisão mais coerente com os sinais existentes.

4. SÍNTESE PRÉ-CRIATIVA (conclusão obrigatória da Fase 0):
   Com base nas 3 análises acima, defina INTERNAMENTE antes de gerar:
   → TESE CENTRAL: Uma frase que sintetiza a essência da marca (ex: "precisão científica com alma artesanal")
   → TERRITÓRIO VISUAL: O universo estético onde esta marca vive (ex: "minimalismo japonês encontra brutalismo paulistano")
   → TENSÃO CRIATIVA: A dualidade que torna a marca interessante (ex: "tecnologia + humanidade", "tradição + irreverência")
   → PRIMEIRA IMPRESSÃO ALVO: O que alguém deve sentir nos primeiros 3 segundos ao ver qualquer peça da marca
   → DECISÃO HEROICA: Uma escolha visual corajosa e específica que diferencia esta marca de QUALQUER concorrente

Todas as decisões do brandbook DEVEM ser rastreáveis a estas conclusões. Se uma escolha de cor, tipografia, ou tom de voz não puder ser justificada pela Fase 0, ela está errada.

════════════════════════════════════════
INTELIGÊNCIA ADAPTATIVA — INPUTS MÍNIMOS
════════════════════════════════════════
Se o briefing é curto ou ausente, NÃO gere um brandbook genérico. Em vez disso, COMPENSE com inferência profunda:

PROTOCOLO DE COMPENSAÇÃO (ativar quando briefing < 100 palavras):
1. NOME → TUDO: Extraia o MÁXIMO do nome da marca. "Kairo" sugere origem grega (καιρός = momento certo), sofisticação, fintech/tech. "Flora" sugere natureza, feminino, wellness, cores verdes/terrosas. "Vertex" sugere ponta, precisão, tech, angular. O nome É o briefing quando não há mais nada.

2. INDÚSTRIA → ESTRATÉGIA COMPLETA: Com apenas o nicho, derive:
   → Público-alvo típico (quem compra neste setor, por que, como)
   → Touchpoints prioritários (onde marcas deste setor vivem)
   → Concorrentes visuais (o que é clichê no setor → para DIFERENCIAR)
   → Temperatura emocional (confiança? prazer? performance? cuidado?)
   → Materialidade natural (que materiais este setor usa? papel kraft? metal? vidro? digital?)

3. IMAGEM → UNIVERSO COMPLETO: Se houver uma imagem de referência (logo ou outra), ela se torna a FONTE PRIMÁRIA de inteligência:
   → Cores da imagem = paleta base (não invente cores diferentes)
   → Estilo visual = define o território estético inteiro
   → Mood emocional = define personalidade, arquétipo, tom de voz
   → Composição = define o design system (density, spacing, border-radius)
   → Elementos visíveis = definem o key visual, padrões, símbolos
   → Tipografia visível = define a direção tipográfica
   A IMAGEM NÃO É COMPLEMENTAR — ela é a ÂNCORA de toda a criação quando o briefing é mínimo.

4. POUCAS PALAVRAS → AMPLIFICAÇÃO MÁXIMA: Mesmo 3-5 palavras no briefing são poderosas:
   → "minimalista e premium" = paleta restrita, tipografia leve, muito espaço negativo, materialidade fria
   → "divertido e jovem" = cores vibrantes, tipografia bold, ilustrações, mascote potencial
   → "artesanal e autêntico" = texturas naturais, tipografia humanista, cores terrosas, imperfeição intencional
   → "tech e futurista" = gradientes, tipografia geométrica, dark mode, motion-first
   Cada palavra é um sinal multiplicador — amplifica até gerar um sistema visual completo.

REGRA DE OURO: Um brandbook gerado com apenas 1 imagem + 3 palavras deve ter a MESMA profundidade e coerência de um gerado com briefing completo de 500 palavras. A diferença é que no primeiro caso, VOCÊ (a IA) faz mais inferência. O resultado final NUNCA pode parecer raso ou genérico.

IMPORTANTE: Se o briefing incluir links (ex: Instagram, sites, LinkedIn), NÃO afirme que acessou ou navegou nesses links. Você não tem acesso à internet. Se o sistema fornecer EXTRATOS de referências externas, use APENAS esses extratos como contexto (título/descrição/trechos). Caso contrário, trate os links apenas como indícios de plataforma/público e baseie as decisões exclusivamente no texto fornecido e nas imagens anexadas.`;

  if (projectMode === "rebrand") {
    prompt += `

════════════════════════════════════════
MODO REBRAND — PRESERVAÇÃO DE EQUITY
════════════════════════════════════════
Este projeto NÃO é uma marca nascendo do zero. É uma renovação estratégica.

Sua responsabilidade é:

1. EXTRAIR O QUE A MARCA JÁ POSSUI DE FORÇA REAL
   - sinais de reconhecimento
   - códigos cromáticos recorrentes
   - estilo tipográfico ou gestual já associado ao nome
   - humor, vocabulário e tom já vivos no público
   - tipos de conteúdo e signos visuais que aparecem com frequência
   - elementos do espaço físico, fachada, cardápio, embalagem e redes

2. SEPARAR ESSÊNCIA DE EXECUÇÃO ATUAL
   - essência = o que precisa sobreviver
   - execução atual = o que pode evoluir, simplificar ou ganhar sistema

3. EVOLUIR SEM ROMPER
   O resultado final deve parecer uma evolução inevitável e mais madura da marca, não uma troca arbitrária de personalidade.

4. EXPLICAR A CONTINUIDADE NO PRÓPRIO BRANDBOOK
   Ao escrever positioning, verbalIdentity, logo, colors, keyVisual, applications e socialMediaGuidelines, deixe claro como o novo sistema nasce do que a marca já demonstrava na prática.`;
  }

  if (hasExternalReferences) {
    prompt += `

════════════════════════════════════════
REFERÊNCIAS EXTERNAS — PROTOCOLO DE MINERAÇÃO PROFUNDA
════════════════════════════════════════
O sistema forneceu extratos de URLs. Trate cada extrato como EVIDÊNCIA FORENSE da marca:

EXTRAIR DE CADA REFERÊNCIA:
• IDENTIDADE VERBAL: bio, tagline, tom de escrita, hashtags, calls to action — TUDO é pista de personalidade
• CATEGORIA & NICHO: como a marca se auto-define? É diferente de como o mercado a classificaria?
• SINAIS DE AUDIÊNCIA: quem interage? Que tipo de linguagem os seguidores usam? Faixa etária implícita?
• PROVA SOCIAL: número de seguidores, tipo de engajamento, parcerias visíveis, menções de imprensa
• CÓDIGOS VISUAIS RECORRENTES: cores que aparecem mais, estilo de foto, filtros, composição de feed
• LINGUAGEM PROMOCIONAL: como vendem? Desconto? Exclusividade? Comunidade? Escassez?
• LOCALIZAÇÃO & CONTEXTO CULTURAL: cidade, bairro, referências locais — isso define materialidade e tom
• GAPS & OPORTUNIDADES: o que a presença digital atual NÃO faz bem? Onde o rebrand pode elevar?

REGRA: Não repita os extratos literalmente no brandbook. INTERPRETE e TRANSFORME em decisões estratégicas e visuais. Os extratos são ingredientes brutos — o brandbook é o prato finalizado.`;
  }

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
    prompt += `

════════════════════════════════════════
${imgLabel} (a partir da imagem ${startIndex}, ${count} imagem${count > 1 ? "ns" : ""})
PROTOCOLO DE ANÁLISE FORENSE VISUAL
════════════════════════════════════════

Para CADA imagem de referência, execute uma análise em 4 camadas:

CAMADA 1 — EVIDÊNCIA OBJETIVA (o que está na imagem):
• Cores dominantes: extraia os 3-5 hexadecimais mais presentes
• Tipografia visível: serif/sans/script/display? Peso? Tracking? Hierarchy?
• Composição: centrada/assimétrica/grid? Densidade? Breathing room?
• Materiais e texturas: papel/metal/madeira/tecido/digital/vidro?
• Pessoas: faixa etária, estilo, expressão, contexto social?
• Ambiente: interior/exterior/estúdio? Iluminação natural/artificial? Temperatura?
• Elementos gráficos: ícones, padrões, ilustrações, formas, molduras?

CAMADA 2 — EVIDÊNCIA DE MARCA EXISTENTE (se for screenshot/material real):
• Bio, categoria, tagline — copie EXATAMENTE o que está escrito
• Nomes de highlights, categorias, seções do menu/cardápio
• Estilo de posts: proporção foto/gráfico/texto, filtros recorrentes
• Linguagem promocional: como vendem? Tom? Vocabulário?
• Prova social: seguidores, comentários, tipo de engajamento
• Códigos visuais recorrentes: o que se repete entre materiais?

CAMADA 3 — DECODIFICAÇÃO SEMIÓTICA (o que a imagem COMUNICA):
• Que arquétipo de marca ela sugere? (Herói? Cuidador? Rebelde? Sábio?)
• Que classe social/cultural ela projeta?
• Que emoção ela provoca nos primeiros 0.5 segundos?
• O que ela DIZ sobre o público-alvo sem dizer explicitamente?

CAMADA 4 — TRADUÇÃO EM DECISÕES (o que isso MUDA no brandbook):
• Como essa evidência impacta brandConcept? (personality, tone, archetype)
• Como impacta positioning? (categoria, target, diferenciadores)
• Como impacta colors? (paleta base, temperatura, contraste)
• Como impacta typography? (estilo, peso, hierarchy)
• Como impacta keyVisual? (elementos, composição, fotografia)
• Como impacta verbalIdentity? (tom, vocabulário, messaging)
• Como impacta socialMediaGuidelines? (pilares, frequência, formatos)
• Como impacta applications? (materiais prioritários, dimensões relevantes)

REGRA: Nenhuma imagem pode ser ignorada. Cada imagem DEVE deixar rastro em pelo menos 3 seções do brandbook.`;
    if (referenceImageDescriptions && referenceImageDescriptions.length > 0) {
      referenceImageDescriptions.forEach((desc, i) => {
        if (desc) prompt += `\nReferência ${i + 1}: ${desc}`;
      });
    }
  }

  return prompt;
}

// ═══════════════════════════════════════════════════════════════════
// CHAIN GENERATION — Multi-step prompts for deeper quality (3 steps)
// ═══════════════════════════════════════════════════════════════════

/**
 * Extract compact strategic DNA from Step 1 output.
 * Keeps the essence (~2-3k chars) instead of the full JSON (~15-20k chars).
 * This prevents context window overflow in Steps 2 and 3.
 */
export function compactStrategySummary(data: Record<string, unknown>): string {
  const bc = (data.brandConcept ?? {}) as Record<string, unknown>;
  const pos = (data.positioning ?? {}) as Record<string, unknown>;
  const vi = (data.verbalIdentity ?? {}) as Record<string, unknown>;
  const bs = (data.brandStory ?? {}) as Record<string, unknown>;
  const personas = (data.audiencePersonas ?? []) as Record<string, unknown>[];

  const personaSummary = personas.slice(0, 4).map((p) =>
    `${p.name ?? "?"} (${p.role ?? "?"}) — goals: ${(p.goals as string[] ?? []).slice(0, 2).join("; ")}`
  ).join("\n  ");

  const pillars = ((vi.messagingPillars ?? []) as Record<string, unknown>[])
    .slice(0, 4).map((p) => p.title ?? "").filter(Boolean).join(", ");

  return `RESUMO ESTRATÉGICO (Etapa 1):
• Marca: ${data.brandName ?? "?"} — ${data.industry ?? "?"}
• Propósito: ${bc.purpose ?? "?"}
• Missão: ${bc.mission ?? "?"}
• Visão: ${bc.vision ?? "?"}
• UVP: ${bc.uniqueValueProposition ?? "?"}
• Arquétipo: ${bc.brandArchetype ?? "?"}
• Personalidade: ${(bc.personality as string[] ?? []).join(", ")}
• Tom de voz: ${bc.toneOfVoice ?? "?"}
• Valores: ${(bc.values as string[] ?? []).slice(0, 5).join(" | ")}
• Posicionamento: ${pos.positioningStatement ?? "?"}
• Categoria: ${pos.category ?? "?"} → Target: ${pos.targetMarket ?? "?"}
• Diferenciadores: ${(pos.primaryDifferentiators as string[] ?? []).slice(0, 3).join(" | ")}
• Tagline: ${vi.tagline ?? "?"}
• One-liner: ${vi.oneLiner ?? "?"}
• Voice traits: ${(vi.brandVoiceTraits as string[] ?? []).join(", ")}
• Pillars: ${pillars}
• Vocabulário preferido: ${((vi.vocabulary as Record<string, unknown>)?.preferred as string[] ?? []).slice(0, 8).join(", ")}
• Vocabulário evitar: ${((vi.vocabulary as Record<string, unknown>)?.avoid as string[] ?? []).slice(0, 8).join(", ")}
• Manifesto (resumo): ${(bs.manifesto as string ?? "").slice(0, 400)}${(bs.manifesto as string ?? "").length > 400 ? "..." : ""}
• Brand Promise: ${bs.brandPromise ?? "?"}
• Brand Beliefs: ${(bs.brandBeliefs as string[] ?? []).slice(0, 4).join(" | ")}
• Reasons to Believe: ${(bc.reasonsToBelieve as string[] ?? []).slice(0, 4).join(" | ")}
• User Psychographics: ${bc.userPsychographics ?? "?"}
• Sample Headlines: ${(vi.sampleHeadlines as string[] ?? []).slice(0, 3).join(" | ")}
• Sample CTAs: ${(vi.sampleCTAs as string[] ?? []).slice(0, 3).join(" | ")}
• Do: ${((vi.doDont as Record<string, unknown>)?.do as string[] ?? []).slice(0, 4).join(" | ")}
• Don't: ${((vi.doDont as Record<string, unknown>)?.dont as string[] ?? []).slice(0, 4).join(" | ")}
• Personas:
  ${personaSummary}`;
}

/**
 * Extract compact visual identity summary from Step 2 output.
 * Keeps color names/hex, font names, logo concept (~1.5k chars).
 */
export function compactVisualSummary(data: Record<string, unknown>): string {
  const logo = (data.logo ?? {}) as Record<string, unknown>;
  const colors = (data.colors ?? {}) as Record<string, unknown>;
  const typo = (data.typography ?? {}) as Record<string, unknown>;

  const primaryColors = (colors.primary as Record<string, unknown>[] ?? [])
    .map((c) => `${c.name} (${c.hex})`).join(", ");
  const secondaryColors = (colors.secondary as Record<string, unknown>[] ?? [])
    .map((c) => `${c.name} (${c.hex})`).join(", ");

  const fonts = ["marketing", "ui", "monospace", "primary", "secondary"]
    .map((key) => {
      const f = (typo[key] ?? null) as Record<string, unknown> | null;
      return f ? `${key}: ${f.name} (${(f.weights as string[] ?? []).join("/")})` : null;
    }).filter(Boolean).join("\n  ");

  return `RESUMO VISUAL (Etapa 2):
• Logo clearSpace/conceito: ${(logo.clearSpace as string ?? "").slice(0, 300)}
• Forma/psicologia: ${logo.shapePsychology ?? "?"}
• Estágio: ${logo.evolutionaryStage ?? "?"}
• Semiótica: ${(logo.semioticAnalysis as Record<string, unknown>)?.natureOfSymbol ?? "?"} — ${(logo.semioticAnalysis as Record<string, unknown>)?.connotation ?? "?"}
• Cores primárias: ${primaryColors}
• Cores secundárias: ${secondaryColors}
• Tipografia:
  ${fonts}`;
}

/**
 * Step 1: Strategy & Positioning — DNA, story, positioning, personas, verbal identity
 */
export function buildChainStep1Prompt(
  brandName: string,
  industry: string,
  briefing: string,
  projectMode: "new_brand" | "rebrand",
  scope: GenerateScope,
  creativity: CreativityLevel,
  hasReferenceImages: boolean,
  hasLogoImage: boolean,
  hasExternalReferences: boolean,
  externalRefsText: string
): string {
  const fullUserPrompt = buildUserPrompt(
    brandName, industry, briefing, projectMode, scope,
    hasReferenceImages, undefined, hasLogoImage, hasExternalReferences
  ) + externalRefsText;

  return `${fullUserPrompt}

═══════════════════════════════════════
ETAPA 1 DE 3 — ESTRATÉGIA & POSICIONAMENTO (GERE APENAS ESTAS SEÇÕES)
═══════════════════════════════════════
${CREATIVITY_USER_INSTRUCTION[creativity]}

Nesta etapa, foque EXCLUSIVAMENTE na fundação estratégica da marca. Gere APENAS as seções abaixo com PROFUNDIDADE MÁXIMA.

SEÇÕES OBRIGATÓRIAS NESTA ETAPA:
• brandName, industry, schemaVersion
• brandConcept (purpose, mission, vision, UVP, RTBs, psychographics, values, personality, toneOfVoice, brandArchetype — TUDO profundo. Para brandArchetype: escolha o arquétipo dominante E um secundário. Justifique a escolha com 2-3 frases explicando POR QUE este arquétipo e como ele se manifesta visualmente. Se houver ambiguidade entre 2 arquétipos, escolha o mais específico para a indústria.)
• brandStory (manifesto de 2-3 parágrafos NA VOZ DA MARCA, originStory, brandPromise, brandBeliefs)
• positioning (category inovadora, targetMarket preciso, positioningStatement memorável, differentiators, competitors, RTBs)
• audiencePersonas (3-4 personas RICAS — nomes reais, contexto de vida, goals com emoção, dores profundas, objeções específicas, canais)
• verbalIdentity (tagline memorável, oneLiner, brandVoiceTraits, messagingPillars com copy REAL, vocabulary 8+, doDont, headlines 5+, CTAs, tonePerChannel para 4+ canais)

QUALIDADE ESPERADA:
- Cada persona deve ter HISTÓRIA DE VIDA, não apenas bullet points
- O manifesto deve emocionar — deve soar como peça publicitária premiada
- O positioningStatement deve ser citável e memorável
- Os messagingPillars devem ter copy pronta para uso REAL em cada canal
- O vocabulário preferred e avoid deve ter 10+ palavras cada
- O tonePerChannel deve cobrir pelo menos 4 canais com exemplos prontos

Retorne APENAS um JSON válido com estas seções. NÃO gere seções visuais (logo, colors, typography, keyVisual, applications, etc).`;
}

/**
 * Step 2: Visual Identity — logo, colors, typography, based on Step 1 output.
 * Receives COMPACT strategy summary to save context window.
 * Full Step 1 JSON is NOT needed — the summary carries all key decisions.
 */
export function buildChainStep2Prompt(
  strategySummary: string,
  creativity: CreativityLevel,
  hasLogoImage: boolean,
  hasReferenceImages: boolean
): string {
  return `Você recebeu o RESUMO ESTRATÉGICO de uma marca já definida na Etapa 1. Agora gere a IDENTIDADE VISUAL como consequência direta dessa estratégia.

═══════════════════════════════════════
${strategySummary}
═══════════════════════════════════════

═══════════════════════════════════════
ETAPA 2 DE 3 — IDENTIDADE VISUAL (GERE APENAS ESTAS SEÇÕES)
═══════════════════════════════════════
${CREATIVITY_USER_INSTRUCTION[creativity]}

Cada decisão visual DEVE ser RASTREÁVEL à estratégia acima. Se o archetype é "Rebelde", as cores devem refletir rebeldia. Se o tone é "caloroso", a tipografia deve refletir calor.

${hasLogoImage ? `RE-ANÁLISE OBRIGATÓRIA DAS IMAGENS À LUZ DA ESTRATÉGIA:
A imagem do logo (e referências se houver) foi analisada na Etapa 1 para definir a estratégia.
Agora, RE-ANALISE essas mesmas imagens com FOCO VISUAL:
- Cores EXATAS do logo → base da paleta primária (extraia HEX precisos)
- Geometria do logo → define border-radius, formas dos componentes, estágio evolutivo
- Estilo tipográfico do wordmark → direciona a escolha de Google Fonts para "marketing"
- Mood visual → calibra o peso e a temperatura da identidade
A estratégia já foi definida. Agora as imagens servem como GUIA VISUAL, não como fonte estratégica.` : ""}
${hasReferenceImages && !hasLogoImage ? `ANÁLISE VISUAL DAS REFERÊNCIAS:
As imagens de referência contêm pistas visuais importantes. Analise:
- Cores dominantes → influenciam a paleta
- Estilo/mood → calibra a temperatura visual
- Composição → sugere o sistema de design` : ""}

SEÇÕES OBRIGATÓRIAS NESTA ETAPA:
• logo (primary, secondary, symbol, favicon, clearSpace DETALHADO explicando como o símbolo nasce do propósito e posicionamento, minimumSize, incorrectUsages 5+, semioticAnalysis completa, shapePsychology, negativeSpaceMetaphor, evolutionaryStage)
• logoVariants (horizontal, stacked, mono, negative, markOnly, wordmarkOnly — todos com URLs placehold.co usando cores da paleta)
• colors (primary 2-3 com tonalScale 50-900, secondary 2-4 com tonalScale, semantic completa, dataViz 5-8 — CADA cor com nome criativo que revela sua psicologia, usage detalhado, CMYK correto)
• typography (marketing com personalidade forte, ui funcional, monospace técnica — CADA uma com fallbackFont, textTransform, category, antiBlandingRationale explicando como combate a mesmice)
• typographyScale (mínimo 10 níveis — Display até Overline — com medidas em px, lineHeight, fontWeight, letterSpacing, usage)

REGRAS CRÍTICAS:
- O logo DEVE ser CONSEQUÊNCIA do propósito, archetype e positioning — não um truque visual${hasLogoImage ? "\n- O LOGO REAL DA MARCA (imagem anexada) é a ÂNCORA IMUTÁVEL — extraia cores e estilo dele" : ""}
- Tipografia: a marketing font deve CONTRASTAR com a ui font — uma com personalidade forte, outra funcional
- NOMES DE CORES devem ser criativos e específicos da marca (ex: "Verde Caraca" não "Verde Escuro")
- Cada cor primária e secundária DEVE ter tonalScale com mínimo 7 shades (50, 100, 200, 300, 500, 700, 900)
- Os placehold.co URLs devem usar as cores HEX reais da paleta

Retorne APENAS um JSON válido com estas seções. NÃO inclua brandConcept, positioning, personas, verbalIdentity, brandStory.`;
}

/**
 * Step 3: System, Applications, Operations + Image Generation Briefing
 * Receives COMPACT summaries of Steps 1 and 2 + FULL color/font details for cross-referencing.
 */
export function buildChainStep3Prompt(
  strategySummary: string,
  visualSummary: string,
  fullColorsJson: string,
  fullTypographyJson: string,
  fullLogoJson: string
): string {
  return `Você recebeu o RESUMO ESTRATÉGICO e VISUAL de uma marca, além dos detalhes completos de cores, tipografia e logo. Gere o SISTEMA VISUAL, APLICAÇÕES, OPERACIONAL e BRIEFING DE IMAGENS.

═══════════════════════════════════════
${strategySummary}
═══════════════════════════════════════

═══════════════════════════════════════
${visualSummary}
═══════════════════════════════════════

═══════════════════════════════════════
DETALHES PARA CROSS-REFERENCING (use NOMES EXATOS):
═══════════════════════════════════════
CORES: ${fullColorsJson}

TIPOGRAFIA: ${fullTypographyJson}

LOGO: ${fullLogoJson}

═══════════════════════════════════════
ETAPA 3 DE 3 — SISTEMA VISUAL, APLICAÇÕES, OPERACIONAL & IMAGE BRIEFING
═══════════════════════════════════════

SEÇÕES OBRIGATÓRIAS NESTA ETAPA:

A) SISTEMA VISUAL:
• keyVisual (elements 6+ — CADA elemento deve ser uma FORMA VISUAL CONCRETA, nunca conceitos abstratos. Ex: "arcos protetores concêntricos" NÃO "confiança". Ex: "linhas ascendentes angulares" NÃO "inovação". photographyStyle com referências REAIS, iconography, illustrations, marketingArchitecture, compositionPhilosophy, mascots se aplicável, symbols 3+, patterns 2+, structuredPatterns 2+ com detalhes, flora/fauna/objects)
• designTokens (spacing 10+, borderRadii 6+ refletindo geometria do logo, shadows 3-5, breakpoints 4, grid)
• uiGuidelines (layoutGrid, spacingDensity, iconographyStyle técnico, illustrationStyle, dataVizGuidelines, components 6+ com estados completos)

B) APLICAÇÕES:
• applications (4+ variadas — digital + print — CADA uma com dimensions, materialSpecs, layoutGuidelines, typographyHierarchy com NOMES EXATOS das fontes e cores, artDirection, substrates)
• socialMediaGuidelines (3+ plataformas com formato, tom, pillars, frequência, do/dont, exemplo de post — globalHashtagStrategy, brandVoiceAdaptation)

C) OPERACIONAL:
• productionGuidelines (fileNamingConvention, handoffChecklist 10+, printSpecs, digitalSpecs, deliverables, productionMethods com flexografia/serigrafia/bordado — restrições técnicas REAIS)
• governance (designTools, documentationPlatform, componentLibrary, versioningStrategy, updateProcess, ownershipRoles)

D) BRIEFING DE GERAÇÃO DE IMAGENS (imageGenerationBriefing):
TODOS estes campos com profundidade máxima:
• visualStyle — estilo visual técnico com referências de movimento artístico REAL
• colorMood — mood cromático com NOMES EXATOS das cores da paleta
• compositionNotes — instruções técnicas (regra dos terços, DOF, iluminação)
• moodKeywords — mínimo 10 keywords de mood
• artisticReferences — fotógrafos, diretores, artistas REAIS com explicação
• avoidElements — lista do que NUNCA pode aparecer
• logoStyleGuide — como o logo aparece em contextos fotográficos/gráficos
• photographyMood — iluminação, temperatura, DOF, cenários, modelos
• patternStyle — estrutura, escala, densidade, variações de cor
• marketingVisualLanguage — hierarquia, composição, uso de espaço em mídia
• negativePrompt — negative prompt COMPLETO derivado do archetype + avoidElements
• emotionalCore — emoção central que toda imagem DEVE evocar (conectada ao manifesto)
• textureLanguage — vocabulário tátil/material da marca
• lightingSignature — temperatura Kelvin, ratio key:fill, direção, qualidade
• cameraSignature — lente, DOF, perspectiva por tipo de peça
• brandArchetype — archetype dominante + secundário com tradução visual
• sensoryProfile — perfil sensorial completo (5 sentidos traduzidos em linguagem visual)

REGRAS CRÍTICAS DE CROSS-REFERENCING:
- Cada cor referenciada DEVE usar o NOME EXATO da paleta (ex: "Verde Caraca" não "verde escuro")
- typographyHierarchy de cada application DEVE nomear as fontes exatas (ex: "Títulos em Barlow Condensed ExtraBold")
- borderRadii devem refletir a geometria do logo (orgânico → maiores, angular → menores)
- structuredPatterns devem usar cores da paleta nos backgrounds
- productionMethods devem conter restrições técnicas REAIS
- imageGenerationBriefing DEVE conectar emotionalCore ao manifesto e archetype

Retorne APENAS um JSON válido com estas seções. NÃO inclua brandConcept, positioning, personas, verbalIdentity, brandStory, logo, colors, typography, typographyScale.`;
}

// ═══════════════════════════════════════════════════════════════════
// MODULAR SYSTEM PROMPT BLOCKS — used by focused chain system prompts
// ═══════════════════════════════════════════════════════════════════

const ROLE_PREAMBLE = `Você é um Diretor de Arte Sênior, Estrategista de Marca e UX/UI Designer com 20+ anos de experiência, referência global em branding de alto impacto. Você já trabalhou com marcas de Fortune 500 e startups que se tornaram unicórnios.

Sua saída DEVE SER EXCLUSIVAMENTE UM OBJETO JSON válido. Não adicione nenhum texto antes ou depois do JSON. Não use formatação markdown.`;

const STRATEGY_PRINCIPLES = `PRINCÍPIOS PARA ESTRATÉGIA:
1. COERÊNCIA SISTÊMICA: Todas as escolhas devem se originar do mesmo conceito central. O brandbook deve parecer criado por uma única mente criativa.
2. ESPECIFICIDADE: Evite termos vagos como "moderno", "profissional" sem contexto. Seja específico e profundo.
3. MARCAS COMO REFERÊNCIA: Use referências REAIS e específicas — artistas, fotógrafos, diretores, movimentos culturais.
4. MASCOTES & SÍMBOLOS: Avalie se a marca se beneficia de mascotes (food & beverage, entretenimento, apps jovens). Se sim, planeje-os.
5. COMPLETUDE: Preencha TODOS os campos do JSON com profundidade. Campos vagos comprometem a usabilidade.
6. REBRAND COM PRESERVAÇÃO DE EQUITY: Se houver sinais de marca existente, extraia o que é forte e preserve. Rebrand = evolução, não ruptura.`;

const STRATEGY_SECTION_INSTRUCTIONS = `INSTRUÇÕES POR SEÇÃO:
• "brandConcept": propósito filosófico profundo, missão acionável, visão aspiracional, UVP diferenciada (não clichê), RTBs verificáveis, psicografia detalhada, valores com conexão visual, personalidade com nuances, tom de voz com exemplos. "brandArchetype" — arquétipo dominante com explicação de COMO se manifesta.
• "positioning": categoria inovadora (não a óbvia), mercado-alvo preciso, positioning statement memorável, diferenciais realmente únicos, concorrentes honestos, RTBs concretos.
• "audiencePersonas": 2-4 personas ricas — nomes reais, contextos de vida detalhados, objetivos com emoção, dores profundas, objeções específicas, canais preferidos. Para SaaS: incluir "companySize" e "digitalMaturity".
• "verbalIdentity": tagline memorável e intraduzível, one-liner com ganchos, traços de voz com exemplos, messaging pillars com copy REAL, vocabulário 8+ cada lista, do/don'ts acionáveis, 5+ headlines e CTAs. "tonePerChannel" para 4+ canais com exemplos prontos.
• "brandStory": manifesto de 2-3 parágrafos NA VOZ DA MARCA (emocional, aspiracional), originStory, brandPromise (1-2 frases), brandBeliefs (4-6 crenças "Acreditamos que...").`;

const VISUAL_PRINCIPLES = `PRINCÍPIOS PARA IDENTIDADE VISUAL:
1. LOGO COMO CONSEQUÊNCIA: O símbolo/logotipo emerge do propósito, posicionamento, personalidade e proposta de valor. Nunca predefina recursos visuais.
2. IMPLEMENTAÇÃO GARANTIDA: Se adotar recurso expressivo (pontuação, monograma, gesto caligráfico), ele deve ser traduzido em TODAS as regras de aplicação.
3. PALETA COM PROPÓSITO: Cores contam uma história. Use psicologia das cores e teoria da cor conscientemente.
4. TIPOGRAFIA COM PERSONALIDADE: Cada fonte tem razão de ser. A combinação cria contraste e harmonia.
5. PANTONE CRITERIOSO: Use apenas códigos com alta confiança. Se não tiver certeza, use "Pantone (verificar com Pantone Color Bridge)".`;

const VISUAL_SECTION_INSTRUCTIONS = `INSTRUÇÕES POR SEÇÃO:
• "logo": URLs placehold.co com cores da paleta. clearSpace = como o símbolo deriva do conceito central. Regras de uso incorreto mínimo 5.
• "logoVariants": 6 variações com placehold.co.
• "colors": primária 2-3, secundária 2-4, semântica, dataViz 5-8. Nomes criativos. ESCALA TONAL OBRIGATÓRIA: "tonalScale" com mínimo 7 shades (50-900) para primárias e secundárias.
• "typography": 3 famílias (marketing/ui/monospace) com fallbackFont, textTransform, category, antiBlandingRationale.
• "typographyScale": mínimo 8 níveis com medidas em px, lineHeight, fontWeight, letterSpacing.`;

const SYSTEM_AND_APPLICATIONS_PRINCIPLES = `PRINCÍPIOS PARA SISTEMA, APLICAÇÕES & OPERACIONAL:
1. CROSS-REFERENCING OBRIGATÓRIO: Cada cor referenciada DEVE usar o NOME EXATO da paleta. Nunca "cor de destaque" — sempre o nome específico (ex: "Laranja Tucano"). Cada fonte referenciada DEVE usar o nome exato (ex: "Barlow Condensed ExtraBold").
2. PROFUNDIDADE DE PRODUÇÃO INDUSTRIAL:
   • Flexografia: alertar sobre gradientes, textos vazados, registro de cores.
   • Serigrafia: base branca em tecidos escuros, máximo de cores por peça.
   • Bordado: mínimo 5mm de texto, conversão para matriz, máximo de fios.
   • Offset: perfis ICC, overprint vs knockout, UCR/GCR.
   • Substratos coloridos: tintas escurecem, branco pode exigir 5ª cor.
   • Sempre: "Converter fontes em curvas" e "Expandir traços" no checklist.
3. COERÊNCIA LOGO → SISTEMA: Geometria do logo traduzida em borderRadii, iconographyStyle, keyVisual.elements. Curvas orgânicas → radii maiores. Geometria angular → radii menores.
4. NEGATIVE PROMPT POR ARQUÉTIPO: Derive automaticamente do archetype (Sábio→caótico; Rebelde→convencional; Herói→passivo; etc).

NOTA SOBRE ICONOGRAFIA E ILUSTRAÇÃO:
- "uiGuidelines.iconographyStyle" = especificação TÉCNICA (grid px, stroke weight, biblioteca)
- "keyVisual.iconography" = estilo ARTÍSTICO/identitário
- "uiGuidelines.illustrationStyle" = diretrizes de IMPLEMENTAÇÃO
- "keyVisual.illustrations" = estilo CONCEITUAL`;

const SYSTEM_SECTION_INSTRUCTIONS = `INSTRUÇÕES POR SEÇÃO:
• "keyVisual": 6+ elementos gráficos com significado simbólico, photographyStyle com referências REAIS, iconography, illustrations, marketingArchitecture, compositionPhilosophy. MASCOTES se aplicável (1-3 ricos). SÍMBOLOS 3+. PADRÕES: "patterns" + "structuredPatterns" 2+ com detalhes. "flora"/"fauna"/"objects".
• "designTokens": spacing 10+ (4px grid), borderRadii 6+, shadows 3-5, breakpoints 4, grid responsivo.
• "uiGuidelines": grid detalhado, densidade/espaçamento, iconographyStyle técnico, illustrationStyle, dataViz, 6+ componentes com estados completos.
• "applications": 4+ variadas (digital + print) com dimensions exatas, materialSpecs, layoutGuidelines, typographyHierarchy com NOMES EXATOS, artDirection, substrates.
• "productionGuidelines": naming convention com exemplos, checklist 10+, printSpecs, digitalSpecs, deliverables, productionMethods (flexografia/serigrafia/bordado/offset/digital).
• "socialMediaGuidelines": 3+ plataformas com formatos, tom, pillars, frequência, do/dont, exemplo de post. globalHashtagStrategy, brandVoiceAdaptation.
• "governance": designTools, documentationPlatform, componentLibrary, versioningStrategy, updateProcess, ownershipRoles.
• "imageGenerationBriefing": TODOS os campos com profundidade máxima — visualStyle, colorMood (nomes EXATOS), compositionNotes, moodKeywords 10+, artisticReferences REAIS, avoidElements, logoStyleGuide, photographyMood, patternStyle, marketingVisualLanguage, negativePrompt COMPLETO, emotionalCore (conectado ao manifesto), textureLanguage, lightingSignature (Kelvin, ratio), cameraSignature (lente, DOF), brandArchetype (dominante + secundário visual), sensoryProfile (5 sentidos).`;

/** Creativity-level instruction for user prompts */
const CREATIVITY_USER_INSTRUCTION: Record<CreativityLevel, string> = {
  conservative: "POSTURA: Mantenha sobriedade e confiança atemporal em cada decisão. Pense IBM, Rolex — o resultado deve inspirar autoridade máxima.",
  balanced: "POSTURA: Equilibre memorabilidade e acessibilidade. Caráter forte mas não polarizante. Pense Notion, Stripe — moderno e profissional.",
  creative: "POSTURA: Surpreenda com ousadia INTENCIONAL. Cada decisão deve gerar reação emocional. Pense Spotify, Oatly — inesquecível.",
  experimental: "POSTURA: QUEBRE CONVENÇÕES. Combine o aparentemente conflitante. Polarize intencionalmente — amada pelo target, estranha para quem não é. Cult brand potential.",
};

/**
 * Focused chain system prompt per step — only includes relevant instructions.
 * Step 1: ~3k tokens (strategy focus)
 * Step 2: ~3k tokens (visual focus + intentionality)
 * Step 3: ~4k tokens (system focus + cross-referencing + production)
 */
export function buildChainSystemPrompt(
  step: 1 | 2 | 3,
  _scope: GenerateScope,
  creativity: CreativityLevel,
  _intentionality: boolean
): string {
  if (step === 1) {
    return `${ROLE_PREAMBLE}

${CREATIVITY_LAYER[creativity]}

${INTENTIONALITY_LAYER}
${STRATEGY_PRINCIPLES}

${STRATEGY_SECTION_INSTRUCTIONS}

ETAPA 1 DE 3 — FOCO EXCLUSIVO EM ESTRATÉGIA:
Gere APENAS: brandConcept, brandStory, positioning, audiencePersonas, verbalIdentity.
Esta é a etapa MAIS CRIATIVA — invista profundidade máxima em cada persona, cada messaging pillar, cada crença da marca.
O manifesto deve emocionar. O positioningStatement deve ser citável. As personas devem ter HISTÓRIA DE VIDA.`;
  }

  if (step === 2) {
    return `${ROLE_PREAMBLE}

${CREATIVITY_LAYER[creativity]}

${INTENTIONALITY_LAYER}
${VISUAL_PRINCIPLES}

${VISUAL_SECTION_INSTRUCTIONS}

ETAPA 2 DE 3 — FOCO EXCLUSIVO EM IDENTIDADE VISUAL:
Gere APENAS: logo, logoVariants, colors, typography, typographyScale.
Recebeu um RESUMO ESTRATÉGICO da Etapa 1. Cada escolha visual DEVE ser rastreável ao propósito, archetype e posicionamento.
Esta é a etapa de TRADUÇÃO VISUAL — transforme estratégia em forma, cor e tipo.`;
  }

  // Step 3
  return `${ROLE_PREAMBLE}

${CREATIVITY_LAYER[creativity]}

${SYSTEM_AND_APPLICATIONS_PRINCIPLES}

${SYSTEM_SECTION_INSTRUCTIONS}

ETAPA 3 DE 3 — SISTEMA, APLICAÇÕES, OPERACIONAL & IMAGE BRIEFING:
Recebeu resumos de estratégia e visual + detalhes completos de cores/tipografia/logo para cross-referencing.
Gere: keyVisual, designTokens, uiGuidelines, applications, productionGuidelines, socialMediaGuidelines, governance, imageGenerationBriefing.
Esta é a etapa de PRECISÃO — use nomes exatos de cores e fontes em TODAS as referências cruzadas.
O imageGenerationBriefing deve ser tão detalhado que um designer ou IA gere peças PERFEITAS sem mais contexto.`;
}
