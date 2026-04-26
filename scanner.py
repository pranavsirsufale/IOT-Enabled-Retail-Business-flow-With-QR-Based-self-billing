import cv2
from pyzbar.pyzbar import decode
import asyncio
import aiohttp
import threading
import time

API_URL = "http://10.98.159.146:8000/api/v1/scan/"

frame = None
lock = threading.Lock()
running = True   # ✅ control flag

last_scan = None
last_time = 0
SCAN_DELAY = 2


# 🎥 Camera Thread
def camera_thread():
    global frame, running

    cap = cv2.VideoCapture(0)   # 🔥 FIX: use correct index

    cap.set(3, 640)
    cap.set(4, 480)

    if not cap.isOpened():
        print("❌ Camera not accessible")
        return

    print("✅ Camera started (index 0)")

    while running:
        ret, img = cap.read()
        if ret:
            with lock:
                frame = img

    cap.release()   # ✅ release camera when stopping


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
    global frame, last_scan, last_time, running

    async with aiohttp.ClientSession() as session:
        while running:
            await asyncio.sleep(0.01)

            with lock:
                if frame is None:
                    continue
                img = frame.copy()

            img = cv2.resize(img, (640, 480))
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            barcodes = decode(gray)

            for barcode in barcodes:
                sku = barcode.data.decode("utf-8")
                now = time.time()

                if sku == last_scan and (now - last_time) < SCAN_DELAY:
                    continue

                last_scan = sku
                last_time = now

                print("Scanned:", sku)

                asyncio.create_task(send_to_server(session, sku))

                x, y, w, h = barcode.rect
                cv2.rectangle(img, (x, y), (x+w, y+h), (0,255,0), 2)

                print("\a")

            cv2.imshow("Scanner", img)

            key = cv2.waitKey(1) & 0xFF

            # ✅ Press 'q' to quit
            if key == ord('q'):
                print("🛑 Stopping program...")
                running = False
                break

    cv2.destroyAllWindows()


# ▶ Start threads
threading.Thread(target=camera_thread, daemon=True).start()
asyncio.run(main_loop())
