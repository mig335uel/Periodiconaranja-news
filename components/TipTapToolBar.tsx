// components/TiptapToolbar.tsx
"use client";

import { type Editor } from "@tiptap/react";
// Importa el botón que acabas de instalar de Shadcn
import { Button } from "@/components/ui/button";
// Importa el componente 'toggle' para botones que se quedan activos
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Strikethrough } from "lucide-react"; // (iconos opcionales)

type Props = {
    editor: Editor | null;
};

export const Toolbar = ({ editor }: Props) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="border border-input bg-transparent rounded-md p-1 flex gap-1">
            {/* Usamos el componente <Toggle> de Shadcn.
        - Le damos la variante "outline".
        - Usamos `pressed` para que se vea "hundido" si el formato está activo.
        - `onClick` ejecuta el comando de Tiptap.
      */}
            <Toggle
                size="sm"
                variant="outline"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                variant="outline"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                variant="outline"
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>

            {/* ¡Incluso un botón normal de Shadcn para algo como deshacer! */}
            <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().undo().run()}
            >
                Deshacer
            </Button>
        </div>
    );
};