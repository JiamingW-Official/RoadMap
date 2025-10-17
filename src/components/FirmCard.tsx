import { type Firm } from '../types/firm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { CATEGORY_COLOR } from '../constants/firm-colors'
import { useGameStore } from '../store/game'

export function FirmCard({ firm }: { firm: any }) {
  const color = CATEGORY_COLOR[firm.category] ?? 'border-border/60'
  const applyDeal = useGameStore(s => s.applyDeal)
  return (
    <Card className={`overflow-hidden border-2 ${color}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{firm.firm_name}</CardTitle>
            <CardDescription>{firm.category}</CardDescription>
          </div>
          <Badge variant="gold">{firm.round_stage}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-sm">
          <div><span className="text-muted-foreground">Address:</span> {firm.hq_address}, {firm.city}, {firm.state}</div>
          <div className="flex gap-3">
            <span className="text-muted-foreground">Difficulty:</span>
            <div className="flex gap-1">{Array.from({ length: firm.difficulty_level }).map((_,i)=>(<Badge key={i}> {i+1} </Badge>))}</div>
          </div>
          <div className="flex gap-3">
            <span className="text-muted-foreground">Cost:</span>
            <div className="flex gap-1">{Array.from({ length: firm.cost_level }).map((_,i)=>(<Badge key={i}> {i+1} </Badge>))}</div>
          </div>
          <div className="pt-2 flex gap-2">
            {firm.website ? (
              <Button asChild size="sm" data-cursor="interactive">
                <a href={firm.website} target="_blank" rel="noreferrer">Open Website</a>
              </Button>
            ) : (
              <Button size="sm" disabled>No Website</Button>
            )}
            <Button size="sm" variant="outline" onClick={()=>{ applyDeal(firm); }} data-cursor="interactive">Deal</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
