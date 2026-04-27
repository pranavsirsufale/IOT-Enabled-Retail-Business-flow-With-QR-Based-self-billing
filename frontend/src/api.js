const rawBaseUrl = (import.meta.env.VITE_API_URL ?? "").trim();

// Keep existing behavior when VITE_API_URL is unset:
// - dev: Vite proxy can forward relative /api requests to the backend
// - prod: relative /api requests go to the same origin
const baseUrl = rawBaseUrl.replace(/\/+$/, "");

export function apiUrl(path) {
    if (!path) return baseUrl || "";

    // Allow passing absolute URLs through unchanged.
    if (/^https?:\/\//i.test(path)) return path;

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

export function apiFetch(path, options) {
    return fetch(apiUrl(path), options);
}
