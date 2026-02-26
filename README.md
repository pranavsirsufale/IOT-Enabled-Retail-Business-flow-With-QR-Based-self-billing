# IoT-Enabled Retail Business Flow With QR-Based Self-Billing
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/pranavsirsufale/IOT-Enabled-Retail-Business-flow-With-QR-Based-self-billing)

This project is a modern, IoT-based Smart Retail Billing System designed to streamline the in-store shopping experience. It allows customers to scan product QR codes using a web application, manage a digital cart, and complete a self-checkout process, effectively eliminating the need to wait in long billing queues.

The system integrates a React frontend with a Django backend to provide a seamless flow from product scanning to final payment and receipt generation.

## Key Features

*   **QR Code Product Scanning:** Add items to a digital cart by scanning their unique QR codes.
*   **Smart Cart Management:** View, update quantities, and remove items from the cart in real-time.
*   **Self-Checkout System:** Process transactions and generate a bill without cashier assistance.
*   **Digital Receipt Generation:** A printable receipt is generated upon successful payment.
*   **Role-Based Access Control:** Differentiated access for Admins, Store Managers, and Staff Members.
*   **Product & Inventory Management:** A comprehensive interface for administrators to add, edit, and manage products and categories.
*   **Staff Management:** Admins can create and manage staff accounts and their roles.

## Technology Stack

| Component | Technology                                          |
| :-------- | :-------------------------------------------------- |
| **Frontend**  | React, Vite, Tailwind CSS                           |
| **Backend**   | Django, Django REST Framework                     |
| **Database**  | MySQL (Configured), PostgreSQL (Option), SQLite (Dev)     |
| **Authentication** | Django Sessions, CSRF Protection                |
| **IoT**       | Browser-based QR/Barcode Scanner (`html5-qrcode`) |

## System Architecture

The application is built on a client-server architecture:

1.  **Frontend (React):** A single-page application built with React and Vite. It provides the user interface for customers and staff to interact with the system. It communicates with the backend via a REST API. The `vite.config.js` is configured to proxy `/api` requests to the Django backend server during development.

2.  **Backend (Django):** A RESTful API built with Django and the Django REST Framework. It handles business logic, user authentication, database interactions, and serving product data.

3.  **Database:** Manages all persistent data, including users, staff roles, products, categories, and transaction history. The system is configured to work with MySQL.

## API Endpoints

The core functionalities are exposed through the following REST API endpoints, managed by Django REST Framework's `DefaultRouter`.

| Endpoint                    | Method | Description                                                |
| --------------------------- | ------ | ---------------------------------------------------------- |
| `/api/v1/login/`            | POST   | Authenticate a user and create a session.                  |
| `/api/v1/logout/`           | POST   | Log the current user out.                                  |
| `/api/v1/me/`               | GET    | Get details of the currently authenticated user.           |
| `/api/v1/product/`          | GET/POST| List all products or create a new one.                     |
| `/api/v1/product/<id>/`     | GET/PUT/DELETE | Retrieve, update, or delete a specific product.          |
| `/api/v1/product/<id>/qr/`  | GET    | Generate and return a QR code image for a product's SKU.   |
| `/api/v1/category/`         | GET/POST| List all categories or create a new one.                   |
| `/api/v1/sub-category/`     | GET/POST| List all sub-categories or create a new one.               |
| `/api/v1/staff/`            | GET/POST| List all staff members or create a new one.                |
| `/api/v1/staff-types/`      | GET/POST| List all staff roles or create a new one.                  |
| `/api/v1/cart/`             | GET/POST| Retrieve or save a draft shopping cart to the user's session. |
| `/api/v1/transactions/`     | POST   | Finalize the cart, create a transaction, and update stock. |
| `/api/v1/orders/`           | GET    | Retrieve the order history for the authenticated user.     |

## Roles and Permissions

The system defines several user roles with distinct permissions to ensure secure access to its features:

*   **Admin:** Has full access to all features, including product management, category management, and staff management.
*   **Store Manager:** Can manage products, categories, and process transactions but cannot manage staff accounts.
*   **Staff Member:** Has read-only access to products and can use the scanning and checkout features for customers.

## Getting Started

To run this project locally, follow the steps below.

### Prerequisites

*   Python 3.8+
*   Node.js 20.x or higher
*   A running MySQL server instance.

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pranavsirsufale/IOT-Enabled-Retail-Business-flow-With-QR-Based-self-billing.git
    cd IOT-Enabled-Retail-Business-flow-With-QR-Based-self-billing/smartStore
    ```

2.  **Create a virtual environment and install dependencies:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

3.  **Configure the database:**
    Open `smartStore/smartStore/settings.py` and update the `DATABASES` dictionary with your MySQL credentials.
    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': "your_db_name",
            "USER": "your_db_user",
            "PASSWORD": "your_db_password",
            "HOST": "localhost",
            "PORT": "3306"
        }
    }
    ```

4.  **Apply migrations and run the server:**
    ```bash
    python manage.py migrate
    python manage.py runserver
    ```
    The backend will be running at `http://localhost:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory and install dependencies:**
    ```bash
    # From the root project directory
    cd frontend
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The frontend application will be available at `http://localhost:5173`. It is pre-configured to proxy API requests to the backend.

## Project Flow

1.  **Login:** A staff member or admin logs into the system.
2.  **Dashboard:** The user is presented with a dashboard of available actions based on their role.
3.  **Product Management:** Admins can add, view, and edit products and their categories. A unique QR code is generated for each product SKU.
4.  **Scanning:** The user navigates to the "Scan & Bill" page to activate the camera.
5.  **Cart Building:** As product QR codes are scanned, the items are automatically identified and added to the digital cart.
6.  **Checkout:** The user proceeds to the cart to review the items and initiates the checkout process.
7.  **Payment and Receipt:** A payment method is selected, the transaction is finalized, and a printable digital receipt is generated. Product stock is updated automatically.
