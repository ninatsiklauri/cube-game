import { Leaderboard, fetchAndSetLeaderboard } from "./leaderboard";

export async function addScoreAndRefreshLeaderboard(
  leaderboard: Leaderboard,
  name: string,
  score: number,
  time: number,
) {
  try {
    await fetch("https://cube-game-back.vercel.app/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score, time }),
    });
    console.log(
      `Posted score: { name: ${name}, score: ${score}, time: ${time} }`,
    );
  } catch {
    console.error("Failed to add score to leaderboard");
  }
  await fetchAndSetLeaderboard(leaderboard);
  const entries = leaderboard.getEntries();
  const rank =
    entries.findIndex(
      (e) => e.name === name && e.score === score && e.time === time,
    ) + 1;

  if (rank > 0) {
    console.log(
      `Player ${name} is now rank #${rank} with score ${score} and time ${time}`,
    );
  } else {
    console.log(
      `Player ${name} with score ${score} and time ${time} not found in leaderboard.`,
    );
  }
}
