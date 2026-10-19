/**
 * Gestión del consentimiento de cookies (LSSI art. 22.2 + Guía de cookies AEPD).
 *
 * - Las cookies técnicas ("necesarias") no requieren consentimiento.
 * - El resto de categorías están DESACTIVADAS por defecto hasta que el usuario acepta.
 * - El consentimiento se guarda en localStorage y caduca a los 12 meses.
 */

export type CookieCategory = "publicidad" | "multimedia" | "redesSociales";

export interface CookieConsent {
    version: number;
    fecha: string; // ISO
    necesarias: true;
    publicidad: boolean;
    multimedia: boolean;
    redesSociales: boolean;
}

export const CONSENT_STORAGE_KEY = "pn_cookie_consent";
/** Sube este número si cambian las categorías: se volverá a pedir consentimiento. */
export const CONSENT_VERSION = 1;
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

const CHANGE_EVENT = "pn:cookie-consent-change";
const OPEN_SETTINGS_EVENT = "pn:open-cookie-settings";

export const CATEGORIAS: {
    id: CookieCategory | "necesarias";
    titulo: string;
    descripcion: string;
    proveedores: string;
}[] = [
    {
        id: "necesarias",
        titulo: "Necesarias",
        descripcion:
            "Imprescindibles para que la web funcione: mantener tu sesión iniciada, recordar tus preferencias de cookies y de notificaciones.",
        proveedores: "Periódico Naranja, Supabase",
    },
    {
        id: "publicidad",
        titulo: "Publicidad",
        descripcion:
            "Permiten mostrar los anuncios que financian el periódico. La red publicitaria puede usar cookies para medir y adaptar los anuncios.",
        proveedores: "Adsterra",
    },
    {
        id: "multimedia",
        titulo: "Vídeo y multimedia",
        descripcion: "Permiten reproducir los vídeos integrados en las noticias.",
        proveedores: "JW Player",
    },
    {
        id: "redesSociales",
        titulo: "Redes sociales",
        descripcion:
            "Permiten mostrar publicaciones incrustadas de redes sociales dentro de las noticias. Estas plataformas pueden rastrear tu navegación.",
        proveedores: "X (Twitter), Instagram, TikTok",
    },
];

/* ------------------------------------------------------------------ */
/* Lectura / escritura                                                 */
/* ------------------------------------------------------------------ */

let cachedRaw: string | null | undefined;
let cachedValue: CookieConsent | null = null;

function parse(raw: string | null): CookieConsent | null {
    if (!raw) return null;
    try {
        const data = JSON.parse(raw) as CookieConsent;
        if (data.version !== CONSENT_VERSION) return null;
        if (Date.now() - new Date(data.fecha).getTime() > CONSENT_MAX_AGE_MS) return null;
        return data;
    } catch {
        return null;
    }
}

/** Devuelve el consentimiento guardado (referencia estable mientras no cambie). */
export function getConsent(): CookieConsent | null {
    if (typeof window === "undefined") return null;
    let raw: string | null = null;
    try {
        raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    } catch {
        return null;
    }
    if (raw !== cachedRaw) {
        cachedRaw = raw;
        cachedValue = parse(raw);
    }
    return cachedValue;
}

export function saveConsent(prefs: Pick<CookieConsent, CookieCategory>) {
    const previous = getConsent();
    const consent: CookieConsent = {
        version: CONSENT_VERSION,
        fecha: new Date().toISOString(),
        necesarias: true,
        ...prefs,
    };
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new Event(CHANGE_EVENT));

    // Si el usuario retira un consentimiento previo, recargamos para descargar
    // por completo los scripts de terceros que ya estuvieran en memoria.
    const revoked =
        previous &&
        (["publicidad", "multimedia", "redesSociales"] as CookieCategory[]).some(
            (c) => previous[c] && !consent[c]
        );
    if (revoked) window.location.reload();
}

export const acceptAll = () =>
    saveConsent({ publicidad: true, multimedia: true, redesSociales: true });

export const rejectAll = () =>
    saveConsent({ publicidad: false, multimedia: false, redesSociales: false });

/* ------------------------------------------------------------------ */
/* Suscripción (para useSyncExternalStore)                             */
/* ------------------------------------------------------------------ */

export function subscribeConsent(callback: () => void) {
    const onStorage = (e: StorageEvent) => {
        if (e.key === CONSENT_STORAGE_KEY) callback();
    };
    window.addEventListener(CHANGE_EVENT, callback);
    window.addEventListener("storage", onStorage); // sincroniza entre pestañas
    return () => {
        window.removeEventListener(CHANGE_EVENT, callback);
        window.removeEventListener("storage", onStorage);
    };
}

/** Abre el panel de configuración de cookies desde cualquier parte de la web. */
export function openCookieSettings() {
    window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

export function onOpenCookieSettings(callback: () => void) {
    window.addEventListener(OPEN_SETTINGS_EVENT, callback);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, callback);
}
