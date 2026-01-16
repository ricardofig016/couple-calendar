export abstract class Preset {
  constructor(public readonly label: string, public readonly title: string, public readonly description: string) {}

  /**
   * Resolves any logic within the description.
   * By default, it returns the description as is.
   */
  resolve(currentDescription: string): string {
    return currentDescription;
  }

  /**
   * Utility to pick a random person from the couple.
   */
  protected getRandomPerson(): string {
    return Math.random() > 0.5 ? "Ricardo" : "Carolina";
  }

  /**
   * Helper to resolve choices in the format [KEY: item1, item2, ...]
   */
  protected resolveChoice(description: string, key: string): string {
    const regex = new RegExp(`\\[${key}:\\s*(.*?)\\]`, "i");
    const match = description.match(regex);

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

        return description.replace(match[0], resultText);
      }
    }
    return description;
  }
}

export class StandardPreset extends Preset {}

export class ShoppingPreset extends Preset {
  constructor() {
    super("🛒 Shopping", "🛒 Shopping", "\nWho will be pushing the cart: [RNG_SHOPPING]");
  }

  override resolve(currentDescription: string): string {
    if (currentDescription.includes("[RNG_SHOPPING]")) {
      return currentDescription.replace("[RNG_SHOPPING]", `<b>${this.getRandomPerson()}</b> has to push the cart today!`);
    }
    return currentDescription;
  }
}

export class MoviePreset extends Preset {
  constructor() {
    super("🍿 Movie", "🍿 Movie Night", "We'll watch: [MOVIES: Movie 1, Movie 2, ...]");
  }

  override resolve(currentDescription: string): string {
    return this.resolveChoice(currentDescription, "MOVIES");
  }
}

export class DinnerPreset extends Preset {
  constructor() {
    super("🍴 Dinner", "🍴 Dinner Date", "What to eat: [FOOD: Sushi, Pizza, Burgers]\n\nWho pays: [WHO_PAYS]");
  }

  override resolve(currentDescription: string): string {
    let resolved = this.resolveChoice(currentDescription, "FOOD");

    if (resolved.includes("[WHO_PAYS]")) {
      resolved = resolved.replace("[WHO_PAYS]", `<b>${this.getRandomPerson()}</b> is treating tonight! 💸`);
    }

    return resolved;
  }
}

export const PRESETS: Preset[] = [new DinnerPreset(), new MoviePreset(), new ShoppingPreset(), new StandardPreset("🏋️ Gym", "🏋️ Gym Session", "")];
