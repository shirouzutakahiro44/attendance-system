// Direct SQL execution script for Supabase using fetch
const fs = require('fs');
const path = require('path');

// Load SQL file
const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', '001_initial_schema.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

// Supabase configuration from .env.local
const SUPABASE_PROJECT_REF = 'utkkdwjckfxnfvmppzyg';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0a2tkd2pja2Z4bmZ2bXBwenlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY5MDY1MCwiZXhwIjoyMDcyMjY2NjUwfQ.tpcLMR3Y3C7sHMFYkzuFZkxJjtbq7vFmzg_8jhMEQ_4';

async function executeSQLViaAPI() {
  console.log('🚀 Starting SQL migration execution...');
  console.log(`📁 SQL file: ${sqlPath}`);
  console.log(`🎯 Target project: ${SUPABASE_PROJECT_REF}`);
  
  try {
    // Use Supabase Management API to execute SQL
    const response = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      
      // Try alternative approach: execute via SQL Editor endpoint
      console.log('\n🔄 Trying alternative method...');
      await executeSQLDirect();
    } else {
      console.log('✅ Migration executed successfully via API!');
    }
  } catch (error) {
    console.error('❌ Failed to execute via API:', error.message);
    console.log('\n🔄 Trying alternative method...');
    await executeSQLDirect();
  }
}

async function executeSQLDirect() {
  // Alternative: Use pg module directly
  console.log('📝 Attempting direct PostgreSQL connection...');
  
  // Connection string components
  const dbConfig = {
    host: `aws-0-ap-northeast-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: `postgres.${SUPABASE_PROJECT_REF}`,
    password: SUPABASE_SERVICE_KEY
  };
  
  console.log('Connection config:');
  console.log(`  Host: ${dbConfig.host}`);
  console.log(`  Port: ${dbConfig.port}`);
  console.log(`  Database: ${dbConfig.database}`);
  console.log(`  User: ${dbConfig.user}`);
  
  // Since pg is not installed, we'll output the connection string for manual execution
  const connectionString = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
  
  console.log('\n📋 Manual execution instructions:');
  console.log('1. Install PostgreSQL client tools');
  console.log('2. Run the following command:');
  console.log(`   psql "${connectionString}" -f prisma/migrations/001_initial_schema.sql`);
  
  console.log('\n🌐 Alternative: Use Supabase Dashboard');
  console.log('1. Go to: https://supabase.com/dashboard/project/utkkdwjckfxnfvmppzyg/sql');
  console.log('2. Copy the SQL from: prisma/migrations/001_initial_schema.sql');
  console.log('3. Paste and execute in the SQL Editor');
}

// Execute the migration
executeSQLViaAPI().catch(console.error);