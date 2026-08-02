# Version 7.1.2 — Mobile Navigation and Summit Display Fix

## Corrected defects

- Rebuilt the bottom navigation as six equal-width tabs.
- Replaced the undersized text triangle with a proper 21-pixel SVG summit icon.
- Wrapped “Summits” in the same label structure used by the other tabs.
- Removed the inherited asymmetric padding that displaced Plan and Weather.
- Retained the intentional active-tab emphasis; the currently viewed section is bold and blue.
- Moved Ask higher above the bottom navigation.
- Moved Summit Focus higher to preserve spacing above Ask.
- Corrected the blank summit section on iPhone.

## Root cause of the blank section

The app applied an opacity-based reveal animation to every main section with an
IntersectionObserver threshold of 8 percent. The summit ledger is thousands of
pixels tall on a phone, so 8 percent of the section could not fit in the viewport.
The ledger remained transparent while still occupying its full layout height.

The summit ledger is now immediately visible, and the general reveal observer
uses a zero threshold for future tall sections.

## Service worker

`ddmg-v7-1-2-2026-08-02-1`
