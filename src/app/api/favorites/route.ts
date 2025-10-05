import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch favorites from Firestore server-side
    const q = query(
      collection(db, 'favoriteItineraries'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const favorites: Array<{id: string, [key: string]: unknown}> = [];
    
    querySnapshot.forEach((doc) => {
      favorites.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, date, startTime, endTime, budget, activities, cuisines, generatedItinerary } = body;

    if (!title || !date || !startTime || !endTime || !budget || !activities || !cuisines || !generatedItinerary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const favoriteData = {
      userId,
      title,
      date,
      startTime,
      endTime,
      budget,
      activities,
      cuisines,
      generatedItinerary: JSON.stringify(generatedItinerary),
      createdAt: Timestamp.now()
    };

    // Save directly to Firestore from server-side
    const docRef = await addDoc(collection(db, 'favoriteItineraries'), favoriteData);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error saving favorite:', error);
    return NextResponse.json({ error: 'Failed to save favorite' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itineraryId = searchParams.get('id');

    if (!itineraryId) {
      return NextResponse.json({ error: 'Missing itinerary ID' }, { status: 400 });
    }

    // Delete directly from Firestore from server-side
    await deleteDoc(doc(db, 'favoriteItineraries', itineraryId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    return NextResponse.json({ error: 'Failed to delete favorite' }, { status: 500 });
  }
}