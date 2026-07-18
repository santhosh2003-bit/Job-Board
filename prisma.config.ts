import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 moves connection configuration out of schema.prisma and into this
// file. The runtime PrismaClient connects via a driver adapter (see
// src/lib/prisma.ts); this config is what the Prisma CLI uses for migrate/seed.
//
// We read DATABASE_URL directly (falling back to "") instead of Prisma's
// `env()` helper, which hard-throws when the variable is missing. That matters
// because `prisma generate` runs on every `npm install` (postinstall) and in
// CI — neither of which needs a live connection. Commands that actually connect
// (`db push`, `db seed`, `migrate`) surface a normal connection error if the
// URL is empty, instead of failing install with a config error.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
