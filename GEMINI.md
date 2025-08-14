# Gemini CLI Project Overview

This document provides an overview of the Autofill Jobs project, intended for use with the Gemini CLI.

## Project Overview

Autofill Jobs is a Chrome extension designed to automate the process of filling out job applications on various platforms. It aims to simplify and speed up the application process, particularly for platforms like Workday, Greenhouse, Lever, and Dover.

The project is built using:
*   **Vue.js**: A progressive JavaScript framework for building user interfaces.
*   **Vite**: A fast build tool that provides a lean and efficient development experience for modern web projects.
*   **JavaScript**: The primary programming language.

Data storage within the extension leverages Chrome's storage APIs:
*   `chrome.storage.sync`: For syncing smaller pieces of data across devices.
*   `chrome.storage.local`: For storing larger data, such as résumés.

The architecture involves content scripts that interact with specific job application platforms to autofill form fields based on stored user data.

## Building and Running

To set up and run the Autofill Jobs extension locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/andrewmillercode/Autofill-Jobs.git
    cd Autofill-Jobs
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the extension:**
    This command compiles the Vue.js application and content scripts into the `dist` directory.
    ```bash
    npm run build
    ```

4.  **Load the extension in Chrome:**
    *   Open Chrome and navigate to `chrome://extensions`.
    *   Enable "Developer mode" (usually a toggle in the top right corner).
    *   Click on "Load unpacked" and select the `dist` folder located in the project's root directory.

For development purposes, you can use the development server:
```bash
npm run dev
```
Note that `npm run dev` is typically for local development server and might not directly apply to loading the extension in Chrome for testing its full functionality. For testing the extension, `npm run build` and loading the `dist` folder is the standard approach.

## Development Conventions

*   **Vue.js Components**: The user interface is structured using Vue.js single-file components (`.vue` files).
*   **Content Scripts**: Platform-specific logic for autofilling forms is implemented in separate JavaScript files located in `public/content-scripts/`. These scripts interact directly with the DOM of the job application websites.
*   **Vite Configuration**: The project uses `vite.config.js` for build configurations, including Vue plugins and path aliases.
