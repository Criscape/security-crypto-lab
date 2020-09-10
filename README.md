# Implementación de librerías criptográficas en Node.js

Este proyecto es un ejercicio de implementación de algunas de las librerías criptográficas más conocidas de Node.js, la idea principal es ver su funcionamiento y características.

## Sobre la implementación
Esta API fue programada en javascript y se utilizó la librería **express** para montar el servidor. También se conectó el servidor a una base de datos en mongoDB, la cual, para que funcione su conexión se debe agregar un archivo **config.json** que tenga un atributo llamado *connectionString*, el cual como valor va a tener la cadena de conexión a la base de datos de mongo que se quiera utilizar.

```json
{
	"connectionString": "mongodb://localhost/mydb"
}
```
Las funciones que se encargan de utilizar las librerías de criptografia se encuentran dentro del archivo **src/cryptoUtils.js**.

## Generación y verificación de Hash
Para la generación de Hash a partir de un mensaje se utilizó la librería **Crypto-JS**, esta librería nos ofrece distintas funciones de Hash aplicables a una *string* dada, la que se decidió en este ejercicio fue **SHA512**.

Como parte del ejercicio de verificación se añadió una *salt* para garantizar que el Hash generado sea único para el usuario que lo solicite.

```js
const salt = saltParam === 0 ? Math.random().toFixed(3).toString() : saltParam;
    const hash = CryptoJS.SHA512(message + salt);
    return {
        salt,
        hashString: hash.toString(CryptoJS.enc.Base64)
    }
```

En este ejemplo, el usuario *Pablo*, solicitará la generación de un Hash a partir del mensaje: *Seguridad informática*. La petición **POST** se hará a la dirección **http://server_ip:puerto/sec/hash**.

```json
{
	"username": "Pablo",
	"message": "Seguridad informática"
}
```
Si todo funciona correctamente, el registro quedará guardado en la base de datos y el servidor se habrá encargado de generar una *salt* para garantizar que el Hash es único.

![registro guardado en BD](https://i.imgur.com/L6vwyoc.png)

Por lo que ahora, si *Pablo* quiere verificar el mensaje, simplemente tendrá que realizar una petición **POST** a la dirección **http://server_ip:puerto/sec/hash/validate**.

```json
{
	"username": "Pablo",
	"message": "Seguridad informática"
}
```
Y si es válido el mensaje, el servidor responderá *Válido*.

## Firma digital
La generación y verificación de la firma digital se realizó con las librerías **Crypto-JS** para la generación de los hash y **crypto** para la implemetación del algoritmo RSA. Para generar la firma digital se utilizó el "método largo", el cual consiste en aplicar primero una función hash sobre la información, en este caso se aplicó SHA256, y luego hacer cifrado RSA con llave privada. Por lo que, es necesaria la llave pública para descifrar la firma.

```js
const hash = CryptoJS.SHA256(message).toString(CryptoJS.enc.Base64);
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const cipherText = crypto.privateEncrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
        oaepHash: 'sha256'
    }, Buffer.from(hash));
    return {
        signature: cipherText.toString('base64'), publicKey };
```

Supongamos que queremos generar una firma a partir del mensaje *Seguridad informática*, por lo que hacemos **POST** a la dirección **http://server_ip:puerto/sec/sign**.

```json
{
	"message": "Seguridad informática"
}
```

El servidor nos retornará la firma digital y la llave pública para poder validar esta firma digital.

```json
{
  "answer": {
    "signature": "Cz3DQBr2He5O1dXpZ0cLmJTjVubQdhgFLTkE56A8Yv6+G7Qd6sEggP1r2EFPhJsgKzPUWwADO4bOwnvX/UPHYRWaYBf/IptQtNnKs+/CDFfgzkIkaKgAZ1VY//ouYJkOW+GPawbaEc8SbA4ZqtpFDeOjU4G+c+kX905e8p6cCTctnM0qPd8B4A4lXBxcn0hJWDoIzWCrHG00V0XC0QmQEyQn2PAwyjM01ZksD/rhjskf6rk5Hi0s3t7zBDQV6uvW8PF2SZUsnmgAlmlq+gTIEIq/csUcnz5+LsA/bRfhoH+mlJa/2N1NA0BN5HvgZlTHx6MeETdMiquR4/3W2e+Fgw==",
    "publicKey": "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAuH33VqQGk7oDkWqNwk3G3mw79lm+EKPqFaw0wNPBR17+Z9A3WvEn\nXDTN7LUSLz0zbQ74E4ogdBGU23OfAGORWdSbayU6H5yQtLuljQCNFnWYsjCR11ln\nWUh1C7Jvpxj0pjkBUJY5XgQXohQi94SMm2Z8WgvefJuBYROndXLq7YPGl6hqjpfj\njPGlqEwNlPTS7QC+xywyhW//Qk/lKVaxGcBiKgAJqXGrCxtxarvW/vHzg9QolyTv\n27sUhnoUrFBZ2vjQXloAm2+TvEzLhEZBDHS6EDudh1tYODwMYiRD3RW5KH/Cf9Q7\n6HBbNoP4vgSWy1l+twexi44C6Jrm442KkwIDAQAB\n-----END RSA PUBLIC KEY-----\n"
  }
}
```

Si queremos validar la firma, debemos realizar una petición **POST** a la dirección **http://server_ip:puerto/sec/sign/validate** y pasar en el cuerpo de la petición: **message**, **signature** y **publicKey**.

```json
{
  "answer": {
    "hashedMessage": "CArmAreKg8QoySem6WtXGcxejL4jn5QGsou0QTlqaTE=",
    "hashedSign": "CArmAreKg8QoySem6WtXGcxejL4jn5QGsou0QTlqaTE=",
    "valid": true
  }
}
```

Si la firma es válida, el servidor retornará el atributo *valid* en *true*.

## Cifrado y decifrado AES
El cifrado y decifrado del algoritmo AES se realizó a través de la librería **Crypto-JS**. 

```js
return CryptoJS.AES.encrypt(message, key).toString();
```

Para realizar el cifrado tenemos que enviar una solicitud **POST** a la dirección **http://server_ip:puerto/sec/aes/encrypt**.

```json
{
	"message": "Seguridad informática",
	"key": "1234"
}
```

El servidor se encargará de cifrar el mensaje solicitado, con la llave ingresada.

```json
{
  "answer": "U2FsdGVkX1+ZOykihD+hsduNl7UoYfbVRZbNX1FRZuQ1GUJt8zylGhoyHkZZW3DQ"
}
```

Si realizamos una solicitud **POST** a la dirección **http://server_ip:puerto/sec/aes/decrypt**, con los atributos: **cipherText**, como el texto cifrado y **key** como la llave, el servidor nos retornará el texto decifrado.

```json
{
  "answer": "Seguridad informática"
}
```

## Cifrado y decifrado RSA

Para realizar el cifrado y decifrado del algoritmo RSA se utilizó la librería **crypto** la cual es una librería integrada en node.js. Para cifrar con RSA primero genera las llaves publica y privada con un modulo de 2048 bits y en este caso, vamos a cifrar con clave publica y decifrar con clave privada. Esta implementación de RSA usa el formato de OpenSSH para las llaves.


```js
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    return {
        cipherText: crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        Buffer.from(message)), privateKey };
```

Para poder cifrar tenemos que hacer una consulta **POST** a la dirección **http://server_ip:puerto/sec/rsa/encrypt**, el cuerpo de la consulta solo debe llevar un atributo **message**.

La respuesta del servidor será el texto cifrado y la clave privada para poder decifrarlo.

```json
{
  "answer": {
    "cipherText": "Qm1zOy/aQe4ZK+scjoTYgde/F85f4AYEfUYrbtryhi4rrnZMThj0wjnuZ/snaUdgKdiH6AzJUbKBD5dK+ADDrvq7rrSp9hcnfV5qc+5OnXcdkaTbfmBjrO/g7F4ql2DdW2O2MIKE2bu0V29HWkRno1ipKpZWDiTh2FP+YNjR94Hwz9seCTOvmFRNWdg52PMdZHGhWdvLjofb+ee9HL97rXPjMovlf3+Hsi7Vkma3O7OR76A+uatlVjmiHVZw7VG79uCh7xtLedHj7eYtazwwo/3fI3JpTen/9VLCa68+xFQB0+3dffuvG+UdZ7d+Tpj1+BHu2u31Yw9rCk2pqu5zZg==",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDLgsYB9LV5ilcY\nHJnT9CRWeQYn8TmrWoSi3irkX1/NCcGxcDjKbnGNURGQHWHLE8iy6GPVKFmgdEZn\ny1MVSCjs13H757A243XYU7oD8EIt5HC1inPCO+vMwAGA7BQt32XX++R96gKLs5pG\n+buuX9wO4vJcHLMb9qe4LbWFIuaOSeVhh9f9FEAg7pc1yz06Fb4PfsbryCLFCeU/\n4MWae7aiqxA/LrIA9pxBqgA1kqiVzgUrNyES5qaUtVd+MEQ/fQ8ao5vbSvVEyGxW\nLrqlXAVaE0kYjLKGrGH1fds0yRscvcSdSu63hUjopZrKr+MycQyqF/HDX2KHI+Hi\nF4b3U1JrAgMBAAECggEBAL9Q/yhTjk7mGJ5YNNymxYptV7Yw9g/6lnot9ZCfgIZW\nx7oxT5IuZZ1+Os6KcKbiwGhAQ6ndtvQ6mv10jXSSU7bjiwpPcr8G8oAdpd+R/AT8\nnmBr+gr9Hd1sG33Bce719t4mtVURqrb+buiOWTvCbjOockLZ0B9Xr7BbeCvi9W+I\np2tNad8991/4ls612d3vTMjnU4AqLPlLDUUAIE4GPo5VpbsxB7zn7U8ryd2QPcAy\nNbdzpelmnUyRYZnqvIx8fY06vOC0XXU2mqgRLuLqyTEk4rYC00fGThsc0grCikdX\n0IxoVF9JHM/Ct+ytE+E67OzcRODy9C2Pq1ED+fNYgHECgYEA5ZnD7Net0o2BAYS6\nWFuuVLq9+jOW0aczSAduWzTNPRPEpO5Ac6zGLU6eMsGKJ49hw0s1qxdhpusP/EeF\nbhUkRqeW1zQzCiCoj1lJ6Xtrnrm5c3b8+U1ecZQISe9ml2su2jB9yqwyHah25NLt\ntgVH264cwLGPfmd6GhSLlBVpVtUCgYEA4ukPtlbnzQMYIFPhIdFTskMClSif47aQ\nzhGGGO4o80Cdp1JU+NaL68hicz0o2+e3YhZZgvV5yP4K+5TBbjKvolshqxFHHL0s\n/F1rSF3uDpH/prts1NQLcK2aYKHigYZrPWk/yXiw6uAM59lWp62HAZD/TE5Jf/th\ngpdw5QPtJD8CgYA1EMvqspKXJmNZoX6cK1xoctyztja2cAl3LViBNfv1kNsTL4mv\n8o+/Kvt/SaIPsKDszTYzO+0y8gM40KLzJWnD9rnzNTpSreencgCWORNPlSdam3au\nfAZHA+rCg9VXS8uBXFHGhPP0TNpl2qZcOm44RM6abq92jJ345yS3bhdxnQKBgQCG\nd2CVSJjjN+MzPSHb/YVgzS8Zn1JpCkZzp5TU70WbKX6DqlmqgNG4Ly6QZfzxnDZj\nTSVMYxYBkvKFNhkOqcDFMMYZ7wo6MK0Y/G9YGjm5rrFWaBlNYj9JTcd/Xk+xPCwO\n33EqfngxKAbd2kDs6vtnZTq1SGtsCVc2oXIIdTQx1wKBgQC8jyftF02fn0ga5gYw\n7AF1F/q5ZxCSkxJWQIg7LrgesyjbuNNIuU95hBFETqHFxlfEWpltJbXNIOpR8jZp\nKipSMNCme9vEIJ4yufd7ZY5+iv4YwV64xzkvLZPli40SBug4fdhkRUAxy85nqWg8\n8VtBUIVA5TlBjbVfPPuylotZ4Q==\n-----END PRIVATE KEY-----\n"
  }
}
```

Para poder decifrar el texto tendremos que hacer una petición **POST** a la dirección **http://server_ip:puerto/sec/rsa/decrypt**, junto a los atributos: **cipherText** y **privateKey**. Si se ingresan correctamente el servidor retornará el mensaje decifrado.

```json
{
  "answer": "Seguridad informática"
}
```

## Cifrado y decifrado ECIES



