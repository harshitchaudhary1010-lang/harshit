import { createFileRoute } from '@tanstack/react-router';
import { PortalShell, PageIntro } from '@/components/portal-shell';
import { CandidateDirectory } from '@/components/candidate-directory';
import { candidatesQuery, pageHead } from '@/lib/candidates';
export const Route = createFileRoute('/candidates/')({
  head: () => pageHead('Candidate directory', 'Search candidates by name and filter by constituency and political party. Explore candidate profiles on VoteInfo Nepal.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(candidatesQuery),
  component: () => <PortalShell><PageIntro eyebrow="KNOW YOUR REPRESENTATIVES" title="Candidate directory" description="Explore the people, parties, and priorities in your constituency."/><CandidateDirectory/></PortalShell>,
});