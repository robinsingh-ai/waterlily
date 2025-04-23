"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';

import { auth } from '../lib/firebase';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signup: (email: string, password: string, name: string) => Promise<User>;
    signin: (email: string, password: string) => Promise<User>;
    signinWithGoogle: () => Promise<User>;
    signout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

// Create an empty auth context with safe default values for SSR
const defaultAuthContext: AuthContextType = {
    currentUser: null,
    loading: true,
    signup: async () => { throw new Error('Auth not initialized'); },
    signin: async () => { throw new Error('Auth not initialized'); },
    signinWithGoogle: async () => { throw new Error('Auth not initialized'); },
    signout: async () => { throw new Error('Auth not initialized'); },
    resetPassword: async () => { throw new Error('Auth not initialized'); }
};

// Create context with a default value
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function useAuth() {
    return useContext(AuthContext);
}

// A wrapper for safe rendering during SSR
function SafeHydrate({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted ? <>{children}</> : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user data exists in localStorage
        const storedUser = typeof window !== 'undefined' ? 
            localStorage.getItem('waterlily-user') : null;
            
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                // This is a simplified user object - Firebase auth will update it 
                // with the full user object when onAuthStateChanged fires
                setCurrentUser(userData as User);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('waterlily-user');
            }
        }
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            
            // Store or clear user data in localStorage
            if (user) {
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                };
                localStorage.setItem('waterlily-user', JSON.stringify(userData));
                // Set the firebase-auth-token cookie
                document.cookie = `firebase-auth-token=${user.uid}; path=/; max-age=2592000`; // 30 days
            } else {
                localStorage.removeItem('waterlily-user');
                // Remove the firebase-auth-token cookie
                document.cookie = 'firebase-auth-token=; path=/; max-age=0';
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signup = async (email: string, password: string, name: string): Promise<User> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update user profile with name
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: name
                });
            }
            return userCredential.user;
        } catch (error) {
            console.error("Error signing up:", error);
            throw error;
        }
    };

    const signin = async (email: string, password: string): Promise<User> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Error signing in:", error);
            throw error;
        }
    };

    const signinWithGoogle = async (): Promise<User> => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            return userCredential.user;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    };

    const signout = async (): Promise<void> => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    };

    const resetPassword = async (email: string): Promise<void> => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error("Error resetting password:", error);
            throw error;
        }
    };

    const value = {
        currentUser,
        loading,
        signup,
        signin,
        signinWithGoogle,
        signout,
        resetPassword
    };

    // Wait for the client-side to be available before rendering the auth-dependent children
    if (typeof window === 'undefined') {
        return <AuthContext.Provider value={defaultAuthContext}>{children}</AuthContext.Provider>;
    }

    return (
        <SafeHydrate>
            <AuthContext.Provider value={value}>
                {!loading ? children : null}
            </AuthContext.Provider>
        </SafeHydrate>
    );
}


