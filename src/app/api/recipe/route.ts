import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { ingredients } = await req.json();
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!ingredients) {
    return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
        ingredients
      )}&number=1&apiKey=${apiKey}`
    );
    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No recipe found' }, { status: 404 });
    }

    const recipeId = data[0].id;

    const detailRes = await fetch(
      `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${apiKey}`
    );
    const detail = await detailRes.json();

    return NextResponse.json({ recipe: `${detail.title}\n\n${detail.instructions || 'No instructions available.'}` });
  } catch (error) {
    console.error('❌ Spoonacular Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}
// src/app/api/recipe/route.ts