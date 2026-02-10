import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { nombre, email, mensaje } = await request.json();

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: process.env.CONTACT_EMAIL,
                pass: process.env.CONTACT_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Formulario Web" <${process.env.CONTACT_EMAIL}>`,
            to: process.env.DESTINATION_EMAIL, // This should be configured or passed in env
            replyTo: email,
            subject: `Nuevo mensaje de ${nombre}`,
            text: mensaje,
            html: `
                <h3>Nuevo mensaje de contacto</h3>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${mensaje}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "Correo enviado con éxito" }, { status: 200 });

    } catch (error) {
        console.error("Error enviando correo:", error);
        return NextResponse.json({ message: "Error al enviar el correo" }, { status: 500 });
    }
}
