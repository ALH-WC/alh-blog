/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  // The blog is served under /blog and /studio. When this is later fronted by
  // the Cloudflare Worker at amsterdamlifehomes.com/blog/*, keep asset paths absolute.
};

export default nextConfig;
