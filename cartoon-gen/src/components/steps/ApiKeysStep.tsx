import { ApiKeyInput } from "@/components/shared/ApiKeyInput";
import { useSettingsStore } from "@/stores/settings-store";
import { validateOpenAIKey } from "@/services/openai";
import { validateFalKey } from "@/services/fal";
import { FlaskConical } from "lucide-react";

export function ApiKeysStep() {
  const {
    openaiKey,
    falKey,
    openaiKeyValid,
    falKeyValid,
    testMode,
    setOpenaiKey,
    setFalKey,
    setOpenaiKeyValid,
    setFalKeyValid,
    setTestMode,
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

      {/* Test Mode Toggle */}
      <div
        className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors ${
          testMode
            ? "border-purple-500 bg-purple-500/10"
            : "border-border hover:border-muted-foreground/30"
        }`}
        onClick={() => setTestMode(!testMode)}
      >
        <div className="flex items-center gap-3">
          <FlaskConical
            className={`h-5 w-5 ${
              testMode ? "text-purple-400" : "text-muted-foreground"
            }`}
          />
          <div>
            <p className="text-sm font-medium">Test Mode</p>
            <p className="text-xs text-muted-foreground">
              Use mock data — no API credits spent
            </p>
          </div>
        </div>
        <div
          className={`h-6 w-11 rounded-full transition-colors relative ${
            testMode ? "bg-purple-500" : "bg-secondary"
          }`}
        >
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              testMode ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </div>
      </div>

      {!testMode && (
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
      )}

      {testMode && (
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4 text-center text-sm text-purple-300">
          Test mode active. A sample nursery rhyme will be used with
          placeholder images and videos. No API calls will be made.
        </div>
      )}
    </div>
  );
}
