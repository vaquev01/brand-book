import { BrandbookData, ImageProvider } from "./types";
import { buildBrandNameFidelityBlock, buildBrandNameFidelityNegativeTerms } from "./brandNameFidelity";
import { buildImageGenerationIntentSummary } from "./imageGenerationIntention";
import { extractElements, buildMotifVocabulary } from "./patternEngine";

export const ASSET_CATALOG = [
  // ─── LOGO ──────────────────────────────────────────────────────────────────
  { key: "logo_primary",       label: "Logo — Fundo Claro",           description: "Símbolo + wordmark sobre fundo branco — versão principal da identidade", aspectRatio: "1:1",  category: "logo"    },
  { key: "logo_dark_bg",       label: "Logo — Versão Invertida",      description: "Logo em negativo sobre fundo escuro — dark mode, vídeos, eventos",       aspectRatio: "1:1",  category: "logo"    },
  // ─── DIGITAL ───────────────────────────────────────────────────────────────
  { key: "brand_pattern",      label: "Padrão Gráfico Seamless",      description: "Textura tileable infinita — fundos, embalagens, papelaria, slides",       aspectRatio: "1:1",  category: "digital" },
  { key: "brand_mascot",       label: "Mascote (Personagem)",         description: "Personagem da marca — ilustração on-brand para campanhas, social e materiais", aspectRatio: "1:1",  category: "digital" },
  { key: "hero_visual",        label: "Hero do Site (Key Visual)",     description: "Imagem principal do site — traduz posicionamento e estilo visual (sem texto)", aspectRatio: "16:9", category: "digital" },
  { key: "hero_lifestyle",     label: "Foto Lifestyle (Editorial)",   description: "Público-alvo em contexto real — estética editorial, aspiracional e autêntica", aspectRatio: "16:9", category: "digital" },
  { key: "youtube_thumbnail",  label: "Thumbnail YouTube",            description: "Para o scroll — alto contraste, bold, CTR elevado em 0,5 segundos",        aspectRatio: "16:9", category: "digital" },
  { key: "presentation_bg",    label: "Fundo de Apresentação",        description: "Background para slides — on-brand, sutil, não compete com conteúdo",       aspectRatio: "16:9", category: "digital" },
  { key: "email_header",       label: "Header E-mail Marketing",      description: "Banner topo 600px — visual que aumenta abertura e CTR da newsletter",       aspectRatio: "21:9", category: "digital" },
  // ─── SOCIAL ────────────────────────────────────────────────────────────────
  { key: "instagram_carousel", label: "Carrossel Instagram — Slide 1", description: "Primeiro slide: para o scroll, gera curiosidade, força o deslize",        aspectRatio: "1:1",  category: "social"  },
  { key: "instagram_story",    label: "Story / Reels Cover",          description: "Full-bleed 9:16 — identidade instantânea, legível em 3 segundos",           aspectRatio: "9:16", category: "social"  },
  { key: "social_cover",       label: "Cover LinkedIn / YouTube",     description: "Banner de perfil — posicionamento, autoridade e estética profissional",      aspectRatio: "16:9", category: "social"  },
  { key: "social_post_square", label: "Feed Instagram / Facebook",    description: "Post quadrado — forte, marcante e reconhecível no feed",                    aspectRatio: "1:1",  category: "social"  },
  // ─── MOCKUP ────────────────────────────────────────────────────────────────
  { key: "app_mockup",         label: "App / Dashboard Mockup",       description: "Interface real do produto em dispositivo — não um template genérico",       aspectRatio: "9:16", category: "mockup"  },
  { key: "business_card",      label: "Cartão de Visitas 3D",         description: "Mockup fotorrealista frente+verso — materialidade e qualidade premium",     aspectRatio: "16:9", category: "mockup"  },
  { key: "brand_collateral",   label: "Kit Papelaria Corporativa",    description: "Flat-lay completo: cartão, letterhead, bloco, caneta, envelope, wax seal",  aspectRatio: "4:3",  category: "mockup"  },
  { key: "delivery_packaging", label: "Embalagens Delivery (Kit)",    description: "Kit de embalagem: sacola, caixa, copo, adesivos e guardanapo — on-brand",    aspectRatio: "4:3",  category: "mockup"  },
  { key: "takeaway_bag",       label: "Sacola / Bag Delivery",        description: "Sacola kraft ou bag reutilizável com logo + padrões — cenário real",         aspectRatio: "4:3",  category: "mockup"  },
  { key: "food_container",     label: "Caixa / Pote Delivery",        description: "Embalagem principal (caixa/pote) com aplicação do logo — close premium",    aspectRatio: "4:3",  category: "mockup"  },
  { key: "uniform_tshirt",     label: "Uniforme (Camiseta)",          description: "Uniforme da equipe com logo e aplicação de padrão — fotografia realista",   aspectRatio: "4:3",  category: "mockup"  },
  { key: "uniform_apron",      label: "Uniforme (Avental)",           description: "Avental bordado/serigrafado com marca — look premium e coerente",           aspectRatio: "4:3",  category: "mockup"  },
  { key: "materials_board",    label: "Materiais & Texturas (Board)", description: "Moodboard de materiais (papel, tecido, metal, textura) com paleta da marca", aspectRatio: "1:1",  category: "mockup"  },
  // ─── PRINT / OOH ──────────────────────────────────────────────────────────
  { key: "outdoor_billboard",  label: "Outdoor Urbano / OOH",         description: "Billboard em contexto urbano real — impacto máximo em 3 segundos",          aspectRatio: "16:9", category: "print"   },
  { key: "poster_print",      label: "Pôster / Cartaz",              description: "Cartaz A3/A2 para vitrine, mural ou evento — visual impactante e direto",    aspectRatio: "9:16", category: "print"   },
  { key: "flyer_leaflet",     label: "Flyer / Panfleto",             description: "Material de distribuição A5/DL — frente e verso com hierarquia clara",       aspectRatio: "4:3",  category: "print"   },
  { key: "brochure_catalog",  label: "Folder / Catálogo",            description: "Folder tri-fold ou catálogo de produto — editorial premium",                 aspectRatio: "4:3",  category: "print"   },
  { key: "bus_shelter_ad",    label: "Abrigo de Ônibus (Mobiliário)", description: "Peça para abrigo de ônibus/metrô — formato retrato, alto impacto urbano",   aspectRatio: "9:16", category: "print"   },
  { key: "banner_rollup",     label: "Banner Roll-up / X-Banner",    description: "Banner vertical para eventos, recepção, PDV — portátil e marcante",         aspectRatio: "9:16", category: "print"   },
  // ─── RETAIL / PDV ────────────────────────────────────────────────────────
  { key: "storefront_facade", label: "Fachada da Loja",              description: "Fachada realista com letreiro, vitrine e identidade aplicada ao espaço",     aspectRatio: "16:9", category: "retail"  },
  { key: "window_display",    label: "Vitrine",                      description: "Composição de vitrine com produtos e identidade — convida a entrar",         aspectRatio: "16:9", category: "retail"  },
  { key: "neon_sign",         label: "Letreiro Neon / Luminoso",     description: "Letreiro luminoso com logo — noturno, atmosférico, marcante",               aspectRatio: "16:9", category: "retail"  },
  { key: "menu_board",        label: "Quadro de Menu / Cardápio",    description: "Quadro de parede ou digital com menu — tipografia clara e identidade",       aspectRatio: "4:3",  category: "retail"  },
  { key: "trade_show_booth",  label: "Estande de Feira / Expo",      description: "Stand de exposição completo com painéis, balcão e sinalização de marca",     aspectRatio: "16:9", category: "retail"  },
  { key: "digital_signage",   label: "Sinalização Digital (Totem)",   description: "Totem ou painel digital interativo em PDV ou recepção",                     aspectRatio: "9:16", category: "retail"  },
  // ─── VEHICLE ─────────────────────────────────────────────────────────────
  { key: "vehicle_wrap",      label: "Envelopamento Veículo",        description: "Van, carro ou caminhão envelopado com identidade — frota na rua",           aspectRatio: "16:9", category: "vehicle" },
  { key: "food_truck",        label: "Food Truck",                   description: "Food truck completo com identidade, menu lateral e janela de atendimento",   aspectRatio: "16:9", category: "vehicle" },
  // ─── PACKAGING ───────────────────────────────────────────────────────────
  { key: "beverage_bottle",   label: "Garrafa (Rótulo)",             description: "Garrafa com rótulo premium — cerveja, suco, água, vinho, destilado",        aspectRatio: "4:3",  category: "packaging" },
  { key: "beverage_can",      label: "Lata de Bebida",               description: "Lata 350ml com arte completa — shelf-ready, impactante na gôndola",         aspectRatio: "4:3",  category: "packaging" },
  { key: "cup_sleeve",        label: "Copo + Luva (Sleeve)",         description: "Copo térmico com sleeve de papel e tampa — café, chá, smoothie",            aspectRatio: "4:3",  category: "packaging" },
  { key: "food_label",        label: "Rótulo de Produto",            description: "Rótulo adesivo ou wrap para pote, frasco ou embalagem — shelf appeal",      aspectRatio: "4:3",  category: "packaging" },
  { key: "product_box",       label: "Caixa de Produto",             description: "Caixa estrutural com arte e informações — unboxing premium",                aspectRatio: "4:3",  category: "packaging" },
  { key: "shopping_bag",      label: "Sacola de Compras",            description: "Sacola de loja (papel/plástico/tecido) com logo e padrão — na rua",         aspectRatio: "4:3",  category: "packaging" },
  { key: "gift_box",          label: "Caixa Presente / Kit",         description: "Embalagem especial para presente ou kit — experiência de unboxing",          aspectRatio: "4:3",  category: "packaging" },
  { key: "hang_tag",          label: "Tag de Produto",               description: "Etiqueta pendurada em produto — papel premium, detalhes de marca",          aspectRatio: "1:1",  category: "packaging" },
  { key: "napkin_placemat",   label: "Guardanapo / Jogo Americano",  description: "Material de mesa com identidade sutil — guardanapo, jogo americano, toalha", aspectRatio: "1:1",  category: "packaging" },
  { key: "bowl_pot",          label: "Pote / Bowl / Tigela",         description: "Pote descartável ou bowl com tampa — açaí, sorvete, salada, poke, iogurte",    aspectRatio: "4:3",  category: "packaging" },
  { key: "tray_liner",        label: "Bandeja / Forração",           description: "Bandeja de servir ou papel de forração com identidade da marca",               aspectRatio: "4:3",  category: "packaging" },
  { key: "wrapper_sleeve",    label: "Wrapper / Invólucro",          description: "Papel de embrulho, wrapper de sanduíche, sleeve de produto — branded",         aspectRatio: "4:3",  category: "packaging" },
  { key: "coaster",           label: "Porta-Copos / Bolacha",        description: "Porta-copos de papelão ou cortiça com identidade — bar, restaurante, café",    aspectRatio: "1:1",  category: "packaging" },
  { key: "menu_printed",      label: "Cardápio / Menu Impresso",     description: "Cardápio impresso premium — pasta, lâmina ou booklet com identidade visual",   aspectRatio: "4:3",  category: "packaging" },
  { key: "price_tag_shelf",   label: "Etiqueta de Preço / Wobbler",  description: "Etiqueta de gôndola, wobbler ou shelf talker — PDV com identidade",            aspectRatio: "4:3",  category: "retail"  },
  { key: "tent_card",         label: "Display de Mesa / Tent Card",  description: "Tent card triangular para mesa — promoção, QR code ou informação",             aspectRatio: "4:3",  category: "retail"  },
  { key: "standee_display",   label: "Totem / Standee / Display",    description: "Display de chão recortado, standee ou totem impresso — PDV de alto impacto",   aspectRatio: "9:16", category: "retail"  },
  // ─── MERCH / WEARABLE ───────────────────────────────────────────────────
  { key: "polo_uniform",      label: "Polo Uniforme",                description: "Polo com bordado ou silk — look corporativo premium e coerente",             aspectRatio: "4:3",  category: "merch"   },
  { key: "cap_hat",           label: "Boné / Chapéu",               description: "Boné estruturado com logo bordado — merchandising ou uniforme",              aspectRatio: "4:3",  category: "merch"   },
  { key: "tote_bag",          label: "Ecobag / Tote Bag",           description: "Sacola reutilizável de algodão com arte da marca — brinde ou venda",         aspectRatio: "4:3",  category: "merch"   },
  { key: "hoodie",            label: "Moletom / Hoodie",            description: "Moletom com aplicação de marca — merchandising premium",                     aspectRatio: "4:3",  category: "merch"   },
  { key: "jacket_coat",       label: "Jaqueta / Casaco",            description: "Jaqueta ou casaco com bordado ou patch de marca — outerwear branded",           aspectRatio: "4:3",  category: "merch"   },
  { key: "vest_colete",       label: "Colete",                      description: "Colete corporativo ou operacional com identidade visual",                      aspectRatio: "4:3",  category: "merch"   },
  { key: "suit_formal",       label: "Terno / Roupa Formal",        description: "Terno ou roupa formal com detalhes de marca — forro, botão, etiqueta",         aspectRatio: "4:3",  category: "merch"   },
  { key: "sneakers_shoes",    label: "Tênis / Calçado",             description: "Tênis ou sapato personalizado com cores e detalhes da marca",                  aspectRatio: "4:3",  category: "merch"   },
  { key: "sunglasses",        label: "Óculos de Sol",               description: "Óculos de sol com identidade — haste personalizada, cores da marca",           aspectRatio: "4:3",  category: "merch"   },
  { key: "phone_case",        label: "Capa de Celular",             description: "Case de celular com arte da marca — acessório premium",                        aspectRatio: "9:16", category: "merch"   },
  { key: "branded_purse",     label: "Bolsa de Marca",              description: "Bolsa, necessaire ou clutch com identidade visual — fashion branded",           aspectRatio: "4:3",  category: "merch"   },
  { key: "pen_branded",       label: "Caneta Personalizada",        description: "Caneta premium com logo gravado ou impresso — brinde corporativo",              aspectRatio: "4:3",  category: "merch"   },
  { key: "notebook_planner",  label: "Caderno / Agenda",            description: "Caderno ou agenda com capa e miolo branded — papelaria premium",                aspectRatio: "4:3",  category: "merch"   },
  { key: "keychain",          label: "Chaveiro",                    description: "Chaveiro de metal, couro ou acrílico com logo — brinde compacto",               aspectRatio: "1:1",  category: "merch"   },
  { key: "umbrella",          label: "Guarda-Chuva",                description: "Guarda-chuva com padrão e logo da marca — brinde premium grande",               aspectRatio: "4:3",  category: "merch"   },
  { key: "water_bottle",      label: "Squeeze / Garrafa Térmica",   description: "Garrafa reutilizável com identidade visual — wellness branded",                 aspectRatio: "4:3",  category: "merch"   },
  { key: "mouse_pad",         label: "Mouse Pad",                   description: "Mouse pad com arte da marca — desk branding para equipe ou brinde",             aspectRatio: "4:3",  category: "merch"   },
  { key: "lanyard_badge",     label: "Crachá + Cordão",             description: "Crachá com foto e cordão branded — identidade corporativa",                     aspectRatio: "4:3",  category: "merch"   },
  { key: "pin_button",        label: "Pin / Botton",                description: "Pin, botton ou broche com logo ou arte da marca — merchandising compacto",       aspectRatio: "1:1",  category: "merch"   },
  { key: "pillow_cushion",    label: "Almofada",                    description: "Almofada decorativa com padrão ou logo — decor branded",                        aspectRatio: "1:1",  category: "merch"   },
  { key: "towel_branded",     label: "Toalha",                      description: "Toalha de praia, banho ou mão com identidade visual — lifestyle branded",       aspectRatio: "4:3",  category: "merch"   },
  { key: "skateboard_deck",   label: "Skate / Prancha",             description: "Shape de skate ou prancha com arte da marca — street/surf culture",              aspectRatio: "9:16", category: "merch"   },
  // ─── FURNITURE / AMBIENTE ──────────────────────────────────────────────
  { key: "chair_furniture",   label: "Cadeira / Mesa Branded",      description: "Móvel (cadeira, mesa, banco) com identidade — restaurante, café, coworking",    aspectRatio: "4:3",  category: "retail"  },
  { key: "fridge_wrap",       label: "Geladeira Envelopada",        description: "Geladeira ou freezer com envelopamento de marca — PDV, bar, conveniência",       aspectRatio: "4:3",  category: "retail"  },
  { key: "flag_banner_fabric",label: "Bandeira / Estandarte",       description: "Bandeira de tecido, wind banner ou galhardete com logo — evento, loja, sede",   aspectRatio: "9:16", category: "retail"  },
  { key: "doormat",           label: "Capacho",                     description: "Capacho com logo ou mensagem de marca — entrada de loja ou escritório",          aspectRatio: "4:3",  category: "retail"  },
  { key: "wall_clock",        label: "Relógio de Parede",           description: "Relógio de parede com identidade visual — escritório, loja, restaurante",        aspectRatio: "1:1",  category: "retail"  },
  // ─── PACKAGING FOOD ──────────────────────────────────────────────────
  { key: "grease_proof_paper",label: "Papel Anti-Gordura / Manteiga", description: "Papel de forração anti-gordura com padrão da marca — food service",          aspectRatio: "1:1",  category: "packaging" },
  { key: "napkin_holder",     label: "Guardanapeira / Porta-Guardanapo", description: "Porta-guardanapo ou dispensador com identidade — mesa ou balcão",          aspectRatio: "4:3",  category: "packaging" },
  { key: "cup_mug",           label: "Caneca / Xícara",             description: "Caneca de cerâmica ou xícara com logo e arte — café, escritório, brinde",        aspectRatio: "4:3",  category: "packaging" },
  { key: "pizza_box",         label: "Caixa de Pizza",              description: "Caixa de pizza com arte da marca — clássico food delivery",                      aspectRatio: "4:3",  category: "packaging" },
  { key: "candy_wrapper",     label: "Embalagem de Doce / Bala",    description: "Wrapper de chocolate, bala ou bombom com arte — brinde ou produto",              aspectRatio: "4:3",  category: "packaging" },
  { key: "packaging_tape",    label: "Fita Adesiva Branded",        description: "Fita adesiva de embalagem com padrão ou logo — detalhe de envio",                aspectRatio: "21:9", category: "packaging" },
  { key: "matchbox",          label: "Caixa de Fósforo",            description: "Caixinha de fósforo com arte da marca — bar, restaurante, hotel",                aspectRatio: "4:3",  category: "packaging" },
  // ─── SOCIAL / DIGITAL TEMPLATES ───────────────────────────────────────
  { key: "weekly_agenda_post",label: "Post Agenda da Semana",       description: "Post Instagram com agenda/programação semanal — grid organizado, on-brand",      aspectRatio: "1:1",  category: "social"  },
  { key: "credit_debit_card", label: "Cartão de Crédito / Débito",  description: "Cartão de crédito ou débito co-branded com identidade visual",                   aspectRatio: "16:9", category: "stationery" },
  { key: "ticket_event",      label: "Ingresso / Ticket",           description: "Ingresso de evento, voucher ou ticket com identidade premium",                   aspectRatio: "16:9", category: "stationery" },
  { key: "wristband",         label: "Pulseira de Evento",          description: "Pulseira de evento (tyvek, tecido, silicone) com identidade da marca",           aspectRatio: "21:9", category: "merch"   },
  // ─── STATIONERY EXTENDED ─────────────────────────────────────────────────
  { key: "gift_card",         label: "Vale Presente",               description: "Cartão presente com design premium — físico ou digital",                     aspectRatio: "16:9", category: "stationery" },
  { key: "loyalty_card",      label: "Cartão Fidelidade",           description: "Cartão fidelidade ou membro VIP com identidade forte",                       aspectRatio: "16:9", category: "stationery" },
  { key: "sticker_sheet",     label: "Cartela de Adesivos",         description: "Conjunto de adesivos com ícones, logo e elementos da marca",                 aspectRatio: "1:1",  category: "stationery" },
  { key: "wax_seal_stamp",    label: "Selo / Carimbo / Wax Seal",   description: "Selo de cera, carimbo ou stamp com símbolo da marca — toque artesanal",      aspectRatio: "1:1",  category: "stationery" },
  { key: "invoice_receipt",   label: "Nota Fiscal / Recibo",        description: "Documento fiscal ou recibo com identidade aplicada — profissionalismo",       aspectRatio: "4:3",  category: "stationery" },
  { key: "envelope_letterhead", label: "Envelope + Papel Timbrado", description: "Envelope e papel timbrado com identidade — correspondência premium",          aspectRatio: "4:3",  category: "stationery" },
  // ─── DIGITAL EXTENDED ────────────────────────────────────────────────────
  { key: "landing_page",      label: "Landing Page",                description: "Mockup de landing page completa em browser — conversão e identidade",         aspectRatio: "9:16", category: "digital" },
  { key: "podcast_cover",     label: "Capa de Podcast",             description: "Capa quadrada para podcast — marcante no feed de áudio",                     aspectRatio: "1:1",  category: "digital" },
  { key: "app_icon",          label: "Ícone do App",                description: "Ícone de app com símbolo da marca — reconhecível em 64px",                   aspectRatio: "1:1",  category: "digital" },
 ] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "21:9";
  category: "logo" | "digital" | "social" | "print" | "mockup" | "retail" | "vehicle" | "packaging" | "merch" | "stationery";
}>;

export type AssetKey = (typeof ASSET_CATALOG)[number]["key"];

/** Recommended provider per asset type for best results */
export const PROVIDER_RECOMMENDATIONS: Partial<Record<AssetKey, { best: ImageProvider; why: string; avoid?: ImageProvider; avoidWhy?: string }>> = {
  // Logo: Ideogram is best for text + symbol combination
  logo_primary: { best: "ideogram", why: "Melhor para texto legível + símbolo", avoid: "stability", avoidWhy: "Texto ilegível" },
  logo_dark_bg: { best: "ideogram", why: "Melhor para texto legível + símbolo", avoid: "stability", avoidWhy: "Texto ilegível" },
  // Patterns: Stability/Recraft for clean tileable patterns
  brand_pattern: { best: "recraft", why: "Vetorial limpo, tileable", avoid: "dalle3", avoidWhy: "Muito fotorrealista" },
  // Mascot: DALL-E 3 for character design
  brand_mascot: { best: "dalle3", why: "Melhor para personagens e ilustração" },
  // Hero/Lifestyle: Imagen for photorealistic scenes
  hero_visual: { best: "imagen", why: "Fotorrealismo superior" },
  hero_lifestyle: { best: "imagen", why: "Pessoas e cenas naturais" },
  // Mockups: DALL-E 3 for product mockups
  business_card: { best: "dalle3", why: "Mockups fotorrealistas de alta qualidade" },
  brand_collateral: { best: "dalle3", why: "Composições flat-lay realistas" },
  delivery_packaging: { best: "dalle3", why: "Embalagens em contexto real" },
  // Social: Ideogram for text-heavy posts
  social_post_square: { best: "ideogram", why: "Texto legível em posts" },
  instagram_story: { best: "ideogram", why: "Texto legível em stories" },
  // Print: Imagen for realistic outdoor scenes
  outdoor_billboard: { best: "imagen", why: "Cenários urbanos fotorrealistas" },
  storefront_facade: { best: "imagen", why: "Arquitetura fotorrealista" },
  // App: Recraft for UI design
  app_mockup: { best: "recraft", why: "Design limpo de interface" },
  app_icon: { best: "recraft", why: "Ícones vetoriais limpos" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// BRAND DNA SEED — The genetic code that connects ALL visual assets
// This is computed once and injected into EVERY image generation prompt.
// The logo is the SEED; every asset is a GROWTH from that seed.
// ═══════════════════════════════════════════════════════════════════════════════

export function buildBrandDNASeed(data: BrandbookData): string {
  const ctx = extractBrandContext(data);
  const symbolConcept = data.logo.symbolConcept
    ?? ((data.logo as unknown as Record<string, Record<string, string>>).semioticAnalysis?.denotation) as string | undefined
    ?? (data.logo.symbol && !data.logo.symbol.startsWith("http") ? data.logo.symbol : null)
    ?? `abstract mark encoding: ${ctx.purpose}`;

  const primaryColors = data.colors.primary.slice(0, 3).map(c => `${c.name} ${c.hex}`).join(", ");
  const accentColor = data.colors.secondary[0] ? `${data.colors.secondary[0].name} ${data.colors.secondary[0].hex}` : "";

  return [
    `BRAND DNA SEED (this is the genetic code — ALL visuals derive from this):`,
    `Brand: "${data.brandName}" · ${data.industry}`,
    `Logo Seed (the origin of all visual decisions): ${symbolConcept}`,
    `Palette: ${primaryColors}${accentColor ? ` · accent: ${accentColor}` : ""}`,
    `Typography: ${ctx.displayFont} (display) + ${ctx.bodyFont} (body)`,
    `Personality: ${ctx.personality}`,
    `Archetype: ${ctx.archetypalEnergy.split(" — ")[0]}`,
    `Purpose: ${ctx.purpose}`,
    ctx.tagline ? `Voice: ${ctx.tagline}` : "",
    `COHERENCE RULE: Every visual asset must feel genetically connected to the logo seed. The symbol's geometry, rhythm, and energy must echo across patterns, mockups, photography, and applications. A viewer should sense the same brand DNA in every piece.`,
  ].filter(Boolean).join("\n");
}

function industryVisualLanguage(industry: string): string {
  const i = industry.toLowerCase();
  if (/saas|software|tech|cloud|ai|data|platform|digital|startup|api|b2b/.test(i))
    return "Photography: glowing data nodes, abstract UI panels floating in depth, luminous gradient fields — ref. Linear/Stripe brand photography. Illustration: geometric circuit-like topology, isometric systems. Materiality: glass surfaces, frosted acrylic, backlit screens, holographic foil. Cultural ref: Dieter Rams precision meets Silicon Valley optimism.";
  if (/restauran|food|gastro|caf|coffee|bar|sushi|pizza|chef|culin|bistr|boteco|empório/.test(i))
    return "Photography: overhead plating (David Loftus style), macro ingredient textures, steam wisps, candlelit amber warmth 2700K, shallow DOF on garnish. Illustration: botanical engravings, hand-drawn menu art, woodcut prints. Materiality: kraft paper, ceramic, cast iron, reclaimed wood, linen napkin textures. Cultural ref: Bon Appétit editorial meets local terroir storytelling.";
  if (/fintech|financ|bank|invest|crédit|crypto|insurance|wealth|asset/.test(i))
    return "Photography: geometric precision, golden ratio compositions, architectural facades, metallic gradient fields (gold/platinum). Illustration: abstract data flow lines, topographic contours. Materiality: brushed metal, embossed paper, wax seal, heavy cotton stock. Cultural ref: Swiss Style grid discipline meets Bloomberg Terminal authority.";
  if (/health|saúde|medic|clinic|pharma|wellness|biotech|hospital/.test(i))
    return "Photography: clean whites and calming blues, human touch moments, scientific precision, soft clinical lighting 5000K. Illustration: cell/molecular forms, anatomical line art, organic flow diagrams. Materiality: surgical steel, white ceramic, frosted glass, cotton gauze. Cultural ref: Apple Health purity meets Mayo Clinic trust.";
  if (/fitness|gym|sport|treino|esport|atleta|performanc/.test(i))
    return "Photography: kinetic motion blur, muscle definition close-ups, outdoor dramatic light, explosive energy — ref. Nike campaign photography. Illustration: dynamic vector forms, speed lines, athletic silhouettes. Materiality: rubber, mesh fabric, carbon fiber, anodized aluminum. Cultural ref: Wieden+Kennedy intensity meets Olympic graphic language.";
  if (/fashion|moda|luxury|luxo|jewel|jóia|accessory|beauty|cosmetic|skin/.test(i))
    return "Photography: editorial negative space (Irving Penn approach), fabric texture close-ups, product on skin/body, dramatic shadow play, Rembrandt side lighting. Illustration: fashion croquis, minimal line drawings. Materiality: velvet, silk, marble, rose gold, hand-stitched leather. Cultural ref: Vogue Italia editorial meets Celine minimalism.";
  if (/education|educação|cours|learn|school|universit|ensino/.test(i))
    return "Photography: light streaming through windows, collaborative group moments, candid learning moments, bright optimistic environments 5600K. Illustration: open knowledge metaphors, growth diagrams, playful infographic elements. Materiality: chalk, worn wood, notebook paper, colored pencils. Cultural ref: TED visual identity meets Montessori warmth.";
  if (/construc|constru|architect|real estate|imobil|engenharia/.test(i))
    return "Photography: architectural perspective lines, material textures (exposed concrete, steel I-beams, glass curtain walls), morning golden light on facades — ref. Iwan Baan architectural photography. Illustration: blueprint line drawings, section cuts, axonometric projections. Materiality: concrete, Corten steel, terrazzo, travertine marble. Cultural ref: Zaha Hadid Studio meets Dezeen editorial.";
  if (/ecommerc|retail|loja|shop|market|varejo/.test(i))
    return "Photography: product hero shots on clean surfaces, lifestyle-in-context, packaging close-ups, aspirational home environments — ref. Kinfolk/Cereal magazine style. Illustration: product line drawings, packaging diagrams. Materiality: recycled cardboard, tissue paper, cotton bag, washi tape, embossed stickers. Cultural ref: Glossier unboxing experience meets Muji simplicity.";
  if (/creat|design|agência|agency|media|publicidad|estúdio|studio/.test(i))
    return "Photography: bold typographic compositions, Pantone swatches, creative process artifacts (sketches, screens, mockups), vibrant workspace — ref. Sagmeister & Walsh. Illustration: hand-lettering, experimental layouts. Materiality: Fedrigoni paper, letterpress, silkscreen ink, neon signage. Cultural ref: Pentagram case studies meets It's Nice That editorial.";
  if (/logistic|transport|frete|supply chain|entregas/.test(i))
    return "Photography: movement trails, infrastructure at scale, precise mechanical systems, aerial cargo perspectives. Illustration: network maps, route diagrams, isometric warehouse views. Materiality: corrugated cardboard, aluminum truck panels, reflective safety tape. Cultural ref: DHL brand system precision meets FedEx operational clarity.";
  if (/pet|animal|vet|cachorro|gato|cat|dog/.test(i))
    return "Photography: authentic pet portraits (not studio stock), playful candid moments, soft natural light, shallow DOF on fur texture. Illustration: character-driven pet illustrations, paw prints, playful shapes. Materiality: natural wool, cork, denim, sustainable rubber. Cultural ref: BarkBox playfulness meets Patagonia warmth.";
  if (/auto|car|motor|veículo|concessionária|oficina|moto/.test(i))
    return "Photography: dramatic rim lighting on bodywork, reflections on polished paint, motion blur on wheels, cinematic highway perspectives. Illustration: technical line art, cross-sections, blueprint renderings. Materiality: brushed aluminum, leather, carbon fiber, rubber tire texture. Cultural ref: Porsche visual precision meets Top Gear cinematography.";
  if (/travel|viagem|turismo|hotel|hostel|resort|airbnb/.test(i))
    return "Photography: golden hour landscapes, aerial drone perspectives, intimate cultural moments, authentic local scenes — ref. National Geographic Traveler. Illustration: hand-drawn maps, travel journal sketches, vintage postal stamps. Materiality: leather journal, aged paper, linen, natural stone. Cultural ref: Airbnb belonging meets Condé Nast Traveler aspiration.";
  if (/music|música|som|audio|podcast|rádio|dj|festival/.test(i))
    return "Photography: dramatic stage lighting, analog equipment close-ups, audience energy, sound wave visualizations. Illustration: psychedelic patterns, vinyl cover art, typographic experiments. Materiality: vinyl grooves, speaker mesh, guitar strings, neon tubes. Cultural ref: Spotify Wrapped meets Pitchfork editorial meets album cover art history.";
  if (/imobil|property|house|apartment|apart|condomin|loteamento/.test(i))
    return "Photography: architectural interiors with natural light streaming, lifestyle shots in aspirational living spaces, aerial perspectives of neighborhoods. Illustration: floor plans, elevation drawings, neighborhood maps. Materiality: marble, hardwood flooring, brushed brass, handmade tiles. Cultural ref: Architectural Digest meets WeWork spatial branding.";
  if (/agro|farm|agricultura|orgânic|natural|bio|horta|café|cacau/.test(i))
    return "Photography: sunrise over fields, macro textures of soil/seeds/leaves, farmer's hands at work, harvest abundance — ref. documentary agricultural photography. Illustration: botanical specimens, vintage seed packet art, woodcut rural scenes. Materiality: burlap, raw cotton, terracotta, dried botanicals, hand-stamped kraft. Cultural ref: Whole Foods Market storytelling meets terroir wine label craft.";
  if (/gaming|game|esport|jogo|console|streamer/.test(i))
    return "Photography: neon-lit setups, RGB keyboard close-ups, team competition moments, immersive dark environments. Illustration: pixel art meets vector, character splash art, HUD-inspired graphics. Materiality: matte black plastic, RGB LED strips, holographic stickers, metallic ink on dark stock. Cultural ref: Riot Games brand system meets Razer visual intensity.";
  if (/legal|law|advocacia|jurídic|escritório|direito/.test(i))
    return "Photography: architectural library interiors, leather-bound volumes, judicial balance symbolism, mahogany and marble textures. Illustration: serif-heavy monograms, classical engravings, heraldic elements. Materiality: heavy linen paper, gold foil stamping, leather emboss, wax seal. Cultural ref: British barristers' chambers meets Swiss private banking sobriety.";
  if (/infantil|child|kid|baby|bebê|brinquedo|toy|escola infantil/.test(i))
    return "Photography: bright high-key environments, playful compositions with saturated primary colors, authentic child laughter moments. Illustration: rounded friendly shapes, hand-drawn characters, crayon/watercolor textures. Materiality: soft-touch surfaces, rounded wooden toys, cotton fabric, non-toxic paint. Cultural ref: LEGO playfulness meets Montessori simplicity meets Studio Ghibli warmth.";
  return "Photography: purposeful negative space, controlled natural light, balanced compositions. Illustration: clean geometric abstraction, brand color field compositions. Materiality: premium paper stocks, subtle embossing, matte finishes. Cultural ref: Pentagram design thinking meets Wallpaper* magazine editorial quality.";
}

const ARCHETYPE_VISUALS: Record<string, string> = {
  Hero: "triumphant intensity, upward momentum, golden dramatic light, monumental scale, victory gestures, Olympian proportions",
  Creator: "creative tension, unexpected camera angles, vivid palette contrasts, workshop-to-masterpiece energy, visible process marks, raw-material-to-art transformation",
  Sage: "contemplative clarity, structured geometry, cool intellectual light 5600K, library-to-cosmos depth, information-as-beauty, data-visualization aesthetics",
  Explorer: "vast horizons, atmospheric perspective, golden-hour adventure light, open landscapes, weather textures, journey-not-destination framing",
  Outlaw: "raw contrast, gritty textures, dramatic chiaroscuro, urban edge, punk energy, defiant angles, torn-and-remade surfaces",
  Magician: "ethereal glow, impossible perspectives, aurora-like color shifts, dreamlike depth of field, transformation mid-process, before-and-after implied in one frame",
  Caregiver: "warm embrace lighting 2800K, soft focus edges, intimate proximity, cocooning composition, hands-touching-hands, shelter metaphors",
  Lover: "intimate bokeh, velvet textures, warm skin-tone lighting, sensual close-ups, editorial elegance, magnetic tension between elements",
  Jester: "vibrant saturated pops, dynamic diagonal compositions, playful scale contrasts, comic energy, surprise elements, intentional rule-breaking",
  Everyman: "authentic natural light, documentary framing, relatable environments, honest imperfection, eye-level camera, unstaged moments",
  Ruler: "regal symmetry, deep contrast, metallic accents (gold/platinum), architectural grandeur, velvet-dark backgrounds, monumental scale with human absence",
  Innocent: "bright high-key lighting, clean whites, airy open spaces, optimistic upward compositions, morning-light warmth, childlike wonder perspective",
};

function deriveArchetype(personality: string[], toneOfVoice: string, explicitArchetype?: string): string {
  if (explicitArchetype) {
    const explicit = explicitArchetype.trim();
    for (const [name, visual] of Object.entries(ARCHETYPE_VISUALS)) {
      if (explicit.toLowerCase().includes(name.toLowerCase())) {
        return `${name} — ${visual}`;
      }
    }
    return explicit.includes(" — ") ? explicit : `${explicit.split(/\s*[-—]\s*/)[0]} — ${ARCHETYPE_VISUALS.Creator}`;
  }

  const all = [...personality, toneOfVoice].join(" ").toLowerCase();
  const archetypes: [RegExp, string][] = [
    [/hero|coraj|brav|forte|power|champion|lider|conquer|vitór|guerreir/, "Hero"],
    [/creat|innov|imagin|art|vision|origin|invent/, "Creator"],
    [/sage|sáb|wisdom|knowledge|expert|mentor|teach|intelli|analy/, "Sage"],
    [/explor|aventur|discover|freedom|curios|journey|pioneer|desbravar/, "Explorer"],
    [/rebel|outlaw|revolution|quebr|desafi|provoc|underground/, "Outlaw"],
    [/magic|encant|transform|mistic|wonder|surpr|miraculou|fantast/, "Magician"],
    [/cuidad|care|nurtur|protect|comfort|segur|acolh|empath|warm/, "Caregiver"],
    [/amant|lover|passion|seduc|beaut|sensual|desej|intim|elegant/, "Lover"],
    [/jest|humor|fun|playful|divert|alegr|leve|brincalh|irrever|entusias/, "Jester"],
    [/everyma|commu|perten|todos|simpl|autentic|real|honest|genuin/, "Everyman"],
    [/ruler|govern|control|premium|luxo|luxury|prestig|author|elite/, "Ruler"],
    [/innocen|pure|otimis|hope|fresh|novo|clean|simple|joy/, "Innocent"],
  ];

  const scores: Record<string, number> = {};
  for (const [re, name] of archetypes) {
    const matches = all.match(new RegExp(re.source, "gi"));
    if (matches) scores[name] = (scores[name] ?? 0) + matches.length;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    const primary = sorted[0][0];
    const visual = ARCHETYPE_VISUALS[primary] ?? ARCHETYPE_VISUALS.Creator;
    return `${primary} — ${visual}`;
  }
  return `Creator — ${ARCHETYPE_VISUALS.Creator}`;
}

function deriveEmotionalCore(manifesto: string, purpose: string, moodWords: string, archetype: string, brandPromise?: string): string {
  const archetypeName = archetype.split(" — ")[0] ?? "Creator";
  const emotionMap: Record<string, string> = {
    Hero: "the viewer must feel empowered — a surge of confidence, the sense that greatness is within reach. Every composition should lift the gaze upward.",
    Creator: "the viewer must feel inspired — alive with creative possibility, the spark of invention. Every image should feel like an idea about to happen.",
    Sage: "the viewer must feel illuminated — intellectually stimulated, trusting in deep expertise. Every image should radiate quiet authority and clarity.",
    Explorer: "the viewer must feel free — hungry for discovery, called by the unknown. Every image should expand horizons and suggest journeys.",
    Outlaw: "the viewer must feel defiant — bold, electric, part of something that challenges the status quo. Every image should feel like a manifesto.",
    Magician: "the viewer must feel wonder — the impossible becoming real, transformation mid-process. Every image should suspend disbelief.",
    Caregiver: "the viewer must feel safe — nurtured, deeply understood, a warm exhale of relief. Every image should feel like arriving home.",
    Lover: "the viewer must feel captivated — magnetically drawn in, emotionally connected. Every image should create intimate tension.",
    Jester: "the viewer must feel joy — permission to play, lightness, an irresistible smile. Every image should break rules with a wink.",
    Everyman: "the viewer must feel belonging — honest connection, 'this is for me'. Every image should feel real, relatable, unstaged.",
    Ruler: "the viewer must feel prestige — aspiration, exclusive access, the weight of quality. Every image should command reverence.",
    Innocent: "the viewer must feel hope — freshness, optimistic simplicity, a bright new beginning. Every image should feel like morning light.",
  };
  const base = emotionMap[archetypeName] ?? emotionMap.Creator!;
  const soulParts: string[] = [];
  if (manifesto) soulParts.push(manifesto.slice(0, 500).replace(/\s+\S*$/, ""));
  if (purpose && purpose !== manifesto) soulParts.push(purpose.slice(0, 200));
  if (brandPromise) soulParts.push(`Promise: ${brandPromise.slice(0, 150)}`);
  const soulStr = soulParts.length > 0
    ? ` Brand soul distilled: "${soulParts.join(" — ")}". Mood essence: ${moodWords || "premium, intentional"}.`
    : moodWords ? ` Mood essence: ${moodWords}.` : "";
  return `${base}${soulStr}`;
}

function deriveDesignPhilosophy(ctx: {
  compositionPhilosophy: string;
  illustrationStyle: string;
  photoStyle: string;
  visualStyle: string;
  archetypalEnergy: string;
}): string {
  const parts: string[] = [];
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const philosophyMap: Record<string, string> = {
    Hero: "Bold, ascending, monumental. Negative space is earned, not default. Every element serves the upward narrative.",
    Creator: "Intentionally imperfect, process-visible. The hand of the maker should be felt. Tension between chaos and order.",
    Sage: "Structured, grid-aligned, information-beautiful. Clarity is the aesthetic. Swiss Style rigor with human warmth.",
    Explorer: "Expansive, breathing, horizon-seeking. Let the composition wander with purpose. Natural light always.",
    Outlaw: "Asymmetric, clashing, deliberately uncomfortable. Break one rule per composition — intentionally.",
    Magician: "Layered, dreamlike, depth-ambiguous. Foreground and background should blur. Light should feel impossible.",
    Caregiver: "Enveloping, soft-edged, proximate. Compositions should feel like an embrace. Warm tones dominant.",
    Lover: "Intimate, detail-obsessed, sensual surfaces. Everything is close-up, touchable, desirable.",
    Jester: "Diagonal, dynamic, playfully off-balance. Scale surprises. Color pops where you don't expect them.",
    Everyman: "Eye-level, unstaged, documentary. Imperfections are features. Natural light, natural moments.",
    Ruler: "Symmetrical, architectural, grand. Perfect proportions. Metallic accents. Dark backgrounds with illuminated subjects.",
    Innocent: "High-key, airy, upward. White space is generous. Morning light. Simple forms, pure colors.",
  };
  parts.push(philosophyMap[archetypeName] ?? philosophyMap.Creator);
  if (ctx.compositionPhilosophy) parts.push(ctx.compositionPhilosophy);
  if (ctx.illustrationStyle) parts.push(`Illustration language: ${ctx.illustrationStyle}`);
  return parts.join(" ");
}

function extractBrandContext(data: BrandbookData) {
  const igb = data.imageGenerationBriefing;
  const pos = data.positioning;
  const vi = data.verbalIdentity;
  const persona = data.audiencePersonas?.[0];

  // Colors
  const primaryColor = data.colors.primary[0]?.hex ?? "#1a1a1a";
  const primaryColorName = data.colors.primary[0]?.name ?? "primary";
  const secondaryColor = data.colors.primary[1]?.hex ?? data.colors.secondary[0]?.hex ?? "#ffffff";
  const accentColor = data.colors.secondary[0]?.hex ?? data.colors.primary[1]?.hex ?? "#888888";
  const allPrimaryColors = data.colors.primary.map((c) => `${c.name} (${c.hex})`).join(", ");
  const allColors = [...data.colors.primary, ...data.colors.secondary].map((c) => `${c.name} ${c.hex}`).join(" · ");

  // Typography
  const displayFont = data.typography.marketing?.name ?? data.typography.primary?.name ?? "modern sans-serif";
  const bodyFont = data.typography.ui?.name ?? data.typography.secondary?.name ?? displayFont;

  // Brand Concept
  const personality = data.brandConcept.personality.slice(0, 5).join(", ");
  const values = data.brandConcept.values.slice(0, 4).join(", ");
  const mission = data.brandConcept.mission ?? `${data.brandName} serves ${data.industry}`;
  const toneOfVoice = data.brandConcept.toneOfVoice ?? "professional and confident";
  const uniqueValue = data.brandConcept.uniqueValueProposition ?? pos?.positioningStatement ?? `leading ${data.industry} solution`;

  // Positioning
  const targetMarket = pos?.targetMarket ?? `${data.industry} professionals and businesses`;
  const differentiators = pos?.primaryDifferentiators?.slice(0, 3).join(", ") ?? "innovation, quality, reliability";

  // Verbal Identity
  const tagline = vi?.tagline ? `Brand tagline: "${vi.tagline}".` : "";
  const sampleHeadline = vi?.sampleHeadlines?.[0] ?? "";
  const voiceTraits = vi?.brandVoiceTraits?.slice(0, 3).join(", ") ?? personality;

  // Key Visual
  const photoStyle = igb?.photographyMood ?? data.keyVisual.photographyStyle ?? "editorial professional photography";
  const elements = data.keyVisual.elements.slice(0, 5).join(", ");
  const visualStyle = igb?.visualStyle ?? `premium ${data.industry} brand design`;
  const colorMood = igb?.colorMood ?? `dominant ${primaryColorName} (${primaryColor}), contrasting ${secondaryColor}`;
  const composition = igb?.compositionNotes ?? "clean asymmetric layout, generous negative space";
  const artisticRef = igb?.artisticReferences ?? "Pentagram, Apple brand photography, Wallpaper magazine";
  const moodWords = igb?.moodKeywords?.join(", ") ?? personality;
  const marketingLanguage = igb?.marketingVisualLanguage ?? "bold editorial graphic design with cinematic quality";
  const negativeBase = igb?.negativePrompt ?? "blurry, low quality, watermark, amateur, pixelated, deformed, ugly";
  const avoid = igb?.avoidElements ?? "clutter, low quality, stock-photo clichés, generic";

  // Logo
  const logoSymbol = (data.logo as any).symbolConcept
    ?? ((data.logo as any).semioticAnalysis?.denotation)
    ?? (data.logo.symbol && !data.logo.symbol.startsWith("http") ? data.logo.symbol : "")
    ?? `abstract mark for ${data.brandName}`;
  const logoPrimary = data.logo.primary ?? `clean logotype for ${data.brandName}`;
  const logoStyle = igb?.logoStyleGuide ?? `precise vector, ${logoPrimary}`;
  const patternStyle = igb?.patternStyle ?? `geometric repeating motifs derived from brand symbol`;
  const logoClearSpace = data.logo.clearSpace ?? "";
  const logoMinimumSize = data.logo.minimumSize ?? "";
  const logoIncorrectUsagesList = (data.logo.incorrectUsages ?? []).slice(0, 6);
  const logoIncorrectUsages = logoIncorrectUsagesList.join("; ");
  const logoFavicon = data.logo.favicon ?? "";
  const logoNamingRules = buildBrandNameFidelityBlock(data.brandName, logoIncorrectUsagesList, "logo");

  // Audience
  const audienceDesc = persona
    ? `${persona.role} — ${persona.context} — goals: ${persona.goals.slice(0, 2).join(", ")}`
    : targetMarket;

  // Messaging
  const messagingPillar = vi?.messagingPillars?.[0]
    ? `${vi.messagingPillars[0].title} — ${vi.messagingPillars[0].description}`
    : uniqueValue;
  const preferredVocab = vi?.vocabulary?.preferred?.slice(0, 5).join(", ") ?? "";
  const reasonsToBelieve = [
    ...(data.brandConcept.reasonsToBelieve ?? []),
    ...(pos?.reasonsToBelieve ?? []),
  ].slice(0, 3).join(", ") || differentiators;
  const userPsychographics = data.brandConcept.userPsychographics ?? audienceDesc;
  const marketingArch = data.keyVisual.marketingArchitecture ?? marketingLanguage;
  const competitiveAngle = pos?.competitiveAlternatives?.length
    ? `Visually distinct from ${pos.competitiveAlternatives.slice(0, 2).join(" / ")}: ${differentiators}.`
    : `Visually superior to generic ${data.industry} imagery — ${differentiators}.`;
  const purpose = data.brandConcept.purpose ?? mission;
  const visualMetaphor = `${elements} — abstract representation of ${moodWords} through ${data.industry} lens`;

  // Industry visual language (specific to sector)
  const industryLang = industryVisualLanguage(data.industry);

  // Brand applications (real use cases defined in brandbook)
  const brandApplications = data.applications
    .slice(0, 5)
    .map((a) => `${a.type}: ${a.description}`)
    .join(" | ");

  // Messaging pillar depth
  const firstPillar = vi?.messagingPillars?.[0];
  const pillarProofPoints = firstPillar?.proofPoints?.slice(0, 3).join(", ") ?? reasonsToBelieve;
  const pillarCopy = firstPillar?.exampleCopy?.[0] ?? vi?.sampleHeadlines?.[0] ?? "";

  // Persona pain points (the "before" state)
  const painPoints = persona?.painPoints?.slice(0, 2).join("; ") ?? `challenges in ${data.industry}`;

  // Verbal identity — vocabulary to avoid (feeds negative prompts)
  const verbAvoid = vi?.vocabulary?.avoid?.slice(0, 4).join(", ") ?? "";

  // CTAs
  const sampleCTA = vi?.sampleCTAs?.[0] ?? "";

  // ─── SOUL LAYER: Brand Story ─────────────────────────────────────────────
  const bs = data.brandStory;
  const brandManifesto = bs?.manifesto
    ? bs.manifesto.length > 500 ? bs.manifesto.slice(0, 500).replace(/\s+\S*$/, "") + "…" : bs.manifesto
    : "";
  const brandPromise = bs?.brandPromise ?? "";
  const brandBeliefs = bs?.brandBeliefs?.slice(0, 4).join("; ") ?? "";
  const originStory = bs?.originStory
    ? bs.originStory.length > 300 ? bs.originStory.slice(0, 300).replace(/\s+\S*$/, "") + "…" : bs.originStory
    : "";

  // ─── SOUL LAYER: Composition Philosophy ──────────────────────────────────
  const compositionPhilosophy = data.keyVisual.compositionPhilosophy ?? "";

  // ─── SOUL LAYER: Flora, Fauna, Objects ────────────────────────────────────
  const floraElements = data.keyVisual.flora?.slice(0, 6).join(", ") ?? "";
  const faunaElements = data.keyVisual.fauna?.slice(0, 6).join(", ") ?? "";
  const objectElements = data.keyVisual.objects?.slice(0, 6).join(", ") ?? "";
  const identityAssets = [floraElements, faunaElements, objectElements].filter(Boolean).join(" · ");
  const hasStrongIdentityAssets = identityAssets.length > 20;

  // ─── SOUL LAYER: Structured Patterns ──────────────────────────────────────
  const sp = data.keyVisual.structuredPatterns;
  const structuredPatternDetails = sp?.length
    ? sp.slice(0, 3).map((p) => `${p.name}: ${p.composition} (density: ${p.density ?? "moderate"}, background: ${p.background ?? "neutral"}, usage: ${p.usage ?? "general"})`).join(" | ")
    : "";
  const primaryPattern = sp?.[0];

  // ─── SOUL LAYER: Illustration & Iconography ──────────────────────────────
  const illustrationStyle = data.keyVisual.illustrations ?? "";
  const iconographyStyle = data.keyVisual.iconography ?? "";

  // ─── SOUL LAYER: Mascot Directive ──────────────────────────────────────────
  const mascot = data.keyVisual.mascots?.[0];
  const mascotDirective = mascot
    ? `MASCOT IDENTITY: ${mascot.name} — ${mascot.description}. Personality: ${mascot.personality}. Guidelines: ${mascot.usageGuidelines?.slice(0, 4).join("; ") ?? "versatile brand character"}.`
    : "";

  // ─── SOUL LAYER: Archetypal Energy ────────────────────────────────────────
  const explicitArchetype = data.brandConcept.brandArchetype || (igb as unknown as Record<string, unknown> | undefined)?.brandArchetype as string | undefined;
  const archetypalEnergy = deriveArchetype(data.brandConcept.personality, data.brandConcept.toneOfVoice, explicitArchetype);

  // ─── SOUL LAYER: Emotional Core ──────────────────────────────────────────
  const emotionalCore = deriveEmotionalCore(brandManifesto, purpose, moodWords, archetypalEnergy, brandPromise);

  // ─── SOUL LAYER: Design Philosophy ─────────────────────────────────────────
  const designPhilosophy = deriveDesignPhilosophy({
    compositionPhilosophy, illustrationStyle, photoStyle, visualStyle, archetypalEnergy,
  });

  // ─── SOUL LAYER: Sensory Profile ─────────────────────────────────────────
  const igbExt = igb as unknown as Record<string, unknown> | undefined;
  const textureLanguage = (igbExt?.textureLanguage as string) ?? "";
  const lightingSignature = (igbExt?.lightingSignature as string) ?? "";
  const cameraSignature = (igbExt?.cameraSignature as string) ?? "";
  const sensoryProfile = (igbExt?.sensoryProfile as string) ?? "";

  // ─── SOUL LAYER: Logo Variants ────────────────────────────────────────────
  const logoVariants = data.logoVariants;

  // ─── SOUL LAYER: Social Media Per-Platform ────────────────────────────────
  const socialGuidelines = data.socialMediaGuidelines;

  // ─── SOUL LAYER: Multiple Personas ────────────────────────────────────────
  const allPersonas = data.audiencePersonas ?? [];
  const personaSummary = allPersonas.length > 1
    ? allPersonas.slice(0, 3).map((p) => `${p.name} (${p.role})`).join(", ")
    : audienceDesc;

  return {
    primaryColor, primaryColorName, secondaryColor, accentColor,
    allPrimaryColors, allColors,
    displayFont, bodyFont,
    personality, values, mission, toneOfVoice, uniqueValue,
    targetMarket, differentiators,
    tagline, sampleHeadline, voiceTraits,
    photoStyle, elements, visualStyle, colorMood, composition,
    artisticRef, moodWords, marketingLanguage, negativeBase, avoid,
    logoSymbol, logoPrimary, logoStyle, patternStyle,
    logoClearSpace, logoMinimumSize, logoIncorrectUsagesList, logoIncorrectUsages, logoFavicon, logoNamingRules,
    audienceDesc, messagingPillar, preferredVocab, reasonsToBelieve,
    userPsychographics, marketingArch, competitiveAngle, purpose, visualMetaphor,
    industryLang, brandApplications,
    pillarProofPoints, pillarCopy, painPoints, verbAvoid, sampleCTA,
    // ─── Soul Layer ─────────────────────────────────────────────────────────
    brandManifesto, brandPromise, brandBeliefs, originStory,
    compositionPhilosophy, identityAssets, hasStrongIdentityAssets,
    floraElements, faunaElements, objectElements,
    structuredPatternDetails, primaryPattern, illustrationStyle, iconographyStyle,
    archetypalEnergy, emotionalCore, designPhilosophy,
    mascotDirective, mascot,
    textureLanguage, lightingSignature, cameraSignature, sensoryProfile,
    logoVariants, socialGuidelines, personaSummary,
  };
}

function providerQuality(provider: ImageProvider, key: AssetKey, archetypeName?: string): string {
  const isMockup = ["business_card", "brand_collateral", "app_mockup", "outdoor_billboard", "delivery_packaging", "takeaway_bag", "food_container", "uniform_tshirt", "uniform_apron", "materials_board"].includes(key);
  const isLogo = key === "logo_primary" || key === "logo_dark_bg";
  const isPattern = key === "brand_pattern" || key === "presentation_bg";
  const isSocial = ["social_post_square", "instagram_carousel", "instagram_story", "social_cover", "youtube_thumbnail"].includes(key);
  const isMascot = key === "brand_mascot";

  const arch = archetypeName ?? "Creator";
  const archetypeQuality: Record<string, string> = {
    Ruler: "luxury advertising campaign quality, Hasselblad precision, velvet-dark tonality, editorial authority",
    Lover: "intimate editorial quality, skin-tone accuracy, warm sensual lighting, Vogue Italia standard",
    Jester: "vibrant pop-art energy, saturated colors, playful composition, Wieden+Kennedy campaign quality",
    Explorer: "National Geographic photographic quality, atmospheric depth, adventure-grade clarity",
    Sage: "Swiss Design precision, information-beautiful clarity, intellectual sharpness, Bloomberg editorial quality",
    Caregiver: "warm documentary quality, soft human intimacy, Kodak Portra tonality, empathetic framing",
    Outlaw: "raw editorial grit, high-contrast chiaroscuro, Vice magazine intensity, intentional grain",
    Hero: "Olympic-grade dramatic photography, heroic lighting, monumental scale, Nike campaign quality",
    Magician: "surreal editorial quality, dreamlike depth, impossible perspectives, Taschen art book standard",
    Everyman: "authentic documentary photography, honest natural light, relatable framing, unstaged moments",
    Innocent: "bright high-key clarity, morning-light purity, Apple-clean composition, optimistic warmth",
    Creator: "award-winning design craftsmanship, intentional imperfection, visible creative process, Pentagram studio quality",
  };
  
  // NEVER apply photographic archetype qualities to logos
  const archQ = isLogo
    ? "award-winning brand identity craftsmanship, distinctive silhouette, strategic clarity, emotional resonance, scalable system quality"
    : (archetypeQuality[arch] ?? archetypeQuality.Creator);

  const patternQ = "world-class surface pattern design, mathematically perfect seamless tile, Hermès-level textile pattern quality, precise vector illustration, consistent stroke weights, intentional grid-based composition, professional brand pattern system";

  if (provider === "dalle3") {
    if (isLogo) return `professional brand identity mark, strategically distinctive, clean crisp edges, concept-led construction, world-class identity studio quality, ${archQ}`;
    if (isMockup) return `hyperrealistic commercial product photography, ultra-sharp material textures, medium-format sensor quality, studio-grade three-point lighting, ${archQ}`;
    if (isPattern) return `${patternQ}, ${archQ}`;
    if (isSocial) return `social media design excellence, thumb-stopping visual hierarchy, mobile-optimized composition, ${archQ}`;
    if (isMascot) return `professional character design, clean modern 2D illustration, consistent line weights, animation-ready silhouette, ${archQ}`;
    return `ultra-high resolution commercial photography, award-winning brand campaign, ${archQ}`;
  }
  if (provider === "stability") {
    if (isMockup) return `hyperrealistic product photography, 8K UHD, professional studio lighting, photorealistic material texture, ${archQ}`;
    if (isLogo) return `precise clean graphic illustration, sharp edges, concept-led brand identity quality, ${archQ}`;
    if (isPattern) return `${patternQ}, sharp edges, crisp vector quality, ${archQ}`;
    if (isMascot) return `professional character illustration, clean linework, expressive simple shapes, ${archQ}`;
    return `8K UHD editorial photography, sharp focus, highly detailed, professional color grading, ${archQ}`;
  }
  if (provider === "imagen") {
    if (isMockup) return `photorealistic commercial photography, professional studio lighting, sharp material details, ${archQ}`;
    if (isLogo) return `clean precise graphic design, sharp edges, strategically distinctive illustration quality, ${archQ}`;
    if (isPattern) return `${patternQ}, clean precise graphic design, sharp edges, ${archQ}`;
    if (isMascot) return `professional character illustration, clean 2D design, crisp edges, ${archQ}`;
    return `high-fidelity photorealistic image, professional photography quality, rich color, ${archQ}`;
  }
  if (isLogo) return `professional logo design, precise linework, concept-led scalable identity mark, ${archQ}`;
  if (isSocial) return `bold graphic design, high contrast, clear visual hierarchy, ${archQ}`;
  if (isMascot) return `professional character design, clean illustration, crisp linework, ${archQ}`;
  return `professional graphic design, crisp edges, bold visual impact, ${archQ}`;
}

function neg(ctx: ReturnType<typeof extractBrandContext>, provider: ImageProvider, extra = ""): string {
  const all = [ctx.negativeBase, ctx.avoid, extra].filter(Boolean).join(", ");
  if (provider === "stability") return ` --neg ${all}`;
  if (provider === "dalle3")    return ` Avoid including: ${all}.`;
  if (provider === "imagen")    return ` Do not include, do not generate: ${all}.`;
  /* ideogram */                return ` Do not include: ${all}.`;
}

function providerPrefix(provider: ImageProvider, key: AssetKey): string {
  if (provider === "imagen") {
    const isLogo = key === "logo_primary" || key === "logo_dark_bg";
    const isPattern = key === "brand_pattern" || key === "presentation_bg";
    return (isLogo || isPattern)
      ? "Create a high-quality graphic design image. "
      : "Create a high-quality photorealistic image. ";
  }
  if (provider === "ideogram") return "Design a professional graphic image. ";
  return "";
}

function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function visualSystemId(ctx: ReturnType<typeof extractBrandContext>, data: BrandbookData): string {
  const base = [
    data.brandName,
    data.industry,
    ctx.allColors,
    ctx.displayFont,
    ctx.bodyFont,
    ctx.logoSymbol,
    ctx.patternStyle,
    ctx.visualStyle,
    ctx.photoStyle,
  ].join("|");
  const hex = fnv1a32(base).toString(16).padStart(8, "0");
  return `BBVS-${hex}`;
}

function assetHierarchy(key: AssetKey): string {
  const isMockup = [
    "app_mockup",
    "business_card",
    "brand_collateral",
    "delivery_packaging",
    "takeaway_bag",
    "food_container",
    "uniform_tshirt",
    "uniform_apron",
    "materials_board",
    "outdoor_billboard",
  ].includes(key);
  const isSocial = [
    "social_post_square",
    "instagram_carousel",
    "instagram_story",
    "social_cover",
    "youtube_thumbnail",
  ].includes(key);

  if (key === "logo_primary" || key === "logo_dark_bg") {
    return "Logo lockup only (logomark + wordmark). No extra elements.";
  }
  if (key === "brand_mascot") {
    return "Mascot character is the hero. Keep background simple. No wordmarks or readable text. Use only motifs derived from the logo symbol.";
  }
  if (key === "brand_pattern" || key === "presentation_bg") {
    return "Pattern/texture is primary. Keep it subtle, systematic, and repeatable.";
  }
  if (isMockup) {
    return "1) real product/scene, 2) logo must be readable and correct, 3) pattern/accents support the logo.";
  }
  if (isSocial) {
    return "1) one dominant focal element, 2) clear negative space for copy (not rendered), 3) brand accents/pattern support.";
  }
  return "1) one focal subject, 2) supporting brand motifs/pattern, 3) balanced negative space.";
}

function brandCoherenceDirective(
  ctx: ReturnType<typeof extractBrandContext>,
  data: BrandbookData,
  key: AssetKey
): string {
  const recognitionAnchors = [
    data.colors.primary[0] ? `${data.colors.primary[0].name} (${data.colors.primary[0].hex})` : "",
    data.colors.primary[1] ? `${data.colors.primary[1].name} (${data.colors.primary[1].hex})` : "",
    ctx.identityAssets,
  ].filter(Boolean).join(" · ");

  const lines = [
    `BRAND_COHERENCE: Preserve the brand's proprietary memory before adding novelty.`,
    `ESSENCE FIRST: ${ctx.purpose}`,
    recognitionAnchors ? `RECOGNITION ANCHORS: ${recognitionAnchors}.` : "",
    ctx.compositionPhilosophy ? `SIGNATURE COMPOSITION: ${ctx.compositionPhilosophy}.` : "",
    `REJECTION TEST: If a visual choice makes the result feel more generic, colder, more corporate, or less specific to "${data.brandName}", reject that choice.`,
  ];

  if (key === "logo_primary" || key === "logo_dark_bg") {
    lines.push(`LOGO JUDGMENT: Simplify only when recognition, warmth, and conceptual specificity remain intact. Distinctive verbal cues may be integrated only if they feel inevitable, never gimmicky.`);
  } else if (key === "brand_pattern" || key === "presentation_bg") {
    lines.push(`SYSTEM JUDGMENT: The pattern must feel like the brand's native visual grammar, not decorative filler. Keep support at the edges and preserve readability in the center when relevant.`);
  } else {
    lines.push(`APPLICATION JUDGMENT: The output must feel like the brand in real life and in operation, not like a generic moodboard or template. Use identity assets as controlled support, never as clutter.`);
  }

  return lines.filter(Boolean).join(" ");
}

function rebrandCriticalModeDirective(
  ctx: ReturnType<typeof extractBrandContext>,
  data: BrandbookData,
  key: AssetKey
): string {
  const isLogo = key === "logo_primary" || key === "logo_dark_bg";
  const isSystemAsset = [
    "brand_pattern",
    "presentation_bg",
    "brand_mascot",
    "business_card",
    "brand_collateral",
    "delivery_packaging",
    "takeaway_bag",
    "food_container",
    "uniform_tshirt",
    "uniform_apron",
    "outdoor_billboard",
  ].includes(key);
  const primaryRecognitionColors = data.colors.primary
    .slice(0, 2)
    .map((color) => `${color.name} (${color.hex})`)
    .join(" + ");
  const warmthSignals = `${ctx.purpose} ${ctx.toneOfVoice} ${ctx.personality} ${ctx.logoStyle} ${ctx.visualStyle} ${ctx.textureLanguage} ${ctx.sensoryProfile}`.toLowerCase();
  const needsWarmthProtection = /(warm|human|coloquial|signature|gest|manual|organic|calor|brasil|boteco|tropical|material|sensorial|popular|craft)/.test(warmthSignals);
  const level = isLogo ? "HIGH" : isSystemAsset ? "MEDIUM" : "ACTIVE";
  const preserve = [
    ctx.purpose ? `brand essence (${ctx.purpose})` : "",
    primaryRecognitionColors ? `recognition colors (${primaryRecognitionColors})` : "",
    ctx.logoSymbol ? `core symbol logic (${ctx.logoSymbol})` : "",
    ctx.compositionPhilosophy ? `signature composition (${ctx.compositionPhilosophy})` : "",
    ctx.identityAssets ? `identity assets (${ctx.identityAssets})` : "",
    needsWarmthProtection ? `human temperature (${ctx.toneOfVoice})` : "",
  ].filter(Boolean).join("; ");
  const evolveOnlyThrough = [
    "clarity",
    "hierarchy",
    "scalability",
    "controlled synthesis",
    "production readiness",
    "stronger recognition",
  ].join(", ");
  const doNotSacrifice = [
    needsWarmthProtection ? "warmth, spontaneity, and colloquial humanity" : "brand-specific emotional charge",
    primaryRecognitionColors ? "proprietary palette memory" : "recognition anchors",
    ctx.identityAssets ? "local/cultural specificity" : "brand specificity",
    isLogo ? "distinctive verbal/name cues in favor of a colder generic corporate mark" : "brand character in favor of template aesthetics",
  ].join(", ");

  return [
    `REBRAND_CRITICAL_MODE: ${level}. Treat this as brand-direction work, not surface styling.`,
    preserve ? `PRESERVE: ${preserve}.` : "",
    `EVOLVE ONLY THROUGH: ${evolveOnlyThrough}.`,
    `DO NOT SACRIFICE: ${doNotSacrifice}.`,
  ].filter(Boolean).join(" ");
}

function brandCoherenceScorecardDirective(
  ctx: ReturnType<typeof extractBrandContext>,
  data: BrandbookData,
  key: AssetKey
): string {
  const isLogo = key === "logo_primary" || key === "logo_dark_bg";
  const isPattern = key === "brand_pattern" || key === "presentation_bg";
  const warmthSignals = `${ctx.purpose} ${ctx.toneOfVoice} ${ctx.personality} ${ctx.logoStyle} ${ctx.visualStyle} ${ctx.textureLanguage} ${ctx.sensoryProfile}`.toLowerCase();
  const needsWarmthProtection = /(warm|human|coloquial|signature|gest|manual|organic|calor|brasil|boteco|tropical|material|sensorial|popular|craft)/.test(warmthSignals);
  const criteria = isLogo
    ? [
      "recognition and memorability",
      "essence-to-form translation",
      needsWarmthProtection ? "warmth and human charge" : "emotional specificity",
      "symbol and wordmark coherence",
      "scalability and reduction quality",
    ]
    : isPattern
      ? [
        "recognition anchors",
        "system-native visual grammar",
        "signature composition fidelity",
        "center readability when relevant",
        "distinctiveness versus decorative filler",
      ]
      : [
        "brand recognition at first glance",
        needsWarmthProtection ? "warmth and human truth" : "emotional fidelity",
        "system consistency",
        "real-world brand plausibility",
        "distinctiveness versus generic templates",
      ];
  const passScore = isLogo ? "22/25" : isPattern ? "21/25" : "20/25";
  const hardFail = isLogo
    ? `If the result feels more generic, colder, more corporate, less ownable, or less specific to "${data.brandName}", it fails.`
    : isPattern
      ? `If the result reads as decorative filler, ignores the composition philosophy, or could belong to any other brand, it fails.`
      : `If the result feels like a template, moodboard, stock aesthetic, or weakens proprietary brand memory, it fails.`;

  return [
    `BRAND_COHERENCE_SCORECARD: Internally score 0-5 on ${criteria.join("; ")}.`,
    `MINIMUM PASS: ${passScore}. Do not finalize directions likely to score below this threshold.`,
    `HARD FAIL CONDITIONS: ${hardFail}`,
  ].join(" ");
}

function creativePlanningDirective(
  ctx: ReturnType<typeof extractBrandContext>,
  data: BrandbookData,
  key: AssetKey
): string {
  const isLogo = key === "logo_primary" || key === "logo_dark_bg";
  const isPattern = key === "brand_pattern" || key === "presentation_bg";
  const firstImpressionTarget = isLogo
    ? `Immediate recognition of "${data.brandName}" through one ownable mark and one clear verbal signal.`
    : isPattern
      ? `Immediate recognition of the brand's native rhythm through logo-derived motifs and signature composition.`
      : `Immediate recognition of "${data.brandName}" as a lived brand world, not a generic aesthetic exercise.`;
  const heroDecision = isLogo
    ? "Choose one central symbolic thesis and let all form decisions serve that thesis."
    : isPattern
      ? "Choose one repeat logic and one density strategy before styling the pattern."
      : "Choose one dominant focal move and make all supporting decisions reinforce it.";
  const executionOrder = isLogo
    ? "recognition anchor -> core thesis -> hierarchy between symbol and wordmark -> palette memory -> reduction/scalability check"
    : isPattern
      ? "root motif -> repeat structure -> edge/center behavior -> density control -> system repeatability"
      : "recognition anchor -> emotional outcome -> dominant hierarchy -> brand assets support -> production realism";

  return [
    `CREATIVE_PLAN: Before styling, silently define one thesis, one hero decision, one dominant hierarchy, and one success condition for this asset.`,
    `FIRST_IMPRESSION_TARGET: ${firstImpressionTarget}`,
    `HERO_DECISION: ${heroDecision}`,
    `PLAN_ORDER: ${executionOrder}.`,
  ].join(" ");
}

function consciousCreationDirective(
  ctx: ReturnType<typeof extractBrandContext>,
  data: BrandbookData,
  key: AssetKey
): string {
  const isLogo = key === "logo_primary" || key === "logo_dark_bg";
  const isPattern = key === "brand_pattern" || key === "presentation_bg";
  const decisionFocus = isLogo
    ? "Every proportion, terminal, counterspace, and relation between symbol and wordmark must earn its place."
    : isPattern
      ? "Every motif, interval, density shift, and empty area must help the system breathe and stay ownable."
      : "Every object, crop, texture, accent, and compositional move must serve recognition, hierarchy, or emotional truth.";
  const removalTest = isLogo
    ? `If removing a detail improves clarity without reducing recognition or warmth for "${data.brandName}", remove it.`
    : isPattern
      ? `If a motif or density choice does not strengthen the brand grammar, remove it.`
      : `If an element feels decorative, template-like, or unjustified in real brand use, remove it.`;

  return [
    `CONSCIOUS_CREATION_MODE: Create with awareness of what each decision is doing for the brand, not just how it looks.`,
    `ELEMENT_ACCOUNTABILITY: ${decisionFocus}`,
    `DECISION_TEST: Ask of each choice what job it performs, what brand memory it protects, and what would be lost if it disappeared.`,
    `REMOVAL_TEST: ${removalTest}`,
  ].join(" ");
}

function styleAnchorTree(ctx: ReturnType<typeof extractBrandContext>, data: BrandbookData): string {
  const symbols = (data.keyVisual.symbols ?? []).slice(0, 4).join(", ");
  const patterns = (data.keyVisual.patterns ?? []).slice(0, 4).join(", ");
  const elements = (data.keyVisual.elements ?? []).slice(0, 6).join(", ");

  return [
    `STYLE_TREE: ROOT=${ctx.logoSymbol}.`,
    patterns ? `PATTERNS=${patterns}.` : `PATTERNS=${ctx.patternStyle}.`,
    symbols ? `SYMBOLS=${symbols}.` : "",
    elements ? `ELEMENTS=${elements}.` : "",
    "RULE: Everything must be derived from ROOT. Do not introduce unrelated motifs or a different art direction between assets.",
  ]
    .filter(Boolean)
    .join(" ");
}

function consistencyPrefix(
  ctx: ReturnType<typeof extractBrandContext>,
  data: BrandbookData,
  key: AssetKey
): string {
  const logoRequired = [
    "business_card",
    "brand_collateral",
    "delivery_packaging",
    "takeaway_bag",
    "food_container",
    "uniform_tshirt",
    "uniform_apron",
    "outdoor_billboard",
  ].includes(key);

  const logoRule = (logoRequired || key === "logo_dark_bg")
    ? "LOGO REQUIRED: The logo must be present, readable, and match the exact reference logo (no redesign, no new symbol variants, no different typography, no distortion)."
    : "Do not invent new logos/symbols; only use motifs derived from the logo symbol.";
  const brandTextRule = logoRequired
    ? buildBrandNameFidelityBlock(data.brandName, data.logo.incorrectUsages ?? [], "brand_visible")
    : "";

  return [
    `VISUAL_SYSTEM_ID: ${visualSystemId(ctx, data)}.`,
    `GLOBAL STYLE COHERENCE (CRITICAL): Every image in this brand system MUST look like it was art-directed by the SAME creative director in the SAME studio, on the SAME day. Shared visual DNA across ALL assets: identical color temperature (${ctx.photoStyle}), same shadow direction and softness, same depth-of-field language, same material quality level. If someone laid all 100 brand images side by side, they would instantly see ONE brand, not 100 random images. Think Apple product photography consistency or Nike campaign coherence.`,
    `PALETTE (strict — NO exceptions): ${ctx.allColors}. Every color in the image must trace back to this palette. Background tones, surface materials, ambient light color — all filtered through brand palette. Off-palette colors = brand failure.`,
    `MOTIFS: derived from logo symbol: ${ctx.logoSymbol}.`,
    `STYLE: ${ctx.visualStyle}. Photography/art direction: ${ctx.photoStyle}.`,
    brandCoherenceDirective(ctx, data, key),
    rebrandCriticalModeDirective(ctx, data, key),
    brandCoherenceScorecardDirective(ctx, data, key),
    creativePlanningDirective(ctx, data, key),
    consciousCreationDirective(ctx, data, key),
    logoRule,
    brandTextRule,
    `HIERARCHY: ${assetHierarchy(key)}`,
  ].join(" ");
}

function stabilityTags(ctx: ReturnType<typeof extractBrandContext>, key: AssetKey): string {
  const isPhoto = ["hero_visual", "hero_lifestyle", "app_mockup", "business_card", "brand_collateral", "outdoor_billboard", "delivery_packaging", "takeaway_bag", "food_container", "uniform_tshirt", "uniform_apron", "materials_board"].includes(key);
  const isMascot = key === "brand_mascot";
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const archTags: Record<string, string> = {
    Ruler: "(regal:1.2), (luxury:1.2), (symmetry:1.1)",
    Lover: "(intimate:1.2), (warm tones:1.2), (soft bokeh:1.1)",
    Jester: "(vibrant:1.3), (playful:1.2), (dynamic:1.1)",
    Explorer: "(atmospheric:1.2), (vast:1.1), (adventure:1.1)",
    Sage: "(precise:1.2), (structured:1.1), (clarity:1.2)",
    Caregiver: "(warm:1.3), (soft:1.2), (nurturing:1.1)",
    Outlaw: "(gritty:1.2), (raw:1.2), (contrast:1.3)",
    Hero: "(dramatic:1.3), (heroic:1.2), (monumental:1.1)",
    Magician: "(ethereal:1.2), (dreamlike:1.2), (luminous:1.1)",
    Everyman: "(authentic:1.2), (natural:1.2), (honest:1.1)",
    Innocent: "(bright:1.3), (clean:1.2), (optimistic:1.1)",
    Creator: "(creative:1.2), (crafted:1.2), (intentional:1.1)",
  };
  const at = archTags[archetypeName] ?? archTags.Creator;
  if (isPhoto) return `(masterpiece:1.4), (best quality:1.3), (photorealistic:1.3), (8k uhd:1.2), (sharp focus:1.2), ${at}, ${ctx.primaryColor} color grade, ${ctx.moodWords}`;
  if (isMascot) return `(masterpiece:1.4), (best quality:1.3), (character illustration:1.3), (clean linework:1.2), (simple shapes:1.2), ${at}, ${ctx.primaryColor} dominant, ${ctx.moodWords}`;
  return `(masterpiece:1.4), (best quality:1.3), (crisp vector:1.3), (sharp edges:1.2), ${at}, professional graphic design, ${ctx.primaryColor} dominant`;
}

function soulAnchor(ctx: ReturnType<typeof extractBrandContext>): string {
  const lines: string[] = [];
  if (ctx.archetypalEnergy) lines.push(`ARCHETYPE: ${ctx.archetypalEnergy}.`);
  if (ctx.emotionalCore) lines.push(`EMOTIONAL_CORE: ${ctx.emotionalCore}`);
  if (ctx.brandManifesto) lines.push(`BRAND_SOUL: "${ctx.brandManifesto}"`);
  if (ctx.brandPromise) lines.push(`BRAND_PROMISE: "${ctx.brandPromise}"`);
  if (ctx.brandBeliefs) lines.push(`BELIEFS: ${ctx.brandBeliefs}.`);
  if (ctx.designPhilosophy) lines.push(`DESIGN_PHILOSOPHY: ${ctx.designPhilosophy}`);
  return lines.length > 0 ? lines.join(" ") : "";
}

function emotionalJourney(key: AssetKey, ctx: ReturnType<typeof extractBrandContext>): string {
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const isSocial = ["social_post_square", "instagram_carousel", "instagram_story", "social_cover", "youtube_thumbnail"].includes(key);
  const isHero = key === "hero_visual" || key === "hero_lifestyle";
  const isMockup = ["business_card", "brand_collateral", "delivery_packaging", "takeaway_bag", "food_container", "uniform_tshirt", "uniform_apron", "materials_board", "outdoor_billboard", "app_mockup"].includes(key);
  const sensoryHint = ctx.sensoryProfile ? ` Sensory anchor: ${ctx.sensoryProfile.slice(0, 100)}.` : "";

  if (isSocial) return `VIEWER_JOURNEY: 0.3s → thumb stops: instant brand color + motif recognition (${ctx.primaryColor}). 1s → emotional hook: ${archetypeName} energy floods — viewer feels ${ctx.moodWords}. 3s → desire to save/share/follow. The image must earn those 3 seconds.${sensoryHint}`;
  if (isHero) return `VIEWER_JOURNEY: 0.5s → atmospheric immersion: the brand world envelops (${ctx.colorMood}). 2s → positioning decoded: viewer understands "${ctx.uniqueValue}". 5s → emotional resonance: viewer feels the brand promise in their body.${sensoryHint}`;
  if (isMockup) return `VIEWER_JOURNEY: 0.5s → "this is real, premium, designed with intention — not a template". 2s → brand details emerge: logo placement, pattern intelligence, material quality. 5s → the viewer imagines touching this object, feeling ${ctx.personality} through the material.${sensoryHint}`;
  if (key === "brand_pattern") return `VIEWER_JOURNEY: instant → visual rhythm captures the eye (derived from ${ctx.logoSymbol}). 2s → hidden relationships between motifs reveal themselves. 5s → the repetition becomes meditative, embodying ${ctx.moodWords}. The pattern must feel like the brand breathing.${sensoryHint}`;
  if (key === "brand_mascot") return `VIEWER_JOURNEY: 0.3s → instant warmth and approachability. 1s → personality decoded through expression and pose (${ctx.personality}). 3s → emotional bond forms — "I trust this character, I like this brand".${sensoryHint}`;
  if (key === "email_header") return `VIEWER_JOURNEY: 0.2s → brand recognition in inbox preview. 0.5s → visual primes the reader for the content below. 2s → the banner has done its job — viewer scrolls to CTA.${sensoryHint}`;
  if (key === "presentation_bg") return `VIEWER_JOURNEY: the background should be felt, not seen. It creates atmospheric brand presence while the audience reads slide content. It whispers ${ctx.moodWords} without competing.${sensoryHint}`;
  if (key === "outdoor_billboard") return `VIEWER_JOURNEY: 1s at 60km/h → ONE feeling, ONE recognition. 3s max → the brand is burned into memory. This is not nuance — this is impact.${sensoryHint}`;
  return `VIEWER_JOURNEY: 0.5s → brand recognition through color and motif. 2s → message clarity. 5s → emotional resonance — viewer feels ${ctx.moodWords}.${sensoryHint}`;
}

function sensoryDirectives(key: AssetKey, ctx: ReturnType<typeof extractBrandContext>): string {
  const lines: string[] = [];
  const isMockup = ["business_card", "brand_collateral", "delivery_packaging", "takeaway_bag", "food_container", "uniform_tshirt", "uniform_apron", "materials_board"].includes(key);
  if (ctx.textureLanguage) lines.push(`TEXTURES (the viewer should almost feel these): ${ctx.textureLanguage}.`);
  if (ctx.sensoryProfile) lines.push(`SENSORY TRANSLATION: ${ctx.sensoryProfile}.`);
  if (ctx.lightingSignature) lines.push(`LIGHTING_SIGNATURE: ${ctx.lightingSignature}.`);
  if (isMockup && ctx.textureLanguage) lines.push(`MATERIAL CLOSE-UP PRIORITY: render material textures with haptic realism — the viewer should imagine touching the surface.`);
  return lines.length > 0 ? lines.join(" ") : "";
}

function cameraDirective(key: AssetKey, ctx: ReturnType<typeof extractBrandContext>): string {
  if (ctx.cameraSignature) return ctx.cameraSignature;
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const isLifestyle = key === "hero_lifestyle";
  const isProduct = ["business_card", "brand_collateral", "delivery_packaging", "takeaway_bag", "food_container", "uniform_tshirt", "uniform_apron", "materials_board"].includes(key);
  const isHero = key === "hero_visual";

  const archCamera: Record<string, string> = {
    Ruler: "85mm f/2.8, regal compression, controlled depth, low angle suggesting grandeur",
    Lover: "50mm f/1.4, intimate shallow DOF, warm skin-tone rendering, close proximity",
    Jester: "24mm f/4, wide playful perspective, slight barrel distortion for energy, eye-level",
    Explorer: "24mm f/8, vast deep focus, horizon visible, atmospheric haze in distance",
    Sage: "50mm f/4, balanced neutral perspective, structured depth layers, clinical precision",
    Caregiver: "35mm f/2.0, warm proximity, soft background, eye-level empathetic framing",
    Outlaw: "35mm f/2.8, handheld energy, slight tilt, gritty street-level perspective",
    Hero: "24mm f/2.8, low angle upward, dramatic foreshortening, sky visible, monumental",
    Magician: "85mm f/1.8, dreamlike compression, extreme shallow DOF, foreground blur elements",
    Everyman: "35mm f/2.8, eye-level documentary, natural depth, unstaged framing",
    Innocent: "50mm f/2.0, bright open framing, high vantage, generous negative space",
    Creator: "35mm f/2.0, dynamic angle, visible process elements, creative workshop depth",
  };

  if (isLifestyle) return `${archCamera[archetypeName] ?? archCamera.Creator}, shallow depth of field, natural light, documentary intimacy, slight motion blur on background`;
  if (isProduct) return "85mm f/4, product photography, controlled studio three-point light, sharp focus on brand details and material texture, subtle depth falloff";
  if (isHero) return `${archCamera[archetypeName] ?? "35mm f/2.0"}, cinematic wide composition, dramatic depth layers, foreground bokeh element, atmospheric perspective`;
  if (key === "app_mockup") return "65mm f/2.8, 3/4 device angle 15-20°, shallow DOF on background, razor-sharp screen, studio product photography";
  if (key === "outdoor_billboard") return "24mm f/8, street-level urban context, deep focus showing environmental scale, blue hour or golden hour";
  return `${archCamera[archetypeName] ?? "50mm f/2.8"}, balanced depth, professional studio, clean sharp focus`;
}

function socialPlatformContext(key: AssetKey, ctx: ReturnType<typeof extractBrandContext>): string {
  const sg = ctx.socialGuidelines;
  if (!sg?.platforms?.length) return "";
  const platformMap: Record<string, string> = {
    instagram_carousel: "instagram",
    instagram_story: "instagram",
    social_post_square: "instagram",
    social_cover: "linkedin",
    youtube_thumbnail: "youtube",
  };
  const platformName = platformMap[key];
  if (!platformName) return "";
  const platform = sg.platforms.find((p) => p.platform.toLowerCase().includes(platformName));
  if (!platform) return "";
  const pillars = platform.contentPillars?.slice(0, 3).join(", ") ?? "";
  return [
    `PLATFORM_CONTEXT: ${platform.platform} — tone: ${platform.tone}.`,
    pillars ? `Content pillars: ${pillars}.` : "",
    platform.doList?.length ? `Best practices: ${platform.doList.slice(0, 2).join("; ")}.` : "",
  ].filter(Boolean).join(" ");
}

function identityAssetsDirective(ctx: ReturnType<typeof extractBrandContext>, key?: AssetKey): string {
  if (!ctx.identityAssets) return "";
  const parts: string[] = [];
  if (ctx.floraElements) parts.push(`Flora: ${ctx.floraElements}`);
  if (ctx.faunaElements) parts.push(`Fauna: ${ctx.faunaElements}`);
  if (ctx.objectElements) parts.push(`Objects: ${ctx.objectElements}`);
  if (parts.length === 0) return "";
  const isHeroOrLifestyle = key === "hero_visual" || key === "hero_lifestyle";
  const prominence = ctx.hasStrongIdentityAssets
    ? (isHeroOrLifestyle
      ? "IDENTITY_ASSETS (PROMINENT — these ARE the brand's visual DNA, feature them boldly as environmental and compositional elements)"
      : "IDENTITY_ASSETS (VISIBLE — weave into composition as recognizable brand elements, not merely background decoration)")
    : "IDENTITY_ASSETS (subtle environmental elements that reinforce brand identity)";
  return `${prominence}: ${parts.join(" · ")}.`;
}

function humanEssenceLayer(key: AssetKey, ctx: ReturnType<typeof extractBrandContext>, data: BrandbookData): string {
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const lines: string[] = [];

  const storyHint = ctx.originStory
    ? `ORIGIN STORY SUBTEXTURE: The visual should subtly echo the brand's origin — ${ctx.originStory.slice(0, 200)}.`
    : "";

  const archetypeRef: Record<string, string> = {
    Hero: "Reference: Nike 'Just Do It' campaigns, Gatorade athlete portraits, Olympic ceremony visuals.",
    Creator: "Reference: Adobe creative campaigns, Moleskine brand world, Bauhaus workshop aesthetic.",
    Sage: "Reference: Bloomberg editorial design, The Economist covers, MIT Media Lab visual identity.",
    Explorer: "Reference: Patagonia campaign photography, National Geographic visual storytelling, Land Rover adventure aesthetic.",
    Outlaw: "Reference: Diesel 'Be Stupid' campaign energy, Supreme brand drops, Vice magazine editorial.",
    Magician: "Reference: Cirque du Soleil visual world, Apple product reveals, Disney Imagineering concept art.",
    Caregiver: "Reference: Dove 'Real Beauty' campaign warmth, Johnson & Johnson heritage, IKEA family moments.",
    Lover: "Reference: Chanel editorial, Tom Ford campaign aesthetics, Dior beauty photography.",
    Jester: "Reference: Mailchimp brand illustration, M&M's character world, Old Spice campaign energy.",
    Everyman: "Reference: IKEA lifestyle photography, Uniqlo brand simplicity, Muji honest design.",
    Ruler: "Reference: Rolls-Royce brand photography, Rolex campaign imagery, Cartier jewellery editorial.",
    Innocent: "Reference: Innocent Drinks brand world, Glossier clean aesthetic, Apple product photography simplicity.",
  };

  if (storyHint && (key === "hero_visual" || key === "hero_lifestyle" || key === "brand_mascot")) {
    lines.push(storyHint);
  }
  lines.push(archetypeRef[archetypeName] ?? archetypeRef.Creator);

  if (ctx.mascotDirective && key !== "brand_mascot") {
    lines.push(`Brand character context: ${ctx.mascot?.name ?? "mascot"} may appear as subtle motif or environmental element.`);
  }

  return lines.filter(Boolean).join(" ");
}

function structuredPatternDirective(ctx: ReturnType<typeof extractBrandContext>): string {
  if (!ctx.structuredPatternDetails) return "";
  return `STRUCTURED_PATTERNS: ${ctx.structuredPatternDetails}.`;
}

// ─── WORLD-CLASS LOGO REFERENCE LIBRARY ──────────────────────────────────────
// Organized by brand archetype. Each entry provides the geometric/structural
// analysis — not style copying. The goal is to extract transferable principles.
const LOGO_STRUCTURAL_REFS: Record<string, { mark: string; structure: string; principle: string }[]> = {
  Hero: [
    {
      mark: "Nike Swoosh",
      structure: "single open vector stroke with no enclosed form; ascending 15° angle from thin tip to wide base; the stroke implies speed by being heavier where it lands and finer where it lifts off",
      principle: "open terminals suggest motion beyond the frame — the mark never 'arrives', it is always in motion; design one decisive stroke and commit to it completely",
    },
    {
      mark: "Adidas three-stripe mountain",
      structure: "three parallel diagonal stripes converging to a peak — the same stripe motif from the apparel system repurposed as a mountain silhouette; one repeated unit creates an entire mark",
      principle: "repetition of a single element (the stripe) generates rhythm, inevitability and brand system cohesion; the mark is the product is the symbol",
    },
    {
      mark: "Red Bull twin bulls",
      structure: "two mirrored bull silhouettes charging toward each other with a sun-burst between — bilateral symmetry creates confrontational tension, not calm authority",
      principle: "symmetry that faces inward creates energy rather than serenity; the negative space between the two forms IS the most charged element",
    },
    {
      mark: "Under Armour UA interlock",
      structure: "two letterforms (U and A) designed so the U cradles the A — the U's crossbar becomes the A's crossbar; the two letters share a structural element, reading as one unified shield-like glyph",
      principle: "when two initials share a structural element (a shared stroke, a shared curve), the monogram becomes a single new form rather than two placed letters; the point of intersection is the most important design decision",
    },
  ],
  Creator: [
    {
      mark: "Apple logo (Rob Janoff, 1977)",
      structure: "a circle (apple silhouette) with exactly one strategic bite removed from the upper-right — the subtraction prevents it from being a plain circle and creates instant global recognition through a single void",
      principle: "design the absence as carefully as the presence; one deliberate void transforms a generic shape into a unique mark; the bite is not decoration, it IS the mark",
    },
    {
      mark: "Adobe 'A' mark",
      structure: "a bold geometric capital A with the bottom-left serif removed — one stroke excised from a letterform creates a figure-ground exchange that rewards close inspection",
      principle: "surgical subtraction from a letterform is more powerful than addition; removing the expected element makes the viewer's eye complete it, creating engagement",
    },
    {
      mark: "Braun BR rebus (Dieter Rams era)",
      structure: "pure geometric letterforms derived from a strict modular grid — every curve, weight and spacing is a direct multiple of a base unit; no element exists outside the system",
      principle: "when every dimension of a mark is grid-derived, it feels discovered rather than designed; mathematical inevitability reads as confidence",
    },
    {
      mark: "Figma four-circle mark",
      structure: "four circles arranged in a 2×2 grid, overlapping at precise tangent points — each overlap zone creates a new shape that reads as a fifth element; the four circles encode four product use cases",
      principle: "overlapping geometric primitives at their tangent points generates new forms in the intersection zones without adding new elements; count these emergent forms — they are free design content derived from pure proportion",
    },
  ],
  Sage: [
    {
      mark: "IBM 8-bar rebus (Paul Rand)",
      structure: "the three letterforms I-B-M are dissected by eight precisely spaced horizontal stripes; the mark simultaneously shows the letters and deconstructs them into horizontal information bands",
      principle: "applying a system to typography makes the system itself the message; the stripes are not decoration — they encode 'this brand thinks in structured systems'",
    },
    {
      mark: "MIT Media Lab variable mark",
      structure: "a set of nested right-angle triangles in three primary colors; different arrangements of the same triangles create unique marks for each lab while sharing the same geometric DNA",
      principle: "a mark that is a rule-generator rather than a fixed shape embodies the brand's belief in intellectual systems; the brand owns the grammar, not a single word",
    },
    {
      mark: "The Economist wordmark",
      structure: "bold white serif logotype reversed out of a solid red rectangle; the entire color field functions as the mark — the red rectangle is the logo as much as the text",
      principle: "authority through absolute restraint; when typography and a solid color field operate as a unified system, no symbol is needed — the confidence itself becomes the signal",
    },
    {
      mark: "Wikipedia puzzle globe",
      structure: "a globe assembled from interlocking puzzle pieces, with gaps visible — the incompleteness is not a flaw; the missing pieces are deliberately placed to signal that the project is never finished",
      principle: "designing visible incompleteness into a mark communicates a philosophical position; a gap or missing element can be the most eloquent statement the mark makes — decide whether your brand is complete or always becoming",
    },
  ],
  Explorer: [
    {
      mark: "National Geographic yellow rectangle",
      structure: "a solid yellow rectangle — the mark IS the frame; it frames everything the brand touches including its photography, which exists inside the mark",
      principle: "redefine what a logo can be — the mark does not have to be a symbol inside a frame; the mark CAN be the frame; the rectangle is the brand's philosophical statement about perspective",
    },
    {
      mark: "Patagonia mountain wordmark",
      structure: "a jagged mountain range silhouette above the wordmark — specifically the Fitz Roy massif outline, simplified to five peaks that read as a single saw-tooth stroke",
      principle: "specificity (a real place) is more powerful than a generic mountain; the mark has a real-world anchor; geographic specificity gives a mark authenticity that invented symbols cannot achieve",
    },
    {
      mark: "Land Rover oval",
      structure: "wordmark enclosed in a precise horizontal oval with green-filled background; the oval proportion (2.5:1 width-to-height) implies forward motion without any arrow or directional symbol",
      principle: "the proportion of a containing form implies direction and movement; a wider-than-tall oval suggests horizontal movement; every proportion decision carries meaning",
    },
    {
      mark: "The North Face Half Dome semicircle",
      structure: "the bottom half of the Yosemite Half Dome cliff face — a real geographical form reduced to a precise flat-bottomed semicircle; the mark borrows the authority of a specific real place, not an invented mountain",
      principle: "anchoring an abstract mark to a verifiable real-world form (a specific mountain, a specific river bend, a specific latitude line) gives it geographic authenticity; invented symbols feel designed, real-world reductions feel discovered",
    },
  ],
  Outlaw: [
    {
      mark: "Harley-Davidson Bar & Shield",
      structure: "a vertical shield (containing form) interrupted by a horizontal bar that breaks through both sides — the bar literally disrupts the shield, structurally embodying freedom-within-rules",
      principle: "the structural tension between a containing form and a breaking element embodies disruption philosophically; the bar does not sit inside the shield — it breaks through it",
    },
    {
      mark: "Virgin wordmark",
      structure: "hand-drawn signature lettering in red — the deliberate imperfection of a human hand at corporate scale; not set in a font, but drawn as a personal signature",
      principle: "when every competitor uses designed typography, a signature becomes radical; authentic human imperfection at scale signals that a real person stands behind the brand",
    },
    {
      mark: "Supreme box logo",
      structure: "Futura Bold condensed white wordmark in a solid red rectangle — radical simplicity executed with total conviction; the anti-logo that becomes the most recognized logo in streetwear",
      principle: "reduction to absolute minimum combined with unwavering commitment creates iconic status through repetition and consistency rather than complexity; the mark works because it never changes",
    },
    {
      mark: "Punk/metal band typography strategy (Black Flag, Metallica)",
      structure: "letterforms deconstructed to aggressive geometry — serifs elongated to blades, strokes thickened asymmetrically, vertical axes tilted to imply instability; the type is redesigned to feel physically dangerous",
      principle: "typography can encode a physical sensation (danger, speed, roughness) when its structural rules are deliberately broken in a consistent, intentional way; every rule you break must be broken the same way every time to become a system",
    },
  ],
  Magician: [
    {
      mark: "FedEx hidden arrow (Lindon Leader)",
      structure: "the negative space between the capital E and lowercase x in the wordmark forms a perfect rightward arrow — visible only when pointed out, creating a permanent perceptual shift",
      principle: "the hidden element creates a moment of discovery that permanently changes how the viewer sees the mark; once seen it cannot be unseen — the brand engagement is built into the act of looking",
    },
    {
      mark: "Amazon smile+arrow",
      structure: "a curved arrow from the letter A to the letter Z drawn beneath the wordmark — simultaneously a smile, a directional arrow, and a visual proof of the brand's complete A-to-Z range",
      principle: "one curved line can carry three simultaneous meanings (emotion + direction + brand claim) when each reading reinforces the others; layers of meaning compress into a single gesture",
    },
    {
      mark: "Disney Walt signature D",
      structure: "the capital D in the Walt Disney logotype is designed so that its curves simultaneously read as a D letterform and evoke a castle silhouette — dual reading built into a single letterform",
      principle: "design for the moment of discovery when the viewer sees both readings; the mark contains two worlds simultaneously, which is the brand's entire philosophical promise",
    },
    {
      mark: "Toblerone mountain + hidden bear",
      structure: "the Matterhorn mountain silhouette serves as the primary mark; inside the mountain's negative-space face, a bear in mid-stride is hidden — the bear is the symbol of Bern, the city of origin, encoded invisibly",
      principle: "a hidden figure-ground reversal inside a product-derived shape is the most sophisticated form of dual reading; the hidden element carries brand history and rewards loyal, attentive viewers — the casual viewer sees the mountain; the initiated viewer sees the bear",
    },
  ],
  Caregiver: [
    {
      mark: "Johnson & Johnson red script",
      structure: "flowing connected-script wordmark in red — the continuity of the brushstroke implies care that never breaks; each letter flows into the next without lifting the pen",
      principle: "a continuous connected stroke implies unbroken attention and care; the hand that writes it never leaves the page — this is the brand's promise made structural",
    },
    {
      mark: "Airbnb bélo (DesignStudio)",
      structure: "a single closed organic form that simultaneously reads as: an A letterform, a location pin, a heart, and a person with arms raised — four meanings unified by one continuous loop",
      principle: "closed organic forms feel sheltering and enclosing; when every element is derived from the same continuous curve (not assembled from separate icons), the result feels organic rather than designed",
    },
    {
      mark: "UNICEF wordmark + globe",
      structure: "clean sans-serif wordmark beside a simplified globe held by two hands — geometric reduction to absolute minimum so it functions across all languages and literacy levels",
      principle: "when your audience is the entire world, universality requires radical restraint; complexity reads as exclusivity; the mark must communicate without language or cultural context",
    },
    {
      mark: "WWF panda (Sir Peter Scott)",
      structure: "a panda face reduced to the minimum ink necessary for recognition — large black eye patches, black ears, small black nose on white ground; the mark works as an ink stamp, a silhouette, and at 10px",
      principle: "find the two or three high-contrast marks that define your subject's recognition signature, then make those and ONLY those; the white areas are not background — they are the panda's face; the negative space IS the animal",
    },
  ],
  Lover: [
    {
      mark: "Chanel interlocking CC (Coco Chanel)",
      structure: "two C letterforms interlocked so they share a common negative space — one C faces right, one faces left, and their overlap creates a third form that is neither letter",
      principle: "the overlap IS the mark; the interlocking creates a tension and a lock simultaneously; the most carefully designed element is the shared negative space between the two letters",
    },
    {
      mark: "Tiffany & Co. wordmark",
      structure: "refined Florentine-influenced serif wordmark — the typography itself is the symbol; the specific color (Tiffany Blue, Pantone 1837) functions as a second mark inseparable from the letterforms",
      principle: "when a color becomes so associated with a mark that it cannot be separated from it, the brand owns a sensation rather than a shape; the robin's egg blue is the logo as much as the letters",
    },
    {
      mark: "Dior CD monogram",
      structure: "C and D letterforms sharing a single vertical stroke as their common spine — the two letters become one form because they touch at their most structural element",
      principle: "two letters sharing a structural element creates a mark richer than either letter alone; the shared stem is the most precisely designed element — where the two identities become one",
    },
    {
      mark: "Hermès Duc carriage (Alfred de Dreux)",
      structure: "a highly detailed equestrian illustration (horse, two-wheeled carriage, groom with top hat) used as a logo with total conviction — the extreme detail is the luxury signal; no simplification was made",
      principle: "in luxury contexts, complexity executed with perfect craftsmanship IS the message; the detail says 'we have nothing to simplify because everything here is intentional'; this rule only works when every single line is flawless",
    },
  ],
  Jester: [
    {
      mark: "Mailchimp Freddie mark",
      structure: "a geometric chimp face reduced to: one rounded forehead shape, one winking eye, one open eye, one smile — four elements create a complete and memorable personality",
      principle: "personality lives in reduction; three or four precisely chosen geometric features communicate more emotion than a detailed illustration; the wink is the single element that carries all personality",
    },
    {
      mark: "Innocent smoothies halo",
      structure: "a plain lowercase wordmark with a hand-drawn halo floating above the dot of the letter 'i' — the entire brand personality lives in one tiny substitution (dot replaced by halo)",
      principle: "place the entire brand personality in one smallest-possible element; the surprise works because everything else is visually neutral — the halo's charm comes from the plainness of its context",
    },
    {
      mark: "M&Ms character mark",
      structure: "the product form (oval candy) becomes the character's face/body — the logo IS the product given a personality through minimal anatomical additions",
      principle: "when the product becomes the character, there is zero distance between brand and offer; the oval is simultaneously a candy and a face — this identity cannot be separated from what it sells",
    },
    {
      mark: "Slack hashmark (four rotated pills)",
      structure: "four pill-shaped rectangles arranged in a rotating 45° cross pattern, each in a different brand color — the form simultaneously reads as a # hash symbol (channels, tagging) and as a pinwheel of collaboration",
      principle: "rotate or reorient a standard symbol (the hash/pound sign) by 45° to make it newly ownable; the rotation transforms a keyboard character into a distinctive mark while retaining the functional association",
    },
  ],
  Everyman: [
    {
      mark: "Target bullseye",
      structure: "two concentric red circles — one large outer ring, one filled central circle; total element count: two; works perfectly as a 5-pixel favicon and as a 10-meter building sign",
      principle: "radical geometric reduction to two concentric circles achieves universal legibility at any scale; the mark works because there is nothing that can be removed; this is the Platonic form of a logo",
    },
    {
      mark: "IKEA logotype",
      structure: "bold geometric sans-serif wordmark in blue on a yellow oval — primary colors (blue+yellow), simple sans-serif, contained in an oval; every element signals accessibility and no-pretension",
      principle: "deliberate use of primary colors signals democratic accessibility; complexity reads as exclusivity; the mark is honest about what it is, which is the brand's highest value",
    },
    {
      mark: "Muji wordmark",
      structure: "black Helvetica wordmark on white, no symbol, no color, no framing — absolute refusal of any visual decoration as a philosophical design position",
      principle: "the absence of design IS the design; when a brand's position is 'no brand', the mark must embody emptiness as an aesthetic statement rather than a lack of ideas",
    },
    {
      mark: "McDonald's Golden Arches (Stanley Meston / Jim Schindler)",
      structure: "two parabolic golden arches that were the literal cross-section of the first McDonald's building roofline — the architecture became the logo; seen from the road, the two arches read as an M",
      principle: "derive the mark directly from something intrinsic to the brand (its architecture, its product shape, its founding geography) rather than inventing a symbol; when the mark IS the brand's physical reality, it has an authenticity no invented symbol can achieve",
    },
  ],
  Ruler: [
    {
      mark: "Mercedes-Benz tri-star",
      structure: "a three-pointed star enclosed in a circle — triple symmetry (120° rotational) within a perfect circle; the three points originally encoded land/sea/air mastery",
      principle: "classical three-fold symmetry creates a sense of completeness and dominion; the circle as container implies mastery of everything within it; encode the brand's territorial claim in the geometry",
    },
    {
      mark: "Rolex crown",
      structure: "a five-pointed heraldic crown simplified to clean vector geometry — each of the five points encodes a quality claim (quality, waterproofness, precision, self-winding, bracelet) from the brand's history",
      principle: "classical heraldic forms inherit centuries of authority association; simplify an archetypal symbol of power until only its most geometrically pure version remains — never add, only refine",
    },
    {
      mark: "Louis Vuitton LV monogram (Georges Vuitton)",
      structure: "interlocking L and V letterforms with quatrefoil and diamond flower motifs — the monogram tiles infinitely, becoming both a logo and an infinitely repeatable surface texture",
      principle: "when a monogram can tile and become a material culture object (a pattern on a bag), the logo transcends signage; the mark becomes a world the viewer can inhabit",
    },
    {
      mark: "Bulgari BVLGARI roman column lettering",
      structure: "the brand name spelled with V instead of U (Latin inscription convention), set in a custom serif that references Roman column engravings — the typography IS the claim of 2,000 years of classical authority",
      principle: "typography that references a specific historical letterform system (Roman inscriptions, Spencerian script, Bauhaus sans) borrows the entire cultural authority of that system; the choice of typographic tradition IS a statement of where the brand places itself in history",
    },
  ],
  Innocent: [
    {
      mark: "Glossier G mark",
      structure: "a capital G in a perfect circle — one letter, one circle, sans-serif, centered with equal internal spacing; the G is custom-drawn so its curves match the circle's curvature exactly",
      principle: "extreme reduction of a single letterform into a circle achieves timeless currency; when the letterform is drawn to mathematically relate to its container, the mark feels inevitable",
    },
    {
      mark: "Apple (first era): simple form reading",
      structure: "a bitten apple — the world's most universally recognized fruit, made singular through the strategic bite; the silhouette works at 1 pixel because it matches a shape everyone already has in memory",
      principle: "leverage pre-existing cultural memory; when a form exists in every human's mental library, you need only make it distinctive enough to own — the bite is that single degree of distinction",
    },
    {
      mark: "Airbnb bélo (structural reading)",
      structure: "a single-stroke closed loop with internal circular counter-form — the mark has no clear start or end point, suggesting continuity and belonging",
      principle: "a closed organic loop implies wholeness and belonging with no beginning and no end; the internal circle is a window, not a hole — the form shelters its interior",
    },
    {
      mark: "Hello Kitty face (Yuko Shimizu)",
      structure: "a cat face with eyes, ears, nose, whiskers — but deliberately NO mouth; the absence of the mouth makes the character infinitely expressive because the viewer projects their own emotion onto the blank face",
      principle: "strategic omission of an expected feature can make a mark universally resonant; when the viewer must complete the mark emotionally, they become co-authors of its meaning; decide what single expected element to withhold",
    },
  ],
};

// ─── DIFFUSION-NATIVE LOGO PROMPT ENGINE ──────────────────────────────────────
// Image models (Ideogram, Midjourney, Stable Diffusion) are bag-of-words pattern matchers.
// They fail when given abstract instructions ("design the absence") or real brand names ("Nike").
// This engine translates structural design intent into visual tokens the model understands.

function getShapePsychology(archetype: string): string {
  const t = archetype.toLowerCase();
  if (/(caregiver|innocent|lover|everyman|jester)/.test(t)) {
    return "circular and curved shapes (conveying humanity, warmth, protection, and community)";
  }
  if (/(ruler|sage|creator)/.test(t)) {
    return "square and rectangular shapes (conveying stability, trust, order, and professionalism)";
  }
  return "triangular and dynamic shapes (conveying innovation, power, movement, and growth)";
}

function deriveLogoExecutionProfile(
  ctx: ReturnType<typeof extractBrandContext>,
  data: BrandbookData
): "gestural" | "hybrid" | "geometric" | "balanced" {
  const marketing = data.typography.marketing;
  const category = (marketing?.category ?? "").toLowerCase();
  const usage = `${marketing?.usage ?? ""} ${ctx.logoStyle} ${ctx.toneOfVoice} ${ctx.personality}`.toLowerCase();
  const wantsGesture = /(script|signature|gest|caligr|cursive|manual|brush|human|warm|coloquial|organic|expressive)/.test(`${category} ${usage}`);
  const wantsGeometry = /(geometric|grid|modular|precise|minimal|clean|structured|system|vector)/.test(`${ctx.logoStyle} ${ctx.visualStyle}`.toLowerCase());

  if (wantsGesture && wantsGeometry) return "hybrid";
  if (wantsGesture) return "gestural";
  if (wantsGeometry) return "geometric";
  return "balanced";
}

function logoExecutionDirective(
  ctx: ReturnType<typeof extractBrandContext>,
  data: BrandbookData
): string {
  const profile = deriveLogoExecutionProfile(ctx, data);

  if (profile === "gestural") {
    return "EXECUTION PROFILE: human and expressive mark-making. Prefer organic curves, signature energy, natural stroke logic, and visible warmth. Avoid sterile corporate geometry or tech-startup neutrality.";
  }
  if (profile === "hybrid") {
    return "EXECUTION PROFILE: disciplined geometry fused with human warmth. The system should feel scalable and precise, but never cold; use expressive curve tension and personality-preserving form decisions.";
  }
  if (profile === "geometric") {
    return "EXECUTION PROFILE: geometric clarity and structural rigor. Use precise proportions, strong silhouette, and system-ready form, while still preserving the brand's emotional character.";
  }
  return "EXECUTION PROFILE: timeless brand identity balance. Use clear structure, confident silhouette, and emotional intelligibility without drifting into sterility or ornamental excess.";
}

function logoGovernanceDirective(
  ctx: ReturnType<typeof extractBrandContext>
): string {
  return [
    ctx.logoNamingRules,
    ctx.logoClearSpace ? `LOGO_CLEAR_SPACE: ${ctx.logoClearSpace}.` : "",
    ctx.logoMinimumSize ? `LOGO_MINIMUM_SIZE: ${ctx.logoMinimumSize}. The mark must remain fully legible and ownable at this reduction threshold.` : "",
    ctx.logoIncorrectUsages ? `LOGO_INCORRECT_USAGES: ${ctx.logoIncorrectUsages}. Treat every one of these as a hard prohibition, not as optional advice.` : "",
    ctx.logoFavicon ? `FAVICON_HINT: ${ctx.logoFavicon}.` : "",
  ].filter(Boolean).join(" ");
}

function logoSoulAnchor(ctx: ReturnType<typeof extractBrandContext>, data: BrandbookData): string {
  const lines: string[] = [];

  // Archetype → form guidance
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const archetypeFormMap: Record<string, string> = {
    Hero: "ascending angular forms, shield-like geometry, upward momentum, bold weight",
    Caregiver: "rounded embracing forms, open protective shapes, warm soft geometry",
    Explorer: "open horizon forms, path-suggesting lines, fragments implying journey",
    Sage: "precise symmetric geometry, golden-ratio proportions, grid-based construction",
    Outlaw: "deliberate asymmetry, unexpected angles, tension and breaking-point forms",
    Creator: "organic precision, visible construction process, tool-abstracted shapes",
    Ruler: "vertical imposing forms, crown abstractions, structural weight and authority",
    Magician: "transformation spirals, duality forms, impossible geometry, optical shifts",
    Lover: "sensuous curves, flowing connected forms, intimate touching shapes",
    Jester: "playful asymmetry, geometric surprise, implied movement and bounce",
    Innocent: "pure simple forms, perfect circles, lightness, minimal strokes",
    Everyman: "familiar accessible forms, honest shapes, unpretentious geometry",
  };

  const formGuidance = archetypeFormMap[archetypeName] ?? archetypeFormMap.Creator;
  lines.push(`ARCHETYPE_FORM_GUIDANCE: As a ${archetypeName} brand, the mark's geometry should embody: ${formGuidance}.`);

  // Brand purpose → visual translation
  if (ctx.purpose) lines.push(`BRAND_PURPOSE (encode this into the mark's meaning): "${ctx.purpose}".`);
  if (ctx.brandPromise) lines.push(`BRAND_PROMISE (the mark must visually embody this): "${ctx.brandPromise}".`);

  // Emotional core
  const igb = data.imageGenerationBriefing as Record<string, unknown> | undefined;
  const emotionalCore = igb?.emotionalCore as string | undefined;
  if (emotionalCore) lines.push(`EMOTIONAL_CORE (translate into geometry, NOT photography): ${emotionalCore}.`);

  // Industry grounding
  lines.push(`INDUSTRY: ${data.industry}. The mark must feel native to this sector while being distinctive within it.`);

  // Key personality traits → visual cues
  const personality = data.brandConcept.personality.slice(0, 3).join(", ");
  if (personality) lines.push(`PERSONALITY (infuse into form language): ${personality}.`);

  // Tone of voice → visual rhythm
  const tone = data.brandConcept.toneOfVoice;
  if (tone) lines.push(`TONE (translate verbal rhythm into visual rhythm): ${tone}.`);

  return lines.join(" ");
}

function buildDiffusionLogoPrompt(
  ctx: ReturnType<typeof extractBrandContext>,
  data: BrandbookData,
  provider: ImageProvider,
  variant: "light" | "dark"
): string {
  const isIdeogram = provider === "ideogram";
  const archetype = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const coreValue = ctx.values.split(",")[0]?.trim() ?? ctx.personality.split(",")[0]?.trim();

  // Priority chain for logo concept
  const symbolConcept = data.logo.symbolConcept
    ?? data.logo.semioticAnalysis?.denotation
    ?? (data.logo.symbol && !data.logo.symbol.startsWith("http") && !data.logo.symbol.toLowerCase().startsWith("abstract symbol for") ? data.logo.symbol : null)
    ?? `abstract mark that visually encodes: ${ctx.purpose}. Archetype: ${archetype}. Core value: ${coreValue}. Industry: ${data.industry}`;

  const palette = [ctx.primaryColor, ctx.secondaryColor, ctx.accentColor]
    .filter((color, index, arr) => arr.indexOf(color) === index)
    .slice(0, 3);
  const paletteDirective = palette.join(", ");
  const primaryRecognitionColors = data.colors.primary
    .slice(0, 2)
    .map((color) => `${color.name} (${color.hex})`)
    .join(" + ");

  const bg = variant === "light"
    ? "pure solid white #FFFFFF background"
    : "pure solid dark #0a0a0a background";

  const shapePsychology = (data.logo as unknown as Record<string, unknown>).shapePsychology as string | undefined
    ?? getShapePsychology(archetype);

  const execution = logoExecutionDirective(ctx, data);

  // ═══════════════════════════════════════════════════════════════
  // SIMPLIFIED LOGO PROMPT — Signal over noise
  // Structure: Medium → DNA → Concept → Typography → Color → Style
  // Target: ~3,000 chars (was ~7,200)
  // ═══════════════════════════════════════════════════════════════

  const sections: string[] = [];

  // 1. MEDIUM ANCHOR (50 chars — tells the model WHAT to make)
  sections.push(
    provider === "imagen"
      ? `A flat 2D vector corporate logo mark on ${bg}. No photorealism, no scenes, no 3D.`
      : `An isolated, minimalist, flat 2D vector logo for "${data.brandName}" centered on ${bg}.`
  );

  // 2. BRAND DNA SEED (500 chars — who this brand IS)
  sections.push(buildBrandDNASeed(data));

  // 3. SYMBOL CONCEPT — THE creative brief (400 chars — this is the HEART)
  sections.push(
    `SYMBOL CONCEPT (follow precisely — this is the single creative thesis):
${symbolConcept}
BUILD the mark around this one idea. Every geometric decision serves this concept. One mark, one thesis, total commitment. Shape Psychology: ${shapePsychology}. ${execution}`
  );

  // 4. TYPOGRAPHY (300 chars — wordmark requirements)
  sections.push(
    `WORDMARK: Feature the exact text "${data.brandName}" in ${ctx.displayFont} typography. Perfectly legible, unchanged spelling/spacing/punctuation.${isIdeogram ? ` PRECISION: preserve every character of "${data.brandName}" exactly as written.` : ""} Symbol and wordmark must feel like ONE coherent system, not disconnected parts.`
  );

  // 5. STRUCTURAL REFERENCE — 1 principle only (150 chars)
  const structRefs = (LOGO_STRUCTURAL_REFS as Record<string, Array<{mark: string; structure: string; principle: string}>>)[archetype];
  if (structRefs?.length) {
    const ref = structRefs[0];
    sections.push(`CONSTRUCTION PRINCIPLE (study logic, don't copy): ${ref.mark} — ${ref.principle}.`);
  }

  // 6. NEGATIVE SPACE (if exists)
  const negativeSpaceMetaphor = (data.logo as unknown as Record<string, unknown>).negativeSpaceMetaphor as string | undefined;
  if (negativeSpaceMetaphor) {
    sections.push(`OPTIONAL: Use negative space to encode: ${negativeSpaceMetaphor}. Only if it fits naturally.`);
  }

  // 7. COLOR SYSTEM (200 chars — palette discipline)
  sections.push(
    `COLORS: 2-3 colors from ${ctx.allColors}. Prioritize ${primaryRecognitionColors || paletteDirective}. No gradients, no decorative texture.`
  );

  // 8. STYLE ANCHOR (100 chars — final quality directive)
  sections.push(
    `STYLE: Timeless flat 2D, crisp edges, SVG-ready, strong at small sizes, memorable silhouette, premium but never ornamental.`
  );

  return sections.join("\n\n");
}

export function buildImagePrompt(key: AssetKey, data: BrandbookData, provider: ImageProvider): string {
  const ctx = extractBrandContext(data);
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const q = providerQuality(provider, key, archetypeName);
  const B = `"${data.brandName}"`;
  const generativeIntent = buildImageGenerationIntentSummary({
    brandbook: data,
    assetKey: key,
  });
  const prefix = providerPrefix(provider, key) + consistencyPrefix(ctx, data, key) + " " + generativeIntent + " ";
  const sTags = provider === "stability" ? stabilityTags(ctx, key) : "";
  const namingNegativeTerms = buildBrandNameFidelityNegativeTerms(data.brandName, data.logo.incorrectUsages ?? []).join(", ");

  const parts = (...lines: (string | false | undefined | null)[]): string =>
    lines.filter(Boolean).join(" ");

  const soul = soulAnchor(ctx);
  const journey = emotionalJourney(key, ctx);
  const sensory = sensoryDirectives(key, ctx);
  const camera = cameraDirective(key, ctx);
  const tree = styleAnchorTree(ctx, data);
  const idAssets = identityAssetsDirective(ctx, key);
  const spDir = structuredPatternDirective(ctx);
  const platCtx = socialPlatformContext(key, ctx);
  const humanLayer = humanEssenceLayer(key, ctx, data);

  switch (key) {

    case "logo_primary": {
      const basePrompt = buildDiffusionLogoPrompt(ctx, data, provider, "light");
      return parts(
        basePrompt, // DO NOT INCLUDE prefix, soul, journey, sensory, or tree! They leak illustrative context.
        sTags, q, neg(ctx, provider, `photography, photorealistic, 3D render, mockup, scene, environment, perspective distortion, background texture, table, wood, paper, drop shadow, glow, gradient, bevel, emboss, halo, outer glow, multiple logos, decorative frame, badge border, physical objects, people, buildings, vehicles, nature, literal illustrations, detailed art, drawing, sketch, complex patterns, ambiguous symbol, multiple competing metaphors, ornate micro-details, childish lettering, mascot style, generic ai logo aesthetics, disconnected icon and wordmark, arbitrary monogram, forced punctuation gimmick, decorative symbol unrelated to brand concept, ${namingNegativeTerms}`),
      );
    }

    case "logo_dark_bg": {
      const basePrompt = buildDiffusionLogoPrompt(ctx, data, provider, "dark");
      return parts(
        basePrompt, // DO NOT INCLUDE prefix, soul, journey, sensory, or tree! They leak illustrative context.
        `VARIANT: Dark background version. Create the same conceptual mark (same symbol concept, same construction logic, same proportions) but optimized for dark backgrounds. Primary palette reversed: light elements on ${ctx.primaryColor} or deep brand color background. The mark's meaning and recognition must be identical to the light version.`,
        sTags, q, neg(ctx, provider, `photography, photorealistic, 3D render, mockup, scene, environment, bokeh, gradient background, lighting effects, glow, 3D, perspective, bevel, emboss, halo, physical objects, people, buildings, vehicles, nature, literal illustrations, detailed art, drawing, sketch, complex patterns, ambiguous symbol, multiple competing metaphors, ornate micro-details, childish lettering, mascot style, generic ai logo aesthetics, disconnected icon and wordmark, arbitrary monogram, forced punctuation gimmick, decorative symbol unrelated to brand concept, ${namingNegativeTerms}`),
      );
    }

    case "brand_pattern": {
      const brandMotifs: string[] = [];
      if (data.keyVisual.patterns?.length) brandMotifs.push(`Pattern DNA: ${data.keyVisual.patterns.slice(0, 5).join(", ")}`);
      if (data.keyVisual.flora?.length) brandMotifs.push(`Flora elements: ${data.keyVisual.flora.slice(0, 4).join(", ")} — use as organic rhythm accents at varying scales`);
      if (data.keyVisual.fauna?.length) brandMotifs.push(`Fauna silhouettes: ${data.keyVisual.fauna.slice(0, 4).join(", ")} — abstract into geometric forms`);
      if (data.keyVisual.objects?.length) brandMotifs.push(`Brand objects: ${data.keyVisual.objects.slice(0, 4).join(", ")} — simplified iconic representations`);
      if (data.keyVisual.symbols?.length) brandMotifs.push(`Symbols: ${data.keyVisual.symbols.slice(0, 4).join(", ")}`);
      if (ctx.logoSymbol) brandMotifs.push(`Logo root: deconstruct "${ctx.logoSymbol}" into arcs, angles, lines and weave throughout`);

      const patternEls = brandMotifs.length > 0
        ? `MOTIF VOCABULARY — use ONLY these brand-derived elements, do not invent unrelated motifs:\n${brandMotifs.map((m) => `  • ${m}`).join("\n")}`
        : `MOTIF VOCABULARY: Geometric abstractions derived from the brand symbol: ${ctx.logoSymbol}. Deconstruct the symbol into its fundamental shapes (circles, lines, angles, curves) and recombine them into a repeating system.`;
      const ppat = ctx.primaryPattern;
      const patternDirective = ppat
        ? `PRIMARY PATTERN SPEC: "${ppat.name}" — ${ppat.composition}. Visual density: ${ppat.density ?? "moderate"}. Background ground: ${ppat.background ?? "neutral"}. Application contexts: ${ppat.usage ?? "packaging, stationery, backgrounds"}.`
        : `PATTERN DIRECTION: ${ctx.patternStyle}.`;

      // Enrich motif vocabulary with the pattern engine's structured analysis
      const patternEngineElements = extractElements(data);
      const enrichedMotifs = buildMotifVocabulary(patternEngineElements);

      // Determine the pattern construction technique based on what's available
      const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
      const patternTechnique: Record<string, string> = {
        Ruler: "CONSTRUCTION: Rigid bilateral symmetry. Imperial lattice grid. Gold-ratio proportioned cells. Heraldic precision. Think Versace home textiles, Hermès scarves — authoritative, unwavering geometry.",
        Lover: "CONSTRUCTION: Flowing organic curves that interweave. Art Nouveau-inspired sinuous lines. Botanical or floral abstractions with sensual rhythms. Think William Morris meets modern luxury — intimate and tactile.",
        Jester: "CONSTRUCTION: Playful irregular grid with surprising scale shifts. Memphis Group inspired — unexpected color blocking, confetti-like scattered motifs, energetic diagonal rhythms. Fun but controlled chaos.",
        Explorer: "CONSTRUCTION: Topographic contour lines, compass rose fragments, map-grid abstractions. Layered translucent shapes suggesting terrain and journey. Think Patagonia meets cartographic art.",
        Sage: "CONSTRUCTION: Swiss-grid precision. Clean geometric modules on mathematical grid. Mondrian-like proportional cells. Information-density patterns (dot grids, hash marks, data-viz inspired). Think Braun design ethos.",
        Caregiver: "CONSTRUCTION: Soft rounded shapes, gentle organic tessellation. Overlapping circles, protective arcs, nest-like enclosed forms. Warm negative space. Think Scandinavian textile design — comforting, rhythmic.",
        Outlaw: "CONSTRUCTION: Deconstructed grid with intentional disruptions. Rough-edged geometric fragments, torn-paper-like shapes, industrial stencil marks. Controlled grunge. Think Banksy studio patterns — raw but designed.",
        Hero: "CONSTRUCTION: Bold angular chevrons, upward-pointing arrows, shield-like shapes. Strong diagonal energy with triumphant momentum. Thick confident stroke weights. Think Nike/Adidas pattern systems — powerful geometry.",
        Magician: "CONSTRUCTION: Ethereal layered geometries with depth illusion. Impossible tessellations, Escher-inspired interlocking. Radial symmetry with mystical precision. Celestial/alchemical symbols abstracted into geometry.",
        Everyman: "CONSTRUCTION: Honest simple shapes — dots, dashes, basic triangles. Friendly grid with breathing room. Craft-paper-appropriate. Think MUJI or IKEA patterns — approachable, democratic, unpretentious.",
        Innocent: "CONSTRUCTION: Light, airy geometric lattice with generous whitespace. Minimal thin-line motifs. Pastel-weight shapes floating in clean space. Think Apple packaging tissue, Glossier — pure and optimistic.",
        Creator: "CONSTRUCTION: Hand-drawn-feeling geometric system. Visible construction lines, deliberate imperfections in perfect grids. Process-visible: the viewer can sense HOW it was designed. Think Pentagram identity systems.",
      };
      const technique = patternTechnique[archetypeName] ?? patternTechnique.Creator;

      return parts(
        prefix,
        `TASK: Create a professional-grade seamless surface pattern for the brand "${B}" (${data.industry}). This pattern is the brand's visual TEXTURE — it appears on packaging, stationery, website backgrounds, textiles, wall coverings, and event materials. It must be world-class.`,
        soul, journey, spDir, idAssets, tree,
        patternDirective,
        patternEls,
        enrichedMotifs ? `SUPPLEMENTAL MOTIF ANALYSIS (pattern engine): ${enrichedMotifs}` : "",
        technique,
        `STRICT COLOR PALETTE — use ONLY these exact colors, absolutely no others: ${ctx.allPrimaryColors}. Background may use a very light tint (5-10% opacity) of the primary color, or pure white, or pure ${ctx.primaryColor} depending on density.`,
        `VISUAL LANGUAGE: ${ctx.visualStyle}. Mood: ${ctx.moodWords}.`,
        ctx.illustrationStyle ? `ILLUSTRATION STYLE REFERENCE: ${ctx.illustrationStyle}. Apply this artistic sensibility to the pattern construction.` : "",
        humanLayer,
        // Core technical requirements
        `SEAMLESS TILING RULES (CRITICAL):
1. The pattern MUST tile perfectly when repeated horizontally and vertically — edges must connect with mathematical precision.
2. Use a clear underlying GRID SYSTEM (square, triangular, hexagonal, or diamond) — do not scatter motifs randomly.
3. Maintain consistent STROKE WEIGHT across all elements (thin: 1-2px, medium: 3-4px, or thick: 5-8px — pick one and commit).
4. Establish clear HIERARCHY: primary motif (60%), secondary accent motif (30%), negative space breathing room (10%).
5. The REPEAT UNIT should feel intentional and rhythmic, not chaotic or random.
6. At 50% zoom the overall texture should read as an even surface. At 100% zoom individual motifs should be beautiful.
7. DENSITY: Leave adequate negative space — overcrowded patterns look amateur. The space between motifs is as designed as the motifs themselves.`,
        `WHAT MAKES A PATTERN WORLD-CLASS: Restraint (fewer motifs, perfectly placed > many motifs scattered). Rhythm (visual pulse the eye can follow). Depth (subtle weight variation creates foreground/background). Intentionality (every element has a reason to exist). Brand derivation (motifs trace back to the logo/symbol DNA).`,
        `MULTI-LAYER COMPOSITION (CRITICAL for depth and richness):
Layer 1 — GROUND: Solid color or very subtle texture base using primary brand color at 5-10% opacity.
Layer 2 — RHYTHM: Primary motifs (largest) at regular intervals creating the visual pulse and brand recognition.
Layer 3 — ACCENT: Secondary motifs (medium) filling negative spaces, creating depth and visual interest.
Layer 4 — DETAIL: Micro-elements (dots, thin lines, tiny symbols) adding refinement and premium texture.
The viewer should discover new details at each zoom level — overall texture at 50%, beautiful motifs at 100%, micro-refinement at 200%.`,
        `FORMAT: Square 1:1 composition showing the full repeat unit. Flat vector-style illustration (no 3D, no shadows, no gradients, no photographic textures). Clean, precise, professional.`,
        `ABSOLUTELY NO: text, words, letters, logos, wordmarks, brand names, human figures, realistic objects, photographic elements, lens flares, drop shadows, 3D effects, watermarks. PURE pattern only.`,
        sTags, q, neg(ctx, provider, "visible seams, text, words, letters, logos, wordmarks, brand name, photographic content, random noise, asymmetric scattered layout, gradient washes, 3D effects, drop shadows, blurry edges, inconsistent stroke weights, overcrowded composition, realistic objects, human figures"),
      );
    }

    case "brand_mascot": {
      const m = ctx.mascot;
      const mascotIdentity = m
        ? `MASCOT CHARACTER: Name="${m.name}". Physical appearance: ${m.description}. Inner personality: ${m.personality}. This character IS the brand's human face — every trait connects to a brand value.`
        : `MASCOT: Create a brand mascot derived from the logo symbol (${ctx.logoSymbol}) and the STYLE_TREE motifs. The character should personify ${ctx.personality}.`;
      const usage = m?.usageGuidelines?.length
        ? `USAGE & POSE GUIDELINES: ${m.usageGuidelines.slice(0, 5).map((g, i) => `${i + 1}) ${g}`).join(". ")}. Translate these guidelines into the character's pose, expression, and context.`
        : "USAGE: Must work as a repeatable brand character across campaigns, social posts, stickers, and merchandise.";
      return parts(
        prefix,
        `Design a professional brand mascot character for ${B} (${data.industry}).`,
        soul, journey, tree,
        mascotIdentity,
        usage,
        ctx.illustrationStyle ? `ILLUSTRATION STYLE: ${ctx.illustrationStyle}. Apply this technique to the character.` : "",
        humanLayer,
        `DESIGN PHILOSOPHY: The mascot must be instantly recognizable in silhouette alone. Scalable from 64px favicon to poster. Animation-ready with consistent proportions. The character should feel like it has a life beyond this single image.`,
        `STYLE: premium modern 2D illustration, crisp edges, consistent line weights, minimal shading (flat color with max 2 shadow tones), no 3D, no photorealism.`,
        `PALETTE (strict): ${ctx.allColors}. ${ctx.primaryColor} as the primary recognition color — apply to the most distinctive feature (hat, scarf, accessory, marking), NOT as the entire body color. The character needs natural body tones with strategic brand-color accents for recognition. ${ctx.accentColor} for expressive details (eyes, accessories, small highlights).`,
        `EXPRESSION & POSE: The character's default expression should embody ${ctx.toneOfVoice}. Body language should communicate ${ctx.moodWords}.`,
        `COMPOSITION: centered full-body character, clear negative space around, square 1:1 framing. The character should feel grounded, not floating.`,
        `BACKGROUND: clean solid background (white or very light tint of ${ctx.secondaryColor}). No scene, no props.`,
        `NO TEXT. No wordmark. No readable lettering anywhere.`,
        sTags, q, neg(ctx, provider, "photorealistic, 3D render, complex background, clutter, gradients, heavy shadows, watermark, text, wordmark, deformed anatomy, extra limbs, inconsistent proportions"),
      );
    }

    case "hero_visual": {
      const brandDNA = buildBrandDNASeed(data);
      const intentCopy = ctx.sampleHeadline
        ? `This image appears beside headline: "${ctx.sampleHeadline}".`
        : `Must visually communicate: ${ctx.uniqueValue}.`;
      return parts(
        prefix,
        brandDNA,
        `PLATFORM: Website hero / key visual banner for ${B} (${data.industry}) — 16:9 widescreen cinematic composition.`,
        soul, journey,
        `INTENT: This is the brand's first visual handshake with the world. It must establish positioning, credibility, and emotional territory in one image. Not a generic "landing page" — this is a brandbook key visual.`,
        `TARGET VIEWER: ${ctx.userPsychographics}.`,
        `CORE MESSAGE TO VISUALIZE: ${ctx.messagingPillar}.`,
        intentCopy,
        ctx.tagline,
        `VISUAL SUBJECT: Cinematic interpretation of ${ctx.visualMetaphor}. The subject should feel like a still frame from the brand's origin story.`,
        `INDUSTRY-SPECIFIC VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `Art direction: ${ctx.photoStyle}. Visual architecture: ${ctx.marketingArch}.`,
        `CREDIBILITY embedded in imagery: ${ctx.reasonsToBelieve}.`,
        ctx.competitiveAngle,
        `Brand elements: ${ctx.elements}. Artistic references: ${ctx.artisticRef}.`,
        tree, idAssets,
        humanLayer,
        `COLOR GRADING: ${ctx.colorMood}. Dominant ${ctx.primaryColor}, accent ${ctx.secondaryColor}. Cinematic LUT applied.`,
        sensory,
        `CAMERA: ${camera}.`,
        `LIGHTING: Dramatic three-point cinematic light adapted to ${archetypeName} archetype. Key light from upper-left. Deep shadow falloff creates depth and mystery.`,
        `COMPOSITION: ${ctx.composition}. Foreground-to-background depth layers. Rule of thirds with intentional tension point.`,
        `MOOD: ${ctx.moodWords}. The image should make the viewer pause and feel something before reading any text.`,
        sTags,
        `COPY SPACE: Keep a clean negative space area (left or right third) for website headline overlay. No text or logos in the image.`,
        q, neg(ctx, provider, "text overlays, logos, generic stock photography, flat even lighting, overcrowded scene, centered subject"),
      );
    }

    case "hero_lifestyle": {
      return parts(
        prefix,
        buildBrandDNASeed(data),
        `PLATFORM: Editorial lifestyle photography for ${B} (${data.industry}) — brandbook application for web, campaigns, and social.`,
        soul, journey,
        `INTENT: Human storytelling. Show a real person living the brand promise — the AFTER state, the desired outcome achieved. This must feel like a documentary moment, not a stock photo.`,
        `SUBJECT: ${ctx.userPsychographics}. Authentic, unstaged moment in their natural environment. They are not performing for the camera.`,
        `NARRATIVE ARC: ${ctx.painPoints} → RESOLVED. The image shows the outcome, the relief, the success. The viewer should think "I want to be there."`,
        `SCENE: ${ctx.audienceDesc} in a realistic ${data.industry} context — relaxed, confident, successful.`,
        `INDUSTRY SCENE LANGUAGE: ${ctx.industryLang}.`,
        idAssets,
        humanLayer,
        `VISUAL LANGUAGE: ${ctx.photoStyle}. ${ctx.colorMood}.`,
        `Brand color ${ctx.primaryColor} organically present in environment — a clothing detail, a wall, a prop, natural light reflection. Never forced, never painted on.`,
        `EMOTIONAL CORE: ${ctx.messagingPillar}. Viewer should feel: ${ctx.moodWords}.`,
        ctx.competitiveAngle,
        sensory,
        `CAMERA: ${camera}.`,
        (() => {
          const filmRef = /tech|digital|futur|innov/i.test(data.industry)
            ? "clean digital clarity, slight teal-and-orange color grade"
            : /luxury|fashion|premium|beauty/i.test(data.industry)
              ? "Fuji Pro 400H palette, smooth highlight roll-off"
              : "Kodak Portra 400 palette with subtle grain";
          return `LIGHTING: Golden hour or soft diffused daylight. Warm key 3200K, cool fill 5600K. Film-like tonal range — ${filmRef}.`;
        })(),
        `PEOPLE: Authentic, diverse, non-model-perfect. Real micro-expressions — not corporate smiling. Candid or near-candid. Hands doing something meaningful.`,
        `${ctx.artisticRef} editorial approach. Wide 16:9. Left or center third kept clear for optional copy overlay.`,
        `No logos visible, no text on clothing, no brand placement that breaks the documentary spell.`,
        sTags, q, neg(ctx, provider, `overly posed, fake corporate smile, stock photo aesthetic, generic office, plastic-looking skin, HDR overprocessing, visible branding on clothing${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "instagram_carousel": {
      return parts(
        prefix,
        `IMPORTANT: Focus on the CONTENT IMAGE itself, not the platform UI. Do not attempt to render interface text, buttons, follower counts, or navigation elements — these will be unreadable. Generate only the visual content that would appear in this format.`,
        `A branded Instagram carousel post image for ${B}. Square 1:1 format.`,
        soul, platCtx,
        `THE POST CONTENT (the square image inside the frame): A bold, editorial first slide designed to stop the scroll. ${ctx.marketingArch}. Dominant color: ${ctx.primaryColor}. Brand visual: ${ctx.visualMetaphor}.`,
        `POST DESIGN STYLE: Clean graphic design — NOT a random photo. Think @spotify, @stripe, @linear carousel content. Bold typography zones (placeholder blocks, not real text), strong brand color blocks, one hero visual element.`,
        `INDUSTRY: ${data.industry}. INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        idAssets,
        `COLOR PALETTE (strict): ${ctx.allPrimaryColors}. High-contrast accent: ${ctx.accentColor}.`,
        `MOOD: ${ctx.moodWords}. Social-native, premium, thumb-stopping.`,
        humanLayer,
        sTags, q, neg(ctx, provider, `abstract art without context, no phone frame, no app interface, generic gradient, floating graphics without platform context${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "instagram_story": {
      return parts(
        prefix,
        buildBrandDNASeed(data),
        `IMPORTANT: Focus on the CONTENT IMAGE itself, not the platform UI. Do not render interface text, buttons, or navigation.`,
        `A branded Instagram Story visual for ${B}. Full-bleed vertical 9:16 format.`,
        soul, platCtx,
        `THE STORY CONTENT (full-bleed 9:16 behind the UI): Branded visual in ${ctx.primaryColor} dominant, ${ctx.secondaryColor} accent. ${ctx.visualMetaphor} as hero element in the center. Brand pattern or gradient as background. Clean, vertical, mobile-first design.`,
        `STORY DESIGN STYLE: Think branded Instagram Stories by @airbnb, @nike, @notion — not a random photo. Graphic design with intentional layout: hero visual center, brand color background, maybe a sticker-like CTA element ("Swipe up", poll, quiz visual — just the visual shape, no real text).`,
        `INDUSTRY: ${data.industry}. Purpose: ${ctx.purpose}. Personality: ${ctx.personality}.`,
        `COLOR: Full-bleed ${ctx.primaryColor} background with ${ctx.accentColor} accent elements. Strict palette: ${ctx.allPrimaryColors}.`,
        `Key visual elements: ${ctx.elements}.`,
        `MOOD: ${ctx.moodWords}. Immediate, bold, vertically dynamic.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "horizontal layout, abstract floating graphics, landscape orientation"),
      );
    }

    case "social_cover": {
      return parts(
        prefix,
        buildBrandDNASeed(data),
        `IMPORTANT: Focus on the CONTENT IMAGE itself, not the platform UI. Do not render interface text, buttons, or navigation.`,
        `A branded social media cover banner for ${B}. Wide 16:9 format, suitable for LinkedIn or similar platform header.`,
        soul, platCtx,
        `THE BANNER CONTENT (16:9 inside the LinkedIn frame): Bold brand graphic. Dominant ${ctx.primaryColor} background. ${ctx.visualMetaphor} as abstract geometric/graphic element on the right 60%. Left 35% kept clean (profile photo overlaps here).`,
        `BANNER DESIGN STYLE: Professional, premium, architectural. Think Stripe, Linear, Figma LinkedIn pages — strong brand presence without being busy. ${ctx.marketingArch}. ${ctx.visualStyle}.`,
        `KEY VISUAL ELEMENTS: ${ctx.elements}. ${ctx.accentColor} accent stripe or highlight.`,
        `INDUSTRY: ${data.industry}. Brand message: ${ctx.messagingPillar}.`,
        `COLOR: ${ctx.primaryColor} dominant, ${ctx.secondaryColor} structural accent, ${ctx.accentColor} highlight. Strict palette.`,
        `MOOD: ${ctx.moodWords}. Confident, credible, premium.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "text overlays on banner, generic corporate clip art, low contrast"),
      );
    }

    case "social_post_square": {
      return parts(
        prefix,
        buildBrandDNASeed(data),
        `IMPORTANT: Focus on the CONTENT IMAGE itself, not the platform UI. Do not render interface text, buttons, or navigation.`,
        `A branded social media post image for ${B}. Square 1:1 format for Instagram feed.`,
        soul, platCtx,
        `THE POST IMAGE (square, inside the frame): A strong branded visual — ${ctx.marketingArch}. Bold, single-minded graphic design piece. NOT a random photo — a designed post with clear brand identity.`,
        `POST DESIGN: ${ctx.visualMetaphor} rendered as graphic content. Dominant ${ctx.primaryColor}. Brand pattern or solid color background. One hero element. Clean composition that reads in 0.5 seconds in a feed thumbnail.`,
        `INDUSTRY: ${data.industry}. Personality: ${ctx.personality}.`,
        ctx.sampleCTA ? `Visual CTA energy: the post suggests "${ctx.sampleCTA}".` : "",
        idAssets,
        `COLOR PALETTE (brand-strict): ${ctx.allColors}. Dominant: ${ctx.primaryColor}.`,
        `STYLE: Think @stripe, @notion, @linear, @figma — designed feed content, not stock photos. ${ctx.visualStyle}.`,
        `MOOD: ${ctx.moodWords}. Social-native, recognizable, save-worthy.`,
        humanLayer,
        sTags, q, neg(ctx, provider, `abstract artwork, generic stock imagery, overcrowded${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "youtube_thumbnail": {
      return parts(
        prefix,
        `RENDER A REALISTIC YOUTUBE VIDEO PAGE or search results showing a video by ${B} with its thumbnail visible.`,
        `MANDATORY MOCKUP: Show either (A) the YouTube video player page with the thumbnail as the video preview (play button overlay, duration badge "12:34" bottom-right, video title "${data.brandName} — ${ctx.messagingPillar?.slice(0, 40) ?? data.industry}" below), channel name, views count, OR (B) a YouTube search/recommended sidebar showing the thumbnail at small scale alongside other video suggestions. The thumbnail must work at tiny scale.`,
        soul, platCtx,
        `THE THUMBNAIL CONTENT (16:9, inside the frame): High-contrast, bold, maximum visual impact. ${ctx.visualMetaphor} as dominant subject — close-up, hyper-sharp, taking 55% of frame. Background: solid ${ctx.primaryColor} or strong gradient to ${ctx.secondaryColor}. ${ctx.accentColor} rim light or highlight accent.`,
        `THUMBNAIL DESIGN: Reference top creators — MrBeast, Kurzgesagt, MKBHD, top ${data.industry} channels. Bold graphic treatment, extreme contrast, reads at 168×94px. Brand palette: ${ctx.allPrimaryColors}.`,
        `INDUSTRY: ${data.industry}. Brand: ${B}. ${ctx.tagline}`,
        `MOOD: ${ctx.moodWords}. Clickable, bold, premium, unmistakable.`,
        `LIGHTING: Dramatic rim light in ${ctx.accentColor}, dark shadow depth.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "no YouTube UI, isolated thumbnail without platform context, low contrast, muddy tones, flat lighting, blurry"),
      );
    }

    case "presentation_bg": {
      return parts(
        prefix,
        `PLATFORM: Presentation slide background — 16:9 widescreen for PowerPoint/Keynote/Google Slides.`,
        `DESIGN INTENT: Silent brand presence. Must NOT compete with slide text or charts. Audience reads the slide content, not the background.`,
        `BRAND: ${B} (${data.industry}). Purpose: ${ctx.purpose}. Personality: ${ctx.personality}.`,
        `VISUAL SUBJECT: Extremely subtle ${ctx.visualMetaphor} — abstracted to near-invisibility.`,
        `DESIGN: Semi-abstract micro-geometry from ${ctx.logoSymbol}. Elements: ${ctx.elements} — suggested, not shown.`,
        `BASE TONE: ${ctx.primaryColor} very dark or very light interpretation — maximum 15% saturation.`,
        `Geometric motifs in ${ctx.accentColor} at 8–15% opacity. Gradient vignette toward edges.`,
        `COLOR RULE: Monochromatic brand palette only. Varying opacity 5–20%. Never full-saturation. Never photographic.`,
        `COMPOSITION: Visual texture in far corners and edges. Center 60% of frame must be plain and flat — this is the content zone.`,
        `Bottom-left or top-right: subtle brand motif at 10% opacity.`,
        journey,
        `MOOD: ${ctx.moodWords} — but whispered, not shouted. Background is the frame, not the art.`,
        sTags, q, neg(ctx, provider, "busy pattern, high saturation, distracting, photographic, text, logos, centered elements"),
      );
    }

    case "email_header": {
      return parts(
        prefix,
        `PLATFORM: E-mail marketing header banner — ultra-wide 21:9 (600px email standard, will render as thin horizontal strip).`,
        `MARKETING INTENT: Increase open-to-click rate. First visual after subject line. 70% of opens are mobile — must work at 320px wide.`,
        `Viewer context: ${ctx.audienceDesc} who just opened a ${B} email. They have 2 seconds before deciding to scroll or close.`,
        `CORE MESSAGE TO SUPPORT: ${ctx.messagingPillar}. Proof: ${ctx.pillarProofPoints}.`,
        ctx.sampleCTA ? `EMOTIONAL DIRECTION: The banner visually primes the viewer for the CTA "${ctx.sampleCTA}" below it.` : "",
        ctx.tagline,
        `VISUAL DESIGN: ${ctx.marketingArch}. Clean, horizontal, immediately branded.`,
        `COLOR: ${ctx.primaryColor} dominant field. ${ctx.secondaryColor} accent. Flat or subtle gradient — never photographic background.`,
        `VISUAL ELEMENT: ${ctx.elements} — abstracted, single motif, left-anchored. Thin horizontal strip composition.`,
        `COMPOSITION: Left 30%: brand visual/motif in ${ctx.accentColor} or ${ctx.secondaryColor}. Right 70%: clean flat ${ctx.primaryColor} field for headline text overlay.`,
        `MOOD: ${ctx.moodWords}. Tone: ${ctx.toneOfVoice}. Minimal, premium, brand-consistent.`,
        journey,
        `${ctx.visualStyle}. No actual text — graphic background layer only.`,
        sTags, q, neg(ctx, provider, `text, lorem ipsum, photographic busy background, centered composition, multiple elements${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "app_mockup": {
      const uxLayout = data.uxPatterns?.dashboardLayout ?? `clean ${data.industry} dashboard with data visualizations`;
      return parts(
        prefix,
        `PHOTOREALISTIC PRODUCT PHOTOGRAPHY of a real iPhone 15 Pro displaying the ${B} app — 9:16 format.`,
        soul, journey,
        `MANDATORY DEVICE FRAME: Show a REAL iPhone 15 Pro (titanium frame, Dynamic Island visible at top) held in a person's hand (face NOT visible, just hand and forearm). The phone screen shows the ${B} app interface. The phone is a REAL physical object with titanium edge reflections, glass screen with subtle ambient reflections, and realistic screen luminosity.`,
        `APP INTERFACE ON SCREEN: ${uxLayout}. The screen shows a REALISTIC ${data.industry} app — not a generic UI kit. Include: branded navigation bar with logo (${ctx.logoSymbol}), ${ctx.primaryColor} accent buttons, real-looking data/content specific to ${data.industry}, branded status indicators.`,
        `BRAND: ${B}. ${ctx.brandApplications}.`,
        `UI COLOR SYSTEM: ${ctx.primaryColor} for primary actions/nav bar, ${ctx.secondaryColor} for surfaces, ${ctx.accentColor} for CTAs. White/dark content areas.`,
        `TYPOGRAPHY on screen: ${ctx.displayFont} Bold for headers, ${ctx.bodyFont} for body. Brand visual signature: ${ctx.elements}.`,
        `SCREEN CONTENT: Meaningful ${data.industry} data — charts, metrics, content cards. ${ctx.messagingPillar}.`,
        `ENVIRONMENT: Person holding phone in a real context — café table, office desk, or outdoor setting. Blurred background with warm ambient light. NOT a studio void.`,
        `LIGHTING: Natural ambient + screen glow illuminating the user's hand. Titanium frame catching light. Premium Apple product photography standard.`,
        `CAMERA: 85mm f/1.8, phone screen sharp, background beautifully blurred. Slight 10° rotation for natural hold angle.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "generic UI template, lorem ipsum, flat perspective, plastic device, white void, floating phone, no hand, CGI render, wireframe"),
      );
    }

    case "business_card": {
      return parts(
        prefix,
        `PHOTOREALISTIC MACRO PHOTOGRAPHY of ${B} business cards on a premium surface — 16:9 format.`,
        soul, journey, sensory,
        `SCENE: Two business cards on a dark marble or natural stone surface. FRONT card: angled at 15°, showing the clean face with logo. BACK card: partially overlapping, showing the reverse design. A pen or small brand element (wax seal, branded sticker) nearby for scale and context. This is REAL PHOTOGRAPHY — card edge thickness visible, paper fiber texture at macro level, subtle surface reflection.`,
        `CARD FRONT: Logo (${ctx.logoPrimary}) upper-left or centered, dominant ${ctx.primaryColor} minimal layout, generous white space. Typography: ${ctx.displayFont} for name, ${ctx.bodyFont} for contact info.`,
        `CARD BACK: Solid ${ctx.primaryColor} field or brand pattern (${ctx.patternStyle}) full-bleed. Minimal — logo symbol (${ctx.logoSymbol}) small centered, or full pattern. Brand system coherence.`,
        `BRAND: ${B}. Applications: ${ctx.brandApplications}.`,
        `PAPER STOCK: 350-400gsm cotton, with visible texture — either soft-touch matte, letterpress deboss, or foil stamp detail. Premium card stock that photographs as TACTILE and HEAVY.`,
        `SURFACE: Dark Carrara marble, polished concrete, or slate. One premium material — not cluttered with props.`,
        `LIGHTING: Soft directional 45° studio light, long elegant shadows from card edges. Rim light catching foil/emboss detail. Paper texture visible. 50mm macro quality.`,
        `CAMERA: 90mm f/2.8 macro, 30° overhead angle. Front card sharp, back card slightly soft. Cinematic depth.`,
        `MOOD: ${ctx.moodWords}. Premium, confident, tactile. The card you keep in your wallet and show people.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "flat illustration, cartoon, plastic surface, harsh lighting, cheap paper, white void background, CGI, no surface texture"),
      );
    }

    case "brand_collateral": {
      return parts(
        prefix,
        `PHOTOREALISTIC EDITORIAL FLAT-LAY PHOTOGRAPHY of the complete ${B} stationery system — 4:3 overhead format.`,
        soul, journey, sensory,
        `SCENE: Overhead 90° flat-lay on a premium surface (Carrara marble, raw concrete slab, or natural linen). 8-10 branded stationery items arranged with INTENTIONAL editorial precision — slight overlapping, deliberate angles, breathing room between groups. This is a real photograph shot for a brand guidelines book or Behance case study. Every item's paper texture, foil stamp, emboss detail must be visible.`,
        `ITEMS (ALL visible): Business card front+back (stacked pair), A4 letterhead sheet (partially visible), branded notebook with embossed logo, quality metal pen, DL envelope with wax seal, brand sticker sheet, branded tape roll or small seal stamp. Each item is a unique touchpoint.`,
        `BRAND: ${B}. Applications: ${ctx.brandApplications}.`,
        `BRANDING: All items use ${ctx.logoPrimary} logo, ${ctx.primaryColor} color, brand pattern (${ctx.patternStyle}). Every piece MUST look like part of the same family — same paper quality, same print finish, same design language.`,
        `STRICT COLOR: ${ctx.allPrimaryColors} only — no off-brand colors on ANY item. Surface color is neutral.`,
        `FINISHING DETAILS: Foil stamp on business card, embossed logo on notebook cover, wax seal on envelope (${ctx.accentColor}), letterpress on sticker. Premium tactile finishes visible in the photography.`,
        `LIGHTING: Soft natural window light from upper-left (10:00 position), 45° angle. Crisp soft shadows. Each item casts a gentle shadow revealing its thickness and materiality. Editorial luxury — Kinfolk or Cereal magazine quality.`,
        `CAMERA: 50mm f/5.6, perfectly overhead. All items in focus. Premium paper textures and finishing details sharp.`,
        `MOOD: ${ctx.moodWords}. Tasteful, editorial, premium. Every item whispers "this brand cares about every detail."`,
        humanLayer,
        sTags, q, neg(ctx, provider, "plastic surfaces, harsh shadows, poor lighting, off-brand colors, generic office supplies, cheap materials, CGI, illustration, white void"),
      );
    }

    case "delivery_packaging": {
      return parts(
        prefix,
        `PHOTOREALISTIC EDITORIAL PHOTOGRAPHY of a complete delivery packaging system for ${B} — 4:3 format.`,
        soul, journey, sensory,
        `SCENE: A real kitchen counter or marble/wood table in a well-lit restaurant or home. The COMPLETE delivery kit is arranged in an editorial flat-lay composition (overhead 90° or 3/4 angle at 35°). This is a REAL PHOTOGRAPH of real physical objects — paper texture, fold creases, printing registration marks all visible. Think Bon Appétit or Kinfolk magazine product styling.`,
        `ITEMS IN THE KIT (ALL visible): branded paper bag (standing), main food box/container (closed), drink cup with branded sleeve, paper napkins with logo stamp, cutlery sleeve (kraft or printed), seal sticker, small thank-you card. 7+ distinct branded pieces forming one cohesive system.`,
        `BRAND: ${B} (${data.industry}). Purpose: ${ctx.purpose}. Personality: ${ctx.personality}.`,
        `BRANDING APPLICATIONS: logo lockups (${ctx.logoPrimary}) on bag and box, brand pattern (${ctx.patternStyle}) on sleeve and napkin, brand symbol (${ctx.logoSymbol}) as seal sticker and cup detail.`,
        `COLOR SYSTEM: strict palette only (${ctx.allColors}). Dominant ${ctx.primaryColor}, secondary ${ctx.secondaryColor}, accent ${ctx.accentColor}. Kraft paper as neutral base.`,
        `MATERIALS: premium kraft paper (visible grain), matte coated cardboard, soft-touch lamination on box, embossed stamp on napkin, die-cut seal sticker. REAL material textures must be visible — this is photography, not illustration.`,
        `LIGHTING: Soft natural window light from upper left (10:00 position), warm 3200K fill, crisp but soft shadows, no harsh highlights. Editorial food photography standard.`,
        `CAMERA: 50mm f/4, overhead or 35° angle. Sharp across all items. Slightly styled — not clinical, not messy. One item (the bag) is the hero; others support.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "generic fast-food branding, messy food spills, low-res print, random colors, cheap disposable look, illustration, flat digital render, white void background, no surface texture, CGI"),
      );
    }

    case "takeaway_bag": {
      return parts(
        prefix,
        `PHOTOREALISTIC STREET PHOTOGRAPHY of a person carrying a branded takeaway bag from ${B} — 4:3 format.`,
        soul, journey, sensory,
        `SCENE: A person's hand and arm (face NOT visible, cropped at chest) carrying a premium branded paper bag while walking on a real city sidewalk. The bag is the HERO — sharp focus, brand clearly visible. Background has natural urban bokeh (storefronts, other pedestrians, trees). This is a candid lifestyle photograph, not a studio shot.`,
        `BAG: Large kraft paper bag with reinforced handles, premium print quality. Logo (${ctx.logoPrimary}) centered on front face — clean, large, sharp. Brand pattern (${ctx.patternStyle}) on side panels. Brand symbol (${ctx.logoSymbol}) as small accent near base. The bag has natural structure — slightly bent, real-world feel, not pristine flat.`,
        `BRAND: ${B} (${data.industry}).`,
        `COLOR: strict palette ${ctx.allColors}. Kraft base with ${ctx.primaryColor} print. Handles in ${ctx.secondaryColor} or matching kraft.`,
        `MATERIALS: Premium kraft paper — visible grain, natural fiber texture, matte print finish. Reinforced bottom, twisted paper handles.`,
        `LIGHTING: Natural daylight, golden hour warmth optional, realistic shadows on bag folds. Street light environment.`,
        `CAMERA: 85mm f/2.0, shallow depth of field — bag sharp, background beautifully blurred. Street-level perspective.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "cheap plastic bag, studio white background, flat illustration, CGI render, no environment, stock photo, visible face, cartoon"),
      );
    }

    case "food_container": {
      return parts(
        prefix,
        `PHOTOREALISTIC CLOSE-UP PRODUCT PHOTOGRAPHY of the branded delivery container for ${B} — 4:3 format.`,
        soul, journey, sensory,
        `SCENE: A marble or dark wood surface (real material, visible texture). Two containers: one CLOSED with branded seal sticker visible, one SLIGHTLY OPEN revealing clean interior. A branded napkin and small sticker placed nearby. This is a REAL PHOTOGRAPH — cardboard fold lines, seal sticker edge, print registration all visible at close range.`,
        `CONTAINER: Premium matte-coated cardboard box or bowl with lid. Clean structural design — crisp edges, precise folds.`,
        `BRAND: ${B} (${data.industry}).`,
        `BRANDING: Logo lockup (${ctx.logoPrimary}) on lid top — centered, clean, sharp. Brand symbol (${ctx.logoSymbol}) on side panel as subtle accent. Seal sticker with brand pattern (${ctx.patternStyle}). Interior lid has brand color wash.`,
        `COLOR: strict palette ${ctx.allColors}. Lid in ${ctx.primaryColor} or kraft with ${ctx.primaryColor} print. Accent ${ctx.accentColor} on seal sticker.`,
        `MATERIAL: Matte-coated cardboard, soft-touch lamination on lid, visible paper fiber texture on inside. Premium food-grade quality.`,
        `LIGHTING: Soft studio light from upper left, 45° angle. Gentle shadow under container showing depth. Subtle rim light on edges. Premium editorial product photography — Bon Appétit quality.`,
        `CAMERA: 100mm macro f/3.5, 30° angle, shallow DOF — hero container sharp, background container slightly soft. Print quality and material texture must be visible.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "messy food, grease stains, low-end packaging, random colors, illustration, flat render, white void, CGI, cartoon, cheap plastic"),
      );
    }

    case "uniform_tshirt": {
      return parts(
        prefix,
        `PHOTOREALISTIC LIFESTYLE PHOTOGRAPHY of ${B} staff wearing the branded uniform t-shirt — 4:3 format.`,
        soul, journey, sensory,
        `SCENE: A person wearing the branded t-shirt, photographed from chest down to waist (face NOT visible — cropped above chin). They are standing in the actual work environment — restaurant interior, kitchen pass, or behind counter. Real environment visible: countertop, equipment, brand signage in soft background. This is EDITORIAL LIFESTYLE photography, not a flat mockup.`,
        `BRAND: ${B} (${data.industry}).`,
        `T-SHIRT: Premium heavyweight cotton (180-200gsm). Clean fit, not baggy. Embroidered logo on left chest (${ctx.logoPrimary}) — thread texture visible at this distance. Brand symbol (${ctx.logoSymbol}) on right sleeve in subtle tone-on-tone or ${ctx.accentColor}. Fabric has real texture — not flat, not wrinkled, just naturally worn.`,
        `COLOR: T-shirt body in ${ctx.primaryColor} or black/white with ${ctx.primaryColor} embroidery. Strict palette: ${ctx.allColors}.`,
        `LIGHTING: Warm ambient work environment light (3000K), soft from upper-left. Natural shadows in fabric folds. Embroidery catches a subtle highlight.`,
        `CAMERA: 85mm f/2.0, waist-up (no face), shallow DOF — uniform sharp, background softly blurred showing work context.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "visible face, cheap polyester, distorted logo, flat mockup, white void, mannequin, cartoon, CGI"),
      );
    }

    case "uniform_apron": {
      return parts(
        prefix,
        `PHOTOREALISTIC LIFESTYLE PHOTOGRAPHY of ${B} staff wearing the branded apron at work — 4:3 format.`,
        soul, journey, sensory,
        `SCENE: A person wearing the branded apron, photographed from neck down (face NOT visible). They are in a REAL work context — behind a counter, at a kitchen pass, or at a coffee station. Hands may be engaged in work (holding utensils, wiping counter). Real environment: countertop, utensils, brand signage blurred in background. Documentary/editorial feel.`,
        `BRAND: ${B} (${data.industry}).`,
        `APRON: Premium canvas or denim apron — thick fabric, clean construction, adjustable leather/fabric straps. Embroidered logo patch on chest (${ctx.logoPrimary}) — stitching detail visible. Optional brand pattern (${ctx.patternStyle}) on pocket or strap. The apron has natural wear — slightly broken in, authentic.`,
        `COLOR: Apron body in ${ctx.primaryColor}, black, or raw denim. Strap in contrasting ${ctx.secondaryColor} or leather. Logo embroidery in ${ctx.accentColor} or white. Strict palette: ${ctx.allColors}.`,
        `LIGHTING: Warm kitchen/café light (2800-3200K), natural from window or overhead. Apron fabric texture visible — canvas weave, embroidery thread.`,
        `CAMERA: 50mm f/2.0, chest-to-hip frame, shallow DOF. Apron sharp with beautiful work-context bokeh behind.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "visible face, messy kitchen, cheap polyester, flat mockup, white void, cartoon, CGI, stock photo"),
      );
    }

    case "materials_board": {
      return parts(
        prefix,
        `PLATFORM: Brand materials & textures board — 1:1 square moodboard composition.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `CONTENT: curated set of 6-10 material swatches (paper stock, fabric, metal/foil, matte plastic, textured label) plus color chips.`,
        `BRAND SYSTEM: derived from ${ctx.logoSymbol} and pattern ${ctx.patternStyle}.`,
        `COLOR: strict palette only ${ctx.allColors}.`,
        `STYLE: ${ctx.visualStyle}. Mood: ${ctx.moodWords}.`,
        `COMPOSITION: clean top-down flat-lay, premium editorial, precise grid, soft shadows. Each material should feel like it was hand-selected by the creative director.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "random unrelated materials, off-brand colors, messy collage, low-res textures, text"),
      );
    }

    case "outdoor_billboard": {
      return parts(
        prefix,
        `PHOTOREALISTIC URBAN PHOTOGRAPHY of a large billboard/outdoor advertisement for ${B} in a real city environment.`,
        soul, journey,
        `SCENE: A massive rectangular billboard (horizontal 16:9 proportions) mounted on a metal structure on a busy commercial avenue. The billboard is the HERO of the photo — shot from street level looking up slightly. Real urban context: buildings behind, cars/buses passing below, pedestrians on sidewalk, traffic lights, urban infrastructure visible.`,
        `BILLBOARD CONTENT: The billboard displays a bold, clean brand advertisement — dominant ${ctx.primaryColor} background, the brand logo visible and sharp, ${ctx.visualMetaphor} as the hero graphic element, with a clear visual hierarchy. Think Nike, Apple, or Spotify outdoor campaigns — one image, one feeling, maximum impact at speed.`,
        `BRAND: ${B} (${data.industry}). Visual style: ${ctx.marketingArch}.`,
        `COLOR on billboard: ${ctx.primaryColor} dominant field, ${ctx.accentColor} focal highlight, ${ctx.secondaryColor} contrast. Brand elements: ${ctx.elements}.`,
        `TIME OF DAY: Blue hour (just after sunset) — dramatic twilight sky, city lights beginning to glow, billboard brightly illuminated against the darkening sky. Street-level amber/sodium lights creating warm pools on wet pavement.`,
        `CAMERA: 24mm f/5.6, street-level perspective, slight upward angle. The billboard is sharp and bright; the urban environment has natural depth of field. Photojournalistic quality — this looks like a real photo taken on a real street, not a CGI render.`,
        `MOOD: ${ctx.moodWords}. The brand dominates the urban landscape. Unmistakable at 60km/h.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "CGI render, floating billboard, empty street, no urban context, daytime flat lighting, cartoon, illustration, studio shot, white background, no environment"),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PRINT / OOH — EXPANDED
    // ═══════════════════════════════════════════════════════════════════════

    case "poster_print": {
      return parts(
        prefix,
        `PHOTOREALISTIC MOCKUP of a printed poster/cartaz for ${B} displayed in a real environment.`,
        soul, journey,
        `SCENE: A large A2 vertical poster (portrait 9:16) displayed in context — either (A) wheat-pasted on a textured urban wall, (B) framed behind glass in a gallery/store window, or (C) pinned on a cork board in a creative studio. Show the REAL ENVIRONMENT around the poster — wall texture, lighting, other elements that ground it in reality.`,
        `POSTER CONTENT: Bold brand graphic — dominant ${ctx.primaryColor} background, the ${B} logo, ${ctx.visualMetaphor} as hero element. Strong vertical hierarchy. Think award-winning poster design — one powerful visual, maximum impact. ${ctx.marketingArch}.`,
        `BRAND: ${B} (${data.industry}). Personality: ${ctx.personality}.`,
        `COLOR: ${ctx.primaryColor} dominant, ${ctx.accentColor} accent. Palette: ${ctx.allPrimaryColors}.`,
        `STYLE: ${ctx.visualStyle}. Art direction: ${ctx.photoStyle}.`,
        idAssets, tree, humanLayer,
        `CAMERA: 50mm f/2.8, slight angle (not perfectly flat — 5-10° rotation gives life). Natural ambient lighting on the poster surface. Paper texture visible.`,
        `MOOD: ${ctx.moodWords}. Gallery-quality, collectible, the viewer wants this on their wall.`,
        sTags, q, neg(ctx, provider, "flat digital render, white background, no environment context, floating poster, illustration style, cartoon"),
      );
    }

    case "flyer_leaflet": {
      return parts(
        prefix,
        `PLATFORM: Promotional flyer / panfleto — A5 or DL format, 4:3 aspect, front side visual.`,
        soul, journey,
        `MARKETING INTENT: Street-level distribution piece that people keep instead of toss. Premium enough to earn attention.`,
        `BRAND: ${B} (${data.industry}). Purpose: ${ctx.purpose}.`,
        `VISUAL DESIGN: ${ctx.marketingArch}. Bold top half with hero visual, clean bottom half for info overlay.`,
        `HERO VISUAL: ${ctx.visualMetaphor} — close crop, maximum visual impact in compact format.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `COLOR: ${ctx.primaryColor} dominant, ${ctx.secondaryColor} structure, ${ctx.accentColor} CTA highlight.`,
        `COMPOSITION: Top 55% — full-bleed brand visual. Bottom 45% — clean zone for text overlay (not rendered).`,
        idAssets, humanLayer,
        `PRINT QUALITY: CMYK-ready, bleed edges, premium paper stock feel. ${ctx.visualStyle}.`,
        `MOOD: ${ctx.moodWords}. Approachable yet premium — someone picks this up off a counter and keeps it.`,
        sTags, q, neg(ctx, provider, "cheap print look, cluttered layout, text, low contrast, generic clip art"),
      );
    }

    case "brochure_catalog": {
      return parts(
        prefix,
        `PLATFORM: Tri-fold brochure or product catalog — 4:3 editorial flat-lay showing cover and inner spread.`,
        soul, journey, sensory,
        `MARKETING INTENT: Premium printed piece for sales meetings, trade shows, or luxury retail counter.`,
        `BRAND: ${B} (${data.industry}). Purpose: ${ctx.purpose}. Personality: ${ctx.personality}.`,
        `MOCKUP: Open brochure or catalog on premium surface showing cover + one inside spread. Editorial photography angle.`,
        `COVER: Bold ${ctx.primaryColor} with centered ${ctx.logoPrimary}, minimal. Inside: editorial layout suggestion with brand pattern (${ctx.patternStyle}).`,
        `VISUAL DESIGN: ${ctx.marketingArch}. ${ctx.visualStyle}. Photography direction: ${ctx.photoStyle}.`,
        `COLOR: strict palette ${ctx.allColors}.`,
        `SURFACE: marble, dark wood, or linen — consistent with brand world: ${ctx.visualStyle}.`,
        `LIGHTING: soft directional studio light, paper texture visible, premium print quality feel.`,
        idAssets, humanLayer,
        `MOOD: ${ctx.moodWords}. Editorial, tactile, the viewer should want to pick it up and read.`,
        sTags, q, neg(ctx, provider, "flat illustration, cheap paper, harsh lighting, text, lorem ipsum, generic template"),
      );
    }

    case "bus_shelter_ad": {
      return parts(
        prefix,
        `PHOTOREALISTIC URBAN PHOTOGRAPHY of a bus shelter / transit stop advertisement for ${B}.`,
        soul, journey,
        `SCENE: A real glass-and-metal bus shelter on an urban sidewalk. Inside the shelter's backlit advertising panel (vertical 9:16 portrait format), the ${B} brand ad is displayed — brightly illuminated. The environment is REAL: sidewalk, curb, street, passing traffic, a person or two waiting at the shelter or walking past for scale. Evening/night setting with wet pavement reflecting the backlit ad glow.`,
        `AD CONTENT in the panel: Bold brand visual — dominant ${ctx.primaryColor} background, ${ctx.visualMetaphor} as hero graphic, brand logo visible. Clean vertical layout. ${ctx.marketingArch}.`,
        `BRAND: ${B} (${data.industry}). Message: ${ctx.messagingPillar}.`,
        ctx.tagline,
        `COLOR on ad: ${ctx.primaryColor} dominant, ${ctx.accentColor} focal highlight. Strict palette: ${ctx.allPrimaryColors}.`,
        `CAMERA: 35mm f/2.8, eye-level street perspective. The shelter and ad are sharp; background has natural urban bokeh. The backlit panel creates a warm glow spill on the shelter structure and wet ground.`,
        `LIGHTING: Night/evening urban — sodium street lights, the ad panel is the brightest element, creating atmospheric light on surroundings.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Urban, magnetic, unmissable in the peripheral vision.`,
        sTags, q, neg(ctx, provider, "daytime flat lighting, empty street, cartoon, dark unlit panel, text overlays"),
      );
    }

    case "banner_rollup": {
      return parts(
        prefix,
        `PHOTOREALISTIC PHOTOGRAPH of a roll-up banner / X-banner for ${B} in a real indoor environment.`,
        soul, journey,
        `SCENE: A 85×200cm vertical roll-up banner (9:16 portrait) standing on its metal retractable base in a REAL setting — either (A) a modern office lobby/reception area, (B) a conference/event registration area, or (C) a retail store entrance. Show the real environment: floor (marble, wood, carpet), walls, lighting fixtures, maybe a reception desk or event table nearby. The banner is a physical object IN a space, not floating.`,
        `BANNER CONTENT: Bold brand vertical design — ${ctx.primaryColor} dominant background, brand logo (${ctx.logoPrimary}) in top 30%, ${ctx.visualMetaphor} as hero element in center, brand pattern (${ctx.patternStyle}) as texture. ${ctx.marketingArch}.`,
        `BRAND: ${B} (${data.industry}). Personality: ${ctx.personality}.`,
        `COLOR: ${ctx.primaryColor} dominant, ${ctx.secondaryColor} structure, ${ctx.accentColor} highlights. Strict palette.`,
        `CAMERA: 35mm f/2.8, eye-level, slight angle. Banner sharp in focus, environment has natural depth of field. Realistic lighting on the printed material surface.`,
        idAssets, humanLayer,
        `MOOD: ${ctx.moodWords}. Professional, premium, physically imposing. Must look like a REAL photo of a real banner, not a digital render.`,
        sTags, q, neg(ctx, provider, "flat illustration, white background, no environment, floating banner, digital render feel, cartoon"),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RETAIL / PDV
    // ═══════════════════════════════════════════════════════════════════════

    case "storefront_facade": {
      return parts(
        prefix,
        `PHOTOREALISTIC ARCHITECTURAL PHOTOGRAPHY of the ${B} storefront facade at blue hour — 16:9 format.`,
        soul, journey, sensory,
        `SCENE: A real city street at blue hour (just after sunset). The ${B} storefront is the HERO — warmly lit interior glowing through floor-to-ceiling glass windows, contrasting with the cool twilight sky. Real urban context: sidewalk, curb, neighboring buildings, a parked car, 2-3 blurred pedestrians walking past. This is an ARCHITECTURAL PHOTOGRAPH, not a 3D render — imperfect reflections in glass, real street texture, visible weathering.`,
        `FACADE: Modern ${data.industry} storefront — clean architectural lines, premium materials. Main signage: backlit channel letters or illuminated box sign reading the brand wordmark (${ctx.logoPrimary}). Below: large glass storefront with subtle brand pattern (${ctx.patternStyle}) etched or vinyl-applied on glass. Branded awning or canopy in ${ctx.primaryColor}. Entrance door with metallic brand symbol handle (${ctx.logoSymbol}).`,
        `BRAND: ${B} (${data.industry}). Purpose: ${ctx.purpose}. Personality: ${ctx.personality}.`,
        `INTERIOR (visible through glass): Warm ambient lighting (2700K), glimpses of styled interior — counter, menu board, seating. Life inside = invitation.`,
        `COLOR APPLICATION: exterior accents in ${ctx.primaryColor}, metalwork in neutral (brass/black/brushed steel), neon or LED accent in ${ctx.accentColor}. Signage illuminated warm white.`,
        `MATERIALS: brushed steel, timber paneling, exposed brick, polished concrete, terrazzo threshold. Real architectural finishes — not CGI surfaces.`,
        `LIGHTING: Blue hour sky (deep blue), warm interior glow (amber), illuminated signage as brightest element. Wet pavement reflecting warm light (rain just passed — optional but dramatic).`,
        `CAMERA: 24mm f/5.6, eye-level street perspective, centered on the storefront. Slight barrel perspective gives architectural depth. Real lens character — not CGI perfect.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Inviting, aspirational, the kind of place you photograph and share on Instagram.`,
        sTags, q, neg(ctx, provider, "flat illustration, miniature model, cartoon, cheap signage, empty dead street, harsh noon light, CGI render, 3D model, white background, no environment"),
      );
    }

    case "window_display": {
      return parts(
        prefix,
        `PLATFORM: Window display / vitrine composition — 16:9 through-glass perspective showing curated brand world.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}). Personality: ${ctx.personality}.`,
        `CONCEPT: The window is a stage — it tells a brand story in one visual tableau, no words needed.`,
        `DISPLAY ELEMENTS: hero product or visual centerpiece, brand colors (${ctx.primaryColor}, ${ctx.accentColor}), props, lighting.`,
        `BRAND APPLICATIONS: logo decal on glass (${ctx.logoPrimary}), brand pattern as backdrop (${ctx.patternStyle}), spot-lit hero element.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `COLOR: strict palette ${ctx.allColors}. Backdrop in ${ctx.primaryColor} or neutral. Accent lighting in ${ctx.accentColor}.`,
        `SCENE: Shot through glass with subtle reflections of street. Evening lighting — warm interior glow vs cool exterior.`,
        `LIGHTING: Theatrical spot lights creating drama and depth, ambient warm fill.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Curated, theatrical, makes you stop on the sidewalk.`,
        sTags, q, neg(ctx, provider, "flat, no depth, daytime harsh light, empty window, cluttered mess, cartoon"),
      );
    }

    case "neon_sign": {
      return parts(
        prefix,
        `PLATFORM: Neon sign / luminous signage — 16:9 atmospheric night photograph of branded neon or LED sign.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `SIGN: Logo wordmark or brand symbol (${ctx.logoSymbol}) rendered as neon/LED tube sign. Clean lettering, consistent tube width.`,
        `NEON COLOR: ${ctx.accentColor} or ${ctx.primaryColor} — warm glow, realistic tube bends, gas-filled luminosity.`,
        `MOUNTING: Dark brick wall, concrete wall, or dark matte surface — the sign is the only light source.`,
        `SCENE: Interior bar/café/studio wall or exterior night scene. Dark ambient, sign as hero light.`,
        `LIGHTING: Neon glow casts colored light on surrounding wall and surfaces. Subtle halo. Realistic glass tube reflections.`,
        `ATMOSPHERE: Moody, intimate, instagrammable. The kind of sign everyone photographs.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Magnetic, warm, iconic.`,
        sTags, q, neg(ctx, provider, "bright daytime, flat illustration, cheap LED strip, plastic sign, blurry text, cartoon"),
      );
    }

    case "menu_board": {
      return parts(
        prefix,
        `PLATFORM: Menu board / cardápio de parede — 4:3 format, wall-mounted in-store menu with brand identity applied.`,
        soul, journey,
        `BRAND: ${B} (${data.industry}). Personality: ${ctx.personality}.`,
        `BOARD TYPE: chalkboard, digital screen, printed acrylic, or painted wood panel — choose what fits ${ctx.visualStyle}.`,
        `LAYOUT: Clear typographic hierarchy — category headers in ${ctx.displayFont} Bold, items in ${ctx.bodyFont}, prices aligned right.`,
        `BRAND APPLICATION: logo at top (${ctx.logoPrimary}), brand pattern border or accent (${ctx.patternStyle}), color palette strict (${ctx.allColors}).`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `SCENE: Mounted on textured wall (brick, concrete, wood) behind counter. Warm ambient light, shallow DOF.`,
        `STYLE: ${ctx.visualStyle}. Not a flat design comp — real physical menu board in situ with material texture.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Readable, appetizing, on-brand, the kind of menu you trust.`,
        sTags, q, neg(ctx, provider, "flat digital mockup, lorem ipsum, messy handwriting, illegible, harsh lighting, off-brand colors"),
      );
    }

    case "trade_show_booth": {
      return parts(
        prefix,
        `PLATFORM: Trade show booth / exhibition stand — 16:9 wide view of complete branded booth environment.`,
        soul, journey,
        `MARKETING INTENT: Stand out in a convention hall of 200+ booths. Draw visitors from 20 meters away.`,
        `BRAND: ${B} (${data.industry}). Purpose: ${ctx.purpose}. Personality: ${ctx.personality}.`,
        `BOOTH ELEMENTS: back wall with large-format brand graphic, reception counter, display shelves/screens, hanging header sign, floor mat, pop-up banners.`,
        `BRAND APPLICATION: ${ctx.logoPrimary} on back wall (large), brand pattern (${ctx.patternStyle}) on side panels, ${ctx.primaryColor} dominant, ${ctx.accentColor} accents.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `LIGHTING: Spot lights, LED strips in ${ctx.accentColor}, backlit panels, ambient hall lighting.`,
        `SCENE: Realistic convention hall with neighboring booths blurred. Polished concrete floor. A few blurred visitors for scale.`,
        `DESIGN: Modern modular booth system, not cheap pop-up tent. Premium materials, clean geometry.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Authoritative, inviting, clearly the best booth on the floor.`,
        sTags, q, neg(ctx, provider, "empty hall, cartoon, cheap pop-up, flat, no depth, messy, text overlays"),
      );
    }

    case "digital_signage": {
      return parts(
        prefix,
        `PLATFORM: Digital signage totem / interactive kiosk — vertical 9:16 format, in retail or reception context.`,
        soul, journey,
        `BRAND: ${B} (${data.industry}).`,
        `SCREEN CONTENT: Brand visual with hero image (${ctx.visualMetaphor}), logo (${ctx.logoPrimary}), and brand colors. No actual text.`,
        `DESIGN: ${ctx.marketingArch}. Bold vertical composition, ${ctx.primaryColor} dominant, ${ctx.accentColor} CTA zones.`,
        `MOCKUP: Sleek modern totem/kiosk in retail space, lobby, or restaurant entrance. Realistic device frame.`,
        `LIGHTING: Screen glow illuminating surrounding space, ambient light, premium setting.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Modern, interactive, premium technology presence.`,
        sTags, q, neg(ctx, provider, "old CRT screen, flat illustration, dark unlit, cheap plastic frame, text"),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VEHICLE
    // ═══════════════════════════════════════════════════════════════════════

    case "vehicle_wrap": {
      return parts(
        prefix,
        `PHOTOREALISTIC STREET PHOTOGRAPHY of a ${B} branded delivery van parked on an urban street — 16:9 format.`,
        soul, journey,
        `SCENE: A real city street in golden hour light. A modern delivery van (Sprinter/Transit type) with FULL professional vinyl wrap is parked at the curb. Shot from 3/4 angle showing the side panel + front quarter. Real urban environment: buildings behind, other parked cars, sidewalk, trees, maybe a cyclist passing. This is a REAL PHOTOGRAPH — chrome reflections, tire shadows on asphalt, building reflections in van windows.`,
        `WRAP DESIGN: ${ctx.primaryColor} dominant full-body wrap. Large logo lockup (${ctx.logoPrimary}) on side panel — billboard-scale, readable from 20m. Brand pattern (${ctx.patternStyle}) as accent stripe or lower panel wrap. Brand symbol (${ctx.logoSymbol}) on rear doors. Clean graphic hierarchy: logo > pattern > color field.`,
        `BRAND: ${B} (${data.industry}). Purpose: ${ctx.purpose}.`,
        `COLOR APPLICATION: ${ctx.primaryColor} dominant wrap (70%), ${ctx.secondaryColor} structural divider (20%), ${ctx.accentColor} accent stripe (10%). Chrome/metalwork natural.`,
        `WRAP FINISH: Premium automotive-grade vinyl — matte or satin finish matching ${ctx.visualStyle}. Precise contour cuts around door handles, mirrors, windows. Professional installation quality visible.`,
        `LIGHTING: Golden hour side light creating dramatic warm highlights on the wrap surface and long shadows on asphalt. Ambient warm fill. Colors vibrant and true.`,
        `CAMERA: 35mm f/4, eye-level, 3/4 angle from front-left. Van sharp, urban background with natural depth. Photojournalistic quality.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Professional fleet, proud to park anywhere. Mobile billboard excellence.`,
        sTags, q, neg(ctx, provider, "toy car, miniature, cartoon, cheap magnet sign, dirty vehicle, flat illustration, CGI, white void, no environment, studio shot"),
      );
    }

    case "food_truck": {
      return parts(
        prefix,
        `PHOTOREALISTIC EDITORIAL PHOTOGRAPHY of the ${B} food truck at an outdoor market — 16:9 format.`,
        soul, journey, sensory,
        `SCENE: A real outdoor food market or urban park at golden hour. The ${B} food truck is the HERO — service window open, warm interior light glowing, light steam rising from the service area. Real environment: string lights overhead, 3-4 blurred customers in queue, trees/buildings behind, other food stalls in soft background. Evening warmth, festive atmosphere. This is REAL EVENT PHOTOGRAPHY, not CGI.`,
        `TRUCK: Modern food truck (Airstream-style or box truck) with FULL professional vinyl wrap. Service window centered, small chalkboard menu visible inside window frame, branded awning/canopy extending over service counter.`,
        `BRAND: ${B} (${data.industry}). Personality: ${ctx.personality}.`,
        `BRANDING: Full exterior wrap — logo (${ctx.logoPrimary}) large on side panel, brand pattern (${ctx.patternStyle}) on lower panels, brand symbol (${ctx.logoSymbol}) on rear. Menu text on window frame area. Brand colors on awning.`,
        `COLOR: ${ctx.primaryColor} dominant wrap, ${ctx.secondaryColor} panels, ${ctx.accentColor} awning and accent highlights. Strict palette: ${ctx.allColors}.`,
        `DETAILS: Branded napkin holder visible at counter, branded cups/containers stacked, small branded chalkboard. Counter edge has brand color.`,
        `LIGHTING: Golden hour warm side light (magic hour). Interior service window glowing warm (2700K). String lights create bokeh points. Steam catches the light.`,
        `CAMERA: 35mm f/2.8, 3/4 angle from front-left. Truck sharp, environment with beautiful golden-hour bokeh. Documentary/editorial quality.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Vibrant, appetizing, the truck everyone photographs before they order.`,
        sTags, q, neg(ctx, provider, "old rusty truck, flat illustration, empty parking lot, dark night, cartoon, cheap signage, CGI, white void, no environment"),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PACKAGING — EXPANDED
    // ═══════════════════════════════════════════════════════════════════════

    case "beverage_bottle": {
      return parts(
        prefix,
        `PLATFORM: Branded beverage bottle with premium label — 4:3 product photography.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `PRODUCT: Glass or premium PET bottle (beer, juice, water, wine, or spirits — contextual to ${data.industry}).`,
        `LABEL DESIGN: front label with logo (${ctx.logoPrimary}), brand pattern accent (${ctx.patternStyle}), color palette strict (${ctx.allColors}).`,
        `LABEL STYLE: ${ctx.visualStyle}. Typography: ${ctx.displayFont} for brand, ${ctx.bodyFont} for details. ${ctx.marketingArch}.`,
        `SCENE: Studio product shot — bottle hero-lit on dark or neutral surface. Water condensation droplets for freshness (if cold beverage).`,
        `LIGHTING: Dramatic rim light in ${ctx.accentColor} tint, front fill soft, background gradient dark to ${ctx.primaryColor}.`,
        `CAMERA: 3/4 angle, slight below eye level for authority. Macro detail on label texture.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Shelf-stopping, premium, the bottle you pick up because it looks better than everything around it.`,
        sTags, q, neg(ctx, provider, "flat illustration, generic stock bottle, cheap plastic, blurry label, cartoon, bad perspective"),
      );
    }

    case "beverage_can": {
      return parts(
        prefix,
        `PLATFORM: Branded beverage can (350ml) — 4:3 product photography with complete can art.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `CAN: Standard 350ml aluminum can with full-wrap art. Premium shelf-ready design.`,
        `ART DESIGN: ${ctx.primaryColor} dominant, logo (${ctx.logoPrimary}) centered, brand pattern wrap (${ctx.patternStyle}), ${ctx.accentColor} accent details.`,
        `STYLE: ${ctx.marketingArch}. ${ctx.visualStyle}. Bold, shelf-stopping graphic design that works 360°.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `SCENE: Studio hero shot — can at slight angle, condensation droplets, dramatic lighting. Splash or pour optional.`,
        `LIGHTING: Hard rim light for metallic sheen, soft front fill, dark background with ${ctx.primaryColor} gradient glow.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Collectible, instagrammable, the can design you save and repost.`,
        sTags, q, neg(ctx, provider, "flat mockup, cheap generic can, no condensation, cartoon, blurry art, plastic bottle"),
      );
    }

    case "cup_sleeve": {
      return parts(
        prefix,
        `PLATFORM: Branded coffee/drink cup with sleeve — 4:3 product photography.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEMS: Paper or ceramic cup with branded paper sleeve (kraft or colored), branded lid, branded cup surface.`,
        `BRANDING: logo on sleeve (${ctx.logoPrimary}), brand symbol on cup (${ctx.logoSymbol}), brand pattern as sleeve texture (${ctx.patternStyle}).`,
        `COLOR: strict palette ${ctx.allColors}. Sleeve in ${ctx.primaryColor} or kraft with ${ctx.accentColor} print.`,
        `SCENE: In-hand shot (hand visible, no face) or on café counter with beans/pastry props. Shallow DOF.`,
        `LIGHTING: Warm natural café light, steam wisps from top, lifestyle editorial feel.`,
        `MATERIALS: Matte paper sleeve, glossy cup, realistic print texture. ${ctx.visualStyle}.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The cup everyone holds for their Instagram story.`,
        sTags, q, neg(ctx, provider, "flat illustration, generic white cup, no branding visible, plastic, harsh lighting, cartoon"),
      );
    }

    case "food_label": {
      return parts(
        prefix,
        `PLATFORM: Product label / rótulo — 4:3 close-up showing branded label applied to jar, bottle, or container.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `LABEL: Adhesive label or wrap label on glass jar, bottle, or container. Premium die-cut or full wrap.`,
        `DESIGN: Logo (${ctx.logoPrimary}), brand pattern accent (${ctx.patternStyle}), product info hierarchy.`,
        `STYLE: ${ctx.marketingArch}. ${ctx.visualStyle}. Typography: ${ctx.displayFont} headlines, ${ctx.bodyFont} body.`,
        `COLOR: strict palette ${ctx.allColors}. Label background ${ctx.primaryColor} or white/cream.`,
        `SCENE: Product on styled surface (wood, marble, linen) with complementary props. Macro label detail visible.`,
        `LIGHTING: Soft directional studio light, label texture and emboss detail visible, premium product photography.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Artisanal yet professional — shelf appeal that communicates quality.`,
        sTags, q, neg(ctx, provider, "blurry label, cheap generic jar, flat illustration, bad typography, off-brand colors, cartoon"),
      );
    }

    case "product_box": {
      return parts(
        prefix,
        `PLATFORM: Branded product box — 4:3 premium unboxing photography showing structural box with brand identity.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}). Personality: ${ctx.personality}.`,
        `BOX: Rigid or tuck-end box with full brand art. Show closed + one slightly open for unboxing hint.`,
        `DESIGN: Logo (${ctx.logoPrimary}) on lid, brand pattern (${ctx.patternStyle}) on sides, ${ctx.logoSymbol} embossed on interior.`,
        `COLOR: ${ctx.primaryColor} exterior, ${ctx.accentColor} interior reveal, strict palette ${ctx.allColors}.`,
        `FINISHING: Spot UV, foil stamp, emboss, soft-touch matte — premium tactile finishes visible in render.`,
        `SCENE: Styled surface (marble, dark wood, linen). Tissue paper peek from open box. Premium editorial.`,
        `LIGHTING: Soft studio light, crisp shadows, material texture visible. ${ctx.photoStyle}.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The unboxing moment that gets filmed and shared. Luxury experience.`,
        sTags, q, neg(ctx, provider, "cheap cardboard, flat illustration, generic box, harsh lighting, off-brand, cartoon, no finishing"),
      );
    }

    case "shopping_bag": {
      return parts(
        prefix,
        `PLATFORM: Branded shopping bag — 4:3 lifestyle product photography, bag in urban or retail context.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `BAG: Premium paper bag (kraft or coated), cotton/canvas tote, or luxury plastic bag — contextual to ${data.industry}.`,
        `BRANDING: large logo (${ctx.logoPrimary}) on front, brand pattern (${ctx.patternStyle}) on sides, ${ctx.logoSymbol} on bottom gusset.`,
        `COLOR: ${ctx.primaryColor} dominant, rope/ribbon handles in ${ctx.secondaryColor} or neutral. Strict palette: ${ctx.allColors}.`,
        `SCENE: In-hand walking (face cropped out) on city street, OR standing on shop counter with tissue paper peek.`,
        `LIGHTING: Natural daylight, lifestyle editorial, realistic shadows and bag structure.`,
        `MATERIAL: Visible paper grain or fabric weave, matte/gloss print quality, premium handle material.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The bag you keep and reuse. Walking brand advertisement.`,
        sTags, q, neg(ctx, provider, "cheap plastic, flat illustration, empty background, generic white bag, cartoon, blurry print"),
      );
    }

    case "gift_box": {
      return parts(
        prefix,
        `PLATFORM: Gift box / kit — 4:3 premium flat-lay or 3/4 shot showing branded gift packaging.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}). Personality: ${ctx.personality}.`,
        `ITEMS: Outer box + inner tissue paper + ribbon/band + seal sticker + card. Complete gift experience.`,
        `BRAND APPLICATION: box exterior in ${ctx.primaryColor}, ribbon in ${ctx.accentColor}, wax seal with ${ctx.logoSymbol}, pattern liner (${ctx.patternStyle}).`,
        `COLOR: strict palette ${ctx.allColors}. Luxurious minimal color use — let materials speak.`,
        `SCENE: Styled on premium surface, partially open to reveal interior, scattered elements for editorial feel.`,
        `LIGHTING: Soft warm studio light, emphasis on material texture and finishing detail.`,
        `FINISHING: Emboss, foil, soft-touch, textured paper. ${ctx.visualStyle}.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The gift that's already special before opening. Shareworthy.`,
        sTags, q, neg(ctx, provider, "cheap wrapping, generic box, flat, no texture, cartoon, harsh lighting, off-brand"),
      );
    }

    case "hang_tag": {
      return parts(
        prefix,
        `PLATFORM: Product hang tag / etiqueta — 1:1 macro close-up showing premium branded tag.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `TAG: Die-cut or standard rectangle hang tag with string/ribbon attachment. Both sides visible.`,
        `FRONT: logo (${ctx.logoPrimary}), brand symbol (${ctx.logoSymbol}). BACK: brand pattern (${ctx.patternStyle}).`,
        `COLOR: ${ctx.primaryColor} base, ${ctx.accentColor} accent, strict palette ${ctx.allColors}.`,
        `MATERIAL: Thick cotton paper, kraft, or premium coated stock. Visible texture and edge quality.`,
        `FINISHING: Letterpress, foil stamp, or clean print. Grommeted hole with waxed cord or ribbon.`,
        `SCENE: Macro shot on fabric or product surface, shallow DOF, single tag hero.`,
        `LIGHTING: Soft macro light, paper fiber texture visible. Premium editorial detail.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The detail that signals quality. Small but powerful.`,
        sTags, q, neg(ctx, provider, "blurry, cheap paper, flat digital mockup, cartoon, plastic, off-brand colors"),
      );
    }

    case "napkin_placemat": {
      return parts(
        prefix,
        `PLATFORM: Branded napkin and/or placemat — 1:1 overhead table setting photography.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEMS: Cloth or paper napkin with brand mark, placemat/jogo americano with subtle brand pattern, optional coaster.`,
        `BRANDING: ${ctx.logoSymbol} subtle emboss or print on napkin, brand pattern (${ctx.patternStyle}) on placemat.`,
        `COLOR: ${ctx.primaryColor} and neutral tones. Strict palette: ${ctx.allColors}. Subtle, not loud.`,
        `SCENE: Set on dining table with cutlery, glass, and partial plate — editorial food photography styling.`,
        `LIGHTING: Warm overhead or 45° natural light, soft shadows, texture emphasis.`,
        `MATERIAL: Linen, cotton, premium paper — visible fabric weave or paper texture. ${ctx.visualStyle}.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The table detail that elevates the entire dining experience.`,
        sTags, q, neg(ctx, provider, "cheap paper, flat illustration, empty table, harsh lighting, off-brand, cartoon, plastic"),
      );
    }

    case "bowl_pot": {
      return parts(
        prefix,
        `PLATFORM: Branded bowl / pot / tigela — 4:3 product photography of branded container with lid.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `PRODUCT: Premium paper/plastic bowl or pot with branded lid and body. Context: ${data.industry} (açaí, sorvete, poke, salada, iogurte, or similar).`,
        `BRANDING: Logo on lid top (${ctx.logoPrimary}), brand symbol on body side (${ctx.logoSymbol}), brand pattern as accent band (${ctx.patternStyle}).`,
        `COLOR: strict palette ${ctx.allColors}. ${ctx.primaryColor} lid or accent, body in white/kraft or ${ctx.secondaryColor}.`,
        `ITEMS: One main bowl closed with lid + one open showing interior (optional). Branded spoon or seal sticker.`,
        `SCENE: Styled surface matching brand world. Clean, appetizing, zero food mess. Focus on packaging design, not food content.`,
        `LIGHTING: Soft studio light with rim highlight, shadows showing form and depth, premium product photography.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Premium takeaway that elevates the brand. Instagram-worthy packaging.`,
        sTags, q, neg(ctx, provider, "messy food, spills, generic white container, flat illustration, cartoon, blurry, low-res print"),
      );
    }

    case "tray_liner": {
      return parts(
        prefix,
        `PLATFORM: Branded tray / tray liner — 4:3 overhead product photography.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEMS: Serving tray with branded paper liner. Brand pattern (${ctx.patternStyle}) as liner art, logo (${ctx.logoPrimary}) corner placement.`,
        `COLOR: strict palette ${ctx.allColors}. Liner on kraft/white base, brand colors as print.`,
        `SCENE: Overhead on counter or table, partially with food arrangement props (clean, styled, not messy).`,
        `LIGHTING: Warm overhead, editorial food photography aesthetic, paper texture visible.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Functional branding that turns a tray into a brand touchpoint.`,
        sTags, q, neg(ctx, provider, "messy food spills, blurry, generic tray, cartoon, flat illustration, off-brand"),
      );
    }

    case "wrapper_sleeve": {
      return parts(
        prefix,
        `PLATFORM: Branded wrapper / sleeve / papel de embrulho — 4:3 product photography.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `PRODUCT: Paper wrapper for sandwich/burger/product, sleeve for cup/bottle, or wrapping paper — with full brand art.`,
        `DESIGN: Brand pattern (${ctx.patternStyle}) as all-over print, logo (${ctx.logoPrimary}) stamp or seal, ${ctx.accentColor} accent details.`,
        `COLOR: strict palette ${ctx.allColors}. Pattern on kraft/white/colored base.`,
        `SCENE: Product partially wrapped showing both wrapper design and wrapped product shape. Studio or lifestyle.`,
        `LIGHTING: Soft natural or studio light, paper texture and print quality visible.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The wrap that makes the product feel premium before it's even opened.`,
        sTags, q, neg(ctx, provider, "messy unwrapped food, flat illustration, blurry print, cartoon, generic plain paper"),
      );
    }

    case "coaster": {
      return parts(
        prefix,
        `PLATFORM: Branded coaster / porta-copos — 1:1 macro product photography.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `COASTER: Round or square coaster (cardboard, cork, rubber, or leather). Printed or embossed brand identity.`,
        `DESIGN: Front: brand symbol (${ctx.logoSymbol}) centered or brand pattern (${ctx.patternStyle}). Back: logo (${ctx.logoPrimary}).`,
        `COLOR: strict palette ${ctx.allColors}. ${ctx.primaryColor} dominant, ${ctx.accentColor} details.`,
        `SCENE: On bar/restaurant counter or table, next to a glass or cup for context. Macro focus on coaster detail.`,
        `LIGHTING: Warm ambient or spot light, material texture (cork grain, cardboard fiber) visible, shallow DOF.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The detail that makes a drink feel like a brand experience.`,
        sTags, q, neg(ctx, provider, "blurry, cheap generic, flat illustration, cartoon, off-brand colors, no texture"),
      );
    }

    case "menu_printed": {
      return parts(
        prefix,
        `PLATFORM: Printed menu / cardápio — 4:3 editorial photography of premium branded menu.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}). Personality: ${ctx.personality}.`,
        `MENU FORMAT: Premium printed menu — folder, booklet, single sheet in holder, or clipboard. Material matches brand world.`,
        `DESIGN: Cover with logo (${ctx.logoPrimary}), brand pattern accent (${ctx.patternStyle}), interior with clear typographic hierarchy.`,
        `TYPOGRAPHY: ${ctx.displayFont} for headers/sections, ${ctx.bodyFont} for items. Color accents in ${ctx.accentColor}.`,
        `COLOR: strict palette ${ctx.allColors}. Cover in ${ctx.primaryColor} or neutral, interior accents.`,
        `SCENE: Open on table or in-hand, restaurant/café context, warm ambient light, editorial style.`,
        `LIGHTING: Warm natural light, paper stock quality visible, soft shadows, shallow DOF on background.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The menu that people photograph before they order.`,
        sTags, q, neg(ctx, provider, "cheap laser print, flat illustration, lorem ipsum, cartoon, blurry, off-brand, generic template"),
      );
    }

    case "price_tag_shelf": {
      return parts(
        prefix,
        `PLATFORM: Price tag / shelf talker / wobbler — 4:3 close-up in retail/PDV context.`,
        soul,
        `BRAND: ${B} (${data.industry}).`,
        `ITEMS: Shelf price tag, wobbler, or shelf talker with brand identity. Small format, high impact at point of sale.`,
        `DESIGN: ${ctx.primaryColor} background or border, logo (${ctx.logoSymbol}) small, clear price/info hierarchy.`,
        `COLOR: strict palette ${ctx.allColors}. ${ctx.accentColor} for price/CTA highlight.`,
        `SCENE: Attached to retail shelf edge, product context blurred behind, macro focus on the tag.`,
        `LIGHTING: Retail fluorescent + accent light, realistic shelf context.`,
        humanLayer,
        `MOOD: Eye-catching at shelf level, branded consistency across all POS materials.`,
        sTags, q, neg(ctx, provider, "blurry, generic white tag, cartoon, flat illustration, off-brand, no context"),
      );
    }

    case "tent_card": {
      return parts(
        prefix,
        `PLATFORM: Table tent card / display de mesa — 4:3 product photography on dining or retail table.`,
        soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `FORMAT: Triangular tent card or A-frame mini display for table use — promo, QR code, or menu highlight.`,
        `DESIGN: Both sides branded with logo (${ctx.logoPrimary}), ${ctx.primaryColor} background, clear call-to-action zone.`,
        `COLOR: strict palette ${ctx.allColors}.`,
        `SCENE: On restaurant/café table or retail counter, with contextual props. Natural setting, editorial.`,
        `LIGHTING: Warm ambient, realistic table context, tent card as focal point, soft background blur.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Small format, big brand presence at the moment of decision.`,
        sTags, q, neg(ctx, provider, "flat illustration, generic template, blurry, cartoon, empty void background"),
      );
    }

    case "standee_display": {
      return parts(
        prefix,
        `PLATFORM: Floor standee / display de chão — 9:16 vertical, life-size or near-life-size POS display.`,
        soul, journey,
        `BRAND: ${B} (${data.industry}).`,
        `FORMAT: Die-cut floor standee, corrugated display, or totem in retail/restaurant entrance.`,
        `DESIGN: Full brand visual with logo (${ctx.logoPrimary}), hero imagery, brand pattern (${ctx.patternStyle}), ${ctx.accentColor} CTA zone.`,
        `COLOR: ${ctx.primaryColor} dominant, strict palette ${ctx.allColors}.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `SCENE: In-store or entrance context, realistic perspective, blurred people walking by for scale.`,
        `LIGHTING: Retail/ambient lighting, realistic shadows, display structure visible.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Impossible to walk past without looking.`,
        sTags, q, neg(ctx, provider, "flat illustration, tiny scale model, cartoon, dark empty room, off-brand"),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MERCH / WEARABLE
    // ═══════════════════════════════════════════════════════════════════════

    case "polo_uniform": {
      return parts(
        prefix,
        `PLATFORM: Branded polo shirt uniform — 4:3 editorial product photography.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Premium piqué cotton polo with embroidered logo. Corporate or staff uniform application.`,
        `BRANDING: left chest logo embroidery (${ctx.logoPrimary}), optional right sleeve symbol (${ctx.logoSymbol}).`,
        `COLOR: polo in ${ctx.primaryColor} or white with ${ctx.primaryColor} embroidery. Strict palette: ${ctx.allColors}.`,
        `SCENE: On person torso (face out of frame) in work context, OR flat-lay with folded precision.`,
        `LIGHTING: Soft editorial light, fabric texture visible, premium cotton quality feel.`,
        `STYLE: ${ctx.visualStyle}. Professional, not casual. The polo that makes the team look unified.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Professional pride, team identity, quality you can feel.`,
        sTags, q, neg(ctx, provider, "visible face, cheap polyester, distorted logo, wrinkled mess, cartoon, flat illustration"),
      );
    }

    case "cap_hat": {
      return parts(
        prefix,
        `PLATFORM: Branded cap / hat — 4:3 product photography showing structured cap with embroidered brand.`,
        soul, journey,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Structured 6-panel cap with front logo embroidery and optional side/back detail.`,
        `BRANDING: front center logo (${ctx.logoPrimary}) embroidered, back strap detail with ${ctx.logoSymbol}.`,
        `COLOR: cap body in ${ctx.primaryColor}, visor in ${ctx.secondaryColor} or matching, embroidery in contrasting color.`,
        `SCENE: 3/4 angle floating or on minimal stand. Crisp studio shot, cap structure visible.`,
        `LIGHTING: Soft studio light, embroidery texture detail visible, fabric grain.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The cap everyone asks "where did you get that?"`,
        sTags, q, neg(ctx, provider, "flat logo, cheap trucker hat, cartoon, blurry embroidery, distorted shape, worn-out"),
      );
    }

    case "tote_bag": {
      return parts(
        prefix,
        `PLATFORM: Branded tote bag / ecobag — 4:3 lifestyle product photography.`,
        soul, journey,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Natural cotton canvas tote with screen-printed or embroidered brand art.`,
        `DESIGN: Logo (${ctx.logoPrimary}) centered, brand pattern (${ctx.patternStyle}) as print or all-over. ${ctx.marketingArch}.`,
        `COLOR: Natural canvas with ${ctx.primaryColor} print, or ${ctx.primaryColor} dyed canvas with white/cream print.`,
        `SCENE: Over shoulder (face cropped) walking urban, OR flat-lay with styled props (notebook, sunglasses, plant).`,
        `LIGHTING: Natural daylight, lifestyle editorial, soft shadows.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The bag that replaces all other bags. Daily brand exposure.`,
        sTags, q, neg(ctx, provider, "cheap plastic bag, flat illustration, generic canvas, cartoon, blurry print, empty void"),
      );
    }

    case "hoodie": {
      return parts(
        prefix,
        `PLATFORM: Branded hoodie / moletom — 4:3 product photography, premium merchandise.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Premium heavyweight hoodie with brand application — embroidery, print, or puff print.`,
        `BRANDING: chest logo (${ctx.logoPrimary}), optional back print with brand pattern (${ctx.patternStyle}) or large symbol.`,
        `COLOR: hoodie in ${ctx.primaryColor} or neutral (black/heather gray) with contrasting brand print.`,
        `SCENE: On person (face cropped at chin or above) in urban/lifestyle context, OR styled flat-lay.`,
        `LIGHTING: Moody editorial light, fabric texture and weight visible, premium garment feel.`,
        `STYLE: ${ctx.visualStyle}. Streetwear-meets-brand, not corporate. Merch people actually want to wear.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Cozy, premium, the hoodie that becomes someone's favorite.`,
        sTags, q, neg(ctx, provider, "cheap thin fabric, flat illustration, distorted logo, cartoon, wrinkled mess, fast fashion"),
      );
    }

    case "jacket_coat": {
      return parts(
        prefix, `PLATFORM: Branded jacket/coat — 4:3 editorial product photography.`, soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Premium jacket, bomber, or coat with brand details — embroidered chest logo (${ctx.logoPrimary}), inner lining in brand pattern (${ctx.patternStyle}), zipper pull with ${ctx.logoSymbol}.`,
        `COLOR: strict palette ${ctx.allColors}. Body in ${ctx.primaryColor} or neutral with ${ctx.accentColor} accents.`,
        `SCENE: On person (face cropped) in urban/lifestyle context, or hung on premium hanger. Editorial lighting, fabric texture visible.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Premium outerwear that represents the brand lifestyle.`,
        sTags, q, neg(ctx, provider, "visible face, cheap fabric, flat illustration, cartoon, wrinkled mess"),
      );
    }

    case "vest_colete": {
      return parts(
        prefix, `PLATFORM: Branded vest/colete — 4:3 product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Corporate or operational vest with logo embroidery (${ctx.logoPrimary}), reflective details optional, brand color body.`,
        `COLOR: ${ctx.primaryColor} body, ${ctx.accentColor} details. Strict palette: ${ctx.allColors}.`,
        `SCENE: On person torso (face cropped) in work context, or precision flat-lay. Professional, not construction-site.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Team identity, quality, professional pride.`,
        sTags, q, neg(ctx, provider, "visible face, cheap polyester, cartoon, flat illustration, safety vest generic"),
      );
    }

    case "suit_formal": {
      return parts(
        prefix, `PLATFORM: Branded formal wear — 4:3 editorial fashion photography.`, soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Tailored suit, blazer, or formal outfit with brand details — custom lining (${ctx.patternStyle}), logo on inner label, branded cufflinks or pin (${ctx.logoSymbol}).`,
        `COLOR: Neutral suit (charcoal/navy) with ${ctx.accentColor} lining reveal. Pocket square in ${ctx.primaryColor}. Strict palette.`,
        `SCENE: Detail shots — lapel pin close-up, lining reveal, cuff detail. Premium tailoring visible. Editorial fashion.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Executive elegance with brand DNA in the details.`,
        sTags, q, neg(ctx, provider, "full body visible face, cheap fabric, cartoon, off-the-rack generic, flat illustration"),
      );
    }

    case "sneakers_shoes": {
      return parts(
        prefix, `PLATFORM: Branded sneakers/shoes — 4:3 product photography.`, soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Custom sneakers or shoes with brand colors, logo on tongue/heel tab (${ctx.logoPrimary}), pattern on insole (${ctx.patternStyle}).`,
        `COLOR: ${ctx.primaryColor} dominant, ${ctx.accentColor} accents, ${ctx.secondaryColor} sole. Strict palette.`,
        `SCENE: Hero product shot — shoe at 3/4 angle on clean surface, dramatic rim lighting, premium sneaker photography.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Streetwear premium, the collab drop everyone wants.`,
        sTags, q, neg(ctx, provider, "worn out, dirty, flat illustration, cartoon, blurry, cheap material"),
      );
    }

    case "sunglasses": {
      return parts(
        prefix, `PLATFORM: Branded sunglasses — 4:3 product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Premium sunglasses with brand details — ${ctx.logoSymbol} on temple/arm, ${ctx.accentColor} lens tint or frame accent.`,
        `COLOR: Frame in neutral or ${ctx.primaryColor}. ${ctx.accentColor} temple accent. Strict palette.`,
        `SCENE: Clean studio shot on reflective surface, or styled flat-lay with case. Dramatic lighting, lens reflection.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Fashion-forward accessory, premium lifestyle.`,
        sTags, q, neg(ctx, provider, "cheap plastic, blurry, cartoon, flat illustration, visible face wearing them"),
      );
    }

    case "phone_case": {
      return parts(
        prefix, `PLATFORM: Branded phone case — 9:16 product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Premium phone case (iPhone/Samsung) with brand art — logo (${ctx.logoPrimary}), pattern (${ctx.patternStyle}), or full-wrap graphic.`,
        `COLOR: strict palette ${ctx.allColors}. ${ctx.primaryColor} dominant, ${ctx.accentColor} accents.`,
        `SCENE: Case on phone at slight angle, clean surface, or in-hand (face cropped). Studio lighting, material texture visible.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Premium accessory, daily brand exposure.`,
        sTags, q, neg(ctx, provider, "cheap silicone, blurry print, cartoon, flat illustration, cracked phone"),
      );
    }

    case "branded_purse": {
      return parts(
        prefix, `PLATFORM: Branded bag/purse — 4:3 fashion product photography.`, soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Premium bag, clutch, or necessaire with brand identity — logo hardware (${ctx.logoSymbol}), brand pattern lining (${ctx.patternStyle}), color blocking.`,
        `COLOR: ${ctx.primaryColor} body, ${ctx.accentColor} hardware, ${ctx.secondaryColor} strap. Strict palette.`,
        `SCENE: Styled on surface with lifestyle props, or over shoulder (face cropped). Fashion editorial lighting.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Fashion accessory that IS the brand in public.`,
        sTags, q, neg(ctx, provider, "cheap fake leather, blurry, cartoon, flat illustration, off-brand colors"),
      );
    }

    case "pen_branded": {
      return parts(
        prefix, `PLATFORM: Branded pen — 4:3 macro product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Premium metal or resin pen with engraved/printed logo (${ctx.logoPrimary}), clip detail in ${ctx.accentColor}.`,
        `COLOR: Pen body in ${ctx.primaryColor}, silver/gold clip, ${ctx.accentColor} accent. Premium finish.`,
        `SCENE: Macro on notebook or desk, shallow DOF, metal reflection visible, pen cap details. Gift box optional.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Premium corporate gift, the pen you don't lend.`,
        sTags, q, neg(ctx, provider, "cheap plastic pen, blurry, cartoon, flat illustration, generic bic"),
      );
    }

    case "notebook_planner": {
      return parts(
        prefix, `PLATFORM: Branded notebook/planner — 4:3 editorial product photography.`, soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Premium hardcover notebook or planner with brand identity — embossed cover logo (${ctx.logoPrimary}), brand pattern endpapers (${ctx.patternStyle}), ribbon marker in ${ctx.accentColor}.`,
        `COLOR: Cover in ${ctx.primaryColor}, spine in ${ctx.secondaryColor}, details in ${ctx.accentColor}. Strict palette.`,
        `SCENE: Styled desk flat-lay or 3/4 angle, partially open showing endpapers. Premium paper quality visible.`,
        humanLayer, `MOOD: ${ctx.moodWords}. The notebook that organizes your life with brand style.`,
        sTags, q, neg(ctx, provider, "cheap spiral notebook, flat illustration, cartoon, blurry, generic moleskin clone"),
      );
    }

    case "keychain": {
      return parts(
        prefix, `PLATFORM: Branded keychain — 1:1 macro product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Premium keychain (metal, leather, acrylic, or enamel) with brand symbol (${ctx.logoSymbol}).`,
        `COLOR: ${ctx.primaryColor} enamel or body, ${ctx.accentColor} hardware. Strict palette.`,
        `SCENE: Macro on textured surface, keys optional, shallow DOF, material detail visible.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Small object, big brand presence.`,
        sTags, q, neg(ctx, provider, "cheap plastic, blurry, cartoon, flat illustration, generic"),
      );
    }

    case "umbrella": {
      return parts(
        prefix, `PLATFORM: Branded umbrella — 4:3 lifestyle product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Full-size or compact umbrella with brand pattern canopy (${ctx.patternStyle}), logo on panel (${ctx.logoPrimary}), wooden or branded handle.`,
        `COLOR: ${ctx.primaryColor} canopy, ${ctx.accentColor} pattern, ${ctx.secondaryColor} handle. Strict palette.`,
        `SCENE: Open umbrella from above showing pattern, OR in-hand in rain setting (face cropped). Dramatic rainy mood.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Premium rain accessory that turns bad weather into brand exposure.`,
        sTags, q, neg(ctx, provider, "cheap plastic umbrella, flat illustration, cartoon, broken umbrella, generic"),
      );
    }

    case "water_bottle": {
      return parts(
        prefix, `PLATFORM: Branded water bottle/squeeze — 4:3 product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Stainless steel or premium plastic bottle with brand identity — logo wrap (${ctx.logoPrimary}), brand pattern band (${ctx.patternStyle}), custom lid.`,
        `COLOR: Body in ${ctx.primaryColor} matte/gloss, cap in ${ctx.accentColor}. Strict palette: ${ctx.allColors}.`,
        `SCENE: Studio hero shot with condensation, OR in gym/office lifestyle context. Premium material finish visible.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Wellness meets brand lifestyle, daily companion.`,
        sTags, q, neg(ctx, provider, "cheap plastic bottle, blurry, cartoon, flat illustration, generic"),
      );
    }

    case "mouse_pad": {
      return parts(
        prefix, `PLATFORM: Branded mouse pad — 4:3 desk photography.`, soul,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Premium desk mat or mouse pad with brand pattern (${ctx.patternStyle}) or subtle logo (${ctx.logoSymbol}).`,
        `COLOR: ${ctx.primaryColor} base, ${ctx.secondaryColor} pattern. Strict palette.`,
        `SCENE: On styled desk with keyboard and mouse, overhead or 3/4 angle. Modern workspace aesthetic.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Desk real estate = brand real estate.`,
        sTags, q, neg(ctx, provider, "cheap foam, blurry, cartoon, generic, off-brand, empty void"),
      );
    }

    case "lanyard_badge": {
      return parts(
        prefix, `PLATFORM: Branded badge + lanyard — 4:3 product photography.`, soul,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: ID badge with photo placeholder + branded lanyard. Logo on badge (${ctx.logoPrimary}), pattern on lanyard (${ctx.patternStyle}).`,
        `COLOR: Badge border ${ctx.accentColor}, lanyard in ${ctx.primaryColor}, metal clip silver/gold. Strict palette.`,
        `SCENE: Flat-lay or hanging, clean background, badge detail visible. Corporate identity system.`,
        humanLayer, `MOOD: Professional team identity. Belonging and brand pride.`,
        sTags, q, neg(ctx, provider, "generic visitor badge, cheap ribbon, cartoon, flat illustration, blurry"),
      );
    }

    case "pin_button": {
      return parts(
        prefix, `PLATFORM: Branded pin/button — 1:1 macro product photography.`, soul,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Enamel pin, metal pin, or button badge with brand symbol (${ctx.logoSymbol}) or creative brand art.`,
        `COLOR: ${ctx.primaryColor} enamel, ${ctx.accentColor} metal border, ${ctx.secondaryColor} detail. Strict palette.`,
        `SCENE: Macro on fabric (denim, canvas) or collection display, pin detail visible, shallow DOF.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Collectible micro-branding.`,
        sTags, q, neg(ctx, provider, "cheap plastic, blurry, cartoon, flat illustration, generic"),
      );
    }

    case "pillow_cushion": {
      return parts(
        prefix, `PLATFORM: Branded cushion/pillow — 1:1 lifestyle product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Decorative cushion with brand pattern (${ctx.patternStyle}) or logo embroidery (${ctx.logoSymbol}).`,
        `COLOR: Fabric in ${ctx.primaryColor}, embroidery in ${ctx.accentColor}. Strict palette.`,
        `SCENE: On couch, chair, or bed in styled interior. Warm ambient light, textile texture visible.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Brand presence in domestic spaces.`,
        sTags, q, neg(ctx, provider, "cheap polyester, flat illustration, cartoon, generic, harsh lighting"),
      );
    }

    case "towel_branded": {
      return parts(
        prefix, `PLATFORM: Branded towel — 4:3 lifestyle product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Beach, bath, or hand towel with woven/printed brand pattern (${ctx.patternStyle}), logo detail (${ctx.logoSymbol}).`,
        `COLOR: ${ctx.primaryColor} dominant, ${ctx.accentColor} stripes. Strict palette.`,
        `SCENE: Folded on surface, draped over chair, or beach context. Cotton texture visible, lifestyle editorial.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Lifestyle branding, premium textile.`,
        sTags, q, neg(ctx, provider, "cheap thin towel, cartoon, flat illustration, generic hotel towel"),
      );
    }

    case "skateboard_deck": {
      return parts(
        prefix, `PLATFORM: Branded skateboard deck or surfboard — 9:16 product photography.`, soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Skateboard deck with full bottom art — brand pattern (${ctx.patternStyle}), logo (${ctx.logoPrimary}), custom graphic.`,
        `COLOR: ${ctx.primaryColor} dominant, ${ctx.accentColor} graphic accents. Strict palette.`,
        `SCENE: Deck leaning on wall or mounted, grip tape visible, urban/studio setting. Art side as hero.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Street culture meets brand identity. Collectible art piece.`,
        sTags, q, neg(ctx, provider, "worn out, dirty, cartoon generic, flat illustration, blurry art"),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FURNITURE / AMBIENTE
    // ═══════════════════════════════════════════════════════════════════════

    case "chair_furniture": {
      return parts(
        prefix, `PLATFORM: Branded furniture (chair/table/bench) — 4:3 interior photography.`, soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Custom furniture piece — upholstery in brand color (${ctx.primaryColor}), logo embossed or laser-cut (${ctx.logoSymbol}), brand pattern on cushion (${ctx.patternStyle}).`,
        `SCENE: In-situ restaurant, café, or office interior. Warm ambient light, architectural context, premium materials visible.`,
        `DESIGN: Modern design language matching ${ctx.visualStyle}. Wood, metal, leather, or fabric in brand colors.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Every surface is a brand touchpoint.`,
        sTags, q, neg(ctx, provider, "cheap plastic chair, flat illustration, empty void, cartoon, generic office"),
      );
    }

    case "fridge_wrap": {
      return parts(
        prefix, `PLATFORM: Branded fridge/freezer wrap — 4:3 in-store photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Commercial fridge or freezer with vinyl wrap — full brand art, logo (${ctx.logoPrimary}), product imagery hints, brand pattern (${ctx.patternStyle}).`,
        `COLOR: ${ctx.primaryColor} dominant wrap, ${ctx.accentColor} accent panels. Strict palette.`,
        `SCENE: In-store or bar context, fridge slightly open with interior glow, products partially visible. Realistic PDV setting.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Cold storage = warm brand impression.`,
        sTags, q, neg(ctx, provider, "generic white fridge, flat illustration, cartoon, empty room, dirty"),
      );
    }

    case "flag_banner_fabric": {
      return parts(
        prefix, `PLATFORM: Branded flag/wind banner — 9:16 outdoor photography.`, soul, journey,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Fabric flag, wind banner (feather flag), or pennant with brand art — logo (${ctx.logoPrimary}), brand colors, pattern accent.`,
        `COLOR: ${ctx.primaryColor} background, ${ctx.accentColor} logo/art. Strict palette.`,
        `SCENE: Outdoor event, storefront, or corporate entrance. Flag rippling in wind, blue sky, dynamic energy.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Brand presence in motion, visible from a distance.`,
        sTags, q, neg(ctx, provider, "still flat flag, cartoon, flat illustration, dark indoor, generic country flag"),
      );
    }

    case "doormat": {
      return parts(
        prefix, `PLATFORM: Branded doormat — 4:3 entrance photography.`, soul,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Custom doormat with brand logo (${ctx.logoPrimary}) or welcome message. Coir, rubber, or textile.`,
        `COLOR: Natural coir with ${ctx.primaryColor} print, or ${ctx.primaryColor} mat with white/cream logo.`,
        `SCENE: At entrance of store, office, or home. Door frame visible, welcoming perspective.`,
        humanLayer, `MOOD: ${ctx.moodWords}. First step into the brand world.`,
        sTags, q, neg(ctx, provider, "dirty worn doormat, flat illustration, cartoon, generic, dark"),
      );
    }

    case "wall_clock": {
      return parts(
        prefix, `PLATFORM: Branded wall clock — 1:1 product photography.`, soul,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Wall clock with brand design — logo as center (${ctx.logoSymbol}), brand colors for markers, brand pattern face.`,
        `COLOR: Face in white or ${ctx.secondaryColor}, markers in ${ctx.primaryColor}, hands in ${ctx.accentColor}.`,
        `SCENE: Mounted on textured wall (brick, concrete, wood), interior context, warm ambient light.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Time branded, every glance is brand exposure.`,
        sTags, q, neg(ctx, provider, "cheap plastic clock, flat illustration, cartoon, generic, blurry"),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PACKAGING FOOD — EXPANDED
    // ═══════════════════════════════════════════════════════════════════════

    case "grease_proof_paper": {
      return parts(
        prefix, `PLATFORM: Branded grease-proof paper / butter paper — 1:1 food photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Grease-proof or wax paper with repeating brand pattern (${ctx.patternStyle}) or logo stamp (${ctx.logoSymbol}) print.`,
        `COLOR: Pattern in ${ctx.primaryColor} on white/kraft paper. Strict palette.`,
        `SCENE: Wrapping food item (sandwich, pastry, burger), or lining a basket/tray. Food photography style, warm light.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Every bite comes with brand identity.`,
        sTags, q, neg(ctx, provider, "plain white paper, flat illustration, cartoon, messy food spill, generic"),
      );
    }

    case "napkin_holder": {
      return parts(
        prefix, `PLATFORM: Branded napkin holder / dispenser — 4:3 in-situ photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Table napkin holder or counter dispenser with brand identity — logo panel (${ctx.logoPrimary}), brand colors, material matching brand style.`,
        `MATERIAL: Metal, wood, acrylic, or ceramic matching ${ctx.visualStyle}.`,
        `COLOR: ${ctx.primaryColor} body or accent, branded panel. Strict palette: ${ctx.allColors}.`,
        `SCENE: On restaurant/café table or counter with branded napkins, contextual setting, warm ambient light.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Table furniture that works as brand signage.`,
        sTags, q, neg(ctx, provider, "cheap plastic dispenser, cartoon, flat illustration, empty void, generic"),
      );
    }

    case "cup_mug": {
      return parts(
        prefix, `PLATFORM: Branded mug/cup — 4:3 lifestyle product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Ceramic mug or porcelain cup with brand identity — logo (${ctx.logoPrimary}) on body, pattern on interior rim (${ctx.patternStyle}), branded coaster optional.`,
        `COLOR: White ceramic with ${ctx.primaryColor} logo, or ${ctx.primaryColor} mug with white logo. ${ctx.accentColor} interior detail.`,
        `SCENE: Lifestyle desk/café context with coffee/tea, steam wisps, warm natural light. Or styled product shot on clean surface.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Morning ritual meets brand identity.`,
        sTags, q, neg(ctx, provider, "cheap printed mug, blurry logo, cartoon, flat illustration, generic corporate"),
      );
    }

    case "pizza_box": {
      return parts(
        prefix, `PLATFORM: Branded pizza box — 4:3 product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Pizza box (top and inside lid) with full brand art — logo (${ctx.logoPrimary}), brand pattern (${ctx.patternStyle}), fun interior art or messaging zone.`,
        `COLOR: Kraft exterior with ${ctx.primaryColor} art, ${ctx.accentColor} accents. Strict palette: ${ctx.allColors}.`,
        `SCENE: Stack of boxes or single box half-open showing interior art. Counter/table context, warm light.`,
        humanLayer, `MOOD: ${ctx.moodWords}. The box that's too cool to throw away.`,
        sTags, q, neg(ctx, provider, "generic white box, flat illustration, cartoon, messy grease, blurry, generic pizza chain"),
      );
    }

    case "candy_wrapper": {
      return parts(
        prefix, `PLATFORM: Branded candy/chocolate wrapper — 4:3 product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Small product wrapper (chocolate bar, candy, bombom, cookie) with full brand art. Premium finish foil or matte.`,
        `DESIGN: Logo (${ctx.logoPrimary}), brand pattern (${ctx.patternStyle}), ${ctx.primaryColor} dominant. ${ctx.marketingArch}.`,
        `COLOR: Strict palette ${ctx.allColors}. Foil accent optional.`,
        `SCENE: Macro product shot, multiple pieces artfully arranged, foil texture and print quality visible.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Premium confectionery branding, giftable presentation.`,
        sTags, q, neg(ctx, provider, "cheap plastic wrap, blurry, cartoon, generic, off-brand, messy"),
      );
    }

    case "packaging_tape": {
      return parts(
        prefix, `PLATFORM: Branded packaging tape — 21:9 product photography.`, soul,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Custom printed packaging tape with repeating logo (${ctx.logoPrimary}) and pattern (${ctx.patternStyle}).`,
        `COLOR: Tape in ${ctx.primaryColor} with white/${ctx.accentColor} print. Strict palette.`,
        `SCENE: Tape sealing a branded box or unrolling from dispenser, close-up showing print quality.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Every shipment is a brand moment.`,
        sTags, q, neg(ctx, provider, "generic brown tape, blurry, cartoon, flat illustration"),
      );
    }

    case "matchbox": {
      return parts(
        prefix, `PLATFORM: Branded matchbox — 4:3 macro product photography.`, soul, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Small matchbox with full brand art — logo (${ctx.logoPrimary}), pattern (${ctx.patternStyle}), brand symbol (${ctx.logoSymbol}).`,
        `COLOR: ${ctx.primaryColor} body, ${ctx.accentColor} striker, white match heads. Strict palette.`,
        `SCENE: Macro on bar counter or table, candle context optional, warm ambient light, vintage-premium feel.`,
        humanLayer, `MOOD: ${ctx.moodWords}. The detail nobody expects but everyone remembers.`,
        sTags, q, neg(ctx, provider, "generic safety matches, flat illustration, cartoon, blurry, cheap"),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SOCIAL / DIGITAL TEMPLATES
    // ═══════════════════════════════════════════════════════════════════════

    case "weekly_agenda_post": {
      return parts(
        prefix,
        `PLATFORM: Instagram weekly agenda/schedule post — 1:1 square format for feed.`, soul,
        `BRAND: ${B} (${data.industry}). Personality: ${ctx.personality}.`,
        `DESIGN: Weekly schedule/agenda grid layout — 7 days with time slots or event highlights. Clean typographic hierarchy.`,
        `TYPOGRAPHY: ${ctx.displayFont} for day headers, ${ctx.bodyFont} for details. Bold ${ctx.primaryColor} headers.`,
        `COLOR: ${ctx.primaryColor} header bar, white/light content area, ${ctx.accentColor} for highlights/today marker. Strict palette: ${ctx.allColors}.`,
        `LAYOUT: Clean grid or list layout, logo watermark (${ctx.logoSymbol}) bottom corner, brand pattern (${ctx.patternStyle}) subtle background.`,
        `STYLE: ${ctx.marketingArch}. On-brand, not generic Canva template. ${ctx.visualStyle}.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Organized, professional, the weekly post followers save and screenshot.`,
        `No actual text content — show layout structure with placeholder blocks. Pure design template.`,
        sTags, q, neg(ctx, provider, "generic canva template, clipart, rainbow colors, messy layout, hard to read, off-brand"),
      );
    }

    case "credit_debit_card": {
      return parts(
        prefix, `PLATFORM: Co-branded credit/debit card — 16:9 premium product photography.`, soul, journey,
        `BRAND: ${B} (${data.industry}).`,
        `CARD: Premium metal or plastic card with brand art — logo (${ctx.logoPrimary}) upper left, brand pattern (${ctx.patternStyle}) as subtle background texture.`,
        `DESIGN: ${ctx.marketingArch}. Clean chip placement, contactless symbol, minimal card number zone. ${ctx.visualStyle}.`,
        `COLOR: ${ctx.primaryColor} dominant, ${ctx.accentColor} chip surround, metallic foil accents. Strict palette.`,
        `SCENE: Slight angle on dark surface, dramatic lighting, metallic edge reflection, premium banking photography.`,
        humanLayer, `MOOD: ${ctx.moodWords}. The card people choose for the design, not just the benefits.`,
        sTags, q, neg(ctx, provider, "cheap plastic, flat illustration, generic visa card, blurry, cartoon, real card numbers"),
      );
    }

    case "ticket_event": {
      return parts(
        prefix, `PLATFORM: Event ticket/voucher — 16:9 product photography.`, soul,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Premium event ticket, voucher, or admission pass with brand identity and die-cut perforated edge.`,
        `DESIGN: Logo (${ctx.logoPrimary}), brand pattern border (${ctx.patternStyle}), event info zone, QR code placeholder.`,
        `COLOR: ${ctx.primaryColor} header, ${ctx.accentColor} accent details, clean white info zone. Strict palette.`,
        `SCENE: Flat on surface or in-hand, editorial style, premium paper stock visible.`,
        humanLayer, `MOOD: ${ctx.moodWords}. The ticket that becomes a keepsake.`,
        sTags, q, neg(ctx, provider, "generic ticket stub, blurry, cartoon, flat illustration, off-brand"),
      );
    }

    case "wristband": {
      return parts(
        prefix, `PLATFORM: Event wristband — 21:9 macro product photography.`, soul,
        `BRAND: ${B} (${data.industry}).`,
        `ITEM: Tyvek, fabric, or silicone wristband with brand art — logo (${ctx.logoPrimary}), pattern (${ctx.patternStyle}), event branding.`,
        `COLOR: ${ctx.primaryColor} band, ${ctx.accentColor} print. Strict palette.`,
        `SCENE: On wrist (hand visible, face not), or flat collection of different designs. Event atmosphere hint.`,
        humanLayer, `MOOD: ${ctx.moodWords}. Wearable brand memory from an event.`,
        sTags, q, neg(ctx, provider, "cheap hospital band, blurry, cartoon, flat illustration, generic"),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STATIONERY EXTENDED
    // ═══════════════════════════════════════════════════════════════════════

    case "gift_card": {
      return parts(
        prefix,
        `PLATFORM: Gift card / vale presente — 16:9 showing premium branded gift card with packaging.`,
        soul, journey,
        `BRAND: ${B} (${data.industry}).`,
        `CARD: Credit-card sized gift card with brand art. Premium finish.`,
        `DESIGN: Logo (${ctx.logoPrimary}), brand pattern (${ctx.patternStyle}), ${ctx.primaryColor} dominant, ${ctx.accentColor} details.`,
        `PACKAGING: Card in branded envelope or sleeve. ${ctx.visualStyle}.`,
        `SCENE: Styled on premium surface, card slightly angled, envelope partially open. Gift-ready.`,
        `LIGHTING: Soft studio light, foil stamp or spot UV detail visible, premium material feel.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The gift card that feels like a gift itself.`,
        sTags, q, neg(ctx, provider, "flat digital mockup, generic white card, cheap plastic, cartoon, no finishing"),
      );
    }

    case "loyalty_card": {
      return parts(
        prefix,
        `PLATFORM: Loyalty card / VIP membership card — 16:9 showing branded retention card with premium finish.`,
        soul, journey,
        `BRAND: ${B} (${data.industry}).`,
        `CARD: VIP/loyalty card with brand identity. Front: logo + membership tier. Back: stamp grid or QR code zone.`,
        `DESIGN: ${ctx.primaryColor} dominant, ${ctx.accentColor} tier accent, logo (${ctx.logoPrimary}), metallic foil detail.`,
        `STYLE: ${ctx.marketingArch}. ${ctx.visualStyle}. Premium card stock or PVC.`,
        `SCENE: On premium surface alongside product or coffee cup for context. Slight angle.`,
        `LIGHTING: Soft directional light, foil/emboss detail visible, premium material texture.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Exclusive, worth carrying in the wallet, status symbol.`,
        sTags, q, neg(ctx, provider, "cheap paper, generic stamp card, flat illustration, cartoon, blurry, off-brand"),
      );
    }

    case "sticker_sheet": {
      return parts(
        prefix,
        `PLATFORM: Brand sticker sheet — 1:1 flat-lay showing die-cut sticker collection.`,
        soul, journey,
        `BRAND: ${B} (${data.industry}).`,
        `COLLECTION: 8–12 die-cut stickers with logo variations, brand symbol (${ctx.logoSymbol}), pattern swatches, icons, tagline badges.`,
        `DESIGN: ${ctx.marketingArch}. Each sticker uses strict palette (${ctx.allColors}). Mix of sizes and shapes.`,
        `STYLE: ${ctx.visualStyle}. Premium vinyl or paper stickers with kiss-cut borders.`,
        `SCENE: Flat-lay on solid ${ctx.secondaryColor} or neutral surface, stickers slightly scattered with intentional overlap.`,
        `LIGHTING: Even soft overhead light, sticker edge detail visible, slight shadow for depth.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Collectible, fun, the sticker sheet fans buy and hoard.`,
        sTags, q, neg(ctx, provider, "blurry, cheap print, random layout, off-brand colors, text-heavy, cartoon"),
      );
    }

    case "wax_seal_stamp": {
      return parts(
        prefix,
        `PLATFORM: Wax seal and/or rubber stamp — 1:1 macro close-up showing artisanal brand seal.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `ITEMS: Brass wax seal stamp + wax seal impression in ${ctx.primaryColor} or ${ctx.accentColor}. Optional: wooden-handle rubber stamp.`,
        `DESIGN: Brand symbol (${ctx.logoSymbol}) rendered as seal/stamp art. Circular composition, intricate but readable.`,
        `SCENE: Macro shot on envelope, packaging, or aged paper surface. Wax seal freshly pressed, slight imperfections for authenticity.`,
        `LIGHTING: Warm directional light, wax texture and brass reflection visible, shallow DOF.`,
        `MATERIALS: Sealing wax, brass stamp head, wooden handle, quality paper substrate.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Artisanal, ceremonial, the detail that makes unboxing feel like opening a letter from another era.`,
        sTags, q, neg(ctx, provider, "flat illustration, plastic, digital render, cartoon, blurry, cheap wax, modern sterile"),
      );
    }

    case "invoice_receipt": {
      return parts(
        prefix,
        `PLATFORM: Branded invoice or receipt — 4:3 flat-lay showing branded fiscal/commercial document.`,
        soul,
        `BRAND: ${B} (${data.industry}).`,
        `DOCUMENT: A4 invoice or receipt/comanda with brand identity applied. Professional but distinctive.`,
        `DESIGN: Logo header (${ctx.logoPrimary}), ${ctx.primaryColor} accent lines, ${ctx.bodyFont} for data fields, brand pattern (${ctx.patternStyle}) subtle footer or border.`,
        `COLOR: Predominantly white/cream with ${ctx.primaryColor} structural accents. Strict palette: ${ctx.allColors}.`,
        `SCENE: On clipboard, desk, or counter alongside pen and branded elements. Slight angle.`,
        `LIGHTING: Soft overhead, paper texture visible, clean professional feel.`,
        humanLayer,
        `MOOD: Professional, trustworthy, branded down to the last touchpoint.`,
        sTags, q, neg(ctx, provider, "generic blank form, messy desk, illegible text, cartoon, flat digital, off-brand"),
      );
    }

    case "envelope_letterhead": {
      return parts(
        prefix,
        `PLATFORM: Branded envelope + letterhead set — 4:3 editorial flat-lay showing corporate correspondence system.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}). Personality: ${ctx.personality}.`,
        `ITEMS: C4/DL envelope (front + back) and A4 letterhead paper, both branded. Optional wax seal on envelope.`,
        `DESIGN: Logo (${ctx.logoPrimary}) on letterhead header and envelope flap, brand pattern (${ctx.patternStyle}) envelope lining.`,
        `COLOR: White paper base, ${ctx.primaryColor} logo and accents, ${ctx.accentColor} envelope lining. Strict palette: ${ctx.allColors}.`,
        `TYPOGRAPHY: ${ctx.displayFont} for headers, ${ctx.bodyFont} for body areas. Elegant spacing.`,
        `SCENE: Styled flat-lay on premium surface (marble, dark wood). Partially open envelope revealing patterned lining.`,
        `LIGHTING: Soft directional, paper weight and texture visible, premium stationery photography.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Correspondence that commands attention before being read.`,
        sTags, q, neg(ctx, provider, "cheap paper, flat digital, generic template, cartoon, lorem ipsum text, off-brand"),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DIGITAL EXTENDED
    // ═══════════════════════════════════════════════════════════════════════

    case "landing_page": {
      return parts(
        prefix,
        `PHOTOREALISTIC PRODUCT PHOTOGRAPHY of a MacBook Pro 14" displaying the ${B} landing page — 9:16 vertical format.`,
        soul, journey,
        `MANDATORY DEVICE FRAME: Show a real MacBook Pro 14" (M3, space black or silver) on a clean minimal desk. The screen displays the ${B} landing page at full scroll. The laptop is a REAL PHYSICAL OBJECT — aluminum edge reflections, keyboard visible below screen, realistic screen luminosity and slight glass reflection. NOT a flat screenshot — a PHOTOGRAPH of a laptop showing a website.`,
        `LANDING PAGE ON SCREEN: Full branded landing page — NOT a wireframe, NOT lorem ipsum. Sections visible: (1) Hero with full-bleed ${ctx.primaryColor} brand visual and logo in nav, (2) Value props in 3-column grid, (3) Social proof / testimonial band, (4) CTA section with ${ctx.accentColor} button.`,
        `BRAND: ${B} (${data.industry}). Purpose: ${ctx.purpose}. Message: ${ctx.messagingPillar}.`,
        ctx.tagline,
        `WEB DESIGN: ${ctx.marketingArch}. ${ctx.visualStyle}. Modern browser frame with Safari/Chrome address bar. Brand pattern (${ctx.patternStyle}) as section divider.`,
        `COLOR SYSTEM: ${ctx.primaryColor} hero, white content, ${ctx.secondaryColor} alternate bands, ${ctx.accentColor} CTAs.`,
        `TYPOGRAPHY: ${ctx.displayFont} Bold headlines, ${ctx.bodyFont} Regular body.`,
        `BRAND ELEMENTS: Logo in navbar (${ctx.logoPrimary}), branded iconography, brand illustrations matching visual system.`,
        `DESK ENVIRONMENT: Minimal — clean desk surface (white, light wood, or dark), maybe a coffee cup or plant edge barely visible. Not cluttered. The laptop is the hero.`,
        `LIGHTING: Soft ambient from upper-left, screen glow on keyboard, subtle screen reflection showing room ceiling. Premium Apple product photography standard.`,
        `CAMERA: 50mm f/2.8, 30° overhead angle looking down at laptop. Screen sharp, desk edges softly blurred.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. The landing page that converts AND wins design awards.`,
        sTags, q, neg(ctx, provider, "wireframe, generic template, lorem ipsum, floating screenshot, no device, old browser, flat, CGI, white void, no desk"),
      );
    }

    case "podcast_cover": {
      return parts(
        prefix,
        `PLATFORM: Podcast cover art — 1:1 square (3000×3000px minimum) for Apple Podcasts, Spotify, etc.`,
        soul, journey,
        `MARKETING INTENT: Stand out in the podcast feed. Must read clearly at 64px thumbnail AND look premium at full size.`,
        `BRAND: ${B} (${data.industry}).`,
        `VISUAL DESIGN: Bold, graphic, minimal. ${ctx.marketingArch}. One dominant visual element.`,
        `COLOR: ${ctx.primaryColor} dominant background, ${ctx.accentColor} focal element, strict palette: ${ctx.allPrimaryColors}.`,
        `BRAND MARK: ${ctx.logoSymbol} or derived graphic element — prominent but not a straight logo placement.`,
        `STYLE: ${ctx.visualStyle}. No photographic content — pure graphic design. Reads at any scale.`,
        `COMPOSITION: Centered or offset bold graphic, clean edges, high contrast for feed visibility.`,
        humanLayer,
        `MOOD: ${ctx.moodWords}. Authoritative, recognizable, the cover art that makes you subscribe before reading the description.`,
        `REFERENCES: Huberman Lab, Lex Fridman, How I Built This — adapted to ${data.industry} aesthetic.`,
        sTags, q, neg(ctx, provider, "photographic, text overlays, cluttered, low contrast, generic microphone icon, cartoon face"),
      );
    }

    case "app_icon": {
      return parts(
        prefix,
        `PLATFORM: App icon — 1:1 square (1024×1024px) for iOS App Store and Google Play.`,
        soul,
        `MARKETING INTENT: Instantly recognizable at 64px on phone home screen. Simple, bold, no ambiguity.`,
        `BRAND: ${B} (${data.industry}).`,
        `DESIGN: Brand symbol (${ctx.logoSymbol}) simplified to absolute minimum. Works as silhouette.`,
        `COLOR: ${ctx.primaryColor} background, symbol in white or ${ctx.accentColor}. Maximum 2–3 colors total.`,
        `SHAPE: Rounded square (iOS standard). Symbol centered with generous padding (20% margin).`,
        `STYLE: Flat or minimal gradient. No 3D, no photographic, no text. ${ctx.visualStyle} essence distilled.`,
        `RENDERING: Pixel-perfect at all sizes (16px to 1024px). No fine details that disappear at small scale.`,
        humanLayer,
        `MOOD: Clean, confident, premium. The icon that users show off on their home screen.`,
        `REFERENCES: Notion, Linear, Arc, Figma, Stripe — modern app icon standards.`,
        sTags, q, neg(ctx, provider, "text in icon, photographic, complex illustration, 3D glossy, gradient overload, multiple elements, fine details"),
      );
    }

    default: {
      return parts(
        `Professional brand visual for ${B} (${data.industry}).`,
        ctx.visualStyle, ctx.colorMood, ctx.composition, q,
        sTags, neg(ctx, provider),
      );
    }
  }
}

export type AspectRatioOption = "1:1" | "16:9" | "9:16" | "4:3" | "21:9";

export interface SizeVariant {
  label: string;
  aspectRatio: AspectRatioOption;
  dims?: string;
}

export function detectSizeVariants(appType: string): SizeVariant[] {
  const t = appType.toLowerCase();

  // ─── SOCIAL ───────────────────────────────────────────────────────
  if (/story|stories|reels/.test(t))
    return [
      { label: "Stories 9:16", aspectRatio: "9:16", dims: "1080×1920px" },
      { label: "Feed 1:1", aspectRatio: "1:1", dims: "1080×1080px" },
    ];

  if (/instagram|social|post|feed|redes/.test(t))
    return [
      { label: "Feed 1:1", aspectRatio: "1:1", dims: "1080×1080px" },
      { label: "Stories 9:16", aspectRatio: "9:16", dims: "1080×1920px" },
      { label: "Cover 16:9", aspectRatio: "16:9", dims: "1200×630px" },
    ];

  if (/podcast/.test(t))
    return [
      { label: "Capa 1:1", aspectRatio: "1:1", dims: "3000×3000px" },
    ];

  if (/[ií]cone.*app|app.*icon|favicon/.test(t))
    return [
      { label: "Ícone 1:1", aspectRatio: "1:1", dims: "1024×1024px" },
    ];

  // ─── RETAIL / PDV ─────────────────────────────────────────────────
  if (/fachada|storefront|vitrine|window.*display/.test(t))
    return [
      { label: "Panorama 16:9", aspectRatio: "16:9", dims: "1600×900px" },
      { label: "Banner 21:9", aspectRatio: "21:9", dims: "1600×686px" },
    ];

  if (/neon|letreiro|luminoso/.test(t))
    return [
      { label: "Paisagem 16:9", aspectRatio: "16:9", dims: "1200×675px" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "1200×1200px" },
    ];

  if (/menu.*board|quadro.*menu|cardápio.*parede/.test(t))
    return [
      { label: "Retrato 4:3", aspectRatio: "4:3", dims: "60×80cm" },
      { label: "Paisagem 16:9", aspectRatio: "16:9", dims: "120×68cm" },
    ];

  if (/estande|feira|expo|booth|stand/.test(t))
    return [
      { label: "Panorama 16:9", aspectRatio: "16:9", dims: "6×3m" },
      { label: "Wide 21:9", aspectRatio: "21:9", dims: "6×2m" },
    ];

  if (/totem|sinaliza[çc][aã]o.*digital|digital.*signage|kiosk/.test(t))
    return [
      { label: "Vertical 9:16", aspectRatio: "9:16", dims: "1080×1920px" },
      { label: "Retrato 4:3", aspectRatio: "4:3", dims: "1080×1440px" },
    ];

  // ─── VEHICLE ──────────────────────────────────────────────────────
  if (/caminh[aã]o|van|ve[ií]culo|frota|fleet|vehicle|envelopamento|food.*truck/.test(t))
    return [
      { label: "Lateral 16:9", aspectRatio: "16:9", dims: "4×2m" },
      { label: "Wide 21:9", aspectRatio: "21:9", dims: "5×1.5m" },
    ];

  // ─── OOH / PRINT ─────────────────────────────────────────────────
  if (/outdoor|billboard|ooh/.test(t))
    return [
      { label: "Outdoor 16:9", aspectRatio: "16:9", dims: "9×3m" },
      { label: "Banner 21:9", aspectRatio: "21:9", dims: "6×2m" },
      { label: "Totem 9:16", aspectRatio: "9:16", dims: "120×180cm" },
    ];

  if (/abrigo.*[oô]nibus|bus.*shelter|metr[oô]|transit/.test(t))
    return [
      { label: "Retrato 9:16", aspectRatio: "9:16", dims: "120×180cm" },
      { label: "Paisagem 16:9", aspectRatio: "16:9", dims: "180×120cm" },
    ];

  if (/roll.*up|x.*banner|banner.*vertical|banner.*evento/.test(t))
    return [
      { label: "Roll-up 9:16", aspectRatio: "9:16", dims: "85×200cm" },
    ];

  if (/p[oô]ster|cartaz|poster/.test(t))
    return [
      { label: "A2 Vertical 9:16", aspectRatio: "9:16", dims: "42×59cm" },
      { label: "A3 4:3", aspectRatio: "4:3", dims: "30×42cm" },
    ];

  if (/flyer|panfleto|folheto/.test(t))
    return [
      { label: "A5 4:3", aspectRatio: "4:3", dims: "148×210mm" },
      { label: "DL 9:16", aspectRatio: "9:16", dims: "99×210mm" },
    ];

  if (/folder|cat[aá]logo|brochure|tri.*fold/.test(t))
    return [
      { label: "A4 4:3", aspectRatio: "4:3", dims: "210×297mm" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "210×210mm" },
    ];

  // ─── PACKAGING ────────────────────────────────────────────────────
  if (/garrafa|bottle|r[oó]tulo.*bebida|\blata\b|can.*bebida|beverage/.test(t))
    return [
      { label: "Produto 4:3", aspectRatio: "4:3", dims: "800×600px" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "800×800px" },
    ];

  if (/copo|sleeve|cup/.test(t))
    return [
      { label: "Produto 4:3", aspectRatio: "4:3", dims: "800×600px" },
    ];

  if (/r[oó]tulo|label|tag|etiqueta/.test(t))
    return [
      { label: "Produto 4:3", aspectRatio: "4:3", dims: "800×600px" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "800×800px" },
    ];

  if (/pote|pot|bowl|tigela|a[çc]a[ií]|sorvete|coaster|porta.*copo/.test(t))
    return [
      { label: "Produto 4:3", aspectRatio: "4:3", dims: "800×600px" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "800×800px" },
    ];

  if (/bandeja|tray|wrapper|inv[oó]lucro|embrulho|tent.*card|display.*mesa/.test(t))
    return [
      { label: "Produto 4:3", aspectRatio: "4:3", dims: "800×600px" },
    ];

  if (/standee|display.*ch[aã]o|totem.*impresso/.test(t))
    return [
      { label: "Vertical 9:16", aspectRatio: "9:16", dims: "60×160cm" },
    ];

  if (/wobbler|shelf.*talker|g[oô]ndola|etiqueta.*pre[çc]o/.test(t))
    return [
      { label: "Produto 4:3", aspectRatio: "4:3", dims: "10×7cm" },
    ];

  if (/card[aá]pio|menu.*impresso/.test(t))
    return [
      { label: "A4 4:3", aspectRatio: "4:3", dims: "210×297mm" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "210×210mm" },
    ];

  if (/embalagem|packaging|sacola|caixa|bag|pote|copo|delivery|gift.*box|product.*box/.test(t))
    return [
      { label: "Kit 4:3", aspectRatio: "4:3", dims: "800×600px" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "800×800px" },
    ];

  // ─── MERCH / WEARABLE ────────────────────────────────────────────
  if (/capa.*celular|phone.*case|capinha/.test(t))
    return [
      { label: "Vertical 9:16", aspectRatio: "9:16", dims: "375×812px" },
      { label: "Produto 4:3", aspectRatio: "4:3", dims: "800×600px" },
    ];

  if (/skate|prancha|surfboard/.test(t))
    return [
      { label: "Vertical 9:16", aspectRatio: "9:16", dims: "800×2400px" },
    ];

  if (/chaveiro|keychain|\bpin\b|botton|broche/.test(t))
    return [
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "800×800px" },
    ];

  if (/almofada|cushion|pillow|rel[oó]gio.*parede|wall.*clock/.test(t))
    return [
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "800×800px" },
    ];

  if (/bandeira|flag|estandarte|wind.*banner/.test(t))
    return [
      { label: "Vertical 9:16", aspectRatio: "9:16", dims: "60×150cm" },
    ];

  if (/pulseira|wristband|fita.*adesiva|packaging.*tape/.test(t))
    return [
      { label: "Wide 21:9", aspectRatio: "21:9", dims: "20×3cm" },
    ];

  if (/agenda.*semana|weekly|programa[çc][aã]o/.test(t))
    return [
      { label: "Feed 1:1", aspectRatio: "1:1", dims: "1080×1080px" },
      { label: "Stories 9:16", aspectRatio: "9:16", dims: "1080×1920px" },
    ];

  if (/cart[aã]o.*cr[eé]dito|cart[aã]o.*d[eé]bito|credit|debit|ingresso|ticket|voucher/.test(t))
    return [
      { label: "Cartão 16:9", aspectRatio: "16:9", dims: "85×55mm" },
    ];

  if (/geladeira|freezer|fridge|cadeira|mesa.*branded|m[oó]vel|capacho|doormat/.test(t))
    return [
      { label: "Produto 4:3", aspectRatio: "4:3", dims: "800×600px" },
    ];

  if (/f[oó]sforo|matchbox|bala|bombom|candy|chocolate/.test(t))
    return [
      { label: "Produto 4:3", aspectRatio: "4:3", dims: "800×600px" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "800×800px" },
    ];

  if (/uniforme|camiseta|avental|camisa|uniform|apron|polo|moletom|hoodie|bon[eé]|cap|tote|ecobag|jaqueta|jacket|colete|vest|terno|suit|t[eê]nis|sneaker|[oó]culos|sunglasses|bolsa|purse|caneta|pen|caderno|notebook|guarda.*chuva|umbrella|squeeze|garrafa.*t[eé]rmica|mouse.*pad|crach[aá]|lanyard|toalha|towel|caneca|mug/.test(t))
    return [
      { label: "Produto 4:3", aspectRatio: "4:3", dims: "800×600px" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "800×800px" },
    ];

  // ─── STATIONERY ───────────────────────────────────────────────────
  if (/vale.*presente|gift.*card|fidelidade|loyalty|vip.*card/.test(t))
    return [
      { label: "Cartão 16:9", aspectRatio: "16:9", dims: "85×55mm" },
    ];

  if (/adesivo|sticker|selo|carimbo|wax|stamp/.test(t))
    return [
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "800×800px" },
    ];

  if (/envelope|papel.*timbrado|letterhead|nota.*fiscal|invoice|recibo|receipt/.test(t))
    return [
      { label: "A4 4:3", aspectRatio: "4:3", dims: "210×297mm" },
    ];

  // ─── DIGITAL ──────────────────────────────────────────────────────
  if (/email|newsletter|mailing/.test(t))
    return [
      { label: "Header 21:9", aspectRatio: "21:9", dims: "600×200px" },
      { label: "Banner 16:9", aspectRatio: "16:9", dims: "600×338px" },
    ];

  if (/card|cartão|visita|business/.test(t))
    return [
      { label: "Padrão 16:9", aspectRatio: "16:9", dims: "85×55mm" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "60×60mm" },
    ];

  if (/\bapp\b|mobile|interface|tela|screen|dashboard/.test(t))
    return [
      { label: "Mobile 9:16", aspectRatio: "9:16", dims: "375×812px" },
      { label: "Desktop 16:9", aspectRatio: "16:9", dims: "1440×900px" },
    ];

  if (/landing.*page|banner|hero|site|web|landing|header|cover|capa/.test(t))
    return [
      { label: "Hero 16:9", aspectRatio: "16:9", dims: "1440×810px" },
      { label: "Banner 21:9", aspectRatio: "21:9", dims: "1440×614px" },
      { label: "Vertical 9:16", aspectRatio: "9:16", dims: "810×1440px" },
    ];

  if (/menu|cardápio|folder|brochure|papelaria|colateral/.test(t))
    return [
      { label: "A4 4:3", aspectRatio: "4:3", dims: "210×297mm" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "210×210mm" },
    ];

  return [
    { label: "Quadrado 1:1", aspectRatio: "1:1" },
    { label: "Paisagem 16:9", aspectRatio: "16:9" },
    { label: "Vertical 9:16", aspectRatio: "9:16" },
  ];
}

/**
 * Detect the closest AssetKey from free-form user text.
 * Searches BOTH app.type AND app.description + customInstruction for richer matching.
 */
export function detectApplicationAssetKey(
  appType: string,
  appDescription?: string,
  customInstruction?: string
): AssetKey {
  // Combine all user-provided text for matching — type has highest priority
  // but description and instruction provide fallback context
  const t = appType.toLowerCase();
  const all = `${t} ${(appDescription ?? "").toLowerCase()} ${(customInstruction ?? "").toLowerCase()}`;

  // ─── RETAIL / PDV ─────────────────────────────────────────────────
  if (/fachada|storefront|loja.*fora|exterior.*loja/.test(t)) return "storefront_facade";
  if (/vitrine|window.*display|vitrin/.test(t)) return "window_display";
  if (/neon|letreiro|luminoso|sign.*light/.test(t)) return "neon_sign";
  if (/menu.*board|quadro.*menu|cardápio.*parede/.test(t)) return "menu_board";
  if (/estande|feira|expo|booth|stand/.test(t)) return "trade_show_booth";
  if (/totem|sinaliza[çc][aã]o.*digital|digital.*signage|kiosk|quiosque/.test(t)) return "digital_signage";
  // ─── VEHICLE ──────────────────────────────────────────────────────
  if (/food.*truck/.test(t)) return "food_truck";
  if (/caminh[aã]o|van|ve[ií]culo|frota|fleet|vehicle.*wrap|envelopamento/.test(t)) return "vehicle_wrap";
  // ─── PACKAGING SPECIFIC ───────────────────────────────────────────
  if (/garrafa|bottle|r[oó]tulo.*bebida|wine.*label|beer.*label/.test(t)) return "beverage_bottle";
  if (/\blata\b|can.*bebida|beverage.*can/.test(t)) return "beverage_can";
  if (/copo|sleeve|cup|caf[eé].*copo|coffee.*cup/.test(t)) return "cup_sleeve";
  if (/r[oó]tulo|label|adesivo.*produto/.test(all)) return "food_label";
  if (/caixa.*produto|product.*box|unboxing|embalagem.*caixa/.test(t)) return "product_box";
  if (/sacola.*compra|shopping.*bag|sacola.*loja/.test(t)) return "shopping_bag";
  if (/gift.*box|caixa.*presente|kit.*presente/.test(t)) return "gift_box";
  if (/\btag\b|etiqueta|hang.*tag/.test(t)) return "hang_tag";
  if (/guardanapo|napkin|placemat|jogo.*americano|toalha.*mesa/.test(t)) return "napkin_placemat";
  // ─── PACKAGING — specific product keywords ──────────────────────
  if (/pote|pot|bowl|tigela|a[çc]a[ií]|sorvete|ice.*cream|iogurte|yogurt|salada|salad|poke/.test(all)) return "bowl_pot";
  if (/bandeja|tray|forra[çc][aã]o|liner/.test(all)) return "tray_liner";
  if (/wrapper|inv[oó]lucro|embrulho|papel.*wrap/.test(all)) return "wrapper_sleeve";
  if (/porta.*copo|coaster|bolacha.*bar/.test(all)) return "coaster";
  if (/card[aá]pio|menu.*impresso|menu.*print/.test(all)) return "menu_printed";
  if (/wobbler|shelf.*talker|g[oô]ndola|etiqueta.*pre[çc]o|price.*tag/.test(all)) return "price_tag_shelf";
  if (/tent.*card|display.*mesa/.test(all)) return "tent_card";
  if (/standee|display.*ch[aã]o|totem.*impresso/.test(all)) return "standee_display";
  if (/papel.*gordura|papel.*manteiga|grease.*proof|anti.*gordura|desengordurante/.test(all)) return "grease_proof_paper";
  if (/guardanapeira|porta.*guardanapo|napkin.*holder|dispenser.*guardanapo/.test(all)) return "napkin_holder";
  if (/caneca|x[ií]cara|mug|ceramic.*cup/.test(all)) return "cup_mug";
  if (/pizza.*box|caixa.*pizza/.test(all)) return "pizza_box";
  if (/bala|bombom|chocolate|candy|wrapper.*doce/.test(all)) return "candy_wrapper";
  if (/fita.*adesiva|packaging.*tape|tape.*branded/.test(all)) return "packaging_tape";
  if (/f[oó]sforo|matchbox|matches/.test(all)) return "matchbox";
  if (/cadeira|mesa.*branded|banco.*branded|m[oó]vel|furniture/.test(all)) return "chair_furniture";
  if (/geladeira|freezer|fridge/.test(all)) return "fridge_wrap";
  if (/bandeira|flag|estandarte|galhardete|wind.*banner/.test(all)) return "flag_banner_fabric";
  if (/capacho|doormat/.test(all)) return "doormat";
  if (/rel[oó]gio.*parede|wall.*clock/.test(all)) return "wall_clock";
  if (/agenda.*semana|weekly.*post|programa[çc][aã]o.*semana/.test(all)) return "weekly_agenda_post";
  if (/cart[aã]o.*cr[eé]dito|cart[aã]o.*d[eé]bito|credit.*card|debit.*card/.test(all)) return "credit_debit_card";
  if (/ingresso|ticket|voucher.*evento/.test(all)) return "ticket_event";
  if (/embalagem|packaging|sacola|caixa|bag|delivery/.test(t)) return "delivery_packaging";
  // ─── MERCH ────────────────────────────────────────────────────────
  if (/polo|camisa.*polo/.test(t)) return "polo_uniform";
  if (/bon[eé]|cap|chap[eé]u|hat/.test(t)) return "cap_hat";
  if (/ecobag|tote|sacola.*algod[aã]o|sacola.*reutiliz/.test(t)) return "tote_bag";
  if (/moletom|hoodie|blusa.*frio/.test(t)) return "hoodie";
  if (/jaqueta|jacket|casaco|coat|bomber/.test(t)) return "jacket_coat";
  if (/colete|vest/.test(t)) return "vest_colete";
  if (/terno|suit|blazer|formal/.test(t)) return "suit_formal";
  if (/t[eê]nis|sneaker|cal[çc]ado|sapato|shoe/.test(t)) return "sneakers_shoes";
  if (/[oó]culos|sunglasses|eyewear/.test(t)) return "sunglasses";
  if (/capa.*celular|phone.*case|capinha/.test(t)) return "phone_case";
  if (/bolsa|purse|clutch|necessaire/.test(t)) return "branded_purse";
  if (/caneta|pen/.test(t)) return "pen_branded";
  if (/caderno|agenda|notebook|planner/.test(t)) return "notebook_planner";
  if (/chaveiro|keychain/.test(t)) return "keychain";
  if (/guarda.*chuva|umbrella|sombrinha/.test(t)) return "umbrella";
  if (/squeeze|garrafa.*t[eé]rmica|water.*bottle|t[eé]rmica/.test(t)) return "water_bottle";
  if (/mouse.*pad|desk.*mat/.test(t)) return "mouse_pad";
  if (/crach[aá]|cord[aã]o|lanyard|badge.*id/.test(t)) return "lanyard_badge";
  if (/\bpin\b|botton|broche/.test(t)) return "pin_button";
  if (/almofada|cushion|pillow/.test(t)) return "pillow_cushion";
  if (/toalha|towel/.test(t)) return "towel_branded";
  if (/skate|prancha|surfboard|skateboard/.test(t)) return "skateboard_deck";
  if (/pulseira|wristband/.test(t)) return "wristband";
  if (/uniforme|camiseta|avental|camisa|apron/.test(t)) return "uniform_tshirt";
  // ─── STATIONERY ───────────────────────────────────────────────────
  if (/vale.*presente|gift.*card/.test(t)) return "gift_card";
  if (/fidelidade|loyalty|vip.*card|member/.test(t)) return "loyalty_card";
  if (/adesivo|sticker/.test(t)) return "sticker_sheet";
  if (/selo|carimbo|wax.*seal|stamp/.test(t)) return "wax_seal_stamp";
  if (/nota.*fiscal|invoice|recibo|receipt|comanda/.test(t)) return "invoice_receipt";
  if (/envelope|papel.*timbrado|letterhead|correspond[eê]ncia/.test(t)) return "envelope_letterhead";
  // ─── PRINT / OOH ─────────────────────────────────────────────────
  if (/p[oô]ster|cartaz|poster/.test(t)) return "poster_print";
  if (/flyer|panfleto|folheto/.test(t)) return "flyer_leaflet";
  if (/folder|cat[aá]logo|brochure|tri.*fold/.test(t)) return "brochure_catalog";
  if (/abrigo.*[oô]nibus|bus.*shelter|metr[oô]|transit/.test(t)) return "bus_shelter_ad";
  if (/roll.*up|x.*banner|banner.*vertical|banner.*evento/.test(t)) return "banner_rollup";
  if (/outdoor|billboard|ooh/.test(t)) return "outdoor_billboard";
  // ─── DIGITAL ──────────────────────────────────────────────────────
  if (/podcast|capa.*podcast|podcast.*cover/.test(t)) return "podcast_cover";
  if (/[ií]cone.*app|app.*icon|favicon/.test(t)) return "app_icon";
  if (/landing.*page|p[aá]gina.*destino/.test(t)) return "landing_page";
  // ─── SOCIAL & CLASSIC ────────────────────────────────────────────
  if (/card|cartão|visita/.test(t)) return "business_card";
  if (/story|stories|reels/.test(t)) return "instagram_story";
  if (/instagram|social|post|feed/.test(t)) return "social_post_square";
  if (/email|newsletter/.test(t)) return "email_header";
  if (/menu|cardápio|folder|brochure/.test(t)) return "brand_collateral";
  if (/\bapp\b|mobile|interface|tela|screen|dashboard/.test(t)) return "app_mockup";
  if (/banner|hero|site|web|landing|header|cover|capa/.test(t)) return "hero_visual";
  if (/apresentação|slide|presentation/.test(t)) return "presentation_bg";

  // ─── FALLBACK: search in full text (description + instruction) ───
  if (/fachada|storefront/.test(all)) return "storefront_facade";
  if (/food.*truck/.test(all)) return "food_truck";
  if (/caminh[aã]o|van|ve[ií]culo|vehicle/.test(all)) return "vehicle_wrap";
  if (/garrafa|bottle/.test(all)) return "beverage_bottle";
  if (/\blata\b|beverage.*can/.test(all)) return "beverage_can";
  if (/copo|cup|sleeve/.test(all)) return "cup_sleeve";
  if (/outdoor|billboard/.test(all)) return "outdoor_billboard";
  if (/p[oô]ster|poster|cartaz/.test(all)) return "poster_print";

  return "brand_collateral";
}

/**
 * Enrich application prompts with material/scene knowledge derived
 * from the dedicated catalog prompts, so generic applications benefit
 * from the same production quality as catalog assets.
 */
function applicationSpecificKnowledge(key: string, data: BrandbookData, provider: ImageProvider): string {
  const ctx = extractBrandContext(data);
  const directives: string[] = [];

  // Material and scene specifics derived from the dedicated prompts
  if (key === "business_card" || key.includes("card")) {
    directives.push("MATERIAL: 350-400gsm premium cardstock. FINISH: consider letterpress, foil stamp, emboss, or soft-touch matte.");
    directives.push("CAMERA: Macro lens, shallow DOF, 35mm on full-frame. Show front and subtle back peek.");
  } else if (key === "delivery_packaging" || key === "takeaway_bag" || key === "food_container") {
    directives.push(`MATERIAL: Kraft paper, food-grade cardboard, or premium coated stock in brand colors. COMPOSITION: Show the complete kit — multiple pieces together creating a branded system.`);
    directives.push("SCENE: Warm studio with directional light, wooden surface or marble countertop.");
  } else if (key === "uniform_tshirt" || key === "uniform_apron" || key === "polo_uniform") {
    directives.push("MATERIAL: High-quality fabric with visible texture. Logo applied via embroidery or screen print — NOT digital overlay.");
    directives.push("SCENE: Real person wearing the garment in a workplace context. Natural posture, not stiff.");
  } else if (key === "storefront_facade" || key === "window_display" || key === "neon_sign") {
    directives.push("SCENE: Blue hour or golden hour urban setting. Real street context with environmental depth.");
    directives.push("ARCHITECTURE: Materials appropriate to brand personality — glass, wood, steel, exposed brick, painted surfaces.");
  } else if (key === "outdoor_billboard" || key === "bus_shelter_ad" || key === "banner_rollup") {
    directives.push("SCENE: Real urban context at street level. The piece must be readable and impactful at 3 seconds viewing distance.");
    directives.push("COMPOSITION: Bold headline zone, clear brand identification, minimal detail that degrades at distance.");
  } else if (key === "beverage_bottle" || key === "beverage_can" || key === "cup_sleeve") {
    directives.push("MATERIAL: Premium packaging material with visible label detail. Condensation or temperature cues add realism.");
    directives.push("LIGHTING: Studio product photography with rim light separating the product from background.");
  } else if (key === "product_box" || key === "gift_box" || key === "shopping_bag") {
    directives.push("SCENE: Premium unboxing moment or flat-lay arrangement. Show finishing details (foil, emboss, ribbon, tissue).");
    directives.push("MATERIAL: Structural packaging with haptic quality — visible paper grain, clean die-cut edges.");
  }

  if (directives.length === 0) return "";
  return `PRODUCTION KNOWLEDGE (apply to ensure premium quality): ${directives.join(" ")}`;
}

/**
 * Build scene/photography guidance based on detected type — used as
 * STYLE hints, NOT as subject override. The user's description always
 * determines WHAT is shown; this determines HOW it's photographed.
 */
function applicationSceneGuidance(key: AssetKey): string {
  const scenes: Partial<Record<AssetKey, string>> = {
    storefront_facade: "Architectural exterior photography. Eye-level street perspective, golden/blue hour, slight pedestrian blur.",
    window_display: "Through-glass perspective, theatrical spot lighting, evening glow vs cool exterior.",
    neon_sign: "Moody neon photography, dark wall mount, colored glow on surrounding surfaces.",
    menu_board: "In-situ wall mount, warm ambient light, shallow DOF, textured wall backdrop.",
    trade_show_booth: "Convention hall wide shot, modular booth system, spot lights and LED accents.",
    digital_signage: "Totem/kiosk in modern interior, screen glow illuminating space, ambient light.",
    food_truck: "Outdoor event/park, golden hour, string lights, steam wisps, queue blur.",
    vehicle_wrap: "Urban street, daylight, 3/4 angle showing side + front, vibrant paint reflection.",
    beverage_bottle: "Studio hero shot, rim light, condensation droplets, dark gradient background.",
    beverage_can: "Studio hero, metallic sheen rim light, condensation, dark background with color glow.",
    cup_sleeve: "In-hand or café counter, warm natural light, steam, lifestyle editorial.",
    food_label: "Macro on styled surface, directional studio light, label texture detail visible.",
    food_container: "Close-up product shot, clean surface, shallow DOF, premium packaging feel.",
    bowl_pot: "Studio hero shot, clean styled surface, one closed + one open, premium packaging photography.",
    tray_liner: "Overhead editorial, partially styled with props, paper texture visible.",
    wrapper_sleeve: "Product partially wrapped showing design, studio or lifestyle setting.",
    coaster: "Macro on bar/table, next to glass, warm ambient, material texture visible.",
    menu_printed: "Open on table, restaurant context, warm light, editorial style.",
    price_tag_shelf: "Macro on retail shelf edge, product blurred behind, realistic POS.",
    tent_card: "On dining/retail table, warm ambient, tent card as focal point.",
    standee_display: "In-store/entrance, realistic perspective, blurred people for scale.",
    jacket_coat: "On person (face cropped) urban context, or premium hanger. Editorial lighting.",
    vest_colete: "On person torso (face cropped) work context, or flat-lay. Professional.",
    suit_formal: "Detail shots — lapel, lining, cuff. Premium tailoring, fashion editorial.",
    sneakers_shoes: "3/4 angle hero shot, dramatic rim lighting, clean surface.",
    sunglasses: "Studio shot on reflective surface, or with case. Lens reflection, dramatic light.",
    phone_case: "Case on phone at angle, studio lighting, material texture visible.",
    branded_purse: "Styled on surface or over shoulder (face cropped). Fashion editorial.",
    pen_branded: "Macro on notebook/desk, shallow DOF, metal reflection visible.",
    notebook_planner: "Desk flat-lay or 3/4, partially open showing endpapers. Premium paper.",
    keychain: "Macro on textured surface, shallow DOF, material detail.",
    umbrella: "Open from above showing pattern, or in-hand rain setting (face cropped).",
    water_bottle: "Studio hero or gym/office lifestyle, condensation, premium finish.",
    mouse_pad: "On styled desk with keyboard, overhead or 3/4. Modern workspace.",
    lanyard_badge: "Flat-lay or hanging, clean background, badge detail visible.",
    pin_button: "Macro on fabric or collection display, shallow DOF.",
    pillow_cushion: "On couch/chair in styled interior, warm ambient light.",
    towel_branded: "Folded on surface, draped, or beach context. Cotton texture visible.",
    skateboard_deck: "Leaning on wall or mounted, art side hero, urban/studio.",
    chair_furniture: "In-situ restaurant/café interior, warm ambient, architectural context.",
    fridge_wrap: "In-store/bar context, fridge slightly open, interior glow, realistic PDV.",
    flag_banner_fabric: "Outdoor, flag rippling in wind, blue sky, dynamic energy.",
    doormat: "At entrance, door frame visible, welcoming perspective.",
    wall_clock: "Mounted on textured wall, interior context, warm ambient.",
    grease_proof_paper: "Wrapping food or lining basket/tray, food photography, warm light.",
    napkin_holder: "On table/counter with branded napkins, contextual, warm ambient.",
    cup_mug: "Lifestyle desk/café context, steam wisps, warm natural light.",
    pizza_box: "Stack or single half-open, counter/table context, warm light.",
    candy_wrapper: "Macro, artfully arranged, foil texture visible.",
    packaging_tape: "Sealing branded box or unrolling, close-up print quality.",
    matchbox: "Macro on bar counter, candle context, warm ambient.",
    weekly_agenda_post: "Square 1:1 clean grid layout, organized, social-native design.",
    credit_debit_card: "Slight angle on dark surface, metallic edge reflection, dramatic lighting.",
    ticket_event: "Flat on surface or in-hand, editorial, premium paper stock.",
    wristband: "On wrist (hand visible) or flat collection, event atmosphere.",
    product_box: "Styled surface, partially open for unboxing hint, spot UV/foil detail visible.",
    shopping_bag: "In-hand walking (face cropped) or shop counter, natural daylight.",
    gift_box: "Flat-lay or 3/4 premium surface, partially open, ribbon/seal detail.",
    hang_tag: "Macro on product/fabric, shallow DOF, paper fiber texture visible.",
    napkin_placemat: "Overhead table setting, warm 45° light, fabric/paper texture emphasis.",
    delivery_packaging: "Flat-lay or 3/4, editorial surface, cohesive kit arrangement.",
    polo_uniform: "On-person torso (face cropped) or precision flat-lay, fabric texture.",
    cap_hat: "3/4 angle floating or minimal stand, embroidery detail, studio light.",
    tote_bag: "Over-shoulder urban (face cropped) or flat-lay with lifestyle props.",
    hoodie: "On-person (face cropped at chin) urban/lifestyle, moody editorial light.",
    uniform_tshirt: "On person face out of frame or flat-lay, editorial lighting.",
    uniform_apron: "Kitchen/work context, face out of frame, warm natural light.",
    gift_card: "Styled premium surface, card angled, envelope partially open.",
    loyalty_card: "Premium surface alongside product/coffee, slight angle, foil detail.",
    sticker_sheet: "Flat-lay, slightly scattered with overlap, soft overhead light.",
    wax_seal_stamp: "Macro shot on paper, brass reflection, warm directional light.",
    invoice_receipt: "Clipboard/desk flat-lay, clean professional, paper texture.",
    envelope_letterhead: "Styled flat-lay, partially open envelope, patterned lining peek.",
    poster_print: "Full-bleed vertical hero, gallery-quality print feel.",
    flyer_leaflet: "A5/DL format, bold top half, clean info zone bottom.",
    brochure_catalog: "Open on premium surface, cover + inside spread visible.",
    bus_shelter_ad: "Backlit glass panel, evening urban, wet pavement reflections.",
    banner_rollup: "Modern lobby/event space, clean floor, ambient light.",
    outdoor_billboard: "Urban street, blue hour, bright illuminated billboard vs dim atmosphere.",
    landing_page: "Browser/device frame, modern desk, conversion-oriented layout.",
    podcast_cover: "Bold square graphic, minimal, reads at thumbnail and full size.",
    app_icon: "Rounded square, simplified symbol, flat/minimal gradient, pixel-perfect.",
    hero_visual: "Cinematic 16:9, three-point lighting, foreground-to-background depth.",
    business_card: "3/4 angle on premium surface, marble/stone, sharp shadow.",
    brand_collateral: "Overhead flat-lay, artfully arranged stationery, soft window light.",
    instagram_carousel: "Square 1:1, bold asymmetric composition, thumb-stopping.",
    instagram_story: "Full-bleed vertical 9:16, bold upper visual, safe zones.",
    social_cover: "Wide 16:9, profile-safe left zone, bold right graphic.",
    social_post_square: "Square 1:1, one dominant focal element, brand-strict.",
    youtube_thumbnail: "16:9 high-drama, bold background, subject 55% left.",
    presentation_bg: "Subtle micro-geometry, center 60% clear for content.",
    email_header: "Ultra-wide 21:9 thin strip, left motif, right clear zone.",
    app_mockup: "Device in 3/4 tilt, minimal desk, ambient bokeh.",
    materials_board: "Top-down moodboard, curated swatches, precise grid.",
  };
  return scenes[key] ?? "Professional product/editorial photography. Premium quality.";
}

export function buildApplicationPrompt(
  app: {
    type: string;
    description: string;
    dimensions?: string;
    materialSpecs?: string;
    layoutGuidelines?: string;
    typographyHierarchy?: string;
    artDirection?: string;
    substrates?: string[];
  },
  data: BrandbookData,
  provider: ImageProvider,
  aspectRatio: AspectRatioOption = "1:1",
  customInstruction?: string
): string {
  const ctx = extractBrandContext(data);
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const B = `"${data.brandName}"`;

  const detectedKey = detectApplicationAssetKey(app.type, app.description, customInstruction);

  const q = providerQuality(provider, detectedKey, archetypeName);
  const generativeIntent = buildImageGenerationIntentSummary({
    brandbook: data,
    assetKey: detectedKey,
    application: app,
    aspectRatio,
  });
  const prefix = providerPrefix(provider, detectedKey) + consistencyPrefix(ctx, data, detectedKey) + " " + generativeIntent + " ";
  const sTags = provider === "stability" ? stabilityTags(ctx, detectedKey) : "";

  const parts = (...lines: (string | false | undefined | null)[]): string =>
    lines.filter(Boolean).join(" ");

  const soul = soulAnchor(ctx);
  const journey = emotionalJourney(detectedKey, ctx);
  const sensory = sensoryDirectives(detectedKey, ctx);
  const tree = styleAnchorTree(ctx, data);
  const idAssets = identityAssetsDirective(ctx, detectedKey);
  const humanLayer = humanEssenceLayer(detectedKey, ctx, data);

  // ═══════════════════════════════════════════════════════════════════
  // USER INTENT IS KING — customInstruction and app details come FIRST
  // The model prioritizes early tokens, so user-specified subject and
  // creative direction MUST appear before generic brand context.
  // ═══════════════════════════════════════════════════════════════════

  const hasCustomDirection = !!(customInstruction?.trim());
  const hasUserDescription = app.description !== "Descreva esta aplicação da marca" && app.description.trim().length > 5;

  // Build the SUBJECT block — what the user actually wants to see
  const subjectBlock = parts(
    // User's custom instruction is the #1 priority — it overrides everything
    hasCustomDirection
      ? `PRIORITY CREATIVE DIRECTION (follow this above all other instructions): ${customInstruction}.`
      : null,
    // User's app type defines the object
    `SUBJECT: ${app.type} for brand ${B} (${data.industry}).`,
    // User's description adds detail
    hasUserDescription
      ? `DETAILED BRIEF: ${app.description}.`
      : null,
    // Warn the model not to substitute the subject
    hasCustomDirection || hasUserDescription
      ? `CRITICAL: Generate EXACTLY what is described above. Do NOT substitute the subject for a different product, object, or food item. The subject must match the user's description precisely.`
      : null,
  );

  // Scene guidance from detection — HOW to photograph, not WHAT to show
  const sceneHints = applicationSceneGuidance(detectedKey);

  // Enrich with specific prompt knowledge when detected key matches a catalog asset
  const specificKnowledge = detectedKey !== "brand_collateral" // brand_collateral is the generic fallback
    ? applicationSpecificKnowledge(detectedKey, data, provider)
    : "";

  return parts(
    prefix,

    // ── 1. USER INTENT (highest priority — early in prompt) ────────
    subjectBlock,

    // ── 2. FORMAT & MATERIALS ─────────────────────────────────────
    app.dimensions ? `DIMENSIONS/FORMAT: ${app.dimensions}. Aspect ratio: ${aspectRatio}.` : `ASPECT RATIO: ${aspectRatio}.`,
    app.materialSpecs && `MATERIAL & FINISH (render with haptic realism): ${app.materialSpecs}.`,
    app.layoutGuidelines && `LAYOUT RULES: ${app.layoutGuidelines}.`,
    app.typographyHierarchy && `TYPOGRAPHY HIERARCHY: ${app.typographyHierarchy}.`,
    app.artDirection && `ART DIRECTION: ${app.artDirection}.`,
    (app.substrates && app.substrates.length > 0) ? `SUBSTRATES & MATERIALS: ${app.substrates.join(", ")}.` : null,

    // ── 3. SCENE & PHOTOGRAPHY STYLE (from detection) ─────────────
    `PHOTOGRAPHY STYLE: ${sceneHints}`,
    specificKnowledge,
    soul, journey,

    // ── 4. BRAND SYSTEM (consistent identity) ─────────────────────
    `BRAND DNA: personality=${ctx.personality}. Values=${ctx.values}. Tone=${ctx.toneOfVoice}.`,
    `COLOR PALETTE (strict — use ONLY these colors): ${ctx.allColors}.`,
    `LOGO: ${ctx.logoPrimary}. Symbol: ${ctx.logoSymbol}.`,
    `TYPOGRAPHY: ${ctx.displayFont} for headlines, ${ctx.bodyFont} for body.`,
    tree, idAssets, sensory,
    `VISUAL STYLE: ${ctx.visualStyle}. Photography: ${ctx.photoStyle}.`,
    `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
    `COMPOSITION: ${ctx.composition}. Mood: ${ctx.moodWords}.`,
    ctx.tagline,
    ctx.competitiveAngle,
    humanLayer,

    // ── 5. QUALITY & NEGATIVES ────────────────────────────────────
    sTags, q,
    neg(ctx, provider, "wrong product, wrong food item, subject mismatch, generic stock"),
  );
}
