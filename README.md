# Neptune Showroom

Demonstration apps and sites for prospective banks, fintechs and telecom operators. Everything is simulated:
invented institutions, people and numbers, no backend, and no code from Nexus, Edge or the production apps.
Design rules for every product: [DESIGN_BRIEF.md](DESIGN_BRIEF.md) (calm, flat, Material 3 Expressive + Odyssey 3).
Six switchable looks (professional to vibrant) live in `shared/looks/`.

## Store apps (installable PWAs, to be wrapped for Apple/Google under the "Neptune Showroom" developer group)
| Folder | App | Status |
| --- | --- | --- |
| `mobile/` | Neptune Mobile (retail banking, includes Mizan "Pay over time" channel) | Built, calm redesign verified |
| `vega/app/` | Neptune Vega (wallet; Personal and Business modes; Business has Mizan checkout and tap-to-pay POS) | Built, verified |
| `telco/mobile/` | Neptune Mobile for Telco | Built, Polaris onboarding |
| `telco/vega/` | Neptune Vega for Telco | Built, Polaris onboarding |
| `shared/polaris/` | Polaris on-device onboarding module (MediaPipe liveness, MRZ OCR, face match; demo-grade) | Built; linked into all four store apps |

## Web
| Folder | Site |
| --- | --- |
| `hub/` | Nexus Hub console (33 screens) |
| `plus/` | Neptune Plus corporate banking |
| `mizan-portal/` | Mizan bank operations portal; `mizan-portal/showroom/` is the Mizan landing page |
| `vega/console/` | Vega operator console |
| `shared/looks/gallery.html` | Looks gallery |

`brand/mizan/` holds the Mizan product mark. `scripts/check-flat.mjs <dir>` fails if a gradient is introduced.

## Not done yet
Native iOS/Android wrappers and store listings; Polaris linked into Mobile and Vega; app icons redrawn for the redesign;
French and Arabic copy needs native review; Flutter versions of the apps.
