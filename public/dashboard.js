// --------------------- Fetch Realtime Data ------------------------
async function fetchRealtime() {
    try {
        let res = await fetch('/data.json');
        let d = await res.json();

        updateRMSChart(d);
        updateStatus(d);
    } catch (err) {
        console.error("Realtime fetch error:", err);
    }
}

// --------------------- STATUS INDICATOR ------------------------
function updateStatus(d) {
    let s = document.getElementById("machineStatus");
    let rmsAvg = (d.RMS_X + d.RMS_Y + d.RMS_Z) / 3;

    if (rmsAvg < 0.05) {
        s.innerHTML = "🟢 Normal";
        s.style.color = "green";
    } else if (rmsAvg < 0.15) {
        s.innerHTML = "🟡 Warning";
        s.style.color = "gold";
    } else {
        s.innerHTML = "🔴 Fault";
        s.style.color = "red";
    }
}

// --------------------- RMS TIME CHART ------------------------
const rmsCtx = document.getElementById('rmsChart').getContext('2d');
let rmsChart = new Chart(rmsCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'RMS Avg',
            data: [],
            borderWidth: 2,
            borderColor: 'blue'
        }]
    },
    options: { responsive: true, maintainAspectRatio: false }
});

function updateRMSChart(d) {
    let rms = (d.RMS_X + d.RMS_Y + d.RMS_Z) / 3;

    rmsChart.data.labels.push(new Date().toLocaleTimeString());
    rmsChart.data.datasets[0].data.push(rms);

    if (rmsChart.data.labels.length > 50) {
        rmsChart.data.labels.shift();
        rmsChart.data.datasets[0].data.shift();
    }

    rmsChart.update();
}

// --------------------- FFT CHART ------------------------
const fftCtx = document.getElementById('fftChart').getContext('2d');
let fftChart = new Chart(fftCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'FFT Spectrum',
            data: [],
            borderWidth: 2,
            borderColor: 'red'
        }]
    },
    options: { responsive: true, maintainAspectRatio: false }
});

// --------------------- Auto Load MATLAB CSV ------------------------
async function loadLatestCSV() {
    try {
        let res = await fetch('/latest.csv');

        if (!res.ok) return;

        let csv = await res.text();
        let rows = csv.split("\n").map(r => r.split(","));

        let freq = rows.slice(1).map(r => parseFloat(r[0]));
        let amp = rows.slice(1).map(r => parseFloat(r[1]));

        fftChart.data.labels = freq;
        fftChart.data.datasets[0].data = amp;
        fftChart.update();
    }
    catch (err) {
        console.log("CSV not ready yet");
    }
}

setInterval(loadLatestCSV, 2000);

// --------------------- Manual Upload ------------------------
async function uploadCSV() {
    let fileInput = document.getElementById("csvUpload");
    if (fileInput.files.length === 0) {
        return alert("Choose CSV file");
    }

    let formData = new FormData();
    formData.append("file", fileInput.files[0]);

    await fetch("/upload-csv", {
        method: "POST",
        body: formData
    });

    loadLatestCSV();
    alert("CSV Uploaded!");
}

// ---------------------
setInterval(fetchRealtime, 2000);
fetchRealtime();
