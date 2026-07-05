import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const CONTAINER = "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"

export default function PrivacyPolicy({ onSearch , onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar onSearch={onSearch} onNavigate={onNavigate} />

      <div className={`flex-1 pt-28 pb-16 ${CONTAINER}`}>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: July 2026</p>

        <div className="mt-10 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. What we collect</h2>
            <p>
              When you use SkyScout's search and price-alert features, we collect the information you
              voluntarily provide such as your email address, origin and destination cities, travel dates,
              and budget preferences.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. How we use your information</h2>
            <p>
              Your email address is used solely to send you fare-drop notifications for the routes you've
              searched. Your search criteria is stored so we can match future fares against your budget and
              alert you when a deal appears.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Third-party data providers</h2>
            <p>
              SkyScout retrieves flight fare and airport data from third-party providers to power search
              results and arrivals/departures boards. We do not share your personal email address or search
              history with these providers beyond what's needed to perform the search itself.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Data storage</h2>
            <p>
              Search records and alert preferences are stored securely and used only to operate the price-alert
              feature. We do not sell, rent, or share your personal data with advertisers or unrelated third
              parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Cookies and tracking</h2>
            <p>
              SkyScout does not use tracking cookies for advertising purposes. Any technical data collected is
              used only to keep the service functioning correctly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Your choices</h2>
            <p>
              You can stop receiving fare alerts at any time by no longer submitting new searches with your
              email address. If you'd like existing data removed, contact us using the details on our
              homepage.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy periodically to reflect changes in how SkyScout operates.
              We'll post the updated date at the top of this page whenever changes are made.
            </p>
          </section>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}