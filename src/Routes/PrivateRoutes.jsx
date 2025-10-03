import { Navigate, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";


const PrivateRoutes = ({children}) => {
    const {user, loading} = useAuth();
    const location = useLocation();

    if(loading){
        return <p>loading...</p>
    }
    if(user){
        return children;
    }
    return <Navigate to='/login' state={{from: location}} replace></Navigate>
};

export default PrivateRoutes;