import Breakline from '@/components/elements/Breakline'

import { IAdsBanner } from '@/common/types/ads'
import { BlogItem } from '@/common/types/blog'
import { ILearn } from '@/common/types/codemaliq'
import { IServices } from '@/common/types/services'

import Introduction from './Introduction'
import LatestArticle from './LatestArticle'
import ServicesList from './ServicesList'

interface HomeProps {
  learns: ILearn[]
  services: IServices[]
  blogs: BlogItem[]
  promotion?: IAdsBanner
}

export default function Home({ learns, services, blogs, promotion }: HomeProps) {
  return (
    <>
      <Introduction />
      <Breakline className="my-6 3xl:my-10" />
      {/* Menggunakan LatestArticle untuk menampilkan blogs dan learns */}
      <LatestArticle blogs={blogs} learns={learns} promotion={promotion} />
      <Breakline className="my-6 3xl:my-10" />
      <ServicesList services={services} />
    </>
  )
}
