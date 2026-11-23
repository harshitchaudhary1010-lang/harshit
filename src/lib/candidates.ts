import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import photo1 from '@/assets/candidate-1.asset.json';
import photo2 from '@/assets/candidate-2.asset.json';
import photo3 from '@/assets/candidate-3.asset.json';
import photo4 from '@/assets/candidate-4.asset.json';
import photo5 from '@/assets/candidate-5.asset.json';
import photo6 from '@/assets/candidate-6.asset.json';

export const candidateSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters.').max(100),
  party: z.string().trim().min(2, 'Party is required.').max(100),
  constituency: z.string().trim().min(2, 'Constituency is required.').max(100),
  symbol: z.string().trim().min(1, 'Election symbol is required.').max(50),
  description: z.string().trim().min(10, 'Description must contain at least 10 characters.').max(3000),
  image: z.string().trim().refine(value => !value || value.startsWith('/__l5e/assets-v1/') || /^https:\/\//.test(value), 'Use an HTTPS image URL.'),
});
export type CandidateInput = z.infer<typeof candidateSchema>;
export type Candidate = CandidateInput & { id: string; createdAt: string; updatedAt: string; isSample: boolean };
const stamp = '2026-11-01T00:00:00.000Z';
const rows = [
  { name: 'Aarav Sharma', party: 'People’s Democratic Party', constituency: 'Kathmandu - 1', symbol: 'Tree', image: photo1.url },
  { name: 'Sushma Adhikari', party: 'Community Progress Party', constituency: 'Kathmandu - 2', symbol: 'Sun', image: photo2.url },
  { name: 'Bikash Thapa', party: 'Independent', constituency: 'Lalitpur - 1', symbol: 'Bell', image: photo3.url },
  { name: 'Anita Gurung', party: 'People’s Democratic Party', constituency: 'Bhaktapur - 1', symbol: 'Tree', image: photo4.url },
  { name: 'Prakash Karki', party: 'Community Progress Party', constituency: 'Kathmandu - 1', symbol: 'Sun', image: photo5.url },
  { name: 'Meena Shrestha', party: 'Independent', constituency: 'Lalitpur - 2', symbol: 'Bicycle', image: photo6.url },
];
export const sampleCandidates: Candidate[] = rows.map((row, index) => ({ ...row, id: `sample-${index + 1}`, description: `${row.name} is a fictional sample candidate representing ${row.constituency}. This demonstration profile highlights community development, accessible education, accountable local government, and better public services. The person, political party, and election details are illustrative only and do not represent a real candidate or election.`, createdAt: stamp, updatedAt: stamp, isSample: true }));
export const apiBase = (import.meta.env['VITE_API_URL'] as string | undefined)?.replace(/\/$/, '') ?? '';
export const isDemo = !apiBase;

function normalize(raw: unknown): Candidate {
  if (!raw || typeof raw !== 'object') throw new Error('The API returned an invalid candidate.');
  const r = raw as Record<string, unknown>;
  const input = candidateSchema.parse({ name: r['name'], party: r['party'], constituency: r['constituency'], symbol: r['symbol'], description: r['description'], image: r['image'] ?? '' });
  const id = r['id'] ?? r['_id'];
  if (typeof id !== 'string') throw new Error('Candidate ID is missing from the API response.');
  return { ...input, id, createdAt: typeof r['createdAt'] === 'string' ? r['createdAt'] : '', updatedAt: typeof r['updatedAt'] === 'string' ? r['updatedAt'] : '', isSample: r['isSample'] === true };
}
export async function apiRequest(path: string, method = 'GET', body?: CandidateInput): Promise<unknown> {
  const response = await fetch(`${apiBase}${path}`, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(12000) });
  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null);
    const message = result && typeof result === 'object' && 'message' in result && typeof result.message === 'string' ? result.message : `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}
export const candidatesQuery = queryOptions({
  queryKey: ['candidates'],
  queryFn: async (): Promise<Candidate[]> => {
    if (isDemo) return sampleCandidates;
    const result = await apiRequest('/api/candidates');
    const list = Array.isArray(result) ? result : result && typeof result === 'object' && 'data' in result ? result.data : result && typeof result === 'object' && 'candidates' in result ? result.candidates : null;
    if (!Array.isArray(list)) throw new Error('The API must return an array of candidates.');
    return list.map(normalize);
  },
  staleTime: Infinity,
  retry: 1,
});
export async function saveRemoteCandidate(input: CandidateInput, id?: string) {
  const result = await apiRequest(id ? `/api/candidates/${encodeURIComponent(id)}` : '/api/candidates', id ? 'PUT' : 'POST', input);
  return normalize(result && typeof result === 'object' && 'data' in result ? result.data : result);
}
export function filterCandidates(candidates: Candidate[], search: string, constituency: string, party: string) {
  return candidates.filter(candidate => candidate.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) && (!constituency || candidate.constituency === constituency) && (!party || candidate.party === party));
}
export function pageHead(title: string, description: string) {
  return { meta: [{ title: `${title} | VoteInfo Nepal` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} | VoteInfo Nepal` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}