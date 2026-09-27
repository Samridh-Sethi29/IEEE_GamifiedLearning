import WorldSceneLayout from "@/components/game/WorldSceneLayout";
import { LOCATION_BY_ID } from "@/game/locations";

const world = LOCATION_BY_ID.marketing;

export default function MarketingWorld() {
  return <WorldSceneLayout world={world} />;
}
