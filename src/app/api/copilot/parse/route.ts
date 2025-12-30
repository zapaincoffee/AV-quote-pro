import { NextRequest, NextResponse } from 'next/server';

// POST /api/copilot/parse
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    // --- REAL AI IMPLEMENTATION ---
    // 1. Get your API key from OpenAI/Anthropic/Google
    // const apiKey = process.env.AI_API_KEY;
    
    // 2. Call the API
    // const completion = await openai.chat.completions.create({
    //   messages: [{ role: "system", content: "Parse AV quote..." }, { role: "user", content: text }],
    //   ...
    // });
    
    // 3. Return the JSON
    // return NextResponse.json(JSON.parse(completion.choices[0].message.content));

    // --- MOCK IMPLEMENTATION (Demo) ---
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple heuristic parser (just for show)
    const mockResponse = {
        eventName: text.split('\n')[0].substring(0, 50) || "New Event",
        clientName: "Detected Client",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        sections: [
            {
                id: "1",
                name: "Detected Equipment",
                items: [
                    { id: "101", name: "Generic Camera", quantity: 2, days: 1, pricePerDay: 500, type: "Equipment", total: 1000 },
                    { id: "102", name: "Sound Kit", quantity: 1, days: 1, pricePerDay: 300, type: "Equipment", total: 300 }
                ]
            }
        ]
    };

    return NextResponse.json(mockResponse);

  } catch (error) {
    return NextResponse.json({ message: 'AI processing failed' }, { status: 500 });
  }
}
