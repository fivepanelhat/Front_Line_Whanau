'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Something went wrong</h2>
          <p style={{ color: '#555', maxWidth: '28rem', marginBottom: '1.5rem' }}>
            The app hit an unexpected error. Try again. If it keeps happening, use the contacts
            below.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: '#35806c',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#666', maxWidth: '24rem' }}>
            Emergency 111 · Healthline 0800 611 116 · PlunketLine 0800 933 922
          </p>
        </div>
      </body>
    </html>
  );
}
