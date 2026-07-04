/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactCompiler: true,  // disabled - can cause subtle bugs with React 19, re-enable after testing
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;