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
  const [fetchingRecipes, setFetchingRecipes] = useState(true);

  const supabase = createClient();

  // Fetch user session & saved recipes
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setFetchingRecipes(false);
          return;
        }

        if (session?.user?.email) {
          console.log('User found:', session.user.email);
          setEmail(session.user.email);

          console.log('Fetching recipes for user...');
          const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('email', session.user.email)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching recipes - Full error:', JSON.stringify(error, null, 2));
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
          } else {
            console.log('Recipes fetched successfully:', data);
            console.log('Number of recipes:', data?.length || 0);
            setSavedRecipes(data || []);
          }
        } else {
          console.log('No user session found');
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
      } finally {
        setFetchingRecipes(false);
      }
    };

    fetchData();
  }, [supabase]);

  const generateRecipe = async () => {
    if (!ingredients.trim()) {
      alert('Please enter some ingredients first!');
      return;
    }

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

        // Save to Supabase only if user is logged in
        if (email) {
          console.log('Saving recipe to database...');
          const { error } = await supabase.from('recipes').insert([
            {
              email,
              ingredients,
              recipe: data.recipe,
            },
          ]);

          if (error) {
            console.error('Error saving recipe - Full error:', JSON.stringify(error, null, 2));
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            alert(`Failed to save recipe: ${error.message || 'Unknown error'}`);
          } else {
            console.log('Recipe saved successfully');
            // Refresh saved list
            const { data: updatedData, error: fetchError } = await supabase
              .from('recipes')
              .select('*')
              .eq('email', email)
              .order('created_at', { ascending: false });

            if (fetchError) {
              console.error('Error refreshing recipes:', JSON.stringify(fetchError, null, 2));
            } else {
              console.log('Updated recipes:', updatedData);
              setSavedRecipes(updatedData || []);
            }
          }
        }
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Error generating recipe:', err);
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
          disabled={loading || !ingredients.trim()}
        >
          {loading ? 'Cooking...' : 'Generate Recipe 🍽️'}
        </button>

        {recipe && (
          <div className="mt-4 p-4 bg-pink-100 rounded shadow-md text-left whitespace-pre-wrap">
            {recipe}
          </div>
        )}

        {/* Debug info */}
        {fetchingRecipes && (
          <div className="mt-4 p-2 bg-blue-100 rounded text-sm text-blue-700">
            Loading saved recipes...
          </div>
        )}

        {!fetchingRecipes && email && savedRecipes.length === 0 && (
          <div className="mt-4 p-2 bg-yellow-100 rounded text-sm text-yellow-700">
            No saved recipes found. Generate your first recipe!
          </div>
        )}

        {/* Saved recipes section */}
        {savedRecipes.length > 0 && (
          <div className="mt-8 text-left">
            <h2 className="text-lg font-semibold text-pink-600 mb-2">
              💾 Your Saved Recipes ({savedRecipes.length}):
            </h2>
            <ul className="space-y-2 max-h-60 overflow-auto">
              {savedRecipes.map((r) => (
                <li
                  key={r.id}
                  className="p-3 bg-pink-50 border border-pink-200 rounded text-sm"
                >
                  <div className="mb-2">
                    <strong>🧺 Ingredients:</strong> {r.ingredients}
                  </div>
                  <div className="mb-2">
                    <strong>📄 Recipe:</strong> 
                    <div className="mt-1 text-xs text-gray-600 max-h-20 overflow-auto">
                      {r.recipe.length > 150 ? `${r.recipe.substring(0, 150)}...` : r.recipe}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}