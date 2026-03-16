#!/usr/bin/env sh

set -eu

FILE_PATH="${1:-samples/hl7/order.orm.hl7}"
HOST="${HL7_HOST:-127.0.0.1}"
PORT="${HL7_PORT:-2575}"

PAYLOAD=$(cat "$FILE_PATH")

printf '\013%s\034\015' "$PAYLOAD" | nc "$HOST" "$PORT"