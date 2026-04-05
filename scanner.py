import cv2
from pyzbar.pyzbar import decode, ZBarSymbol
import asyncio
import aiohttp
import threading
import time

# 🔔 BUZZER
from gpiozero import Buzzer
from time import sleep

buzzer = Buzzer(17)

def beep():
    def _beep():
        buzzer.on()
        sleep(0.08)
        buzzer.off()
    threading.Thread(target=_beep, daemon=True).start()


# 🌐 API (CHANGE THIS TO YOUR LAPTOP IP)
API_URL = "http://10.91.177.100:8000/api/v1/scan/"

# 🧠 Shared Frame
frame = None
lock = threading.Lock()

last_scan = None
last_time = 0
SCAN_DELAY = 2


# 🎥 AUTO CAMERA DETECTION (FIXES YOUR ERROR)
def get_camera():
    for i in range(3):
        cap = cv2.VideoCapture(i, cv2.CAP_V4L2)
        if cap.isOpened():
            print(f"✅ Camera found at index {i}")
            return cap
    raise Exception("❌ No camera found")


# 🎥 CAMERA THREAD
def camera_thread():
    global frame

    cap = get_camera()

    cap.set(3, 640)
    cap.set(4, 480)

    time.sleep(2)  # camera warm-up

    while True:
        ret, img = cap.read()

        if not ret:
            print("⚠ Frame read failed, retrying...")
            time.sleep(0.1)
            continue

        with lock:
            frame = img


# 🌐 API CALL
async def send_to_server(session, sku):
    try:
        async with session.post(API_URL, json={"sku": sku}) as res:
            if res.status == 200:
                print("✔ Sent:", sku)
                beep()
            else:
                print(f"❌ API Error {res.status}")
    except Exception as e:
        print("⚠ Network error:", e)


# 🔍 MAIN LOOP
async def main_loop():
    global frame, last_scan, last_time

    async with aiohttp.ClientSession() as session:
        while True:
            await asyncio.sleep(0.01)

            with lock:
                if frame is None:
                    continue
                img = frame.copy()

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # ROI (center)
            h, w = gray.shape
            roi = gray[h//3:2*h//3, w//3:2*w//3]

            barcodes = decode(
                roi,
                symbols=[ZBarSymbol.CODE128, ZBarSymbol.EAN13, ZBarSymbol.QRCODE]
            )

            for barcode in barcodes:
                sku = barcode.data.decode("utf-8")
                now = time.time()

                if sku == last_scan and (now - last_time) < SCAN_DELAY:
                    continue

                last_scan = sku
                last_time = now

                print("Scanned:", sku)

                asyncio.create_task(send_to_server(session, sku))

                # Draw box (adjust ROI offset)
                x, y, w_box, h_box = barcode.rect
                x += w//3
                y += h//3

                cv2.rectangle(img, (x, y), (x+w_box, y+h_box), (0,255,0), 2)
                cv2.putText(img, sku, (x, y-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 2)

            cv2.imshow("Scanner", img)

            if cv2.waitKey(1) & 0xFF == 27:
                break

    cv2.destroyAllWindows()


# ▶ START
threading.Thread(target=camera_thread, daemon=True).start()
asyncio.run(main_loop())