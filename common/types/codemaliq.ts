import { IProjectItem } from './projects'

export interface ILearn {
  title: string
  description?: string
  href?: string
  icon: string
  category: string
  linkIndonesia?: string
  linkEnglish?: string
  type?: string
}

export interface IService {
  id: string
  tag: string
  title: string
  description: string
  createdAt?: string
  updatedAt?: string
}

export interface IAdsBanner {
  image: string
  title: string
  description: string
  button_text: string
  url: string
  showingOn: string[]
  isShow?: boolean
  text?: string
}

export interface ICodemaliq {
  roadmaps: {
    title: string
    description: string
    list: ILearn[]
  }
  projects: IProjectItem[]
  services: IService[]
  ads: IAdsBanner[]
}