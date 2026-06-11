export interface LegalDoc {
  title: string;
  eyebrow: string;
  updated: string;
  intro: string;
  sections: { h: string; p: string[] }[];
}

export const privacyDoc: LegalDoc = {
  title: "Privacy Policy",
  eyebrow: "Legal",
  updated: "June 2026",
  intro:
    "This Privacy Policy explains what information Spider Identifier collects, how we use it, and the choices you have. We keep data collection to the minimum needed to run the service.",
  sections: [
    {
      h: "Information we collect",
      p: [
        "Images you upload for identification, which are processed to return a result. We do not sell your images or use them to identify you.",
        "Basic, anonymous usage analytics such as pages visited and features used, to improve the product.",
        "Information you voluntarily provide — for example your name and email when you contact us or subscribe to updates.",
      ],
    },
    {
      h: "How we use information",
      p: [
        "To process your photo and return a species match with a confidence score and venom-risk indicator.",
        "To respond to your messages and, if you opt in, to send occasional product and guide updates.",
        "To monitor performance, prevent abuse, and improve identification accuracy over time.",
      ],
    },
    {
      h: "Image handling",
      p: [
        "Uploaded images are used to generate your result. Where storage is enabled, images are optimised and converted to WebP and retained only as long as needed to operate the feature.",
        "You can request deletion of any image or account data you have provided by contacting us.",
      ],
    },
    {
      h: "Cookies & analytics",
      p: [
        "We use essential cookies to make the site function and may use privacy-respecting analytics to understand aggregate usage. You can control cookies through your browser settings.",
      ],
    },
    {
      h: "Third-party services",
      p: [
        "We rely on reputable infrastructure providers (such as hosting and database services) to operate. These providers process data on our behalf under their own security commitments.",
      ],
    },
    {
      h: "Payments",
      p: [
        "Payments are processed by Paddle.com, our authorised reseller and Merchant of Record. When you subscribe, your payment details are collected and handled securely by Paddle under its own privacy policy — we never see or store your full card details.",
      ],
    },
    {
      h: "Your rights",
      p: [
        "Depending on your location, you may have the right to access, correct, or delete your personal information, and to object to certain processing. Contact us to exercise these rights.",
      ],
    },
    {
      h: "Contact",
      p: ["For any privacy question or request, email us using the address on our contact page."],
    },
  ],
};

export const termsDoc: LegalDoc = {
  title: "Terms of Service",
  eyebrow: "Legal",
  updated: "June 2026",
  intro:
    "By using Spider Identifier you agree to these Terms. Please read them carefully, especially the sections on accuracy and safety.",
  sections: [
    {
      h: "Use of the service",
      p: [
        "Spider Identifier provides AI-assisted spider identification and educational content. You may use it for personal, non-commercial purposes and in line with these Terms and applicable law.",
        "You agree not to misuse the service, attempt to disrupt it, or upload unlawful or harmful content.",
      ],
    },
    {
      h: "Identification accuracy",
      p: [
        "Results are the closest AI match, not a guaranteed identification. Accuracy depends on image quality and species similarity, and the tool may be wrong.",
        "You are responsible for how you use a result. Do not rely on it for any safety-critical decision without independent expert confirmation.",
      ],
    },
    {
      h: "No medical or professional advice",
      p: [
        "Content on this site is for general information only and is not medical, veterinary, or professional advice. For a suspected bite or any health concern, seek qualified medical care.",
      ],
    },
    {
      h: "Subscriptions, billing & refunds",
      p: [
        "Paid plans are billed monthly and renew automatically until you cancel. Our order process is conducted by our reseller Paddle.com, the Merchant of Record, which handles payment, taxes and billing support.",
        "Paid plans include a 7-day free trial and a 14-day money-back guarantee. You can cancel anytime and keep access until the end of your billing period. Full details are in our Refund & Cancellation Policy.",
      ],
    },
    {
      h: "Intellectual property",
      p: [
        "The site, its design, text and graphics are owned by Spider Identifier or its licensors and are protected by applicable laws. You may not copy or redistribute them without permission.",
      ],
    },
    {
      h: "Limitation of liability",
      p: [
        "To the fullest extent permitted by law, Spider Identifier is provided 'as is' without warranties of any kind, and we are not liable for any loss or harm arising from use of the service or reliance on its results.",
      ],
    },
    {
      h: "Changes",
      p: [
        "We may update these Terms from time to time. Continued use after changes means you accept the revised Terms.",
      ],
    },
  ],
};

export const disclaimerDoc: LegalDoc = {
  title: "Safety Disclaimer",
  eyebrow: "Important",
  updated: "June 2026",
  intro:
    "Your safety comes first. Please read this disclaimer before acting on any identification or content from this site.",
  sections: [
    {
      h: "Not a guaranteed identification",
      p: [
        "Spider Identifier returns the most likely species based on a photo. It can be mistaken — particularly with blurry images, juveniles, or look-alike species. Always treat a result as a starting point, not a final verdict.",
      ],
    },
    {
      h: "Never handle dangerous spiders",
      p: [
        "If a result suggests a venomous species such as a widow, recluse or wandering spider — or if you are unsure — do not attempt to handle or provoke the spider. Photograph it from a safe distance.",
      ],
    },
    {
      h: "Suspected bites are a medical matter",
      p: [
        "If you believe you have been bitten and develop spreading pain, cramping, a worsening wound, fever, nausea or difficulty breathing, seek medical care immediately. Do not delay treatment to identify the spider.",
      ],
    },
    {
      h: "Educational purpose",
      p: [
        "All species information and guides are provided for general education. They are not a substitute for advice from a qualified medical professional, pest-control specialist, or arachnologist.",
      ],
    },
  ],
};

export const refundDoc: LegalDoc = {
  title: "Refund & Cancellation Policy",
  eyebrow: "Legal",
  updated: "June 2026",
  intro:
    "We want you to be happy with Spider Identifier. This policy explains your free trial, our money-back guarantee, and how to cancel. Payments are processed by Paddle, our authorised reseller and Merchant of Record.",
  sections: [
    {
      h: "7-day free trial",
      p: [
        "Paid plans start with a 7-day free trial. You will not be charged during the trial, and you can cancel any time before it ends to avoid being billed.",
      ],
    },
    {
      h: "14-day money-back guarantee",
      p: [
        "If you are charged and are not satisfied, contact us within 14 days of the charge for a full refund — no questions asked.",
        "To request a refund, email us with the email address on your account and the date of the charge. We process approved refunds promptly to your original payment method.",
      ],
    },
    {
      h: "Cancelling your subscription",
      p: [
        "You can cancel at any time from your dashboard or by contacting us. When you cancel, you keep access and any remaining credits until the end of your current billing period; you are not charged again after that.",
        "Subscriptions renew automatically each month until cancelled.",
      ],
    },
    {
      h: "Credits",
      p: [
        "Monthly credits refresh at the start of each billing period and do not roll over. Credits have no cash value and are non-transferable. If an identification fails to return a confident result, the credits for that scan are automatically refunded to your balance.",
      ],
    },
    {
      h: "Payments & Merchant of Record",
      p: [
        "Our order process is conducted by our online reseller Paddle.com, which is the Merchant of Record for all our orders. Paddle handles all payments, billing enquiries, taxes and refunds on our behalf.",
      ],
    },
    {
      h: "Contact",
      p: ["For any billing question, refund or cancellation, email us using the address on our contact page and we'll help right away."],
    },
  ],
};
