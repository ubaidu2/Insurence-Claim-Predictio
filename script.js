// Logistic model (demo coefficients)
const MODEL = {
  intercept: -3.0,
  age_coef: 0.03,
  gender_coef: 0.5,
  policy_premium_coef: 0.4,
  policy_gold_coef: 0.8,
  prev_claims_coef: 1.2,
  vehicle_age_coef: -0.1,
  premium_coef: 0.00002
};

function computeScore(f) {
  let s = MODEL.intercept;
  s += MODEL.age_coef * f.age;
  s += MODEL.gender_coef * f.gender;
  if (f.policy === 1) s += MODEL.policy_premium_coef;
  if (f.policy === 2) s += MODEL.policy_gold_coef;
  s += MODEL.prev_claims_coef * f.previous_claims;
  s += MODEL.vehicle_age_coef * f.vehicle_age;
  s += MODEL.premium_coef * f.annual_premium;
  return s;
}

function sigmoid(x){
  if(x >= 0) return 1/(1+Math.exp(-x));
  const ex = Math.exp(x);
  return ex/(1+ex);
}

function predictProb(f){
  return sigmoid(computeScore(f));
}

function readForm(){
  return {
    age: Number(document.getElementById('age').value),
    gender: Number(document.getElementById('gender').value),
    policy: Number(document.getElementById('policy').value),
    vehicle_age: Number(document.getElementById('vehicle_age').value),
    previous_claims: Number(document.getElementById('previous_claims').value),
    annual_premium: Number(document.getElementById('annual_premium').value),
  };
}

function showPrediction(prob){
  const output = document.getElementById("prediction-output");
  let div = document.createElement("div");
  div.className = "result " + (prob >= 0.5 ? "good" : "bad");
  div.textContent = (prob >= 0.5 ? "Likely to Claim: " : "Unlikely to Claim: ") + 
                    (prob*100).toFixed(1) + "%";
  output.innerHTML = "";
  output.appendChild(div);
}

// table storage
let rows = [];
const tableBody = document.querySelector("#data-table tbody");

function renderTable(){
  tableBody.innerHTML = "";

  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${r.age}</td>
      <td>${r.gender == 1 ? "M" : "F"}</td>
      <td>${["Basic","Premium","Gold"][r.policy]}</td>
      <td>${r.vehicle_age}</td>
      <td>${r.previous_claims}</td>
      <td>${r.annual_premium}</td>
      <td>${(r.prob * 100).toFixed(1)}%</td>
      <td><button class="delete-btn" data-index="${i}">Delete</button></td>
    `;

    tableBody.appendChild(tr);
  });

  // Delete feature
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const index = this.getAttribute("data-index");
      rows.splice(index, 1);
      renderTable();
    });
  });
}

document.getElementById("predict-btn").addEventListener("click", () => {
  const f = readForm();
  const prob = predictProb(f);
  showPrediction(prob);
});

document.getElementById("add-row").addEventListener("click", () => {
  const f = readForm();
  const prob = predictProb(f);
  rows.push({...f, prob});
  renderTable();
});

document.getElementById("download-csv").addEventListener("click", () => {
  if(rows.length === 0) return alert("No data!");

  let csv = "age,gender,policy,vehicle_age,previous_claims,annual_premium,prob\n";
  rows.forEach(r => {
    csv += `${r.age},${r.gender},${r.policy},${r.vehicle_age},${r.previous_claims},${r.annual_premium},${r.prob}\n`;
  });

  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "insurance_data.csv";
  a.click();
});
