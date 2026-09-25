import {
  BedDouble,
  CookingPot,
  Droplets,
  ShowerHead,
  SquareParking,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { FacilityKey } from "@/data/kos";

/**
 * One icon per criterion. Shared by the "Cara kerja" list and the review form,
 * so a facility looks the same where it is explained and where it is scored.
 */
export const CRITERION_ICON: Record<FacilityKey, LucideIcon> = {
  room: BedDouble,
  bathroom: ShowerHead,
  water: Droplets,
  wifi: Wifi,
  kitchen: CookingPot,
  parking: SquareParking,
};
