import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wmrdsemffemoraxaaslg.supabase.co';
const supabaseKey = 'sb_publishable_Pi4XSR91_3ZEDgOU3V7okw_h4B4De3H';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: users, error: errorUsers } = await supabase.from('users').select('*');
    console.log('Users:', users, errorUsers);

    const { data: keys, error: errorKeys } = await supabase.from('keys').select('*');
    console.log('Keys:', keys, errorKeys);
}
main();
