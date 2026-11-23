import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Flag, CalendarDays } from 'lucide-react';
import { PortalShell, DemoNotice } from '@/components/portal-shell';
import { CandidatePhoto, SymbolIcon } from '@/components/candidate-directory';
import { Button } from '@/components/ui/button';
import { candidatesQuery, pageHead } from '@/lib/candidates';
export const Route = createFileRoute('/candidates/$id')({
  head: () => pageHead('Candidate profile', 'Candidate background, constituency, political party, and election symbol on VoteInfo Nepal.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(candidatesQuery),
  component: Profile,
});
function Profile() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(candidatesQuery);
  const candidate = data.find(c => c.id === id);
  return <PortalShell><div className="site-width py-10"><Button asChild variant="link" className="mb-8 px-0"><Link to="/candidates"><ArrowLeft/>Back to candidates</Link></Button>{candidate ? <><div className="grid gap-10 md:grid-cols-[320px_1fr]"><div className="overflow-hidden rounded-lg"><CandidatePhoto candidate={candidate} className="aspect-[4/5] w-full object-cover"/></div><div className="py-2"><p className="eyebrow text-primary">{candidate.isSample ? 'FICTIONAL SAMPLE PROFILE' : 'CANDIDATE PROFILE'}</p><h1 className="mt-4 font-display text-4xl font-extrabold">{candidate.name}</h1><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Flag className="size-4"/>{candidate.party}</p><div className="my-6 flex flex-wrap gap-6 border-y border-border py-5 text-sm"><span className="flex items-center gap-2"><MapPin className="size-4 text-primary"/>{candidate.constituency}</span><span className="flex items-center gap-2"><SymbolIcon symbol={candidate.symbol}/>{candidate.symbol}</span></div><h2 className="text-xl font-bold">About the candidate</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">{candidate.description}</p>{candidate.updatedAt && <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-3.5"/>Profile updated {new Date(candidate.updatedAt).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</p>}</div></div><div className="mt-8"><DemoNotice/></div></> : <div className="py-20 text-center"><h1 className="text-2xl font-bold">Candidate not found</h1><p className="mt-3 text-muted-foreground">This profile may have been removed.</p><Button asChild className="mt-6"><Link to="/candidates">Browse candidates</Link></Button></div>}</div></PortalShell>;
}