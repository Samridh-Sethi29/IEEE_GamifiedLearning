import { Routes, Route } from "react-router-dom";
import SciSkin from "../ui/SciSkin";
import PhysicsHub from "./components/PhysicsHub";
import ForceMotionLesson from "./components/ForceMotionLesson";
import EnergyLesson from "./components/EnergyLesson";
import LightLesson from "./components/LightLesson";
import SoundLesson from "./components/SoundLesson";
import SpeedRacerGame from "./components/SpeedRacerGame";
import CircuitBuilderGame from "./components/CircuitBuilderGame";
import PhysicsMission from "./components/PhysicsMission";

export default function PhysicsRouter() {
  return (
    <Routes>
      <Route path="/" element={<PhysicsHub />} />
      <Route element={<SciSkin theme="physics" particles={["⚡","🔦","🔊","🧲","🚀","💡"]} />}>
        <Route path="force" element={<ForceMotionLesson />} />
        <Route path="energy" element={<EnergyLesson />} />
        <Route path="light" element={<LightLesson />} />
        <Route path="sound" element={<SoundLesson />} />
      </Route>
      <Route path="speed-racer" element={<SpeedRacerGame />} />
      <Route path="circuit-builder" element={<CircuitBuilderGame />} />
      <Route element={<SciSkin theme="physics" particles={["⚡","🔦","🔊","🧲","🚀","💡"]} />}>
        <Route path="mission" element={<PhysicsMission />} />
      </Route>
    </Routes>
  );
}
