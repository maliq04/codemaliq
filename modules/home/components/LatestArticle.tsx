'use client'

import SectionHeading from '@/components/elements/SectionHeading'
import SectionSubHeading from '@/components/elements/SectionSubHeading'
import SinglePromotion from '@/components/elements/SinglePromotion'
import { HiOutlineNewspaper } from 'react-icons/hi'

import { IAdsBanner } from '@/common/types/ads'
import { BlogItem } from '@/common/types/blog'
import { ILearn } from '@/common/types/codemaliq'

import LatestArticleCard from './LatestArticleCard'

interface LatestArticleProps {
  learns: ILearn[]
  blogs: BlogItem[]
  promotion?: IAdsBanner
}

export default function LatestArticle({ learns, blogs, promotion }: LatestArticleProps) {
  const articles = blogs?.slice(0, 4)

  return (
    <section>
      <div className="space-y-2">
        <SectionHeading title="Latest Articles" icon={<HiOutlineNewspaper className="mr-1" />} />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">Latest articles from dev.to</p>
          <SinglePromotion data={promotion} />
        </SectionSubHeading>
      </div>
      <div className="no-scrollbar mt-4 flex h-40 flex-row space-x-3 overflow-y-hidden overflow-x-scroll pt-2 lg:h-52 3xl:h-64">
        {articles?.map((article, index) => (
          <LatestArticleCard key={article.id} data={article} learns={learns} index={index} />
        ))}
      </div>
    </section>
  )
}
