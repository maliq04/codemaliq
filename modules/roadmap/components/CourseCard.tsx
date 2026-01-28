import Badge from '@/components/elements/Badge'
import { Card } from '@/components/elements/Card'
import Tooltip from '@/components/elements/Tooltip'

import { STACKS } from '@/common/constant/stacks'
import { CourseCardProps } from '@/common/types/roadmap'

export default function CourseCard(props: CourseCardProps) {
  const { icon, title, linkEnglish, linkIndonesia } = props
  return (
    <Card className="flex items-center justify-between border border-neutral-200 p-4 text-sm text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600">
      <div className="flex items-center space-x-3">
        <div className="flex h-8 w-8 items-center justify-center">
          {STACKS[icon]}
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <div className="flex space-x-2">
        {linkIndonesia && (
          <Tooltip title="Free course in Indonesian!">
            <Badge href={linkIndonesia} variant="success" target="_blank" size="small">
              ID
            </Badge>
          </Tooltip>
        )}
        {linkEnglish && (
          <Tooltip title="Free course in English!">
            <Badge href={linkEnglish} variant="info" target="_blank" size="small">
              EN
            </Badge>
          </Tooltip>
        )}
      </div>
    </Card>
  )
}
