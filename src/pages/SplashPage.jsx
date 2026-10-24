import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useAuth } from "@/features/auth/AuthContext";

// The animated Skillverse loader lives in LoaderGate (src/main.jsx).
// This page handles routing after authentication has finished loading.
export default function SplashPage() {
  const navigate = useNavigate();
  const { player } = usePlayer();
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isGuest) {
      navigate("/auth", { replace: true });
      return;
    }

    navigate("/world", {
      replace: true,
    });
  }, [navigate, player, isAuthenticated, isGuest, isLoading]);

  return null;
}