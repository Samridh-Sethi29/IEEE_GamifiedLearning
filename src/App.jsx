import { Navigate, Route, Routes, useParams } from "react-router-dom";

import { Toaster } from "@/components/core/sonner";

import SplashPage from "@/pages/SplashPage";
import OnboardingPage from "@/pages/OnboardingPage";
import WorldMapPage from "@/pages/WorldMapPage";

import SchoolWorld from "@/pages/SchoolWorld";
import FarmWorld from "@/pages/FarmWorld";
import FarmGame2D from "@/features/farm/components/FarmGame";
import FarmEarnXP from "@/pages/FarmEarnXP";
import HomeWorld from "@/pages/HomeWorld";
import MarketWorld from "@/pages/MarketWorld";
import MarketingWorld from "@/pages/MarketingWorld";

import NightPage from "@/pages/NightPage";
import DreamPage from "@/pages/DreamPage";

import WorldSceneLayout from "@/features/world/components/WorldSceneLayout";
import { FARM_LOCATION_BY_ID } from "@/config/locations";

import MathsHub from "@/pages/MathsHub";
import MathsTeaching from "@/pages/MathsTeaching";
import MathsLesson from "@/pages/MathsLesson";
import MathsProblems from "@/pages/MathsProblems";
import MathsPractice from "@/pages/MathsPractice";
import MathsGames from "@/pages/MathsGames";
import MathsRiverMenu from "@/pages/MathsRiverMenu";
import MathsRiverGame from "@/pages/MathsRiverGame";

import ComputerHub from "@/features/computer/components/ComputerHub";
import TypingLevel1 from "@/features/computer/components/TypingLevel1";
import BlockCodingLevel1 from "@/features/computer/components/BlockCodingLevel1";
import BlockCodingChallengeLevel1 from "@/features/computer/components/BlockCodingChallengeLevel1";
import PythonDebuggingLevel1 from "@/features/computer/components/PythonDebuggingLevel1";
import PythonDebuggingChallengeLevel1 from "@/features/computer/components/PythonDebuggingChallengeLevel1";
import ComputerChallenge from "@/features/computer/components/ComputerChallenge";

import ScienceRouter from "@/features/science/ScienceRouter";
import SchoolSubScene from "@/pages/SchoolSubScene";

import StudioHome from "@/features/studio/pages/StudioHome";
import EngineLab from "@/features/studio/pages/EngineLab";
import WorldBuilderBriefing from "@/features/studio/world-builder/pages/WorldBuilderBriefing";

import InventionLabPage from "@/features/studio/invention-lab/pages/InventionLabPage";
import DesignAtelierPage from "@/features/studio/design-atelier/pages/DesignAtelierPage";
import StoryStudioWorkspace from "@/features/studio/story-studio/StoryStudioWorkspace";

function FarmSubScene() {
  const { subId } = useParams();

  const world = FARM_LOCATION_BY_ID[subId];

  if (!world || !world.scene) {
    return <Navigate to="/world/farm" replace />;
  }

  return <WorldSceneLayout world={world} backTo="/world/farm" />;
}

function SchoolSubSceneWrapper() {
  const { subId } = useParams();

  return <SchoolSubScene subId={subId} />;
}

// The map is the app: every route leads into the village or one of its worlds.
export default function App() {
  return (
    <>
      <Routes>
        {/* Main pages */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/world" element={<WorldMapPage />} />

        {/* School world */}
        <Route path="/world/school" element={<SchoolWorld />} />

        {/* Maths */}
        <Route path="/world/school/maths" element={<MathsHub />} />

        <Route
          path="/world/school/maths/teaching"
          element={<MathsTeaching />}
        />

        <Route
          path="/world/school/maths/teaching/:topicId"
          element={<MathsLesson />}
        />

        <Route
          path="/world/school/maths/problems"
          element={<MathsProblems />}
        />

        <Route
          path="/world/school/maths/problems/:topicId"
          element={<MathsPractice />}
        />

        <Route path="/world/school/maths/games" element={<MathsGames />} />

        <Route
          path="/world/school/maths/games/river"
          element={<MathsRiverMenu />}
        />

        <Route
          path="/world/school/maths/games/river/:topicId"
          element={<MathsRiverGame />}
        />

        <Route path="/world/school/computer" element={<ComputerHub />} />
        <Route path="/world/school/computer/hub" element={<ComputerHub />} />
        <Route
          path="/world/school/computer/typing"
          element={<TypingLevel1 />}
        />

        <Route
          path="/world/school/computer/block-coding"
          element={<BlockCodingLevel1 />}
        />

        <Route
          path="/world/school/computer/block-coding/challenge"
          element={<BlockCodingChallengeLevel1 />}
        />

        <Route
          path="/world/school/computer/python-debugging"
          element={<PythonDebuggingLevel1 />}
        />

        <Route
          path="/world/school/computer/python-debugging/challenge"
          element={<PythonDebuggingChallengeLevel1 />}
        />
        <Route
          path="/world/school/computer/final-challenge"
          element={<ComputerChallenge />}
        />

        {/* Science */}
        <Route path="/world/school/science/*" element={<ScienceRouter />} />

        {/* Other school sub-scenes */}
        <Route
          path="/world/school/:subId"
          element={<SchoolSubSceneWrapper />}
        />

        {/* Farm world */}
        <Route path="/world/farm" element={<FarmWorld />} />

        <Route path="/world/farm/agriculture" element={<FarmGame2D />} />

        <Route path="/world/farm/earn-xp" element={<FarmEarnXP />} />

        <Route path="/world/farm/:subId" element={<FarmSubScene />} />

        {/* Other worlds */}
        <Route path="/world/home" element={<HomeWorld />} />
        <Route path="/world/market" element={<MarketWorld />} />
        <Route path="/world/marketing" element={<MarketingWorld />} />

        {/* Creative Studio */}
        <Route path="/world/studio" element={<StudioHome />} />

        <Route path="/world/studio/engine-lab" element={<EngineLab />} />

        <Route
          path="/world/studio/world-builder"
          element={<WorldBuilderBriefing />}
        />

        <Route
          path="/world/studio/invention-lab"
          element={<InventionLabPage />}
        />

        <Route
          path="/world/studio/design-atelier"
          element={<DesignAtelierPage />}
        />

        <Route
          path="/world/studio/design-studio"
          element={<DesignAtelierPage />}
        />

        <Route
          path="/world/studio/story-studio"
          element={<StoryStudioWorkspace />}
        />

        {/* Night and dream */}
        <Route path="/night" element={<NightPage />} />
        <Route path="/dream" element={<DreamPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}
