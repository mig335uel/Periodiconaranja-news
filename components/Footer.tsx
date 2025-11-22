"use client"






export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 mt-20 py-12 border-t-8 border-orange-600">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-white text-2xl font-bold font-serif mb-4">Periódico Naranja</h2>
                <p className="text-sm mb-4">Noticias frescas, exprimidas cada mañana.</p>
                <p className="text-xs">
                    © {new Date().getFullYear()} Periódico Naranja. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}