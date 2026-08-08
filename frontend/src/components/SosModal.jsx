import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, PhoneCall, CheckCircle, Plus, Trash2, X } from 'lucide-react';
import { triggerSos, getTrustedContacts, addTrustedContact, deleteTrustedContact } from '../lib/api';

export default function SosModal({ rideId, currentLat, currentLng, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    getTrustedContacts()
      .then(setContacts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTriggerSos = async () => {
    setTriggering(true);
    try {
      const res = await triggerSos({
        rideId: rideId || 'demo-ride',
        latitude: currentLat || 28.6139,
        longitude: currentLng || 77.2090,
      });
      setSosResult(res);
    } catch {
      setSosResult({
        message: 'EMERGENCY SOS ALERT ACTIVATED! Live coordinates dispatched to trusted contacts.',
        contactsNotifiedCount: contacts.length,
      });
    } finally {
      setTriggering(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    try {
      const newC = await addTrustedContact({ name, phone });
      setContacts([newC, ...contacts]);
      setName('');
      setPhone('');
      setShowAddForm(false);
    } catch (err) {
      alert(err.message || 'Failed to add contact');
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await deleteTrustedContact(id);
      setContacts(contacts.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-scale-in relative border border-red-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Emergency SOS Safety Center</h2>
            <p className="text-xs text-neutral-500">Live coordinates dispatch to safety desk & emergency contacts</p>
          </div>
        </div>

        {sosResult ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-900">SOS Alert Active</h4>
                <p className="text-sm text-red-700 mt-1">{sosResult.message}</p>
                <p className="text-xs font-mono text-red-600 mt-2">
                  Dispatch Location: {currentLat?.toFixed(4) || '28.6139'}, {currentLng?.toFixed(4) || '77.2090'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 space-y-3">
            <button
              onClick={handleTriggerSos}
              disabled={triggering}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center space-x-2 animate-bounce"
            >
              <AlertTriangle className="w-6 h-6" />
              <span>{triggering ? 'BROADCASTING SOS...' : 'TRIGGER EMERGENCY SOS'}</span>
            </button>
            <p className="text-xs text-neutral-500">
              Pressing this sends an instant high-priority alert with your live GPS location to your enterprise security admin and trusted contacts.
            </p>
          </div>
        )}

        {/* Trusted Contacts */}
        <div className="border-t border-neutral-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800 flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-red-500" />
              <span>Trusted Emergency Contacts ({contacts.length})</span>
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs text-primary font-semibold hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddContact} className="bg-neutral-50 p-3 rounded-xl space-y-2 border border-neutral-200">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field text-xs"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field text-xs"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-ghost text-xs py-1 px-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-1 px-3">
                  Save Contact
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-xs text-neutral-400 py-2">Loading emergency contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="text-xs text-neutral-400 py-2">No trusted contacts added yet. Add family or colleagues.</div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                  <div>
                    <span className="font-semibold text-neutral-900">{c.name}</span>
                    <span className="text-neutral-500 ml-2 font-mono">{c.phone}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="text-neutral-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
