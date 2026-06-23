import { RankTrackerLive } from "@/components/admin/RankTrackerLive";

export const dynamic = "force-dynamic";

export default function RankTrackerAdmin() {
  return (
    <div className="mx-auto max-w-5xl">
      <RankTrackerLive />
    </div>
  );
}
