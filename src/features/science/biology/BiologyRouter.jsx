import { Routes, Route } from "react-router-dom";
import SciSkin from "../ui/SciSkin";
import BiologyHub from "./components/BiologyHub";
import CellLesson from "./components/CellLesson";
import HumanBodyLesson from "./components/HumanBodyLesson";
import PlantsLesson from "./components/PlantsLesson";
import EcosystemLesson from "./components/EcosystemLesson";
import BuildCellGame from "./components/BuildCellGame";
import BuildEcosystemGame from "./components/BuildEcosystemGame";
import BiologyMission from "./components/BiologyMission";
import BiologyCompletion from "./components/BiologyCompletion";

export default function BiologyRouter() {
  return (
    <Routes>
      <Route path="/" element={<BiologyHub />} />
      <Route element={<SciSkin theme="biology" particles={["🌱","🧬","🦋","🍃","🫀","🐝"]} />}>
        <Route path="cell" element={<CellLesson />} />
        <Route path="human-body" element={<HumanBodyLesson />} />
        <Route path="plants" element={<PlantsLesson />} />
        <Route path="ecosystem" element={<EcosystemLesson />} />
      </Route>
      <Route path="build-cell" element={<BuildCellGame />} />
      <Route path="build-ecosystem" element={<BuildEcosystemGame />} />
      <Route element={<SciSkin theme="biology" particles={["🌱","🧬","🦋","🍃","🫀","🐝"]} />}>
        <Route path="mission" element={<BiologyMission />} />
        <Route path="completion" element={<BiologyCompletion />} />
      </Route>
    </Routes>
  );
}
