export abstract class Preset {
  constructor(public readonly label: string, public readonly title: string, public readonly description: string) {}

  /**
   * Resolves any logic within the description.
   * By default, it returns the description as is.
   */
  resolve(currentDescription: string): string {
    return currentDescription;
  }
}

export class StandardPreset extends Preset {}

export class ShoppingPreset extends Preset {
  constructor() {
    super("🛒 Shopping", "🛒 Shopping", "\nWho will be pushing the cart... [RNG_SHOPPING]");
  }

  override resolve(currentDescription: string): string {
    if (currentDescription.includes("[RNG_SHOPPING]")) {
      const person = Math.random() > 0.5 ? "Ricardo" : "Carolina";
      return currentDescription.replace("[RNG_SHOPPING]", `<b>${person}</b> has to push the cart today!`);
    }
    return currentDescription;
  }
}

export class MoviePreset extends Preset {
  constructor() {
    super("🍿 Movie", "🍿 Movie Night", "We'll watch: [MOVIES: Movie 1, Movie 2, ...]");
  }

  override resolve(currentDescription: string): string {
    const match = currentDescription.match(/\[MOVIES:\s*(.*?)\]/i);
    if (match) {
      const list = match[1]
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m !== "");
      if (list.length > 0) {
        const selected = list[Math.floor(Math.random() * list.length)];
        const others = list.filter((m) => m !== selected);

        let resultText = `<b>${selected}</b>`;
        if (others.length > 0) {
          const othersList = others.length > 1 ? `${others.slice(0, -1).join(", ")} and ${others[others.length - 1]}` : others[0];
          resultText += `\nBetter luck next time for ${othersList}.`;
        }

        return currentDescription.replace(match[0], resultText);
      }
    }
    return currentDescription;
  }
}

export const PRESETS: Preset[] = [new StandardPreset("🍴 Dinner", "🍴 Dinner Date", ""), new MoviePreset(), new ShoppingPreset(), new StandardPreset("🏋️ Gym", "🏋️ Gym Session", "")];
