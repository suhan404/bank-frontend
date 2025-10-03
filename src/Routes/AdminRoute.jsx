import { Navigate, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";
import useAdmin from "../hooks/useAdmin";


const AdminRoute = ({children}) => {
    const {user, Loading} = useAuth();
    const [isAdmin, isAdminLoading] = useAdmin();
    const location = useLocation();
    if(Loading || isAdminLoading){
        return <p>Loading....</p>
    }

    if(user && isAdmin){
        return children;
    }
    return <Navigate to='/login' state = {{from: location}} replace></Navigate>
};

export default AdminRoute;