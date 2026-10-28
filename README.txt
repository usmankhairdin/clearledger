CLEARLEDGER — FREE BOOKKEEPING HTML TEMPLATE
Version 1.0.0 | 26 October 2026
Original template by Usman Khair Din

ABOUT
A complete one-page, plain HTML/CSS/vanilla JavaScript website for a
small-business bookkeeping practice. The design uses lavender paper,
editorial serif typography and original responsive bookkeeping artwork.
No people or photography is included. No React, Vite, build process, npm,
account, API key or external runtime request is needed.

Clearledger is a fictional business. All arrangements and service scopes
are illustrative. No credentials, customer reviews, tax filing, financial
advice, investment guidance, business outcomes, price or actual provider
availability is claimed. Replace the sample business copy with accurate
information before operating this website commercially.

RUN LOCALLY
Keep all folders intact and open index.html, or use any static server.
With Python installed, from this directory run:
  python -m http.server 8080
Then visit http://localhost:8080 and stop the server with Ctrl+C when done.
Python is only one preview option, not a website dependency. Clipboard
works best on HTTPS or localhost. When unavailable, the draft text is
selected for manual copying. No preview server is bundled or required.

FILES
index.html                    All sections, content, form, inline SVG icons
assets/css/clearledger.css     Tokens, fonts, layout, responsive styling
assets/css/lenis.css           Local library companion stylesheet
assets/js/clearledger.js       Menu/FAQ/scrollbar/scope/draft behaviour
assets/js/lenis-1.3.27.min.js   Pinned local Lenis library
assets/fonts/                 Local Karla variable and Libre Caslon Display
assets/img/                   Original mark and wide/compact ledger SVGs
docs/DESIGN.md                Independent design direction before UI
docs/QA.md                    Source evidence and browser coverage limits
docs/check_source.py          Dependency-free static integrity checker
LICENSE                       MIT licence for original template materials
THIRD_PARTY_NOTICES.txt        Exact source/asset/licence origins
licenses/                     Full retained font and MIT grants

CUSTOMISING CONTENT AND STYLE
Edit the page text in index.html. Preserve section IDs, labels and the
matching href/ARIA references unless updating their JavaScript together.
Change the palette variables at the start of clearledger.css. Body text
uses Karla; large headings use Libre Caslon Display. Both are local fonts
with complete SIL OFL notices. Replace notices if changing font assets.

Task choices use native checkbox inputs under #scope-choices. Their value
is the exact task wording added to the scope summary and generated draft.
Add a labelled checkbox to add a task. The summary count and empty state
adapt automatically. The business field is required and capped at 100
characters. The optional message is capped at 1400 characters. Arrangement
actions use data-arrangement that must exactly match an enquiry radio
value. The comparison is a semantic HTML table, reflowing on mobile into
two comparison columns with each row's subject above them.

The wide ledger-workflow.svg and compact ledger-compact.svg are original
editable artwork. The picture element changes layout below 900px so the
diagram stays readable. It depicts a workflow without fabricated money,
growth metrics or sensitive records. It is not actual accounting software.

If publishing a real service, state the actual business identity, scope,
pricing basis, qualifications where relevant, software compatibility,
terms, privacy policy and an approved secure document-sharing process.
This frontend has no secure uploads or account access. Do not collect
bank statements, payroll records, tax identifiers, passwords, payment
information or other confidential documents through this demo form.

Keep the visible credit: Designed & developed by Usman Khair Din, with
only the bold author name linked to https://www.usmankhairdin.com/.
Keep paragraph/action spacing at least 24px, stationary button shells,
readable type, keyboard focus, radio/checkbox labels and motion fallbacks.
There is one light/paper design and a dark handover section; no theme
switcher is included.

WHAT THE CONTROLS DO
Four task checkboxes build a scope list and selected-task count. Clearing
all tasks offers help deciding. Use this scope goes to the enquiry; the
current task choices are included when the draft is prepared. Ongoing and
catch-up comparison links preselect the matching native enquiry radio.
Prepare enquiry draft validates the required field and displays unsent
plain text. It never emails or submits anything. Copy draft uses the
Clipboard API and falls back to selecting the text. Edit details returns
focus to the business field. Editing a form field or task choice clears
the old draft, preventing stale content being copied. No cookies, local
storage, analytics, backend, email recipient or data persistence exists.
Refreshing the page clears the current inputs and draft.

FAQ uses native details with measured reversible animations. The right
full-screen mobile panel uses the same ledger-bracket control morphing
into close; it traps/returns focus, supports Escape, locks the background
and closes on desktop resize. Page, menu and draft smooth-scroll instances
share one RAF clock. Normal-motion fine-pointer desktop uses local Lenis;
touch and reduced motion retain native scrolling. Local overflow is
contained, slim activity thumbs support drag and Arrow/Page/Home/End keys.
The enquiry message grows rather than trapping editing in an unnecessary
scroll panel. No custom select/calendar/time fields are required: simple
choices use their labelled native radio and checkbox controls.

NO-JAVASCRIPT / LIBRARY FALLBACK
All services, comparison content, header links and native FAQ remain
available without JavaScript. The dynamic scope summary and draft button
are hidden, with a manual-writing note near the form. Native checkbox
choices remain useful as prompts. Scrollbars remain native if enhancement
cannot be installed. Lenis failing to load preserves native scroll while
the remaining vanilla JavaScript controls continue to work.

UPLOAD TO ROOT, SUBFOLDER OR DOMAIN
Upload this folder's CONTENTS, preserving assets and licence folders, to
your host's public directory. index.html is the entry file. For
https://example.com/ upload into the root public directory. For
https://example.com/clearledger/ upload the same contents into that folder
and visit the directory with a trailing slash. Every runtime asset path
is relative; no router, rewrite, bundler base setting or compilation is
required. Set up a custom domain and HTTPS using your static host's own
DNS instructions. Do not embed secrets or API credentials in this source.

To accept real enquiries, deliberately choose a backend or form service,
implement server-side validation and appropriate privacy/security controls,
and verify true success/failure before changing the honest draft wording.
No email, payment, calendar, tax, banking or account integration is supplied.

LICENCES AND VERIFICATION
Original code/content/mark/diagram: MIT, see LICENSE. Karla and Libre
Caslon Display: SIL OFL 1.1, full grants in licenses/. Lenis, Nookwell and
Taskline interaction mechanics: MIT, with all complete notices retained.
Exact asset origins are in THIRD_PARTY_NOTICES.txt. There are no stock
photos or external icon libraries. No archive, duplicated handoff package,
provider setup or credentials are bundled. docs/QA.md records static checks
and separates them from pending parent browser acceptance.

NO-JAVASCRIPT SUBMIT GUARD
The draft submit button is both disabled and hidden in source. JavaScript
enables it only after its preventing submit listener is registered. Keep
this disabled default-button guard so Enter cannot submit the native form
when JavaScript is unavailable.
