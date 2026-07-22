import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { address } = await req.json();

    if (!address || !address.trim()) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    let lat = 12.9716; // default Bengaluru lat
    let lon = 77.5946; // default Bengaluru lon
    let displayName = address;

    // 1. Geocode with OpenStreetMap Nominatim
    try {
      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, {
        headers: {
          'User-Agent': 'SolarToAll-App/1.0 (https://solartoall.com)'
        }
      });
      const geoData = await geoResponse.json();

      if (geoData && geoData.length > 0) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
        displayName = geoData[0].display_name;
      }
    } catch (e) {
      console.warn("Nominatim Geocoding Warning:", e);
    }

    // 2. Fetch Solar Potential with NREL PVWatts API (or calculated fallback)
    const system_capacity = 4; // 4 kW baseline
    let ac_annual = null;

    try {
      const nrelApiKey = process.env.NREL_API_KEY || 'DEMO_KEY';
      const nrelUrl = `https://developer.nrel.gov/api/pvwatts/v8.json?api_key=${nrelApiKey}&lat=${lat}&lon=${lon}&system_capacity=${system_capacity}&azimuth=180&tilt=20&array_type=1&module_type=0&losses=14`;
      
      const nrelResponse = await fetch(nrelUrl);
      const nrelData = await nrelResponse.json();

      if (nrelData?.outputs?.ac_annual) {
        ac_annual = nrelData.outputs.ac_annual;
      }
    } catch (e) {
      console.warn("NREL PVWatts API Warning:", e);
    }

    // Fallback estimation if NREL API was unavailable or returned errors
    if (!ac_annual || ac_annual <= 0) {
      // Estimate based on solar irradiance (average ~4.2 kWh/kW/day to ~4.8 kWh/kW/day)
      const latAbs = Math.abs(lat);
      const dailyKwhPerKw = latAbs < 35 ? 4.4 : (latAbs < 50 ? 3.8 : 3.2);
      ac_annual = Math.round(system_capacity * dailyKwhPerKw * 365);
    }

    return NextResponse.json({
      location: displayName,
      lat,
      lon,
      estimated_annual_kwh: Math.round(ac_annual),
      estimated_system_size_kw: system_capacity,
      message: "Success"
    });

  } catch (error) {
    console.error("Solar API Exception:", error);
    return NextResponse.json({
      location: "Your Location",
      lat: 12.97,
      lon: 77.59,
      estimated_annual_kwh: 5840,
      estimated_system_size_kw: 4,
      message: "Fallback estimate"
    });
  }
}

