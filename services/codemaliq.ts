import { IAdsBanner } from '@/common/types/ads'
import { ICareer } from '@/common/types/careers'
import { ICodemaliq, ILearn, IService } from '@/common/types/codemaliq'
import { IProjectItem } from '@/common/types/projects'

import data from '@/codemaliq.json'
import { careersMock } from '@/common/mocks/careers'

export async function getCodemaliqData(): Promise<ICodemaliq> {
  const response = data as ICodemaliq
  return response
}

export async function getLearns(): Promise<ILearn[]> {
  const response = await getCodemaliqData()
  return response.roadmaps.list
}

export async function getServices(): Promise<IService[]> {
  const response = await getCodemaliqData()
  return response.services
}

export async function getProjects(): Promise<IProjectItem[]> {
  const response = await getCodemaliqData()
  return response.projects
}

export async function getPromotions(): Promise<IAdsBanner[]> {
  const response = await getCodemaliqData()
  return response.ads
}

export async function getCareers(): Promise<ICareer[]> {
  // Return mock data for now - this could be replaced with real data from the JSON or API
  return careersMock
}