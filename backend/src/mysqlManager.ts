// ── MySQL Database Manager ──────────────────────────────
// Creates and deletes real MySQL databases + users via remote TCP connection

import mysql from 'mysql2/promise';

// ── Configuration (env or defaults) ─────────────────────
const MYSQL_HOST = process.env.MYSQL_HOST || '54.93.53.120';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
const MYSQL_ROOT_USER = process.env.MYSQL_ROOT_USER || 'svhhost_admin';
const MYSQL_ROOT_PASS = process.env.MYSQL_ROOT_PASS || 'SvhHost_Admin_2026!';

async function getConnection(): Promise<mysql.Connection> {
  return mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_ROOT_USER,
    password: MYSQL_ROOT_PASS,
    connectTimeout: 10000,
    multipleStatements: true,
  });
}

/**
 * Create a MySQL database + user with access from any host (%)
 */
export async function createMysqlDatabase(
  dbName: string,
  username: string,
  password: string,
): Promise<void> {
  const safeName = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeUser = username.replace(/[^a-zA-Z0-9_]/g, '');

  if (!safeName || !safeUser) throw new Error('Invalid database or username');

  const conn = await getConnection();
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${safeName}\``);
    await conn.query(`CREATE USER IF NOT EXISTS '${safeUser}'@'%' IDENTIFIED BY ?`, [password]);
    await conn.query(`GRANT ALL PRIVILEGES ON \`${safeName}\`.* TO '${safeUser}'@'%'`);
    await conn.query(`FLUSH PRIVILEGES`);
    console.log(`[MySQL] Created database '${safeName}' with user '${safeUser}'@'%'`);
  } finally {
    await conn.end();
  }
}

/**
 * Delete a MySQL database + user
 */
export async function deleteMysqlDatabase(
  dbName: string,
  username: string,
): Promise<void> {
  const safeName = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeUser = username.replace(/[^a-zA-Z0-9_]/g, '');

  if (!safeName || !safeUser) throw new Error('Invalid database or username');

  const conn = await getConnection();
  try {
    // 1. Revoke privileges first
    try {
      await conn.query(`REVOKE ALL PRIVILEGES ON \`${safeName}\`.* FROM '${safeUser}'@'%'`);
    } catch (e: any) {
      console.warn(`[MySQL] Revoke warning (non-fatal): ${e.message}`);
    }

    // 2. Drop database
    const [dbResult]: any = await conn.query(`DROP DATABASE IF EXISTS \`${safeName}\``);
    console.log(`[MySQL] DROP DATABASE '${safeName}' result:`, dbResult);

    // 3. Drop user
    const [userResult]: any = await conn.query(`DROP USER IF EXISTS '${safeUser}'@'%'`);
    console.log(`[MySQL] DROP USER '${safeUser}' result:`, userResult);

    await conn.query(`FLUSH PRIVILEGES`);
    console.log(`[MySQL] Successfully deleted database '${safeName}' and user '${safeUser}'`);
  } finally {
    await conn.end();
  }
}

/**
 * Check if MySQL server is reachable
 */
export async function isMysqlAvailable(): Promise<boolean> {
  try {
    const conn = await getConnection();
    await conn.ping();
    await conn.end();
    return true;
  } catch {
    return false;
  }
}
