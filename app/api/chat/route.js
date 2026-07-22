import { NextResponse } from 'next/server';

// System Prompt for Solar AI Advisor
const SOLAR_SYSTEM_PROMPT = `You are a friendly, human-like Solar AI Advisor for Solar to All (solartoall.com). 
Your task is to give helpful, informative, and concise advice about solar energy, system sizing, costs, subsidies, and panel recommendations.

CRITICAL INSTRUCTIONS:
1. DO NOT USE double asterisks (**) or markdown bold formatting ANYWHERE in your response. Write in plain, clean text.
2. Keep your responses concise, warm, and natural — like a helpful human advisor texting a client. Avoid wall of text or long robotic introductions.
3. Be informative and accurate with numbers (100 sq ft per 1 kW, ~4 units/day per 1 kW, PM Surya Ghar subsidy up to Rs 78,000).

DOMAIN DATA FOR INDIA & GLOBAL SOLAR:
- 1.5-Ton AC needs ~3 kW to 4 kW system (6-8 panels of 540W).
- 1 kW produces ~4 units/day (~120 units/month). Needs 100 sq ft roof space.
- 1 kW costs ~Rs 55,000 (Subsidy: Rs 30,000). Net cost ~Rs 25,000.
- 2 kW costs ~Rs 1,15,000 (Subsidy: Rs 60,000). Net cost ~Rs 55,000.
- 3 kW costs ~Rs 1,70,000 (Subsidy: Rs 78,000 max). Net cost ~Rs 92,000.
- Top Brands: Waaree Mono PERC 540W, Tata Power Solar, Adani, Growatt & Luminous inverters.`;

// Post-processing function to guarantee NO ** formatting ever reaches the user
function sanitizeResponse(text) {
  if (!text) return "";
  return text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
}

// Rule-based human-like fallback when external APIs are offline
function getSmartFallbackReply(message) {
  const msg = (message || '').toLowerCase();
  const numberMatch = msg.match(/\b\d+\b/g);
  const val = numberMatch ? parseInt(numberMatch[0], 10) : null;

  // AC / Air Conditioner queries
  if (msg.includes('ac') || msg.includes('air conditioner') || msg.includes('ton')) {
    const tons = val && val <= 5 ? val : 1.5;
    const recommendedKw = Math.ceil(tons * 2.2);
    return `To run a ${tons} Ton AC smoothly along with your regular home load, I recommend a ${recommendedKw} kW solar system (around ${recommendedKw * 2} panels).\n\n` +
      `• Output: ~${recommendedKw * 4} to ${recommendedKw * 4.5} units/day\n` +
      `• Roof area needed: ~${recommendedKw * 100} sq. ft.\n` +
      `• Estimated cost: ~Rs ${recommendedKw * 55000} before subsidy (around Rs ${(recommendedKw * 55000) - 78000} net after PM Surya Ghar subsidy).\n\n` +
      `This will easily run your AC during daytime without drawing power from the grid!`;
  }

  // Bill Amount queries
  if (msg.includes('bill') || (val && val >= 500 && val <= 50000)) {
    const billAmt = val || 4000;
    const units = Math.round(billAmt / 7.5);
    const neededKw = Math.max(1, Math.ceil(units / 120));
    const subsidy = neededKw === 1 ? 30000 : (neededKw === 2 ? 60000 : 78000);
    const netCost = (neededKw * 58000) - subsidy;
    const monthlySavings = Math.round(billAmt * 0.85);

    return `For a monthly bill of Rs ${billAmt.toLocaleString()}, a ${neededKw} kW rooftop solar system is ideal for your home.\n\n` +
      `• Monthly savings: ~Rs ${monthlySavings.toLocaleString()} per month\n` +
      `• Govt subsidy: Rs ${subsidy.toLocaleString()}\n` +
      `• Net investment: ~Rs ${netCost.toLocaleString()}\n` +
      `• Payback time: ~3 to 3.5 years\n\n` +
      `You can also enter your address in our Solar Calculator above for a precise rooftop satellite analysis.`;
  }

  // Cost & Price queries
  if (msg.includes('cost') || msg.includes('price') || msg.includes('rate') || msg.includes('quotation') || msg.includes('expense')) {
    return `Here is the estimated rooftop solar pricing in India after PM Surya Ghar government subsidy:\n\n` +
      `• 1 kW system: ~Rs 25,000 net (Rs 30,000 subsidy)\n` +
      `• 2 kW system: ~Rs 55,000 net (Rs 60,000 subsidy)\n` +
      `• 3 kW system: ~Rs 92,000 net (Rs 78,000 max subsidy)\n` +
      `• 5 kW system: ~Rs 1,97,000 net (Rs 78,000 subsidy)\n\n` +
      `These estimates include panels, inverter, mounting structure, wiring, and net metering setup.`;
  }

  // Panel recommendations
  if (msg.includes('panel') || msg.includes('brand') || msg.includes('best') || msg.includes('waaree') || msg.includes('tata') || msg.includes('adani')) {
    return `For Indian homes, Monocrystalline PERC panels offer the best efficiency and value.\n\n` +
      `1. Waaree WS-540 / WS-440 (22.1% efficiency, high heat tolerance)\n` +
      `2. Tata Power Solar TP-530\n` +
      `3. Adani Solar Shine TOPCon panels\n` +
      `4. Luminous Mono PERC\n\n` +
      `Mono PERC panels perform extremely well even during peak summer heat and cloudy weather.`;
  }

  // Subsidies
  if (msg.includes('subsidy') || msg.includes('government') || msg.includes('scheme') || msg.includes('pm surya') || msg.includes('yojana')) {
    return `Under the PM Surya Ghar: Muft Bijli Yojana, residential subsidies are:\n\n` +
      `• 1 kW: Rs 30,000 subsidy\n` +
      `• 2 kW: Rs 60,000 subsidy\n` +
      `• 3 kW and above: Rs 78,000 max subsidy\n\n` +
      `Subsidies are transferred directly to your bank account after installation and net metering approval.`;
  }

  // Battery / Inverter
  if (msg.includes('battery') || msg.includes('inverter') || msg.includes('off grid') || msg.includes('hybrid') || msg.includes('backup')) {
    return `If power outages in your area are under 2 hours, an On-Grid system without batteries gives you the highest savings.\n\n` +
      `For frequent power cuts, a Hybrid system with Lithium-ion batteries will keep your lights and fans running seamlessly. Top inverter brands include Growatt, SolarEdge, Sungrow, and Luminous.`;
  }

  // Default response
  return `Hi! I can help you figure out the exact solar capacity, cost, savings, and government subsidies for your home.\n\n` +
    `What is your average monthly electricity bill, or what appliances (like AC or fridge) are you planning to run on solar?`;
}

export async function POST(req) {
  try {
    const { message, history } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    const xaiApiKey = process.env.XAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    // Check if any key starts with 'gsk_' (Groq key signature)
    const activeGroqKey = (groqApiKey && !groqApiKey.includes('your_') && groqApiKey.trim() !== '') ? groqApiKey
      : (xaiApiKey && xaiApiKey.startsWith('gsk_')) ? xaiApiKey
      : (geminiApiKey && geminiApiKey.startsWith('gsk_')) ? geminiApiKey
      : null;

    // 1. Try GROQ API
    if (activeGroqKey) {
      const groqModels = [
        process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'llama3-8b-8192',
        'mixtral-8x7b-32768'
      ];

      const formattedMessages = [
        { role: 'system', content: SOLAR_SYSTEM_PROMPT },
        ...(history || []).filter(msg => msg.content).map(msg => ({
          role: msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      for (const model of groqModels) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeGroqKey.trim()}`
            },
            body: JSON.stringify({
              model,
              messages: formattedMessages,
              temperature: 0.7,
              max_tokens: 300
            })
          });

          const data = await response.json();
          if (data.choices?.[0]?.message?.content) {
            return NextResponse.json({ reply: sanitizeResponse(data.choices[0].message.content) });
          }
        } catch (e) {
          console.warn(`Groq API model ${model} failed:`, e);
        }
      }
    }

    // 2. Try xAI Grok API
    if (xaiApiKey && !xaiApiKey.startsWith('gsk_') && !xaiApiKey.includes('your_') && xaiApiKey.trim() !== '') {
      try {
        const grokModel = process.env.GROK_MODEL || 'grok-2';
        const formattedMessages = [
          { role: 'system', content: SOLAR_SYSTEM_PROMPT },
          ...(history || []).filter(msg => msg.content).map(msg => ({
            role: msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user',
            content: msg.content
          })),
          { role: 'user', content: message }
        ];

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${xaiApiKey.trim()}`
          },
          body: JSON.stringify({
            model: grokModel,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 300
          })
        });

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return NextResponse.json({ reply: sanitizeResponse(data.choices[0].message.content) });
        }
      } catch (e) {
        console.warn("Grok API call failed:", e);
      }
    }

    // 3. Try Gemini API
    if (geminiApiKey && !geminiApiKey.startsWith('gsk_') && !geminiApiKey.includes('your_') && geminiApiKey.trim() !== '') {
      try {
        const contents = (history || []).filter(msg => msg.content).map(msg => ({
          role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: SOLAR_SYSTEM_PROMPT }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
          })
        });

        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ reply: sanitizeResponse(data.candidates[0].content.parts[0].text) });
        }
      } catch (e) {
        console.warn("Gemini API call failed:", e);
      }
    }

    // 4. Smart Solar AI fallback mode
    const fallbackReply = getSmartFallbackReply(message);
    return NextResponse.json({ reply: sanitizeResponse(fallbackReply) });

  } catch (error) {
    console.error("Chat API Exception:", error);
    return NextResponse.json({ reply: sanitizeResponse(getSmartFallbackReply(message)) });
  }
}




