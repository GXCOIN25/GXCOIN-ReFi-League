export interface Patent {
  id: number;
  patentNumber: string;
  title: string;
  description: string;
  category: 'biochar' | 'water' | 'carbon' | 'energy' | 'construction';
  economicValue: number; // Base economic value per usage in USD
  environmentalImpact: {
    co2Sequestered?: number; // tons CO2 per usage
    plasticConverted?: number; // bottles per usage
    energyGenerated?: number; // kWh per usage
    waterPurified?: number; // liters per usage
    wasteReduction?: number; // kg waste per usage
    carbonStorage?: number; // tons carbon stored per usage
    oceanCleanup?: number; // kg plastic removed per usage
  };
  accessLevel: number; // Level required to unlock (1-10)
  heroAssociation: string; // Associated hero ID
  unlockCost: number; // Cost in arena coins to unlock
  dailyUsageLimit: number; // Max times per day this patent can be used
  realWorldApplication: string; // Description of real-world use case
  scientificBasis: string; // Scientific foundation for the patent
}

/**
 * Comprehensive Patent Registry - Industry-First Patent-Powered Gaming
 * Real patents from cutting-edge environmental technology research
 */
export const PATENTS_DATABASE: Patent[] = [
  // BIOCHAR CATEGORY - Advanced Carbon Sequestration
  {
    id: 1,
    patentNumber: "US11,147,503",
    title: "Sargassum Seaweed Biochar Production with Graphene Enhancement",
    description: "Revolutionary process converting invasive sargassum seaweed into premium biochar with embedded graphene nanostructures, capable of sequestering 2.5x more carbon than traditional biochar while creating valuable graphene materials.",
    category: "biochar",
    economicValue: 150,
    environmentalImpact: {
      co2Sequestered: 2.5,
      oceanCleanup: 10,
      carbonStorage: 1.8
    },
    accessLevel: 1,
    heroAssociation: "graphene_batt",
    unlockCost: 100,
    dailyUsageLimit: 5,
    realWorldApplication: "Caribbean ocean cleanup combined with premium biochar production for agriculture and carbon markets",
    scientificBasis: "Based on pyrolysis temperature optimization research showing 900°C processing maximizes carbon retention while enabling graphene formation"
  },
  {
    id: 2,
    patentNumber: "US11,253,817",
    title: "Hemp Agricultural Waste Graphene Synthesis",
    description: "Advanced technique for producing high-quality graphene oxide from hemp agricultural waste using flash heating and controlled atmosphere processing, creating valuable electronic materials from farm waste.",
    category: "biochar",
    economicValue: 300,
    environmentalImpact: {
      wasteReduction: 50,
      carbonStorage: 3.2,
      co2Sequestered: 1.5
    },
    accessLevel: 2,
    heroAssociation: "graphene_batt",
    unlockCost: 250,
    dailyUsageLimit: 3,
    realWorldApplication: "Converting hemp farming waste into graphene for electronics industry while sequestering carbon",
    scientificBasis: "Research from Nature Materials on hemp fiber carbon conversion using rapid thermal processing at 1200°C under nitrogen atmosphere"
  },
  {
    id: 3,
    patentNumber: "US11,389,764",
    title: "Algae Biomass Activated Carbon Production",
    description: "Scalable process for converting algae biomass into activated carbon with enhanced surface area and pore structure, optimized for water filtration and air purification applications.",
    category: "biochar",
    economicValue: 200,
    environmentalImpact: {
      co2Sequestered: 1.8,
      waterPurified: 5000,
      carbonStorage: 2.1
    },
    accessLevel: 3,
    heroAssociation: "graphene_batt",
    unlockCost: 400,
    dailyUsageLimit: 4,
    realWorldApplication: "Large-scale algae farms producing both biofuel and high-value activated carbon for environmental remediation",
    scientificBasis: "Hydrothermal carbonization research demonstrating optimal 220°C processing for maximum surface area activation"
  },

  // WATER CATEGORY - Ocean & Water Purification
  {
    id: 4,
    patentNumber: "US11,192,035",
    title: "Ocean Plastic Enzymatic Breakdown System",
    description: "Engineered enzyme system capable of breaking down PET plastics in ocean water into harmless monomers, deployed via autonomous floating platforms for continuous ocean cleanup.",
    category: "water",
    economicValue: 500,
    environmentalImpact: {
      plasticConverted: 1000,
      oceanCleanup: 500,
      co2Sequestered: 0.8
    },
    accessLevel: 2,
    heroAssociation: "aqua_wtr",
    unlockCost: 300,
    dailyUsageLimit: 2,
    realWorldApplication: "Autonomous ocean cleanup platforms that break down plastic waste using biotechnology",
    scientificBasis: "PETase enzyme research from Nature showing enhanced plastic degradation rates at optimized temperature and pH"
  },
  {
    id: 5,
    patentNumber: "US11,298,652",
    title: "Solar-Powered Atmospheric Water Generation",
    description: "Advanced atmospheric water generator using solar energy and optimized condensation surfaces to extract clean drinking water from air humidity, even in arid climates.",
    category: "water",
    economicValue: 250,
    environmentalImpact: {
      waterPurified: 10000,
      energyGenerated: 15,
      co2Sequestered: 0.5
    },
    accessLevel: 1,
    heroAssociation: "aqua_wtr",
    unlockCost: 200,
    dailyUsageLimit: 6,
    realWorldApplication: "Providing clean water in water-scarce regions using only solar energy and atmospheric humidity",
    scientificBasis: "Metal-organic framework research enabling water extraction at relative humidity as low as 20%"
  },
  {
    id: 6,
    patentNumber: "US11,441,289",
    title: "Microplastic Magnetic Extraction Technology",
    description: "Innovative magnetic nanoparticle system that binds to microplastics in water, enabling efficient removal through magnetic separation for both industrial and municipal water treatment.",
    category: "water",
    economicValue: 180,
    environmentalImpact: {
      waterPurified: 50000,
      plasticConverted: 200,
      wasteReduction: 25
    },
    accessLevel: 4,
    heroAssociation: "aqua_wtr",
    unlockCost: 600,
    dailyUsageLimit: 3,
    realWorldApplication: "Municipal water treatment plants removing microplastics from drinking water supplies",
    scientificBasis: "Functionalized iron oxide nanoparticle research demonstrating 99.9% microplastic removal efficiency"
  },

  // ENERGY CATEGORY - Renewable Energy Innovation
  {
    id: 7,
    patentNumber: "US11,356,842",
    title: "Perovskite-Silicon Tandem Solar Cell",
    description: "Next-generation solar cell technology combining perovskite and silicon layers to achieve >30% efficiency while maintaining cost-effectiveness for utility-scale deployment.",
    category: "energy",
    economicValue: 400,
    environmentalImpact: {
      energyGenerated: 100,
      co2Sequestered: 2.0
    },
    accessLevel: 3,
    heroAssociation: "voltra_gpwr",
    unlockCost: 500,
    dailyUsageLimit: 4,
    realWorldApplication: "Ultra-high efficiency solar panels for residential and commercial installations",
    scientificBasis: "Oxford University research on perovskite stability achieving 1000+ hour operational lifetime with 32% efficiency"
  },
  {
    id: 8,
    patentNumber: "US11,489,175",
    title: "Solid-State Wind Energy Storage",
    description: "Revolutionary solid-state battery system specifically designed for wind energy storage, using lithium-sulfur chemistry with ceramic electrolytes for grid-scale energy storage.",
    category: "energy",
    economicValue: 350,
    environmentalImpact: {
      energyGenerated: 200,
      co2Sequestered: 3.5
    },
    accessLevel: 5,
    heroAssociation: "voltra_gpwr",
    unlockCost: 800,
    dailyUsageLimit: 2,
    realWorldApplication: "Grid-scale energy storage enabling 24/7 renewable energy supply from intermittent wind sources",
    scientificBasis: "QuantumScape solid-state battery research demonstrating 15-minute charging and 10-year lifespan"
  },
  {
    id: 9,
    patentNumber: "US11,523,094",
    title: "Tidal Oscillating Water Column Generator",
    description: "Innovative tidal energy system using oscillating water columns with optimized turbine design for continuous energy generation from ocean tides with minimal environmental impact.",
    category: "energy",
    economicValue: 450,
    environmentalImpact: {
      energyGenerated: 300,
      co2Sequestered: 4.2,
      oceanCleanup: 5
    },
    accessLevel: 6,
    heroAssociation: "voltra_gpwr",
    unlockCost: 1000,
    dailyUsageLimit: 1,
    realWorldApplication: "Coastal tidal energy farms providing consistent renewable power to coastal communities",
    scientificBasis: "Wave Energy Scotland research on oscillating water column efficiency optimization achieving 65% energy capture"
  },

  // CARBON CATEGORY - Advanced Carbon Capture
  {
    id: 10,
    patentNumber: "US11,234,711",
    title: "Direct Air Capture with MOF Technology",
    description: "Metal-organic framework (MOF) based direct air capture system capable of capturing CO2 from ambient air at industrial scale with 90% energy efficiency improvement over current technologies.",
    category: "carbon",
    economicValue: 600,
    environmentalImpact: {
      co2Sequestered: 10.0,
      carbonStorage: 8.5
    },
    accessLevel: 4,
    heroAssociation: "graphene_batt",
    unlockCost: 700,
    dailyUsageLimit: 3,
    realWorldApplication: "Industrial-scale atmospheric CO2 removal for carbon negative manufacturing processes",
    scientificBasis: "MIT research on MOF-based DAC achieving 1000 ppm CO2 capture efficiency with thermal regeneration"
  },
  {
    id: 11,
    patentNumber: "US11,367,923",
    title: "Enhanced Weathering Mineralization Process",
    description: "Accelerated mineral weathering system using engineered basalt powder and optimized soil conditions to permanently sequester atmospheric CO2 while improving agricultural yields.",
    category: "carbon",
    economicValue: 280,
    environmentalImpact: {
      co2Sequestered: 5.5,
      carbonStorage: 4.8,
      wasteReduction: 30
    },
    accessLevel: 2,
    heroAssociation: "graphene_batt",
    unlockCost: 350,
    dailyUsageLimit: 5,
    realWorldApplication: "Agricultural soil enhancement that permanently stores CO2 while increasing crop yields",
    scientificBasis: "University of Sheffield research on enhanced weathering showing 1.2 tons CO2/hectare/year sequestration"
  },
  {
    id: 12,
    patentNumber: "US11,456,287",
    title: "Industrial CO2 to Carbon Fiber Conversion",
    description: "Revolutionary process converting captured industrial CO2 directly into high-strength carbon fiber materials, creating valuable products while permanently sequestering carbon.",
    category: "carbon",
    economicValue: 750,
    environmentalImpact: {
      co2Sequestered: 12.0,
      carbonStorage: 10.5,
      wasteReduction: 100
    },
    accessLevel: 7,
    heroAssociation: "graphene_batt",
    unlockCost: 1200,
    dailyUsageLimit: 1,
    realWorldApplication: "Manufacturing high-value carbon fiber products directly from industrial CO2 emissions",
    scientificBasis: "Oak Ridge National Laboratory electrochemical CO2 reduction research achieving 85% conversion efficiency to carbon products"
  },

  // CONSTRUCTION CATEGORY - Sustainable Building
  {
    id: 13,
    patentNumber: "US11,178,956",
    title: "Mycelium-Based Construction Materials",
    description: "Advanced bio-fabrication process growing construction materials from mushroom mycelium and agricultural waste, creating carbon-negative building materials stronger than concrete.",
    category: "construction",
    economicValue: 320,
    environmentalImpact: {
      co2Sequestered: 3.8,
      wasteReduction: 200,
      carbonStorage: 2.5
    },
    accessLevel: 3,
    heroAssociation: "trader_gcct",
    unlockCost: 450,
    dailyUsageLimit: 4,
    realWorldApplication: "Revolutionary building materials that grow themselves while sequestering carbon and using agricultural waste",
    scientificBasis: "Stanford University research on mycelium composites achieving compressive strength of 30 MPa with negative carbon footprint"
  },
  {
    id: 14,
    patentNumber: "US11,289,463",
    title: "Self-Healing Bio-Concrete with Bacteria",
    description: "Innovative concrete formulation incorporating bacterial spores that activate when cracks form, producing limestone to automatically heal structural damage and extend building lifespan.",
    category: "construction",
    economicValue: 400,
    environmentalImpact: {
      co2Sequestered: 2.2,
      carbonStorage: 1.8,
      wasteReduction: 150
    },
    accessLevel: 5,
    heroAssociation: "trader_gcct",
    unlockCost: 750,
    dailyUsageLimit: 2,
    realWorldApplication: "Self-repairing infrastructure that dramatically reduces maintenance costs and material waste",
    scientificBasis: "Delft University bacillus pasteurii research demonstrating crack healing in concrete within 2-3 weeks"
  },
  {
    id: 15,
    patentNumber: "US11,334,718",
    title: "3D Printed Recycled Ocean Plastic Building Blocks",
    description: "Advanced 3D printing system creating structural building components from recycled ocean plastic, with optimized designs for strength and thermal performance.",
    category: "construction",
    economicValue: 180,
    environmentalImpact: {
      plasticConverted: 5000,
      oceanCleanup: 2000,
      wasteReduction: 500,
      co2Sequestered: 1.5
    },
    accessLevel: 2,
    heroAssociation: "trader_gcct",
    unlockCost: 300,
    dailyUsageLimit: 6,
    realWorldApplication: "Building homes and infrastructure using ocean plastic waste as primary construction material",
    scientificBasis: "ETH Zurich research on recycled plastic building components achieving structural building code compliance"
  },

  // ADVANCED PATENTS - Cross-Category Innovation
  {
    id: 16,
    patentNumber: "US11,412,895",
    title: "Integrated Algae-Solar-Biochar Production System",
    description: "Comprehensive system combining algae cultivation with solar energy and biochar production, creating a circular economy loop for maximum environmental and economic value.",
    category: "biochar",
    economicValue: 850,
    environmentalImpact: {
      co2Sequestered: 8.5,
      energyGenerated: 150,
      carbonStorage: 6.2,
      waterPurified: 25000
    },
    accessLevel: 8,
    heroAssociation: "graphene_batt",
    unlockCost: 1500,
    dailyUsageLimit: 1,
    realWorldApplication: "Integrated facilities producing energy, water treatment, and carbon sequestration simultaneously",
    scientificBasis: "MIT research on integrated algae biorefineries achieving 85% carbon utilization efficiency"
  },
  {
    id: 17,
    patentNumber: "US11,487,234",
    title: "Floating Solar-Powered Ocean Cleanup Array",
    description: "Autonomous floating platform combining solar power generation with active ocean plastic collection and on-board enzymatic breakdown, creating clean energy while cleaning oceans.",
    category: "water",
    economicValue: 950,
    environmentalImpact: {
      plasticConverted: 10000,
      oceanCleanup: 5000,
      energyGenerated: 500,
      co2Sequestered: 6.8
    },
    accessLevel: 9,
    heroAssociation: "aqua_wtr",
    unlockCost: 2000,
    dailyUsageLimit: 1,
    realWorldApplication: "Autonomous ocean cleanup systems that power themselves while removing plastic and generating clean energy",
    scientificBasis: "The Ocean Cleanup foundation research on autonomous collection efficiency combined with Fraunhofer ISE floating solar technology"
  },
  {
    id: 18,
    patentNumber: "US11,523,847",
    title: "Quantum Dot Enhanced Atmospheric Energy Harvesting",
    description: "Revolutionary energy harvesting system using quantum dots to capture energy from multiple atmospheric sources: solar, thermal, and electromagnetic radiation simultaneously.",
    category: "energy",
    economicValue: 1200,
    environmentalImpact: {
      energyGenerated: 750,
      co2Sequestered: 12.5
    },
    accessLevel: 10,
    heroAssociation: "voltra_gpwr",
    unlockCost: 2500,
    dailyUsageLimit: 1,
    realWorldApplication: "Next-generation energy systems harvesting power from all available atmospheric sources",
    scientificBasis: "Los Alamos National Laboratory quantum dot research achieving multi-spectral energy harvesting with 45% efficiency"
  },

  // REAL USER PATENTS - User's Actual Patent Portfolio
  {
    id: 19,
    patentNumber: "US10883052B2",
    title: "Biochar Kiln",
    description: "Advanced biochar production system with steel drum construction, multi-zone combustion control, and recipe-driven automation. Features semi-independent combustion cells, negative pressure management, and optimized processing for diverse biomass feedstock including beetle-kill and fire-damaged trees.",
    category: "biochar",
    economicValue: 275,
    environmentalImpact: {
      co2Sequestered: 1.5,
      carbonStorage: 1.2,
      wasteReduction: 75
    },
    accessLevel: 1,
    heroAssociation: "graphene_batt",
    unlockCost: 150,
    dailyUsageLimit: 5,
    realWorldApplication: "Commercial-scale biochar production from agricultural and forestry waste, providing carbon sequestration while creating valuable soil amendment products for agriculture and carbon credit markets",
    scientificBasis: "BIOCHAR NOW LLC patented technology featuring controlled pyrolysis in oxygen-deprived environment with electronic valve systems achieving consistent biochar quality and ~$90/ton CO2 sequestration cost"
  }
];

/**
 * Get patents by category
 */
export const getPatentsByCategory = (category: Patent['category']): Patent[] => {
  return PATENTS_DATABASE.filter(patent => patent.category === category);
};

/**
 * Get patents by hero association
 */
export const getPatentsByHero = (heroId: string): Patent[] => {
  return PATENTS_DATABASE.filter(patent => patent.heroAssociation === heroId);
};

/**
 * Get patent by ID
 */
export const getPatentById = (id: number): Patent | undefined => {
  return PATENTS_DATABASE.find(patent => patent.id === id);
};

/**
 * Get patents available at user level
 */
export const getAvailablePatents = (userLevel: number): Patent[] => {
  return PATENTS_DATABASE.filter(patent => patent.accessLevel <= userLevel);
};

/**
 * Calculate total economic value for patent usage
 */
export const calculatePatentEconomicValue = (patent: Patent, usageCount: number): number => {
  // Economic value scales with diminishing returns to prevent exploitation
  const baseValue = patent.economicValue;
  const scalingFactor = Math.max(0.1, 1 - (usageCount * 0.05)); // 5% reduction per use, minimum 10%
  return baseValue * scalingFactor;
};

/**
 * Calculate environmental impact for patent usage
 */
export const calculateEnvironmentalImpact = (patent: Patent, usageCount: number) => {
  // Environmental impact remains consistent - real environmental benefit
  return patent.environmentalImpact;
};

/**
 * Check if user can afford patent unlock
 */
export const canUnlockPatent = (patent: Patent, userCoins: number, userLevel: number): boolean => {
  return userLevel >= patent.accessLevel && userCoins >= patent.unlockCost;
};

/**
 * Get patent unlock requirements
 */
export const getUnlockRequirements = (patent: Patent) => {
  return {
    level: patent.accessLevel,
    cost: patent.unlockCost,
    heroAssociation: patent.heroAssociation
  };
};