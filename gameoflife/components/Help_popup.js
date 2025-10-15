import React from 'react';

export default function Help_popup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent white overlay */}
      <div 
        className="absolute inset-x-0 top-[90px] bottom-0 bg-white-100/50 backdrop-blur-[2px]"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl w-[80%] max-w-2xl max-h-[80vh] overflow-hidden z-50">
        {/* Scrollable content area */}
        <div className="overflow-y-auto p-8 max-h-[calc(80vh-4rem)] text-black">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#2D3142]">Help and Support</h1>
          </div>
          
          {/* Subheading and content */}
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">How to use Life Sim?</h2>
              <p className="text-lg mb-4">
                Life Sim allows you to experience the journey of raising your child from birth to adulthood in real-time.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create your family profile</li>
                <li>Watch your child grow</li>
                <li>Make important decisions</li>
                <li>Track expenses and benefits</li>
                <li>View your Life Sim dashboard for cost breakdown</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How to use Insights?</h2>
              <p className="text-lg mb-4">
                Use Insights to project costs for raising multiple children based on your family profile.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Input number of children, preferred education path</li>
                <li>View cost breakdowns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-700">Disclaimer</h2>
              <p className="text-lg mb-4">
                The &quot;Game of Life&quot; application is designed to assist Singaporean families in family planning and budgeting by visualizing the potential financial costs of raising a child.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>No Financial Advice: This application is not a substitute for professional financial advice. The data is for general guidance only.</li>
                <li>Verification: For the most accurate and up-to-date information on government benefits and schemes, users are encouraged to consult the relevant government agencies and support services directly. </li>
              </ul>
            </section>
            
            {/* Additional sections can be added here */}
          </div>
        </div>

        {/* Close button - fixed at bottom and centered*/}
        <div className="sticky bottom-0 w-full p-4 bg-white border-t flex justify-center">
          <button
            onClick={onClose}
            className=" bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
