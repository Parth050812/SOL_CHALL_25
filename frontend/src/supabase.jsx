import {createClient} from "@supabase/supabase-js"
const SUP_URL="https://lkcqtzqffepwseeidenu.supabase.co";
const SUP_API="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrY3F0enFmZmVwd3NlZWlkZW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjM0NDMsImV4cCI6MjA1NzE5OTQ0M30.GPEYe3cz_SEk0SdwtvFQDfDti8kV449viX5jmZdHFqI";
const local = "http://localhost:5000";
export const Local = local;
export const supabase = createClient(SUP_URL,SUP_API);
