import { listMDXFiles, readMDXFile } from '@/lib/fs-utils'
import { ILearn } from '@/common/types/learn'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

export async function getLearnContent(): Promise<ILearn[]> {
  try {
    const learnDir = 'contents/learn'
    const categories = readdirSync(learnDir).filter(item => {
      const fullPath = join(learnDir, item)
      return statSync(fullPath).isDirectory()
    })

    const allContent: ILearn[] = []

    for (const category of categories) {
      const files = await listMDXFiles(`${learnDir}/${category}`)
      
      for (const file of files) {
        const slug = file.replace(/\.mdx?$/, '')
        const fileData = await readMDXFile(`${learnDir}/${category}/${file}`)
        
        if (fileData && fileData.frontmatter) {
          const content: ILearn = {
            id: `${category}-${slug}`,
            title: fileData.frontmatter.title || slug,
            slug: slug,
            description: fileData.frontmatter.description || '',
            image: fileData.frontmatter.image || '',
            is_new: fileData.frontmatter.is_new || false,
            level: fileData.frontmatter.level || 'beginner',
            is_show: fileData.frontmatter.is_show !== false, // Default to true
            language: fileData.frontmatter.language || 'en',
            type: fileData.frontmatter.type as 'video' | 'link' | undefined
          }
          
          allContent.push(content)
        }
      }
    }

    // Sort by title
    allContent.sort((a, b) => a.title.localeCompare(b.title))
    
    return allContent
  } catch (error) {
    console.error('Failed to fetch learn content:', error)
    return []
  }
}

export async function getLearnContentBySlug(slug: string): Promise<ILearn | null> {
  try {
    const allContent = await getLearnContent()
    return allContent.find(content => content.slug === slug) || null
  } catch (error) {
    console.error('Failed to fetch learn content by slug:', error)
    return null
  }
}