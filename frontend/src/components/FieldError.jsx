export function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1.5 text-xs text-error font-medium">{error}</p>;
}
