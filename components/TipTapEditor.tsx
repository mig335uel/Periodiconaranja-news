"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
    Toolbar,
    ToolbarGroup,
    ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "./NewEditor.scss"
// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
    ColorHighlightPopover,
    ColorHighlightPopoverContent,
    ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
    LinkPopover,
    LinkContent,
    LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";

// --- Icons ---

import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";

import { useAuth } from "@/hooks/useAuth";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Styles ---


// --- Types ---
import type { CreatePostData } from "@/Types/Posts";
import { ArrowLeftIcon } from "lucide-react";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";

import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";


interface Category {
    id: string;
    name: string;
    parent_id: string | null;
    children?: Category[];
}

interface NewsFormData extends CreatePostData {
    featuredImage: string | null; // URL de la imagen de portada
}

const MainToolbarContent = ({
    onHighlighterClick,
    onLinkClick,
    isMobile,
}: {
    onHighlighterClick: () => void;
    onLinkClick: () => void;
    isMobile: boolean;
}) => {
    return (
        <>
            <Spacer />

            <ToolbarGroup>
                <UndoRedoButton action="undo" />
                <UndoRedoButton action="redo" />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
                <ListDropdownMenu
                    types={["bulletList", "orderedList", "taskList"]}
                    portal={isMobile}
                />
                <BlockquoteButton />
                <CodeBlockButton />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <MarkButton type="bold" />
                <MarkButton type="italic" />
                <MarkButton type="strike" />
                <MarkButton type="code" />
                <MarkButton type="underline" />
                {!isMobile ? (
                    <ColorHighlightPopover />
                ) : (
                    <ColorHighlightPopoverButton onClick={onHighlighterClick} />
                )}
                {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <MarkButton type="superscript" />
                <MarkButton type="subscript" />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <TextAlignButton align="left" />
                <TextAlignButton align="center" />
                <TextAlignButton align="right" />
                <TextAlignButton align="justify" />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <ImageUploadButton text="Add" />
            </ToolbarGroup>

            <Spacer />
        </>
    );
};

const MobileToolbarContent = ({
    type,
    onBack,
}: {
    type: "highlighter" | "link";
    onBack: () => void;
}) => (
    <>
        <ToolbarGroup>
            <Button data-style="ghost" onClick={onBack}>
                <ArrowLeftIcon className="tiptap-button-icon" />
                {type === "highlighter" ? (
                    <HighlighterIcon className="tiptap-button-icon" />
                ) : (
                    <LinkIcon className="tiptap-button-icon" />
                )}
            </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        {type === "highlighter" ? (
            <ColorHighlightPopoverContent />
        ) : (
            <LinkContent />
        )}
    </>
);

// Componente para renderizar árbol de categorías
const CategoryTreeItem = ({
    category,
    selectedIds,
    onToggle,
    level = 0,
}: {
    category: Category;
    selectedIds: string[];
    onToggle: (id: string) => void;
    level?: number;
}) => {
    const paddingClass = level === 0 ? '' : level === 1 ? 'level-1' : level === 2 ? 'level-2' : 'level-3';

    return (
        <>
            <label
                className={`wp-category-item ${paddingClass}`}
            >
                <input
                    type="checkbox"
                    checked={selectedIds.includes(category.id)}
                    onChange={() => onToggle(category.id)}
                />
                <span>{category.name}</span>
            </label>
            {category.children && category.children.length > 0 && (
                <>
                    {category.children.map((child) => (
                        <CategoryTreeItem
                            key={child.id}
                            category={child}
                            selectedIds={selectedIds}
                            onToggle={onToggle}
                            level={level + 1}
                        />
                    ))}
                </>
            )}
        </>
    );
};

// eslint-disable-next-line @next/next/no-async-client-component
// eslint-disable-next-line react-hooks/rules-of-hooks
export default function NewsEditor() {
    const supabase = useMemo(() => createClient(), []);
    const { user } = useAuth();


    const pathname = usePathname();
    const pathParts = pathname.split('/');

    // Lógica para determinar el postId
    const lastPathSegment = pathParts[pathParts.length - 1];
    const postId = lastPathSegment !== 'create' && pathname.includes('edit')
        ? lastPathSegment
        : undefined;

    const isMobile = useIsBreakpoint();
    const { height } = useWindowSize();
    const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
        "main"
    );
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(!!postId); // Si hay postId, está cargando

    // Form state
    const [formData, setFormData] = useState<NewsFormData>({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        categoryIds: [],
        authorId: user?.id || "", // ID del usuario autenticado
        featuredImage: null,
    });
    const slugRef = useRef(formData.slug);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"draft" | "published">("draft");
    const [postExists, setPostExists] = useState(false); // Rastrea si el post ya existe
    const tiptapHandleImageUpload = useCallback(async (file: File): Promise<string> => {
        const currentSlug = slugRef.current;
        console.log("Uploading image for slug:", currentSlug);

        if (!currentSlug) {
            alert("Por favor, escribe un título primero para generar un slug.");
            throw new Error("Slug is missing");
        }

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        formDataUpload.append('slug', currentSlug);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                credentials: 'include', // <- importante para enviar cookies de sesión
                body: formDataUpload,

            });

            // Leer cuerpo como texto para evitar `Unexpected end of JSON input`
            const text = await response.text();

            // Intentar parsear JSON solo si hay texto
            let data: any = null;
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (err) {
                    console.error('JSON parse error:', err, 'response text:', text);
                    throw new Error('Respuesta no válida del servidor');
                }
            }

            if (!response.ok) {
                console.log(response);
                const message = data?.error ?? `Error HTTP ${response.status}`;
                throw new Error(message);
            }

            if (!data || !data.success) {
                throw new Error(data?.error ?? 'Error desconocido al subir la imagen');
            }

            return data.url;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("Error al subir la imagen de Tiptap:", message);
            alert(`Error al subir la imagen: ${message}`);
            throw err;
        }
    }, []); // Se "actualiza" si el slug cambia
    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        editorProps: {
            attributes: {
                autocomplete: "off",
                autocorrect: "off",
                autocapitalize: "off",
                "aria-label": "Contenido de la noticia",
                class: "news-editor",
            },
        },

        extensions: [
            StarterKit.configure({
                horizontalRule: false,
                link: {
                    openOnClick: false,
                    enableClickSelection: true,
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
            ImageUploadNode.configure({
                accept: "image/*",
                maxSize: MAX_FILE_SIZE,
                upload: tiptapHandleImageUpload,
                onError: (error) => console.error("Upload failed:", error),
            }),
        ],
        content: formData.content,
        onUpdate: ({ editor }) => {
            setFormData((prev) => ({
                ...prev,
                content: editor.getHTML(),
            }));
        },
    });


    const rect = useCursorVisibility({
        editor,
        overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
    });

    useEffect(() => {
        if (!isMobile && mobileView !== "main") {
            setMobileView("main");
        }
    }, [isMobile, mobileView]);

    // Actualizar authorId cuando el usuario esté disponible
    useEffect(() => {
        if (user?.id) {
            setFormData(prev => ({ ...prev, authorId: user.id }));
        }
    }, [user]);

    // Cargar post si se está editando
    useEffect(() => {
        if (postId) {
            const loadPost = async () => {
                try {
                    console.log('Loading post:', postId);

                    const { data, error } = await supabase.from('posts').select('*, post_categories(*)').eq('id', postId).single();

                    if (error) {
                        throw error;
                    }

                    console.log('Post data:', data);
                    setFormData({
                        title: data.title,
                        slug: data.slug,
                        content: data.content,
                        excerpt: data.excerpt || "",
                        categoryIds: data.post_categories ? data.post_categories.map((cat: any) => cat.category_id) : [],
                        authorId: data.author_id,
                        featuredImage: data.featured_image || null,
                    });
                    setPostExists(true); // El post ya existe
                } catch (error) {
                    console.error("Error loading post:", error);
                    alert(`Error al cargar el post: ${error}`);
                } finally {
                    setIsLoading(false);
                }
            };
            loadPost();
        } else {
            setIsLoading(false);
        }
    }, [postId, supabase]);

    // Actualizar contenido del editor cuando formData.content cambie
    useEffect(() => {
        if (editor && formData.content && postId) {
            editor.commands.setContent(formData.content);
        }
    }, [editor, formData.content, postId]);

    // Fetch de categorías
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*');

                if (error) {
                    throw error;
                }
                const categoryTree = buildCategoryTree(data);
                setCategories(categoryTree);
            } catch (e) {
                console.error("Error fetching categories:", e);
            }
        };
        fetchCategories();
    }, [supabase]);

    // Construir árbol de categorías
    const buildCategoryTree = (categories: Category[]): Category[] => {
        const categoryMap = new Map<string, Category>();
        const rootCategories: Category[] = [];

        // Crear mapa de categorías con children inicializado
        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        // Construir el árbol
        categories.forEach(cat => {
            const category = categoryMap.get(cat.id)!;
            if (cat.parent_id === null) {
                rootCategories.push(category);
            } else {
                const parent = categoryMap.get(cat.parent_id);
                if (parent) {
                    parent.children!.push(category);
                }
            }
        });

        return rootCategories;
    };


    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        setFormData((prev) => ({
            ...prev,
            title,
            slug,
        }));
        slugRef.current = slug;
    };

    const handleCategoryToggle = (categoryId: string) => {
        setFormData((prev) => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter((id) => id !== categoryId)
                : [...prev.categoryIds, categoryId],
        }));
    };

    const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (máximo 50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert("La imagen es muy grande. Máximo 50MB.");
            return;
        }

        // Validar tipo
        if (!file.type.startsWith("image/")) {
            alert("Por favor selecciona una imagen válida.");
            return;
        }

        // Crear preview local
        const reader = new FileReader();
        reader.onload = (event) => {
            setFormData((prev) => ({
                ...prev,
                featuredImage: event.target?.result as string,
            }));
        };
        reader.readAsDataURL(file);

    };

    const handleRemoveFeaturedImage = () => {
        setFormData((prev) => ({
            ...prev,
            featuredImage: null,
        }));
    };

    const handleSaveDraft = async () => {
        setIsSubmitting(true);
        setStatus("draft");

        try {
            console.log('Guardando borrador:', formData);

            const response = await fetch('/api/posts/draft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: formData.title,
                    slug: formData.slug,
                    content: editor!.getHTML(),
                    excerpt: formData.excerpt,
                    categoryIds: formData.categoryIds,
                    authorId: formData.authorId,
                    featuredImage: formData.featuredImage,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Borrador guardado exitosamente:', data);
                setPostExists(true); // Marcar que el post ya existe
                alert('¡Borrador guardado exitosamente!');
            } else {
                console.error('Error al guardar borrador:', data);
                alert(`Error al guardar: ${data.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("Error al guardar borrador:", error);
            alert(`Error de conexión: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePublish = async () => {
        setIsSubmitting(true);
        setStatus("published");

        try {
            console.log('Publicando post:', formData);

            // Si el post ya existe (fue guardado como borrador), usar PUT
            const method = postExists ? 'PUT' : 'POST';


            const response = await fetch((postExists ? `/api/post/${postId}` : '/api/post'), {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: formData.title,
                    slug: formData.slug,
                    content: editor!.getHTML(),
                    excerpt: formData.excerpt,
                    categoryIds: formData.categoryIds,
                    authorId: '',
                    featuredImage: formData.featuredImage,
                    isPublished: true, // Marcar como publicado
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Post publicado exitosamente:', data);
                setPostExists(true); // Marcar que el post existe
                alert('¡Post publicado exitosamente!');
            } else {
                console.error('Error al publicar el post:', data);
                alert(`Error al publicar: ${data.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("Error al publicar:", error);
            alert(`Error de conexión: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // @ts-ignore
    return (
        <div className="wp-editor-wrapper">
            {isLoading ? (
                <div className="flex items-center justify-center h-screen">
                    <p className="text-gray-500">Cargando post...</p>
                </div>
            ) : (
                <>
                    {/* Header con botones de acción - estilo WordPress */}
                    <div className="wp-editor-header">
                        <div className="wp-header-left">
                            <h1>{postId ? 'Editar entrada' : 'Añadir nueva entrada'}</h1>
                        </div>
                        <div className="wp-header-actions">
                            <button
                                type="button"
                                className="btn-preview"
                                disabled={isSubmitting}
                            >
                                Vista previa
                            </button>
                            <button
                                type="button"
                                className="btn-draft"
                                onClick={handleSaveDraft}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && status === "draft" ? "Guardando..." : "Guardar borrador"}
                            </button>
                            <button
                                type="button"
                                className="btn-publish"
                                onClick={handlePublish}
                                disabled={isSubmitting || !formData.title}
                            >
                                {isSubmitting && status === "published" ? "Publicando..." : "Publicar"}
                            </button>
                        </div>
                    </div>

                    {/* Layout principal: contenido + sidebar */}
                    <div className="wp-editor-layout">
                        {/* Contenido principal */}
                        <div className="wp-editor-main">
                            {/* Campo de título */}
                            <div className="wp-title-field">
                                <input
                                    type="text"
                                    className="wp-title-input"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="Añade un título"
                                />
                            </div>

                            {/* Campo de excerpt */}
                            <div className="wp-excerpt-field">
                                <textarea
                                    className="wp-excerpt-input"
                                    value={formData.excerpt || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                                    }
                                    placeholder="Resumen o extracto (opcional)"
                                    rows={3}
                                />
                            </div>

                            {/* Editor de contenido */}
                            <div className="wp-editor-content-wrapper">
                                <EditorContext.Provider value={{ editor }}>
                                    <Toolbar
                                        ref={toolbarRef}
                                        style={{
                                            ...(isMobile
                                                ? {
                                                    bottom: `calc(100% - ${height - rect.y}px)`,
                                                }
                                                : {}),
                                        }}
                                    >
                                        {mobileView === "main" ? (
                                            <MainToolbarContent
                                                onHighlighterClick={() => setMobileView("highlighter")}
                                                onLinkClick={() => setMobileView("link")}
                                                isMobile={isMobile}
                                            />
                                        ) : (
                                            <MobileToolbarContent
                                                type={mobileView === "highlighter" ? "highlighter" : "link"}
                                                onBack={() => setMobileView("main")}
                                            />
                                        )}
                                    </Toolbar>

                                    <EditorContent
                                        editor={editor}
                                        role="presentation"
                                        className="wp-editor-content"
                                    />
                                </EditorContext.Provider>
                            </div>
                        </div>

                        {/* Sidebar derecho - estilo WordPress */}
                        <div className="wp-editor-sidebar">
                            {/* Panel de Publicar */}
                            <div className="wp-sidebar-panel">
                                <div className="wp-panel-header">
                                    <h3>Publicar</h3>
                                </div>
                                <div className="wp-panel-body">
                                    <div className="wp-panel-row">
                                        <span className="wp-panel-label">Estado:</span>
                                        <span className="wp-panel-value">Borrador</span>
                                    </div>
                                    <div className="wp-panel-row">
                                        <span className="wp-panel-label">Visibilidad:</span>
                                        <span className="wp-panel-value">Público</span>
                                    </div>
                                </div>
                            </div>

                            {/* Panel de Categorías */}
                            <div className="wp-sidebar-panel">
                                <div className="wp-panel-header">
                                    <h3>Categorías</h3>
                                </div>
                                <div className="wp-panel-body">
                                    {categories.length === 0 ? (
                                        <p className="wp-panel-empty">No hay categorías disponibles</p>
                                    ) : (
                                        <div className="wp-categories-list">
                                            {categories.map((category) => (
                                                <CategoryTreeItem
                                                    key={category.id}
                                                    category={category}
                                                    selectedIds={formData.categoryIds}
                                                    onToggle={handleCategoryToggle}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Panel de Imagen de Portada */}
                            <div className="wp-sidebar-panel">
                                <div className="wp-panel-header">
                                    <h3>Imagen destacada</h3>
                                </div>
                                <div className="wp-panel-body">
                                    {formData.featuredImage ? (
                                        <div className="wp-featured-image-preview">
                                            <img
                                                src={formData.featuredImage}
                                                alt="Imagen de portada"
                                            />
                                            <button
                                                type="button"
                                                className="wp-remove-image-btn"
                                                onClick={handleRemoveFeaturedImage}
                                            >
                                                Eliminar imagen
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="wp-featured-image-upload">
                                            <input
                                                type="file"
                                                id="featured-image"
                                                accept="image/*"
                                                onChange={handleFeaturedImageUpload}
                                                className="wp-hidden-input"
                                            />
                                            <label
                                                htmlFor="featured-image"
                                                className="wp-upload-btn"
                                            >
                                                Establecer imagen destacada
                                            </label>
                                            <p className="wp-upload-hint">
                                                Tamaño recomendado: 1200x630px
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Panel de Slug */}
                            <div className="wp-sidebar-panel">
                                <div className="wp-panel-header">
                                    <h3>Enlace permanente</h3>
                                </div>
                                <div className="wp-panel-body">
                                    <div className="wp-slug-field">
                                        <label htmlFor="slug">URL:</label>
                                        <input
                                            type="text"
                                            id="slug"
                                            className="wp-slug-input"
                                            value={formData.slug}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, slug: e.target.value }))
                                            }
                                            placeholder="url-de-la-entrada"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

