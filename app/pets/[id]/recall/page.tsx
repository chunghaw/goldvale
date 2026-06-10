import { notFound } from "next/navigation";
import { RecallScreen } from "@/components/recall/RecallScreen";
import { getPetView } from "@/lib/data/pets";
import { recallSimilarJournal, type JournalAnalogue } from "@/lib/data/queries";

// The pattern Goldvale surfaced ("slower rising"), phrased as the recall query.
const RECALL_QUERY = "slower and stiffer getting up from lying down in the mornings";

export default async function RecallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = await getPetView(id);
  if (!pet) notFound();

  // Live semantic recall; degrades gracefully if the DB/Bedrock isn't reachable.
  let analogues: JournalAnalogue[] = [];
  try {
    analogues = await recallSimilarJournal(id, RECALL_QUERY, 5);
  } catch {
    analogues = [];
  }

  return <RecallScreen header={pet.header} pattern={pet.dashboard.pattern} analogues={analogues} query={RECALL_QUERY} />;
}
