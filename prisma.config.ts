import { defineConfig } from 'prisma/config'
import 'dotenv/config'
/**
 * Prisma 7 configuration file.
 * Connection URL is loaded from the DATABASE_URL environment variable.
 * See: https://pris.ly/d/config-datasource
 */
export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL
  }
})
