window.onload = async () => {
  // Helper function to fetch data and create charts
  const fetchDataAndRenderChart = async (url, containerId, titlePrefix) => {
    try {
      const response = await axios.get(url);
      const data = response.data;

      let dataPoints = [];
      let sum = 0;

      data.forEach((item) => {
        sum += parseFloat(item.amount);
        dataPoints.push({
          y: item.amount,
          label: item.label,
        });
      });

      const formattedSum = sum
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      // Render chart
      const chart = new CanvasJS.Chart(containerId, {
        theme: "light1", // "light1", "light2", "dark1", "dark2"
        exportEnabled: true,
        animationEnabled: true,
        title: {
          text: `${titlePrefix} (${formattedSum})`,
        },
        data: [
          {
            type: "pie",
            toolTipContent: "<b>{label}</b>: {y}",
            showInLegend: true,
            legendText: "{label}",
            indexLabelFontSize: 16,
            indexLabel: "{label} - {y}",
            dataPoints: dataPoints,
          },
        ],
      });

      chart.render();
    } catch (error) {
      console.error(`Error fetching data for ${titlePrefix}:`, error);
    }
  };

  // URLs and Chart Configuration
  const chartConfigurations = [
    {
      url: "/admin/revenue/street_graph",
      containerId: "chartContainer",
      titlePrefix: "Assessments",
    },
    {
      url: "/admin/payment/street_graph",
      containerId: "chartPayment",
      titlePrefix: "Payments",
    },
    {
      url: "/admin/wallet_payment",
      containerId: "walletUpload",
      titlePrefix: "Ticket",
    },

    {
      url: "/admin/generated_mandate/0",
      containerId: "generated_mandate",
      titlePrefix: "Enumerated revenue",
    },
    {
      url: "/admin/generated_mandate/1",
      containerId: "paid_generated_mandate",
      titlePrefix: "Paid Enumerated revenue",
    }
  ];

  // Fetch data and render charts for all configurations
  await Promise.all(
    chartConfigurations.map((config) =>
      fetchDataAndRenderChart(config.url, config.containerId, config.titlePrefix)
    )
  );
};


