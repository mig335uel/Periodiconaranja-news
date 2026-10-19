"use client";

import { openCookieSettings } from "@/lib/cookieConsent";

/** Botón que reabre el panel de configuración de cookies (revocación del consentimiento). */
export default function CookieSettingsButton({
    id = "cookie-settings-open",
    className = "",
    children = "Configurar cookies",
}: {
    id?: string;
    className?: string;
    children?: React.ReactNode;
}) {
    return (
        <button type="button" id={id} onClick={openCookieSettings} className={className}>
            {children}
        </button>
    );
}
