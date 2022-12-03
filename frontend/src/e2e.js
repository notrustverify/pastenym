import sjcl from 'sjcl'

/**
 * The Standford Javacript Crypto Library exposes direct encrypt/decrypt methods that perform these operations according provided params.
 * These methods take a password argument.
 * If password is     of type string, it will be used to derive a key in a secure way. Best is to have a random string.
 * If password is not of type string, it will be used directly. So best to provided a good random string than trying to generate a good key.
 */

class E2EEncryptor {
  NB_BYTES = 4
  #key

  constructor(key = null) {
    this.#key = null

    if (!key) {
      //console.log("No key provided, will be generated...")
      sjcl.random.startCollectors()
    }
    else {
      this.#key = key
      //console.log(`Provided key: ${this.#key} (size: ${this.#key.length/8} bytes)`)
    }
  }

  #getRandomString(n) {
    return sjcl.codec.hex.fromBits(sjcl.random.randomWords(n, 0))
  }

  #generateKey() {
    this.#key = this.#getRandomString(this.NB_BYTES)
    //console.log(`Generated key: ${this.#key} (size: ${this.#key.length/8} bytes)`)
  }

  encrypt(plaintext) {

    // If no key, we generate it
    if (!this.#key) {
      this.#generateKey()
    }

    let ciphertext = null
    try {
      const strCiphertext = sjcl.encrypt(this.#key, plaintext, {ks: 128})
      ciphertext = sjcl.json.decode(strCiphertext)
    }
    catch (e) {
      console.error(`Error while encrypting ciphertext: ${e}`)
      return null
    }

    // Re-encode some values
    ciphertext["adata"] = sjcl.codec.base64.fromBits(ciphertext["adata"])
    ciphertext["salt"] = sjcl.codec.base64.fromBits(ciphertext["salt"])
    ciphertext["iv"] = sjcl.codec.base64.fromBits(ciphertext["iv"])
    
    const encryptedMessage = sjcl.codec.base64.fromBits(ciphertext["ct"])
    delete ciphertext.ct
    const encParams = ciphertext

    return [encryptedMessage, encParams]
  }

  decrypt(encryptedMessage, encParams) {
    if (null == encParams) {
      return encryptedMessage
    }

    let ciphertext = encParams
    ciphertext['ct'] = sjcl.codec.base64.toBits(encryptedMessage)
    ciphertext["adata"] = sjcl.codec.base64.toBits(ciphertext["adata"])
    ciphertext["salt"] = sjcl.codec.base64.toBits(ciphertext["salt"])
    ciphertext["iv"] = sjcl.codec.base64.toBits(ciphertext["iv"])

    const strCiphertext = sjcl.json.encode(ciphertext)

    return sjcl.decrypt(this.#key, strCiphertext)
  }

  getKey() {
    return this.#key
  }
}

export default E2EEncryptor