const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase接続情報を環境変数から取得
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Supabase URL and Service Role Key are required');
  console.log('Please set the following environment variables:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=your-project-url');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

async function applyMigration() {
  try {
    // Supabaseクライアントを作成
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // SQLファイルを読み込み
    const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📚 Starting database migration...');
    console.log(`📁 SQL file: ${sqlPath}`);

    // SQLを実行
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('📊 Database schema has been updated.');

    // テーブルの確認
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });

    if (!tablesError && tables) {
      console.log('\n📋 Created tables:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// メイン実行
applyMigration();