"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import EscrutinioNode from "@/components/tiptap-node/escrutinio-node/escrutinio-node-extension";


// --- Styles (Import same styles as Editor for consistency) ---
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "./NewsViewer.scss"; // Reuse editor styles if possible, or ensure global styles cover it

interface NewsViewerProps {
    content: string;
}

const NewsViewer = ({ content }: NewsViewerProps) => {
    const editor = useEditor({
        editable: false, // Read-only mode
        content: content,
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        extensions: [
            StarterKit.configure({
                horizontalRule: false,
                link: {
                    openOnClick: true, // Allow Links to be clickable in viewer
                    autolink: true,
                },
            }),
            HorizontalRule,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight.configure({ multicolor: true }),
            Image,
            Typography,
            Superscript,
            Subscript,
            Selection,
            ImageUploadNode, // We include this to render existing uploaded images properly
            EscrutinioNode,
        ],
        editorProps: {
            attributes: {
                class: "news-viewer-content wp-editor-content", // Add classes for styling matching the editor
            },
        },
    });

    if (!editor) {
        return null;
    }

    return <EditorContent editor={editor} className="news-viewer" />;
};

export default NewsViewer;
