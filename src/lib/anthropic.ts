interface AnonymizedCycleData {
  cycleLengths: number[];
  periodDurations: number[];
  symptomsByPhase: {
    menstrual: string[];
    follicular: string[];
    ovulation: string[];
    luteal: string[];
  };
  moodPatterns: {
    mood: string;
    frequency: number;
  }[];
}

interface AIInsights {
  summary: string;
  symptomTrends: string[];
  wellnessSuggestions: string[];
}

export async function getAIInsights(data: AnonymizedCycleData): Promise<AIInsights> {
  const prompt = `You are a compassionate menstrual health assistant. Analyze this anonymized cycle data and provide gentle, evidence-based insights.

Data:
- Cycle lengths: ${data.cycleLengths.join(', ')} days
- Period durations: ${data.periodDurations.join(', ')} days
- Symptoms by phase:
  * Menstrual: ${data.symptomsByPhase.menstrual.join(', ') || 'none'}
  * Follicular: ${data.symptomsByPhase.follicular.join(', ') || 'none'}
  * Ovulation: ${data.symptomsByPhase.ovulation.join(', ') || 'none'}
  * Luteal: ${data.symptomsByPhase.luteal.join(', ') || 'none'}
- Mood patterns: ${data.moodPatterns.map(m => `${m.mood} (${m.frequency}x)`).join(', ')}

Provide:
1. A brief, warm summary of cycle patterns (2-3 sentences)
2. 2-3 notable symptom trends
3. 2-3 gentle, evidence-based wellness suggestions

Format as JSON:
{
  "summary": "...",
  "symptomTrends": ["...", "..."],
  "wellnessSuggestions": ["...", "..."]
}

Keep language supportive and non-medical. Focus on patterns and self-care.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI insights');
    }

    const result = await response.json();
    const content = result.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI Insights error:', error);
    throw error;
  }
}
