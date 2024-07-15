/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**'
          },
        ],
      },
};

export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   webpack: (config) => {
//     config.resolve.alias = {
//       ...config.resolve.alias,
//       '@': path.resolve(__dirname, 'src'),
//     };
//     return config;
//   },
// };

// module.exports = nextConfig;

// const path = require('path');

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   webpack: (config) => {
//     config.resolve.alias = {
//       ...config.resolve.alias,
//       '@': path.resolve(__dirname, 'src'),
//     };
//     return config;
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: '**'
//       },
//     ],
//   },
// };

// module.exports = nextConfig;
