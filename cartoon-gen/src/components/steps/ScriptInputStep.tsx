import { Textarea } from "@/components/ui/textarea";
import { useProjectStore } from "@/stores/project-store";
import { Loader2 } from "lucide-react";

export function ScriptInputStep() {
  const script = useProjectStore((s) => s.script);
  const setScript = useProjectStore((s) => s.setScript);
  const storyboardStatus = useProjectStore((s) => s.storyboardStatus);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Nursery Rhyme Script</h2>
        <p className="text-sm text-muted-foreground">
          Paste the full nursery rhyme lyrics below. The AI will analyze it and
          generate a storyboard with characters and scenes.
        </p>
      </div>

      <Textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder={`Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky...`}
        rows={14}
        disabled={storyboardStatus === "generating"}
        className="font-mono text-sm"
      />

      {storyboardStatus === "generating" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating storyboard with GPT-4o...</span>
        </div>
      )}

      {storyboardStatus === "error" && (
        <p className="text-sm text-destructive">
          {useProjectStore.getState().storyboardError || "Storyboard generation failed."}
        </p>
      )}
    </div>
  );
}
