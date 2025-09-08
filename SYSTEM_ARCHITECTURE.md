# AI Study Buddy: System Architecture & Data Flow

### 1. Architectural Overview

The AI Study Buddy is designed as a **serverless, client-centric web application**. All business logic, state management, and API interactions are handled directly within the user's browser. This architecture was chosen to maximize privacy, eliminate backend infrastructure costs, and simplify deployment.

*   **Frontend**: A modern single-page application (SPA) built with React and TypeScript.
*   **AI Services**: All intelligent features are powered by direct, secure calls from the client to the Google Gemini API.
*   **Browser APIs**: Utilizes native browser capabilities (Web Speech API, LocalStorage, Intersection Observer) for performance and enhanced features.
*   **Data Persistence**: User-specific data (chat history, study plans, stats) is persisted exclusively in the browser's `localStorage`.

### 2. System Architecture Diagram

This diagram illustrates the primary components and the flow of information within the application.

```mermaid
graph TD
    subgraph User's Browser
        UI[💻 User Interface (React Components)]
        LOGIC[⚙️ Application Logic (Hooks & Services)]
        STORAGE[💾 LocalStorage]
    end

    subgraph External Services
        GEMINI[🧠 Google Gemini API]
    end
    
    subgraph Browser-Native APIs
        SPEECH[🎙️ Web Speech API]
        OBSERVER[👀 Intersection Observer]
    end

    UI -- User Input --> LOGIC
    LOGIC -- Manages State --> STORAGE
    LOGIC -- Reads State --> STORAGE
    LOGIC -- Makes API Calls --> GEMINI
    GEMINI -- Streams AI Response --> LOGIC
    LOGIC -- Updates UI --> UI
    
    UI -- Voice Input --> SPEECH
    SPEECH -- Transcript / Audio --> LOGIC
    
    UI -- Triggers Animation --> OBSERVER
    OBSERVER -- Visibility State --> LOGIC
```

### 3. Data Flow Explanations

#### 3.1 Data Flow: AI Chat & Retrieval-Augmented Generation (RAG)

This flow describes how a user's question, potentially augmented with a document, is processed.

1.  **User Input**: The user types a message into the `ChatInterface` component and clicks "Send" or uploads a `.txt`/`.pdf` file to use as context.
2.  **State Update**: The React component updates its state, adding the user's message to the `messages` array. If a document was uploaded, its text content is parsed and stored in the `studyContext` state.
3.  **Service Call**: The `geminiService.ts` function `getChatResponseStream` is called. It receives the entire chat history and the optional `studyContext`.
4.  **API Request**: The service constructs a request to the **Google Gemini API**. If `studyContext` exists, a specialized system prompt is included, instructing the model to prioritize answers from that material (this is the RAG process).
5.  **Streaming Response**: The Gemini API begins streaming the response back to the `geminiService`.
6.  **Live UI Update**: The `getChatResponseStream` function yields text chunks as they arrive. The `ChatInterface` component consumes this stream, continuously updating the last message in its state. This renders the AI's response in real-time on the user's screen.
7.  **Persistence**: The `useEffect` hook in `ChatInterface` triggers on any change to the `messages` array, saving the complete, updated conversation to `LocalStorage`.

#### 3.2 Data Flow: Quiz Generation

This flow details how a quiz is created from a user-provided topic.

1.  **User Input**: The user enters a topic (e.g., "Photosynthesis") into the `QuizGenerator` component and clicks "Generate Quiz."
2.  **State Update**: The component sets its `isLoading` state to `true`, displaying a loader to the user.
3.  **Service Call**: The `geminiService.ts` function `generateQuiz` is called with the topic string.
4.  **API Request**: The service makes a request to the **Google Gemini API**. The request includes a prompt instructing the model to generate a 5-question quiz and specifies `responseMimeType: "application/json"` along with a strict `responseSchema` to ensure the output is valid JSON.
5.  **JSON Response**: The Gemini API processes the request and returns a structured JSON string that matches the provided schema.
6.  **Data Parsing**: The `geminiService` receives the JSON string, parses it into a JavaScript object, and performs basic validation.
7.  **UI Render**: The service returns the parsed quiz data (or `null` on failure) to the `QuizGenerator` component. The component updates its state with the quiz data, sets `isLoading` to `false`, and re-renders to display the interactive quiz questions and options to the user.
