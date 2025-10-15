import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc,
  query,
  where,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// ============ USERS ============

export async function createUser(userId, userData) {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

export async function getUser(userId) {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error.message };
  }
}

export async function updateUser(userId, userData) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
}

// ============ PROFILES ============

export async function createProfile(userId, profileData) {
  try {
    const profileRef = await addDoc(collection(db, 'profiles'), {
      userId,
      ...profileData,
      createdAt: serverTimestamp()
    });
    return { success: true, profileId: profileRef.id };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { success: false, error: error.message };
  }
}

export async function getProfile(userId) {
  try {
    const q = query(collection(db, 'profiles'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const profileDoc = querySnapshot.docs[0];
      return { 
        success: true, 
        data: { id: profileDoc.id, ...profileDoc.data() } 
      };
    } else {
      return { success: false, error: 'Profile not found' };
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    return { success: false, error: error.message };
  }
}

export async function updateProfile(profileId, profileData) {
  try {
    const profileRef = doc(db, 'profiles', profileId);
    await updateDoc(profileRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteProfile(profileId) {
  try {
    await deleteDoc(doc(db, 'profiles', profileId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting profile:', error);
    return { success: false, error: error.message };
  }
}

// ============ SIMULATIONS ============

export async function saveSimulation(userId, profileId, simulationData) {
  try {
    const simRef = await addDoc(collection(db, 'simulations'), {
      userId,
      profileId,
      results: simulationData,
      createdAt: serverTimestamp()
    });
    return { success: true, simulationId: simRef.id };
  } catch (error) {
    console.error('Error saving simulation:', error);
    return { success: false, error: error.message };
  }
}

export async function getSimulations(userId) {
  try {
    const q = query(collection(db, 'simulations'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const simulations = [];
    querySnapshot.forEach((doc) => {
      simulations.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: simulations };
  } catch (error) {
    console.error('Error getting simulations:', error);
    return { success: false, error: error.message };
  }
}

export async function getSimulation(simulationId) {
  try {
    const docRef = doc(db, 'simulations', simulationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Simulation not found' };
    }
  } catch (error) {
    console.error('Error getting simulation:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSimulation(simulationId, simulationData) {
  try {
    const simRef = doc(db, 'simulations', simulationId);
    await updateDoc(simRef, {
      results: simulationData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating simulation:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSimulation(simulationId) {
  try {
    await deleteDoc(doc(db, 'simulations', simulationId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting simulation:', error);
    return { success: false, error: error.message };
  }
}