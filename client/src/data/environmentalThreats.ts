import { EnvironmentalThreat } from "@/types/heroes";

export const environmentalThreats: EnvironmentalThreat[] = [
  {
    id: "big_tech_ai_factory",
    name: "Big Tech AI Factory",
    type: "big_tech_ai",
    icon: "🏭",
    description: "Massive data centers consuming enormous energy while accelerating climate change through unchecked AI computation",
    threatLevel: 8,
    economicRewards: {
      carbonCredits: 2.5, // tons of CO2 saved by shutting down
      energyGeneration: 1000, // kWh saved/redirected to clean sources
      patentLicensing: 500 // licensing value for clean AI patents
    },
    environmentalImpact: {
      carbonReduction: 2.5,
      energySaved: 1000,
      techDemocratization: 1
    },
    requiredHeroLevel: 6,
    weaknesses: ["Energy", "Universal"],
    resistances: ["Fire", "Dark"]
  },
  {
    id: "toxic_mining_operation",
    name: "Toxic Mining Operation",
    type: "toxic_mining", 
    icon: "⛏️",
    description: "Heavy metal mining poisoning ecosystems and groundwater while destroying biodiversity",
    threatLevel: 9,
    economicRewards: {
      carbonCredits: 1.8,
      plasticConversion: 200, // bottles worth of cleanup materials
      patentLicensing: 350
    },
    environmentalImpact: {
      soilRemediation: 1,
      waterPurification: 1,
      biodiversityProtection: 1
    },
    requiredHeroLevel: 7,
    weaknesses: ["Earth", "Water", "BioChar"],
    resistances: ["Fire", "Electric"]
  },
  {
    id: "fast_fashion_empire",
    name: "Fast Fashion Empire", 
    type: "fast_fashion",
    icon: "👗",
    description: "Textile waste choking waterways while exploiting workers and accelerating consumption culture",
    threatLevel: 6,
    economicRewards: {
      plasticConversion: 500, // massive textile-to-material conversion
      patentLicensing: 275,
      carbonCredits: 1.2
    },
    environmentalImpact: {
      wasteReduction: 1,
      waterCleanup: 1,
      sustainableProduction: 1
    },
    requiredHeroLevel: 4,
    weaknesses: ["Water", "Construction"],
    resistances: ["Dark"]
  },
  {
    id: "fossil_fuel_monopoly",
    name: "Fossil Fuel Monopoly",
    type: "fossil_fuel",
    icon: "🛢️", 
    description: "Oil and gas conglomerates blocking clean energy transition while accelerating climate crisis",
    threatLevel: 10,
    economicRewards: {
      carbonCredits: 5.0, // massive carbon impact
      energyGeneration: 2000,
      patentLicensing: 750
    },
    environmentalImpact: {
      carbonSequestration: 5,
      cleanEnergyTransition: 1,
      energyDemocratization: 1
    },
    requiredHeroLevel: 8,
    weaknesses: ["Energy", "Universal", "BioChar"],
    resistances: ["Fire", "Dark", "Electric"]
  },
  {
    id: "industrial_pollution_complex",
    name: "Industrial Pollution Complex",
    type: "industrial_pollution",
    icon: "🏭",
    description: "Chemical factories releasing toxins into air and water while resisting environmental regulations",
    threatLevel: 7,
    economicRewards: {
      carbonCredits: 2.0,
      plasticConversion: 300,
      patentLicensing: 400
    },
    environmentalImpact: {
      airPurification: 1,
      waterCleaning: 1,
      toxinReduction: 1
    },
    requiredHeroLevel: 5,
    weaknesses: ["Air", "Water", "BioChar"],
    resistances: ["Fire", "Dark"]
  },
  {
    id: "deforestation_syndicate",
    name: "Deforestation Syndicate",
    type: "deforestation",
    icon: "🪓",
    description: "Illegal logging destroying carbon-storing forests and biodiversity hotspots for short-term profit",
    threatLevel: 8,
    economicRewards: {
      carbonCredits: 3.5, // forests are huge carbon stores
      patentLicensing: 450,
      plasticConversion: 150
    },
    environmentalImpact: {
      forestRegeneration: 1,
      carbonStorage: 3.5,
      biodiversityRestoration: 1
    },
    requiredHeroLevel: 6,
    weaknesses: ["Earth", "BioChar", "Universal"],
    resistances: ["Fire"]
  }
];

// Helper function to get threat by ID
export function getThreatById(id: string): EnvironmentalThreat | undefined {
  return environmentalThreats.find(threat => threat.id === id);
}

// Helper function to get threats by difficulty range
export function getThreatsByLevel(minLevel: number, maxLevel: number): EnvironmentalThreat[] {
  return environmentalThreats.filter(threat => 
    threat.threatLevel >= minLevel && threat.threatLevel <= maxLevel
  );
}

// Helper function to get threats effective against hero element
export function getVulnerableThreats(heroElement: string): EnvironmentalThreat[] {
  return environmentalThreats.filter(threat => 
    threat.weaknesses.includes(heroElement)
  );
}

// Helper function to calculate economic reward value
export function calculateThreatRewards(threat: EnvironmentalThreat): number {
  let totalValue = 0;
  
  // Carbon credits at $175/ton
  if (threat.economicRewards.carbonCredits) {
    totalValue += threat.economicRewards.carbonCredits * 175;
  }
  
  // Plastic conversion at $1.25/bottle
  if (threat.economicRewards.plasticConversion) {
    totalValue += threat.economicRewards.plasticConversion * 1.25;
  }
  
  // Energy generation at $0.15/kWh
  if (threat.economicRewards.energyGeneration) {
    totalValue += threat.economicRewards.energyGeneration * 0.15;
  }
  
  // Direct patent licensing value
  if (threat.economicRewards.patentLicensing) {
    totalValue += threat.economicRewards.patentLicensing;
  }
  
  return Math.round(totalValue * 100) / 100; // Round to 2 decimal places
}