// Login form component
'use client';

import Image from 'next/image';

export default function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  isLoading,
  handleLogin,
  handleGuestLogin,
  switchToSignUp,
}) {
  return (
    <form onSubmit={handleLogin}>
      <h2 className="text-2xl font-semibold text-center mb-4 text-gray-700">Welcome!</h2>

      <input 
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border border-black focus:outline-none focus:bg-gray-100"
      />

      <input 
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border border-black focus:outline-none focus:bg-gray-100"
      />
      
      <p>
        <a href="#" className="text-blue-500 hover:text-blue-600 font-medium flex justify-end mb-1 hover:underline">
          Forgot Password?
        </a>
      </p>
      
      <button 
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      
      <div className="mt-4 text-center">
        <span className="text-gray-500">Don&apos;t have an account? </span>
        <button 
          type="button"
          onClick={switchToSignUp}
          className="text-blue-500 hover:underline font-medium cursor-pointer"
        >
          Sign Up
        </button>
      </div>
        
      <div className="flex items-center mt-4 mb-2">
        <div className="flex-1 border-b border-gray-300"></div>
        <span className="px-4 text-gray-500">or</span>
        <div className="flex-1 border-b border-gray-300"></div>
      </div>

      <div className="flex justify-center">
        <button className="px-3 py-2 bg-white text-black border rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer">
          <Image src="/Google-logo.png" alt="Google Logo" width={50} height={50}/>
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
          className="px-6 py-3 text-blue-600 hover:underline cursor-pointer"
        >
          Play as Guest
        </button>
      </div>
    </form>
  );
}
