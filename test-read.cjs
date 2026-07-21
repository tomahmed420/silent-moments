require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);
supabase
  .from("journal_entries")
  .select("*")
  .eq("slug", "_site_settings")
  .then((res) => console.log(JSON.stringify(res.data, null, 2)));
