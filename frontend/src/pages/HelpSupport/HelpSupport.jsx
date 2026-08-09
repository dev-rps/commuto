import { ArrowLeft, MessageCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HelpSupport() {
  const navigate = useNavigate();

  const faqs = [
    {
      q: 'How do I publish a ride?',
      a: 'Go to the "Offer Ride" section, select your registered vehicle, and fill in your route and timing details. Make sure your vehicle is approved in "My Vehicles" first.'
    },
    {
      q: 'How is the fare calculated?',
      a: 'Fares are automatically suggested based on your organization\'s fuel policy and the distance of the trip, ensuring fair cost-sharing.'
    },
    {
      q: 'What happens if I cancel a booked ride?',
      a: 'If you cancel before the ride starts, your wallet will be refunded immediately. Frequent cancellations may affect your trust score.'
    },
    {
      q: 'How do I contact my driver/passenger?',
      a: 'Once a ride is booked, you can use the in-app chat or the direct phone call button from the Live Tracking screen.'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8 animate-fade-up">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Help & Support</h1>
          <p className="text-neutral-500 text-sm">We are here to help you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 hover:border-primary-200 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-bold text-neutral-900 mb-1">Chat Support</h3>
          <p className="text-sm text-neutral-500">Typical reply within 5 minutes</p>
        </div>

        <div className="card p-5 hover:border-primary-200 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-bold text-neutral-900 mb-1">Email Us</h3>
          <p className="text-sm text-neutral-500">support@commuto.com</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
              <h4 className="font-semibold text-neutral-900 text-sm mb-1">{faq.q}</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 bg-neutral-900 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary-400" />
              Emergency Support
            </h2>
            <p className="text-neutral-400 text-sm mb-4 max-w-sm">
              If you are facing an emergency during a ride, please use our 24/7 dedicated helpline.
            </p>
            <a href="tel:112" className="btn-primary bg-white text-neutral-900 hover:bg-neutral-100">
              Call Emergency Helpline
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
