/**
 * Supabase database types.
 *
 * THIS FILE IS A PLACEHOLDER. Regenerate it after applying migrations:
 *
 *   supabase gen types typescript --linked > src/lib/supabase/types.ts
 *
 * The placeholder defines a minimal `Database` shape so the supabase clients
 * compile before the first type generation. Replace the entire file with
 * generated output before relying on the types.
 *
 * Run the command above once the cloud project is linked and migrations are
 * pushed, then commit the regenerated file.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
