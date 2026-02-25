# 🗺️ Codebase Map: TEYRAA HOROLOGY

This document provides a comprehensive overview of the TEYRAA HOROLOGY architecture, detailing the role of each file and how they collaborate to deliver a premium luxury watch experience.

## 🏛️ Core Platform Architecture
The storefront is designed for high-conversion storytelling, utilizing a real-time cloud backbone.

| Component | Responsibility |
| :--- | :--- |
| `index.html` | **The Boutique**: Hub for the "TEYRAA Chronicles" storytelling, master collection grids, and bespoke service highlights. |
| `style.css` | **The Visual Identity**: Defines the luxury dark theme, gold design tokens, glassmorphic effects, and fluid animations. |
| `script.js` | **Interactive Engine**: Manages core UI behaviors like scroll reveals, mobile navigation, FAQ accordions, and cart state. |
| `products.js` | **Data Mediator**: Bridges the storefront with Firestore. Handles real-time product syncing, storytelling logic, and advanced filtering. |

## 🛠️ Administrative Ecosystem
The backend panel ensures absolute control over inventory, security, and business intelligence.

| Component | Responsibility |
| :--- | :--- |
| `admin.html` | **Dashboard Interface**: Unified access point for Product CRUD, Order management, and Security settings. |
| `admin.js` | **Operational Logic**: Handles administrative authentication, secure authorization checks, and statistical data aggregation. |
| `admin.css` | **Admin Aesthetic**: Specialized professional styling for the dashboard, modal forms, and notification systems. |

## 🔌 Cloud & Third-Party Integrations
TEYRAA leverages industry-leading services for security, storage, and commerce.

*   **Firebase Foundation**
    *   `firebase-config.js`: Centralized configuration for Authentication and Firestore.
    *   `firestore.rules`: Defines strict security boundaries for administrative and public data access.
    *   `FIREBASE_SETUP_GUIDE.md`: The technical blueprint for environment deployment.
*   **Financial Orchestration**
    *   `razorpay-config.js`: Integration settings for the Razorpay payment gateway.
    *   `RAZORPAY_SETUP_GUIDE.md`: Operational guide for secure customer transactions.

## 📄 Supporting Documentation & Utilities
*   `login.html` / `login.js`: Targeted secure entry point for administrators.
*   `NEXT_STEPS.md`: Immediate project milestones and integration checklist.
*   `ORDER_MANAGEMENT_GUIDE.md`: Workflow documentation for processing luxury sales.

---
**TEYRAA HOROLOGY** • *Crafting Legacies, One Second at a Time.*
