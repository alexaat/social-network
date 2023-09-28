CREATE TABLE IF NOT EXISTS "notifications" (
    "id" INTEGER PRIMARY KEY,
    "date" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "is_read" BOOLEAN NOT NULL
)
