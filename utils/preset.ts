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
   * for choices [KEY: item1, item2] and people [KEY].
   */
  resolve(currentDescription: string): string {
    let resolved = currentDescription;

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
          resultText += `\nBetter luck next time for ${othersList}.`;
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
  new Preset("🛒 Shopping", "🛒 Shopping", "[PUSHER] has to push the cart today!", [], ["PUSHER"]),
  new Preset("🏋️ Gym", "🏋️ Gym Session", ""),
];
