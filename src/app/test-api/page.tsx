'use client';

import { useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

export default function TestAPIPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const prefix = (process.env.NEXT_PUBLIC_API_PATH_PREFIX || '').replace(/\/$/, '').replace(/^\/+/, '');
      const url = prefix ? `${API_BASE_URL}/${prefix}/auth/session` : `${API_BASE_URL}/auth/session`;
      
      setResult(`Attempting to connect to: ${url}\n\n`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
      });

      const data = await response.text();
      setResult(prev => prev + `✅ SUCCESS!\nStatus: ${response.status}\nResponse: ${data}`);
    } catch (error) {
      setResult(prev => prev + `❌ ERROR!\n${error instanceof Error ? error.message : String(error)}\n\nThis is likely a CORS issue. Your backend needs to allow requests from http://localhost:3001`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">API Connection Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-semibold mb-2">Configuration:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
{`API_BASE_URL: ${API_BASE_URL}
API_PATH_PREFIX: ${process.env.NEXT_PUBLIC_API_PATH_PREFIX || '(none)'}
Frontend Origin: ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}`}
          </pre>
        </div>

        <button
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>

        {result && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">Common Issues:</h3>
          <ul className="list-disc list-inside text-yellow-800 space-y-2">
            <li><strong>CORS Error:</strong> Backend must allow origin http://localhost:3001</li>
            <li><strong>Connection Refused:</strong> Backend not running on port 5000</li>
            <li><strong>404 Not Found:</strong> Wrong API path prefix</li>
          </ul>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Backend CORS Fix:</h3>
          <p className="text-blue-800 mb-3">Add this to your backend (Node.js/Express example):</p>
          <pre className="bg-blue-900 text-blue-100 p-4 rounded text-sm overflow-x-auto">
{`const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));`}
          </pre>
        </div>
      </div>
    </div>
  );
}
