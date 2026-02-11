import { fal } from "@fal-ai/client";

export function initFal(apiKey: string): void {
  fal.config({ credentials: apiKey });
}

export async function validateFalKey(apiKey: string): Promise<boolean> {
  try {
    fal.config({ credentials: apiKey });
    // Make a minimal call — any non-auth error means the key is valid
    await fal.subscribe("fal-ai/fast-sdxl", {
      input: { prompt: "test", image_size: "square", num_images: 1 },
      pollInterval: 2000,
    });
    return true;
  } catch (err: unknown) {
    const error = err as { status?: number };
    if (error?.status === 401 || error?.status === 403) return false;
    // A non-auth error (e.g., model error) means the key itself is valid
    return true;
  }
}

export async function falSubscribe<TOutput>(
  endpointId: string,
  input: Record<string, unknown>,
  onProgress?: (status: string) => void,
  maxRetries: number = 3
): Promise<TOutput> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fal.subscribe(endpointId, {
        input,
        pollInterval: 5000,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            onProgress?.(`Processing (attempt ${attempt + 1})...`);
          } else if (update.status === "IN_QUEUE") {
            onProgress?.(`Queued...`);
          }
        },
      });
      return result.data as TOutput;
    } catch (err: unknown) {
      lastError = err as Error;
      const error = err as { status?: number };
      // Don't retry on auth or validation errors
      if (
        error?.status === 401 ||
        error?.status === 403 ||
        error?.status === 422
      ) {
        throw err;
      }
      // Exponential backoff for transient errors
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError ?? new Error("Max retries exceeded");
}

export { fal };
