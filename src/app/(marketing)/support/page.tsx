import Link from 'next/link';
import { LifeBuoy, Mail, MessageSquare, Phone } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">How can we help you?</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Whether you have a question about features, pricing, or technical issues, our team is ready to answer all your questions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Email Support */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
            <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Email Support</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Send us an email anytime. We usually reply within 24 hours.
            </p>
            <a href="mailto:support@bnabilling.com" className="text-blue-600 font-semibold hover:underline">
              support@bnabilling.com
            </a>
          </div>

          {/* Live Chat */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
            <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Live Chat</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Chat with our support team in real-time during business hours.
            </p>
            <button className="text-blue-600 font-semibold hover:underline">
              Start a conversation
            </button>
          </div>

          {/* Phone Support */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
            <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 mb-6">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Phone Support</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Call us directly for urgent inquiries and enterprise support.
            </p>
            <a href="tel:+18001234567" className="text-blue-600 font-semibold hover:underline">
              +1 (800) 123-4567
            </a>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
            &larr; Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
