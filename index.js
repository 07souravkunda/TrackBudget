if (!localStorage.getItem("auth_token")) {
  window.location = "login.html";
} else {
  document.getElementById("logout_btn").addEventListener("click", e => {
    localStorage.removeItem("userId");
    localStorage.removeItem("auth_token");
    window.location = "login.html";
  });

  const fetchBudget = async () => {
    try {
      let data = await fetch(
        `https://budget-app-f1f69.firebaseio.com/budgets.json?auth=${localStorage.getItem(
          "auth_token"
        )}&orderBy="userId"&equalTo="${localStorage.getItem("userId")}"`,
        {
          mode: "cors"
        }
      );
      data = await data.json();
      console.log(data);
      let month = UIController.displayMonth();
      data = Object.keys(data).map(el => {
        if (data[el]["month"] === month) {
          data[el].name = el;
          return data[el];
        }
      });
      return data;
    } catch (er) {
      console.log(er);
    }
  };

  const displayInitialItem = async () => {
    try {
      let obj;
      const data = await fetchBudget();
      let i = 1,
        j = 1;
      console.log(data);
      data.forEach(el => {
        if (el["value"] * 1 > 0) {
          obj = dataController.addItem("inc", {
            name: el.name,
            description: el["desc"],
            value: el["value"] * 1
          });
          UIController.addListItem(
            {
              Id: obj.Id,
              desc: el["desc"],
              value: el["value"] * 1
            },
            "inc"
          );
          i++;
        } else {
          obj = dataController.addItem("exp", {
            name: el.name,
            description: el["desc"],
            value: el["value"] * -1
          });
          UIController.addListItem(
            {
              Id: obj.Id,
              desc: el["desc"],
              value: el["value"] * -1
            },
            "exp"
          );
          j++;
        }
      });
    } catch (er) {
      console.log(er);
    }
  };

  var dataController = (function() {
    //datastructure
    var Expense = function(Id, desc, value) {
      (this.Id = Id), (this.desc = desc), (this.value = value);
    };
    var Income = function(Id, desc, value) {
      (this.Id = Id), (this.value = value), (this.desc = desc);
    };
    var data = {
      allItems: {
        inc: [],
        exp: []
      },
      totals: {
        inc: 0,
        exp: 0
      },

      budget: 0,

      percentage: -1
    };

    var calculateTotal = function(type) {
      var sum = 0;
      data.allItems[type].forEach(function(cur) {
        sum += cur.value;
      });
      data.totals[type] = sum;
    };

    var calculatePercentages = function(type) {
      var percentages;
      percentages = data.allItems[type].map(function(current) {
        if (data.totals.inc > 0)
          return Math.round((current.value / data.totals.inc) * 100);
        else return -1;
      });
      return percentages;
    };

    return {
      addItem: function(type, input) {
        var obj, Id;
        if (data.allItems[type].length === 0) Id = 0;
        else Id = data.allItems[type][data.allItems[type].length - 1].Id + 1;

        if (type === "exp") {
          obj = new Expense(Id, input.description, input.value);
        } else if (type === "inc") {
          obj = new Income(Id, input.description, input.value);
        }
        obj.name = input.name;
        data.allItems[type].push(obj);

        return obj;
      },

      deleteItem: async function(type, id) {
        var ids, index;

        ids = data.allItems[type].map(function(cur) {
          return cur.Id;
        });
        index = ids.indexOf(id);
        if (index !== -1) {
          try {
            console.log(data.allItems[type][index].name);
            await fetch(
              `https://budget-app-f1f69.firebaseio.com/budgets/${
                data.allItems[type][index].name
              }.json?auth=${localStorage.getItem("auth_token")}`,
              {
                method: "DELETE",
                mode: "cors"
              }
            );
            data.allItems[type].splice(index, 1);
          } catch (er) {
            console.log(er);
          }
        }
      },
      calculateBudget: function() {
        //calculate inc and exp

        calculateTotal("inc");
        calculateTotal("exp");

        //calculate total budget
        data.budget = data.totals.inc - data.totals.exp;

        //calculate percentage
        if (data.totals.inc > 0) {
          data.percentage = Math.round(
            (data.totals.exp / data.totals.inc) * 100
          );
        } else {
          data.percentage = -1;
        }
      },
      getBudget: function() {
        return {
          budget: data.budget,
          totalExp: data.totals.exp,
          totalInc: data.totals.inc,
          percentage: data.percentage
        };
      },
      getPercentages: function() {
        var perc = calculatePercentages("exp");
        return perc;
      },

      testing: function() {
        console.log(data);
      }
    };
  })();

  var UIController = (function() {
    var DOMStrings;

    DOMStrings = {
      inputType: ".add__type",
      inputDescription: ".add__description",
      inputValue: ".add__value",
      inputBtn: ".add__btn",
      incomeContainer: ".income__list",
      expensesContainer: ".expenses__list",
      budgetLabel: ".budget__value",
      incomeLabel: ".budget__income--value",
      expensesLabel: ".budget__expenses--value",
      percentageLabel: ".budget__expenses--percentage",
      container: ".container",
      expensesPercLabel: ".item__percentage",
      dateLabel: ".budget__title--month"
    };

    var nodeListForEach = function(list, callback) {
      var i;
      for (i = 0; i < list.length; i++) callback(list[i], i);
    };

    return {
      getInput: function() {
        return {
          type: document.querySelector(DOMStrings.inputType).value,
          description: document.querySelector(DOMStrings.inputDescription)
            .value,
          value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
        };
      },

      addListItem: function(item, type) {
        var html, newHtml, element;
        if (type === "inc") {
          html =
            '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
          element = DOMStrings.incomeContainer;
        } else {
          html =
            '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
          element = DOMStrings.expensesContainer;
        }

        newHtml = html.replace("%id%", item.Id);
        newHtml = newHtml.replace("%description%", item.desc);
        newHtml = newHtml.replace("%value%", item.value);

        document
          .querySelector(element)
          .insertAdjacentHTML("beforeend", newHtml);
      },

      deleteListItem: function(id) {
        var el = document.getElementById(id);
        console.log("ho");
        el.parentNode.removeChild(el);
      },
      deleteFields: function() {
        var fields, fieldsArray;

        fields = document.querySelectorAll(
          DOMStrings.inputDescription + ", " + DOMStrings.inputValue
        );
        fieldsArray = Array.prototype.slice.call(fields);

        fieldsArray.forEach(function(current, index, array) {
          current.value = "";
        });
        fieldsArray[0].focus();
      },
      displayBudget: function(obj) {
        document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
        document.querySelector(DOMStrings.incomeLabel).textContent =
          obj.totalInc;
        document.querySelector(DOMStrings.expensesLabel).textContent =
          obj.totalExp;

        if (obj.percentage > 0)
          document.querySelector(DOMStrings.percentageLabel).textContent =
            obj.percentage + "%";
        else
          document.querySelector(DOMStrings.percentageLabel).textContent =
            "---";
      },

      displayMonth: function() {
        var now, year, month, months;
        now = new Date();
        year = 1900 + now.getYear();
        month = now.getMonth();
        months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "july",
          "August",
          "September",
          "October",
          "November",
          "December"
        ];
        document.querySelector(DOMStrings.dateLabel).textContent =
          months[month] + " " + year;
        return months[month];
      },
      displayPercentages: function(perc) {
        var objList = document.querySelectorAll(DOMStrings.expensesPercLabel);

        nodeListForEach(objList, function(current, index) {
          if (perc[index] > 0) {
            current.textContent = perc[index] + "%";
          } else {
            current.textContent = "---";
          }
        });
      },

      changeFocus: function() {
        var objList;
        objList = document.querySelectorAll(
          DOMStrings.inputType +
            "," +
            DOMStrings.inputDescription +
            "," +
            DOMStrings.inputValue
        );
        nodeListForEach(objList, function(current, index) {
          current.classList.toggle("red-focus");
        });
        document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
      },

      getDOM: function() {
        return DOMStrings;
      }
    };
  })();

  var controller = (function(UICtrl, dataCtrl) {
    //add event handler
    var inData, DOM;
    DOM = UICtrl.getDOM();
    var setUpEventListener = async function() {
      document
        .querySelector(DOM.inputBtn)
        .addEventListener("click", await ctrlAddItem);

      document.addEventListener("keypress", function(event) {
        if (event.keyCode === 13 || event.which === 13) ctrlAddItem();
      });
      document
        .querySelector(DOM.container)
        .addEventListener("click", ctrlDeleteItem);

      document
        .querySelector(DOM.inputType)
        .addEventListener("change", UICtrl.changeFocus);
    };
    var updateBudget = function() {
      var budg;
      //calculate budget
      dataCtrl.calculateBudget();

      //get budget
      budg = dataCtrl.getBudget();

      //display budget on UI
      UICtrl.displayBudget(budg);
    };

    var updatePercentages = function() {
      var perc;
      perc = dataCtrl.getPercentages();

      UICtrl.displayPercentages(perc);
    };

    var ctrlAddItem = async function() {
      var objList, objArr;
      //get input data
      try {
        inData = UICtrl.getInput();

        if (
          inData.value > 0 &&
          inData.description !== "" &&
          !isNaN(inData.value)
        ) {
          const data = {};
          if (inData.type === "inc") {
            data["value"] = inData.value;
          } else {
            data["value"] = inData.value * -1;
          }
          data["desc"] = inData.description;
          data["month"] = UIController.displayMonth();
          data["createdAt"] = Date.now().toString();
          data["userId"] = localStorage.getItem("userId");

          let res = await fetch(
            `https://budget-app-f1f69.firebaseio.com/budgets.json?auth=${localStorage.getItem(
              "auth_token"
            )}`,
            {
              method: "POST",
              mode: "cors",
              body: JSON.stringify(data)
            }
          );
          res = await res.json();
          console.log(res);
          inData["name"] = res.name;
          //add item to the budget controller
          newItem = dataCtrl.addItem(inData.type, inData);

          //add item to UI
          UICtrl.addListItem(newItem, inData.type);

          UICtrl.deleteFields();

          //calculate budget
          updateBudget();

          updatePercentages();
          // console.log(er);
        }
      } catch (er) {
        console.log(er);
      }
    };
    var ctrlDeleteItem = async function(event) {
      var id, type, splitId, itemId;
      //delete item from ds
      itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
      splitId = itemId.split("-");
      id = parseInt(splitId[1]);
      type = splitId[0];
      try {
        if (id >= 0) {
          await dataCtrl.deleteItem(type, id);

          UICtrl.deleteListItem(itemId);

          updateBudget();

          updatePercentages();
        }
      } catch (er) {
        console.log(er);
      }
    };

    return {
      init: async function() {
        setUpEventListener();
        const month = UICtrl.displayMonth();
        console.log("app has strated");
        UICtrl.displayBudget({
          budget: 0,
          totalExp: 0,
          totalInc: 0,
          percentage: -1
        });
        try {
          await displayInitialItem();
          updateBudget();
          updatePercentages();
          console.log("displayed");
        } catch (err) {
          console.log(err);
        }
      },
      display: function() {
        console.log(inData);
      }
    };
  })(UIController, dataController);

  controller.init();
}
