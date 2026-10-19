"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X, ShieldCheck, Settings2, Lock } from "lucide-react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import {
    CATEGORIAS,
    CookieCategory,
    acceptAll,
    rejectAll,
    saveConsent,
    onOpenCookieSettings,
} from "@/lib/cookieConsent";

type Prefs = Record<CookieCategory, boolean>;
const PREFS_VACIAS: Prefs = { publicidad: false, multimedia: false, redesSociales: false };

/* ------------------------------------------------------------------ */
/* Interruptor accesible                                               */
/* ------------------------------------------------------------------ */
function Switch({
    id,
    checked,
    disabled,
    onChange,
    label,
}: {
    id: string;
    checked: boolean;
    disabled?: boolean;
    onChange?: (v: boolean) => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            id={id}
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 ${
                checked ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gray-300"
            } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    checked ? "translate-x-6" : "translate-x-1"
                }`}
            />
        </button>
    );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */
export default function CookieConsentBanner() {
    const consent = useCookieConsent();
    const [panelAbierto, setPanelAbierto] = useState(false);
    const [prefs, setPrefs] = useState<Prefs>(PREFS_VACIAS);

    // Permite abrir el panel desde el footer o la política de privacidad
    useEffect(
        () =>
            onOpenCookieSettings(() => {
                setPanelAbierto(true);
            }),
        []
    );

    // Al abrir el panel, cargamos las preferencias guardadas (o todo desactivado)
    useEffect(() => {
        if (panelAbierto) {
            setPrefs(
                consent
                    ? {
                          publicidad: consent.publicidad,
                          multimedia: consent.multimedia,
                          redesSociales: consent.redesSociales,
                      }
                    : PREFS_VACIAS
            );
        }
    }, [panelAbierto, consent]);

    // Cerrar con Escape y bloquear el scroll del fondo
    useEffect(() => {
        if (!panelAbierto) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanelAbierto(false);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = overflow;
            window.removeEventListener("keydown", onKey);
        };
    }, [panelAbierto]);

    // Aún no sabemos el estado (SSR / hidratación): no renderizamos nada
    if (consent === undefined) return null;

    const mostrarBanner = consent === null && !panelAbierto;

    const cerrarCon = (accion: () => void) => {
        accion();
        setPanelAbierto(false);
    };

    return (
        <>
            {/* ---------------- PRIMERA CAPA: BANNER ---------------- */}
            {mostrarBanner && (
                <div
                    role="region"
                    aria-label="Aviso de cookies"
                    className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5 animate-in slide-in-from-bottom-10 fade-in duration-500"
                >
                    <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
                        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-orange-400 to-red-500" />
                        <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center">
                            <div className="flex items-start gap-4 md:flex-1">
                                <span className="hidden sm:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                                    <Cookie className="h-6 w-6" />
                                </span>
                                <div>
                                    <h2 className="mb-1 font-serif text-lg font-bold text-gray-900">
                                        Tu privacidad es importante
                                    </h2>
                                    <p className="text-sm leading-relaxed text-gray-600">
                                        Usamos cookies propias necesarias para el funcionamiento de la web y, con tu
                                        permiso, cookies de terceros para mostrar publicidad, vídeos y contenido de
                                        redes sociales. Puedes aceptarlas, rechazarlas o configurarlas. Más
                                        información en nuestra{" "}
                                        <Link
                                            href="/politica-de-privacidad#cookies"
                                            className="font-medium text-orange-600 underline-offset-2 hover:underline"
                                        >
                                            política de privacidad
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:flex-shrink-0">
                                <button
                                    type="button"
                                    id="cookie-banner-configure"
                                    onClick={() => setPanelAbierto(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                                >
                                    <Settings2 className="h-4 w-4" />
                                    Configurar
                                </button>
                                {/* Aceptar y Rechazar con el mismo peso visual (requisito AEPD) */}
                                <button
                                    type="button"
                                    id="cookie-banner-reject"
                                    onClick={rejectAll}
                                    className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg"
                                >
                                    Rechazar todo
                                </button>
                                <button
                                    type="button"
                                    id="cookie-banner-accept"
                                    onClick={acceptAll}
                                    className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-lg"
                                >
                                    Aceptar todo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- SEGUNDA CAPA: PANEL ---------------- */}
            {panelAbierto && (
                <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setPanelAbierto(false)}
                        aria-hidden="true"
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cookie-settings-title"
                        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 sm:rounded-2xl sm:zoom-in-95"
                    >
                        {/* Cabecera */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-red-500 px-6 py-6 text-white">
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15 backdrop-blur">
                                        <ShieldCheck className="h-6 w-6" />
                                    </span>
                                    <div>
                                        <h2 id="cookie-settings-title" className="font-serif text-xl font-bold">
                                            Configuración de cookies
                                        </h2>
                                        <p className="text-sm text-orange-50">
                                            Elige qué cookies quieres permitir.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    id="cookie-settings-close"
                                    onClick={() => setPanelAbierto(false)}
                                    aria-label="Cerrar"
                                    className="rounded-full p-1.5 transition-colors hover:bg-white/20"
                                    autoFocus
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Categorías */}
                        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
                            {CATEGORIAS.map((cat) => {
                                const esNecesaria = cat.id === "necesarias";
                                const activa = esNecesaria ? true : prefs[cat.id as CookieCategory];
                                return (
                                    <div
                                        key={cat.id}
                                        className={`rounded-xl border p-4 transition-colors ${
                                            activa ? "border-orange-200 bg-orange-50/60" : "border-gray-200 bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <label
                                                    htmlFor={`cookie-switch-${cat.id}`}
                                                    className="flex items-center gap-2 font-bold text-gray-900"
                                                >
                                                    {cat.titulo}
                                                    {esNecesaria && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                                                            <Lock className="h-3 w-3" />
                                                            Siempre activas
                                                        </span>
                                                    )}
                                                </label>
                                                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                                    {cat.descripcion}
                                                </p>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    <span className="font-semibold">Proveedores:</span>{" "}
                                                    {cat.proveedores}
                                                </p>
                                            </div>
                                            <Switch
                                                id={`cookie-switch-${cat.id}`}
                                                label={cat.titulo}
                                                checked={activa}
                                                disabled={esNecesaria}
                                                onChange={(v) =>
                                                    setPrefs((p) => ({ ...p, [cat.id]: v }))
                                                }
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                id="cookie-settings-reject"
                                onClick={() => cerrarCon(rejectAll)}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                            >
                                Rechazar todo
                            </button>
                            <button
                                type="button"
                                id="cookie-settings-save"
                                onClick={() => cerrarCon(() => saveConsent(prefs))}
                                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800"
                            >
                                Guardar preferencias
                            </button>
                            <button
                                type="button"
                                id="cookie-settings-accept"
                                onClick={() => cerrarCon(acceptAll)}
                                className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                            >
                                Aceptar todo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
