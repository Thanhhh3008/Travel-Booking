document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById('dashboardChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
          datasets: [{
            label: 'Doanh thu (triệu VND)',
            data: [120, 135, 150, 145, 160, 175, 200],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0,123,255,0.2)',
            fill: true,
            tension: 0.3
          }, {
            label: 'Số lượt đặt phòng',
            data: [50, 60, 55, 70, 80, 90, 100],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40,167,69,0.2)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
});

