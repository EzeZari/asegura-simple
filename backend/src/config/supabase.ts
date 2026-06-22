import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Creamos el cliente con permisos totales de administrador para manejar los PDFs
export const supabase = createClient(supabaseUrl, supabaseKey);