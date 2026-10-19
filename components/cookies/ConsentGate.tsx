"use client";

import { ReactNode } from "react";
import { Cookie, PlayCircle, Share2 } from "lucide-react";
import { useHasConsent } from "@/hooks/useCookieConsent";
import { CookieCategory, getConsent, saveConsent, openCookieSettings } from "@/lib/cookieConsent";

const TEXTOS: Record<CookieCategory, { titulo: string; texto: string; icon: React.ElementType }> = {
    publicidad: {
        titulo: "Publicidad desactivada",
        texto: "Has rechazado las cookies publicitarias.",
        icon: Cookie,
    },
    multimedia: {
        titulo: "Vídeo bloqueado",
        texto: "Este vídeo lo sirve JW Player, que puede instalar cookies en tu navegador.",
        icon: PlayCircle,
    },
    redesSociales: {
        titulo: "Contenido de redes sociales",
        texto: "Esta publicación procede de una red social que puede rastrear tu navegación.",
        icon: Share2,
    },
};

interface ConsentGateProps {
    category: CookieCategory;
    children: ReactNode;
    /**
     * `placeholder` (por defecto): muestra un aviso para permitir el contenido.
     * `hide`: no muestra nada si no hay consentimiento (útil para anuncios).
     */
    fallback?: "placeholder" | "hide";
    className?: string;
}

/** Solo renderiza `children` si el usuario ha consentido la categoría indicada. */
export default function ConsentGate({
    category,
    children,
    fallback = "placeholder",
    className = "",
}: ConsentGateProps) {
    const allowed = useHasConsent(category);

    if (allowed) return <>{children}</>;
    if (fallback === "hide") return null;

    // Estado desconocido (SSR): reservamos espacio para evitar saltos de maquetación
    if (allowed === undefined) {
        return <div className={`my-6 min-h-[180px] rounded-xl bg-gray-100 animate-pulse ${className}`} />;
    }

    const { titulo, texto, icon: Icon } = TEXTOS[category];

    const permitir = () => {
        const actual = getConsent();
        saveConsent({
            publicidad: actual?.publicidad ?? false,
            multimedia: actual?.multimedia ?? false,
            redesSociales: actual?.redesSociales ?? false,
            [category]: true,
        });
    };

    return (
        <div
            className={`not-prose my-6 mx-auto max-w-xl overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 text-center shadow-sm ${className}`}
        >
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md">
                <Icon className="h-6 w-6" />
            </span>
            <p className="font-serif text-lg font-bold text-gray-900">{titulo}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-600">{texto}</p>
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                <button
                    type="button"
                    onClick={permitir}
                    className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange-700"
                >
                    Permitir y mostrar
                </button>
                <button
                    type="button"
                    onClick={openCookieSettings}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                >
                    Configurar cookies
                </button>
            </div>
        </div>
    );
}
