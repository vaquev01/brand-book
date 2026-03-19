import type { GuidedBriefing } from "@/components/generateBriefingFormModel";
import type { CreativityLevel, GenerateScope } from "@/lib/types";

export interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  icon: string;
  thumbnail: string;
  suggestedColors: { primary: string[]; secondary: string[] };
  suggestedFonts: { marketing: string; ui: string };
  creativityLevel: CreativityLevel;
  suggestedScope: GenerateScope;
  guidedBriefing: Partial<GuidedBriefing>;
  tags: string[];
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: "restaurante-premium",
    name: "Restaurante Premium",
    industry: "Gastronomia",
    description:
      "Identidade sofisticada para restaurantes fine dining, bistr\u00f4s e casas gastron\u00f4micas com foco em experi\u00eancia sensorial.",
    icon: "\ud83c\udf7d\ufe0f",
    thumbnail:
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
    suggestedColors: {
      primary: ["#1a1a2e", "#c9a96e", "#2c2c2c"],
      secondary: ["#f5f0e8", "#8b7355", "#e8ddd0"],
    },
    suggestedFonts: { marketing: "Playfair Display", ui: "Inter" },
    creativityLevel: "balanced",
    suggestedScope: "full",
    guidedBriefing: {
      whatItDoes:
        "Restaurante premium com culin\u00e1ria autoral e ingredientes selecionados",
      targetAudience:
        "P\u00fablico 30-55 anos, classes A/B, que valoriza experi\u00eancia gastron\u00f4mica, harmoniza\u00e7\u00e3o e ambiente sofisticado",
      positioning:
        "Refer\u00eancia em alta gastronomia local, com identidade elegante e atemporal",
      colorPreferences:
        "Tons escuros (navy, preto), dourado, marfim. Paleta que remeta a sofistica\u00e7\u00e3o e exclusividade",
      emotionalTerritory:
        "Exclusividade, prazer, mem\u00f3ria afetiva, celebra\u00e7\u00e3o",
      physicalTouchpoints:
        "Card\u00e1pio impresso, embalagens delivery premium, fachada, uniformes, redes sociais",
      brandValues:
        "Excel\u00eancia, sazonalidade, autoria, hospitalidade genu\u00edna",
    },
    tags: ["gastronomia", "premium", "restaurante", "fine-dining", "luxo"],
  },
  {
    id: "startup-tech",
    name: "Startup Tech",
    industry: "Tecnologia",
    description:
      "Visual moderno e din\u00e2mico para startups SaaS, apps e plataformas digitais que precisam transmitir inova\u00e7\u00e3o.",
    icon: "\ud83d\ude80",
    thumbnail:
      "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    suggestedColors: {
      primary: ["#6366f1", "#7c3aed", "#0ea5e9"],
      secondary: ["#f8fafc", "#e2e8f0", "#c7d2fe"],
    },
    suggestedFonts: { marketing: "Space Grotesk", ui: "Inter" },
    creativityLevel: "creative",
    suggestedScope: "full",
    guidedBriefing: {
      whatItDoes:
        "Plataforma tecnol\u00f3gica que resolve um problema real com solu\u00e7\u00e3o inovadora e escal\u00e1vel",
      targetAudience:
        "Profissionais de tecnologia, early adopters, decision-makers de empresas que buscam efici\u00eancia",
      positioning:
        "Marca \u00e1gil, transparente e t\u00e9cnica que inspira confian\u00e7a e inova\u00e7\u00e3o",
      colorPreferences:
        "Gradientes vibrantes (violeta, azul, cyan), fundo claro ou escuro com contraste alto",
      emotionalTerritory:
        "Empoderamento, velocidade, possibilidade, futuro acess\u00edvel",
      physicalTouchpoints:
        "Dashboard web, app mobile, pitch decks, landing page, redes sociais, swag",
      brandValues: "Transpar\u00eancia, simplicidade, impacto, escalabilidade",
    },
    tags: ["tech", "startup", "saas", "digital", "inovacao"],
  },
  {
    id: "clinica-saude",
    name: "Cl\u00ednica de Sa\u00fade",
    industry: "Sa\u00fade",
    description:
      "Identidade acolhedora e profissional para cl\u00ednicas, consult\u00f3rios e centros de sa\u00fade que transmitem confian\u00e7a.",
    icon: "\ud83c\udfe5",
    thumbnail:
      "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 40%, #7dd3fc 100%)",
    suggestedColors: {
      primary: ["#0284c7", "#0d9488", "#1e3a5f"],
      secondary: ["#f0fdfa", "#e0f2fe", "#ccfbf1"],
    },
    suggestedFonts: { marketing: "DM Sans", ui: "Inter" },
    creativityLevel: "conservative",
    suggestedScope: "full",
    guidedBriefing: {
      whatItDoes:
        "Cl\u00ednica de sa\u00fade com atendimento humanizado e equipe multidisciplinar qualificada",
      targetAudience:
        "Pacientes 25-65 anos que buscam atendimento de confian\u00e7a, acolhedor e baseado em evid\u00eancias",
      positioning:
        "Refer\u00eancia em cuidado integral, humanizado e moderno na sa\u00fade",
      colorPreferences:
        "Azul claro, verde-\u00e1gua, branco. Cores que transmitam calma, limpeza e profissionalismo",
      emotionalTerritory:
        "Acolhimento, confian\u00e7a, cuidado, serenidade, esperan\u00e7a",
      physicalTouchpoints:
        "Fachada, recep\u00e7\u00e3o, jalecos, receitu\u00e1rios, site, perfil Google, redes sociais",
      brandValues:
        "\u00c9tica, humaniza\u00e7\u00e3o, excel\u00eancia cl\u00ednica, acessibilidade",
    },
    tags: ["saude", "clinica", "medico", "bem-estar", "hospitalar"],
  },
  {
    id: "ecommerce-moda",
    name: "E-commerce Moda",
    industry: "Moda & Varejo",
    description:
      "Visual aspiracional e editorial para marcas de moda, lifestyle e e-commerce que vendem atrav\u00e9s de est\u00e9tica.",
    icon: "\ud83d\udc57",
    thumbnail:
      "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #f9a8d4 100%)",
    suggestedColors: {
      primary: ["#171717", "#be185d", "#9f1239"],
      secondary: ["#fdf2f8", "#fce7f3", "#fafafa"],
    },
    suggestedFonts: { marketing: "Cormorant Garamond", ui: "Inter" },
    creativityLevel: "creative",
    suggestedScope: "logo_identity",
    guidedBriefing: {
      whatItDoes:
        "Marca de moda com curadoria autoral, vendendo estilo de vida e not apenas pe\u00e7as",
      targetAudience:
        "Mulheres 22-40 anos, urbanas, conectadas com tend\u00eancias, que valorizam identidade e autoexpress\u00e3o",
      positioning:
        "Moda acess\u00edvel com vis\u00e3o editorial \u2014 entre o aspiracional e o alcance real",
      colorPreferences:
        "Preto, ros\u00e9, off-white. Paleta minimal com toques de feminilidade contempor\u00e2nea",
      emotionalTerritory:
        "Desejo, autoconfian\u00e7a, pertin\u00e7a, empoderamento sutil",
      physicalTouchpoints:
        "E-commerce, Instagram, embalagens, etiquetas, lookbooks digitais, stories",
      brandValues: "Autenticidade, curadoria, sustentabilidade, express\u00e3o",
    },
    tags: ["moda", "ecommerce", "fashion", "varejo", "lifestyle"],
  },
  {
    id: "escritorio-advocacia",
    name: "Escrit\u00f3rio de Advocacia",
    industry: "Jur\u00eddico",
    description:
      "Identidade s\u00f3bria e autorit\u00e1ria para escrit\u00f3rios de advocacia, consultorias jur\u00eddicas e compliance.",
    icon: "\u2696\ufe0f",
    thumbnail:
      "linear-gradient(135deg, #1e293b 0%, #334155 40%, #475569 100%)",
    suggestedColors: {
      primary: ["#1e293b", "#0f172a", "#7c2d12"],
      secondary: ["#f8fafc", "#e2e8f0", "#d4c5a9"],
    },
    suggestedFonts: { marketing: "EB Garamond", ui: "Inter" },
    creativityLevel: "conservative",
    suggestedScope: "full",
    guidedBriefing: {
      whatItDoes:
        "Escrit\u00f3rio de advocacia com atua\u00e7\u00e3o estrat\u00e9gica em \u00e1reas complexas do direito",
      targetAudience:
        "Empresas, executivos e profissionais liberais que buscam assessoria jur\u00eddica s\u00f3lida e discreta",
      positioning:
        "Refer\u00eancia em compet\u00eancia jur\u00eddica, solidez e resultados consistentes",
      colorPreferences:
        "Azul-marinho, grafite, dourado antigo, branco. Paleta que transmita autoridade e tradi\u00e7\u00e3o",
      emotionalTerritory:
        "Confian\u00e7a, autoridade, discri\u00e7\u00e3o, seguran\u00e7a jur\u00eddica",
      physicalTouchpoints:
        "Cart\u00e3o de visita, papel timbrado, site institucional, LinkedIn, assinatura de e-mail",
      brandValues:
        "\u00c9tica absoluta, excel\u00eancia t\u00e9cnica, discri\u00e7\u00e3o, resultado",
    },
    tags: ["juridico", "advocacia", "direito", "corporativo", "compliance"],
  },
  {
    id: "cafeteria-artesanal",
    name: "Cafeteria Artesanal",
    industry: "Alimentos & Bebidas",
    description:
      "Visual acolhedor e artesanal para cafeterias specialty, padarias e casas de ch\u00e1 com personalidade aut\u00eantica.",
    icon: "\u2615",
    thumbnail:
      "linear-gradient(135deg, #78350f 0%, #92400e 40%, #b45309 100%)",
    suggestedColors: {
      primary: ["#78350f", "#451a03", "#92400e"],
      secondary: ["#fef3c7", "#fde68a", "#fffbeb"],
    },
    suggestedFonts: { marketing: "Fraunces", ui: "DM Sans" },
    creativityLevel: "balanced",
    suggestedScope: "logo_identity",
    guidedBriefing: {
      whatItDoes:
        "Cafeteria de caf\u00e9s especiais com torra artesanal e ambiente que convida a desacelerar",
      targetAudience:
        "Coffee lovers 22-45 anos, urbanos, que apreciam qualidade, origem e ritual do caf\u00e9",
      positioning:
        "Caf\u00e9 como experi\u00eancia sensorial \u2014 n\u00e3o commodity, mas cultura",
      colorPreferences:
        "Marrons quentes, \u00e2mbar, creme, preto. Cores que remetem a caf\u00e9, terra e aconchego",
      emotionalTerritory:
        "Aconchego, ritual, descoberta, slow living, autenticidade",
      physicalTouchpoints:
        "Fachada, card\u00e1pio, copos, embalagens de gr\u00e3os, Instagram, sinaliza\u00e7\u00e3o interna",
      brandValues:
        "Qualidade na origem, sustentabilidade, comunidade, artesanalidade",
    },
    tags: ["cafe", "cafeteria", "artesanal", "specialty", "alimentos"],
  },
  {
    id: "academia-fitness",
    name: "Academia / Fitness",
    industry: "Fitness & Bem-estar",
    description:
      "Identidade en\u00e9rgica e motivacional para academias, studios e marcas de fitness que inspiram transforma\u00e7\u00e3o.",
    icon: "\ud83d\udcaa",
    thumbnail:
      "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%)",
    suggestedColors: {
      primary: ["#dc2626", "#171717", "#ea580c"],
      secondary: ["#fafafa", "#fef2f2", "#fff7ed"],
    },
    suggestedFonts: { marketing: "Montserrat", ui: "Inter" },
    creativityLevel: "creative",
    suggestedScope: "full",
    guidedBriefing: {
      whatItDoes:
        "Academia ou studio de fitness com m\u00e9todo pr\u00f3prio, comunidade ativa e foco em resultados reais",
      targetAudience:
        "Pessoas 20-45 anos que buscam supera\u00e7\u00e3o, comunidade e est\u00e9tica de vida ativa",
      positioning:
        "Mais que academia \u2014 um movimento de transforma\u00e7\u00e3o pessoal e coletiva",
      colorPreferences:
        "Vermelho, preto, laranja. Cores com energia alta que comuniquem a\u00e7\u00e3o e intensidade",
      emotionalTerritory:
        "Supera\u00e7\u00e3o, energia, comunidade, orgulho, transforma\u00e7\u00e3o",
      physicalTouchpoints:
        "Fachada, app de treinos, uniformes, redes sociais, material promocional, roupas",
      brandValues:
        "Disciplina, comunidade, resultados, inclus\u00e3o, energia",
    },
    tags: ["fitness", "academia", "gym", "esporte", "saude", "bem-estar"],
  },
  {
    id: "agencia-marketing",
    name: "Ag\u00eancia de Marketing",
    industry: "Marketing & Publicidade",
    description:
      "Visual criativo e estrat\u00e9gico para ag\u00eancias de marketing, branding e comunica\u00e7\u00e3o que vendem criatividade.",
    icon: "\ud83c\udfaf",
    thumbnail:
      "linear-gradient(135deg, #f43f5e 0%, #8b5cf6 50%, #06b6d4 100%)",
    suggestedColors: {
      primary: ["#171717", "#8b5cf6", "#f43f5e"],
      secondary: ["#fafafa", "#f5f3ff", "#fff1f2"],
    },
    suggestedFonts: { marketing: "Syne", ui: "Inter" },
    creativityLevel: "creative",
    suggestedScope: "full",
    guidedBriefing: {
      whatItDoes:
        "Ag\u00eancia de marketing estrat\u00e9gico que transforma marcas em refer\u00eancia de mercado",
      targetAudience:
        "Empresas em crescimento, startups e marcas que precisam de posicionamento estrat\u00e9gico e criativo",
      positioning:
        "Ag\u00eancia que entrega estrat\u00e9gia + criatividade, n\u00e3o s\u00f3 posts bonitos",
      colorPreferences:
        "Preto + cores vibrantes (violeta, rosa, cyan). Visual que demonstre capacidade criativa",
      emotionalTerritory:
        "Ousadia, intelig\u00eancia criativa, resultado, parceria estrat\u00e9gica",
      physicalTouchpoints:
        "Site portfolio, propostas comerciais, redes sociais, decks de pitch, material de evento",
      brandValues:
        "Criatividade com prop\u00f3sito, resultado mensur\u00e1vel, parceria, inova\u00e7\u00e3o",
    },
    tags: [
      "marketing",
      "agencia",
      "publicidade",
      "branding",
      "criativo",
      "digital",
    ],
  },
  {
    id: "fintech",
    name: "Fintech",
    industry: "Financeiro",
    description:
      "Identidade moderna e confi\u00e1vel para fintechs, bancos digitais e plataformas financeiras que democratizam finan\u00e7as.",
    icon: "\ud83d\udcb3",
    thumbnail:
      "linear-gradient(135deg, #059669 0%, #0d9488 50%, #06b6d4 100%)",
    suggestedColors: {
      primary: ["#059669", "#0f172a", "#0891b2"],
      secondary: ["#f0fdf4", "#ecfeff", "#f8fafc"],
    },
    suggestedFonts: { marketing: "Plus Jakarta Sans", ui: "Inter" },
    creativityLevel: "balanced",
    suggestedScope: "full",
    guidedBriefing: {
      whatItDoes:
        "Plataforma financeira digital que simplifica opera\u00e7\u00f5es complexas com tecnologia e UX impec\u00e1vel",
      targetAudience:
        "Profissionais 25-50 anos, nativos digitais, que buscam autonomia financeira com seguran\u00e7a",
      positioning:
        "Finan\u00e7as descomplicadas com tecnologia de ponta e transpar\u00eancia total",
      colorPreferences:
        "Verde-esmeralda, teal, azul-escuro. Cores que transmitam crescimento, confian\u00e7a e inova\u00e7\u00e3o",
      emotionalTerritory:
        "Confian\u00e7a, empoderamento financeiro, clareza, modernidade",
      physicalTouchpoints:
        "App mobile, dashboard web, cart\u00e3o f\u00edsico, landing pages, comunicados, onboarding",
      brandValues:
        "Transpar\u00eancia, seguran\u00e7a, acessibilidade, inova\u00e7\u00e3o respons\u00e1vel",
    },
    tags: ["fintech", "financeiro", "banco", "digital", "pagamentos"],
  },
  {
    id: "marca-pessoal",
    name: "Marca Pessoal",
    industry: "Personal Branding",
    description:
      "Identidade \u00fanica para profissionais, influenciadores e empreendedores que s\u00e3o a pr\u00f3pria marca.",
    icon: "\u2728",
    thumbnail:
      "linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)",
    suggestedColors: {
      primary: ["#171717", "#d97706", "#92400e"],
      secondary: ["#fffbeb", "#fef3c7", "#fafafa"],
    },
    suggestedFonts: { marketing: "Outfit", ui: "Inter" },
    creativityLevel: "balanced",
    suggestedScope: "logo_identity",
    guidedBriefing: {
      whatItDoes:
        "Profissional/empreendedor que comunica expertise e personalidade atrav\u00e9s de uma marca pessoal forte",
      targetAudience:
        "Audi\u00eancia digital que busca refer\u00eancia, mentoria ou conte\u00fado de valor em um nicho espec\u00edfico",
      positioning:
        "Autoridade aut\u00eantica no nicho \u2014 voz \u00fanica que gera conex\u00e3o e confian\u00e7a",
      colorPreferences:
        "Paleta que reflita a personalidade: tons quentes para energia, neutros para sofistica\u00e7\u00e3o",
      emotionalTerritory:
        "Autenticidade, conex\u00e3o, autoridade acess\u00edvel, inspira\u00e7\u00e3o",
      physicalTouchpoints:
        "Redes sociais, site pessoal, e-books, podcasts, palestras, LinkedIn",
      brandValues:
        "Autenticidade, consist\u00eancia, valor genuíno, conex\u00e3o humana",
    },
    tags: [
      "personal-branding",
      "marca-pessoal",
      "influenciador",
      "empreendedor",
      "coach",
    ],
  },
  {
    id: "cervejaria-artesanal",
    name: "Cervejaria Artesanal",
    industry: "Bebidas",
    description:
      "Visual r\u00fastico-moderno para cervejarias craft, brewpubs e marcas de bebidas com personalidade e hist\u00f3ria.",
    icon: "\ud83c\udf7a",
    thumbnail:
      "linear-gradient(135deg, #365314 0%, #3f6212 40%, #65a30d 100%)",
    suggestedColors: {
      primary: ["#365314", "#1c1917", "#92400e"],
      secondary: ["#fefce8", "#ecfccb", "#f5f5f4"],
    },
    suggestedFonts: { marketing: "Vollkorn", ui: "DM Sans" },
    creativityLevel: "creative",
    suggestedScope: "logo_identity",
    guidedBriefing: {
      whatItDoes:
        "Cervejaria artesanal com receitas autorais, ingredientes locais e taproom pr\u00f3prio",
      targetAudience:
        "Beer enthusiasts 25-50 anos que valorizam qualidade, hist\u00f3ria e experi\u00eancia da cerveja",
      positioning:
        "Cerveja como express\u00e3o cultural \u2014 cada r\u00f3tulo conta uma hist\u00f3ria, cada gole \u00e9 uma descoberta",
      colorPreferences:
        "Verde-musgo, \u00e2mbar, preto, creme. Paleta que remeta a natureza, tradi\u00e7\u00e3o e craft",
      emotionalTerritory:
        "Camaradagem, descoberta, orgulho local, autenticidade r\u00fastica",
      physicalTouchpoints:
        "R\u00f3tulos, latas, copos, taproom, eventos, redes sociais, card\u00e1pio de torneiras",
      brandValues:
        "Artesanalidade, comunidade local, qualidade sem atalhos, celebra\u00e7\u00e3o",
    },
    tags: ["cerveja", "cervejaria", "craft", "artesanal", "bebidas", "brewpub"],
  },
  {
    id: "studio-design",
    name: "Studio de Design",
    industry: "Design & Criativo",
    description:
      "Identidade minimal e conceitual para studios de design, arquitetura e espa\u00e7os criativos de alto n\u00edvel.",
    icon: "\u25b3",
    thumbnail:
      "linear-gradient(135deg, #18181b 0%, #27272a 40%, #3f3f46 100%)",
    suggestedColors: {
      primary: ["#18181b", "#f4f4f5", "#a1a1aa"],
      secondary: ["#fafafa", "#f4f4f5", "#e4e4e7"],
    },
    suggestedFonts: { marketing: "Instrument Sans", ui: "Inter" },
    creativityLevel: "creative",
    suggestedScope: "design_system",
    guidedBriefing: {
      whatItDoes:
        "Studio de design com abordagem conceitual, projetos de alta complexidade e excel\u00eancia visual",
      targetAudience:
        "Marcas e empresas que buscam design como vantagem competitiva, n\u00e3o apenas est\u00e9tica",
      positioning:
        "Design como pensamento estrat\u00e9gico \u2014 cada pixel tem prop\u00f3sito",
      colorPreferences:
        "Monocrom\u00e1tico: preto, branco, cinzas. M\u00e1xima neutralidade para o trabalho falar mais alto",
      emotionalTerritory:
        "Precis\u00e3o, minimalismo, sofistica\u00e7\u00e3o intelectual, excel\u00eancia silenciosa",
      physicalTouchpoints:
        "Portfolio web, propostas, apresenta\u00e7\u00f5es, case studies, redes sociais, ambiente f\u00edsico",
      brandValues:
        "Precis\u00e3o, conceito antes de forma, colabora\u00e7\u00e3o, excel\u00eancia silenciosa",
    },
    tags: ["design", "studio", "criativo", "arquitetura", "minimal"],
  },
];

export function getTemplateById(id: string): IndustryTemplate | undefined {
  return INDUSTRY_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByTag(tag: string): IndustryTemplate[] {
  const lower = tag.toLowerCase();
  return INDUSTRY_TEMPLATES.filter((t) =>
    t.tags.some((tt) => tt.includes(lower)),
  );
}

export function searchTemplates(query: string): IndustryTemplate[] {
  const lower = query.toLowerCase();
  return INDUSTRY_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.industry.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.tags.some((tag) => tag.includes(lower)),
  );
}
