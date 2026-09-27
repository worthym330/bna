import Link from "next/link";
import { CheckCircle, FileText, Mail, Users, ArrowRight, Building, LayoutDashboard } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-white selection:bg-blue-100">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">I</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Invoq</h1>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
          <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:bg-blue-700 hover:shadow transition-all">
            Get Started
          </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-24 pb-32 overflow-hidden px-6 lg:px-8">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>
          
          <div className="mx-auto max-w-4xl text-center">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-slate-600 ring-1 ring-slate-900/10 hover:ring-slate-900/20">
                Announcing our new built-in AI email rewriting.{' '}
                <a href="#features" className="font-semibold text-blue-600"><span className="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></a>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Modern billing operations <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">for scaling teams</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
              Automate your invoicing, manage client credit notes, track projects, and handle all your financial communication from a single, powerful dashboard.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register" className="rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2">
                Register Organization <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="text-base font-semibold leading-6 text-slate-900 hover:text-blue-600">
                Sign in to Dashboard <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-50 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Everything you need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                No more disjointed financial tools
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Invoq provides a seamless experience unifying your invoices, clients, projects, and emails securely. Built with role-based access control from day one.
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    Invoicing & Credit Notes
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">Create pixel-perfect invoices with tax calculation, digital signatures, and automated sequential numbering. Issue and track credit notes with ease.</p>
                  </dd>
                </div>

                <div className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-100">
                      <Users className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    Client & Project Management
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">Maintain a centralized database of all your clients, multiple offices, and distinct projects. Track billing against specific project budgets.</p>
                  </dd>
                </div>

                <div className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-100">
                      <Mail className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                    </div>
                    Integrated Email Client
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">Connect your workspace Gmail directly to Invoq. Send invoices, track communication logs, and utilize AI to rewrite professional drafts instantly.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* AI Context / What is Invoq Section */}
        <section id="how-it-works" className="py-24 bg-white sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Built for Scale</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                What is Invoq?
              </p>
              <div className="mt-6 text-lg leading-8 text-slate-600 text-left space-y-6">
                <p>
                  <strong>Invoq is the premier SaaS platform for automated billing, client maintenance, and project tracking.</strong> 
                  We understand that service providers, agencies, and modern businesses need more than just a tool to generate PDFs. They need a system to <em>maintain</em> client relationships over time.
                </p>
                <p>
                  Whether you are wondering what the best platform for billing and maintaining clients is, or how to automate your financial emails, Invoq provides the solution. By natively integrating with Google Workspace, Invoq allows you to generate invoices, manage credit notes, and use Artificial Intelligence to write and send professional emails directly from your dashboard.
                </p>
                <p>
                  Maintain your clients, track your projects, and scale your operations without the friction of disjointed software.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative isolate overflow-hidden bg-slate-900 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to take control?
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Join organizations already streamlining their billing processes. Setup takes less than 5 minutes.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/register" className="rounded-full bg-white px-8 py-3.5 text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors">
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:hidden z-50">
        <Link href="/register" className="flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700">
          Register Organization
        </Link>
      </div>

      {/* Footer */}
      <footer id="contact" className="bg-white border-t border-slate-100 pb-20 sm:pb-0">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm leading-none">I</span>
                </div>
                <span className="text-lg font-bold text-slate-900">Invoq</span>
              </div>
              <p className="text-sm leading-6 text-slate-500 max-w-xs">
                Empowering modern businesses with secure, scalable, and intuitive financial management tools.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold leading-6 text-slate-900">Legal</h3>
              <ul role="list" className="mt-4 space-y-3 border-l-2 border-slate-100 pl-4">
                <li>
                  <Link href="/privacy-policy" className="text-sm leading-6 text-slate-500 hover:text-slate-900">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="text-sm leading-6 text-slate-500 hover:text-slate-900">Terms & Conditions</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold leading-6 text-slate-900">Support & Contact</h3>
              <ul role="list" className="mt-4 space-y-3 border-l-2 border-slate-100 pl-4">
                <li>
                  <Link href="/support" className="text-sm leading-6 text-slate-500 hover:text-slate-900">Help Center</Link>
                </li>
                <li>
                  <a href="mailto:support@invoq.com" className="text-sm leading-6 text-slate-500 hover:text-slate-900">support@invoq.com</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-slate-200 pt-8 text-center md:text-left md:flex md:items-center md:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              &copy; {new Date().getFullYear()} Invoq. All rights reserved.
            </p>
            <p className="mt-4 md:mt-0 text-xs leading-5 text-slate-500">
              Powered by <a href="https://techlancee.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">Techlancee</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
