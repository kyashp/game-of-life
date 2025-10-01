


export default function Landing() {
  return (
    <div className="min-h-screen flex bg-[#fefcf3]">
      
      {/* Left Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-4">Strategise your parenthood finances with Game of Life</h1>
        <p className="text-lg text-gray-600 text-center">
          Simulate your child’s future in Singapore, make strategic decisions, and secure your finances with our platform. 
          Sign up for an account to save progress or play as guest.
        </p>

        <button className="mt-6 px-6 py-3 bg-[#f47068] text-white rounded-lg hover:bg-blue-400 transition-colors">
          Start simulating now →
        </button>
      </div>

      {/* Right Section */}
      <div className="w-1/3 flex flex-col items-center justify-center p-8">
        
        <button className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          Sign Up
        </button>
      </div>

    </div>
  );
}










