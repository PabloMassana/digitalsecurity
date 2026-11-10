import { Session } from "./session.js";
import { mock } from "./mock.js";

export const CONFIG = { API: "/api", MOCK: true };   // MOCK = false cuando el backend responda

export async function api(path, { method = "GET", body } = {}) {
  if (CONFIG.MOCK) return mock(path, method, body);
  const s = Session.get(), headers = {};
  if (s && s.token) headers.Authorization = "Bearer " + s.token;
  if (body && !(body instanceof FormData)) { headers["Content-Type"] = "application/json"; body = JSON.stringify(body); }
  const r = await fetch(CONFIG.API + path, { method, headers, body });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Error " + r.status);
  return data;
}