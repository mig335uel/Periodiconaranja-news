import { NodeViewWrapper } from "@tiptap/react"
import EscrutinioTotal from "@/components/Elecciones/EscrutinioTotal"
import React from "react"

export const EscrutinioComponent = () => {
    return (
        <NodeViewWrapper className="escrutinio-node-view">
            {/* We wrap it in a div that handles selection styling provided by TipTap/NodeViewWrapper */}
            <div className="relative border-2 border-transparent hover:border-gray-200 transition-colors rounded-lg overflow-hidden my-4 bg-white">
                <EscrutinioTotal />
                {/* Overlay to prevent interaction conflicts if necessary, though Escrutinio seems read-only/interactive */}
            </div>
        </NodeViewWrapper>
    )
}
