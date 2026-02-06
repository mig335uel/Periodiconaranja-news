"use client";

import Header from "@/app/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-20 flex justify-center items-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404 - Página no encontrada</h1>
                    <p className="text-lg text-gray-600 mb-6">Lo sentimos, la página que buscas no existe.</p>
                    <a href="/" className="text-orange-500 hover:underline">Volver al inicio</a>
                </div>
            </div>
            <Footer />
        </>
    );
}