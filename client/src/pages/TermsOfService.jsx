import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const CONTAINER = "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"

export default function TermsOfService({ onSearch, onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar onSearch={onSearch} onNavigate={onNavigate} />

      <div className={`flex-1 pt-28 pb-16 ${CONTAINER}`}>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: July 2026</p>

        <div className="mt-10 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Acceptance of terms</h2>
            <p>
              By accessing or using SkyScout, you agree to be bound by these Terms of Service. If you don't
              agree, please don't use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. What SkyScout does</h2>
            <p>
              SkyScout searches publicly available flight fare data and sends you email notifications when a
              fare matching your saved criteria becomes available. We are not a travel agency, airline, or
              booking platform we do not process payments, issue tickets, or guarantee fare accuracy at the
              time of booking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Fare accuracy</h2>
            <p>
              Flight prices change constantly and are controlled entirely by airlines and third-party data
              providers. While we strive to surface accurate, up-to-date fares, SkyScout cannot guarantee that
              a displayed price will be available when you attempt to book it elsewhere.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. User responsibilities</h2>
            <p>
              You agree to provide accurate information (such as your email address) when using our alert
              features, and not to misuse the service including attempts to overload, scrape, or interfere
              with SkyScout's search infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">5. No liability for booking outcomes</h2>
            <p>
              SkyScout is not responsible for any losses, missed fares, or booking issues that occur on
              third-party airline or travel sites. Always verify final pricing and terms directly with the
              airline before completing a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Changes to these terms</h2>
            <p>
              We may update these Terms of Service from time to time. Continued use of SkyScout after changes
              are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Contact</h2>
            <p>
              Questions about these terms? Reach out to us through the contact details listed on our homepage.
            </p>
          </section>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}