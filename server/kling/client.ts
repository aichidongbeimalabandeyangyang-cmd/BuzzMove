import jwt from "jsonwebtoken";
import type {
  KlingImageToVideoRequest,
  KlingTaskResponse,
  KlingTaskResult,
} from "./types";

const KLING_API_BASE = "https://api.klingai.com";

export function generateToken(): string {
  const ak = process.env.KLING_ACCESS_KEY!;
  const sk = process.env.KLING_SECRET_KEY!;

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: ak,
    exp: now + 1800, // 30 minutes
    nbf: now - 5,
  };

  return jwt.sign(payload, sk, {
    algorithm: "HS256",
    header: { alg: "HS256", typ: "JWT" },
  });
}

async function klingFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = generateToken();
  const res = await fetch(`${KLING_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Kling API error ${res.status}: ${error}`);
  }

  return res.json();
}

export async function createImageToVideo(params: {
  imageUrl: string;
  prompt?: string;
  negativePrompt?: string;
  duration: 5 | 10;
  mode: "standard" | "professional";
  callbackUrl?: string;
}): Promise<KlingTaskResponse> {
  return klingFetch<KlingTaskResponse>("/v1/videos/image2video", {
    method: "POST",
    body: JSON.stringify({
      model_name: "kling-v2-5-turbo",
      image: params.imageUrl,
      prompt: params.prompt || "",
      negative_prompt: params.negativePrompt || "",
      duration: String(params.duration),
      mode: params.mode === "standard" ? "std" : "pro",
      cfg_scale: 0.5,
      callback_url:
        params.callbackUrl || process.env.KLING_CALLBACK_URL,
    }),
  });
}

export async function getTaskStatus(
  taskId: string
): Promise<KlingTaskResult> {
  if (!/^[a-zA-Z0-9_-]+$/.test(taskId)) {
    throw new Error("Invalid task ID format");
  }
  return klingFetch<KlingTaskResult>(
    `/v1/videos/image2video/${taskId}`
  );
}
