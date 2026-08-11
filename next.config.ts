import type { NextConfig } from 'next';

// The marketing site (home, boat listing/detail, experiences, FAQ, contact) is
// plain static HTML/CSS/JS living in public/ — it predates this Next.js app
// and stays that way. Next's public-folder serving doesn't resolve directory
// URLs to index.html on its own, so these rewrites restore the clean-URL
// behaviour a plain static host would give for free.
const flatSections = ['experiencies', 'preguntes-frequents', 'contacte'];

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      { source: '/vaixells', destination: '/vaixells/index.html' },
      { source: '/vaixells/', destination: '/vaixells/index.html' },
      { source: '/vaixells/:slug', destination: '/vaixells/:slug/index.html' },
      { source: '/vaixells/:slug/', destination: '/vaixells/:slug/index.html' },
      ...flatSections.flatMap((section) => [
        { source: `/${section}`, destination: `/${section}/index.html` },
        { source: `/${section}/`, destination: `/${section}/index.html` },
      ]),
    ];
  },
};

export default nextConfig;
