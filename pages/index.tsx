import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import Button from "../components/shared/Button";

const Home: NextPage = () => {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Bingo Web App - Admin</title>
        <meta name="description" content="Educational Bingo Game Admin Panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Bingo Web App
          </h1>
          <p className="text-lg text-gray-600">
            Educational vocabulary game builder for teachers
          </p>
        </div>

        {/* Test Tailwind and Components */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Setup Status
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">✅ Next.js</span>
              <span className="text-green-600">Ready</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">✅ Tailwind CSS</span>
              <span className="text-green-600">Ready</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">✅ Components</span>
              <span className="text-green-600">Ready</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800">⏳ Supabase</span>
              <span className="text-blue-600">Config needed</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button 
              variant="primary" 
              onClick={() => setShowMessage(!showMessage)}
              className="w-full"
            >
              Test Components
            </Button>
            
            {showMessage && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  🎉 Components are working! Ready to build the admin interface.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="max-w-2xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              Admin Features
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Saved Games Management</li>
              <li>• Game Creation Interface</li>
              <li>• Folder Tree Navigation</li>
              <li>• Image Upload & Management</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              Player Features
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Drag & Drop Bingo Board</li>
              <li>• Drawing Tools</li>
              <li>• Touch Support</li>
              <li>• Game Link Access</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
