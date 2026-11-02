"""
Renders the homepage hero loop from two granule-bed stills.

Input: hero_clear.png and hero_white.png (same pellet layout, different material),
produced by render-materials.py. Output: a seamless 10-second loop in
which clear granules dissolve into white ones and back, with a slow camera push,
rack focus, a cool light sweep and drifting particles, graded deep navy so white
headline type stays readable.

    python website/scripts/render-hero-video.py

Requires numpy, pillow and ffmpeg (with libx264 and libvpx-vp9) on PATH.
This is a stand-in until the Google Flow / Veo hero film is produced
(see docs/visual-production.md).
"""

import math
import os
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, ".hero")
OUT = os.path.join(HERE, "..", "client", "public", "media", "hero")
FPS, SECONDS = 24, 10
OW, OH = 1920, 1080


def load(name):
    return np.asarray(Image.open(os.path.join(SRC, name)).convert("RGB"), dtype=np.float32) / 255


def smooth(x):
    return x * x * (3 - 2 * x)


def main():
    os.makedirs(OUT, exist_ok=True)
    clear, white = load("hero_clear.png"), load("hero_white.png")
    blur = lambda a: np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(7)), dtype=np.float32) / 255
    clear_b, white_b = blur(clear), blur(white)
    SH, SW = clear.shape[:2]

    rng = np.random.default_rng(7)
    n = 80
    px, py = rng.random(n), rng.random(n)
    drift = rng.choice([0, 0, 1], n)  # some particles rise once per loop, others hover
    wob = rng.random(n) * 2 * math.pi
    size = rng.uniform(1.0, 7.0, n) ** 1.2
    alpha = rng.uniform(0.05, 0.32, n)
    tint = rng.random(n) < 0.4

    gy, gx = np.mgrid[0:OH, 0:OW].astype(np.float32)
    nx, ny = gx / OW, gy / OH
    vignette = 1 - 0.55 * np.clip(((nx - 0.5) * 1.6) ** 2 + ((ny - 0.55) * 1.5) ** 2, 0, 1)
    # Darker on the left, where the headline sits.
    text_shade = 0.62 + 0.38 * smooth(np.clip(nx * 1.4 - 0.15, 0, 1))

    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OW}x{OH}", "-r", str(FPS), "-i", "-",
        "-map", "0", "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", "-an",
        os.path.join(OUT, "hero-1080.mp4"),
        "-map", "0", "-vf", "scale=1280:720:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
        os.path.join(OUT, "hero-720.mp4"),
        "-map", "0", "-c:v", "libvpx-vp9", "-crf", "38", "-b:v", "0", "-row-mt", "1", "-cpu-used", "3", "-pix_fmt", "yuv420p", "-an",
        os.path.join(OUT, "hero-1080.webm"),
    ]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    frames = FPS * SECONDS
    for i in range(frames):
        t = i / frames
        phase = 2 * math.pi * t
        mix = (0.5 - 0.5 * math.cos(phase)) ** 1.6  # clear for longer, then white, then back

        # Camera: gentle push and drift on a closed path so the loop is seamless.
        zoom = 1.12 + 0.05 * math.sin(phase)
        cw, ch = SW / zoom, SH / zoom
        cx = SW / 2 + SW * 0.04 * math.cos(phase)
        cy = SH / 2 + SH * 0.035 * math.sin(phase)
        x0, y0 = int(np.clip(cx - cw / 2, 0, SW - cw)), int(np.clip(cy - ch / 2, 0, SH - ch))
        box = (x0, y0, x0 + int(cw), y0 + int(ch))

        def view(a, b):
            img = Image.fromarray(((a * (1 - mix) + b * mix) * 255).astype(np.uint8)).crop(box).resize((OW, OH), Image.BILINEAR)
            return np.asarray(img, dtype=np.float32) / 255

        sharp, soft = view(clear, white), view(clear_b, white_b)
        focus = 0.52 + 0.1 * math.sin(phase + 1.2)
        defocus = np.clip(np.abs(ny - focus) / 0.42, 0, 1) ** 1.4 * 0.95
        frame = sharp * (1 - defocus[..., None]) + soft * defocus[..., None]

        # Grade: steel-blue and navy, with lifted blacks.
        frame = frame * np.array((0.70, 0.82, 0.98), dtype=np.float32) + np.array((0.025, 0.05, 0.085), dtype=np.float32)
        frame *= (vignette * text_shade)[..., None] * 0.86

        # Light sweep travelling diagonally, fully off-screen at the loop point.
        band_pos = t * 2.6 - 0.8
        band = np.exp(-(((nx * 0.75 + ny * 0.55) - band_pos) ** 2) / 0.018) * 0.16
        frame += band[..., None] * np.array((0.55, 0.85, 1.0), dtype=np.float32)

        # Drifting particles, drawn small then softened and scaled up.
        layer = Image.new("L", (OW // 2, OH // 2), 0)
        cyan_layer = Image.new("L", (OW // 2, OH // 2), 0)
        d, dc = ImageDraw.Draw(layer), ImageDraw.Draw(cyan_layer)
        for k in range(n):
            x = ((px[k] + 0.012 * math.sin(phase + wob[k])) % 1) * OW / 2
            y = ((py[k] - drift[k] * t + 0.01 * math.cos(phase * 2 + wob[k])) % 1) * OH / 2
            r = size[k]
            (dc if tint[k] else d).ellipse((x - r, y - r, x + r, y + r), fill=int(255 * alpha[k]))
        glow = lambda im: np.asarray(im.filter(ImageFilter.GaussianBlur(1.6)).resize((OW, OH), Image.BILINEAR), dtype=np.float32) / 255
        frame += glow(layer)[..., None] * np.array((0.85, 0.92, 1.0), dtype=np.float32) + glow(cyan_layer)[..., None] * np.array((0.28, 0.77, 0.83), dtype=np.float32)

        out = (np.clip(frame, 0, 1) * 255).astype(np.uint8)
        if i == 0:
            poster = Image.fromarray(out)
            poster.save(os.path.join(OUT, "hero-poster.webp"), quality=78, method=6)
            poster.save(os.path.join(OUT, "hero-poster.jpg"), quality=80, optimize=True, progressive=True)
            poster.resize((960, 540), Image.LANCZOS).save(os.path.join(OUT, "hero-poster-960.webp"), quality=76, method=6)
        ff.stdin.write(out.tobytes())
        if i % 24 == 0:
            print(f"frame {i}/{frames}", flush=True)

    ff.stdin.close()
    if ff.wait() != 0:
        raise SystemExit("ffmpeg failed")
    for f in sorted(os.listdir(OUT)):
        print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, "KB")


if __name__ == "__main__":
    main()
