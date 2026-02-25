export type Language = 'en' | 'kn' | 'hi';

type Translations = {
    [key in Language]: Record<string, string>;
};

export const translations: Translations = {
    en: {
        // Shared
        loading: 'Loading...',
        refreshBtn: 'Refresh',
        
        // Locator
        locator: 'Locator',
        legalAidLocatorTitle: 'Quickly find legal aid centers near you',
        legalAidLocatorSubtitle: 'Enter your pincode to locate free legal assistance in your state.',
        locatorFormTitle: 'Find Legal Aid',
        pincodeLabel: 'Pincode',
        pincodePlaceholder: 'e.g. 560001',
        stateOptionalLabel: 'State (Optional)',
        selectStatePlaceholder: 'Select State',
        searchingBtn: 'Searching...',
        findCentersBtn: 'Find Centers',
        distanceKm: 'km away',

        // Admin Dashboard
        admin: 'Admin',
        adminDashboardTitle: 'Review Flagged Items',
        adminDashboardSubtitle: 'Manually verify AI responses for accuracy and fairness.',
        reviewPending: 'Review Pending',
        flaggedItemQuery: 'Query',
        flaggedItemAIResponse: 'AI Response',
        flaggedItemConfidence: 'Confidence Score',
        reviewBtn: 'Review',
        approveBtn: 'Approve',
        markIncorrectBtn: 'Mark Incorrect',
        escalateBtn: 'Escalate to Expert',
        cancelBtn: 'Cancel',
        noPendingItems: 'All caught up! No pending items to review.',

    },
    kn: {
        // Shared
        loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
        refreshBtn: 'ರಿಫ್ರೆಶ್ ಮಾಡಿ',
        
        // Locator
        locator: 'ಸ್ಥಳ ಶೋಧಕ',
        legalAidLocatorTitle: 'ನಿಮ್ಮ ಹತ್ತಿರದ ಕಾನೂನು ನೆರವು ಕೇಂದ್ರಗಳನ್ನು ತ್ವರಿತವಾಗಿ ಹುಡುಕಿ',
        legalAidLocatorSubtitle: 'ನಿಮ್ಮ ರಾಜ್ಯದಲ್ಲಿ ಉಚಿತ ಕಾನೂನು ನೆರವು ಪಡೆಯಲು ನಿಮ್ಮ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ.',
        locatorFormTitle: 'ಕಾನೂನು ನೆರವು ಹುಡುಕಿ',
        pincodeLabel: 'ಪಿನ್‌ಕೋಡ್',
        pincodePlaceholder: 'ಉದಾ: 560001',
        stateOptionalLabel: 'ರಾಜ್ಯ (ಐಚ್ಛಿಕ)',
        selectStatePlaceholder: 'ರಾಜ್ಯ ಆಯ್ಕೆಮಾಡಿ',
        searchingBtn: 'ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
        findCentersBtn: 'ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಿ',
        distanceKm: 'ಕಿ.ಮೀ ದೂರ',

        // Admin Dashboard
        admin: 'ನಿರ್ವಾಹಕ',
        adminDashboardTitle: 'ಫ್ಲ್ಯಾಗ್ ಮಾಡಲಾದ ಐಟಂಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
        adminDashboardSubtitle: 'ನಿಖರತೆ ಮತ್ತು ನ್ಯಾಯಸಮ್ಮತತೆಗಾಗಿ AI ಪ್ರತಿಕ್ರಿಯೆಗಳನ್ನು ಹಸ್ತಚಾಲಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ.',
        reviewPending: 'ಪರಿಶೀಲನೆ ಬಾಕಿ ಇದೆ',
        flaggedItemQuery: 'ಪ್ರಶ್ನೆ',
        flaggedItemAIResponse: 'AI ಪ್ರತಿಕ್ರಿಯೆ',
        flaggedItemConfidence: 'ವಿಶ್ವಾಸಾರ್ಹತೆ ಸ್ಕೋರ್',
        reviewBtn: 'ಪರಿಶೀಲಿಸಿ',
        approveBtn: 'ಅನುಮೋದಿಸಿ',
        markIncorrectBtn: 'ತಪ್ಪಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ',
        escalateBtn: 'ತಜ್ಞರಿಗೆ ಹೆಚ್ಚಿಸಿ',
        cancelBtn: 'ರದ್ದುಗೊಳಿಸಿ',
        noPendingItems: 'ಎಲ್ಲವೂ ಪೂರ್ಣಗೊಂಡಿದೆ! ಪರಿಶೀಲಿಸಲು ಯಾವುದೇ ಬಾಕಿ ಐಟಂಗಳಿಲ್ಲ.',
    },
    hi: {
        // Shared
        loading: 'लोड हो रहा है...',
        refreshBtn: 'रीफ्रेश करें',
        
        // Locator
        locator: 'लोकेटर',
        legalAidLocatorTitle: 'अपने आस-पास कानूनी सहायता केंद्र खोजें',
        legalAidLocatorSubtitle: 'अपने राज्य में मुफ्त कानूनी सहायता खोजने के लिए अपना पिनकोड दर्ज करें।',
        locatorFormTitle: 'कानूनी सहायता खोजें',
        pincodeLabel: 'पिनकोड',
        pincodePlaceholder: 'उदा. 560001',
        stateOptionalLabel: 'राज्य (वैकल्पिक)',
        selectStatePlaceholder: 'राज्य चुनें',
        searchingBtn: 'खोजा जा रहा है...',
        findCentersBtn: 'केंद्र खोजें',
        distanceKm: 'किमी दूर',

        // Admin Dashboard
        admin: 'एडमिन',
        adminDashboardTitle: 'फ़्लैग किए गए आइटम की समीक्षा करें',
        adminDashboardSubtitle: 'सटीकता और निष्पक्षता के लिए एआई प्रतिक्रियाओं को मैन्युअल रूप से सत्यापित करें।',
        reviewPending: 'समीक्षा लंबित',
        flaggedItemQuery: 'क्वेरी',
        flaggedItemAIResponse: 'एआई प्रतिक्रिया',
        flaggedItemConfidence: 'कॉन्फिडेंस स्कोर',
        reviewBtn: 'समीक्षा',
        approveBtn: 'स्वीकार करें',
        markIncorrectBtn: 'गलत के रूप में चिह्नित करें',
        escalateBtn: 'विशेषज्ञ को भेजें',
        cancelBtn: 'रद्द करें',
        noPendingItems: 'सब कुछ पूरा हो गया! समीक्षा के लिए कोई लंबित आइटम नहीं है।',
    }
};
