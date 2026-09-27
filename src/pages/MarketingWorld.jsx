import WorldSceneLayout from "@/features/world/components/WorldSceneLayout";
import { LOCATION_BY_ID } from "@/config/locations";

const world = LOCATION_BY_ID.marketing;

export default function MarketingWorld() {
  return <WorldSceneLayout world={world} />;
}
