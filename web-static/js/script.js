/** 
* Script file generated on Wed, 19 Feb 2014 16:20:11 +0000
**/


/** From file C:\workspace\sigWeb\web-static-src\0-utils\aes.js **/

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  AES implementation in JavaScript (c) Chris Veness 2005-2011                                   */
/*   - see http://csrc.nist.gov/publications/PubsFIPS.html#197                                    */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Aes = {};  // Aes namespace

/**
 * AES Cipher function: encrypt 'input' state with Rijndael algorithm
 *   applies Nr rounds (10/12/14) using key schedule w for 'add round key' stage
 *
 * @param {Number[]} input 16-byte (128-bit) input state array
 * @param {Number[][]} w   Key schedule as 2D byte-array (Nr+1 x Nb bytes)
 * @returns {array[]}     Encrypted output state array
 */
Aes.cipher = function(input, w) {    // main Cipher function [§5.1]
  var Nb = 4;               // block size (in words): no of columns in state (fixed at 4 for AES)
  var Nr = w.length/Nb - 1; // no of rounds: 10/12/14 for 128/192/256-bit keys

  var state = [[],[],[],[]];  // initialise 4xNb byte-array 'state' with input [§3.4]
  for (var i=0; i<4*Nb; i++) state[i%4][Math.floor(i/4)] = input[i];

  state = Aes.addRoundKey(state, w, 0, Nb);

  for (var round=1; round<Nr; round++) {
    state = Aes.subBytes(state, Nb);
    state = Aes.shiftRows(state, Nb);
    state = Aes.mixColumns(state, Nb);
    state = Aes.addRoundKey(state, w, round, Nb);
  }

  state = Aes.subBytes(state, Nb);
  state = Aes.shiftRows(state, Nb);
  state = Aes.addRoundKey(state, w, Nr, Nb);

  var output = new Array(4*Nb);  // convert state to 1-d array before returning [§3.4]
  for (var i=0; i<4*Nb; i++) output[i] = state[i%4][Math.floor(i/4)];
  return output;
};

/**
 * Perform Key Expansion to generate a Key Schedule
 *
 * @param {Number[]} key Key as 16/24/32-byte array
 * @returns {array[][]} Expanded key schedule as 2D byte-array (Nr+1 x Nb bytes)
 */
Aes.keyExpansion = function(key) {  // generate Key Schedule (byte-array Nr+1 x Nb) from Key [§5.2]
  var Nb = 4;            // block size (in words): no of columns in state (fixed at 4 for AES)
  var Nk = key.length/4;  // key length (in words): 4/6/8 for 128/192/256-bit keys
  var Nr = Nk + 6;       // no of rounds: 10/12/14 for 128/192/256-bit keys

  var w = new Array(Nb*(Nr+1));
  var temp = new Array(4);

  for (var i=0; i<Nk; i++) {
    var r = [key[4*i], key[4*i+1], key[4*i+2], key[4*i+3]];
    w[i] = r;
  }

  for (var i=Nk; i<(Nb*(Nr+1)); i++) {
    w[i] = new Array(4);
    for (var t=0; t<4; t++) temp[t] = w[i-1][t];
    if (i % Nk == 0) {
      temp = Aes.subWord(Aes.rotWord(temp));
      for (var t=0; t<4; t++) temp[t] ^= Aes.rCon[i/Nk][t];
    } else if (Nk > 6 && i%Nk == 4) {
      temp = Aes.subWord(temp);
    }
    for (var t=0; t<4; t++) w[i][t] = w[i-Nk][t] ^ temp[t];
  }

  return w;
};

/*
 * ---- remaining routines are private, not called externally ----
 */
 
Aes.subBytes = function(s, Nb) {    // apply SBox to state S [§5.1.1]
  for (var r=0; r<4; r++) {
    for (var c=0; c<Nb; c++) s[r][c] = Aes.sBox[s[r][c]];
  }
  return s;
};

Aes.shiftRows = function(s, Nb) {    // shift row r of state S left by r bytes [§5.1.2]
  var t = new Array(4);
  for (var r=1; r<4; r++) {
    for (var c=0; c<4; c++) t[c] = s[r][(c+r)%Nb];  // shift into temp copy
    for (var c=0; c<4; c++) s[r][c] = t[c];         // and copy back
  }          // note that this will work for Nb=4,5,6, but not 7,8 (always 4 for AES):
  return s;  // see asmaes.sourceforge.net/rijndael/rijndaelImplementation.pdf
};

Aes.mixColumns = function(s, Nb) {   // combine bytes of each col of state S [§5.1.3]
  for (var c=0; c<4; c++) {
    var a = new Array(4);  // 'a' is a copy of the current column from 's'
    var b = new Array(4);  // 'b' is a•{02} in GF(2^8)
    for (var i=0; i<4; i++) {
      a[i] = s[i][c];
      b[i] = s[i][c]&0x80 ? s[i][c]<<1 ^ 0x011b : s[i][c]<<1;

    }
    // a[n] ^ b[n] is a•{03} in GF(2^8)
    s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3]; // 2*a0 + 3*a1 + a2 + a3
    s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3]; // a0 * 2*a1 + 3*a2 + a3
    s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3]; // a0 + a1 + 2*a2 + 3*a3
    s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3]; // 3*a0 + a1 + a2 + 2*a3
  }
  return s;
};

Aes.addRoundKey = function(state, w, rnd, Nb) {  // xor Round Key into state S [§5.1.4]
  for (var r=0; r<4; r++) {
    for (var c=0; c<Nb; c++) state[r][c] ^= w[rnd*4+c][r];
  }
  return state;
};

Aes.subWord = function(w) {    // apply SBox to 4-byte word w
  for (var i=0; i<4; i++) w[i] = Aes.sBox[w[i]];
  return w;
};

Aes.rotWord = function(w) {    // rotate 4-byte word w left by one byte
  var tmp = w[0];
  for (var i=0; i<3; i++) w[i] = w[i+1];
  w[3] = tmp;
  return w;
};

// sBox is pre-computed multiplicative inverse in GF(2^8) used in subBytes and keyExpansion [§5.1.1]
Aes.sBox =  [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
             0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
             0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
             0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
             0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
             0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
             0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
             0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
             0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
             0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
             0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
             0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
             0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
             0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
             0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
             0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16];

// rCon is Round Constant used for the Key Expansion [1st col is 2^(r-1) in GF(2^8)] [§5.2]
Aes.rCon = [ [0x00, 0x00, 0x00, 0x00],
             [0x01, 0x00, 0x00, 0x00],
             [0x02, 0x00, 0x00, 0x00],
             [0x04, 0x00, 0x00, 0x00],
             [0x08, 0x00, 0x00, 0x00],
             [0x10, 0x00, 0x00, 0x00],
             [0x20, 0x00, 0x00, 0x00],
             [0x40, 0x00, 0x00, 0x00],
             [0x80, 0x00, 0x00, 0x00],
             [0x1b, 0x00, 0x00, 0x00],
             [0x36, 0x00, 0x00, 0x00] ]; 


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  AES Counter-mode implementation in JavaScript (c) Chris Veness 2005-2011                      */
/*   - see http://csrc.nist.gov/publications/nistpubs/800-38a/sp800-38a.pdf                       */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

Aes.Ctr = {};  // Aes.Ctr namespace: a subclass or extension of Aes

/** 
 * Encrypt a text using AES encryption in Counter mode of operation
 *
 * Unicode multi-byte character safe
 *
 * @param {String} plaintext Source text to be encrypted
 * @param {String} password  The password to use to generate a key
 * @param {Number} nBits     Number of bits to be used in the key (128, 192, or 256)
 * @returns {string}         Encrypted text
 */
Aes.Ctr.encrypt = function(plaintext, password, nBits) {
  var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
  if (!(nBits==128 || nBits==192 || nBits==256)) return '';  // standard allows 128/192/256 bit keys
  plaintext = Utf8.encode(plaintext);
  password = Utf8.encode(password);
  //var t = new Date();  // timer
	
  // use AES itself to encrypt password to get cipher key (using plain password as source for key 
  // expansion) - gives us well encrypted key (though hashed key might be preferred for prod'n use)
  var nBytes = nBits/8;  // no bytes in key (16/24/32)
  var pwBytes = new Array(nBytes);
  for (var i=0; i<nBytes; i++) {  // use 1st 16/24/32 chars of password for key
    pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
  }
  var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));  // gives us 16-byte key
  key = key.concat(key.slice(0, nBytes-16));  // expand key to 16/24/32 bytes long

  // initialise 1st 8 bytes of counter block with nonce (NIST SP800-38A §B.2): [0-1] = millisec, 
  // [2-3] = random, [4-7] = seconds, together giving full sub-millisec uniqueness up to Feb 2106
  var counterBlock = new Array(blockSize);
  
  var nonce = (new Date()).getTime();  // timestamp: milliseconds since 1-Jan-1970
  var nonceMs = nonce%1000;
  var nonceSec = Math.floor(nonce/1000);
  var nonceRnd = Math.floor(Math.random()*0xffff);
  
  for (var i=0; i<2; i++) counterBlock[i]   = (nonceMs  >>> i*8) & 0xff;
  for (var i=0; i<2; i++) counterBlock[i+2] = (nonceRnd >>> i*8) & 0xff;
  for (var i=0; i<4; i++) counterBlock[i+4] = (nonceSec >>> i*8) & 0xff;
  
  // and convert it to a string to go on the front of the ciphertext
  var ctrTxt = '';
  for (var i=0; i<8; i++) ctrTxt += String.fromCharCode(counterBlock[i]);

  // generate key schedule - an expansion of the key into distinct Key Rounds for each round
  var keySchedule = Aes.keyExpansion(key);
  
  var blockCount = Math.ceil(plaintext.length/blockSize);
  var ciphertxt = new Array(blockCount);  // ciphertext as array of strings
  
  for (var b=0; b<blockCount; b++) {
    // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
    // done in two stages for 32-bit ops: using two words allows us to go past 2^32 blocks (68GB)
    for (var c=0; c<4; c++) counterBlock[15-c] = (b >>> c*8) & 0xff;
    for (var c=0; c<4; c++) counterBlock[15-c-4] = (b/0x100000000 >>> c*8);

    var cipherCntr = Aes.cipher(counterBlock, keySchedule);  // -- encrypt counter block --
    
    // block size is reduced on final block
    var blockLength = b<blockCount-1 ? blockSize : (plaintext.length-1)%blockSize+1;
    var cipherChar = new Array(blockLength);
    
    for (var i=0; i<blockLength; i++) {  // -- xor plaintext with ciphered counter char-by-char --
      cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b*blockSize+i);
      cipherChar[i] = String.fromCharCode(cipherChar[i]);
    }
    ciphertxt[b] = cipherChar.join(''); 
  }

  // Array.join is more efficient than repeated string concatenation in IE
  var ciphertext = ctrTxt + ciphertxt.join('');
  ciphertext = Base64.encode(ciphertext);  // encode in base64
  
  //alert((new Date()) - t);
  return ciphertext;
};

/** 
 * Decrypt a text encrypted by AES in counter mode of operation
 *
 * @param {String} ciphertext Source text to be encrypted
 * @param {String} password   The password to use to generate a key
 * @param {Number} nBits      Number of bits to be used in the key (128, 192, or 256)
 * @returns {String}          Decrypted text
 */
Aes.Ctr.decrypt = function(ciphertext, password, nBits) {
  var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
  if (!(nBits==128 || nBits==192 || nBits==256)) return '';  // standard allows 128/192/256 bit keys
  ciphertext = Base64.decode(ciphertext);
  password = Utf8.encode(password);
  //var t = new Date();  // timer
  
  // use AES to encrypt password (mirroring encrypt routine)
  var nBytes = nBits/8;  // no bytes in key
  var pwBytes = new Array(nBytes);
  for (var i=0; i<nBytes; i++) {
    pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
  }
  var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
  key = key.concat(key.slice(0, nBytes-16));  // expand key to 16/24/32 bytes long

  // recover nonce from 1st 8 bytes of ciphertext
  var counterBlock = new Array(8);
  ctrTxt = ciphertext.slice(0, 8);
  for (var i=0; i<8; i++) counterBlock[i] = ctrTxt.charCodeAt(i);
  
  // generate key schedule
  var keySchedule = Aes.keyExpansion(key);

  // separate ciphertext into blocks (skipping past initial 8 bytes)
  var nBlocks = Math.ceil((ciphertext.length-8) / blockSize);
  var ct = new Array(nBlocks);
  for (var b=0; b<nBlocks; b++) ct[b] = ciphertext.slice(8+b*blockSize, 8+b*blockSize+blockSize);
  ciphertext = ct;  // ciphertext is now array of block-length strings

  // plaintext will get generated block-by-block into array of block-length strings
  var plaintxt = new Array(ciphertext.length);

  for (var b=0; b<nBlocks; b++) {
    // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
    for (var c=0; c<4; c++) counterBlock[15-c] = ((b) >>> c*8) & 0xff;
    for (var c=0; c<4; c++) counterBlock[15-c-4] = (((b+1)/0x100000000-1) >>> c*8) & 0xff;

    var cipherCntr = Aes.cipher(counterBlock, keySchedule);  // encrypt counter block

    var plaintxtByte = new Array(ciphertext[b].length);
    for (var i=0; i<ciphertext[b].length; i++) {
      // -- xor plaintxt with ciphered counter byte-by-byte --
      plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
      plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
    }
    plaintxt[b] = plaintxtByte.join('');
  }

  // join array of blocks into single plaintext string
  var plaintext = plaintxt.join('');
  plaintext = Utf8.decode(plaintext);  // decode from UTF8 back to Unicode multi-byte chars
  
  //alert((new Date()) - t);
  return plaintext;
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Base64 class: Base 64 encoding / decoding (c) Chris Veness 2002-2011                          */
/*    note: depends on Utf8 class                                                                 */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Base64 = {};  // Base64 namespace

Base64.code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Encode string into Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
 * (instance method extending String object). As per RFC 4648, no newlines are added.
 *
 * @param {String} str The string to be encoded as base-64
 * @param {Boolean} [utf8encode=false] Flag to indicate whether str is Unicode string to be encoded 
 *   to UTF8 before conversion to base64; otherwise string is assumed to be 8-bit characters
 * @returns {String} Base64-encoded string
 */ 
Base64.encode = function(str, utf8encode) {  // http://tools.ietf.org/html/rfc4648
  utf8encode =  (typeof utf8encode == 'undefined') ? false : utf8encode;
  var o1, o2, o3, bits, h1, h2, h3, h4, e=[], pad = '', c, plain, coded;
  var b64 = Base64.code;
   
  plain = utf8encode ? str.encodeUTF8() : str;
  
  c = plain.length % 3;  // pad string to length of multiple of 3
  if (c > 0) { while (c++ < 3) { pad += '='; plain += '\0'; } }
  // note: doing padding here saves us doing special-case packing for trailing 1 or 2 chars
   
  for (c=0; c<plain.length; c+=3) {  // pack three octets into four hexets
    o1 = plain.charCodeAt(c);
    o2 = plain.charCodeAt(c+1);
    o3 = plain.charCodeAt(c+2);
      
    bits = o1<<16 | o2<<8 | o3;
      
    h1 = bits>>18 & 0x3f;
    h2 = bits>>12 & 0x3f;
    h3 = bits>>6 & 0x3f;
    h4 = bits & 0x3f;

    // use hextets to index into code string
    e[c/3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  }
  coded = e.join('');  // join() is far faster than repeated string concatenation in IE
  
  // replace 'A's from padded nulls with '='s
  coded = coded.slice(0, coded.length-pad.length) + pad;
   
  return coded;
};

/**
 * Decode string from Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
 * (instance method extending String object). As per RFC 4648, newlines are not catered for.
 *
 * @param {String} str The string to be decoded from base-64
 * @param {Boolean} [utf8decode=false] Flag to indicate whether str is Unicode string to be decoded 
 *   from UTF8 after conversion from base64
 * @returns {String} decoded string
 */ 
Base64.decode = function(str, utf8decode) {
  utf8decode =  (typeof utf8decode == 'undefined') ? false : utf8decode;
  var o1, o2, o3, h1, h2, h3, h4, bits, d=[], plain, coded;
  var b64 = Base64.code;

  coded = utf8decode ? str.decodeUTF8() : str;
  
  
  for (var c=0; c<coded.length; c+=4) {  // unpack four hexets into three octets
    h1 = b64.indexOf(coded.charAt(c));
    h2 = b64.indexOf(coded.charAt(c+1));
    h3 = b64.indexOf(coded.charAt(c+2));
    h4 = b64.indexOf(coded.charAt(c+3));
      
    bits = h1<<18 | h2<<12 | h3<<6 | h4;
      
    o1 = bits>>>16 & 0xff;
    o2 = bits>>>8 & 0xff;
    o3 = bits & 0xff;
    
    d[c/4] = String.fromCharCode(o1, o2, o3);
    // check for padding
    if (h4 == 0x40) d[c/4] = String.fromCharCode(o1, o2);
    if (h3 == 0x40) d[c/4] = String.fromCharCode(o1);
  }
  plain = d.join('');  // join() is far faster than repeated string concatenation in IE
   
  return utf8decode ? plain.decodeUTF8() : plain; 
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
/*              single-byte character encoding (c) Chris Veness 2002-2011                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Utf8 = {};  // Utf8 namespace

/**
 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
 * (BMP / basic multilingual plane only)
 *
 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
 *
 * @param {String} strUni Unicode string to be encoded as UTF-8
 * @returns {String} encoded string
 */
Utf8.encode = function(strUni) {
  // use regular expressions & String.replace callback function for better efficiency 
  // than procedural approaches
  var strUtf = strUni.replace(
      /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
    );
  strUtf = strUtf.replace(
      /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0); 
        return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
    );
  return strUtf;
};

/**
 * Decode utf-8 encoded string back into multi-byte Unicode characters
 *
 * @param {String} strUtf UTF-8 string to be decoded back to Unicode
 * @returns {String} decoded string
 */
Utf8.decode = function(strUtf) {
  // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
  var strUni = strUtf.replace(
      /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
        return String.fromCharCode(cc); }
    );
  strUni = strUni.replace(
      /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
        return String.fromCharCode(cc); }
    );
  return strUni;
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/** From file C:\workspace\sigWeb\web-static-src\0-utils\utils.js **/

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback, element) {
           window.setTimeout(callback, 1000/60);
         };
})();


$.getTimeMillis = function(){
	return new Date().getTime();
};
$.getTimeFloat = function(){
	return $.getTimeMillis() / 1000;
};
var localTime = Math.floor(new Date().getTime() / 1000);
$.getTime = function(){
	var timeElapsed = Math.floor($.getTimeFloat()) - localTime;
	return serverTime + timeElapsed;
};
$.getElmRegion = function(elm){
	var pos = elm.offset();
	var rootPos = gameManager.root.offset();
	var posX = pos.left - rootPos.left;
	var posY = pos.top - rootPos.top;
	var w = elm.width();
	var h = elm.height();
	return {
		posX: posX,
		posY: posY,
		width: w,
		height: h
	};
};

$.isDefined = function(elem){
	return typeof(elem) !== "undefined";
};

$.ease = function(from, to, func, options){
	var isObject = true;
	if(typeof from != "object"){
		from = {v: from};
		to = {v: to};
		isObject = false;
	}
	var o = {};
	if(options){
		for(i in options){
			o[i] = options[i];
		}
	}
	o.step = function(f){
		if(isObject){
			var res = {};
			for(i in from){
				res[i] = f * (to[i] - from[i]) + from[i];
			}
			func(res);
		}else{
			func(f * (to.v - from.v) + from.v);
		}
	};
	var listener = $({f:0});
	if(options && options.delay){
		listener.delay(options.delay).animate({f:1}, o);
	}else{
		listener.animate({f:1}, o);
	}
	return listener;
};

$.shuffle = function(list){
	var i, j, t;
	for (i = 1; i < list.length; i++) {
		j = Math.floor(Math.random() * (1 + i));
		if (j != i) {
			t = list[i];
			list[i] = list[j];
			list[j] = t;
		}
	}
};

$.clamp = function(value,min,max)
{
    return Math.max(Math.min(value,max),min);
};

$.distanceBetweenPointsSquared = function(p1x,p1y,p2x,p2y)
{
    return ( p2x - p1x ) * ( p2x - p1x ) + ( p2y - p1y ) * ( p2y - p1y );
};

$.distanceBetweenPoints = function(p1x,p1y,p2x,p2y)
{
    return Math.sqrt($.distanceBetweenPointsSquared(p1x,p1y,p2x,p2y));
};

$.EASE_FACTOR = 3.5;
$.EASE_FACTOR_EXP = 4;

$.easeInCustom = function(timeNorm)
{
    return Math.pow(timeNorm,$.EASE_FACTOR);
};

$.easeOutCustom = function(timeNorm)
{
    return Math.pow(timeNorm,1/$.EASE_FACTOR);
};

$.easeInExpCustom = function(timeNorm)
{
    return Math.pow(timeNorm,$.EASE_FACTOR_EXP);
};

$.easeOutExpoCustom = function(timeNorm)
{
    return Math.pow(timeNorm,1/$.EASE_FACTOR_EXP);
};

$.easeInSinCustom = function(timeNorm)
{
    return Math.sin(-Math.PI/2+timeNorm*Math.PI/2)+1;
};

$.easeOutSinCustom = function(timeNorm)
{
    return Math.sin(timeNorm*Math.PI/2);
};

$.easeInOutSinCustom = function(timeNorm)
{
    return (1 + Math.sin(-Math.PI/2+timeNorm*Math.PI)) / 2;
};

$.showEase = function(g,rect,ease)
{
    g.save();
    
    g.translate(rect.x,rect.y);
    
    g.fillStyle = "black";
    g.fillRect(0,0,rect.width,rect.height);
    
    g.fillStyle = "red";
    
    var nbPoints = 50;
    
    for(var i = 0 ; i <= nbPoints ; ++i)
    {
        var vx = i / nbPoints;
        var px = vx * rect.width;
        
        var vy = ease(vx);
        var py = vy * rect.height;
        
        g.fillRect(px,rect.height-py,1,1);
    }
    
    g.restore();
};

$.gameComm =
{
	api : function(action,data,resCallback)
	{
		var dataToSend = {action : action, data : data};
		if (ENCRYPT_ENABLED)
		{
			dataToSend = { d : Aes.Ctr.encrypt(JSON.stringify(dataToSend), 't1pGs9g36eE8NctIFO90O887g0Q1vmO1', 256) };
		}
		
		$.ajax({
			url: 'api.php',
			method: 'POST',
			data: dataToSend,
			success: function(res)
			{				
	            console.log('Server answer: ' + res);
	            
	            if($.isDefined(res.error))
	        	{
	                alert(res.error);
	                if($.isDefined(res.reload) && res.reload)
	                {
	                	location.href="index.php";
	                }
	        	}
	            else
	            {
	            	resCallback(res);
	            }
			},
			error: function(o)
			{
				console.log('Failure:');
				console.log(o);
			}
		});
	}
};



/** From file C:\workspace\sigWeb\web-static-src\base\AssetManager.js **/

var AssetManager = function(){
	this.images = {};
	this.sounds = {};
	this.imagesError = {};
	this.imagesToLoad = {};
	this.soundsToLoad = {};
	this.loadingStarted = false;
    this.renderAlpha = 1;
};
AssetManager.prototype.loadImage = function(url, id){
	var _this = this;
	if(!id){
		id = url;
	}
	var img = this.images[id];
	if(!img){
		this.imagesToLoad[id] = url;
		img = new Image();
		img.onload = function(){
			delete _this.imagesToLoad[id];
			_this.assetLoaded();
		};
		img.onerror = function(){
			delete _this.imagesToLoad[id];
			_this.imagesError[id] = id;
			_this.assetLoaded();
		};
		img.src = url;
		this.images[id] = img;
	}else{
		this.assetLoaded();
	}
	return img;
};
AssetManager.prototype.loadSound = function(url, id, onload){
	var _this = this;
	if(!id){
		id = url;
	}
	if(this.sounds[id])
    {
		this.assetLoaded();
	}
    else
    {
        /**
          HTML :
            <audio id="myAudio">
                <source type="audio/mpeg" url="mySoundUrl"/>
            </audio>
        **/
        
        this.soundsToLoad[id] = url;
    
        var soundElem = new Audio();
        
        soundElem.addEventListener("canplay",function(){
            delete _this.soundsToLoad[id];
            _this.assetLoaded();
        });
        soundElem.addEventListener("stalled",function(){
            delete _this.soundsToLoad[id];
            console.log("Error loading sound " + url);
            _this.assetLoaded();
        });
        
        var sourceElem = document.createElement("source");
        sourceElem.src = url;
        
        switch(url.substring(url.length-3))
        {
            case "mp3" : sourceElem.type = "audio/mpeg"; break;
            case "wav" : sourceElem.type = "audio/wav"; break;
            case "ogg" : sourceElem.type = "audio/ogg"; break;
        }
        
        soundElem.appendChild(sourceElem);
        document.body.appendChild(soundElem);
        
		this.sounds[id] = soundElem;
	}
	return this.sounds[id];
};

AssetManager.prototype.assetLoaded = function(){
	this.totalAssetLoaded++;
	this.loadingTime = Date.now() - this.loadingStartTime;
	this.loadingEndTime = Date.now();
};
AssetManager.prototype.setRenderAlpha = function(a){
    this.renderAlpha = a;
};
AssetManager.prototype.renderLoadingProgress = function(g){
    //console.log("Progress: " + this.getLoadingProgress());
    
    g.save();
    
    g.globalAlpha = this.renderAlpha;
    
    g.fillStyle = "black";
    g.fillRect(0,0,g.canvas.width,g.canvas.height);
    g.translate(g.canvas.width/2-100,g.canvas.height/2-10);
    
    var gradient = g.createLinearGradient(0,0,200,20);
    gradient.addColorStop(0,"#00F");
    gradient.addColorStop(1,"#F00");
    
    g.fillStyle = gradient;
    g.fillRect(0,0,200,20);
    
    g.fillStyle = "rgb(" + parseInt((1-this.getLoadingProgress())*255) + "," + parseInt(this.getLoadingProgress()*255) + ",0)";
    g.fillRect(0,0,this.getLoadingProgress()*200,20);
    
    g.font = "10px gunship";
    g.fillStyle = "black";
    g.fillText("Loading: " + this.getLoadingProgress() * 100 + "%",50,14);
    
    //g.globalAlpha = 1;
    
    g.restore();
};

AssetManager.prototype.isDoneLoading = function(){
	return this.totalAssetCount == this.totalAssetLoaded;
};

AssetManager.prototype.startLoading = function(loadingList, soundLoadingList){
	this.loadingStartTime = Date.now();
	
	this.totalAssetLoaded = 0;
	this.totalAssetCount = 0;
	for(var i in loadingList){
		this.totalAssetCount++;
	}
	for(var i in soundLoadingList){
		this.totalAssetCount++;
	}
	this.loadingStarted = true;
	for(var i in soundLoadingList){
		this.loadSound(soundLoadingList[i], i);
	}
	for(var i in loadingList){
		this.loadImage(loadingList[i], i);
	}
};
AssetManager.prototype.getLoadingProgress = function(){
	if(this.totalAssetCount == 0){
		return 0;
	}else{
		return this.totalAssetLoaded / this.totalAssetCount;
	}
};

AssetManager.prototype.getImage = function(id){
	return this.images[id];
};

AssetManager.prototype.getSound = function(id){
	return this.sounds[id];
};


/** From file C:\workspace\sigWeb\web-static-src\base\Camera.js **/

var Camera = function(player){
	var self = this;
	
	this.player = player;
	
	this.player.addPositionListener(function(x,y){
        self.refreshView(x,y);
    });
	
	this.x = 0;
	this.y = 0;
	
	this.decalX = 512;
	this.decalY = 300;

};
Camera.SCREEN_WIDTH = 1024;
Camera.SCREEN_HEIGHT = 600;
Camera.SCENE_WIDTH = 4096;
Camera.SCENE_HEIGHT = 2037;
Camera.MIN_X = -Camera.SCENE_WIDTH + Camera.SCREEN_WIDTH;
Camera.MAX_X = 0;
Camera.MIN_Y = -Camera.SCENE_HEIGHT + Camera.SCREEN_HEIGHT;
Camera.MAX_Y = 0;

Camera.prototype.refreshView = function(playerX, playerY){
	var self = this;
	var newX = -playerX + this.decalX;
	var newY = -playerY + this.decalY;
	if(newX < Camera.MIN_X){
		newX = Camera.MIN_X;
	}else if(newX > Camera.MAX_X){
		newX = Camera.MAX_X;
	}
	if(newY < Camera.MIN_Y){
		newY = Camera.MIN_Y;
	}else if(newY > Camera.MAX_Y){
		newY = Camera.MAX_Y;
	}
	
	$.ease({x: this.x, y: this.y}, {x: newX, y: newY}, function(o){
		self.legacyX = Math.round(o.x);
		self.legacyY = Math.round(o.y);
		self.setViewPosition(Math.round(o.x), Math.round(o.y));
	},  {
		duration: 200,
		easing: "easeOutExpo"
	});
};
Camera.SHAKE_SCREEN_DURATION = 200;
Camera.SHAKE_SCREEN_DISTANCE = 1;
Camera.prototype.shake = function(factor){
	var self = this;
	if(!factor){
		factor = 1;
	}
    var from = 0;
    var to = 100;
    $.ease(
        from,
        to,
        function(v){
            //console.log("shake step - v=" + v + " - " + parseInt(v) + " (" + typeof(v) + ")");
            self.setViewPosition( self.legacyX+(Math.random()*2-1)*factor*Camera.SHAKE_SCREEN_DISTANCE,
                                  self.legacyY+(Math.random()*2-1)*factor*Camera.SHAKE_SCREEN_DISTANCE );
        },{duration:Math.round(Camera.SHAKE_SCREEN_DURATION*factor),
        complete:function(){
            //console.log("shake done");
            self.setViewPosition(self.legacyX,self.legacyY);
        }});
};
Camera.prototype.setViewPosition = function(x, y){
	//console.log("Moving camera to "+x+","+y + " (was " + this.x + "," + this.y + ")");
	this.x = parseInt(x);
	this.y = parseInt(y);
};
Camera.prototype.render = function(g)
{
    g.translate(this.x,this.y);
};


/** From file C:\workspace\sigWeb\web-static-src\base\Sprite.js **/

var Sprite = function( id, img, width, height, colCount, rowCount, loop)
{
	this.id = id;
    this.img = img;
	this.loop = loop;
	this.rowCount = rowCount;
	this.colCount = colCount;
	this.frameCount = this.rowCount * this.colCount;
	this.currentFrame = 0;
	this.setFrameRate(16);
	this.invert = false;
	this.invertAnim = false;
    this.revertDirection = false;
	this.scale = 1;
	this.lastUpdateTime = 0;
	this.imgWidth = width;
	this.imgHeight = height;
	this.width = Math.round(this.imgWidth / this.colCount);
	this.height = Math.round(this.imgHeight / this.rowCount);
	this.centerX = 0;
	this.centerY = 0;
};

Sprite.prototype.setUrl = function(url)
{
	if(this.url != url){
		this.url = url;
		this.$img.attr("src", this.url);
	}
};

Sprite.prototype.setRevertDirection = function(v)
{
    this.revertDirection = v;
};

Sprite.prototype.setCenter = function(x, y)
{
	this.centerX = x;
	this.centerY = y;
};

Sprite.prototype.show = function(type, options)
{
	if(this.loop){
		this.currentFrame = 0;
		this.play();
	}
};
Sprite.prototype.hide = function(hideType)
{
	this.stop();
};
Sprite.prototype.play = function(onComplete)
{
	var _this = this;
	if(this.player){
		clearTimeout(this.player);
	}
	var frameDuration = this.frameDuration;
	if(this.character && this.character.slowMotion){
		frameDuration = Math.round(frameDuration * 1.5);
	}
	this.player = setTimeout(function(){
		_this.nextFrame();
		if(_this.loop || _this.currentFrame < _this.frameCount - 1){
			_this.play(onComplete);
		}else if((typeof onComplete) == "function"){
			onComplete(_this);
		}
	}, frameDuration);
};
Sprite.prototype.resetAnim = function()
{
	this.stop();
	this.currentFrame = 0;
};
Sprite.prototype.stop = function()
{
	if(this.player){
		clearTimeout(this.player);
		this.player = false;
	}
};
Sprite.prototype.nextFrame = function(frames)
{
	if(!frames){
		frames = 1;
	}
	this.currentFrame = this.currentFrame + frames;
	if(this.currentFrame >= this.frameCount){
		if(this.loop){
			this.currentFrame %= this.frameCount;
		}else{
			this.currentFrame = this.frameCount - 1;
		}
	}
	if(this.currentFrame == this.frameCount - 1 && !this.loop && this.onAnimationComplete){
		this.onAnimationComplete(this);
		this.onAnimationComplete = false;
	}
};
Sprite.prototype.render = function(g)
{
    g.save();

    var frame = this.invertAnim ? ( this.frameCount - this.currentFrame - 1 ) : this.currentFrame;
    
    var currentCol = frame % this.colCount ;
    var currentRow = Math.floor( frame / this.colCount ) ;
    
    if(this.invert)
    {
        currentCol = this.colCount - currentCol - 1 ;
        currentRow = this.rowCount - currentRow - 1 ;
    }
    
    var sx = Math.round( this.width  * currentCol );
    var sy = Math.round( this.height * currentRow );
    
    var currentScaleX = this.scale * ( this.revertDirection ? -1 : 1 );
    g.scale(currentScaleX,this.scale);
    
    g.drawImage( this.img, sx, sy, this.width, this.height, -this.centerX, -this.centerY, this.width, this.height );
    //console.log("sx=" + sx + ", sy=" + sy + ", this.scale=" + this.scale + ", currentScaleX=" + currentScaleX + ", this.width=" + this.width + ", this.height=" + this.height);
    //console.log("this.currentFrame=" + this.currentFrame + ",currentRow=" + currentRow + ",currentCol=" + currentCol + ",this.frameCount=" + this.frameCount + ",this.colCount=" + this.colCount );
    
    g.restore();
};
Sprite.prototype.setFrameRate = function(frameRate)
{
	this.frameRate = frameRate;
	this.frameDuration = 1.0 / this.frameRate * 1000;
};
Sprite.prototype.setScale = function(scale)
{
	if(this.scale != scale){
		this.scale = scale;
	}
};


/** From file C:\workspace\sigWeb\web-static-src\characters\Character.js **/

var Character = function()
{
    this.health = 100;
    this.dead = false;
    this.revertDirection = false;
	this.spriteList = {};
	this.currentSprite = false;
	this.positionListenerList = [];
    this.radius = 1;
};

Character.prototype.addDamage = function(dmg)
{
    this.health -= dmg;
};

Character.prototype.createSprite = function(id,url,width,height,colCount,rowCount,loop)
{
    this.spriteList[id] = new Sprite(id,url,width,height,colCount,rowCount,loop);
};

Character.prototype.setSprite = function(anim, onComplete){
	this.lastAnimId = anim;
	var spriteId = anim;
	if(this.currentSprite != this.spriteList[spriteId]){
		if(!this.currentSprite || this.currentSprite.loop || this.currentSprite.currentFrame == this.currentSprite.frameCount - 1){
			if(this.currentSprite){
				this.currentSprite.stop();
				this.currentSprite.hide();
			}
			this.currentSprite = this.spriteList[spriteId];
			this.currentSprite.resetAnim();
			this.currentSprite.play(onComplete);
			this.currentSprite.show();
        }else{
            this.nextSprite = anim;
        }
	}
};

Character.prototype.addPositionListener = function(listener){
	this.positionListenerList.push(listener);
};

Character.prototype.firePositionChange = function()
{
    for(var listenerIndex in this.positionListenerList)
    {
        this.positionListenerList[listenerIndex](this.x,this.y);
    }
};

Character.prototype.setPosition = function(x, y)
{
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.firePositionChange();
};

Character.prototype.moveTo = function(x, y)
{
	var self = this;
	if(this.animHandler){
		this.animHandler.stop(false, false);
	}
	this.animHandler = $.ease({
		x: this.x,
		y: this.y
	}, {
		x: x, 
		y: y
	}, function(o){
		self.setPosition(o.x, o.y);
	},
	{
		easing: "easeOutCirc",
		duration: 300
	});
};
Character.prototype.move = function(x, y)
{
	this.moveTo(this.x + x, this.y + y);
};
Character.prototype.render = function(g)
{
    if(this.currentSprite)
    {
        g.save();
        g.translate(this.x,this.y);
        
        this.currentSprite.setRevertDirection(this.revertDirection);
        this.currentSprite.render(g);
        
        g.restore();
    }
};

Character.prototype.update = function(deltaTimeSec)
{
};



/** From file C:\workspace\sigWeb\web-static-src\characters\Ennemy.js **/

var Ennemy = function(assetManager){
	var _this = this;
	Character.call(this);
	
	this.centerX = 64;
	this.centerY = 120;
	
	this.createSprite("idle", assetManager.getImage("mob-idle"), 2048, 128, 16, 1, true);
	this.createSprite("attack", assetManager.getImage("mob-attack"), 1536, 128, 12, 1, false);
	this.createSprite("death", assetManager.getImage("mob-death"), 1792, 128, 14, 1, false);
	this.createSprite("damage", assetManager.getImage("mob-damage"), 1920, 128, 15, 1, false);

	for(var i in this.spriteList){
		this.spriteList[i].setCenter(this.centerX, this.centerY);
	}

	this.setSprite("idle");
	this.setPosition(Ennemy.MIN_X + Math.random() * (Ennemy.MAX_X - Ennemy.MIN_X), Ennemy.MIN_Y + Math.random() * (Ennemy.MAX_Y - Ennemy.MIN_Y));

	var finalScale = this.scale;
	$.ease(0, 1, function(v){
		_this.setScale(v * finalScale);
	}, 1000);

};
Ennemy.MIN_Y = 1550;
Ennemy.MAX_Y = 1920;
Ennemy.MIN_X = 2400;
Ennemy.MAX_X = 4000;
Ennemy.MIN_SCALE = 0.3;
Ennemy.MAX_SCALE = 0.8;

Ennemy.prototype = new Character();
Ennemy.prototype.setPosition = function(x, y){
	var lastY = this.y;
	Character.prototype.setPosition.call(this, x, y);
	
	if(this.y != lastY){
		var factor = (y - Ennemy.MIN_Y) / (Ennemy.MAX_Y - Ennemy.MIN_Y);
		this.setScale(factor * (Ennemy.MAX_SCALE - Ennemy.MIN_SCALE) + Ennemy.MIN_SCALE);
	}
};
Ennemy.prototype.setScale = function(scale){
	this.scale = scale;
	for(var i in this.spriteList){
		this.spriteList[i].setScale(this.scale);
	}
};


/** From file C:\workspace\sigWeb\web-static-src\characters\Mob.js **/

var Mob = function(assetManager,id)
{
	var self = this;
	Character.call(this);
    
    this.id = id;
    
    this.centerX =  64;
    this.centerY = 120;
    this.radius = 60;
    
    this.dying = false;
    
    this.createSprite("idle",  assetManager.getImage("mob-idle"  ), 2048, 128, 16, 1,  true);
    this.createSprite("attack",assetManager.getImage("mob-attack"), 1536, 128, 12, 1, false);
    this.createSprite("damage",assetManager.getImage("mob-damage"), 1920, 128, 15, 1, false);
    this.createSprite("death", assetManager.getImage("mob-death" ), 1792, 128, 14, 1, false);
    
    for (var i in this.spriteList)
    {
        this.spriteList[i].setCenter(this.centerX,this.centerY);
    }

	this.keyList = {};
	this.revertDirection = false;
	this.setSprite("idle");
};

Mob.MIN_Y = 1550;
Mob.MAX_Y = 1920;
Mob.MIN_X = 2400;
Mob.MAX_X = 4000;
Mob.MIN_SCALE = 0.3;
Mob.MAX_SCALE = 0.8;
Mob.DISAPPEAR_DELAY = 5000;

Mob.sorter = function(mob1,mob2)
{
    return mob1.y - mob2.y; // -x if mob1.y < mob2.y, 0 if =, +x if >
};

Mob.prototype = new Character();
Mob.prototype.init = function(){
};

Mob.prototype.setRandomDir = function()
{
    var rdir = Math.random() < 0.5;
    this.revertDirection = rdir;
};

Mob.prototype.setRandomPosition = function()
{
    var rx = Mob.MIN_X + Math.random() * (Mob.MAX_X - Mob.MIN_X);
    var ry = Mob.MIN_Y + Math.random() * (Mob.MAX_Y - Mob.MIN_Y);
    this.setPosition(rx,ry);
};

Mob.prototype.setPosition = function(x, y)
{
	var lastY = this.y;
	Character.prototype.setPosition.call(this, x, y);
	
	if(this.y != lastY){
		var factor = (y - Mob.MIN_Y) / (Mob.MAX_Y - Mob.MIN_Y);
        this.setScale(factor * (Mob.MAX_SCALE - Mob.MIN_SCALE) + Mob.MIN_SCALE);
	}
};

Mob.prototype.setScale = function(scale)
{
        this.scale = scale;
        for(var i in this.spriteList){
                this.spriteList[i].setScale(this.scale);
        }
};

Mob.prototype.kill = function()
{
    this.dead = true;
};

Mob.prototype.addDamage = function(dmg)
{
    if (this.health <= 0) return;
    
    Character.prototype.addDamage.call(this,dmg);
    
    if (this.health <= 0)
    {
    	this.dying = true;
        this.setSprite("death");
        var self = this;
        setTimeout( function(){self.kill();}, Mob.DISAPPEAR_DELAY );
    }
    else
    {
        this.setSprite("damage");
    }
};


/** From file C:\workspace\sigWeb\web-static-src\characters\Player.js **/

var Player = function(assetManager)
{
	var self = this;
	Character.call(this);
    
    this.centerX =  64;
    this.centerY = 120;
    this.radius = 60;
    
    //TODO: bind event
    $(document).keyup(function(e){ e.preventDefault(); self.onKeyUp(e.which);});
    $(document).keydown(function(e){ e.preventDefault(); lastEvent = e; self.onKeyDown(e.which);});
	
	this.speed = {
		x: 600,
		y: 200
	};

	/*this.spriteList = {
		"idle-left": new Sprite(this.$elm, "idle-left", "/sigWeb-static/img/sprite/revert-idle-1-2-1.png", 2048, 256, 16, 2, true),
		"idle-right": new Sprite(this.$elm, "idle-right", "/sigWeb-static/img/sprite/idle-1-2-1.png", 2048, 256, 16, 2, true),
		"attack-left": new Sprite(this.$elm, "attack-left", "/sigWeb-static/img/sprite/revert-attack-1-2-1.png", 2048, 128, 16, 1, false),
		"attack-right": new Sprite(this.$elm, "attack-right", "/sigWeb-static/img/sprite/attack-1-2-1.png", 2048, 128, 16, 1, false),
		"move-left": new Sprite(this.$elm, "move-left", "/sigWeb-static/img/sprite/revert-move-1-2-1.png", 896, 128, 7, 1, true),
		"move-right": new Sprite(this.$elm, "move-right", "/sigWeb-static/img/sprite/move-1-2-1.png", 896, 128, 7, 1, true)
	};*/
    
    this.shootShound = assetManager.getSound("sound");
    
    this.createSprite("idle",  assetManager.getImage("player-idle"  ), 2048, 256, 16, 2,  true);
    this.createSprite("attack",assetManager.getImage("player-attack"), 2048, 128, 16, 1, false);
    this.createSprite("move",  assetManager.getImage("player-move"  ),  896, 128,  7, 1,  true);
    
    for (var i in this.spriteList)
    {
        this.spriteList[i].setCenter(this.centerX,this.centerY);
    }

	this.keyList = {};
	this.spriteList["move"].frameCount = 6;
	this.revertDirection = false;
	this.setSprite("idle");
};
Player.MIN_Y = 1455;
Player.MAX_Y = 1920;
Player.MIN_SCALE = 0.5;
Player.MAX_SCALE = 1.3;

Player.prototype = new Character();
Player.prototype.init = function(){
};
Player.prototype.setPosition = function(x, y){
	var lastY = this.y;
	Character.prototype.setPosition.call(this, x, y);
	
	if(this.y != lastY){
		var factor = (y - Player.MIN_Y) / (Player.MAX_Y - Player.MIN_Y);
        this.setScale(factor * (Player.MAX_SCALE - Player.MIN_SCALE) + Player.MIN_SCALE);
	}
};

Player.prototype.setScale = function(scale){
        this.scale = scale;
        for(var i in this.spriteList){
                this.spriteList[i].setScale(this.scale);
        }
};

Player.MOVE_UP_KEY     = 38 ; // up arrow
Player.MOVE_DOWN_KEY   = 40 ; // down arrow
Player.MOVE_LEFT_KEY   = 37 ; // left arrow
Player.MOVE_RIGHT_KEY  = 39 ; // right arrow
Player.MOVE_ATTACK_KEY = 32 ; // Space

Player.prototype.update = function(deltaTime)
{
	var move = {x: 0, y: 0};    
    if (this.isKeyDown(Player.MOVE_LEFT_KEY )) move.x = -this.speed.x * deltaTime * this.scale;
    if (this.isKeyDown(Player.MOVE_RIGHT_KEY)) move.x =  this.speed.x * deltaTime * this.scale;
    if (this.isKeyDown(Player.MOVE_UP_KEY   )) move.y = -this.speed.y * deltaTime * this.scale;
    if (this.isKeyDown(Player.MOVE_DOWN_KEY )) move.y =  this.speed.y * deltaTime * this.scale;
    
    var isMoving = move.x || move.y;
    var isAttacking = this.isKeyDown(Player.MOVE_ATTACK_KEY);
    
    if (move.x) this.revertDirection = move.x < 0;
    if (isMoving) this.move(move.x, move.y);
        
	this.setSprite(isAttacking?"attack":(isMoving?"move":"idle"));
};

Player.prototype.attack = function()
{
    this.shootShound.currentTime = 0;
    this.shootShound.play();

    //console.log("attack");
    game.checkCollisionWithEnemies(function(enemy)
    {
        enemy.addDamage(50);
        var xpIncrement = 2;
        if (enemy.dying) xpIncrement += 10;
        
        $.gameComm.api('addXP',xpIncrement,function(res)
        {
        	if($.isDefined(res.xp))
        	{
        		playerInfo.xp = res.xp;
                infoPage.refreshData();
        	}
        });
    });
};

Player.prototype.isKeyDown = function(k)
{
    return this.keyList[k];
};

Player.prototype.onKeyDown = function(k){
    //console.log("Key down: " + k);
    this.keyList[k] = true;
    
    if (k == Player.MOVE_ATTACK_KEY) this.attack();
};
Player.prototype.onKeyUp = function(k){
    //console.log("Key up: " + k);
    this.keyList[k] = false;

};


/** From file C:\workspace\sigWeb\web-static-src\ui\0-Page.js **/

var Page = function(content){
	this.root = document.createElement("div");
	this.root.innerHTML = content;
};
Page.prototype.append = function(content){
	if(typeof(content) == "string"){
		this.root.innerHTML += content;
	}else{
		this.root.appendChild(content.get(0));
	}
};
Page.prototype.setVisible = function(visible){
	//this.root.style.display = visible?"block":"none";
    if(visible){
        $(this.root).show(/*"slide"*/"fade");
    } else {
        $(this.root).hide();
    }
};


/** From file C:\workspace\sigWeb\web-static-src\ui\FriendsPage.js **/


var FriendsPage = function(friends)
{	
	Page.call(this, "");
	
	this.$friendsList = $("<div>").addClass("friends-list");
	this.append(this.$friendsList);
	
	for(var friendId in friends)
	{
		var friend = friends[friendId];
		
		var friendInfo = $("<div>").addClass("friend-info");
		this.$friendsList.append(friendInfo);
		
		var friendId = $("<div>").addClass("friend-id").html(friend.id);
		friendInfo.append(friendId);
		
		var friendName = $("<div>").addClass("friend-name").html(friend.name);
		friendInfo.append(friendName);
		
		var friendXp = $("<div>").addClass("friend-xp").html(friend.xp);
		friendInfo.append(friendXp);
		
		var friendPicture = $("<img/>").addClass("friend-picture").attr("src","http://graph.facebook.com/" + friend.id + "/picture");
		friendInfo.append(friendPicture);
		
		friendInfo.data('fbId',friend.id);
		friendInfo.click(function(){
			FB.ui({
				method: 'apprequests',
				message: 'Kado!',
				to: $(this).data('fbId'),
				data: { val1: 'test' }
			});
		});
	}
};
FriendsPage.prototype = new Page();


/** From file C:\workspace\sigWeb\web-static-src\ui\InfoPage.js **/


var InfoPage = function(){
	Page.call(this, "");
	
	this.$playerPicture = $("<img/>").addClass("player-picture");
	this.append(this.$playerPicture);
	
	this.$playerPreview = $("<div/>").addClass("player-preview");
	this.append(this.$playerPreview);

	this.$playerName = $("<div>").addClass("player-name").append("nom");
	this.append(this.$playerName);
	
	this.$playerTitle = $("<div>").addClass("player-title").append("title");
	this.append(this.$playerTitle);

	this.$playerProgress = $('<div class="player-progress"/>');
	this.$playerProgressIndic = $('<div class="player-progress-indic"/>');
	this.$playerProgress.append(this.$playerProgressIndic);
	this.append(this.$playerProgress);
	
	this.$attributeContainer = $("<dl>");
	this.append(this.$attributeContainer);

	this.attributeList = {};
	this.addAttribute("xp", "XP");
	this.addAttribute("hp", "HP");
	this.addAttribute("power", "Puissance");
};
InfoPage.prototype = new Page();

InfoPage.prototype.refreshData = function(){
	for(var i in playerInfo){
		switch(i){
		case "name":
			this.$playerName.html(playerInfo.name);
			break;
		case "title":
			this.$playerTitle.html(playerInfo.title);
			break;
		case "progress":
			this.$playerProgressIndic.css("width", Math.round(playerInfo.progress * 100) + '%');
			break;
		case "picture":
			this.$playerPicture.attr("src", playerInfo.picture);
			break;
		default:
			if(typeof(this.attributeList[i]) != "undefined"){
				this.attributeList[i].html(playerInfo[i]);
			}
		}
	}
};
InfoPage.prototype.addAttribute = function(id, label){
	var dt = $("<dt>").append(label);
	this.$attributeContainer.append(dt);
	
	var dd = $("<dd>").addClass(id);
	this.$attributeContainer.append(dd);
	
	this.attributeList[id] = dd;
};


/** From file C:\workspace\sigWeb\web-static-src\ui\Window.js **/

var Window = function(id,parent){
	this.id = id;
	
	this.root = document.createElement("div");
	this.root.className = "window";
    this.root.setAttribute("id",this.id);
    
    this.menu = document.createElement("div");
    this.menu.className = "menu";
    this.root.appendChild(this.menu);
    
    this.menuList = document.createElement("ul");
    this.menu.appendChild(this.menuList);
    
    this.content = document.createElement("div");
    this.content.className = "content";
    this.root.appendChild(this.content);
    
    parent.appendChild(this.root);
	
	this.currentLink = null;
};
Window.prototype.addPage = function(title, page){
	if(!(page instanceof Page)){
		throw page + " is not instanceof Page";
	}
	
	var menuElm = document.createElement("li");
    menuElm.page = page;
    menuElm.innerHTML = title;
    this.menuList.appendChild(menuElm);
    
    var self = this;
    menuElm.addEventListener("click",function(){
        self.showPage(menuElm);
    });
    
    this.content.appendChild(page.root);
    page.setVisible(false);
	
	if(this.currentLink == null){
		this.showPage(menuElm);
	}
};

Window.prototype.showPage = function(menuElm){

    if (this.currentLink){
        this.currentLink.page.setVisible(false);
        this.currentLink.setAttribute("class"," ");
    }
    
	menuElm.page.setVisible(true);
    menuElm.setAttribute("class","selected");
        
    this.currentLink = menuElm;
};


/** From file C:\workspace\sigWeb\web-static-src\zzz-Game.js **/

var Game = function()
{
	var self = this;
	var sleep = 1;
	this.localTime = 0;
	this.globalTime = 0;
	this.timeSinceLoadingEnd = 0;

	playerInfo = {
		name: user.name,
		title: "dummy title",
		xp: user.xp,
		hp: user.hp,
		power: user.power,
		progress: 0.8,
		picture: user.picture,
		friends: user.friends
	};

	//var win = new Window('main-window', document.getElementById("gui"));
	var win = new Window('main-window', document.getElementById("gui"));
	
	infoPage = new InfoPage();
	try{
		win.addPage("info", infoPage);
		win.addPage("description", new Page("<strong>hello</strong> world"));
		win.addPage("equipement", new Page("lorem ipsum"));
		win.addPage("amis", new FriendsPage(playerInfo.friends));
	}catch(e){
		console.log("New Exception : " + e);
	}
	
	infoPage.refreshData();
    
    $gui = $("#gui");
    scene = $(".scene-view").get(0);
    this.graphics = scene.getContext("2d");
    this.graphics.canvas = scene;
    
    var sleep=0;
    var assetsPath = "/sigWeb-static/";
    var imagesPathPrefix = assetsPath + "img/getImage.php?url=";
    var imagesPathSuffix = "&sleep="+sleep;
    var soundsPath = assetsPath + "sounds/";
    
    imageList = {
        "background"    : imagesPathPrefix +              "forest.jpg" + imagesPathSuffix,
        "player-idle"   : imagesPathPrefix +   "sprite/idle-1-2-1.png" + imagesPathSuffix,
        "player-attack" : imagesPathPrefix + "sprite/attack-1-2-1.png" + imagesPathSuffix,
        "player-move"   : imagesPathPrefix +   "sprite/move-1-2-1.png" + imagesPathSuffix,
        "mob-idle"      : imagesPathPrefix +       "sprite/idle-1.png" + imagesPathSuffix,
        "mob-damage"    : imagesPathPrefix +     "sprite/damage-1.png" + imagesPathSuffix,
        "mob-attack"    : imagesPathPrefix +     "sprite/attack-1.png" + imagesPathSuffix,
        "mob-death"     : imagesPathPrefix +      "sprite/death-1.png" + imagesPathSuffix
    };
    var soundList = {
        "music" : soundsPath + "test.mp3",
        "sound" : soundsPath + "test.wav"
    };
    
    this.assetManager = new AssetManager();
    this.assetManager.startLoading(imageList,soundList);

	$gui.append($("<div>").button().css({position:"absolute",top:"5px",left:"5px"}).append("Menu").click(function(){
        if($(win.root).hasClass("visible"))
        {
            console.log("clicked when visible");
            $(win.root).removeClass("visible");
        }
        else
        {
        	infoPage.refreshData();
            console.log("clicked when invisible");
            $(win.root).addClass("visible");
        }
	}));
	$gui.append($("<div>").button().css({position:"absolute",top:"5px",right:"100px"}).append("Logout").click(function(){
        location.href="?logout";
	}));
	$gui.append($("<div>").button().css({position:"absolute",top:"5px",right:"5px"}).append("Delete User").click(function(){
        location.href="?delete";
	}));

    player = new Player(this.assetManager);
	camera = new Camera(player);

	player.setPosition(3530, 1770);
    //player.setPosition(100, 100);
	player.init();
    
    this.enemyList = [];
    setInterval( function(){game.generateEnemy();}, 1000 );
	
	requestAnimFrame(
		function loop() {
			self.mainLoop();
			requestAnimFrame(loop);
		}					
	);
};

Game.prototype.tween = function(from, to, startTime, duration, easing)
{
    var now = Date.now();
    if (now - startTime < duration)
    {
        var normValue = (now - startTime) / duration;
        if (typeof(easing) != "undefined") normValue = $.clamp(easing(normValue),0,1);
        return from + (to-from) * normValue;
    }
    return to;
};

Game.MAX_NB_ENEMIES = 100;

Game.prototype.generateEnemy = function()
{
    if (this.enemyList.length==Game.MAX_NB_ENEMIES) return;
    var enemyId = "mob-" + Date.now();
    var enemy = new Mob(this.assetManager,enemyId);
    enemy.setRandomPosition();
    enemy.setRandomDir();
    this.enemyList.push(enemy);
    this.enemyList.sort(Mob.sorter);
};

Game.prototype.managePlayer = function(deltaSec) 
{
    player.update(deltaSec);
    player.render(this.graphics);
};

Game.prototype.manageCharacters = function(deltaSec)
{
    var playerHandled = false;
    var enemiesToDelete = [];

    for(var enemyId in this.enemyList)
    {
        var enemy = this.enemyList[enemyId];
        
        if (enemy.dead)
        {
            enemiesToDelete.push(enemyId);
            continue;
        }
        
        if ( !playerHandled && (enemy.y > player.y))
        {
            this.managePlayer(deltaSec);
            playerHandled = true;
        }
        
        enemy.update(deltaSec);
        enemy.render(this.graphics);
    }
    
    for(var enemiesToDeleteId in enemiesToDelete)
    {
        delete this.enemyList[enemiesToDelete[enemiesToDeleteId]];
    }
    
    if (!playerHandled)
    {
        this.managePlayer(deltaSec);
    }
};

Game.prototype.checkCollisionWithEnemies = function(collisionCallback)
{
    for(var enemyId in this.enemyList)
    {
        var enemy = this.enemyList[enemyId];
        var distPlayerEnemySquared = $.distanceBetweenPointsSquared(enemy.x,enemy.y,player.x,player.y);
        var playerRadiusSquared = player.radius * player.radius;
        
        if (distPlayerEnemySquared < playerRadiusSquared)
        {
            collisionCallback(enemy);
        }
    }
};

Game.prototype.mainLoop = function()
{
	var now = Date.now();
	var globalTimeDelta = now - this.globalTime;
	var localTimeDelta = Math.min(50, globalTimeDelta);
	this.localTime += localTimeDelta;
    var deltaSec = localTimeDelta / 1000;
    
    this.graphics.drawTimeMillis = now;
    
    this.graphics.clearRect(0,0,scene.width,scene.height);
    
    var doneLoading = this.assetManager.isDoneLoading();
    
    var alphaLoad = 1;
    
    if(doneLoading)
    {
        if (this.timeSinceLoadingEnd == 0) this.timeSinceLoadingEnd = now;
        alphaLoad = this.tween(1,0,this.timeSinceLoadingEnd,1000,$.easeOutExpoCustom);
        
        if (typeof(this.music) == "undefined")
        {
            this.music = this.assetManager.getSound("music");
            this.music.loop = true;
            this.music.play();
        }
    
        this.graphics.save();    
        
        camera.render(this.graphics);
        
        this.graphics.drawImage(this.assetManager.getImage("background"),0,0);
        
        this.manageCharacters(deltaSec);
        
        /*player.x += 100;
        player.render(this.graphics);
        player.x -= 100;
        
        this.graphics.fillStyle = "red";
        this.graphics.fillRect(player.x,player.y,10,10);*/
        
        this.graphics.restore();
        
    }
    if(!doneLoading || alphaLoad > 0)
    {
        this.assetManager.setRenderAlpha(alphaLoad);
        this.assetManager.renderLoadingProgress(this.graphics);
    }

};


/** From file C:\workspace\sigWeb\web-static-src\zzz-main.js **/

var infoPage;

$(document).ready(function(){
	console.log("game started");
	
	$.getScript('//connect.facebook.net/' + LOCALE + '/all.js', function()
	{
		FB.init({
			appId: FB_APP_ID
		});
		FB.getLoginStatus(function(result){
			console.log(result);
		});
	});

	game = new Game();
});

