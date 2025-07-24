export interface LeaderboardEntry {
  time: number;
  rank?: number;
  name: string;
  score: number;
}

export class Leaderboard {
  getEntries(): LeaderboardEntry[] {
    return [...this.entries]; // return a copy of entries array
  }
  private entries: LeaderboardEntry[] = [];
  private tableBody: HTMLTableSectionElement;

  constructor(tableSelector: string = "#leaderboard tbody") {
    const table = document.querySelector(tableSelector);
    if (!table) {
      throw new Error(`Leaderboard table body not found: ${tableSelector}`);
    }
    this.tableBody = table as HTMLTableSectionElement;
  }

  setEntries(entries: LeaderboardEntry[]) {
    this.entries = [...entries];
    this.render();
  }

  addEntry(entry: LeaderboardEntry) {
    this.entries.push(entry);
    this.entries.sort((a, b) => b.score - a.score);
    this.entries = this.entries.slice(0, 10);
    this.render();
  }

  clear() {
    this.entries = [];
    this.render();
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
      this.tableBody.appendChild(row);
    });
  }
}

// Fetch leaderboard data from API and update the leaderboard
export async function fetchAndSetLeaderboard(leaderboard: Leaderboard) {
  try {
    const response = await fetch(
      "https://cube-game-backend.example.com/leaderboard",
    );
    if (!response.ok) throw new Error("Failed to fetch leaderboard");
    const data = await response.json();

    // Expecting: [{ rank, name, score, time }]
    leaderboard.setEntries(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    leaderboard.setEntries([]);
  }
}
