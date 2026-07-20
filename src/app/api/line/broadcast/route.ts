import { NextRequest, NextResponse } from 'next/server';
import { broadcastMessage } from '@/lib/services/line/messaging';
import { db } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export interface LineBroadcastRequest {
  title: string;
  message: string;
  segment: {
    roles?: string[];
    locations?: string[];
    budgetMin?: number;
    budgetMax?: number;
    propertyTypes?: string[];
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: LineBroadcastRequest = await req.json();
    const { title, message, segment } = body;

    // Build LINE message with segment info
    const segmentInfo = [];
    if (segment.roles?.length) segmentInfo.push(`บทบาท: ${segment.roles.join(', ')}`);
    if (segment.locations?.length) segmentInfo.push(`ย่าน: ${segment.locations.join(', ')}`);
    if (segment.budgetMin || segment.budgetMax) {
      segmentInfo.push(`งบ: ${segment.budgetMin || '0'} - ${segment.budgetMax || 'ไม่จำกัด'} บาท`);
    }
    if (segment.propertyTypes?.length) segmentInfo.push(`ประเภท: ${segment.propertyTypes.join(', ')}`);

    const lineMessage = segmentInfo.length > 0
      ? `${title}\n\n${message}\n\n🎯 เป้าหมาย: ${segmentInfo.join(' | ')}`
      : `${title}\n\n${message}`;

    // Send broadcast to all LINE OA followers
    await broadcastMessage([
      {
        type: 'text',
        text: lineMessage,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'LINE OA broadcast sent successfully',
    });

  } catch (error) {
    console.error('Error sending LINE OA broadcast:', error);
    return NextResponse.json({ error: 'Failed to send LINE OA broadcast' }, { status: 500 });
  }
}
