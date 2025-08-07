import React from "react";
import Navbar from "./Navbar"; // your navbar
import Carousel from "./Carousel"; // your slider
import FreeListingsSection from "./FreeListingsSection"; // renamed from popup

export default function HeaderSection() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Navbar Area */}
      <div className="w-full bg-white z-50">
        <Navbar />
      </div>

      {/* Main Content Area - Side by Side */}
      <div className="w-full flex flex-col lg:flex-row">
        {/* Free Listings Section - Left Side */}
        <div className="w-full lg:w-2/5 xl:w-1/3">
          <FreeListingsSection />
        </div>

        {/* Carousel Section - Right Side */}
        <div className="w-full lg:w-3/5 xl:w-2/3">
          <Carousel />
        </div>
      </div>
    </div>
  );
}


// import React from "react";
// import Navbar from "./Navbar"; // your navbar
// import Carousel from "./Carousel"; // your slider
// import FreeListingsPopup from "./FreeListingsPopup"; // your free listings banner

// export default function HeaderSection() {
//   return (
//     <div className="flex flex-col w-full min-h-screen">
//       {/* Navbar Area */}
//       <div className="w-full bg-white z-50">
//         <Navbar />
//       </div>

//       {/* Carousel Area */}
//       <div className="w-full">
//         <FreeListingsPopup />
//         <Carousel />
//       </div>
//     </div>
//   );
// }
