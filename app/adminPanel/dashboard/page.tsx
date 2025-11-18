import MenuPanel from "@/components/Admin/MenuPanel";
import Dashboard from "@/components/Admin/Dashboard";


export default async function AdminPanelDashboard() {
    return(
        <>
            <MenuPanel />
            <Dashboard />
        </>
    );
}