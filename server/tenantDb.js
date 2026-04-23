const mysql = require("mysql2/promise");

const BASE_DB_CONFIG = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
};

const tenantPools = new Map();

function getTenantDbName(slug) {
  const clean = slug.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 50);
  return `billforge_t_${clean}`;
}

async function ensureTenantDb(slug) {
  const dbName = getTenantDbName(slug);
  const adminConn = await mysql.createConnection({
    host: BASE_DB_CONFIG.host,
    port: BASE_DB_CONFIG.port,
    user: BASE_DB_CONFIG.user,
    password: BASE_DB_CONFIG.password,
  });
  try {
    await adminConn.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await adminConn.end();
  }
  if (tenantPools.has(slug)) {
    tenantPools.delete(slug);
  }
  const pool = getTenantPool(slug);
  await initTenantSchema(pool);
  return dbName;
}

function getTenantPool(slug) {
  if (!tenantPools.has(slug)) {
    const pool = mysql.createPool({
      ...BASE_DB_CONFIG,
      database: getTenantDbName(slug),
    });
    tenantPools.set(slug, pool);
  }
  return tenantPools.get(slug);
}

async function tenantQuery(slug, sql, params = []) {
  try {
    const pool = getTenantPool(slug);
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    if (err.code === "ER_BAD_DB_ERROR" || err.code === "ECONNREFUSED") {
      await ensureTenantDb(slug);
      const pool = getTenantPool(slug);
      const [rows] = await pool.execute(sql, params);
      return rows;
    }
    throw err;
  }
}

async function tenantTransaction(slug, callback) {
  const pool = getTenantPool(slug);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function initTenantSchema(pool) {
  async function exec(sql) {
    try {
      await pool.execute(sql);
    } catch (e) {
      if (!e.message?.includes("already exists")) throw e;
    }
  }

  await exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      code VARCHAR(100) DEFAULT '',
      name VARCHAR(255) NOT NULL,
      description TEXT,
      type ENUM('product', 'service') NOT NULL DEFAULT 'product',
      unit VARCHAR(50) DEFAULT 'NOS',
      hsn_sac VARCHAR(50) DEFAULT '',
      gst_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
      purchase_rate DECIMAL(12,2) NOT NULL DEFAULT 0,
      sale_rate DECIMAL(12,2) NOT NULL DEFAULT 0,
      opening_stock DECIMAL(12,3) DEFAULT 0,
      current_stock DECIMAL(12,3) DEFAULT 0,
      min_stock DECIMAL(12,3) DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_company (company_id),
      INDEX idx_code (code)
    )
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS godowns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) DEFAULT '',
      address TEXT,
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_company (company_id)
    )
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      product_id INT NOT NULL,
      godown_id INT NULL,
      movement_type ENUM('in', 'out', 'transfer', 'adjustment') NOT NULL,
      quantity DECIMAL(12,3) NOT NULL,
      rate DECIMAL(12,2) DEFAULT 0,
      reference_type VARCHAR(50) DEFAULT '',
      reference_id INT DEFAULT NULL,
      notes TEXT,
      created_by INT NOT NULL,
      movement_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_company_product (company_id, product_id),
      INDEX idx_movement_date (movement_date)
    )
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS cash_bank_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      account_type ENUM('cash', 'bank', 'wallet') NOT NULL DEFAULT 'cash',
      bank_name VARCHAR(255) DEFAULT '',
      account_number VARCHAR(100) DEFAULT '',
      ifsc VARCHAR(50) DEFAULT '',
      opening_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_company (company_id)
    )
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS bank_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      account_id INT NOT NULL,
      company_id INT NOT NULL,
      transaction_type ENUM('credit', 'debit') NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      transaction_date DATE NOT NULL,
      narration VARCHAR(500) DEFAULT '',
      reference VARCHAR(255) DEFAULT '',
      category VARCHAR(100) DEFAULT '',
      reference_type VARCHAR(50) DEFAULT '',
      reference_id INT DEFAULT NULL,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_account (account_id),
      INDEX idx_company_date (company_id, transaction_date)
    )
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS recurring_invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      branch_id INT NULL,
      created_by INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      frequency ENUM('weekly', 'monthly', 'quarterly', 'yearly') NOT NULL DEFAULT 'monthly',
      start_date DATE NOT NULL,
      end_date DATE NULL,
      next_due_date DATE NOT NULL,
      status ENUM('active', 'paused', 'completed') NOT NULL DEFAULT 'active',
      client_json LONGTEXT NOT NULL,
      business_json LONGTEXT NOT NULL,
      items_json LONGTEXT NOT NULL,
      notes TEXT,
      auto_send TINYINT(1) NOT NULL DEFAULT 0,
      last_generated_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_company (company_id),
      INDEX idx_next_due (next_due_date, status)
    )
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS pos_bills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      branch_id INT NULL,
      created_by INT NOT NULL,
      bill_number VARCHAR(100) NOT NULL,
      bill_date DATE NOT NULL,
      customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
      customer_phone VARCHAR(50) DEFAULT '',
      customer_gstin VARCHAR(50) DEFAULT '',
      items_json LONGTEXT NOT NULL,
      subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
      discount DECIMAL(12,2) NOT NULL DEFAULT 0,
      cgst DECIMAL(12,2) NOT NULL DEFAULT 0,
      sgst DECIMAL(12,2) NOT NULL DEFAULT 0,
      igst DECIMAL(12,2) NOT NULL DEFAULT 0,
      total DECIMAL(12,2) NOT NULL DEFAULT 0,
      payment_mode ENUM('cash','card','upi','split') NOT NULL DEFAULT 'cash',
      amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
      change_due DECIMAL(12,2) NOT NULL DEFAULT 0,
      status ENUM('completed','cancelled','refunded') NOT NULL DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_company_date (company_id, bill_date),
      INDEX idx_bill_number (bill_number)
    )
  `);
}

module.exports = {
  getTenantDbName,
  ensureTenantDb,
  getTenantPool,
  tenantQuery,
  tenantTransaction,
  initTenantSchema,
};
