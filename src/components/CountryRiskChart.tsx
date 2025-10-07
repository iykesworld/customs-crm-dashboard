// frontend/src/components/CountryRiskChart.tsx

"use client"

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, type ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Shipment {
    countryOfOrigin: string;
    riskLevel: 'Low' | 'Medium' | 'High';
}

interface CountryRiskChartProps {
    shipments: Shipment[];
}

export default function CountryRiskChart({ shipments }: CountryRiskChartProps) {
    // 1. Aggregate high risk counts by country
    const countryHighRisk = shipments.reduce((acc, shipment) => {
        if (shipment.riskLevel === 'High') {
            // Use countryOfOrigin field from the main data model
            acc[shipment.countryOfOrigin] = (acc[shipment.countryOfOrigin] || 0) + 1;
        }
        return acc;
    }, {} as { [key: string]: number });

    // 2. Sort countries by risk count descending
    const sortedCountries = Object.keys(countryHighRisk).sort((a, b) => countryHighRisk[b] - countryHighRisk[a]);

    const data = {
        labels: sortedCountries,
        datasets: [
            {
                label: 'High Risk Shipments',
                data: sortedCountries.map(country => countryHighRisk[country]),
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // Tailwind blue-500
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    font: { size: 12 },
                    color: 'rgb(51, 65, 85)',
                }
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of High Risk Shipments',
                    color: 'rgb(107, 114, 128)',
                },
                ticks: {
                    precision: 0,
                    color: 'rgb(51, 65, 85)',
                }
            },
            x: {
                ticks: {
                    color: 'rgb(51, 65, 85)',
                }
            }
        }
    };

    return (
        <div style={{ height: '300px' }}>
            {sortedCountries.length > 0 ? (
                <Bar data={data} options={options} />
            ) : (
                <p className="text-gray-500">No High Risk data to display based on current filters.</p>
            )}
        </div>
    );
}