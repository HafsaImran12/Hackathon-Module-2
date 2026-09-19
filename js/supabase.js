const supabaseUrl = "https://piuwjiifsluzggzojhuz.supabase.co"
const supabaseKey = "sb_publishable_mfss4b_IaFPV7gB9OPXp-A_rIwnB6hW"
const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);
console.log(client);