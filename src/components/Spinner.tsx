export function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div
        className="w-8 h-8 rounded-full animate-spin"
        style={{
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
        }}
      />
    </div>
  );
}
