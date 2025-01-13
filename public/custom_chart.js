window.onload = async () => {
  const res = await fetch("/admin/revenue/street_graph");
  const data = await res.json();
  let dataPoints1 = [];
  let sum = 0;
  data.forEach((d) => {
    sum += parseFloat(d.amount);
    let lbl = {
      y: d.amount,
      label: d.label,
    };

    dataPoints1.push(lbl);
  });

  // console.log({dataPoints1})
  var chart = new CanvasJS.Chart("chartContainer", {
    theme: "light1", // "light1", "light2", "dark1", "dark2"
    exportEnabled: true,
    animationEnabled: true,
    title: {
      text: `Assessments(${sum
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`,
    },
    data: [
      {
        type: "pie",
        // startAngle: 25,
        toolTipContent: "<b>{label}</b>: {y}",
        showInLegend: "true",
        legendText: "{label}",
        indexLabelFontSize: 16,
        indexLabel: "{label} - {y}",
        dataPoints: dataPoints1,
      },
    ],
  });
  chart.render();




  const res1 = await fetch("/admin/payment/street_graph");
  const data1 = await res1.json();

  let dataPoints2 = [];
  let sum1 = 0;
  data1.forEach((s) => {
    sum1 += parseFloat(s.amount);
    let lbl = {
      y: s.amount,
      label: s.label,
    };

    dataPoints2.push(lbl);
  });
  // console.log(dataPoints2);
  var chart1 = new CanvasJS.Chart("chartPayment", {
    theme: "light2", // "light1", "light2", "dark1", "dark2"
    exportEnabled: true,
    animationEnabled: true,
    title: {
      text: `Payments(${sum1
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`,
    },
    data: [
      {
        type: "pie",
        // startAngle: 25,
        toolTipContent: "<b>{label}</b>: {y}",
        showInLegend: "true",
        legendText: "{label}",
        indexLabelFontSize: 16,
        indexLabel: "{label} - {y}",
        dataPoints: dataPoints2,
      },
    ],
  });
  chart1.render();




  const res4 = await fetch("/admin/wallet_payment");
  const data4 = await res4.json();
  let dataPoint3 = [];

  let sum2 = 0;
  data4.forEach((s) => {
    sum2 += parseFloat(s.amount);
    let lbl = {
      y: s.amount,
      label: s.label,
    };

    dataPoint3.push(lbl);
  });

  console.log({dataPoint3})
  var chart4 = new CanvasJS.Chart("walletUpload", {
    theme: "light1", // "light1", "light2", "dark1", "dark2"
    exportEnabled: true,
    animationEnabled: true,
    title: {
      text: `Ticket(${sum2
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`,
    },
    
    data: [
      {
        type: "pie",
        // startAngle: 25,
        toolTipContent: "<b>{label}</b>: {y}",
        showInLegend: "true",
        legendText: "{label}",
        indexLabelFontSize: 16,
        indexLabel: "{label} - {y}",
        dataPoints: dataPoint3,
      },
    ],
  });
  chart4.render();
};


