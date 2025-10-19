import * as React from 'react'
import { TopBar } from './TopBar'
import { ContentProvider } from './providers/ContentProvider'
import { CursorDot } from './CursorDot'
import { CommandPalette } from '../components/CommandPalette'
import { Toaster, useToast } from '../components/ui/toast'
import { MarketTicker } from '../components/MarketTicker'

type TalentTab = 'overview' | 'pipeline' | 'compensation' | 'programs'

type TalentRole = {
  id: string
  title: string
  squad: string
  priority: 'Critical' | 'High' | 'Medium'
  salaryRange: string
  hiringManager: string
  status: 'Open' | 'On Hold' | 'Signed'
  velocity: number
  openings: number
  signals: string[]
}

type Candidate = {
  id: string
  name: string
  targetRole: string
  score: number
  availability: string
  expectation: string
  tags: string[]
  sentiment: 'Hot' | 'Warm' | 'Cooling'
}

type PipelineStage = {
  id: string
  label: string
  description: string
  candidates: Candidate[]
  wipLimit: number
}

const TALENT_TABS: { id: TalentTab; label: string }[] = [
  { id: 'overview', label: 'Control Deck' },
  { id: 'pipeline', label: 'Pipeline Ops' },
  { id: 'compensation', label: 'Comp & Offers' },
  { id: 'programs', label: 'Guild Programs' },
]

const TALENT_ROLES: TalentRole[] = [
  {
    id: 'quant-lead',
    title: 'Quant Systems Lead',
    squad: 'Trading Intelligence',
    priority: 'Critical',
    salaryRange: '$210-250k + 0.18%',
    hiringManager: 'Jonah Park',
    status: 'Open',
    velocity: 28,
    openings: 1,
    signals: ['Builds pricing engine 2.0', 'Owns latency risk', 'Pairs with data guild'],
  },
  {
    id: 'growth-strategist',
    title: 'Growth Strategist',
    squad: 'Expansion Pods',
    priority: 'High',
    salaryRange: '$160-190k + 0.12%',
    hiringManager: 'Selene Osei',
    status: 'Open',
    velocity: 34,
    openings: 2,
    signals: ['Uncaps referral economy', 'Owns liveops cadences', 'Links to revenue playbooks'],
  },
  {
    id: 'security-engineer',
    title: 'Security Engineer',
    squad: 'Risk Shield',
    priority: 'High',
    salaryRange: '$190-220k + 0.10%',
    hiringManager: 'Diego Morales',
    status: 'On Hold',
    velocity: 42,
    openings: 1,
    signals: ['Audit derivatives launch', 'Threat modeling', 'Red-team automation'],
  },
]

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'sourced',
    label: 'Sourced',
    description: 'Fresh leads queued by scouts & warm intros.',
    wipLimit: 12,
    candidates: [
      { id: 'cand-a', name: 'Ivy Laurent', targetRole: 'Quant Systems Lead', score: 74, availability: '2 weeks', expectation: '$235k + tokens', tags: ['Citadel', 'Rust'], sentiment: 'Warm' },
      { id: 'cand-b', name: 'Marcus Leone', targetRole: 'Growth Strategist', score: 68, availability: 'Immediate', expectation: '$180k + 0.1%', tags: ['Notion', 'Growth loops'], sentiment: 'Hot' },
    ],
  },
  {
    id: 'interview',
    label: 'Interview Loop',
    description: 'Live interviews + case simulation underway.',
    wipLimit: 8,
    candidates: [
      { id: 'cand-c', name: 'Sasha Kapoor', targetRole: 'Quant Systems Lead', score: 82, availability: '30 days', expectation: '$245k', tags: ['Two Sigma', 'ML Infra'], sentiment: 'Hot' },
      { id: 'cand-d', name: 'Elaine Rivers', targetRole: 'Security Engineer', score: 71, availability: 'Notice 4 weeks', expectation: '$205k', tags: ['Stripe', 'AppSec'], sentiment: 'Warm' },
    ],
  },
  {
    id: 'offer',
    label: 'Offer Desk',
    description: 'Final offers staged with comp committee.',
    wipLimit: 4,
    candidates: [
      { id: 'cand-e', name: 'Kenji Morita', targetRole: 'Growth Strategist', score: 88, availability: 'US relocation', expectation: '$185k + 0.15%', tags: ['Gojek', 'Economist'], sentiment: 'Hot' },
    ],
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    description: 'Signed offers prepping for day-0 ramp.',
    wipLimit: 6,
    candidates: [
      { id: 'cand-f', name: 'Rhea Patel', targetRole: 'Growth Strategist', score: 91, availability: 'Signed', expectation: '$178k', tags: ['Shopify', 'Product-led'], sentiment: 'Hot' },
    ],
  },
]

const COMPENSATION_BANDS = [
  { band: 'Level 6', cash: '$210k', equity: '0.18%', bonus: '15%', roles: ['Quant Systems Lead', 'Security Engineer'] },
  { band: 'Level 5', cash: '$175k', equity: '0.12%', bonus: '12%', roles: ['Growth Strategist', 'Senior PM'] },
  { band: 'Level 4', cash: '$145k', equity: '0.08%', bonus: '10%', roles: ['Growth Ops Analyst', 'Enablement Lead'] },
]

type ProgramTrack = {
  id: string
  title: string
  description: string
  status: string
  metrics: Array<{ label: string; value: string }>
}

const PROGRAM_TRACKS: ProgramTrack[] = [
  {
    id: 'guild-scouts',
    title: 'Guild Scouts',
    description: 'Community-driven sourcing sprint with referral bounties and leaderboard rewards.',
    status: 'Online',
    metrics: [
      { label: 'Participants', value: '58' },
      { label: 'Converted', value: '7' },
      { label: 'Velocity', value: '+18%' },
    ],
  },
  {
    id: 'academy',
    title: 'Operator Academy',
    description: 'Intensive two-week onboarding for strategic roles, pairing mentors with new hires.',
    status: 'Prepping',
    metrics: [
      { label: 'Cohort', value: '12' },
      { label: 'Mentors', value: '6' },
      { label: 'Satisfaction', value: '93%' },
    ],
  },
  {
    id: 'summer-game',
    title: 'Summer Simulation',
    description: 'Gamified internship program with live trading quests and squad rotations.',
    status: 'Drafting',
    metrics: [
      { label: 'Slots', value: '10' },
      { label: 'Applicants', value: '540' },
      { label: 'Conversion', value: 'Top 2%' },
    ],
  },
]

export function Talent() {
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const { notify } = useToast()
  const [activeTab, setActiveTab] = React.useState<TalentTab>('overview')
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>(TALENT_ROLES[0]?.id ?? '')
  const [selectedStageId, setSelectedStageId] = React.useState<string>(PIPELINE_STAGES[0]?.id ?? '')
  const [autoOutreach, setAutoOutreach] = React.useState(true)
  const [budgetGuardrail, setBudgetGuardrail] = React.useState(68)

  React.useEffect(() => {
    const root = document.getElementById('root')
    if (root) root.classList.add('cursor-dot-enabled')
    document.body.classList.add('cursor-dot-enabled')
    return () => {
      if (root) root.classList.remove('cursor-dot-enabled')
      document.body.classList.remove('cursor-dot-enabled')
    }
  }, [])

  React.useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  const selectedRole = React.useMemo(() => {
    if (!TALENT_ROLES.length) return null
    const role = TALENT_ROLES.find((item) => item.id === selectedRoleId) ?? TALENT_ROLES[0]
    return role ?? null
  }, [selectedRoleId])
  const stages = React.useMemo(() => PIPELINE_STAGES, [])
  const selectedStage = React.useMemo(() => {
    if (!stages.length) return null
    const stage = stages.find((item) => item.id === selectedStageId) ?? stages[0]
    return stage ?? null
  }, [stages, selectedStageId])

  const candidateCount = stages.reduce((total, stage) => total + stage.candidates.length, 0)
  const hotCandidates = stages.reduce((total, stage) => total + stage.candidates.filter((candidate) => candidate.sentiment === 'Hot').length, 0)

  const offerRate = React.useMemo(() => {
    const offerStage = stages.find((stage) => stage.id === 'offer')
    if (!offerStage) return 0
    const totalAdvanced = stages.filter((stage) => stage.id !== 'sourced').reduce((sum, stage) => sum + stage.candidates.length, 0)
    return totalAdvanced ? Math.round((offerStage.candidates.length / totalAdvanced) * 100) : 0
  }, [stages])

  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <Toaster>
        <ContentProvider>
          <TopBar onOpenPalette={() => setPaletteOpen(true)} />
          <div className="pt-20 h-[calc(100vh-80px)] w-full px-4 lg:px-8 pb-8">
            <div className="grid h-full gap-6 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
              <aside className="glass rounded-xl border border-white/10 overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-white/10">
                  <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Talent Command</div>
                  <div className="text-lg font-semibold text-foreground/90">Open Roles</div>
                </div>
                <div className="flex-1 overflow-auto thin-scroll px-5 pb-6 space-y-4">
                  {TALENT_ROLES.map((role) => {
                    const active = role.id === selectedRoleId
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`w-full rounded-lg border p-5 text-left transition ${
                          active ? 'border-accent/70 bg-accent/15 shadow-lg shadow-accent/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                        data-cursor="interactive"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-sm font-semibold text-foreground/90">{role.title}</div>
                          <span
                            className={`text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded ${
                              role.priority === 'Critical'
                                ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                                : role.priority === 'High'
                                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                                  : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                            }`}
                          >
                            {role.priority}
                          </span>
                        </div>
                        <div className="text-xs text-foreground/60 mt-2">{role.squad}</div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-foreground/60">
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                            {role.openings} openings
                          </span>
                          <span className="flex items-center gap-1 justify-end">
                            <span className="text-foreground/50">{role.status}</span>
                          </span>
                          <span className="col-span-2 text-foreground/60">Fill velocity {role.velocity}d</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </aside>
              <section className="glass rounded-xl border border-white/10 overflow-hidden flex flex-col">
                <TalentTabs activeTab={activeTab} onChange={setActiveTab} />
                <div className="flex-1 min-h-0 overflow-auto px-5 md:px-7 pb-6">
                  {activeTab === 'overview' && (
                    <OverviewPanel
                      candidateCount={candidateCount}
                      hotCandidates={hotCandidates}
                      offerRate={offerRate}
                      autoOutreach={autoOutreach}
                      onToggleOutreach={() => {
                        setAutoOutreach((prev) => !prev)
                        notify(`Auto outreach ${!autoOutreach ? 'enabled' : 'paused'}`)
                      }}
                      selectedRole={selectedRole}
                    />
                  )}
                  {activeTab === 'pipeline' && (
                    <PipelinePanel
                      stages={stages}
                      selectedStageId={selectedStageId}
                      onSelectStage={setSelectedStageId}
                      onAdvance={(candidate) => notify(`Advanced ${candidate.name} to next stage`)}
                    />
                  )}
                  {activeTab === 'compensation' && (
                    <CompensationPanel
                      bands={COMPENSATION_BANDS}
                      guardrail={budgetGuardrail}
                      onGuardrailChange={(value) => setBudgetGuardrail(value)}
                      onIssueOffer={(summary) => notify(summary)}
                    />
                  )}
                  {activeTab === 'programs' && (
                    <ProgramsPanel
                      programs={PROGRAM_TRACKS}
                      onActivate={(program) => notify(`Program ${program.title} activated`)}
                    />
                  )}
                </div>
              </section>
              <aside className="glass rounded-xl border border-white/10 overflow-hidden flex flex-col">
                <TalentControlRail
                  stage={selectedStage}
                  autoOutreach={autoOutreach}
                  onOutreach={() => notify('Pulse sent to top prospects')}
                  onNudgeHiringManager={() => notify('Hiring manager nudged with latest telemetry')}
                />
              </aside>
            </div>
          </div>
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
          <MarketTicker />
          <CursorDot />
        </ContentProvider>
      </Toaster>
    </div>
  )
}

function TalentTabs({ activeTab, onChange }: { activeTab: TalentTab; onChange: (tab: TalentTab) => void }) {
  return (
    <div className="px-5 py-4 border-b border-white/10 flex flex-wrap gap-2.5">
      {TALENT_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-[0.12em] ${
            activeTab === tab.id ? 'bg-accent text-[hsl(20,14%,4%)]' : 'bg-white/10 text-foreground/60 hover:bg-white/15'
          }`}
          data-cursor="interactive"
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function OverviewPanel({
  candidateCount,
  hotCandidates,
  offerRate,
  autoOutreach,
  onToggleOutreach,
  selectedRole,
}: {
  candidateCount: number
  hotCandidates: number
  offerRate: number
  autoOutreach: boolean
  onToggleOutreach: () => void
  selectedRole: TalentRole | null
}) {
  return (
    <div className="py-6 space-y-6">
      <div className="grid sm:grid-cols-3 gap-5">
        <OverviewStat label="Active Candidates" value={candidateCount.toString()} delta="+12%" tone="bg-emerald-500/70" />
        <OverviewStat label="Hot Leads" value={hotCandidates.toString()} delta="+3 this week" tone="bg-amber-500/70" />
        <OverviewStat label="Offer Conversion" value={`${offerRate}%`} delta="Target 35%" tone="bg-sky-500/70" />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 md:p-6 grid md:grid-cols-[minmax(0,1fr)_240px] gap-5">
        <div className="space-y-4 text-sm text-foreground/70">
          <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Role Spotlight</div>
          {selectedRole ? (
            <>
              <div className="text-lg font-semibold text-foreground/90">{selectedRole.title}</div>
              <p>
                Squad {selectedRole.squad}. Fill velocity at {selectedRole.velocity} days. {selectedRole.signals[0]}.
              </p>
              <p>Signals: {selectedRole.signals.join(' · ')}.</p>
            </>
          ) : (
            <p>No priority role selected yet. Add a role to unlock live telemetry.</p>
          )}
        </div>
        <div className="rounded-lg border border-white/10 bg-background/70 p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-[0.14em] text-foreground/50">Auto Outreach</span>
            <span className={`text-[11px] font-semibold ${autoOutreach ? 'text-emerald-300' : 'text-foreground/50'}`}>{autoOutreach ? 'ONLINE' : 'PAUSED'}</span>
          </div>
          <p className="text-foreground/60">
            Auto outreach syncs leads from warm intros and runs persona-driven sequences. Pause if you need manual calibration.
          </p>
          <button
            className="w-full rounded-md bg-emerald-500/80 text-foreground font-semibold text-xs tracking-[0.12em] py-1.5 hover:bg-emerald-500/70"
            onClick={onToggleOutreach}
            data-cursor="interactive"
          >
            {autoOutreach ? 'Pause Sequence' : 'Enable Auto Outreach'}
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 md:p-6 text-sm text-foreground/70">
        <div className="text-xs uppercase tracking-[0.14em] text-foreground/50 mb-3">Weekly Focus</div>
        <ul className="space-y-3 list-disc list-inside">
          <li>Ship async case study for quant finalists, align scoring rubric with strategy guild.</li>
          <li>Spin up joint touchpoint with community guild to amplify referral leaderboard.</li>
          <li>Refresh compensation intel vs. trading desk benchmarks; lock in offer guardrails.</li>
        </ul>
      </div>
    </div>
  )
}

function OverviewStat({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
      <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">{label}</div>
      <div className="text-2xl font-semibold text-foreground/90">{value}</div>
      <div className="text-[11px] text-foreground/60">{delta}</div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: '75%' }} />
      </div>
    </div>
  )
}

function PipelinePanel({
  stages,
  selectedStageId,
  onSelectStage,
  onAdvance,
}: {
  stages: PipelineStage[]
  selectedStageId: string
  onSelectStage: (stageId: string) => void
  onAdvance: (candidate: Candidate) => void
}) {
  const selectedStage = stages.find((stage) => stage.id === selectedStageId) ?? stages[0]
  if (!selectedStage) {
    return (
      <div className="py-6">
        <div className="rounded-xl border border-dashed border-white/20 p-6 text-sm text-foreground/60">No pipeline data configured yet.</div>
      </div>
    )
  }
  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-wrap gap-2.5">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => onSelectStage(stage.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-[0.12em] ${
              stage.id === selectedStageId ? 'bg-accent text-[hsl(20,14%,4%)]' : 'bg-white/10 text-foreground/60 hover:bg-white/15'
            }`}
            data-cursor="interactive"
          >
            {stage.label}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 md:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground/80">{selectedStage.label}</div>
            <div className="text-xs text-foreground/60">{selectedStage.description}</div>
          </div>
          <div className="text-xs text-foreground/60">
            WIP Limit {selectedStage.candidates.length}/{selectedStage.wipLimit}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {selectedStage.candidates.map((candidate) => (
            <div key={candidate.id} className="rounded-lg border border-white/10 bg-background/70 p-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-foreground/90">{candidate.name}</div>
                  <div className="text-xs text-foreground/60">{candidate.targetRole}</div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded ${
                    candidate.sentiment === 'Hot'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                      : candidate.sentiment === 'Warm'
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                        : 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                  }`}
                >
                  {candidate.sentiment}
                </span>
              </div>
              <div className="text-xs text-foreground/60">Score {candidate.score} · Availability {candidate.availability}</div>
              <div className="flex flex-wrap gap-2 text-[11px] text-foreground/60">
                {candidate.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-white/10 border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-xs text-foreground/60">Expectation {candidate.expectation}</div>
              <button
                className="w-full rounded-md bg-emerald-500/80 text-foreground font-semibold text-xs tracking-[0.12em] py-1.5 hover:bg-emerald-500/70"
                onClick={() => onAdvance(candidate)}
                data-cursor="interactive"
              >
                Advance to next stage
              </button>
            </div>
          ))}
          {selectedStage.candidates.length === 0 && (
            <div className="rounded-lg border border-dashed border-white/20 p-6 text-xs text-foreground/60">No candidates in this stage yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function CompensationPanel({
  bands,
  guardrail,
  onGuardrailChange,
  onIssueOffer,
}: {
  bands: { band: string; cash: string; equity: string; bonus: string; roles: string[] }[]
  guardrail: number
  onGuardrailChange: (value: number) => void
  onIssueOffer: (summary: string) => void
}) {
  return (
    <div className="py-6 space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 md:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Budget Guardrail</div>
            <div className="text-sm text-foreground/70">Defines auto-approval threshold for offers vs. finance committee.</div>
          </div>
          <div className="text-sm font-semibold text-foreground/80">{guardrail}%</div>
        </div>
        <input type="range" min={40} max={90} value={guardrail} onChange={(event) => onGuardrailChange(Number(event.target.value))} className="w-full accent-emerald-500" />
        <div className="text-xs text-foreground/60">Above guardrail routes to finance review. Keep below to streamline close velocity.</div>
      </div>
      <div className="space-y-4">
        {bands.map((band) => (
          <div key={band.band} className="rounded-xl border border-white/10 bg-white/5 p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-foreground/90">{band.band}</div>
                <div className="text-xs text-foreground/60">Roles: {band.roles.join(', ')}</div>
              </div>
              <div className="text-xs text-foreground/60">
                Cash {band.cash} · Equity {band.equity} · Bonus {band.bonus}
              </div>
            </div>
            <button
              className="mt-3 rounded-md bg-sky-500/80 text-foreground font-semibold text-xs tracking-[0.12em] px-3 py-1.5 hover:bg-sky-500/70"
              onClick={() => onIssueOffer(`Offer drafted for ${band.band}`)}
              data-cursor="interactive"
            >
              Draft Offer Packet
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgramsPanel({ programs, onActivate }: { programs: ProgramTrack[]; onActivate: (program: ProgramTrack) => void }) {
  return (
    <div className="py-6 space-y-5">
      {programs.map((program) => (
        <div key={program.id} className="rounded-xl border border-white/10 bg-white/5 p-5 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-foreground/90">{program.title}</div>
              <div className="text-xs text-foreground/60">{program.description}</div>
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded bg-white/10 border border-white/10">{program.status}</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-foreground/60">
            {program.metrics.map((metric) => (
              <div key={metric.label} className="rounded-md border border-white/10 bg-background/60 px-4 py-3">
                <div className="uppercase tracking-[0.12em] text-[10px] text-foreground/50">{metric.label}</div>
                <div className="text-sm text-foreground/80">{metric.value}</div>
              </div>
            ))}
          </div>
          <button
            className="rounded-md bg-emerald-500/80 text-foreground font-semibold text-xs tracking-[0.12em] px-3 py-1.5 hover:bg-emerald-500/70"
            onClick={() => onActivate(program)}
            data-cursor="interactive"
          >
            Activate Program
          </button>
        </div>
      ))}
    </div>
  )
}

function TalentControlRail({
  stage,
  autoOutreach,
  onOutreach,
  onNudgeHiringManager,
}: {
  stage: PipelineStage | null
  autoOutreach: boolean
  onOutreach: () => void
  onNudgeHiringManager: () => void
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-5 py-4 border-b border-white/10">
        <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Ops Rail</div>
        <div className="text-lg font-semibold text-foreground/90">Live Signals</div>
      </div>
      <div className="flex-1 overflow-auto thin-scroll px-5 pb-6 space-y-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-3 text-sm">
          <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">{stage ? stage.label : 'No stage selected'}</div>
          <div className="text-foreground/80">{stage ? `${stage.candidates.length} candidates active` : 'Pipeline empty'}</div>
          <div className="text-xs text-foreground/60">Auto outreach {autoOutreach ? 'online' : 'paused'}. Manual follow-up recommended if sentiment dips.</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-4 text-xs text-foreground/60">
          <div className="uppercase tracking-[0.14em] text-foreground/50">Quick Actions</div>
          <button className="w-full rounded-md bg-sky-500/80 text-foreground font-semibold text-xs tracking-[0.12em] py-1.5 hover:bg-sky-500/70" onClick={onOutreach} data-cursor="interactive">
            Blast Warm Leads
          </button>
          <button
            className="w-full rounded-md bg-emerald-500/80 text-foreground font-semibold text-xs tracking-[0.12em] py-1.5 hover:bg-emerald-500/70"
            onClick={onNudgeHiringManager}
            data-cursor="interactive"
          >
            Nudge Hiring Manager
          </button>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-3 text-xs">
          <div className="uppercase tracking-[0.14em] text-foreground/50">Playbook Status</div>
          <ul className="list-disc list-inside space-y-1 text-foreground/60">
            <li>Sequences tuned for quant &amp; growth personas.</li>
            <li>Interview scorecards updated with board calibration.</li>
            <li>Offer guardrails synced with finance guardrail settings.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
