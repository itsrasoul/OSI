import { apiRequest } from './queryClient';

export function searchPerson(query: string) {
  try {
    const username = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    const findings = [];

    // Social Media Intelligence
    findings.push({
      category: "social_media",
      data: {
        platform: "Multiple Platforms",
        possible_profiles: [
          { name: 'LinkedIn', url: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}` },
          { name: 'Twitter', url: `https://twitter.com/search?q=${encodeURIComponent(query)}` },
          { name: 'Facebook', url: `https://www.facebook.com/search/top?q=${encodeURIComponent(query)}` },
          { name: 'Instagram', url: `https://www.instagram.com/${username}` },
          { name: 'GitHub', url: `https://github.com/${username}` },
          { name: 'Reddit', url: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}` },
        ],
        note: "Check these platforms for potential profiles"
      }
    });

    // Data Breach Intelligence
    findings.push({
      category: "search_results",
      data: {
        query: query,
        specialized_search: [
          { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com' },
          { name: 'DeHashed', url: 'https://dehashed.com' },
          { name: 'Intelligence X', url: 'https://intelx.io' },
          { name: 'Leak-Lookup', url: 'https://leak-lookup.com' },
        ],
        search_engines: [
          { name: 'Google', url: `https://www.google.com/search?q=${encodeURIComponent(`"${query}" OR "${username}"`)}` },
          { name: 'Bing', url: `https://www.bing.com/search?q=${encodeURIComponent(query)}` },
          { name: 'DuckDuckGo', url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}` },
          { name: 'Yandex', url: `https://yandex.com/search/?text=${encodeURIComponent(query)}` },
        ],
        note: "Check these sources for potential data breaches and online presence"
      }
    });

    // Domain Intelligence
    if (query.includes('@') || query.includes('.')) {
      const domain = query.includes('@') ? query.split('@')[1] : query;
      findings.push({
        category: "domains",
        data: {
          domain: domain,
          tools: [
            { name: 'WHOIS Lookup', url: `https://who.is/whois/${domain}` },
            { name: 'DNS Dumpster', url: 'https://dnsdumpster.com' },
            { name: 'SecurityTrails', url: `https://securitytrails.com/domain/${domain}/dns` },
            { name: 'Certificate Search', url: `https://crt.sh/?q=${domain}` },
          ],
          note: "Use these tools to investigate domain information"
        }
      });
    }

    // Professional Intelligence
    findings.push({
      category: "employment",
      data: {
        tools: [
          { name: 'Company House UK', url: 'https://find-and-update.company-information.service.gov.uk' },
          { name: 'OpenCorporates', url: 'https://opencorporates.com' },
          { name: 'LinkedIn Companies', url: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(query)}` },
        ],
        note: "Check these sources for professional and company information"
      }
    });

    return findings;
  } catch (error) {
    console.error("OSINT search preparation failed:", error);
    throw new Error("Failed to prepare intelligence gathering links");
  }
}