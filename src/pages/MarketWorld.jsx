import WorldSceneLayout from "@/features/world/components/WorldSceneLayout";
import { LOCATION_BY_ID } from "@/config/locations";

const world = LOCATION_BY_ID.market;

export default function MarketWorld() {
  return <WorldSceneLayout world={world} />;
}
