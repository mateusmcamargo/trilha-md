// demo mode: uses data from mockData.ts instead of Supabase
// activates when Supabase is not configured or NEXT_PUBLIC_USE_MOCK=true
export const isMockMode =
    process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// demo mode only: when 'true', pages with a skeleton show it instead of the data
export const SKELETON_PREVIEW_COOKIE = 'skeleton-preview';