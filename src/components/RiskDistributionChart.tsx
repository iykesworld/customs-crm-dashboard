// frontend/src/components/RiskDistributionChart.tsx

"use client"

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Shipment {
    riskLevel: 'Low' | 'Medium' | 'High';
}

interface RiskDistributionChartProps {
    shipments: Shipment[];
}

export default function RiskDistributionChart({ shipments }: RiskDistributionChartProps) {
    // Calculate counts dynamically from filtered shipments
    const highCount = shipments.filter((s) => s.riskLevel === "High").length;
    const mediumCount = shipments.filter((s) => s.riskLevel === "Medium").length;
    const lowCount = shipments.filter((s) => s.riskLevel === "Low").length;
    const total = highCount + mediumCount + lowCount;

    const data = {
        labels: ["High Risk", "Medium Risk", "Low Risk"],
        datasets: [
            {
                data: [highCount, mediumCount, lowCount],
                backgroundColor: [
                    "rgb(239, 68, 68)", // High - red-500
                    "rgb(245, 158, 11)", // Medium - amber-500
                    "rgb(16, 185, 129)", // Low - emerald-500
                ],
                borderColor: ["#fff", "#fff", "#fff"],
                borderWidth: 2,
            },
        ],
    };

    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    padding: 20,
                    font: {
                        size: 12,
                    },
                    color: "rgb(51, 65, 85)", // text-gray-700
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 13,
                },
                callbacks: {
                    label: (context) => {
                        const label = context.label || "";
                        const value = context.parsed || 0;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} Shipments (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="flex items-center justify-center" style={{ height: "300px" }}>
            {total > 0 ? (
                <Doughnut data={data} options={options} />
            ) : (
                <p className="text-gray-500">No shipments matched the current filter.</p>
            )}
        </div>
    );
}