"""Generate landing-page imagery via the OpenAI-compatible image API.

Usage: python -I gen_images.py <out_dir> [name ...]
Key is read from the IMG_API_KEY environment variable.
"""
import base64, io, json, os, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

BASE = "https://jojocode.com/v1/images/generations"
KEY = os.environ["IMG_API_KEY"]
TAIL = " Photorealistic, high detail, natural colour grading. No text, no watermark, no brand logos."

JOBS = {
    "sim-road": ("1536x1024", 1800, "Wide landscape photograph at a cyclist's eye level: an alpine mountain road curving towards snow-capped peaks, a calm lake on the left reflecting bright sunlight with strong sparkling glare on the water, wet asphalt with a bright sheen, low morning sun in the upper right with visible glare, a lone road cyclist in the middle distance, crisp summer morning."),
    "goggle-mirror-dark": ("1536x1024", 1800, "Studio product photograph of a high-wrap prescription sports goggle with a single shield lens, matte black frame, iridescent mirror lens coating shifting from cobalt blue to violet to gold, three-quarter view, on a deep midnight navy background, dramatic rim lighting, glossy reflections on the lens, premium eyewear advertising."),
    "goggle-pop": ("1024x1024", 1200, "Studio product photograph of a wraparound sports goggle with a white frame and an orange mirror shield lens, viewed from the front slightly above, on a flat solid light sky-blue background, hard graphic shadow, clean minimal advertising style."),
    "sport-cycling": ("1536x1024", 1600, "Medium close-up of a road cyclist in a helmet wearing high-wrap sports goggles, riding on a mountain road, morning light, slight motion blur in the background, sharp focus on the face and goggles."),
    "sport-running": ("1536x1024", 1600, "Trail runner wearing lightweight wraparound sport sunglasses, running along a grassy mountain ridge trail at sunrise, athletic, dynamic, sharp focus on runner."),
    "sport-ski": ("1536x1024", 1600, "Skier wearing ski goggles with a mirror lens and a helmet, carving on a bright snowy slope, snow spray, blue sky, sunlight."),
    "sport-outdoor": ("1536x1024", 1600, "Mountaineer wearing wraparound sport goggles on a rocky high-altitude ridge, wind and fine dust, dramatic clouds, rugged terrain."),
    "sport-water": ("1536x1024", 1600, "Angler on a small boat wearing polarized wraparound sport sunglasses, holding a fishing rod, open sea with bright sunlight glare on the water, late afternoon."),
    "sport-precision": ("1536x1024", 1600, "Golfer wearing sleek wraparound sport sunglasses, crouching to read the green before a putt, golf course, soft daylight, shallow depth of field."),
    "factory-lab": ("1536x1024", 1600, "Modern optical prescription lens laboratory with automated freeform surfacing and edging machines in rows, clean white and blue interior, a technician in a lab coat inspecting a lens against the light, industrial precision."),
    "coating": ("1536x1024", 1600, "Close-up inside an industrial high-vacuum optical coating chamber: a domed rack holding dozens of lenses with iridescent blue-violet-gold reflections, metallic surfaces, dramatic light."),
}


def fetch(url):
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=120) as r:
                return r.read()
        except Exception as e:
            print(f"  download retry {attempt + 1}: {e}", flush=True)
            time.sleep(3)
    raise RuntimeError("download failed")


def gen(name, out_dir):
    size, max_w, prompt = JOBS[name]
    body = json.dumps({"model": "gpt-image-2", "prompt": prompt + TAIL, "size": size, "n": 1, "response_format": "url"}).encode()
    req = urllib.request.Request(BASE, data=body, headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=400) as r:
                raw = r.read()
            item = json.loads(raw)["data"][0]
            if "b64_json" in item:
                blob = base64.b64decode(item["b64_json"])
            else:
                blob = fetch(item["url"])
            break
        except Exception as e:
            print(f"{name}: attempt {attempt + 1} error {e}", flush=True)
        time.sleep(5 + attempt * 10)
    else:
        raise RuntimeError("gave up")
    img = Image.open(io.BytesIO(blob)).convert("RGB")
    if img.width > max_w:
        img = img.resize((max_w, round(img.height * max_w / img.width)), Image.LANCZOS)
    path = os.path.join(out_dir, name + ".jpg")
    img.save(path, "JPEG", quality=82, optimize=True, progressive=True)
    return f"{name}: {img.width}x{img.height} {os.path.getsize(path)//1024}KB"


if __name__ == "__main__":
    out = sys.argv[1]
    names = sys.argv[2:] or list(JOBS)
    with ThreadPoolExecutor(max_workers=2) as ex:
        futs = {ex.submit(gen, n, out): n for n in names}
        for f, n in futs.items():
            try:
                print(f.result(), flush=True)
            except Exception as e:
                print(f"{n}: FAILED {e}", flush=True)
