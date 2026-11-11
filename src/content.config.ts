import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  minutes: z.number(),
  tags: z.array(z.string()),
  lang: z.string(),
  order: z.number(),
});

const zh = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/zh' }),
  schema: baseSchema,
});

const en = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/en' }),
  schema: baseSchema,
});

export const collections = { zh, en };
