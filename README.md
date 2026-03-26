# IoT-Enabled Retail Business Flow With QR-Based Self-Billing

![Project](https://img.shields.io/badge/Project-IoT%20Smart%20Store-blue)
![Backend](https://img.shields.io/badge/Backend-Django_Channels-green)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Computer Vision](https://img.shields.io/badge/IoT_Scanner-OpenCV_%2B_PyZbar-orange)

---
This project is a modern, IoT-based Smart Retail Billing System designed to streamline the in-store shopping experience. It features a standalone hardware-emulating IoT scanner script that instantly recognizes 1D barcodes and 2D QR codes via computer vision, pushing real-time updates through WebSockets to a React frontend.

The system integrates a React frontend, an asynchronous Django Channels backend, and a Python-based IoT scanning module to provide a fast, seamless flow from product scanning to final payment.

## Key Features

*   **Hardware IoT Scanning:** Uses OpenCV and `pyzbar` to capture and decode high-resolution images mapping both 1D Barcodes and 2D QR codes using advanced binary thresholding.
*   **Real-Time WebSocket Updates:** Replaces slow HTTP polling with Django Channels and WebSockets. As soon as an item is scanned, the backend pushes an update directly to the React frontend cart.
*   **Smart Cart Management:** View, update quantities, and remove items from the cart instantly in real-time.
*   **Self-Checkout System:** Process transactions and generate a bill without cashier assistance.
*   **Role-Based Access Control:** Differentiated access for Admins, Store Managers, and Staff Members.
*   **Product & Inventory Management:** A comprehensive interface for administrators to add, edit, and manage products and categories.

## Technology Stack

| Component | Technology                                          |
| :-------- | :-------------------------------------------------- |
| **Frontend**  | React, Vite, Tailwind CSS, WebSockets               |
| **Backend**   | Django, Django REST Framework, Django Channels, Daphne |
| **Database**  | MySQL / SQLite (Development)                        |
| **IoT Scanner** | Python, OpenCV (`cv2`), `pyzbar`, Webcams         |

## System Architecture

The application operates using an event-driven architecture, enabling cross-device communication between the hardware scanner and the cashier/user interface.

1.  **Hardware Scanner (`test.py` or `scanner.py`):** Acts as the IoT endpoint. It operates a high-resolution (1280x720) loop on an attached camera, hunting for known barcodes/QRs. Upon a successful decode, it posts to the backend `ScanProductView`.
2.  **Backend (Django Channels):** Using an ASGI server (`daphne`), Django processes the scan payload, updates the database cart, and immediately uses `async_to_sync` to broadcast an update signal down the `cart_updates` layer.
3.  **Frontend (React):** Connects to `ws://localhost:8000/ws/cart/`. As soon as it catches the payload `{"action": "update"}`, it queries the latest cart data efficiently. 

## API Endpoints & WebSockets

### WebSockets
*   `ws/cart/` : The channel users connect to for live cart state updates.

### REST API
| Endpoint                    | Method | Description                                                |
| --------------------------- | ------ | ---------------------------------------------------------- |
| `/api/v1/scan/`             | POST   | IoT Hardware target URL for registering scanned barcodes.  |
| `/api/v1/login/`            | POST   | Authenticate a user and create a session.                  |
| `/api/v1/logout/`           | POST   | Log the current user out.                                  |
| `/api/v1/cart/`             | GET/POST| Retrieve or save a shopping cart for the user session.    |
| `/api/v1/product/`          | GET/POST| List all products or create a new one.                     |
| `/api/v1/transactions/`     | POST   | Finalize the cart, create a transaction, and update stock. |

*(Many other standard endpoints exist for administrative CRUD operations).*

## Getting Started

To run this project locally, follow the steps below.

### Prerequisites

*   Python 3.8+ (including python3-opencv libraries)
*   Node.js 20.x or higher
*   A connected Webcam (for the IoT scanner script).

### Backend Setup (ASGI/Daphne)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pranavsirsufale/IOT-Enabled-Retail-Business-flow-With-QR-Based-self-billing.git
    cd IOT-Enabled-Retail-Business-flow-With-QR-Based-self-billing
    ```

2.  **Enter the virtual environment framework and install dependencies:**
    *(Assuming your environment relies on the included `sys` python environment)*
    ```bash
    ./sys/bin/pip install -r smartStore/requirements.txt
    ```

3.  **Apply migrations:**
    ```bash
    ./sys/bin/python smartStore/manage.py migrate
    ```

4.  **Run the ASGI server (Daphne):**
    Because we utilize WebSockets, we use an ASGI server instead of standard `runserver`.
    ```bash
    cd smartStore
    daphne -b 127.0.0.1 -p 8000 smartStore.asgi:application
    ```
    *(Alternatively, standard `manage.py runserver` works if Daphne is in `INSTALLED_APPS`)* 

### Frontend Setup

1.  **Install dependencies:**
    ```bash
    cd frontend
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`. 

### Hardware Scanner Setup

Once your Django server is running securely on port 8000, start the camera script in an entirely separate terminal window.

1.  **Run the vision script:**
    ```bash
    ./sys/bin/python test.py
    ```
2.  Hold up a barcode or QR code to your webcam. As soon as the green bounding box appears, the item is pushed over the network into your live React Cart session!

## Project Flow
1.  **Login:** A customer or staff logs into the system on the React interface.
2.  **Activate Cart:** Users navigate to their Shopping Cart page, which initializes the WebSocket connection.
3.  **Physical Scanning:** The hardware webcam picks up on a product. You will see a `POST 200 OK` in your Terminal.
4.  **Real-time Update:** The browser receives the `cart_update` broadcast hook and refreshes the cart instantly, rendering the new item with its pricing logic applied.
5.  **Checkout:** The user finishes their transaction via the web interface to print a digital receipt.
