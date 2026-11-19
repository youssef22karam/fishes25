# IchthyoGenesis · Procedural Fish Lab

Based on [youssef22karam/fishes21](https://github.com/youssef22karam/fishes21), upstream commit `1b8caf5351b9ba66e417cd78637277c453df87cf`. The app retains the 106-species atlas, 17 environments, seeded generation, migration, offspring, and cross-breeding. Reference photos come from the upstream [fish-images library](https://github.com/youssef22karam/fish-images); the guide identifies parent reference photos for generated specimens.

## Run

- `npm install`
- `npm run dev` for live development
- `npm run build` for the static app in `dist/`

**Anatomy presets** include the shark, manta, frogfish, cowfish, flounder, porcupinefish and guppy. The mouth camera, jaw slider, and strike button let you inspect a specific gape. Swimming, breathing, fin motion, and eye tracking can be disabled independently.

## Shared anatomy changes

- The lower jaw uses one rigid hinge blended into the cheek, with matched cleft/rictus weights for the oral surfaces. Teeth are seated behind the bite line. Each species has a proportion-aware articulation limit.
- Paired fin roots are sampled on the body and do not rotate. During each stroke, the moving membrane samples a skin envelope to stay outside the flank. The envelope also follows curved body plans.
- Median fins taper as thin foils with skin-following collars. Cowfish horns are flared lofts rather than attached primitives.
- Mobulid cephalic lobes are an inherited trait: two thin, curved skin blades with a continuous edge, distinct from sensory barbels.
- A matching skin aperture and rounded lid keep orbital tissue out of the iris during gaze and jaw motion.

## Verification

- `npx tsc --noEmit`
- `npx tsx tools/anatomy-qa.ts` checks the whole atlas plus seeds spanning every environment and several inherited variants. Use `focused` to check the regression presets and descendants.
- With the app running, `npx playwright install chromium` and `node tools/lab-browser.mjs` exercise the viewer, presets, generation, and responsive panels.

The upstream source assembly scripts are retained. After changing `src/engine/model.ts` or `src/engine/shader.ts`, `node tools/split.mjs` refreshes their corresponding source parts. No assembly is needed to run the checked-in application.
