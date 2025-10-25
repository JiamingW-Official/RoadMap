import * as React from 'react'
import { TopBar } from './TopBar'
import { ContentProvider } from './providers/ContentProvider'
import { CursorDot } from './CursorDot'
import { CommandPalette } from '../components/CommandPalette'
import { Toaster, useToast } from '../components/ui/toast'
import { MarketTicker } from '../components/MarketTicker'
import { useGameStore } from '../store/game'
import { GlassLightingController } from './GlassLightingController'

type BoardMemberProfile = {
  id: string
  name: string
  seat: string
  faction: 'Operator' | 'Investor' | 'Strategist' | 'Independent'
  votingPower: number
  equity: number
  influence: number
  confidence: number
  background: string
  expertise: string[]
  focus: string
  trend: number
  heat: number
  avatarTint: string
  biography: string
  lastSignal: string
}

type BoardProposal = {
  id: string
  title: string
  summary: string
  impact: string
  owner: string
  quorum: number
  baselineSupport: number
  risk: 'Low' | 'Medium' | 'High'
  status: 'Active' | 'Pending' | 'Cooling'
  tags: string[]
}

type BoardMeeting = {
  id: string
  date: string
  type: 'Strategy' | 'Finance' | 'Risk' | 'Special'
  theme: string
  focus: string[]
  readiness: number
  votesNeeded: number
  anchor: string
  location: string
}

type ScenarioCard = {
  id: string
  title: string
  description: string
  focus: string
  confidence: number
  burnImpact: number
  hireImpact: number
  runwayDelta: number
}

const BOARD_MEMBER_LIBRARY: Record<string, BoardMemberProfile> = {
  'Avery Chen': {
    id: 'avery-chen',
    name: 'Avery Chen',
    seat: 'Founder & CEO',
    faction: 'Operator',
    votingPower: 28,
    equity: 26,
    influence: 94,
    confidence: 88,
    background: '2x operator, scaled fintech to $1B exit',
    expertise: ['Product Velocity', 'Culture', 'Capital Allocation'],
    focus: 'Ship velocity',
    trend: 4,
    heat: 32,
    avatarTint: 'from-amber-400/70 via-amber-500/60 to-orange-500/70',
    biography: 'Owns founder vision track, moderates board cadence, and orchestrates the weekly operating rhythm.',
    lastSignal: 'Pushed for AI go-to-market accelerator with phased burn unlock.',
  },
  'Mira Patel': {
    id: 'mira-patel',
    name: 'Mira Patel',
    seat: 'Sequoia Partner',
    faction: 'Investor',
    votingPower: 22,
    equity: 18,
    influence: 86,
    confidence: 82,
    background: 'Lead investor across 7 unicorns, ex-Goldman tech M&A.',
    expertise: ['Capital Markets', 'Recruiting', 'Governance'],
    focus: 'Series C readiness',
    trend: 2,
    heat: 41,
    avatarTint: 'from-indigo-400/70 via-indigo-500/60 to-blue-500/70',
    biography: 'Keeps the board synced with growth-stage capital trends and pipeline health.',
    lastSignal: 'Flagged runway compression risk if hiring plan accelerates without pricing updates.',
  },
  'Diego Morales': {
    id: 'diego-morales',
    name: 'Diego Morales',
    seat: 'Independent Chair',
    faction: 'Independent',
    votingPower: 18,
    equity: 6,
    influence: 91,
    confidence: 90,
    background: 'Former Nasdaq COO; specializes in governance for trading platforms.',
    expertise: ['Regulation', 'Risk', 'Liquidity'],
    focus: 'Audit & compliance',
    trend: 1,
    heat: 27,
    avatarTint: 'from-slate-400/70 via-slate-500/60 to-slate-600/70',
    biography: 'Holds the board playbook, coordinates vote sequencing, and de-risks new product launches.',
    lastSignal: 'Recommended staged roll-out of derivatives module with compliance guardrails.',
  },
  'Selene Osei': {
    id: 'selene-osei',
    name: 'Selene Osei',
    seat: 'Chief Strategy Officer',
    faction: 'Strategist',
    votingPower: 12,
    equity: 9,
    influence: 79,
    confidence: 84,
    background: 'Built growth strategy team at top-tier trading app, ex-McKinsey.',
    expertise: ['Scenario Planning', 'Monetization', 'Insights'],
    focus: 'Network effects',
    trend: 3,
    heat: 38,
    avatarTint: 'from-fuchsia-400/70 via-purple-500/60 to-violet-500/70',
    biography: 'Runs board scenario desk, models player behavior, and calibrates pricing tests.',
    lastSignal: 'Simulated retention lift from co-pilot automation—expects +4.6pt activation.',
  },
  'Jonah Park': {
    id: 'jonah-park',
    name: 'Jonah Park',
    seat: 'CFO',
    faction: 'Operator',
    votingPower: 10,
    equity: 8,
    influence: 74,
    confidence: 87,
    background: 'Scaled finance org at crypto exchange, ex-BlackRock risk analytics.',
    expertise: ['Treasury', 'Unit Economics', 'Risk'],
    focus: 'Runway + burn',
    trend: 2,
    heat: 52,
    avatarTint: 'from-emerald-400/70 via-emerald-500/60 to-teal-500/70',
    biography: 'Balances treasury, keeps racing telemetry on LTV:CAC, and owns capital stack design.',
    lastSignal: 'Unlocked hedged credit facility; suggests rainy day fund to buffer expansion.',
  },
  'Harper Wade': {
    id: 'harper-wade',
    name: 'Harper Wade',
    seat: 'Growth Advisor',
    faction: 'Strategist',
    votingPower: 8,
    equity: 4,
    influence: 68,
    confidence: 78,
    background: 'Built GTM engine for two unicorn marketplaces, avid game economist.',
    expertise: ['Growth Ops', 'LiveOps', 'Community'],
    focus: 'Live economy',
    trend: -1,
    heat: 45,
    avatarTint: 'from-rose-400/70 via-rose-500/60 to-orange-500/70',
    biography: 'Monitors live economy KPIs, keeps retention cohorts honest, and syncs player feedback loops.',
    lastSignal: 'Advocating for legendary referral event to boost DAU-to-MAU velocity.',
  },
}

const FALLBACK_BOARD = Object.values(BOARD_MEMBER_LIBRARY)

const BOARD_PROPOSALS: BoardProposal[] = [
  {
    id: 'ai-sales-desk',
    title: 'Spin up AI-assisted enterprise sales desk',
    summary: 'Launch two squad pods focused on institutional pipelines leveraging co-pilot intelligence.',
    impact: 'Top-line velocity + enterprise retention',
    owner: 'Mira Patel',
    quorum: 60,
    baselineSupport: 58,
    risk: 'Medium',
    status: 'Active',
    tags: ['Growth', 'AI', 'Revenue'],
  },
  {
    id: 'treasury-shield',
    title: 'Authorize treasury draw for risk shield',
    summary: 'Deploy $4.5M from facility to insulate derivatives launch and extend runway by 10 weeks.',
    impact: 'Runway coverage & risk mitigation',
    owner: 'Jonah Park',
    quorum: 55,
    baselineSupport: 65,
    risk: 'Low',
    status: 'Pending',
    tags: ['Treasury', 'Risk', 'Runway'],
  },
  {
    id: 'guild-expansion',
    title: 'Unlock community guild expansion pass',
    summary: 'Invest in live ops ambassador program to deepen retention across power segments.',
    impact: 'Engagement depth & NPS',
    owner: 'Harper Wade',
    quorum: 52,
    baselineSupport: 47,
    risk: 'High',
    status: 'Cooling',
    tags: ['Community', 'Engagement', 'Brand'],
  },
]

const BOARD_MEETINGS: BoardMeeting[] = [
  {
    id: 'sprint-34',
    date: '2022-07-04',
    type: 'Strategy',
    theme: 'Sprint 34 calibration',
    focus: ['Activation uplift', 'AI co-pilot release', 'DAO vote'],
    readiness: 82,
    votesNeeded: 2,
    anchor: 'Avery Chen',
    location: 'HQ War Room',
  },
  {
    id: 'risk-review-q3',
    date: '2022-07-18',
    type: 'Risk',
    theme: 'Derivatives launch go/no-go',
    focus: ['Reg readiness', 'Liquidity bands', 'Incident response'],
    readiness: 68,
    votesNeeded: 3,
    anchor: 'Diego Morales',
    location: 'Compliance Ops Center',
  },
  {
    id: 'capital-markets',
    date: '2022-08-01',
    type: 'Finance',
    theme: 'Capital markets runway check',
    focus: ['Debt tap', 'Pricing refresh', 'Investor roadshow'],
    readiness: 74,
    votesNeeded: 1,
    anchor: 'Mira Patel',
    location: 'Virtual war room',
  },
]

const BOARD_SCENARIOS: ScenarioCard[] = [
  {
    id: 'rapid-scale',
    title: 'Overclock GTM squads',
    description: 'Shift 40% of roadmap to enterprise pods, unlock multi-region coverage with AI assist.',
    focus: 'Growth',
    confidence: 78,
    burnImpact: -12,
    hireImpact: 18,
    runwayDelta: -6,
  },
  {
    id: 'defensive-mode',
    title: 'Defensive treasury stance',
    description: 'Hold hiring freeze on non-critical roles, double-down on retention loops and margin.',
    focus: 'Runway',
    confidence: 66,
    burnImpact: 8,
    hireImpact: -22,
    runwayDelta: 14,
  },
  {
    id: 'community-moonshot',
    title: 'Community guild moonshot',
    description: 'Launch seasonal tournament with prize pool to ignite network effects and virality.',
    focus: 'Engagement',
    confidence: 59,
    burnImpact: -6,
    hireImpact: 6,
    runwayDelta: -3,
  },
]

const DEFAULT_SCENARIO: ScenarioCard = BOARD_SCENARIOS[0] ?? {
  id: 'default-scenario',
  title: 'Stabilize Operations',
  description: 'Baseline steady-state roadmap with controlled burn and runway conservation.',
  focus: 'Stability',
  confidence: 65,
  burnImpact: 0,
  hireImpact: 0,
  runwayDelta: 0,
}

function buildDynamicDirector(name: string, index: number): BoardMemberProfile {
  const palette = ['from-cyan-400/70 via-sky-500/60 to-blue-500/70', 'from-pink-400/70 via-rose-500/60 to-orange-500/70', 'from-lime-400/70 via-emerald-500/60 to-teal-500/70']
  const tint = palette[index % palette.length] ?? 'from-slate-400/70 via-slate-500/60 to-slate-600/70'
  return {
    id: `dynamic-${index}`,
    name,
    seat: 'External Director',
    faction: 'Independent',
    votingPower: 9 + ((index * 3) % 6),
    equity: 5 + (index % 4),
    influence: 60 + ((index * 7) % 25),
    confidence: 70 + ((index * 11) % 15),
    background: 'Invited director from latest financing round.',
    expertise: ['Capital Support', 'Signal Amplification'],
    focus: 'Align incentives',
    trend: index % 2 === 0 ? 2 : -1,
    heat: 30 + ((index * 5) % 25),
    avatarTint: tint,
    biography: 'Recently joined to reinforce governance cadence and monitor growth experiments.',
    lastSignal: 'Requested deeper telemetry on retention cohorts before approving expansion.',
  }
}

const BOARD_TABS = [
  { id: 'overview', label: 'Strategic Table' },
  { id: 'meetings', label: 'Meeting Ops' },
  { id: 'intelligence', label: 'Signal Desk' },
  { id: 'risk', label: 'Risk & Controls' },
] as const

type BoardTab = (typeof BOARD_TABS)[number]['id']

export function Boardroom() {
  const boardNames = useGameStore((s) => s.board)
  const { notify } = useToast()
  const [paletteOpen, setPaletteOpen] = React.useState(false)

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

  const boardMembers = React.useMemo(() => {
    if (!boardNames.length) return FALLBACK_BOARD
    return boardNames.map((name, idx) => BOARD_MEMBER_LIBRARY[name] ?? buildDynamicDirector(name, idx))
  }, [boardNames])

  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!boardMembers.length) {
      setSelectedMemberId(null)
      return
    }
    const first = boardMembers[0]
    if (!selectedMemberId || !boardMembers.some((member) => member.id === selectedMemberId)) {
      if (first) setSelectedMemberId(first.id)
    }
  }, [boardMembers, selectedMemberId])
  const selectedMember = boardMembers.find((member) => member.id === selectedMemberId) ?? boardMembers[0] ?? null

  const [activeTab, setActiveTab] = React.useState<BoardTab>('overview')

  const [supportLevels, setSupportLevels] = React.useState<Record<string, number>>(() => {
    return BOARD_PROPOSALS.reduce<Record<string, number>>((acc, proposal) => {
      acc[proposal.id] = proposal.baselineSupport
      return acc
    }, {})
  })

  const handleSupportChange = (proposalId: string, value: number) => {
    setSupportLevels((prev) => ({ ...prev, [proposalId]: value }))
  }

  const [scenarioIndex, setScenarioIndex] = React.useState(0)
  const clampedScenarioIndex = React.useMemo(() => {
    if (!BOARD_SCENARIOS.length) return 0
    return Math.min(Math.max(scenarioIndex, 0), BOARD_SCENARIOS.length - 1)
  }, [scenarioIndex])
  const selectedScenario = BOARD_SCENARIOS[clampedScenarioIndex] ?? DEFAULT_SCENARIO
  const updateScenarioIndex = React.useCallback(
    (index: number) => {
      if (!BOARD_SCENARIOS.length) return
      const next = Math.min(Math.max(index, 0), BOARD_SCENARIOS.length - 1)
      setScenarioIndex(next)
    },
    [],
  )

  const boardConfidence = React.useMemo(() => {
    if (!boardMembers.length) return 0
    const sum = boardMembers.reduce((total, member) => total + member.confidence, 0)
    return Math.round(sum / boardMembers.length)
  }, [boardMembers])

  const capitalAlignment = React.useMemo(() => {
    if (!boardMembers.length) return 0
    const totalVoting = boardMembers.reduce((total, member) => total + member.votingPower, 0)
    const aligned = boardMembers
      .filter((member) => member.faction === 'Operator' || member.faction === 'Strategist')
      .reduce((total, member) => total + member.votingPower, 0)
    return totalVoting ? Math.round((aligned / totalVoting) * 100) : 0
  }, [boardMembers])

  const riskHeat = React.useMemo(() => {
    if (!boardMembers.length) return 0
    const sum = boardMembers.reduce((total, member) => total + member.heat, 0)
    return Math.round(sum / boardMembers.length)
  }, [boardMembers])

  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <Toaster>
        <ContentProvider>
          <TopBar onOpenPalette={() => setPaletteOpen(true)} />
          <div className="pt-20 h-[calc(100vh-80px)] w-full px-4 lg:px-6 pb-6">
            <div className="grid h-full gap-4 lg:grid-cols-[300px_minmax(0,1fr)_360px]">
              <aside className="liquid-panel overflow-hidden flex flex-col">
                <BoardRoster
                  members={boardMembers}
                  selectedMemberId={selectedMemberId}
                  onSelect={setSelectedMemberId}
                  stats={{ boardConfidence, capitalAlignment, riskHeat }}
                />
              </aside>
              <div className="liquid-panel overflow-hidden flex flex-col">
                <BoardNavigation activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="flex-1 min-h-0 overflow-auto px-4 md:px-5 pb-5">
                  {activeTab === 'overview' && (
                    <BoardOverview
                      member={selectedMember}
                      proposals={BOARD_PROPOSALS}
                      supportLevels={supportLevels}
                      onSupportChange={handleSupportChange}
                      onTriggerVote={(id) => {
                        const proposal = BOARD_PROPOSALS.find((p) => p.id === id)
                        notify(`Vote triggered for ${proposal?.title ?? 'proposal'}`)
                      }}
                      onPingMember={(memberName) => notify(`Pinged ${memberName} for alignment sync`)}
                    />
                  )}
                  {activeTab === 'meetings' && (
                    <BoardMeetingsView
                      meetings={BOARD_MEETINGS}
                      onPrepare={(meetingId) => {
                        const meeting = BOARD_MEETINGS.find((m) => m.id === meetingId)
                        notify(`Prep pack queued for ${meeting?.theme ?? 'meeting'}`)
                      }}
                    />
                  )}
                  {activeTab === 'intelligence' && (
                    <BoardIntelligenceView
                      members={boardMembers}
                      proposals={BOARD_PROPOSALS}
                      scenario={selectedScenario}
                      onScenarioShift={updateScenarioIndex}
                    />
                  )}
                  {activeTab === 'risk' && (
                    <BoardRiskView
                      riskHeat={riskHeat}
                      boardConfidence={boardConfidence}
                      onEscalate={(channel) => notify(`Escalation dispatched to ${channel}`)}
                      onLockdown={() => notify('Emergency protocol armed')}
                    />
                  )}
                </div>
              </div>
              <aside className="liquid-panel overflow-hidden flex flex-col">
                <BoardControlRail
                  proposals={BOARD_PROPOSALS}
                  supportLevels={supportLevels}
                  scenario={selectedScenario}
                  activeScenarioIndex={clampedScenarioIndex}
                  onScenarioSelect={updateScenarioIndex}
                  onBroadcast={(message) => notify(message)}
                />
              </aside>
            </div>
          </div>
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
          <MarketTicker />
          <CursorDot />
          <GlassDistortionDefs />
          <GlassLightingController />
        </ContentProvider>
      </Toaster>
    </div>
  )
}

function BoardRoster({
  members,
  selectedMemberId,
  onSelect,
  stats,
}: {
  members: BoardMemberProfile[]
  selectedMemberId: string | null
  onSelect: (id: string) => void
  stats: { boardConfidence: number; capitalAlignment: number; riskHeat: number }
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3.5 border-b border-white/8">
        <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Board Control Room</div>
        <h2 className="text-lg font-semibold text-foreground/90">Director Roster</h2>
      </div>
      <div className="px-4 py-3.5 space-y-3.5">
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <StatBadge label="Confidence" value={`${stats.boardConfidence}%`} barValue={stats.boardConfidence} tone="bg-sky-500/70" />
          <StatBadge label="Alignment" value={`${stats.capitalAlignment}%`} barValue={stats.capitalAlignment} tone="bg-violet-500/70" />
          <StatBadge label="Risk Heat" value={`${stats.riskHeat}%`} barValue={stats.riskHeat} tone="bg-amber-500/70" />
        </div>
        <div className="text-xs text-foreground/60">
          Alignment calibrates operator + strategist voting power vs. investor bloc. Heat reflects tension around open initiatives.
        </div>
      </div>
      <div className="border-t border-white/8 flex-1 overflow-auto thin-scroll px-4 pb-5 space-y-3.5">
        {members.map((member) => {
          const active = member.id === selectedMemberId
          return (
            <button
              key={member.id}
              onClick={() => onSelect(member.id)}
              className="group w-full text-left"
              data-cursor="interactive"
            >
              <div
                className={`liquid-panel px-4 py-3.5 flex items-start gap-3 transition-all ${active ? '' : 'hover:border-white/20'}`}
                data-active={active}
                style={{ '--liquid-radius': '12px' } as React.CSSProperties}
              >
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${member.avatarTint} flex items-center justify-center text-sm font-semibold text-foreground/90`}>
                  {member.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-foreground/90">{member.name}</div>
                      <div className="text-xs text-foreground/60">{member.seat}</div>
                    </div>
                    <div className="text-xs text-right">
                      <div className="text-foreground/70">Vote {member.votingPower}%</div>
                      <div className="text-foreground/50">Influence {member.influence}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2.5 text-[11px] text-foreground/60">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                      {member.focus}
                    </span>
                    <span className="flex items-center gap-1 justify-end">
                      <span className={`text-[10px] font-semibold ${member.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {member.trend >= 0 ? `▲ ${member.trend}` : `▼ ${Math.abs(member.trend)}`}
                      </span>
                      Pulse
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StatBadge({ label, value, barValue, tone }: { label: string; value: string; barValue: number; tone: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3.5 space-y-2.5">
      <div className="text-[10px] uppercase tracking-[0.14em] text-foreground/50">{label}</div>
      <div className="text-sm font-semibold text-foreground/90">{value}</div>
      <div className="h-[6px] rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${Math.min(100, Math.max(0, barValue))}%` }} />
      </div>
    </div>
  )
}

function BoardNavigation({ activeTab, onTabChange }: { activeTab: BoardTab; onTabChange: (tab: BoardTab) => void }) {
  return (
    <div className="px-4 py-3.5 border-b border-white/8">
      <div className="text-xs uppercase tracking-[0.14em] text-foreground/50 mb-2.5">Board View</div>
      <div className="flex flex-wrap gap-2">
        {BOARD_TABS.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`liquid-panel px-3 py-1.5 text-xs font-semibold tracking-[0.12em] transition ${isActive ? '' : 'text-foreground/60 hover:border-white/20'}`}
              style={{ '--liquid-radius': '10px' } as React.CSSProperties}
              data-active={isActive}
              data-cursor="interactive"
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BoardOverview({
  member,
  proposals,
  supportLevels,
  onSupportChange,
  onTriggerVote,
  onPingMember,
}: {
  member: BoardMemberProfile | null
  proposals: BoardProposal[]
  supportLevels: Record<string, number>
  onSupportChange: (id: string, value: number) => void
  onTriggerVote: (id: string) => void
  onPingMember: (name: string) => void
}) {
  return (
    <div className="space-y-5 py-5">
      <div>
        <div className="text-xs uppercase tracking-[0.14em] text-foreground/50 mb-2.5">Featured Director</div>
        {member ? (
          <div className="liquid-panel overflow-hidden">
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="p-4 border-r border-white/8 bg-gradient-to-br from-foreground/5 via-transparent to-background">
                <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${member.avatarTint} flex items-center justify-center text-2xl font-semibold text-foreground/90`}>
                  {member.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="mt-4 text-lg font-semibold text-foreground/90">{member.name}</div>
                <div className="text-sm text-foreground/60">{member.seat}</div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <MetricChip label="Voting" value={`${member.votingPower}%`} tone="bg-sky-500/70" />
                  <MetricChip label="Influence" value={member.influence.toString()} tone="bg-violet-500/70" />
                  <MetricChip label="Confidence" value={`${member.confidence}%`} tone="bg-emerald-500/70" />
                  <MetricChip label="Heat" value={`${member.heat}%`} tone="bg-amber-500/70" />
                </div>
              </div>
              <div className="p-4 md:p-5 space-y-4">
                <div className="text-sm text-foreground/80 leading-relaxed">{member.biography}</div>
                <div className="grid md:grid-cols-2 gap-3.5 text-xs">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2.5">
                    <div className="uppercase text-[10px] tracking-[0.14em] text-foreground/50">Expertise</div>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((item) => (
                        <span key={item} className="px-2 py-0.5 rounded bg-white/10 border border-white/10">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2.5">
                    <div className="uppercase text-[10px] tracking-[0.14em] text-foreground/50">Signal Feed</div>
                    <div className="text-sm text-foreground/80 leading-relaxed">{member.lastSignal}</div>
                    <button className="text-xs text-foreground/60 underline underline-offset-4 hover:text-foreground/90" onClick={() => onPingMember(member.name)}>
                      Ping for sync
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="liquid-panel border border-dashed border-white/25 p-5 text-sm text-foreground/60">No directors on record.</div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-[0.14em] text-foreground/50 mb-2.5">Active Proposals</div>
        <div className="space-y-3.5">
          {proposals.map((proposal) => {
            const support = supportLevels[proposal.id] ?? proposal.baselineSupport
            return (
              <div key={proposal.id} className="liquid-panel interactive-panel p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.14em] text-foreground/50">{proposal.status}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 border border-white/10">{proposal.owner}</span>
                    </div>
                    <div className="text-base font-semibold text-foreground/90">{proposal.title}</div>
                    <div className="text-sm text-foreground/70 max-w-xl">{proposal.summary}</div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-foreground/60">
                      <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30">{proposal.impact}</span>
                      {proposal.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-white/10 border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-[220px] rounded-lg border border-white/10 bg-background/70 p-4 space-y-3 text-xs text-foreground/60">
                    <div className="flex items-center justify-between">
                      <span>Support</span>
                      <span className="text-foreground/80 font-semibold">{support}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={support}
                      onChange={(event) => onSupportChange(proposal.id, Number(event.target.value))}
                      className="w-full accent-sky-500"
                    />
                    <div className="text-[10px] uppercase tracking-[0.14em] text-foreground/50">
                      Quorum {proposal.quorum}% · Risk {proposal.risk}
                    </div>
                    <button
                      className="w-full rounded-md bg-emerald-500/80 text-foreground font-semibold text-xs tracking-[0.12em] py-1.5 hover:bg-emerald-500/70"
                      onClick={() => onTriggerVote(proposal.id)}
                      data-cursor="interactive"
                    >
                      Launch Vote
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MetricChip({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] flex items-center justify-between gap-3">
      <span className="text-foreground/60">{label}</span>
      <span className="font-semibold text-foreground/90">{value}</span>
    </div>
  )
}

function BoardMeetingsView({ meetings, onPrepare }: { meetings: BoardMeeting[]; onPrepare: (id: string) => void }) {
  const [expandedMeetingId, setExpandedMeetingId] = React.useState<string | null>(meetings[0]?.id ?? null)
  return (
    <div className="py-5 space-y-4">
      <div>
        <div className="text-xs uppercase tracking-[0.14em] text-foreground/50 mb-2.5">Upcoming Cadence</div>
        <div className="space-y-3.5">
          {meetings.map((meeting) => {
            const expanded = expandedMeetingId === meeting.id
            return (
              <div key={meeting.id} className="liquid-panel overflow-hidden">
                <button
                  onClick={() => setExpandedMeetingId(expanded ? null : meeting.id)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 bg-white/0 hover:bg-white/5 transition"
                  data-cursor="interactive"
                >
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-foreground/50">{meeting.type}</div>
                    <div className="text-sm font-semibold text-foreground/90">{meeting.theme}</div>
                  </div>
                  <div className="flex items-center gap-5 text-xs text-foreground/60">
                    <span>{meeting.date}</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">{meeting.location}</span>
                  </div>
                </button>
                {expanded && (
                  <div className="p-4 md:p-5 space-y-3.5 text-sm">
                    <div className="grid md:grid-cols-3 gap-3 text-xs">
                      <StatBadge label="Readiness" value={`${meeting.readiness}%`} barValue={meeting.readiness} tone="bg-emerald-500/70" />
                      <StatBadge label="Votes Needed" value={`${meeting.votesNeeded}`} barValue={Math.min(meeting.votesNeeded * 12, 100)} tone="bg-sky-500/70" />
                      <StatBadge label="Anchor" value={meeting.anchor} barValue={72} tone="bg-fuchsia-500/70" />
                    </div>
                    <div className="text-foreground/70">
                      Focus lanes: {meeting.focus.join(' · ')}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-foreground/60">
                      {meeting.focus.map((item) => (
                        <span key={item} className="px-2 py-0.5 rounded bg-white/10 border border-white/10">
                          {item}
                        </span>
                      ))}
                    </div>
                    <button
                      className="rounded-md border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-emerald-200 hover:bg-emerald-500/25"
                      onClick={() => onPrepare(meeting.id)}
                      data-cursor="interactive"
                    >
                      Queue Prep Pack
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="liquid-panel p-4 md:p-5 text-sm text-foreground/70">
        <div className="text-xs uppercase tracking-[0.14em] text-foreground/50 mb-2.5">Cadence Protocol</div>
        <p>
          Each board sprint locks 72h ahead. Directors submit async reads for agenda pillars, and the chair finalizes vote sequencing. Use &ldquo;Queue Prep Pack&rdquo; to auto-assemble briefs from ops telemetry.
        </p>
      </div>
    </div>
  )
}

function BoardIntelligenceView({
  members,
  proposals,
  scenario,
  onScenarioShift,
}: {
  members: BoardMemberProfile[]
  proposals: BoardProposal[]
  scenario: ScenarioCard
  onScenarioShift: (index: number) => void
}) {
  return (
    <div className="py-5 space-y-4">
      <div className="grid md:grid-cols-[minmax(0,1fr)_320px] gap-4">
        <div className="liquid-panel p-4 md:p-5">
          <div className="text-xs uppercase tracking-[0.14em] text-foreground/50 mb-2.5">Director Heat Radar</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {members.map((member) => (
              <div key={member.id} className="rounded-lg border border-white/10 bg-background/70 p-3 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground/80">{member.name}</span>
                  <span className="text-xs text-foreground/60">{member.faction}</span>
                </div>
                <div className="text-xs text-foreground/60">{member.focus}</div>
                <div className="grid grid-cols-3 gap-2.5 text-[11px] text-foreground/60">
                  <HeatChip label="Support" value={`${member.confidence}%`} tone="bg-emerald-500/70" level={member.confidence} />
                  <HeatChip label="Influence" value={`${member.influence}`} tone="bg-sky-500/70" level={member.influence} />
                  <HeatChip label="Heat" value={`${member.heat}%`} tone="bg-amber-500/70" level={member.heat} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="liquid-panel p-4 md:p-5 flex flex-col">
          <div className="text-xs uppercase tracking-[0.14em] text-foreground/50 mb-2.5">Scenario Switchboard</div>
          <div className="flex flex-wrap gap-2.5 mb-4">
            {BOARD_SCENARIOS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onScenarioShift(idx)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-[0.12em] ${
                  scenario.id === item.id ? 'bg-emerald-500/80 text-[hsl(20,14%,4%)]' : 'bg-white/10 text-foreground/60 hover:bg-white/15'
                }`}
                data-cursor="interactive"
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-white/10 bg-background/70 p-4 space-y-3 text-sm text-foreground/70">
            <div className="text-base font-semibold text-foreground/90">{scenario.title}</div>
            <p>{scenario.description}</p>
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <HeatChip label="Confidence" value={`${scenario.confidence}%`} tone="bg-emerald-500/70" level={scenario.confidence} />
              <HeatChip label="Burn Impact" value={`${scenario.burnImpact >= 0 ? '+' : ''}${scenario.burnImpact}%`} tone="bg-sky-500/70" level={Math.abs(scenario.burnImpact) * 5} />
              <HeatChip label="Runway Δ" value={`${scenario.runwayDelta >= 0 ? '+' : ''}${scenario.runwayDelta}w`} tone="bg-amber-500/70" level={Math.abs(scenario.runwayDelta) * 6} />
            </div>
          </div>
        </div>
      </div>

      <div className="liquid-panel p-4 md:p-5" style={{ '--liquid-radius': '12px' } as React.CSSProperties}>
        <div className="text-xs uppercase tracking-[0.14em] text-foreground/50 mb-2.5">Signal Feed</div>
        <div className="grid md:grid-cols-3 gap-3">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="rounded-lg border border-white/10 bg-background/70 p-3 space-y-2.5 text-sm">
              <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">{proposal.status}</div>
              <div className="font-semibold text-foreground/90">{proposal.title}</div>
              <div className="text-xs text-foreground/60">Owner {proposal.owner}</div>
              <div className="text-xs text-foreground/60">
                Support {proposal.baselineSupport}% · Quorum {proposal.quorum}%
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {proposal.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-white/10 border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HeatChip({ label, value, tone, level }: { label: string; value: string; tone: string; level: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 space-y-1.5">
      <div className="text-[10px] uppercase tracking-[0.14em] text-foreground/55">{label}</div>
      <div className="text-xs font-semibold text-foreground/90">{value}</div>
      <div className="h-[6px] rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${Math.min(100, Math.max(0, level))}%` }} />
      </div>
    </div>
  )
}

function BoardRiskView({
  riskHeat,
  boardConfidence,
  onEscalate,
  onLockdown,
}: {
  riskHeat: number
  boardConfidence: number
  onEscalate: (channel: string) => void
  onLockdown: () => void
}) {
  const [tolerance, setTolerance] = React.useState(54)
  const [guardrails, setGuardrails] = React.useState({
    product: true,
    treasury: true,
    security: false,
  })
  return (
    <div className="py-5 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="liquid-panel p-4 md:p-5 space-y-4">
          <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Risk Dashboard</div>
          <div className="text-2xl font-semibold text-foreground/90">{riskHeat}%</div>
          <div className="text-sm text-foreground/70">Average heat across open initiatives. Above 65% triggers emergency cadence.</div>
          <div className="text-xs text-foreground/60">Board confidence at {boardConfidence}%. Keep heat below tolerance to preserve voting momentum.</div>
        </div>
        <div className="liquid-panel p-4 md:p-5 space-y-3 text-sm text-foreground/70">
          <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Guardrail Matrix</div>
          <div className="space-y-1.5 text-xs">
            {(['product', 'treasury', 'security'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guardrails[key]}
                  onChange={() => setGuardrails((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className="accent-emerald-500"
                />
                <span className="capitalize text-foreground/80">{key} guardrail</span>
              </label>
            ))}
          </div>
          <div className="text-xs text-foreground/60">Enabled guardrails auto-flag incidents and sync with afterburner squads.</div>
        </div>
      </div>

      <div className="liquid-panel p-4 md:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Risk Appetite</div>
            <div className="text-sm text-foreground/70">Slide to define acceptable volatility before escalations auto-trigger.</div>
          </div>
          <div className="text-sm font-semibold text-foreground/80">Tolerance {tolerance}%</div>
        </div>
        <input type="range" min={20} max={80} value={tolerance} onChange={(event) => setTolerance(Number(event.target.value))} className="w-full accent-amber-500" />
        <div className="flex flex-wrap gap-1.5 text-[11px] text-foreground/60">
          <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">Escalates above tolerance</span>
          <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">Notifies guardrail owners</span>
          <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">Opens risk channel</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            className="px-3 py-1.5 rounded-md bg-rose-500/80 text-foreground text-xs font-semibold tracking-[0.12em] hover:bg-rose-500/70"
            onClick={onLockdown}
            data-cursor="interactive"
          >
            Arm Emergency Protocol
          </button>
          <button
            className="px-3 py-1.5 rounded-md border border-emerald-500/50 bg-emerald-500/20 text-emerald-100 text-xs font-semibold tracking-[0.12em] hover:bg-emerald-500/25"
            onClick={() => onEscalate('Risk Guild')}
            data-cursor="interactive"
          >
            Escalate to Risk Guild
          </button>
          <button
            className="px-3 py-1.5 rounded-md border border-sky-500/50 bg-sky-500/15 text-sky-100 text-xs font-semibold tracking-[0.12em] hover:bg-sky-500/20"
            onClick={() => onEscalate('Investor Hotline')}
            data-cursor="interactive"
          >
            Alert Investor Hotline
          </button>
        </div>
      </div>
    </div>
  )
}

function BoardControlRail({
  proposals,
  supportLevels,
  scenario,
  activeScenarioIndex,
  onScenarioSelect,
  onBroadcast,
}: {
  proposals: BoardProposal[]
  supportLevels: Record<string, number>
  scenario: ScenarioCard
  activeScenarioIndex: number
  onScenarioSelect: (index: number) => void
  onBroadcast: (message: string) => void
}) {
  const totalSupport = proposals.reduce((acc, proposal) => acc + (supportLevels[proposal.id] ?? proposal.baselineSupport), 0)
  const avgSupport = proposals.length ? Math.round(totalSupport / proposals.length) : 0

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3.5 border-b border-white/8">
        <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Action Rail</div>
        <div className="text-lg font-semibold text-foreground/90">Live Controls</div>
      </div>
      <div className="flex-1 overflow-auto thin-scroll px-4 pb-5 space-y-4">
        <div className="liquid-panel interactive-panel p-4 space-y-3.5">
          <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Support Pulse</div>
          <div className="text-2xl font-semibold text-foreground/90">{avgSupport}%</div>
          <div className="text-xs text-foreground/60">Average support across open proposals. Aim for 65% before triggering votes.</div>
          <div className="space-y-2.5">
            {proposals.map((proposal) => {
              const value = supportLevels[proposal.id] ?? proposal.baselineSupport
              return (
                <div key={proposal.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-foreground/60">
                    <span>{proposal.title}</span>
                    <span className="text-foreground/80 font-semibold">{value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-emerald-500/80" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="liquid-panel interactive-panel p-4 space-y-3.5">
          <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Scenario Dispatch</div>
          <div className="text-sm text-foreground/70">{scenario.title}</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <HeatChip label="Focus" value={scenario.focus} tone="bg-sky-500/70" level={74} />
            <HeatChip label="Confidence" value={`${scenario.confidence}%`} tone="bg-emerald-500/70" level={scenario.confidence} />
            <HeatChip label="Burn" value={`${scenario.burnImpact >= 0 ? '+' : ''}${scenario.burnImpact}%`} tone="bg-rose-500/70" level={Math.abs(scenario.burnImpact) * 5} />
            <HeatChip label="Runway" value={`${scenario.runwayDelta >= 0 ? '+' : ''}${scenario.runwayDelta}w`} tone="bg-amber-500/70" level={Math.abs(scenario.runwayDelta) * 6} />
          </div>
          <div className="flex flex-wrap gap-2">
            {BOARD_SCENARIOS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onScenarioSelect(idx)}
                className={`px-2.5 py-1 text-[11px] rounded-md border ${
                  idx === activeScenarioIndex ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-200' : 'border-white/10 bg-white/5 text-foreground/60 hover:bg-white/10'
                }`}
                data-cursor="interactive"
              >
                {item.focus}
              </button>
            ))}
          </div>
          <button
            className="w-full rounded-md bg-emerald-500/80 text-foreground font-semibold text-xs tracking-[0.12em] py-1.5 hover:bg-emerald-500/70"
            onClick={() => onBroadcast(`Scenario broadcast: ${scenario.title}`)}
            data-cursor="interactive"
          >
            Push Scenario Broadcast
          </button>
        </div>

        <div className="liquid-panel interactive-panel p-4 space-y-3">
          <div className="text-xs uppercase tracking-[0.14em] text-foreground/50">Communication Channels</div>
          <div className="space-y-2 text-xs">
            <button
              className="w-full rounded-md border border-sky-500/50 bg-sky-500/15 px-3 py-1.5 text-sky-100 font-semibold tracking-[0.12em]"
              onClick={() => onBroadcast('Dispatch sent to Strategy Guild')}
              data-cursor="interactive"
            >
              Notify Strategy Guild
            </button>
            <button
              className="w-full rounded-md border border-indigo-500/50 bg-indigo-500/20 px-3 py-1.5 text-indigo-100 font-semibold tracking-[0.12em]"
              onClick={() => onBroadcast('Investor memo queued')}
              data-cursor="interactive"
            >
              Queue Investor Memo
            </button>
            <button
              className="w-full rounded-md border border-rose-500/50 bg-rose-500/15 px-3 py-1.5 text-rose-100 font-semibold tracking-[0.12em]"
              onClick={() => onBroadcast('Crisis bridge pinged')}
              data-cursor="interactive"
            >
              Ping Crisis Bridge
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GlassDistortionDefs() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.4" result="blurred" />
          <feDisplacementMap in="SourceGraphic" in2="blurred" scale="28" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
