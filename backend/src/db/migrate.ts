import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db.js";

async function main() {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations completed");
  process.exit(0);
}

main();