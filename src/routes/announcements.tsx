import { createFileRoute } from '@tanstack/react-router';
import { PortalShell, PageIntro, DemoNotice } from '@/components/portal-shell';
import { AnnouncementList } from '@/components/announcement-list';
import { pageHead } from '@/lib/candidates';
export const Route = createFileRoute('/announcements')({
  head: () => pageHead('Announcements', 'Read clearly labeled sample election announcements and find links to official Nepal election information.'),
  component: () => <PortalShell><PageIntro eyebrow="PORTAL UPDATES" title="Announcements" description="Information, notices, and updates for informed citizens."/><AnnouncementList/><div className="site-width"><DemoNotice/></div></PortalShell>,
});