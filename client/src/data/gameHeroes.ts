import { GameHero } from "@/types/heroes";

export const gameHeroes: GameHero[] = [
  {
    id: "aqua_wtr",
    name: "AQUA ($WTR)",
    symbol: "WTR",
    title: "💧 The Water Guardian",
    subtitle: "Powered by GXCOIN Anchor",
    description: "Purifying oceans and springs while creating hemp bottles to eliminate plastic waste. Masters the transformation of ocean pollution into sustainable materials, earning rewards while healing marine ecosystems worldwide.",
    poweredBy: "GXCOIN",
    requireAnchor: true,
    element: "Water",
    rarity: "Epic",
    color: "#1e90ff",
    gradient: "from-blue-400 via-cyan-500 to-teal-400",
    stats: {
      power: 90,
      health: 85,
      speed: 95
    },
    abilities: [
      {
        name: "Ocean Purification Wave",
        description: "Collects and purifies ocean plastic, converting it into sustainable hemp bottles earning $1.25 per bottle",
        cooldown: 2,
        damage: 70,
        effect: "plastic_conversion"
      },
      {
        name: "Marine Ecosystem Restoration",
        description: "Restores marine life while generating sustainable hemp materials worth $50+ per cycle",
        cooldown: 4,
        effect: "ecosystem_restoration"
      },
      {
        name: "Spring Water Liberation",
        description: "Massive ocean cleanup converting 1000+ plastic bottles to hemp, generating $1,250+ immediate value",
        cooldown: 6,
        damage: 100,
        effect: "mass_conversion"
      }
    ],
    owned: true,
    level: 6,
    experience: 1200,
    maxExperience: 1600,
    avatar: "💧",
    battleSprite: "🌊"
  },
  {
    id: "hemp_builder",
    name: "HEMP ($HEMP)",
    symbol: "HEMP",
    title: "🌿 The Green Builder",
    subtitle: "Powered by GXCOIN Anchor",
    description: "Weaving sustainable hemp into wellness, textiles, and industries. Master architect transforming global construction with carbon-negative hemp materials that sequester CO2 while building stronger, cheaper structures.",
    poweredBy: "GXCOIN",
    requireAnchor: true,
    element: "Construction",
    rarity: "Rare",
    color: "#228b22",
    gradient: "from-green-600 via-lime-500 to-emerald-500",
    stats: {
      power: 80,
      health: 95,
      speed: 65
    },
    abilities: [
      {
        name: "Hemp Textile Revolution",
        description: "Transforms textiles and wellness industries with sustainable hemp materials worth $30+ per m²",
        cooldown: 3,
        damage: 70,
        effect: "hemp_construction"
      },
      {
        name: "Industrial Hemp Integration",
        description: "Replaces toxic industrial materials with hemp alternatives, reducing costs by 40% while improving performance",
        cooldown: 4,
        effect: "material_revolution"
      },
      {
        name: "Green Infrastructure Genesis",
        description: "Constructs entire sustainable communities with hemp materials, generating $10,000+ in carbon credits",
        cooldown: 7,
        damage: 95,
        effect: "city_transformation"
      }
    ],
    owned: true,
    level: 4,
    experience: 600,
    maxExperience: 1000,
    avatar: "🌿",
    battleSprite: "🏗️"
  },
  {
    id: "voltra_gpwr",
    name: "VOLTRA ($GPWR)",
    symbol: "GPWR",
    title: "⚡ The Energy Warrior",
    subtitle: "Powered by GXCOIN Anchor",
    description: "Unleashing wireless green power across the globe. Revolutionary energy freedom fighter deploying wireless power grids that liberate communities from centralized energy monopolies while generating clean energy profits.",
    poweredBy: "GXCOIN",
    requireAnchor: true,
    element: "Energy",
    rarity: "Epic",
    color: "#ffff00",
    gradient: "from-yellow-400 via-orange-400 to-red-500",
    stats: {
      power: 100,
      health: 75,
      speed: 90
    },
    abilities: [
      {
        name: "Wireless Power Liberation",
        description: "Deploys wireless power networks globally, generating $100+ monthly recurring energy profits",
        cooldown: 2,
        damage: 75,
        effect: "wireless_power"
      },
      {
        name: "Energy Grid Revolution",
        description: "Breaks energy monopolies while creating decentralized power generation worth $75+ per household",
        cooldown: 4,
        effect: "energy_democracy"
      },
      {
        name: "Global Power Awakening",
        description: "Mass deployment of wireless grids liberating entire nations and generating $2000+ collective value",
        cooldown: 6,
        damage: 110,
        effect: "grid_revolution"
      }
    ],
    owned: false,
    level: 1,
    experience: 0,
    maxExperience: 300,
    avatar: "⚡",
    battleSprite: "🔋"
  },
  {
    id: "graphene_batt",
    name: "GRAPHENE ($BATT)",
    symbol: "BATT",
    title: "🔋 The Tech Titan",
    subtitle: "Powered by GXCOIN Anchor",
    description: "Harnessing hemp and seaweed for revolutionary graphene batteries. Advanced biotech warrior converting ocean sargassum and hemp waste into premium graphene oxide, creating next-generation battery technology.",
    poweredBy: "GXCOIN",
    requireAnchor: true,
    element: "BioChar",
    rarity: "Legendary",
    color: "#8b4513",
    gradient: "from-amber-600 via-orange-700 to-green-600",
    stats: {
      power: 95,
      health: 100,
      speed: 75
    },
    abilities: [
      {
        name: "Seaweed-Hemp Fusion",
        description: "Converts ocean sargassum and hemp waste into premium graphene, earning $200+ per kg processed",
        cooldown: 3,
        damage: 85,
        effect: "graphene_production"
      },
      {
        name: "Battery Revolution Protocol",
        description: "Creates revolutionary graphene batteries with 10x capacity, worth $500+ per unit produced",
        cooldown: 5,
        effect: "biochar_generation"
      },
      {
        name: "Tech Titan Transformation",
        description: "Massive graphene production generating $1000+ in next-gen battery technology and carbon credits",
        cooldown: 7,
        damage: 120,
        effect: "carbon_credits"
      }
    ],
    owned: true,
    level: 8,
    experience: 1800,
    maxExperience: 2200,
    avatar: "🔋",
    battleSprite: "⚡"
  },
  {
    id: "trader_gcct",
    name: "CARBON ($GCCT)",
    symbol: "GCCT",
    title: "📈 The Carbon Trader",
    subtitle: "Powered by GXCOIN Anchor",
    description: "Revolutionary market coordinator orchestrating carbon credit trading and democratizing access to green technologies. Masters the decentralized trading of verified carbon credits while ensuring fair market access for all producers.",
    poweredBy: "GXCOIN",
    requireAnchor: true,
    element: "Carbon",
    rarity: "Legendary",
    color: "#2d5a27",
    gradient: "from-green-800 via-emerald-700 to-lime-600",
    stats: {
      power: 85,
      health: 110,
      speed: 70
    },
    abilities: [
      {
        name: "Commodities Exchange Mastery",
        description: "Powers decentralized trading of carbon credits, generating guaranteed $175+ insurance-backed value",
        cooldown: 3,
        damage: 80,
        effect: "insured_credits"
      },
      {
        name: "Market Democratization Protocol",
        description: "Democratizes carbon markets, allowing small producers to access premium pricing and fair distribution",
        cooldown: 5,
        effect: "market_access"
      },
      {
        name: "Global Trading Revolution",
        description: "Activates massive decentralized commodities exchange generating $1500+ in coordinated market value",
        cooldown: 8,
        damage: 150,
        effect: "carbon_vault"
      }
    ],
    owned: false,
    level: 1,
    experience: 0,
    maxExperience: 400,
    avatar: "📈",
    battleSprite: "💰"
  },
  {
    id: "gxcoin_anchor",
    name: "GXCOIN Anchor",
    symbol: "GXCOIN",
    title: "👑 The Supreme Anchor",
    subtitle: "Powers All ReFi Heroes",
    description: "The supreme anchor dNFT powering GXCOIN's entire ReFi League ecosystem. Central orchestrator unlocking and amplifying all 5 patent-backed Eco-Warrior Superheroes, democratizing access to breakthrough environmental technologies with real economic returns.",
    isAnchor: true,
    powersHeroes: ["WTR", "HEMP", "GPWR", "BATT", "GCCT"],
    element: "Universal",
    rarity: "Mythic",
    color: "#ffd700",
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
    stats: {
      power: 100,
      health: 120,
      speed: 80
    },
    abilities: [
      {
        name: "Ecosystem Amplification",
        description: "Amplifies all hero abilities by 20%, unlocking maximum potential across the entire ReFi League",
        cooldown: 2,
        damage: 0,
        effect: "hero_amplification"
      },
      {
        name: "Patent Portfolio Activation",
        description: "Activates access to all breakthrough patents, generating $200+ monthly recurring value per hero",
        cooldown: 4,
        effect: "patent_access"
      },
      {
        name: "Global ReFi Coordination",
        description: "Coordinates massive ecosystem activation generating $2500+ collective value across all heroes",
        cooldown: 10,
        damage: 200,
        effect: "ecosystem_revolution"
      }
    ],
    owned: true,
    level: 10,
    experience: 2500,
    maxExperience: 3000,
    avatar: "👑",
    battleSprite: "✨"
  }
];