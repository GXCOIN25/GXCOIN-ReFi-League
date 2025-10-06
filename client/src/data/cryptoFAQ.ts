export interface FAQItem {
  question: string;
  answer: string;
  category: 'basics' | 'wallet' | 'nft' | 'security' | 'trading';
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
}

export const cryptoFAQs: FAQItem[] = [
  {
    question: "What is a wallet?",
    answer: "A crypto wallet is like a digital bank account that stores your cryptocurrencies and NFTs. Unlike a traditional bank account, you have complete control over it - no bank can freeze it or access your funds. It consists of a public address (like an account number you can share) and a private key (like a password you must never share). Your wallet lets you send, receive, and store digital assets securely.",
    category: "wallet"
  },
  {
    question: "What is MetaMask?",
    answer: "MetaMask is one of the most popular crypto wallets in the world, used by millions of people. It's a browser extension and mobile app that acts as your gateway to Web3. Think of it as your digital identity and wallet combined - it stores your crypto, lets you interact with blockchain apps (like GXCOIN), and keeps everything secure with encryption. MetaMask is free to use and puts you in full control of your digital assets.",
    category: "wallet"
  },
  {
    question: "What is an NFT?",
    answer: "NFT stands for Non-Fungible Token, which is a unique digital item that you truly own. Unlike regular cryptocurrencies where every coin is identical, each NFT is one-of-a-kind with its own unique identifier on the blockchain. Think of it like owning an original painting versus a copy - the blockchain proves you own the original. NFTs can be art, collectibles, game items, or in our case, dynamic heroes that evolve based on real-world environmental impact!",
    category: "nft"
  },
  {
    question: "What is a dNFT (Dynamic NFT)?",
    answer: "A dNFT (Dynamic NFT) is a special type of NFT that can change and evolve over time. While regular NFTs stay the same forever, dNFTs update based on real-world data or conditions. In GXCOIN, your hero NFTs are dynamic - they level up, change appearance, and gain new abilities as you make environmental contributions. It's like having a living, breathing digital character that grows with your real-world impact!",
    category: "nft"
  },
  {
    question: "Why do NFTs cost money?",
    answer: "NFTs cost money for several reasons: (1) Creating or 'minting' an NFT requires computing power on the blockchain, which costs gas fees, (2) The NFT itself has value because it's unique and limited in supply - just like rare trading cards or collectibles, (3) Artists and creators put time and effort into creating them, and (4) In GXCOIN's case, purchasing an NFT also contributes to real environmental projects. You're not just buying a digital image - you're buying ownership, supporting creators, and making real-world impact.",
    category: "nft"
  },
  {
    question: "What are gas fees?",
    answer: "Gas fees are small payments you make to the blockchain network to process your transactions. Think of them like shipping fees for sending a package - you pay a little extra to have miners (powerful computers) verify and record your transaction on the blockchain. Gas fees vary based on network demand: higher demand = higher fees. They're paid in cryptocurrency (usually ETH) and go to the miners, not to GXCOIN. We're constantly working to minimize these fees for you.",
    category: "basics"
  },
  {
    question: "Is my money safe?",
    answer: "Your funds are very safe when you follow security best practices! Crypto wallets use military-grade encryption, and the blockchain itself is extremely secure. However, YOU are responsible for protecting your private key and seed phrase - if someone gets those, they can access your funds. Never share your seed phrase, use strong passwords, enable 2-factor authentication where possible, and be cautious of phishing scams. As long as you keep your private information private, your assets are secure.",
    category: "security"
  },
  {
    question: "What if I lose my seed phrase?",
    answer: "If you lose your seed phrase (also called recovery phrase or secret phrase), there's NO WAY to recover your wallet - not even we or MetaMask can help you. It's permanently lost. That's why it's absolutely critical to write it down on paper (never digitally!) and store it in multiple secure locations. Treat it like gold - because it essentially is. Many people use fireproof safes, safety deposit boxes, or even metal backup plates designed specifically for seed phrases.",
    category: "security"
  },
  {
    question: "Can I sell my NFT later?",
    answer: "Absolutely! One of the great things about NFTs is that you truly own them and can sell them anytime on NFT marketplaces like OpenSea, Rarible, or our future GXCOIN marketplace. The value of your NFT can go up or down based on demand, rarity, and in our case, how much you've leveled it up through environmental contributions. Some GXCOIN heroes become more valuable as they evolve, creating potential profit opportunities while you're making positive impact!",
    category: "trading"
  },
  {
    question: "How do I get started with crypto if I have nothing?",
    answer: "Getting started is easier than you think! First, install MetaMask (it's free). Then you have several options to fund your wallet: (1) Buy crypto directly with a credit/debit card through MetaMask or exchanges like Coinbase, (2) Use Stripe Onramp for a seamless fiat-to-crypto experience, or (3) Have a friend send you some crypto to your wallet address. You only need a small amount to start - often just $10-20 is enough to mint your first NFT and cover gas fees. We'll guide you through the entire process!",
    category: "basics"
  },
  {
    question: "What is Web3?",
    answer: "Web3 is the next evolution of the internet. Web 1.0 was read-only (like early websites), Web 2.0 is read-write (social media, apps), and Web3 is read-write-own. In Web3, you truly own your data, digital assets, and online identity. Instead of big companies controlling everything, Web3 uses blockchain technology to give power back to users. With GXCOIN, you're part of this revolution - owning your heroes, controlling your contributions, and directly impacting environmental change!",
    category: "basics"
  },
  {
    question: "How do NFTs help the environment?",
    answer: "GXCOIN NFTs are special because they're directly tied to real environmental action. When you purchase an NFT, a portion of the proceeds goes to verified environmental projects like reforestation, ocean cleanup, and renewable energy. As you make additional contributions, your NFT evolves and becomes more powerful - creating a gamified experience where doing good makes your digital assets more valuable. It's a revolutionary model where your NFT ownership drives real-world impact!",
    category: "nft"
  },
  {
    question: "Do I need to be tech-savvy to use crypto?",
    answer: "Not at all! While crypto can seem complicated, modern wallets like MetaMask have made it incredibly user-friendly. If you can use a banking app, you can use crypto. We've designed GXCOIN to be beginner-friendly with step-by-step guides, tooltips explaining every term, and support to help you along the way. Millions of regular people (not just tech experts) use crypto every day. Start small, learn as you go, and you'll be comfortable in no time!",
    category: "basics"
  }
];

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Blockchain",
    definition: "A digital ledger that records transactions across many computers in a way that makes it impossible to change past records. Think of it as a shared, unchangeable record book that everyone can see but no one can erase.",
    example: "When you buy an NFT, the blockchain records that you now own it - this record is permanent and visible to everyone."
  },
  {
    term: "Wallet",
    definition: "A digital tool that stores your cryptocurrencies and NFTs. It has a public address (like your email) that others can send to, and a private key (like a password) that only you should know.",
    example: "MetaMask is a wallet - it holds your ETH and NFTs securely."
  },
  {
    term: "Seed Phrase",
    definition: "A series of 12-24 words that acts as a master key to your wallet. Anyone with this phrase can access all your funds, so never share it and store it very securely.",
    example: "Example seed phrase: 'witch collapse practice feed shame open despair creek road again ice least'"
  },
  {
    term: "Gas Fee",
    definition: "A small fee paid in cryptocurrency to process transactions on the blockchain. It's like a processing fee that goes to miners who verify your transaction.",
    example: "Sending ETH or minting an NFT might cost $2-20 in gas fees depending on network traffic."
  },
  {
    term: "NFT",
    definition: "Non-Fungible Token - a unique digital asset that you own, verified on the blockchain. Unlike money where every dollar is the same, each NFT is one-of-a-kind.",
    example: "Your GXCOIN hero is an NFT - it's unique to you and can't be duplicated."
  },
  {
    term: "dNFT",
    definition: "Dynamic NFT - an NFT that can change over time based on certain conditions or data. Unlike static NFTs that never change, dNFTs evolve.",
    example: "Your GXCOIN hero levels up and changes appearance as you contribute to environmental causes - that's a dNFT!"
  },
  {
    term: "Minting",
    definition: "The process of creating a new NFT on the blockchain. When you 'mint' an NFT, you're creating a unique token that's recorded as yours on the blockchain.",
    example: "When you buy your first GXCOIN hero, you're minting it - creating a new, unique NFT that belongs to you."
  },
  {
    term: "Smart Contract",
    definition: "Self-executing code on the blockchain that automatically carries out agreements. It's like a vending machine - put money in, get product out, all automatic.",
    example: "GXCOIN uses smart contracts to automatically level up your hero when you make environmental contributions."
  },
  {
    term: "Web3",
    definition: "The next generation of the internet where users own their data and digital assets through blockchain technology. Unlike Web2 (Facebook, Google) where companies own everything.",
    example: "In Web3, you own your GXCOIN heroes - no company can take them away or shut them down."
  },
  {
    term: "Ethereum (ETH)",
    definition: "The second-largest cryptocurrency and the blockchain platform where most NFTs live. ETH is used to pay for gas fees and purchase NFTs.",
    example: "You might need 0.05 ETH (about $150) to buy a GXCOIN hero and cover gas fees."
  },
  {
    term: "Cryptocurrency",
    definition: "Digital money that uses cryptography for security and operates on blockchain technology. Unlike traditional money, no government or bank controls it.",
    example: "Bitcoin and Ethereum are cryptocurrencies - you can use ETH to buy NFTs on GXCOIN."
  },
  {
    term: "Private Key",
    definition: "A secret code that proves you own your wallet and gives you access to your funds. If someone gets your private key, they can steal everything.",
    example: "Your private key is like the key to a vault - guard it with your life and never share it."
  },
  {
    term: "Public Address",
    definition: "Your wallet's public identifier - like an email address or bank account number. You can share this with others so they can send you crypto or NFTs.",
    example: "Your public address might look like: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  },
  {
    term: "Metamask",
    definition: "A popular crypto wallet that works as a browser extension and mobile app. It's your gateway to Web3 apps and stores your crypto and NFTs.",
    example: "Install MetaMask to access GXCOIN and manage your hero NFTs."
  },
  {
    term: "ReFi (Regenerative Finance)",
    definition: "A movement that uses crypto and blockchain technology to fund environmental and social good. Instead of just making money, ReFi aims to heal the planet.",
    example: "GXCOIN is a ReFi project - your NFT purchases fund real environmental restoration projects."
  },
  {
    term: "Fiat",
    definition: "Traditional government-issued money like US Dollars, Euros, or Yen. It's called 'fiat' in crypto circles to distinguish it from cryptocurrency.",
    example: "You can buy crypto with fiat currency using your credit card or bank transfer."
  },
  {
    term: "On-ramp",
    definition: "A service that lets you convert fiat money (like USD) into cryptocurrency. It's called an 'on-ramp' because it helps you get onto the crypto highway.",
    example: "Stripe Onramp lets you buy ETH with your credit card - that's a fiat on-ramp."
  },
  {
    term: "Token",
    definition: "A digital asset built on a blockchain. NFTs are tokens, cryptocurrencies are tokens - basically any digital asset you can own on the blockchain.",
    example: "Your GXCOIN hero is a token, and so is the ETH you use to buy it - just different types of tokens."
  }
];

export const securityBestPractices = [
  {
    id: 'seed-phrase',
    title: "Never share your seed phrase",
    description: "Your seed phrase is like the master key to all your funds. No legitimate service will EVER ask for it - not MetaMask, not GXCOIN, not support staff. Anyone asking for it is trying to scam you.",
    importance: "critical"
  },
  {
    id: 'verify-urls',
    title: "Always verify URLs before connecting",
    description: "Phishing sites copy real websites to steal your information. Always double-check the URL - look for the lock icon, verify the domain is correct (app.gxcoin.io), and bookmark legitimate sites.",
    importance: "critical"
  },
  {
    id: 'hardware-wallet',
    title: "Use hardware wallet for large amounts",
    description: "If you have significant crypto holdings, consider a hardware wallet like Ledger or Trezor. These physical devices keep your private keys offline, making them nearly impossible to hack.",
    importance: "high"
  },
  {
    id: 'two-factor',
    title: "Enable 2FA where possible",
    description: "Two-factor authentication adds an extra security layer. Use authenticator apps (like Google Authenticator) rather than SMS when possible, as SMS can be intercepted.",
    importance: "high"
  },
  {
    id: 'dm-scams',
    title: "Don't trust DMs asking for keys or phrases",
    description: "Scammers often impersonate support staff in Discord, Telegram, or Twitter DMs. Real support will NEVER DM you first or ask for your seed phrase, private keys, or wallet passwords.",
    importance: "critical"
  },
  {
    id: 'multiple-backups',
    title: "Store seed phrase in multiple secure locations",
    description: "Write your seed phrase on paper (or use a metal backup) and store copies in different secure locations like a safe, safety deposit box, or with a trusted family member.",
    importance: "high"
  },
  {
    id: 'transaction-review',
    title: "Always review transaction details before confirming",
    description: "Before approving any transaction in MetaMask, carefully check: the recipient address, the amount being sent, and the gas fees. Blockchain transactions are irreversible.",
    importance: "high"
  },
  {
    id: 'software-updates',
    title: "Keep your wallet software updated",
    description: "Regularly update MetaMask and your browser to get the latest security patches. Enable automatic updates when available.",
    importance: "medium"
  },
  {
    id: 'revoke-permissions',
    title: "Revoke permissions for unused dApps",
    description: "When you connect your wallet to dApps, you grant them permissions. Regularly review and revoke access for apps you no longer use at revoke.cash or similar services.",
    importance: "medium"
  },
  {
    id: 'test-transactions',
    title: "Test with small amounts first",
    description: "When trying something new (new wallet, new exchange, new NFT marketplace), always send a small test amount first to make sure everything works correctly.",
    importance: "medium"
  }
];

export const securityDosAndDonts = {
  dos: [
    {
      title: "Write seed phrase on paper",
      description: "Physical backups are safer than digital ones",
      icon: "check"
    },
    {
      title: "Use strong, unique passwords",
      description: "Different password for every crypto service",
      icon: "check"
    },
    {
      title: "Verify all URLs and addresses",
      description: "One wrong character can mean losing funds",
      icon: "check"
    },
    {
      title: "Keep wallet software updated",
      description: "Get latest security patches immediately",
      icon: "check"
    },
    {
      title: "Use reputable exchanges & wallets",
      description: "Stick to well-known, audited services",
      icon: "check"
    }
  ],
  donts: [
    {
      title: "Never screenshot your seed phrase",
      description: "Screenshots can be backed up to cloud, hacked, or stolen",
      icon: "x"
    },
    {
      title: "Don't click random links",
      description: "Phishing links look real but steal your info",
      icon: "x"
    },
    {
      title: "Don't share private keys/seed phrase",
      description: "Not with support, not with friends, not with anyone",
      icon: "x"
    },
    {
      title: "Don't trust 'too good to be true' offers",
      description: "Free airdrops asking for seed phrases are scams",
      icon: "x"
    },
    {
      title: "Don't connect to unknown WiFi",
      description: "Public WiFi can be used to intercept crypto transactions",
      icon: "x"
    }
  ]
};
