import WorldSceneLayout from "@/features/world/components/WorldSceneLayout";
import { LOCATION_BY_ID } from "@/config/locations";

const world = LOCATION_BY_ID.school;

export default function SchoolWorld() {
  return <WorldSceneLayout world={world} />;
}
