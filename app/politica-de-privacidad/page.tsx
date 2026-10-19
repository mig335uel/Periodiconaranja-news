import { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/Header";
import Footer from "@/components/Footer";
import CookieSettingsButton from "@/components/cookies/CookieSettingsButton";
import {
    ShieldCheck,
    UserRound,
    Database,
    Target,
    Scale,
    Clock,
    Share2,
    Globe,
    Cookie,
    BadgeCheck,
    Lock,
    Baby,
    RefreshCcw,
    Mail,
} from "lucide-react";

/**
 * ⚠️ DATOS DEL RESPONSABLE (el titular del periódico, NO de los usuarios)
 * Completa estos campos antes de publicar (art. 13 RGPD y art. 10 LSSI).
 * `nif` es el NIF/CIF del titular de la web; si lo dejas vacío no se muestra.
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
    title: "Política de Privacidad | Periódico Naranja",
    description:
        "Información sobre cómo Periódico Naranja recoge, utiliza y protege tus datos personales conforme al RGPD y la LOPDGDD.",
    alternates: { canonical: "/politica-de-privacidad" },
    robots: { index: true, follow: true },
};

const SECCIONES = [
    { id: "responsable", titulo: "Responsable del tratamiento", icon: UserRound },
    { id: "datos", titulo: "Datos que recogemos", icon: Database },
    { id: "finalidades", titulo: "Finalidades del tratamiento", icon: Target },
    { id: "legitimacion", titulo: "Base jurídica", icon: Scale },
    { id: "conservacion", titulo: "Plazos de conservación", icon: Clock },
    { id: "destinatarios", titulo: "Destinatarios y encargados", icon: Share2 },
    { id: "transferencias", titulo: "Transferencias internacionales", icon: Globe },
    { id: "cookies", titulo: "Cookies y almacenamiento local", icon: Cookie },
    { id: "derechos", titulo: "Tus derechos", icon: BadgeCheck },
    { id: "seguridad", titulo: "Seguridad", icon: Lock },
    { id: "menores", titulo: "Menores de edad", icon: Baby },
    { id: "cambios", titulo: "Cambios en esta política", icon: RefreshCcw },
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

export default function PoliticaPrivacidadPage() {
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
                        <span className="text-white">Política de privacidad</span>
                    </nav>
                    <div className="flex items-start gap-5">
                        <span className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/15 backdrop-blur border border-white/20 items-center justify-center shadow-lg">
                            <ShieldCheck className="w-9 h-9" />
                        </span>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight mb-4">
                                Política de Privacidad
                            </h1>
                            <p className="max-w-2xl text-orange-50 text-lg leading-relaxed">
                                En Periódico Naranja nos tomamos en serio tu privacidad. Aquí te explicamos,
                                de forma clara, qué datos tratamos, para qué y cuáles son tus derechos.
                            </p>
                            <p className="mt-6 inline-flex items-center gap-2 text-sm bg-white/15 backdrop-blur border border-white/20 rounded-full px-4 py-1.5">
                                <RefreshCcw className="w-4 h-4" />
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
                            aria-label="Índice de la política de privacidad"
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

                    {/* Contenido */}
                    <main className="lg:col-span-9 space-y-6">
                        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 text-gray-700 leading-relaxed">
                            Esta política se ha redactado conforme al{" "}
                            <strong>Reglamento (UE) 2016/679 General de Protección de Datos (RGPD)</strong>, la{" "}
                            <strong>Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD)</strong>{" "}
                            y la <strong>Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE)</strong>.
                            Se aplica a todos los usuarios que visiten{" "}
                            <a href={RESPONSABLE.web} className="text-orange-600 font-medium">
                                periodiconaranja.es
                            </a>
                            , complementando a nuestras{" "}
                            <Link href="/condiciones-de-servicio" className="text-orange-600 font-semibold underline">
                                Condiciones de Servicio
                            </Link>
                            .
                        </div>

                        <Seccion id="responsable" numero={1} titulo="Responsable del tratamiento" icon={UserRound}>
                            <ul>
                                <li><strong>Titular:</strong> {RESPONSABLE.titular}</li>
                                {RESPONSABLE.nif && <li><strong>NIF/CIF:</strong> {RESPONSABLE.nif}</li>}
                                
                                <li>
                                    <strong>Correo electrónico:</strong>{" "}
                                    <a href={`mailto:${RESPONSABLE.email}`}>{RESPONSABLE.email}</a>
                                </li>
                                <li><strong>Sitio web:</strong> {RESPONSABLE.web}</li>
                            </ul>
                        </Seccion>

                        <Seccion id="datos" numero={2} titulo="Datos que recogemos" icon={Database}>
                            <p>Solo tratamos los datos estrictamente necesarios para cada servicio:</p>
                            <ul>
                                <li>
                                    <strong>Registro y cuenta de usuario:</strong> nombre, apellidos, nombre público
                                    (alias), correo electrónico y contraseña (almacenada cifrada; nunca tenemos acceso a
                                    ella en texto plano). Opcionalmente, la imagen de perfil que subas. También guardamos
                                    el rol de la cuenta y las fechas de alta y última modificación.
                                </li>
                                <li>
                                    <strong>Comentarios de usuarios registrados:</strong> el contenido del comentario, la
                                    noticia en la que se publica, si es una respuesta a otro comentario, su estado de
                                    moderación y la fecha. Tu nombre público y tu avatar se mostrarán junto al
                                    comentario una vez aprobado.
                                </li>
                                <li>
                                    <strong>Comentarios sin registro:</strong> el nombre y el correo electrónico que
                                    indiques, además del contenido del comentario. Solo se publica el nombre;{" "}
                                    <strong>el correo electrónico nunca se muestra</strong> y únicamente se usa para
                                    moderación o para contactarte si fuera necesario.
                                </li>
                                <li>
                                    <strong>Formulario de contacto:</strong> nombre, correo electrónico y el mensaje que
                                    nos envíes. Estos datos se reciben por correo electrónico y no se almacenan en
                                    nuestra base de datos.
                                </li>
                                <li>
                                    <strong>Notificaciones push:</strong> si las activas, un identificador técnico
                                    (token) de tu navegador generado por Firebase Cloud Messaging. No asociamos este
                                    token a tu identidad.
                                </li>
                                <li>
                                    <strong>Datos técnicos de navegación:</strong> dirección IP, tipo de navegador,
                                    sistema operativo y páginas visitadas, que se registran de forma automática por los
                                    servidores y proveedores técnicos.
                                </li>
                            </ul>
                            <div className="not-prose mt-4 rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4 text-sm text-gray-700">
                                <strong className="text-gray-900">Lo que NO recogemos:</strong> no solicitamos DNI,
                                NIE ni ningún otro documento de identidad, datos fiscales, bancarios o de pago,
                                dirección postal, teléfono, fecha de nacimiento ni datos de categorías especiales
                                (salud, ideología, religión, etc.).
                            </div>
                        </Seccion>

                        <Seccion id="finalidades" numero={3} titulo="Finalidades del tratamiento" icon={Target}>
                            <ul>
                                <li>Gestionar tu registro, inicio de sesión y área personal (&quot;Mi cuenta&quot;).</li>
                                <li>Publicar y moderar los comentarios en las noticias.</li>
                                <li>Atender las consultas, sugerencias, correcciones o noticias que nos envíes.</li>
                                <li>Enviarte alertas de última hora mediante notificaciones push, si lo solicitas.</li>
                                <li>Ofrecer coberturas en directo, vídeos y contenido multimedia en tiempo real.</li>
                                <li>Mostrar publicidad que permite financiar el periódico.</li>
                                <li>Garantizar la seguridad, el correcto funcionamiento y la mejora del sitio web.</li>
                            </ul>
                            <p>
                                No tomamos decisiones automatizadas ni elaboramos perfiles con efectos jurídicos sobre
                                ti.
                            </p>
                        </Seccion>

                        <Seccion id="legitimacion" numero={4} titulo="Base jurídica" icon={Scale}>
                            <div className="not-prose overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-gray-600">
                                            <th className="p-3 font-semibold border-b border-gray-200">Tratamiento</th>
                                            <th className="p-3 font-semibold border-b border-gray-200">Base legal (art. 6 RGPD)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        {[
                                            ["Cuenta de usuario", "Ejecución de la relación contractual (art. 6.1.b)"],
                                            ["Comentarios (registrados y sin registro)", "Consentimiento del usuario (art. 6.1.a)"],
                                            ["Formulario de contacto", "Consentimiento del usuario (art. 6.1.a)"],
                                            ["Notificaciones push", "Consentimiento expreso a través del navegador (art. 6.1.a)"],
                                            ["Publicidad y contenido de terceros", "Consentimiento (art. 6.1.a y art. 22.2 LSSI)"],
                                            ["Seguridad y prevención de abusos", "Interés legítimo (art. 6.1.f)"],
                                            ["Cumplimiento de obligaciones legales", "Obligación legal (art. 6.1.c)"],
                                        ].map(([t, b]) => (
                                            <tr key={t} className="hover:bg-orange-50/50 transition-colors">
                                                <td className="p-3 border-b border-gray-100 font-medium">{t}</td>
                                                <td className="p-3 border-b border-gray-100">{b}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4">
                                Puedes retirar tu consentimiento en cualquier momento, sin que ello afecte a la licitud
                                del tratamiento previo.
                            </p>
                        </Seccion>

                        <Seccion id="conservacion" numero={5} titulo="Plazos de conservación" icon={Clock}>
                            <ul>
                                <li><strong>Cuenta de usuario:</strong> mientras mantengas la cuenta activa. Al eliminarla, se suprimirán tus datos salvo obligación legal.</li>
                                <li><strong>Comentarios:</strong> mientras permanezcan publicados o hasta que solicites su eliminación.</li>
                                <li><strong>Mensajes de contacto:</strong> el tiempo necesario para responder tu consulta y, como máximo, 12 meses.</li>
                                <li><strong>Token de notificaciones:</strong> hasta que desactives las notificaciones o revoques el permiso en tu navegador.</li>
                                <li><strong>Registros técnicos:</strong> durante los plazos de los proveedores de alojamiento, en general no superiores a 12 meses.</li>
                            </ul>
                            <p>Transcurridos estos plazos, los datos se bloquearán durante el tiempo de prescripción de las posibles responsabilidades legales y, después, se eliminarán.</p>
                        </Seccion>

                        <Seccion id="destinatarios" numero={6} titulo="Destinatarios y encargados" icon={Share2}>
                            <p>
                                No vendemos ni cedemos tus datos a terceros. Para prestar el servicio contamos con los
                                siguientes proveedores, que actúan como encargados del tratamiento o como terceros
                                independientes en su caso:
                            </p>
                            <ul>
                                <li><strong>Supabase:</strong> autenticación, base de datos de usuarios y comentarios, y almacenamiento de imágenes de perfil.</li>
                                <li><strong>Netlify:</strong> alojamiento y distribución del sitio web.</li>
                                <li><strong>WordPress (CMS propio):</strong> gestión y publicación de las noticias.</li>
                                <li><strong>Google Firebase Cloud Messaging:</strong> envío de notificaciones push.</li>
                                <li><strong>Pusher:</strong> actualizaciones en tiempo real de las coberturas en directo.</li>
                                <li><strong>JW Player:</strong> reproducción de vídeos.</li>
                                <li><strong>Proveedor de correo electrónico (SMTP):</strong> recepción de los mensajes del formulario de contacto.</li>
                                <li><strong>Red publicitaria de terceros (Adsterra):</strong> servicio de anuncios en los espacios publicitarios.</li>
                                <li><strong>Redes sociales (X/Twitter, Instagram, TikTok):</strong> solo si aceptas las cookies de redes sociales, se cargan las publicaciones incrustadas y la plataforma puede recoger datos de tu navegación conforme a su propia política de privacidad.</li>
                            </ul>
                            <p>Asimismo, podremos comunicar datos a las autoridades públicas cuando exista una obligación legal.</p>
                        </Seccion>

                        <Seccion id="transferencias" numero={7} titulo="Transferencias internacionales" icon={Globe}>
                            <p>
                                Algunos de los proveedores indicados (por ejemplo, Google, Netlify, Pusher, JW Player o
                                las redes sociales) pueden tratar datos fuera del Espacio Económico Europeo. En esos
                                casos, las transferencias se amparan en el{" "}
                                <strong>Marco de Privacidad de Datos UE-EE. UU.</strong>, en decisiones de adecuación
                                de la Comisión Europea o en <strong>Cláusulas Contractuales Tipo</strong>, garantizando
                                un nivel de protección equivalente al europeo.
                            </p>
                        </Seccion>

                        <Seccion id="cookies" numero={8} titulo="Cookies y almacenamiento local" icon={Cookie}>
                            <p>Utilizamos las siguientes tecnologías de almacenamiento en tu dispositivo:</p>
                            <div className="not-prose overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-gray-600">
                                            <th className="p-3 font-semibold border-b border-gray-200">Nombre</th>
                                            <th className="p-3 font-semibold border-b border-gray-200">Tipo</th>
                                            <th className="p-3 font-semibold border-b border-gray-200">Finalidad</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        {[
                                            ["sb-*", "Necesaria · cookie propia", "Mantener la sesión iniciada del usuario registrado."],
                                            ["pn_cookie_consent", "Necesaria · localStorage propio", "Recordar tus preferencias de cookies durante 12 meses."],
                                            ["notificaciones_periodico", "Necesaria · localStorage propio", "Recordar si te has suscrito a las alertas."],
                                            ["Firebase / Service Worker", "Necesaria · almacenamiento técnico", "Gestionar la recepción de notificaciones push (solo si las activas)."],
                                            ["Adsterra", "Publicidad · terceros", "Mostrar y medir los anuncios. Solo con tu consentimiento."],
                                            ["JW Player", "Multimedia · terceros", "Reproducir los vídeos de las noticias. Solo con tu consentimiento."],
                                            ["X, Instagram, TikTok", "Redes sociales · terceros", "Mostrar publicaciones incrustadas. Solo con tu consentimiento."],
                                        ].map(([n, t, f]) => (
                                            <tr key={n} className="hover:bg-orange-50/50 transition-colors">
                                                <td className="p-3 border-b border-gray-100 font-mono text-xs text-orange-700">{n}</td>
                                                <td className="p-3 border-b border-gray-100">{t}</td>
                                                <td className="p-3 border-b border-gray-100">{f}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4">
                                Las cookies necesarias están exentas de consentimiento. Las de publicidad, multimedia y
                                redes sociales <strong>están desactivadas por defecto</strong> y solo se cargan si las
                                aceptas en el aviso de cookies. Puedes cambiar o retirar tu consentimiento en cualquier
                                momento:
                            </p>
                            <div className="not-prose my-4">
                                <CookieSettingsButton
                                    id="privacy-cookie-settings"
                                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-lg"
                                >
                                    <Cookie className="h-4 w-4" />
                                    Configurar cookies
                                </CookieSettingsButton>
                            </div>
                            <p>
                                También puedes eliminar o bloquear las cookies desde la configuración de tu navegador,
                                aunque algunas funciones (como el inicio de sesión) podrían dejar de funcionar.
                            </p>
                        </Seccion>

                        <Seccion id="derechos" numero={9} titulo="Tus derechos" icon={BadgeCheck}>
                            <p>En cualquier momento puedes ejercer los siguientes derechos:</p>
                            <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                                {[
                                    ["Acceso", "Saber qué datos tuyos tratamos."],
                                    ["Rectificación", "Corregir datos inexactos o incompletos."],
                                    ["Supresión", "Solicitar que eliminemos tus datos."],
                                    ["Oposición", "Oponerte a determinados tratamientos."],
                                    ["Limitación", "Pedir que restrinjamos el uso de tus datos."],
                                    ["Portabilidad", "Recibir tus datos en un formato estructurado."],
                                ].map(([d, desc]) => (
                                    <div key={d} className="rounded-lg border border-gray-100 bg-gray-50 p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                                        <p className="font-bold text-gray-800">{d}</p>
                                        <p className="text-sm text-gray-600">{desc}</p>
                                    </div>
                                ))}
                            </div>
                            <p>
                                Para ejercerlos, escríbenos a{" "}
                                <a href={`mailto:${RESPONSABLE.email}`}>{RESPONSABLE.email}</a> indicando el derecho
                                que deseas ejercer y adjuntando un documento que acredite tu identidad. Responderemos
                                en el plazo máximo de un mes.
                            </p>
                            <p>
                                Si consideras que no hemos atendido correctamente tu solicitud, puedes presentar una
                                reclamación ante la{" "}
                                <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
                                    Agencia Española de Protección de Datos (AEPD)
                                </a>
                                .
                            </p>
                        </Seccion>

                        <Seccion id="seguridad" numero={10} titulo="Seguridad" icon={Lock}>
                            <p>
                                Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos: conexión
                                cifrada mediante HTTPS, contraseñas almacenadas con cifrado, control de acceso por roles
                                al panel de administración y políticas de seguridad a nivel de base de datos. Aun así,
                                ningún sistema es infalible, por lo que te recomendamos usar contraseñas robustas y no
                                compartirlas.
                            </p>
                        </Seccion>

                        <Seccion id="menores" numero={11} titulo="Menores de edad" icon={Baby}>
                            <p>
                                Conforme al artículo 7 de la LOPDGDD, solo los mayores de <strong>14 años</strong>{" "}
                                pueden registrarse y prestar su consentimiento. Si detectamos que un menor de esa edad
                                nos ha facilitado datos sin autorización de sus padres o tutores, los eliminaremos.
                            </p>
                        </Seccion>

                        <Seccion id="cambios" numero={12} titulo="Cambios en esta política" icon={RefreshCcw}>
                            <p>
                                Podemos actualizar esta política para adaptarla a cambios legislativos o a nuevas
                                funcionalidades del periódico. Publicaremos siempre la versión vigente en esta página,
                                indicando la fecha de la última actualización.
                            </p>
                        </Seccion>

                        {/* CTA contacto */}
                        <div className="relative overflow-hidden rounded-xl bg-gray-900 text-white p-8 md:p-10 shadow-xl">
                            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-orange-600/30 blur-3xl" />
                            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl font-bold font-serif mb-2">¿Tienes dudas sobre tu privacidad?</h2>
                                    <p className="text-gray-300">
                                        Escríbenos y te responderemos lo antes posible.
                                    </p>
                                </div>
                                <Link
                                    href="/contacto"
                                    id="privacy-contact-cta"
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
