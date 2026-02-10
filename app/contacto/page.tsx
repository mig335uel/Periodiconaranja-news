import { Metadata } from "next";
import Header from "@/app/Header";
import Contacto from "@/components/Contacto";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: "Contacto",
    description: "Formulario de contacto",
};

export default async function ContactoPage() {
    return (
        <>
            <Header />
            <Contacto />
            <Footer />
        </>
    );
}