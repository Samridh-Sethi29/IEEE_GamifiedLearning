import WorldSceneLayout from "@/components/game/WorldSceneLayout";
import { LOCATION_BY_ID } from "@/game/locations";

const world = LOCATION_BY_ID.market;

export default function MarketWorld() {
  return <WorldSceneLayout world={world} />;
}
