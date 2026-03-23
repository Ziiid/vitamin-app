import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { age, sex, weight, height, goals } = req.body
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1)

  const prompt = `Du är en kunnig nutritionist. Baserat på följande personprofil ska du ge personliga kosttillskottsrekommendationer.

Profil:
- Ålder: ${age} år
- Kön: ${sex === 'male' ? 'Man' : 'Kvinna'}
- Vikt: ${weight} kg
- Längd: ${height} cm
- BMI: ${bmi}
- Hälsomål: ${goals.join(', ')}

Returnera ENBART ett JSON-objekt (ingen extra text) i exakt detta format:
{
  "summary": "En mening om varför dessa rekommendationer passar personen",
  "items": [
    {
      "id": "unikt_id",
      "name": "Vitaminets namn",
      "emoji": "ett emoji",
      "color": "#hexfärg (ljus pastellfärg)",
      "times": ["morning" och/eller "midday" och/eller "evening"],
      "withFood": true eller false,
      "dose": "dos som text, t.ex. '1000 mg' eller '2000 IE'",
      "why": "Kort förklaring varför just denna person behöver detta baserat på deras profil",
      "tip": "Praktiskt tips för intag",
      "conflicts": ["id på vitaminer som inte ska tas samtidigt"],
      "synergies": ["id på vitaminer som förstärker varandra"]
    }
  ]
}

Regler:
- Rekommendera 4–8 kosttillskott
- Anpassa dos efter ålder, kön och BMI
- Fokusera på mål: ${goals.join(', ')}
- Använd vetenskapligt underbyggda rekommendationer (NNR, NIH)
- "why" ska referera specifikt till personens profil (ålder, BMI, kön, mål)
- Tider: morning=morgon, midday=lunch, evening=kväll
- Inga vitaminer på natten`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const json = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  const schedule = JSON.parse(json)

  return res.status(200).json(schedule)
}
