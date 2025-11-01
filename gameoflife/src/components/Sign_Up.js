// Sign Up form component
'use client';

import { useState } from 'react';

// Reserved usernames --> to avoid confusion in the database and with guest accounts
const RESERVED_USERNAMES = [
  'admin', 'administrator', 'mod', 'moderator',
  'support', 'help', 'official', 'system',
  'guest', 'user', 'null', 'undefined',
  'test', 'demo', 'sample', 'root', 'superuser', 
  'gameoflife', 'developer', 'staff'
];

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
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Validate username (8-12 characters)
  const validateUsername = (value) => {
    // Length check (8-12 characters)
    if (value.length < 8) {
      return 'Username must be at least 8 characters';
    }
    if (value.length > 12) {
      return 'Username must be at most 12 characters';
    }

    // Check reserved names (case-insensitive)
    if (RESERVED_USERNAMES.includes(value.toLowerCase())) {
      return 'This username is reserved';
    }

    // Check for "guest_" prefix (reserved for guest users)
    if (value.toLowerCase().startsWith('guest_')) {  // convert to lowercase for check
      return 'Username cannot start with "guest_"';
    }

    return null;
  };

  // Validate password (12+ chars, uppercase, lowercase, number, symbol)
  const validatePassword = (value) => {
    // Length check (minimum 12 characters)
    if (value.length < 12) {
      return 'Password must be at least 12 characters';
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }

    // Check for number
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number';
    }

    // Check for symbol
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      return 'Password must contain at least one symbol (!@#$%^&*...)';
    }

    return null;
  };

  // Handle username change with validation
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value); 

    if (value) {
      const error = validateUsername(value);
      setUsernameError(error || ''); // Clear error if valid
    } else {
      setUsernameError(''); // Clear error if empty
    }
  };

  // Handle password change with validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (value) {
      const error = validatePassword(value);
      setPasswordError(error || ''); // Clear error if valid
    } else {
      setPasswordError(''); // Clear error if empty
    }

    // Also check if confirmPassword matches when password changes
    if (confirmPassword && confirmPassword !== value) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Handle confirm password change with validation
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    // Check if passwords match
    if (value && value !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Handle form submit with validation
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate username
    const usernameErr = validateUsername(username);
    if (usernameErr) {
      setUsernameError(usernameErr);
      return;
    }

    // Validate password
    const passwordErr = validatePassword(password);
    if (passwordErr) {
      setPasswordError(passwordErr);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    // Call parent's handleSignUp
    handleSignUp(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-center mb-3 text-gray-700">Create Account</h2>

      {/* Username Input with Validation */}
      <div className="mb-4">
        <input 
          type="text"
          placeholder="Username (8-12 characters)"
          value={username}
          onChange={handleUsernameChange}
          required
          minLength={8}
          maxLength={12}
          className={`w-full px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors ${
            usernameError ? 'border-2 border-red-500' : 'border-2 border-black'
          } focus:outline-none focus:bg-gray-100`}
        />
        {usernameError && (
          <p className="text-red-500 text-xs mt-1 ml-4"> {usernameError}</p>
        )}
        {!usernameError && username.length >= 8 && (
          <p className="text-green-500 text-xs mt-1 ml-4"> Username is valid</p>
        )}
      </div>

      <input 
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black focus:outline-none focus:bg-gray-100"
      />

      {/* Password Input with Validation */}
      <div className="mb-4">
        <input 
          type="password"
          placeholder="Password (12+ characters)"
          value={password}
          onChange={handlePasswordChange}
          required
          minLength={12}
          className={`w-full px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors ${
            passwordError ? 'border-2 border-red-500' : 'border-2 border-black'
          } focus:outline-none focus:bg-gray-100`}
        />
        {passwordError && (
          <p className="text-red-500 text-xs mt-1 ml-4"> {passwordError}</p>
        )}
        {!passwordError && password.length >= 12 && (
          <p className="text-green-500 text-xs mt-1 ml-4"> Password is strong</p>
        )}
        {/* Password requirements hint */}
        {!password && (
          <p className="text-gray-500 text-xs mt-1 ml-4">
            Must include: uppercase, lowercase, number, symbol
          </p>
        )}
      </div>

      <input 
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        required
        className={`w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors ${
          confirmPasswordError ? 'border-2 border-red-500' : 'border-2 border-black'
        } focus:outline-none focus:bg-gray-100`}
      />
      {confirmPasswordError && (
        <p className="text-red-500 text-xs mt-1 ml-4 -mt-3 mb-4"> {confirmPasswordError}</p>
      )}
      {!confirmPasswordError && confirmPassword && password === confirmPassword && (
        <p className="text-green-500 text-xs mt-1 ml-4 -mt-3 mb-4"> Passwords match</p>
      )}
      
      <button 
        type="submit"
        disabled={isLoading || !!usernameError || !!passwordError || !!confirmPasswordError}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
