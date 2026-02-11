import { DEFAULT_VIDEO_MOTION } from "./style-blocks";
import type { SceneDef } from "@/types/storyboard";

export function buildVideoPrompt(scene: SceneDef): string {
  const motion = scene.videoMotionPrompt || DEFAULT_VIDEO_MOTION;

  return [
    motion,
    `Scene: ${scene.setting}.`,
    `Action: ${scene.action}.`,
    "Maintain character consistency, no morphing or warping of faces.",
    "Gentle, child-friendly animation with smooth transitions.",
  ].join(" ");
}
