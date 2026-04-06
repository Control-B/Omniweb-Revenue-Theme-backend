import { Router, type IRouter, type Request, type Response } from "express";
import { getAvailableVoices, isShopRegistered } from "../lib/widget-config-store.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

router.post("/voice", async (req: Request, res: Response): Promise<void> => {
  const { text, voiceId, modelId, shopId } = req.body as {
    text?: string;
    voiceId?: string;
    modelId?: string;
    shopId?: string;
  };

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  if (!shopId || typeof shopId !== "string") {
    res.status(403).json({ error: "Shop not registered. Configure your widget in the Omniweb dashboard first." });
    return;
  }

  const registered = await isShopRegistered(shopId.slice(0, 200));
  if (!registered) {
    res.status(403).json({ error: "Shop not registered. Configure your widget in the Omniweb dashboard first." });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: "Voice service not configured",
      message: "ElevenLabs API key is not set. Connect ElevenLabs to enable voice.",
      connected: false,
    });
    return;
  }

  const voice = voiceId ?? DEFAULT_VOICE_ID;
  const model = modelId ?? "eleven_turbo_v2";

  try {
    const elevenRes = await fetch(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voice}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.trim().slice(0, 1000),
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenRes.ok) {
      const errBody = await elevenRes.text();
      logger.error({ status: elevenRes.status, body: errBody }, "ElevenLabs API error");
      res.status(502).json({
        error: "Voice synthesis failed",
        message: "Unable to generate voice audio. Please try again.",
      });
      return;
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    if (!elevenRes.body) {
      res.status(502).json({ error: "Empty response from voice service" });
      return;
    }

    const reader = elevenRes.body.getReader();
    const pump = async (): Promise<void> => {
      const { done, value } = await reader.read();
      if (done) {
        res.end();
        return;
      }
      res.write(value);
      await pump();
    };
    await pump();
  } catch (err) {
    logger.error({ err }, "Voice synthesis error");
    res.status(502).json({
      error: "Voice service error",
      message: "An error occurred while generating voice audio.",
    });
  }
});

router.get("/voices-status", async (_req: Request, res: Response): Promise<void> => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.json({ voices: getAvailableVoices(), connected: false });
    return;
  }

  try {
    const r = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
      headers: { "xi-api-key": apiKey },
    });
    const data = (await r.json()) as { voices?: Array<{ voice_id: string; name: string; description?: string }> };
    const voices = (data.voices ?? []).map((v) => ({
      id: v.voice_id,
      name: v.name,
      description: v.description ?? "",
    }));
    res.json({ voices, connected: true });
  } catch (err) {
    logger.error({ err }, "Failed to fetch ElevenLabs voices");
    res.status(502).json({ error: "Could not fetch voices" });
  }
});

export default router;
