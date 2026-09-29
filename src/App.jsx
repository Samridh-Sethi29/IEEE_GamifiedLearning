import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/core/sonner";
import SplashPage from "@/pages/SplashPage";
import OnboardingPage from "@/pages/OnboardingPage";
import WorldMapPage from "@/pages/WorldMapPage";
import SchoolWorld from "@/pages/SchoolWorld";
import FarmWorld from "@/pages/FarmWorld";
import FarmGame2D from "@/features/farm/components/FarmGame";
import HomeWorld from "@/pages/HomeWorld";
import MarketWorld from "@/pages/MarketWorld";
import MarketingWorld from "@/pages/MarketingWorld";
import NightPage from "@/pages/NightPage";
import DreamPage from "@/pages/DreamPage";
import WorldSceneLayout from "@/features/world/components/WorldSceneLayout";
import { FARM_LOCATION_BY_ID, SCHOOL_LOCATION_BY_ID } from "@/config/locations";
import { useParams } from "react-router-dom";
import SchoolSubScene from "@/pages/SchoolSubScene";


function FarmSubScene() {
  const { subId } = useParams();
  const world = FARM_LOCATION_BY_ID[subId];
  if (!world || !world.scene) return <Navigate to="/world/farm" replace />;
  return <WorldSceneLayout world={world} backTo="/world/farm" />;
}

function SchoolSubSceneWrapper() {
  const { subId } = useParams();
  return <SchoolSubScene subId={subId} />;
}

// The map IS the app: every route leads into the village or one of its worlds.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/world" element={<WorldMapPage />} />
        <Route path="/world/school" element={<SchoolWorld />} />
        <Route path="/world/school/:subId" element={<SchoolSubSceneWrapper />} />
        <Route path="/world/farm" element={<FarmWorld />} />
        <Route path="/world/farm/agriculture" element={<FarmGame2D />} />
        <Route path="/world/farm/:subId" element={<FarmSubScene />} />
        <Route path="/world/home" element={<HomeWorld />} />
        <Route path="/world/market" element={<MarketWorld />} />
        <Route path="/world/marketing" element={<MarketingWorld />} />
        <Route path="/night" element={<NightPage />} />
        <Route path="/dream" element={<DreamPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
