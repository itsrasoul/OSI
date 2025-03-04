import { apiRequest } from './queryClient';

async function checkSocialPlatforms(username: string) {
  const platforms = [
    { name: 'GitHub', url: `https://github.com/${username}` },
    { name: 'Twitter', url: `https://twitter.com/${username}` },
    { name: 'LinkedIn', url: `https://linkedin.com/in/${username}` },
    { name: 'Instagram', url: `https://instagram.com/${username}` },
    { name: 'Medium', url: `https://medium.com/@${username}` },
    { name: 'Dev.to', url: `https://dev.to/${username}` }
  ];

  return {
    category: "social_media",
    data: {
      platform: "Multiple Platforms",
      username: username,
      possible_profiles: platforms.map(p => ({ platform: p.name, url: p.url })),
      note: "Check these potential profile URLs manually"
    }
  };
}

async function performDomainLookup(query: string) {
  const domain = query.includes('@') ? query.split('@')[1] : 
                query.includes('.') ? query : null;

  if (!domain) return null;

  return {
    category: "domains",
    data: {
      domain: domain,
      whois_lookup: `https://who.is/whois/${domain}`,
      dns_records: `https://dnsdumpster.com/`,
      ssl_info: `https://crt.sh/?q=${domain}`,
      note: "Use these tools to gather domain intelligence"
    }
  };
}

async function searchEmailBreaches(email: string) {
  if (!email.includes('@')) return null;

  return {
    category: "search_results",
    data: {
      email: email,
      breach_lookup: "https://haveibeenpwned.com/",
      paste_search: "https://psbdmp.ws/",
      note: "Check these databases for potential data breaches"
    }
  };
}

export async function searchPerson(query: string) {
  try {
    const findings = [];
    const username = query.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Basic information structure
    findings.push({
      category: "personal_info",
      data: {
        query: query,
        possible_name: query.includes('@') ? query.split('@')[0] : query,
        note: "Starting point for investigation"
      }
    });

    // Social media presence
    findings.push(await checkSocialPlatforms(username));

    // Domain information if applicable
    const domainInfo = await performDomainLookup(query);
    if (domainInfo) findings.push(domainInfo);

    // Email breach check if applicable
    const breachInfo = await searchEmailBreaches(query);
    if (breachInfo) findings.push(breachInfo);

    // Add search suggestions
    findings.push({
      category: "search_results",
      data: {
        query: query,
        search_engines: [
          { name: "Google Dorks", url: `https://www.google.com/search?q=intext:"${query}" OR inurl:"${username}"` },
          { name: "Yandex", url: `https://yandex.com/search/?text="${query}"` },
          { name: "DuckDuckGo", url: `https://duckduckgo.com/?q="${query}"` }
        ],
        archives: [
          { name: "Wayback Machine", url: `https://web.archive.org/web/*/${query}*` },
          { name: "Archive.today", url: `https://archive.today/` }
        ],
        note: "Use these resources for deeper investigation"
      }
    });

    return findings;
  } catch (error) {
    console.error("OSINT search failed:", error);
    throw new Error("Failed to gather intelligence data");
  }
}

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

async function performWebSearch(query: string) {
  //This function is not used anymore.
  return []
}