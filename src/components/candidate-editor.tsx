import { useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { candidateSchema, type Candidate, type CandidateInput } from '@/lib/candidates';
const blank: CandidateInput = { name: '', party: '', constituency: '', symbol: '', description: '', image: '' };
export function CandidateEditor({ candidate, open, close, save }: { candidate: Candidate | null; open: boolean; close: () => void; save: (input: CandidateInput) => Promise<void> }) {
  const [form, setForm] = useState<CandidateInput>(candidate ?? blank);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    const parsed = candidateSchema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Please check all fields.'); return; }
    setBusy(true);
    try { await save(parsed.data); close(); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save candidate.'); } finally { setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={value => { if (!value && !busy) close(); }}><DialogContent className="max-h-[90dvh] w-[calc(100%-32px)] overflow-y-auto"><DialogTitle>{candidate ? 'Edit candidate' : 'Add candidate'}</DialogTitle><DialogDescription>Candidate details for the election information directory.</DialogDescription><form onSubmit={submit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2">{(['name', 'party', 'constituency', 'symbol'] as const).map(key => <label className="form-field" key={key}>{({ name: 'Full name', party: 'Political party', constituency: 'Constituency', symbol: 'Election symbol' })[key]}<input required maxLength={key === 'symbol' ? 50 : 100} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={key === 'constituency' ? 'e.g. Kathmandu - 1' : ''}/></label>)}</div><label className="form-field">Image URL (optional)<input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://…"/></label><label className="form-field">Description<textarea required minLength={10} maxLength={3000} rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-3 pt-2"><Button type="button" variant="outline" onClick={close} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy && <LoaderCircle className="animate-spin"/>}{busy ? 'Saving…' : 'Save candidate'}</Button></div></form></DialogContent></Dialog>;
}