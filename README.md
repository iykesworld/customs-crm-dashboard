# 🚢 Cargo Risk Profiling Dashboard

An interactive **Customs Cargo Risk Management Dashboard** built with **Next.js**, **Chart.js**, and **shadcn/ui** components.  
This project demonstrates data-driven decision-making and modern web development techniques applied to **Customs Risk Management** — a critical function in trade facilitation and border security.

---

## 🧭 Project Overview

The **Cargo Risk Profiling Dashboard** simulates how customs officers can use technology to **prioritize high-risk cargo shipments** using data analytics and visualization.  
It presents a clean, professional interface inspired by real-world customs systems, emphasizing usability and operational insight.

This project was created as part of interview preparation for the **Nigeria Customs Service (NCS)** Superintendent Cadre, aligning closely with NCS’s focus on **risk-based cargo inspection** and **data-driven enforcement**.

---

## 🎯 Project Goal

To design and implement a **web-based interactive dashboard** that:

- Visualizes **mock trade and inspection data**
- Applies **simplified predictive risk scoring**
- Helps customs officers identify **high-risk cargo containers**
- Demonstrates practical understanding of **customs risk management** and **modern web technologies**

---

## 🧩 Features

### 1. **KPI Cards (Top Row)**
Displays key operational statistics:
- **Total Shipments**
- **High Risk Count**
- **Average Risk Score**

### 2. **Visualization Section (Middle Row)**
- **Doughnut Chart:** Risk Level Distribution (High / Medium / Low)  
- **Bar Chart:** High-Risk Shipments by Country of Origin

### 3. **Shipment Prioritization Table (Bottom)**
- Search and Filter by Risk Level  
- Displays Shipment ID, Risk Level (with color badges), Risk Score, and Country of Origin  
- Color-coded badges for quick risk identification (🟥 High, 🟨 Medium, 🟩 Low)

---

## 🧠 Data Model (Mock Data)

Each record in the dataset represents a shipment and includes:
| Field | Description |
|--------|--------------|
| `shipmentId` | Unique cargo identifier |
| `importerHistoryScore` | Numeric indicator of importer reliability |
| `countryOfOrigin` | Country from which goods are shipped |
| `declaredValue` | Declared monetary value of the shipment |
| `declaredCommodity` | Type of goods declared |
| `pastViolations` | Boolean flag for importer’s past customs violations |
| `riskScore` | Computed using a weighted risk formula |

---

## 🧮 Risk Scoring Logic (Simplified Example)

A sample scoring function was applied to determine risk levels:

```js
riskScore = (importerHistoryScore * 0.3)
           + (countryRiskFactor * 0.3)
           + (violationHistory ? 0.4 : 0);

npm run dev to run 
