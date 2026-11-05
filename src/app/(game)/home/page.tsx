import { redirect } from "next/navigation";
import { PixelPanel } from "@/components/pixel/PixelPanel";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS lets a player read only their own row, so this cannot leak anyone else's data.
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, level, coins, rating, wins, losses, starter_pack_opened")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-4xl uppercase text-gold">Welcome, {profile?.username ?? "hustler"}</h1>

      <PixelPanel title="Your stats">
        <dl className="grid grid-cols-2 gap-3 text-xl sm:grid-cols-4">
          <Stat label="Level" value={profile?.level} />
          <Stat label="Coins" value={profile?.coins} />
          <Stat label="Rating" value={profile?.rating} />
          <Stat label="W / L" value={profile ? `${profile.wins} / ${profile.losses}` : undefined} />
        </dl>
      </PixelPanel>

      {profile && !profile.starter_pack_opened && (
        <PixelPanel title="Starter pack">
          <p className="text-steel">Your first three fighters are waiting. Pack opening arrives in the next step.</p>
        </PixelPanel>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div>
      <dt className="text-steel">{label}</dt>
      <dd className="text-2xl text-paper">{value ?? "-"}</dd>
    </div>
  );
}
