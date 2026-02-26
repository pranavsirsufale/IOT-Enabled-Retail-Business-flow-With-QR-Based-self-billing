# IoT-Enabled Retail Business Flow with QR-Based Self Billing

![Project](https://img.shields.io/badge/Project-IoT%20Smart%20Store-blue)
![Backend](https://img.shields.io/badge/Backend-Django-green)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Database](https://img.shields.io/badge/Database-PostgreSQL-orange)
![License](https://img.shields.io/badge/License-Academic-lightgrey)

---

## Smart Retail Self-Billing System

An **IoT-based Smart Retail Billing System** that enables customers to scan product QR codes and generate bills automatically without waiting at billing counters.

This project demonstrates how **IoT technology + QR codes + Web applications** can be combined to create a **modern automated retail store system.**

The system reduces billing time, eliminates queues, and improves retail efficiency.

---

## Key Features

✔ QR Code Based Product Scanning  
✔ Automatic Product Detection  
✔ Smart Cart Management  
✔ Automatic Bill Generation  
✔ Digital Receipt  
✔ Payment Mode Integration  
✔ Real-Time Database Updates  
✔ Self Checkout System

---

## Objectives

- Reduce waiting time at billing counters
- Enable automatic self-billing
- Improve shopping experience
- Maintain product database
- Automate billing system
- Demonstrate IoT-based retail automation

---

## System Working

### Step 1 – QR Code Scan
Each product contains a unique QR code.

### Step 2 – Product Identification
The QR code is scanned using a camera or IoT device.

### Step 3 – Database Matching
Product ID is matched with the database.

### Step 4 – Cart Update
Product is automatically added to cart.

### Step 5 – Payment
User selects payment mode.

### Step 6 – Bill Generation
Digital bill is generated instantly.

---

## System Architecture

Frontend → Backend API → Database

React → Django REST API → PostgreSQL

QR Scanner → Product API → Cart → Payment → Bill

---

## Technology Stack

### Frontend

- React.js
- Tailwind CSS

### Backend

- Django
- Django REST Framework

### Database

- PostgreSQL / MySQL

### IoT Components

- QR Code Scanner
- Camera Module

---

## Project Modules

### User Module

- Login
- Scan QR Code
- Add to Cart
- View Cart
- Payment

### Admin Module

- Add Products
- Manage Categories
- View Products
- Manage Inventory

---

## Backend APIs

### Product APIs

GET /api/v1/product/

POST /api/v1/product/add/

---

### Cart APIs

POST /api/v1/cart/add/

GET /api/v1/cart/

POST /api/v1/cart/save/

---

### Payment APIs

POST /api/v1/payment/create/

POST /api/v1/payment/verify/

---

## Database Structure

### Product Table

- Product ID
- Product Name
- Price
- Category
- SubCategory
- QR Code

### Cart Table

- User
- Product
- Quantity
- Total

### Payment Table

- User
- Amount
- Payment Mode
- Status

---

## Installation Guide

### Clone Repository

```
git clone https://github.com/your-username/IOT-Enabled-Retail-Business-Flow-With-QR-Based-self-billing.git
```

---

### Backend Setup

```
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

### Frontend Setup

```
npm install
npm start
```

---

## Project Flow

Scan QR → Add Product → Cart → Payment → Bill Generation

---

## Advantages

- Faster Billing
- No Waiting Lines
- Easy to Use
- Accurate Billing
- Automated Process

---

## Future Scope

- Mobile Application
- RFID Integration
- AI Product Recommendation
- Cloud Deployment

---

## Project Abstract

This project presents an **IoT-enabled smart retail billing system** using QR code technology. Customers scan product QR codes to perform self-billing. Product information is automatically retrieved from the database and the total bill is generated instantly.

The system reduces manual billing work and improves efficiency in retail stores. The integration of IoT devices with web applications enables a fast and reliable smart shopping experience.

---

## Author

Student Final Year Project

IoT Smart Retail System

