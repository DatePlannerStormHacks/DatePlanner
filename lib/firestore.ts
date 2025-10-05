// lib/firestore.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface FavoriteItinerary {
  id?: string;
  userId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  budget: number;
  activities: string[];
  cuisines: string[];
  generatedItinerary: string;
  createdAt: Timestamp;
}

const COLLECTION_NAME = 'favoriteItineraries';

export const saveFavoriteItinerary = async (itinerary: Omit<FavoriteItinerary, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...itinerary,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving favorite itinerary:', error);
    throw new Error('Failed to save favorite itinerary');
  }
};

export const getFavoriteItineraries = async (userId: string): Promise<FavoriteItinerary[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const itineraries: FavoriteItinerary[] = [];
    
    querySnapshot.forEach((doc) => {
      itineraries.push({
        id: doc.id,
        ...doc.data()
      } as FavoriteItinerary);
    });
    
    return itineraries;
  } catch (error) {
    console.error('Error fetching favorite itineraries:', error);
    throw new Error('Failed to fetch favorite itineraries');
  }
};

export const deleteFavoriteItinerary = async (itineraryId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, itineraryId));
  } catch (error) {
    console.error('Error deleting favorite itinerary:', error);
    throw new Error('Failed to delete favorite itinerary');
  }
};