const express = require("express");

const app = express();

let estadoActual = {
  estado: "ninguna",

  sabado: {
    hologramas: [],
    digitos: []
  }
};

app.get("/contingencia", (req,res)=>{
  res.json(estadoActual);
});

app.listen(3000, () => {
  console.log("API contingencia lista en puerto 3000");
});
