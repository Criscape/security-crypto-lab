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
El cifrado y decifrado del algoritmo AES se realizó a través de la librería **Crypto-JS**. Para realizar el cifrado tenemos que enviar una solicitud **POST** a la dirección **http://server_ip:puerto/sec/aes/encrypt**.

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

Para realizar el cifrado y decifrado del algoritmo RSA se utilizó la librería **crypto** la cual es una librería integrada en node.js. Para cifrar con RSA primero genera las llaves publica y privada con un modulo de 2048 bits y en este caso, vamos a cifrar con clave publica y decifrar con clave privada.

```javascript
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