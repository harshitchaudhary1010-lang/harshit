import { createFileRoute } from "@tanstack/react-router";
import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowRight, Users, MapPin, Flag, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalShell } from '@/components/portal-shell';
import { CandidateDirectory } from '@/components/candidate-directory';
import { AnnouncementList } from '@/components/announcement-list';
import { candidatesQuery, pageHead } from '@/lib/candidates';
import panorama from '@/assets/nepal-panorama.asset.json';
export const Route = createFileRoute("/")({
  head: () => pageHead('Know your candidates. Make informed choices.', 'Explore Nepal’s election candidates, constituencies, and announcements with VoteInfo Nepal. Clearly labeled demonstration election directory.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(candidatesQuery),
  component: Index,
});
function Index() {
  const { data } = useSuspenseQuery(candidatesQuery);
  const stats = [{ icon: Users, label: 'Candidates', value: data.length, tone: '' }, { icon: MapPin, label: 'Constituencies', value: new Set(data.map(c => c.constituency)).size, tone: 'info' }, { icon: Flag, label: 'Political parties', value: new Set(data.filter(c => c.party !== 'Independent').map(c => c.party)).size, tone: 'success' }];
  return <PortalShell><section className="home-hero"><img src={panorama.url} className="hero-image" alt="Boudhanath stupa, Kathmandu rooftops, and Himalayan mountains" fetchPriority="high"/><div className="hero-shade"/><div className="site-width hero-content"><p className="hero-eyebrow eyebrow">NEPAL’S ELECTION INFORMATION PORTAL</p><h1 className="hero-title">Know your candidates.<br/>Make informed choices.</h1><p className="hero-subtitle">Get to know the people who seek to represent you. Explore candidates, constituencies, and election updates — all in one place.</p><div className="mt-7 flex flex-wrap gap-3"><Button asChild variant="hero"><Link to="/candidates">Explore candidates<ArrowRight/></Link></Button><Button asChild variant="heroOutline"><Link to="/announcements">Latest announcements</Link></Button></div><p className="mt-6 flex items-center gap-2 text-[11px] text-hero-muted"><ShieldCheck className="size-3.5"/>Independent. Accessible. Information for everyone.</p></div></section><section className="stat-strip"><div className="site-width grid grid-cols-3">{stats.map(stat => <div key={stat.label} className="stat-item"><div className={`stat-icon ${stat.tone}`}><stat.icon className="size-5"/></div><div><p className="font-display text-2xl font-extrabold leading-7">{String(stat.value).padStart(2, '0')}</p><p className="mt-1 text-[11px] text-muted-foreground">{stat.label}</p></div></div>)}</div></section><CandidateDirectory home/><AnnouncementList preview/></PortalShell>;
}
