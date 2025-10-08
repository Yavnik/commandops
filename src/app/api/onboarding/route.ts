import { NextRequest, NextResponse } from 'next/server';
import {
  auth,
  getUserOnboardingStatus,
  setUserOnboardingCompleted,
} from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const onboardingCompleted = await getUserOnboardingStatus(session.user.id);

    return NextResponse.json({ onboardingCompleted });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await setUserOnboardingCompleted(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
