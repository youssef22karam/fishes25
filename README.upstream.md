# IchthyoMorph v17 — hyper-realistic procedural fish generator

React + Vite + Tailwind + Three.js. 106 species, each lofted from morphometrics measured on the
reference photographs of the [fish-images](https://github.com/youssef22karam/fish-images) library
(the app loads those photos directly from the library via jsDelivr for side-by-side comparison).

## What changed in v17 — natural colour & pattern, batoid anatomy
**Pigment painter rebuilt (`engine/skin.ts`)** – the skin no longer looks hand-painted:
- Every layer is drawn on a scratch sheet and composited with its own feathering, so overlapping shapes never double up
  and edges are soft like chromatophore fields. Outlines are noise-displaced: bars are ragged and can break into dashes
  (`rough`, `brk`, `taper`, `wf`), stripes wander, spots are irregular blobs spread by dart throwing (even, never
  overlapping – `irr`, `el`, `even`, `bias`), rings can be hollow (`hole`).
- New layers: `mottle` (warped-fbm camouflage, marbling, saddles), `vermic` (labyrinth lines – discus, humphead wrasse),
  `line` / `patch` (smooth head streaks, masks, ear flaps, palettes), `row` (scutes, spot rows, photophores),
  `eyeband` (bar through the eye at its true station).
- Smooth S-shaped countershading, natural large/medium-scale tonal drift on every fish, a pale blind side on flatfishes.
- Batoid ventral face painted *and* embossed: nostrils under the nasal curtain, the transverse mouth, five pairs of gill
  slits (stingray, skate), long ventral gill slits (manta), nostrils + slits around the sawfish's ventral mouth.

**Shader (`engine/shader.ts`)** – the pigment field is warped per pixel (organic edges at any zoom); on scaled fishes the
pattern is quantised to the scale mosaic (chromatophores lie under each scale, sampled with `textureGrad`); coloured
pigment is granular (xanthophores / erythrophores); melanophore stippling thickens inside dark marks.

**Palettes (`data/palkit.ts`, `data/palettes{1,2,3}.ts`)** – all 106 species re-coloured from their reference photographs:
body, head marks, every fin (colour, tip, margin, spots/bands, ocelli), iris, rostrum and appendages.

**Anatomy**
- Sawfish: the rostrum is a rigid lever continuing the head's tangent (no more wavy saw – applies to every bill, sword and
  paddle), and the body swims with the new `selachian` mode (stiff trunk, < 1 wavelength, tail-driven) instead of eel-like
  anguilliform waves.
- Manta: the cone "horns" are replaced by true cephalic fins – flat blades flanking the terminal mouth, rolled into a
  scoop that curls inward at the tip (black outside, pale on the oral face), gently flexing as it swims.
- Stingray & skate now have their ventral mouths (see above).
- `iridescenceThicknessMinimum/Maximum` (three r187 API) replace the removed `iridescenceThicknessRange`.

## What changed in v16 — true species silhouettes (body & head shape)
Until v15 every body came out of one two-piece formula (rise to the deepest point → cosine fall to the
peduncle). That can only make symmetric spindles, so a lionfish, a perch and a gourami all ended up as the same
torpedo/egg, and long snouts were a tube unioned onto the head (the butterflyfish's eye sat in a funnel "neck").

**Explicit lateral outlines (`BodySpec.prof`, `engine/profile.ts`, `data/outlines{1,2}.ts`)**
- Each species now carries its own dorsal and ventral silhouette as measured points `[s, y, …]`
  (s = snout tip → caudal base, y = distance from the snout axis). 97 species have one; rays, billfishes,
  paddlefish, sawfish and angelshark keep their dedicated disc / rostrum lofts.
- Monotone cubic (Fritsch–Carlson) interpolation: passes through every point and never overshoots, so a
  straight arowana back stays straight and a perch's nuchal hump stays a hump. The abscissa is warped `s^n`
  so the snout tip is a bluff forehead (`n≈0.45`), a rounded snout (`0.62`) or a wedge (`0.85`); the curve is
  tabulated and lightly diffused so curvature — and shading — is continuous.
- The outline is normalised to the measured body depth, and depth / deepest stations / peduncle depth & offset
  are read back off the curve, so fins, caudal joint, gills, jaws, eyes, skin and the UI all agree with it.
  Everything attached to the body is positioned through `BodyModel`, so fin roots and fillets follow the new
  skin automatically.
- Forceps and pipette snouts (butterflyfish, seahorse, seadragons, pipefish) are simply the front of the
  outline — no more attached tube. The bay pipefish finally has its snout.

**Plan-view (dorsal) shape**
- *Head fullness law*: a fish is widest across the gill covers, not where it is deepest. Deep compressed
  species keep a head nearly as thick as the trunk; slender snouts stay round instead of collapsing to a blade.
- *Orbit law fixed*: it used a width/depth **ratio** along the whole head, which ballooned big-eyed fishes into
  a "lollipop" head wider than the trunk. It is now an absolute floor at the eye, capped by the trunk width.

**Species corrections that go with the outlines**
- Copperband butterflyfish: steep concave forehead, eye inside the head (one diameter under the forehead, above
  the jaw axis), eye-band through the eye, bars re-spaced. · Northern pike: blunt deep-jawed duck-bill, parallel
  trunk, fins far back. · Red lionfish: big head, comet taper, banded fan pectorals, barred head. · Pearl gourami:
  compressed oval, long rising anal fin, thread pelvics, forked tail. · Weedy seadragon: deep keeled trunk,
  arched neck, paddle appendages. · Yellow perch: humped back, long slim peduncle. · plus arowana, tarpon, carp,
  mahi-mahi, triggerfish, catfishes, sharks, gobies, anglers and the rest.
- New fin shape `thread` (gourami / angelfish / oarfish feelers), `fronds.style: 'paddle'`.

**Tools**
- `tools/render.ts` — offline QA: builds every fish with the real engine and software-rasterises the actual
  meshes (lateral + dorsal) into contact sheets. `tools/check.ts` — NaN / landmark integrity check for all species.
- `tools/split.mjs` — inverse of `reassemble.mjs`; run it after editing `model.ts` / `shader.ts`.

## What changed in v15 — eyes and gills rebuilt as organs
**Eyes (`engine/eyes.ts`, eye stages of `engine/shader.ts`)**
- A real globe that *turns in its socket* (vertex shader rotation about the globe centre, per-eye uniforms):
  spherical where exposed, oblate behind the lids. Lens dome standing in the pupil, recessed iris dish,
  limbus, clear corneal bulge → depth, parallax and separate highlights from every angle.
- Protrusion is a species character (`eyeForm`): flush under the skin (tunas, sharks) · low dome (most fishes) ·
  half-ball (gobies, blennies, flatfishes, frogfishes, seahorses, puffers) · periscope turrets looking sideways
  (mudskipper, stingrays). The globe curvature also adapts to the measured curvature of the skull at the orbit,
  so big-eyed small fishes get domed eyes instead of goggles.
- Orbit = head skin shrink-wrapped from the lid margin over the ball down onto the skull (same texture and
  integument, welded normals, S-profile fillet, contact shadow).
- Iris is fish tissue, not a human iris: guanine argentea with tilted platelets, discrete melanophores crowded
  on the dorsal cap, bright pupillary margin, dark limbal ring. Pupils: round · pear (aphakic space of pursuit
  predators) · vertical slit (sharks) · horizontal oval (mudskipper, gobies, catfishes) · crescent with scalloped
  operculum pupillare (rays, flatfishes). Tapetum eyeshine (sharks, walleye, deep-sea fishes), adipose eyelid
  (herrings, mackerels, bonefish), iridescent cornea (gobies, flatfishes, puffers).
- Fixational drift + tremor on top of the saccades. New optional `EyeSpec` fields: `pupil`, `shine`, `adipose`.

**Gills (`engine/gills.ts`, `BodyModel.gills`)**
- The flank under every gill cover is recessed into a real gill chamber; the cover (operculum + opercular
  membrane) is a thin shell that continues the head skin exactly and ends in a free hind margin overlapping
  the shoulder girdle. The margin is a true crescent: nape → HL at mid flank → forward under the cheek to the isthmus.
- Inside: stacked gill arches (bony arch + rakers + combs of blood-red filaments with secondary lamellae),
  dark vascular lining, pale inner membrane. Breathing swings the cover out about its front hinge, the arches
  fan into the opening slit and light falls into the chamber; a strike flares everything.
- Opening types by taxon (`Species.gill.kind` overrides): `opercle` · `restricted` slit in front of the pectoral
  base (eels, gobies, mudskipper, puffers, triggerfish, cowfish, sunfish, ratfish) · `pore` (morays, seahorses,
  anglerfishes – in the pectoral axil) · `slits` (sharks: five pockets with moving septal flaps).
- The pectoral fin is seated on the shoulder girdle *behind* the opening (`BodyModel.pecStation`), shark slits
  end above the fin base → gill covers and side fins can never overlap.
- Stills: `?breath=0..1.5` holds the gill covers, `?gaze=yaw,pitch` holds the eyes, `?dir=x,y,z` free camera direction.

## What changed in v12
**Mouth fixes (wrasses, parrotfishes and every small-mouthed species)**
- Premaxillary protrusion, lip cushions and hyoid/throat depression now scale with the measured jaw
  (they were absolute: a 3 %-SL parrotfish mouth slid forward 78 % of its own length → needle snout).
- Protrusion fades to zero at the rictus → no more cheek slit behind the mouth corner.
- Lower-jaw skinning stops at the quadrate joint → throat skin no longer swings up into the head.
- Lower-lip tube winding fixed (it rendered inside-out → crumpled look).
- Parrotfish/puffer beaks are solid fused dental plates (species beak colour).

**Fins — part of the body, jointed, moving**
- Every fin is a closed two-layer shell: a fleshy root fillet that starts exactly on the body skin
  (and carries the body's own scale texture), bony rays raised on both faces, accordion pleats,
  translucent membrane with ray segmentation/branching, patterns (spots, leopard, bands, net, ray spots)
  and frayed margins.
- Caudal root continues the peduncle surface exactly; procurrent rays; new `delta` tail; corrected
  `rounded`/`halfmoon` outlines.
- 3D spines on spiny fins (+ perciform anal/pelvic spines), guppy gonopodium.
- Joints in the vertex shader: pectorals/pelvics row + feather from a ball joint at the fin base
  (labriform swimmers row hard), median fins ripple, the caudal cups/flexes and the body wave
  continues through long tails.

**Eyes** — gaze-driven globe (procedural iris fibres, pupillary ring, limbus, round pupil) under a clear
cornea, seated in a skin socket; saccades, independent left/right drift, convergence + pupil dilation
during the feeding strike.

## Layout (every file < 30 kB — no reassembly step needed)
- `src/engine/model.ts` analytic body model · `build.ts` body loft + orchestration
- `mouth.ts`, `eyes.ts`, `gills.ts`, `fins.ts`, `extras.ts` (rostra, barbels, spikes, fronds), `geom.ts`, `shader.ts`, `skin.ts`
- `src/data/species{1,2,3}{a,b}.ts` species data · `factory.ts` archetypes

URL parameters: `?sp=guppy&view=side|three|front|top|below&gape=0..1&feed=0|1&swim=0|1&fins=0|1&eyes=0|1&zoom=2&focus=0.9`.

```sh
npm install && npm run dev   # or npm run build
```
