'use client'

// interface EmbedProps {
//   html: string | TrustedHTML;
// }
// export default function Embed({ html }: EmbedProps) {
//   return <div dangerouslySetInnerHTML={{ __html: html }} />;
// }
import { useEffect } from 'react'

export default function Embed() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://www.tiktok.com/embed.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]')
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript)
      }
    }
  }, [])

  return (
    <blockquote
      data-testid="tiktok-embed"
      className="tiktok-embed"
      cite="https://www.tiktok.com/@maliqalfathir"
      data-unique-id="maliqalfathir"
      data-embed-type="creator"
      style={{ maxWidth: '780px', minWidth: '288px' }}
    >
      <section>
        <a target="_blank" href="https://www.tiktok.com/@maliqalfathir?refer=creator_embed">
          @maliqalfathir
        </a>
      </section>
    </blockquote>
  )
}
