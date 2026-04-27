const rawBaseUrl = (import.meta.env.VITE_API_URL ?? "").trim();
const baseUrl = rawBaseUrl.replace(/\/+$/, "");

const ACCESS_TOKEN_KEY = "accessToken";

export function getApiBaseUrl() {
    return baseUrl;
}

export function getAccessToken() {
    try {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function apiUrl(path) {
    if (!path) return baseUrl || "";

    // Allow passing absolute URLs through unchanged.
    if (/^https?:\/\//i.test(path)) return path;

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    if (!baseUrl) {
        // Avoid hard crashes in production builds when Netlify env vars are misconfigured.
        // This will fall back to a relative path, which may still fail at runtime,
        // but it won't take down the whole SPA with an exception.
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn("[api] VITE_API_URL is not set; falling back to relative URL:", normalizedPath);
        }
        return normalizedPath;
    }

    return `${baseUrl}${normalizedPath}`;
}

export function apiFetch(path, options = {}) {
    const token = getAccessToken();
    const headers = new Headers(options.headers || {});

    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

    return fetch(apiUrl(path), {
        ...options,
        headers,
        // JWT auth is header-based; don't rely on cookies.
        credentials: options.credentials ?? "omit",
    });
}

export async function apiFetchJson(path, options = {}) {
    const res = await apiFetch(path, options);
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json().catch(() => null) : null;
    return { res, data };
}
