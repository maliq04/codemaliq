/* eslint-disable @typescript-eslint/no-explicit-any */
import Breakline from '@/components/elements/Breakline'

import { CodewarsData } from '@/common/types/codewars'

import Codewars from './Codewars'
import Contributions from './Contributions'

interface DashboardProps {
  githubData: any
  codewarsData: CodewarsData | null
}
export default function Dashboard({ githubData, codewarsData }: DashboardProps) {
  return (
    <section className="flex flex-col">
      <Contributions githubData={githubData} />
      <Breakline />
      <Codewars codewarsData={codewarsData} />
    </section>
  )
}
