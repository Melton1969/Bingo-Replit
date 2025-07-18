import { useState } from 'react';
import Button from '../components/shared/Button';

const TestPage = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const seedDatabase = async () => {
    setLoading(true);
    setStatus('Seeding database...');
    
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setStatus('✅ Database seeded successfully!');
        setData(result.data);
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAPI = async (endpoint, label) => {
    setLoading(true);
    setStatus(`Testing ${label}...`);
    
    try {
      const response = await fetch(endpoint);
      const result = await response.json();
      
      if (response.ok) {
        setStatus(`✅ ${label} working! Found ${result.length} items`);
        setData(result);
      } else {
        setStatus(`❌ ${label} error: ${result.error}`);
      }
    } catch (error) {
      setStatus(`❌ ${label} error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Database & API Test Page
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Database Setup</h2>
          
          <div className="space-y-4">
            <Button 
              onClick={seedDatabase} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Seeding...' : 'Seed Database with Test Data'}
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline"
                onClick={() => testAPI('/api/games', 'Games API')}
                disabled={loading}
              >
                Test Games API
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => testAPI('/api/folders', 'Folders API')}
                disabled={loading}
              >
                Test Folders API
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => testAPI('/api/backgrounds', 'Backgrounds API')}
                disabled={loading}
              >
                Test Backgrounds API
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => testAPI('/api/folders/1/images', 'Images API')}
                disabled={loading}
              >
                Test Images API
              </Button>
            </div>
          </div>
          
          {status && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{status}</p>
            </div>
          )}
        </div>
        
        {data && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-center mt-8">
          <p className="text-gray-600">
            <strong>Note:</strong> You'll need to configure your Supabase credentials in .env.local
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Run the database schema from /lib/database-schema.sql in your Supabase SQL editor first
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;