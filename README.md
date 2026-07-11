# Jeetendra Prajapati Clay Art Studio Website

A complete, production-ready, full-stack monolithic web application built for **Jeetendra Prajapati Clay Art Studio**, a professional clay sculptor business based in Bhiti Mau, Uttar Pradesh, India.

This website features a luxury artisan theme, a dynamic sculpture portfolio, a consultation booking system with client/admin email notifications, contact inquiries storage, and a secured admin dashboard to manage bookings, messages, and gallery items.

---

## 🛠️ Technology Stack

- **Frontend Pages**: HTML5, EJS Templates (Embedded JavaScript), Vanilla JS (AJAX Fetch client logic)
- **Styling**: Custom Premium CSS (Chocolates, Browns, and Gold palette, fluid animations, custom scrollbars)
- **Backend Server**: Node.js, Express.js
- **Database**: MongoDB (Mongoose schemas)
- **Image Storage**: Cloudinary (cloud media streaming)
- **Email Delivery**: Nodemailer SMTP
- **Authentication**: JWT (JSON Web Tokens) in HTTP-only cookies & bcryptjs password hashing

---

## 📁 Project Structure

```
/murti
├── backend/
│   ├── config/          # DB, Cloudinary, and Nodemailer configs
│   ├── controllers/     # Auth, Gallery, Booking, Inquiry, Dashboard controllers
│   ├── middleware/      # Auth checks, file upload parsing
│   ├── models/          # Mongoose schemas (User, Gallery, Booking, Inquiry)
│   ├── public/          # Static assets served by Express
│   │   ├── css/
│   │   │   └── style.css # Luxury artisan styles & layouts
│   │   └── js/
│   │       └── main.js   # Mobile nav toggle, image previews, AJAX forms
│   ├── routes/          # Express API routes & server EJS Page renders
│   ├── views/           # EJS template engine files
│   │   ├── partials/     # Header (navbar) & Footer components
│   │   ├── home.ejs
│   │   ├── about.ejs
│   │   ├── services.ejs
│   │   ├── gallery.ejs
│   │   ├── book.ejs
│   │   ├── contact.ejs
│   │   ├── admin-login.ejs
│   │   └── admin-dashboard.ejs
│   ├── .env.example     # Environment template
│   ├── package.json     # Backend dependencies
│   ├── seed.js          # DB Seeding script (admin account + sample items)
│   └── server.js        # Main entry point (starts server on port 5000)
├── README.md            # Comprehensive project guide (this file)
└── package.json         # Root scripts orchestrating backend folder commands
```

---

## 💻 Local Setup & Installation

### Prerequisites
1. Installed **Node.js** (v18.0.0 or higher)
2. Installed **MongoDB** (running locally on port 27017 or a MongoDB Atlas URI)

### Step 1: Install Dependencies
From the root directory, run:
```bash
npm run install-deps
```
This will automatically install dependencies in the `backend` folder.

### Step 2: Configure Environment Variables
Create a `.env` file in the `/backend` folder:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/clay_art_studio
JWT_SECRET=your_jwt_secret_minimum_32_chars_long

# Cloudinary Credentials (Get these from your Cloudinary console dashboard)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP Email Configuration (Nodemailer)
# Gmail option: use App Passwords (not your real account password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM_NAME="Jeetendra Prajapati Clay Art Studio"

# Admin Notifications Receiver (Where you get email alerts)
ADMIN_RECEIVER_EMAIL=your_email@gmail.com
```

### Step 3: Seed the Database
Run the seed script to create the initial admin user (`admin` / `jeetendra@clay123`) and load sample gallery items:
```bash
npm run seed
```

### Step 4: Run the Development Server
From the root directory, run:
```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser to view the client website. Visit [http://localhost:5000/admin/login](http://localhost:5000/admin/login) to access the secured Admin Area.

---

## 🚀 Deployment Guide

Since this is now a unified monolithic application, deployment is simplified: you only need to deploy **a single web service** to hosting providers like **Render.com**, **Heroku**, or **DigitalOcean**.

### Deploying to Render.com

1. Sign up on **Render.com** and click **New > Web Service**.
2. Connect your Git repository.
3. Configure the following service settings:
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add all environment variables from `/backend/.env` to the **Environment Variables** section on Render (e.g. `MONGO_URI`, `JWT_SECRET`, Cloudinary keys, and SMTP keys).
5. Click **Deploy**.
