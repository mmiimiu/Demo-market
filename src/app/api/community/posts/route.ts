/**
 * @fileOverview Community Posts API
 *
 * Route: GET/POST /api/community/posts
 * PATCH /api/community/posts (vote, report, accept answer)
 */

import { NextRequest, NextResponse } from 'next/server';
import { communityService } from '@/lib/services/community';

/* ─────────────── GET: List Posts ─────────────── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';
    const zone     = searchParams.get('zone')     || '';
    const search   = searchParams.get('search')   || '';
    const page     = parseInt(searchParams.get('page')  || '1');
    const limit    = parseInt(searchParams.get('limit') || '20');

    const result = await communityService.getPosts(category, zone, search, page, limit);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ─────────────── POST: Create Post or Answer ─────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, authorId, content } = body;

    if (!authorId || !content) {
      return NextResponse.json({ error: 'authorId and content are required' }, { status: 400 });
    }

    if (type !== 'post' && type !== 'answer') {
      return NextResponse.json({ error: 'type must be post or answer' }, { status: 400 });
    }

    const result = await communityService.createPostOrAnswer(body);
    return NextResponse.json(result);
  } catch (err: any) {
    const status = err.message === 'Author not found' ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

/* ─────────────── PATCH: Vote / Accept / Report ─────────────── */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, postId, userId } = body;

    if (!postId || !action || !userId) {
      return NextResponse.json({ error: 'postId, action, and userId are required' }, { status: 400 });
    }

    const result = await communityService.patchPost(body);
    return NextResponse.json(result);
  } catch (err: any) {
    const status = err.message === 'Post not found' ? 404 : err.message.includes('Only the post author') ? 403 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
