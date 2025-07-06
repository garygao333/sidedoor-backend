import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';

export interface SearchHistoryItem {
  id?: string;
  query: string;
  timestamp: any;
  results?: any;
  jobId?: string;
}

export const searchHistoryService = {
  // Add a search to history
  async addSearch(user: User, query: string, results?: any, jobId?: string): Promise<void> {
    await addDoc(collection(db, 'searchHistory'), {
      userId: user.uid,
      query,
      results,
      jobId,
      timestamp: serverTimestamp(),
    });
  },

  // Get user's search history
  async getHistory(user: User, limit: number = 50): Promise<SearchHistoryItem[]> {
    const q = query(
      collection(db, 'searchHistory'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SearchHistoryItem));
  },

  // Get recent searches (last 10)
  async getRecentSearches(user: User): Promise<string[]> {
    const history = await this.getHistory(user, 10);
    const uniqueQueries = Array.from(new Set(history.map(item => item.query)));
    return uniqueQueries;
  }
};

// Waitlist utilities
export const waitlistService = {
  // Check if user is on waitlist
  async isUserOnWaitlist(user: User): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'waitlist'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking waitlist status:', error);
      return false;
    }
  },

  // Get waitlist stats (for admin)
  async getWaitlistStats(): Promise<{ total: number }> {
    try {
      const querySnapshot = await getDocs(collection(db, 'waitlist'));
      return { total: querySnapshot.size };
    } catch (error) {
      console.error('Error getting waitlist stats:', error);
      return { total: 0 };
    }
  }
};
