import React from "react";
import HeaderSection from "../components/HeaderSection";
import TopCategories from "../components/TopCategories";
import FeaturedBusinesses from "../components/FeaturedBusinesses";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import CallToAction from "../components/CallToAction";
import Footer from "../components/Footer";
// import FreeListingsBanner from "../components/FreeListingsBanner";

const Home = () => {
  return (
    <div>
      <HeaderSection />
      <TopCategories />
      <FeaturedBusinesses />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
      <Footer />
      {/* <FreeListingsPopup /> */}
    </div>
  );
};

export default Home;
