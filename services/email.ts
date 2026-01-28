import axios from 'axios'

export async function sendMessage(formData: FormData) {
  const EMAIL_API = 'https://api.web3forms.com/submit'
  const response = await axios.post(EMAIL_API, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  if (response.status >= 400) return {}
  return response.data
}
