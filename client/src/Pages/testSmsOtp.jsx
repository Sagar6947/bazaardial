// components/TestSmsSender.js
import { useEffect } from "react";

export default function TestSmsSender() {
  useEffect(() => {
    const sendSms = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/auth/testOtp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            number: "6265965711",
          }),
        });

        const data = await response.text(); // since server returns plain text
        console.log("📨 Response from server:", data);
      } catch (error) {
        console.error("❌ Client error:", error);
      }
    };

    sendSms();
  }, []);

  return <div>Sending test SMS via server... Check console.</div>;
}
