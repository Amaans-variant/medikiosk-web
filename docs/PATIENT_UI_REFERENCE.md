# Patient Console approved visual reference

The approved visual reference is stored at:

`docs/reference/patient-console-approved-reference.png`

This release intentionally aligns the real Patient Console to that artwork while preserving MediKiosk's security, clinical evidence, offline-resume, and accessibility requirements.

## Screen mapping

| Approved reference | Real MediKiosk route / behavior |
| --- | --- |
| Welcome & Language Selection | `/patient` (welcome + 6-language selector) |
| Consent / privacy | `/patient/consent` |
| ABHA (Optional) | `/patient/identity` |
| Chief Complaint | `/patient/complaint` |
| Severity & Affected Area | `/patient/anatomy` |
| Other Symptoms | `/patient/symptoms` |
| Guided health interview | `/patient/interview` using Medi voice/text guidance |
| Documents | `/patient/documents` |
| Medi Assistant | `/patient/assistant` accessible throughout the journey |
| Complete | `/patient/complete` |

The artwork visually shows Medi Assistant near the end of the journey. In the production UI, Medi is deliberately available from the header during the whole visit, while the structured Medi-guided interview remains a dedicated clinical-intake step. This preserves the user-friendly visual model without weakening the structured history-taking workflow.

## Laptop / desktop behavior

- White institutional header, green MediKiosk mark, patient-console subtitle, save/sync status, Medi Assistant and language switcher.
- Nine-step horizontal journey tracker.
- Centered high-contrast white clinical card with soft mint/green surfaces.
- Welcome screen uses a two-column layout: health-journey introduction + six-language selection.
- Severity/body-area screen uses a two-column body-map and region-selector layout.
- Document screen uses visual file cards/progress rather than a dense clinical table.
- Completion screen uses a large success mark, case ID, and clear next steps.
- Trust strip remains visible below the workflow on larger screens.

## Mobile behavior

At <=640px:

- The same visual system is preserved rather than replaced by a generic mobile theme.
- Header stacks safely and controls remain touch-friendly.
- Journey tracker scrolls horizontally without page overflow.
- Clinical card becomes edge-safe with smaller radius/padding.
- Welcome, body-map and other split layouts collapse to a single column.
- Severity options become a two-column grid.
- Region controls, symptom controls, files and actions become touch-safe stacked controls.
- Back/Next actions become full-width.
- Medi Assistant composer remains width-constrained.
- Trust strip becomes a vertical list.

Additional narrow-screen handling exists for <=380px.

## Important non-pixel differences

The reference artwork is a product-design guide, not a literal screenshot of a live browser. MediKiosk intentionally differs where clinical/security requirements demand it:

- Medi is the assistant identity (female Priya voice), not the artwork's placeholder name.
- Supported languages remain the product's six-language set: English, Hindi, Bengali, Telugu, Tamil and Marathi.
- Full ABHA values are not cached offline and self-declared ABHA is never presented as verified.
- The structured guided interview remains a real clinical-intake step.
- Document OCR/extraction status is honest and physician verification remains separate.
- Government emblems/ownership claims are not added.
