# 05 — Virtual Try-On / Try Me Rules

This is a **first-class differentiator** of Sakti Boutique. Treat it as a core product feature, not an addon.

## Product-Facing Names
- **Try It On**
- **Virtual Try-On**
- **Try Me**

Do **not** hardcode any vendor name in user-facing UI or routes.

## User Flow
1. User opens an eligible product page
2. User taps the prominent **Try Me** CTA
3. User uploads their own image (camera or file picker)
4. User confirms the selected garment
5. System submits both images to the try-on orchestration layer
6. User sees a polished loading state
7. User receives a generated try-on preview
8. User can retry, re-upload, or (future) save / share / download

## UX Requirements
- CTA visually prominent on PDP, never hidden
- Clear image guideline messaging (lighting, full body, plain background)
- Privacy and consent notice before upload
- Upload validation: file type, size, basic face/body presence
- Premium loading state — never feels like a generic spinner
- Result state feels polished and shareable
- Error states are friendly, recoverable, never dead-end
- **Mobile UX is critical** — most users will try on from phones

## Architecture Principles
- **Provider-agnostic.** UI, orchestration, and the model provider must be cleanly separated.
- The provider must be swappable without rewriting product UI.
- Orchestration runs server-side; never expose provider keys to the client.
- Job records are stored in Supabase for retry, audit, and admin monitoring.
- Image uploads land in Supabase Storage with signed URLs and short retention defaults.

## Privacy & Consent
- Explicit consent checkbox before first upload
- Clear retention policy ("we delete your photo after X")
- No third-party tracking on uploaded images
- Comply with applicable data protection law

## Eligibility
- Per-product try-on enable flag (set in admin)
- Graceful fallback when a product is not try-on eligible
