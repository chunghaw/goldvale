import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pets } from "@/lib/db/schema";
import { MediaTimelineScreen } from "@/components/media/MediaTimelineScreen";
import { getMediaTimeline } from "@/lib/data/media";
import { clockFor } from "@/lib/data/pets";
import { OSCAR_PET_ID } from "@/lib/data/ids";

export const dynamic = "force-dynamic";

export default async function MediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const [pet] = await db.select({ name: pets.name }).from(pets).where(eq(pets.id, id)).limit(1);
  if (!pet) notFound();

  const view = await getMediaTimeline(id, clockFor(id));
  const petPhoto = id === OSCAR_PET_ID ? "/demo/oscar.jpg" : null;
  return <MediaTimelineScreen petId={id} petName={pet.name} petPhoto={petPhoto} view={view} />;
}
