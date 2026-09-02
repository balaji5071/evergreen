import { NextResponse } from "next/server";

// Common local landmarks & campus locations for instant search
const PRESET_LANDMARKS = [
  {
    title: "Kalasalingam Academy of Research and Education (KARE)",
    fullAddress: "Kalasalingam University Campus, Krishnankoil, Srivilliputhur, Tamil Nadu 626126",
    lat: 9.5303,
    lon: 77.6775,
    type: "Campus",
  },
  {
    title: "Kalasalingam University Hostel Block A / B / C",
    fullAddress: "Hostel Zone, Kalasalingam University Campus, Krishnankoil, Tamil Nadu 626126",
    lat: 9.5315,
    lon: 77.6782,
    type: "Campus",
  },
  {
    title: "Krishnankoil Bus Stop",
    fullAddress: "Main Road, Krishnankoil, Srivilliputhur, Tamil Nadu 626126",
    lat: 9.528,
    lon: 77.675,
    type: "Landmark",
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery || cleanQuery.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: any[] = [];
    const addedAddresses = new Set<string>();

    // 1. Check local preset campus landmarks first
    PRESET_LANDMARKS.forEach((preset) => {
      if (
        preset.title.toLowerCase().includes(cleanQuery) ||
        preset.fullAddress.toLowerCase().includes(cleanQuery)
      ) {
        results.push(preset);
        addedAddresses.add(preset.fullAddress);
      }
    });

    const isPincode = /^\d{3,6}$/.test(cleanQuery);

    if (isPincode) {
      // Fetch Indian Postal Pincode API (100% reliable for 6-digit Indian PIN codes)
      try {
        const pinRes = await fetch(`https://api.postalpincode.in/pincode/${cleanQuery}`);
        if (pinRes.ok) {
          const pinData = await pinRes.json();
          if (
            Array.isArray(pinData) &&
            pinData[0]?.Status === "Success" &&
            Array.isArray(pinData[0]?.PostOffice)
          ) {
            pinData[0].PostOffice.forEach((po: any) => {
              const fullAddr = `${po.Name}, ${po.District}, ${po.State} - ${po.Pincode}, India`;
              if (!addedAddresses.has(fullAddr)) {
                results.push({
                  id: `pin-${po.Name}-${po.Pincode}`,
                  title: `${po.Name} (${po.BranchType})`,
                  fullAddress: fullAddr,
                  type: "PIN Code",
                });
                addedAddresses.add(fullAddr);
              }
            });
          }
        }
      } catch (e) {
        console.error("Postal Pincode API error:", e);
      }
    }

    // 2. Query Photon (Komoot) Geocoder API (No 429 rate limit, high reliability)
    try {
      const photonRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          cleanQuery
        )}&limit=10&bbox=68,6,97,35`
      );
      if (photonRes.ok) {
        const photonData = await photonRes.json();
        if (photonData?.features && Array.isArray(photonData.features)) {
          photonData.features.forEach((feat: any) => {
            const props = feat.properties || {};
            const coords = feat.geometry?.coordinates || [];

            const title = props.name || props.street || props.city || cleanQuery;
            const parts = [
              props.name,
              props.street,
              props.district || props.suburb,
              props.city || props.county,
              props.state,
              props.postcode,
              props.country || "India",
            ].filter(Boolean);

            const fullAddress = parts.join(", ");

            if (fullAddress && !addedAddresses.has(fullAddress)) {
              results.push({
                id: props.osm_id ? String(props.osm_id) : Math.random().toString(),
                title: title,
                fullAddress: fullAddress,
                lat: coords[1],
                lon: coords[0],
                type: "Place",
              });
              addedAddresses.add(fullAddress);
            }
          });
        }
      }
    } catch (e) {
      console.error("Photon API error:", e);
    }

    // 3. Fallback to OpenStreetMap Nominatim with custom User-Agent
    if (results.length < 3) {
      try {
        const osmRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            cleanQuery
          )}&countrycodes=in&limit=8`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          }
        );
        if (osmRes.ok) {
          const osmData = await osmRes.json();
          if (Array.isArray(osmData)) {
            osmData.forEach((item: any) => {
              const fullAddr = item.display_name;
              if (!addedAddresses.has(fullAddr)) {
                results.push({
                  id: item.place_id ? String(item.place_id) : Math.random().toString(),
                  title: item.display_name.split(",")[0],
                  fullAddress: fullAddr,
                  lat: parseFloat(item.lat),
                  lon: parseFloat(item.lon),
                  type: "Landmark",
                });
                addedAddresses.add(fullAddr);
              }
            });
          }
        }
      } catch (e) {}
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Location search API error:", error);
    return NextResponse.json({ results: [] });
  }
}
