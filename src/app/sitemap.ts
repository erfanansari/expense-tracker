import type { MetadataRoute } from 'next';

const BASE_URL = 'https://kharji.app';

const sitemap = (): MetadataRoute.Sitemap => {
  const lastModified = new Date();

  return [
    { url: BASE_URL, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/login`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/signup`, lastModified, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${BASE_URL}/changelog`, lastModified, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
};

export default sitemap;
