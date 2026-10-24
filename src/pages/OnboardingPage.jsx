import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/features/player/hooks/usePlayer";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updatePlayer } = usePlayer();

  useEffect(() => {
    updatePlayer({
      flags: { onboardingComplete: true },
    });
    navigate("/world", { replace: true });
  }, [navigate, updatePlayer]);

  return null;
}
