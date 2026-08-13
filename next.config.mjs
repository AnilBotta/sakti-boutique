/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Primary media host. Cloudinary already negotiates format + quality
      // via `f_auto,q_auto`, so these are usually rendered `unoptimized`.
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Retained so any not-yet-migrated row keeps rendering rather than
      // throwing. Safe to drop once the Supabase bucket is deleted.
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
