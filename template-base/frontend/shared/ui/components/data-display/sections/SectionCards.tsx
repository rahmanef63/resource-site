import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SectionCard {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
}

interface SectionCardsProps {
  cards: SectionCard[]
}

export function SectionCards({ cards }: SectionCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.description && (
              <p className="text-xs text-muted-foreground">{card.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
