"use client";


import { useEffect, useState } from "react";

import { Edit, Trash2 } from "lucide-react";
import type {Author, Post} from "@/Types/Posts";


export default function Post() {
    const[posts, setPosts] = useState<Post[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/post/administrator', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };



        fetchPosts();
    }, []);

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const response = await fetch('/api/authors', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                setAuthors(data);
            } catch (error) {
                console.error('Error fetching authors:', error);
            }
        };
        fetchAuthors();
    }, []);

    const handleEdit = (postId: string) => {
        window.location.href = (`/adminPanel/post/edit/${postId}`);
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este post?')) {
            return;
        }

        try {
            const response = await fetch(`/api/post/${postId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setPosts(posts.filter(post => post.id !== postId));
                alert('Post eliminado exitosamente');
            } else {
                alert('Error al eliminar el post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Error al eliminar el post');
        }
    };

    return (
        <div className="flex-1 p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
                <button
                    onClick={() =>  window.location.href = ('/adminPanel/post/create')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Crear nuevo post
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Autor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha de Publicación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {authors.find(author => author.id === post.author_id)?.name + ' ' + authors.find(author => author.id === post.author_id)?.last_name || 'Desconocido'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            post.is_published
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {post.is_published ? 'Publicado' : 'Borrador'}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(post.id)}
                                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))):(
                            <tr>
                                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                    No hay posts disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {posts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No hay posts disponibles</p>
                    </div>
                )}
            </div>
        </div>
    );
}