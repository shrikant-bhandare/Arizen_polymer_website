"""
Procedural macro renders of polymer granules used as product imagery.

Each image is a close-up of a granule bed lit like a product shot. They are
abstract material visuals, not photographs of Arizen products, and can be
replaced with official photography supplied by the client.

    pip install numpy pillow
    python scripts/render-materials.py                      # proposal images
    python scripts/render-materials.py --width 1800 --out website/client/public/media/products hips abs hdpe gpps
    python scripts/render-materials.py --out website/scripts/.hero hero_clear hero_white   # hero video beds
"""

import argparse
import math
import os

import numpy as np
from PIL import Image, ImageFilter

RW, RH = 2400, 1800          # render size (2x supersampled)
OW, OH = 1200, 900           # output size
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "materials")


def norm(v):
    v = np.asarray(v, dtype=np.float64)
    return v / np.linalg.norm(v)


KEY = norm((-0.5, -0.6, 0.62))
FILL = norm((0.75, 0.15, 0.45))
HALF_KEY = norm(KEY + np.array((0.0, 0.0, 1.0)))
BACK_GLINT = norm((0.5, 0.6, 0.62))
KEY_COL = np.array((1.0, 0.975, 0.95))
FILL_COL = np.array((0.32, 0.78, 0.85)) * 0.32
AMB_COL = np.array((0.80, 0.86, 0.95)) * 0.26
GROUND = np.array((0.035, 0.055, 0.085))

MATERIALS = {
    "hips": dict(kind="opaque", albedo=(0.93, 0.935, 0.93), axes=(1.45, 1.0, 0.9),
                 spec=0.28, shin=36, wrap=0.35, tilt=0.18, unit=50, layers=3, seed=11),
    "abs": dict(kind="opaque", albedo=(0.97, 0.84, 0.60), axes=(1.35, 1.05, 0.95),
                spec=0.55, shin=80, wrap=0.2, tilt=0.18, unit=50, layers=3,
                grade=(1.05, 0.99, 0.86), seed=23),
    "hdpe": dict(kind="translucent", albedo=(0.86, 0.90, 0.91), axes=(1.22, 1.12, 0.62),
                 spec=0.4, shin=30, wrap=0.3, trans=0.3, tilt=0.3, unit=52, layers=3, seed=37),
    "gpps": dict(kind="clear", tint=(0.84, 0.95, 0.98), axes=(1.5, 1.0, 0.95),
                 spec=1.8, shin=260, tilt=0.18, unit=54, layers=2, spacing=1.2, seed=53),
    # Website hero: two beds with identical geometry (same seed and layout) so the
    # video can dissolve clear granules into white ones in place. No baked-in
    # depth of field or vignette; the video applies its own.
    "hero_clear": dict(kind="clear", tint=(0.80, 0.93, 0.98), axes=(1.45, 1.0, 0.92),
                       spec=1.8, shin=260, tilt=0.2, unit=40, layers=2, spacing=1.12, seed=71,
                       width=2400, aspect=0.5625, dof=False, vignette=False, print=False),
    "hero_white": dict(kind="opaque", albedo=(0.90, 0.92, 0.94), axes=(1.45, 1.0, 0.92),
                       spec=0.35, shin=40, wrap=0.3, tilt=0.2, unit=40, layers=2, spacing=1.12, seed=71,
                       width=2400, aspect=0.5625, dof=False, vignette=False, print=False),
}


def rotation(theta, tx, ty):
    c, s = math.cos(theta), math.sin(theta)
    rz = np.array(((c, -s, 0), (s, c, 0), (0, 0, 1)))
    c, s = math.cos(tx), math.sin(tx)
    rx = np.array(((1, 0, 0), (0, c, -s), (0, s, c)))
    c, s = math.cos(ty), math.sin(ty)
    ry = np.array(((c, 0, s), (0, 1, 0), (-s, 0, c)))
    return rz @ ry @ rx


def perspective(y):
    return 0.55 + 0.55 * min(max(y / RH, 0.0), 1.0)


def scatter(m, rng, unit):
    pellets = []
    ax = np.array(m["axes"])
    gap = m.get("spacing", 1.0)
    for layer in range(m["layers"]):
        y = -50.0 + rng.uniform(0, 30)
        while y < RH + 50:
            sc = perspective(y)
            a, b, c = ax * unit * sc
            x = -50.0 + rng.uniform(0, 2 * a)
            while x < RW + 50:
                axes = np.array((a * rng.uniform(0.9, 1.1), b * rng.uniform(0.9, 1.1), c * rng.uniform(0.9, 1.08)))
                r = rotation(rng.uniform(0, math.pi), *rng.normal(0, m["tilt"], 2))
                q = r @ np.diag(1.0 / axes ** 2) @ r.T
                pellets.append(dict(
                    cx=x + rng.normal(0, a * 0.25), cy=y + rng.normal(0, b * 0.25),
                    cz=layer * c * 1.25 + rng.normal(0, c * 0.25),
                    q=q, r=axes.max(), sc=sc, jitter=rng.normal(1.0, 0.018),
                ))
                x += 2.0 * a * gap * rng.uniform(0.85, 1.15)
            y += 1.9 * b * gap * rng.uniform(0.85, 1.1)
    pellets.sort(key=lambda p: p["cz"])
    return pellets


def surface(p):
    """Top surface of one ellipsoid under an orthographic top-down view."""
    x0, x1 = max(int(p["cx"] - p["r"]), 0), min(int(p["cx"] + p["r"]) + 2, RW)
    y0, y1 = max(int(p["cy"] - p["r"]), 0), min(int(p["cy"] + p["r"]) + 2, RH)
    if x0 >= x1 or y0 >= y1:
        return None
    dx, dy = np.meshgrid(np.arange(x0, x1) + 0.5 - p["cx"], np.arange(y0, y1) + 0.5 - p["cy"])
    q = p["q"]
    a = q[2, 2]
    b = q[0, 2] * dx + q[1, 2] * dy
    c = q[0, 0] * dx * dx + 2 * q[0, 1] * dx * dy + q[1, 1] * dy * dy - 1
    disc = b * b - a * c
    mask = disc > 0
    if not mask.any():
        return None
    sq = np.sqrt(np.maximum(disc, 0))
    dz = (-b + sq) / a
    d = np.stack((dx, dy, dz), axis=-1)
    n = d @ q.T
    n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-9
    return (slice(y0, y1), slice(x0, x1)), mask, p["cz"] + dz, n, 2 * sq / a


def shifted(arr, sx, sy):
    """Value of arr at (x + sx, y + sy), clamped at the edges."""
    h, w = arr.shape
    ys = np.clip(np.arange(h) + sy, 0, h - 1)
    xs = np.clip(np.arange(w) + sx, 0, w - 1)
    return arr[np.ix_(ys, xs)]


def _box(arr, r, axis):
    pad = [(0, 0), (0, 0)]
    pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(arr, pad, mode="edge"), axis=axis)
    hi = np.take(c, np.arange(2 * r + 1, c.shape[axis]), axis=axis)
    lo = np.take(c, np.arange(0, c.shape[axis] - 2 * r - 1), axis=axis)
    return (hi - lo) / (2 * r + 1)


def blur_float(arr, radius):
    """Approximate Gaussian blur: three separable box passes."""
    r = max(int(round(radius * 0.8)), 1)
    for _ in range(3):
        arr = _box(_box(arr, r, 0), r, 1)
    return arr


def shadow_map(zbuf):
    lxy = math.hypot(KEY[0], KEY[1])
    ux, uy, rise = KEY[0] / lxy, KEY[1] / lxy, KEY[2] / lxy
    occ = np.zeros_like(zbuf)
    for k in range(2, 110, 2):
        diff = shifted(zbuf, int(round(ux * k)), int(round(uy * k))) - (zbuf + k * rise)
        occ = np.maximum(occ, np.clip(diff / (6 + k * 0.3), 0, 1))
    return blur_float(1 - occ * 0.82, 3)


def ambient_occlusion(zbuf, unit):
    around = blur_float(zbuf, unit * 0.8)
    return np.clip(1 - (around - zbuf) / (unit * 1.4), 0.3, 1.0)


def env(n):
    """Large soft-box reflection for glossy and clear materials."""
    t = np.clip((n @ KEY - 0.55) / 0.4, 0, 1)
    t = t * t * (3 - 2 * t)
    return GROUND * 0.6 + t[..., None] * np.array((1.6, 1.6, 1.62))


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def shade(m, n, thick, scale, jitter, shadow, ao, behind):
    ndl = np.clip(((n @ KEY) + m.get("wrap", 0)) / (1 + m.get("wrap", 0)), 0, 1)[..., None]
    ndf = np.clip(n @ FILL, 0, 1)[..., None]
    spec = (np.clip(n @ HALF_KEY, 0, 1) ** m["shin"])[..., None]
    nz = np.clip(n[..., 2:3], 0, 1)
    fres = 0.04 + 0.96 * (1 - nz) ** 5

    if m["kind"] == "clear":
        # Glass-like granule: refracted background, dark internal-reflection
        # band near the edge, a thin bright rim, key highlight and exit glint.
        tint = np.array(m["tint"])
        edge = np.clip((1 - nz) / 0.6, 0, 1)
        body = behind * tint * (1 - 0.8 * smoothstep(0.35, 0.85, edge))
        rim = smoothstep(0.86, 1.0, edge) * 0.42 * np.array((0.62, 0.9, 1.0))
        glint = (np.clip(n @ BACK_GLINT, 0, 1) ** 14)[..., None] * 0.7
        return body * 0.96 + fres * env(n) * 0.8 + spec * m["spec"] * KEY_COL + glint * tint + rim

    alb = np.array(m["albedo"]) * jitter
    lit = alb * (AMB_COL * ao + KEY_COL * ndl * shadow + FILL_COL * ndf)
    lit = lit + spec * m["spec"] * shadow * KEY_COL + fres * 0.08 * np.array((0.32, 0.78, 0.85))
    if m["kind"] == "translucent":
        t = m["trans"] * np.exp(-thick / (scale * 0.9))[..., None]
        scatter_glow = alb * 0.14 * (1 - ndl)
        lit = lit * (1 - t) + behind * t * np.array((0.95, 0.99, 1.0)) * 1.25 + scatter_glow
    return lit


def caustics(pellets, unit):
    """Light focused through clear granules onto the surface below them."""
    acc = np.zeros((RH, RW))
    lxy = math.hypot(KEY[0], KEY[1])
    for p in pellets:
        drop = (p["cz"] + 1.3 * unit) * lxy / KEY[2]
        cx, cy = p["cx"] - KEY[0] / lxy * drop * 0.6, p["cy"] - KEY[1] / lxy * drop * 0.6
        rad = 0.32 * unit * p["sc"]
        x0, x1 = max(int(cx - 3 * rad), 0), min(int(cx + 3 * rad) + 1, RW)
        y0, y1 = max(int(cy - 3 * rad), 0), min(int(cy + 3 * rad) + 1, RH)
        if x0 >= x1 or y0 >= y1:
            continue
        dx, dy = np.meshgrid(np.arange(x0, x1) - cx, np.arange(y0, y1) - cy)
        acc[y0:y1, x0:x1] += np.exp(-(dx * dx + dy * dy) / (2 * rad * rad))
    return np.clip(acc, 0, 1.4) * 0.22


def render(name, width=None, out_dir=None):
    global RW, RH, OW, OH
    m = MATERIALS[name]
    OW = width or m.get("width", 1200)
    OH = round(OW * m.get("aspect", 0.75))
    RW, RH = OW * 2, OH * 2
    out_dir = out_dir or OUT
    rng = np.random.default_rng(m["seed"])
    # Pellet size is defined for a 1200 px wide image and scales with the output.
    unit = m["unit"] * OW / 1200
    pellets = scatter(m, rng, unit)
    ground_z = -1.3 * unit
    clear = m["kind"] == "clear"

    zbuf = np.full((RH, RW), ground_z)
    surfaces = []
    for p in pellets:
        s = surface(p)
        surfaces.append(s)
        if s is None:
            continue
        sl, mask, z, _, _ = s
        region = zbuf[sl]
        region[mask] = np.maximum(region[mask], z[mask])

    shadow = shadow_map(zbuf)
    ao = ambient_occlusion(zbuf, unit)

    noise = rng.normal(0, 1, (RH, RW))
    noise = blur_float(noise, 2) * 0.25 + 1
    lit_ground = (0.8 + 0.2 * shadow) if clear else (0.55 + 0.45 * shadow) * ao
    img = GROUND[None, None, :] * lit_ground[..., None] * noise[..., None]
    if clear:
        img = img * 2.2 + caustics(pellets, unit)[..., None] * np.array((0.55, 0.85, 0.95))
    zrun = np.full((RH, RW), ground_z)

    for p, s in zip(pellets, surfaces):
        if s is None:
            continue
        sl, mask, z, n, thick = s
        vis = mask & (z >= zrun[sl] - 0.25)
        if not vis.any():
            continue
        top = np.abs(z - zbuf[sl]) < 0.75
        sh = np.where(top, shadow[sl], 1.0)[..., None]
        oc = np.where(top, ao[sl], 0.8)[..., None]

        behind = None
        if m["kind"] != "opaque":
            ys, xs = np.mgrid[sl]
            k = -0.3 * thick if clear else 0.55 * thick
            iy = np.clip((ys + n[..., 1] * k).astype(int), 0, RH - 1)
            ix = np.clip((xs + n[..., 0] * k).astype(int), 0, RW - 1)
            behind = img[iy, ix]

        col = shade(m, n, thick, unit * p["sc"], p["jitter"], sh, oc, behind)
        region = img[sl]
        region[vis] = col[vis]
        zrun[sl][vis] = z[vis]

    # Tone map, then gamma.
    img = img / (1 + img * 0.32)
    img = np.clip(img * np.array(m.get("grade", (1, 1, 1))), 0, 1) ** (1 / 2.2)
    out = Image.fromarray((img * 255).astype(np.uint8)).resize((OW, OH), Image.LANCZOS)

    arr = np.asarray(out, dtype=np.float64)
    if m.get("dof", True):
        # Tilt-shift depth of field: soft top and bottom, crisp middle band.
        soft = np.asarray(out.filter(ImageFilter.GaussianBlur(5 * OW / 1200)), dtype=np.float64)
        yy = np.linspace(0, 1, OH)
        w = np.clip((0.38 - yy) / 0.38, 0, 1) ** 1.4 + np.clip((yy - 0.9) / 0.1, 0, 1) * 0.35
        w = np.repeat(w[:, None], OW, axis=1)
        arr = arr * (1 - w[..., None]) + soft * w[..., None]

    if m.get("vignette", True):
        gx, gy = np.meshgrid(np.linspace(-1, 1, OW), np.linspace(-1, 1, OH))
        arr *= (1 - 0.32 * np.clip(gx * gx * 0.8 + gy * gy, 0, 1.6))[..., None]
    arr += rng.normal(0, 1.4, arr.shape)

    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, f"{name}.webp")
    final = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    final.save(path, "WEBP", quality=80, method=6)
    print(f"{path}  {os.path.getsize(path) // 1024} KB")
    if not m.get("print", True):
        final.save(os.path.join(out_dir, f"{name}.png"))  # lossless source for further processing
        return
    print_path = os.path.join(out_dir, f"{name}-print.jpg")
    final.resize((900, 675), Image.LANCZOS).save(print_path, "JPEG", quality=82, optimize=True, progressive=True)
    print(f"{print_path}  {os.path.getsize(print_path) // 1024} KB")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("names", nargs="*", help="materials to render (default: the four product materials)")
    parser.add_argument("--width", type=int, help="output width in pixels")
    parser.add_argument("--out", help="output directory")
    args = parser.parse_args()
    for key in args.names or ["hips", "abs", "hdpe", "gpps"]:
        render(key, args.width, args.out)
