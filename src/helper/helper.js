module.exports = {
    getDayWeekMonth: () => {
        const date = new Date();
    
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
    
        return { day, month, year}
    },

    groupBy: function(objectArray, property) {
        return objectArray.reduce((acc, obj) => {
          const key = obj[property];
          if (!acc[key]) {
              acc[key] = [];
          }
          // Add object to list for given key's value
          acc[key].push(obj);
          return acc;
        }, {});
    },

    PercentageCalculator1: async function (percentage, percentageAmount){
        return (parseFloat(percentage)/100) * parseFloat(percentageAmount);
    },

    randomNum: (len) => {
        len = len || 100;
        var nuc = "123456789";
        var i = 0;
        var n = 0;
        s = "";
        while (i <= len - 1) {
        n = Math.floor(Math.random() * 4);
        s += nuc[n];
        i++;
        }
        return s;
    },
    
}
