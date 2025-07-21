// Database setup script for production
const { createClient } = require("@supabase/supabase-js")

async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log("🚀 Setting up database...")

  try {
    // Test connection
    const { data, error } = await supabase.from("menu_categories").select("count").single()

    if (error && error.code === "42P01") {
      console.log("📋 Tables not found. Please run the SQL scripts manually in Supabase.")
      console.log("1. Go to your Supabase dashboard")
      console.log("2. Navigate to SQL Editor")
      console.log("3. Run the scripts in /scripts/ folder in order")
      return
    }

    console.log("✅ Database connection successful!")
    console.log(`📊 Found ${data?.count || 0} menu categories`)
  } catch (error) {
    console.error("❌ Database setup failed:", error.message)
  }
}

setupDatabase()
