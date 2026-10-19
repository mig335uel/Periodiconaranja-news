"use client"

import Link from "next/link";
import CookieSettingsButton from "@/components/cookies/CookieSettingsButton";




export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 mt-20 py-12 border-t-8 border-orange-600">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-white text-2xl font-bold font-serif mb-4">Periódico Naranja</h2>
                <p className="text-sm mb-4">Noticias que inspirar, información que conecta.</p>
                <nav aria-label="Enlaces legales" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm mb-4">
                    <Link href="/politica-de-privacidad" id="footer-privacy-link" className="hover:text-orange-500 transition-colors">
                        Política de privacidad
                    </Link>
                    <Link href="/contacto" id="footer-contact-link" className="hover:text-orange-500 transition-colors">
                        Contacto
                    </Link>
                    <CookieSettingsButton id="footer-cookie-settings" className="hover:text-orange-500 transition-colors" />
                </nav>
                <p className="text-xs">
                    © {new Date().getFullYear()} Periódico Naranja. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}