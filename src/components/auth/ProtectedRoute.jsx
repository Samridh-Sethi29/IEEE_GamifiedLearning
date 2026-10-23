import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-xl rounded-full bg-emerald-500/30 animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center relative z-10">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        </div>
        <p className="text-lg font-bold text-slate-200">Loading SkillVerse...</p>
        <p className="text-sm text-slate-400 mt-1">Preparing your adventure</p>
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
