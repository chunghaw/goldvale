import { notFound } from "next/navigation";
import { VetBriefScreen } from "@/components/vet-brief/VetBriefScreen";
import { getPetView } from "@/lib/data/pets";

export default async function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = await getPetView(id);
  if (!pet) notFound();
  return <VetBriefScreen header={pet.header} brief={pet.brief} />;
}
