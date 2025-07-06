'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface SearchHistory {
  id?: string;
  query: string;
  timestamp: any;
  results?: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  addSearchHistory: (query: string, results?: any) => Promise<void>;
  getSearchHistory: () => Promise<SearchHistory[]>;
  addToWaitlist: (email: string, password: string, additionalInfo?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      createdAt: serverTimestamp(),
      isWaitlisted: false,
    });
  };

  const addToWaitlist = async (email: string, password: string, additionalInfo?: any) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore with waitlist status
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      createdAt: serverTimestamp(),
      isWaitlisted: true,
      waitlistInfo: additionalInfo,
    });

    // Add to waitlist collection
    await addDoc(collection(db, 'waitlist'), {
      userId: userCredential.user.uid,
      email: userCredential.user.email,
      joinedAt: serverTimestamp(),
      ...additionalInfo,
    });
  };

  const addSearchHistory = async (query: string, results?: any) => {
    if (!user) return;
    
    await addDoc(collection(db, 'searchHistory'), {
      userId: user.uid,
      query,
      results,
      timestamp: serverTimestamp(),
    });
  };

  const getSearchHistory = async (): Promise<SearchHistory[]> => {
    if (!user) return [];
    
    const q = query(
      collection(db, 'searchHistory'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SearchHistory));
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    loading,
    addSearchHistory,
    getSearchHistory,
    addToWaitlist
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
