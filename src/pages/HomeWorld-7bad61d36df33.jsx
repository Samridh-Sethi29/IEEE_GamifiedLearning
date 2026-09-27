import WorldSceneLayout from "@/components/game/WorldSceneLayout";
import { LOCATION_BY_ID } from "@/game/locations";

const world = LOCATION_BY_ID.home;

export default function HomeWorld() {
  return <WorldSceneLayout world={world} />;
}
