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
        
            // Global / Dashboard
            citizenBadge: 'Citizen Dashboard',
            heroTitle: 'Justice & Welfare — Formulated by AI.',
            heroSubtitle: 'Instantly draft legal complaints or discover government schemes you are eligible for. Access to your rights made effortless.',
            fileComplaintTab: 'File Complaint',
            findSchemesTab: 'Find Schemes',
        
            // Language selector
            chooseLanguage: 'Choose Language',
            chooseLanguageSubtitle: 'Select your preferred language to continue',
        
            // Scheme
            schemeFinderTitle: 'Government Scheme Finder',
            schemeFinderSubtitle: 'Discover welfare schemes you are eligible for',
            checkEligibilityTitle: 'Check Eligibility',
            checkEligibilitySubtitle: 'Fill in your details to discover government schemes.',
            ageLabel: 'Age',
            stateLabel: 'State',
            categoryLabel: 'Category',
            selectCategoryPlaceholder: 'Select Category',
            categoryGeneral: 'General',
            categoryOBC: 'OBC',
            categorySC: 'SC',
            categoryST: 'ST',
            annualIncomeLabel: 'Annual Income (₹)',
            occupationLabel: 'Occupation',
            statePlaceholder: 'e.g. Maharashtra',
            occupationPlaceholder: 'e.g. Farmer, Student, Business',
            discoverSchemesBtn: 'Discover Schemes',
        
            // Complaint
            complaintStep2Title: 'Step 2: Complaint Details',
            oppositePartyNameLabel: 'Opposite Party Name',
            oppositePartyNamePlaceholder: 'Who are you complaining against?',
            oppositePartyAddressLabel: 'Opposite Party Address',
            oppositePartyAddressPlaceholder: 'Address of the opposite party',
            factsOfCaseLabel: 'Facts of Case',
            factsOfCasePlaceholder: 'Describe what happened in detail...',
            backBtn: 'Back',
            nextStepBtn: 'Next Step',
        
            // Locator additional
            nearestCentersTitle: 'Nearest Legal Aid Centers',
            locatorAddressLabel: 'Address',
            locatorPhoneLabel: 'Phone',
            getDirectionsBtn: 'Get Directions',

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
        
            // Global / Dashboard
            citizenBadge: 'ನಾಗરિક ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            heroTitle: 'ನ್ಯಾಯ ಮತ್ತು ಕ್ಷೇಮ — AI ಮೂಲಕ ನಿರ್ಮಿಸಲಾಗಿದೆ.',
            heroSubtitle: 'ತಕ್ಷಣ ಕಾನೂನು ದೂರುಗಳನ್ನು ರಚಿಸಿ ಅಥವಾ ನೀವು ಅರ್ಹವಾಗಿರುವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ. ನಿಮ್ಮ ಹಕ್ಕುಗಳಿಗೆ ಸುಲಭ ಪ್ರವೇಶ.',
            fileComplaintTab: 'ದೂರು ಸಲ್ಲಿಸಿ',
            findSchemesTab: 'ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ',
        
            // Language selector
            chooseLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
            chooseLanguageSubtitle: 'ಮುಂದುವರೆಯಲು ನಿಮ್ಮ ಇಚ್ಛಿತ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        
            // Scheme
            schemeFinderTitle: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಹುಡುಕಾಟ',
            schemeFinderSubtitle: 'ನೀವು ಅರ್ಹರಾಗಿರುವ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ',
            checkEligibilityTitle: 'ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ',
            checkEligibilitySubtitle: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಹಿಡಿಯಲು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
            ageLabel: 'ವಯಸ್ಸು',
            stateLabel: 'ರಾಜ್ಯ',
            categoryLabel: 'ವರ್ಗ',
            selectCategoryPlaceholder: 'ವರ್ಗ ಆಯ್ಕೆಮಾಡಿ',
            categoryGeneral: 'ಸಾಮಾನ್ಯ',
            categoryOBC: 'OBC',
            categorySC: 'SC',
            categoryST: 'ST',
            annualIncomeLabel: 'ವಾರ್ಷಿಕ ಆದಾಯ (₹)',
            occupationLabel: 'ವೃತ್ತಿ',
            statePlaceholder: 'ಉದಾ: ಮಹಾರಾಷ್ಟ್ರ',
            occupationPlaceholder: 'ಉದಾ: ರೈತ, ವಿದ್ಯಾರ್ಥಿ, ವ್ಯವಹಾರ',
            discoverSchemesBtn: 'ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ',
        
            // Complaint
            complaintStep2Title: 'ಹಂತ 2: ದೂರು ವಿವರಗಳು',
            oppositePartyNameLabel: 'ವಿರೋಧೀ ಪಕ್ಷದ ಹೆಸರು',
            oppositePartyNamePlaceholder: 'ನೀವು ಯಾರ ವಿರುದ್ಧ ದೂರು ನೀಡುತ್ತಿದ್ದೀರಿ?',
            oppositePartyAddressLabel: 'ವಿರೋಧೀ ಪಕ್ಷದ ವಿಳಾಸ',
            oppositePartyAddressPlaceholder: 'ವಿರೋಧೀ ಪಕ್ಷದ ವಿಳಾಸ',
            factsOfCaseLabel: 'ಕೇಸ್‌ನ ವಾಸ್ತವಗಳು',
            factsOfCasePlaceholder: 'ವಿವರವಾಗಿ ಏನಾಯಿತುವೆನ್ನುವುದನ್ನು ವಿವರಿಸಿ...',
            backBtn: 'ಹಿಂದೆ',
            nextStepBtn: 'ಮುಂದಿನ ಹಂತ',
        
            // Locator additional
            nearestCentersTitle: 'ಅರಳಿ ಕಾನೂನು ನೆರವು ಕೇಂದ್ರಗಳು',
            locatorAddressLabel: 'ವಿಳಾಸ',
            locatorPhoneLabel: 'ಫೋನ್',
            getDirectionsBtn: 'ದಿಕ್ಕುಗಳನ್ನು ಪಡೆಯಿರಿ',
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
        
            // Global / Dashboard
            citizenBadge: 'नागरिक डैशबोर्ड',
            heroTitle: 'न्याय और कल्याण - एआई द्वारा तैयार किया गया।',
            heroSubtitle: 'तुरंत कानूनी शिकायतें तैयार करें या सरकारी योजनाओं का पता लगाएं जिनके लिए आप पात्र हैं। आपके अधिकारों तक पहुंच आसान बनाना।',
            fileComplaintTab: 'शिकायत दर्ज करें',
            findSchemesTab: 'योजनाएँ खोजें',
        
            // Language selector
            chooseLanguage: 'भाषा चुनें',
            chooseLanguageSubtitle: 'जारी रखने के लिए अपनी पसंदीदा भाषा चुनें',
        
            // Scheme
            schemeFinderTitle: 'सरकारी योजना खोजक',
            schemeFinderSubtitle: 'उन कल्याण योजनाओं का पता लगाएं जिनके लिए आप पात्र हैं',
            checkEligibilityTitle: 'पात्रता जांचें',
            checkEligibilitySubtitle: 'सरकारी योजनाओं का पता लगाने के लिए अपने विवरण भरें।',
            ageLabel: 'उम्र',
            stateLabel: 'राज्य',
            categoryLabel: 'श्रेणी',
            selectCategoryPlaceholder: 'श्रेणी चुनें',
            categoryGeneral: 'सामान्य',
            categoryOBC: 'OBC',
            categorySC: 'SC',
            categoryST: 'ST',
            annualIncomeLabel: 'वार्षिक आय (₹)',
            occupationLabel: 'व्यवसाय',
            statePlaceholder: 'उदा. महाराष्ट्र',
            occupationPlaceholder: 'उदा. किसान, छात्र, व्यवसाय',
            discoverSchemesBtn: 'योजनाएँ खोजें',
        
            // Complaint
            complaintStep2Title: 'चरण 2: शिकायत विवरण',
            oppositePartyNameLabel: 'विपरीत पार्टी का नाम',
            oppositePartyNamePlaceholder: 'आप किसके खिलाफ शिकायत कर रहे हैं?',
            oppositePartyAddressLabel: 'विपरीत पार्टी का पता',
            oppositePartyAddressPlaceholder: 'विपरीत पार्टी का पता',
            factsOfCaseLabel: 'मामले के तथ्य',
            factsOfCasePlaceholder: 'विवरण में बताएं कि क्या हुआ...',
            backBtn: 'पीछे',
            nextStepBtn: 'अगला चरण',
        
            // Locator additional
            nearestCentersTitle: 'निकटतम कानूनी सहायता केंद्र',
            locatorAddressLabel: 'पता',
            locatorPhoneLabel: 'फोन',
            getDirectionsBtn: 'मार्ग प्राप्त करें',
    }
};
