import MenuPanel from "@/components/Admin/MenuPanel";
import Post from "@/components/Admin/Post";


export default async function AdminPanelPosts(){
    return (
        <div className="flex">
            <MenuPanel />
            <Post />
        </div>
    )
}