import NewsEditor from "@/components/TipTapEditor";



interface Props{
    params: {
        slug: string;
    }
}

export default async function PostEdit({params}: Props){
    return <NewsEditor />
}