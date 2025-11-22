
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
        description: `Posts under the category: ${slugPath}`,
    };



}



export default async function Categories({ params }: Props) {

    const category = await params;

    const slug = category.slug.join('/');
    
    return (
        <NoticiasPorCategoria slug={slug} />
    );
}