/**
 * Supabase connection settings.
 *
 * Supabase dashboard > Project Settings > API:
 *   url      = "Project URL"                 (https://xxxxxxxx.supabase.co)
 *   anonKey  = "anon" / "public" key         (a long text starting with eyJ...)
 *
 * The anon key is meant to be public: Row Level Security in the database protects the data.
 * NEVER paste the "service_role" key here.
 */
window.ALDENMOOR_SUPABASE = {
  url: 'https://utzewfnmyllfdtqouwqd.supabase.co/rest/v1/',
  anonKey: 'sb_publishable_VEo3XtEbt0WJ-bCg_QYCug_a2vQe3OZ',
};
