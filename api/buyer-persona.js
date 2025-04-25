// pages/api/generate-persona.js
export default async function handler(req, res) {
  // ——— CORS HEADERS ———
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  // ——————————————

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { product, targetMarket, valueProp } = req.body;

  if (!product || !targetMarket || !valueProp) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const prompt = `
You are a senior B2B strategist and outbound copywriter. Your task is to generate clear, actionable buyer personas that help sales teams write personalized cold emails and boost response rates.

You will receive:
- A product or service
- A target market
- A core value proposition

Using this, return a persona document structured like this:

---
**Buyer Persona Summary**  
- Persona Name: [e.g. “Ops-Focused Growth Marketer”]  
- Common Job Titles: [realistic titles from LinkedIn]  
- Department: [e.g. Marketing, Sales, Ops, RevOps, Product]  
- Typical Company Size: [e.g. 11–50, 200–500 employees]  
- Industry: [if relevant]  
- Tools They Use: [e.g. HubSpot, Salesforce, Notion, ZoomInfo]

**Key Goals**  
- [What this person is trying to achieve this quarter or year]  
- [Focus on strategic or operational outcomes]

**Pain Points**  
- [What they actually complain about in meetings or calls]  
- [Avoid generic problems — be specific to their job]

**KPIs They Care About**  
- [Real metrics they report on or care about in dashboards]

**Likely Objections**  
- [Reasons they might not reply or buy]  
- [Concerns they voice on calls]

**Best Outreach Angles**  
- [Approaches that resonate best in cold outreach]  
- [Emotional or strategic hooks to use in email copy]  
- [Based on persona psychology or work frustrations]

**Cold Email Hook Examples**  
- “${valueProp} without hiring another rep”  
- “Cut onboarding time for new hires by 30%”  
(Make them short, punchy, and relevant to the pain points)

---
Tone: Keep everything clear, specific, and 5th-grade readable. No sales fluff. No explanations. Just the persona.

Here’s the input:

Product/Service: ${product}  
Target Market: ${targetMarket}  
Main Value Proposition: ${valueProp}
`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-2024-07-18', // 💸 mini model
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();
    const output = data.choices?.[0]?.message?.content?.trim();

    if (!output) {
      return res.status(500).json({ error: 'Failed to generate persona.' });
    }

    return res.status(200).json({ persona: output });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error. Try again.' });
  }
}
