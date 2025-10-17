// IMPT: Comment this file out after testing to avoid exposing the api keys
'use client';

export default function TestFirebase() {
  const checkEnvVars = () => {
    console.log('Environment Variables:');
    console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  };

  return (
    <div className="p-8">
      <h1>Firebase Test Page</h1>
      <button 
        onClick={checkEnvVars}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Check Env Vars (Open Console)
      </button>
      
      <div className="mt-4">
        <h2>Config Values:</h2>
        <ul>
          <li>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? ' Loaded' : 'Missing'}</li>
          <li>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? ' Loaded' : ' Missing'}</li>
          <li>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? ' Loaded' : ' Missing'}</li>
        </ul>
      </div>
    </div>
  );
}