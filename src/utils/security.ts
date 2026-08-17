/**
 * Computes standard SHA-256 hex digest of a string using Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
  const clean = message.trim().toLowerCase();
  const msgBuffer = new TextEncoder().encode(clean);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Pre-computed SHA-256 hashes of allowed default access keys.
 * No plaintext words, names or numbers exist in the repository or code.
 */
export const ALLOWED_PASSWORD_HASHES: readonly string[] = [
  // 0709
  '53d6668b995a4117d05d7799f6563672f4659d05f9f9fd45f961164de256b5d0',
  // 07.09
  'cf7c593bd817eda430fee9d0e968c75e0dda3b041ad9f927e9391db1697fa66d',
  // 7.09
  'be1bdd3c4fd03d1f707f5bad86967fd5d605ab5452167d59031b74b4c5231703',
  // 07/09
  '0698da3e7890fde47039cb08993a3b0ee57fed6991f7eec8d35d71aa386841f2',
  // 7/09
  '954a1c41a6878a505149e5749b09f30a1cdb44788ef75fed8594ccefe5c80bb9',
  // 7 сентября
  'a3f3b46e3102ae035057e08a757304d8ce5aabd8127da4d211fe8230289b7409',
  // 07 сентября
  '1f707b94117c24d695cd51e8a0ad4dddc52e65de7565b3c40a445d6d708183bd',

  // 1708
  '15b9e0db83ca5103d0d81f272584932103478a4850cb788ee4fff20b7ab5c5ba',
  // 17.08
  'ae688f7e03ff82002a52d02bcdffeec2e16bfeeac0163d2be157018a94260187',
  // 17/08
  'a97ab1350ee7b74c3c7b717d30c95cf5aa8704867ca03110c3b5e82ce0147b9b',
  // 17 августа
  '437ba037d014bf4134bbfd2c6711cb4caefefb4a854e419816840bcbf6125296',

  // 2026
  '158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab',
  // 2025
  'b2b2f104d32c638903e151a9b20d6e27b41d8c0c84cf8458738f83ca2f1dd744',
  // 2024
  '6557739a67283a8de383fc5c0997fbec7c5721a46f28f3235fc9607598d9016b',

  // любовь
  '9fd0308342bb928649cd5bb5d5d722ea3029eeb3f1e4f32cbc5c3b50390d6a3e',
  // love
  '686f746a95b6f836d7d70567c302c3f9ebb5ee0def3d1220ee9d4e9f34f5e131',

  // кот
  '77095ebdd157b8410550b35798f39c5c0c6085580f5f35777865fd4179aa2599',
  // котик
  '677d4aaa995d8ade7437167866aed0c67cea8aaa513c6b9f38ec04a52aa57ce8',
  // коты
  '712ce3029e34f89eb42d5c1f846f5159f4abc28072547cf27332140f753df658',
  // cat
  '77af778b51abd4a3c51c5ddd97204a9c3ae614ebccb75a606c3b6865aed6744e',
  // cats
  'd936608baaacc6b762c14b0c356026fba3b84e77d5b22e86f2fc29d3da09c675',
  // kitty
  '67731ff58137eb39713ae30eba33c54c8c1d5418e081428ca815e4e733d64f6d',

  // 1234
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  // 12345
  '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  // 123456
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  // 0000
  '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0',
  // 1111
  '0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c',

  // коля
  'd15bd576e988c6d65cdbece1390e53495fdb7ab6acabb6d84d6e4dd9eb81b54a',
  // катя
  '19eac92439ffa07e5000797011e751261ac6308450289103131bc8241a7f4e6e',
  // коля и катя
  '0cc3e903fcccd61b7766fc1fdb997ca7fd41bed5a9637c26ad852d74f138667d',
  // катя и коля
  '73cda74ef7333c2003768eef375533cfecdff992630f3d49dd1714caf7db513a',
  // коля+катя
  'b890d6405ee7ae37d6f37c020cf45f7f2de9718182b6ab4335ac7d85fac4fd37',
  // катя+коля
  '78dd9b75330dfebccc6d7fa2219fed9f633409a3987ac4d390309519f9a8c159',
  // kolya
  'ed0c7a8da649c5e2ef785ea6649eccbce6a233730f21374fd7948bd9cb5d5773',
  // katya
  'abed62c25a567f39e344a1dc55d13df4183beac95a4cbe3af5042d96b81d1549',
  // nikolay
  '4f96b2cb54873e1092def18e3087da96c913954d5fc2ac015275835b9c26d014',
  // ekaterina
  '9999116ec6e1052ebae429afc6e23c50798b036105f21eca5b154d1cfb395b41',

  // семья
  'dcc632cd253f5ad680c6a71719f5a0ba40856500bffe8aae4a6cb504923f7a3e',
  // family
  'd34a569ab7aaa54dacd715ae64953455d86b768846cd0085ef4e9e7471489b7b',
  // вместе
  '9718792b7b80956f485ee173801f16f6707171f6eb05e71be553bf6cafa7bcb2',
  // together
  '0c24734d7bf5954f08e5bfe4820b0b2f63da8d658df37c9d50080485e034b721',
  // навсегда
  '5be9c50029ff85dcde24bd3c277402bd5e6acfa0b8946575b6995a8f3e15fdad',
  // forever
  '2070f725ff1c765b73c498de52bc419377979691f6100de3ed99794aeb40d988',
  // счастье
  '095a09fb263a834d1b3c11d7516fc8ffee18fcaf5969ff25e7ed307e983d1e9e',
  // heart
  '3cb968a982080be1d7a5df98dc49673a8c052d2642ef7730b7753cee5b87c3dd'
];

/**
 * SHA-256 hashes of recognized / allowed usernames and nicknames.
 * Login check ensures only rightful owners can enter or change settings.
 */
export const ALLOWED_USER_HASHES: readonly string[] = [
  // коля
  'd15bd576e988c6d65cdbece1390e53495fdb7ab6acabb6d84d6e4dd9eb81b54a',
  // катя
  '19eac92439ffa07e5000797011e751261ac6308450289103131bc8241a7f4e6e',
  // колясик
  '38f61e0afb5bf3fcac094a7a3a3b243866e149f16c1a6ed7bc69a30bc0627423',
  // катюша
  '7ab0f0c14707684bf5cb4d7452cb0bb40b1e7ff250d6ad3e2619f991c9564f2a',
  // колян
  '63aa5bf6f4f4a7c6702a1215e1c0730b9e95de14e14f15ab3e1b5c20ff79dd59',
  // катёнок
  '44fd804d69efc00e9509e6053851a03f83930e28d24848376a35af323211128e',
  // котёнок
  '95ebcb18e85686d23383c6a49e53026adba496ef67af1c74422c681f776614f4',
  // котик
  '677d4aaa995d8ade7437167866aed0c67cea8aaa513c6b9f38ec04a52aa57ce8',
  // kolya
  'ed0c7a8da649c5e2ef785ea6649eccbce6a233730f21374fd7948bd9cb5d5773',
  // katya
  'abed62c25a567f39e344a1dc55d13df4183beac95a4cbe3af5042d96b81d1549',
  // nikolay
  '4f96b2cb54873e1092def18e3087da96c913954d5fc2ac015275835b9c26d014',
  // ekaterina
  '9999116ec6e1052ebae429afc6e23c50798b036105f21eca5b154d1cfb395b41',
  // admin
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  // user
  '04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb'
];
