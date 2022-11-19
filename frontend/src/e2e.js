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
      console.log("No key provided, will be generated...")
      sjcl.random.startCollectors()
    }
    else {
      this.#key = key
      console.log(`Using provided key: ${this.#key} (size: ${this.#key.length/8} bytes)`)
    }
  }

  #getRandomString(n) {
    return sjcl.codec.hex.fromBits(sjcl.random.randomWords(n, 0))
  }

  #generateKey() {
    this.#key = this.#getRandomString(this.NB_BYTES)
    console.log(`Key: ${this.#key} (size: ${this.#key.length/8} bytes)`)
  }

  encrypt(plaintext) {
    this.#generateKey()
    console.log(`Plaintext: ${plaintext}`)
    const ciphertext = sjcl.encrypt(this.#key, plaintext, {ks: 256})
    console.log(`Ciphertext: ${ciphertext}`)

    return sjcl.codec.base64.fromBits(sjcl.codec.utf8String.toBits(ciphertext))
  }

  decrypt(b64Ciphertext) {
    console.log(`B64Ciphertext: ${b64Ciphertext}`)
    const ciphertext = sjcl.codec.utf8String.fromBits(sjcl.codec.base64.toBits(b64Ciphertext))
    console.log(`Ciphertext: ${ciphertext}`)
    const plaintext = sjcl.decrypt(this.#key, ciphertext)
    console.log(`Plaintext: ${plaintext}`)

    return plaintext
  }

  getKey() {
    return this.#key
  }
}

export default E2EEncryptor