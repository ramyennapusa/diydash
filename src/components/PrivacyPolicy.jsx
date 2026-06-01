import './PrivacyPolicy.css'

/** Update when you publish or materially change this policy (must match the live page). */
const EFFECTIVE_DATE = 'May 5, 2026'
/** Use the address you monitor; keep this in sync across app, site, and store listing. */
const CONTACT_EMAIL = 'support.draft2done@gmail.com'
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
          {APP_NAME} (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your information
          when you use the {APP_NAME} mobile application and website (collectively, the &quot;Service&quot;).
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
              information you enter for your projects, tasks, supplies, and reference links.
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
          <p>
            We do <strong>not</strong> embed third-party advertising or cross-app analytics SDKs.
            Technical information may still be generated when you use the Service:
          </p>
          <ul>
            <li>
              <strong>Cloud and API operations:</strong> When you use the Service, our AWS-based
              APIs and authentication (including Cognito) may create server-side records typical of
              cloud hosting — for example timestamps, request metadata, and IP addresses — for
              security, abuse prevention, troubleshooting, and reliability.
            </li>
            <li>
              <strong>App and device context:</strong> Information such as app version or OS version
              may appear in diagnostic data when you contact support or when it is included in
              routine error or connectivity information processed by our infrastructure.
            </li>
          </ul>

          <h3>Information We Do Not Collect</h3>
          <ul>
            <li>We do not collect your precise location.</li>
            <li>We do not access your contacts, calendar, or any data outside the app.</li>
            <li>We do not collect payment information. The app is free.</li>
            <li>We do not serve advertisements and do not collect advertising identifiers for ads.</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and manage your account and authenticate you securely.</li>
            <li>Store and sync your projects, tasks, media, and other content across devices.</li>
            <li>Enable collaboration features, such as sharing projects with people you invite.</li>
            <li>
              Send you transactional emails, such as email verification codes, password reset
              codes, and collaboration invite notifications (delivered via AWS services such as Cognito
              and, where applicable, Amazon SES).
            </li>
            <li>Respond to your support requests and communications.</li>
            <li>Diagnose technical issues and improve the reliability and security of the Service.</li>
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
            When you share a project, the collaborators you invite can see the project&apos;s
            content (title, description, tasks, pictures, etc.) according to the permission
            level you grant (&quot;View&quot; or &quot;Edit&quot;). Their email address is visible to you as the
            project owner.
          </p>

          <h3>With Service Providers</h3>
          <p>
            We use Amazon Web Services (AWS) to operate the Service. Your data is stored on
            AWS infrastructure (for example DynamoDB for project data, S3 for media files, Cognito for
            authentication, and SES or related AWS messaging for transactional email where used).
            AWS processes data on our behalf under its agreements and privacy notice and does not use
            your content for its own advertising purposes.
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
            <strong>Production</strong> data for the Service is stored in AWS in the{' '}
            <strong>United States</strong> (primarily <strong>us-west-2</strong>). Non-production
            environments (for example staging) may use the same or a different region depending on
            how we operate the Service; contact us if you need environment-specific details.
          </p>
          <p>We implement measures including:</p>
          <ul>
            <li>Data in transit is protected using HTTPS (TLS) between your app/browser and our services where applicable.</li>
            <li>
              Media files are stored in a private Amazon S3 bucket. Access uses authenticated,
              short-lived credentials — your files are not made publicly readable by default.
            </li>
            <li>Passwords are managed by AWS Cognito and are not visible to us in plain text.</li>
            <li>Authentication tokens expire and are refreshed by the app according to normal session behavior.</li>
            <li>Access to production systems is limited to authorized personnel.</li>
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
            may be retained in their view until the collaboration record is also removed or updated.
          </p>

          <h3>Email Communications</h3>
          <p>
            We only send <strong>transactional</strong> emails (verification codes, password resets,
            collaboration invites). These are necessary for the Service to function and cannot be
            opted out of while your account is active. We do not send marketing or promotional
            emails today; if that changes, we will update this policy and provide appropriate
            choices where required by law.
          </p>

          <h3>Collaboration</h3>
          <p>
            You can remove collaborators from your projects at any time from the project&apos;s
            sharing settings. Collaborators can leave a shared project at any time from their
            project view.
          </p>

          <h3>International Users (EEA, UK, Switzerland, and Similar Regions)</h3>
          <p>
            If you are located in the European Economic Area, the United Kingdom, Switzerland, or
            another jurisdiction with privacy laws that apply to you, you may have additional
            rights — such as to access, correct, delete, or export certain personal data, to object
            to or restrict certain processing, or to lodge a complaint with a supervisory authority.
            To exercise these rights where applicable, contact us at the email below. We will
            respond in line with applicable law.
          </p>
          <p>
            Your information may be processed in the <strong>United States</strong> and other
            countries where AWS or we operate, which may have different data protection rules than
            your home country. Where required, we rely on appropriate safeguards (such as standard
            contractual clauses) or other lawful mechanisms for international transfers.
          </p>
        </section>

        <section>
          <h2>6. Children&apos;s Privacy</h2>
          <p>
            The Service is not directed to children under <strong>13</strong>, or under the
            minimum age required by the laws of your country if that age is higher. We do not
            knowingly collect personal information from children below that age. If you believe a
            child has provided us with personal information in violation of this policy, please
            contact us and we will take appropriate steps, including deletion where required.
          </p>
        </section>

        <section>
          <h2>7. Third-Party Services</h2>
          <p>The Service relies on the following categories of third-party infrastructure:</p>
          <ul>
            <li>
              <strong>Amazon Web Services (AWS):</strong> Cloud hosting, authentication (Cognito),
              database (DynamoDB), object storage (S3), and transactional email delivery (for example
              SES) where used for account and collaboration messages.
            </li>
          </ul>
          <p>
            AWS describes how it handles personal data in its privacy notice:{' '}
            <a href="https://aws.amazon.com/privacy/" target="_blank" rel="noreferrer">
              https://aws.amazon.com/privacy/
            </a>
          </p>
          <p>
            We do not integrate with social media platforms, advertising networks, or dedicated
            cross-site / cross-app analytics products that track you for marketing across unrelated
            apps or websites.
          </p>
        </section>

        <section>
          <h2>8. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. When you delete your account,
            we aim to delete associated personal data from active systems{' '}
            <strong>typically within 30 days</strong>, except where a longer period is required by
            law. Backup or disaster-recovery copies may persist for{' '}
            <strong>up to approximately 90 days</strong> before being overwritten or purged as
            part of our cloud provider&apos;s normal lifecycle.
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
