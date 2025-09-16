import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOutUser, onAuthChange } from '@/services/authService';
import { createUserProfile, getUserProfile, isUserAdmin, verifyUserDataIntegrity } from '@/services/firebaseServiceReal';
import { UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.STUDENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setLoading(true);
      setUser(authUser);
      
      if (authUser) {
        try {
          // Check if user profile exists
          let userProfile = await getUserProfile(authUser.uid);
          
          if (!userProfile) {
            // Create new user profile
            // Check if user is admin - only specific email addresses
            const isAdmin = authUser.email === 'nigmanand@navgurukul.org';
            
            // By default, everyone is a student unless explicitly admin
            const role = isAdmin ? UserRole.ADMIN : UserRole.STUDENT;
            
            try {
              userProfile = await createUserProfile(authUser, role);
              console.log(`✅ New user created: ${authUser.email} as ${role}`);
            } catch (createError) {
              // Fallback: use in-memory profile if Firebase fails
              console.warn('Using fallback user profile due to Firebase permissions');
              userProfile = {
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName || 'User',
                photoURL: authUser.photoURL,
                role: role,
                createdAt: new Date(),
                lastLoginAt: new Date()
              };
            }
          }
          
          setUserRole(userProfile.role);
          
          // Verify data integrity in background (don't fail if this errors)
          try {
            verifyUserDataIntegrity(authUser.uid, userProfile.role);
          } catch (verifyError) {
            console.warn('Could not verify data integrity:', verifyError);
          }
          
        } catch (error) {
          console.error('Error setting up user profile:', error);
          
          // Fallback logic for permissions issues
          if (error instanceof Error && error.message.includes('permissions')) {
            console.warn('🔐 Firebase permissions issue - using fallback authentication');
            
            // Determine role based on email even without Firebase
            const isAdmin = authUser.email === 'nigmanand@navgurukul.org';
            setUserRole(isAdmin ? UserRole.ADMIN : UserRole.STUDENT);
          } else {
            // Default to student for other errors
            setUserRole(UserRole.STUDENT);
          }
        }
      } else {
        setUserRole(UserRole.STUDENT);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (role: UserRole) => {
    setUserRole(role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      signIn,
      signOut,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
