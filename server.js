const express = require("express");
const axios = require("axios");

const app = express();

app.get("/contingencia", async (req, res) => {

  try {

    const r = await axios.get(
  "https://www.gob.mx/comisionambiental",
  {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    }
  }
);

    const texto = r.data.toLowerCase().replace(/\s+/g, " ");
    console.log(texto.slice(0,500));
    let estado = "ninguna";

    if (texto.includes("fase ii")) estado = "faseII";
    else if (texto.includes("fase i")) estado = "faseI";

    res.json({
  estado: estado,
  manana: "ninguna",
  debug: texto.slice(0,500)
});

  } catch (e) {

    res.json({
      estado: "error"
    });

  }

});

app.listen(3000, () => {
  console.log("API contingencia lista en puerto 3000");

});







