# 🌴 WanderWise — Multi-Agent AI Travel Planner

A state-of-the-art Web Application powered by **11 Specialized AI Agents** collaborating in real-time to craft intelligent, personalized travel itineraries using live weather, flight, and routing data.

---

## 📁 Clean Project Structure Overview

```text
AIAgent/
├── 📄 .env                    # Environment variables (API Keys: Gemini, Weather, Flights, Routes)
├── 📄 package.json            # Root dependency runner (Concurrently dev script)
├── 📄 README.md               # Project documentation & directory guide
│
├── 📂 client/                 # FRONTEND APPLICATION (React + Vite)
│   ├── 📄 index.html          # Main HTML page
│   ├── 📄 vite.config.js      # Vite build configuration
│   ├── 📄 package.json        # Frontend dependencies
│   └── 📂 src/
│       ├── 📄 main.jsx        # Application Entry Point
│       ├── 📄 App.jsx         # Main Layout & Chat Interface
│       ├── 📂 components/     # UI Components (Header, ChatBubbles, AgentCards)
│       └── 📂 styles/         # Custom Glassmorphism CSS & Design System
│
└── 📂 server/                 # BACKEND APPLICATION (Express + Node.js)
    ├── 📄 index.js            # Express API Server Entry Point
    │
    ├── 📂 agents/             # 🤖 11 SPECIALIST AI AGENTS
    │   ├── travelManager.js   # Lead Coordinator Agent (Routes & Synthesizes)
    │   ├── casualAgent.js     # 💬 Casual Greetings, Chitchat & Context Memory Agent
    │   ├── weatherAgent.js    # Analyzes Live OpenWeather Data
    │   ├── routeAgent.js      # Calculates OpenRoute Driving & AviationStack Flights
    │   ├── hotelAgent.js      # Recommends Accommodations
    │   ├── foodAgent.js       # Curates Local Dining & Cuisine
    │   ├── activityAgent.js   # Recommends Sightseeing & Top Sights
    │   ├── budgetAgent.js     # Calculates Expense Breakdown
    │   ├── safetyAgent.js     # Evaluates Travel Safety & Emergency Info
    │   ├── packingAgent.js    # Generates Customized Packing Checklist
    │   └── localGuideAgent.js # Shares Local Customs, Culture & Tips
    │
    ├── 📂 services/           # 🧠 LLM & PROVIDER SERVICES
    │   └── geminiService.js   # Gemini SDK & OpenAI/AINative Fallback Pipeline
    │
    └── 📂 tools/              # 🌐 REAL-TIME EXTERNAL APIS
        ├── weatherTool.js     # OpenWeatherMap Live API Integration
        ├── mapTool.js         # OpenRouteService Geocoding & AviationStack Flights
        └── searchTool.js      # Web Search Utility
```

---

## ⚡ Quick Start Command

From the root project folder (`D:\AIAgent\AIAgent\AIAgent`):

```bash
# Start both Backend API (:3001) and Frontend UI (:5173) together
npm run dev
```

Open your browser at **`http://localhost:5173/`**.
