/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/case-studies", destination: "/projects", permanent: true },
    ];
  },
};

export default nextConfig;
