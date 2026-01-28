// Simple toast utility with better UX
export const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      showToast(message, 'success')
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      showToast(message, 'error')
    }
  },
  info: (message: string) => {
    if (typeof window !== 'undefined') {
      showToast(message, 'info')
    }
  }
}

function showToast(message: string, type: 'success' | 'error' | 'info') {
  // Create toast element
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 z-[9999] max-w-sm rounded-lg p-4 shadow-lg transition-all duration-300 transform translate-x-full ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    'bg-blue-500 text-white'
  }`
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <span>${icon}</span>
      <span>${message}</span>
    </div>
  `
  
  document.body.appendChild(toast)
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 10)
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(full)'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}