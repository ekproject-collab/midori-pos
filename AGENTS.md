# AI Agent Rules & Coding Guidelines (AGENTS.md)

This file contains strict instructions for AI coding assistants and developers contributing to this project. Adherence to these guidelines is mandatory to ensure code quality, architectural consistency, and UI aesthetic integrity.

## 0. Mandatory Pre-Task Scope Confirmation

**CRITICAL:** Before starting ANY task (coding, refactoring, design, data modeling, etc.), you MUST re-read [PRD.md](PRD.md) and confirm the requested work against it:
* Verify the task falls within the **In-Scope** list (Section 1.1). If it touches anything in **Out-of-Scope**, stop and flag it to the user before proceeding.
* Check the task against the relevant User Flow (Section 2.1), Functional Features (Section 2.2), and Data Spec / ERD (Section 3).
* If the task conflicts with, extends, or is not covered by the PRD, pause and ask the user for clarification instead of assuming.
* Briefly state in your response which PRD sections the task maps to before you begin implementation.

## 1. UI/UX Design System (Anti-AI Aesthetic)
**CRITICAL:** Avoid the generic "AI-generated web app" look. We are building a professional, modern, and grounded Point of Sale interface.
* **NO Glassmorphism:** Strictly avoid `backdrop-blur`, frosted glass effects, or overly translucent panels.
* **NO Gradients:** Do not use gradient backgrounds (e.g., `bg-gradient-to-r`). Stick to solid, flat colors.
* **Color Palette:** Use a minimalist palette centered around Matcha and Coffee aesthetics (solid earthy greens, deep browns, off-whites like `#FAF8F5`, and neutral dark text).
* **Borders and Shadows:** Prefer clean, solid borders (`border`, `border-gray-200`) or hard brutalist shadows over soft, diffused drop-shadows.
* **Typography:** Use a clean, sans-serif system font. Ensure high contrast for Kiosk readability.

## 2. Architecture & Code Structure
* **Separation of Concerns (SoC):** This is paramount. Do not mix complex business logic or database queries directly inside React UI components.
* **Hexagonal / Onion Architecture Mindset:** 
  * Isolate all Supabase interactions into a dedicated data access layer or service folder (e.g., `src/services/supabase/`).
  * Components should only handle presentation and call service functions or custom hooks to get/mutate data.
* **SOLID Principles:** 
  * Keep components single-purpose (Single Responsibility Principle). 
  * Ensure the billing and cart logic is testable and separated from the UI rendering.

## 3. Tech Stack Specifics
* **Next.js:** Use the App Router structure (`app/`).
  * `/kiosk` for public self-ordering UI.
  * `/admin` for protected dashboard routes.
* **Tailwind CSS:** Rely on utility classes for all styling. Ensure responsive design (especially optimizing for landscape tablet screens).
* **Supabase:** Use `@supabase/supabase-js`. 
  * All database calls must handle potential errors gracefully so the Kiosk app does not crash in front of customers.

## 4. General Code Output Rules
* Produce clean, readable, and well-documented code.
* Do not invent unnecessary dependencies. Keep the `package.json` minimal.
* If a design decision is not explicitly covered here, default to a flat, minimalist approach.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
