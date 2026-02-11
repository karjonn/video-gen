import { ApiKeyInput } from "@/components/shared/ApiKeyInput";
import { useSettingsStore } from "@/stores/settings-store";
import { validateOpenAIKey } from "@/services/openai";
import { validateFalKey } from "@/services/fal";

export function ApiKeysStep() {
  const {
    openaiKey,
    falKey,
    openaiKeyValid,
    falKeyValid,
    setOpenaiKey,
    setFalKey,
    setOpenaiKeyValid,
    setFalKeyValid,
  } = useSettingsStore();

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Welcome to CartoonGen</h2>
        <p className="text-sm text-muted-foreground">
          Enter your API keys to get started. Keys are stored locally in your
          browser and sent only to OpenAI and fal.ai directly.
        </p>
      </div>

      <div className="space-y-6">
        <ApiKeyInput
          label="OpenAI API Key"
          value={openaiKey}
          onChange={setOpenaiKey}
          isValid={openaiKeyValid}
          placeholder="sk-..."
          onValidate={async () => {
            const valid = await validateOpenAIKey(openaiKey);
            setOpenaiKeyValid(valid);
            return valid;
          }}
        />

        <ApiKeyInput
          label="fal.ai API Key"
          value={falKey}
          onChange={setFalKey}
          isValid={falKeyValid}
          placeholder="fal key..."
          onValidate={async () => {
            const valid = await validateFalKey(falKey);
            setFalKeyValid(valid);
            return valid;
          }}
        />
      </div>
    </div>
  );
}
