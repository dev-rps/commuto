export function Spinner({ size = 'md', label }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-[3px]', lg: 'w-12 h-12 border-4' };
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <div className={`${sizes[size]} rounded-full border-neutral-200 border-t-primary animate-spin`} role="status" aria-label="Loading" />
      {label && <p className="text-sm text-neutral-500">{label}</p>}
    </div>
  );
}
