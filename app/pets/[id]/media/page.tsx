import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pets } from "@/lib/db/schema";
import { MediaTimelineScreen } from "@/components/media/MediaTimelineScreen";
import { getMediaTimeline } from "@/lib/data/media";

export const dynamic = "force-dynamic";

export default async function MediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const [pet] = await db.select({ name: pets.name }).from(pets).where(eq(pets.id, id)).limit(1);
  if (!pet) notFound();

  const view = await getMediaTimeline(id);
  return <MediaTimelineScreen petId={id} petName={pet.name} petPhoto="/demo/oscar.jpg" view={view} />;
}
