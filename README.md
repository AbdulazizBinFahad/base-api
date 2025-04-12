# Base API - TypeScript Express Starter

A clean and extensible boilerplate for building secure, production-ready REST APIs using **TypeScript**, **Express**, and **MongoDB**.

This project is designed to **save time** for any developer who wants to quickly start building an API. It includes all the core functionality you'll likely need in most backend projects.

---

## ✨ Features

- ✅ User registration with email verification  
- ✅ JWT-based authentication  
- ✅ Forgot password and reset password flow  
- ✅ Input validation (email, password strength, username format)  
- ✅ Swagger API documentation  
- ✅ MongoDB integration with Mongoose  
- ✅ Organized folder structure (controllers, models, routes, config)  
- ✅ Built with TypeScript  

---

## 📦 Installation

```bash
git clone https://github.com/AbdulazizBinFahad/base-api.git
cd base-api
npm install
```

---

## 📦 Installation with Docker

> Recommended for production and isolated environments.

1. Clone the project:

```bash
git clone https://github.com/AbdulazizBinFahad/base-api.git
cd base-api
```

2. Create your `.env` file manually:

```bash
nano .env
```

Paste the following content:

```env
PORT=5000
BASE_URL=http://localhost
MONGO_URI=mongodb://mongo:27017/base-api
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
EMAIL_USER=you@example.com
EMAIL_PASS=your_email_password
SMTP_HOST=smtp.example.com
SMTP_PORT=587
COMPANY_NAME=YourCompanyName
```

3. Run the app using Docker:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

This will:
- Build the app from Dockerfile
- Start the Node.js API
- Start MongoDB container
- Automatically link both in Docker network

---

## 📄 API Documentation

Visit the Swagger UI after running the project:

```
http://localhost:5000/api-docs
```