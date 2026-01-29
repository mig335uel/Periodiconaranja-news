"use client"

import { useState, useEffect, useCallback } from "react";
import { LiveUpdate } from "@/Types/Posts";







export default function LiveUpdates({ postId }: { postId: number }) {
    const [updates, setUpdates] = useState<LiveUpdate[]>([]);
    const query = `query NewQuery {
post(id: "${postId}", idType: DATABASE_ID) {
    liveUpdates {
      id
      date
      content
      author
      timestamp
      title
    }
  }
}`;
    const fetchData = async () => {
        const result = await fetch(`/api/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        });
        
        const data = await result.json();
        console.log(data);
        setUpdates(data.data.post.liveUpdates);
    }
    useEffect(() => {
        // 1. Hacemos la carga inicial inmediatamente
        fetchData();

        // 2. Configuramos el intervalo (ejemplo: cada 10 segundos)
        const intervalId = setInterval(() => {
            fetchData();
        }, 10000); // 10000 ms = 10 segundos

        // 3. Importante: Limpiamos el intervalo cuando el componente se desmonte
        return () => clearInterval(intervalId);
    }, [postId]);



    return (
        <>
            {updates.map((update) => (
                <div key={update.id}>
                    <div className="flex items-center gap-2">
                        <div className="p-4 w-24 text-center bg-orange-500 text-white">{new Date(update.date).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}</div>
                        <div className="article-content">
                            <h3 className="text-xl font-semibold mb-4">
                                {update.title}
                            </h3>
                        </div>
                    </div>
                    <div
                        className="article-content"
                        dangerouslySetInnerHTML={{ __html: update.content }}
                    ></div>
                    <hr className="my-4" />
                </div>
            ))}
        </>
    );


}