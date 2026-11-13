**Overview**  
Pulsar is a web application that lets users run an AI model locally and interact with it through a chat interface. The frontend is built with Vue.js and Vite, while the backend uses Python and Flask. The model is configurable through a `.env` file - either by model name or by pointing to a locally downloaded model - and the app can be run with Docker Compose or manually.

**Key features**
- Chat interface for interacting with a locally running AI model.
- Support for multiple conversations.
- Conversation creation with a custom system prompt.
- Per-conversation settings: token limit, temperature, and chat name.
- Model configuration through environment variables.
- CORS configuration to control allowed origins.
- Simplified setup with Docker Compose; manual setup also supported.
- Optional GPU support through Docker.

**Technical stack**
- Frontend: Vue.js, Vite
- Backend: Python, Flask
- Containerization: Docker, Docker Compose
- Tested models: Phi-3/Phi-3.5 family (versions listed in the README)

**What this project demonstrates**
- Integration of a local AI model into a full web application.
- Clear frontend/backend separation.
- Environment-based configuration and containerization.
- Design of a chat interface with user-adjustable settings per conversation.

