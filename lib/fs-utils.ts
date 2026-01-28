import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

/**
 * Read an MDX file and parse its frontmatter
 */
export async function readMDXFile(filePath: string): Promise<{
  content: string
  frontmatter: Record<string, any>
} | null> {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    const fileContent = await fs.readFile(fullPath, 'utf-8')
    const { data, content } = matter(fileContent)
    
    return {
      content,
      frontmatter: data
    }
  } catch (error) {
    console.error(`Error reading MDX file ${filePath}:`, error)
    return null
  }
}

/**
 * Write an MDX file with frontmatter
 * Uses atomic write (write to temp file, then rename) to prevent corruption
 */
export async function writeMDXFile(
  filePath: string,
  content: string,
  frontmatter: Record<string, any>
): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    const tempPath = `${fullPath}.tmp`
    
    // Ensure directory exists
    const dir = path.dirname(fullPath)
    await fs.mkdir(dir, { recursive: true })
    
    // Create MDX content with frontmatter
    const fileContent = matter.stringify(content, frontmatter)
    
    // Write to temp file first
    await fs.writeFile(tempPath, fileContent, 'utf-8')
    
    // Atomic rename
    await fs.rename(tempPath, fullPath)
    
    return true
  } catch (error) {
    console.error(`Error writing MDX file ${filePath}:`, error)
    
    // Clean up temp file if it exists
    try {
      const tempPath = `${path.join(process.cwd(), filePath)}.tmp`
      await fs.unlink(tempPath)
    } catch {}
    
    return false
  }
}

/**
 * Delete an MDX file
 */
export async function deleteMDXFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    await fs.unlink(fullPath)
    return true
  } catch (error) {
    console.error(`Error deleting MDX file ${filePath}:`, error)
    return false
  }
}

/**
 * List all MDX files in a directory
 */
export async function listMDXFiles(dirPath: string): Promise<string[]> {
  try {
    const fullPath = path.join(process.cwd(), dirPath)
    
    // Check if directory exists
    try {
      await fs.access(fullPath)
    } catch {
      // Directory doesn't exist, return empty array
      return []
    }
    
    const files = await fs.readdir(fullPath)
    return files.filter(file => file.endsWith('.mdx') || file.endsWith('.md'))
  } catch (error) {
    console.error(`Error listing MDX files in ${dirPath}:`, error)
    return []
  }
}

/**
 * Read a JSON file
 */
export async function readJSONFile<T = any>(filePath: string): Promise<T | null> {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    const fileContent = await fs.readFile(fullPath, 'utf-8')
    return JSON.parse(fileContent) as T
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error)
    return null
  }
}

/**
 * Write a JSON file with atomic write
 * Creates a backup before writing
 */
export async function writeJSONFile(
  filePath: string,
  data: any,
  createBackup: boolean = true
): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    const tempPath = `${fullPath}.tmp`
    const backupPath = `${fullPath}.backup`
    
    // Create backup of existing file
    if (createBackup) {
      try {
        await fs.copyFile(fullPath, backupPath)
      } catch (error) {
        // File might not exist yet, that's okay
      }
    }
    
    // Write to temp file
    const jsonContent = JSON.stringify(data, null, 2)
    await fs.writeFile(tempPath, jsonContent, 'utf-8')
    
    // Atomic rename
    await fs.rename(tempPath, fullPath)
    
    return true
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error)
    
    // Try to restore from backup
    if (createBackup) {
      try {
        const fullPath = path.join(process.cwd(), filePath)
        const backupPath = `${fullPath}.backup`
        await fs.copyFile(backupPath, fullPath)
        console.log(`Restored ${filePath} from backup`)
      } catch {}
    }
    
    // Clean up temp file
    try {
      const tempPath = `${path.join(process.cwd(), filePath)}.tmp`
      await fs.unlink(tempPath)
    } catch {}
    
    return false
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    await fs.access(fullPath)
    return true
  } catch {
    return false
  }
}

/**
 * Generate a unique slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Ensure a slug is unique by appending a number if necessary
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  dirPath: string,
  extension: string = '.mdx'
): Promise<string> {
  let slug = baseSlug
  let counter = 1
  
  while (await fileExists(path.join(dirPath, `${slug}${extension}`))) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  return slug
}
