const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "billforge_saas",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function withTransaction(callback) {
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

async function initDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255) NOT NULL,
      contact_email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(50) DEFAULT '',
      subdomain VARCHAR(100) DEFAULT '',
      status ENUM('trial', 'active', 'suspended') NOT NULL DEFAULT 'trial',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  try {
    await query(`ALTER TABLE clients ADD COLUMN subdomain VARCHAR(100) DEFAULT '' AFTER phone`);
  } catch (_e) { /* column already exists */ }

  await query(`
    CREATE TABLE IF NOT EXISTS payment_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      razorpay_order_id VARCHAR(255) NOT NULL UNIQUE,
      registration_json LONGTEXT NOT NULL,
      amount INT NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_id INT NOT NULL,
      plan_name VARCHAR(100) NOT NULL,
      status ENUM('trial', 'active', 'suspended') NOT NULL DEFAULT 'trial',
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      user_limit INT NOT NULL DEFAULT 5,
      branch_limit INT NOT NULL DEFAULT 2,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_subscriptions_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      gstin VARCHAR(50) DEFAULT '',
      email VARCHAR(255) DEFAULT '',
      phone VARCHAR(50) DEFAULT '',
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_companies_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS branches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) DEFAULT '',
      address TEXT,
      email VARCHAR(255) DEFAULT '',
      phone VARCHAR(50) DEFAULT '',
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_branches_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_id INT NULL,
      company_id INT NULL,
      branch_id INT NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('super_admin', 'admin', 'staff') NOT NULL DEFAULT 'staff',
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_users_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
      CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      branch_id INT NULL,
      created_by INT NOT NULL,
      invoice_number VARCHAR(100) NOT NULL,
      invoice_date DATE NOT NULL,
      status ENUM('draft', 'sent', 'paid', 'cancelled') NOT NULL DEFAULT 'draft',
      client_name VARCHAR(255) DEFAULT '',
      client_company VARCHAR(255) DEFAULT '',
      client_email VARCHAR(255) DEFAULT '',
      client_phone VARCHAR(50) DEFAULT '',
      client_address TEXT,
      client_gstin VARCHAR(50) DEFAULT '',
      business_json LONGTEXT NOT NULL,
      client_json LONGTEXT NOT NULL,
      items_json LONGTEXT NOT NULL,
      notes TEXT,
      subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
      cgst DECIMAL(12,2) NOT NULL DEFAULT 0,
      sgst DECIMAL(12,2) NOT NULL DEFAULT 0,
      igst DECIMAL(12,2) NOT NULL DEFAULT 0,
      round_off DECIMAL(12,2) NOT NULL DEFAULT 0,
      total DECIMAL(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_invoices_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      CONSTRAINT fk_invoices_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
      CONSTRAINT fk_invoices_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      company_name VARCHAR(255) DEFAULT '',
      email VARCHAR(255) DEFAULT '',
      phone VARCHAR(50) DEFAULT '',
      address TEXT,
      gstin VARCHAR(50) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_customers_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      company_name VARCHAR(255) DEFAULT '',
      email VARCHAR(255) DEFAULT '',
      phone VARCHAR(50) DEFAULT '',
      address TEXT,
      gstin VARCHAR(50) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_vendors_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS invoice_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id INT NOT NULL,
      company_id INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      payment_date DATE NOT NULL,
      payment_mode ENUM('cash','bank','upi','cheque','other') NOT NULL DEFAULT 'cash',
      reference VARCHAR(255) DEFAULT '',
      notes TEXT,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_inv_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      CONSTRAINT fk_inv_payments_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS invoice_share_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id INT NOT NULL,
      token VARCHAR(64) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_share_tokens_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )
  `);

  try {
    await query(`ALTER TABLE invoices ADD COLUMN template_type VARCHAR(20) NOT NULL DEFAULT 'standard' AFTER status`);
  } catch (_e) { /* column already exists */ }

  await query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      branch_id INT NULL,
      created_by INT NOT NULL,
      purchase_number VARCHAR(100) NOT NULL,
      purchase_date DATE NOT NULL,
      status ENUM('draft', 'received', 'paid', 'cancelled') NOT NULL DEFAULT 'draft',
      vendor_name VARCHAR(255) DEFAULT '',
      vendor_company VARCHAR(255) DEFAULT '',
      vendor_email VARCHAR(255) DEFAULT '',
      vendor_phone VARCHAR(50) DEFAULT '',
      vendor_address TEXT,
      vendor_gstin VARCHAR(50) DEFAULT '',
      business_json LONGTEXT NOT NULL,
      vendor_json LONGTEXT NOT NULL,
      items_json LONGTEXT NOT NULL,
      notes TEXT,
      subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
      cgst DECIMAL(12,2) NOT NULL DEFAULT 0,
      sgst DECIMAL(12,2) NOT NULL DEFAULT 0,
      igst DECIMAL(12,2) NOT NULL DEFAULT 0,
      round_off DECIMAL(12,2) NOT NULL DEFAULT 0,
      total DECIMAL(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_purchases_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      CONSTRAINT fk_purchases_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
      CONSTRAINT fk_purchases_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

module.exports = {
  pool,
  query,
  withTransaction,
  initDatabase,
};
