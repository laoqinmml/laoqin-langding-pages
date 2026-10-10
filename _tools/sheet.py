"""usage: python -I sheet.py <out.jpg> <img...>  -> 2-column montage at 50%."""
import sys
from PIL import Image

out, paths = sys.argv[1], sys.argv[2:]
ims = [Image.open(p).convert("RGB") for p in paths]
w, h = ims[0].width // 2, ims[0].height // 2
rows = (len(ims) + 1) // 2
sheet = Image.new("RGB", (w * 2 + 10, rows * (h + 10)), "#888")
for i, im in enumerate(ims):
    sheet.paste(im.resize((w, round(im.height * w / im.width))), ((i % 2) * (w + 10), (i // 2) * (h + 10)))
sheet.save(out, quality=82)
