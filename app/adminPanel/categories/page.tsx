import Categorias from "@/components/Admin/Categorias";
import MenuPanel from "@/components/Admin/MenuPanel";




export default async function CategoriesAdmin(){
    return (
        <div className="flex">
            <MenuPanel />
            <Categorias />
        </div>
    );
}