import { useState } from 'react';
import { Star, X, CheckCircle } from 'lucide-react';
import { createReview } from '../lib/api';

export default function ReviewModal({ rideId, bookingId, revieweeId, revieweeName, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createReview({
        rideId,
        bookingId,
        revieweeId: revieweeId || 'demo-driver',
        rating,
        comment,
      });
      setSubmitted(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      alert(err.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-12 h-12 text-success mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-neutral-900">Thank You!</h3>
            <p className="text-sm text-neutral-500">Your review and rating have been recorded.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-neutral-900">Rate Your Ride</h2>
              <p className="text-xs text-neutral-500">How was your commute experience with {revieweeName || 'your driver'}?</p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center items-center space-x-2 py-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Feedback / Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Punctual, smooth driving, friendly co-worker..."
                rows={3}
                className="input-field text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-base font-semibold shadow-md shadow-primary/20"
            >
              {submitting ? 'Submitting Review...' : 'Submit Rating & Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
