const bancos = [
    {
      "codigo": 7,
      "cuotas": "3 y 6 y 9 y 12 y 18",
      "ahora3": true,
      "ahora6": true,
      "banco": "BANCO DE GALICIA Y BUENOS AIRES S.A.U."
    },
    {
      "codigo": 11,
      "cuotas": "6 y 12 y 18",
      "ahora3": true,
      "ahora6": true,
      "banco": "BANCO DE LA NACION ARGENTINA"
    },
    {
      "codigo": 14,
      "cuotas": "12",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO DE LA PROVINCIA DE BUENOS AIRES"
    },
    {
      "codigo": 15,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "INDUSTRIAL AND COMMERCIAL BANK OF CHINA"
    },
    {
      "codigo": 16,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "CITIBANK N.A."
    },
    {
      "codigo": 17,
      "cuotas": "3 Y 6 Y 9 Y 12",
      "ahora3": true,
      "ahora6": false,
      "banco": "BANCO BBVA ARGENTINA S.A."
    },
    {
      "codigo": 20,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO DE LA PROVINCIA DE CORDOBA S.A."
    },
    {
      "codigo": 27,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO SUPERVIELLE S.A."
    },
    {
      "codigo": 29,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO DE LA CIUDAD DE BUENOS AIRES"
    },
    {
      "codigo": 34,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO PATAGONIA S.A."
    },
    {
      "codigo": 44,
      "cuotas": "6 y 12",
      "ahora3": true,
      "ahora6": true,
      "banco": "BANCO HIPOTECARIO S.A."
    },
    {
      "codigo": 45,
      "cuotas": "3 y 6 y 10 y 12",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO DE SAN JUAN S.A."
    },
    {
      "codigo": 72,
      "cuotas": "3 y 6 y 9 y 12 y 18",
      "ahora3": true,
      "ahora6": true,
      "banco": "BANCO SANTANDER ARGENTINA S.A."
    },
    {
      "codigo": 143,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BRUBANK S.A.U."
    },
    {
      "codigo": 147,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BIBANK S.A."
    },
    {
      "codigo": 150,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "HSBC BANK ARGENTINA S.A."
    },
    {
      "codigo": 158,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "OPEN BANK ARGENTINA S.A."
    },
    {
      "codigo": 191,
      "cuotas": "3 y 6 y 9 y 12",
      "ahora3": true,
      "ahora6": false,
      "banco": "BANCO CREDICOOP COOPERATIVO LIMITADO"
    },
    {
      "codigo": 198,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO DE VALORES S.A."
    },
    {
      "codigo": 259,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO ITAU ARGENTINA S.A."
    },
    {
      "codigo": 285,
      "cuotas": "3 y 6 y 12",
      "ahora3": true,
      "ahora6": true,
      "banco": "BANCO MACRO S.A."
    },
    {
      "codigo": 299,
      "cuotas": "3 y 6 y 12",
      "ahora3": true,
      "ahora6": true,
      "banco": "BANCO COMAFI SOCIEDAD ANONIMA"
    },
    {
      "codigo": 300,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO DE INVERSION Y COMERCIO EXTERIOR S"
    },
    {
      "codigo": 301,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO PIANO S.A."
    },
    {
      "codigo": 310,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO DEL SOL S.A."
    },
    {
      "codigo": 319,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO CMF S.A."
    },
    {
      "codigo": 321,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO DE SANTIAGO DEL ESTERO S.A."
    },
    {
      "codigo": 322,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO INDUSTRIAL S.A."
    },
    {
        "codigo": 330,
        "cuotas": "3 y 6 Y 10 Y 12",
        "ahora3": true,
        "ahora6": true,
        "banco": "NUEVO BANCO DE SANTA FE SOCIEDAD ANONIMA"
    },
    {
      "codigo": 340,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BACS BANCO DE CREDITO Y SECURITIZACION S"
    },
    {
      "codigo": 384,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "WILOBANK S.A.U."
    },
    {
      "codigo": 389,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO COLUMBIA S.A."
    },
    {
      "codigo": 426,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO BICA S.A."
    },
    {
      "codigo": 431,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO COINAG S.A."
    },
    {
      "codigo": 435,
      "cuotas": "",
      "ahora3": false,
      "ahora6": false,
      "banco": "BANCO SUCREDITO REGIONAL S.A.U."
    },
    {
      "codigo": 45030,
      "cuotas": "6 Y 9 Y 12",
      "ahora3": true,
      "ahora6": false,
      "banco": "NARANJA X, PLAN Z"
    },
    {
      "codigo": 434,
      "cuotas": "3 y 6 Y 10 Y 12",
      "ahora3": true,
      "ahora6": true,
      "banco": "BANCO SANTA CRUZ"
    },
    {
      "codigo": 2434,
      "cuotas": "3 y 6 Y 10 Y 12",
      "ahora3": true,
      "ahora6": true,
      "banco": "BANCO ENTRE RIOS"
    },
    {
      "codigo": 22434,
      "cuotas": "3 y 6 Y 9 Y 12",
      "ahora3": true,
      "ahora6": true,
      "banco": "NUEVO BANCO DEL CHACO TUYA"
    },
    {
      "codigo": 98,
      "cuotas": "6 Y 9 Y 12",
      "ahora3": true,
      "ahora6": true,
      "banco": "BANCO CORRIENTES"
    },
    {
      "codigo": 989,
      "cuotas": "3 Y 6 Y 12",
      "ahora3": true,
      "ahora6": true,
      "banco": "BPN"
    }
  ]
export default bancos  
