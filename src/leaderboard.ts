export interface LeaderboardEntry {
  time: number;
  rank?: number;
  name: string;
  score: number;
}

export class Leaderboard {
  private entries: LeaderboardEntry[] = [];
  private tableBody: HTMLTableSectionElement;

  // Track current player's name for highlighting
  private currentPlayerName: string | null = null;

  constructor(tableSelector: string = "#leaderboard tbody") {
    const table = document.querySelector(tableSelector);
    if (!table) {
      throw new Error(`Leaderboard table body not found: ${tableSelector}`);
    }
    this.tableBody = table as HTMLTableSectionElement;
  }

  getEntries(): LeaderboardEntry[] {
    return [...this.entries];
  }

  setEntries(entries: LeaderboardEntry[]) {
    this.entries = [...entries];
    this.render();
  }

  clear() {
    this.entries = [];
    this.render();
  }

  setCurrentPlayerName(name: string | null) {
    this.currentPlayerName = name;
  }

  render() {
    const table = this.tableBody.parentElement as HTMLTableElement;
    if (table) {
      const thead = table.querySelector("thead");
      if (thead) {
        thead.innerHTML = `<tr><th>Rank</th><th>Name</th><th>Score</th></tr>`;
      }
    }

    this.tableBody.innerHTML = "";
    this.entries.forEach((entry, idx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td>${entry.name}</td>
        <td>${entry.score}</td>
      `;

      const isCurrentPlayer =
        this.currentPlayerName &&
        entry.name.toLowerCase() === this.currentPlayerName.toLowerCase();

      if (isCurrentPlayer) {
        for (const cell of row.children) {
          (cell as HTMLElement).style.backgroundColor = "#444"; // Dark background
          (cell as HTMLElement).style.color = "#eee";
          (cell as HTMLElement).style.fontWeight = "bold";
        }
      }

      this.tableBody.appendChild(row);
    });
  }
}

export async function fetchAndSetLeaderboard(leaderboard: Leaderboard) {
  try {
    const response = await fetch(
      "https://cube-game-back.vercel.app/api/leaderboard",
    );
    if (!response.ok) throw new Error("Failed to fetch leaderboard");
    const data = await response.json();
    leaderboard.setEntries(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    leaderboard.setEntries([]);
  }
}

function getOrAskPlayerName(): string | null {
  let name = localStorage.getItem("playerName");

  if (!name) {
    name = prompt("Enter your name:")?.trim() || "";
    if (name) {
      localStorage.setItem("playerName", name);
    } else {
      alert("Name is required to play.");
      return null;
    }
  }

  return name;
}

export async function submitScore(score: number) {
  const name = getOrAskPlayerName();
  if (!name) return;

  try {
    const res = await fetch(
      "https://cube-game-back.vercel.app/api/leaderboard",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score }),
      },
    );
    if (!res.ok) throw new Error("Failed to submit score");
  } catch (err) {
    console.error("Failed to add score to leaderboard", err);
  }
}

export function resetPlayerName() {
  localStorage.removeItem("playerName");
  location.reload();
}
