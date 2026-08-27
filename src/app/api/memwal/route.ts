import { NextRequest, NextResponse } from 'next/server';
import { memWalEngine } from '@/lib/memwal';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'health';

  if (action === 'health') {
    const health = await memWalEngine.memwal_health();
    return NextResponse.json(health);
  }

  if (action === 'all') {
    return NextResponse.json({ memories: memWalEngine.getAllMemories() });
  }

  if (action === 'recall') {
    const query = searchParams.get('query') || '';
    const topK = parseInt(searchParams.get('topK') || '5', 10);
    const results = memWalEngine.memwal_recall(query, topK);
    return NextResponse.json({ query, count: results.length, results });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, customerName, customerPhone, memoryText, category, transcript } = body;

    if (action === 'remember') {
      const record = memWalEngine.memwal_remember(customerName, customerPhone, memoryText, category);
      return NextResponse.json({ success: true, record });
    }

    if (action === 'analyze') {
      const result = memWalEngine.memwal_analyze(transcript, customerName, customerPhone);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'restore') {
      const result = memWalEngine.memwal_restore();
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'reset') {
      memWalEngine.resetToDefault();
      return NextResponse.json({ success: true, message: 'Reset to initial seed memories' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
