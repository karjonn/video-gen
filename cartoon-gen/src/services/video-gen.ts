import { falSubscribe } from "./fal";
import { buildVideoPrompt } from "@/prompts/video-prompt";
import type { SceneDef } from "@/types/storyboard";

interface VideoGenResult {
  videoUrl: string;
}

interface KlingResponse {
  video: { url: string };
}

export async function generateSceneVideo(
  scene: SceneDef,
  onProgress?: (status: string) => void
): Promise<VideoGenResult> {
  if (!scene.imageUrl) throw new Error("Scene image must be generated first");

  const prompt = buildVideoPrompt(scene);

  const result = await falSubscribe<KlingResponse>(
    "fal-ai/kling-video/v2.5-turbo/standard/image-to-video",
    {
      prompt,
      image_url: scene.imageUrl,
      duration: "10",
      negative_prompt:
        "blur, distort, low quality, rapid motion, warping, morphing",
      cfg_scale: 0.5,
    },
    onProgress
  );

  return { videoUrl: result.video.url };
}

export async function generateAllVideos(
  scenes: SceneDef[],
  concurrency: number = 2,
  onVideoDone: (index: number, result: VideoGenResult) => void,
  onVideoError: (index: number, error: Error) => void
): Promise<void> {
  const queue = scenes.filter((s) => s.imageUrl);
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const scene = queue.shift()!;
      try {
        const result = await generateSceneVideo(scene);
        onVideoDone(scene.index, result);
      } catch (err) {
        onVideoError(scene.index, err as Error);
      }
    }
  });
  await Promise.allSettled(workers);
}
