// Mock Supabase client for when Supabase is not configured
// This allows the site to run in demo mode during development

export function createClient() {
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => ({
              data: null,
              error: new Error("Supabase not configured"),
            }),
            data: null,
            error: new Error("Supabase not configured"),
          }),
          single: () => ({
            data: null,
            error: new Error("Supabase not configured"),
          }),
          data: null,
          error: new Error("Supabase not configured"),
        }),
        data: null,
        error: new Error("Supabase not configured"),
      }),
      insert: () => ({
        data: null,
        error: new Error("Supabase not configured"),
      }),
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: new Error("Supabase not configured") }),
      signUp: async () => ({ data: null, error: new Error("Supabase not configured") }),
      signOut: async () => {},
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  } as any
}
