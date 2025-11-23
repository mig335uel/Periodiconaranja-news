"use client"
import { useState, useEffect } from 'react';




interface Category {
    id?: string;
    name: string;
    slug: string;
    parent_id: string | null;
    created_at?: string;
    updated_at?: string;
}


export default function CategoryForm() {
    const [categoryForm, setCategoryForm] = useState<Category>({
        name: '',
        slug: '',
        parent_id: null,
    });

    const [category, setCategory] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [parentName, setParentName] = useState("");
    const [parentId, setParentId] = useState<string | null>(null);
    useEffect(() => {
        const fetchCategories = async () => {
            const response = await fetch('/api/categories');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setLoading(false);
            setCategory(data.categories);
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryForm({
            ...categoryForm, [e.target.name]: e.target.value});
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        console.log(categoryForm);
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(categoryForm)
        });

        if(response.ok){
            alert("se ha creado la categoría");
            window.location.reload();
        }

        console.error(await response.json());
    };

    const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setParentName(val);

        // Buscamos si el nombre escrito coincide exactamente con alguna categoría
        const foundCategory = category.find(cat => cat.name.toLowerCase() === val.toLowerCase());

        // Si encontramos coincidencia, guardamos el ID. Si no, es null.
        setParentId(foundCategory ? foundCategory.id! : null);

        setCategoryForm({...categoryForm, 'parent_id': foundCategory  ? foundCategory.id! : null})
    };

    if (loading) {
        return <div className="p-6">Cargando categorías...</div>;
    }


    return (
        <div className="container p-6 bg-gray-50 items-center flex justify-center">

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre" name="name"value={categoryForm.name} onChange={handleChange} />
                <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Slug" name="slug"value={categoryForm.slug} onChange={handleChange} />
                <input
                    list="lista-categorias" // 1. Vinculamos al ID del datalist
                    type="text"
                    value={parentName}
                    onChange={handleParentChange}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Escribe para buscar..."
                />

                {/* 2. Definimos las opciones ocultas */}
                <datalist id="lista-categorias">
                    {category.map((category) => (
                        <option key={category.id} value={category.name} />
                    ))}
                </datalist>
                <button type="submit">Guardar</button>
            </form>
        </div>

    );
}