import { ICareer } from './careers'
import { ILearn } from './learn'
import { IProjectItem } from './projects'
import { IRoadmap } from './roadmap'
import { IServices } from './services'

export type IBadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'

export interface ICodeMaliqData {
  careers: ICareer[]
  projects: IProjectItem[]
  learns: ILearn[]
  roadmaps: IRoadmap
  services: IServices[]
}

export interface IRequestHeader {
  [key: string]: string | number
}

export interface IResponseCodeMaliqService<T> {
  statusCode: number
  message: string
  data: T
}
