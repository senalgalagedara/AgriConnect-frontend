import { NextResponse } from 'next/server';

// Simple in-memory mock store (non-persistent). In a real app, replace with DB calls.
let mockUsers = [
  {
    id: 1,
    email: 'alice@example.com',
    first_name: 'Alice',
    last_name: 'Farmer',
    role: 'farmer',
    status: 'active',
    phone: '+123456789',
    address: '123 Farm Road',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    email: 'bob@example.com',
    first_name: 'Bob',
    last_name: 'Consumer',
    role: 'consumer',
    status: 'active',
    phone: '+198765432',
    address: '456 Market Street',
    created_at: new Date().toISOString()
  }
];

export async function GET() {
  return NextResponse.json({ data: mockUsers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nextId = mockUsers.length ? Math.max(...mockUsers.map(u => u.id)) + 1 : 1;
    const now = new Date().toISOString();
    const newUser = {
      id: nextId,
      email: body.email || '',
      first_name: body.firstName || body.first_name || '',
      last_name: body.lastName || body.last_name || '',
      role: body.role || 'consumer',
      status: 'active',
      phone: body.contactNumber || '',
      address: body.address || '',
      created_at: now
    };
    mockUsers.push(newUser);
    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid request' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  return NextResponse.json({ error: 'Use /api/users/:id with PATCH or PUT' }, { status: 405 });
}

// Dynamic routes for /api/users/:id must be separate (not implemented here). Frontend update/delete actions will still 404 until added.
// We add a quick note so future devs know what to do.
