import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { NotificationService } from '@/lib/notifications/NotificationService';

export interface BroadcastSegment {
  roles?: ('user' | 'renter' | 'landlord' | 'owner' | 'agent')[];
  locations?: string[];
  budgetMin?: number;
  budgetMax?: number;
  propertyTypes?: string[];
}

export interface BroadcastRequest {
  title: string;
  message: string;
  segment: BroadcastSegment;
  sendToLineOA: boolean;
  createdBy: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: BroadcastRequest = await req.json();
    console.log('Broadcast request received:', body);
    const { title, message, segment, sendToLineOA, createdBy } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    // Check if Firebase is properly configured
    const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                                  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('placeholder');

    let targetUsers: any[] = [];

    if (isFirebaseConfigured) {
      // Build query for segment filtering
      const usersRef = collection(db, 'users');
      let queryConstraints = [];

      // If no segment filters, get all users
      const hasFilters = segment.roles || segment.locations || segment.budgetMin || segment.budgetMax || segment.propertyTypes;

      // Filter by roles
      if (segment.roles && segment.roles.length > 0) {
        console.log('Filtering by roles:', segment.roles);
        queryConstraints.push(where('role', 'in', segment.roles));
      }

      // Filter by budget range (from user preferences)
      if (segment.budgetMin !== undefined || segment.budgetMax !== undefined) {
        if (segment.budgetMin !== undefined) {
          console.log('Filtering by budgetMin:', segment.budgetMin);
          queryConstraints.push(where('preferences.budgetMax', '>=', segment.budgetMin));
        }
        if (segment.budgetMax !== undefined) {
          console.log('Filtering by budgetMax:', segment.budgetMax);
          queryConstraints.push(where('preferences.budgetMin', '<=', segment.budgetMax));
        }
      }

      // Filter by locations (from user preferences)
      if (segment.locations && segment.locations.length > 0) {
        console.log('Filtering by locations:', segment.locations);
        queryConstraints.push(where('preferences.locations', 'array-contains-any', segment.locations));
      }

      // Filter by property types (from user preferences)
      if (segment.propertyTypes && segment.propertyTypes.length > 0) {
        console.log('Filtering by propertyTypes:', segment.propertyTypes);
        queryConstraints.push(where('preferences.propertyTypes', 'array-contains-any', segment.propertyTypes));
      }

      // If no filters, get all users (for testing)
      const q = queryConstraints.length > 0 ? query(usersRef, ...queryConstraints) : query(usersRef);
      console.log('Executing query...');
      const querySnapshot = await getDocs(q);
      console.log('Query completed, found users:', querySnapshot.size);
      targetUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      // Demo mode: Create mock users for testing
      console.log('Firebase not configured, using demo mode with mock users');
      targetUsers = [
        { id: 'demo-user-1', role: 'renter', email: 'renter1@example.com' },
        { id: 'demo-user-2', role: 'owner', email: 'owner1@example.com' },
        { id: 'demo-user-3', role: 'agent', email: 'agent1@example.com' },
      ];
      
      // Apply simple role filtering in demo mode
      if (segment.roles && segment.roles.length > 0) {
        targetUsers = targetUsers.filter(user => segment.roles?.includes(user.role));
      }
      
      console.log('Demo mode: filtered users:', targetUsers.length);
    }

    if (targetUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No users found matching the segment criteria',
        details: {
          segment,
          isDemoMode: !isFirebaseConfigured
        }
      }, { status: 404 });
    }

    // Send web notifications to filtered users
    if (isFirebaseConfigured) {
      const notificationPromises = targetUsers.map(user => 
        NotificationService.createNotification({
          userId: user.id,
          type: 'broadcast',
          title,
          message,
        })
      );
      await Promise.all(notificationPromises);
    } else {
      console.log('Demo mode: skipping notification creation (Firebase not configured)');
    }

    // Store broadcast record
    let broadcastId = 'demo-broadcast-' + Date.now();
    if (isFirebaseConfigured) {
      const broadcastRef = await addDoc(collection(db, 'broadcasts'), {
        title,
        message,
        segment,
        targetUserCount: targetUsers.length,
        sentToLineOA: sendToLineOA,
        createdBy,
        createdAt: serverTimestamp(),
      });
      broadcastId = broadcastRef.id;
    } else {
      console.log('Demo mode: skipping broadcast storage (Firebase not configured)');
    }

    // If LINE OA sync is enabled, trigger LINE broadcast
    if (sendToLineOA) {
      try {
        // Call LINE OA broadcast endpoint
        const lineResponse = await fetch('/api/line/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            message,
            segment,
          }),
        });
        
        if (!lineResponse.ok) {
          console.error('LINE OA broadcast failed');
        }
      } catch (error) {
        console.error('Error sending LINE OA broadcast:', error);
      }
    }

    return NextResponse.json({
      success: true,
      broadcastId: broadcastId,
      targetUserCount: targetUsers.length,
      message: `Broadcast sent to ${targetUsers.length} users`,
      isDemoMode: !isFirebaseConfigured,
    });

  } catch (error) {
    console.error('Error sending broadcast:', error);
    return NextResponse.json({ 
      error: 'Failed to send broadcast',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const broadcastsRef = collection(db, 'broadcasts');
    const snapshot = await getDocs(broadcastsRef);
    const broadcasts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ broadcasts });
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    return NextResponse.json({ error: 'Failed to fetch broadcasts' }, { status: 500 });
  }
}
