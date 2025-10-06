
export default function Profile() {
  return (
    <div className="min-h-screen flex bg-[#fefcf3]">
      
      {/* Middle Section */}
      <div className="flex-1 flex flex-col items-center justify-center mt-20 p-8">
        <div className="w-full h-full max-w-6/7 bg-[#8b93ff80] p-8 rounded-lg shadow-md flex flex-col justify-between items-center">

          {/* Top-aligned Content (Text) */}
          <div className="w-full flex flex-col items-center">
             <h1 className="text-4xl text-[#000000] font-bold mb-4">Create your Profile</h1>
             {/* You would typically place your form fields/profile content here */}
          </div>
          
          {/* Bottom-aligned Content (Button) */}
          <button className="px-6 py-3 bg-[#00bf63] text-white rounded-lg hover:bg-blue-400 transition-colors">
            Save
        </button>

        </div>

      </div>

      

    </div>
  );
}
