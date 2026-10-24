import { Navigate, useLocation } from "react-router-dom";

// Old /auth route: forward to the new login page and keep the "from" state.
export default function AuthPage() {
  const location = useLocation();
  return <Navigate to="/login" replace state={location.state} />;
}
