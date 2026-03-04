-- Crunchy App Seed Data
-- Description: Realistic seed data for products, recipes, and sample community posts
-- Note: User-specific data (scans, saved_items, quiz_results) should be created at runtime

-- =============================================================================
-- RECIPES (insert first since products reference them)
-- =============================================================================
INSERT INTO recipes (id, title, category, image, difficulty, time_minutes, cost_estimate, store_bought_cost, description, tips, made_it_count) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'All-Purpose Citrus Cleaner', 'Cleaning', '🍊', 'Easy', 10, '$3.00', '$6.99', 'A powerful all-purpose cleaner made with citrus peels and vinegar. Perfect for countertops, sinks, and general cleaning.', ARRAY['Let the citrus peels steep longer for a stronger scent', 'Works great on grease stains', 'Store in a cool dark place for up to 6 months'], 342),
  ('a0000000-0000-0000-0000-000000000002', 'Lavender Linen Spray', 'Home', '💜', 'Easy', 5, '$2.50', '$12.99', 'A calming linen spray made with pure lavender essential oil. Spray on pillows, sheets, and curtains.', ARRAY['Use distilled water for longer shelf life', 'Shake before each use', 'Add a few drops of chamomile for extra relaxation'], 189),
  ('a0000000-0000-0000-0000-000000000003', 'Honey Oat Face Mask', 'Skincare', '🍯', 'Easy', 15, '$1.50', '$15.99', 'A gentle exfoliating face mask with raw honey and colloidal oatmeal. Soothes and brightens skin naturally.', ARRAY['Use raw, unprocessed honey for best results', 'Leave on for 15-20 minutes', 'Rinse with lukewarm water'], 567),
  ('a0000000-0000-0000-0000-000000000004', 'Tea Tree Acne Spot Treatment', 'Skincare', '🌿', 'Easy', 5, '$4.00', '$14.99', 'A targeted spot treatment using tea tree oil diluted in jojoba oil. Fights blemishes without harsh chemicals.', ARRAY['Always dilute tea tree oil - never apply pure', 'Do a patch test first', 'Apply with a clean cotton swab'], 423),
  ('a0000000-0000-0000-0000-000000000005', 'Beeswax Lip Balm', 'Personal Care', '🐝', 'Medium', 30, '$5.00', '$8.99', 'Creamy lip balm made with beeswax, coconut oil, and shea butter. Keeps lips moisturized all day.', ARRAY['Melt ingredients slowly on low heat', 'Add essential oils after removing from heat', 'Pour into tins or tubes quickly before it sets'], 298),
  ('a0000000-0000-0000-0000-000000000006', 'Apple Cider Vinegar Hair Rinse', 'Haircare', '🍎', 'Easy', 5, '$1.00', '$12.99', 'A clarifying hair rinse that removes product buildup and restores natural shine. Use after shampooing.', ARRAY['Start with a weaker solution and adjust', 'The vinegar smell dissipates when hair dries', 'Use once a week for best results'], 445),
  ('a0000000-0000-0000-0000-000000000007', 'DIY Dish Soap', 'Cleaning', '🍽️', 'Easy', 10, '$2.00', '$5.99', 'A gentle yet effective dish soap made with castile soap and essential oils. Cuts grease without harsh chemicals.', ARRAY['Add more castile soap for extra grease-cutting power', 'Lemon essential oil is best for dishes', 'Shake before each use'], 234),
  ('a0000000-0000-0000-0000-000000000008', 'Coconut Oil Body Scrub', 'Skincare', '🥥', 'Easy', 10, '$4.00', '$18.99', 'An exfoliating body scrub with coconut oil and brown sugar. Leaves skin silky smooth and moisturized.', ARRAY['Use in the shower for easy cleanup', 'Be careful - coconut oil can make the tub slippery', 'Store at room temperature'], 512),
  ('a0000000-0000-0000-0000-000000000009', 'Natural Deodorant', 'Personal Care', '🌸', 'Medium', 20, '$3.50', '$11.99', 'An aluminum-free deodorant made with coconut oil, baking soda, and arrowroot powder. Keeps you fresh naturally.', ARRAY['If sensitive to baking soda, reduce the amount', 'Add shea butter for a creamier texture', 'Allow 1-2 weeks for your body to adjust from conventional deodorant'], 367),
  ('a0000000-0000-0000-0000-000000000010', 'Rosemary Mint Shampoo Bar', 'Haircare', '🌿', 'Hard', 60, '$6.00', '$14.99', 'A solid shampoo bar that lathers beautifully and leaves hair clean and refreshed. Zero plastic waste.', ARRAY['Lather in hands first, then apply to hair', 'Store on a well-draining soap dish', 'Let the bar cure for 4-6 weeks for best results'], 178),
  ('a0000000-0000-0000-0000-000000000011', 'Bathroom Tile Scrub', 'Cleaning', '🫧', 'Easy', 10, '$2.00', '$7.49', 'A non-toxic bathroom scrub using baking soda and essential oils. Tackles soap scum and mildew.', ARRAY['Let it sit for 10 minutes on tough stains', 'Tea tree oil adds antimicrobial properties', 'Use a stiff brush for grout lines'], 289),
  ('a0000000-0000-0000-0000-000000000012', 'Argan Oil Hair Serum', 'Haircare', '✨', 'Easy', 5, '$8.00', '$24.99', 'A lightweight hair serum with argan oil and vitamin E. Tames frizz and adds shine without weighing hair down.', ARRAY['A little goes a long way - start with 2-3 drops', 'Apply to damp hair for best absorption', 'Focus on ends, avoid roots'], 334),
  ('a0000000-0000-0000-0000-000000000013', 'Oatmeal Bath Soak', 'Skincare', '🛁', 'Easy', 5, '$2.00', '$9.99', 'A soothing bath soak with colloidal oatmeal and lavender. Perfect for dry, itchy, or irritated skin.', ARRAY['Grind oats to a fine powder for best results', 'Soak for 15-20 minutes', 'Pat skin dry gently after the bath'], 201),
  ('a0000000-0000-0000-0000-000000000014', 'Fabric Softener Alternative', 'Home', '👕', 'Easy', 5, '$1.50', '$8.99', 'A natural fabric softener using white vinegar and essential oils. Softens clothes without chemical residue.', ARRAY['Add during the rinse cycle', 'The vinegar smell disappears in the dryer', 'Use wool dryer balls for extra softening'], 156),
  ('a0000000-0000-0000-0000-000000000015', 'Whipped Body Butter', 'Personal Care', '🧈', 'Medium', 25, '$7.00', '$22.99', 'A luxuriously thick body butter with shea butter, cocoa butter, and essential oils. Deeply moisturizing.', ARRAY['Whip with a hand mixer for fluffy texture', 'Store in a cool place to prevent melting', 'A little goes a long way'], 443),
  ('a0000000-0000-0000-0000-000000000016', 'Yoga Mat Cleaner', 'Home', '🧘', 'Easy', 5, '$2.00', '$9.99', 'A gentle yoga mat spray with witch hazel, tea tree, and lavender. Keeps your mat fresh and bacteria-free.', ARRAY['Spray and wipe after each use', 'Let air dry completely', 'Witch hazel is a natural disinfectant'], 198),
  ('a0000000-0000-0000-0000-000000000017', 'Avocado Hair Mask', 'Haircare', '🥑', 'Easy', 15, '$3.00', '$16.99', 'A deeply nourishing hair mask with ripe avocado, olive oil, and honey. Restores moisture to dry, damaged hair.', ARRAY['Use a very ripe avocado for smoothest texture', 'Blend thoroughly to avoid chunks', 'Cover hair with a shower cap while masking'], 267),
  ('a0000000-0000-0000-0000-000000000018', 'Glass Cleaner', 'Cleaning', '🪟', 'Easy', 5, '$1.50', '$4.99', 'A streak-free glass cleaner using white vinegar and rubbing alcohol. Works on windows, mirrors, and glass surfaces.', ARRAY['Use newspaper for a streak-free finish', 'Clean on a cloudy day to prevent quick drying', 'Add cornstarch for extra shine'], 312),
  ('a0000000-0000-0000-0000-000000000019', 'Sugar Scrub Cubes', 'Personal Care', '🧊', 'Medium', 30, '$4.00', '$15.99', 'Solid sugar scrub cubes that foam and exfoliate. Grab one in the shower for easy, mess-free exfoliation.', ARRAY['Melt and pour soap base works best', 'Add dried herbs for extra luxury', 'Store in an airtight container'], 178),
  ('a0000000-0000-0000-0000-000000000020', 'Room Spray', 'Home', '🌺', 'Easy', 5, '$3.00', '$11.99', 'A natural room spray using essential oils and witch hazel. Freshens any space without synthetic fragrances.', ARRAY['Combine complementary oils like lavender + eucalyptus', 'Shake before each use', 'Avoid spraying on fabrics that may stain'], 223),
  ('a0000000-0000-0000-0000-000000000021', 'Dry Shampoo Powder', 'Haircare', '💆', 'Easy', 5, '$3.00', '$10.99', 'A natural dry shampoo using arrowroot powder and cocoa powder. Absorbs oil and adds volume between washes.', ARRAY['Adjust cocoa powder ratio for your hair color', 'Apply with a makeup brush for even distribution', 'Let it sit for 2 minutes before brushing through'], 389),
  ('a0000000-0000-0000-0000-000000000022', 'Toilet Bowl Cleaner', 'Cleaning', '🚽', 'Easy', 10, '$2.00', '$5.99', 'An effective toilet bowl cleaner using baking soda, vinegar, and essential oils. Cleans and deodorizes naturally.', ARRAY['Sprinkle baking soda first, then spray vinegar', 'Let fizz for 15 minutes for tough stains', 'Tea tree oil adds disinfecting power'], 267),
  ('a0000000-0000-0000-0000-000000000023', 'Foaming Hand Soap', 'Cleaning', '🫧', 'Easy', 5, '$1.50', '$4.99', 'A gentle foaming hand soap using castile soap and moisturizing oils. Refill your foaming pump bottles forever.', ARRAY['Use a 1:4 ratio of castile soap to water', 'Any essential oil works - try seasonal scents', 'Save money by refilling existing foaming dispensers'], 445),
  ('a0000000-0000-0000-0000-000000000024', 'Turmeric Face Mask', 'Skincare', '💛', 'Easy', 10, '$2.00', '$13.99', 'A brightening face mask with turmeric, yogurt, and honey. Reduces inflammation and evens skin tone.', ARRAY['Turmeric can stain - use on a towel you don''t mind staining', 'Mix with full-fat yogurt for best results', 'Use 1-2 times per week'], 334),
  ('a0000000-0000-0000-0000-000000000025', 'Carpet Deodorizer', 'Home', '🏠', 'Easy', 5, '$2.00', '$6.99', 'A natural carpet deodorizer with baking soda and essential oils. Sprinkle, wait, and vacuum for fresh carpets.', ARRAY['Let sit for at least 30 minutes before vacuuming', 'Lavender and eucalyptus make a great combo', 'Store in a shaker container for easy application'], 145),
  ('a0000000-0000-0000-0000-000000000026', 'Clay Face Mask', 'Skincare', '🫙', 'Easy', 10, '$3.00', '$16.99', 'A deep-cleansing face mask with bentonite clay and apple cider vinegar. Draws out impurities and tightens pores.', ARRAY['Never mix clay in a metal bowl - use glass or plastic', 'Apply a thin even layer', 'Mist with water if it dries too tight'], 478),
  ('a0000000-0000-0000-0000-000000000027', 'Flaxseed Hair Gel', 'Haircare', '💧', 'Medium', 20, '$1.00', '$8.99', 'A natural hair gel made from boiled flaxseeds. Provides hold and definition for curly and wavy hair.', ARRAY['Strain through a fine mesh or old stocking', 'Refrigerate and use within 2 weeks', 'Add essential oils for fragrance'], 212),
  ('a0000000-0000-0000-0000-000000000028', 'Toothpaste', 'Personal Care', '🦷', 'Medium', 15, '$3.00', '$7.99', 'A natural toothpaste with coconut oil, baking soda, and peppermint. Whitens teeth and freshens breath.', ARRAY['Start with less baking soda if you have sensitive teeth', 'Store in a small jar', 'Add activated charcoal for extra whitening'], 356),
  ('a0000000-0000-0000-0000-000000000029', 'Stainless Steel Cleaner', 'Cleaning', '✨', 'Easy', 5, '$1.50', '$6.99', 'A streak-free stainless steel cleaner using olive oil and vinegar. Polishes and protects stainless surfaces.', ARRAY['Apply with a soft microfiber cloth', 'Wipe in the direction of the grain', 'Buff with a dry cloth for extra shine'], 198),
  ('a0000000-0000-0000-0000-000000000030', 'Muscle Soak Bath Salts', 'Personal Care', '🧂', 'Easy', 5, '$4.00', '$14.99', 'A mineral-rich bath salt blend with Epsom salt, dead sea salt, and essential oils. Soothes sore muscles.', ARRAY['Use 1-2 cups per bath', 'Soak for at least 20 minutes', 'Eucalyptus and peppermint are great for muscle relief'], 267),
  ('a0000000-0000-0000-0000-000000000031', 'Moisturizing Face Oil', 'Skincare', '🫒', 'Easy', 5, '$10.00', '$32.99', 'A custom face oil blend with rosehip, jojoba, and vitamin E oils. Nourishes skin and reduces fine lines.', ARRAY['Apply to damp skin for better absorption', 'Use at night for best results', 'Start with 3-4 drops and adjust'], 389)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- RECIPE INGREDIENTS (for first 10 recipes)
-- =============================================================================
INSERT INTO recipe_ingredients (recipe_id, name, quantity, note, sort_order) VALUES
  -- All-Purpose Citrus Cleaner
  ('a0000000-0000-0000-0000-000000000001', 'White vinegar', '2 cups', NULL, 1),
  ('a0000000-0000-0000-0000-000000000001', 'Citrus peels', '2 cups', 'orange, lemon, or grapefruit', 2),
  ('a0000000-0000-0000-0000-000000000001', 'Water', '1 cup', 'distilled preferred', 3),
  ('a0000000-0000-0000-0000-000000000001', 'Spray bottle', '1', 'glass preferred', 4),
  -- Lavender Linen Spray
  ('a0000000-0000-0000-0000-000000000002', 'Distilled water', '1 cup', NULL, 1),
  ('a0000000-0000-0000-0000-000000000002', 'Witch hazel', '2 tbsp', NULL, 2),
  ('a0000000-0000-0000-0000-000000000002', 'Lavender essential oil', '15 drops', 'pure essential oil', 3),
  -- Honey Oat Face Mask
  ('a0000000-0000-0000-0000-000000000003', 'Raw honey', '2 tbsp', 'unprocessed', 1),
  ('a0000000-0000-0000-0000-000000000003', 'Colloidal oatmeal', '1 tbsp', 'finely ground', 2),
  ('a0000000-0000-0000-0000-000000000003', 'Plain yogurt', '1 tbsp', 'full-fat preferred', 3),
  -- Tea Tree Spot Treatment
  ('a0000000-0000-0000-0000-000000000004', 'Tea tree essential oil', '5 drops', 'pure essential oil', 1),
  ('a0000000-0000-0000-0000-000000000004', 'Jojoba oil', '1 tbsp', NULL, 2),
  ('a0000000-0000-0000-0000-000000000004', 'Small glass bottle', '1', 'with dropper', 3),
  -- Beeswax Lip Balm
  ('a0000000-0000-0000-0000-000000000005', 'Beeswax pellets', '2 tbsp', NULL, 1),
  ('a0000000-0000-0000-0000-000000000005', 'Coconut oil', '2 tbsp', 'refined', 2),
  ('a0000000-0000-0000-0000-000000000005', 'Shea butter', '1 tbsp', 'unrefined', 3),
  ('a0000000-0000-0000-0000-000000000005', 'Peppermint essential oil', '10 drops', 'optional', 4),
  -- ACV Hair Rinse
  ('a0000000-0000-0000-0000-000000000006', 'Apple cider vinegar', '2 tbsp', 'raw, with the mother', 1),
  ('a0000000-0000-0000-0000-000000000006', 'Water', '1 cup', 'filtered', 2),
  ('a0000000-0000-0000-0000-000000000006', 'Rosemary essential oil', '3 drops', 'optional', 3),
  -- DIY Dish Soap
  ('a0000000-0000-0000-0000-000000000007', 'Castile soap', '1/4 cup', 'liquid, unscented', 1),
  ('a0000000-0000-0000-0000-000000000007', 'Water', '1 cup', 'distilled', 2),
  ('a0000000-0000-0000-0000-000000000007', 'Lemon essential oil', '10 drops', NULL, 3),
  ('a0000000-0000-0000-0000-000000000007', 'White vinegar', '1 tbsp', 'for extra grease cutting', 4),
  -- Coconut Oil Body Scrub
  ('a0000000-0000-0000-0000-000000000008', 'Coconut oil', '1/2 cup', 'softened', 1),
  ('a0000000-0000-0000-0000-000000000008', 'Brown sugar', '1 cup', NULL, 2),
  ('a0000000-0000-0000-0000-000000000008', 'Vanilla extract', '1 tsp', 'optional', 3),
  -- Natural Deodorant
  ('a0000000-0000-0000-0000-000000000009', 'Coconut oil', '3 tbsp', 'softened', 1),
  ('a0000000-0000-0000-0000-000000000009', 'Baking soda', '2 tbsp', NULL, 2),
  ('a0000000-0000-0000-0000-000000000009', 'Arrowroot powder', '3 tbsp', NULL, 3),
  ('a0000000-0000-0000-0000-000000000009', 'Essential oil blend', '10 drops', 'lavender + tea tree', 4),
  -- Rosemary Mint Shampoo Bar
  ('a0000000-0000-0000-0000-000000000010', 'Melt and pour soap base', '8 oz', 'SLS-free', 1),
  ('a0000000-0000-0000-0000-000000000010', 'Coconut oil', '1 tbsp', NULL, 2),
  ('a0000000-0000-0000-0000-000000000010', 'Rosemary essential oil', '15 drops', NULL, 3),
  ('a0000000-0000-0000-0000-000000000010', 'Peppermint essential oil', '10 drops', NULL, 4),
  ('a0000000-0000-0000-0000-000000000010', 'Dried rosemary', '1 tsp', 'optional, for decoration', 5)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- RECIPE STEPS (for first 10 recipes)
-- =============================================================================
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip) VALUES
  -- All-Purpose Citrus Cleaner
  ('a0000000-0000-0000-0000-000000000001', 1, 'Fill a mason jar with citrus peels (orange, lemon, or grapefruit).', 'Save peels over a few days until you have enough.'),
  ('a0000000-0000-0000-0000-000000000001', 2, 'Pour white vinegar over the peels until completely covered.', NULL),
  ('a0000000-0000-0000-0000-000000000001', 3, 'Seal the jar and let it steep for 2 weeks in a dark place.', 'Shake occasionally to mix.'),
  ('a0000000-0000-0000-0000-000000000001', 4, 'Strain the liquid into a spray bottle and dilute with equal parts water.', 'Use a glass spray bottle to avoid degradation.'),
  -- Lavender Linen Spray
  ('a0000000-0000-0000-0000-000000000002', 1, 'Add witch hazel to a spray bottle.', NULL),
  ('a0000000-0000-0000-0000-000000000002', 2, 'Add lavender essential oil drops to the witch hazel.', 'Witch hazel helps the oil mix with water.'),
  ('a0000000-0000-0000-0000-000000000002', 3, 'Fill the rest of the bottle with distilled water and shake well.', NULL),
  -- Honey Oat Face Mask
  ('a0000000-0000-0000-0000-000000000003', 1, 'Mix raw honey and colloidal oatmeal in a small bowl.', NULL),
  ('a0000000-0000-0000-0000-000000000003', 2, 'Add yogurt and stir until smooth.', 'If too thick, add a tiny bit more yogurt.'),
  ('a0000000-0000-0000-0000-000000000003', 3, 'Apply to clean face and leave for 15-20 minutes.', 'Avoid eye area.'),
  ('a0000000-0000-0000-0000-000000000003', 4, 'Rinse with lukewarm water and pat dry.', 'Follow with your favorite moisturizer.'),
  -- Tea Tree Spot Treatment
  ('a0000000-0000-0000-0000-000000000004', 1, 'Add jojoba oil to a small glass bottle.', NULL),
  ('a0000000-0000-0000-0000-000000000004', 2, 'Add tea tree essential oil drops.', 'Never apply undiluted tea tree oil to skin.'),
  ('a0000000-0000-0000-0000-000000000004', 3, 'Shake gently to combine. Apply a small drop to blemishes with a cotton swab.', 'Use morning and night for best results.'),
  -- Beeswax Lip Balm
  ('a0000000-0000-0000-0000-000000000005', 1, 'Melt beeswax, coconut oil, and shea butter together in a double boiler.', 'Use low heat to avoid burning.'),
  ('a0000000-0000-0000-0000-000000000005', 2, 'Remove from heat and add essential oil drops.', 'Stir quickly before it starts to set.'),
  ('a0000000-0000-0000-0000-000000000005', 3, 'Pour immediately into lip balm tins or tubes.', 'Work quickly as it solidifies fast.'),
  ('a0000000-0000-0000-0000-000000000005', 4, 'Let cool completely before capping (about 30 minutes).', NULL),
  -- ACV Hair Rinse
  ('a0000000-0000-0000-0000-000000000006', 1, 'Mix apple cider vinegar with water in a squeeze bottle.', NULL),
  ('a0000000-0000-0000-0000-000000000006', 2, 'Optionally add essential oil drops and shake.', NULL),
  ('a0000000-0000-0000-0000-000000000006', 3, 'After shampooing, pour the rinse over hair focusing on the ends.', 'Avoid getting in eyes.'),
  ('a0000000-0000-0000-0000-000000000006', 4, 'Leave for 1-2 minutes, then rinse with cool water.', 'Cool water helps seal the cuticle for extra shine.'),
  -- DIY Dish Soap
  ('a0000000-0000-0000-0000-000000000007', 1, 'Mix castile soap with water in a bottle.', NULL),
  ('a0000000-0000-0000-0000-000000000007', 2, 'Add vinegar and essential oil drops.', 'Add vinegar slowly to avoid fizzing.'),
  ('a0000000-0000-0000-0000-000000000007', 3, 'Shake gently to combine. Use 1-2 squirts per sink of dishes.', NULL),
  -- Coconut Oil Body Scrub
  ('a0000000-0000-0000-0000-000000000008', 1, 'Soften coconut oil (do not melt completely).', 'Microwave for 10-15 seconds.'),
  ('a0000000-0000-0000-0000-000000000008', 2, 'Mix in brown sugar until well combined.', NULL),
  ('a0000000-0000-0000-0000-000000000008', 3, 'Add vanilla extract and stir.', NULL),
  ('a0000000-0000-0000-0000-000000000008', 4, 'Transfer to a jar. Use in the shower on damp skin in circular motions.', 'Use within 3 months.'),
  -- Natural Deodorant
  ('a0000000-0000-0000-0000-000000000009', 1, 'Mix baking soda and arrowroot powder in a bowl.', NULL),
  ('a0000000-0000-0000-0000-000000000009', 2, 'Add softened coconut oil and mix until smooth paste forms.', NULL),
  ('a0000000-0000-0000-0000-000000000009', 3, 'Add essential oil drops and stir to combine.', NULL),
  ('a0000000-0000-0000-0000-000000000009', 4, 'Transfer to an empty deodorant tube or small jar.', 'Refrigerate for 30 minutes to firm up.'),
  -- Rosemary Mint Shampoo Bar
  ('a0000000-0000-0000-0000-000000000010', 1, 'Cut the soap base into small cubes and melt in a double boiler.', NULL),
  ('a0000000-0000-0000-0000-000000000010', 2, 'Once melted, remove from heat and add coconut oil. Stir well.', NULL),
  ('a0000000-0000-0000-0000-000000000010', 3, 'Add rosemary and peppermint essential oils. Mix thoroughly.', NULL),
  ('a0000000-0000-0000-0000-000000000010', 4, 'Optionally sprinkle dried rosemary into the mold.', 'For decoration only.'),
  ('a0000000-0000-0000-0000-000000000010', 5, 'Pour into silicone mold and let cure for 4-6 weeks.', 'The longer the cure, the harder and longer-lasting the bar.')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCTS
-- =============================================================================
INSERT INTO products (id, barcode, name, brand, category, image, rating, diy_recipe_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', '3574661014647', 'Gentle Skin Cleanser', 'Cetaphil', 'Skincare', '🧴', 'caution', NULL),
  ('b0000000-0000-0000-0000-000000000002', '0018787764015', 'Pure-Castile Liquid Soap', 'Dr. Bronner''s', 'Personal Care', '🧼', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000003', '0037000849629', 'Clean Freak Mist', 'Mr. Clean', 'Cleaning', '🧹', 'avoid', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', '0071249371558', 'Elvive Dream Lengths', 'L''Oreal', 'Personal Care', '💇', 'caution', NULL),
  ('b0000000-0000-0000-0000-000000000005', '0305210076006', 'Regenerist Micro-Sculpting Cream', 'Olay', 'Skincare', '✨', 'caution', NULL),
  ('b0000000-0000-0000-0000-000000000006', '0300450553058', 'Old Spice Body Wash', 'Old Spice', 'Personal Care', '🧴', 'avoid', NULL),
  ('b0000000-0000-0000-0000-000000000007', '0041457000236', 'Shower Fresh Deodorant', 'Suave', 'Personal Care', '🌸', 'avoid', 'a0000000-0000-0000-0000-000000000009'),
  ('b0000000-0000-0000-0000-000000000008', '0012000001567', 'Mountain Dew', 'PepsiCo', 'Food', '🥤', 'avoid', NULL),
  ('b0000000-0000-0000-0000-000000000009', '0049000006346', 'Organic Black Beans', 'S&W', 'Food', '🫘', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000010', '0024100440665', 'Nature Valley Granola Bar', 'General Mills', 'Food', '🌾', 'caution', NULL),
  ('b0000000-0000-0000-0000-000000000011', '0075181023013', 'Think! Protein Bar', 'Think!', 'Food', '💪', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000012', '0022000159250', 'Cheerios', 'General Mills', 'Food', '🥣', 'caution', NULL),
  ('b0000000-0000-0000-0000-000000000013', '0037000794547', 'Tide Free & Gentle', 'Tide', 'Cleaning', '🧺', 'caution', NULL),
  ('b0000000-0000-0000-0000-000000000014', '0071691004740', 'Method All-Purpose Cleaner', 'Method', 'Cleaning', '🌿', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000015', '0021130126026', 'Fabuloso Multi-Purpose', 'Fabuloso', 'Cleaning', '💜', 'avoid', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000016', '0810003360625', 'Everything Spray', 'Branch Basics', 'Cleaning', '🍃', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000017', '0858380001005', 'Mineral Sunscreen SPF 30', 'Badger', 'Skincare', '☀️', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000018', '0381519187131', 'Aveeno Daily Moisturizer', 'Aveeno', 'Skincare', '🧴', 'caution', NULL),
  ('b0000000-0000-0000-0000-000000000019', '0072140024628', 'Vaseline Original', 'Vaseline', 'Skincare', '🫙', 'caution', NULL),
  ('b0000000-0000-0000-0000-000000000020', '0850006869510', 'Clean Deodorant', 'Native', 'Personal Care', '🌻', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000021', '0070230512345', 'Stainmaster Carpet Cleaner', 'Resolve', 'Home', '🏠', 'avoid', NULL),
  ('b0000000-0000-0000-0000-000000000022', '0810005411233', 'Wool Dryer Balls', 'Smart Sheep', 'Home', '🐑', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000023', '0850009876543', 'Beeswax Food Wraps', 'Bee''s Wrap', 'Home', '🐝', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000024', '0012345678901', 'Essential Oil Diffuser', 'Vitruvi', 'Home', '🌬️', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000025', '0099999000001', 'Organic Cotton Tee', 'Pact', 'Clothing', '👕', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000026', '0099999000002', 'Classic T-Shirt', 'Shein', 'Clothing', '👚', 'avoid', NULL),
  ('b0000000-0000-0000-0000-000000000027', '0099999000003', 'Better Sweater', 'Patagonia', 'Clothing', '🧥', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000028', '0099999000004', 'Align Leggings', 'Lululemon', 'Clothing', '🩳', 'caution', NULL),
  ('b0000000-0000-0000-0000-000000000029', '0094922310668', 'Organic Coconut Oil', 'Nutiva', 'Food', '🥥', 'clean', NULL),
  ('b0000000-0000-0000-0000-000000000030', '0049000006432', 'Original Goldfish', 'Pepperidge Farm', 'Food', '🐟', 'caution', NULL),
  ('b0000000-0000-0000-0000-000000000031', '0099999000010', 'Room Spray Lavender', 'Febreze', 'Home', '🌺', 'avoid', 'a0000000-0000-0000-0000-000000000020'),
  ('b0000000-0000-0000-0000-000000000032', '0099999000011', 'Foaming Hand Soap', 'Bath & Body Works', 'Cleaning', '🫧', 'avoid', 'a0000000-0000-0000-0000-000000000023')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- INGREDIENTS (for a selection of products)
-- =============================================================================
INSERT INTO ingredients (product_id, name, risk, explanation, sort_order) VALUES
  -- Cetaphil Cleanser (caution)
  ('b0000000-0000-0000-0000-000000000001', 'Water', 'safe', 'Purified water used as the base solvent. Completely safe.', 1),
  ('b0000000-0000-0000-0000-000000000001', 'Cetyl Alcohol', 'safe', 'A fatty alcohol derived from coconut oil. Used as an emollient and thickener.', 2),
  ('b0000000-0000-0000-0000-000000000001', 'Propylene Glycol', 'concern', 'A synthetic humectant. Can cause skin irritation in sensitive individuals.', 3),
  ('b0000000-0000-0000-0000-000000000001', 'Sodium Lauryl Sulfate', 'toxic', 'A harsh surfactant that strips natural oils. Known skin irritant.', 4),
  ('b0000000-0000-0000-0000-000000000001', 'Methylparaben', 'toxic', 'A preservative that mimics estrogen. Potential endocrine disruptor.', 5),
  -- Dr. Bronner's (clean)
  ('b0000000-0000-0000-0000-000000000002', 'Water', 'safe', 'Purified water base. Completely safe.', 1),
  ('b0000000-0000-0000-0000-000000000002', 'Organic Coconut Oil', 'safe', 'Cold-pressed organic coconut oil. Natural cleanser and moisturizer.', 2),
  ('b0000000-0000-0000-0000-000000000002', 'Potassium Hydroxide', 'safe', 'Used to saponify oils into soap. Fully reacted in the final product.', 3),
  ('b0000000-0000-0000-0000-000000000002', 'Organic Olive Oil', 'safe', 'Extra virgin olive oil. Provides gentle cleansing properties.', 4),
  ('b0000000-0000-0000-0000-000000000002', 'Tocopherol', 'safe', 'Vitamin E. Natural antioxidant preservative.', 5),
  -- Mr. Clean (avoid)
  ('b0000000-0000-0000-0000-000000000003', 'Water', 'safe', 'Purified water base.', 1),
  ('b0000000-0000-0000-0000-000000000003', 'C10-16 Alkyldimethylamine Oxide', 'concern', 'Synthetic surfactant. Can cause skin and respiratory irritation.', 2),
  ('b0000000-0000-0000-0000-000000000003', 'Sodium Hydroxide', 'concern', 'Caustic alkali used as pH adjuster. Can cause chemical burns.', 3),
  ('b0000000-0000-0000-0000-000000000003', 'Fragrance', 'toxic', 'Undisclosed mix of synthetic chemicals. Can contain phthalates and allergens.', 4),
  ('b0000000-0000-0000-0000-000000000003', 'Colorant', 'toxic', 'Synthetic dye with no functional purpose. Potential carcinogen.', 5),
  -- Mountain Dew (avoid)
  ('b0000000-0000-0000-0000-000000000008', 'High Fructose Corn Syrup', 'toxic', 'Highly processed sweetener linked to obesity, diabetes, and fatty liver disease.', 1),
  ('b0000000-0000-0000-0000-000000000008', 'Citric Acid', 'safe', 'Natural acid found in citrus fruits.', 2),
  ('b0000000-0000-0000-0000-000000000008', 'Yellow 5', 'toxic', 'Synthetic dye linked to hyperactivity in children. Banned in some countries.', 3),
  ('b0000000-0000-0000-0000-000000000008', 'Brominated Vegetable Oil', 'toxic', 'Flame retardant chemical used as emulsifier. Banned in EU and Japan.', 4),
  ('b0000000-0000-0000-0000-000000000008', 'Sodium Benzoate', 'concern', 'Preservative that can form benzene (carcinogen) when combined with vitamin C.', 5),
  -- Organic Black Beans (clean)
  ('b0000000-0000-0000-0000-000000000009', 'Organic Black Beans', 'safe', 'USDA certified organic beans. High in fiber and protein.', 1),
  ('b0000000-0000-0000-0000-000000000009', 'Water', 'safe', 'Purified water.', 2),
  ('b0000000-0000-0000-0000-000000000009', 'Sea Salt', 'safe', 'Natural sea salt. Minimally processed mineral.', 3)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ALTERNATIVES (for products with alternatives)
-- =============================================================================
INSERT INTO alternatives (product_id, name, brand, price, rating, category, image, sort_order) VALUES
  -- Alternatives for Cetaphil
  ('b0000000-0000-0000-0000-000000000001', 'Gentle Cleanser', 'CeraVe', '$14.99', 'clean', 'Skincare', '🧼', 1),
  ('b0000000-0000-0000-0000-000000000001', 'Calendula Cleanser', 'Weleda', '$18.99', 'clean', 'Skincare', '🌿', 2),
  ('b0000000-0000-0000-0000-000000000001', 'Oil Cleanser', 'DHC', '$28.00', 'clean', 'Skincare', '✨', 3),
  -- Alternatives for Mr. Clean
  ('b0000000-0000-0000-0000-000000000003', 'Everything Spray', 'Branch Basics', '$12.99', 'clean', 'Cleaning', '🍃', 1),
  ('b0000000-0000-0000-0000-000000000003', 'All-Purpose Cleaner', 'Method', '$4.99', 'clean', 'Cleaning', '🌿', 2),
  -- Alternatives for Mountain Dew
  ('b0000000-0000-0000-0000-000000000008', 'Sparkling Water', 'Spindrift', '$5.99', 'clean', 'Food', '💧', 1),
  ('b0000000-0000-0000-0000-000000000008', 'Kombucha', 'GT''s', '$3.99', 'clean', 'Food', '🍵', 2),
  -- Alternatives for Suave Deodorant
  ('b0000000-0000-0000-0000-000000000007', 'Clean Deodorant', 'Native', '$11.99', 'clean', 'Personal Care', '🌻', 1),
  ('b0000000-0000-0000-0000-000000000007', 'Deodorant Stick', 'Schmidt''s', '$9.99', 'clean', 'Personal Care', '🌿', 2),
  -- Alternatives for Shein T-Shirt
  ('b0000000-0000-0000-0000-000000000026', 'Organic Cotton Tee', 'Pact', '$25.00', 'clean', 'Clothing', '👕', 1),
  ('b0000000-0000-0000-0000-000000000026', 'Recycled Tee', 'Girlfriend Collective', '$35.00', 'clean', 'Clothing', '🌱', 2)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SAMPLE COMMUNITY POSTS (using placeholder user IDs)
-- =============================================================================
-- Note: In production, user_id would reference real auth.users.
-- For seed data, we create sample users first.

-- Sample users (these would be created via auth.users in production)
INSERT INTO users (id, name, email, avatar_url, crunchy_score, subscription_tier, interests) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Emma Green', 'emma@example.com', NULL, 85, 'starter', ARRAY['Skincare', 'Food', 'Cleaning']),
  ('c0000000-0000-0000-0000-000000000002', 'Sage Meadows', 'sage@example.com', NULL, 72, 'premium', ARRAY['Skincare', 'Personal Care', 'Home']),
  ('c0000000-0000-0000-0000-000000000003', 'Luna Rivers', 'luna@example.com', NULL, 91, 'starter', ARRAY['Food', 'Cleaning', 'Clothing']),
  ('c0000000-0000-0000-0000-000000000004', 'Willow Parks', 'willow@example.com', NULL, 45, 'free', ARRAY['Food', 'Skincare']),
  ('c0000000-0000-0000-0000-000000000005', 'Ivy Brooks', 'ivy@example.com', NULL, 68, 'starter', ARRAY['Cleaning', 'Home', 'Personal Care']),
  ('c0000000-0000-0000-0000-000000000006', 'Daisy Chen', 'daisy@example.com', NULL, 78, 'premium', ARRAY['Skincare', 'Haircare']),
  ('c0000000-0000-0000-0000-000000000007', 'Olive Kim', 'olive@example.com', NULL, 55, 'free', ARRAY['Food', 'Clothing']),
  ('c0000000-0000-0000-0000-000000000008', 'Hazel Stone', 'hazel@example.com', NULL, 82, 'starter', ARRAY['Home', 'Cleaning', 'Personal Care']),
  ('c0000000-0000-0000-0000-000000000009', 'Violet Ray', 'violet@example.com', NULL, 63, 'free', ARRAY['Skincare', 'Food']),
  ('c0000000-0000-0000-0000-000000000010', 'Jade Wilson', 'jade@example.com', NULL, 94, 'premium', ARRAY['Food', 'Cleaning', 'Skincare', 'Home'])
ON CONFLICT DO NOTHING;

-- Sample posts
INSERT INTO posts (id, user_id, content, image, hashtags, likes_count, comments_count, created_at) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Just made my own all-purpose cleaner with citrus peels and vinegar! My kitchen smells amazing and I feel so much better not spraying chemicals everywhere.', '🍊', ARRAY['#DIYCleaning', '#CleanLiving', '#NonToxic'], 42, 8, '2026-03-04T10:30:00Z'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'Scanned my "natural" shampoo and it scored AVOID. Three hidden parabens! This app is opening my eyes.', NULL, ARRAY['#ProductScan', '#ParabenFree', '#CrunchyLife'], 87, 15, '2026-03-04T09:15:00Z'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'My honey oat face mask Sunday ritual is everything. Skin has never been this glowy.', '🍯', ARRAY['#SkincareRoutine', '#DIYBeauty', '#NaturalGlow'], 63, 12, '2026-03-03T18:00:00Z'),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', 'Switched from Tide to Branch Basics concentrate two months ago. Less plastic waste, cleaner clothes, no weird residue on baby''s clothes.', NULL, ARRAY['#CleanCleaning', '#BabyProducts', '#EcoFriendly'], 55, 9, '2026-03-03T14:20:00Z'),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', 'Starting my crunchy journey! Just took the quiz and got Sprout. Any tips for beginners?', NULL, ARRAY['#CrunchyBeginner', '#CleanLiving', '#HelpMe'], 34, 22, '2026-03-03T11:45:00Z'),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000006', 'Made the rosemary mint shampoo bar recipe from the app and I am OBSESSED. Zero waste and my hair smells incredible.', '🌿', ARRAY['#DIYBeauty', '#ZeroWaste', '#ShampooBar'], 78, 11, '2026-03-02T20:00:00Z'),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000010', 'Pro tip: keep a small bottle of diluted castile soap in your bag. Works as hand soap, stain remover, and emergency dish soap!', NULL, ARRAY['#CrunchyTips', '#CleanLiving', '#MultiUse'], 91, 7, '2026-03-02T16:30:00Z'),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000007', 'Trying to find affordable clean clothing brands. Fast fashion is so tempting when you''re on a budget. Anyone have suggestions?', NULL, ARRAY['#CleanClothing', '#SustainableFashion', '#BudgetFriendly'], 45, 18, '2026-03-02T12:00:00Z'),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000008', 'Replaced all my plastic food containers with glass ones this weekend. Small step but it feels huge!', '🫙', ARRAY['#PlasticFree', '#EcoFriendly', '#SmallSteps'], 67, 5, '2026-03-01T19:30:00Z'),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000009', 'The ingredient scanner changed everything for me. Found out my favorite granola bars have 3 toxic ingredients I never knew about.', NULL, ARRAY['#ProductScan', '#FoodSafety', '#KnowYourIngredients'], 52, 10, '2026-03-01T15:00:00Z'),
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000001', 'Weekend project: made natural deodorant AND lip balm! Total cost: $8. Store equivalent: $20+. My wallet and body are happy.', '🌸', ARRAY['#DIYBeauty', '#SaveMoney', '#NonToxic'], 73, 13, '2026-03-01T10:15:00Z'),
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000003', 'Reminder that going crunchy is not all or nothing. Every small swap counts. You don''t have to be perfect.', NULL, ARRAY['#CrunchyLife', '#Progress', '#SelfCompassion'], 112, 20, '2026-02-28T22:00:00Z'),
  ('d0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000006', 'Just hit Thriving on my crunchy score! When I started 6 months ago I was a Seedling. Consistency is key!', NULL, ARRAY['#CrunchyScore', '#Progress', '#Thriving'], 95, 16, '2026-02-28T17:45:00Z'),
  ('d0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000010', 'My 5-year-old asked me why we use "special soap" instead of the colorful kind at her friend''s house. Had the best conversation about taking care of our bodies and the planet.', NULL, ARRAY['#CrunchyParenting', '#CleanLiving', '#TeachThemYoung'], 88, 14, '2026-02-28T13:00:00Z'),
  ('d0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000002', 'New recipe drop: coconut oil body scrub with vanilla. I use it every shower now and my skin has never been softer.', '🥥', ARRAY['#DIYBeauty', '#SkincareRoutine', '#BodyScrub'], 59, 8, '2026-02-27T20:30:00Z')
ON CONFLICT DO NOTHING;

-- Sample comments
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'I love this recipe! How long does it last?', 5, '2026-03-04T11:00:00Z'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'About 6 months in the fridge! The vinegar is a natural preservative.', 8, '2026-03-04T11:15:00Z'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', 'Same thing happened to me! "Natural" doesn''t mean safe apparently.', 12, '2026-03-04T09:30:00Z'),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Start with your kitchen and bathroom cleaners - easiest swaps and you''ll see the difference immediately!', 15, '2026-03-03T12:00:00Z'),
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000008', 'Welcome! Don''t try to change everything at once. Swap one product at a time as things run out.', 11, '2026-03-03T12:30:00Z'),
  ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000010', 'Pact and Organic Basics are great for basics! ThredUp for secondhand too.', 9, '2026-03-02T13:00:00Z'),
  ('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000004', 'Needed to hear this today. I felt guilty for buying conventional sunscreen at the beach.', 20, '2026-02-28T22:30:00Z'),
  ('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000003', 'Exactly! Progress over perfection always.', 18, '2026-02-28T23:00:00Z')
ON CONFLICT DO NOTHING;
