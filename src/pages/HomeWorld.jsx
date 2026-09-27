import WorldSceneLayout from "@/features/world/components/WorldSceneLayout";
import { LOCATION_BY_ID } from "@/config/locations";

const world = LOCATION_BY_ID.home;

export default function HomeWorld() {
  return <WorldSceneLayout world={world} />;
}
