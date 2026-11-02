#!/usr/bin/env sh
# Nightly backup of the database and uploaded images. Example cron (02:30 daily):
#   30 2 * * * /opt/arizen/website/deploy/backup.sh >> /var/log/arizen/backup.log 2>&1
# Copies older than KEEP_DAYS are removed. Copy the backup folder off the server too.
set -eu
BACKUP_DIR="${BACKUP_DIR:-/var/backups/arizen}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y-%m-%d_%H%M)"
COMPOSE="docker compose -f $(dirname "$0")/docker-compose.prod.yml"
mkdir -p "$BACKUP_DIR"

# Database (compressed archive, restorable with mongorestore --archive --gzip)
$COMPOSE exec -T mongo mongodump --db arizen --archive --gzip > "$BACKUP_DIR/db-$STAMP.archive.gz"

# Uploaded media
$COMPOSE exec -T app tar -czf - -C /app uploads > "$BACKUP_DIR/uploads-$STAMP.tar.gz"

find "$BACKUP_DIR" -type f -mtime +"$KEEP_DAYS" -delete
echo "[$STAMP] backup complete: $(du -sh "$BACKUP_DIR" | cut -f1) in $BACKUP_DIR"
