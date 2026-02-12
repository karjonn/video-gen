import type { StoryboardJSON } from "@/types/storyboard";

export const MOCK_SCRIPT = `Chanda Mama door ke,
Puye pakaye boor ke,
Aap khaye thali mein,
Munne ko de pyali mein.

Chanda Mama aao na,
Ek chamak dikhao na,
Gol matol pyara sa,
Ek sapna dikhao na.`;

export const MOCK_STORYBOARD: StoryboardJSON = {
  title: "Chanda Mama - Moon Uncle",
  characters: [
    {
      id: "char_munna",
      name: "Munna",
      role: "child",
      identityLock: {
        ethnicity: "Indian",
        skinTone: "warm golden brown",
        hair: "black, short and slightly curly",
        outfit: "bright yellow kurta with red embroidery and white pajama",
        accessories: ["small gold earring in left ear"],
        age: "5",
        faceNotes:
          "round chubby cheeks, big sparkling brown eyes, small nose, wide happy smile with dimples",
      },
    },
    {
      id: "char_chanda",
      name: "Chanda Mama",
      role: "magical moon uncle",
      identityLock: {
        ethnicity: "Indian",
        skinTone: "soft glowing golden",
        hair: "silver white, flowing and luminous",
        outfit:
          "shimmering white dhoti and silver kurta with crescent moon patterns",
        accessories: ["crescent moon crown", "glowing silver staff"],
        age: "45",
        faceNotes:
          "kind warm face, gentle crinkled eyes, round nose, soft glowing aura around face, wise smile",
      },
    },
    {
      id: "char_amma",
      name: "Amma",
      role: "mother",
      identityLock: {
        ethnicity: "Indian",
        skinTone: "warm brown",
        hair: "black, long braid with jasmine flowers",
        outfit: "green cotton saree with gold border",
        accessories: ["gold bangles", "small red bindi"],
        age: "30",
        faceNotes:
          "gentle oval face, warm brown eyes, loving smile, beauty mark on left cheek",
      },
    },
  ],
  scenes: [
    {
      index: 1,
      durationSeconds: 10,
      charactersPresent: ["char_munna", "char_amma"],
      setting: "cozy Indian village kitchen at evening, warm lamp light, clay pots on shelf",
      action: "Amma serves food on a big thali plate while Munna sits eagerly at a low wooden table",
      camera: "medium shot, eye level",
      prompt:
        "feature-quality family 3D animation, warm cinematic lighting, cozy Indian village kitchen at evening, warm lamp light, clay pots on shelf. Munna (5-year-old Indian boy, golden brown skin, yellow kurta with red embroidery, chubby cheeks, big brown eyes) sits eagerly at a low wooden table. Amma (Indian mother, green saree with gold border, long black braid with jasmine) serves food on a thali plate. Warm gentle atmosphere.",
      videoMotionPrompt:
        "Amma gently places food on plate, Munna bounces excitedly, warm flickering lamp light",
    },
    {
      index: 2,
      durationSeconds: 10,
      charactersPresent: ["char_munna"],
      setting: "rooftop terrace under a vast starry night sky, village silhouette in background",
      action: "Munna looks up at the bright full moon with wonder, hands clasped together",
      camera: "low angle shot, looking up",
      prompt:
        "feature-quality family 3D animation, warm cinematic lighting, rooftop terrace under vast starry sky, village silhouette. Munna (5-year-old Indian boy, golden brown skin, yellow kurta, chubby cheeks, big sparkling eyes) looks up at bright full moon with wonder, hands clasped together. Magical moonlight bathes the scene.",
      videoMotionPrompt:
        "Munna tilts head up slowly, stars twinkle gently, soft breeze moves his hair",
    },
    {
      index: 3,
      durationSeconds: 10,
      charactersPresent: ["char_chanda", "char_munna"],
      setting: "magical clouds in the night sky, sparkling stars, crescent moon boat",
      action: "Chanda Mama descends from the moon on a beam of light, arms open warmly toward Munna",
      camera: "wide shot, slight low angle",
      prompt:
        "feature-quality family 3D animation, magical clouds in night sky, sparkling stars. Chanda Mama (glowing golden Indian man, silver white flowing hair, white dhoti and silver kurta with moon patterns, crescent crown) descends on a beam of moonlight, arms open warmly. Munna (boy in yellow kurta, chubby cheeks) watches in amazement from below. Magical fairy tale atmosphere.",
      videoMotionPrompt:
        "Chanda Mama floats down slowly, moonlight beam shimmers, Munna's eyes widen with wonder",
    },
    {
      index: 4,
      durationSeconds: 10,
      charactersPresent: ["char_chanda", "char_munna"],
      setting: "flying through a sparkling night sky above Indian village, clouds and stars around them",
      action: "Chanda Mama holds Munna's hand as they fly together through the starry sky",
      camera: "wide shot, side angle",
      prompt:
        "feature-quality family 3D animation, flying through sparkling night sky above Indian village, clouds and stars. Chanda Mama (glowing golden man, silver hair, white dhoti, crescent crown, silver staff) holds hands with Munna (boy in yellow kurta, big brown eyes, chubby cheeks) as they soar together. Trail of sparkles behind them. Magical whimsical atmosphere.",
      videoMotionPrompt:
        "gentle flying motion, clouds drift past, stars sparkle, hair and clothes flutter in wind",
    },
    {
      index: 5,
      durationSeconds: 10,
      charactersPresent: ["char_munna"],
      setting: "Munna's bedroom, moonlight streaming through window, cozy bed with colorful quilt",
      action: "Munna sleeps peacefully with a smile, moonlight casting a gentle glow on his face",
      camera: "close-up shot, slightly above",
      prompt:
        "feature-quality family 3D animation, warm cinematic lighting, cozy bedroom, moonlight streaming through window. Munna (5-year-old Indian boy, golden brown skin, yellow kurta, chubby cheeks, dimples) sleeps peacefully with gentle smile, colorful quilt pulled up. Soft moonbeam on his face. Warm safe atmosphere.",
      videoMotionPrompt:
        "subtle breathing, gentle smile, moonlight slowly shifts, curtain sways slightly",
    },
  ],
};

// Generate a colored placeholder image as a data URL
export function generateMockImage(
  label: string,
  width = 600,
  height = 450,
  bgColor = "#6d28d9"
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Pattern
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < width; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for (let i = 0; i < height; i += 30) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  // Label
  ctx.fillStyle = "white";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("TEST MODE", width / 2, height / 2 - 20);
  ctx.font = "16px sans-serif";
  ctx.fillText(label, width / 2, height / 2 + 15);

  return canvas.toDataURL("image/png");
}

// Simulate API delay
export function mockDelay(ms = 1500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
