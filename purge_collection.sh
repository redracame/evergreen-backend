#!/bin/bash

# ====== CONFIG ======
MONGO_URI=$1
DB_NAME=$2
COLLECTION_NAME=$3

# ====== SCRIPT ======
echo "⚠️  WARNING: This will delete ALL documents in $DB_NAME.$COLLECTION_NAME!"
read -p "Type 'YES' to confirm: " CONFIRM

if [[ "$CONFIRM" != "YES" ]]; then
  echo "❎ Operation cancelled."
  exit 1
fi

echo "🔗 Connecting to MongoDB..."
mongosh "$MONGO_URI/$DB_NAME" --eval "db.getCollection('$COLLECTION_NAME').deleteMany({})"

if [[ $? -eq 0 ]]; then
  echo "✅ Successfully deleted all documents from $DB_NAME.$COLLECTION_NAME"
else
  echo "❌ Failed to delete documents. Please check your connection."
fi
