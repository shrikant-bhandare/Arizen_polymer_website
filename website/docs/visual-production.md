# Visual production plan — Google Flow, Veo & Nano Banana

The website ships with **stand-in visuals** made procedurally (no stock, no AI, no claims):

| Asset | Stand-in shipped | Where it lives |
|---|---|---|
| Hero film | 10 s seamless loop: clear granules dissolving into white granules, slow push-in, rack focus, light sweep, drifting particles | `client/public/media/hero/` (`hero-1080.webm`, `hero-1080.mp4`, `hero-720.mp4`, posters) |
| Product visuals | Macro granule renders for HIPS (white), ABS (ivory), HDPE (translucent), PS (clear crystal) | `client/public/media/products/` |
| Molecular animation | Live SVG polymer chain (backbone + benzene rings), drawn on scroll | `client/src/components/motion/Molecule.tsx` |
| Industrial visuals | Isometric technical illustrations: warehousing, handling, facilities, distribution, quality lab, all **labelled "Conceptual illustration"** on the site | `client/public/media/illustrations/` |

They are good enough to launch with. This document is the brief for replacing them with
Google Flow footage when a Google account with Flow access is available. **Nothing on the
website depends on Google Flow at runtime**: generated files are downloaded, optimised and
committed like any other asset.

> **Rules that apply to every generated asset**
> - AI imagery must never be presented as Arizen's real premises, people, equipment or certificates.
>   Facility and quality visuals stay marked **conceptual** in the CMS (the "conceptual illustration"
>   switch on each image) until replaced with real photographs.
> - No text, logos, brand names, labels, numbers, flags or people's faces in generated frames.
> - Do not depict certifications, test results or specification values.
> - Keep the palette: midnight navy `#101D2B`, industrial blue `#152F48`, corporate blue `#2868A0`,
>   cyan accent `#47C5D3`, silver `#E5EBF0`.

---

## A. Hero film (Google Flow → Veo)

**Tool:** Google Flow (https://labs.google/fx/tools/flow), model Veo, 16:9, highest available quality.
**Length:** generate 3 shots of 8 s, cut to a 10–12 s loop. **No audio** (the site plays it muted).

**Style frame (Nano Banana / Imagen, use as Flow "ingredient" for consistency):**
> Extreme macro photograph of clear and white polymer resin granules piled on a dark surface, deep midnight-navy and steel-blue studio lighting, a single cool cyan rim light, shallow depth of field, crisp specular highlights on glossy pellets, floating dust motes catching light, premium industrial product photography, cinematic, 16:9, no text, no logos.

**Shot 1 — Arrival (8 s)**
> Slow cinematic dolly forward over a bed of clear crystal polystyrene granules, extreme macro, deep navy and steel-blue lighting, cyan rim light sweeping slowly across glossy pellet edges, shallow depth of field with focus gliding from foreground to mid-ground, tiny particles drifting upward in slow motion, smooth stabilised camera, premium commercial cinematography, no text, no people.

**Shot 2 — Transformation (8 s)**
> Continuous extreme macro of polymer granules as clear crystal pellets gradually turn opaque white and ivory in place, a soft wave of light passing through the bed, abstract molecular lines faintly forming above the pellets and dissolving, deep navy background, slow motion, elegant and restrained, cinematic depth of field, no text.

**Shot 3 — Structure (8 s)**
> Abstract scientific visualisation: glowing cyan polymer molecular chains with hexagonal benzene rings assembling slowly in dark navy space, fine connected particles, gentle camera orbit, shallow depth of field, minimal and premium, matches macro granule footage colour grade, no text.

**Edit & export**
1. In Flow, use *Extend*/*Scenebuilder* to join shots; trim so the last frame matches the first (or cross-fade 1 s) for a seamless loop.
2. Download the highest-quality MP4.
3. Encode for the web (keep the file names so no code changes are needed):

```bash
ffmpeg -i flow-hero.mp4 -an -vf "scale=1920:1080:flags=lanczos" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart client/public/media/hero/hero-1080.mp4
ffmpeg -i flow-hero.mp4 -an -vf "scale=1280:720:flags=lanczos"  -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart client/public/media/hero/hero-720.mp4
ffmpeg -i flow-hero.mp4 -an -vf "scale=1920:1080:flags=lanczos" -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 client/public/media/hero/hero-1080.webm
ffmpeg -i flow-hero.mp4 -frames:v 1 -q:v 3 client/public/media/hero/hero-poster.jpg
```

Then regenerate `hero-poster.webp` and `hero-poster-960.webp` from the poster (any image tool, quality ~78).
Targets: 1080p under ~6 MB, 720p under ~3 MB. Keep the **left third darker**: the headline sits there.

---

## B. Product visuals (Nano Banana / Imagen, 4:3, 2400 × 1800)

Use one shared lighting set-up so the four images read as a family.

**Shared suffix:** *extreme macro product photograph, granules filling the frame, shallow depth of field with a crisp middle band, soft key light from top-left, cool cyan rim light, deep navy background visible only in gaps, premium industrial studio photography, 4:3, no text, no logos, no packaging.*

| Product | Prompt (prepend to the shared suffix) | File |
|---|---|---|
| HIPS | Opaque bright-white high impact polystyrene pellets, matte satin surface, cylindrical strand-cut shape | `hips.webp` |
| ABS | Ivory / natural cream ABS pellets with a smooth slightly glossy surface | `abs.webp` |
| HDPE | Translucent milky-white HDPE pellets, lens-shaped, waxy sheen, light glowing through thin edges | `hdpe.webp` |
| Polystyrene granules | Crystal-clear general-purpose polystyrene granules, glass-like, refracting light, bright edge highlights | `gpps.webp` |

**Better still:** photograph Arizen's actual material samples in a lightbox using this same brief.

**Install:** save as WebP (quality ~82, 1800 px wide) into `client/public/media/products/`, then run
`node scripts/build-image-variants.mjs` to regenerate the 480/960/1600 WebP and AVIF sizes. Or upload
through **Media library** in the dashboard and choose the image on each product.

---

## C. Molecular & abstract visuals

The site animates its own SVG molecules, so no files are required. Optional extras:

> Abstract network of connected geometric particles and polymer chain structures, thin cyan and silver lines on deep navy, elegant, minimal, wide 21:9 banner, generous negative space on the left, no text.

Use as a section background through the CMS (keep it subtle; text must stay readable).

---

## D. Industrial visuals (conceptual until real photos exist)

Generate only as **clearly conceptual** imagery; keep the "conceptual illustration" switch on in the CMS.

| Section | Prompt |
|---|---|
| Warehousing | Clean modern industrial warehouse, tall blue pallet racking stacked with white woven polymer bags on wooden pallets, polished concrete floor, cool daylight from high windows, no people, no signage, no text, wide 4:3 |
| Material handling | Electric pallet truck moving a pallet of white bagged polymer granules across a clean warehouse floor, motion blur on wheels only, no people's faces, no logos, 4:3 |
| Industrial facility | Exterior of a modern industrial distribution facility at blue hour, loading bays with closed shutters, two steel silos, navy sky, no signage, no text, 4:3 |
| Quality testing | Polymer quality-control lab bench: beakers holding clear and white granules, a melt-flow tester, a laptop with an abstract chart, clean white surfaces, cool lighting, no people, no readable numbers, 4:3 |
| Distribution | A delivery truck on an open highway at dusk, motion blur, navy and cyan tones, no logos or registration plates, 4:3 |

**Real photography shot list for Arizen** (replaces all of the above):
facility exterior · storage bays · racking with stock · forklift / pallet handling · loading bay with a vehicle ·
QC lab and instruments · sample testing in progress · team at work (with consent) · director portrait ·
packaged product · close-up of each material.

---

## Quality bar

- No artefacts: melted pellets, warped shelves, garbled text, extra wheels.
- Consistent grade across all assets (navy shadows, cool highlights, one cyan accent).
- Faces: none in AI imagery. Real staff photos only with written consent.
- Before publishing any image, add alt text in the media library.
