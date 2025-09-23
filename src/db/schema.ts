import {sql} from "drizzle-orm";
import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

export const links = sqliteTable("links", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", {mode: "timestamp"})
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  path: text("path").notNull(),
  relationType: text("relation_type").notNull(),
  href: text("href"),
  title: text("title"),
  type: text("type"),
  isDefault: integer("is_default", {mode: "boolean"})
    .notNull()
    .default(false),
  hreflang: text("hreflang", {mode: "json"}).$type<string[] | null>(),
});
