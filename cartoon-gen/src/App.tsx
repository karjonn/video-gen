import { useCallback } from "react";
import { WizardShell } from "@/components/layout/WizardShell";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { useProjectStore, createCharacterDef } from "@/stores/project-store";
import { useSettingsStore } from "@/stores/settings-store";
import { initOpenAI, generateCharacters } from "@/services/openai";
import { initFal } from "@/services/fal";
import { buildCharacterPrompt } from "@/prompts/character-prompt";
import { toast } from "@/hooks/use-toast";
import { MOCK_STORYBOARD } from "@/services/mock-data";

import { ApiKeysStep } from "@/components/steps/ApiKeysStep";
import { ScriptInputStep } from "@/components/steps/ScriptInputStep";
import { StoryboardStep } from "@/components/steps/StoryboardStep";
import { CharacterImagesStep } from "@/components/steps/CharacterImagesStep";
import { SceneImagesStep } from "@/components/steps/SceneImagesStep";
import { VideoOutputStep } from "@/components/steps/VideoOutputStep";

function App() {
  const currentStep = useProjectStore((s) => s.currentStep);
  const setCurrentStep = useProjectStore((s) => s.setCurrentStep);
  const script = useProjectStore((s) => s.script);
  const characters = useProjectStore((s) => s.characters);
  const scenes = useProjectStore((s) => s.scenes);
  const storyboardStatus = useProjectStore((s) => s.storyboardStatus);
  const setCharactersOnly = useProjectStore((s) => s.setCharactersOnly);
  const setStoryboardStatus = useProjectStore((s) => s.setStoryboardStatus);

  const openaiKeyValid = useSettingsStore((s) => s.openaiKeyValid);
  const falKeyValid = useSettingsStore((s) => s.falKeyValid);
  const openaiKey = useSettingsStore((s) => s.openaiKey);
  const falKey = useSettingsStore((s) => s.falKey);
  const testMode = useSettingsStore((s) => s.testMode);

  const canGoNext = useCallback((): boolean => {
    switch (currentStep) {
      case 0:
        return openaiKeyValid && falKeyValid;
      case 1:
        return script.trim().length > 0 && storyboardStatus !== "generating";
      case 2:
        return characters.length > 0 && scenes.length > 0;
      case 3: {
        const allCharsDone = characters.every(
          (c) => c.imageStatus === "done"
        );
        return allCharsDone && characters.length > 0;
      }
      case 4: {
        const allScenesDone = scenes.every((s) => s.imageStatus === "done");
        return allScenesDone && scenes.length > 0;
      }
      case 5:
        return true;
      default:
        return false;
    }
  }, [currentStep, openaiKeyValid, falKeyValid, script, storyboardStatus, characters, scenes]);

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleNext = async () => {
    switch (currentStep) {
      case 0:
        if (!testMode) {
          initOpenAI(openaiKey);
          initFal(falKey);
        }
        setCurrentStep(1);
        break;

      case 1:
        // Generate characters only (scenes generated separately on storyboard page)
        if (storyboardStatus === "done") {
          setCurrentStep(2);
          return;
        }

        if (testMode) {
          const chars = MOCK_STORYBOARD.characters.map((c) => createCharacterDef(c));
          setCharactersOnly(MOCK_STORYBOARD.title, chars);
          setCurrentStep(2);
          return;
        }

        setStoryboardStatus("generating");
        try {
          const result = await generateCharacters(script);
          const chars = result.characters.map((c) => createCharacterDef(c));
          setCharactersOnly(result.title, chars);
          setCurrentStep(2);
        } catch (err) {
          setStoryboardStatus("error", (err as Error).message);
          toast({
            variant: "destructive",
            title: "Character generation failed",
            description: (err as Error).message,
          });
        }
        break;

      case 2:
        // Rebuild character prompts from any edits
        characters.forEach((c) => {
          const newPrompt = buildCharacterPrompt(c);
          if (c.imagePrompt !== newPrompt && c.imageStatus === "idle") {
            useProjectStore.getState().updateCharacter(c.id, { imagePrompt: newPrompt });
          }
        });
        setCurrentStep(3);
        break;

      case 3:
        setCurrentStep(4);
        break;

      case 4:
        setCurrentStep(5);
        break;

      case 5:
        break;
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLoading = currentStep === 1 && storyboardStatus === "generating";

  return (
    <ErrorBoundary>
      <WizardShell
        currentStep={currentStep}
        onBack={handleBack}
        onNext={handleNext}
        onStepClick={handleStepClick}
        canGoNext={canGoNext()}
        isLoading={isLoading}
      >
        {currentStep === 0 && <ApiKeysStep />}
        {currentStep === 1 && <ScriptInputStep />}
        {currentStep === 2 && <StoryboardStep />}
        {currentStep === 3 && <CharacterImagesStep />}
        {currentStep === 4 && <SceneImagesStep />}
        {currentStep === 5 && <VideoOutputStep />}
      </WizardShell>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
