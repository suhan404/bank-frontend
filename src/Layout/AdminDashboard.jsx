import { Outlet } from "react-router";
import AdminSidebar from "./components/AdminSidebar";

const AdminDashboard = () => {
    return (
        <div className="flex">
            <AdminSidebar></AdminSidebar>
            <div className="flex-1 p-6">
                <Outlet></Outlet>
            </div>
        </div>
    );
};

export default AdminDashboard;
