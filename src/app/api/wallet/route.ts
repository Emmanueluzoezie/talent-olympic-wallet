import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = request.json()
        
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ message: 'Unauthorized' });
    }
}