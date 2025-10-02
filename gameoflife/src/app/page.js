import Image from "next/image";


export default function Home() {
  return (
    <div className="min-h-screen flex bg-[#fefcf3]">

      <div className="flex-1 flex flex-col items-center justify-center p-8">

      <h1>
        {/* Logo - Top Left */}
              <div className="absolute top-40 left-160">
                <Image 
                  src="/GOL_Logo.png" 
                  alt="Game of Life Logo" 
                  width={200} 
                  height={40}
                  className="object-contain"
                />
              </div>

        Welcome to Game of Life!</h1>

      <p className="text-lg text-gray-600 text-center">
          Simulate your child’s future in Singapore, make strategic decisions, and secure your finances with our platform. 
          Sign up for an account to save progress or play as guest.
        </p>

      <button className="mt-6 px-6 py-3 bg-[#f47068] text-white rounded-lg hover:bg-blue-400 transition-colors" >
          Go to Login Page →
        </button>
      
      </div>

    

    </div>
  );
}












