import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

function PublicRoute() {
  const isLogin = useAuthStore((state) => state.isLogin);

  return !isLogin ? <Outlet /> : <Navigate to="/" replace />;
}

export default PublicRoute;