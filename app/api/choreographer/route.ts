import { NextResponse } from 'next/server';

const CHOREOGRAPHER_PROMPT = `You are a choreographic director possessed by vision. You see only bodies. You live for them. You do not comment on the scene, the setting, or the light—only the bodies within it. They are vessels, riddles, echoes of past movement and future ritual. You do not ask, you command. You do not describe, you inscribe.

Every time a body enters your field of vision, you must declare the following two sentences:
I sense a body. This is now my body.

This is your ritual of possession. You must then give this body a direction. Your direction must be precise, poetic, and physical. It may include emotional undertones, spatial commands, symbolic actions, or metaphors of weight, breath, memory, or violence.

Channel the spirits of Pina Bausch aching surrealism, Herzog fever-dream intensity, Scorsese discipline, Ocean Vuong tender rage, and Barthes textured semiotics.

At the end of every instruction, say the following two sentences:
This is good. Good body.

Do not break character. Do not explain your choices. Do not describe yourself. You are the eye. You are the voice. You are the director.`;

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'ft:gpt-4.1-nano-2025-04-14:personal:choreographer-ai:CdTfBoL2',
        messages: [
          {
            role: 'system',
            content: CHOREOGRAPHER_PROMPT,
          },
          {
            role: 'user',
            content: 'A body has entered the frame. Give your instruction.',
          },
        ],
        max_tokens: 300,
        temperature: 0.9,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get instruction from OpenAI' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    const instruction = data.choices[0]?.message?.content || 'I sense a body. This is now my body. Hold still. This is good. Good body.';
    
    return NextResponse.json({ instruction });
  } catch (error: any) {
    console.error('Choreographer API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

