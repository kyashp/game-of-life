import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';
import { createUser } from './firestoreHelpers';

// Sign Up - This saves to Firebase!
export async function signUp(email, password, username) {
  try {
    // 1. Create Firebase Authentication account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Update display name
    await updateProfile(user, {
      displayName: username
    });
    
    // 3. Create user document in Firestore
    await createUser(user.uid, {
      username,
      email,
      displayName: username,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Sign up error:', error);
    
    // Friendly error messages
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }
    
    return { success: false, error: errorMessage };
  }
}

// Sign In - This logs in using Firebase data!
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Sign in error:', error);
    
    // Friendly error messages
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password.';
    }
    
    return { success: false, error: errorMessage };
  }
}

// Sign Out
export async function logout() {
  try {
    await signOut(auth);
    // Clear any local storage
    localStorage.removeItem('auth_token');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}

// Password Reset
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent!' };
  } catch (error) {
    console.error('Password reset error:', error);
    
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }
    
    return { success: false, error: errorMessage };
  }
}

// Auth State Observer
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get Current User
export function getCurrentUser() {
  return auth.currentUser;
}