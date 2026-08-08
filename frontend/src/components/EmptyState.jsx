export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-neutral-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      {message && <p className="text-sm text-neutral-500 max-w-sm mb-4">{message}</p>}
      {action}
    </div>
  );
}
