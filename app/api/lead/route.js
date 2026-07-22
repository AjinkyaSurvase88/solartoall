import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const data = await req.json();
    
    if (!data.name || !data.email) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
    }

    // In a production environment, you would save this to Supabase or Firebase.
    // For this free setup, we will log it and save it locally to a mock database file.
    const leadEntry = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString()
    };

    const dbPath = path.join(process.cwd(), 'leads.json');
    let leads = [];
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf8');
      leads = JSON.parse(fileData);
    }
    
    leads.push(leadEntry);
    fs.writeFileSync(dbPath, JSON.stringify(leads, null, 2));

    console.log("New Lead Captured:", leadEntry);

    return NextResponse.json({ success: true, message: "Lead captured successfully!" });
  } catch (error) {
    console.error("Lead API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
