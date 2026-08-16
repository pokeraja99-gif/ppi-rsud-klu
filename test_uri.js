import mysql from "mysql2/promise";

try {
  const pool = mysql.createPool({ uri: "mysql://user:p@ssword@tidb-host:4000/db" });
  console.log("Parsed config:", pool.pool.config.connectionConfig);
} catch (e) {
  console.error("Error:", e.message);
}
