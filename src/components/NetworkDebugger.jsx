import React, { useEffect, useState } from 'react';
import config from '../config';
import axios from 'axios';

const NetworkDebugger = () => {
    const [status, setStatus] = useState('Checking...');
    const [details, setDetails] = useState('');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const startTime = Date.now();
                const response = await axios.get(`${config.API_URL}/`); // Assuming root endpoint exists
                const endTime = Date.now();

                setStatus(`✅ Connected (${endTime - startTime}ms)`);
                setDetails(`
                    API URL: ${config.API_URL}
                    Status: ${response.status}
                    Response: ${JSON.stringify(response.data)}
                `);
            } catch (error) {
                setStatus('❌ Connection Failed');
                setDetails(`
                    API URL: ${config.API_URL}
                    Error: ${error.message}
                    ${error.response ? `Response: ${JSON.stringify(error.response.data)}` : ''}
                `);
            }
        };

        checkConnection();
    }, []);

    if (import.meta.env.MODE === 'production') return null; // Hide in prod unless specifically enabled

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '300px'
        }}>
            <strong>Network Debugger</strong><br />
            {status}<br />
            <pre style={{ overflow: 'auto', maxHeight: '100px' }}>{details}</pre>
        </div>
    );
};

export default NetworkDebugger;
