'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterWardPage() {
  const [step, setStep] = useState<'info' | 'auth'>('info');
  const [wardName, setWardName] = useState('');
  const [stakeName, setStakeName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!wardName || !stakeName || !email) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Encode ward info in the callback URL
      const params = new URLSearchParams({
        wardName,
        stakeName,
        email,
      });

      const callbackUrl = `/api/register/complete?${params.toString()}`;

      // Redirect to Google OAuth with callback to create ward
      await signIn('google', {
        callbackUrl,
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to start registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Register Your Ward
          </h1>
          <p className="text-gray-600">
            Set up Executive Secretary for your ward
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="wardName" className="block text-sm font-medium text-gray-700 mb-2">
                Ward Name *
              </label>
              <input
                type="text"
                id="wardName"
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
                placeholder="e.g., Pleasant Grove 1st Ward"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="stakeName" className="block text-sm font-medium text-gray-700 mb-2">
                Stake Name *
              </label>
              <input
                type="text"
                id="stakeName"
                value={stakeName}
                onChange={(e) => setStakeName(e.target.value)}
                placeholder="e.g., Pleasant Grove Stake"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Your Email (Executive Secretary) *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting}
              />
              <p className="mt-1 text-sm text-gray-500">
                You'll sign in with this email using Google or Microsoft
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Redirecting to sign in...' : 'Continue to Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Already registered?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
          <ol className="text-sm text-gray-700 space-y-2">
            <li>1. Sign in with your Google or Microsoft account</li>
            <li>2. Your ward will be created automatically</li>
            <li>3. You'll be set up as the Executive Secretary</li>
            <li>4. Connect your calendar and add bishopric members</li>
            <li>5. Share the scheduling link with your ward!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
