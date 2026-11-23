import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Search, MapPin, ChevronDown, ArrowRight, Users, TreePine, Sun, Bell, Bike, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { candidatesQuery, filterCandidates, type Candidate } from '@/lib/candidates';
import { DemoNotice } from './portal-shell';

export function SymbolIcon({ symbol, className = 'size-4' }: { symbol: string; className?: string }) {
  const Icon = ({ Tree: TreePine, Sun, Bell, Bicycle: Bike } as Record<string, typeof Flag>)[symbol] ?? Flag;
  return <Icon className={className}/>;
}
export function CandidatePhoto({ candidate, className = 'candidate-photo' }: { candidate: Candidate; className?: string }) {
  const [failed, setFailed] = useState(false);
  return candidate.image && !failed ? <img src={candidate.image} alt={candidate.name} className={className} loading="lazy" onError={() => setFailed(true)}/> : <div className={`${className} flex items-center justify-center font-display text-5xl text-muted-foreground`}>{candidate.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</div>;
}
export function CandidateCard({ candidate }: { candidate: Candidate }) {
  const partyClass = candidate.party.includes('Community') ? 'community' : candidate.party === 'Independent' ? 'independent' : '';
  return <article className="candidate-card"><div className="relative"><CandidatePhoto candidate={candidate}/>{candidate.isSample && <span className="sample-tag absolute right-3 top-3">SAMPLE PROFILE</span>}</div><div className="p-5"><span className={`party-tag ${partyClass}`}><span className="party-dot"/>{candidate.party}</span><h3 className="candidate-name mt-3">{candidate.name}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5"/>{candidate.constituency}</p><div className="mt-4 flex items-center gap-2 border-t border-border pt-3.5 text-xs text-muted-foreground"><SymbolIcon symbol={candidate.symbol}/><span>Election symbol</span><span className="ml-auto font-medium text-foreground">{candidate.symbol}</span></div><Button asChild variant="profile" className="mt-4 h-9 text-xs"><Link to="/candidates/$id" params={{ id: candidate.id }}>View profile<ArrowRight className="ml-auto size-3.5"/></Link></Button></div></article>;
}
export function CandidateDirectory({ home = false }: { home?: boolean }) {
  const { data } = useSuspenseQuery(candidatesQuery);
  const [search, setSearch] = useState('');
  const [constituency, setConstituency] = useState('');
  const [party, setParty] = useState('');
  const filtered = filterCandidates(data, search, constituency, party);
  const displayed = home && !search && !constituency && !party ? filtered.slice(0, 4) : filtered;
  const reset = () => { setSearch(''); setConstituency(''); setParty(''); };
  return <section className="site-width py-10" id="candidate-directory">
    {home && <div className="mb-6 flex items-start justify-between gap-4"><div><p className="eyebrow mb-2 text-primary">KNOW YOUR REPRESENTATIVES</p><h2 className="section-heading">Meet the candidates</h2><p className="mt-2 text-sm text-muted-foreground">Discover the people, parties, and priorities in your constituency.</p></div><Button asChild variant="link" className="hidden px-0 text-xs sm:inline-flex"><Link to="/candidates">All candidates<ArrowRight/></Link></Button></div>}
    <div className="search-bar"><label className="search-field"><Search className="size-4 shrink-0 text-muted-foreground"/><input aria-label="Search candidates by name" placeholder="Search candidates by name…" value={search} onChange={event => setSearch(event.target.value)}/></label><label className="filter-field"><MapPin className="size-4 shrink-0 text-muted-foreground"/><select aria-label="Filter by constituency" value={constituency} onChange={event => setConstituency(event.target.value)}><option value="">All constituencies</option>{[...new Set(data.map(c => c.constituency))].sort().map(value => <option key={value}>{value}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 size-3 text-muted-foreground"/></label><label className="filter-field"><Flag className="size-4 shrink-0 text-muted-foreground"/><select aria-label="Filter by party" value={party} onChange={event => setParty(event.target.value)}><option value="">All parties</option>{[...new Set(data.map(c => c.party))].sort().map(value => <option key={value}>{value}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 size-3 text-muted-foreground"/></label></div>
    <div className="my-5 flex items-center justify-between text-xs text-muted-foreground"><span>Showing <strong className="font-semibold text-foreground">{displayed.length}</strong> of {data.length} candidates</span><span className="flex items-center gap-1.5">{search || constituency || party ? <Button variant="link" size="sm" onClick={reset}>Clear filters</Button> : <><span className="size-1.5 rounded-full bg-success"/> {data.every(c => c.isSample) ? 'Sample election directory' : 'Candidate directory'}</>}</span></div>
    {displayed.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{displayed.map(candidate => <CandidateCard candidate={candidate} key={candidate.id}/>)}</div> : <div className="flex flex-col items-center gap-3 py-14 text-center"><Users className="size-9 text-muted-foreground"/><h3 className="font-semibold">No candidates found</h3><p className="text-sm text-muted-foreground">Try a different name, party, or constituency.</p><Button variant="outline" onClick={reset}>Clear filters</Button></div>}
    <div className="mt-6"><DemoNotice/></div>
  </section>;
}