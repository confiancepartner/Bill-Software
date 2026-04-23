# BillForge — Local Setup Guide

## Requirements

| Tool | Version | Install |
|---|---|---|
| Node.js | v18 or v20 | https://nodejs.org |
| npm | v9+ | comes with Node.js |
| MySQL | 8.0+ | https://dev.mysql.com/downloads/ |

---

## Step 1 — Clone / Unzip the Project

```bash
unzip billforge.zip -d billforge
cd billforge
```

---

## Step 2 — Create the Database

Open your MySQL client and run:

```sql
CREATE DATABASE IF NOT EXISTS billforge_saas
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
```

Then import the schema:

```bash
mysql -u root -p billforge_saas < schema.sql
```

This creates all tables and inserts the default **Super Admin** user:
- Email: `superadmin@billforge.local`
- Password: `Admin@123`
- **Change this password immediately after first login.**

---

## Step 3 — Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
JWT_SECRET=your-long-random-secret-here
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=billforge_saas
DB_USER=root
DB_PASSWORD=your_mysql_password
```

Generate a secure `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Step 4 — Install Dependencies & Start

```bash
npm install
npm run dev
```

The app starts on **http://localhost:3000**

---

## Accessing Tenant Workspaces Locally

On localhost, subdomains don't work out of the box. Use the **`?tenant=<slug>`** query parameter instead.

### Example

If a tenant registered with slug `velmora-services`:

```
http://localhost:3000/?tenant=velmora-services
```

The **Login** button on the homepage also lets you enter a workspace name to navigate there.

---

## Super Admin Panel

```
http://localhost:3000/superAdmin
```

Login: `superadmin@billforge.local` / `Admin@123`

From here you can create and manage all client tenants.

---

## Optional: True Subdomain Support on Localhost (macOS)

If you want `http://velmora-services.localhost:3000` to work:

### Install dnsmasq (macOS)

```bash
brew install dnsmasq
```

Add wildcard resolution for `.localhost`:

```bash
echo "address=/.localhost/127.0.0.1" >> /opt/homebrew/etc/dnsmasq.conf
sudo brew services start dnsmasq
```

Tell macOS to use dnsmasq for `.localhost` queries:

```bash
sudo mkdir -p /etc/resolver
echo "nameserver 127.0.0.1" | sudo tee /etc/resolver/localhost
```

Then set `MAIN_DOMAIN=localhost` in your `.env`. The app will now parse the subdomain from the `Host` header.

### On Linux (Ubuntu/Debian) with dnsmasq

```bash
sudo apt install dnsmasq
echo "address=/.localhost/127.0.0.1" | sudo tee -a /etc/dnsmasq.conf
sudo systemctl restart dnsmasq
```

Add to `/etc/resolv.conf`:

```
nameserver 127.0.0.1
```

---

## Optional: True Subdomain Support on Localhost (Windows)

Windows doesn't support wildcards in `hosts`. The easiest approach on Windows is to stick with the `?tenant=<slug>` query param method, which works perfectly.

If you need real subdomains, use [Acrylic DNS Proxy](https://mayakron.altervista.org/wikibase/show.php?id=AcrylicHome) for wildcard DNS.

---

## Optional: Email Notifications (SMTP)

Add to your `.env`:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=BillForge <you@gmail.com>
```

If SMTP is not configured, emails are silently skipped (no errors).

**Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords.

---

## Optional: Razorpay Payments

Add to your `.env`:

```dotenv
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

Without these, registration uses the free direct flow (no payment step).

---

## Production Build

```bash
npm run build
npm run start
```

For production, set `MAIN_DOMAIN` to your root domain (e.g. `billing.mycompany.com`) and configure wildcard DNS to point `*.billing.mycompany.com` to your server.

---

## Database Tables Reference

| Table | Purpose |
|---|---|
| `clients` | SaaS tenants (one per registered workspace) |
| `subscriptions` | Trial / plan info per client |
| `companies` | Companies per client |
| `branches` | Branches per company |
| `users` | All users (super_admin, admin, staff) |
| `invoices` | GST sales invoices |
| `purchases` | Purchase / vendor bills |
| `customers` | Customer address book per company |
| `vendors` | Vendor address book per company |
| `invoice_payments` | Recorded payments against invoices |
| `invoice_share_tokens` | Public share tokens for invoices |
| `payment_orders` | Razorpay payment order records |

---

## Default Ports

| Service | Port |
|---|---|
| App (Next.js + Express) | 3000 |
| MySQL | 3306 |

> The port can be changed by setting `PORT=XXXX` in your `.env`.
