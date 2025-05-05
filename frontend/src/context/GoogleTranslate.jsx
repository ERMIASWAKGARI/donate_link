import { useEffect } from "react";

const loadGoogleTranslateScript = () => {
  return new Promise((resolve) => {
    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.id = "google-translate-script";
      document.body.appendChild(script);
      script.onload = resolve;
    } else {
      resolve();
    }
  });
};

export default function GoogleTranslate() {
  useEffect(() => {
    const initializeGoogleTranslate = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // Assign the callback BEFORE loading the script
    window.googleTranslateElementInit = initializeGoogleTranslate;

    loadGoogleTranslateScript();

    // Inject custom CSS to hide banner and fix spacing
    const style = document.createElement("style");
    style.innerHTML = `
      .translated-ltr {
        margin-top: -40px !important;
      }
      .goog-te-banner-frame {
        display: none !important;
        margin-top: -20px !important;
      }
      .goog-logo-link {
        display: none !important;
      }
      body {
        top: 0px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

  const handleLanguageChange = (lang) => {
    const select = document.querySelector("select.goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div id="google_translate_element" style={{ display: "none" }}></div>

      <select
        onChange={(e) => handleLanguageChange(e.target.value)}
        defaultValue="en"
        style={{
          padding: "8px",
          fontSize: "16px",
          cursor: "pointer",
          color: "white",
          backgroundColor: "#008080", // corrected
        }}
      >
        <option value="en">English</option>
        <option value="am">Amharic</option>
        <option value="om">Oromiffa</option>
      </select>
    </div>
  );
}
