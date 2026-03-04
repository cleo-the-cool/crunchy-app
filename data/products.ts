export type Rating = "clean" | "caution" | "avoid";
export type IngredientRisk = "safe" | "concern" | "toxic";

export interface Ingredient {
  name: string;
  risk: IngredientRisk;
  explanation: string;
}

export interface Alternative {
  id: string;
  name: string;
  brand: string;
  price: string;
  rating: Rating;
  category: string;
  image: string; // emoji placeholder
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  image: string; // emoji placeholder
  rating: Rating;
  ingredients: Ingredient[];
  alternatives: Alternative[];
  diyRecipeId?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    barcode: "3574661014647",
    name: "Gentle Skin Cleanser",
    brand: "Cetaphil",
    category: "Skincare",
    image: "🧴",
    rating: "caution",
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water used as the base solvent. Completely safe." },
      { name: "Cetyl Alcohol", risk: "safe", explanation: "A fatty alcohol derived from coconut oil. Used as an emollient and thickener. Generally safe for skin." },
      { name: "Propylene Glycol", risk: "concern", explanation: "A synthetic humectant. Can cause skin irritation in sensitive individuals. Also used in antifreeze, though the cosmetic grade is different." },
      { name: "Sodium Lauryl Sulfate", risk: "toxic", explanation: "A harsh surfactant that strips natural oils. Known skin irritant that can disrupt the skin barrier. Linked to contact dermatitis." },
      { name: "Stearyl Alcohol", risk: "safe", explanation: "A natural fatty alcohol. Acts as an emollient and texture enhancer. Well-tolerated by most skin types." },
      { name: "Methylparaben", risk: "toxic", explanation: "A preservative that mimics estrogen. Potential endocrine disruptor. Found in breast tumor tissue in some studies." },
      { name: "Propylparaben", risk: "toxic", explanation: "Another paraben preservative with potential endocrine-disrupting properties. Banned or restricted in some countries." },
      { name: "Butylparaben", risk: "toxic", explanation: "The most potent paraben for estrogenic activity. Increasing evidence of hormone disruption." },
    ],
    alternatives: [
      { id: "a1", name: "Gentle Cleanser", brand: "CeraVe", price: "$14.99", rating: "clean", category: "Skincare", image: "🧼" },
      { id: "a2", name: "Calendula Cleanser", brand: "Weleda", price: "$18.99", rating: "clean", category: "Skincare", image: "🌿" },
      { id: "a3", name: "Oil Cleanser", brand: "DHC", price: "$28.00", rating: "clean", category: "Skincare", image: "✨" },
    ],
  },
  {
    id: "p2",
    barcode: "0018787764015",
    name: "Pure-Castile Liquid Soap",
    brand: "Dr. Bronner's",
    category: "Personal Care",
    image: "🧼",
    rating: "clean",
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water base. Completely safe." },
      { name: "Organic Coconut Oil", risk: "safe", explanation: "Cold-pressed organic coconut oil. Natural cleanser and moisturizer." },
      { name: "Potassium Hydroxide", risk: "safe", explanation: "Used to saponify oils into soap. Fully reacted in the final product, none remains." },
      { name: "Organic Olive Oil", risk: "safe", explanation: "Extra virgin olive oil. Provides gentle cleansing and moisturizing properties." },
      { name: "Organic Hemp Seed Oil", risk: "safe", explanation: "Rich in omega fatty acids. Nourishing for skin without clogging pores." },
      { name: "Organic Jojoba Oil", risk: "safe", explanation: "Mimics skin's natural sebum. Excellent moisturizer and skin protectant." },
      { name: "Citric Acid", risk: "safe", explanation: "Natural pH adjuster derived from citrus fruits. Helps maintain product stability." },
      { name: "Tocopherol (Vitamin E)", risk: "safe", explanation: "Natural antioxidant preservative. Also beneficial for skin health." },
    ],
    alternatives: [],
  },
  {
    id: "p3",
    barcode: "0037000849629",
    name: "Original Liquid Detergent",
    brand: "Tide",
    category: "Cleaning",
    image: "🫧",
    rating: "avoid",
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water base." },
      { name: "Linear Alkylbenzene Sulfonate", risk: "toxic", explanation: "A petroleum-derived surfactant. Toxic to aquatic life. Can cause skin and eye irritation." },
      { name: "Propylene Glycol", risk: "concern", explanation: "Synthetic solvent. Can cause allergic reactions in some people." },
      { name: "Ethanolamine", risk: "toxic", explanation: "Can form carcinogenic nitrosamines. Linked to liver and kidney damage with prolonged exposure." },
      { name: "Sodium Borate", risk: "toxic", explanation: "Borax derivative. Potential reproductive toxin. Banned in some consumer products in the EU." },
      { name: "Synthetic Fragrances", risk: "toxic", explanation: "Undisclosed blend of chemicals. Can contain phthalates and other hormone disruptors. Major source of indoor air pollution." },
      { name: "Optical Brighteners", risk: "concern", explanation: "Synthetic chemicals that make clothes appear whiter. Can cause skin irritation and are not biodegradable." },
      { name: "1,4-Dioxane (contaminant)", risk: "toxic", explanation: "A probable carcinogen found as a byproduct of the manufacturing process. Not listed on labels but often present." },
    ],
    alternatives: [
      { id: "a4", name: "Free & Clear Detergent", brand: "Seventh Generation", price: "$12.99", rating: "clean", category: "Cleaning", image: "🍃" },
      { id: "a5", name: "Laundry Sheets", brand: "Earth Breeze", price: "$15.99", rating: "clean", category: "Cleaning", image: "🌊" },
      { id: "a6", name: "Laundry Detergent", brand: "Branch Basics", price: "$49.00", rating: "clean", category: "Cleaning", image: "🌱" },
    ],
    diyRecipeId: "recipe-001",
  },
  {
    id: "p4",
    barcode: "0011111222334",
    name: "Moisturizing Body Lotion",
    brand: "Jergens",
    category: "Skincare",
    image: "🧴",
    rating: "caution",
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water base." },
      { name: "Glycerin", risk: "safe", explanation: "Natural humectant that draws moisture to the skin. Well-tolerated." },
      { name: "Cetyl Alcohol", risk: "safe", explanation: "Fatty alcohol emollient. Helps soften skin." },
      { name: "Mineral Oil", risk: "concern", explanation: "Petroleum-derived oil that sits on the skin surface. Can clog pores and may contain PAH contaminants." },
      { name: "Fragrance", risk: "toxic", explanation: "Undisclosed chemical blend. Can contain dozens of allergens and hormone disruptors." },
      { name: "DMDM Hydantoin", risk: "toxic", explanation: "A formaldehyde-releasing preservative. Formaldehyde is a known carcinogen." },
      { name: "Stearic Acid", risk: "safe", explanation: "Natural fatty acid found in shea butter. Safe emulsifier." },
    ],
    alternatives: [
      { id: "a7", name: "Body Lotion", brand: "Everyone", price: "$9.99", rating: "clean", category: "Skincare", image: "🌸" },
      { id: "a8", name: "Daily Moisturizer", brand: "Attitude", price: "$12.99", rating: "clean", category: "Skincare", image: "💧" },
    ],
  },
  {
    id: "p5",
    barcode: "0011111333445",
    name: "Whitening Toothpaste",
    brand: "Colgate",
    category: "Personal Care",
    image: "🦷",
    rating: "caution",
    ingredients: [
      { name: "Sodium Fluoride", risk: "safe", explanation: "Prevents tooth decay. The amount in toothpaste is safe when used as directed." },
      { name: "Hydrated Silica", risk: "safe", explanation: "Gentle abrasive for cleaning. Derived from sand." },
      { name: "Sorbitol", risk: "safe", explanation: "Sugar alcohol used as a sweetener. Safe for dental use." },
      { name: "Sodium Lauryl Sulfate", risk: "concern", explanation: "Foaming agent. Can cause mouth ulcers in susceptible individuals." },
      { name: "Triclosan", risk: "toxic", explanation: "Antibacterial agent linked to hormone disruption and antibiotic resistance. Banned from hand soaps by FDA but still in some toothpastes." },
      { name: "PVM/MA Copolymer", risk: "concern", explanation: "Synthetic polymer used to help ingredients stick to teeth. Limited safety data available." },
    ],
    alternatives: [
      { id: "a9", name: "Simply White Toothpaste", brand: "Tom's of Maine", price: "$5.99", rating: "clean", category: "Personal Care", image: "🪥" },
      { id: "a10", name: "Whitening Toothpaste", brand: "Hello", price: "$5.49", rating: "clean", category: "Personal Care", image: "😁" },
    ],
  },
  {
    id: "p6",
    barcode: "0011111444556",
    name: "Baby Shampoo",
    brand: "Johnson's",
    category: "Personal Care",
    image: "👶",
    rating: "caution",
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water base." },
      { name: "Cocamidopropyl Betaine", risk: "safe", explanation: "Gentle surfactant derived from coconut oil." },
      { name: "PEG-80 Sorbitan Laurate", risk: "concern", explanation: "Ethoxylated compound that may contain 1,4-dioxane contamination. A process byproduct concern." },
      { name: "Sodium Benzoate", risk: "safe", explanation: "Common food-grade preservative. Generally well-tolerated." },
      { name: "Fragrance", risk: "toxic", explanation: "Undisclosed chemical blend. Especially concerning in baby products as infant skin is more permeable." },
      { name: "Polyquaternium-10", risk: "concern", explanation: "Synthetic conditioning polymer. Limited long-term safety data." },
    ],
    alternatives: [
      { id: "a11", name: "Baby Wash & Shampoo", brand: "Burt's Bees Baby", price: "$9.99", rating: "clean", category: "Personal Care", image: "🐝" },
      { id: "a12", name: "Baby Shampoo", brand: "Earth Mama", price: "$11.99", rating: "clean", category: "Personal Care", image: "🌍" },
    ],
  },
  {
    id: "p7",
    barcode: "0011111555667",
    name: "All-Purpose Cleaner",
    brand: "Lysol",
    category: "Cleaning",
    image: "🧹",
    rating: "avoid",
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water base." },
      { name: "Alkyl Dimethyl Benzyl Ammonium Chloride", risk: "toxic", explanation: "Quaternary ammonium compound. Can cause respiratory irritation and asthma. Toxic to aquatic organisms." },
      { name: "Ethanolamine", risk: "toxic", explanation: "Can react to form carcinogenic nitrosamines. Respiratory and skin irritant." },
      { name: "Fragrance", risk: "toxic", explanation: "Undisclosed chemical blend. Source of volatile organic compounds (VOCs) that pollute indoor air." },
      { name: "Sodium Hydroxide", risk: "concern", explanation: "Caustic alkali. While neutralized in the formula, residue can irritate skin." },
    ],
    alternatives: [
      { id: "a13", name: "Multi-Surface Cleaner", brand: "Branch Basics", price: "$5.00", rating: "clean", category: "Cleaning", image: "🌿" },
      { id: "a14", name: "All-Purpose Cleaner", brand: "Mrs. Meyer's", price: "$4.99", rating: "clean", category: "Cleaning", image: "🌻" },
    ],
    diyRecipeId: "recipe-001",
  },
  {
    id: "p8",
    barcode: "0011111666778",
    name: "Antiperspirant Deodorant",
    brand: "Dove",
    category: "Personal Care",
    image: "🕊️",
    rating: "caution",
    ingredients: [
      { name: "Aluminum Zirconium Tetrachlorohydrex", risk: "toxic", explanation: "Active antiperspirant ingredient. Blocks sweat glands. Linked to breast cancer concerns and Alzheimer's, though evidence is debated." },
      { name: "Cyclopentasiloxane", risk: "concern", explanation: "Silicone-based emollient. Potential endocrine disruptor. Persistent environmental pollutant." },
      { name: "Stearyl Alcohol", risk: "safe", explanation: "Fatty alcohol emollient. Safe for skin." },
      { name: "Fragrance", risk: "toxic", explanation: "Undisclosed chemical blend applied near lymph nodes. Particular concern for hormone-sensitive areas." },
      { name: "Sunflower Seed Oil", risk: "safe", explanation: "Natural plant oil. Nourishing and safe for skin." },
    ],
    alternatives: [
      { id: "a15", name: "Charcoal Deodorant", brand: "Native", price: "$12.99", rating: "clean", category: "Personal Care", image: "🖤" },
      { id: "a16", name: "Sensitive Deodorant", brand: "Each & Every", price: "$15.99", rating: "clean", category: "Personal Care", image: "🤍" },
    ],
  },
  {
    id: "p9",
    barcode: "0011111777889",
    name: "Sunscreen SPF 50",
    brand: "Banana Boat",
    category: "Skincare",
    image: "☀️",
    rating: "avoid",
    ingredients: [
      { name: "Avobenzone", risk: "concern", explanation: "Chemical UV filter. Breaks down in sunlight and can generate free radicals. Absorbed into bloodstream." },
      { name: "Homosalate", risk: "toxic", explanation: "Chemical UV filter and potential endocrine disruptor. Accumulates in the body faster than it can be eliminated." },
      { name: "Octisalate", risk: "concern", explanation: "UV filter that enhances penetration of other chemicals through the skin." },
      { name: "Octocrylene", risk: "toxic", explanation: "Chemical UV filter that breaks down into benzophenone, a suspected carcinogen. Harmful to coral reefs." },
      { name: "Oxybenzone", risk: "toxic", explanation: "The most concerning chemical sunscreen ingredient. Hormone disruptor, coral reef killer, detected in breast milk." },
      { name: "Retinyl Palmitate", risk: "concern", explanation: "Form of vitamin A that may accelerate skin damage and tumor growth when exposed to sunlight." },
    ],
    alternatives: [
      { id: "a17", name: "Mineral Sunscreen SPF 50", brand: "Thinkbaby", price: "$14.99", rating: "clean", category: "Skincare", image: "🛡️" },
      { id: "a18", name: "Sheer Mineral Sunscreen", brand: "Badger", price: "$18.99", rating: "clean", category: "Skincare", image: "🌞" },
    ],
  },
  {
    id: "p10",
    barcode: "0011111888990",
    name: "Hair Styling Gel",
    brand: "Garnier Fructis",
    category: "Personal Care",
    image: "💇",
    rating: "caution",
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water base." },
      { name: "VP/VA Copolymer", risk: "concern", explanation: "Synthetic film-forming polymer. Can release formaldehyde when heated." },
      { name: "Carbomer", risk: "safe", explanation: "Synthetic thickener. Generally considered safe for topical use." },
      { name: "PEG-60 Hydrogenated Castor Oil", risk: "concern", explanation: "Ethoxylated compound with potential 1,4-dioxane contamination." },
      { name: "Fragrance", risk: "toxic", explanation: "Undisclosed chemical blend. Common source of allergens and hormone disruptors." },
      { name: "DMDM Hydantoin", risk: "toxic", explanation: "Formaldehyde-releasing preservative. Known allergen and potential carcinogen." },
    ],
    alternatives: [
      { id: "a19", name: "Styling Gel", brand: "Giovanni", price: "$8.99", rating: "clean", category: "Personal Care", image: "💚" },
    ],
  },
  {
    id: "p11",
    barcode: "0011111999001",
    name: "Dish Soap",
    brand: "Dawn",
    category: "Cleaning",
    image: "🍽️",
    rating: "caution",
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water base." },
      { name: "Sodium Lauryl Sulfate", risk: "concern", explanation: "Primary surfactant. Can be drying and irritating to skin with frequent use." },
      { name: "Sodium Laureth Sulfate", risk: "concern", explanation: "Ethoxylated surfactant. May contain traces of 1,4-dioxane." },
      { name: "Lauramine Oxide", risk: "safe", explanation: "Mild surfactant and foam booster. Generally well-tolerated." },
      { name: "Methylisothiazolinone", risk: "toxic", explanation: "Preservative and known skin sensitizer. Restricted in leave-on products in the EU due to allergy concerns." },
      { name: "Fragrance", risk: "toxic", explanation: "Undisclosed chemical blend. Lingers on dishes and can transfer to food." },
    ],
    alternatives: [
      { id: "a20", name: "Dish Soap", brand: "Seventh Generation", price: "$4.49", rating: "clean", category: "Cleaning", image: "🌿" },
    ],
    diyRecipeId: "recipe-007",
  },
  {
    id: "p12",
    barcode: "0011112000112",
    name: "Fabric Softener Sheets",
    brand: "Bounce",
    category: "Cleaning",
    image: "👕",
    rating: "avoid",
    ingredients: [
      { name: "Dipalmitoylethyl Hydroxyethylmonium", risk: "concern", explanation: "Quaternary ammonium compound used for softening. Can cause skin irritation." },
      { name: "Fatty Acids", risk: "safe", explanation: "Used for softening and reducing static. Generally safe." },
      { name: "Fragrance", risk: "toxic", explanation: "Dryer sheets are one of the biggest sources of indoor air pollution. Chemicals are heated and vaporized onto clothes." },
      { name: "Glutaral", risk: "toxic", explanation: "Also known as glutaraldehyde. Strong irritant and sensitizer. Toxic to aquatic organisms." },
      { name: "Benzyl Acetate", risk: "toxic", explanation: "Linked to pancreatic cancer in animal studies. A volatile fragrance compound." },
    ],
    alternatives: [
      { id: "a21", name: "Wool Dryer Balls", brand: "Friendsheep", price: "$16.99", rating: "clean", category: "Cleaning", image: "🐑" },
      { id: "a22", name: "Fabric Softener", brand: "Attitude", price: "$8.99", rating: "clean", category: "Cleaning", image: "🌸" },
    ],
  },
  {
    id: "p13",
    barcode: "0011112111223",
    name: "Hand Soap Refill",
    brand: "Method",
    category: "Personal Care",
    image: "🫧",
    rating: "clean",
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water base." },
      { name: "Sodium Lauryl Sulfate (plant-derived)", risk: "safe", explanation: "Plant-derived surfactant. Gentler than petroleum-derived version." },
      { name: "Cocamidopropyl Betaine", risk: "safe", explanation: "Gentle coconut-derived surfactant." },
      { name: "Sodium Chloride", risk: "safe", explanation: "Table salt. Used as a thickener." },
      { name: "Methylisothiazolinone", risk: "concern", explanation: "Preservative that can be a skin sensitizer, though present in very low concentrations in this rinse-off product." },
      { name: "Aloe Vera Extract", risk: "safe", explanation: "Natural plant extract with soothing properties." },
    ],
    alternatives: [],
  },
  {
    id: "p14",
    barcode: "0011112222334",
    name: "Lip Balm",
    brand: "EOS",
    category: "Skincare",
    image: "👄",
    rating: "clean",
    ingredients: [
      { name: "Beeswax", risk: "safe", explanation: "Natural wax that provides a protective barrier. Locks in moisture." },
      { name: "Coconut Oil", risk: "safe", explanation: "Natural emollient with antimicrobial properties." },
      { name: "Jojoba Seed Oil", risk: "safe", explanation: "Plant oil that closely mimics skin's natural oils." },
      { name: "Shea Butter", risk: "safe", explanation: "Rich natural moisturizer with anti-inflammatory properties." },
      { name: "Stevia Leaf Extract", risk: "safe", explanation: "Natural sweetener. Safe for lip products." },
      { name: "Tocopherol (Vitamin E)", risk: "safe", explanation: "Natural antioxidant that protects lips from environmental damage." },
    ],
    alternatives: [],
  },
  {
    id: "p15",
    barcode: "0011112333445",
    name: "Air Freshener Spray",
    brand: "Febreze",
    category: "Home",
    image: "🌬️",
    rating: "avoid",
    ingredients: [
      { name: "Nitrogen", risk: "safe", explanation: "Propellant gas. Inert and safe." },
      { name: "Alcohol", risk: "safe", explanation: "Solvent that helps disperse the fragrance. Evaporates quickly." },
      { name: "Hydroxypropyl Beta-Cyclodextrin", risk: "safe", explanation: "Sugar molecule that traps odors. The actual odor-elimination technology." },
      { name: "Fragrance", risk: "toxic", explanation: "Can contain dozens of undisclosed chemicals including phthalates and synthetic musks. Major indoor air pollutant." },
      { name: "Didecyl Dimethyl Ammonium Chloride", risk: "toxic", explanation: "Quaternary ammonium disinfectant. Respiratory irritant linked to asthma development." },
      { name: "Benzisothiazolinone", risk: "toxic", explanation: "Biocide and strong contact allergen. Can cause severe skin reactions." },
    ],
    alternatives: [
      { id: "a23", name: "Essential Oil Diffuser", brand: "Vitruvi", price: "$89.00", rating: "clean", category: "Home", image: "🪴" },
      { id: "a24", name: "Room Spray", brand: "Aesop", price: "$55.00", rating: "clean", category: "Home", image: "🌿" },
    ],
    diyRecipeId: "recipe-023",
  },
  {
    id: "p16",
    barcode: "0011112444556",
    name: "Protein Bar",
    brand: "Clif Bar",
    category: "Food",
    image: "🍫",
    rating: "caution",
    ingredients: [
      { name: "Organic Brown Rice Syrup", risk: "concern", explanation: "High glycemic sweetener. Can contain trace arsenic from rice." },
      { name: "Organic Rolled Oats", risk: "safe", explanation: "Whole grain source of fiber and nutrients." },
      { name: "Soy Protein Isolate", risk: "concern", explanation: "Highly processed soy ingredient. May contain hexane residues from extraction process." },
      { name: "Organic Cane Syrup", risk: "safe", explanation: "Organic sugar source. Better than refined sugar but still added sugar." },
      { name: "Natural Flavors", risk: "concern", explanation: "Catch-all term that can include processed chemicals derived from natural sources. Lacks transparency." },
      { name: "Soy Lecithin", risk: "safe", explanation: "Emulsifier derived from soybeans. Generally recognized as safe." },
    ],
    alternatives: [
      { id: "a25", name: "Perfect Bar", brand: "Perfect Bar", price: "$2.99", rating: "clean", category: "Food", image: "💪" },
      { id: "a26", name: "Larabar", brand: "Larabar", price: "$1.69", rating: "clean", category: "Food", image: "🌰" },
    ],
  },
  {
    id: "p17",
    barcode: "0011112555667",
    name: "Sparkling Water",
    brand: "LaCroix",
    category: "Food",
    image: "💧",
    rating: "clean",
    ingredients: [
      { name: "Carbonated Water", risk: "safe", explanation: "Water infused with carbon dioxide. Completely safe." },
      { name: "Natural Flavors", risk: "safe", explanation: "In LaCroix's case, derived from essential oils of the named fruit. Minimal processing." },
    ],
    alternatives: [],
  },
  {
    id: "p18",
    barcode: "0011112666778",
    name: "Instant Ramen",
    brand: "Maruchan",
    category: "Food",
    image: "🍜",
    rating: "avoid",
    ingredients: [
      { name: "Enriched Wheat Flour", risk: "safe", explanation: "Refined wheat flour with added vitamins. Basic noodle ingredient." },
      { name: "Palm Oil", risk: "concern", explanation: "Used to fry the noodles. Linked to deforestation and high in saturated fat." },
      { name: "Monosodium Glutamate (MSG)", risk: "concern", explanation: "Flavor enhancer. Generally safe but can cause sensitivity reactions in some people." },
      { name: "TBHQ", risk: "toxic", explanation: "Synthetic preservative derived from butane. Can cause nausea, delirium, and tinnitus. May impair immune response." },
      { name: "Sodium (2180mg)", risk: "toxic", explanation: "Extremely high sodium content (91% daily value). Contributes to hypertension and heart disease." },
      { name: "Caramel Color", risk: "concern", explanation: "May contain 4-MEI, a potential carcinogen formed during manufacturing." },
    ],
    alternatives: [
      { id: "a27", name: "Organic Ramen", brand: "Lotus Foods", price: "$3.99", rating: "clean", category: "Food", image: "🍜" },
    ],
  },
  {
    id: "p19",
    barcode: "0011112777889",
    name: "Makeup Remover Wipes",
    brand: "Neutrogena",
    category: "Skincare",
    image: "💄",
    rating: "avoid",
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water base." },
      { name: "Isoceteth-20", risk: "concern", explanation: "Ethoxylated surfactant. Potential 1,4-dioxane contamination." },
      { name: "Phenoxyethanol", risk: "concern", explanation: "Preservative. Can cause skin irritation and is an eye irritant." },
      { name: "BHT", risk: "toxic", explanation: "Synthetic antioxidant preservative. Potential endocrine disruptor and suspected carcinogen." },
      { name: "Fragrance", risk: "toxic", explanation: "Undisclosed chemical blend on a product that stays on skin (not rinsed off). Higher exposure risk." },
      { name: "Iodopropynyl Butylcarbamate", risk: "toxic", explanation: "Preservative that releases iodine. Restricted in the EU for leave-on products. Potential thyroid disruptor." },
    ],
    alternatives: [
      { id: "a28", name: "Cleansing Balm", brand: "Farmacy", price: "$34.00", rating: "clean", category: "Skincare", image: "🌾" },
      { id: "a29", name: "Micellar Water", brand: "Bioderma", price: "$14.99", rating: "clean", category: "Skincare", image: "💦" },
    ],
  },
  {
    id: "p20",
    barcode: "0011112888990",
    name: "Candle (Vanilla)",
    brand: "Yankee Candle",
    category: "Home",
    image: "🕯️",
    rating: "avoid",
    ingredients: [
      { name: "Paraffin Wax", risk: "toxic", explanation: "Petroleum-derived wax that releases toluene and benzene (known carcinogens) when burned." },
      { name: "Synthetic Fragrance Oils", risk: "toxic", explanation: "When heated, synthetic fragrances release VOCs and particulate matter similar to diesel exhaust." },
      { name: "Zinc Core Wick", risk: "concern", explanation: "Can release trace heavy metals when burning. Lead-free but still a concern." },
      { name: "Dye", risk: "concern", explanation: "Synthetic dyes that release additional chemicals when burned." },
    ],
    alternatives: [
      { id: "a30", name: "Soy Candle", brand: "P.F. Candle Co.", price: "$22.00", rating: "clean", category: "Home", image: "🌱" },
      { id: "a31", name: "Beeswax Candle", brand: "Bluecorn", price: "$28.00", rating: "clean", category: "Home", image: "🐝" },
    ],
    diyRecipeId: "recipe-022",
  },
  {
    id: "p21",
    barcode: "0011113000112",
    name: "Shea Butter Body Cream",
    brand: "L'Occitane",
    category: "Skincare",
    image: "✨",
    rating: "clean",
    ingredients: [
      { name: "Shea Butter (25%)", risk: "safe", explanation: "High concentration of pure shea butter. Rich in vitamins A, E, and F." },
      { name: "Honey Extract", risk: "safe", explanation: "Natural humectant and antimicrobial." },
      { name: "Almond Oil", risk: "safe", explanation: "Lightweight natural oil rich in vitamin E." },
      { name: "Coconut Oil", risk: "safe", explanation: "Natural moisturizer with antimicrobial properties." },
      { name: "Tocopherol", risk: "safe", explanation: "Natural vitamin E. Antioxidant preservative." },
    ],
    alternatives: [],
  },
  {
    id: "p22",
    barcode: "0011113111223",
    name: "Organic Green Tea",
    brand: "Traditional Medicinals",
    category: "Food",
    image: "🍵",
    rating: "clean",
    ingredients: [
      { name: "Organic Green Tea Leaves", risk: "safe", explanation: "Certified organic tea. Rich in antioxidants." },
      { name: "Organic Lemongrass", risk: "safe", explanation: "Natural herb with calming properties." },
    ],
    alternatives: [],
  },
  {
    id: "p23",
    barcode: "0011113222334",
    name: "Fast Fashion T-Shirt",
    brand: "Shein",
    category: "Clothing",
    image: "👕",
    rating: "avoid",
    ingredients: [
      { name: "Polyester (100%)", risk: "toxic", explanation: "Petroleum-derived synthetic fabric. Sheds microplastics with every wash that pollute waterways." },
      { name: "Azo Dyes", risk: "toxic", explanation: "Cheap textile dyes that can break down into carcinogenic aromatic amines. Banned in the EU for direct skin contact." },
      { name: "Formaldehyde Resin", risk: "toxic", explanation: "Used for wrinkle resistance. Known carcinogen and skin sensitizer. Off-gasses from new clothes." },
      { name: "PFAS (Water-repellent finish)", risk: "toxic", explanation: "Forever chemicals used for stain resistance. Accumulate in the body and environment indefinitely." },
    ],
    alternatives: [
      { id: "a32", name: "Organic Cotton Tee", brand: "Pact", price: "$25.00", rating: "clean", category: "Clothing", image: "🌿" },
      { id: "a33", name: "Hemp Blend Tee", brand: "Patagonia", price: "$45.00", rating: "clean", category: "Clothing", image: "🌱" },
    ],
  },
  {
    id: "p24",
    barcode: "0011113333445",
    name: "Organic Cotton Hoodie",
    brand: "Patagonia",
    category: "Clothing",
    image: "🧥",
    rating: "clean",
    ingredients: [
      { name: "Organic Cotton (100%)", risk: "safe", explanation: "GOTS-certified organic cotton. No pesticides or synthetic fertilizers used in farming." },
      { name: "Natural Dyes", risk: "safe", explanation: "Plant-based or low-impact dyes free from heavy metals and azo compounds." },
      { name: "Fair Trade Certified", risk: "safe", explanation: "Ethically manufactured with fair wages and safe working conditions." },
    ],
    alternatives: [],
  },
  {
    id: "p25",
    barcode: "0011113444556",
    name: "Athleisure Leggings",
    brand: "Lululemon",
    category: "Clothing",
    image: "👖",
    rating: "caution",
    ingredients: [
      { name: "Nylon (71%)", risk: "concern", explanation: "Synthetic fiber derived from petroleum. Sheds microplastics but more durable than polyester." },
      { name: "Lycra/Elastane (29%)", risk: "concern", explanation: "Synthetic stretch fiber. Not biodegradable but necessary for athletic performance." },
      { name: "Antimicrobial Treatment", risk: "concern", explanation: "Silver nanoparticles or synthetic antimicrobials. Environmental impact of nanoparticles is poorly understood." },
    ],
    alternatives: [
      { id: "a34", name: "Organic Cotton Leggings", brand: "Girlfriend Collective", price: "$68.00", rating: "clean", category: "Clothing", image: "♻️" },
    ],
  },
  {
    id: "p26",
    barcode: "0011113555667",
    name: "Bamboo Sheet Set",
    brand: "Cariloha",
    category: "Home",
    image: "🛏️",
    rating: "clean",
    ingredients: [
      { name: "Bamboo Viscose (100%)", risk: "safe", explanation: "Sustainably grown bamboo processed into soft fabric. Naturally antimicrobial." },
      { name: "OEKO-TEX Certified", risk: "safe", explanation: "Tested and certified free from harmful substances." },
    ],
    alternatives: [],
  },
  {
    id: "p27",
    barcode: "0011113666778",
    name: "Non-Stick Frying Pan",
    brand: "Tefal",
    category: "Home",
    image: "🍳",
    rating: "avoid",
    ingredients: [
      { name: "PTFE (Teflon) Coating", risk: "toxic", explanation: "Releases toxic fumes when overheated above 500F. PFAS-related compound that persists in the environment." },
      { name: "PFOA (manufacturing residue)", risk: "toxic", explanation: "A forever chemical used in manufacturing. Linked to cancer, thyroid disease, and reproductive issues." },
    ],
    alternatives: [
      { id: "a35", name: "Cast Iron Skillet", brand: "Lodge", price: "$29.99", rating: "clean", category: "Home", image: "🫕" },
      { id: "a36", name: "Ceramic Non-Stick Pan", brand: "GreenPan", price: "$49.99", rating: "clean", category: "Home", image: "🥘" },
    ],
  },
  {
    id: "p28",
    barcode: "0011113777889",
    name: "Organic Almond Butter",
    brand: "Justin's",
    category: "Food",
    image: "🥜",
    rating: "clean",
    ingredients: [
      { name: "Dry Roasted Almonds", risk: "safe", explanation: "Organic almonds. Rich in healthy fats, protein, and vitamin E." },
      { name: "Palm Oil (Organic)", risk: "concern", explanation: "Used for texture. While organic, palm oil farming contributes to deforestation." },
    ],
    alternatives: [],
  },
  {
    id: "p29",
    barcode: "0011113888990",
    name: "Energy Drink",
    brand: "Red Bull",
    category: "Food",
    image: "⚡",
    rating: "avoid",
    ingredients: [
      { name: "Sucrose & Glucose", risk: "concern", explanation: "27g of sugar per can. Contributes to blood sugar spikes and crashes." },
      { name: "Taurine", risk: "safe", explanation: "Amino acid naturally found in the body. Generally safe at these levels." },
      { name: "Caffeine (80mg)", risk: "safe", explanation: "About the same as a cup of coffee. Safe in moderation." },
      { name: "Artificial Colors", risk: "toxic", explanation: "Synthetic dyes linked to hyperactivity in children and potential carcinogenic properties." },
      { name: "Sodium Benzoate", risk: "concern", explanation: "Preservative that can form benzene (a carcinogen) when combined with vitamin C." },
      { name: "Niacinamide (B3)", risk: "safe", explanation: "B vitamin. Safe at supplemental levels." },
    ],
    alternatives: [
      { id: "a37", name: "Organic Matcha Latte", brand: "Matchabar", price: "$3.99", rating: "clean", category: "Food", image: "🍵" },
    ],
  },
  {
    id: "p30",
    barcode: "0011114000112",
    name: "Stain Remover Spray",
    brand: "OxiClean",
    category: "Cleaning",
    image: "✨",
    rating: "caution",
    ingredients: [
      { name: "Sodium Percarbonate", risk: "safe", explanation: "Oxygen-based bleach. Breaks down into soda ash and hydrogen peroxide. Eco-friendly." },
      { name: "Sodium Carbonate", risk: "safe", explanation: "Washing soda. Natural mineral compound." },
      { name: "Ethoxylated Alcohol", risk: "concern", explanation: "Surfactant that may contain 1,4-dioxane residues from ethoxylation process." },
      { name: "Fragrance", risk: "toxic", explanation: "Undisclosed chemical blend added to cleaning product." },
    ],
    alternatives: [
      { id: "a38", name: "Oxygen Brightener", brand: "Biokleen", price: "$11.99", rating: "clean", category: "Cleaning", image: "🌿" },
    ],
  },
  {
    id: "p31",
    barcode: "0011114111223",
    name: "Yoga Mat",
    brand: "Gaiam",
    category: "Home",
    image: "🧘",
    rating: "caution",
    ingredients: [
      { name: "PVC (Polyvinyl Chloride)", risk: "toxic", explanation: "Contains chlorine and may release dioxins. Often contains phthalate plasticizers." },
      { name: "Phthalate Plasticizers", risk: "toxic", explanation: "Used to make PVC flexible. Known endocrine disruptors linked to reproductive issues." },
      { name: "Latex-free", risk: "safe", explanation: "No natural rubber latex, reducing allergy concerns." },
    ],
    alternatives: [
      { id: "a39", name: "Natural Rubber Yoga Mat", brand: "Manduka", price: "$90.00", rating: "clean", category: "Home", image: "🌿" },
      { id: "a40", name: "Cork Yoga Mat", brand: "Yoloha", price: "$109.00", rating: "clean", category: "Home", image: "🪵" },
    ],
  },
  {
    id: "p32",
    barcode: "0011114222334",
    name: "Face Serum",
    brand: "The Ordinary",
    category: "Skincare",
    image: "💧",
    rating: "clean",
    ingredients: [
      { name: "Hyaluronic Acid", risk: "safe", explanation: "Naturally occurring molecule. Excellent hydrator that holds 1000x its weight in water." },
      { name: "Niacinamide", risk: "safe", explanation: "Vitamin B3. Reduces pores, brightens skin, and strengthens skin barrier." },
      { name: "Pentylene Glycol", risk: "safe", explanation: "Plant-derived moisturizer and solvent. Well-tolerated by most skin types." },
      { name: "Sodium Hyaluronate", risk: "safe", explanation: "Smaller form of hyaluronic acid that penetrates deeper into skin." },
    ],
    alternatives: [],
  },
];

// Helper to find a product by barcode
export function findProductByBarcode(barcode: string): Product | undefined {
  return PRODUCTS.find((p) => p.barcode === barcode);
}

export type ProductCategory = "Food" | "Skincare" | "Cleaning" | "Personal Care" | "Clothing" | "Home";

export const CATEGORIES: { name: ProductCategory; icon: string }[] = [
  { name: "Food", icon: "🥑" },
  { name: "Skincare", icon: "🧴" },
  { name: "Cleaning", icon: "🧹" },
  { name: "Personal Care", icon: "🪥" },
  { name: "Clothing", icon: "👕" },
  { name: "Home", icon: "🏠" },
];

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

// Helper to get a default product (used when barcode isn't in our database)
export function getDefaultProduct(barcode: string): Product {
  return {
    id: `unknown-${barcode}`,
    barcode,
    name: "Unknown Product",
    brand: "Not in database",
    category: "Unknown",
    image: "📦",
    rating: "caution",
    ingredients: [
      { name: "Unable to identify ingredients", risk: "concern", explanation: "This product is not yet in our database. Try scanning the ingredient label directly for a detailed analysis." },
    ],
    alternatives: [],
  };
}
