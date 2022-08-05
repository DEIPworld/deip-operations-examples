require("@babel/register")({
  "only": [
    function (filepath) {
      return filepath.includes("node_modules/@deip") 
      || filepath.includes("node_modules/@casimir") 
      || filepath.includes("casimir-frontend/packages") 
      || filepath.includes("node_modules/crc");
    },
  ]
});
require("./story");