export const AVATAR_EMOJI_MAP: Record<string, string> = {
  leaf: "\u{1F33F}",
  sunflower: "\u{1F33B}",
  mushroom: "\u{1F344}",
  avocado: "\u{1F951}",
  butterfly: "\u{1F98B}",
  bee: "\u{1F41D}",
  cherry: "\u{1F352}",
  rainbow: "\u{1F308}",
  star: "\u2B50",
  cactus: "\u{1F335}",
  peach: "\u{1F351}",
  herb: "\u{1F331}",
};

export const AVATAR_PRESETS = Object.entries(AVATAR_EMOJI_MAP).map(
  ([id, emoji]) => ({ id, emoji })
);

export const DEFAULT_AVATAR_EMOJI = "\u{1F333}";
