"use client"

import Header from "@/app/Header";
import { useAuth } from "@/hooks/useAuth";
import Footer from "../Footer";
import { useState } from "react";


interface EditMyAccountProps {
    isEditing: boolean;
    onCancel: () => void;
}

export default function EditMyAccount({ isEditing, onCancel }: EditMyAccountProps) {
    const { user } = useAuth();
    const [updateUser, setUpdateUser] = useState({
        id: user?.id,
        name: user?.name,
        last_name: user?.last_name,
        email: user?.email,
        password: "",
        display_name: user?.display_name,
    });
    const possibleDisplayNames = [
        `${user?.name} ${user?.last_name}`, // Nombre + Apellido // Apellido + Nombre
        user?.name,                               // Solo Nombre
        user?.last_name                           // Solo Apellido
    ].filter(Boolean);
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (updateUser.name !== user?.name || updateUser.last_name !== user?.last_name || updateUser.email !== user?.email || updateUser.password !== "") {
            const response = await fetch(`/api/users/${user?.id}`, {
                method: 'PUT',
                credentials: 'include',
                body: JSON.stringify(updateUser)
            });
            if (response.ok) {
                alert("Usuario actualizado correctamente");
                window.location.reload();
            }
        }
    }

    return (
        <div className="flex flex-col w-full border p-4 md:p-7">
            <form action="post" onSubmit={(e) => handleSubmit(e)} className="flex flex-col justify-between m-">
                <input type="text" placeholder={`Nombre: ${user?.name}`} value={updateUser.name} onChange={(e) => setUpdateUser({ ...updateUser, name: e.target.value })} className="p-3 md:p-5 border rounded-lg mb-3 border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans font-semibold" />
                <input type="text" placeholder={`Apellidos: ${user?.last_name}`} value={updateUser.last_name} onChange={(e) => setUpdateUser({ ...updateUser, last_name: e.target.value })} className="p-3 md:p-5 border rounded-lg mb-3 border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans font-semibold" />
                <input type="email" placeholder={`Email: ${user?.email}`} value={updateUser.email} onChange={(e) => setUpdateUser({ ...updateUser, email: e.target.value })} className="p-3 md:p-5 border rounded-lg mb-3 border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans font-semibold" />
                <input type="password" placeholder="Contraseña" value={updateUser.password} onChange={(e) => setUpdateUser({ ...updateUser, password: e.target.value })} className="p-3 md:p-5 border rounded-lg mb-3 border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans font-semibold" />
                <select
                    name="display_name"
                    value={updateUser.display_name || ""}
                    onChange={(e) => setUpdateUser({ ...updateUser, display_name: e.target.value })}
                    className="p-3 md:p-5 border rounded-lg mb-3 border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans font-semibold"
                >
                    <option value="" disabled>Selecciona cómo quieres aparecer</option>
                    {possibleDisplayNames.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <div className="flex flex-row gap-5 w-full justify-between">
                    <button type="submit" className="border p-3 md:p-5 bg-orange-500 text-white rounded-xl font-sans font-semibold w-full">Actualizar</button>
                    <button onClick={() => onCancel()} className="border p-3 md:p-5 bg-red-600 text-white rounded-xl font-sans font-semibold w-full">Cancelar</button>
                </div>
            </form>
        </div>
    );
}