
import { createClient } from '@supabase/supabase-js'

// Ganti dengan URL dan Kunci Anon dari proyek Supabase Anda.
const supabaseUrl = 'https://yaggkepfrbkdfxzgitjd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZ2drZXBmcmJrZGZ4emdpdGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzODkwMTMsImV4cCI6MjA2NTk2NTAxM30.kv_wj7H-6yyoMRZbOsFDQ7PfvVoQtjMbTKzSQ0ucpic'

export const supabase = createClient(supabaseUrl, supabaseKey)
