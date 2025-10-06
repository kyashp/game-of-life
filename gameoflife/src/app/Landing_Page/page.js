'use client';

import { useState } from 'react';

export default function Landing() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#fefcf3]">
      
      {/* Left Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-4">Strategise your parenthood finances with Game of Life</h1>
        <p className="text-lg text-gray-600 text-center">
          Simulate your child’s future in Singapore, make strategic decisions, and secure your finances with our platform. 
          Sign up for an account to save progress or play as guest.
        </p>

        <button className="mt-6 px-6 py-3 bg-[#f47068] text-white rounded-lg hover:bg-blue-400 transition-colors">
          Start simulating now →
        </button>
      </div>

      {/* Right Section */}
      <div className="w-1/3 flex flex-col items-center justify-center p-8">
        
        {/* Section Box */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-black w-full max-w-sm">
          
          {/* Login Form */}
          {!isSignUp ? (
            <>
              <h2 className="text-2xl font-semibold text-center mb-4">Welcome !</h2>

              <button className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black flex justify-start">
                Username / Email 
              </button>

              <button className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black flex justify-start">
                Password
              </button>
              
              <p>
                <a href="#" className="text-blue-500 hover:text-blue-600 font-medium flex justify-end">
                  Forgot Password?
                </a>
              </p>
              
              <button className="w-full px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                Login
              </button>
              
              <div className="mt-4 text-center">
                <span className="text-gray-500">Don't have an account? </span>
                <button 
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-500 hover:underline font-medium"
                >
                  Sign Up
                </button>
              </div>
            </>
          ) : (
            /* Sign Up Form */
            <>
              <h2 className="text-2xl font-semibold text-center mb-4">Create Account</h2>

              <button className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black flex justify-start">
                UserName
              </button>

              <button className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black flex justify-start">
                Email Address
              </button>

              <button className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black flex justify-start">
                Password
              </button>

              <button className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black flex justify-start">
                Confirm Password
              </button>
              
              <button className="w-full px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                Create Account
              </button>
              
              <div className="mt-4 text-center">
                <span className="text-gray-500">Already have an account? </span>
                <button 
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-500 hover:underline font-medium"
                >
                  Login
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}










