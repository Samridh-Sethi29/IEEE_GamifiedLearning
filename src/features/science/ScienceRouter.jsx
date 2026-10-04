import "./tailwind.css";
import "./science.css";
import { Routes, Route, Outlet } from "react-router-dom";
import WorldSceneLayout from "@/features/world/components/WorldSceneLayout";
import { SCHOOL_LOCATION_BY_ID } from "@/config/locations";
import ScienceHub from "./components/ScienceHub";
import BiologyRouter from "./biology/BiologyRouter";
import PhysicsRouter from "./physics/PhysicsRouter";
import ChemistryRouter from "./chemistry/ChemistryRouter";

// `.sci-scope` activates the Science-only Tailwind utilities (see vite.config.js).
// display: contents keeps the wrapper out of layout.
function SciScope() {
  return (
    <div className="sci-scope" style={{ display: "contents" }}>
      <Outlet />
    </div>
  );
}

// Flow: School map -> intro (/world/school/science) -> hub (/world/school/science/hub)
//       -> physics | chemistry | biology.
// The intro deliberately sits OUTSIDE .sci-scope so it renders with exactly the same
// stylesheet as the other subject pages (Mathematics, etc.).
export default function ScienceRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <WorldSceneLayout
            world={SCHOOL_LOCATION_BY_ID.science}
            backTo="/world/school"
            enterTo="/world/school/science/hub"
            enterLabel="Enter Science Hub"
          />
        }
      />
      <Route element={<SciScope />}>
        <Route path="hub" element={<ScienceHub />} />
        <Route path="biology/*" element={<BiologyRouter />} />
        <Route path="physics/*" element={<PhysicsRouter />} />
        <Route path="chemistry/*" element={<ChemistryRouter />} />
      </Route>
    </Routes>
  );
}
