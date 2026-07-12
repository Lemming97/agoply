import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { IconPlayerPlayFilled, IconVideo } from '@tabler/icons-react'

interface YouTubeEmbedProps {
  videoId: string
  title: string
  credit: string
}

export default function YouTubeEmbed({ videoId, title, credit }: YouTubeEmbedProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <Box sx={{ mb: '20px' }}>
      <Box
        sx={{
          position: 'relative', width: '100%', aspectRatio: '16 / 9',
          borderRadius: '12px', overflow: 'hidden', bgcolor: '#000',
        }}
      >
        {loaded ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            width="100%"
            height="100%"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
          />
        ) : (
          <Box
            component="button"
            onClick={() => setLoaded(true)}
            aria-label={`Play video: ${title}`}
            sx={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              border: 'none', p: 0, cursor: 'pointer',
              backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background-color .2s ease',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' },
              }}
            >
              <Box
                sx={{
                  width: 64, height: 64, borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IconPlayerPlayFilled size={28} color="#E24B4A" style={{ marginLeft: 3 }} />
              </Box>
            </Box>

            <Box
              sx={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
                p: '10px 14px', background: 'linear-gradient(0deg, rgba(0,0,0,0.65), transparent)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 13, color: '#fff', fontWeight: 600, fontFamily: 'var(--font-body)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
                }}
              >
                {title}
              </Typography>
              <Box
                component="span"
                sx={{
                  flexShrink: 0, fontSize: 10, fontWeight: 700, color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.22)', borderRadius: '20px', px: '8px', py: '3px',
                  fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                }}
              >
                via {credit}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Typography
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px',
          fontFamily: "'DM Sans', var(--font-body)", fontSize: 11, color: 'var(--muted)', mt: 0.5,
        }}
      >
        <IconVideo size={14} strokeWidth={1.5} color="var(--muted)" />
        Video via {credit}
      </Typography>
    </Box>
  )
}
