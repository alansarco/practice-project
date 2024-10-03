// React base styles
import typography from "assets/theme/base/typography";

function configs(labels, datasets) {
  return {
    data: {
      labels,
      tension: 0.4,
      borderWidth: 0,
      maxBarThickness: 6,
      datasets: [...datasets],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          color: '#344767',  // This will make the numbers white
          anchor: 'end',
          align: 'end',
          font: {
            size: 12,  // Adjust this size if needed
            family: typography.fontFamily,
            style: "normal",
            weight: 'bold',
            lineHeight: 1,
          }
        }
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
          },  
          ticks: {
            precision: 0,
            display: true,
            padding: 10,
            color: "#9ca2b7",
            font: {
              size: 10,   
              family: typography.fontFamily,
              style: "normal",
              lineHeight: 1,
            },
          },
        },
        x: {
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: true,
            drawTicks: true,
          },
          ticks: {
            display: true,
            color: "#9ca2b7",
            padding: 5,
            font: {
              size: 10,
              family: typography.fontFamily,
              style: "normal",
              lineHeight: 1,
            },
          },
        },
      },
    },
  };
}

export default configs;
