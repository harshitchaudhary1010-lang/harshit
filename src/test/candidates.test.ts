import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, candidateSchema, filterCandidates, sampleCandidates } from '@/lib/candidates';

afterEach(() => vi.unstubAllGlobals());
describe('Candidate rules', () => {
  it('searches candidates by name without case sensitivity', () => {
    expect(filterCandidates(sampleCandidates, ' aarav ', '', '').map(c => c.name)).toEqual(['Aarav Sharma']);
  });
  it('filters by the requested constituency', () => {
    expect(filterCandidates(sampleCandidates, '', 'Kathmandu - 1', '').map(c => c.name)).toEqual(['Aarav Sharma', 'Prakash Karki']);
  });
  it('combines party and constituency filters', () => {
    expect(filterCandidates(sampleCandidates, '', 'Kathmandu - 1', 'Community Progress Party').map(c => c.name)).toEqual(['Prakash Karki']);
  });
  it('marks every sample candidate as fictional sample data', () => {
    expect(sampleCandidates).toHaveLength(6);
    expect(sampleCandidates.filter(c => c.isSample)).toHaveLength(6);
  });
  it('requires all specified candidate information', () => {
    expect(candidateSchema.safeParse({ name: 'X', party: '', constituency: '', symbol: '', description: 'short', image: '' }).success).toBe(false);
    expect(candidateSchema.safeParse(sampleCandidates[0]).success).toBe(true);
  });
  it('rejects unsafe image URLs', () => {
    const first = sampleCandidates[0];
    if (!first) throw new Error('Missing fixture');
    expect(candidateSchema.safeParse({ ...first, image: 'javascript:alert(1)' }).success).toBe(false);
    expect(candidateSchema.safeParse({ ...first, image: 'https://example.com/portrait.jpg' }).success).toBe(true);
  });
});
describe('Existing REST API adapter', () => {
  it('sends candidate fields to the create endpoint', async () => {
    const candidate = sampleCandidates[0];
    if (!candidate) throw new Error('Missing fixture');
    const input = candidateSchema.parse(candidate);
    const mock = vi.fn().mockResolvedValue(new Response(JSON.stringify(candidate), { status: 201 }));
    vi.stubGlobal('fetch', mock);
    await apiRequest('/api/candidates', 'POST', input);
    expect(mock).toHaveBeenCalledWith('/api/candidates', expect.objectContaining({ method: 'POST', body: JSON.stringify(input) }));
  });
  it('surfaces failed API requests instead of pretending they succeeded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Candidate not found.' }), { status: 404 })));
    await expect(apiRequest('/api/candidates/missing')).rejects.toThrow('Candidate not found.');
  });
  it('handles a successful 204 delete', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(apiRequest('/api/candidates/test-id', 'DELETE')).resolves.toBeNull();
  });
});