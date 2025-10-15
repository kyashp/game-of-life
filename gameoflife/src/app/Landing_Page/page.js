'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, signIn } from '@/lib/authHelpers';
import { GuestStorageManager } from '@/utils/guestStorage';

export default function Landing() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters!');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(email, password, username);
      
      if (result.success) {
        alert('Account created successfully!');
        router.push('/Profile_Page');
      } else {
        alert(`Sign up failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      alert('An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        router.push('/Profile_Page');
      } else {
        alert(`Login failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Guest Login
  const handleGuestLogin = () => {
    const guestId = GuestStorageManager.initGuestSession();
    console.log('Guest session created:', guestId);
    router.push('/Profile_Page?mode=guest');
  };

  return (
    <div className="min-h-screen flex bg-[#fefcf3]">
      
      {/* Left Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        <h1 className="text-5xl font-bold mb-4">
          Strategise your parenthood <span className='text-[#f47068]'>finances</span> with Game of Life
        </h1>
        <p className="text-2xl text-gray-600 text-center">
          Simulate your child's future in Singapore, make strategic decisions, and secure your finances with our platform. 
          Sign up for an account to save progress or play as guest.
        </p>

        <div className="flex gap-4 mt-6">
          <button className="px-6 py-3 bg-[#f47068] text-white rounded-lg hover:bg-[#e55d55] transition-colors">
            Start simulating now →
          </button>
          <button className="px-6 py-3 bg-null text-[#8b93ff] rounded-lg hover:border border-[#8b93ff] flex items-center justify-center gap-2">
            <span>How to use Game of Life?</span>
            <span className="text-5xl leading-none flex items-center">»</span>
          </button>
        </div>
      </div>

      {/* Right Section - Login/Signup */}
      <div className="w-1/3 flex flex-col items-center justify-center p-8 pt-32 max-h-screen overflow-y-auto">
        
        {/* Section Box */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-black w-full max-w-sm">
          
          {/* Login Form */}
          {!isSignUp ? (
            // Login Form
            <form onSubmit={handleLogin}>
              <h2 className="text-2xl font-semibold text-center mb-4">Welcome!</h2>

              <input 
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black focus:outline-none focus:bg-gray-100"
              />

              <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black focus:outline-none focus:bg-gray-100"
              />
              
              <p>
                <a href="#" className="text-blue-500 hover:text-blue-600 font-medium flex justify-end">
                  Forgot Password?
                </a>
              </p>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              
              <div className="mt-4 text-center">
                <span className="text-gray-500">Don't have an account? </span>
                <button 
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-500 hover:underline font-medium"
                >
                  Sign Up
                </button>
              </div>
                
                <div className="flex items-center mt-4 mb-2">
                  <div className="flex-1 border-b border-gray-300"></div>
                  <span className="px-4 text-gray-500">or</span>
                  <div className="flex-1 border-b border-gray-300"></div>
                </div>

                <div className="flex justify-center ">
                  <button className="px-6 py-3 bg-white text-black border rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <img src="/Google-logo.png" alt="Google Logo" className="w-8 h-8"/>
                    Sign in with Google
                  </button>

                </div>

                <div className="flex items-center mt-4 mb-2">
                  <div className="flex-1 border-b border-gray-300"></div>
                  <span className="px-4 text-gray-500">or</span>
                  <div className="flex-1 border-b border-gray-300"></div>
                </div>

              <div className="flex justify-center mt-2">
                <button 
                  type="button"
                  onClick={handleGuestLogin}
                  className="px-6 py-3 bg-null text-blue-600 hover:underline"
                >
                  Play as Guest
                </button>
              </div>
            </form>
          ) : (
            // Sign Up Form
            <form onSubmit={handleSignUp}>
              <h2 className="text-2xl font-semibold text-center mb-4">Create Account</h2>

              <input 
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black focus:outline-none focus:bg-gray-100"
              />

              <input 
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black focus:outline-none focus:bg-gray-100"
              />

              <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black focus:outline-none focus:bg-gray-100"
              />

              <input 
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black focus:outline-none focus:bg-gray-100"
              />
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <div className="mt-4 text-center">
                <span className="text-gray-500">Already have an account? </span>
                <button 
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-500 hover:underline font-medium"
                >
                  Login
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}