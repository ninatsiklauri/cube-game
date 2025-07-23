export interface LeaderboardEntry {
  name: string;
  score: number;
}

export class Leaderboard {
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
    this.entries = this.entries.slice(0, 10); // Keep top 10
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

  getEntries(): LeaderboardEntry[] {
    return [...this.entries];
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    try {
      const leaderboard = new Leaderboard();
      leaderboard.setEntries([
        { name: "Ana", score: 36 },
        { name: "Giorgi", score: 30 },
        { name: "Irakli", score: 28 },
        { name: "Mari", score: 25 },
        { name: "Luka", score: 21 },
        { name: "Mari", score: 25 },
        { name: "Luka", score: 21 },
        { name: "Mari", score: 25 },
        { name: "Luka", score: 21 },
      ]);
    } catch {
      // Table might not exist on some pages
    }
  });
}
