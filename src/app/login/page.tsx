'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/',
      },
    });

    if (error) {
      setMessage('❌ Error sending magic link. Try again!');
    } else {
      setMessage('📧 Check your email for the magic link!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-pink-100 px-6">
      <div className="max-w-md w-full p-6 rounded-2xl shadow-xl bg-white text-center">
        <h2 className="text-pink-800 text-xl font-semibold mb-2">
          🧁 Login to create your favorite recipes!
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          “Let’s cook something magical together 🍳”
        </p>

        <input
          type="email"
          placeholder="💌 Enter your email"
          className="w-full p-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg transition"
        >
          ✨ Send Magic Link
        </button>

        {message && (
          <p className="mt-4 text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
