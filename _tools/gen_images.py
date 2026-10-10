#!/usr/bin/env python3
"""生图并直接压缩入库。图片这步最后再跑。

用法：
  IMG_API_KEY=xxx python3 gen_images.py <输出目录> <jobs.json> [任务名 ...]
  （不给任务名就全出；给了只出指定的，方便补单张）

jobs.json 格式：
{
  "base_url": "https://example.com/v1/images/generations",
  "model": "gpt-image-2",
  "style_suffix": " Photorealistic, high detail, natural colour grading. No text, no watermark, no brand logos.",
  "jobs": {
    "hero":       {"prompt": "...", "size": "1536x1024", "max_w": 1800},
    "product-01": {"prompt": "...", "size": "1024x1024", "max_w": 1200}
  }
}

规矩：
- 提示词里把比例写成数字（长宽比、各段长度），否则 AI 容易画歪；
- key 只从环境变量读，绝不写进文件或产物；
- 接口回包常被截断（IncompleteRead），脚本自带重试，兼容 b64_json 和 url 两种返回。
"""
import base64, io, json, os, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image


def fetch(url):
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=120) as r:
                return r.read()
        except Exception as e:
            print(f"  下载重试 {attempt + 1}: {e}", flush=True)
            time.sleep(3)
    raise RuntimeError("下载失败")


def gen(cfg, key, name, spec, out_dir):
    body = json.dumps({
        "model": cfg.get("model", "gpt-image-2"),
        "prompt": spec["prompt"] + cfg.get("style_suffix", ""),
        "size": spec.get("size", "1536x1024"),
        "n": 1,
        "response_format": "url",
    }).encode()
    req = urllib.request.Request(cfg["base_url"], data=body,
                                 headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=400) as r:
                item = json.loads(r.read())["data"][0]
            blob = base64.b64decode(item["b64_json"]) if "b64_json" in item else fetch(item["url"])
            break
        except Exception as e:
            print(f"{name}: 第 {attempt + 1} 次失败 {e}", flush=True)
        time.sleep(5 + attempt * 10)
    else:
        raise RuntimeError("放弃")

    img = Image.open(io.BytesIO(blob)).convert("RGB")
    max_w = spec.get("max_w", 1800)
    if img.width > max_w:
        img = img.resize((max_w, round(img.height * max_w / img.width)), Image.LANCZOS)
    path = os.path.join(out_dir, name + ".jpg")
    img.save(path, "JPEG", quality=82, optimize=True, progressive=True)
    return f"{name}: {img.width}x{img.height} {os.path.getsize(path) // 1024}KB"


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    key = os.environ.get("IMG_API_KEY")
    if not key:
        sys.exit("先设 IMG_API_KEY 环境变量（不要把 key 写进文件）。")
    out_dir, jobs_file, *only = sys.argv[1:]
    cfg = json.load(open(jobs_file, encoding="utf-8"))
    jobs = cfg["jobs"]
    names = only or list(jobs)
    os.makedirs(out_dir, exist_ok=True)
    with ThreadPoolExecutor(max_workers=2) as ex:  # 并发别超过 2–3，高了容易整批截断
        futs = {ex.submit(gen, cfg, key, n, jobs[n], out_dir): n for n in names}
        for f, n in futs.items():
            try:
                print(f.result(), flush=True)
            except Exception as e:
                print(f"{n}: 失败 {e}", flush=True)
