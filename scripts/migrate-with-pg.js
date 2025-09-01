const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase connection details
const connectionConfig = {
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.utkkdwjckfxnfvmppzyg',
  password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0a2tkd2pja2Z4bmZ2bXBwenlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY5MDY1MCwiZXhwIjoyMDcyMjY2NjUwfQ.tpcLMR3Y3C7sHMFYkzuFZkxJjtbq7vFmzg_8jhMEQ_4',
  ssl: {
    rejectUnauthorized: false
  }
};

async function runMigration() {
  const client = new Client(connectionConfig);
  
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', '001_initial_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('\n📝 Executing migration: 001_initial_schema.sql');
    console.log('=' .repeat(50));
    
    // Execute the entire SQL file
    await client.query(sqlContent);
    
    console.log('✅ Migration executed successfully!');
    
    // Verify tables were created
    console.log('\n🔍 Verifying created tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Tables in public schema:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Check ENUMs
    const enumResult = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY typname;
    `);
    
    console.log('\n📦 Created ENUM types:');
    enumResult.rows.forEach(row => {
      console.log(`  ✓ ${row.typname}`);
    });
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // More detailed error for debugging
    if (error.detail) {
      console.error('   Detail:', error.detail);
    }
    if (error.hint) {
      console.error('   Hint:', error.hint);
    }
    if (error.position) {
      console.error('   Position:', error.position);
    }
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database.');
  }
}

// Run the migration
runMigration().catch(console.error);