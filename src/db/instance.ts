import {drizzle} from "drizzle-orm/libsql";

export function getDb() {
  return drizzle(process.env.DATABASE_URL);
}
