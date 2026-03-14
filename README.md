# Library Management System - Frontend App 📚

This repository contains the **Frontend Application** for the **Library Management System**, a modern, responsive web application built to handle library operations seamlessly.

## 🔗 Live Application
- **Live Demo:** [Click Here to Visit](#)  
*(Use **shaked_admin** / **12345678** to explore the admin dashboard)*

## 🛠 Tech Stack
- **Core:** React 18, TypeScript, Create React App
- **State Management:** Redux Toolkit & React-Redux
- **Styling & UI Components:** 
  - Material UI (MUI)
  - Ant Design
  - NextUI
  - TailwindCSS & Framer Motion (for fluid animations)
- **HTTP Client:** Axios (with interceptors for JWT auth)

---

## 🏗 Key Features & Architecture

### 1. Robust State Management
Powered by **Redux Toolkit**, the application effortlessly abstracts complex global state, including active user sessions, shopping carts (or book reservations), and loading states across the platform.

### 2. Comprehensive UI Systems
Instead of relying on a single UI framework, this project selectively implements components from **Material UI**, **Ant Design**, and **NextUI**, orchestrated cohesively with **TailwindCSS** to provide a rich, accessible, and premium User Experience (UX).

### 3. JWT Authentication & Security
- Secure token parsing using `jwt-decode`.
- Protected routing ensuring that administrative pages (managing books, viewing user loans) remain strictly separated from standard user views.

### 4. Interactive Micro-Animations
Utilizes **Framer Motion** for smooth page transitions and micro-interactions, providing users with instant, satisfying feedback. Features like successful book returns trigger fun, celebratory visual effects via `canvas-confetti`.

---

## ⚙️ Running Locally
To run this frontend locally:

1. Clone the repository.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. The application will be available at `http://localhost:3000`.

*Designed and Developed by [Shaked Goren](https://github.com/shakedgoren)*
