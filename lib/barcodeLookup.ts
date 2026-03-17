export interface OpenFoodFactsResult {
  found: boolean;
  productName?: string;
  brand?: string;
  ingredients?: string;
  nutritionGrade?: string;
  categories?: string;
  imageUrl?: string;
}

export async function lookupBarcode(barcode: string): Promise<OpenFoodFactsResult> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      { headers: { 'User-Agent': 'CrunchyApp/1.0' } }
    );

    if (!response.ok) {
      return { found: false };
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return { found: false };
    }

    const product = data.product;
    return {
      found: true,
      productName: product.product_name || product.product_name_en || 'Unknown Product',
      brand: product.brands || 'Unknown Brand',
      ingredients: product.ingredients_text || product.ingredients_text_en || '',
      nutritionGrade: product.nutrition_grades || '',
      categories: product.categories || '',
      imageUrl: product.image_url || product.image_front_url || '',
    };
  } catch {
    return { found: false };
  }
}

export function buildGeminiPromptFromBarcode(
  barcode: string,
  offResult: OpenFoodFactsResult
): string {
  if (offResult.found && offResult.ingredients) {
    return `Analyze this food product found via barcode scan.

Product Name: ${offResult.productName}
Brand: ${offResult.brand}
Ingredients List: ${offResult.ingredients}
${offResult.nutritionGrade ? `Nutrition Grade: ${offResult.nutritionGrade}` : ''}
${offResult.categories ? `Categories: ${offResult.categories}` : ''}

Provide a thorough "crunchy" health analysis of these REAL ingredients. Focus on:
- Artificial additives, preservatives, and colorings
- Ultra-processed ingredients
- Added sugars and sweeteners
- Harmful chemicals or controversial ingredients
- Overall healthfulness

Rate each ingredient as safe/concern/toxic and give an overall clean/caution/avoid rating.`;
  }

  return `I scanned a barcode: ${barcode}. I could not find this product in the Open Food Facts database.
Can you try to identify what product this barcode might belong to? If you can identify it, analyze its typical ingredients.
If you cannot identify it, provide a general analysis noting the barcode number and suggest the user try scanning the ingredient label instead.`;
}
