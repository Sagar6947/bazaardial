import React from "react";
import Footer from "../components/Footer";

const Privacy = () => {
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-[#FFEADB] to-[#FFD9B8] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 border border-orange-200">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-[#e26936] mb-6">
          Privacy Policy
        </h1>

        <p className="text-center text-sm text-gray-500 mb-8">
          <strong>Effective Date:</strong> 29-06-2025 |{" "}
          <strong>Last Updated:</strong> 29-06-2025
        </p>

        <div className="space-y-6 text-[#333] text-[15px] leading-relaxed">
          {[
            {
              title: "1. Information We Collect",
              content: (
                <>
                  <strong>Personal Information:</strong> Name, mobile number, email, etc. <br />
                  <strong>Business Details:</strong> Name, address, documents (Aadhar, logo, etc.) <br />
                  <strong>Device Info:</strong> IP address, browser, cookies, etc.
                </>
              ),
            },
            {
              title: "2. How We Use Your Information",
              list: [
                "To create and manage user accounts",
                "To display and promote business listings",
                "To communicate with users regarding updates or support",
                "To improve our platform and services",
              ],
            },
            {
              title: "3. Sharing of Data",
              list: [
                "We do not sell your personal data",
                "We may share data with service providers for hosting, analytics, or support",
                "We may disclose data if required by law or to protect our rights/safety",
              ],
            },
            {
              title: "4. Data Security",
              content:
                "We use industry-standard measures to protect your data but cannot guarantee complete security.",
            },
            {
              title: "5. User Rights",
              list: [
                "You can access or update your personal data",
                "You can request deletion of your account",
                "You can contact us for any privacy-related queries",
              ],
            },
            {
              title: "6. Cookies",
              content:
                "We use cookies to enhance user experience. You can disable cookies via your browser settings.",
            },
            {
              title: "7. Third-Party Links",
              content:
                "Our platform may contain links to external sites. We are not responsible for their privacy practices.",
            },
            {
              title: "8. Ownership and License",
              content:
                "All content uploaded by users remains their property, but you grant Bazaardial a non-exclusive license to display and promote your listing.",
            },
            {
              title: "9. Suspension and Termination",
              content:
                "We may suspend or terminate accounts found violating our terms, with or without notice.",
            },
            {
              title: "10. Disclaimer",
              content:
                "Bazaardial provides listings for informational purposes only. We do not guarantee the accuracy or reliability of any listed business.",
            },
            {
              title: "11. Limitation of Liability",
              content:
                "We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
            },
            {
              title: "12. Updates",
              content:
                "We may update this Privacy Policy from time to time. Continued use after updates implies acceptance.",
            },
          ].map((section, index) => (
            <div
              key={index}
              className="bg-orange-50/50 p-4 rounded-xl shadow-sm border border-orange-100"
            >
              <h2 className="font-semibold text-lg text-[#e26936] mb-2">
                {section.title}
              </h2>
              {section.content && <p>{section.content}</p>}
              {section.list && (
                <ul className="list-disc pl-5 space-y-1">
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Privacy;
