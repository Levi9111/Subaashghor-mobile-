import { ApiEnvelope, ApiError, ApiErrorBody } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Toggle mocks or live backend API. Set to false to use the live Express server.
export const USE_MOCKS = false;

const hostUri = Constants.expoConfig?.hostUri;
const host = hostUri ? hostUri.split(":")[0] : "localhost";
const BASE_URL = `http://${host}:5000/api/v1`;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | string[] | undefined | null>;
  headers?: Record<string, string>;
}

async function buildUrl(path: string, query?: RequestOptions["query"]) {
  const urlParams = new URLSearchParams();
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        v.forEach((item) => urlParams.append(k, String(item)));
      } else {
        urlParams.set(k, String(v));
      }
    }
  }
  const queryString = urlParams.toString();
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}${queryString ? `?${queryString}` : ""}`;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const env = await requestEnvelope<T>(path, opts);
  return env.data;
}

export async function requestEnvelope<T>(
  path: string,
  opts: RequestOptions = {}
): Promise<ApiEnvelope<T>> {
  const { method = "GET", body, query, headers } = opts;

  // Retrieve auth token if saved
  const token = await AsyncStorage.getItem("sg_auth_token");

  const res = await fetch(await buildUrl(path, query), {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // Ignore parse errors
  }

  // If Set-Cookie header is visible and contains a session, we can extract and store it as a fallback
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/sg_session=([^;]+)/);
    if (match && match[1]) {
      await AsyncStorage.setItem("sg_auth_token", match[1]);
    }
  }

  if (!res.ok) {
    const errBody = (json ?? undefined) as ApiErrorBody | undefined;
    throw new ApiError(
      errBody?.message || `Request failed (${res.status})`,
      res.status,
      errBody
    );
  }

  const env = json as ApiEnvelope<T>;
  if (!env || typeof env !== "object" || !("success" in env)) {
    throw new ApiError("Malformed API response", res.status);
  }
  if (!env.success) {
    throw new ApiError(env.message || "Request failed", res.status, env as unknown as ApiErrorBody);
  }
  return env;
}
