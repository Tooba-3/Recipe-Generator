'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type SavedRecipe = {
  id: number;
  ingredients: string;
  recipe: string;
  created_at: string;
};

export default function RecipePage() {
  const [email, setEmail] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  const supabase = createClient();

  // Fetch user session & saved recipes
  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setEmail(session.user.email);

        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('email', session.user.email)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setSavedRecipes(data);
        }
      }
    };

    fetchData();
  }, [supabase]);

  const generateRecipe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await res.json();
      if (res.ok) {
        setRecipe(data.recipe);

        // Save to Supabase
        const { error } = await supabase.from('recipes').insert([
          {
            email,
            ingredients,
            recipe: data.recipe,
          },
        ]);

        if (!error) {
          // Refresh saved list
          const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setSavedRecipes(data);
          }
        }
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-6 text-center">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-pink-600">🍓 Recipe Generator</h1>
          <button
            onClick={handleLogout}
            className="bg-red-400 text-white px-3 py-1 rounded hover:bg-red-500 text-sm"
          >
            Logout
          </button>
        </div>

        {email && (
          <p className="text-gray-600 mb-2 text-sm">
            Logged in as <span className="font-semibold">{email}</span>
          </p>
        )}

        <p className="text-gray-500 mb-4">Enter ingredients and let the magic cook! ✨</p>

        <textarea
          className="w-full border border-pink-300 rounded p-3 mb-4 bg-pink-50"
          rows={4}
          placeholder="e.g., strawberries, milk, chocolate 🍫"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />

        <button
          onClick={generateRecipe}
          className="bg-pink-400 text-white px-4 py-2 rounded hover:bg-pink-500 mb-4"
          disabled={loading}
        >
          {loading ? 'Cooking...' : 'Generate Recipe 🍽️'}
        </button>

        {recipe && (
          <div className="mt-4 p-4 bg-pink-100 rounded shadow-md text-left whitespace-pre-wrap">
            {recipe}
          </div>
        )}

        {savedRecipes.length > 0 && (
          <div className="mt-8 text-left">
            <h2 className="text-lg font-semibold text-pink-600 mb-2">💾 Your Saved Recipes:</h2>
            <ul className="space-y-2 max-h-60 overflow-auto">
              {savedRecipes.map((r) => (
                <li
                  key={r.id}
                  className="p-3 bg-pink-50 border border-pink-200 rounded text-sm"
                >
                  <strong>🧺 Ingredients:</strong> {r.ingredients}
                  <br />
                  <strong>📄 Recipe:</strong> {r.recipe.substring(0, 100)}...
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
