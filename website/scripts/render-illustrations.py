"""
Conceptual isometric illustrations for the Infrastructure and Quality pages.

These are deliberately drawn as technical illustrations rather than photographs,
so they can never be mistaken for Arizen's actual premises. The website labels
them as conceptual, and they should be replaced with real photography when
Arizen supplies it (see docs/visual-production.md).

    python website/scripts/render-illustrations.py
"""

import math
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "client", "public", "media", "illustrations")
W, H = 1200, 900
COS30 = math.cos(math.radians(30))

INK = "#101D2B"
PALETTE = {
    "steel": ("#F7F9FB", "#DCE4EC", "#C3CFDB"),
    "blue": ("#4F8FC6", "#2868A0", "#1E5287"),
    "navy": ("#2A4560", "#152F48", "#101D2B"),
    "pallet": ("#E9E3D6", "#D3CBB9", "#BBB29E"),
    "sack": ("#FFFFFF", "#EEF2F6", "#DCE3EA"),
    "wall": ("#F2F5F8", "#E5EBF0", "#CCD7E1"),
    "roof": ("#C9D5E0", "#AFBFCF", "#97AABD"),
    "cyan": ("#8FDCE5", "#47C5D3", "#2FA6B4"),
    "bench": ("#E5EBF0", "#C9D4DF", "#AEBCCB"),
    "screen": ("#152F48", "#101D2B", "#0B1622"),
}


class Scene:
    def __init__(self, scale=46, origin=(W / 2, 250)):
        self.s = scale
        self.ox, self.oy = origin
        self.items = []  # (depth, svg)

    def iso(self, x, y, z):
        return (self.ox + (x - y) * self.s * COS30, self.oy + (x + y) * self.s * 0.5 - z * self.s)

    def poly(self, pts, fill, stroke=INK, sw=1.1, opacity=1.0, extra=""):
        d = " ".join(f"{px:.1f},{py:.1f}" for px, py in (self.iso(*p) for p in pts))
        op = f' fill-opacity="{opacity}"' if opacity < 1 else ""
        st = f' stroke="{stroke}" stroke-width="{sw}" stroke-opacity="0.55" stroke-linejoin="round"' if stroke else ""
        return f'<polygon points="{d}" fill="{fill}"{op}{st}{extra}/>'

    def add(self, depth, svg):
        self.items.append((depth, svg))

    def box(self, x, y, z, w, d, h, mat="steel", stripe=None, depth_bias=0.0):
        top, right, left = PALETTE[mat]
        parts = [
            self.poly([(x, y + d, z), (x + w, y + d, z), (x + w, y + d, z + h), (x, y + d, z + h)], left),
            self.poly([(x + w, y, z), (x + w, y + d, z), (x + w, y + d, z + h), (x + w, y, z + h)], right),
            self.poly([(x, y, z + h), (x + w, y, z + h), (x + w, y + d, z + h), (x, y + d, z + h)], top),
        ]
        if stripe:
            # A coloured label band across the front-left face (e.g. on sacks).
            zb, zt = z + h * stripe[0], z + h * stripe[1]
            parts.append(self.poly([(x + w * 0.2, y + d, zb), (x + w * 0.8, y + d, zb), (x + w * 0.8, y + d, zt), (x + w * 0.2, y + d, zt)], stripe[2], stroke=None))
        self.add(x + w / 2 + y + d / 2 + z * 0.9 + depth_bias, "".join(parts))

    def ellipse_pts(self, cx, cy, z, r, n=40):
        return [(cx + r * math.cos(t), cy + r * math.sin(t), z) for t in (2 * math.pi * i / n for i in range(n))]

    def cylinder(self, cx, cy, z, r, h, mat="steel", glass=False, depth_bias=0.0, fill_to=None, fill_mat="cyan"):
        top, right, left = PALETTE[mat]
        bottom = [self.iso(*p) for p in self.ellipse_pts(cx, cy, z, r)]
        topring = [self.iso(*p) for p in self.ellipse_pts(cx, cy, z + h, r)]
        hull = convex_hull(bottom + topring)
        op = ' fill-opacity="0.28"' if glass else ""
        parts = []
        if fill_to is not None:
            # Contents (e.g. granules in a beaker), drawn inside the glass.
            inner = convex_hull([self.iso(*p) for p in self.ellipse_pts(cx, cy, z, r * 0.92)] + [self.iso(*p) for p in self.ellipse_pts(cx, cy, z + fill_to, r * 0.92)])
            parts.append(path(inner, PALETTE[fill_mat][1], None))
            parts.append(path([self.iso(*p) for p in self.ellipse_pts(cx, cy, z + fill_to, r * 0.92)], PALETTE[fill_mat][0], INK, 0.8))
        parts.insert(0, f'<path d="{d_of(hull)}" fill="url(#cyl-{mat})"{op} stroke="{INK}" stroke-width="1.1" stroke-opacity="0.55"/>')
        parts.append(f'<path d="{d_of(topring)}" fill="{top}"{op} stroke="{INK}" stroke-width="1.1" stroke-opacity="0.55"/>')
        self.add(cx + cy + z * 0.9 + depth_bias, "".join(parts))

    def wheel(self, cx, y, cz, r, depth_bias=0.0):
        pts = [self.iso(cx + r * math.cos(t), y, cz + r * math.sin(t)) for t in (2 * math.pi * i / 32 for i in range(32))]
        hub = [self.iso(cx + r * 0.45 * math.cos(t), y, cz + r * 0.45 * math.sin(t)) for t in (2 * math.pi * i / 24 for i in range(24))]
        self.add(cx + y + depth_bias, path(pts, "#27323C", INK) + path(hub, "#C3CFDB", INK, 0.8))

    def floor(self, x0, y0, x1, y1, step=1.0):
        corners = [self.iso(x0, y0, 0), self.iso(x1, y0, 0), self.iso(x1, y1, 0), self.iso(x0, y1, 0)]
        lines = []
        x = x0
        while x <= x1 + 1e-6:
            a, b = self.iso(x, y0, 0), self.iso(x, y1, 0)
            lines.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>')
            x += step
        y = y0
        while y <= y1 + 1e-6:
            a, b = self.iso(x0, y, 0), self.iso(x1, y, 0)
            lines.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>')
            y += step
        self.add(-1e6, path(corners, "#F7F9FB", INK, 0.8) + f'<g stroke="#C9D4DF" stroke-width="0.8">{"".join(lines)}</g>')

    def shadow(self, x, y, w, d, grow=0.25):
        pts = [self.iso(x - grow, y - grow, 0), self.iso(x + w + grow, y - grow, 0), self.iso(x + w + grow, y + d + grow, 0), self.iso(x - grow, y + d + grow, 0)]
        self.add(-1e5, path(pts, INK, None, opacity=0.07))

    def dashed(self, pts, color="#47C5D3", sw=3, depth=-5e4, arrow=False):
        p = [self.iso(*q) for q in pts]
        d = "M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in p)
        marker = ' marker-end="url(#arrow)"' if arrow else ""
        self.add(depth, f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-dasharray="10 9" stroke-linecap="round"{marker}/>')

    def svg(self, title):
        body = "\n".join(svg for _, svg in sorted(self.items, key=lambda t: t[0]))
        grads = "".join(
            f'<linearGradient id="cyl-{k}" x1="0" x2="1"><stop offset="0" stop-color="{v[2]}"/><stop offset="0.45" stop-color="{v[0]}"/><stop offset="1" stop-color="{v[1]}"/></linearGradient>'
            for k, v in PALETTE.items()
        )
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="{title}">\n'
            f"<title>{title}</title>\n<defs>{grads}"
            '<marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#47C5D3"/></marker>'
            f"</defs>\n{body}\n</svg>\n"
        )


def d_of(pts):
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"


def path(pts, fill, stroke=INK, sw=1.1, opacity=1.0):
    op = f' fill-opacity="{opacity}"' if opacity < 1 else ""
    st = f' stroke="{stroke}" stroke-width="{sw}" stroke-opacity="0.55" stroke-linejoin="round"' if stroke else ""
    return f'<path d="{d_of(pts)}" fill="{fill}"{op}{st}/>'


def convex_hull(points):
    pts = sorted(set((round(x, 2), round(y, 2)) for x, y in points))
    if len(pts) < 3:
        return pts

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


def palletised_sacks(sc, x, y, z, nx=3, ny=2, nz=3, bias=0.0):
    """A pallet with bagged granules stacked on it."""
    pw, pd = nx * 0.82 + 0.1, ny * 0.55 + 0.1
    sc.box(x, y, z, pw, pd, 0.16, "pallet", depth_bias=bias - 0.2)
    for k in range(nz):
        for j in range(ny):
            for i in range(nx):
                sc.box(x + 0.05 + i * 0.82, y + 0.05 + j * 0.55, z + 0.16 + k * 0.3, 0.78, 0.5, 0.28, "sack", stripe=(0.35, 0.6, "#47C5D3"), depth_bias=bias)
    return pw, pd


def warehousing():
    sc = Scene(scale=44, origin=(W / 2 + 40, 175))
    sc.floor(-1, -1, 13, 11)
    for row_y in (1.0, 6.0):
        for bay in range(3):
            bx = 1 + bay * 3.4
            for level, lz in enumerate((0.0, 1.7, 3.4)):
                # uprights (per level segment), beams, then the pallet load
                for ux in (bx, bx + 3.2):
                    sc.box(ux, row_y, lz, 0.14, 1.3, 1.7, "blue", depth_bias=-0.4)
                sc.box(bx + 0.14, row_y, lz + 1.55, 3.06, 0.12, 0.12, "blue", depth_bias=0.3)
                sc.box(bx + 0.14, row_y + 1.18, lz + 1.55, 3.06, 0.12, 0.12, "blue", depth_bias=0.6)
                if (row_y, bay, level) not in {(6.0, 2, 2), (1.0, 1, 0)}:
                    palletised_sacks(sc, bx + 0.25, row_y + 0.12, lz + 0.02, nx=3, ny=2, nz=2 if level == 2 else 3)
    sc.dashed([(0.2, 4.3, 0.01), (11.8, 4.3, 0.01)], arrow=True)
    return sc.svg("Conceptual illustration: warehouse racking holding palletised polymer bags")


def handling():
    sc = Scene(scale=58, origin=(W / 2 - 20, 210))
    sc.floor(-1, -1, 10, 9)
    # Pallet truck carrying a load
    sc.shadow(2.0, 3.0, 3.6, 1.4)
    sc.box(2.2, 3.15, 0.08, 2.6, 0.18, 0.08, "steel")
    sc.box(2.2, 4.07, 0.08, 2.6, 0.18, 0.08, "steel")
    palletised_sacks(sc, 2.1, 3.0, 0.16, nx=3, ny=2, nz=3)
    sc.box(4.85, 3.0, 0.0, 0.6, 1.4, 0.75, "cyan")
    sc.wheel(5.15, 4.4, 0.18, 0.18)
    handle = [sc.iso(5.4, 3.7, 0.75), sc.iso(6.6, 3.7, 2.1)]
    sc.add(9.5, f'<path d="M{handle[0][0]:.1f},{handle[0][1]:.1f} L{handle[1][0]:.1f},{handle[1][1]:.1f}" stroke="{INK}" stroke-width="6" stroke-linecap="round" stroke-opacity="0.85"/>')
    sc.dashed([(5.8, 4.9, 0.01), (8.6, 4.9, 0.01)], arrow=True)
    # Stacked pallets awaiting dispatch
    for i, (px, py) in enumerate(((0.0, 0.0), (3.0, 0.0), (6.0, 0.0))):
        sc.shadow(px, py, 2.6, 1.2)
        palletised_sacks(sc, px, py, 0.0, nx=3, ny=2, nz=4 - i % 2)
    sc.shadow(0.2, 6.4, 2.6, 1.2)
    palletised_sacks(sc, 0.2, 6.4, 0.0, nx=3, ny=2, nz=2)
    return sc.svg("Conceptual illustration: a pallet truck moving bagged polymer granules")


def facilities():
    sc = Scene(scale=40, origin=(W / 2 - 40, 210))
    sc.floor(-1, -1, 16, 13, step=1.5)
    # Main building
    sc.shadow(0, 0, 9, 6, 0.4)
    sc.box(0, 0, 0, 9, 6, 3.4, "wall", depth_bias=-3)
    sc.box(-0.15, -0.15, 3.4, 9.3, 6.3, 0.25, "roof", depth_bias=-2)
    # Loading doors on the front-left face and a window band on the front-right face
    for i in range(3):
        x0 = 0.8 + i * 2.6
        sc.add(20, sc.poly([(x0, 6.01, 0), (x0 + 1.8, 6.01, 0), (x0 + 1.8, 6.01, 2.3), (x0, 6.01, 2.3)], "#C3CFDB")
               + "".join(sc.poly([(x0, 6.02, z), (x0 + 1.8, 6.02, z), (x0 + 1.8, 6.02, z + 0.04), (x0, 6.02, z + 0.04)], "#97AABD", stroke=None) for z in (0.5, 0.9, 1.3, 1.7, 2.1)))
    sc.add(20, sc.poly([(9.01, 0.6, 2.4), (9.01, 5.4, 2.4), (9.01, 5.4, 2.9), (9.01, 0.6, 2.9)], "#47C5D3", opacity=0.75))
    sc.add(20, sc.poly([(0.8, 6.01, 2.75), (8.2, 6.01, 2.75), (8.2, 6.01, 3.05), (0.8, 6.01, 3.05)], "#2868A0", stroke=None))
    # Storage silos
    for i, cy in enumerate((0.8, 2.6)):
        sc.cylinder(11.2, cy, 0, 0.8, 4.6, "steel", depth_bias=-1 + i)
        sc.cylinder(11.2, cy, 4.6, 0.82, 0.18, "blue", depth_bias=-0.5 + i)
    # Truck at the dock
    sc.shadow(1.0, 7.0, 6.0, 1.8)
    sc.box(1.2, 7.1, 0.35, 4.2, 1.6, 2.0, "steel", stripe=(0.45, 0.6, "#47C5D3"))
    sc.box(5.5, 7.1, 0.35, 1.4, 1.6, 1.5, "navy")
    for wx in (1.9, 4.6, 6.3):
        sc.wheel(wx, 8.72, 0.32, 0.32, depth_bias=2)
    return sc.svg("Conceptual illustration: an industrial facility with loading bays, silos and a truck at the dock")


def distribution():
    sc = Scene(scale=44, origin=(W / 2, 170))
    sc.floor(-1, -1, 14, 12, step=1.0)
    route = [(1.5, 2.0, 0.01), (6.0, 2.0, 0.01), (6.0, 7.0, 0.01), (12.0, 7.0, 0.01)]
    sc.dashed(route, sw=4)
    sc.dashed([(6.0, 7.0, 0.01), (6.0, 10.5, 0.01)], sw=4)
    sc.dashed([(6.0, 2.0, 0.01), (11.0, 2.0, 0.01)], sw=4)
    # Origin warehouse
    sc.shadow(0, 0, 2.6, 2.2)
    sc.box(0, 0, 0, 2.6, 2.2, 1.6, "wall")
    sc.box(-0.1, -0.1, 1.6, 2.8, 2.4, 0.18, "roof")
    # Destination pins
    for px, py in ((12.0, 7.0), (6.0, 10.5), (11.0, 2.0)):
        sc.cylinder(px, py, 0, 0.32, 0.12, "cyan", depth_bias=0)
        sc.cylinder(px, py, 0.12, 0.08, 1.2, "navy", depth_bias=0.1)
        top = sc.iso(px, py, 1.55)
        sc.add(px + py + 2, f'<circle cx="{top[0]:.1f}" cy="{top[1]:.1f}" r="13" fill="#47C5D3" stroke="{INK}" stroke-opacity="0.55"/><circle cx="{top[0]:.1f}" cy="{top[1]:.1f}" r="5" fill="#fff"/>')
    # Truck on the route
    sc.shadow(2.6, 6.2, 5.2, 1.6)
    sc.box(2.8, 6.3, 0.35, 3.6, 1.5, 1.9, "steel", stripe=(0.45, 0.6, "#47C5D3"))
    sc.box(6.5, 6.3, 0.35, 1.3, 1.5, 1.4, "navy")
    for wx in (3.4, 5.8, 7.2):
        sc.wheel(wx, 7.82, 0.32, 0.32, depth_bias=2)
    return sc.svg("Conceptual illustration: a delivery truck on distribution routes between locations")


def quality_lab():
    sc = Scene(scale=70, origin=(W / 2 - 40, 250))
    sc.floor(-1, -1, 9, 6, step=1.0)
    sc.shadow(0, 0, 7.2, 2.6)
    sc.box(0, 0, 0, 7.2, 2.6, 1.2, "bench", depth_bias=-20)
    # Test instrument with a results display
    sc.box(0.4, 0.3, 1.2, 2.2, 1.4, 1.3, "steel")
    sc.add(5.0, sc.poly([(0.6, 1.71, 1.55), (2.4, 1.71, 1.55), (2.4, 1.71, 2.3), (0.6, 1.71, 2.3)], "#152F48"))
    chart = [(0.75, 1.72, 1.7), (1.1, 1.72, 1.95), (1.45, 1.72, 1.85), (1.8, 1.72, 2.15), (2.25, 1.72, 2.05)]
    pts = [sc.iso(*p) for p in chart]
    sc.add(5.1, f'<path d="M{" L".join(f"{a:.1f},{b:.1f}" for a, b in pts)}" fill="none" stroke="#47C5D3" stroke-width="3" stroke-linejoin="round"/>')
    # Glass beakers holding granules, and a sample dish
    for i, (bx, fill) in enumerate(((3.4, 0.45), (4.2, 0.3), (5.0, 0.55))):
        sc.cylinder(bx, 1.3, 1.2, 0.3, 0.75, "cyan", glass=True, fill_to=fill, fill_mat="sack", depth_bias=0.5 + i * 0.1)
    sc.cylinder(6.2, 1.6, 1.2, 0.5, 0.08, "steel", depth_bias=1)
    for k in range(9):
        gx = 6.2 + 0.28 * math.cos(k * 0.7) * (0.4 + (k % 3) * 0.25)
        gy = 1.6 + 0.28 * math.sin(k * 0.7) * (0.4 + (k % 3) * 0.25)
        c = sc.iso(gx, gy, 1.3)
        sc.add(9.5, f'<ellipse cx="{c[0]:.1f}" cy="{c[1]:.1f}" rx="6" ry="3.5" fill="#fff" stroke="{INK}" stroke-opacity="0.5" stroke-width="0.8"/>')
    # Report clipboard
    sc.box(3.3, 0.2, 1.2, 1.4, 0.9, 0.05, "steel", depth_bias=-1)
    for k in range(4):
        sc.add(4.2, sc.poly([(3.45, 0.35 + k * 0.18, 1.26), (4.4 - (k % 2) * 0.3, 0.35 + k * 0.18, 1.26), (4.4 - (k % 2) * 0.3, 0.39 + k * 0.18, 1.26), (3.45, 0.39 + k * 0.18, 1.26)], "#AEBCCB", stroke=None))
    return sc.svg("Conceptual illustration: a polymer quality-testing bench with instrument, samples and report")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in (("warehousing", warehousing), ("handling", handling), ("facilities", facilities), ("distribution", distribution), ("quality-lab", quality_lab)):
        with open(os.path.join(OUT, f"{name}.svg"), "w", encoding="utf-8") as f:
            f.write(fn())
        print(name, os.path.getsize(os.path.join(OUT, f"{name}.svg")) // 1024, "KB")
