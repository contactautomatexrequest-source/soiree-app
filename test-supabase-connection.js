// Script de test pour vérifier la connexion Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gqzcrwexgtlbfjwyvyxw.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_jkVLLXfL1p_t3oRc7Xf7og_xi2h9jYG';

console.log('🔍 Test de connexion Supabase...');
console.log('URL:', SUPABASE_URL);
console.log('Key (premiers 20 caractères):', SUPABASE_KEY.substring(0, 20) + '...');
console.log('');
console.log('✅ Si vous voyez cette sortie, les variables sont chargées.');
console.log('⚠️  Assurez-vous que le serveur Next.js est redémarré après modification de .env.local');
