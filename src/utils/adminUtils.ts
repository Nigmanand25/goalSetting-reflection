import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserRole } from '@/types';

// Admin utility functions

// Make user admin
export const promoteToAdmin = async (userId: string): Promise<void> => {
  try {
    // First check if user exists in users collection
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error(`User ${userId} does not exist in the database`);
    }
    
    // Update user role in users collection
    await updateDoc(userRef, {
      role: UserRole.ADMIN,
      updatedAt: new Date()
    });

    // Add to admin users collection
    await setDoc(doc(db, 'adminUsers', userId), {
      promotedAt: new Date(),
      permissions: ['read', 'write', 'admin']
    });

    console.log(`✅ User ${userId} promoted to admin`);
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
};

// Remove admin privileges
export const demoteFromAdmin = async (userId: string): Promise<void> => {
  try {
    // First check if user exists in users collection
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error(`User ${userId} does not exist in the database`);
    }
    
    // Update user role in users collection
    await updateDoc(userRef, {
      role: UserRole.STUDENT,
      updatedAt: new Date()
    });

    // Remove from admin users collection
    await deleteDoc(doc(db, 'adminUsers', userId));

    console.log(`✅ User ${userId} demoted to student`);
  } catch (error) {
    console.error('Error demoting user from admin:', error);
    throw error;
  }
};

// Get all users (admin function)
export const getAllUsers = async () => {
  try {
    const usersQuery = query(
      collection(db, 'users'), 
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(usersQuery);
    const users: any[] = [];
    
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Get all admin users
export const getAllAdmins = async () => {
  try {
    const adminsQuery = query(
      collection(db, 'users'),
      where('role', '==', UserRole.ADMIN)
    );
    
    const snapshot = await getDocs(adminsQuery);
    const admins: any[] = [];
    
    snapshot.forEach((doc) => {
      admins.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return admins;
  } catch (error) {
    console.error('Error getting admin users:', error);
    throw error;
  }
};

// Delete user account (admin function)
export const deleteUserAccount = async (userId: string): Promise<void> => {
  try {
    // Delete from users collection
    await deleteDoc(doc(db, 'users', userId));
    
    // Delete from students collection if exists
    await deleteDoc(doc(db, 'students', userId));
    
    // Delete from admin users if exists
    await deleteDoc(doc(db, 'adminUsers', userId));
    
    // Delete user's daily entries
    const entriesQuery = query(
      collection(db, 'dailyEntries'),
      where('studentId', '==', userId)
    );
    
    const entriesSnapshot = await getDocs(entriesQuery);
    const deletePromises = entriesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log(`✅ User ${userId} and all associated data deleted`);
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};
