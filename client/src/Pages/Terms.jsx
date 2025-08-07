import React from "react";
import Footer from "../components/Footer";

const Terms = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#FFEADB] to-[#FFD9B8] px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 border border-orange-200">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-[#e26936] mb-6">
            ✅ Terms and Conditions (T&C)
          </h1>

          <p className="text-center text-sm text-gray-500 mb-8">
            <strong>Effective Date:</strong> 29-06-2025 |{" "}
            <strong>Last Updated:</strong> 29-06-2025
          </p>

          <div className="space-y-6 text-[#333] text-[15px] leading-relaxed">
            {[
              {
                title: "1. Acceptance of Terms",
                content:
                  "By accessing or using Bazaardial (“Platform”), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use our services.",
              },
              {
                title: "2. Eligibility",
                content:
                  "You must be at least 18 years old to register and list a business. All information you provide must be accurate and up to date.",
              },
              {
                title: "3. Account and Business Listing",
                list: [
                  "Users may create an account and add a single business listing.",
                  "You are responsible for maintaining the confidentiality of your login credentials.",
                  "You must not post false, misleading, or illegal content.",
                  "All businesses must be genuine and relevant to the selected category.",
                ],
              },
              {
                title: "4. Prohibited Uses",
                list: [
                  "Post offensive, defamatory, or misleading content",
                  "Upload viruses or harmful code",
                  "Use automation (bots) to scrape or manipulate listings",
                ],
              },
              {
                title: "5. Ownership and License",
                content:
                  "All content uploaded by users remains their property, but you grant Bazaardial a non-exclusive license to display and promote your listing.",
              },
              {
                title: "6. Suspension and Termination",
                content:
                  "We may suspend or terminate accounts found violating our terms, with or without notice.",
              },
              {
                title: "7. Disclaimer",
                content:
                  "Bazaardial provides listings for informational purposes only. We do not guarantee the accuracy, quality, or reliability of any listed business.",
              },
              {
                title: "8. Limitation of Liability",
                content:
                  "We are not liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our platform.",
              },
              {
                title: "9. Changes to Terms",
                content:
                  "We reserve the right to update these Terms at any time. Continued use after changes implies acceptance.",
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

export default Terms;
