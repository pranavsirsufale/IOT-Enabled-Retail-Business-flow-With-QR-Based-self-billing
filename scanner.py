import cv2
from pyzbar.pyzbar import decode
import asyncio
import aiohttp
import time

API_URL = "http://10.98.159.100:8000/api/v1/scan/"

last_scan = None
last_time = 0
SCAN_DELAY = 2


# 🌐 Async API
async def send_to_server(session, sku):
    try:
        async with session.post(API_URL, json={"sku": sku}) as res:
            if res.status == 200:
                print("✔ Sent:", sku)
            else:
                print(f"❌ Error {res.status}")
    except Exception as e:
        print(f"⚠ Network error: {e}")


async def main():
    global last_scan, last_time

    # ✅ FIX: use index 0 (most cases)
    cap = cv2.VideoCapture(0, cv2.CAP_V4L2)

    # ✅ Reduce lag
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    if not cap.isOpened():
        print("❌ Camera not accessible")
        return

    print("✅ Camera started")

    async with aiohttp.ClientSession() as session:

        while True:
            ret, frame = cap.read()
            if not ret:
                print("Camera error")
                break

            # 🔥 Resize small for speed
            frame = cv2.resize(frame, (480, 360))

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            # 🔥 Decode only every 2 frames (reduce lag)
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
                cv2.rectangle(frame, (x,y), (x+w,y+h), (0,255,0), 2)

                print("\a")

            cv2.imshow("Scanner", frame)

            # ✅ Proper exit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    # ✅ VERY IMPORTANT (fix camera lock issue)
    cap.release()
    cv2.destroyAllWindows()


asyncio.run(main())
