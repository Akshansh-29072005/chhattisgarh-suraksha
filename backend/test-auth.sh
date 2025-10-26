#!/usr/bin/env bash
set -euo pipefail

BASE="http://127.0.0.1:5000"
PHONE="9990001111"
FULLNAME="Test User"
EMAIL="testuser@example.com"
ADDRESS="Raipur, Chhattisgarh"

echo "1) Sending OTP to ${PHONE}"
curl -sS -X POST "$BASE/api/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"${PHONE}\"}" | jq .

sleep 1

echo "2) Fetching recent OTPs for ${PHONE}"
RESP=$(curl -sS "$BASE/api/status/check/${PHONE}")
echo "$RESP" | jq .

OTP=$(echo "$RESP" | jq -r '.recentOtps[0].otp_code // empty')
if [ -z "$OTP" ]; then
  echo "Could not find OTP in response. Exiting." >&2
  exit 1
fi

echo "3) Verifying OTP: $OTP"
VERIFY_RESP=$(curl -sS -X POST "$BASE/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"${PHONE}\", \"otp\": \"${OTP}\"}")
echo "$VERIFY_RESP" | jq .

TOKEN=$(echo "$VERIFY_RESP" | jq -r '.token // empty')
IS_NEW=$(echo "$VERIFY_RESP" | jq -r '.isNewUser // false')

echo "Received token: ${TOKEN}"

echo "4) If new user, register to get proper userId token"
if [ "$IS_NEW" = "true" ] || [ -z "$TOKEN" ]; then
  echo "Registering user..."
  REG_RESP=$(curl -sS -X POST "$BASE/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\": \"${PHONE}\", \"fullName\": \"${FULLNAME}\", \"email\": \"${EMAIL}\", \"address\": \"${ADDRESS}\"}")
  echo "$REG_RESP" | jq .
  TOKEN=$(echo "$REG_RESP" | jq -r '.token // empty')
  echo "New token: $TOKEN"
fi

if [ -z "$TOKEN" ]; then
  echo "No token available after verify/register. Exiting." >&2
  exit 1
fi

echo "5) Fetching protected profile with token"
curl -sS -X GET "$BASE/api/users/profile" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "Auth test flow completed."
