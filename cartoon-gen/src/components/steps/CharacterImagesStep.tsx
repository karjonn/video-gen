import { useEffect, useRef } from "react";
import { useProjectStore } from "@/stores/project-store";
import { generateAllCharacters } from "@/services/character-gen";
import { ImageCard } from "@/components/shared/ImageCard";
import { GenerationProgress } from "@/components/shared/GenerationProgress";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { generateCharacterImage } from "@/services/character-gen";

export function CharacterImagesStep() {
  const characters = useProjectStore((s) => s.characters);
  const updateCharacter = useProjectStore((s) => s.updateCharacter);
  const startedRef = useRef(false);

  const doneCount = characters.filter((c) => c.imageStatus === "done").length;
  const generatingCount = characters.filter(
    (c) => c.imageStatus === "generating"
  ).length;
  const idleChars = characters.filter((c) => c.imageStatus === "idle");

  // Auto-start generation for idle characters on mount
  useEffect(() => {
    if (startedRef.current || idleChars.length === 0) return;
    startedRef.current = true;

    // Mark all idle as generating
    idleChars.forEach((c) =>
      updateCharacter(c.id, { imageStatus: "generating", imageError: null })
    );

    generateAllCharacters(
      idleChars,
      (charId, result) => {
        updateCharacter(charId, {
          imageUrl: result.imageUrl,
          imageSeed: result.seed,
          imageStatus: "done",
          imageError: null,
        });
      },
      (charId, error) => {
        updateCharacter(charId, {
          imageStatus: "error",
          imageError: error.message,
        });
      }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegenerate = async (charId: string) => {
    const char = characters.find((c) => c.id === charId);
    if (!char) return;

    updateCharacter(charId, {
      imageStatus: "generating",
      imageError: null,
    });

    try {
      const result = await generateCharacterImage(char);
      updateCharacter(charId, {
        imageUrl: result.imageUrl,
        imageSeed: result.seed,
        imageStatus: "done",
        imageError: null,
      });
    } catch (err) {
      updateCharacter(charId, {
        imageStatus: "error",
        imageError: (err as Error).message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Character Reference Images</h2>
        <p className="text-sm text-muted-foreground">
          Edit the description to change how a character looks, then click
          Regenerate.
        </p>
      </div>

      {generatingCount > 0 && (
        <GenerationProgress
          current={doneCount}
          total={characters.length}
          label={`Generating characters... ${doneCount} of ${characters.length} done`}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((char) => (
          <div key={char.id} className="space-y-2">
            <h3 className="text-sm font-semibold">{char.name}</h3>
            <Textarea
              value={char.imagePrompt}
              onChange={(e) =>
                updateCharacter(char.id, { imagePrompt: e.target.value })
              }
              rows={4}
              className="text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleRegenerate(char.id)}
              disabled={char.imageStatus === "generating"}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Regenerate
            </Button>
            <ImageCard
              imageUrl={char.imageUrl}
              status={char.imageStatus}
              error={char.imageError}
              onRegenerate={() => handleRegenerate(char.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
