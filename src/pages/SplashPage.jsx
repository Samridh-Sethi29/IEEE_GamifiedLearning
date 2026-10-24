import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/features/player/hooks/usePlayer";

// The animated Skillverse loader now lives in <LoaderGate/> (src/main.jsx) and covers
// every full page load. "/" simply routes into the app underneath it.
export default function SplashPage() {
  const navigate = useNavigate();
  const { player } = usePlayer();

  useEffect(() => {
    const first = player.id === "local" && player.day === 1 && player.xp === 0 && !player.flags.onboardingComplete;
    navigate(first ? "/onboarding" : "/world", { replace: true });
  }, [navigate, player]);

  return null;
}
