import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ogdrmzvypubtgachkcvq.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_SHbYKvMVeB21Q8jrX1fFng_OIN_SJaT";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);