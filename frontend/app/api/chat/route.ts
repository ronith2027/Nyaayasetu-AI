import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Forward the request to the backend
    const backendUrl = process.env.CHATBOT_API_URL || 'https://7mpoesjcq6.execute-api.ap-south-1.amazonaws.com/chat';

    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API proxy error:', error);

    // Return fallback response on error
    return NextResponse.json({
      summary: "We are unable to process your query right now. Please try again later.",
      legal_basis: "Not available",
      steps: [],
      documents_required: [],
      confidence_score: 0.2
    });
  }
}
