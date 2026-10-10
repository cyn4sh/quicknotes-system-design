# QuickNotes System Design

A system design project for QuickNotes, moving from a browser-only notes app to a real online service for 1 million users. This repository contains a working API client (built against the JSONPlaceholder practice API) that demonstrates GET, POST and DELETE requests, along with the design documents the backend team would use to build the real QuickNotes API.

## How to run the API client

1. Clone this repository:
   ```
   git clone https://github.com/cyn4sh/quicknotes-system-design.git
   ```
2. Open `index.html` in your browser, or use the "Live Server" extension in Antigravity (or VS Code) for live reloading.
3. Click "Load notes" to fetch sample notes, use the form to create a note, or click "Delete" on any note to remove it.

## Design documents

- [API Design](docs/api-design.md) — the REST API the backend team should build for QuickNotes.
- [Data Model](docs/data-model.md) — the database schema, relationships and SQL.
- [Architecture](docs/architecture.md) — the system architecture, load estimates and scaling plan for 1 million users.

## What I learned

- How to build a reusable `request()` function that centralizes error handling (`response.ok` checks, throwing on failure) instead of repeating try/catch logic for every API call.
- How to design a REST API around resources and HTTP methods, including picking the right status codes for success and error cases.
- How a read-heavy system's load estimate (writes per second, reads per second, storage per year) directly shapes architecture decisions, like why caching and a read replica matter more than scaling writes.