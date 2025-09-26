import { GameHero } from "@/types/heroes";

export const gameHeroes: GameHero[] = [
  {
    id: "gxcoin",
    name: "GXCOIN",
    title: "🌍 ReFi Commander & Anchor dNFT",
    description: "Industry-first dNFT commander orchestrating the global regenerative finance revolution. Unlocks universal access to all eco-patents and coordinates planetary restoration through decentralized governance.",
    element: "Universal",
    rarity: "Legendary",
    color: "#00ff9f",
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    stats: {
      power: 100,
      health: 120,
      speed: 85
    },
    abilities: [
      {
        name: "Patent Liberation Protocol",
        description: "Democratizes access to all eco-patents, generating $500+ value per activation through technology licensing",
        cooldown: 2,
        damage: 0,
        effect: "patent_access"
      },
      {
        name: "ReFi Network Activation",
        description: "Coordinates global regenerative finance networks, multiplying all eco-rewards by 3x",
        cooldown: 4,
        effect: "reward_multiplier"
      },
      {
        name: "Planetary Restoration Command",
        description: "Ultimate eco-warrior ability: Triggers massive environmental restoration with $1000+ economic returns",
        cooldown: 8,
        damage: 200,
        effect: "planetary_heal"
      }
    ],
    owned: true,
    level: 10,
    experience: 2500,
    maxExperience: 3000,
    avatar: "🌍",
    battleSprite: "💎"
  },
  {
    id: "biochar_batt",
    name: "Bio-Char $BATT Reaper",
    title: "⚡ Hemp/Sargassum Graphene Master",
    description: "Revolutionary biochar warrior powered by Patents #1-4. Converts ocean sargassum and hemp waste into premium graphene oxide, generating $175+ carbon credits while healing marine ecosystems.",
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
        name: "Sargassum Storm Strike",
        description: "Patent #1-2: Converts ocean waste into premium biochar, earning $50+ per ton processed",
        cooldown: 3,
        damage: 85,
        effect: "biochar_generation"
      },
      {
        name: "Hemp Graphene Forge",
        description: "Patent #3-4: Transforms hemp waste into graphene oxide batteries worth $200+ per kg",
        cooldown: 5,
        effect: "graphene_production"
      },
      {
        name: "Carbon Credit Tsunami",
        description: "Massive biochar production generating $175+ insured carbon credits with global impact",
        cooldown: 7,
        damage: 120,
        effect: "carbon_credits"
      }
    ],
    owned: true,
    level: 8,
    experience: 1800,
    maxExperience: 2200,
    avatar: "⚡",
    battleSprite: "🌱"
  },
  {
    id: "aqua_ixchel",
    name: "AQUA IXCHEL $WTR",
    title: "💧 Ocean Plastic Liberation Goddess",
    description: "Mayan-inspired water warrior powered by Patents #5-8. Converts ocean plastic into hemp bottles, earning $1.25 per bottle while restoring marine life. Industry-first plastic-to-hemp transformation technology.",
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
        name: "Plastic Purification Wave",
        description: "Patent #5-6: Collects ocean plastic and converts to hemp bottles, earning $1.25 per bottle processed",
        cooldown: 2,
        damage: 70,
        effect: "plastic_conversion"
      },
      {
        name: "Marine Ecosystem Heal",
        description: "Patent #7-8: Restores ocean life while generating sustainable hemp materials worth $50+ per cycle",
        cooldown: 4,
        effect: "ecosystem_restoration"
      },
      {
        name: "Tsunami of Transformation",
        description: "Mass ocean cleanup converting 1000+ plastic bottles to hemp, generating $1,250+ immediate value",
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
    id: "gcct_titan",
    name: "$GCCT Carbon Credit Titan",
    title: "🏆 Premium Biochar Insurance Lord",
    description: "Industry-first insured carbon credit warrior powered by Patents #9-12. Generates premium biochar with guaranteed $175+ value backed by insurance protocols. Revolutionary carbon market democratization.",
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
        name: "Insured Biochar Genesis",
        description: "Patent #9-10: Creates premium biochar with guaranteed $175+ insurance-backed value",
        cooldown: 3,
        damage: 80,
        effect: "insured_credits"
      },
      {
        name: "Carbon Market Revolution",
        description: "Patent #11-12: Democratizes carbon markets, allowing small producers to access premium pricing",
        cooldown: 5,
        effect: "market_access"
      },
      {
        name: "Planetary Carbon Vault",
        description: "Massive carbon sequestration generating $500+ insured credits while healing atmospheric damage",
        cooldown: 8,
        damage: 150,
        effect: "carbon_vault"
      }
    ],
    owned: false,
    level: 1,
    experience: 0,
    maxExperience: 400,
    avatar: "🏆",
    battleSprite: "🌿"
  },
  {
    id: "gpwr_warriors",
    name: "$GPWR Clean Energy Warriors",
    title: "⚡ Wireless Power Grid Liberators",
    description: "Revolutionary energy freedom fighters powered by Patents #13-17+. Deploy wireless power grids that liberate communities from centralized energy monopolies while generating clean energy profits.",
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
        name: "Wireless Grid Liberation",
        description: "Patent #13-15: Deploys wireless power networks, generating $100+ monthly recurring energy profits",
        cooldown: 2,
        damage: 75,
        effect: "wireless_power"
      },
      {
        name: "Energy Freedom Strike",
        description: "Patent #16-17: Breaks energy monopolies while creating decentralized power generation worth $75+ per household",
        cooldown: 4,
        effect: "energy_democracy"
      },
      {
        name: "Clean Energy Revolution",
        description: "Mass deployment of wireless grids liberating entire communities and generating $1000+ collective value",
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
    id: "hemp_builder",
    name: "$HEMP Green Builder",
    title: "🏗️ Sustainable Construction Revolutionary",
    description: "Master architect of the hemp construction revolution. Transforms building industries with sustainable hemp materials that are stronger, cheaper, and carbon-negative. Every structure built sequesters carbon while generating profits.",
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
        name: "Hempcrete Foundation Forge",
        description: "Builds carbon-negative structures that sequester CO2 while providing superior insulation worth $30+ per m²",
        cooldown: 3,
        damage: 70,
        effect: "hemp_construction"
      },
      {
        name: "Sustainable Material Matrix",
        description: "Replaces toxic building materials with hemp alternatives, reducing costs by 40% while improving performance",
        cooldown: 4,
        effect: "material_revolution"
      },
      {
        name: "Green City Genesis",
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
    avatar: "🏗️",
    battleSprite: "🌿"
  },
  {
    id: "market_guardian",
    name: "Market Guardian",
    title: "💰 DeFi Economic Coordinator",
    description: "Supreme financial architect orchestrating the decentralized economy of environmental restoration. Coordinates all eco-token economies, ensures fair distribution of patent profits, and democratizes access to green technology investments.",
    element: "DeFi",
    rarity: "Legendary",
    color: "#ffd700",
    gradient: "from-yellow-300 via-amber-400 to-orange-500",
    stats: {
      power: 90,
      health: 85,
      speed: 100
    },
    abilities: [
      {
        name: "Token Economy Orchestration",
        description: "Coordinates $BATT, $WTR, $GCCT, $GPWR, and $HEMP tokens for maximum collective impact and profits",
        cooldown: 2,
        damage: 65,
        effect: "token_coordination"
      },
      {
        name: "Patent Profit Distribution",
        description: "Ensures fair distribution of patent licensing profits to all eco-warriors and community participants",
        cooldown: 5,
        effect: "profit_sharing"
      },
      {
        name: "Economic Revolution Protocol",
        description: "Triggers massive DeFi ecosystem activation generating $2000+ in coordinated eco-economy value",
        cooldown: 9,
        damage: 130,
        effect: "economic_revolution"
      }
    ],
    owned: false,
    level: 1,
    experience: 0,
    maxExperience: 500,
    avatar: "💰",
    battleSprite: "📈"
  }
];