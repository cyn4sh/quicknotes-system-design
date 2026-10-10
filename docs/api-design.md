# QuickNotes API Design

A REST API design for the real QuickNotes backend (not JSONPlaceholder).

## Endpoints

### 1. List notes

- **Method:** GET
- **Path:** `/notes`
- **Description:** Returns a paginated list of the authenticated user's notes.
- **Success response:** `200 OK`

### 2. Get one note

- **Method:** GET
- **Path:** `/notes/:id`
- **Description:** Returns a single note by its ID.
- **Success response:** `200 OK`

### 3. Create a note

- **Method:** POST
- **Path:** `/notes`
- **Description:** Creates a new note for the authenticated user.
- **Success response:** `201 Created`

### 4. Update a note

- **Method:** PUT
- **Path:** `/notes/:id`
- **Description:** Updates an existing note's title and/or body.
- **Success response:** `200 OK`

### 5. Delete a note

- **Method:** DELETE
- **Path:** `/notes/:id`
- **Description:** Permanently deletes a note.
- **Success response:** `200 OK`

### 6. List notes by tag

- **Method:** GET
- **Path:** `/notes?tag=:tagName`
- **Description:** Returns all notes that have the given tag, using a query parameter.
- **Success response:** `200 OK`

## Request/response examples

### Create a note — request

```json
POST /notes
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Buy milk and bread",
  "body": "Remember to check for oat milk too.",
  "tags": ["personal", "errands"]
}
```

### Create a note — response (201 Created)

```json
{
  "id": 101,
  "title": "Buy milk and bread",
  "body": "Remember to check for oat milk too.",
  "tags": ["personal", "errands"],
  "userId": 7,
  "createdAt": "2026-10-10T03:35:00Z",
  "updatedAt": "2026-10-10T03:35:00Z"
}
```

### List notes — response (200 OK)

```json
{
  "notes": [
    {
      "id": 101,
      "title": "Buy milk and bread",
      "body": "Remember to check for oat milk too.",
      "tags": ["personal", "errands"],
      "userId": 7,
      "createdAt": "2026-10-10T03:35:00Z",
      "updatedAt": "2026-10-10T03:35:00Z"
    },
    {
      "id": 102,
      "title": "Finish project report",
      "body": "Due Friday, attach the charts.",
      "tags": ["work"],
      "userId": 7,
      "createdAt": "2026-10-09T14:10:00Z",
      "updatedAt": "2026-10-09T14:10:00Z"
    }
  ],
  "page": 1,
  "totalPages": 5,
  "totalNotes": 48
}
```

## Error codes

### 400 Bad Request

Returned when the request body or a query parameter is missing or invalid, for example creating a note with no title.

```json
{
  "error": "Bad Request",
  "message": "Title is required."
}
```

### 401 Unauthorized

Returned when no valid authentication token is provided.

```json
{
  "error": "Unauthorized",
  "message": "Authentication token is missing or invalid."
}
```

### 403 Forbidden

Returned when a user tries to access or modify a note that belongs to someone else.

```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this note."
}
```

### 404 Not Found

Returned when the requested note ID doesn't exist, for example `GET /notes/9999` when no note has that ID.

```json
{
  "error": "Not Found",
  "message": "Note with id 9999 was not found."
}
```

### 500 Internal Server Error

Returned when an unexpected error occurs on the server, such as a database connection failure.

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong. Please try again later."
}
```
