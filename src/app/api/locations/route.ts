import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || '';

    try {
        const response = await fetch(`https://nextimmo.lu/api/v2/aggregate/cities?action=allCities&q=${encodeURIComponent(query)}`, {
            headers: {
                // Nếu cần, thêm headers authentication
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('API Response:', response.status, response.statusText);
            return NextResponse.json({ message: 'Error fetching data' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data || { message: 'No data found' });
    } catch (error) {
        console.error('API Request Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
