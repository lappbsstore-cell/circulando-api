const express = require("express");

const app = express();

let estadoActual = {
  estado: "faseI",

  sabado: {
    hologramas: ["0","00"],
    digitos: [1,3,5,7,9]
  }
};

app.get("/contingencia", (req,res)=>{
  res.json(estadoActual);
});

app.listen(3000, () => {
  console.log("API contingencia lista en puerto 3000");
});
