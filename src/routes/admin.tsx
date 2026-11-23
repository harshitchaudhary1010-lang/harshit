import { createFileRoute, Link } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users, MapPin, Flag, CheckCircle2, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PortalShell, PageIntro } from '@/components/portal-shell';
import { CandidateEditor } from '@/components/candidate-editor';
import { CandidatePhoto } from '@/components/candidate-directory';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { candidatesQuery, pageHead, isDemo, saveRemoteCandidate, apiRequest, type Candidate, type CandidateInput } from '@/lib/candidates';
export const Route = createFileRoute('/admin')({ head: () => pageHead('Demo admin dashboard', 'Manage demonstration candidate profiles with the VoteInfo Nepal demo admin dashboard.'), loader: ({ context }) => context.queryClient.ensureQueryData(candidatesQuery), component: Admin });
function Admin() {
  const { data } = useSuspenseQuery(candidatesQuery);
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<{ candidate: Candidate | null } | null>(null);
  const [deleting, setDeleting] = useState<Candidate | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save(input: CandidateInput) {
    const id = editor?.candidate?.id;
    const now = new Date().toISOString();
    const candidate = isDemo ? { ...input, id: id ?? `sample-${crypto.randomUUID()}`, createdAt: editor?.candidate?.createdAt ?? now, updatedAt: now, isSample: true } : await saveRemoteCandidate(input, id);
    client.setQueryData(candidatesQuery.queryKey, (previous: Candidate[] | undefined) => id ? (previous ?? []).map(c => c.id === id ? candidate : c) : [...(previous ?? []), candidate]);
    toast.success(id ? 'Candidate updated successfully.' : 'Candidate added successfully.');
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true); setError('');
    try {
      if (!isDemo) await apiRequest(`/api/candidates/${encodeURIComponent(deleting.id)}`, 'DELETE');
      client.setQueryData(candidatesQuery.queryKey, (previous: Candidate[] | undefined) => (previous ?? []).filter(c => c.id !== deleting.id));
      toast.success('Candidate deleted successfully.'); setDeleting(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to delete candidate.'); } finally { setBusy(false); }
  }
  return <PortalShell><PageIntro eyebrow="DEMO ADMINISTRATION" title="Candidate management" description="Keep the candidate directory organized and up to date." action={<Button onClick={() => setEditor({ candidate: null })}><Plus/>Add candidate</Button>}/><div className="site-width py-8"><div className="flex gap-3 rounded-md border border-border bg-info-soft p-4 text-sm text-info"><CheckCircle2 className="mt-0.5 size-5 shrink-0"/><p>{isDemo ? <><strong>Demo workspace.</strong> Changes stay in this open session and reset when the page is refreshed. No real election records are changed.</> : <><strong>Connected API workspace.</strong> Changes are sent to your configured API. Your backend must enforce appropriate write authorization.</>}</p></div><div className="my-7 grid grid-cols-3 border-y border-border bg-card">{[{ icon: Users, title: 'Candidates', value: data.length }, { icon: MapPin, title: 'Constituencies', value: new Set(data.map(c => c.constituency)).size }, { icon: Flag, title: 'Parties', value: new Set(data.map(c => c.party)).size }].map(item => <div key={item.title} className="stat-item"><div className="stat-icon"><item.icon className="size-5"/></div><div><p className="text-2xl font-bold">{item.value}</p><p className="text-xs text-muted-foreground">{item.title}</p></div></div>)}</div><label className="mb-6 flex max-w-md items-center gap-3 rounded-md border border-border bg-card px-4"><Search className="size-4 text-muted-foreground"/><input className="h-11 w-full bg-transparent text-sm outline-none" aria-label="Search managed candidates" placeholder="Search candidates…" value={search} onChange={e => setSearch(e.target.value)}/></label><div className="overflow-x-auto rounded-md border border-border bg-card"><table className="admin-table"><thead><tr><th>Candidate</th><th>Party</th><th>Constituency</th><th>Symbol</th><th className="text-right">Actions</th></tr></thead><tbody>{data.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => <tr key={c.id}><td><Link to="/candidates/$id" params={{ id: c.id }} className="flex min-w-44 items-center gap-3"><CandidatePhoto candidate={c} className="size-10 rounded-full object-cover"/><div><p className="font-semibold">{c.name}</p>{c.isSample && <p className="text-[10px] text-muted-foreground">Sample profile</p>}</div></Link></td><td>{c.party}</td><td className="whitespace-nowrap">{c.constituency}</td><td>{c.symbol}</td><td><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${c.name}`} title="Edit candidate" onClick={() => setEditor({ candidate: c })}><Pencil/></Button><Button variant="ghost" size="icon" className="text-destructive" aria-label={`Delete ${c.name}`} title="Delete candidate" onClick={() => { setDeleting(c); setError(''); }}><Trash2/></Button></div></td></tr>)}{!data.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).length && <tr><td colSpan={5} className="text-center text-muted-foreground">No candidates found.</td></tr>}</tbody></table></div></div>{editor && <CandidateEditor key={editor.candidate?.id ?? 'new'} candidate={editor.candidate} open close={() => setEditor(null)} save={save}/>}<Dialog open={!!deleting} onOpenChange={value => { if (!value && !busy) setDeleting(null); }}><DialogContent className="w-[calc(100%-32px)]"><DialogTitle>Delete candidate?</DialogTitle><DialogDescription>Remove {deleting?.name} from the directory? This cannot be undone.</DialogDescription>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-3"><Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>Cancel</Button><Button variant="destructive" disabled={busy} onClick={remove}>{busy ? <LoaderCircle className="animate-spin"/> : <Trash2/>}Delete candidate</Button></div></DialogContent></Dialog></PortalShell>;
}