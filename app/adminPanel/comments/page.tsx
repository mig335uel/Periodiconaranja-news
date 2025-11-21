import CommentsAdmin from "@/components/Admin/Comments";
import MenuPanel from "@/components/Admin/MenuPanel";



export default async function AdminComments(){
    return(
        <div className="flex">
            <MenuPanel/>
            <CommentsAdmin/>
        </div>
    );
}