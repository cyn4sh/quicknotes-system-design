# QuickNotes Architecture

## Functional requirements

- Users can create, read, update and delete their own notes.
- Users can tag notes and filter/search by tag.
- Users can authenticate (sign up, log in) to access only their own notes.
- The system returns notes quickly even as the number of users grows.

## Non-functional requirements

- The system should handle at least 1 million registered users.
- Reads (loading notes) should respond in well under 1 second under normal load.
- The system should remain available even if a single server or database node fails.
- User data must be isolated, one user must never see another user's notes.

## Load estimate (1,000,000 registered users)

**Assumptions:**
- There are 1,000,000 registered users.
- 20% of them use the app on a given day, so there are 200,000 daily active users (DAU).
- Each active user creates 5 notes per day.
- Each active user loads their notes 20 times per day.
- An average note, including its extra fields, is about 500 bytes.
- 1 day ≈ 100,000 seconds (rounded for easy maths).

**Writes (new notes):**
200,000 users × 5 notes = 1,000,000 writes per day
1,000,000 ÷ 100,000 ≈ **10 writes per second**

**Reads (load notes):**
200,000 users × 20 loads = 4,000,000 reads per day
4,000,000 ÷ 100,000 ≈ **40 reads per second**

**Peak traffic (busy hours are ~5× the average):**
≈ **50 writes/s** and ≈ **200 reads/s**

**Storage per year:**
1,000,000 notes/day × 500 bytes = 500 MB per day
500 MB × 365 ≈ **180 GB per year**

This confirms QuickNotes is **read-heavy** (4× more reads than writes), so caching reads will help the most. 200 requests/second at peak is manageable for a handful of app servers, and 180 GB/year fits comfortably in one well-configured database with room to grow.

## Architecture diagram

```
                      ┌─────────┐
    Users ───────────▶│   DNS   │
                      └────┬────┘
                           ▼
                      ┌─────────┐
                      │   CDN   │ (serves cached static assets)
                      └────┬────┘
                           │ (cache miss / dynamic requests)
                           ▼
                   ┌───────────────┐
                   │ Load Balancer │
                   └───┬───────┬───┘
                       ▼       ▼
                 ┌─────────┐ ┌─────────┐
                 │App Server│ │App Server│   (2+ servers)
                 └────┬────┘ └────┬────┘
                      │           │
          ┌───────────┴───┬───────┴──────────┐
          ▼                ▼                  ▼
    ┌──────────┐   ┌───────────────┐   ┌─────────────┐
    │  Cache   │   │Primary Database│   │ Queue +     │
    │          │   │ + Read Replica │   │ Worker      │
    └──────────┘   └───────────────┘   └─────────────┘
```

## Components, one sentence each

- **DNS:** translates the app's domain name into the IP address of the CDN/load balancer, directing users to the right place.
- **CDN:** caches and serves static assets close to users, reducing load on the origin servers.
- **Load balancer:** spreads incoming requests across multiple app servers so no single server becomes a bottleneck or a single point of failure.
- **App servers (2+):** run the application logic for creating, reading, updating and deleting notes; having more than one means the system keeps working if one server goes down.
- **Cache:** stores frequently-requested data (like a user's recent notes) in memory, so repeated reads don't need to hit the database every time.
- **Primary database with a read replica:** the primary handles writes (new/updated notes), while the read replica handles the larger volume of read queries, splitting the load and adding redundancy.
- **Queue with a worker:** holds background jobs (like sending a notification when a note is shared) so the main request can respond quickly without waiting for that work to finish.

## Request flows

### GET /notes
1. User's request reaches the load balancer via DNS.
2. Load balancer routes it to an available app server.
3. App server checks the cache for this user's notes.
4. If cached, the cached result is returned immediately. If not, the app server queries the read replica.
5. The result is stored in the cache and returned to the user.

### POST /notes
1. User's request reaches the load balancer via DNS.
2. Load balancer routes it to an available app server.
3. App server validates the note (title required, etc.).
4. App server writes the new note to the primary database.
5. App server invalidates or updates the relevant cache entry so future reads reflect the new note.
6. App server responds to the user confirming the note was created.

## Trade-offs

1. **Read replica lag vs. read speed:** offloading reads to a replica makes the system handle far more traffic, but the replica can lag slightly behind the primary, so a user might briefly not see a note they just created on a different server. This is an acceptable trade-off for a notes app, where a few seconds of staleness doesn't cause real harm.
2. **Caching vs. freshness:** caching reads reduces database load significantly, but it means an updated note might be served from cache briefly before the cache is invalidated. Trading perfect freshness for speed is reasonable here, since notes aren't updated by multiple people simultaneously.

## Avoiding single points of failure

The load balancer sits in front of 2+ app servers, so if one app server crashes, traffic is automatically routed to the others. The database has a read replica, so read traffic can continue even if the primary is temporarily under heavy write load, and the replica can be promoted to primary if the original primary fails. The CDN caches content across multiple edge locations, so no single CDN node failing takes down static asset delivery for everyone.