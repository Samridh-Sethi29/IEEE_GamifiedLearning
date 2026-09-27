import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import WorldMapPage from "@/pages/WorldMapPage";
import SchoolWorld from "@/pages/SchoolWorld";
import FarmWorld from "@/pages/FarmWorld";
import HomeWorld from "@/pages/HomeWorld";
import MarketWorld from "@/pages/MarketWorld";
import MarketingWorld from "@/pages/MarketingWorld";

// The map IS the app: every route leads into the village or one of its worlds.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/world" replace />} />
        <Route path="/world" element={<WorldMapPage />} />
        <Route path="/world/school" element={<SchoolWorld />} />
        <Route path="/world/farm" element={<FarmWorld />} />
        <Route path="/world/home" element={<HomeWorld />} />
        <Route path="/world/market" element={<MarketWorld />} />
        <Route path="/world/marketing" element={<MarketingWorld />} />
        <Route path="*" element={<Navigate to="/world" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
