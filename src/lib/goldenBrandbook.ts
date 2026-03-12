/**
 * GOLDEN BRANDBOOK — Exemplo de referência com qualidade máxima.
 * Usado como few-shot example no sistema de prompts e como seed para testes.
 *
 * Marca fictícia: "Kairo" — fintech de investimentos para millennials brasileiros.
 * Demonstra TODOS os campos preenchidos com coerência sistêmica absoluta.
 */
import type { BrandbookData } from "./types";

export const GOLDEN_BRANDBOOK: BrandbookData = {
  schemaVersion: "2.0",
  brandName: "Kairo",
  industry: "Fintech / Investimentos",

  brandConcept: {
    purpose: "Democratizar a inteligência financeira para que cada brasileiro possa construir riqueza com consciência, não com medo.",
    mission: "Transformar a relação dos millennials brasileiros com dinheiro — de ansiedade para empoderamento — através de tecnologia transparente e educação financeira integrada à experiência de investir.",
    vision: "Até 2030, ser a plataforma onde 10 milhões de brasileiros fizeram seu primeiro investimento consciente — e continuaram.",
    uniqueValueProposition: "Kairo é a única plataforma de investimentos que combina inteligência artificial adaptativa com educação financeira contextual — cada decisão de investimento é também um momento de aprendizado, sem jargão e sem paternalismo.",
    reasonsToBelieve: [
      "Algoritmo proprietário de 'Risk Personality Mapping' que adapta sugestões ao perfil emocional do investidor, não apenas ao perfil de risco técnico",
      "Parceria com 3 das maiores universidades brasileiras para validação do modelo educacional",
      "Time fundador com passagem por Nubank, XP e Google — combina expertise financeira com design de produto de classe mundial",
      "Taxa zero para investimentos até R$10.000 — eliminando a barreira de entrada",
      "NPS de 78 nos primeiros 6 meses de operação beta, comparável a marcas como Nubank (82) e Apple (72)"
    ],
    userPsychographics: "Millennials urbanos (25-38 anos) com renda de R$4.000-15.000/mês que sabem que deveriam investir mas sentem uma mistura de culpa, confusão e procrastinação. São digitais nativos, confiam mais em apps do que em gerentes de banco, valorizam transparência radical e detestam sentir que estão sendo 'vendidos'. Consomem educação em formato snackable (podcasts, reels, threads). Querem se sentir inteligentes, não intimidados.",
    values: [
      "Transparência Radical — Sem letras miúdas. Sem taxas escondidas. Sem jargão.",
      "Empoderamento > Paternalismo — Ensinamos a pescar, não damos o peixe pronto.",
      "Simplicidade Intencional — Cada tela, cada texto, cada decisão de produto é destilada até a essência.",
      "Coragem Financeira — Investir é um ato de coragem. Celebramos quem começa, não só quem acumula.",
      "Tempo como Moeda — O nome Kairo (do grego καιρός, 'momento certo') é nossa filosofia: o melhor momento para investir é agora."
    ],
    personality: [
      "Confiante sem ser arrogante — fala com autoridade mas nunca menospreza",
      "Acessível sem ser simplista — simplifica sem emburrecer",
      "Ousada sem ser irresponsável — desafia o status quo com dados, não bravata",
      "Calorosa sem ser piegas — empática mas direta",
      "Moderna sem ser efêmera — abraça tendências com critério"
    ],
    toneOfVoice: "Tom de um amigo inteligente que trabalha no mercado financeiro e explica investimentos num bar — direto, sem jargão desnecessário, com pitadas de humor seco, mas sempre com substância. Nunca condescendente. Nunca vendedor. Sempre honesto, inclusive sobre riscos. Usa 'você' nunca 'o senhor'. Prefere frases curtas. Cada frase tem um propósito.",
    brandArchetype: "Sábio (dominante) com traços de Rebelde — O Sábio se manifesta na obsessão por educação, transparência e verdade. O Rebelde aparece na recusa em aceitar o status quo do mercado financeiro brasileiro (taxas abusivas, linguagem excludente, complexidade proposital). Visualmente, isso se traduz em clareza tipográfica do Sábio temperada com a ousadia cromática do Rebelde."
  },

  brandStory: {
    manifesto: "Existe um mito no Brasil de que investir é coisa de gente rica. De gente que entende. De gente que tem sobrando.\n\nNós discordamos.\n\nInvestir é o ato mais democrático de construção de futuro que existe. Cada real aplicado com consciência é uma semente de liberdade. Não liberdade para comprar um iate — liberdade para dormir em paz, para dizer não a um emprego tóxico, para dar oportunidade aos seus filhos.\n\nKairo nasceu de uma revolta: por que o mercado financeiro insiste em falar uma língua que ninguém entende? Por que transforma algo simples em algo assustador? Por que cobra caro de quem tem pouco?\n\nNós acreditamos que a resposta é poder. E que democratizar conhecimento financeiro é redistribuir poder.\n\nPor isso construímos uma plataforma onde cada investimento vem com um 'porquê'. Onde a IA não decide por você — ela te ensina a decidir. Onde a transparência não é um discurso bonito, é código-fonte aberto.\n\nKairo é grego para 'o momento certo'. E o momento certo é agora.",
    originStory: "Em 2022, três amigos — uma designer do Nubank, um engenheiro do Google e uma economista da XP — se encontraram num bar em São Paulo e fizeram a mesma pergunta: 'Por que nossos pais ainda guardam dinheiro na poupança?' A resposta não era falta de opção. Era falta de confiança. O mercado financeiro brasileiro foi desenhado para intimidar. Naquela noite, desenharam num guardanapo o que viria a ser a Kairo: uma plataforma onde entender é tão fácil quanto investir.",
    brandPromise: "Cada interação com a Kairo te deixa mais inteligente sobre seu dinheiro — e mais confiante para agir.",
    brandBeliefs: [
      "Acreditamos que todo brasileiro deveria entender para onde vai cada centavo do seu dinheiro.",
      "Acreditamos que simplicidade e profundidade não são opostos — são a mesma coisa, bem feita.",
      "Acreditamos que medo financeiro é um problema de design, não de inteligência.",
      "Acreditamos que transparência de verdade inclui mostrar quando NÃO investir.",
      "Acreditamos que o melhor momento para começar é agora — e Kairo existe para tornar esse 'agora' menos assustador.",
      "Acreditamos que educação financeira contextual (no momento da decisão) vale mais que 100 cursos avulsos."
    ]
  },

  positioning: {
    category: "Plataforma de investimentos com inteligência educacional integrada",
    targetMarket: "Millennials brasileiros (25-38 anos) das classes B e C, com renda entre R$4.000-15.000/mês, que ainda não investem regularmente ou investem apenas em poupança/CDB por falta de confiança no mercado financeiro.",
    positioningStatement: "Para millennials brasileiros que querem investir mas não sabem por onde começar, Kairo é a plataforma de investimentos que transforma cada decisão financeira em um momento de aprendizado — porque acreditamos que entender é o primeiro passo para enriquecer.",
    primaryDifferentiators: [
      "IA adaptativa que mapeia personalidade de risco emocional (não apenas técnico) e ajusta recomendações em tempo real",
      "Educação contextual integrada — cada produto financeiro vem com explicação em linguagem humana, no momento da decisão",
      "Transparência de código aberto — algoritmo de recomendação auditável publicamente",
      "Taxa zero até R$10.000 e modelo freemium que escala com o patrimônio",
      "Comunidade ativa de 'primeiros investidores' com mentoria peer-to-peer"
    ],
    competitiveAlternatives: [
      "Nubank Investimentos — experiência excelente mas educação superficial",
      "XP Investimentos — profundidade de produtos mas interface intimidante",
      "Rico / Clear — plataformas intermediárias sem diferencial educacional",
      "Cursos de finanças (Me Poupe, Primo Rico) — educação sem execução integrada"
    ],
    reasonsToBelieve: [
      "Beta com 12.000 usuários alcançou 43% de conversão de poupança para diversificados",
      "Modelo de 'Risk Personality Mapping' validado em paper acadêmico pela FGV-SP",
      "Time técnico oriundo de Nubank, XP e Google com 45+ anos combinados de experiência",
      "R$8M em seed round liderado por Kaszek e Canary"
    ]
  },

  audiencePersonas: [
    {
      name: "Camila Ribeiro",
      role: "Analista de Marketing Digital, 29 anos",
      context: "Mora em São Paulo (Pinheiros), ganha R$7.500/mês, tem R$12.000 parados na poupança. Formada em Publicidade pela ESPM. Solteira, divide apartamento com uma amiga. Consome podcasts de negócios (Primocast, Flow), segue perfis de finanças no Instagram mas nunca deu o próximo passo. Tem medo de 'perder dinheiro' e vergonha de não saber o básico. Já baixou 3 apps de investimento e desinstalou todos em menos de 1 semana.",
      goals: [
        "Fazer o dinheiro parado render mais que a poupança sem precisar virar 'investidora profissional'",
        "Entender o suficiente para tomar decisões próprias e não depender de influencers",
        "Construir uma reserva de emergência real (6 meses) para poder sair do emprego se quiser",
        "Sentir que está 'adulta financeiramente' e conseguir falar sobre investimentos sem constrangimento"
      ],
      painPoints: [
        "Sente que 'já deveria saber' sobre investimentos aos 29 — a vergonha a paralisa",
        "Todo app financeiro parece assumir que ela já sabe o que é CDB, LCI, FII",
        "Não confia em recomendações de influencers que parecem estar vendendo algo",
        "Renda variável = sinônimo de perder tudo na cabeça dela"
      ],
      objections: [
        "E se eu perder dinheiro? Prefiro ganhar pouco na poupança do que perder.",
        "Não tenho tempo para ficar acompanhando mercado todo dia",
        "Já existem mil apps de investimento, por que esse seria diferente?"
      ],
      channels: ["Instagram", "Spotify (podcasts)", "YouTube", "WhatsApp (grupos de amigas)", "LinkedIn"]
    },
    {
      name: "Rafael Oliveira",
      role: "Desenvolvedor Full-Stack, 33 anos",
      context: "Mora em Belo Horizonte, ganha R$12.000/mês como PJ. Casado, um filho de 2 anos. Já investe em Tesouro Direto e tem um pouquinho em ETFs, mas faz tudo no 'automático' sem entender direito a estratégia. É cético com fintechs — já perdeu dinheiro em cripto por seguir hype. Quer montar um patrimônio sólido para o filho mas não sabe se está fazendo certo.",
      goals: [
        "Diversificar além de renda fixa sem entrar em 'aventuras' — quer um plano racional e personalizado",
        "Entender se sua alocação atual faz sentido para seus objetivos de longo prazo",
        "Montar uma carteira previdenciária inteligente para o filho",
        "Automatizar o máximo possível — investir sem precisar pensar todo mês"
      ],
      painPoints: [
        "Paralisia por excesso de informação — lê demais, executa de menos",
        "Desconfia de recomendações algorítmicas depois de perder em cripto",
        "Não encontra uma plataforma que respeite sua inteligência sem ser intimidante",
        "Sente que como PJ deveria ter uma estratégia tributária e ninguém explica isso"
      ],
      objections: [
        "Já uso o Nubank pra investir, por que mudar?",
        "Algoritmo de IA decidindo meu dinheiro me dá calafrio. Quero entender, não delegar.",
        "R$0 de taxa? Onde vocês ganham dinheiro então? Desconfio."
      ],
      channels: ["Twitter/X", "Reddit (r/investimentos)", "YouTube", "Telegram", "GitHub"]
    },
    {
      name: "Juliana Santos",
      role: "Empreendedora / Dona de E-commerce, 36 anos",
      context: "Mora no Rio de Janeiro, fatura R$25.000/mês com loja de cosméticos naturais no Shopify. Mistura conta PJ e PF constantemente. Tem R$80.000 na conta corrente sem render nada porque 'não tem tempo'. É prática, orientada a resultados, não tem paciência para teoria. Quer soluções, não aulas.",
      goals: [
        "Separar dinheiro PJ de PF e fazer ambos renderem adequadamente",
        "Criar uma reserva estratégica para o negócio (3 meses de operação)",
        "Investir o excedente pessoal com mínimo de esforço e máximo de retorno ajustado ao risco",
        "Entender incentivos fiscais para PJ e otimizar tributação"
      ],
      painPoints: [
        "Zero tempo para gerenciar investimentos — precisa ser quase automático",
        "Toda plataforma pede CPF ou CNPJ, nunca gerencia os dois de forma integrada",
        "Sente que perde dinheiro por deixar parado mas não sabe quanto está perdendo",
        "Assessores de investimento tradicionais querem mínimo de R$300k para atender"
      ],
      objections: [
        "Não tenho 30 minutos por semana para dedicar a isso",
        "Se eu preciso aprender para usar, já não quero",
        "Meu contador cuida disso... ou deveria cuidar"
      ],
      channels: ["Instagram (busines profiles)", "WhatsApp Business", "Email", "LinkedIn", "Podcasts de empreendedorismo"]
    }
  ],

  verbalIdentity: {
    tagline: "O momento certo é agora.",
    oneLiner: "Kairo transforma cada decisão de investimento em um momento de aprendizado — para que você invista com inteligência, não com medo.",
    brandVoiceTraits: [
      "Direta — frases curtas, sem rodeios, cada palavra tem propósito",
      "Educadora — ensina no momento da decisão, nunca em tom de aula",
      "Corajosa — fala de riscos com honestidade, não os esconde atrás de asteriscos",
      "Empática — reconhece que medo financeiro é legítimo, nunca ridiculariza",
      "Espirituosa — humor seco e inteligente, nunca forçado ou juvenil"
    ],
    messagingPillars: [
      {
        title: "Inteligência Acessível",
        description: "Tecnologia sofisticada com interface humana — IA que ensina, não que decide por você.",
        proofPoints: [
          "Algoritmo de Risk Personality Mapping",
          "Explicações contextuais em cada produto",
          "Código aberto para auditoria pública"
        ],
        exampleCopy: [
          "Headline: 'Seu dinheiro merece mais que a poupança. Você merece entender por quê.'",
          "CTA: 'Descubra seu perfil em 3 minutos'",
          "Push notification: 'O Tesouro Selic subiu para 13,75%. Quer entender o que isso muda para você?'"
        ]
      },
      {
        title: "Transparência como Produto",
        description: "Não é só uma promessa — é feature. Taxa zero, código aberto, linguagem sem jargão.",
        proofPoints: [
          "Zero taxas até R$10.000",
          "Algoritmo de recomendação open-source",
          "Sem conflito de interesse (não ganhamos comissão de produtos)"
        ],
        exampleCopy: [
          "Headline: 'Outras plataformas ganham quando você compra. Nós ganhamos quando você aprende.'",
          "CTA: 'Veja exatamente como ganhamos dinheiro'",
          "Email: 'Seu extrato do mês: R$47,20 de rendimento. R$0 de taxa. R$0 de surpresa.'"
        ]
      },
      {
        title: "Coragem de Começar",
        description: "Celebramos o primeiro passo, não o portfólio de milhões. Investir é um ato de coragem.",
        proofPoints: [
          "Onboarding gamificado com 'primeiro investimento' em 5 minutos",
          "Comunidade de 'primeiros investidores' com mentoria peer-to-peer",
          "Histórias reais de usuários que começaram com R$50"
        ],
        exampleCopy: [
          "Headline: '73% dos brasileiros nunca investiram. Parabéns por estar aqui.'",
          "CTA: 'Invista seu primeiro R$1 agora'",
          "Social: 'A Camila tinha R$200 na poupança há 8 meses. Hoje ela tem R$2.400 em 4 produtos diferentes. A diferença? Ela entendeu o que estava fazendo.'"
        ]
      },
      {
        title: "Tempo é Riqueza",
        description: "Kairo = momento certo. O melhor investimento é o que você faz agora, não o 'perfeito' que você nunca faz.",
        proofPoints: [
          "Simulador de 'custo da espera' mostra quanto custa adiar",
          "Automação inteligente reduz tempo de gestão a 5min/mês",
          "Notificações contextuais no momento certo (não spam)"
        ],
        exampleCopy: [
          "Headline: 'Cada mês que você espera, R$47 desaparecem da poupança pela inflação.'",
          "CTA: 'Calcule o custo de esperar'",
          "Push: 'Sexta é dia de pagamento. Quer separar 10% antes que o dinheiro desapareça?'"
        ]
      }
    ],
    vocabulary: {
      preferred: [
        "investir", "entender", "construir", "crescer", "seu dinheiro", "transparente", "simples",
        "consciência financeira", "primeiro passo", "liberdade", "aprender", "decisão informada",
        "rendimento real", "diversificar", "perfil", "objetivo", "momento certo"
      ],
      avoid: [
        "lucro garantido", "risco zero", "fique rico", "exclusivo", "oportunidade imperdível",
        "corra antes que acabe", "segredo", "fórmula mágica", "resultado extraordinário",
        "carteira blindada", "investimento seguro" , "não perca", "últimas vagas", "VIP"
      ]
    },
    doDont: {
      do: [
        "Use 'você' — nunca 'o senhor/a senhora'",
        "Explique jargão financeiro na primeira aparição (ex: 'CDB — como um empréstimo que você faz ao banco')",
        "Inclua números concretos sempre que possível ('R$47/mês' > 'uma quantia significativa')",
        "Reconheça emoções ('É normal ter medo. Vamos juntos.')",
        "Use analogias do cotidiano ('Diversificar é como não colocar todos os ovos na mesma cesta')",
        "Termine com ação clara e de baixo atrito ('Comece com R$1' > 'Fale com um assessor')",
        "Mostre riscos com a mesma ênfase que benefícios"
      ],
      dont: [
        "Nunca use linguagem de urgência artificial ('Últimas vagas! Corra!')",
        "Nunca assuma conhecimento prévio do usuário sobre finanças",
        "Nunca use termos em inglês sem tradução (portfolio → carteira, hedge → proteção)",
        "Nunca prometa retornos específicos ou use 'garantido'",
        "Nunca diminua quem investe pouco ('Até R$50 faz diferença')",
        "Nunca use linguagem genérica de banco ('conte conosco', 'mais do que um banco')",
        "Nunca esconda informações negativas em letras miúdas"
      ]
    },
    sampleHeadlines: [
      "O momento certo é agora. O lugar certo é aqui.",
      "Seu dinheiro merece mais que a poupança. Você merece entender por quê.",
      "Investir não precisa ser complicado. Só precisa ser honesto.",
      "73% dos brasileiros nunca investiram. Parabéns por mudar essa estatística.",
      "Cada real investido com consciência é uma semente de liberdade.",
      "Transparência não é um discurso. É nosso código-fonte."
    ],
    sampleCTAs: [
      "Descubra seu perfil em 3 minutos",
      "Invista seu primeiro R$1",
      "Calcule o custo de esperar",
      "Veja como seu dinheiro pode crescer",
      "Comece agora — é grátis até R$10.000",
      "Entenda antes de investir"
    ],
    tonePerChannel: [
      {
        channel: "Instagram",
        tone: "Visual e direto. Dados em cards simples. Humor seco em carrosséis. Nunca vendedor, sempre educador que entretém. Reels curtos (15-30s) com uma verdade financeira por vídeo.",
        example: "Carrossel: '5 mentiras que seu banco te conta' — Slide 1: 'A poupança rende bem.' Realidade: com inflação de 5%, sua poupança PERDE 1,2% ao ano. Slide 5: CTA 'Quer a verdade? Link na bio.'"
      },
      {
        channel: "Email",
        tone: "Pessoal e informativo. Como se um amigo esperto estivesse te atualizando. Assunto sempre com dado concreto ou pergunta. Corpo curto (150 palavras max). Um CTA claro.",
        example: "Subject: 'Seu dinheiro rendeu R$47,20 este mês. Sem taxa.' Body: 'Oi Camila, seu extrato de março chegou. R$47,20 em rendimentos — R$0 em taxas. Isso é 4,2x mais que a poupança renderia. Quer diversificar mais? [Ver sugestões personalizadas]'"
      },
      {
        channel: "Push Notification",
        tone: "Ultra-conciso, contextual e útil. Nunca spam. Máximo 1/dia. Sempre com dado relevante ou ação de valor.",
        example: "'A Selic subiu para 13,75%. Seu Tesouro Selic está rendendo mais. Quer entender o impacto? →'"
      },
      {
        channel: "Twitter/X",
        tone: "Provocativo-inteligente. Dados surpreendentes. Threads educativas que parecem threads de tech founder. Zero emojis excessivos. Máximo 1 por tweet.",
        example: "Tweet: 'R$100 na poupança em 2014 valem R$67 hoje, corrigidos pela inflação. Você está literalmente ficando mais pobre guardando dinheiro. Thread sobre o que fazer com R$100/mês 🧵'"
      },
      {
        channel: "LinkedIn",
        tone: "Profissional mas não corporativo. Dados de mercado com opinião fundamentada. Tom de 'insider que compartilha conhecimento'. Sem hashtags excessivos.",
        example: "Post: 'Acabamos de abrir nosso algoritmo de recomendação no GitHub. Sim, o código que decide o que sugerir para 12.000 investidores. Por que? Porque transparência não é um slide de apresentação. É commit público.'"
      }
    ]
  },

  logo: {
    primary: "https://placehold.co/400x120/0D1B2A/E0A458?text=KAIRO&font=montserrat",
    secondary: "https://placehold.co/400x120/E0A458/0D1B2A?text=KAIRO&font=montserrat",
    symbol: "https://placehold.co/200x200/0D1B2A/E0A458?text=K&font=montserrat",
    favicon: "https://placehold.co/64x64/0D1B2A/E0A458?text=K&font=montserrat",
    clearSpace: "O símbolo Kairo é construído a partir de um 'K' geometricamente perfeito inscrito em um círculo que representa o conceito grego de Kairos — o momento certo. As linhas do K se prolongam até tocar o círculo, simbolizando decisões que se conectam ao tempo. O clear space mínimo é igual à altura do 'K' em todas as direções. A forma circular deriva do propósito de completude — cada investimento é um ciclo de aprendizado. O ângulo de 23.5° das hastes do K reflete a inclinação axial da Terra — uma referência sutil a ciclos naturais e timing cósmico.",
    minimumSize: "24px de altura para digital (garante legibilidade do 'K' inscrito). 8mm para impressão offset. Em contextos de favicon/app icon, usar apenas o símbolo 'K' circular sem wordmark.",
    incorrectUsages: [
      "Nunca rotacionar o símbolo — a inclinação de 23.5° é intencional e fixa",
      "Nunca aplicar sobre fundos com mais de 2 cores ou gradientes complexos",
      "Nunca alterar a proporção entre o 'K' e o círculo envolvente",
      "Nunca usar o logo com opacidade inferior a 80%",
      "Nunca adicionar sombra, brilho, bevel ou qualquer efeito dimensional",
      "Nunca substituir a fonte do wordmark por outra família tipográfica",
      "Nunca usar o wordmark sem o símbolo em materiais oficiais de primeira impressão (landing page, cartão de visita, apresentação de pitch)"
    ]
  },

  logoVariants: {
    horizontal: "https://placehold.co/500x150/0D1B2A/E0A458?text=⊙+KAIRO&font=montserrat",
    stacked: "https://placehold.co/250x300/0D1B2A/E0A458?text=⊙%0AKAIRO&font=montserrat",
    mono: "https://placehold.co/400x120/1a1a1a/ffffff?text=KAIRO&font=montserrat",
    negative: "https://placehold.co/400x120/ffffff/0D1B2A?text=KAIRO&font=montserrat",
    markOnly: "https://placehold.co/200x200/0D1B2A/E0A458?text=⊙&font=montserrat",
    wordmarkOnly: "https://placehold.co/400x100/0D1B2A/E0A458?text=KAIRO&font=montserrat"
  },

  colors: {
    primary: [
      {
        name: "Azul Profundidade",
        hex: "#0D1B2A",
        rgb: "13, 27, 42",
        cmyk: "90, 70, 40, 70",
        pantone: "289 C",
        usage: "Fundos principais, textos primários, backgrounds de autoridade. Representa a profundidade do conhecimento e a seriedade do compromisso com o dinheiro do usuário.",
        tonalScale: [
          { shade: "50", hex: "#E8EDF2" },
          { shade: "100", hex: "#C5D0DC" },
          { shade: "200", hex: "#9BAFC4" },
          { shade: "300", hex: "#708EAB" },
          { shade: "500", hex: "#1B3A5C" },
          { shade: "700", hex: "#0D1B2A" },
          { shade: "900", hex: "#060E17" }
        ]
      },
      {
        name: "Dourado Kairo",
        hex: "#E0A458",
        rgb: "224, 164, 88",
        cmyk: "8, 35, 68, 0",
        pantone: "7409 C",
        usage: "CTAs, acentos primários, elementos de destaque, ícones ativos. Representa o 'momento dourado' — a decisão de investir. Usado com moderação para manter impacto.",
        tonalScale: [
          { shade: "50", hex: "#FDF6ED" },
          { shade: "100", hex: "#F8E6CC" },
          { shade: "200", hex: "#F2D1A3" },
          { shade: "300", hex: "#EBBC7A" },
          { shade: "500", hex: "#E0A458" },
          { shade: "700", hex: "#C4863A" },
          { shade: "900", hex: "#8B5E28" }
        ]
      }
    ],
    secondary: [
      {
        name: "Branco Clareza",
        hex: "#F7F5F2",
        rgb: "247, 245, 242",
        cmyk: "2, 2, 3, 0",
        usage: "Backgrounds de conteúdo, cards, áreas de respiro. Não é branco puro — o tom creme sutil transmite calor e acessibilidade.",
        tonalScale: [
          { shade: "50", hex: "#FFFFFF" },
          { shade: "100", hex: "#FAFAF8" },
          { shade: "200", hex: "#F7F5F2" },
          { shade: "300", hex: "#EBE8E3" },
          { shade: "500", hex: "#D4CFC8" },
          { shade: "700", hex: "#B0A99F" },
          { shade: "900", hex: "#8C8578" }
        ]
      },
      {
        name: "Verde Rendimento",
        hex: "#2D936C",
        rgb: "45, 147, 108",
        cmyk: "75, 10, 60, 5",
        pantone: "7724 C",
        usage: "Indicadores positivos, gráficos de crescimento, badges de conquista, confirmações. Representa rendimento, progresso e saúde financeira.",
        tonalScale: [
          { shade: "50", hex: "#E8F5EF" },
          { shade: "100", hex: "#C3E6D4" },
          { shade: "200", hex: "#8DCDB0" },
          { shade: "300", hex: "#57B48C" },
          { shade: "500", hex: "#2D936C" },
          { shade: "700", hex: "#1E6E4F" },
          { shade: "900", hex: "#104A33" }
        ]
      },
      {
        name: "Cinza Contexto",
        hex: "#6B7280",
        rgb: "107, 114, 128",
        cmyk: "48, 37, 28, 8",
        usage: "Textos secundários, labels, bordas sutis, metadata. O neutro funcional que permite que Azul Profundidade e Dourado Kairo brilhem.",
        tonalScale: [
          { shade: "50", hex: "#F3F4F6" },
          { shade: "100", hex: "#E5E7EB" },
          { shade: "200", hex: "#D1D5DB" },
          { shade: "300", hex: "#9CA3AF" },
          { shade: "500", hex: "#6B7280" },
          { shade: "700", hex: "#4B5563" },
          { shade: "900", hex: "#1F2937" }
        ]
      }
    ],
    semantic: {
      success: { name: "Sucesso", hex: "#2D936C", rgb: "45, 147, 108", cmyk: "75, 10, 60, 5", usage: "Confirmações, investimentos rendendo, metas atingidas" },
      error: { name: "Alerta Crítico", hex: "#DC2626", rgb: "220, 38, 38", cmyk: "5, 95, 90, 2", usage: "Erros de formulário, perdas, alertas urgentes" },
      warning: { name: "Atenção", hex: "#F59E0B", rgb: "245, 158, 11", cmyk: "2, 42, 96, 0", usage: "Avisos de risco, volatilidade, prazos próximos" },
      info: { name: "Informação", hex: "#3B82F6", rgb: "59, 130, 246", cmyk: "72, 42, 0, 0", usage: "Tooltips educativos, badges informativos, links de aprendizado" }
    },
    dataViz: [
      { name: "Renda Fixa", hex: "#0D1B2A", rgb: "13, 27, 42", cmyk: "90, 70, 40, 70", usage: "Gráficos de renda fixa — sólido, estável" },
      { name: "Renda Variável", hex: "#E0A458", rgb: "224, 164, 88", cmyk: "8, 35, 68, 0", usage: "Gráficos de renda variável — dinâmico" },
      { name: "Fundos", hex: "#2D936C", rgb: "45, 147, 108", cmyk: "75, 10, 60, 5", usage: "Gráficos de fundos — crescimento" },
      { name: "Cripto", hex: "#8B5CF6", rgb: "139, 92, 246", cmyk: "52, 68, 0, 0", usage: "Gráficos de criptomoedas — volátil e moderno" },
      { name: "Previdência", hex: "#EC4899", rgb: "236, 72, 153", cmyk: "4, 82, 8, 0", usage: "Gráficos de previdência — longo prazo" },
      { name: "Internacional", hex: "#14B8A6", rgb: "20, 184, 166", cmyk: "70, 0, 35, 0", usage: "Gráficos de investimentos internacionais" }
    ],
    approvedCombinations: [
      { bg: "Azul Profundidade", fg: "Branco Clareza" },
      { bg: "Branco Clareza", fg: "Azul Profundidade" },
      { bg: "Azul Profundidade", fg: "Dourado Kairo" },
      { bg: "Branco Clareza", fg: "Verde Rendimento" },
      { bg: "Dourado Kairo", fg: "Azul Profundidade" }
    ]
  },

  typography: {
    marketing: {
      name: "DM Serif Display",
      usage: "Headlines, títulos de campanhas, manifesto, hero sections, títulos de blog. A serifa contemporânea transmite a autoridade do Sábio com elegância acessível — sofisticada sem ser elitista.",
      weights: ["400 Regular", "400 Italic"],
      fallbackFont: "Georgia, 'Times New Roman', serif",
      textTransform: "none — headlines em sentence case para acessibilidade e tom conversacional",
      category: "Serif Display — transicional moderna com contraste médio-alto"
    },
    ui: {
      name: "Inter",
      usage: "Body text, interfaces, formulários, dashboards, cards, navegação, botões. Escolhida por legibilidade excepcional em telas (desenhada para interfaces digitais) e neutralidade funcional que deixa o conteúdo falar.",
      weights: ["400 Regular", "500 Medium", "600 SemiBold", "700 Bold"],
      fallbackFont: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      textTransform: "none para body, uppercase com letter-spacing: 0.08em para labels e overlines",
      category: "Sans-serif geométrica humanista — otimizada para telas"
    },
    monospace: {
      name: "JetBrains Mono",
      usage: "Dados financeiros, valores monetários em destaque, tabelas numéricas, código (para desenvolvedores), labels de gráficos. Garante alinhamento perfeito de números e transmite precisão.",
      weights: ["400 Regular", "500 Medium", "700 Bold"],
      fallbackFont: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
      textTransform: "none — números sempre em algarismos, nunca por extenso",
      category: "Monospace — projetada para código e dados, ligatures opcionais"
    }
  },

  typographyScale: [
    { name: "Display", fontRole: "marketing", size: "56px", lineHeight: "1.1", fontWeight: "400", letterSpacing: "-0.02em", usage: "Hero sections, manifesto, landing page principal — apenas 1 por página" },
    { name: "H1", fontRole: "marketing", size: "40px", lineHeight: "1.15", fontWeight: "400", letterSpacing: "-0.015em", usage: "Títulos de seções principais, títulos de artigos de blog" },
    { name: "H2", fontRole: "marketing", size: "32px", lineHeight: "1.2", fontWeight: "400", letterSpacing: "-0.01em", usage: "Subtítulos de seções, títulos de cards hero" },
    { name: "H3", fontRole: "ui", size: "24px", lineHeight: "1.3", fontWeight: "600", letterSpacing: "-0.005em", usage: "Títulos de cards, títulos de modais, subseções" },
    { name: "H4", fontRole: "ui", size: "20px", lineHeight: "1.35", fontWeight: "600", letterSpacing: "0", usage: "Títulos de componentes, labels de seções em dashboards" },
    { name: "Body Large", fontRole: "ui", size: "18px", lineHeight: "1.6", fontWeight: "400", letterSpacing: "0", usage: "Parágrafos de destaque, introduções, descrições de produto" },
    { name: "Body", fontRole: "ui", size: "16px", lineHeight: "1.6", fontWeight: "400", letterSpacing: "0", usage: "Texto padrão, parágrafos, listas, descrições" },
    { name: "Body Small", fontRole: "ui", size: "14px", lineHeight: "1.5", fontWeight: "400", letterSpacing: "0.005em", usage: "Texto secundário, tooltips, metadata, campos de formulário" },
    { name: "Caption", fontRole: "ui", size: "12px", lineHeight: "1.4", fontWeight: "500", letterSpacing: "0.01em", usage: "Legends de gráficos, notas de rodapé, timestamps, disclaimers" },
    { name: "Overline", fontRole: "ui", size: "11px", lineHeight: "1.3", fontWeight: "600", letterSpacing: "0.08em", usage: "Labels de categorias, badges, tags, eyebrows — SEMPRE uppercase" },
    { name: "Data Display", fontRole: "monospace", size: "32px", lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.01em", usage: "Valores monetários em destaque (saldo, rendimento total)" },
    { name: "Data Body", fontRole: "monospace", size: "16px", lineHeight: "1.4", fontWeight: "400", letterSpacing: "0", usage: "Valores em tabelas, extratos, cotações" }
  ],

  designTokens: {
    spacing: [
      "0px (none)", "2px (2xs)", "4px (xs)", "8px (sm)", "12px (md-sm)",
      "16px (md)", "20px (md-lg)", "24px (lg)", "32px (xl)", "40px (2xl)",
      "48px (3xl)", "64px (4xl)", "80px (5xl)", "96px (6xl)", "128px (7xl)"
    ],
    borderRadii: [
      "0px (none) — tabelas de dados, elementos técnicos",
      "4px (sm) — inputs, chips, badges",
      "8px (md) — cards, modais, dropdowns — padrão do sistema",
      "12px (lg) — cards hero, CTAs primários, imagens",
      "16px (xl) — containers destacados, tooltips educativos",
      "24px (2xl) — banners, cards de onboarding",
      "9999px (full) — avatares, badges circulares, pills"
    ],
    shadows: [
      "0 1px 2px rgba(13,27,42,0.05) — elevação sutil (cards em repouso)",
      "0 4px 12px rgba(13,27,42,0.08) — elevação média (cards em hover, dropdowns)",
      "0 8px 24px rgba(13,27,42,0.12) — elevação alta (modais, popovers)",
      "0 16px 48px rgba(13,27,42,0.16) — elevação máxima (overlays, notificações flutuantes)",
      "0 0 0 3px rgba(224,164,88,0.3) — focus ring (acessibilidade, sempre Dourado Kairo)"
    ],
    breakpoints: [
      "320px (mobile-sm) — iPhones SE, compactos",
      "768px (tablet) — iPad portrait, tablets genéricos",
      "1024px (desktop) — laptops, iPad landscape",
      "1440px (desktop-lg) — monitores full HD e acima"
    ],
    grid: "12 colunas com gutter de 24px (desktop), 16px (tablet), 16px (mobile). Container máximo: 1200px. Conteúdo principal: 8 colunas centrais em desktop. Sidebar: 4 colunas em desktop (dashboard). Mobile: coluna única com padding horizontal de 16px."
  },

  uiGuidelines: {
    layoutGrid: "Sistema de 12 colunas baseado em CSS Grid com fallback Flexbox. Desktop: max-width 1200px, gutter 24px, margin auto. Tablet: fluid com gutter 16px. Mobile: single column com padding 16px. Dashboard: layout L-shape (sidebar 280px + main fluid). Razão de densidade: 60% conteúdo, 25% espaço negativo, 15% navegação/chrome.",
    spacingDensity: "Density 'comfortable' como padrão — espaçamento generoso entre elementos para reduzir cognitive load financeira. Spacing vertical entre seções: 48px (desktop), 32px (mobile). Spacing entre cards: 24px. Padding interno de cards: 24px (desktop), 16px (mobile). Exception: tabelas de dados usam density 'compact' com row height de 48px.",
    iconographyStyle: "Lucide Icons como biblioteca base — stroke de 1.5px, grid de 24x24px. Ícones financeiros custom quando necessário (gráficos, moedas, carteira). Tamanhos: 16px (inline), 20px (botões), 24px (navegação), 32px (feature icons), 48px (empty states). Cor padrão: Cinza Contexto (#6B7280). Cor ativa: Dourado Kairo (#E0A458). Cor informativa: Azul Profundidade (#0D1B2A).",
    illustrationStyle: "Ilustrações flat com toque editorial — linhas limpas com 2-3 cores da paleta. Estilo: meio-termo entre Notion (minimalista) e Headspace (caloroso). Personagens sem rosto definido (inclusividade), proporções alongadas, gestos expressivos. Cenários financeiros desmistificados (pessoa plantando sementes que viram moedas, caminhos que se abrem). Nunca stock. Sempre com a paleta Kairo.",
    dataVizGuidelines: "Gráficos seguem paleta dataViz dedicada. Line charts: stroke 2px, com animação de draw-in. Bar charts: border-radius-top de 4px. Pie/Donut: sempre com label percentual e valor absoluto. Tooltip: fundo Azul Profundidade, texto Branco Clareza, fonte JetBrains Mono para números. Gridlines: #E5E7EB com opacity 0.5. Eixos: Cinza Contexto. Sempre incluir legenda acessível (nunca depender só de cor).",
    components: [
      {
        name: "Button (Primário)",
        usage: "CTAs principais — máximo 1 botão primário por viewport. Fundo Dourado Kairo, texto Azul Profundidade.",
        states: ["Default: bg Dourado Kairo, text Azul Profundidade, border-radius 8px, padding 12px 24px", "Hover: bg Dourado Kairo 700, scale(1.02), shadow média", "Active: bg Dourado Kairo 900, scale(0.98)", "Disabled: opacity 0.5, cursor not-allowed", "Loading: spinner substituindo texto, mesma largura", "Focus: focus ring 3px Dourado Kairo 30%"],
        do: ["Texto em verbo de ação ('Investir agora', 'Calcular', 'Entender')", "Máximo 3 palavras", "Ícone opcional à esquerda (16px)"],
        dont: ["Nunca 2 botões primários lado a lado", "Nunca texto genérico ('Clique aqui', 'Saiba mais')", "Nunca fundo primário em container escuro"],
        accessibilityNotes: ["Contraste mínimo 4.5:1 (AA)", "Min-height 44px (touch target)", "Focus visible obrigatório", "aria-label descritivo quando texto é ambíguo"]
      },
      {
        name: "Card de Investimento",
        usage: "Apresenta produto financeiro com dados, risco e educação contextual. Container principal do dashboard.",
        states: ["Default: bg Branco Clareza, border 1px Cinza Contexto 200, shadow sutil, border-radius 12px", "Hover: shadow média, border-color Dourado Kairo 300", "Selected: border 2px Dourado Kairo, bg com tint Dourado Kairo 50", "Loading: skeleton com pulse animation"],
        do: ["Incluir badge de nível de risco (baixo/médio/alto) com cor semântica", "Mostrar rendimento em JetBrains Mono Bold", "Incluir tooltip educativo (ícone de '?' com explicação)"],
        dont: ["Nunca omitir nível de risco", "Nunca mostrar apenas rendimento sem período de referência", "Nunca usar jargão sem tooltip explicativo"],
        accessibilityNotes: ["Card inteiro clicável (role='article' com link interno)", "Dados financeiros em tabela semântica", "Badge de risco com aria-label completo"]
      },
      {
        name: "Input / Campo de Formulário",
        usage: "Campos de entrada de dados — formulários de cadastro, busca, filtros, valores monetários.",
        states: ["Default: border 1px Cinza Contexto 300, bg branco, border-radius 8px, height 44px", "Focus: border 2px Dourado Kairo, shadow focus ring", "Error: border 2px Alerta Crítico, mensagem abaixo em vermelho", "Filled: border Cinza Contexto 400, label flutuante acima", "Disabled: bg Cinza Contexto 50, opacity 0.7"],
        do: ["Label sempre visível (nunca só placeholder)", "Placeholder como exemplo de formato ('R$ 0,00')", "Mensagem de ajuda abaixo quando relevante", "Máscara monetária automática para campos de valor"],
        dont: ["Nunca label apenas como placeholder (desaparece ao digitar)", "Nunca validação apenas no submit — validar inline", "Nunca cor vermelha sem mensagem de erro textual"],
        accessibilityNotes: ["aria-describedby para mensagens de ajuda/erro", "aria-invalid para campos com erro", "Label associado via htmlFor", "Autocomplete attributes quando aplicável"]
      },
      {
        name: "Toast / Notificação",
        usage: "Feedback efêmero de ações — confirmação de investimento, erros, alertas.",
        states: ["Success: border-left 4px Verde Rendimento, ícone check", "Error: border-left 4px Alerta Crítico, ícone alert", "Warning: border-left 4px Atenção, ícone warning", "Info: border-left 4px Informação, ícone info"],
        do: ["Auto-dismiss em 5s para success/info", "Ação de desfazer quando aplicável", "Empilhar máximo 3 toasts simultâneos"],
        dont: ["Nunca usar para informações críticas que exigem ação (usar modal)", "Nunca bloquear interação com o app", "Nunca posicionar sobre CTAs primários"],
        accessibilityNotes: ["role='alert' para erros", "role='status' para success/info", "aria-live='polite' para não interromper screen reader"]
      },
      {
        name: "Modal Educativo",
        usage: "Explica conceitos financeiros no momento da decisão — tooltip expandido que ensina.",
        states: ["Default: overlay Azul Profundidade 60%, card centralizado com max-width 520px", "Mobile: slide-up full-width como bottom sheet", "Loading: skeleton dentro do card"],
        do: ["Título como pergunta ('O que é CDB?')", "Explicação em linguagem humana (3-5 frases)", "Link 'Aprender mais' para artigo completo", "Fechar com X e click no overlay"],
        dont: ["Nunca mais que 1 conceito por modal", "Nunca jargão dentro da explicação", "Nunca forçar leitura (sempre skipável)"],
        accessibilityNotes: ["Trap focus dentro do modal", "Esc fecha", "aria-modal='true'", "Retorno de foco ao elemento que abriu"]
      },
      {
        name: "Gráfico de Portfolio",
        usage: "Visualização principal do dashboard — mostra alocação, evolução e comparação.",
        states: ["Default: donut chart com breakdown por categoria", "Hover: highlight segmento com tooltip de valor", "Empty: ilustração + CTA 'Faça seu primeiro investimento'", "Loading: shimmer circular"],
        do: ["Legenda com cor + label + percentual + valor absoluto", "Tooltip com JetBrains Mono para valores", "Animação de entrada suave (draw-in 600ms ease-out)"],
        dont: ["Nunca mais de 6 segmentos (agrupar 'Outros')", "Nunca depender só de cor para diferenciar (usar padrões/labels)", "Nunca gráfico 3D"],
        accessibilityNotes: ["Tabela acessível alternativa (sr-only)", "Cada segmento com aria-label completo", "Respeitar prefers-reduced-motion"]
      }
    ]
  },

  uxPatterns: {
    onboarding: "Flow de 4 etapas progressivas: (1) 'Como você se sente sobre dinheiro?' — escala visual de 😰 a 😎 que mapeia ansiedade financeira. (2) 'O que te trouxe aqui?' — multi-select de objetivos (reserva emergência, aposentadoria, viagem, casa, educação dos filhos). (3) Risk Personality Quiz — 5 perguntas cenário ('Se seu investimento caiu 10%, você...') com respostas como persona, não como opções técnicas. (4) 'Seu primeiro investimento' — sugestão personalizada com CTA para investir R$1 imediatamente. Cada etapa tem barra de progresso e botão 'Pular' visível. Total: máximo 3 minutos.",
    emptyStates: "Cada empty state é uma oportunidade educativa. Dashboard sem investimentos: ilustração de semente + 'Seu portfólio começa com uma semente. Plante a primeira.' + CTA 'Investir R$1'. Extrato vazio: 'Quando você investir, seu histórico aparece aqui. É como um diário do seu crescimento financeiro.' Notificações vazias: 'Silêncio é bom. Significa que seu dinheiro está trabalhando.' Todos usam ilustração brand + texto empático + CTA de baixo atrito.",
    dashboardLayout: "Layout L-shape: sidebar (280px) com navegação + resumo de saldo + quick actions. Main area: (1) Hero card com saldo total em DM Serif Display + variação diária em verde/vermelho. (2) Donut chart de alocação (6 categorias max). (3) Timeline de rendimentos (sparkline de 30 dias). (4) Cards de 'Aprender' — sugestões educativas baseadas no portfolio atual. (5) Feed de atividade recente. Mobile: coluna única, hero card sticky no topo, bottom navigation.",
    modalsAndDrawers: "Modais para decisões (confirmar investimento, explicações educativas). Drawers laterais para detalhes (detalhe de investimento, configurações). Bottom sheets em mobile para ações rápidas. Overlay: Azul Profundidade 60%. Animação: slide-up 200ms ease-out. Fechamento: X + overlay click + Esc. Focus trap obrigatório. Nunca modal sobre modal."
  },

  microcopy: {
    buttonRules: "Verbos de ação no imperativo: 'Investir', 'Calcular', 'Entender', 'Começar'. Máximo 3 palavras. Botão primário: ação principal. Botão secundário: ação alternativa sem destaque. Botão ghost: ações terciárias ou de navegação. Nunca 'Clique aqui', 'Saiba mais', 'OK'. Para ações financeiras: sempre incluir o valor ('Investir R$100' > 'Investir').",
    errorMessages: "Formato: O que aconteceu + O que fazer. Exemplo: 'Não conseguimos processar seu investimento. Tente novamente em alguns minutos ou entre em contato pelo chat.' Nunca culpar o usuário ('Você errou' → 'Algo deu errado'). Nunca código de erro técnico. Para erros de formulário: mensagem inline abaixo do campo, em vermelho, começando com o que está errado ('CPF inválido — verifique os 11 dígitos').",
    emptyStateCopy: "Sempre empático + educativo + com CTA. Template: [Ilustração] + [Frase empática] + [O que vai aparecer aqui] + [CTA de baixo atrito]. Exemplo: 'Seu extrato está vazio por enquanto. Quando você fizer seu primeiro investimento, cada movimentação aparece aqui — como um diário do seu crescimento. [Investir R$1]'",
    writingConventions: "Sentence case para títulos (nunca Title Case). Data: 'dd de mês de aaaa' por extenso ('12 de março de 2025'), nunca dd/mm/yyyy em textos. Valores: sempre com cifrão e vírgula ('R$ 1.234,56'). Porcentagens: com 1 casa decimal ('4,2%'). Listas: sempre com ponto final em cada item se for frase completa. Números: por extenso até 10, algarismos acima. Abreviações: evitar — se necessário, explicar na primeira aparição."
  },

  accessibility: {
    contrastRules: "Todos os textos sobre Branco Clareza (#F7F5F2) devem usar Azul Profundidade (#0D1B2A) — ratio 14.8:1 (AAA). Textos sobre Azul Profundidade devem usar Branco Clareza ou Dourado Kairo — ratios 14.8:1 e 7.2:1 respectivamente (ambos AAA). Botões primários (Dourado Kairo bg + Azul Profundidade texto) = ratio 5.8:1 (AA Large). Verificar contraste específico: Azul Profundidade sobre branco (#FFFFFF), Verde Rendimento sobre Branco Clareza. Nunca usar Cinza Contexto (#6B7280) para texto sobre Azul Profundidade (ratio insuficiente).",
    focusStates: "Focus ring: 3px solid rgba(224,164,88,0.4) — Dourado Kairo com transparência. Offset: 2px. Aplicado em TODOS elementos interativos (botões, links, inputs, cards clicáveis, tabs). Nunca remover outline sem substituto visível. Ordem de tabulação: segue leitura visual (esquerda→direita, cima→baixo). Skip link para conteúdo principal em todas as páginas.",
    colorIndependence: "Nenhuma informação transmitida exclusivamente por cor. Gráficos: cores + padrões (hatching) + labels textuais. Status de investimento: cor + ícone + texto ('↑ +4.2% este mês'). Formulários: cor + ícone + texto de erro. Badges: cor de fundo + texto legível + ícone quando possível. Tested com simuladores de daltonismo (protanopia, deuteranopia, tritanopia)."
  },

  motion: {
    transitions: "Padrão: 200ms ease-out para interações diretas (hover, focus, toggle). 300ms ease-in-out para mudanças de layout (expand/collapse, tab switch). 400ms ease-out para entradas de conteúdo (fade-in, slide-up). 150ms ease-in para saídas (fade-out, slide-down). Nunca exceed 500ms. Respeitar prefers-reduced-motion: reduzir para opacity-only transitions.",
    microinteractions: "Botão primário: sutil scale(1.02) no hover, scale(0.98) no active. Toggle/switch: spring animation (200ms, bounce). Checkbox: ícone de check com draw-in animation (150ms). Número mudando (saldo, rendimento): counter animation com JetBrains Mono, 400ms ease-out. Badge de conquista: pop-in com confetti sutil (3 partículas na cor Dourado Kairo). Gráficos: draw-in progressive (600ms ease-out, staggered 100ms por segmento).",
    loadingStates: "Skeleton screens como padrão (nunca spinner full-page). Skeleton: blocos com background gradient animado (Cinza Contexto 100 → 200 → 100, 1.5s linear infinite). Shape dos skeletons segue o layout real (circle para avatares, rectangles para texto, rounded rects para cards). Para ações financeiras (investir, resgatar): spinner dourado com mensagem contextual ('Processando seu investimento...'). Progress bar para operações longas (> 3s) com estimativa de tempo."
  },

  keyVisual: {
    elements: [
      "Arco circular derivado do símbolo Kairo — usado como moldura, separador e elemento de composição. Representa ciclos de aprendizado e o conceito de timing.",
      "Linhas ascendentes em ângulo de 23.5° — extraídas da inclinação das hastes do 'K'. Representam crescimento e progresso. Usadas como background pattern e em gráficos conceituais.",
      "Grid pontilhado sutil (4px dots, 24px gap) — reforça precisão e sistema. Usado como background de áreas educativas.",
      "Semente/broto estilizado — símbolo recorrente de 'plantar o primeiro investimento'. Construído com as mesmas formas geométricas do logo (círculos + linhas angulares).",
      "Moldura de 'momento' — retângulo com cantos recortados em arco que enquadra conteúdos-chave, referenciando o conceito de Kairos (capturar o momento certo).",
      "Texture grain sutil — noise granulado (opacity 3-5%) aplicado sobre backgrounds sólidos para adicionar profundidade tátil e evitar flat digital puro."
    ],
    photographyStyle: "Fotografia documental-aspiracional: pessoas reais em contextos reais, mas enquadradas com intenção cinematográfica. Referências: Rinko Kawauchi (intimidade + luz natural), Gregory Crewdson (composição teatral em cotidiano). Iluminação preferencialmente natural, golden hour ou luz de janela. Modelos diversos (etnia, idade, gênero). Contextos: café com laptop, família em casa, jovem no transporte público olhando o celular com expressão de confiança. Nunca: stock corporativo, sorrisos forçados, escritórios genéricos, ternos. Sempre: autenticidade, intimidade, momentos de decisão.",
    iconography: "Estilo Lucide-derivado mas com personalidade Kairo: stroke de 1.5px, terminações arredondadas (refletindo o arco do logo), optically balanced em grid 24px. Ícones financeiros custom: gráfico de linha com seta ascendente (rendimento), semente abrindo (primeiro investimento), lupa com cifrão (educação), escudo com checkmark (segurança). Cor padrão: Cinza Contexto. Hover/ativo: Dourado Kairo. Informativo: Azul Profundidade.",
    illustrations: "Flat editorial com profundidade conceitual. Paleta restrita a 3 cores por ilustração (sempre incluindo Azul Profundidade e Dourado Kairo). Personagens sem feições definidas (universalidade), proporções alongadas (8.5 cabeças), gestos expressivos. Cenários: metáforas financeiras desmistificadas — pessoa regando plantas que crescem como gráficos, caminhos que se bifurcam (decisão), pontes sendo construídas (conexão). Estilo referencial: Lotta Nieminen encontra Malika Favre — geometria limpa com narrativa emocional.",
    marketingArchitecture: "Hero → Proof → Education → CTA. Toda peça de marketing segue esta hierarquia: (1) Statement emocional em DM Serif Display, (2) Dado concreto ou prova social, (3) Micro-explicação educativa, (4) CTA de baixo atrito. Proporção visual: 40% imagem/ilustração, 35% espaço negativo, 25% texto. Cores de marketing: Azul Profundidade dominante (70%), Dourado Kairo como acento de ação (20%), Branco Clareza para respiro (10%).",
    compositionPhilosophy: "Regra dos Terços como base, com assimetria intencional para gerar interesse. O 'peso visual' sempre cai no ponto de ação (CTA, dado principal, rosto). Espaço negativo generoso — mínimo 30% de qualquer composição é 'silêncio visual'. Hierarquia: 1 elemento dominante (entrada), 1 elemento de apoio (contexto), 1 CTA (saída). Nunca mais de 3 hierarquias simultâneas. Alinhamento ao grid de 8px em todas as peças digitais.",
    symbols: [
      "Círculo Kairo — o arco que envolve o K, usado isoladamente como símbolo de completude e timing",
      "Semente dourada — símbolo de 'primeiro investimento', usado em onboarding e conquistas",
      "Bússola simplificada — 4 pontos cardinais derivados das hastes do K, usada para orientação e educação"
    ],
    patterns: [
      "Grid pontilhado Kairo — dots de 4px em grid de 24px, cor Cinza Contexto 200 sobre Branco Clareza",
      "Arcos concêntricos — variação do símbolo circular do logo, usado como background de seções hero"
    ],
    structuredPatterns: [
      {
        name: "Kairo Grid",
        description: "Padrão pontilhado geométrico baseado no grid de 8px do design system. Dots de 4px em intervalos de 24px.",
        composition: "Repetição modular em grid cartesiano. Cada dot é um círculo perfeito de 4px. O espaçamento de 24px cria um ritmo visual que ecoa o spacing token 'lg' do sistema.",
        usage: "Backgrounds de áreas educativas, seções de onboarding, materiais impressos como textura sutil.",
        density: "Sutil — opacity 15-25% para não competir com conteúdo. Pode ser denso (opacity 40%) em peças gráficas puras.",
        background: "Branco Clareza (#F7F5F2) com dots em Cinza Contexto (#6B7280)"
      },
      {
        name: "Arcos Ascendentes",
        description: "Semicírculos concêntricos que ecoam a forma circular do logo Kairo, dispostos em padrão ascendente que sugere crescimento.",
        composition: "Arcos de 180° empilhados com espaçamento decrescente (32px, 24px, 16px, 8px do centro para fora). Cada grupo de arcos espaçado horizontalmente por 64px.",
        usage: "Headers de landing page, capas de relatórios, backgrounds de email marketing, pattern de sacolas e embalagens.",
        density: "Médio — stroke de 1.5px com opacity 20-35%. Cor principal: Dourado Kairo sobre Azul Profundidade.",
        background: "Azul Profundidade (#0D1B2A) com arcos em Dourado Kairo (#E0A458)"
      }
    ],
    flora: ["Broto nascendo — metáfora de primeiro investimento e crescimento orgânico"],
    fauna: [],
    objects: [
      "Ampulheta estilizada — referência a Kairos e timing",
      "Bússola — orientação em decisões financeiras",
      "Semente/grão — o primeiro passo que gera riqueza"
    ]
  },

  applications: [
    {
      type: "App Dashboard (Mobile)",
      description: "Tela principal do aplicativo Kairo — saldo total, rendimento diário, donut de alocação, quick actions e feed educativo.",
      imagePlaceholder: "https://placehold.co/390x844/0D1B2A/E0A458?text=Kairo+App+Dashboard",
      imageKey: "digital_app_screen",
      dimensions: "390×844px (iPhone 14 Pro)",
      materialSpecs: "Interface digital, 60fps, suporte a Dark Mode (Azul Profundidade como base, Branco Clareza para texto)",
      layoutGuidelines: "Hero card com saldo em DM Serif Display 32px ocupando 30% superior. Donut chart centralizado. Cards de ação com ícones Lucide em grid 2x2. Feed educativo em scroll vertical. Bottom nav com 4 items (Home, Investir, Aprender, Perfil).",
      typographyHierarchy: "Saldo: DM Serif Display 32px Regular. Labels: Inter 11px SemiBold uppercase, Cinza Contexto. Valores: JetBrains Mono 16px Medium. Body: Inter 14px Regular. CTAs: Inter 16px SemiBold.",
      artDirection: "Fundo Azul Profundidade no hero, transição suave para Branco Clareza no feed. Acentos em Dourado Kairo para CTAs e indicadores positivos. Verde Rendimento para variações positivas. Estética premium-acessível: elegante mas não intimidante.",
      substrates: ["Tela OLED (cores profundas)", "Tela LCD (verificar contraste em baixa luminosidade)"]
    },
    {
      type: "Landing Page (Desktop)",
      description: "Página principal de conversão — hero com manifesto, prova social, educação rápida e CTA de cadastro.",
      imagePlaceholder: "https://placehold.co/1440x900/F7F5F2/0D1B2A?text=Kairo+Landing+Page",
      imageKey: "digital_landing_page",
      dimensions: "1440×900px (above the fold), extensão total ~4500px",
      materialSpecs: "Web responsivo, otimizado para LCP < 2.5s, lazy loading para seções abaixo do fold. Animações com Intersection Observer.",
      layoutGuidelines: "Hero: 60% espaço negativo + headline DM Serif Display 56px + subtext Inter 18px + CTA dourado. Seção de prova social: logos de parceiros + dado de NPS. Seção educativa: 3 cards com benefícios. Footer: links + newsletter. Grid 12 colunas, conteúdo principal em 8 colunas centrais.",
      typographyHierarchy: "Hero: DM Serif Display 56px. Subtítulo: Inter 18px Regular, Cinza Contexto. H2: DM Serif Display 40px. Body: Inter 16px. CTA: Inter 16px SemiBold em botão Dourado Kairo. Caption: Inter 12px Medium.",
      artDirection: "Fundo Branco Clareza dominante com blocos em Azul Profundidade para contraste. Hero pode ter pattern de Arcos Ascendentes sutis. Fotografia documental em seção de 'pessoas reais'. Gráficos de crescimento animated com Dourado Kairo.",
      substrates: ["Monitor LED/IPS", "Mobile (responsive)"]
    },
    {
      type: "Cartão de Visita",
      description: "Cartão corporativo para founders e equipe — frente com logo e nome, verso com pattern e dados de contato.",
      imagePlaceholder: "https://placehold.co/900x500/0D1B2A/E0A458?text=Kairo+Business+Card",
      imageKey: "print_business_card",
      dimensions: "90×50mm (padrão brasileiro)",
      materialSpecs: "Papel Markatto Concetto Bianco 350g/m², acabamento soft-touch na frente, hot stamping dourado no símbolo K. Corte reto, sem laminação (toque natural).",
      layoutGuidelines: "Frente: logo horizontal centralizado no terço superior, nome em Inter SemiBold 9pt centralizado abaixo, cargo em Inter Regular 7pt. Verso: pattern Kairo Grid full-bleed em Azul Profundidade, dados de contato alinhados à esquerda em Branco Clareza Inter 7.5pt, QR code no canto inferior direito (15mm).",
      typographyHierarchy: "Nome: Inter 9pt SemiBold. Cargo: Inter 7pt Regular. Contato: Inter 7.5pt Regular. Email: JetBrains Mono 7pt (para diferenciar visualmente).",
      artDirection: "Frente: limpa, aspiracional, Azul Profundidade com símbolo em Dourado Kairo. Verso: rico em textura (pattern), funcional. O contraste frente/verso mimetiza a dualidade da marca: simplicidade (frente) + profundidade (verso).",
      substrates: ["Papel Markatto Concetto Bianco 350g/m²", "Alternativa: Couché fosco 300g/m² para produção econômica"]
    },
    {
      type: "Post Instagram (Carrossel Educativo)",
      description: "Carrossel de 5-7 slides educativo — formato principal de conteúdo da Kairo no Instagram.",
      imagePlaceholder: "https://placehold.co/1080x1080/F7F5F2/0D1B2A?text=Kairo+Carousel",
      imageKey: "social_instagram_post",
      dimensions: "1080×1080px (1:1)",
      materialSpecs: "Digital, RGB, exportar em PNG com compressão otimizada. Máximo 10MB por slide. Usar source em 2160×2160 para máxima nitidez.",
      layoutGuidelines: "Slide 1 (capa): headline provocativa em DM Serif Display 48px, background Azul Profundidade, accent Dourado Kairo. Slides 2-5: fundo Branco Clareza, uma informação por slide, ícone Lucide 48px + texto Inter 24px Bold + explicação Inter 18px Regular. Slide final: CTA + profile handle. Safe zone: 64px em todas as margens.",
      typographyHierarchy: "Capa: DM Serif Display 48px. Títulos internos: Inter 24px Bold. Body: Inter 18px Regular. Dados: JetBrains Mono 32px Bold. CTA: Inter 20px SemiBold.",
      artDirection: "Capa impactante em Azul Profundidade. Slides internos limpos em Branco Clareza. Dados financeiros em destaque com Dourado Kairo. Último slide com gradiente sutil Azul Profundidade → Dourado Kairo. Consistência visual absoluta entre slides.",
      substrates: ["Tela mobile (formato quadrado)", "Stories: adaptar para 1080×1920 com reposição vertical"]
    }
  ],

  socialMediaGuidelines: {
    platforms: [
      {
        platform: "Instagram",
        primaryFormats: "Carrossel educativo (70% do conteúdo), Reels curtos (15-30s) com dado financeiro surpreendente (20%), Stories com enquetes e quizzes financeiros (10%)",
        tone: "Educador-espirituoso. Ensina sem ser professor. Dados surpreendentes + humor seco. Visual limpo e premium. Nunca vendedor, sempre útil.",
        contentPillars: [
          "Educação financeira snackable — um conceito por carrossel",
          "Dados que surpreendem — desmistificar com números reais",
          "Histórias de primeiros investidores — prova social autêntica",
          "Behind the scenes — transparência da empresa (produto, time, decisões)"
        ],
        frequency: "5x/semana: 3 carrosséis + 1 Reel + 1 Story série",
        doList: [
          "Manter paleta Kairo rigorosamente em todo conteúdo",
          "Incluir dado concreto em toda publicação (número, porcentagem, valor)",
          "Usar CTA de baixo atrito no último slide ('Link na bio para entender mais')",
          "Responder TODOS os comentários com dúvidas financeiras em até 4 horas"
        ],
        dontList: [
          "Nunca usar linguagem de urgência ('Últimas vagas!', 'Corra!')",
          "Nunca postar conteúdo sem dado verificável como base",
          "Nunca usar stock photo — apenas ilustrações brand ou fotos autorais",
          "Nunca comparar com concorrentes nominalmente"
        ],
        examplePost: "Carrossel: 'O que R$100/mês viram em 5 anos' — Slide 1: 'R$100/mês. 5 anos. 3 cenários.' Slide 2: 'Poupança: R$6.847 (+R$847)' Slide 3: 'CDB 120% CDI: R$7.492 (+R$1.492)' Slide 4: 'ETF diversificado: R$7.800-9.200 (risco maior, potencial maior)' Slide 5: 'O melhor investimento é o que você entende. O momento certo é agora. 🔗 Link na bio.'"
      },
      {
        platform: "Twitter/X",
        primaryFormats: "Tweets-dado (1 frase + 1 número), Threads educativas (5-8 tweets), Quote tweets com opinião fundamentada sobre notícias financeiras",
        tone: "Provocativo-inteligente. Dados surpreendentes que param o scroll. Opinião fundamentada, nunca clickbait. Tom de insider que compartilha. Zero formalidade.",
        contentPillars: [
          "Dados financeiros surpreendentes — 'Você sabia que...'",
          "Opinião fundamentada sobre mercado — takes quentes com substância",
          "Threads educativas — conceito financeiro em 5-8 tweets simples",
          "Transparência radical — compartilhar métricas do produto publicamente"
        ],
        frequency: "3x/dia: 2 tweets-dado + 1 thread/semana + quote tweets reativo",
        doList: [
          "Abrir tweets com dado numérico impactante",
          "Threads com numeração (1/, 2/, etc.) e emoji de 🧵 no primeiro",
          "Engajar com respostas a perguntas financeiras de qualquer pessoa",
          "Compartilhar métricas reais do produto (transparência como conteúdo)"
        ],
        dontList: [
          "Nunca usar mais de 2 emojis por tweet",
          "Nunca hashtags (parecem spam no X)",
          "Nunca fio de venda direta — sempre educar primeiro",
          "Nunca tomar partido político ou religioso"
        ],
        examplePost: "Tweet: 'R$100 na poupança em 2014 valem R$67 hoje corrigidos pela inflação.\n\nVocê está ficando mais pobre guardando dinheiro.\n\nThread sobre o que fazer com R$100/mês: 🧵'"
      },
      {
        platform: "LinkedIn",
        primaryFormats: "Posts longos com dado + opinião (600-1200 caracteres), Artigos técnicos sobre fintech/educação financeira, Carrosséis adaptados do Instagram",
        tone: "Profissional mas não corporativo. Tom de founder/expert que compartilha aprendizados. Dados de mercado + insight pessoal. Sem jargão de LinkedIn ('estou feliz em anunciar').",
        contentPillars: [
          "Insights do mercado fintech brasileiro — dados + opinião fundamentada",
          "Transparência corporativa — decisões de produto, métricas, aprendizados de startup",
          "Thought leadership em educação financeira — por que o modelo atual falha",
          "Vagas e cultura — employer branding autêntico"
        ],
        frequency: "3x/semana: 2 posts + 1 artigo/mês",
        doList: [
          "Abrir posts com dado concreto ou pergunta provocativa",
          "Compartilhar aprendizados reais (erros incluídos) como startup",
          "Usar fotos do time/escritório/produto real nos posts",
          "Engajar genuinamente nos comentários com insights adicionais"
        ],
        dontList: [
          "Nunca usar 'Estou feliz em anunciar' ou linguagem de LinkedIn clichê",
          "Nunca postar só para gerar impressões sem substância",
          "Nunca usar mais de 3 hashtags por post",
          "Nunca conteúdo puramente promocional sem valor educativo"
        ],
        examplePost: "Post: 'Acabamos de abrir nosso algoritmo de recomendação no GitHub.\n\nSim, o código que decide o que sugerir para 12.000 investidores.\n\nPor que? Porque na Kairo, transparência não é um slide de apresentação. É commit público.\n\n3 coisas que aprendemos ao abrir o código:\n1. Bug reports de graça (obrigado, comunidade)\n2. Confiança mensurável (NPS subiu 12 pontos)\n3. Pressão saudável pra escrever código melhor\n\nVocê abriria o algoritmo que ganha dinheiro para sua empresa?'"
      }
    ],
    globalHashtagStrategy: "Hashtag primária: #MomentoKairo (branding, usado em TODO conteúdo). Hashtags educativas: #FinançasSimples, #PrimeiroInvestimento, #DinheiroConsciente. Máximo 3 por post. Nunca hashtags genéricas (#investimento, #dinheiro). No Twitter/X: zero hashtags (preferência da plataforma).",
    brandVoiceAdaptation: "O core é o mesmo (direto, educador, empático), mas a intensidade varia: Instagram é 60% visual + 40% texto — mais conciso. Twitter é 90% texto — mais provocativo e opinativo. LinkedIn é 70% texto + 30% visual — mais analítico e profissional. Email é 100% pessoal — tom de 'amigo inteligente escrevendo só para você'. Push é ultra-conciso — 1 frase com dado + 1 ação."
  },

  productionGuidelines: {
    fileNamingConvention: "kairo_[tipo]_[variação]_[tamanho].[ext] — Exemplo: kairo_logo_horizontal_dark_400x120.svg, kairo_card_social_instagram_1080x1080.png, kairo_pattern_grid_seamless_512x512.svg. Sempre lowercase, underscores, sem espaços. Variações: light, dark, mono, negative. Tamanhos: dimensões em pixels. Extensão: svg (vetores), png (raster com transparência), jpg (fotos), pdf (print).",
    handoffChecklist: [
      "✅ Converter todas as fontes em curvas/outlines no arquivo vetorial",
      "✅ Expandir todos os traços (strokes) em formas (shapes)",
      "✅ Verificar overprint settings (knockout vs overprint em cores sobrepostas)",
      "✅ Confirmar perfil de cor: FOGRA39 para impressão, sRGB para digital",
      "✅ Incluir bleed de 3mm em todas as peças de impressão",
      "✅ Verificar resolução mínima: 300dpi para print, 72dpi para digital (mas exportar em @2x e @3x)",
      "✅ Testar logo em todas as variações sobre cada cor de fundo da paleta",
      "✅ Validar contraste WCAG AA em todos os pares de cores utilizados",
      "✅ Incluir safe zone de 64px em peças de social media (cobre interfaces dos apps)",
      "✅ Exportar tokens (cores, tipografia, spacing) em JSON para desenvolvimento",
      "✅ Documentar breakpoints e comportamento responsivo de cada peça",
      "✅ Gerar favicon em ICO (16, 32, 48px), PNG (180, 192, 512px) e SVG"
    ],
    printSpecs: {
      colorProfile: "FOGRA39 (ISO Coated v2 300% ECI) para offset. FOGRA29 para papéis não-couché. Tintas Pantone 289 C (Azul Profundidade) e 7409 C (Dourado Kairo) para cores spot em materiais premium.",
      resolution: "300dpi mínimo para offset e digital press. 150dpi para grandes formatos (banners, outdoors). Imagens em TIFF ou PSD sem compressão destrutiva.",
      bleed: "3mm em todas as direções. Para gráficas que pedem mais, extender para 5mm. Sangria deve conter extensão natural do design, não borda branca.",
      safeMargin: "5mm da área de corte para textos e elementos críticos. 10mm para cartões de visita. 15mm para relatórios e apresentações impressas.",
      notes: "Hot stamping dourado: usar Kurz Luxor 220 ou equivalente para o símbolo Kairo em peças premium. Laminação soft-touch na frente apenas (verso sem laminação para escrita). Papel mínimo 250g/m² para peças que representam a marca diretamente (cartões, folders)."
    },
    digitalSpecs: {
      colorSpace: "sRGB para web e mobile. Display P3 para Apple devices (opcional, com fallback sRGB). Nunca Adobe RGB em assets digitais.",
      exportScales: ["@1x (base)", "@2x (retina)", "@3x (super retina)", "SVG (quando possível — logos, ícones, patterns)"],
      formats: ["SVG (logos, ícones, ilustrações)", "PNG (rasters com transparência, screenshots)", "WebP (fotos para web, com fallback JPG)", "JPG (fotos sem transparência, qualidade 85-92%)", "MP4 (motion, max 30s, H.264)", "Lottie JSON (microinteractions)"],
      compressionGuidelines: "JPG: qualidade 85-92% (ImageOptim ou Squoosh). PNG: compressão lossless (TinyPNG). WebP: qualidade 80%. SVG: otimizar com SVGO (remove metadata, simplifica paths). Alvo: nenhum asset > 500KB para web (exceto vídeo).",
      notes: "Todas as imagens devem incluir alt text descritivo. Lazy loading para imagens abaixo do fold. Preload para hero images. Aspect ratio sempre definido para evitar layout shift (CLS)."
    },
    deliverables: [
      { asset: "Logo Pack", formats: ["SVG", "PNG @1x @2x @3x", "PDF", "EPS"], specs: "Todas as 6 variantes (horizontal, stacked, mono, negative, mark, wordmark) em cada formato. Cores: original, mono preto, mono branco. Inclui favicon em ICO/PNG/SVG." },
      { asset: "Brand Guidelines PDF", formats: ["PDF (interativo)", "PDF (print-ready)"], specs: "Documento completo do brandbook em formato apresentável. Versão interativa com hyperlinks. Versão print em CMYK com bleed." },
      { asset: "Design Tokens", formats: ["JSON (W3C DTCG)", "CSS Custom Properties", "Tailwind Config"], specs: "Todos os tokens: cores (com tonalScale), tipografia, spacing, border-radius, shadows, breakpoints." },
      { asset: "Social Media Templates", formats: ["Figma", "Canva (para equipe não-designer)"], specs: "Templates para Instagram (post, carrossel, story, reel cover), Twitter/X (header, tweet image), LinkedIn (post, banner). Grid de safe zones incluído." },
      { asset: "Icon Set", formats: ["SVG", "PNG @1x @2x", "Figma component library"], specs: "32 ícones custom financeiros + 64 ícones Lucide brand-colored. Grid 24px, stroke 1.5px." },
      { asset: "Illustration Set", formats: ["SVG", "PNG @2x"], specs: "12 ilustrações conceituais para onboarding, empty states, error states e marketing. Paleta restrita Kairo." }
    ],
    productionMethods: [
      {
        method: "Offset",
        substrate: "Papel Markatto Concetto Bianco 350g/m² (cartões), Couché fosco 150g/m² (folders/relatórios)",
        guidelines: [
          "Usar perfil FOGRA39 para separação de cores",
          "Azul Profundidade em Pantone 289 C spot para tiragens acima de 1000 unidades",
          "Dourado Kairo em Pantone 7409 C spot ou hot stamping para peças premium",
          "Overprint em textos pretos pequenos (< 8pt) sobre cores — evita registro falho"
        ],
        restrictions: [
          "Textos abaixo de 6pt devem ser em cor única (preto ou Pantone) — evitar registro",
          "Gradientes no Dourado Kairo exigem teste de prova (podem perder vibração em offset)",
          "Nunca usar retícula abaixo de 150lpi para áreas de cor sólida Azul Profundidade"
        ]
      },
      {
        method: "Serigrafia / Silk-screen",
        substrate: "Camisetas algodão 100% 30.1, bonés, ecobags de algodão cru, totebags",
        guidelines: [
          "Máximo 3 cores por peça para viabilidade econômica",
          "Base branca obrigatória em tecidos escuros antes de aplicar Dourado Kairo",
          "Logo simplificado (mark only) para peças pequenas como bonés",
          "Tela mínima 77 fios para detalhes do símbolo Kairo"
        ],
        restrictions: [
          "O pattern Kairo Grid é inviável em serigrafia (dots muito pequenos) — usar Arcos Ascendentes simplificado",
          "Texto abaixo de 5mm é ilegível em serigrafia — aumentar para mínimo 8mm",
          "Gradientes são impossíveis em serigrafia — usar versão flat do Dourado Kairo"
        ]
      },
      {
        method: "Bordado",
        substrate: "Polos, camisas sociais, bonés estruturados, mochilas",
        guidelines: [
          "Usar versão mark-only do logo para bordado (sem wordmark em áreas < 5cm)",
          "Converteger para matriz de bordado com software Wilcom ou equivalente",
          "Azul Profundidade: linha Madeira Rayon 1242 (Navy) ou equivalente",
          "Dourado Kairo: linha Madeira Rayon 1070 (Gold) ou equivalente",
          "Densidade: 4-5 pontos/mm para preenchimento, 3 pontos/mm para contornos"
        ],
        restrictions: [
          "Textos abaixo de 5mm de altura são ilegíveis em bordado",
          "O pattern Kairo Grid é impossível em bordado — usar marca d'água no tecido (sublimação) se necessário",
          "Detalhes finos do símbolo (linhas do K < 2mm) devem ser engrossados 20% para bordado",
          "Máximo 15.000 pontos por logo para manter custo viável"
        ]
      },
      {
        method: "Digital (impressão digital de pequeno formato)",
        substrate: "Adesivos vinil, brindes, pequenas tiragens de cartões, material de PDV",
        guidelines: [
          "Resolução mínima 300dpi, perfil sRGB convertido para CMYK no RIP da impressora",
          "Laminação fosca para proteger e manter a estética soft da marca",
          "Para adesivos: adicionar branco chapado como base antes das cores (impressoras UV)"
        ],
        restrictions: [
          "Cores Pantone serão simuladas em CMYK — validar prova digital antes",
          "O Dourado Kairo tende a perder saturação em impressão digital — considerar hot stamping ou foil para peças premium"
        ]
      },
      {
        method: "Flexografia",
        substrate: "Embalagens, sacolas de papel, etiquetas de produto",
        guidelines: [
          "Clichês em fotopolímero de alta resolução (mínimo 150lpi)",
          "Cores chapadas preferidas — evitar gradientes (risco de banding)",
          "Trapping de 0.25pt entre cores adjacentes",
          "Usar versão simplificada do logo para carimbos e clichês flexográficos"
        ],
        restrictions: [
          "Textos vazados (branco sobre cor) mínimo 8pt bold em flexografia",
          "O registro entre cores tem tolerância de 0.5mm — evitar sobreposições finas",
          "Gradientes no Dourado Kairo são arriscados — pedir prova de clichê",
          "Papel kraft escurece todas as cores — fazer teste de absorção antes de aprovar"
        ]
      }
    ]
  },

  imageGenerationBriefing: {
    visualStyle: "Minimalismo editorial financeiro — fusão de flat design com profundidade fotográfica. Referência: a clareza gráfica de uma Bloomberg Businessweek encontra a empatia visual de um Headspace. Estilo que transmite credibilidade sem frieza, acessibilidade sem infantilizar. Linhas limpas, geometria precisa, espaço negativo generoso. Quando fotográfico: documental-aspiracional com grain sutil.",
    colorMood: "Paleta dominante fria-quente: base em Azul Profundidade (#0D1B2A) para seriedade, acentos em Dourado Kairo (#E0A458) para calor e ação, respiro em Branco Clareza (#F7F5F2). Verde Rendimento (#2D936C) reservado para indicadores de crescimento. A tensão cromática azul escuro + dourado transmite 'confiança + oportunidade' — a dualidade central da marca. Paleta exata: Azul Profundidade (#0D1B2A), Dourado Kairo (#E0A458), Branco Clareza (#F7F5F2), Verde Rendimento (#2D936C), Cinza Contexto (#6B7280).",
    compositionNotes: "Regra dos terços como base, com ponto focal no terço dourado (ação/CTA). Assimetria intencional para gerar interesse. Mínimo 30% de espaço negativo por composição. Hierarquia visual clara: 1 elemento dominante + 1 de suporte + 1 CTA. Para mockups: perspectiva 3/4 com iluminação de 3 pontos. Para social: composição bold com texto como elemento gráfico.",
    moodKeywords: [
      "confiança acessível", "precisão calorosa", "empoderamento sutil",
      "clareza financeira", "elegância democrática", "educação sem paternalismo",
      "timing dourado", "crescimento orgânico", "transparência tangível",
      "modernidade humana", "sofisticação inclusiva", "coragem financeira"
    ],
    artisticReferences: "Fotografia: Rinko Kawauchi (intimidade + luz natural dourada), Gregory Crewdson (cotidiano com composição cinematográfica). Design gráfico: Mike Joyce (Swissted — grid rígido com energia punk), Jessica Hische (tipografia com alma). Ilustração: Lotta Nieminen (geometria editorial), Malika Favre (pop art minimalista). Motion: Stripe (animações sutis e funcionais). Experiência: Headspace (design que reduz ansiedade).",
    avoidElements: "Stock corporativo genérico, handshakes, gráficos 3D extrudados, moedas de ouro realistas, cofrinhos de porco, cifrões gigantes, expressões forçadas de felicidade, escritórios genéricos com vista para cidade, ternos e gravatas, linguagem visual de 'lobo de Wall Street', qualquer elemento que intimide ou exclua.",
    logoStyleGuide: "O símbolo Kairo (K inscrito em círculo) aparece com sutileza em contextos fotográficos — nunca sobreposto artificialmente. Em peças gráficas: posição fixa no canto inferior direito ou superior esquerdo com clearspace respeitado. Em mockups: integrado naturalmente ao material (impresso no produto, bordado no tecido, exibido na tela). Nunca como watermark semitransparente.",
    photographyMood: "Iluminação: natural golden hour (5600K-6500K) ou luz de janela lateral suave. Temperatura: warm com sombras frias (complementar). DOF: f/2.8-4.0 para retratos (foco no rosto/mãos com celular), f/8-11 para ambientes. Cenários: cafés de especialidade, apartamentos com luz natural, coworkings, transporte público. Modelos: diversidade real (etnia, idade, body type). Expressões: concentração serena, confiança calma, sorriso contido — NUNCA euforia ou ansiedade. Pós-produção: grain sutil (ISO 400 simulado), contraste médio, saturação -10%.",
    patternStyle: "Dois padrões core: (1) Kairo Grid — dots de 4px em grid 24px, sutil e geométrico, para backgrounds educativos. (2) Arcos Ascendentes — semicírculos concêntricos que ecoam o logo, para peças de marketing e impressos. Ambos em opacity 15-35% como textura, nunca como protagonista. Cores: Cinza Contexto sobre Branco Clareza (Grid), Dourado Kairo sobre Azul Profundidade (Arcos). Escala: ajustável conforme aplicação, mas sempre reconhecível.",
    marketingVisualLanguage: "Hierarquia Hero → Proof → Education → CTA em toda peça. Proporção: 40% visual + 35% espaço negativo + 25% texto. Headlines em DM Serif Display com kerning tight (-0.02em). Dados numéricos em JetBrains Mono Bold para destaque. CTAs em caixas com border-radius 8px, fundo Dourado Kairo. Separadores visuais: linha Cinza Contexto 200 de 1px ou espaço negativo de 48px. Nunca: bullet points genéricos, banners barulhentos, mais de 2 CTAs por peça.",
    negativePrompt: "mundano, literal, sem mistério, flat, prosaico, genérico, convencional, burocrático, suave, conformista, pasteurizado, corporate, watermark, text overlay, blurry, low quality, distorted, stock photo genérico, clip art, handshake, moedas realistas, cofre/cofrinho, gráfico 3D extrudado, cifrão gigante, escritório genérico, terno e gravata, expressão forçada, euforia falsa, Wall Street aesthetic",
    emotionalCore: "Empoderamento sereno — a sensação de dominar algo que antes assustava. Não é euforia (estamos falando de dinheiro, não de entretenimento). É a confiança calma de quem entende o que está fazendo. O manifesto diz 'cada real investido com consciência é uma semente de liberdade' — toda imagem deve evocar essa transição de medo para domínio, de confusão para clareza, de passividade para ação consciente.",
    textureLanguage: "Digital com alma tátil. Superfícies predominantemente lisas e limpas (a precisão do Sábio), mas com grain sutil de filme fotográfico que adiciona humanidade (o Rebelde). Paper texture em backgrounds de material impresso. Vidro fosco e metal escovado em mockups físicos. Nunca: texturas orgânicas brutas, madeira rústica, concreto aparente (não combinam com a personalidade fintech). Eventualmente: tecido fino (algodão mercerizado) em peças de vestuário.",
    lightingSignature: "Key light: 5600K-6500K (golden hour natural). Fill ratio: 1:2 (sombras suaves mas presentes). Direção: 45° lateral para retratos, backlight para silhuetas inspiracionais. Qualidade: difusa (janela grande, overcast, softbox). Especulares controlados — brilho em telas/devices é permitido e desejado (reforça o digital). Nunca: flash direto, luz fluorescente, iluminação de estúdio dura.",
    cameraSignature: "Retratos: 85mm f/2.8, altura dos olhos, ligeiramente de cima (empodera sem intimidar). Ambientes: 35mm f/4, ângulo reto ou levemente elevado (contextualiza sem distorcer). Produtos/devices: 50mm f/5.6, perspectiva 3/4 com reflexo sutil de tela. Flat lays: 90° overhead, iluminação difusa uniforme. Macro (detalhes): 100mm f/4, foco seletivo em textura/material. Todos: leve filme grain, vinheta sutil (-0.5 stops nos cantos).",
    brandArchetype: "Sábio (dominante): traduzido visualmente em tipografia com serifa (autoridade intelectual), paleta restrita e coesa (disciplina), espaço negativo generoso (contemplação), grid preciso (sistema). Rebelde (secundário): traduzido em contraste cromático forte (azul escuro vs. dourado), copy provocativa, decisões visuais não-óbvias (fintech com serifa? sim.), recusa de clichês visuais do setor. A tensão Sábio-Rebelde cria a identidade: sabedoria que desafia, conhecimento que empodera.",
    sensoryProfile: "Visão: azul profundo com lampejos dourados, como céu noturno com estrelas surgindo — sereno e aspiracional. Tato: papel premium soft-touch, tela de celular quente, tecido de algodão fino — sofisticação acessível. Audição: lo-fi beats com piano suave — concentração sem tensão (referência: playlists do Headspace). Olfato: café coado fresco e couro novo de caderno — produtividade com prazer. Paladar: chocolate amargo 70% — intenso mas refinado, não é para todos mas quem gosta, ama."
  },

  governance: {
    designTools: "Figma (design primário — components, prototyping, design tokens). Linear (project management de design). GitHub (versionamento de código e design tokens). Notion (documentação e knowledge base). Storybook (component library viva). ImageOptim + Squoosh (otimização de assets).",
    documentationPlatform: "Notion como hub central — organizado por áreas: Brand (guidelines, assets, templates), Product (specs, user research), Engineering (tokens, APIs, components). Zero Figma como documentação (Figma é ferramenta de design, não de documentação). Changelog de marca versionado em Notion com datas.",
    componentLibrary: "React component library em Storybook, hospedada em Chromatic. Atomic Design: Atoms (Button, Input, Badge) → Molecules (Card, Toast, Form Group) → Organisms (Navigation, Dashboard Widget, Investment Card) → Templates (Dashboard, Onboarding, Settings). Tokens consumidos via CSS Custom Properties exportados automaticamente do Figma via Style Dictionary.",
    versioningStrategy: "Semantic versioning: MAJOR.MINOR.PATCH. MAJOR: mudanças breaking (nova paleta, nova tipografia). MINOR: adições (nova variante de componente, nova ilustração). PATCH: correções (ajuste de cor, fix de responsividade). Changelog público no Notion. Branch protection no Figma (main = aprovado, branches = exploração). Design tokens versionados no repositório.",
    updateProcess: "Proposta → Review → Aprovação → Implementação → Documentação. Propostas de mudança via 'Brand RFC' no Notion (template padronizado). Review por Design Lead + Brand Manager em weekly de 30min. Aprovação requer consenso dos 2. Implementação: designer atualiza Figma + Storybook, dev atualiza tokens + componentes. Documentação: atualizar Notion + Changelog. Rollout: comunicar mudanças em #design-updates no Slack.",
    ownershipRoles: "Brand Manager: dona da estratégia, voz, posicionamento — aprova qualquer mudança no verbal. Design Lead: dono do sistema visual, componentes, tokens — aprova qualquer mudança no visual. Product Manager: garante que brand guidelines são respeitados no produto. Engineering Lead: mantém Storybook e tokens em sync com Figma. Todos: podem propor mudanças via Brand RFC."
  }
};

/**
 * Gera um resumo compacto do golden brandbook para uso como few-shot anchor nos prompts.
 * Inclui exemplos de qualidade máxima para cada seção, mantendo tamanho controlado.
 */
export function getGoldenQualityAnchors(): string {
  return `
═══════════════════════════════════════════════════════════════
QUALITY ANCHORS — Exemplos de nível máximo para cada seção
═══════════════════════════════════════════════════════════════

EXEMPLOS DE QUALIDADE GOLD-STANDARD (use como referência de profundidade):

▸ brandConcept.purpose (EXCELENTE):
"Democratizar a inteligência financeira para que cada brasileiro possa construir riqueza com consciência, não com medo."
(Específico, emocional, acionável, com tensão narrativa "consciência vs medo")

▸ brandConcept.purpose (RUIM):
"Oferecer soluções inovadoras no mercado financeiro."
(Genérico, sem emoção, poderia ser qualquer empresa)

▸ brandConcept.values (EXCELENTE):
"Transparência Radical — Sem letras miúdas. Sem taxas escondidas. Sem jargão."
(Nome expressivo + manifestação concreta com 3 exemplos)

▸ brandConcept.values (RUIM):
"Transparência"
(Apenas uma palavra sem contexto)

▸ verbalIdentity.tagline (EXCELENTE):
"O momento certo é agora."
(Conectada ao nome da marca Kairo/Kairos, memorável, acionável, 5 palavras)

▸ verbalIdentity.messagingPillar.exampleCopy (EXCELENTE):
["Headline: 'Seu dinheiro merece mais que a poupança. Você merece entender por quê.'",
 "CTA: 'Descubra seu perfil em 3 minutos'",
 "Push: 'O Tesouro Selic subiu para 13,75%. Quer entender o que isso muda para você?'"]
(3 canais diferentes, copy REAL pronta para uso, dados concretos, tom adequado)

▸ audiencePersona (EXCELENTE):
"Camila Ribeiro, Analista de Marketing Digital, 29 anos. Mora em São Paulo (Pinheiros), ganha R$7.500/mês, tem R$12.000 parados na poupança. Solteira, divide apartamento. Consome Primocast. Já baixou 3 apps de investimento e desinstalou todos em menos de 1 semana."
(Nome real, idade, cidade, bairro, renda, contexto emocional, comportamento específico)

▸ audiencePersona (RUIM):
"João, 30 anos, profissional urbano que quer investir melhor."
(Genérico, sem profundidade, sem comportamento real)

▸ colors (EXCELENTE):
name: "Azul Profundidade" / usage: "Representa a profundidade do conhecimento e a seriedade do compromisso com o dinheiro do usuário"
(Nome criativo evocativo + usage que explica o PORQUÊ psicológico)

▸ colors (RUIM):
name: "Azul Escuro" / usage: "Cor principal da marca"
(Nome genérico + usage sem significado)

▸ keyVisual.elements (EXCELENTE):
"Arco circular derivado do símbolo Kairo — usado como moldura, separador e elemento de composição. Representa ciclos de aprendizado e o conceito de timing."
(Forma VISUAL concreta + origem do logo + aplicações + significado simbólico)

▸ keyVisual.elements (RUIM):
"Inovação" ou "Formas geométricas"
(Conceito abstrato ou vago demais)

▸ imageGenerationBriefing.photographyMood (EXCELENTE):
"Iluminação: natural golden hour (5600K-6500K). DOF: f/2.8-4.0 para retratos. Cenários: cafés de especialidade, coworkings. Expressões: concentração serena, confiança calma — NUNCA euforia ou ansiedade. Grain sutil (ISO 400 simulado)."
(Parâmetros técnicos + cenários específicos + emoções precisas + anti-padrões)

▸ productionMethods (EXCELENTE):
Serigrafia — restrictions: "O pattern Kairo Grid é inviável em serigrafia (dots muito pequenos) — usar Arcos Ascendentes simplificado"
(Restrição REAL e técnica com solução alternativa nomeando elementos da marca)

▸ applications.typographyHierarchy (EXCELENTE):
"Saldo: DM Serif Display 32px Regular. Labels: Inter 11px SemiBold uppercase, Cinza Contexto. Valores: JetBrains Mono 16px Medium."
(Nomes EXATOS de fontes + tamanhos + pesos + cores da paleta referenciados)
`.trim();
}
