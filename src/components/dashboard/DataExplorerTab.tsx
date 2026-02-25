import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTrialsForExplorer, getEventsForExplorer } from '@/lib/analytics';
import { GAMES } from '@/lib/types';
import { Download, Search, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PAGE_SIZE = 25;

const DataExplorerTab = () => {
  const [tab, setTab] = useState('trials');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [trialPage, setTrialPage] = useState(0);
  const [eventPage, setEventPage] = useState(0);

  const trials = useMemo(() => getTrialsForExplorer({
    gameId: gameFilter !== 'all' ? gameFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }), [gameFilter, dateFrom, dateTo]);

  const events = useMemo(() => getEventsForExplorer({
    type: eventTypeFilter !== 'all' ? eventTypeFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }), [eventTypeFilter, dateFrom, dateTo]);

  const pagedTrials = trials.slice(trialPage * PAGE_SIZE, (trialPage + 1) * PAGE_SIZE);
  const pagedEvents = events.slice(eventPage * PAGE_SIZE, (eventPage + 1) * PAGE_SIZE);
  const totalTrialPages = Math.ceil(trials.length / PAGE_SIZE);
  const totalEventPages = Math.ceil(events.length / PAGE_SIZE);

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = (data: any[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-xs w-36" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-xs w-36" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Game</label>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {GAMES.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Event Type</label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {['session_start', 'session_end', 'game_start', 'game_end', 'trial_start', 'trial_end', 'rage_quit', 'hint_used'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => exportCSV(tab === 'trials' ? trials : events, `${tab}.csv`)}>
                <Download className="h-3 w-3" /> CSV
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => exportJSON(tab === 'trials' ? trials : events, `${tab}.json`)}>
                <Download className="h-3 w-3" /> JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="trials" className="text-xs gap-1"><Database className="h-3 w-3" /> Trials ({trials.length.toLocaleString()})</TabsTrigger>
          <TabsTrigger value="events" className="text-xs gap-1"><Search className="h-3 w-3" /> Events ({events.length.toLocaleString()})</TabsTrigger>
        </TabsList>

        <TabsContent value="trials">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      {['Time', 'Game', 'Correct', 'RT (ms)', 'Difficulty', 'Hints', 'Stimulus'].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedTrials.map(t => (
                      <tr key={t.id} className="border-b border-border/10 hover:bg-muted/10">
                        <td className="py-1.5 px-3 text-muted-foreground">{new Date(t.startedAt).toLocaleString()}</td>
                        <td className="py-1.5 px-3">{GAMES.find(g => g.id === t.gameId)?.name || t.gameId}</td>
                        <td className="py-1.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${t.correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {t.correct ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-1.5 px-3">{t.rtMs}</td>
                        <td className="py-1.5 px-3">{t.difficulty}</td>
                        <td className="py-1.5 px-3">{t.hintsUsed}</td>
                        <td className="py-1.5 px-3 text-muted-foreground">{t.stimulus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={trialPage} totalPages={totalTrialPages} setPage={setTrialPage} total={trials.length} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      {['Time', 'Type', 'Session', 'Game', 'Payload'].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedEvents.map(e => (
                      <tr key={e.id} className="border-b border-border/10 hover:bg-muted/10">
                        <td className="py-1.5 px-3 text-muted-foreground">{new Date(e.ts).toLocaleString()}</td>
                        <td className="py-1.5 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">{e.type}</span>
                        </td>
                        <td className="py-1.5 px-3 text-muted-foreground font-mono text-[10px]">{e.sessionId?.slice(0, 8) || '—'}</td>
                        <td className="py-1.5 px-3">{e.gameId ? (GAMES.find(g => g.id === e.gameId)?.name || e.gameId) : '—'}</td>
                        <td className="py-1.5 px-3 text-muted-foreground font-mono text-[10px] max-w-[200px] truncate">{JSON.stringify(e.payload)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={eventPage} totalPages={totalEventPages} setPage={setEventPage} total={events.length} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Example payload */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Example Event Payload</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg overflow-x-auto">
{JSON.stringify({
  id: "evt_abc123",
  userId: "user_001",
  sessionId: "sess_xyz",
  gameId: "n-back",
  ts: "2025-02-24T14:32:10.000Z",
  type: "game_end",
  payload: { accuracy: 0.82, medianRt: 645, trials: 30, difficulty: 4 }
}, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

function Pagination({ page, totalPages, setPage, total }: { page: number; totalPages: number; setPage: (p: number) => void; total: number }) {
  return (
    <div className="flex items-center justify-between p-3 border-t border-border/30">
      <span className="text-xs text-muted-foreground">{total.toLocaleString()} records</span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={page === 0} onClick={() => setPage(page - 1)}>
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <span className="text-xs text-muted-foreground">{page + 1} / {Math.max(1, totalPages)}</span>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export default DataExplorerTab;
