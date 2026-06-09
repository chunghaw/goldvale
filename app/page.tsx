import { redirect } from "next/navigation";
import { DEMO_PET_ID } from "@/lib/data/pets";

// The demo flow opens on the dashboard; daily-checkin and the vet brief link from there.
export default function Home() {
  redirect(`/pets/${DEMO_PET_ID}`);
}
