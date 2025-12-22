const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/*' }));

const PKI_DIR = path.resolve(__dirname, '../pki');
const TEMP_DIR = path.resolve(__dirname, 'temp');

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

const signCsr = (res, csrPem, extConfigContent, days) => {
    if (!csrPem || !csrPem.includes('BEGIN CERTIFICATE REQUEST')) {
        return res.status(400).json({ error: 'Invalid CSR format' });
    }

    const requestId = Date.now();
    const csrPath = path.join(TEMP_DIR, `${requestId}.csr`);
    const crtPath = path.join(TEMP_DIR, `${requestId}.crt`);
    const extPath = path.join(TEMP_DIR, `${requestId}.cnf`);

    try {
        fs.writeFileSync(csrPath, csrPem);
        fs.writeFileSync(extPath, extConfigContent);

        const cmd = `openssl x509 -req -in ${csrPath} \
          -CA ${path.join(PKI_DIR, 'ca.crt')} \
          -CAkey ${path.join(PKI_DIR, 'ca.key')} \
          -CAcreateserial \
          -out ${crtPath} \
          -days ${days} \
          -sha256 \
          -extfile ${extPath}`;

        console.log(`Signing request ${requestId}...`);

        exec(cmd, (error, stdout, stderr) => {
            if (fs.existsSync(csrPath)) fs.unlinkSync(csrPath);
            if (fs.existsSync(extPath)) fs.unlinkSync(extPath);

            if (error) {
                console.error(`OpenSSL Error: ${stderr}`);
                return res.status(500).json({ error: 'Signing failed', details: stderr });
            }

            const crtPem = fs.readFileSync(crtPath, 'utf8');
            fs.unlinkSync(crtPath);

            const caPem = fs.readFileSync(path.join(PKI_DIR, 'ca.crt'), 'utf8');

            console.log(`Request ${requestId} signed successfully.`);
            
            res.json({ 
                certificate: crtPem, 
                rootCa: caPem 
            });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

app.post('/api/sign-csr', (req, res) => {
    const csr = typeof req.body === 'string' ? req.body : req.body.csr;
    const extConfig = `
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth
`;
    signCsr(res, csr, extConfig, 365);
});

app.post('/api/sign-server-csr', (req, res) => {
    const { csr, san } = req.body;
    const subjectAltName = san || "DNS:localhost,IP:127.0.0.1";
    const extConfig = `
subjectAltName = ${subjectAltName}
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
`;
    signCsr(res, csr, extConfig, 365);
});

app.listen(3000, () => {
    console.log('CA Server running on http://localhost:3000');
});
