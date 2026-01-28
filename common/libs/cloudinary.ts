const BASE_URL = 'https://res.cloudinary.com/codemaliq/image/upload/f_auto,q_auto/v1/codemaliq'

export function getCloudinaryUrl(path: string) {
  return BASE_URL + path
}
