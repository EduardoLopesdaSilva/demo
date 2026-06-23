import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Autenticacao({children}){
    const { isAuthenticated } = useAuth();

    if(!isAuthenticated){
        return <Navigate to="/login" replace />
    }

    return children
}
