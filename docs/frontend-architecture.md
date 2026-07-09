Scalable Frontend Architecture Plan
Summary
Keep the current two-zone model: public marketing app at tapat-care-frontend/ and authenticated product app at tapat-care-frontend/dashboard/.
Put caregiver and careseeker onboarding inside the dashboard zone under /dashboard/onboarding/..., because onboarding is authenticated profile completion.
Use a gradual workspace architecture: keep current apps working, add shared packages now, and postpone a full apps/web + apps/dashboard move until the product stabilizes.
Share brand tokens, typography, Tailwind preset, small primitives, and imported assets. Do not share marketing sections or dashboard product layouts.
Use official App Router patterns: route groups for organization, Server Components by default, Client Components only for wizard/form interactivity, one global stylesheet per app, Tailwind for most styling, CSS Modules only for complex scoped styling.
References checked: Next.js Project Structure, Route Groups, CSS, Server and Client Components, Multi-zones.
Key Architecture
Add workspace packages:
packages/design-tokens: CSS variables, Tailwind preset, font tokens, color/radius/shadow/spacing scales.
packages/ui-primitives: only cross-app atoms like Button, Input, Textarea, Select, Checkbox, Badge, Tabs, Dialog, FormField, Stepper.
packages/api-contracts: shared role names, API envelope types, DTO types for User, Caregiver, Careseeker, Service, CaregiverSkill, and future modules.
Configure root package.json workspaces as ["dashboard", "packages/*"]. Keep the marketing app at the root for now.
Add transpilePackages in both Next configs for shared packages.
Keep Next multi-zone routing as the deployment boundary:
Marketing app owns /, /about, /contact, public SEO pages, public signup/login entry.
Dashboard app owns /dashboard, /dashboard/*, and /dashboard-static/*.
Cross-zone navigation uses normal <a> links, not next/link.
App Structure
Marketing app:
Keep page sections in src/app/(marketing)/_sections.
Keep public-only shared pieces in src/components/marketing or existing src/components/shared.
Use shared tokens, but do not import dashboard components.
Dashboard app:
Create dashboard/src/app/(authenticated)/dashboard/layout.tsx as the protected product layout.
Keep /dashboard as the role-aware product home.
Create onboarding routes at:
dashboard/src/app/(authenticated)/dashboard/onboarding/page.tsx
dashboard/src/app/(authenticated)/dashboard/onboarding/[flow]/[step]/page.tsx
Organize product code by feature, not by generic component buckets:
dashboard/src/features/onboarding
dashboard/src/features/dashboard
dashboard/src/features/profile
dashboard/src/features/bookings
dashboard/src/features/applications
dashboard/src/features/messages
dashboard/src/features/admin
Dashboard components:
dashboard/src/components/layout: DashboardShell, Sidebar, Topbar, MobileNav.
dashboard/src/components/ui: app-local wrappers/re-exports from @tapat-care/ui-primitives.
Feature-specific components stay inside their feature folder.
Styling And Assets
Use the public app’s brand foundation, not the public app’s marketing layout style.
Dashboard should use the same primary brand, typography, and semantic tokens, but with dashboard-specific density, neutral surfaces, restrained backgrounds, 8px-or-less radii for product cards, and clear status colors.
Add Tailwind to the dashboard app using the same Tailwind major version already used by the marketing app.
Each app imports only one global stylesheet from its root layout:
src/app/globals.css
dashboard/src/app/globals.css
Global CSS should contain Tailwind directives, token imports, reset/base rules, and true app-wide variables only.
Use Tailwind utilities for normal component styling.
Use .module.css only when a component has complex scoped styling that Tailwind makes unreadable.
Do not share public/assets directly between zones. Marketing images stay in marketing public; dashboard-specific static files stay in dashboard public; truly shared assets should live in a package and be imported.
Onboarding And Dashboard Contracts
Add a role-aware onboarding registry:
OnboardingFlowDefinition
OnboardingStepDefinition
OnboardingFlowId
OnboardingStepId
AppRole
First flows:
caregiver-profile
careseeker-profile
Future flows use the same registry: admin onboarding, agency onboarding, provider onboarding, verification onboarding, etc.
Each onboarding flow defines:
allowed roles
ordered steps
required backend data
completion rules
server action per step
next/previous route behavior
Dashboard navigation should come from a module registry:
DashboardModuleDefinition
role visibility
route path
label/icon
loader/action ownership
Replace query-string role switching with backend-derived roles from /api/users/me/ once auth is wired.
Backend Alignment
Use current backend routes as source of truth:
/api/users/register-caregiver/
/api/users/register-careseeker/
/api/users/me/
/api/caregivers/update-profile/
/api/careseekers/update-profile/
/api/caregivers/caregiver-skills/
/api/services/services/
/api/services/categories/
Centralize all dashboard API calls in server-only helpers.
Use Server Actions for onboarding mutations so auth tokens stay server-side.
Keep pages/layouts as Server Components; use Client Components only for wizard controls, client-side validation display, dynamic fields, and interactive UI.
Marketplace and scheduling models exist in the backend, but their routes are not mounted in the main Django URL config yet. Build frontend modules behind registry entries/feature flags until those APIs are mounted and stable.
Long term, add a backend-owned onboarding/profile completion status endpoint. Until then, frontend completion can be computed from required profile fields.
Test Plan
Build checks:
npm run build
npm run build:dashboard
npm run lint
npm run lint:dashboard
Routing checks:
/dashboard loads inside dashboard zone.
/dashboard/onboarding/caregiver-profile/... stays in dashboard zone.
/dashboard/onboarding/careseeker-profile/... stays in dashboard zone.
Marketing pages do not import dashboard code.
Styling checks:
Both apps render shared tokens.
Dashboard Tailwind build includes dashboard source and shared primitive package paths.
No global dashboard classes are leaked for feature styling.
Product checks:
Caregiver onboarding loads correct steps and submits to caregiver endpoints.
Careseeker onboarding loads correct steps and submits to careseeker endpoints.
A future onboarding flow can be added by registry config plus feature components, without changing the shell.
Role-specific dashboard navigation changes from registry data, not duplicated layouts.
Assumptions
Chosen defaults: dashboard app for onboarding, role-specific onboarding shell, shared tokens/small primitives only, gradual workspace, Tailwind plus tokens for dashboard.
Keep current multi-zone deployment model.
Do not create a full shared component library for product features.
Do not move the root marketing app into apps/web in the first implementation pass.
Do not wire frontend marketplace/scheduling pages to production behavior until backend URLs are mounted.