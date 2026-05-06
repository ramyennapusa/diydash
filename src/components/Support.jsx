import './PrivacyPolicy.css'

const APP_NAME = 'Draft2Done'
const SUPPORT_EMAIL = 'support.draft2done@gmail.com'

export default function Support() {
  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <div className="privacy-logo">
          <img src="/draft2done-icon-v4.svg" alt="Draft2Done" className="privacy-logo-img" />
          <span className="privacy-logo-name">{APP_NAME}</span>
        </div>

        <h1>Support</h1>
        <p className="privacy-intro">
          Need help with {APP_NAME}? We are here to help with login issues, password reset, project
          access, account questions, and bug reports.
        </p>
        <p>
          Please email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We aim to reply
          to all support requests within 48 hours.
        </p>

        <section>
          <h2>Contact</h2>
          <p className="privacy-contact">
            <strong>Email support</strong>
            <br />
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </section>

        <section>
          <h2>Helpful Links</h2>
          <ul>
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/">Back to Login</a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
