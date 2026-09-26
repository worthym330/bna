import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Terms and Conditions</h1>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-600 mb-4">
            By accessing or using the Invoq service, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Use License</h2>
          <p className="text-slate-600 mb-4">
            Permission is granted to temporarily access the materials (information or software) on Invoq for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Disclaimer</h2>
          <p className="text-slate-600 mb-4">
            The materials on Invoq are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Limitations</h2>
          <p className="text-slate-600 mb-4">
            In no event shall Invoq or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t flex items-center justify-between">
          <Link href="/" className="text-indigo-600 font-medium hover:underline flex items-center gap-2">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
