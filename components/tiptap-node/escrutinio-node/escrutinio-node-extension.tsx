import { mergeAttributes, Node } from "@tiptap/react"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { EscrutinioComponent } from "./escrutinio-component"

declare module "@tiptap/react" {
    interface Commands<ReturnType> {
        escrutinio: {
            insertEscrutinio: () => ReturnType
        }
    }
}

export const EscrutinioNode = Node.create({
    name: "escrutinio",

    group: "block",

    draggable: true,

    selectable: true,

    atom: true,

    parseHTML() {
        return [{ tag: 'div[data-type="escrutinio"]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "div",
            mergeAttributes({ "data-type": "escrutinio" }, HTMLAttributes),
        ]
    },

    addNodeView() {
        return ReactNodeViewRenderer(EscrutinioComponent)
    },

    addCommands() {
        return {
            insertEscrutinio:
                () =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                        })
                    },
        }
    },
})

export default EscrutinioNode
