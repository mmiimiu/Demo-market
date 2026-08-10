import { NextResponse } from 'next/server';
import { NotificationScheduler } from '@/lib/notifications/NotificationScheduler';

export async function GET() {
  try {
    // Verify the request is from an authorized source (cron job, etc.)
    const authHeader = process.env.NOTIFICATION_AUTH_KEY;
    const providedAuth = process.env.NOTIFICATION_AUTH_KEY;

    // In production, you should verify the request is authorized
    // For now, we'll just run the checks
    
    await NotificationScheduler.runAllChecks();

    return NextResponse.json({ 
      success: true, 
      message: 'Notification checks completed' 
    });
  } catch (error) {
    console.error('Error in notification check API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run notification checks' },
      { status: 500 }
    );
  }
}
