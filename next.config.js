/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'avatars.githubusercontent.com',  // For GitHub avatars
      'github.com',                     // For other GitHub images
      'raw.githubusercontent.com'        // For images in GitHub repos
    ],
  },
}

module.exports = nextConfig 