#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKI_DIR="$SCRIPT_DIR/pki"

echo "=== Root CA Setup for Zero Trust Demo ==="
echo "PKI Directory: $PKI_DIR"

if [ -d "$PKI_DIR" ]; then
    echo "Cleaning up existing PKI directory..."
    rm -rf "$PKI_DIR"
fi

mkdir -p "$PKI_DIR"
cd "$PKI_DIR"

echo ""
echo "[1/1] Generating Root CA..."

openssl genrsa -out ca.key 4096

openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \
  -subj "/C=JP/ST=Tokyo/L=Tokyo/O=MQTT-Demo/OU=CA/CN=MQTT-Demo-Root-CA" \
  -sha256

echo "✓ Root CA created successfully."
echo "  - Certificate: $PKI_DIR/ca.crt"
echo "  - Private Key: $PKI_DIR/ca.key"
echo ""
echo "Setup Complete."
