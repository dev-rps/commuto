export function StatusBadge({ status }) {
  const styles = {
    PUBLISHED: 'bg-primary-50 text-primary-700',
    IN_PROGRESS: 'bg-accent-50 text-accent-700',
    COMPLETED: 'bg-neutral-100 text-neutral-600',
    CANCELLED: 'bg-error/10 text-error',
    BOOKED: 'bg-primary-50 text-primary-700',
    PAYMENT_PENDING: 'bg-warning/10 text-warning',
    PAYMENT_COMPLETED: 'bg-accent-50 text-accent-700',
    PENDING: 'bg-warning/10 text-warning',
    SUCCESS: 'bg-accent-50 text-accent-700',
    FAILED: 'bg-error/10 text-error',
    RECHARGE: 'bg-accent-50 text-accent-700',
    RIDE_PAYMENT: 'bg-primary-50 text-primary-700',
    REFUND: 'bg-warning/10 text-warning',
  };
  const labels = {
    PUBLISHED: 'Published', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
    BOOKED: 'Booked', PAYMENT_PENDING: 'Payment Pending', PAYMENT_COMPLETED: 'Paid',
    PENDING: 'Pending', SUCCESS: 'Success', FAILED: 'Failed',
    RECHARGE: 'Recharge', RIDE_PAYMENT: 'Ride Payment', REFUND: 'Refund',
  };
  return <span className={`badge ${styles[status] || 'bg-neutral-100 text-neutral-600'}`}>{labels[status] || status}</span>;
}
