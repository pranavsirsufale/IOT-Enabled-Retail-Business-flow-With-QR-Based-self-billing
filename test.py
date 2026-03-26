import cv2
from pyzbar.pyzbar import decode, ZBarSymbol
import asyncio
import aiohttp
import threading
import time

API_URL = "http://localhost:8000/api/v1/scan/"

frame = None
lock = threading.Lock()

last_scan = None
last_time = 0
SCAN_DELAY = 2


# 🎥 Camera Thread (INDEX FIX)
def camera_thread():
    global frame

    cap = cv2.VideoCapture(1)   # ✅ use index NOT /dev/video1

    # Increase camera resolution for better 1D barcode recognition
    cap.set(3, 1280)
    cap.set(4, 720)

    if not cap.isOpened():
        print("❌ Camera not accessible")
        return

    print("✅ Camera started (index 1)")

    while True:
        ret, img = cap.read()
        if ret:
            with lock:
                frame = img


# 🌐 Async API
async def send_to_server(session, sku):
    try:
        async with session.post(API_URL, json={"sku": sku}) as res:
            if res.status == 200:
                print("✔ Sent:", sku)
                print(await res.json())
            else:
                print(f"❌ Error {res.status}: {await res.text()}")
    except Exception as e:
        print(f"⚠ Network error: {e}")


# 🔍 Main Loop
async def main_loop():
    global frame, last_scan, last_time

    async with aiohttp.ClientSession() as session:
        while True:
            await asyncio.sleep(0.01)

            with lock:
                if frame is None:
                    continue
                img = frame.copy()

            # For 1D Barcodes, a higher resolution image is much better.
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply some basic thresholding to sharpen the barcode contrast
            _, thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

            # Decode both the regular grayscale and the thresholded version
            barcodes = decode(gray)
            if not barcodes:
                barcodes = decode(thresh)

            for barcode in barcodes:
                sku = barcode.data.decode("utf-8")
                barcode_type = barcode.type
                now = time.time()

                if sku == last_scan and (now - last_time) < SCAN_DELAY:
                    continue

                last_scan = sku
                last_time = now

                print(f"Scanned [{barcode_type}]: {sku}")

                asyncio.create_task(send_to_server(session, sku))

                # Draw box
                x, y, w, h = barcode.rect
                
                # Use different colors for QR vs Barcode
                color = (0, 255, 0) if barcode_type == 'QRCODE' else (255, 0, 0)
                cv2.rectangle(img, (x,y), (x+w,y+h), color, 2)
                cv2.putText(img, f"{barcode_type}: {sku}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                print("\a")

            cv2.imshow("Scanner", img)

            if cv2.waitKey(1) & 0xFF == 27:
                break

    cv2.destroyAllWindows()


threading.Thread(target=camera_thread, daemon=True).start()
asyncio.run(main_loop())