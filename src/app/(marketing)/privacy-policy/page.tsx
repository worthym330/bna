import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-slate-600 mb-4">
            We collect information you provide directly to us when you register for an account, create or modify your profile, request customer support, or otherwise communicate with us. This includes names, email addresses, and billing information.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-slate-600 mb-4">
            We use the information we collect to provide, maintain, and improve our services, including processing transactions, sending technical notices, and providing customer support.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Data Security</h2>
          <p className="text-slate-600 mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Google Workspace Data</h2>
          <p className="text-slate-600 mb-4">
            When you connect your Google Workspace account to Invoq, we access your Gmail data strictly for the purpose of sending emails on your behalf and reading email threads related to your billing operations. We do not sell this data or use it for advertising purposes.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t flex items-center justify-between">
          <Link href="/" className="text-blue-600 font-medium hover:underline flex items-center gap-2">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
