# Shopee Seller Centre UX research for Escala

Research read on 25 September 2026. These are observed principles and independent case-study findings, not a claim that Shopee endorsed Escala or that every finding describes Shopee current localized UI.

## Primary source: Shopee design team

Shopee design-team interview describes Seller Centre modular design guidance as a style and interaction guide, a reusable UI kit, and a maintained component library. The interview names three Seller Centre design principles: efficiency, accuracy and predictability, and inspiration. It also frames product design as solving user problems, with practical form and function, a consistent brand, and continuous experience improvement. [Shopee design team interview](https://shopee.sg/blog/shopees-design-team-influences-product-brand-design-southeast-asia/)

Official seller education material shows operational tasks such as shop settings, shipping settings, products, campaigns, and vouchers organized around a persistent Seller Centre workflow. [Shopee Seller Education guide](https://cdngarenanow-a.akamaihd.net/shopee/seller/seller_cms/c67389533bfb2435063221e3fe7410b3/EDH-Mall-Shop%20Setting.pdf)

An independent 2021 mobile case study reports that participants struggled with crowded screens, inconsistent behavior, and unfamiliar terms, and valued being able to find important order information quickly. It is a small non-affiliated study, so Escala treats it as a usability warning, not official research. [Independent Shopee UX case study](https://prototypr.io/post/shopee-mobile-app-a-ux-case-study)

## Apply the principles, not the storefront

- Efficient: keep the queue, conversation, action, and evidence in the work area. Use exact keyboard-friendly controls and provide a grounded FAQ answer without a model request or seller retyping.
- Accurate and predictable: keep risk reasons beside the recommendation, display source/version evidence, use stable action names, and never let sentiment or model confidence override hard-risk rules.
- Inspiring: use a distinct Escala wrench-and-E mark and one restrained orange action color. Avoid adding promotional motion or sales decoration to a support tool.
- Modular: shared visual tokens, repeatable queue rows, clear badges, and consistent evidence and audit patterns make later workflow edits safer.
- Learnable: persistent navigation, visible selection, concise labels, and one active task hierarchy reduce relearning. On small screens, expose queue and context in accessible drawers.
- Problem-solving: make empty, conflicting, stale, and failed states explain what the seller can do next.

## Escala UI direction

Use a clear three-area desktop workbench: prioritized conversation list, active message and next action, and seller/order evidence. Keep neutral surfaces, strong text contrast, restrained orange for the primary action, and distinct text-plus-icon risk labels. The orange token belongs to Escala own design system and is not asserted to be an official Shopee token.

The product is English-first. Use direct action labels such as “Approve draft,” “Ask for details,” and “Escalate.” An action confirmation and audit event use the same verb. Honor keyboard focus and reduced-motion preferences.