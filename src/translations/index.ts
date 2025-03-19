/**
 * Translation system for the application
 * Contains all text strings organized by language
 */

import { Language } from '@/utils/i18n'

// Define the structure of our translations
type TranslationKeys = {
  common: {
    login: string
    logout: string
    back: string
    loading: string
    error: string
    success: string
  }
  home: {
    title: string
    sendEth: string
    transactionSuccess: string
    transactionFailed: string
    notConnected: string
    insufficientBalance: string
  }
  chat: {
    title: string
    welcomeMessage: string
    inputPlaceholder: string
    sendButton: string
    errorMessage: string
    rateLimitMessage: string
  }
  navigation: {
    newPage: string
    walletGenerator: string
  }
  newPage: {
    title: string
    subtitle: string
    accountInfo: string
    connectedAddress: string
    balance: string
    connectWallet: string
    lastTransaction: string
    backHome: string
  }
  aeve: {
    title: string
    subtitle: string
    namePlaceholder: string
    nameLabel: string
    ageLabel: string
    ageRanges: {
      select: string
      range1: string
      range2: string
      range3: string
      range4: string
      range5: string
    }
    languageLabel: string
    languages: {
      english: string
      french: string
      spanish: string
      chinese: string
    }
    personalReasonsLabel: string
    personalReasonsPlaceholder: string
    resumeLabel: string
    chooseFile: string
    resumeUploaded: string
    supportedFormats: string
    jobDescriptionLabel: string
    jobDescriptionPlaceholder: string
    generateButton: string
    generatingText: string
    resultTitle: string
    copyButton: string
    copiedToClipboard: string
    errors: {
      missingInfo: string
      provideJobDescription: string
      fileProcessingError: string
      convertError: string
      unsupportedFile: string
      unsupportedFormat: string
      apiError: string
      generateError: string
    }
  }
}

// Define translations for each supported language
type Translations = {
  [key in Language]: TranslationKeys
}

export const translations: Translations = {
  // English
  en: {
    common: {
      login: 'Login',
      logout: 'Logout',
      back: 'Back',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    home: {
      title: 'Hello world!',
      sendEth: 'Send 0.0001 ETH to self',
      transactionSuccess: 'Transaction successful',
      transactionFailed: 'Transaction failed',
      notConnected: 'Please connect your wallet',
      insufficientBalance: 'Please connect with an account that has a bit of ETH',
    },
    chat: {
      title: 'Chat with Assistant',
      welcomeMessage:
        "Hello! I'm Francesca, Julien's faithful assistant. What do you need to know about him?",
      inputPlaceholder: 'Can Julien help me build an app or API?',
      sendButton: 'Send',
      errorMessage:
        'Sorry, there was an error processing your request. Please try again a bit later.',
      rateLimitMessage: 'Sorry, you reached the limit. Please come back in one hour.',
    },
    navigation: {
      newPage: 'New page',
      walletGenerator: 'Wallet generator',
    },
    newPage: {
      title: 'Welcome to New Page',
      subtitle: 'Unleash your imagination in this new page!',
      accountInfo: 'Account Information',
      connectedAddress: 'Connected Address:',
      balance: 'Balance:',
      connectWallet: 'Connect your wallet to get started',
      lastTransaction: 'Last Transaction:',
      backHome: 'Back Home',
    },
    aeve: {
      title: 'AI Cover Letter Generator',
      subtitle:
        'Generate a personalized cover letter based on your resume and the job description.',
      namePlaceholder: 'John Doe',
      nameLabel: 'Your Name (Optional)',
      ageLabel: 'Your Age (Optional)',
      ageRanges: {
        select: 'Select age range',
        range1: '18-24',
        range2: '25-34',
        range3: '35-44',
        range4: '45-54',
        range5: '55+',
      },
      languageLabel: 'Preferred Language',
      languages: {
        english: 'English',
        french: 'French',
        spanish: 'Spanish',
        chinese: 'Chinese',
      },
      personalReasonsLabel:
        'Using your own words, what are the REAL reasons you want to work there? (optional)',
      personalReasonsPlaceholder: "I'm excited about this company because...",
      resumeLabel: 'Upload Resume (Optional)',
      chooseFile: 'Choose File',
      resumeUploaded: 'Resume uploaded ✓',
      supportedFormats: 'Supported formats: PDF, TXT, MD (PDF files will be converted to text)',
      jobDescriptionLabel: 'Job Description',
      jobDescriptionPlaceholder: 'Paste the job description here...',
      generateButton: 'Generate Cover Letter',
      generatingText: 'Generating...',
      resultTitle: 'Your Cover Letter',
      copyButton: 'Copy to Clipboard',
      copiedToClipboard: 'Copied to clipboard',
      errors: {
        missingInfo: 'Missing information',
        provideJobDescription: 'Please provide the job description',
        fileProcessingError: 'File Processing Error',
        convertError: 'Could not convert the PDF. Please try a text format instead.',
        unsupportedFile: 'Unsupported File',
        unsupportedFormat: 'Please upload a PDF, TXT, or MD file.',
        apiError: 'Error',
        generateError: 'Failed to generate cover letter',
      },
    },
  },

  // Mandarin Chinese
  zh: {
    common: {
      login: '登录',
      logout: '登出',
      back: '返回',
      loading: '加载中...',
      error: '错误',
      success: '成功',
    },
    home: {
      title: '你好，世界！',
      sendEth: '向自己发送 0.0001 ETH',
      transactionSuccess: '交易成功',
      transactionFailed: '交易失败',
      notConnected: '请连接您的钱包',
      insufficientBalance: '请使用拥有一些 ETH 的账户连接',
    },
    chat: {
      title: '与助手对话',
      welcomeMessage: '你好！我是Francesca，Julien的忠实助手。你想了解他的什么？',
      inputPlaceholder: 'Julien能帮我开发应用或API吗？',
      sendButton: '发送',
      errorMessage: '抱歉，处理您的请求时出错。请稍后再试。',
      rateLimitMessage: '抱歉，您已达到限制。请一小时后再来。',
    },
    navigation: {
      newPage: '新页面',
      walletGenerator: '钱包生成器',
    },
    newPage: {
      title: '欢迎来到新页面',
      subtitle: '在这个新页面释放你的想象力！',
      accountInfo: '账户信息',
      connectedAddress: '已连接地址：',
      balance: '余额：',
      connectWallet: '连接您的钱包以开始',
      lastTransaction: '最后交易：',
      backHome: '返回首页',
    },
    aeve: {
      title: 'AI 求职信生成器',
      subtitle: '根据您的简历和职位描述生成个性化求职信。',
      namePlaceholder: '张三',
      nameLabel: '您的姓名（可选）',
      ageLabel: '您的年龄（可选）',
      ageRanges: {
        select: '选择年龄范围',
        range1: '18-24',
        range2: '25-34',
        range3: '35-44',
        range4: '45-54',
        range5: '55+',
      },
      languageLabel: '首选语言',
      languages: {
        english: '英语',
        french: '法语',
        spanish: '西班牙语',
        chinese: '中文',
      },
      personalReasonsLabel: '用您自己的话，说说您想在那里工作的真正原因是什么？（可选）',
      personalReasonsPlaceholder: '我对这家公司感到兴奋是因为...',
      resumeLabel: '上传简历（可选）',
      chooseFile: '选择文件',
      resumeUploaded: '简历已上传 ✓',
      supportedFormats: '支持的格式：PDF、TXT、MD（PDF文件将被转换为文本）',
      jobDescriptionLabel: '职位描述',
      jobDescriptionPlaceholder: '在此粘贴职位描述...',
      generateButton: '生成求职信',
      generatingText: '生成中...',
      resultTitle: '您的求职信',
      copyButton: '复制到剪贴板',
      copiedToClipboard: '已复制到剪贴板',
      errors: {
        missingInfo: '缺少信息',
        provideJobDescription: '请提供职位描述',
        fileProcessingError: '文件处理错误',
        convertError: '无法转换PDF文件。请尝试文本格式。',
        unsupportedFile: '不支持的文件',
        unsupportedFormat: '请上传PDF、TXT或MD文件。',
        apiError: '错误',
        generateError: '生成求职信失败',
      },
    },
  },

  // Hindi
  hi: {
    common: {
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      back: 'पीछे',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
    },
    home: {
      title: 'नमस्ते दुनिया!',
      sendEth: 'स्वयं को 0.0001 ETH भेजें',
      transactionSuccess: 'लेन-देन सफल',
      transactionFailed: 'लेन-देन विफल',
      notConnected: 'कृपया अपना वॉलेट कनेक्ट करें',
      insufficientBalance: 'कृपया ऐसे खाते से कनेक्ट करें जिसमें थोड़ा ETH हो',
    },
    chat: {
      title: 'सहायक से चैट करें',
      welcomeMessage:
        'नमस्ते! मैं Francesca हूँ, Julien की विश्वसनीय सहायक। आप उनके बारे में क्या जानना चाहते हैं?',
      inputPlaceholder: 'क्या Julien मुझे ऐप या API बनाने में मदद कर सकते हैं?',
      sendButton: 'भेजें',
      errorMessage:
        'क्षमा करें, आपके अनुरोध को संसाधित करने में एक त्रुटि हुई। कृपया थोड़ी देर बाद फिर से प्रयास करें।',
      rateLimitMessage: 'क्षमा करें, आप सीमा तक पहुंच गए हैं। कृपया एक घंटे बाद वापस आएं।',
    },
    navigation: {
      newPage: 'नया पेज',
      walletGenerator: 'वॉलेट जनरेटर',
    },
    newPage: {
      title: 'नए पेज पर आपका स्वागत है',
      subtitle: 'इस नए पेज पर अपनी कल्पना को मुक्त करें!',
      accountInfo: 'खाता जानकारी',
      connectedAddress: 'कनेक्टेड पता:',
      balance: 'बैलेंस:',
      connectWallet: 'शुरू करने के लिए अपना वॉलेट कनेक्ट करें',
      lastTransaction: 'अंतिम लेनदेन:',
      backHome: 'होम पर वापस जाएं',
    },
    aeve: {
      title: 'AI Cover Letter Generator',
      subtitle:
        'Generate a personalized cover letter based on your resume and the job description.',
      namePlaceholder: 'John Doe',
      nameLabel: 'Your Name (Optional)',
      ageLabel: 'Your Age (Optional)',
      ageRanges: {
        select: 'Select age range',
        range1: '18-24',
        range2: '25-34',
        range3: '35-44',
        range4: '45-54',
        range5: '55+',
      },
      languageLabel: 'Preferred Language',
      languages: {
        english: 'English',
        french: 'French',
        spanish: 'Spanish',
        chinese: 'Chinese',
      },
      personalReasonsLabel:
        'Using your own words, what are the REAL reasons you want to work there? (optional)',
      personalReasonsPlaceholder: "I'm excited about this company because...",
      resumeLabel: 'Upload Resume (Optional)',
      chooseFile: 'Choose File',
      resumeUploaded: 'Resume uploaded ✓',
      supportedFormats: 'Supported formats: PDF, TXT, MD (PDF files will be converted to text)',
      jobDescriptionLabel: 'Job Description',
      jobDescriptionPlaceholder: 'Paste the job description here...',
      generateButton: 'Generate Cover Letter',
      generatingText: 'Generating...',
      resultTitle: 'Your Cover Letter',
      copyButton: 'Copy to Clipboard',
      copiedToClipboard: 'Copied to clipboard',
      errors: {
        missingInfo: 'Missing information',
        provideJobDescription: 'Please provide the job description',
        fileProcessingError: 'File Processing Error',
        convertError: 'Could not convert the PDF. Please try a text format instead.',
        unsupportedFile: 'Unsupported File',
        unsupportedFormat: 'Please upload a PDF, TXT, or MD file.',
        apiError: 'Error',
        generateError: 'Failed to generate cover letter',
      },
    },
  },

  // Spanish
  es: {
    common: {
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      back: 'Atrás',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    },
    home: {
      title: '¡Hola mundo!',
      sendEth: 'Enviar 0.0001 ETH a sí mismo',
      transactionSuccess: 'Transacción exitosa',
      transactionFailed: 'Transacción fallida',
      notConnected: 'Por favor conecte su billetera',
      insufficientBalance: 'Por favor conecte con una cuenta que tenga un poco de ETH',
    },
    chat: {
      title: 'Chatear con el asistente',
      welcomeMessage:
        '¡Hola! Soy Francesca, la fiel asistente de Julien. ¿Qué necesitas saber sobre él?',
      inputPlaceholder: '¿Puede Julien ayudarme a construir una aplicación o API?',
      sendButton: 'Enviar',
      errorMessage:
        'Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.',
      rateLimitMessage: 'Lo siento, has alcanzado el límite. Por favor, vuelve en una hora.',
    },
    navigation: {
      newPage: 'Nueva página',
      walletGenerator: 'Generador de billetera',
    },
    newPage: {
      title: 'Bienvenido a Nueva Página',
      subtitle: '¡Libera tu imaginación en esta nueva página!',
      accountInfo: 'Información de la cuenta',
      connectedAddress: 'Dirección conectada:',
      balance: 'Saldo:',
      connectWallet: 'Conecta tu billetera para comenzar',
      lastTransaction: 'Última transacción:',
      backHome: 'Volver a Inicio',
    },
    aeve: {
      title: 'Generador de Cartas de Presentación IA',
      subtitle:
        'Genera una carta de presentación personalizada basada en tu currículum y la descripción del trabajo.',
      namePlaceholder: 'Juan Pérez',
      nameLabel: 'Tu Nombre (Opcional)',
      ageLabel: 'Tu Edad (Opcional)',
      ageRanges: {
        select: 'Seleccionar rango de edad',
        range1: '18-24',
        range2: '25-34',
        range3: '35-44',
        range4: '45-54',
        range5: '55+',
      },
      languageLabel: 'Idioma Preferido',
      languages: {
        english: 'Inglés',
        french: 'Francés',
        spanish: 'Español',
        chinese: 'Chino',
      },
      personalReasonsLabel:
        'En tus propias palabras, ¿cuáles son las VERDADERAS razones por las que quieres trabajar allí? (opcional)',
      personalReasonsPlaceholder: 'Me entusiasma esta empresa porque...',
      resumeLabel: 'Subir Currículum (Opcional)',
      chooseFile: 'Elegir Archivo',
      resumeUploaded: 'Currículum subido ✓',
      supportedFormats:
        'Formatos admitidos: PDF, TXT, MD (los archivos PDF se convertirán a texto)',
      jobDescriptionLabel: 'Descripción del Trabajo',
      jobDescriptionPlaceholder: 'Pega la descripción del trabajo aquí...',
      generateButton: 'Generar Carta de Presentación',
      generatingText: 'Generando...',
      resultTitle: 'Tu Carta de Presentación',
      copyButton: 'Copiar al Portapapeles',
      copiedToClipboard: 'Copiado al portapapeles',
      errors: {
        missingInfo: 'Información faltante',
        provideJobDescription: 'Por favor proporciona la descripción del trabajo',
        fileProcessingError: 'Error al procesar el archivo',
        convertError: 'No se pudo convertir el PDF. Intenta con un formato de texto.',
        unsupportedFile: 'Archivo no compatible',
        unsupportedFormat: 'Por favor sube un archivo PDF, TXT o MD.',
        apiError: 'Error',
        generateError: 'Error al generar la carta de presentación',
      },
    },
  },

  // French
  fr: {
    common: {
      login: 'Connexion',
      logout: 'Déconnexion',
      back: 'Retour',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
    },
    home: {
      title: 'Salut tout le monde !',
      sendEth: 'Envoyer 0.0001 ETH à soi-même',
      transactionSuccess: 'Transaction réussie',
      transactionFailed: 'Échec de la transaction',
      notConnected: 'Veuillez connecter votre wallet',
      insufficientBalance: "Veuillez vous connecter avec un compte qui possède un peu d'ETH",
    },
    chat: {
      title: "Discuter avec l'assistant",
      welcomeMessage:
        'Bonjour ! Je suis Francesca, la fidèle assistante de Julien. Que souhaitiez-vous savoir ?',
      inputPlaceholder: "Julien peut-il m'aider à créer une application ou une API ?",
      sendButton: 'Envoyer',
      errorMessage:
        "Désolé, une erreur s'est produite lors du traitement de votre demande. Veuillez réessayer un peu plus tard.",
      rateLimitMessage: 'Désolé, vous avez atteint la limite. Veuillez revenir dans une heure.',
    },
    navigation: {
      newPage: 'Nouvelle page',
      walletGenerator: 'Générateur de wallet',
    },
    newPage: {
      title: 'Bienvenue sur la nouvelle page',
      subtitle: 'Libérez votre imagination sur cette nouvelle page !',
      accountInfo: 'Informations du compte',
      connectedAddress: 'Adresse connectée :',
      balance: 'Solde :',
      connectWallet: 'Connectez votre wallet pour commencer',
      lastTransaction: 'Dernière transaction :',
      backHome: "Retour à l'accueil",
    },
    aeve: {
      title: 'La machine à lettre de motivation',
      subtitle:
        'Éditez une lettre de motivation personnalisée basée sur votre CV et la description du poste.',
      namePlaceholder: 'Jean-Michel Motivé',
      nameLabel: 'Votre nom (facultatif)',
      ageLabel: 'Votre âge (facultatif)',
      ageRanges: {
        select: "Sélectionnez une tranche d'âge",
        range1: '18-24',
        range2: '25-34',
        range3: '35-44',
        range4: '45-54',
        range5: '55+',
      },
      languageLabel: 'Langue de lettre',
      languages: {
        english: 'Anglais',
        french: 'Français',
        spanish: 'Espagnol',
        chinese: 'Chinois',
      },
      personalReasonsLabel:
        'Avec vos mots à vous, quelles sont les VRAIES raisons pour lesquelles vous voulez travailler là-bas ? (facultatif)',
      personalReasonsPlaceholder:
        "Je suis enthousiaste à l'idée de rejoindre cette entreprise car...",
      resumeLabel: 'Télécharger un CV (Facultatif)',
      chooseFile: 'Choisir un Fichier',
      resumeUploaded: 'CV téléchargé ✓',
      supportedFormats:
        'Formats pris en charge : PDF, TXT, MD (les fichiers PDF seront convertis en texte)',
      jobDescriptionLabel: 'Description du Poste',
      jobDescriptionPlaceholder: 'Collez la description du poste ici...',
      generateButton: 'Éditer la lettre',
      generatingText: 'Édition en cours...',
      resultTitle: 'Votre lettre de motivation',
      copyButton: 'Copier dans le presse-papiers',
      copiedToClipboard: 'Copié dans le presse-papiers',
      errors: {
        missingInfo: 'Informations manquantes',
        provideJobDescription: 'Veuillez fournir la description du poste',
        fileProcessingError: 'Erreur de traitement de fichier',
        convertError: 'Impossible de convertir le PDF. Veuillez essayer un format texte.',
        unsupportedFile: 'Fichier non pris en charge',
        unsupportedFormat: 'Veuillez télécharger un fichier PDF, TXT ou MD.',
        apiError: 'Erreur',
        generateError: 'Échec de la génération de la lettre de motivation',
      },
    },
  },

  // Arabic
  ar: {
    common: {
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      back: 'رجوع',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
    },
    home: {
      title: 'مرحبا بالعالم!',
      sendEth: 'إرسال 0.0001 ETH لنفسك',
      transactionSuccess: 'تمت المعاملة بنجاح',
      transactionFailed: 'فشلت المعاملة',
      notConnected: 'يرجى توصيل محفظتك',
      insufficientBalance: 'يرجى الاتصال بحساب يحتوي على قليل من ETH',
    },
    chat: {
      title: 'الدردشة مع المساعد',
      welcomeMessage: 'مرحبًا! أنا فرانشيسكا، مساعدة جوليان المخلصة. ماذا تريد أن تعرف عنه؟',
      inputPlaceholder: 'هل يمكن لجوليان مساعدتي في بناء تطبيق أو واجهة برمجة تطبيقات؟',
      sendButton: 'إرسال',
      errorMessage: 'عذرًا، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا.',
      rateLimitMessage: 'عذرًا، لقد وصلت إلى الحد. يرجى العودة بعد ساعة واحدة.',
    },
    navigation: {
      newPage: 'صفحة جديدة',
      walletGenerator: 'منشئ المحفظة',
    },
    newPage: {
      title: 'مرحبًا بك في الصفحة الجديدة',
      subtitle: 'أطلق العنان لخيالك في هذه الصفحة الجديدة!',
      accountInfo: 'معلومات الحساب',
      connectedAddress: 'العنوان المتصل:',
      balance: 'الرصيد:',
      connectWallet: 'قم بتوصيل محفظتك للبدء',
      lastTransaction: 'آخر معاملة:',
      backHome: 'العودة إلى الصفحة الرئيسية',
    },
    aeve: {
      title: 'AI Cover Letter Generator',
      subtitle:
        'Generate a personalized cover letter based on your resume and the job description.',
      namePlaceholder: 'John Doe',
      nameLabel: 'Your Name (Optional)',
      ageLabel: 'Your Age (Optional)',
      ageRanges: {
        select: 'Select age range',
        range1: '18-24',
        range2: '25-34',
        range3: '35-44',
        range4: '45-54',
        range5: '55+',
      },
      languageLabel: 'Preferred Language',
      languages: {
        english: 'English',
        french: 'French',
        spanish: 'Spanish',
        chinese: 'Chinese',
      },
      personalReasonsLabel:
        'Using your own words, what are the REAL reasons you want to work there? (optional)',
      personalReasonsPlaceholder: "I'm excited about this company because...",
      resumeLabel: 'Upload Resume (Optional)',
      chooseFile: 'Choose File',
      resumeUploaded: 'Resume uploaded ✓',
      supportedFormats: 'Supported formats: PDF, TXT, MD (PDF files will be converted to text)',
      jobDescriptionLabel: 'Job Description',
      jobDescriptionPlaceholder: 'Paste the job description here...',
      generateButton: 'Generate Cover Letter',
      generatingText: 'Generating...',
      resultTitle: 'Your Cover Letter',
      copyButton: 'Copy to Clipboard',
      copiedToClipboard: 'Copied to clipboard',
      errors: {
        missingInfo: 'Missing information',
        provideJobDescription: 'Please provide the job description',
        fileProcessingError: 'File Processing Error',
        convertError: 'Could not convert the PDF. Please try a text format instead.',
        unsupportedFile: 'Unsupported File',
        unsupportedFormat: 'Please upload a PDF, TXT, or MD file.',
        apiError: 'Error',
        generateError: 'Failed to generate cover letter',
      },
    },
  },

  // Bengali
  bn: {
    common: {
      login: 'লগ ইন',
      logout: 'লগ আউট',
      back: 'পিছনে',
      loading: 'লোড হচ্ছে...',
      error: 'ত্রুটি',
      success: 'সফল',
    },
    home: {
      title: 'ওহে বিশ্ব!',
      sendEth: 'নিজেকে 0.0001 ETH পাঠান',
      transactionSuccess: 'লেনদেন সফল',
      transactionFailed: 'লেনদেন ব্যর্থ',
      notConnected: 'অনুগ্রহ করে আপনার ওয়ালেট সংযুক্ত করুন',
      insufficientBalance: 'অনুগ্রহ করে এমন একটি অ্যাকাউন্টের সাথে সংযোগ করুন যার কিছু ETH আছে',
    },
    chat: {
      title: 'সহকারীর সাথে চ্যাট করুন',
      welcomeMessage:
        'হ্যালো! আমি ফ্রান্চেস্কা, জুলিয়েনের বিশ্বস্ত সহকারী। আপনি তার সম্পর্কে কী জানতে চান?',
      inputPlaceholder: 'জুলিয়েন কি আমাকে অ্যাপ বা API তৈরি করতে সাহায্য করতে পারেন?',
      sendButton: 'পাঠান',
      errorMessage:
        'দুঃখিত, আপনার অনুরোধ প্রক্রিয়া করতে একটি ত্রুটি হয়েছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।',
      rateLimitMessage: 'দুঃখিত, আপনি সীমা পৌঁছে গেছেন। অনুগ্রহ করে এক ঘন্টা পরে আবার আসুন।',
    },
    navigation: {
      newPage: 'নতুন পৃষ্ঠা',
      walletGenerator: 'ওয়ালেট জেনারেটর',
    },
    newPage: {
      title: 'নতুন পৃষ্ঠায় স্বাগতম',
      subtitle: 'এই নতুন পৃষ্ঠায় আপনার কল্পনাকে মুক্ত করুন!',
      accountInfo: 'অ্যাকাউন্ট তথ্য',
      connectedAddress: 'সংযুক্ত ঠিকানা:',
      balance: 'ব্যালেন্স:',
      connectWallet: 'শুরু করতে আপনার ওয়ালেট সংযোগ করুন',
      lastTransaction: 'সর্বশেষ লেনদেন:',
      backHome: 'হোমে ফিরে যান',
    },
    aeve: {
      title: 'AI Cover Letter Generator',
      subtitle:
        'Generate a personalized cover letter based on your resume and the job description.',
      namePlaceholder: 'John Doe',
      nameLabel: 'Your Name (Optional)',
      ageLabel: 'Your Age (Optional)',
      ageRanges: {
        select: 'Select age range',
        range1: '18-24',
        range2: '25-34',
        range3: '35-44',
        range4: '45-54',
        range5: '55+',
      },
      languageLabel: 'Preferred Language',
      languages: {
        english: 'English',
        french: 'French',
        spanish: 'Spanish',
        chinese: 'Chinese',
      },
      personalReasonsLabel:
        'Using your own words, what are the REAL reasons you want to work there? (optional)',
      personalReasonsPlaceholder: "I'm excited about this company because...",
      resumeLabel: 'Upload Resume (Optional)',
      chooseFile: 'Choose File',
      resumeUploaded: 'Resume uploaded ✓',
      supportedFormats: 'Supported formats: PDF, TXT, MD (PDF files will be converted to text)',
      jobDescriptionLabel: 'Job Description',
      jobDescriptionPlaceholder: 'Paste the job description here...',
      generateButton: 'Generate Cover Letter',
      generatingText: 'Generating...',
      resultTitle: 'Your Cover Letter',
      copyButton: 'Copy to Clipboard',
      copiedToClipboard: 'Copied to clipboard',
      errors: {
        missingInfo: 'Missing information',
        provideJobDescription: 'Please provide the job description',
        fileProcessingError: 'File Processing Error',
        convertError: 'Could not convert the PDF. Please try a text format instead.',
        unsupportedFile: 'Unsupported File',
        unsupportedFormat: 'Please upload a PDF, TXT, or MD file.',
        apiError: 'Error',
        generateError: 'Failed to generate cover letter',
      },
    },
  },

  // Russian
  ru: {
    common: {
      login: 'Вход',
      logout: 'Выход',
      back: 'Назад',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успех',
    },
    home: {
      title: 'Привет, мир!',
      sendEth: 'Отправить 0.0001 ETH себе',
      transactionSuccess: 'Транзакция успешна',
      transactionFailed: 'Транзакция не удалась',
      notConnected: 'Пожалуйста, подключите ваш кошелек',
      insufficientBalance: 'Пожалуйста, подключитесь с аккаунтом, на котором есть немного ETH',
    },
    chat: {
      title: 'Чат с ассистентом',
      welcomeMessage: 'Привет! Я Франческа, верный помощник Жюльена. Что вы хотите узнать о нём?',
      inputPlaceholder: 'Может ли Жюльен помочь мне создать приложение или API?',
      sendButton: 'Отправить',
      errorMessage:
        'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.',
      rateLimitMessage: 'Извините, вы достигли лимита. Пожалуйста, вернитесь через час.',
    },
    navigation: {
      newPage: 'Новая страница',
      walletGenerator: 'Генератор кошельков',
    },
    newPage: {
      title: 'Добро пожаловать на новую страницу',
      subtitle: 'Раскройте свое воображение на этой новой странице!',
      accountInfo: 'Информация об аккаунте',
      connectedAddress: 'Подключенный адрес:',
      balance: 'Баланс:',
      connectWallet: 'Подключите ваш кошелек, чтобы начать',
      lastTransaction: 'Последняя транзакция:',
      backHome: 'Вернуться на главную',
    },
    aeve: {
      title: 'AI Cover Letter Generator',
      subtitle:
        'Generate a personalized cover letter based on your resume and the job description.',
      namePlaceholder: 'John Doe',
      nameLabel: 'Your Name (Optional)',
      ageLabel: 'Your Age (Optional)',
      ageRanges: {
        select: 'Select age range',
        range1: '18-24',
        range2: '25-34',
        range3: '35-44',
        range4: '45-54',
        range5: '55+',
      },
      languageLabel: 'Preferred Language',
      languages: {
        english: 'English',
        french: 'French',
        spanish: 'Spanish',
        chinese: 'Chinese',
      },
      personalReasonsLabel:
        'Using your own words, what are the REAL reasons you want to work there? (optional)',
      personalReasonsPlaceholder: "I'm excited about this company because...",
      resumeLabel: 'Upload Resume (Optional)',
      chooseFile: 'Choose File',
      resumeUploaded: 'Resume uploaded ✓',
      supportedFormats: 'Supported formats: PDF, TXT, MD (PDF files will be converted to text)',
      jobDescriptionLabel: 'Job Description',
      jobDescriptionPlaceholder: 'Paste the job description here...',
      generateButton: 'Generate Cover Letter',
      generatingText: 'Generating...',
      resultTitle: 'Your Cover Letter',
      copyButton: 'Copy to Clipboard',
      copiedToClipboard: 'Copied to clipboard',
      errors: {
        missingInfo: 'Missing information',
        provideJobDescription: 'Please provide the job description',
        fileProcessingError: 'File Processing Error',
        convertError: 'Could not convert the PDF. Please try a text format instead.',
        unsupportedFile: 'Unsupported File',
        unsupportedFormat: 'Please upload a PDF, TXT, or MD file.',
        apiError: 'Error',
        generateError: 'Failed to generate cover letter',
      },
    },
  },

  // Portuguese
  pt: {
    common: {
      login: 'Entrar',
      logout: 'Sair',
      back: 'Voltar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
    },
    home: {
      title: 'Olá, mundo!',
      sendEth: 'Enviar 0.0001 ETH para si mesmo',
      transactionSuccess: 'Transação bem-sucedida',
      transactionFailed: 'Falha na transação',
      notConnected: 'Por favor, conecte sua carteira',
      insufficientBalance: 'Por favor, conecte-se com uma conta que tenha um pouco de ETH',
    },
    chat: {
      title: 'Conversar com o assistente',
      welcomeMessage:
        'Olá! Sou Francesca, a assistente fiel do Julien. O que você precisa saber sobre ele?',
      inputPlaceholder: 'O Julien pode me ajudar a construir um aplicativo ou API?',
      sendButton: 'Enviar',
      errorMessage:
        'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
      rateLimitMessage: 'Desculpe, você atingiu o limite. Por favor, volte em uma hora.',
    },
    navigation: {
      newPage: 'Nova página',
      walletGenerator: 'Gerador de carteira',
    },
    newPage: {
      title: 'Bem-vindo à Nova Página',
      subtitle: 'Libere sua imaginação nesta nova página!',
      accountInfo: 'Informações da Conta',
      connectedAddress: 'Endereço conectado:',
      balance: 'Saldo:',
      connectWallet: 'Conecte sua carteira para começar',
      lastTransaction: 'Última transação:',
      backHome: 'Voltar para a Página Inicial',
    },
    aeve: {
      title: 'AI Cover Letter Generator',
      subtitle:
        'Generate a personalized cover letter based on your resume and the job description.',
      namePlaceholder: 'John Doe',
      nameLabel: 'Your Name (Optional)',
      ageLabel: 'Your Age (Optional)',
      ageRanges: {
        select: 'Select age range',
        range1: '18-24',
        range2: '25-34',
        range3: '35-44',
        range4: '45-54',
        range5: '55+',
      },
      languageLabel: 'Preferred Language',
      languages: {
        english: 'English',
        french: 'French',
        spanish: 'Spanish',
        chinese: 'Chinese',
      },
      personalReasonsLabel:
        'Using your own words, what are the REAL reasons you want to work there? (optional)',
      personalReasonsPlaceholder: "I'm excited about this company because...",
      resumeLabel: 'Upload Resume (Optional)',
      chooseFile: 'Choose File',
      resumeUploaded: 'Resume uploaded ✓',
      supportedFormats: 'Supported formats: PDF, TXT, MD (PDF files will be converted to text)',
      jobDescriptionLabel: 'Job Description',
      jobDescriptionPlaceholder: 'Paste the job description here...',
      generateButton: 'Generate Cover Letter',
      generatingText: 'Generating...',
      resultTitle: 'Your Cover Letter',
      copyButton: 'Copy to Clipboard',
      copiedToClipboard: 'Copied to clipboard',
      errors: {
        missingInfo: 'Missing information',
        provideJobDescription: 'Please provide the job description',
        fileProcessingError: 'File Processing Error',
        convertError: 'Could not convert the PDF. Please try a text format instead.',
        unsupportedFile: 'Unsupported File',
        unsupportedFormat: 'Please upload a PDF, TXT, or MD file.',
        apiError: 'Error',
        generateError: 'Failed to generate cover letter',
      },
    },
  },

  // Urdu
  ur: {
    common: {
      login: 'لاگ ان',
      logout: 'لاگ آؤٹ',
      back: 'واپس',
      loading: 'لوڈ ہو رہا ہے...',
      error: 'خرابی',
      success: 'کامیابی',
    },
    home: {
      title: 'ہیلو دنیا!',
      sendEth: 'خود کو 0.0001 ETH بھیجیں',
      transactionSuccess: 'لین دین کامیاب',
      transactionFailed: 'لین دین ناکام',
      notConnected: 'براہ کرم اپنا والیٹ منسلک کریں',
      insufficientBalance: 'براہ کرم ایسے اکاؤنٹ سے منسلک ہوں جس میں تھوڑا سا ETH ہو',
    },
    chat: {
      title: 'اسسٹنٹ سے چیٹ کریں',
      welcomeMessage:
        'ہیلو! میں فرانچیسکا ہوں، جولین کی وفادار اسسٹنٹ۔ آپ اس کے بارے میں کیا جاننا چاہتے ہیں؟',
      inputPlaceholder: 'کیا جولین مجھے ایپ یا API بنانے میں مدد کر سکتا ہے؟',
      sendButton: 'بھیجیں',
      errorMessage:
        'معذرت، آپ کی درخواست پر کارروائی کرتے ہوئے ایک خرابی پیش آئی۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔',
      rateLimitMessage: 'معذرت، آپ حد تک پہنچ گئے ہیں۔ براہ کرم ایک گھنٹے بعد واپس آئیں۔',
    },
    navigation: {
      newPage: 'نیا صفحہ',
      walletGenerator: 'والیٹ جنریٹر',
    },
    newPage: {
      title: 'نئے صفحے میں خوش آمدید',
      subtitle: 'اس نئے صفحے پر اپنے تخیل کو آزاد کریں!',
      accountInfo: 'اکاؤنٹ کی معلومات',
      connectedAddress: 'منسلک ایڈریس:',
      balance: 'بیلنس:',
      connectWallet: 'شروع کرنے کے لیے اپنا والیٹ منسلک کریں',
      lastTransaction: 'آخری لین دین:',
      backHome: 'ہوم پیج پر واپس جائیں',
    },
    aeve: {
      title: 'AI Cover Letter Generator',
      subtitle:
        'Generate a personalized cover letter based on your resume and the job description.',
      namePlaceholder: 'John Doe',
      nameLabel: 'Your Name (Optional)',
      ageLabel: 'Your Age (Optional)',
      ageRanges: {
        select: 'Select age range',
        range1: '18-24',
        range2: '25-34',
        range3: '35-44',
        range4: '45-54',
        range5: '55+',
      },
      languageLabel: 'Preferred Language',
      languages: {
        english: 'English',
        french: 'French',
        spanish: 'Spanish',
        chinese: 'Chinese',
      },
      personalReasonsLabel:
        'Using your own words, what are the REAL reasons you want to work there? (optional)',
      personalReasonsPlaceholder: "I'm excited about this company because...",
      resumeLabel: 'Upload Resume (Optional)',
      chooseFile: 'Choose File',
      resumeUploaded: 'Resume uploaded ✓',
      supportedFormats: 'Supported formats: PDF, TXT, MD (PDF files will be converted to text)',
      jobDescriptionLabel: 'Job Description',
      jobDescriptionPlaceholder: 'Paste the job description here...',
      generateButton: 'Generate Cover Letter',
      generatingText: 'Generating...',
      resultTitle: 'Your Cover Letter',
      copyButton: 'Copy to Clipboard',
      copiedToClipboard: 'Copied to clipboard',
      errors: {
        missingInfo: 'Missing information',
        provideJobDescription: 'Please provide the job description',
        fileProcessingError: 'File Processing Error',
        convertError: 'Could not convert the PDF. Please try a text format instead.',
        unsupportedFile: 'Unsupported File',
        unsupportedFormat: 'Please upload a PDF, TXT, or MD file.',
        apiError: 'Error',
        generateError: 'Failed to generate cover letter',
      },
    },
  },
}

/**
 * Get translations for the current language
 * @param language Current language code
 * @returns Translation object for the specified language
 */
export function getTranslations(language: Language) {
  return translations[language]
}

/**
 * Hook to use translations in components
 * @param language Current language code
 * @returns Translation object for the specified language
 */
export function useTranslations(language: Language) {
  return translations[language]
}
