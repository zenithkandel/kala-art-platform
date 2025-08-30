# 🎨 Kala Art Platform

A modern, lightweight art marketplace and gallery built with Node.js, Express, EJS, and MySQL.  
Browse curated artworks, learn about artists, and manage the platform with a secure admin dashboard.

![Hero](public/img/placeholder-art.jpg)

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white">
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white">
  <img alt="EJS" src="https://img.shields.io/badge/View-EJS-8A2BE2">
  <img alt="License" src="https://img.shields.io/badge/License-Private-blue">
</p>

---

## ✨ Features

- 🏠 Public site with home, artists, profiles, artwork details, cart, and about
- 🧩 EJS templating with shared layouts and partials
- 🗄️ MySQL schema for admins, artists, arts, orders, images, and analytics
- 📈 Daily page-views tracking
- 🔐 Admin authentication with session + login rate limiting
- 🛠️ Clean code structure, ready for dashboard modules (stats, approvals, CRUD, orders)

---

## 📁 Project Structure

```
art/
├─ .env.example
├─ init-db.bat
├─ package.json
├─ server.js
├─ setup-admin.js
├─ public/
│  ├─ css/ (base.css, animations.css)
│  ├─ js/ (ui.js, filters.js, theme.js, particles.js, etc.)
│  └─ img/ (placeholder-art.jpg, placeholder-avatar.png)
├─ scripts/
│  ├─ init-db.js         # Initializes DB from sql/schema.sql
│  └─ simple-init.js     # [removed/archived if present]
├─ sql/
│  └─ schema.sql         # Database and tables definition + seed
├─ src/
│  ├─ database/
│  │  ├─ connection.js   # MySQL pool (mysql2/promise)
│  │  └─ service.js      # Data access helpers (admins, artists, arts, orders, etc.)
│  ├─ middleware/
│  │  └─ adminAuth.js    # requireAdminAuth, addAdminToLocals, rateLimitLogin
│  └─ routes/
│     ├─ admin.js        # Admin login/logout + dashboard route
│     └─ client.js       # Public routes
└─ views/
   ├─ layouts/main.ejs
   ├─ admin/ (layout.ejs, login.ejs, dashboard.ejs)
   ├─ client/ (home.ejs, artists.ejs, art_detail.ejs, etc.)
   ├─ partials/ (head.ejs, navbar.ejs, footer.ejs, admin-sidebar.ejs)
   └─ misc/ (404.ejs, error.ejs)
```

Note: Legacy files and mismatched DB services were removed to keep the codebase consistent with `sql/schema.sql`.

---

## 🧰 Tech Stack

| Layer      | Choice                           |
| ---------- | -------------------------------- |
| Runtime    | Node.js 18+                      |
| Server     | Express 5.x                      |
| Views      | EJS + layouts/partials           |
| DB         | MySQL 8.x (mysql2/promise)       |
| Security   | helmet, express-session, limiter |
| Logs/UX    | morgan, compression, CORS        |

---

## 🚀 Quick Start (Windows)

1) Clone and install
```powershell
cd c:\xampp\htdocs\codes
# Place project under: c:\xampp\htdocs\codes\art
cd .\art
npm install
```

2) Configure environment
```ini
# .env (copy from .env.example)
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=kala-art-platform

# Server
PORT=3000
SESSION_SECRET=replace-with-a-long-random-string
NODE_ENV=development
```

3) Initialize the database
```powershell
# Option A: npm script (if present)
npm run init-db

# Option B: direct node script
node .\scripts\init-db.js

# Option C: batch helper
.\init-db.bat
```

4) Start the server
```powershell
# Development
node .\server.js

# or (if configured)
npm run dev
```

- App: http://localhost:3000
- Admin: http://localhost:3000/admin/login  
  Default admin: username `admin` / password `admin123` (seeded by schema.sql)

---

## ⚙️ Configuration

- Environment: `.env` controls DB connection, session secret, and port.
- Sessions: Signed cookie; logout clears `connect.sid`.
- Rate limiting: Login route is rate-limited to reduce brute-force attempts.

---

## 🗃️ Database

- Schema lives at `sql/schema.sql` and includes:
  - `admins`, `artists`, `artist_applications`
  - `arts`, `art_images`
  - `orders`, `order_items`
  - `contact_messages`, `page_views_daily`
- Scripts:
  - `scripts/init-db.js` applies the schema and seeds initial data.
  - `setup-admin.js` can be extended for custom admin bootstrap tasks.

---

## 🧭 Routes Overview

- Public
  - `GET /` home
  - `GET /about`
  - `GET /artists` and `GET /artists/:id`
  - `GET /art/:id`
  - `GET /cart`
  - `POST /register` (artist application)
- Admin
  - `GET /admin/login` (render)
  - `POST /admin/login` (verify via password_hash)
  - `POST /admin/logout`
  - `GET /admin` (dashboard – protected)

---

## 🧱 Architecture (high-level)

```
Browser ──> Express (routes/client.js) ──> dbService (src/database/service.js) ──> MySQL
        └─> Express (routes/admin.js) ──[auth + rate limit]─> dbService ──> MySQL
Views: EJS layouts + partials (views/layouts, views/partials)
Static: public/css, public/js, public/img
```

---

## 🧪 Development Tips

- Use VS Code workspace search to find calls into `dbService` when adding features.
- Keep all DB access inside `src/database/service.js` for a single source of truth.
- Add new admin pages under `views/admin/` and protect routes with `requireAdminAuth`.

---

## 🗺️ Roadmap

- Admin Dashboard widgets: KPIs (artists, arts, orders, page views)
- Artist application review: approve/reject, convert to `artists`
- Arts CRUD with image upload (multer + sharp), primary image selection
- Orders management and status workflow
- Contact messages inbox with read/archive

---

## 🔒 Security Notes

- Use a long, random `SESSION_SECRET`.
- Change the default admin password after first login.
- Consider HTTPS and secure cookies in production.

---

## 🙌 Acknowledgements

- Node.js, Express, EJS, MySQL, and the open-source community ❤

---
```// filepath: c:\xampp\htdocs\codes\art\README.md
# 🎨 Kala Art Platform

A modern, lightweight art marketplace and gallery built with Node.js, Express, EJS, and MySQL.  
Browse curated artworks, learn about artists, and manage the platform with a secure admin dashboard.

![Hero](public/img/placeholder-art.jpg)

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white">
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white">
  <img alt="EJS" src="https://img.shields.io/badge/View-EJS-8A2BE2">
  <img alt="License" src="https://img.shields.io/badge/License-Private-blue">
</p>

---

## ✨ Features

- 🏠 Public site with home, artists, profiles, artwork details, cart, and about
- 🧩 EJS templating with shared layouts and partials
- 🗄️ MySQL schema for admins, artists, arts, orders, images, and analytics
- 📈 Daily page-views tracking
- 🔐 Admin authentication with session + login rate limiting
- 🛠️ Clean code structure, ready for dashboard modules (stats, approvals, CRUD, orders)

---

## 📁 Project Structure

```
art/
├─ .env.example
├─ init-db.bat
├─ package.json
├─ server.js
├─ setup-admin.js
├─ public/
│  ├─ css/ (base.css, animations.css)
│  ├─ js/ (ui.js, filters.js, theme.js, particles.js, etc.)
│  └─ img/ (placeholder-art.jpg, placeholder-avatar.png)
├─ scripts/
│  ├─ init-db.js         # Initializes DB from sql/schema.sql
│  └─ simple-init.js     # [removed/archived if present]
├─ sql/
│  └─ schema.sql         # Database and tables definition + seed
├─ src/
│  ├─ database/
│  │  ├─ connection.js   # MySQL pool (mysql2/promise)
│  │  └─ service.js      # Data access helpers (admins, artists, arts, orders, etc.)
│  ├─ middleware/
│  │  └─ adminAuth.js    # requireAdminAuth, addAdminToLocals, rateLimitLogin
│  └─ routes/
│     ├─ admin.js        # Admin login/logout + dashboard route
│     └─ client.js       # Public routes
└─ views/
   ├─ layouts/main.ejs
   ├─ admin/ (layout.ejs, login.ejs, dashboard.ejs)
   ├─ client/ (home.ejs, artists.ejs, art_detail.ejs, etc.)
   ├─ partials/ (head.ejs, navbar.ejs, footer.ejs, admin-sidebar.ejs)
   └─ misc/ (404.ejs, error.ejs)
```

Note: Legacy files and mismatched DB services were removed to keep the codebase consistent with `sql/schema.sql`.

---

## 🧰 Tech Stack

| Layer      | Choice                           |
| ---------- | -------------------------------- |
| Runtime    | Node.js 18+                      |
| Server     | Express 5.x                      |
| Views      | EJS + layouts/partials           |
| DB         | MySQL 8.x (mysql2/promise)       |
| Security   | helmet, express-session, limiter |
| Logs/UX    | morgan, compression, CORS        |

---

## 🚀 Quick Start (Windows)

1) Clone and install
```powershell
cd c:\xampp\htdocs\codes
# Place project under: c:\xampp\htdocs\codes\art
cd .\art
npm install
```

2) Configure environment
```ini
# .env (copy from .env.example)
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=kala-art-platform

# Server
PORT=3000
SESSION_SECRET=replace-with-a-long-random-string
NODE_ENV=development
```

3) Initialize the database
```powershell
# Option A: npm script (if present)
npm run init-db

# Option B: direct node script
node .\scripts\init-db.js

# Option C: batch helper
.\init-db.bat
```

4) Start the server
```powershell
# Development
node .\server.js

# or (if configured)
npm run dev
```

- App: http://localhost:3000
- Admin: http://localhost:3000/admin/login  
  Default admin: username `admin` / password `admin123` (seeded by schema.sql)

---

## ⚙️ Configuration

- Environment: `.env` controls DB connection, session secret, and port.
- Sessions: Signed cookie; logout clears `connect.sid`.
- Rate limiting: Login route is rate-limited to reduce brute-force attempts.

---

## 🗃️ Database

- Schema lives at `sql/schema.sql` and includes:
  - `admins`, `artists`, `artist_applications`
  - `arts`, `art_images`
  - `orders`, `order_items`
  - `contact_messages`, `page_views_daily`
- Scripts:
  - `scripts/init-db.js` applies the schema and seeds initial data.
  - `setup-admin.js` can be extended for custom admin bootstrap tasks.

---

## 🧭 Routes Overview

- Public
  - `GET /` home
  - `GET /about`
  - `GET /artists` and `GET /artists/:id`
  - `GET /art/:id`
  - `GET /cart`
  - `POST /register` (artist application)
- Admin
  - `GET /admin/login` (render)
  - `POST /admin/login` (verify via password_hash)
  - `POST /admin/logout`
  - `GET /admin` (dashboard – protected)

---

## 🧱 Architecture (high-level)

```
Browser ──> Express (routes/client.js) ──> dbService (src/database/service.js) ──> MySQL
        └─> Express (routes/admin.js) ──[auth + rate limit]─> dbService ──> MySQL
Views: EJS layouts + partials (views/layouts, views/partials)
Static: public/css, public/js, public/img
```

---

## 🧪 Development Tips

- Use VS Code workspace search to find calls into `dbService` when adding features.
- Keep all DB access inside `src/database/service.js` for a single source of truth.
- Add new admin pages under `views/admin/` and protect routes with `requireAdminAuth`.

---

## 🗺️ Roadmap

- Admin Dashboard widgets: KPIs (artists, arts, orders, page views)
- Artist application review: approve/reject, convert to `artists`
- Arts CRUD with image upload (multer + sharp), primary image selection
- Orders management and status workflow
- Contact messages inbox with read/archive

---

## 🔒 Security Notes

- Use a long, random `SESSION_SECRET`.
- Change the default admin password after first login.
- Consider HTTPS and secure cookies in production.

---

## 🙌 Acknowledgements

- Node.js, Express, EJS, MySQL, and the open-source community ❤

---