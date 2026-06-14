import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pets } from "@/lib/db/schema";
import { CompanionScreen } from "@/components/companion/CompanionScreen";
import { getOrCreateThread, loadMessages } from "@/lib/data/chat";
import { OSCAR_PET_ID } from "@/lib/data/ids";

export const dynamic = "force-dynamic";

export default async function CompanionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const [pet] = await db.select({ name: pets.name }).from(pets).where(eq(pets.id, id)).limit(1);
  if (!pet) notFound();

  const threadId = await getOrCreateThread(id);
  const messages = await loadMessages(threadId);

  const petPhoto = id === OSCAR_PET_ID ? "/demo/oscar.jpg" : null;
  return <CompanionScreen petId={id} petName={pet.name} petPhoto={petPhoto} initialMessages={messages} />;
}
