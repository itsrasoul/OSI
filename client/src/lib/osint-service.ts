import { apiRequest } from './queryClient';

interface HunterResponse {
  data: {
    domain: string;
    disposition: string;
    pattern: string;
    organization: string;
    emails: Array<{
      value: string;
      type: string;
      confidence: number;
      sources: Array<{
        domain: string;
        uri: string;
        extracted_on: string;
      }>;
      first_name: string | null;
      last_name: string | null;
      position: string | null;
      seniority: string | null;
      department: string | null;
      linkedin: string | null;
      twitter: string | null;
      phone_number: string | null;
    }>;
  };
  meta: {
    results: number;
    limit: number;
    offset: number;
    params: {
      company: string;
      domain: string;
    };
  };
}

export async function searchPerson(query: string) {
  try {
    // Search for email pattern
    const isEmail = query.includes('@');
    const domain = isEmail ? query.split('@')[1] : '';
    const name = isEmail ? query.split('@')[0] : query;

    // Make Hunter.io API call
    const hunterUrl = `https://api.hunter.io/v2/domain-search?${domain ? `domain=${domain}` : `company=${encodeURIComponent(name)}`}`;
    const response = await fetch(hunterUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.HUNTER_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Hunter.io API error: ${response.status}`);
    }

    const hunterData = await response.json() as HunterResponse;
    const findings = [];

    // Process organization information if available
    if (hunterData.data?.organization) {
      findings.push({
        category: "personal_info",
        data: {
          name: name,
          organization: hunterData.data.organization,
          domain: hunterData.data.domain || 'Not found',
        }
      });
    }

    // Process email findings
    if (hunterData.data?.emails?.length > 0) {
      const emailFindings = hunterData.data.emails.map(email => ({
        position: email.position,
        confidence: email.confidence,
        linkedin: email.linkedin,
        twitter: email.twitter,
        department: email.department,
        seniority: email.seniority
      })).filter(data => Object.values(data).some(value => value !== null));

      if (emailFindings.length > 0) {
        findings.push({
          category: "employment",
          data: {
            company: hunterData.data.organization,
            position: emailFindings[0].position || 'Not found',
            seniority: emailFindings[0].seniority || 'Not found',
            department: emailFindings[0].department || 'Not found'
          }
        });

        findings.push({
          category: "social_media",
          data: {
            platform: "Multiple",
            linkedin: emailFindings[0].linkedin || 'Not found',
            twitter: emailFindings[0].twitter || 'Not found',
            confidence: `${emailFindings[0].confidence}%`
          }
        });
      }
    }

    // If no results found, add a general search result
    if (findings.length === 0) {
      findings.push({
        category: "search_results",
        data: {
          query: query,
          status: "No direct matches found",
          suggestion: "Try refining your search terms or using a company domain"
        }
      });
    }

    return findings;
  } catch (error) {
    console.error("OSINT search failed:", error);
    throw new Error("Failed to gather intelligence data");
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