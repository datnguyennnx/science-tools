type LoadingProps = {
  status?: number | string
  message?: string
  subtext?: string
}

export default function Loading({ status, message, subtext }: LoadingProps) {
  // Define animation configurations with unique IDs
  const orbitals = [
    { id: 'orbital-1', size: 'w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32', duration: '3s' },
    {
      id: 'orbital-2',
      size: 'w-28 h-28 md:w-40 md:h-40 lg:w-56 lg:h-56',
      duration: '5s',
      direction: 'reverse',
    },
    { id: 'orbital-3', size: 'w-40 h-40 md:w-60 md:h-60 lg:w-80 lg:h-80', duration: '8s' },
    {
      id: 'orbital-4',
      size: 'w-56 h-56 md:w-80 md:h-80 lg:w-112 lg:h-112',
      duration: '13s',
      direction: 'reverse',
    },
  ]

  const quantumStates = [
    {
      id: 'quantum-1',
      size: 'w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20',
      duration: '3s',
      particles: [{ id: 'particle-1', index: 1, pos: '', anim: 'pulse', dur: '1.2s' }],
    },
    {
      id: 'quantum-2',
      size: 'w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40',
      duration: '5s',
      direction: 'reverse',
      particles: [
        {
          id: 'particle-2a',
          index: 2,
          pos: 'top-0 left-1/2 -translate-x-1/2',
          anim: 'ping',
          dur: '2s',
          delay: '0.5s',
        },
        {
          id: 'particle-2b',
          index: 3,
          pos: 'bottom-0 left-1/2 -translate-x-1/2',
          anim: 'ping',
          dur: '2s',
          delay: '1s',
        },
      ],
    },
    {
      id: 'quantum-3',
      size: 'w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64',
      duration: '8s',
      particles: [
        {
          id: 'particle-3a',
          index: 4,
          pos: 'top-0 left-1/2 -translate-x-1/2',
          anim: 'bounce',
          dur: '3s',
        },
        {
          id: 'particle-3b',
          index: 5,
          pos: 'right-0 top-1/2 -translate-y-1/2',
          anim: 'bounce',
          dur: '3s',
          delay: '0.75s',
        },
        {
          id: 'particle-3c',
          index: 1,
          pos: 'bottom-0 left-1/2 -translate-x-1/2',
          anim: 'bounce',
          dur: '3s',
          delay: '1.5s',
        },
        {
          id: 'particle-3d',
          index: 2,
          pos: 'left-0 top-1/2 -translate-y-1/2',
          anim: 'bounce',
          dur: '3s',
          delay: '2.25s',
        },
      ],
    },
  ]

  const distortions = [
    { id: 'distortion-1', size: 'w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16' },
    { id: 'distortion-2', size: 'w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36' },
    { id: 'distortion-3', size: 'w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64' },
    { id: 'distortion-4', size: 'w-48 h-48 md:w-72 md:h-72 lg:w-96 lg:h-96' },
  ]

  // Determine status message
  const statusText = status
    ? typeof status === 'number'
      ? getHttpStatusMessage(status)
      : status
    : 'Loading'

  const displayMessage = message || statusText

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center">
        {/* Animation Container */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-64 lg:h-64">
          {/* Core */}
          <div
            className="absolute top-1/2 left-1/2 w-1 h-1 md:w-1.5 md:h-1.5 lg:w-2 lg:h-2 bg-foreground rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{ animationDuration: '0.8s' }}
          />

          {/* Orbitals */}
          {orbitals.map(({ id, size, duration, direction }) => (
            <div
              key={id}
              className={`absolute top-1/2 left-1/2 ${size} border rounded-full -translate-x-1/2 -translate-y-1/2 border-opacity-30`}
              style={{
                animationDuration: duration,
                animationDirection: direction || 'normal',
              }}
            />
          ))}

          {/* Quantum States */}
          {quantumStates.map(({ id, size, duration, direction, particles }) => (
            <div
              key={id}
              className={`absolute top-1/2 left-1/2 ${size} -translate-x-1/2 -translate-y-1/2 animate-spin`}
              style={{
                animationDuration: duration,
                animationDirection: direction || 'normal',
              }}
            >
              {particles.map(({ id: particleId, index, pos, anim, dur, delay }) => (
                <div
                  key={particleId}
                  className={`${pos ? `absolute ${pos}` : ''} w-1 h-1 md:w-1.5 md:h-1.5 lg:w-2 lg:h-2 rounded-full animate-${anim}`}
                  style={{
                    backgroundColor: `var(--chart-${index})`,
                    animationDuration: dur,
                    animationDelay: delay || '0s',
                  }}
                />
              ))}
            </div>
          ))}

          {/* Field Distortions */}
          {distortions.map(({ id, size }, i) => (
            <div
              key={id}
              className={`absolute top-1/2 left-1/2 ${size} bg-muted/[calc(30-${i}*5)] rounded-full -translate-x-1/2 -translate-y-1/2`}
            />
          ))}
        </div>

        {/* Status Text */}
        <div className="mt-20 md:mt-24 lg:mt-32 text-center max-w-md">
          {status && typeof status === 'number' && (
            <h2 className="text-4xl font-bold mb-2 tracking-tight">{status}</h2>
          )}
          <p className="text-xl md:text-2xl font-medium text-foreground tracking-wide">
            {displayMessage}
          </p>
          {subtext && (
            <p className="mt-2 text-sm md:text-base text-foreground/70 max-w-sm mx-auto leading-relaxed">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to get HTTP status messages
function getHttpStatusMessage(status: number): string {
  const statusMessages: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    408: 'Request Timeout',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  }

  return statusMessages[status] || `Status ${status}`
}
