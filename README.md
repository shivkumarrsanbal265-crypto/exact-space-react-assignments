# Exactspace React Technical Assessment

Official technical assessment submission for the **Front End / UI Developer Internship** at **Exactspace Technologies Pvt Ltd, Bangalore**.

This repository contains two fully implemented single-page React applications:
1. **`chat-app/`**: A real-time, responsive team chat application featuring message threads, independent like counts, randomized usernames, emoji picker, @mentions, and WebSocket synchronization.
2. **`photo-gallery/`**: An infinite-scroll photo gallery consuming the Picsum Photos API in a single-column layout with persistent independent like tracking.

---

## Repository Structure

```text
react-assignments/
├── chat-app/                       # Assignment 1: Team Chat Application
│   ├── assets/                     # Reference demonstration assets
│   ├── server/
│   │   └── server.js               # Express + Socket.IO real-time backend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ChatHeader.jsx      # Channel header & connection status
│   │   │   ├── ChatInput.jsx       # Input field, @mention trigger & send button
│   │   │   ├── EmojiPicker.jsx     # Searchable categorized emoji picker
│   │   │   ├── MentionsDropdown.jsx# Team member auto-complete dropdown
│   │   │   ├── MessageItem.jsx     # Message row, avatar, mentions & like button
│   │   │   └── MessageList.jsx     # Auto-scrolling message thread container
│   │   ├── constants/
│   │   │   ├── emojis.js           # 54 categorized emojis with search keywords
│   │   │   └── users.js            # User pool: ["Alan", "Bob", "Carol", "Dean", "Elin"]
│   │   ├── App.css                 # Comprehensive styling matching reference GIF
│   │   ├── App.jsx                 # Application state, Socket.IO integration & fallback
│   │   ├── index.css               # Design tokens and resets
│   │   └── main.jsx                # React 18 entry point
│   ├── .env.example                # Environment variable template
│   ├── .gitignore                  # Git exclusion rules
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Dependencies and scripts
│   └── vite.config.js              # Vite configuration & WebSocket proxy
│
├── photo-gallery/                  # Assignment 2: Infinite-Scroll Photo Gallery
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorMessage.jsx    # Error banner with retry button
│   │   │   ├── GalleryHeader.jsx   # Serif heading matching reference
│   │   │   ├── LoadingIndicator.jsx# Animated loading spinner
│   │   │   └── PhotoCard.jsx       # 1-column photo card with Font Awesome thumbs-up
│   │   ├── services/
│   │   │   └── photoService.js     # Picsum API client with fallback proxy
│   │   ├── App.css                 # Styling matching photo-gallery.jpg reference
│   │   ├── App.jsx                 # Infinite scrolling state & persistent likes map
│   │   └── main.jsx                # React 18 entry point
│   ├── .gitignore                  # Git exclusion rules
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Dependencies and scripts
│   └── vite.config.js              # Vite configuration & Picsum API proxy
│
├── .gitignore                      # Root git ignore (node_modules, dist, .env)
└── README.md                       # Documentation & deployment instructions
```

---

## Technologies Used

- **Frontend Core:** React 18, React DOM 18
- **Build System:** Vite 6
- **Real-Time Communication:** Socket.IO 4 (`socket.io` & `socket.io-client`)
- **Backend API:** Express.js 4, Node.js HTTP server, CORS
- **Iconography:** Font Awesome 6 (`@fortawesome/react-fontawesome`, `@fortawesome/free-solid-svg-icons`), Lucide React
- **API Feed:** Picsum Photos API (`https://picsum.photos/v2/list?page=N`)

---

## Features & Implementation

### 1. Chat Application (`chat-app/`)
- **Message Input & Sending:** Users can send messages by clicking **Send** or pressing <kbd>Enter</kbd>. Empty or whitespace-only messages are blocked. Input automatically clears and refocuses after sending.
- **Random Username Assignment:** Every message is dynamically assigned a username from `["Alan", "Bob", "Carol", "Dean", "Elin"]` with unique avatar colors, initials, and role titles.
- **Independent Like Counters:** Every message features an independent like button initialized to `0`. Repeated clicks increment that specific message's count with a pop animation.
- **Message Thread:** Displays messages chronologically above the input with avatar, author, timestamp, and bubble. Auto-scrolls to the newest message, with a floating "New messages" shortcut when scrolled up.
- **Emoji Picker (Stretch Goal 1):** 54 emojis categorized across Smileys, Gestures, Hearts, and Objects with real-time keyword search and caret-position insertion.
- **@mentions (Stretch Goal 2):** Detects typing `@` in the input and displays a navigable dropdown for candidate team members. Highlights mentions in the chat stream.
- **Socket.IO Real-Time Synchronization (Stretch Goal 3):** Real-time multi-client broadcasting of messages and like counts. When the backend server is active, connected clients sync instantly; if offline, the app operates gracefully in standalone local mode with a connection status indicator (`Live Sync` vs. `Local Mode` vs. `Reconnecting...`).

### 2. Photo Gallery (`photo-gallery/`)
- **1-Column Vertical Layout:** Matches the `photo-gallery.jpg` reference layout with crisp 250×165px cards (`object-fit: cover`) and serif heading.
- **Author Information:** Accurately renders `Author: <author_name>` beside each photograph.
- **Font Awesome Thumbs-Up Icon:** Uses official `@fortawesome/free-solid-svg-icons` (`faThumbsUp`) in vibrant blue (`#1877f2`).
- **Independent Like Counters:** Every photo starts with an independent like counter of `0`. Repeated clicks increment the count.
- **Infinite Scrolling (`IntersectionObserver`):** Observes a sentinel element at the feed's bottom (`rootMargin: '200px'`) to automatically fetch subsequent pages (`page=1`, `page=2`, etc.) and append new items.
- **State Preservation:** Like counts are maintained in an ID-keyed dictionary so appending new pages never resets earlier like counts.
- **Robust Error Handling:** Skeleton shimmer loading states, error banner with **Try Again** retry mechanism, and graceful end-of-gallery notice.

---

## Local Installation and Running

### Prerequisites
- Node.js v18+ (tested on Node v24.12.0)
- npm v9+

### Running the Chat Application

```bash
# Navigate to chat-app
cd chat-app

# Install dependencies
npm install

# Option A: Start the full application (Frontend + Backend Socket.IO Server)
# Terminal 1: Start Socket.IO backend (Port 5000)
npm run server

# Terminal 2: Start Vite frontend client (Port 5173)
npm run dev

# Open http://localhost:5173 in multiple browser tabs to test real-time sync.
```

### Running the Photo Gallery

```bash
# Navigate to photo-gallery
cd photo-gallery

# Install dependencies
npm install

# Start Vite frontend client (Port 5174)
npm run dev

# Open http://localhost:5174 in your browser.
```

---

## Render Deployment Instructions

Both applications are configured to be deployed on **Render** (https://render.com).

### Deployment 1: Chat App (Render Web Service)

The Chat App runs as a full-stack **Web Service** on Render. The Express server automatically serves the compiled React production frontend from `dist/` and runs the Socket.IO WebSocket server on the same port.

| Setting | Value |
| :--- | :--- |
| **Service Type** | **Web Service** |
| **Name** | `exactspace-chat-app` (or your choice) |
| **Root Directory** | `chat-app` |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Auto-Deploy** | `Yes` |

#### Chat App Environment Variables on Render:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode and strict CORS checks |
| `PORT` | `10000` *(Render sets this automatically)* | Port the HTTP and Socket.IO server listens on |
| `CLIENT_URL` | `https://<your-render-service-name>.onrender.com` | Allowed origin for CORS (or comma-separated URLs) |
| `VITE_SOCKET_URL` | *(Leave empty)* | When empty, the client automatically connects to same-origin |

---

### Deployment 2: Photo Gallery (Render Static Site)

The Photo Gallery is a purely client-side React single-page application that consumes the Picsum API and can be deployed as a high-performance **Static Site** on Render.

| Setting | Value |
| :--- | :--- |
| **Service Type** | **Static Site** |
| **Name** | `exactspace-photo-gallery` (or your choice) |
| **Root Directory** | `photo-gallery` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Auto-Deploy** | `Yes` |

#### Photo Gallery Environment Variables:
No environment variables are required. Picsum Photos API supports public CORS requests directly.

---

## Build Verification

Both projects compile cleanly with zero errors:

```bash
# Chat App Build
cd chat-app && npm run build
# Output: ✓ 2077 modules transformed (dist/ created)

# Photo Gallery Build
cd photo-gallery && npm run build
# Output: ✓ 40 modules transformed (dist/ created)
```
