"""Default social-sharing image (1200 x 630) from the hero poster.

    python website/scripts/make-og-image.py
"""
import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(__file__)
MEDIA = os.path.join(HERE, "..", "client", "public", "media")
FONT_DIR = os.path.join(os.environ.get("WINDIR", "C:/Windows"), "Fonts")


def font(names, size):
    for n in names:
        for path in (os.path.join(FONT_DIR, n), os.path.join("/usr/share/fonts/truetype/dejavu", n)):
            if os.path.exists(path):
                return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


img = Image.open(os.path.join(MEDIA, "hero", "hero-poster.jpg")).convert("RGB")
w, h = img.size
crop_h = int(w * 630 / 1200)
img = img.crop((0, (h - crop_h) // 2, w, (h + crop_h) // 2)).resize((1200, 630), Image.LANCZOS)

# Darken the left for type, as on the site.
shade = Image.linear_gradient("L").rotate(90).resize((1200, 630))
img = Image.composite(img, Image.new("RGB", img.size, (16, 29, 43)), shade.point(lambda v: 70 + v * 0.7))

d = ImageDraw.Draw(img)
bold = font(["segoeuib.ttf", "DejaVuSans-Bold.ttf"], 74)
small = font(["segoeuisb.ttf", "DejaVuSans-Bold.ttf"], 22)
d.line((72, 120, 112, 120), fill=(71, 197, 211), width=3)
d.text((128, 106), "ARIZEN POLYMERS", font=small, fill=(229, 235, 240))
d.text((70, 230), "MATERIALS THAT", font=bold, fill="white")
d.text((70, 318), "MOVE INDUSTRIES", font=bold, fill="white")
d.text((70 + d.textlength("MOVE INDUSTRIES", font=bold), 318), ".", font=bold, fill=(71, 197, 211))
d.text((72, 470), "HIPS  ·  ABS  ·  HDPE  ·  Polystyrene granules", font=small, fill=(159, 176, 193))

out = os.path.join(MEDIA, "og-default.jpg")
img.save(out, quality=84, optimize=True, progressive=True)
print(out, os.path.getsize(out) // 1024, "KB")
