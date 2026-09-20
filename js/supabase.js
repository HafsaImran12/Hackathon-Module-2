const supabaseUrl = "https://epvyihxezaswhordnrxc.supabase.co";
const supabaseKey = "sb_publishable_3WeHG3hK28QHg_5hAybleA_18gY9aQ_";
const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);
console.log(client);
