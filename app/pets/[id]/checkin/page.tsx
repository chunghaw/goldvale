import { notFound } from "next/navigation";
import { CheckinScreen } from "@/components/checkin/CheckinScreen";
import { getPetView } from "@/lib/data/pets";

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = await getPetView(id);
  if (!pet) notFound();
  return <CheckinScreen header={pet.header} config={pet.checkin} />;
}
