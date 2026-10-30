import type { LegalDocument } from './types';

/**
 * ADL Privacy Policy.
 * Drafted to protect ADL while honoring user trust and major privacy regimes
 * (GDPR, CCPA/CPRA, and similar). This is a template and not a substitute for
 * review by licensed counsel in each jurisdiction in which ADL operates.
 */
export const PRIVACY: LegalDocument = {
  title: 'Privacy Policy',
  eyebrow: 'Your Trust',
  updated: 'May 30, 2026',
  effective: 'May 30, 2026',
  intro: [
    'Adl ("Adl," "we," "us," or "our") respects your privacy and is committed to protecting it. This Privacy Policy explains what information we collect, how we use and protect it, and the choices you have when you use the Adl applications, websites, and services (collectively, the "Service").',
    'By using the Service, you consent to the practices described in this Policy. If you do not agree, please do not use the Service. This Policy is incorporated into our Terms of Service.',
    'We design Adl to honor the sacred trust (am\u0101nah) you place in us by collecting only what we reasonably need and protecting it diligently.',
  ],
  sections: [
    {
      heading: '1. Information You Provide',
      bullets: [
        'Account data: name, email address, and authentication identifiers.',
        'Profile and preferences: settings such as language, calculation method, and reminders.',
        'User content: any content you submit, save, or share through the Service.',
        'Communications: messages you send to support and related metadata.',
      ],
    },
    {
      heading: '2. Information Collected Automatically',
      bullets: [
        'Device and technical data: device model, operating system, app version, and identifiers.',
        'Usage data: features used, interactions, and diagnostic and crash logs.',
        'Approximate or precise location, only where you grant permission, to provide prayer times and Qibla direction.',
        'Sensor data, such as compass and motion, used locally to compute Qibla direction.',
      ],
    },
    {
      heading: '3. How We Use Information',
      paragraphs: ['We process information for the following purposes:'],
      bullets: [
        'To provide, maintain, personalize, and improve the Service.',
        'To compute prayer times, Qibla direction, reminders, and related features.',
        'To authenticate users, secure accounts, and prevent fraud and abuse.',
        'To provide AI-assisted features you request.',
        'To communicate with you about updates, security, and support.',
        'To comply with legal obligations and enforce our Terms.',
      ],
    },
    {
      heading: '4. Legal Bases for Processing',
      paragraphs: [
        'Where applicable law (such as the GDPR) requires a legal basis, we rely on: your consent; the performance of our contract with you; our legitimate interests in operating and securing the Service; and compliance with legal obligations. You may withdraw consent at any time without affecting prior processing.',
      ],
    },
    {
      heading: '5. Location and Sensitive Data',
      paragraphs: [
        'Location and religious-practice data may be considered sensitive under some laws. We collect such data only to deliver the features you request, retain it only as needed, and never sell it. Where required, we obtain your explicit consent before processing.',
      ],
    },
    {
      heading: '6. AI Processing',
      paragraphs: [
        'When you use AI features, your prompts and necessary context may be processed by us or by vetted service providers under contractual confidentiality and security obligations. We do not use the content of your private requests to publicly identify you, and we apply reasonable safeguards consistent with this Policy.',
      ],
    },
    {
      heading: '7. How We Share Information',
      paragraphs: [
        'We do not sell your personal information. We share it only as described here:',
      ],
      bullets: [
        'Service providers and processors acting on our behalf under strict contractual obligations.',
        'App stores and sign-in providers you choose to use.',
        'Legal and safety disclosures required by law, legal process, or to protect rights and safety.',
        'Business transfers, such as a merger or acquisition, subject to this Policy.',
        'With your consent or at your direction.',
      ],
    },
    {
      heading: '8. International Transfers',
      paragraphs: [
        'We may process and store information in countries other than yours. Where we transfer personal data across borders, we use appropriate safeguards, such as standard contractual clauses, to protect it consistent with applicable law.',
      ],
    },
    {
      heading: '9. Data Retention',
      paragraphs: [
        'We retain personal information only as long as necessary for the purposes described in this Policy, to comply with legal obligations, resolve disputes, and enforce our agreements. When no longer needed, we delete or anonymize it.',
      ],
    },
    {
      heading: '10. Security',
      paragraphs: [
        'We employ administrative, technical, and physical safeguards designed to protect your information, including encryption in transit and access controls. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
      ],
    },
    {
      heading: '11. Your Rights and Choices',
      paragraphs: [
        'Depending on your jurisdiction, you may have rights to access, correct, delete, port, or restrict processing of your personal information, and to object to certain processing or withdraw consent.',
      ],
      bullets: [
        'GDPR (EEA/UK): access, rectification, erasure, restriction, portability, and objection.',
        'CCPA/CPRA (California): know, delete, correct, and opt out of "sale" or "sharing." We do not sell your data.',
        'You may also disable location or notification permissions in your device settings at any time.',
      ],
    },
    {
      heading: '12. Children\u2019s Privacy',
      paragraphs: [
        'The Service is not directed to children under the age where parental consent is required by local law, and we do not knowingly collect their personal information. If you believe a child has provided us data, contact us and we will delete it.',
      ],
    },
    {
      heading: '13. Cookies and Similar Technologies',
      paragraphs: [
        'Our websites and certain features may use cookies and similar technologies for functionality, analytics, and preferences. You can control these through your browser or device settings; disabling them may affect functionality.',
      ],
    },
    {
      heading: '14. Third-Party Links and Services',
      paragraphs: [
        'The Service may link to or integrate third-party services with their own privacy practices. We are not responsible for those services, and we encourage you to review their policies.',
      ],
    },
    {
      heading: '15. Changes to This Policy',
      paragraphs: [
        'We may update this Policy from time to time. Material changes will be communicated through the Service or by other reasonable means, and the "Last updated" date will be revised. Your continued use after changes take effect constitutes acceptance.',
      ],
    },
    {
      heading: '16. Contact Us',
      paragraphs: [
        'For privacy questions or to exercise your rights, contact our privacy team at privacy@adlproject.org. Where required, we will respond within the timeframe mandated by applicable law.',
      ],
    },
  ],
  closing: [
    'Privacy inquiries: privacy@adlproject.org.',
    '\u00A9 2026 Adl. All rights reserved.',
  ],
};
