import cv2
from pyzbar.pyzbar import decode
import asyncio
import aiohttp
import threading
import time

API_URL = "http://YOUR_LAPTOP_IP:8000/api/scan"

frame = None
lock = threading.Lock()

last_scan = None
last_time = 0
SCAN_DELAY = 2


# 🎥 Camera thread (smooth preview)
def camera_thread():
    global frame
    cap = cv2.VideoCapture(0)

    cap.set(3, 640)
    cap.set(4, 480)

    while True:
        ret, img = cap.read()
        if ret:
            with lock:
                frame = img


# 🌐 Async API call (non-blocking)
async def send_to_server(session, sku):
    try:
        async with session.post(API_URL, json={"sku": sku}) as res:
            if res.status == 200:
                print("✔ Sent:", sku)
            else:
                print("❌ Server error:", res.status)
    except:
        print("⚠ Network error")


# 🔍 Main loop (scan + display)
async def main_loop():
    global frame, last_scan, last_time

    async with aiohttp.ClientSession() as session:
        while True:
            await asyncio.sleep(0.01)

            with lock:
                if frame is None:
                    continue
                img = frame.copy()

            img = cv2.resize(img, (640, 480))

            barcodes = decode(img)

            for barcode in barcodes:
                sku = barcode.data.decode("utf-8")
                now = time.time()

                # 🔁 Prevent duplicate scans
                if sku == last_scan and (now - last_time) < SCAN_DELAY:
                    continue

                last_scan = sku
                last_time = now

                print("Scanned:", sku)

                # 🔥 send async (no delay)
                asyncio.create_task(send_to_server(session, sku))

                # 🔊 beep
                print("\a")

                # draw box only (no UI)
                x, y, w, h = barcode.rect
                cv2.rectangle(img, (x,y), (x+w,y+h), (0,255,0), 2)

            # 🎥 display only camera
            cv2.imshow("Scanner Camera", img)

            if cv2.waitKey(1) & 0xFF == 27:
                break

    cv2.destroyAllWindows()


# ▶️ Start system
threading.Thread(target=camera_thread, daemon=True).start()
asyncio.run(main_loop())