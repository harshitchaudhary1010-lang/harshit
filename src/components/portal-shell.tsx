import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ShieldCheck, Menu, X, Info } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { isDemo } from '@/lib/candidates';

export function Brand({ footer = false }: { footer?: boolean }) {
  return <Link to="/" className="flex items-center gap-2.5" aria-label="VoteInfo Nepal home">
    <svg className="brand-mark" viewBox="0 0 34 40" fill="none" aria-hidden="true"><path d="M4 2v35M6 3l23 12H6l24 16H6" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><path d="m12 8 3 1.5-2 1.5M12 22l4 2-3 2" stroke="currentColor" strokeWidth="2"/></svg>
    <span><span className={`block font-display text-[21px] font-extrabold ${footer ? 'text-hero-foreground' : 'text-foreground'}`}>VoteInfo <span className="text-primary">Nepal</span></span><span className={`block text-[9px] font-medium ${footer ? 'text-hero-muted' : 'text-muted-foreground'}`}>INFORMED CITIZENS. STRONGER DEMOCRACY.</span></span>
  </Link>;
}
const navLinks = [{ to: '/', label: 'Home' }, { to: '/candidates', label: 'Candidates' }, { to: '/announcements', label: 'Announcements' }, { to: '/about', label: 'About' }] as const;
export function PortalShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  return <>
    <header className="bg-card border-b border-border">
      <div className="site-width flex h-[80px] items-center justify-between gap-6">
        <Brand />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">{navLinks.map(link => <Link key={link.to} to={link.to} activeOptions={{ exact: true }} className="nav-link">{link.label}</Link>)}</nav>
        <Button asChild variant="outline" className="hidden h-9 text-xs md:inline-flex"><Link to="/admin"><ShieldCheck className="size-3.5"/>Demo Admin<ArrowUpRight className="size-3.5"/></Link></Button>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={menu ? 'Close navigation' : 'Open navigation'} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</Button>
      </div>
      {menu && <nav aria-label="Mobile navigation" className="site-width flex flex-col pb-4 md:hidden">{[...navLinks, { to: '/admin' as const, label: 'Demo Admin' }].map(link => <Link key={link.to} to={link.to} className="py-3 text-sm" onClick={() => setMenu(false)}>{link.label}</Link>)}</nav>}
    </header>
    <main>{children}</main>
    <footer className="mt-16 bg-navy text-hero-foreground">
      <div className="site-width flex flex-wrap items-start justify-between gap-8 py-10"><div><Brand footer/><p className="mt-4 max-w-xs text-xs leading-6 text-hero-muted">A step toward an informed Nepal.<br/>Independent information. Empowered citizens.</p></div><div className="flex gap-14 text-xs"><div><p className="mb-4 font-semibold">Explore</p><Link className="block mb-3 text-hero-muted" to="/candidates">Candidates</Link><Link className="text-hero-muted" to="/announcements">Announcements</Link></div><div><p className="mb-4 font-semibold">The portal</p><Link className="block mb-3 text-hero-muted" to="/about">About VoteInfo</Link><Link className="text-hero-muted" to="/admin">Demo Admin</Link></div></div></div>
      <div className="border-t border-hero-foreground/10"><div className="site-width flex flex-wrap justify-between gap-3 py-5 text-[11px] text-hero-muted"><span>© 2026 VoteInfo Nepal. Made for informed choices.</span><span>Information only. No online voting.</span></div></div>
    </footer>
  </>;
}
export function DemoNotice() {
  return isDemo ? <div className="flex items-start gap-2.5 rounded-md border border-border bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0"/><p><strong className="font-semibold text-foreground">Demonstration data.</strong> All candidates, parties, and election updates shown here are fictional samples, not official election information.</p></div> : null;
}
export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <section className="page-intro"><div className="site-width flex flex-wrap items-center justify-between gap-6"><div><p className="eyebrow mb-2 text-primary">{eyebrow}</p><h1>{title}</h1><p className="mt-3 text-sm text-muted-foreground">{description}</p></div>{action}</div></section>;
}