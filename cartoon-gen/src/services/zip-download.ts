import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadAllAsZip(
  scenes: { index: number; imageUrl: string | null; videoUrl: string | null }[],
  characters: { id: string; name: string; imageUrl: string | null }[],
  projectTitle: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();
  const total =
    characters.filter((c) => c.imageUrl).length +
    scenes.filter((s) => s.imageUrl).length +
    scenes.filter((s) => s.videoUrl).length;
  let completed = 0;

  const update = () => {
    completed++;
    onProgress?.(Math.round((completed / total) * 100));
  };

  // Add character reference images
  const charsFolder = zip.folder("characters")!;
  for (const char of characters) {
    if (char.imageUrl) {
      const response = await fetch(char.imageUrl);
      const blob = await response.blob();
      charsFolder.file(`${char.id}_${char.name}.png`, blob);
      update();
    }
  }

  // Add scene images
  const imagesFolder = zip.folder("scenes/images")!;
  for (const scene of scenes) {
    if (scene.imageUrl) {
      const response = await fetch(scene.imageUrl);
      const blob = await response.blob();
      imagesFolder.file(
        `scene_${String(scene.index).padStart(2, "0")}.png`,
        blob
      );
      update();
    }
  }

  // Add scene videos
  const videosFolder = zip.folder("scenes/videos")!;
  for (const scene of scenes) {
    if (scene.videoUrl) {
      const response = await fetch(scene.videoUrl);
      const blob = await response.blob();
      videosFolder.file(
        `scene_${String(scene.index).padStart(2, "0")}.mp4`,
        blob
      );
      update();
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${projectTitle || "cartoongen"}-output.zip`);
}
