export class Preset {
  constructor(
    public readonly label: string,
    public readonly title: string,
    public readonly description: string,
    private readonly choiceKeys: string[] = [],
    private readonly personKeys: string[] = []
  ) {}

  /**
   * Resolves any logic within the description by replacing placeholders
   * for choices [KEY: item1, item2], independent people [KEY],
   * and a linked couple [A] and [B].
   */
  resolve(currentDescription: string): string {
    let resolved = currentDescription;

    // Resolve linked couple placeholders [A] and [B]
    const personA = Math.random() > 0.5 ? "Ricardo" : "Carolina";
    const personB = personA === "Ricardo" ? "Carolina" : "Ricardo";
    resolved = resolved.replace(/\[A\]/gi, `<b>${personA}</b>`);
    resolved = resolved.replace(/\[B\]/gi, `<b>${personB}</b>`);

    // Resolve person placeholders [KEY]
    for (const key of this.personKeys) {
      const regex = new RegExp(`\\[${key}\\]`, "gi");
      resolved = resolved.replace(regex, () => {
        const person = Math.random() > 0.5 ? "Ricardo" : "Carolina";
        return `<b>${person}</b>`;
      });
    }

    // Resolve choice placeholders [KEY: item1, item2, ...]
    for (const key of this.choiceKeys) {
      const regex = new RegExp(`\\[${key}:\\s*(.*?)\\]`, "gi");
      resolved = resolved.replace(regex, (match, items) => {
        const list = items
          .split(",")
          .map((m: string) => m.trim())
          .filter((m: string) => m !== "");

        if (list.length === 0) return match;

        const selected = list[Math.floor(Math.random() * list.length)];
        const others = list.filter((m: string) => m !== selected);

        let resultText = `<b>${selected}</b>`;
        if (others.length > 0) {
          const othersList = others.length > 1 ? `${others.slice(0, -1).join(", ")} and ${others[others.length - 1]}` : others[0];
          resultText += `\nBetter luck next time for ${othersList}. 🥈`;
        }
        return resultText;
      });
    }

    return resolved;
  }
}

export const PRESETS: Preset[] = [
  new Preset("🍴 Dinner", "🍴 Dinner Date", "What to eat: [FOOD: Sushi, Pizza, Burgers]\n\n[PAYER] is treating tonight! 💸", ["FOOD"], ["PAYER"]),
  new Preset("🍿 Movie", "🍿 Movie Night", "We'll watch: [MOVIES: Movie 1, Movie 2, ...]", ["MOVIES"]),
  new Preset("🛒 Shopping", "🛒 Shopping", "[A] is paying today! 💸\n\nThat means [B] is on cart duty! 🛒💨", [], []),
  new Preset("😴 Sleepover", "😴 Sleepover", "Where we staying: [LOCATION: Ricardo's, Carolina's]\n\nDon't forget the snacks! 🍪", ["LOCATION"]),
  new Preset("🏋️ Gym", "🏋️ Gym Session", "Gains. Gains! GAINS!! 💪✨\n\nDon't forget to stay hydrated! 💧"),
];
