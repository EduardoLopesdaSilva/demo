import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AutorizacaoSupervisor({ children }) {
    const { isAuthenticated, isSupervisor } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isSupervisor) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
