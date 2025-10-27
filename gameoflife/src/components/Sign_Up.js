// Sign Up form component
'use client';

export default function SignUpForm({
  username,
  email,
  password,
  confirmPassword,
  setUsername,
  setEmail,
  setPassword,
  setConfirmPassword,
  isLoading,
  handleSignUp,
  switchToLogin,
}) {
  return (
    <form onSubmit={handleSignUp}>
      <h2 className="text-2xl font-semibold text-center mb-3 text-gray-700">Create Account</h2>

      <input 
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border border-black focus:outline-none focus:bg-gray-100"
      />

      <input 
        type="email"
        placeholder="Email Address"
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
        minLength={6}
        className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border border-black focus:outline-none focus:bg-gray-100"
      />

      <input 
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border border-black focus:outline-none focus:bg-gray-100"
      />
      
      <button 
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
      
      <div className="mt-4 text-center mb-3">
        <span className="text-gray-500">Already have an account? </span>
        <button 
          type="button"
          onClick={switchToLogin}
          className="text-blue-500 hover:underline font-medium cursor-pointer"
        >
          Login
        </button>
      </div>
    </form>
  );
}
