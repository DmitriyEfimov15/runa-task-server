import { defineConfig } from 'prisma/config';

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('SHADOW_DATABASE_URL:', process.env.SHADOW_DATABASE_URL);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
