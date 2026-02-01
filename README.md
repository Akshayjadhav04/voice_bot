# Voice Bot

A voice-enabled interactive chatbot application that allows users to have natural conversations with an AI using voice commands. The application features real-time speech recognition, text-to-speech synthesis, and intelligent responses powered by the Groq API.

## Features

- 🎙️ **Voice Interface**: Speak to the bot using your microphone with real-time speech recognition.
- 🗣️ **Text-to-Speech**: The bot responds with natural-sounding speech.
- 💬 **Interactive Chat**: Clean and modern chat interface for visual history of the conversation.
- ⚡ **Fast Responses**: Powered by Groq's high-speed inference engine (Llama 3.3).
- 🎨 **Modern UI**: Built with React, Tailwind CSS, and Framer Motion for smooth animations and a premium feel.

## Tech Stack

### Client
- **React**: UI library
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icons

### Server
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Groq SDK**: AI model integration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A [Groq API Key](https://console.groq.com/)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chat_bot_1
```

### 2. server Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
SYSTEM_PROMPT="You are a helpful and witty voice assistant..."
```

Start the backend server:

```bash
npm start
# or for development with nodemon:
npm run dev
```

The server will run on `http://localhost:5000`.

### 3. Client Setup

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd client
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The application will likely run on `http://localhost:5173`.

## Usage

1. Open your browser and go to the client URL (e.g., `http://localhost:5173`).
2. Click the microphone button 🎙️ to start listening.
3. Speak your message. The bot will transcribe your speech, send it to the server, and respond with both text and voice.
4. Use the stop button ⏹️ to stop the bot from speaking if needed.
