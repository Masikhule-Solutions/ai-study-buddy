# 🚀 AI Study Buddy

An intelligent, all-in-one learning assistant powered by the Google Gemini API. Go beyond simple answers with a suite of tools designed to help you learn faster, study smarter, and retain knowledge longer.

![AI Study Buddy Screenshot](https://storage.googleapis.com/aistudio-hosting/generative-ai-studio/assets/readme-images/ai-study-buddy-demo.png)

## ✨ About The Project

AI Study Buddy is a modern web application designed to be a student's ultimate learning companion. It addresses the limitations of traditional study methods by providing interactive, personalized, and context-aware assistance. By leveraging the power of generative AI, it transforms static study materials into a dynamic and engaging learning experience.

This application is built as a **serverless, client-side application**, which means all operations and data storage happen directly in your browser. This approach guarantees user privacy and eliminates the need for a backend, making it fast, secure, and easy to deploy.

---

## 🎯 Key Features

*   💬 **Multimodal AI Chat**: Engage in contextual conversations using text, images, and by uploading your study notes (`.txt`, `.pdf`) for focused, RAG-powered answers.
*   🧠 **SRS Flashcards**: Master any subject with intelligent flashcards that use a Spaced Repetition System (SM-2 algorithm) to optimize memory retention.
*   📝 **Dynamic Quizzes**: Instantly generate multiple-choice quizzes on any topic to test your knowledge and get immediate, detailed feedback.
*   🗓️ **Smart Study Planner**: Create a personalized, day-by-day study plan to achieve your learning goals. Export your plan to your calendar with a single click.
*   📸 **Analyze Notes**: Upload photos of your handwritten notes or textbook pages, and the AI will extract key concepts and provide structured summaries.
*   🎨 **Image Generator**: Create custom diagrams, illustrations, and visual aids for your study materials with a simple text prompt.
*   🏆 **Gamified Dashboard**: Stay motivated by tracking your study streaks, completed tasks, and quiz scores while unlocking achievement badges.
*   🎤 **Voice Interaction**: Use your voice to ask questions with built-in speech-to-text and have the AI's answers read aloud with text-to-speech.

---

## 🛠️ Tech Stack & Architecture

This project is built with a modern, client-focused technology stack.

*   **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
*   **AI Model**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash` for text, `imagen-4.0-generate-001` for images)
*   **Browser APIs**: Web Speech API, LocalStorage
*   **Architecture**: Serverless, Client-Side Application. All data is stored and processed in the browser.

For a deeper dive into our technical decisions, see [API Tradeoffs](./API_TRADEOFFS.md) and [System Architecture](./SYSTEM_ARCHITECTURE.md).

---

## 🏁 Getting Started

Follow these steps to set up and run the project on your local machine.

### Prerequisites

You will need a Google Gemini API key to use the application.
*   You can get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/ai-study-buddy.git
    cd ai-study-buddy
    ```

2.  **Set up your API Key:**
    The application is configured to use an API key from environment variables. To make this work for local development without a build system, we'll create a small configuration file.

    a. Create a new file named `env.js` in the root of the project.

    b. Add the following code to `env.js`, replacing `"YOUR_GEMINI_API_KEY"` with your actual key:
    ```javascript
    // env.js
    window.process = {
      env: {
        API_KEY: "YOUR_GEMINI_API_KEY",
      },
    };
    ```

    c. Open `index.html` and add the following script tag inside the `<head>` section, just before the `importmap` script:
    ```html
    <head>
      ...
      <script src="/env.js"></script>
      <script type="importmap">
      ...
    </head>
    ```

3.  **(Recommended) Add `env.js` to `.gitignore`:**
    To prevent accidentally committing your secret API key, create a `.gitignore` file (if it doesn't exist) and add this line:
    ```
    env.js
    ```

### Running Locally

Because the project uses modern ES modules (`import`), you must run it from a local web server. Opening the `index.html` file directly from your file system will not work.

Here are two easy ways to start a local server:

1.  **Using VS Code's Live Server Extension:**
    *   Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension from the VS Code Marketplace.
    *   Right-click on `index.html` in the file explorer and select "Open with Live Server".

2.  **Using the Terminal:**
    *   Make sure you have [Node.js](https://nodejs.org/) installed.
    *   Open your terminal in the project's root directory and run the following command:
        ```sh
        npx serve
        ```
    *   The terminal will give you a URL, typically `http://localhost:3000`. Open this URL in your web browser.

You should now see the AI Study Buddy landing page!

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
