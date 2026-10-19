import { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/Header";
import Footer from "@/components/Footer";
import {
    FileText,
    Building2,
    CheckCircle2,
    UserCheck,
    Copyright,
    MessageSquareQuote,
    ExternalLink,
    AlertTriangle,
    Rss,
    Scale,
    RefreshCw,
    Mail,
} from "lucide-react";

/**
 * ⚠️ DATOS DEL RESPONSABLE
 * Mismos datos configurados para los avisos legales y privacidad
 */
const RESPONSABLE = {
    titular: "[Nombre o razón social del titular]",
    nif: "",
    domicilio: "[Domicilio postal completo]",
    email: "contacto@periodiconaranja.es",
    web: "https://www.periodiconaranja.es",
};

const ULTIMA_ACTUALIZACION = "19 de octubre de 2026";

export const metadata: Metadata = {
    title: "Condiciones de Servicio y Términos de Uso | Periódico Naranja",
    description:
        "Términos y condiciones de uso del portal de noticias Periódico Naranja, derechos de autor, normas de comentarios y responsabilidades legales.",
    alternates: { canonical: "/condiciones-de-servicio" },
    robots: { index: true, follow: true },
};

const SECCIONES = [
    { id: "titularidad", titulo: "Información general y titularidad", icon: Building2 },
    { id: "objeto", titulo: "Objeto y aceptación", icon: CheckCircle2 },
    { id: "registro", titulo: "Cuentas de usuario y registro", icon: UserCheck },
    { id: "propiedad-intelectual", titulo: "Propiedad intelectual y derechos de autor", icon: Copyright },
    { id: "comentarios", titulo: "Normas de la comunidad y comentarios", icon: MessageSquareQuote },
    { id: "terceros-publicidad", titulo: "Publicidad, enlaces y contenido incrustado", icon: ExternalLink },
    { id: "responsabilidad", titulo: "Exclusión de garantías y responsabilidad", icon: AlertTriangle },
    { id: "difusion", titulo: "Canales de difusión, RSS y notificaciones", icon: Rss },
    { id: "modificaciones", titulo: "Modificación de las condiciones", icon: RefreshCw },
    { id: "legislacion", titulo: "Legislación aplicable y jurisdicción", icon: Scale },
];

function Seccion({
    id,
    numero,
    titulo,
    icon: Icon,
    children,
}: {
    id: string;
    numero: number;
    titulo: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-28 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 md:p-8"
        >
            <div className="flex items-center gap-4 mb-5">
                <span className="flex-shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center shadow-md">
                    <Icon className="w-5 h-5" />
                </span>
                <h2 className="text-xl md:text-2xl font-bold font-serif text-gray-800">
                    <span className="text-orange-500 mr-2">{numero}.</span>
                    {titulo}
                </h2>
            </div>
            <div className="prose prose-gray max-w-none prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800 prose-li:my-1">
                {children}
            </div>
        </section>
    );
}

export default function CondicionesServicioPage() {
    return (
        <>
            <Header />

            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-red-500 text-white">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-red-700/30 blur-3xl" />
                <div className="container mx-auto px-4 py-14 md:py-20 relative">
                    <nav aria-label="Breadcrumb" className="text-sm text-orange-100 mb-6">
                        <Link href="/" className="hover:text-white transition-colors">
                            Inicio
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-white">Condiciones de servicio</span>
                    </nav>
                    <div className="flex items-start gap-5">
                        <span className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/15 backdrop-blur border border-white/20 items-center justify-center shadow-lg">
                            <FileText className="w-9 h-9" />
                        </span>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight mb-4">
                                Condiciones de Servicio
                            </h1>
                            <p className="max-w-2xl text-orange-50 text-lg leading-relaxed">
                                Bienvenido a Periódico Naranja. Estas condiciones regulan el acceso, navegación y uso
                                de nuestra plataforma de noticias y contenidos digitales.
                            </p>
                            <p className="mt-6 inline-flex items-center gap-2 text-sm bg-white/15 backdrop-blur border border-white/20 rounded-full px-4 py-1.5">
                                <RefreshCw className="w-4 h-4" />
                                Última actualización: {ULTIMA_ACTUALIZACION}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Índice */}
                    <aside className="lg:col-span-3">
                        <nav
                            aria-label="Índice de las condiciones de servicio"
                            className="lg:sticky lg:top-24 bg-gray-50 rounded-xl border-t-4 border-orange-500 shadow-md p-5"
                        >
                            <h2 className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-4">
                                Contenido
                            </h2>
                            <ol className="space-y-1">
                                {SECCIONES.map((s, i) => (
                                    <li key={s.id}>
                                        <a
                                            href={`#${s.id}`}
                                            id={`toc-${s.id}`}
                                            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                                        >
                                            <span className="w-6 h-6 flex-shrink-0 rounded-full border-2 border-orange-300 text-orange-600 text-xs font-bold flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-colors">
                                                {i + 1}
                                            </span>
                                            {s.titulo}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </aside>

                    {/* Contenido principal */}
                    <main className="lg:col-span-9 space-y-6">
                        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 text-gray-700 leading-relaxed">
                            El acceso y uso de este sitio web atribuye la condición de <strong>Usuario</strong> e
                            implica la lectura, comprensión y aceptación plena de todas las disposiciones incluidas en
                            este documento, así como de nuestra{" "}
                            <Link href="/politica-de-privacidad" className="text-orange-600 font-semibold underline">
                                Política de Privacidad
                            </Link>{" "}
                            y el régimen de cookies configurado en el portal.
                        </div>

                        {/* 1. Titularidad */}
                        <Seccion id="titularidad" numero={1} titulo="Información general y titularidad" icon={Building2}>
                            <p>
                                En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
                                Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan los datos
                                identificativos del titular de este sitio web:
                            </p>
                            <ul>
                                <li><strong>Denominación comercial:</strong> Periódico Naranja</li>
                                <li><strong>Titular:</strong> {RESPONSABLE.titular}</li>
                                {RESPONSABLE.nif && <li><strong>NIF/CIF:</strong> {RESPONSABLE.nif}</li>}
                                <li><strong>Domicilio:</strong> {RESPONSABLE.domicilio}</li>
                                <li>
                                    <strong>Correo electrónico de contacto:</strong>{" "}
                                    <a href={`mailto:${RESPONSABLE.email}`}>{RESPONSABLE.email}</a>
                                </li>
                                <li><strong>Dirección web:</strong> {RESPONSABLE.web}</li>
                            </ul>
                        </Seccion>

                        {/* 2. Objeto */}
                        <Seccion id="objeto" numero={2} titulo="Objeto y aceptación" icon={CheckCircle2}>
                            <p>
                                El presente documento regula el acceso, navegación y uso del portal informativo{" "}
                                <strong>Periódico Naranja</strong>, accesible a través del dominio principal y sus
                                subdominios asociados.
                            </p>
                            <p>
                                Periódico Naranja es un medio de comunicación digital independiente dedicado a la difusión
                                de noticias de actualidad, análisis informativo, seguimiento electoral en tiempo real,
                                coberturas de última hora y fomento del debate constructivo en la sociedad.
                            </p>
                            <p>
                                Si el usuario no está de acuerdo con las presentes condiciones, deberá abstenerse de
                                utilizar el sitio web y sus servicios asociados.
                            </p>
                        </Seccion>

                        {/* 3. Registro y Cuentas */}
                        <Seccion id="registro" numero={3} titulo="Cuentas de usuario y registro" icon={UserCheck}>
                            <p>
                                Con carácter general, el acceso a la lectura de noticias es libre y gratuito sin necesidad
                                de registro. No obstante, determinadas funcionalidades (como la gestión de perfiles o la
                                participación avanzada) pueden requerir la creación de una cuenta de usuario:
                            </p>
                            <ul>
                                <li>
                                    <strong>Veracidad de los datos:</strong> el usuario garantiza que los datos
                                    proporcionados en el registro son exactos, veraces y actualizados.
                                </li>
                                <li>
                                    <strong>Custodia de contraseñas:</strong> el usuario es responsable de mantener la
                                    confidencialidad de su contraseña y de cualquier actividad realizada desde su cuenta.
                                    En caso de sospecha de acceso no autorizado, debe notificárnoslo de inmediato.
                                </li>
                                <li>
                                    <strong>Cancelación y suspensión:</strong> Periódico Naranja se reserva el derecho a
                                    suspender o cancelar cuentas que incumplan estas condiciones, hagan un uso fraudulento
                                    del servicio o suplanten la identidad de terceros.
                                </li>
                            </ul>
                        </Seccion>

                        {/* 4. Propiedad Intelectual */}
                        <Seccion id="propiedad-intelectual" numero={4} titulo="Propiedad intelectual y derechos de autor" icon={Copyright}>
                            <p>
                                Todos los contenidos que integran este sitio web (textos periodísticos, artículos de
                                opinión, reportajes, fotografías, vídeos, logotipos, marcas comerciales, gráficos, código
                                fuente y diseño visual) están protegidos por la legislación española y europea sobre
                                <strong> Propiedad Intelectual e Industrial</strong>.
                            </p>
                            <p>
                                Corresponde en exclusiva a Periódico Naranja o a sus respectivos autores y licenciantes la
                                titularidad de dichos derechos. En consecuencia:
                            </p>
                            <ul>
                                <li>
                                    <strong>Uso personal y no comercial:</strong> se autoriza la visualización, descarga
                                    e impresión de noticias exclusivamente para fines particulares, docentes o de
                                    información personal.
                                </li>
                                <li>
                                    <strong>Derecho de cita:</strong> se autoriza la reproducción de extractos breves de
                                    nuestros artículos, siempre que se cite expresamente a <em>Periódico Naranja</em>, se
                                    mencione al autor del artículo y se incluya un <strong>enlace directo</strong> a la
                                    noticia original.
                                </li>
                                <li>
                                    <strong>Prohibición de minería de datos e inteligencia artificial:</strong> al amparo
                                    del artículo 67 del Real Decreto-ley 24/2021 y la Directiva (UE) 2019/790, Periódico
                                    Naranja se reserva expresamente todos los derechos respecto al raspado automatizado de
                                    datos (<em>text and data mining / web scraping</em>) con fines de entrenamiento,
                                    desarrollo o alimentación de modelos de inteligencia artificial sin consentimiento
                                    previo, expreso y por escrito.
                                </li>
                            </ul>
                        </Seccion>

                        {/* 5. Comentarios y Comunidad */}
                        <Seccion id="comentarios" numero={5} titulo="Normas de la comunidad y comentarios" icon={MessageSquareQuote}>
                            <p>
                                Periódico Naranja fomenta la participación y el debate plural entre sus lectores a través
                                de los comentarios en los artículos. Al participar, el usuario se compromete a respetar las
                                siguientes normas básicas:
                            </p>
                            <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
                                {[
                                    ["Respeto mutuo", "No se toleran insultos, calumnias, descalificaciones personales ni amenazas a otros usuarios o autores."],
                                    ["Tolerancia cero al odio", "Quedan terminantemente prohibidos mensajes que inciten al odio, racismo, sexismo, violencia o discriminación."],
                                    ["Prohibición de Spam", "No se permite la publicación de publicidad, enlaces comerciales, autopromoción o mensajes repetitivos."],
                                    ["Privacidad de terceros", "No publiques datos personales propios o ajenos (teléfonos, direcciones, correos o documentos privados)."],
                                ].map(([titulo, desc]) => (
                                    <div key={titulo} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                        <p className="font-bold text-gray-800 text-sm">{titulo}</p>
                                        <p className="text-xs text-gray-600 mt-1">{desc}</p>
                                    </div>
                                ))}
                            </div>
                            <p>
                                <strong>Moderación y eliminación:</strong> Periódico Naranja se reserva el derecho de
                                moderar, editar o eliminar total o parcialmente cualquier comentario que vulnere estas
                                normas o la legislación aplicable, así como de bloquear la posibilidad de comentar a los
                                infractores reiterados, sin derecho a indemnización alguna.
                            </p>
                            <p>
                                Cada usuario es legalmente responsable de las opiniones y contenidos que publique en la
                                sección de comentarios.
                            </p>
                        </Seccion>

                        {/* 6. Terceros y Publicidad */}
                        <Seccion id="terceros-publicidad" numero={6} titulo="Publicidad, enlaces y contenido incrustado" icon={ExternalLink}>
                            <p>
                                <strong>Espacios publicitarios:</strong> Periódico Naranja incluye espacios y formatos
                                publicitarios para financiar su labor informativa. Las relaciones comerciales o
                                contractuales derivadas de los anuncios corresponden exclusivamente al usuario y a los
                                respectivos anunciantes.
                            </p>
                            <p>
                                <strong>Contenidos incrustados de redes sociales:</strong> algunas noticias incorporan
                                publicaciones de redes sociales (X, Instagram, TikTok) o reproductores externos (JW
                                Player). Periódico Naranja no ejerce control sobre los términos ni sobre los cambios que
                                los autores originales realicen en dichas plataformas.
                            </p>
                            <p>
                                <strong>Enlaces externos:</strong> en caso de que el sitio web enlace a páginas de terceros,
                                Periódico Naranja no asume responsabilidad alguna por el contenido, veracidad o políticas
                                de privacidad de dichos sitios.
                            </p>
                        </Seccion>

                        {/* 7. Responsabilidad */}
                        <Seccion id="responsabilidad" numero={7} titulo="Exclusión de garantías y responsabilidad" icon={AlertTriangle}>
                            <p>
                                La redacción de Periódico Naranja aplica criterios rigurosos de diligencia informativa y
                                contraste de fuentes. No obstante:
                            </p>
                            <ul>
                                <li>
                                    <strong>Disponibilidad técnica:</strong> no podemos garantizar la ausencia total de
                                    interrupciones del servicio, caídas temporales de servidores o fallos de conexión por
                                    razones técnicas o de fuerza mayor.
                                </li>
                                <li>
                                    <strong>Derecho de rectificación:</strong> si consideras que alguna información
                                    publicada contiene errores fácticos o lesiona tu derecho al honor o a la propia imagen,
                                    puedes ejercer tu derecho de rectificación (Ley Orgánica 2/1984) escribiéndonos a{" "}
                                    <a href={`mailto:${RESPONSABLE.email}`}>{RESPONSABLE.email}</a>.
                                </li>
                                <li>
                                    <strong>Seguridad:</strong> aplicamos medidas técnicas para proteger la plataforma
                                    frente a ciberataques, pero el usuario debe disponer de sus propias herramientas de
                                    seguridad informática al navegar por la red.
                                </li>
                            </ul>
                        </Seccion>

                        {/* 8. Difusión y RSS */}
                        <Seccion id="difusion" numero={8} titulo="Canales de difusión, RSS y notificaciones" icon={Rss}>
                            <p>
                                Periódico Naranja pone a disposición de sus lectores canales de difusión adicionales:
                            </p>
                            <ul>
                                <li>
                                    <strong>Canales RSS:</strong> se autoriza el uso de nuestro feed RSS para lectores de
                                    noticias personales sin fines comerciales. Queda prohibida la republicación íntegra y
                                    automática de noticias mediante feed en portales de terceros sin autorización expresa.
                                </li>
                                <li>
                                    <strong>Notificaciones push del navegador:</strong> son un servicio voluntario e
                                    informativo gestionado a través de los permisos de tu navegador. Puedes revocar el
                                    permiso o desactivarlas en cualquier momento desde los ajustes de tu navegador.
                                </li>
                            </ul>
                        </Seccion>

                        {/* 9. Modificaciones */}
                        <Seccion id="modificaciones" numero={9} titulo="Modificación de las condiciones" icon={RefreshCw}>
                            <p>
                                Periódico Naranja se reserva el derecho de actualizar, modificar o sustituir las presentes
                                condiciones de servicio en cualquier momento, con el fin de adaptarlas a novedades
                                normativas, criterios jurisprudenciales o mejoras técnicas del medio.
                            </p>
                            <p>
                                Se indicará siempre al inicio la fecha de la última actualización y el uso continuado de la
                                plataforma tras la publicación de los cambios constituirá la aceptación de los mismos.
                            </p>
                        </Seccion>

                        {/* 10. Legislación */}
                        <Seccion id="legislacion" numero={10} titulo="Legislación aplicable y jurisdicción" icon={Scale}>
                            <p>
                                Las presentes condiciones se rigen por la <strong>legislación española</strong>. Para la
                                resolución de cualquier litigio o controversia derivada de la interpretación o ejecución de
                                este contrato:
                            </p>
                            <ul>
                                <li>
                                    Si el usuario ostenta la condición de consumidor o usuario conforme a la normativa
                                    aplicable, serán competentes los juzgados y tribunales de su domicilio habitual.
                                </li>
                                <li>
                                    En los demás supuestos, las partes se someten expresamente a los Juzgados y Tribunales
                                    de la ciudad donde radica el titular de la publicación, con renuncia a cualquier otro
                                    fuero que pudiera corresponderles.
                                </li>
                            </ul>
                        </Seccion>

                        {/* CTA contacto */}
                        <div className="relative overflow-hidden rounded-xl bg-gray-900 text-white p-8 md:p-10 shadow-xl">
                            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-orange-600/30 blur-3xl" />
                            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl font-bold font-serif mb-2">¿Tienes alguna pregunta legal o consulta editorial?</h2>
                                    <p className="text-gray-300">
                                        Nuestro equipo está a tu disposición para atender cualquier solicitud o rectificación.
                                    </p>
                                </div>
                                <Link
                                    href="/contacto"
                                    id="terms-contact-cta"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                                >
                                    <Mail className="w-5 h-5" />
                                    Contactar
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <Footer />
        </>
    );
}
