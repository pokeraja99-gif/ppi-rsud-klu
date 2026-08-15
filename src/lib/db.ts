import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  ssl: process.env.NODE_ENV === "production" ? {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  } : undefined,
});

export const db = drizzle(connection);
