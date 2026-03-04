export type RecipeCategory =
  | "Cleaning"
  | "Skincare"
  | "Haircare"
  | "Home"
  | "Personal Care";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface RecipeIngredient {
  name: string;
  quantity: string;
  note?: string;
}

export interface RecipeStep {
  step: number;
  instruction: string;
  tip?: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: RecipeCategory;
  image: string;
  difficulty: Difficulty;
  timeMinutes: number;
  costEstimate: string;
  storeBoughtCost: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tips: string[];
  madeItCount: number;
}

export const RECIPE_CATEGORIES: { name: RecipeCategory; icon: string }[] = [
  { name: "Cleaning", icon: "🧹" },
  { name: "Skincare", icon: "✨" },
  { name: "Haircare", icon: "💇" },
  { name: "Home", icon: "🏡" },
  { name: "Personal Care", icon: "🌿" },
];

export const RECIPES: Recipe[] = [
  // ===== CLEANING (7 recipes) =====
  {
    id: "recipe-001",
    title: "All-Purpose Citrus Cleaner",
    category: "Cleaning",
    image: "🍊",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$2.50",
    storeBoughtCost: "$6.99",
    description:
      "A fresh, effective all-purpose cleaner made with citrus peels and vinegar. Works on countertops, sinks, and more.",
    ingredients: [
      { name: "White vinegar", quantity: "2 cups" },
      { name: "Citrus peels", quantity: "From 3-4 oranges or lemons" },
      { name: "Water", quantity: "2 cups" },
      { name: "Essential oil (optional)", quantity: "10 drops", note: "Lemon or tea tree" },
    ],
    steps: [
      { step: 1, instruction: "Fill a glass jar with citrus peels." },
      { step: 2, instruction: "Pour white vinegar over the peels until fully covered." },
      { step: 3, instruction: "Seal the jar and let it sit for 2 weeks in a dark spot.", tip: "Shake the jar every few days for better infusion." },
      { step: 4, instruction: "Strain out the peels and mix the infused vinegar with equal parts water." },
      { step: 5, instruction: "Pour into a spray bottle. Add essential oil if desired." },
    ],
    tips: [
      "Use a glass spray bottle to avoid degradation.",
      "Avoid using on marble or granite surfaces.",
      "The infused vinegar concentrate keeps for months.",
    ],
    madeItCount: 342,
  },
  {
    id: "recipe-002",
    title: "Lavender Linen Spray",
    category: "Cleaning",
    image: "💜",
    difficulty: "Easy",
    timeMinutes: 5,
    costEstimate: "$3.00",
    storeBoughtCost: "$12.99",
    description:
      "A calming linen spray that freshens sheets, pillows, and towels with natural lavender.",
    ingredients: [
      { name: "Distilled water", quantity: "1 cup" },
      { name: "Witch hazel", quantity: "2 tbsp" },
      { name: "Lavender essential oil", quantity: "20 drops" },
    ],
    steps: [
      { step: 1, instruction: "Combine witch hazel and lavender oil in a spray bottle." },
      { step: 2, instruction: "Add distilled water and shake well." },
      { step: 3, instruction: "Shake before each use and spritz on linens." },
    ],
    tips: [
      "Spray pillows 30 minutes before bedtime for better sleep.",
      "Also works great as a room spray.",
    ],
    madeItCount: 518,
  },
  {
    id: "recipe-003",
    title: "Baking Soda Scrub Paste",
    category: "Cleaning",
    image: "🫧",
    difficulty: "Easy",
    timeMinutes: 5,
    costEstimate: "$1.50",
    storeBoughtCost: "$5.99",
    description:
      "A gentle abrasive paste for scrubbing sinks, tubs, and stovetops without harsh chemicals.",
    ingredients: [
      { name: "Baking soda", quantity: "1/2 cup" },
      { name: "Liquid castile soap", quantity: "2 tbsp" },
      { name: "Water", quantity: "2 tbsp" },
      { name: "Tea tree essential oil", quantity: "5 drops" },
    ],
    steps: [
      { step: 1, instruction: "Mix baking soda and castile soap in a bowl." },
      { step: 2, instruction: "Add water until you get a paste consistency." },
      { step: 3, instruction: "Add tea tree oil and stir." },
      { step: 4, instruction: "Apply with a sponge, scrub, and rinse." },
    ],
    tips: [
      "Make fresh batches as needed since it dries out.",
      "Tea tree oil adds natural antibacterial properties.",
    ],
    madeItCount: 267,
  },
  {
    id: "recipe-004",
    title: "Glass and Mirror Spray",
    category: "Cleaning",
    image: "🪞",
    difficulty: "Easy",
    timeMinutes: 5,
    costEstimate: "$1.00",
    storeBoughtCost: "$4.99",
    description:
      "Streak-free glass cleaner using simple pantry ingredients. Works on windows, mirrors, and glass surfaces.",
    ingredients: [
      { name: "White vinegar", quantity: "1/4 cup" },
      { name: "Rubbing alcohol", quantity: "1/4 cup" },
      { name: "Cornstarch", quantity: "1 tbsp" },
      { name: "Distilled water", quantity: "2 cups" },
    ],
    steps: [
      { step: 1, instruction: "Dissolve cornstarch in a small amount of water first." },
      { step: 2, instruction: "Combine all ingredients in a spray bottle." },
      { step: 3, instruction: "Shake well before each use. Spray and wipe with a microfiber cloth." },
    ],
    tips: [
      "The cornstarch is the secret to streak-free results.",
      "Use newspaper for an even shinier finish.",
    ],
    madeItCount: 189,
  },
  {
    id: "recipe-005",
    title: "Toilet Bowl Fizz Bombs",
    category: "Cleaning",
    image: "💣",
    difficulty: "Medium",
    timeMinutes: 30,
    costEstimate: "$4.00",
    storeBoughtCost: "$8.99",
    description:
      "Drop-in fizzing tablets that clean and deodorize your toilet bowl naturally.",
    ingredients: [
      { name: "Baking soda", quantity: "1 cup" },
      { name: "Citric acid", quantity: "1/4 cup" },
      { name: "Peppermint essential oil", quantity: "30 drops" },
      { name: "Lemon essential oil", quantity: "20 drops" },
      { name: "Water", quantity: "Spritz as needed" },
    ],
    steps: [
      { step: 1, instruction: "Mix baking soda and citric acid in a bowl." },
      { step: 2, instruction: "Add essential oils and mix thoroughly." },
      { step: 3, instruction: "Spritz with water very lightly, just enough to hold shape.", tip: "Too much water will activate the fizz prematurely!" },
      { step: 4, instruction: "Pack into silicone molds or roll into balls." },
      { step: 5, instruction: "Let dry overnight. Store in an airtight container." },
    ],
    tips: [
      "Drop one in the toilet, let it fizz for 10 minutes, then scrub.",
      "Makes about 12 bombs per batch.",
      "Keep them away from moisture until ready to use.",
    ],
    madeItCount: 412,
  },
  {
    id: "recipe-006",
    title: "Wood Floor Polish",
    category: "Cleaning",
    image: "🪵",
    difficulty: "Easy",
    timeMinutes: 5,
    costEstimate: "$2.00",
    storeBoughtCost: "$9.99",
    description:
      "Natural wood floor polish that cleans and adds a gentle shine without residue.",
    ingredients: [
      { name: "Olive oil", quantity: "1/4 cup" },
      { name: "White vinegar", quantity: "1/3 cup" },
      { name: "Water", quantity: "3 cups" },
      { name: "Lemon essential oil", quantity: "10 drops" },
    ],
    steps: [
      { step: 1, instruction: "Combine all ingredients in a bucket or spray bottle." },
      { step: 2, instruction: "Shake or stir well before use." },
      { step: 3, instruction: "Mop floors with a damp (not wet) mop.", tip: "Too much liquid can damage wood floors." },
    ],
    tips: [
      "Use sparingly, a little goes a long way.",
      "Test on a small area first.",
    ],
    madeItCount: 156,
  },
  {
    id: "recipe-007",
    title: "Dish Soap Refill",
    category: "Cleaning",
    image: "🍽️",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$2.50",
    storeBoughtCost: "$5.99",
    description:
      "Gentle, effective dish soap made with castile soap and essential oils.",
    ingredients: [
      { name: "Liquid castile soap", quantity: "1/2 cup" },
      { name: "Water", quantity: "1/2 cup" },
      { name: "White vinegar", quantity: "1 tsp" },
      { name: "Lemon essential oil", quantity: "15 drops" },
    ],
    steps: [
      { step: 1, instruction: "Combine castile soap and water in a bottle." },
      { step: 2, instruction: "Add vinegar and essential oil." },
      { step: 3, instruction: "Gently swirl to mix (don't shake, it will foam)." },
    ],
    tips: [
      "Use a foaming soap dispenser for best results.",
      "Add a bit more castile soap for tough grease.",
    ],
    madeItCount: 203,
  },

  // ===== SKINCARE (7 recipes) =====
  {
    id: "recipe-008",
    title: "Honey Oat Face Mask",
    category: "Skincare",
    image: "🍯",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$1.50",
    storeBoughtCost: "$15.99",
    description:
      "A soothing face mask that hydrates, calms redness, and gently exfoliates with oats.",
    ingredients: [
      { name: "Raw honey", quantity: "2 tbsp" },
      { name: "Ground oats", quantity: "1 tbsp", note: "Blend rolled oats into powder" },
      { name: "Plain yogurt", quantity: "1 tbsp" },
    ],
    steps: [
      { step: 1, instruction: "Mix all ingredients in a small bowl until smooth." },
      { step: 2, instruction: "Apply evenly to clean, damp face." },
      { step: 3, instruction: "Leave on for 15-20 minutes." },
      { step: 4, instruction: "Rinse with warm water and pat dry." },
    ],
    tips: [
      "Great for sensitive and dry skin.",
      "Use 1-2 times per week for best results.",
      "The lactic acid in yogurt provides gentle chemical exfoliation.",
    ],
    madeItCount: 723,
  },
  {
    id: "recipe-009",
    title: "Rose Water Toner",
    category: "Skincare",
    image: "🌹",
    difficulty: "Easy",
    timeMinutes: 5,
    costEstimate: "$3.00",
    storeBoughtCost: "$14.99",
    description:
      "A refreshing facial toner that balances pH, tightens pores, and adds a dewy glow.",
    ingredients: [
      { name: "Rose water", quantity: "1/2 cup" },
      { name: "Witch hazel", quantity: "2 tbsp" },
      { name: "Aloe vera gel", quantity: "1 tbsp" },
      { name: "Vegetable glycerin", quantity: "1 tsp" },
    ],
    steps: [
      { step: 1, instruction: "Combine all ingredients in a clean glass bottle." },
      { step: 2, instruction: "Shake well to mix." },
      { step: 3, instruction: "Apply with a cotton pad or spray directly on face after cleansing." },
    ],
    tips: [
      "Store in the fridge for an extra refreshing feel.",
      "Use morning and night after cleansing.",
    ],
    madeItCount: 589,
  },
  {
    id: "recipe-010",
    title: "Coffee Body Scrub",
    category: "Skincare",
    image: "☕",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$2.00",
    storeBoughtCost: "$18.99",
    description:
      "An energizing body scrub that exfoliates dead skin, reduces cellulite appearance, and leaves skin silky smooth.",
    ingredients: [
      { name: "Used coffee grounds", quantity: "1 cup" },
      { name: "Coconut oil", quantity: "1/2 cup", note: "Melted" },
      { name: "Brown sugar", quantity: "1/2 cup" },
      { name: "Vanilla extract", quantity: "1 tsp" },
    ],
    steps: [
      { step: 1, instruction: "Melt coconut oil and let it cool slightly." },
      { step: 2, instruction: "Mix coffee grounds, sugar, and vanilla in a bowl." },
      { step: 3, instruction: "Pour in coconut oil and stir until combined." },
      { step: 4, instruction: "Use in the shower, massaging in circular motions. Rinse off." },
    ],
    tips: [
      "Use within 2 weeks for freshness.",
      "The caffeine in coffee temporarily tightens skin.",
      "Be careful - it can make the shower floor slippery!",
    ],
    madeItCount: 891,
  },
  {
    id: "recipe-011",
    title: "Coconut Oil Makeup Remover",
    category: "Skincare",
    image: "🥥",
    difficulty: "Easy",
    timeMinutes: 5,
    costEstimate: "$2.00",
    storeBoughtCost: "$12.99",
    description:
      "A gentle, effective makeup remover that dissolves even waterproof mascara while nourishing skin.",
    ingredients: [
      { name: "Coconut oil", quantity: "3 tbsp" },
      { name: "Jojoba oil", quantity: "1 tbsp" },
      { name: "Vitamin E oil", quantity: "1/2 tsp" },
    ],
    steps: [
      { step: 1, instruction: "Melt coconut oil if solid and mix with other oils." },
      { step: 2, instruction: "Pour into a small jar with a lid." },
      { step: 3, instruction: "To use: massage a small amount onto dry face, then wipe off with a warm damp cloth." },
    ],
    tips: [
      "Follow up with your regular cleanser (double cleanse method).",
      "Not recommended for acne-prone skin.",
    ],
    madeItCount: 445,
  },
  {
    id: "recipe-012",
    title: "Green Tea Eye Serum",
    category: "Skincare",
    image: "🍵",
    difficulty: "Medium",
    timeMinutes: 15,
    costEstimate: "$4.00",
    storeBoughtCost: "$24.99",
    description:
      "An antioxidant-rich eye serum that reduces puffiness and dark circles naturally.",
    ingredients: [
      { name: "Brewed green tea", quantity: "2 tbsp", note: "Cooled" },
      { name: "Aloe vera gel", quantity: "1 tbsp" },
      { name: "Rosehip oil", quantity: "1 tsp" },
      { name: "Vitamin E oil", quantity: "3 drops" },
    ],
    steps: [
      { step: 1, instruction: "Brew green tea strong and let it cool completely." },
      { step: 2, instruction: "Mix cooled tea with aloe vera gel." },
      { step: 3, instruction: "Add rosehip and vitamin E oils, stir gently." },
      { step: 4, instruction: "Transfer to a small dropper bottle." },
      { step: 5, instruction: "Apply with fingertips around the eye area, morning and night." },
    ],
    tips: [
      "Keep refrigerated, use within 1 week.",
      "Tap gently around the eyes with your ring finger for best absorption.",
    ],
    madeItCount: 334,
  },
  {
    id: "recipe-013",
    title: "Turmeric Glow Mask",
    category: "Skincare",
    image: "💛",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$2.00",
    storeBoughtCost: "$16.99",
    description:
      "A brightening face mask with turmeric that evens out skin tone and fights inflammation.",
    ingredients: [
      { name: "Turmeric powder", quantity: "1/2 tsp" },
      { name: "Raw honey", quantity: "1 tbsp" },
      { name: "Plain yogurt", quantity: "1 tbsp" },
      { name: "Lemon juice", quantity: "1/2 tsp", note: "Fresh" },
    ],
    steps: [
      { step: 1, instruction: "Mix all ingredients into a smooth paste." },
      { step: 2, instruction: "Apply to clean face, avoiding the eye area." },
      { step: 3, instruction: "Leave on for 10-15 minutes." },
      { step: 4, instruction: "Rinse with warm water.", tip: "Turmeric can stain, so use an old towel!" },
    ],
    tips: [
      "Use only 1/2 tsp turmeric to avoid temporary yellow tinting.",
      "Best used at night in case of slight discoloration.",
      "Do a patch test first if you have sensitive skin.",
    ],
    madeItCount: 567,
  },
  {
    id: "recipe-014",
    title: "Lip Sugar Scrub",
    category: "Skincare",
    image: "👄",
    difficulty: "Easy",
    timeMinutes: 5,
    costEstimate: "$1.00",
    storeBoughtCost: "$8.99",
    description:
      "A sweet, gentle lip scrub that removes dry, flaky skin and leaves lips soft and kissable.",
    ingredients: [
      { name: "Brown sugar", quantity: "1 tbsp" },
      { name: "Honey", quantity: "1 tsp" },
      { name: "Coconut oil", quantity: "1 tsp" },
      { name: "Vanilla extract", quantity: "2 drops" },
    ],
    steps: [
      { step: 1, instruction: "Mix all ingredients in a small jar." },
      { step: 2, instruction: "Gently rub a small amount on lips in circular motions." },
      { step: 3, instruction: "Lick off or rinse with water. Follow with lip balm." },
    ],
    tips: [
      "Use 2-3 times per week for smooth lips.",
      "It tastes good, so making extra is recommended!",
    ],
    madeItCount: 678,
  },

  // ===== HAIRCARE (6 recipes) =====
  {
    id: "recipe-015",
    title: "Apple Cider Vinegar Rinse",
    category: "Haircare",
    image: "🍎",
    difficulty: "Easy",
    timeMinutes: 5,
    costEstimate: "$1.00",
    storeBoughtCost: "$11.99",
    description:
      "A clarifying hair rinse that removes buildup, balances scalp pH, and adds incredible shine.",
    ingredients: [
      { name: "Apple cider vinegar", quantity: "2 tbsp" },
      { name: "Water", quantity: "1 cup" },
      { name: "Rosemary essential oil", quantity: "3 drops", note: "Optional" },
    ],
    steps: [
      { step: 1, instruction: "Mix vinegar and water in a squeeze bottle or cup." },
      { step: 2, instruction: "After shampooing, pour the mixture over your hair." },
      { step: 3, instruction: "Let it sit for 1-2 minutes, then rinse with cool water." },
    ],
    tips: [
      "Use once a week for best results.",
      "The vinegar smell disappears as hair dries.",
      "Use raw, unfiltered ACV with 'the mother' for best results.",
    ],
    madeItCount: 934,
  },
  {
    id: "recipe-016",
    title: "Coconut Milk Hair Mask",
    category: "Haircare",
    image: "🥛",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$3.00",
    storeBoughtCost: "$16.99",
    description:
      "A deeply moisturizing hair mask that repairs dry, damaged hair and adds softness.",
    ingredients: [
      { name: "Full-fat coconut milk", quantity: "1/2 cup" },
      { name: "Honey", quantity: "2 tbsp" },
      { name: "Olive oil", quantity: "1 tbsp" },
    ],
    steps: [
      { step: 1, instruction: "Mix all ingredients until smooth." },
      { step: 2, instruction: "Apply to damp hair from mid-length to ends." },
      { step: 3, instruction: "Cover with a shower cap and leave for 30-60 minutes." },
      { step: 4, instruction: "Shampoo and condition as normal." },
    ],
    tips: [
      "For extra deep conditioning, apply heat with a warm towel over the shower cap.",
      "Best for medium to thick hair types.",
    ],
    madeItCount: 456,
  },
  {
    id: "recipe-017",
    title: "Rosemary Scalp Oil",
    category: "Haircare",
    image: "🌿",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$5.00",
    storeBoughtCost: "$22.99",
    description:
      "A stimulating scalp treatment that promotes hair growth and reduces dandruff.",
    ingredients: [
      { name: "Jojoba oil", quantity: "2 tbsp" },
      { name: "Castor oil", quantity: "1 tbsp" },
      { name: "Rosemary essential oil", quantity: "10 drops" },
      { name: "Peppermint essential oil", quantity: "5 drops" },
    ],
    steps: [
      { step: 1, instruction: "Combine carrier oils in a small dropper bottle." },
      { step: 2, instruction: "Add essential oils and shake gently." },
      { step: 3, instruction: "Apply a few drops to scalp and massage for 5 minutes." },
      { step: 4, instruction: "Leave in overnight or for at least 1 hour before washing." },
    ],
    tips: [
      "Rosemary oil has been shown to be as effective as minoxidil for hair growth.",
      "Use 2-3 times per week for best results.",
      "Protect your pillowcase with an old towel if leaving overnight.",
    ],
    madeItCount: 1023,
  },
  {
    id: "recipe-018",
    title: "Flaxseed Hair Gel",
    category: "Haircare",
    image: "✨",
    difficulty: "Medium",
    timeMinutes: 20,
    costEstimate: "$1.50",
    storeBoughtCost: "$9.99",
    description:
      "A natural, flake-free hair gel that defines curls and provides hold without crunchiness.",
    ingredients: [
      { name: "Whole flaxseeds", quantity: "1/4 cup" },
      { name: "Water", quantity: "2 cups" },
      { name: "Aloe vera gel", quantity: "1 tbsp" },
      { name: "Lavender essential oil", quantity: "5 drops" },
    ],
    steps: [
      { step: 1, instruction: "Bring flaxseeds and water to a boil in a saucepan." },
      { step: 2, instruction: "Reduce heat and simmer for 10 minutes, stirring constantly.", tip: "It's ready when the water becomes gel-like." },
      { step: 3, instruction: "Strain through a fine mesh strainer or stocking." },
      { step: 4, instruction: "Stir in aloe vera gel and essential oil while still warm." },
      { step: 5, instruction: "Let cool and transfer to a jar." },
    ],
    tips: [
      "Refrigerate and use within 2 weeks.",
      "Perfect for the curly girl method.",
      "Adjust consistency by boiling longer (thicker) or shorter (thinner).",
    ],
    madeItCount: 567,
  },
  {
    id: "recipe-019",
    title: "Dry Shampoo Powder",
    category: "Haircare",
    image: "💨",
    difficulty: "Easy",
    timeMinutes: 5,
    costEstimate: "$2.00",
    storeBoughtCost: "$10.99",
    description:
      "An oil-absorbing dry shampoo that refreshes hair between washes without aerosol chemicals.",
    ingredients: [
      { name: "Arrowroot powder", quantity: "2 tbsp" },
      { name: "Cocoa powder", quantity: "1 tbsp", note: "For dark hair, skip for light hair" },
      { name: "Lavender essential oil", quantity: "5 drops" },
    ],
    steps: [
      { step: 1, instruction: "Mix arrowroot powder and cocoa powder (if using) in a jar." },
      { step: 2, instruction: "Add essential oil and stir to distribute." },
      { step: 3, instruction: "Apply to roots with a makeup brush or fingers.", tip: "Start with a small amount and add more as needed." },
    ],
    tips: [
      "Adjust cocoa powder ratio to match your hair color.",
      "Skip cocoa powder entirely for blonde/light hair.",
      "Let it sit for 2 minutes before brushing through.",
    ],
    madeItCount: 789,
  },
  {
    id: "recipe-020",
    title: "Egg Protein Hair Treatment",
    category: "Haircare",
    image: "🥚",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$1.00",
    storeBoughtCost: "$14.99",
    description:
      "A protein-rich treatment that strengthens weak, brittle hair and reduces breakage.",
    ingredients: [
      { name: "Egg", quantity: "1 whole" },
      { name: "Olive oil", quantity: "1 tbsp" },
      { name: "Honey", quantity: "1 tbsp" },
    ],
    steps: [
      { step: 1, instruction: "Whisk the egg in a bowl." },
      { step: 2, instruction: "Add olive oil and honey, mix well." },
      { step: 3, instruction: "Apply to damp hair, focusing on damaged areas." },
      { step: 4, instruction: "Cover with a shower cap for 20-30 minutes." },
      { step: 5, instruction: "Rinse with COOL water and shampoo.", tip: "Hot water will cook the egg in your hair!" },
    ],
    tips: [
      "Use cool or lukewarm water only when rinsing.",
      "Do this treatment once every 2 weeks.",
      "Overuse can make hair brittle, balance with moisture treatments.",
    ],
    madeItCount: 345,
  },

  // ===== HOME (5 recipes) =====
  {
    id: "recipe-021",
    title: "Beeswax Food Wraps",
    category: "Home",
    image: "🐝",
    difficulty: "Medium",
    timeMinutes: 45,
    costEstimate: "$8.00",
    storeBoughtCost: "$18.99",
    description:
      "Reusable food wraps to replace plastic cling wrap. Eco-friendly and long-lasting.",
    ingredients: [
      { name: "Cotton fabric", quantity: "3 squares (12x12 inches)" },
      { name: "Beeswax pellets", quantity: "4 oz" },
      { name: "Jojoba oil", quantity: "1 tbsp" },
      { name: "Pine resin", quantity: "1 tbsp", note: "Optional, adds stickiness" },
    ],
    steps: [
      { step: 1, instruction: "Preheat oven to 200F. Line a baking sheet with parchment paper." },
      { step: 2, instruction: "Place fabric on parchment and sprinkle beeswax pellets evenly." },
      { step: 3, instruction: "Drizzle jojoba oil over the fabric." },
      { step: 4, instruction: "Bake for 4-5 minutes until wax melts. Use a brush to spread evenly." },
      { step: 5, instruction: "Lift with tongs and hang to dry for 1 minute." },
    ],
    tips: [
      "Use pinking shears to cut fabric edges to prevent fraying.",
      "Wash with cool water and mild soap only.",
      "Refresh wraps by re-melting in the oven after a few months.",
    ],
    madeItCount: 234,
  },
  {
    id: "recipe-022",
    title: "Soy Candle",
    category: "Home",
    image: "🕯️",
    difficulty: "Medium",
    timeMinutes: 60,
    costEstimate: "$6.00",
    storeBoughtCost: "$25.99",
    description:
      "Clean-burning soy candles without the toxic chemicals found in conventional paraffin candles.",
    ingredients: [
      { name: "Soy wax flakes", quantity: "2 cups" },
      { name: "Cotton wick", quantity: "1", note: "Pre-tabbed" },
      { name: "Essential oil blend", quantity: "30-40 drops" },
      { name: "Glass jar", quantity: "1 (8 oz)" },
    ],
    steps: [
      { step: 1, instruction: "Melt soy wax in a double boiler until fully liquid." },
      { step: 2, instruction: "Remove from heat and let cool to 135F." },
      { step: 3, instruction: "Add essential oils and stir gently for 2 minutes." },
      { step: 4, instruction: "Secure the wick in center of jar using a wick holder." },
      { step: 5, instruction: "Pour wax slowly into the jar. Let cool for 24 hours." },
      { step: 6, instruction: "Trim wick to 1/4 inch before first use." },
    ],
    tips: [
      "Popular scent combos: lavender + vanilla, eucalyptus + mint, orange + cinnamon.",
      "Burn for at least 1 hour on first use to prevent tunneling.",
      "Soy wax burns 50% longer than paraffin.",
    ],
    madeItCount: 567,
  },
  {
    id: "recipe-023",
    title: "Natural Room Diffuser",
    category: "Home",
    image: "🌸",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$5.00",
    storeBoughtCost: "$19.99",
    description:
      "A reed diffuser that freshens your home with natural essential oils instead of synthetic fragrances.",
    ingredients: [
      { name: "Sweet almond oil", quantity: "1/4 cup" },
      { name: "Rubbing alcohol", quantity: "2 tbsp", note: "Helps oil travel up the reeds" },
      { name: "Essential oil blend", quantity: "30-40 drops" },
      { name: "Reed diffuser sticks", quantity: "5-8" },
      { name: "Small glass vase", quantity: "1" },
    ],
    steps: [
      { step: 1, instruction: "Pour almond oil and rubbing alcohol into the vase." },
      { step: 2, instruction: "Add essential oils and swirl gently." },
      { step: 3, instruction: "Insert reed sticks. Flip them after 1 hour." },
    ],
    tips: [
      "Flip reeds weekly for consistent scent.",
      "Replace reeds every month as they become saturated.",
      "Try: lemongrass + ginger, or lavender + chamomile.",
    ],
    madeItCount: 345,
  },
  {
    id: "recipe-024",
    title: "Herb-Infused Vinegar Cleaner",
    category: "Home",
    image: "🌱",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$2.50",
    storeBoughtCost: "$7.99",
    description:
      "A fragrant cleaning vinegar infused with fresh herbs for a natural, pleasant cleaning experience.",
    ingredients: [
      { name: "White vinegar", quantity: "2 cups" },
      { name: "Fresh rosemary sprigs", quantity: "3-4" },
      { name: "Fresh thyme sprigs", quantity: "3-4" },
      { name: "Lemon peel", quantity: "From 1 lemon" },
    ],
    steps: [
      { step: 1, instruction: "Place herbs and lemon peel in a glass jar." },
      { step: 2, instruction: "Pour vinegar over them until fully covered." },
      { step: 3, instruction: "Seal and let infuse for 1-2 weeks." },
      { step: 4, instruction: "Strain and dilute 1:1 with water for cleaning." },
    ],
    tips: [
      "The herbs make the vinegar smell much more pleasant.",
      "Great for kitchen and bathroom surfaces.",
    ],
    madeItCount: 178,
  },
  {
    id: "recipe-025",
    title: "Sachets for Drawers",
    category: "Home",
    image: "💐",
    difficulty: "Easy",
    timeMinutes: 15,
    costEstimate: "$3.00",
    storeBoughtCost: "$12.99",
    description:
      "Fragrant sachets that keep your clothes and drawers smelling fresh without synthetic fragrances.",
    ingredients: [
      { name: "Dried lavender buds", quantity: "1 cup" },
      { name: "Rice", quantity: "1/4 cup" },
      { name: "Lavender essential oil", quantity: "10 drops" },
      { name: "Small muslin bags", quantity: "4-5" },
    ],
    steps: [
      { step: 1, instruction: "Mix lavender buds and rice in a bowl." },
      { step: 2, instruction: "Add essential oil drops and toss to distribute." },
      { step: 3, instruction: "Fill muslin bags and tie shut." },
      { step: 4, instruction: "Place in drawers, closets, or gym bags." },
    ],
    tips: [
      "Refresh with a few drops of essential oil every few months.",
      "The rice absorbs moisture and helps carry the scent.",
      "Also works as a natural moth repellent.",
    ],
    madeItCount: 234,
  },

  // ===== PERSONAL CARE (6 recipes) =====
  {
    id: "recipe-026",
    title: "Natural Deodorant",
    category: "Personal Care",
    image: "🧴",
    difficulty: "Medium",
    timeMinutes: 20,
    costEstimate: "$4.00",
    storeBoughtCost: "$13.99",
    description:
      "An aluminum-free deodorant that actually works, made with simple, safe ingredients.",
    ingredients: [
      { name: "Coconut oil", quantity: "3 tbsp" },
      { name: "Baking soda", quantity: "2 tbsp" },
      { name: "Arrowroot powder", quantity: "2 tbsp" },
      { name: "Shea butter", quantity: "1 tbsp" },
      { name: "Essential oil", quantity: "10 drops", note: "Tea tree or lavender" },
    ],
    steps: [
      { step: 1, instruction: "Melt coconut oil and shea butter together in a double boiler." },
      { step: 2, instruction: "Remove from heat. Stir in baking soda and arrowroot powder." },
      { step: 3, instruction: "Add essential oils and mix well." },
      { step: 4, instruction: "Pour into a clean deodorant container or small jar." },
      { step: 5, instruction: "Let solidify at room temperature or in the fridge for 1 hour." },
    ],
    tips: [
      "If you experience irritation, reduce the baking soda and increase arrowroot.",
      "Allow a 2-week adjustment period when switching from conventional deodorant.",
      "In hot weather, store in the fridge to keep it solid.",
    ],
    madeItCount: 678,
  },
  {
    id: "recipe-027",
    title: "Whipped Body Butter",
    category: "Personal Care",
    image: "🧈",
    difficulty: "Medium",
    timeMinutes: 25,
    costEstimate: "$6.00",
    storeBoughtCost: "$22.99",
    description:
      "A luxuriously creamy body butter that deeply moisturizes without any synthetic ingredients.",
    ingredients: [
      { name: "Shea butter", quantity: "1/2 cup" },
      { name: "Coconut oil", quantity: "1/4 cup" },
      { name: "Sweet almond oil", quantity: "2 tbsp" },
      { name: "Vitamin E oil", quantity: "1 tsp" },
      { name: "Essential oil blend", quantity: "15-20 drops" },
    ],
    steps: [
      { step: 1, instruction: "Melt shea butter and coconut oil in a double boiler." },
      { step: 2, instruction: "Remove from heat and stir in almond oil and vitamin E." },
      { step: 3, instruction: "Refrigerate for 1-2 hours until semi-solid." },
      { step: 4, instruction: "Whip with a hand mixer for 3-5 minutes until fluffy.", tip: "It should look like whipped cream!" },
      { step: 5, instruction: "Fold in essential oils and transfer to jars." },
    ],
    tips: [
      "Best applied right after a shower on damp skin.",
      "Try vanilla + orange or rose + geranium scent combos.",
      "Lasts 3-6 months when stored properly.",
    ],
    madeItCount: 512,
  },
  {
    id: "recipe-028",
    title: "Peppermint Foot Soak",
    category: "Personal Care",
    image: "🦶",
    difficulty: "Easy",
    timeMinutes: 5,
    costEstimate: "$3.00",
    storeBoughtCost: "$11.99",
    description:
      "A refreshing foot soak that relieves tired feet, reduces odor, and softens rough skin.",
    ingredients: [
      { name: "Epsom salt", quantity: "1/2 cup" },
      { name: "Baking soda", quantity: "2 tbsp" },
      { name: "Peppermint essential oil", quantity: "10 drops" },
      { name: "Eucalyptus essential oil", quantity: "5 drops" },
    ],
    steps: [
      { step: 1, instruction: "Mix all dry ingredients in a jar." },
      { step: 2, instruction: "Add essential oils and stir well." },
      { step: 3, instruction: "Add 2-3 tablespoons to a basin of warm water. Soak feet for 20 minutes." },
    ],
    tips: [
      "Follow up with a pumice stone for extra smooth feet.",
      "The jar of mix makes about 6-8 soaks.",
      "Great after a long day or workout.",
    ],
    madeItCount: 289,
  },
  {
    id: "recipe-029",
    title: "Charcoal Tooth Powder",
    category: "Personal Care",
    image: "🦷",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$4.00",
    storeBoughtCost: "$14.99",
    description:
      "A natural tooth powder that whitens teeth and freshens breath without fluoride or SLS.",
    ingredients: [
      { name: "Activated charcoal", quantity: "1 tbsp" },
      { name: "Baking soda", quantity: "2 tbsp" },
      { name: "Bentonite clay", quantity: "1 tbsp" },
      { name: "Peppermint essential oil", quantity: "10 drops" },
      { name: "Xylitol", quantity: "1 tsp", note: "For sweetness" },
    ],
    steps: [
      { step: 1, instruction: "Mix all dry ingredients in a small jar." },
      { step: 2, instruction: "Add essential oil and stir with a non-metal spoon.", tip: "Metal can deactivate bentonite clay." },
      { step: 3, instruction: "To use: wet toothbrush, dip in powder, brush for 2 minutes." },
    ],
    tips: [
      "Use 2-3 times per week, not daily (charcoal is mildly abrasive).",
      "Your sink will look messy but it washes right off.",
      "Don't use if you have dental restorations (veneers, crowns).",
    ],
    madeItCount: 345,
  },
  {
    id: "recipe-030",
    title: "Vanilla Mint Lip Balm",
    category: "Personal Care",
    image: "💋",
    difficulty: "Medium",
    timeMinutes: 20,
    costEstimate: "$3.00",
    storeBoughtCost: "$5.99",
    description:
      "A moisturizing lip balm with a hint of vanilla and mint, free from petroleum and synthetic waxes.",
    ingredients: [
      { name: "Beeswax pellets", quantity: "1 tbsp" },
      { name: "Coconut oil", quantity: "1 tbsp" },
      { name: "Shea butter", quantity: "1 tsp" },
      { name: "Vanilla extract", quantity: "1/4 tsp" },
      { name: "Peppermint essential oil", quantity: "3 drops" },
    ],
    steps: [
      { step: 1, instruction: "Melt beeswax, coconut oil, and shea butter in a double boiler." },
      { step: 2, instruction: "Remove from heat. Quickly add vanilla and peppermint oil." },
      { step: 3, instruction: "Pour into lip balm tubes or small tins." },
      { step: 4, instruction: "Let cool and solidify for 1 hour." },
    ],
    tips: [
      "Makes about 5 lip balm tubes per batch.",
      "Add a tiny bit of beetroot powder for natural tint.",
      "Great as gifts!",
    ],
    madeItCount: 456,
  },
  {
    id: "recipe-031",
    title: "Salt and Herb Bath Soak",
    category: "Personal Care",
    image: "🛁",
    difficulty: "Easy",
    timeMinutes: 10,
    costEstimate: "$4.00",
    storeBoughtCost: "$15.99",
    description:
      "A relaxing bath soak with mineral-rich salts and calming herbs for the ultimate self-care night.",
    ingredients: [
      { name: "Epsom salt", quantity: "1 cup" },
      { name: "Dead Sea salt", quantity: "1/2 cup" },
      { name: "Dried lavender buds", quantity: "2 tbsp" },
      { name: "Dried chamomile flowers", quantity: "2 tbsp" },
      { name: "Lavender essential oil", quantity: "15 drops" },
      { name: "Coconut oil", quantity: "1 tbsp", note: "Melted" },
    ],
    steps: [
      { step: 1, instruction: "Mix both salts in a large bowl." },
      { step: 2, instruction: "Add dried herbs and toss gently." },
      { step: 3, instruction: "Drizzle in melted coconut oil and essential oil." },
      { step: 4, instruction: "Mix well and store in a glass jar." },
      { step: 5, instruction: "Use 1/2 cup per bath." },
    ],
    tips: [
      "Makes about 4-5 baths worth.",
      "Put herbs in a muslin bag to avoid clogging the drain.",
      "Add dried rose petals for an extra luxe experience.",
    ],
    madeItCount: 567,
  },
];

export function getRecipeById(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}

export function getRecipesByCategory(category: RecipeCategory): Recipe[] {
  return RECIPES.filter((r) => r.category === category);
}

export function searchRecipes(query: string): Recipe[] {
  const q = query.toLowerCase();
  return RECIPES.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
  );
}

export function filterRecipes(opts: {
  category?: RecipeCategory;
  difficulty?: Difficulty;
  maxTime?: number;
  query?: string;
}): Recipe[] {
  let results = [...RECIPES];
  if (opts.category) {
    results = results.filter((r) => r.category === opts.category);
  }
  if (opts.difficulty) {
    results = results.filter((r) => r.difficulty === opts.difficulty);
  }
  if (opts.maxTime) {
    results = results.filter((r) => r.timeMinutes <= opts.maxTime!);
  }
  if (opts.query) {
    const q = opts.query.toLowerCase();
    results = results.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }
  return results;
}
