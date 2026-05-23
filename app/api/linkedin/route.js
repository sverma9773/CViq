import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "LinkedIn URL is required" }, { status: 400 });
    }

    const match = url.match(/linkedin\.com\/in\/([\w-]+)/i);
    if (!match) {
      return NextResponse.json({ error: "Invalid LinkedIn profile URL format" }, { status: 400 });
    }

    const handle = match[1];
    const extractedName = handle
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    // ── Attempt direct public profile scraping ──────────────────────────
    // In production, developers use proxy services (Proxycurl, ScrapFly, RapidAPI)
    // to bypass LinkedIn's anti-bot system (which returns HTTP 999 or login redirect).
    // We attempt a fetch with standard browser headers to see if we can get HTML.
    try {
      const response = await fetch(`https://www.linkedin.com/in/${handle}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        next: { revalidate: 0 },
      });

      if (response.ok) {
        const html = await response.text();
        
        // Simple heuristic extraction of public meta tags
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        const metaDescMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) || 
                              html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);

        let jobTitle = "";
        let location = "";

        if (metaDescMatch) {
          const desc = metaDescMatch[1];
          // Example meta desc: "View Sunil Verma’s profile on LinkedIn, the world’s largest professional community. Sunil has 2 jobs listed on their profile..."
          // Or: "Sunil Verma | Senior Software Engineer at TechCorp | Delhi, India"
          const parts = desc.split(/[|•·-]/);
          if (parts.length >= 2) {
            jobTitle = parts[1].trim();
            if (parts[2]) location = parts[2].trim();
          }
        }

        return NextResponse.json({
          success: true,
          source: "direct_scrape",
          data: {
            fullName: extractedName,
            jobTitle: jobTitle || "Professional Specialist",
            email: `${handle.replace(/-/g, "")}@email.com`,
            location: location || "Remote",
            experience: [],
            education: [],
            skills: [],
          }
        });
      }
    } catch (e) {
      console.error("[LinkedIn API] Direct scraping attempted but blocked:", e.message);
    }

    // ── Fallback ────────────────────────────────────────────────────────
    // If blocked (expected behaviour without proxy/API subscriptions), we return
    // structured metadata so the client wizard can seamlessly offer 
    // PDF or Direct Text paste parse options for 100% accuracy.
    return NextResponse.json({
      success: false,
      error: "linkedin_blocked",
      message: "LinkedIn firewall blocks anonymous direct scraping.",
      extractedInfo: {
        fullName: extractedName,
        handle: handle
      }
    });

  } catch (error) {
    console.error("[LinkedIn API] Error:", error);
    return NextResponse.json({ error: "Failed to parse LinkedIn URL" }, { status: 500 });
  }
}
