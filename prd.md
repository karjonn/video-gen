PRD: CartoonGen — Automated Nursery-Rhyme Storyboard → Scene Images → Short Video Clips

1) Problem statement

We produce children's cartoons from nursery rhymes. Today the workflow is manual:
	1.	Receive rhyme audio + English script
	2.	Manually create short AI-generated cartoon scenes
	3.	Stitch clips in a video editor + add the audio

We need to automate everything up to generating ready-to-stitch video clips, so a producer can provide only the English script and get:
	•	consistent character reference images
	•	scene images with those characters
	•	short video clips (e.g., ~10 seconds each)
	•	a structured storyboard JSON (for reproducibility)

2) Goals
	•	Input: English script text (plain text nursery rhyme lyrics)
	•	Output (downloadable as ZIP):
		•	storyboard JSON (scenes + character bible)
		•	character reference images (consistent look across all scenes)
		•	scene images (consistent characters + consistent style)
		•	short scene video clips generated from scene images
	•	Ensure characters remain consistent (same face, hair, outfit) across all scenes.
	•	Provide a web-based UI that requires zero setup — open a URL and start generating.
	•	Allow human review and editing at every stage before proceeding.
	•	Make outputs reproducible (store seeds + prompts in storyboard JSON).

3) Non-goals (explicitly not building now)
	•	Automatic audio-to-scene timing / forced alignment (later)
	•	Automatic final timeline assembly (Premiere/Resolve) (later)
	•	Multi-language translation (script is already provided in English)
	•	Lip-sync or complex character animation (only subtle motion)
	•	Backend server / API proxy (all calls made directly from browser)
	•	User accounts or authentication (users provide their own API keys)

4) Target user
	•	A producer who has an English script and needs scene clips quickly.
	•	A video editor who stitches clips + audio afterward.
	•	Technical enough to have their own OpenAI + fal.ai API keys.

5) High-level pipeline (what we will build)

Step A — Script → Storyboard (GPT-4o via OpenAI API)
	•	Take the English script and generate a structured storyboard JSON:
		•	a Character Bible for each recurring character (Indian characters only)
		•	a list of Scenes (each scene has: prompt, setting, actions, camera, duration, characters present)
	•	User reviews and can edit all generated content before proceeding.

Step B — Character Reference Generation (fal.ai)

Generate canonical character images with Ideogram V3 Character on fal:
Model: fal-ai/ideogram/character

Outputs:
	•	1 full-body reference image per character
	•	User can edit character descriptions and regenerate individual characters.

Step C — Scene Image Generation (fal.ai)

Generate each scene image using Ideogram V3 Character to preserve identity:
Model: fal-ai/ideogram/character

For scenes with multiple characters, use multi-pass inpainting:
Model: fal-ai/ideogram/character/edit

	•	Pass 1: Generate scene with primary character's reference image
	•	Pass 2+: For each additional character, use character/edit with a programmatically generated mask and that character's reference image

Note: The Ideogram Character and Character Edit APIs only support 1 character reference per call. Multi-character scenes require sequential inpainting passes.

Inputs:
	•	Character reference image(s)
	•	Scene prompt (includes global style block + per-scene details)

Outputs:
	•	One final scene image per scene (PNG)
	•	User can edit scene descriptions and regenerate individual scenes.

Step D — Scene Image → Video Clip (fal.ai)

Convert each scene image into a short video clip using Kling 2.5 Turbo Standard (Image-to-Video) on fal:
Model: fal-ai/kling-video/v2.5-turbo/standard/image-to-video

Outputs:
	•	MP4 per scene (5 or 10 seconds)
	•	User can download individually or as a ZIP archive.

6) Animation / visual style (locked — no choices)

We want a consistent feature-quality family 3D animation look:
	•	warm cinematic lighting, soft global illumination
	•	friendly stylized proportions (child-safe)
	•	clean, appealing surfaces (not photoreal)
	•	whimsical fairytale mood, saturated but gentle palette
	•	consistent camera language (wide/medium shots, minimal extreme angles)

This style is implemented purely via prompting + model choice and applied to:
	•	all character refs (Step B)
	•	all scene images (Step C)
	•	all video prompts (Step D)

7) Exact model choices (no alternatives)
	•	Storyboard (A): OpenAI GPT-4o (via openai JS SDK, browser mode)
	•	Characters (B): fal-ai/ideogram/character (via @fal-ai/client JS SDK)
	•	Scenes (C): fal-ai/ideogram/character + fal-ai/ideogram/character/edit (for multi-character)
	•	Video (D): fal-ai/kling-video/v2.5-turbo/standard/image-to-video
	•	fal API calling approach: @fal-ai/client with fal.subscribe() for queue-based async handling

8) System architecture

8.1 Overview

CartoonGen is a frontend-only single-page application (SPA). There is no backend server.

	•	Hosted as a static site on GitHub Pages (free)
	•	All API calls made directly from the user's browser
	•	Users provide their own API keys (OpenAI + fal.ai)
	•	API keys stored in browser localStorage (never sent to any server we control)
	•	Project state persisted in localStorage across browser sessions

8.2 Tech stack
	•	React 19 + TypeScript
	•	Vite (build tool)
	•	Tailwind CSS + shadcn/ui (component library)
	•	Zustand (state management with localStorage persistence)
	•	Zod (storyboard JSON validation)
	•	JSZip + file-saver (ZIP download)
	•	Lucide React (icons)
	•	Dark mode only

8.3 API integration (browser-direct)

OpenAI:
	import OpenAI from "openai";
	const client = new OpenAI({ apiKey: userKey, dangerouslyAllowBrowser: true });

fal.ai:
	import { fal } from "@fal-ai/client";
	fal.config({ credentials: userFalKey });
	const result = await fal.subscribe("fal-ai/ideogram/character", { input: {...} });

8.4 State management

Two Zustand stores with persist middleware:

	1. Settings Store: API keys + validation status
	2. Project Store: script, storyboard (characters + scenes), per-item generation status/URLs/errors, wizard step

On rehydration (page reload), any items stuck in "generating" status are reset to "idle".

9) Functional requirements

9.1 Web UI — 6-step wizard

The app is a linear wizard with Back/Next navigation:

Step 1 — API Keys
	•	Two masked input fields: OpenAI API key + fal.ai API key
	•	Show/hide toggle per field
	•	"Validate" button per key (OpenAI: call models.list(); fal: attempt a lightweight call, check for auth errors)
	•	Both keys must validate before user can proceed
	•	Keys persist in localStorage

Step 2 — Script Input
	•	Large textarea for plain text nursery rhyme lyrics
	•	"Generate Storyboard" button triggers GPT-4o call
	•	Loading spinner during generation (~5-10 seconds)

Step 3 — Storyboard Review
	•	Two sections:
		•	Characters row: horizontal scrollable cards, one per character
		•	Scenes row: vertical list of cards, one per scene
	•	All text fields are inline-editable (click to edit, blur/Enter to save)
	•	Add character / Add scene buttons
	•	Delete button per card
	•	All edits persist to store immediately

Step 4 — Character Images
	•	For each character:
		•	Editable description text box (the image prompt)
		•	Generated image below (or loading skeleton)
		•	"Regenerate" button (re-calls fal.ai with updated description)
	•	On entering this step, generation starts automatically for all characters in parallel
	•	1 full-body reference image per character

Step 5 — Scene Images
	•	For each scene:
		•	Editable prompt text box
		•	Generated scene image (or loading skeleton)
		•	"Regenerate" button per scene
	•	Generation runs in parallel with concurrency limit (max 3 simultaneous)
	•	Multi-character scenes use multi-pass inpainting (see Section 10)

Step 6 — Video Output
	•	Grid of video thumbnails (scene image used as thumbnail)
	•	Click thumbnail to play video in a dialog
	•	Progress bar: "X of Y videos generated"
	•	Individual download button per video
	•	"Download All" button: bundles everything into a ZIP:
		•	characters/<char_id>.png
		•	scenes/images/scene_01.png, scene_02.png, ...
		•	scenes/videos/scene_01.mp4, scene_02.mp4, ...
	•	Video generation runs in parallel with concurrency limit (max 2 simultaneous)

9.2 Storyboard JSON schema

The GPT-4o output must conform to:

{
  "title": "string",
  "characters": [
    {
      "id": "char_<lowercase_name>",
      "name": "string",
      "role": "string (e.g., child, mother, animal)",
      "identityLock": {
        "ethnicity": "Indian",
        "skinTone": "warm brown (specific shade)",
        "hair": "specific hair description",
        "outfit": "specific outfit description",
        "accessories": ["list"],
        "age": "number as string",
        "faceNotes": "specific facial features"
      }
    }
  ],
  "scenes": [
    {
      "index": 1,
      "durationSeconds": 10,
      "charactersPresent": ["char_id"],
      "setting": "specific location description",
      "action": "what happens in this scene",
      "camera": "shot type and angle",
      "prompt": "FULL image generation prompt",
      "videoMotionPrompt": "subtle motion description"
    }
  ]
}

Validated with Zod on receipt from GPT-4o.

9.3 Character generation (B)

For each character:
	•	Generate 1 full-body reference image via fal-ai/ideogram/character
	•	Prompt built from: global style block + character identity lock + "full body, neutral friendly pose"
	•	Store resulting image URL + seed in project store

9.4 Scene image generation (C)

For each scene:
	•	Single-character scene: call fal-ai/ideogram/character with scene prompt + character ref image
	•	Multi-character scene (see Section 10 for details):
		•	Pass 1: Generate with primary character's reference
		•	Pass 2+: Use fal-ai/ideogram/character/edit with mask + next character's reference
	•	Prompt includes: global style block + character identity reminders + setting + action + camera

9.5 Video generation (D)

For each scene image:
	•	Call Kling image-to-video with:
		•	image_url: the scene image URL from fal.ai CDN
		•	prompt: video motion prompt from storyboard
		•	duration: "10" (10 seconds)
		•	negative_prompt: "blur, distort, low quality, rapid motion, warping, morphing"

10) Multi-character scene strategy

The Ideogram Character API and Character Edit API each only accept 1 character reference image per call. For scenes with multiple characters:

	1.	Pass 1: Generate the full scene using fal-ai/ideogram/character with the primary (first) character's reference image. The prompt describes ALL characters present.

	2.	Pass 2+: For each additional character:
		a.	Generate a mask image using the browser Canvas API:
			•	Black fill (keep everything)
			•	White rectangle where the new character should be placed
			•	Character zones are calculated by dividing the frame width equally among characters
			•	Characters occupy the lower 80% of the frame height
		b.	Upload the mask via fal.storage.upload()
		c.	Call fal-ai/ideogram/character/edit with:
			•	image_url: current scene image (from previous pass)
			•	mask_url: the generated mask
			•	reference_image_urls: [this character's ref image]
			•	prompt describing this character being added to the scene

	3.	The final output is the result of the last pass.

11) Prompting specification (locked templates)

11.1 Global style block (prepend to every image prompt)

"feature-quality family 3D animation look, warm cinematic lighting, soft global illumination, gentle color harmony, whimsical fairytale atmosphere, clean stylized surfaces, friendly child-safe character design, expressive faces, smooth shading, high coherence"

11.2 Global negative block (append to every image prompt)

"no text, no subtitles, no watermark, no logo, no photorealism, no horror, no gore, no deformed faces, no extra fingers, no blurry, no low quality"

11.3 Character reference prompt template (B)

Built from:
	•	Global style block
	•	"Full-body character reference sheet of [Name], a [age]-year-old Indian [role]."
	•	Skin tone, hair, outfit, accessories, face notes from identity lock
	•	"Standing in a neutral friendly pose, facing slightly to the right, full body visible head to toe."
	•	"Clean background, character centered, high detail on face and clothing."
	•	"This character must look identical in every scene."

11.4 Scene prompt template (C)

Built from:
	•	Global style block
	•	"Scene: [setting]. Action: [action]. Camera: [camera]."
	•	Character descriptions for all characters present (from identity lock)
	•	"Use the same character identity as the reference image."

11.5 Video motion prompt template (D)

Default for every scene:

"subtle breathing, gentle blinking, slight head turn, minimal body movement, slow camera push-in, stable face, no warping, no rapid motion"

Scene-specific overrides come from the storyboard's videoMotionPrompt field.

12) Reliability / retries

	•	Every fal.ai API call wrapped with:
		•	3 retries with exponential backoff (1s, 2s, 4s)
		•	No retry on auth errors (401/403) or validation errors (422)
		•	Retry on transient errors (network, 500, timeout)
	•	Per-item error tracking: each character/scene/video has its own status + error field
	•	Failed items show a "Retry" button in the UI; user can retry individually
	•	On page reload, items stuck in "generating" reset to "idle"

13) Security requirements

	•	API keys stored in browser localStorage only
	•	Keys are sent directly and exclusively to OpenAI API and fal.ai API (HTTPS)
	•	No keys are ever sent to any server we control (there is no backend)
	•	No keys are logged or included in error reports
	•	Scripts are not uploaded to any third-party storage except as required for model calls

14) Deployment

	•	Static SPA hosted on GitHub Pages (free)
	•	Built with Vite → produces a dist/ folder of static assets
	•	GitHub Actions workflow: on push to main → build → deploy to Pages
	•	No environment variables needed on the server (all config is user-provided at runtime)
	•	Base URL configured in vite.config.ts to match the GitHub repo name

15) Acceptance criteria

A run is considered successful if:
	1.	Storyboard is generated with at least 1 character and the requested number of scenes
	2.	For each character, a reference image is generated and displayed
	3.	For each scene, a scene image is generated and displayed
	4.	For each scene, a video clip is generated and playable
	5.	Characters visually remain consistent scene-to-scene (manual QA)
	6.	"Download All" produces a valid ZIP with the correct folder structure
	7.	All edits (character descriptions, scene prompts) persist across page reload
	8.	The app works entirely in the browser with no backend dependency

16) Milestones (implementation phases)
	1.	Phase 1: Project scaffold (Vite + React + Tailwind + shadcn/ui + Zustand)
	2.	Phase 2: Types, stores, Zod schema
	3.	Phase 3: Wizard shell + navigation
	4.	Phase 4: API keys page with validation
	5.	Phase 5: Script input + GPT-4o storyboard generation
	6.	Phase 6: Storyboard review page (editable cards)
	7.	Phase 7: Character image generation
	8.	Phase 8: Scene image generation (incl. multi-character inpainting)
	9.	Phase 9: Video generation
	10.	Phase 10: ZIP download, error handling polish, GitHub Pages deployment

---

Notes for the developer (important context)
	•	We are intentionally using fal.ai because it provides standardized model endpoints + async handling.
	•	Kling 2.5 Turbo Standard on fal is the required image-to-video model endpoint.
	•	Ideogram Character + Character Edit are the required models to maintain character consistency.
	•	The Ideogram Character Edit API only accepts 1 character reference per call — multi-character scenes require the multi-pass inpainting approach described in Section 10.
	•	The @fal-ai/client JS SDK supports browser usage with fal.config({ credentials: key }).
	•	The OpenAI JS SDK supports browser usage with dangerouslyAllowBrowser: true.
	•	All characters are Indian — this is hardcoded into the GPT-4o system prompt.
	•	The visual style is locked and non-configurable — implemented via prompt templates.

fal.ai API payload reference:

Ideogram Character (fal-ai/ideogram/character):
	Input: { prompt, reference_image_urls?, rendering_speed, style, image_size, num_images, negative_prompt, seed? }
	Output: { images: [{ url, content_type }], seed }

Ideogram Character Edit (fal-ai/ideogram/character/edit):
	Input: { prompt, image_url, mask_url, reference_image_urls, rendering_speed, style, num_images, seed? }
	Output: { images: [{ url }], seed }

Kling Image-to-Video (fal-ai/kling-video/v2.5-turbo/standard/image-to-video):
	Input: { prompt, image_url, duration ("5"|"10"), negative_prompt, cfg_scale }
	Output: { video: { url } }
