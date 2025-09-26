import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { patents } from "@shared/schema";
import { PATENTS_DATABASE } from "../client/src/data/patents";

// Initialize PostgreSQL client and Drizzle
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
const db = drizzle(client);

/**
 * Seed the database with initial patent data
 * This script populates the patents table with real patent information
 */
export async function seedPatents() {
  console.log('🌱 Starting patent database seeding...');
  
  try {
    // Check if patents already exist to avoid duplicates
    const existingPatents = await db.select().from(patents);
    
    if (existingPatents.length > 0) {
      console.log(`📋 Found ${existingPatents.length} existing patents. Skipping seeding.`);
      return existingPatents;
    }
    
    // Transform patents data for database insertion
    const patentsToInsert = PATENTS_DATABASE.map(patent => ({
      patentNumber: patent.patentNumber,
      title: patent.title,
      description: patent.description,
      category: patent.category,
      economicValue: patent.economicValue,
      environmentalImpact: patent.environmentalImpact,
      accessLevel: patent.accessLevel,
      heroAssociation: patent.heroAssociation
    }));
    
    // Insert all patents
    console.log(`📄 Inserting ${patentsToInsert.length} patents...`);
    const insertedPatents = await db.insert(patents).values(patentsToInsert).returning();
    
    console.log(`✅ Successfully seeded ${insertedPatents.length} patents!`);
    
    // Log category breakdown
    const categoryBreakdown = insertedPatents.reduce((acc, patent) => {
      acc[patent.category] = (acc[patent.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 Patent categories:', categoryBreakdown);
    
    return insertedPatents;
  } catch (error) {
    console.error('❌ Error seeding patents:', error);
    throw error;
  }
}

/**
 * Remove all patents (useful for testing)
 */
export async function clearPatents() {
  console.log('🗑️  Clearing all patents...');
  try {
    await db.delete(patents);
    console.log('✅ Patents cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing patents:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedPatents()
    .then(() => {
      console.log('🎉 Patent seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Patent seeding failed:', error);
      process.exit(1);
    });
}