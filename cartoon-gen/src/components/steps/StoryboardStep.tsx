import { useProjectStore, createCharacterDef, createSceneDef } from "@/stores/project-store";
import { useSettingsStore } from "@/stores/settings-store";
import { generateCharacters, generateScenes } from "@/services/openai";
import { MOCK_STORYBOARD } from "@/services/mock-data";
import { EditableText } from "@/components/shared/EditableText";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CAMERA_OPTIONS = [
  "wide shot",
  "medium shot",
  "close-up",
  "extreme close-up",
  "over-the-shoulder",
  "low angle",
  "high angle",
  "bird's eye view",
  "POV shot",
  "tracking shot",
];

export function StoryboardStep() {
  const title = useProjectStore((s) => s.title);
  const script = useProjectStore((s) => s.script);
  const characters = useProjectStore((s) => s.characters);
  const scenes = useProjectStore((s) => s.scenes);
  const scenesGenStatus = useProjectStore((s) => s.scenesGenStatus);
  const scenesGenError = useProjectStore((s) => s.scenesGenError);
  const storyboardStatus = useProjectStore((s) => s.storyboardStatus);
  const updateCharacter = useProjectStore((s) => s.updateCharacter);
  const addCharacter = useProjectStore((s) => s.addCharacter);
  const removeCharacter = useProjectStore((s) => s.removeCharacter);
  const updateScene = useProjectStore((s) => s.updateScene);
  const addScene = useProjectStore((s) => s.addScene);
  const insertSceneAfter = useProjectStore((s) => s.insertSceneAfter);
  const removeScene = useProjectStore((s) => s.removeScene);
  const setCharactersOnly = useProjectStore((s) => s.setCharactersOnly);
  const setStoryboardStatus = useProjectStore((s) => s.setStoryboardStatus);
  const setScenesOnly = useProjectStore((s) => s.setScenesOnly);
  const setScenesGenStatus = useProjectStore((s) => s.setScenesGenStatus);
  const clearScenes = useProjectStore((s) => s.clearScenes);
  const userNotes = useProjectStore((s) => s.userNotes);
  const testMode = useSettingsStore((s) => s.testMode);

  const isGeneratingChars = storyboardStatus === "generating";
  const isGeneratingScenes = scenesGenStatus === "generating";

  const handleAddCharacter = () => {
    const id = `char_new_${Date.now()}`;
    addCharacter(
      createCharacterDef({
        id,
        name: "New Character",
        role: "child",
        identityLock: {
          ethnicity: "Indian",
          skinTone: "warm brown",
          hair: "black, short",
          outfit: "colorful traditional kurta",
          accessories: [],
          age: "6",
          faceNotes: "round cheeks, friendly smile, big expressive eyes",
        },
      })
    );
  };

  const handleAddSceneAtEnd = () => {
    const nextIndex =
      scenes.length > 0 ? Math.max(...scenes.map((s) => s.index)) + 1 : 1;
    addScene(
      createSceneDef({
        index: nextIndex,
        durationSeconds: 10,
        charactersPresent: [],
        setting: "New setting",
        action: "New action",
        camera: "medium shot",
        prompt: "",
        videoMotionPrompt: "",
      })
    );
  };

  const toggleCharacterInScene = (sceneIndex: number, charId: string) => {
    const scene = scenes.find((s) => s.index === sceneIndex);
    if (!scene) return;
    const present = scene.charactersPresent.includes(charId);
    const updated = present
      ? scene.charactersPresent.filter((id) => id !== charId)
      : [...scene.charactersPresent, charId];
    updateScene(sceneIndex, { charactersPresent: updated });
  };

  // ── Regenerate Characters ─────────────────────────────────────────

  const handleRegenerateCharacters = async () => {
    if (!confirm("Regenerate characters? This will also clear all scenes.")) return;

    setStoryboardStatus("generating");
    clearScenes();

    if (testMode) {
      const chars = MOCK_STORYBOARD.characters.map((c) => createCharacterDef(c));
      setCharactersOnly(MOCK_STORYBOARD.title, chars);
      return;
    }

    try {
      const result = await generateCharacters(script, userNotes);
      const chars = result.characters.map((c) => createCharacterDef(c));
      setCharactersOnly(result.title, chars);
    } catch (err) {
      setStoryboardStatus("error", (err as Error).message);
      toast({
        variant: "destructive",
        title: "Character generation failed",
        description: (err as Error).message,
      });
    }
  };

  // ── Generate / Regenerate Scenes ──────────────────────────────────

  const handleGenerateScenes = async (isRegen = false) => {
    if (isRegen && !confirm("Regenerate scenes? This will clear all existing scenes.")) return;

    setScenesGenStatus("generating");
    if (isRegen) clearScenes();

    if (testMode) {
      const scns = MOCK_STORYBOARD.scenes.map((s) => createSceneDef(s));
      setScenesOnly(scns);
      return;
    }

    try {
      const result = await generateScenes(script, characters, userNotes);
      const scns = result.scenes.map((s) => createSceneDef(s));
      setScenesOnly(scns);
    } catch (err) {
      setScenesGenStatus("error", (err as Error).message);
      toast({
        variant: "destructive",
        title: "Scene generation failed",
        description: (err as Error).message,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">{title || "Storyboard"}</h2>
        <p className="text-sm text-muted-foreground">
          Review and edit the characters, then generate scenes below.
        </p>
      </div>

      {/* ── Characters ─────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Characters ({characters.length})
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateCharacters}
              disabled={isGeneratingChars}
            >
              {isGeneratingChars ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-3 w-3" />
              )}
              Regenerate Characters
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddCharacter}>
              <Plus className="mr-1 h-3 w-3" />
              Add Character
            </Button>
          </div>
        </div>

        {isGeneratingChars && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Extracting characters from script...
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-2">
          {characters.map((char) => (
            <Card
              key={char.id}
              className="min-w-[280px] max-w-[320px] shrink-0"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    <EditableText
                      value={char.name}
                      onChange={(v) => updateCharacter(char.id, { name: v })}
                    />
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeCharacter(char.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Badge variant="secondary" className="w-fit text-xs">
                  <EditableText
                    value={char.role}
                    onChange={(v) => updateCharacter(char.id, { role: v })}
                  />
                </Badge>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground">Age: </span>
                  <EditableText
                    value={char.identityLock.age}
                    onChange={(v) =>
                      updateCharacter(char.id, {
                        identityLock: { ...char.identityLock, age: v },
                      })
                    }
                  />
                </div>
                <div>
                  <span className="text-muted-foreground">Skin: </span>
                  <EditableText
                    value={char.identityLock.skinTone}
                    onChange={(v) =>
                      updateCharacter(char.id, {
                        identityLock: { ...char.identityLock, skinTone: v },
                      })
                    }
                  />
                </div>
                <div>
                  <span className="text-muted-foreground">Hair: </span>
                  <EditableText
                    value={char.identityLock.hair}
                    onChange={(v) =>
                      updateCharacter(char.id, {
                        identityLock: { ...char.identityLock, hair: v },
                      })
                    }
                  />
                </div>
                <div>
                  <span className="text-muted-foreground">Outfit: </span>
                  <EditableText
                    value={char.identityLock.outfit}
                    onChange={(v) =>
                      updateCharacter(char.id, {
                        identityLock: { ...char.identityLock, outfit: v },
                      })
                    }
                  />
                </div>
                <div>
                  <span className="text-muted-foreground">Face: </span>
                  <EditableText
                    value={char.identityLock.faceNotes}
                    onChange={(v) =>
                      updateCharacter(char.id, {
                        identityLock: { ...char.identityLock, faceNotes: v },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Generate Scenes Button (shown when no scenes yet) ──────── */}
      {scenes.length === 0 && !isGeneratingScenes && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-purple-500/40 bg-purple-500/5 py-8">
          <p className="text-sm text-muted-foreground">
            Happy with the characters? Generate scenes based on them.
          </p>
          <Button
            className="bg-purple-600 hover:bg-purple-500 text-white px-8"
            onClick={() => handleGenerateScenes(false)}
            disabled={characters.length === 0}
          >
            Generate Scenes
          </Button>
        </div>
      )}

      {/* ── Scenes Loading ─────────────────────────────────────────── */}
      {isGeneratingScenes && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-purple-500/40 bg-purple-500/5 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
          Generating scenes from script and characters...
        </div>
      )}

      {scenesGenStatus === "error" && scenes.length === 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">
            {scenesGenError || "Scene generation failed."}
          </p>
          <Button
            className="mt-2 bg-purple-600 hover:bg-purple-500 text-white"
            size="sm"
            onClick={() => handleGenerateScenes(false)}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* ── Scenes ─────────────────────────────────────────────────── */}
      {scenes.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Scenes ({scenes.length})</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateScenes(true)}
                disabled={isGeneratingScenes}
              >
                {isGeneratingScenes ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1 h-3 w-3" />
                )}
                Regenerate Scenes
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddSceneAtEnd}>
                <Plus className="mr-1 h-3 w-3" />
                Add Scene
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {scenes.map((scene) => (
              <div key={scene.index}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">
                        Scene {scene.index}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-purple-400"
                          title="Insert scene after this one"
                          onClick={() => insertSceneAfter(scene.index)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeScene(scene.index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Setting: </span>
                      <EditableText
                        value={scene.setting}
                        onChange={(v) => updateScene(scene.index, { setting: v })}
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground">Action: </span>
                      <EditableText
                        value={scene.action}
                        onChange={(v) => updateScene(scene.index, { action: v })}
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground">Camera: </span>
                      <select
                        value={scene.camera}
                        onChange={(e) =>
                          updateScene(scene.index, { camera: e.target.value })
                        }
                        className="ml-1 rounded border border-border bg-background px-2 py-0.5 text-xs text-foreground"
                      >
                        {CAMERA_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                        {!CAMERA_OPTIONS.includes(scene.camera) && (
                          <option value={scene.camera}>{scene.camera}</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Characters:</span>
                      <div className="flex flex-wrap gap-2">
                        {characters.map((char) => {
                          const isPresent = scene.charactersPresent.includes(char.id);
                          return (
                            <label
                              key={char.id}
                              className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors ${
                                isPresent
                                  ? "border-purple-500 bg-purple-500/20 text-purple-200"
                                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isPresent}
                                onChange={() =>
                                  toggleCharacterInScene(scene.index, char.id)
                                }
                                className="sr-only"
                              />
                              {char.name}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="pt-1">
                      <span className="text-muted-foreground">Prompt: </span>
                      <EditableText
                        value={scene.prompt}
                        onChange={(v) => updateScene(scene.index, { prompt: v })}
                        multiline
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
