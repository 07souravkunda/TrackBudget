const axios = require("axios");

axios
  .get(
    "https://budget-app-f1f69.firebaseio.com/budgets/sourav/month/january.json"
  )
  .then(res => {
    console.log(res.data);
  })
  .catch(er => {
    console.log(er.data);
  });
