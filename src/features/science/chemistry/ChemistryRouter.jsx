import { Routes, Route } from "react-router-dom";
import SciSkin from "../ui/SciSkin";
import ChemistryHub from "./components/ChemistryHub";
import AtomsLesson from "./components/AtomsLesson";
import BuildAtomGame from "./components/BuildAtomGame";
import StatesLesson from "./components/StatesLesson";
import ReactionsLesson from "./components/ReactionsLesson";
import ReactionLabGame from "./components/ReactionLabGame";
import AcidsBasesLesson from "./components/AcidsBasesLesson";
import ChemistryMission from "./components/ChemistryMission";

export default function ChemistryRouter() {
  return (
    <Routes>
      <Route path="/" element={<ChemistryHub />} />
      <Route element={<SciSkin theme="chemistry" particles={["🧪","⚗️","🔥","💧","🧫","✨"]} />}>
        <Route path="atoms" element={<AtomsLesson />} />
      </Route>
      <Route path="build-atom" element={<BuildAtomGame />} />
      <Route element={<SciSkin theme="chemistry" particles={["🧪","⚗️","🔥","💧","🧫","✨"]} />}>
        <Route path="states" element={<StatesLesson />} />
        <Route path="reactions" element={<ReactionsLesson />} />
      </Route>
      <Route path="reaction-lab" element={<ReactionLabGame />} />
      <Route element={<SciSkin theme="chemistry" particles={["🧪","⚗️","🔥","💧","🧫","✨"]} />}>
        <Route path="acids" element={<AcidsBasesLesson />} />
        <Route path="mission" element={<ChemistryMission />} />
      </Route>
    </Routes>
  );
}
