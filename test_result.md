#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Build the Cosmic Bites catering website with an integrated admin panel.
  Pages: homepage, menu, catering packages, about, contact.
  Admin panel at /admin (password-protected) to manage menu items, images, content.
  Backend: FastAPI + MongoDB (already built, NOT modified).
  Frontend: rebuilt from scratch using React (Expo Router web).

backend:
  - task: "Existing FastAPI + MongoDB catering API (untouched)"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Backend was not modified per user instruction. Confirmed all required endpoints exist: /api/menu, /api/services, /api/testimonials, /api/event-categories, /api/corporate-clients, /api/inquiries (POST), /api/auth/login, /api/auth/me, /api/admin/stats, /api/admin/menu/*, /api/admin/services/*, /api/admin/inquiries/*, /api/admin/quotes/*, /api/admin/media. Admin seeded as admin@cosmicbites.com / Admin@123."

frontend:
  - task: "Full website rebuild — Cosmic Bites catering"
    implemented: true
    working: true
    file: "frontend/app/*.tsx, frontend/src/**"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: |
          Removed entire prior /app/frontend/app and /app/frontend/src contents. Rebuilt fresh using Expo Router (React + RNW for web). New structure:
            - app/_layout.tsx — root layout with AdminAuthProvider, SafeAreaProvider
            - app/+html.tsx — SEO head, theme color, scrollbar styles
            - app/index.tsx — Homepage: hero (themed bg), trust strip, about teaser, event categories, packages teaser, signature dishes carousel, testimonials, CTA band
            - app/menu.tsx — Menu page with category filter chips, item cards with image, price, spice level, Jain/Live badges
            - app/packages.tsx — Catering packages cards with image, features, pricing, "Get a Quote" CTAs
            - app/about.tsx — Story, values, timeline of milestones, stats band
            - app/contact.tsx — Contact info cards + inquiry form posting to /api/inquiries with success/error states
            - app/admin/_layout.tsx + app/admin/index.tsx — Admin entry: login screen (if not authed) or full admin shell
            - src/admin/AdminShell.tsx — Sidebar layout with sections (Dashboard, Menu, Packages, Inquiries, Quotes, Media)
            - src/admin/Dashboard.tsx — KPIs from /api/admin/stats + pipeline value
            - src/admin/MenuCrud.tsx — list + modal form (create/edit/delete + image picker)
            - src/admin/PackagesCrud.tsx — list + modal form (create/edit/delete + image picker)
            - src/admin/InquiriesPanel.tsx — list with status filter, inline reply notes, status updates, email/WhatsApp/delete
            - src/admin/QuotesPanel.tsx — list with status filter, inline status updates, email/WhatsApp/delete
            - src/admin/MediaPanel.tsx — image upload utility (base64 data URL → /api/admin/media)
            - src/admin/ImagePickerField.tsx — reusable image upload (device file or URL)
            - src/admin/ConfirmDialog.tsx — reusable confirm dialog
            - src/components/Nav.tsx, Footer.tsx, PageShell.tsx, Button.tsx, Input.tsx
            - src/context/AdminAuth.tsx — admin JWT context (AsyncStorage persistence)
            - src/api.ts — typed fetch wrapper with token attach
            - src/theme.ts — brand colors (forest green + saffron) + business constants
            - src/hooks/useSeo.ts — sets per-page document.title and meta description on web
          Verified visually via screenshot tool: homepage, /menu (26 items), /packages (8 packages), /contact (form), /admin (login screen), /admin after login (dashboard with KPIs).
          Admin login flow works end-to-end (login → dashboard shows correct seeded counts: 26 menu items, 8 portfolio).

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "Public pages render and load API data (home, menu, packages, contact)"
    - "Contact form submission creates a new inquiry via POST /api/inquiries"
    - "Admin login at /admin with admin@cosmicbites.com / Admin@123 succeeds and persists across refresh (AsyncStorage JWT)"
    - "Admin Menu CRUD: create, edit, delete a menu item (with image upload)"
    - "Admin Packages CRUD: create, edit, delete a service/package"
    - "Admin Inquiries: list, change status, internal notes"
    - "Admin Quotes: list and status changes"
    - "Admin Media: upload an image and copy stored URL"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Completed full frontend rebuild per user request. Backend remains untouched.
      Stack: Expo Router (web target) → React + React Native Web. All pages talk to existing FastAPI APIs.
      Admin credentials seeded by backend: admin@cosmicbites.com / Admin@123 (stored in /app/memory/test_credentials.md).
      Verified via screenshots: home, menu (26 items load), packages (8 load), contact form, /admin login + dashboard (26 menu / 8 portfolio counts confirmed).
      Asking user for frontend testing approval before running expo_frontend_testing_agent.
