import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { ZAVORA_BRAND } from '../constants/index.js';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contact Zavora Restaurant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Have a question about our menu, need catering support, or want to give feedback to our kitchen manager? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <img
              src="/zavora-logo.png"
              alt="Zavora"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h2 className="text-base font-black text-slate-900">Zavora Restaurant</h2>
              <p className="text-xs text-brand-600 font-bold">Satisfy your hunger instantly</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
              <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Restaurant Address</p>
                <p>{ZAVORA_BRAND.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
              <Phone className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Phone Support</p>
                <p>{ZAVORA_BRAND.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
              <Mail className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Email Enquiries</p>
                <p>{ZAVORA_BRAND.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Operating Hours</p>
                <p>{ZAVORA_BRAND.hours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for contacting Zavora. Our restaurant manager will get back to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 mb-2">Send us a Message</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we assist you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-400 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 font-bold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
