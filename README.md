# web-pki-demo

A web-based PKI (Public Key Infrastructure) demo for managing mTLS (mutual TLS) certificates. This project provides a complete solution for generating and signing certificates for both client and server authentication.

## Features

- 🔐 **Root CA Setup**: Automated script to generate a root Certificate Authority
- 🌐 **Web UI**: React-based dashboard for certificate management
- 🔧 **CA Server API**: RESTful API for signing Certificate Signing Requests (CSRs)
- 📝 **Client & Server Certificates**: Support for both client and server certificate generation

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenSSL (usually pre-installed on macOS/Linux)

## Quick Start

### 1. Setup Root CA

First, generate the root CA certificate and private key:

```bash
./setup-pki.sh
```

This will create:
- `pki/ca.crt` - Root CA certificate
- `pki/ca.key` - Root CA private key

### 2. Install Dependencies

Install dependencies for both the CA server and web app:

```bash
# Install CA server dependencies
cd ca-server
npm install

# Install web app dependencies
cd ../web-app
npm install
```

### 3. Start the CA Server

In one terminal, start the CA server:

```bash
cd ca-server
node index.js
```

The server will run on `http://localhost:3000`

### 4. Start the Web UI

In another terminal, start the web application:

```bash
cd web-app
npm run dev
```

The web UI will be available at `http://localhost:5173` (or the port shown in the terminal)

## Usage

### Generating Certificates via Web UI

1. Open the web UI in your browser
2. Choose between **Client Certificate** or **Server Certificate** tabs
3. Paste your CSR (Certificate Signing Request) in PEM format
4. For server certificates, configure Subject Alternative Names (SAN) if needed
5. Click **Issue Certificate**
6. Copy the signed certificate and root CA certificate

### API Endpoints

The CA server provides the following REST endpoints:

#### Sign Client Certificate

```bash
POST http://localhost:3000/api/sign-csr
Content-Type: application/json

{
  "csr": "-----BEGIN CERTIFICATE REQUEST-----\n..."
}
```

**Response:**
```json
{
  "certificate": "-----BEGIN CERTIFICATE-----\n...",
  "rootCa": "-----BEGIN CERTIFICATE-----\n..."
}
```

#### Sign Server Certificate

```bash
POST http://localhost:3000/api/sign-server-csr
Content-Type: application/json

{
  "csr": "-----BEGIN CERTIFICATE REQUEST-----\n...",
  "san": "DNS:localhost,IP:127.0.0.1"
}
```

**Response:**
```json
{
  "certificate": "-----BEGIN CERTIFICATE-----\n...",
  "rootCa": "-----BEGIN CERTIFICATE-----\n..."
}
```

## Project Structure

```
web-pki-demo/
├── ca-server/          # Express server for certificate signing
│   ├── index.js        # Main server file
│   └── package.json    # Server dependencies
├── web-app/            # React frontend application
│   ├── src/
│   │   └── App.jsx     # Main UI component
│   └── package.json    # Frontend dependencies
├── pki/                # PKI directory (generated, gitignored)
│   ├── ca.crt          # Root CA certificate
│   └── ca.key          # Root CA private key
├── setup-pki.sh        # Script to generate root CA
└── README.md           # This file
```

## Certificate Types

### Client Certificates
- **Usage**: For client authentication (e.g., IoT devices, user devices)
- **Extended Key Usage**: `clientAuth`
- **Key Usage**: `digitalSignature, keyEncipherment`

### Server Certificates
- **Usage**: For server authentication (e.g., MQTT broker)
- **Extended Key Usage**: `serverAuth`
- **Key Usage**: `digitalSignature, keyEncipherment`
- **Subject Alternative Names**: Configurable (default: `DNS:localhost,IP:127.0.0.1`)

## Security Notes

⚠️ **Important**: This is a demo project for development purposes only.

- The PKI directory (`pki/`) is gitignored and contains sensitive private keys
- Never commit private keys to version control
- For production use, implement proper key management and security practices
- Certificates are valid for 365 days by default

## Development

### CA Server
- Runs on port 3000
- Uses Express.js with CORS enabled
- Temporary files are cleaned up after certificate signing

### Web App
- Built with React 19 and Vite
- Development server with hot module replacement
- ESLint configured for code quality

## License

ISC
