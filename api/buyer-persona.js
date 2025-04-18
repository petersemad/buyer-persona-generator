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
You are a senior B2B strategist and outbound consultant. Your job is to generate detailed buyer personas for B2B sales and outbound marketing. You help founders, sales teams, and marketers deeply understand their ideal customers so they can personalize outreach and improve conversion rates.

When given a product, a target market, and a value proposition, you will return the following:

---
**Buyer Persona Summary**  
- Name: [persona label – e.g., “SaaS Growth Marketer”]  
- Job Titles: [relevant titles]  
- Department: [e.g. Marketing, Sales, RevOps]  
- Typical Company Size: [e.g., 11–50 employees]  
- Industry: [if applicable]

**Key Goals**  
- [goal 1]  
- [goal 2]  

**Pain Points**  
- [pain point 1]  
- [pain point 2]  

**KPIs They Care About**  
- [KPI 1]  
- [KPI 2]  

**Likely Objections**  
- [objection 1]  
- [objection 2]  

**Best Outreach Angles**  
- [angle 1]  
- [angle 2]  
- [angle 3]  

**Cold Email Hook Examples**  
- “[Hook line 1]”  
- “[Hook line 2]”

Be concise, avoid fluff, and don’t explain the format. Do not use sales talk. Prioritize strategic insights that can guide outbound messaging.

Generate a B2B buyer persona using the following details:

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
        model: 'gpt-4o-mini-2024-07-18', // 💸 use mini model
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
