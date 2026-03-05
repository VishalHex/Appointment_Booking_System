# Local Data Storage

This folder is used for storing local data files (JSON, etc.) when not using a real database or external services. Controlled by environment flags (e.g., USE_LOCAL_DB=true).

- Store users, appointments, providers, reminders, etc. as JSON files here for development/testing.
- Switch between local and real DB using an environment variable.
