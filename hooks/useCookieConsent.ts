"use client";

import { useSyncExternalStore } from "react";
import {
    CookieCategory,
    CookieConsent,
    getConsent,
    subscribeConsent,
} from "@/lib/cookieConsent";

/**
 * Devuelve:
 *  - `undefined` durante el render en servidor / antes de hidratar (estado desconocido)
 *  - `null` si el usuario aún no ha decidido
 *  - el objeto `CookieConsent` si ya decidió
 */
export function useCookieConsent(): CookieConsent | null | undefined {
    return useSyncExternalStore(subscribeConsent, getConsent, () => undefined);
}

/** `true` solo si el usuario ha aceptado expresamente la categoría. */
export function useHasConsent(category: CookieCategory): boolean | undefined {
    const consent = useCookieConsent();
    if (consent === undefined) return undefined;
    return !!consent?.[category];
}
