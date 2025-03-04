import { apiRequest } from './queryClient';

interface HunterResponse {
  data: {
    email: string;
    score: number;
    position: string;
    company: string;
    linkedin?: string;
    twitter?: string;
    phone_number?: string;
  }[];
}

export async function searchPerson(query: string) {
  try {
    // Search for email pattern
    const isEmail = query.includes('@');
    const domain = isEmail ? query.split('@')[1] : '';
    const name = isEmail ? query.split('@')[0] : query;

    // Use Hunter.io API to gather information
    const hunterResponse = await fetch(
      `https://api.hunter.io/v2/domain-search?domain=${domain || ''}&company=${name}&api_key=${process.env.HUNTER_API_KEY}`
    );
    const hunterData: HunterResponse = await hunterResponse.json();

    const findings = [];

    // Process personal information
    findings.push({
      category: "personal_info",
      data: {
        name: name,
        occupation: hunterData.data?.[0]?.position || "Not found",
        company: hunterData.data?.[0]?.company || "Not found",
      }
    });

    // Process professional information
    if (hunterData.data?.length > 0) {
      findings.push({
        category: "employment",
        data: {
          company: hunterData.data[0].company,
          position: hunterData.data[0].position,
          linkedin_url: hunterData.data[0].linkedin || "Not found",
        }
      });
    }

    // Process social media information
    if (hunterData.data?.[0]) {
      const socialData = {
        platform: "Multiple",
        linkedin: hunterData.data[0].linkedin,
        twitter: hunterData.data[0].twitter,
      };

      findings.push({
        category: "social_media",
        data: socialData
      });
    }

    // Additional web search
    try {
      const searchResults = await performWebSearch(query);
      findings.push({
        category: "search_results",
        data: {
          search_engine: "Web Search",
          query: query,
          results: searchResults
        }
      });
    } catch (error) {
      console.error("Web search failed:", error);
    }

    return findings;
  } catch (error) {
    console.error("OSINT search failed:", error);
    throw error;
  }
}

async function performWebSearch(query: string) {
  // Here we'd integrate with a search API
  // For now, return placeholder data
  return [
    {
      title: `Search results for ${query}`,
      url: "Analyzing web presence...",
      description: "Gathering public information..."
    }
  ];
}