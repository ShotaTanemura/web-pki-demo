import { useState } from 'react'

function App() {
  const [mode, setMode] = useState('client') 
  
  const [csr, setCsr] = useState('')
  const [san, setSan] = useState('DNS:localhost,IP:127.0.0.1')
  
  const [cert, setCert] = useState('')
  const [rootCa, setRootCa] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSign = async () => {
    try {
      setError('');
      setCert('');
      setRootCa('');
      setLoading(true);
      
      const endpoint = mode === 'client' 
        ? 'http://localhost:3000/api/sign-csr' 
        : 'http://localhost:3000/api/sign-server-csr';

      const payload = mode === 'client' 
        ? { csr } 
        : { csr, san };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signing failed');
      }

      setCert(data.certificate);
      setRootCa(data.rootCa);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid #007bff' : '3px solid transparent',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#007bff' : '#666'
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🔐 Private CA Dashboard</h1>
      
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '2rem' }}>
        <div style={tabStyle(mode === 'client')} onClick={() => setMode('client')}>
          Client Certificate
        </div>
        <div style={tabStyle(mode === 'server')} onClick={() => setMode('server')}>
          Server Certificate
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>
          {mode === 'client' ? 'Generate Device (Client) Certificate' : 'Generate Broker (Server) Certificate'}
        </h3>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          {mode === 'client' 
            ? 'Use this for your User Devices (SDK). Generates a cert with "clientAuth" usage.'
            : 'Use this for your MQTT Broker. Generates a cert with "serverAuth" usage and SANs.'}
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}><strong>CSR (PEM format):</strong></label>
        <textarea 
          rows="8" 
          style={{ width: '100%', padding: '0.5rem', fontFamily: 'monospace' }}
          value={csr} 
          onChange={(e) => setCsr(e.target.value)}
          placeholder="-----BEGIN CERTIFICATE REQUEST-----..."
        />
      </div>

      {mode === 'server' && (
        <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '4px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <strong>Subject Alternative Names (SAN):</strong>
          </label>
          <input 
            type="text" 
            style={{ width: '100%', padding: '0.5rem', fontFamily: 'monospace' }}
            value={san}
            onChange={(e) => setSan(e.target.value)}
            placeholder="DNS:localhost,IP:127.0.0.1"
          />
        </div>
      )}

      <button 
        onClick={handleSign} 
        disabled={!csr || loading}
        style={{ 
          padding: '10px 20px', 
          fontSize: '1rem', 
          backgroundColor: loading ? '#ccc' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Signing...' : 'Issue Certificate'}
      </button>

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}

      {cert && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}><strong>✅ Signed Certificate:</strong></label>
          <textarea 
            rows="10" 
            style={{ width: '100%', padding: '0.5rem', fontFamily: 'monospace' }}
            value={cert} 
            readOnly 
          />
          <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            <small>Save this content as <code>{mode}.crt</code></small>
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}><strong>🌳 Root CA Certificate:</strong></label>
          <textarea 
            rows="10" 
            style={{ width: '100%', padding: '0.5rem', fontFamily: 'monospace' }}
            value={rootCa} 
            readOnly 
          />
          <div style={{ marginTop: '0.5rem' }}>
            <small>Save this content as <code>ca.crt</code> (You need this for trust validation)</small>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
