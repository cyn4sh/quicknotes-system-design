# QuickNotes Data Model

## Entities

### users
| Column | Type | Constraints |
| --- | --- | --- |
| id | INTEGER | PRIMARY KEY |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | NOT NULL |
| created_at | DATETIME | NOT NULL |

### notes
| Column | Type | Constraints |
| --- | --- | --- |
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) |
| title | TEXT | NOT NULL |
| body | TEXT | |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

### tags
| Column | Type | Constraints |
| --- | --- | --- |
| id | INTEGER | PRIMARY KEY |
| name | TEXT | NOT NULL, UNIQUE |

### note_tags
| Column | Type | Constraints |
| --- | --- | --- |
| id | INTEGER | PRIMARY KEY |
| note_id | INTEGER | NOT NULL, FOREIGN KEY → notes(id) |
| tag_id | INTEGER | NOT NULL, FOREIGN KEY → tags(id) |

## Relationships

- **users to notes** is one-to-many: one user can own many notes, but each note belongs to exactly one user.
- **notes to tags** is many-to-many: one note can have many tags, and one tag can be applied to many notes. A plain foreign key can't represent this directly, so `note_tags` acts as a join table, breaking the many-to-many relationship into two one-to-many relationships (`notes` to `note_tags`, and `tags` to `note_tags`).

## CREATE TABLE statements

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id),
  UNIQUE (note_id, tag_id)
);
```

## Example queries

### 1. All notes for one user
```sql
SELECT notes.title, notes.body
FROM notes
WHERE notes.user_id = 7;
```

### 2. All tags on one note (JOIN)
```sql
SELECT tags.name
FROM tags
JOIN note_tags ON tags.id = note_tags.tag_id
WHERE note_tags.note_id = 101;
```

### 3. Number of notes per user
```sql
SELECT users.name, COUNT(notes.id) AS note_count
FROM users
LEFT JOIN notes ON users.id = notes.user_id
GROUP BY users.id;
```

## Index

I would add an index on `notes.user_id`, since the most common query in the app is "list all notes for this user" (every time the user loads their notes list). Without an index, this requires scanning the entire `notes` table; an index lets the database jump directly to that user's rows, which matters once the table holds millions of notes.

## SQL or NoSQL?

I would choose **SQL** for QuickNotes. The data has a clear, fixed structure, and the many-to-many relationship between notes and tags is naturally expressed through a join table with foreign keys, something a relational database enforces automatically. The app also needs guaranteed consistency, for example making sure a note's `user_id` always points to a real user, which SQL enforces through foreign key constraints rather than relying on application code to maintain it correctly. A NoSQL document store could work by embedding tags inside each note, but it would make "find all notes with this tag" and reporting across users considerably harder, and the schema here isn't the kind that needs NoSQL's flexibility.