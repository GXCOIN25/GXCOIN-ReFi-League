import { GameHero } from "@/types/heroes";

export const gameHeroes: GameHero[] = [
  {
    id: "blazefury",
    name: "BlazeFury",
    title: "The Inferno Warrior",
    description: "A fierce warrior who commands the power of eternal flames, capable of devastating area attacks and flame barriers.",
    element: "Fire",
    rarity: "Legendary",
    color: "#ff4444",
    gradient: "from-red-500 via-orange-500 to-yellow-500",
    stats: {
      power: 95,
      health: 85,
      speed: 75
    },
    abilities: [
      {
        name: "Inferno Strike",
        description: "Unleashes a massive fireball that deals high damage",
        cooldown: 3,
        damage: 80,
        effect: "burn"
      },
      {
        name: "Flame Barrier",
        description: "Creates a protective shield that reflects damage",
        cooldown: 5,
        effect: "shield"
      },
      {
        name: "Phoenix Rising",
        description: "Resurrects with 50% health when defeated",
        cooldown: 10,
        effect: "revive"
      }
    ],
    owned: true,
    level: 5,
    experience: 750,
    maxExperience: 1000,
    avatar: "🔥",
    battleSprite: "🐉"
  },
  {
    id: "frostguard",
    name: "FrostGuard",
    title: "The Crystal Sentinel",
    description: "Master of ice and cold, capable of freezing enemies and creating defensive ice walls.",
    element: "Ice",
    rarity: "Epic",
    color: "#44ccff",
    gradient: "from-blue-400 via-cyan-400 to-teal-400",
    stats: {
      power: 70,
      health: 100,
      speed: 60
    },
    abilities: [
      {
        name: "Ice Shard",
        description: "Launches sharp ice projectiles",
        cooldown: 2,
        damage: 60,
        effect: "slow"
      },
      {
        name: "Frozen Fortress",
        description: "Creates an ice wall that blocks attacks",
        cooldown: 4,
        effect: "block"
      },
      {
        name: "Absolute Zero",
        description: "Freezes all enemies for 2 turns",
        cooldown: 8,
        effect: "freeze"
      }
    ],
    owned: true,
    level: 3,
    experience: 200,
    maxExperience: 600,
    avatar: "❄️",
    battleSprite: "🛡️"
  },
  {
    id: "voltking",
    name: "VoltKing",
    title: "The Lightning Master",
    description: "Harnesses the power of electricity, striking with lightning speed and chain attacks.",
    element: "Electric",
    rarity: "Epic",
    color: "#ffff44",
    gradient: "from-yellow-400 via-yellow-300 to-white",
    stats: {
      power: 85,
      health: 75,
      speed: 95
    },
    abilities: [
      {
        name: "Lightning Bolt",
        description: "Fast electric attack with chance to chain",
        cooldown: 1,
        damage: 70,
        effect: "chain"
      },
      {
        name: "Static Field",
        description: "Creates an electric field that damages over time",
        cooldown: 6,
        effect: "dot"
      },
      {
        name: "Thunder Storm",
        description: "Massive area lightning attack",
        cooldown: 7,
        damage: 100,
        effect: "area"
      }
    ],
    owned: false,
    level: 1,
    experience: 0,
    maxExperience: 200,
    avatar: "⚡",
    battleSprite: "👑"
  },
  {
    id: "shadowreaper",
    name: "ShadowReaper",
    title: "The Void Walker",
    description: "A mysterious being that manipulates darkness and shadows, striking from the void.",
    element: "Dark",
    rarity: "Legendary",
    color: "#8844ff",
    gradient: "from-purple-600 via-indigo-600 to-black",
    stats: {
      power: 90,
      health: 80,
      speed: 85
    },
    abilities: [
      {
        name: "Shadow Strike",
        description: "Teleports behind enemy for critical damage",
        cooldown: 3,
        damage: 85,
        effect: "critical"
      },
      {
        name: "Void Portal",
        description: "Dodges next attack and counters",
        cooldown: 5,
        effect: "counter"
      },
      {
        name: "Dark Harvest",
        description: "Drains enemy health to heal self",
        cooldown: 6,
        damage: 60,
        effect: "lifesteal"
      }
    ],
    owned: false,
    level: 1,
    experience: 0,
    maxExperience: 200,
    avatar: "🌑",
    battleSprite: "👻"
  },
  {
    id: "stonetitan",
    name: "StoneTitan",
    title: "The Mountain Lord",
    description: "A colossal being of rock and earth, providing incredible defense and ground-shaking attacks.",
    element: "Earth",
    rarity: "Rare",
    color: "#8b4513",
    gradient: "from-amber-600 via-orange-700 to-stone-800",
    stats: {
      power: 80,
      health: 110,
      speed: 45
    },
    abilities: [
      {
        name: "Boulder Smash",
        description: "Heavy rock attack that may stun",
        cooldown: 2,
        damage: 75,
        effect: "stun"
      },
      {
        name: "Stone Skin",
        description: "Reduces incoming damage by 50%",
        cooldown: 4,
        effect: "resist"
      },
      {
        name: "Earthquake",
        description: "Ground attack that hits all enemies",
        cooldown: 8,
        damage: 65,
        effect: "area"
      }
    ],
    owned: true,
    level: 2,
    experience: 150,
    maxExperience: 400,
    avatar: "🗿",
    battleSprite: "⛰️"
  },
  {
    id: "stormwing",
    name: "StormWing",
    title: "The Sky Dancer",
    description: "Master of wind and storm, providing incredible speed and aerial combat abilities.",
    element: "Air",
    rarity: "Rare",
    color: "#87ceeb",
    gradient: "from-sky-300 via-blue-300 to-indigo-300",
    stats: {
      power: 75,
      health: 70,
      speed: 100
    },
    abilities: [
      {
        name: "Wind Slash",
        description: "Quick air blade attack",
        cooldown: 1,
        damage: 55,
        effect: "quick"
      },
      {
        name: "Tornado Shield",
        description: "Creates a protective wind barrier",
        cooldown: 4,
        effect: "evasion"
      },
      {
        name: "Hurricane Force",
        description: "Massive wind attack that pushes enemies back",
        cooldown: 6,
        damage: 80,
        effect: "knockback"
      }
    ],
    owned: false,
    level: 1,
    experience: 0,
    maxExperience: 200,
    avatar: "🌪️",
    battleSprite: "🦅"
  },
  {
    id: "celestial",
    name: "Celestial",
    title: "The Star Weaver",
    description: "A cosmic being who commands the power of stars and celestial bodies, channeling cosmic energy and light magic.",
    element: "Light",
    rarity: "Legendary",
    color: "#ffd700",
    gradient: "from-yellow-200 via-amber-300 to-orange-400",
    stats: {
      power: 100,
      health: 90,
      speed: 80
    },
    abilities: [
      {
        name: "Starfall",
        description: "Calls down meteors from the heavens for massive damage",
        cooldown: 4,
        damage: 95,
        effect: "cosmic"
      },
      {
        name: "Healing Light",
        description: "Channels cosmic energy to restore health",
        cooldown: 5,
        effect: "heal"
      },
      {
        name: "Supernova",
        description: "Explosive cosmic attack that blinds and devastates all enemies",
        cooldown: 10,
        damage: 120,
        effect: "blind"
      }
    ],
    owned: false,
    level: 1,
    experience: 0,
    maxExperience: 200,
    avatar: "✨",
    battleSprite: "⭐"
  }
];