"use client";

import { useAuth } from "@/hooks/useAuth";
import { ComentariosAdminModule } from "@/Types/Comments";
import { Author } from "@/Types/Posts";
import { comment } from "postcss";
import { useState, useEffect, useCallback } from "react";

// --- 1. INTERFAZ DE DATOS (basada en tu consulta) ---
// La estructura refleja '*, users(*)' - posts relation removed
interface Comment {
  id: string;
  post_id: number;
  content: string;
  status: "pending" | "approved" | "spam" | "deleted"; // changed published to approved
  created_at: string;
  // La relación incrustada 'users' de Supabase
  users: {
    name: string;
    last_name: string | null;
    image?: string;
  } | null;
}
interface ComentarioFormData {
  user_id: string | null;
  post_id: number;
  parent_id?: string | null;
  content: string;
  anonymous_name?: string | null;
  anonymous_email?: string | null;
  status: "approved" | "pending" | "spam";
}

export default function CommentsAdmin() {
  const [comments, setComments] = useState<Comment[]>([]); // Use Comment interface
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // --- 2. FUNCIÓN DE CARGA DE DATOS ---

  const fetchComments = async () => {
    setLoading(true);
    const response = await fetch("/api/comentarios");

    if (response.ok) {
      const data = await response.json();
      setComments(data);
      setLoading(false);
    }
  };

  // --- Cargar Comentarios y Usuario Actual al montar el componente ---
  useEffect(() => {
    // En un escenario real, también cargarías la sesión/rol del
    // Simulamos la carga de un usuario con rol 'admin'
    setCurrentUser(user);
    fetchComments();
  }, [user]);

  // --- 3. FUNCIONES DE ADMINISTRACIÓN ---

  // **Verificación de Permisos**
  const canModerate =
    currentUser?.role === "admin" || currentUser?.role === "editor";

  // Manejadores específicos

  // --- 4. RENDERIZADO DE LA TABLA ---
  const ApproveComment = useCallback(async (comment: Comment) => {
    const bodyData = {
      id: comment.id,
      status: "approved",
    };
    try {
      const response = await fetch("/api/comentarios", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchComments();
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const DeleteComment = useCallback(async (comment: Comment) => {
    const bodyData = {
      id: comment.id
    };
    try {
      const response = await fetch("/api/comentarios", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchComments();
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (loading) {
    return <div className="p-6">Cargando comentarios...</div>;
  }
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Gestión de Comentarios</h2>
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contenido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Post ID
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
            {comments.map((comment) => (
              <tr
                key={comment.id}
                className={comment.status === "spam" ? "bg-red-50" : ""}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                  {comment.content}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comment.users?.name + " " + comment.users?.last_name ||
                    "Anónimo"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a
                    href={`/noticias/${comment.post_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {comment.post_id}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${comment.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : comment.status === "spam"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {comment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                  {/* Botones de acción, visibles solo para moderadores/admins */}
                  {canModerate && (
                    <>
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Editar
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-900 mr-4">
                        Spam
                      </button>
                      <button className="text-red-600 hover:text-red-900 mr-4" onClick={() => DeleteComment(comment)}>
                        Borrar
                      </button>

                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => ApproveComment(comment)}
                      >
                        Aprobar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
