
import NoticiasPorCategoria from "@/components/ui/NoticiasPorCategoria";


interface Props {
    params: {
        slug: string[]
    }
}



export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
    const slugPath = await params;

    return {
        title: slugPath.slug.join('/'),
        description: `Noticias y artículos sobre ${slugPath.slug.join('/')}`,
        robots: {
            follow: true,
            index: true,
        },
    };



}



export default async function Categories({ params }: Props) {

    const category = await params;

    const slug = category.slug.join('/');
    
    return (
        <NoticiasPorCategoria slug={slug} />
    );
}