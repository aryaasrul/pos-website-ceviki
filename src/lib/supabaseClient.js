
import { createClient } from '@supabase/supabase-js'

// Ganti dengan URL dan Kunci Anon dari proyek Supabase Anda.
const supabaseUrl = 'https://eeyalsjlsglyrefnfuoc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleWFsc2psc2dseXJlZm5mdW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTMyMDYsImV4cCI6MjA2NjE2OTIwNn0.wGd1bLGPwYw3zdMyrbm6847Xuz-PBlOaLg6kPX1DB_k'

export const supabase = createClient(supabaseUrl, supabaseKey)
