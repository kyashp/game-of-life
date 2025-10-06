


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
        
          {/* Section Box */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-center mb-4">Welcome !</h2>

          <button className = "w-full mb-4 px-6 py-3 bg-[#ffffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black flex justify-start ">
          Username / Email 
          </button>

          <button className = "w-full mb-4 px-6 py-3 bg-[#fffff] text-gray-700 rounded-full hover:bg-gray-300 transition-colors border-2 border-black flex justify-start">
          Password
          </button>
          
          <p>
            <a href="#" className="text-blue-500 hover:text-blue-600 font-medium flex justify-end">
              Forgot Password?
            </a>
          </p>
          <button className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            Sign Up
          </button>
          
          <div className="mt-4 text-center">
            <span className="text-gray-500">Already have an account? </span>
            <button className="text-blue-500 hover:text-blue-600 font-medium">
              Log In
            </button>
          </div>
        </div>


      </div>

    </div>
  );
}










