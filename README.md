# Implementación de librerías criptográficas en Node.js

Este proyecto es un ejercicio de implementación de algunas de las librerías criptográficas más conocidas de Node.js, la idea principal es ver su funcionamiento y características.

## Sobre la implementación
Esta API fue programada en javascript y se utilizó la librería **express** para montar el servidor. También se conectó el servidor a una base de datos en mongoDB, la cual, para que funcione su conexión se debe agregar un archivo **config.json** que tenga un atributo llamado *connectionString*, el cual como valor va a tener la cadena de conexión a la base de datos de mongo que se quiera utilizar.

```json
{
	"connectionString": "mongodb://localhost/mydb"
}
```

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


