import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wmrdsemffemoraxaaslg.supabase.co';
const supabaseKey = 'sb_publishable_Pi4XSR91_3ZEDgOU3V7okw_h4B4De3H';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    console.log('Users table result:', data, error);
}
main();
