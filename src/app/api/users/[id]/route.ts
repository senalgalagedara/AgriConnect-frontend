import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const userId = params.id;

    console.log('PUT /api/users/:id - User ID:', userId); // Debug log
    console.log('PUT /api/users/:id - Body:', body); // Debug log

    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', res.status); // Debug log

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend error:', errorText); // Debug log
      return NextResponse.json(
        { success: false, message: errorText || 'Failed to update user' },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log('Backend response data:', data); // Debug log
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { success: false, message: errorText || 'Failed to delete user' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { success: false, message: errorText || 'Failed to fetch user' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
