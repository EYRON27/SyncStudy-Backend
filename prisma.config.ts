import { defineConfig } from 'prisma/config'

/**
 * Prisma 7 configuration file.
 * Connection URL is loaded from the DATABASE_URL environment variable.
 * See: https://pris.ly/d/config-datasource
 */
export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
})
