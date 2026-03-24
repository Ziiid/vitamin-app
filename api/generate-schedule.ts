import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { age, sex, weight, height, goals } = req.body
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1)

  const prompt = `Du är en kunnig nutritionist och dietist. Baserat på följande personprofil ska du ge personliga hälsorekommendationer.

Profil:
- Ålder: ${age} år
- Kön: ${sex === 'male' ? 'Man' : 'Kvinna'}
- Vikt: ${weight} kg
- Längd: ${height} cm
- BMI: ${bmi}
- Hälsomål: ${goals.join(', ')}

Returnera ENBART ett JSON-objekt (ingen extra text) i exakt detta format:
{
  "summary": "En mening om varför dessa rekommendationer passar personen specifikt",
  "dailyGoals": {
    "water": { "liters": 2.5, "why": "Kort förklaring baserad på profilen" },
    "protein": { "grams": 120, "why": "Kort förklaring baserad på profilen" },
    "carbs": { "grams": 250, "why": "Kort förklaring baserad på profilen" }
  },
  "items": [
    {
      "id": "unikt_id_snake_case",
      "name": "Vitaminets/tillskottets namn",
      "emoji": "ett relevant emoji",
      "color": "#hexfärg (ljus pastellfärg, unik per tillskott)",
      "times": ["morning", "midday", "evening"],
      "withFood": true,
      "dose": "dos som text, t.ex. '1000 mg' eller '2000 IE'",
      "why": "Förklaring varför just denna person behöver detta, referera till ålder/BMI/kön/mål",
      "tip": "Praktiskt tips för intag",
      "conflicts": ["id_på_annat_tillskott"],
      "synergies": ["id_på_annat_tillskott"],
      "foodSources": ["Livsmedel som naturligt innehåller detta", "Minst 3-4 konkreta exempel med mängd"]
    }
  ]
}

Regler:
- Rekommendera 5–8 kosttillskott/tillskott
- Anpassa dos exakt efter ålder, kön och BMI
- Fokusera på mål: ${goals.join(', ')}
- Använd vetenskapligt underbyggda rekommendationer (NNR 2023, NIH)
- "why" ska referera specifikt till personens profil
- Tider: morning=morgon, midday=lunch, evening=kväll (inga natttider)
- "foodSources" ska vara konkreta livsmedel med ungefärlig mängd, t.ex. "Lax (150g = 1000mg omega-3)"
- Vatten: basera på vikt (ca 35ml/kg/dag), justera för träningsmål
- Protein: basera på vikt och mål (1.2-2.2g/kg beroende på träningsnivå)
- Carbs: anpassa efter mål och aktivitetsnivå`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const json = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    const schedule = JSON.parse(json)
    return res.status(200).json(schedule)
  } catch (err) {
    console.error('generate-schedule error:', err)
    return res.status(500).json({ error: 'Kunde inte generera schema' })
  }
}
