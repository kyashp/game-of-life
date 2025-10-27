'use client';

import { useState } from 'react';
import { resetPassword } from '@/lib/authHelpers';

export default function ForgotPassword({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    const result = await resetPassword(email);

    if (result.success) {
      setMessage('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        setEmail('');
        setMessage('');
        onClose();
      }, 3000);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border-2 border-black p-8 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Instructions */}
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          Enter your email address and we&apos;ll send you a secure link to reset your password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-3 bg-gray-50 text-gray-700 rounded-full border-2 border-gray-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm flex items-start gap-2">
              <span>{message}</span> 
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-start gap-2">
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || message}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                Sending...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </button>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-blue-500 hover:text-blue-600 hover:underline text-sm font-medium transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}