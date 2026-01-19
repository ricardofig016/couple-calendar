export class Preset {
  public static readonly NAMES = ["Ricardo", "Carolina"];

  constructor(
    public readonly label: string,
    public readonly title: string,
    public readonly description: string,
    private readonly choiceKeys: string[] = [],
    private readonly personKeys: string[] = [],
    private readonly fieldKeys: string[] = [],
  ) {}

  /**
   * Resolves any logic within the title.
   * By default, it resolves fieldKeys by looking for values in the description.
   */
  resolveTitle(currentTitle: string, _startTime: Date, currentDescription: string): string {
    let resolved = currentTitle;

    for (const key of this.fieldKeys) {
      // Find [KEY: value] in description
      const regex = new RegExp(`\\[${key}:\\s*(.*?)\\]`, "i");
      const match = currentDescription.match(regex);
      if (match) {
        // Replace [KEY] in title with the value (without prompt syntax)
        const replacer = new RegExp(`\\[${key}\\]`, "gi");
        resolved = resolved.replace(replacer, match[1]);
      }
    }

    return resolved;
  }

  /**
   * Resolves any logic within the description by replacing placeholders
   * for choices [KEY: item1, item2],
   * independent people [KEY],
   * and a linked couple [A] and [B].
   */
  resolve(currentDescription: string): string {
    let resolved = currentDescription;

    // Resolve linked couple placeholders [A] and [B]
    const personA = Math.random() > 0.5 ? Preset.NAMES[0] : Preset.NAMES[1];
    const personB = personA === Preset.NAMES[0] ? Preset.NAMES[1] : Preset.NAMES[0];
    resolved = resolved.replace(/\[A\]/gi, `<b>${personA}</b>`);
    resolved = resolved.replace(/\[B\]/gi, `<b>${personB}</b>`);

    // Resolve person placeholders [KEY]
    for (const key of this.personKeys) {
      const regex = new RegExp(`\\[${key}\\]`, "gi");
      const person = Math.random() > 0.5 ? Preset.NAMES[0] : Preset.NAMES[1];
      resolved = resolved.replace(regex, `<b>${person}</b>`);
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

    // Resolve field placeholders [KEY: value]
    for (const key of this.fieldKeys) {
      const regex = new RegExp(`\\[${key}:\\s*(.*?)\\]`, "gi");
      resolved = resolved.replace(regex, (match, value) => {
        return `<b>${value}</b>`;
      });
    }

    return resolved;
  }
}

export class DinnerPreset extends Preset {
  private static readonly FOOD_EMOJIS: Record<string, string> = {
    pizza: "🍕",
    sushi: "🍣",
    japanese: "🍣",
    ramen: "🍜",
    burgers: "🍔",
    burger: "🍔",
    kebab: "🥙",
    pasta: "🍝",
    italian: "🍝",
    tacos: "🌮",
    mexican: "🌮",
    steak: "🥩",
    fish: "🐟",
    chicken: "🍗",
    salad: "🥗",
    thai: "🍲",
    chinese: "🥡",
    indian: "🍛",
    korean: "🥘",
    pancakes: "🥞",
    waffles: "🧇",
  };

  constructor() {
    super("🍴 Dinner", "🍴 Dinner Date", "What to eat: [FOOD: Sushi, Pizza, Burgers]\n📍 Location: \n💸 [PAYER] is treating tonight!", ["FOOD"], ["PAYER"]);
  }

  override resolve(currentDescription: string): string {
    let resolved = super.resolve(currentDescription);

    // If "What to eat: <b>Selected</b>" is present, prepends emoji if matched
    const foodMatch = resolved.match(/What to eat: <b>(.*?)<\/b>/i);
    if (foodMatch) {
      const food = foodMatch[1].trim().toLowerCase();
      const emoji = DinnerPreset.FOOD_EMOJIS[food];
      if (emoji) {
        resolved = resolved.replace(/What to eat:/i, `${emoji} What to eat:`);
      }
    }

    return resolved;
  }

  override resolveTitle(currentTitle: string, startTime: Date, currentDescription: string): string {
    const hours = startTime.getHours();
    const minutes = startTime.getMinutes();
    const timeValue = hours + minutes / 60;

    let meal = "Dinner";
    if (timeValue >= 5 && timeValue < 10.5) {
      meal = "Breakfast";
    } else if (timeValue >= 10.5 && timeValue < 15) {
      meal = "Lunch";
    } else if (timeValue >= 15 && timeValue < 18.5) {
      meal = "Snack";
    }

    // Replace "Dinner" with the appropriate meal name
    // Matches "Dinner" regardless of case, but keeps emojis and other text
    const baseTitle = super.resolveTitle(currentTitle, startTime, currentDescription);
    return baseTitle.replace(/Dinner/i, meal);
  }
}

export const PRESETS: Preset[] = [
  new DinnerPreset(),
  new Preset("🍿 Movie", "🍿 Movie Night", "🎬 We'll watch: [MOVIES: movie1, movie2]\n📍 Location: \n✨ Don't forget the popcorn!", ["MOVIES"]),
  new Preset("🛒 Shopping", "🛒 Grocery Run", "💸 [A] is paying today! 💳\n🛒💨 That means [B] is on cart duty!", [], []),
  new Preset("😴 Sleepover", "😴 Sleepover", "📍 Location: [PERSON]'s 🏠\n🍪 Don't forget the snacks and cuddles!", [], ["PERSON"]),
  new Preset("🎂 Birthday", "🎂 [PERSON]'s Birthday", "🎉 Happy birthday [PERSON: value]! 🎈\n🎁 Gift: \n📍 Location: ", [], [], ["PERSON"]),
  new Preset("🎉 Party", "🎉 Party Time", "💃 Get ready to celebrate! ✨\n🥴🍾 Don't drink TOOO much!\n📍 Location: "),
  new Preset("🏋️ Gym", "🏋️ Gym Session", "💪✨ Gains. Gains! GAINS!!\n💧 Don't forget to stay hydrated! 🥤"),
  new Preset("☕ Coffee", "☕ Coffee Date", "📍 Location: \n🥯 Maybe a little treat too? 🥐"),
];
