/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true, // Optional if you're using Server Actions
  },
  // This ensures middleware works correctly with edge runtime
  // No special rewrites or redirects needed here for Supabase auth
};

export default nextConfig;
