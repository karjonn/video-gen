import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStore } from "@/stores/project-store";
import { useSettingsStore } from "@/stores/settings-store";
import { MOCK_SCRIPT } from "@/services/mock-data";
import { Loader2 } from "lucide-react";

export function ScriptInputStep() {
  const script = useProjectStore((s) => s.script);
  const setScript = useProjectStore((s) => s.setScript);
  const userNotes = useProjectStore((s) => s.userNotes);
  const setUserNotes = useProjectStore((s) => s.setUserNotes);
  const storyboardStatus = useProjectStore((s) => s.storyboardStatus);
  const testMode = useSettingsStore((s) => s.testMode);

  // Auto-fill with mock script in test mode
  useEffect(() => {
    if (testMode && !script) {
      setScript(MOCK_SCRIPT);
    }
  }, [testMode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Nursery Rhyme Script</h2>
        <p className="text-sm text-muted-foreground">
          {testMode
            ? "Test mode: A sample nursery rhyme has been pre-filled. You can edit it or just proceed."
            : "Paste the full nursery rhyme lyrics below. The AI will analyze it and generate a storyboard with characters and scenes."}
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

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Producer Notes <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Add any criteria, style preferences, or specific instructions for character and scene generation.
        </p>
        <Textarea
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder={`e.g., "Make all characters look like clay figurines", "Set everything in a village during Diwali", "The main child should wear a red outfit"...`}
          rows={4}
          disabled={storyboardStatus === "generating"}
          className="text-sm"
        />
      </div>

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
