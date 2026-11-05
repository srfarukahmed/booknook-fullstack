# Verification performed

Verified locally against the production server with a fresh browser session.

- `npm run typecheck`: passed.
- `npm run build`: passed; all App Router pages compiled.
- npm dependency audit at installation: zero reported vulnerabilities.
- Homepage: three Swiper slides and six newest book cards.
- Catalog: nine seed books, category filtering, text search, and empty state.
- Private details: redirects to login, resumes requested book after sign-in, stays signed in after reload.
- Borrow: identity modal, copy decrement, duplicate prevention, 14-day return date, zero-copy disabled button.
- Return: borrow removed and copy count restored.
- Add: image file preview, required book fields, persisted owner and created date.
- Edit: existing data populated, title update saved.
- Delete: custom confirmation, cancel retains the book, confirm removes it.
- Registration: invalid password rejected, valid account redirected to login, new account can sign in.
- Profile and custom 404 navigation.
- Home at 375px, 768px, and 1440px; route layouts checked at 375px without document overflow.
- Theme selection survives page reload.
- No uncaught browser JavaScript errors during these flows.

Connected-mode OAuth, remote imgbb upload, MongoDB persistence, and server JWT verification cannot be exercised without the corresponding services and credentials. Local image upload fallback was exercised. These external integrations are clearly separated from demo behavior.
