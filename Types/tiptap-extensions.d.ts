// tiptap-extensions.d.ts
import '@tiptap/core'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        // Puedes llamar a este grupo como quieras, ej: 'customBackgroundColor'
        customBackgroundColor: {
            /**
             * Elimina el color de fondo del nodo
             */
            unsetNodeBackgroundColor: () => ReturnType;

            /**
             * Alterna el color de fondo del nodo
             */
            toggleNodeBackgroundColor: (color: string) => ReturnType;
        }
    }
}