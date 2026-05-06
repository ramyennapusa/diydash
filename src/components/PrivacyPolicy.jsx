import './PrivacyPolicy.css'

const EFFECTIVE_DATE = 'May 5, 2025'
const CONTACT_EMAIL = 'support@draft2done.com'
const APP_NAME = 'Draft2Done'

export default function PrivacyPolicy() {
  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <div className="privacy-logo">
          <img src="/draft2done-icon-v4.svg" alt="Draft2Done" className="privacy-logo-img" />
          <span className="privacy-logo-name">{APP_NAME}</span>
        </div>

        <h1>Privacy Policy</h1>
        <p className="privacy-effective">Effective Date: {EFFECTIVE_DATE}</p>

        <p className="privacy-intro">
          {APP_NAME} ("we", "our", or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your information
          when you use the {APP_NAME} mobile application and website (collectively, the "Service").
          Please read this policy carefully. By using the Service, you agree to the practices
          described here.
        </p>

        <section>
          <h2>1. Information We Collect</h2>

          <h3>Information You Provide</h3>
          <ul>
            <li>
              <strong>Account Information:</strong> When you create an account, we collect
              your email address and display name. Passwords are never stored by us — they
              are managed securely by AWS Cognito.
            </li>
            <li>
              <strong>Project Content:</strong> Text, titles, descriptions, and status
              information you enter for your projects, tasks, materials, tools, and reference links.
            </li>
            <li>
              <strong>Media Files:</strong> Photos and videos you upload to document your projects.
              These are stored securely in Amazon S3.
            </li>
            <li>
              <strong>Collaboration Data:</strong> Email addresses of people you invite to
              collaborate on your projects.
            </li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li>
              <strong>Usage Data:</strong> Basic information about how you interact with the
              Service, such as features used and actions taken, used solely to improve the app.
            </li>
            <li>
              <strong>Device Information:</strong> Device type, operating system version, and
              app version, collected to ensure compatibility and diagnose issues.
            </li>
          </ul>

          <h3>Information We Do Not Collect</h3>
          <ul>
            <li>We do not collect your precise location.</li>
            <li>We do not access your contacts, calendar, or any data outside the app.</li>
            <li>We do not collect payment information. The app is free.</li>
            <li>We do not serve advertisements and do not collect advertising identifiers.</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and manage your account and authenticate you securely.</li>
            <li>Store and sync your projects, tasks, media, and other content across devices.</li>
            <li>Enable collaboration features, such as sharing projects with people you invite.</li>
            <li>Send you transactional emails, such as email verification codes, password reset
                codes, and collaboration invite notifications.</li>
            <li>Respond to your support requests and communications.</li>
            <li>Diagnose technical issues and improve the reliability of the Service.</li>
          </ul>
          <p>
            We do not use your content to train machine learning models. We do not sell,
            rent, or share your personal data with third parties for their marketing purposes.
          </p>
        </section>

        <section>
          <h2>3. How We Share Your Information</h2>

          <h3>With Collaborators You Invite</h3>
          <p>
            When you share a project, the collaborators you invite can see the project's
            content (title, description, tasks, pictures, etc.) according to the permission
            level you grant ("View" or "Edit"). Their email address is visible to you as the
            project owner.
          </p>

          <h3>With Service Providers</h3>
          <p>
            We use Amazon Web Services (AWS) to operate the Service. Your data is stored on
            AWS infrastructure (DynamoDB for project data, S3 for media files, Cognito for
            authentication). AWS processes data on our behalf under strict confidentiality
            obligations and does not use your data for its own purposes.
          </p>

          <h3>Legal Requirements</h3>
          <p>
            We may disclose your information if required by law, court order, or governmental
            authority, or if we believe disclosure is necessary to protect our rights or the
            safety of our users.
          </p>

          <h3>Business Transfers</h3>
          <p>
            If {APP_NAME} is acquired or merges with another company, your information may be
            transferred as part of that transaction. We will notify you before your data becomes
            subject to a different privacy policy.
          </p>
        </section>

        <section>
          <h2>4. Data Storage and Security</h2>
          <p>
            All data is stored on AWS servers located in the United States (us-west-2 region).
            We implement the following security measures:
          </p>
          <ul>
            <li>All data is transmitted over HTTPS (TLS encryption in transit).</li>
            <li>Media files are stored in a private Amazon S3 bucket. Access requires
                short-lived, authenticated credentials — your files are never publicly accessible.</li>
            <li>Passwords are managed by AWS Cognito and are never stored or visible to us.</li>
            <li>Authentication tokens expire and are automatically refreshed by the app.</li>
            <li>Access to production systems is restricted to authorized personnel only.</li>
          </ul>
          <p>
            No method of electronic transmission or storage is 100% secure. While we strive to
            use commercially reasonable means to protect your data, we cannot guarantee absolute
            security.
          </p>
        </section>

        <section>
          <h2>5. Your Rights and Choices</h2>

          <h3>Access and Correction</h3>
          <p>
            You can view and edit your project content, profile name, and account settings
            at any time within the app.
          </p>

          <h3>Data Deletion</h3>
          <p>
            You can permanently delete your account from the Account settings screen in the app.
            Deleting your account will remove your profile, all projects you own, all uploaded
            media, and your authentication credentials. This action is irreversible.
          </p>
          <p>
            Data shared with collaborators (project content visible to them before deletion)
            may be retained in their view until the collaboration record is also removed.
          </p>

          <h3>Email Communications</h3>
          <p>
            We only send transactional emails (verification codes, password resets, collaboration
            invites). These are necessary for the Service to function and cannot be opted out of
            while your account is active. We do not send marketing or promotional emails.
          </p>

          <h3>Collaboration</h3>
          <p>
            You can remove collaborators from your projects at any time from the project's
            sharing settings. Collaborators can leave a shared project at any time from their
            project view.
          </p>
        </section>

        <section>
          <h2>6. Children's Privacy</h2>
          <p>
            The Service is not directed to children under the age of 13. We do not knowingly
            collect personal information from children under 13. If you believe a child under 13
            has provided us with personal information, please contact us and we will promptly
            delete it.
          </p>
        </section>

        <section>
          <h2>7. Third-Party Services</h2>
          <p>
            The Service uses the following third-party services:
          </p>
          <ul>
            <li>
              <strong>Amazon Web Services (AWS):</strong> Cloud infrastructure, authentication
              (Cognito), database (DynamoDB), and file storage (S3).
              <br />Privacy Policy: <a href="https://aws.amazon.com/privacy/" target="_blank" rel="noreferrer">aws.amazon.com/privacy</a>
            </li>
          </ul>
          <p>
            We do not integrate with social media platforms, advertising networks, or
            analytics services that track you across other websites or apps.
          </p>
        </section>

        <section>
          <h2>8. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. When you delete your
            account, your data is deleted from our systems within 30 days, except where
            retention is required by law. Backup copies may persist for up to 90 days before
            being permanently purged.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we make material changes,
            we will update the Effective Date at the top of this page. We encourage you to review
            this policy periodically. Your continued use of the Service after any changes
            constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or
            your personal data, please contact us at:
          </p>
          <p className="privacy-contact">
            <strong>{APP_NAME}</strong><br />
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </section>

        <div className="privacy-footer">
          <a href="/">&larr; Back to {APP_NAME}</a>
        </div>
      </div>
    </div>
  )
}
