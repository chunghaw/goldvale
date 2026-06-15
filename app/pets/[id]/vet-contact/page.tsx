import { notFound } from "next/navigation";
import { VetContactScreen } from "@/components/vet-contact/VetContactScreen";
import { getVetContact } from "@/lib/data/vet-contact";

export const dynamic = "force-dynamic";

export default async function VetContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getVetContact(id);
  if (!contact) notFound();

  return (
    <VetContactScreen
      petId={id}
      petName={contact.petName}
      clinic={contact.clinic}
      phone={contact.phone}
      vetName={contact.vetName}
      reasons={contact.reasons}
    />
  );
}
