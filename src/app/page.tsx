// frontend/src/app/page.tsx
"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Search, Package, BarChart3 } from 'lucide-react';

// Import Chart components (Assuming you saved them in src/components)
import RiskDistributionChart from '../components/RiskDistributionChart';
import CountryRiskChart from "../components/CountryRiskChart"


// --- 1. TYPES AND MOCK DATA DEFINITION ---

interface Shipment {
    id: string;
    description: string;
    hsCode: string;
    importerHistoryScore: number; // 1 (Good) to 5 (Bad)
    countryOfOrigin: string;
    declaredValueUSD: number;
    isPastViolation: boolean;
    riskScore: number; // Calculated, 0 (Low) to 100 (High)
    riskLevel: 'Low' | 'Medium' | 'High';
}

// Simple weight structure for risk factors (Total Max Risk = 100)
const RISK_WEIGHTS = {
    importerHistory: 30, // Max impact: 30
    countryRisk: 30,     // Max impact: 30
    valueVariance: 20,   // Max impact: 20
    pastViolations: 20,  // Max impact: 20
};

// Define Country Risk Scores (Hypothetical)
const COUNTRY_RISK_SCORES: { [key: string]: number } = {
    'China': 0.8,    // High volume, moderate risk
    'USA': 0.1,      // Low risk
    'Germany': 0.2,  // Low risk
    'Turkey': 0.7,   // Moderate risk
    'India': 0.5,    // Moderate risk
    'Nigeria': 0.3,  // Domestic or low risk (for this model)
    'Brazil': 0.6,
};

// Mock dataset (15 shipments)
const mockShipments: Omit<Shipment, 'riskScore' | 'riskLevel'>[] = [
    { id: 'C49201', description: 'Used internal combustion engines', hsCode: '8407', importerHistoryScore: 5, countryOfOrigin: 'China', declaredValueUSD: 15000, isPastViolation: true },
    { id: 'D51109', description: 'Bulk shipment of unbranded textiles', hsCode: '6103', importerHistoryScore: 4, countryOfOrigin: 'Turkey', declaredValueUSD: 50000, isPastViolation: true },
    { id: 'E60045', description: 'High-value jewelry components', hsCode: '7113', importerHistoryScore: 3, countryOfOrigin: 'USA', declaredValueUSD: 95000, isPastViolation: false },
    { id: 'F72120', description: 'Laptops and networking equipment', hsCode: '8471', importerHistoryScore: 3, countryOfOrigin: 'China', declaredValueUSD: 80000, isPastViolation: false },
    { id: 'G83315', description: 'Pharmaceutical ingredients (bulk)', hsCode: '3004', importerHistoryScore: 2, countryOfOrigin: 'India', declaredValueUSD: 120000, isPastViolation: false },
    { id: 'H94411', description: 'Brand new vehicle spare parts', hsCode: '8708', importerHistoryScore: 4, countryOfOrigin: 'Germany', declaredValueUSD: 40000, isPastViolation: false },
    { id: 'A10001', description: 'Standard office printer paper', hsCode: '4802', importerHistoryScore: 1, countryOfOrigin: 'Nigeria', declaredValueUSD: 5000, isPastViolation: false },
    { id: 'B20002', description: 'Medical face masks (non-surgical)', hsCode: '9018', importerHistoryScore: 1, countryOfOrigin: 'China', declaredValueUSD: 20000, isPastViolation: false },
    { id: 'C31103', description: 'Industrial bolts and nuts', hsCode: '7318', importerHistoryScore: 2, countryOfOrigin: 'USA', declaredValueUSD: 10000, isPastViolation: false },
    { id: 'D42204', description: 'Children’s toys (plastic and wood)', hsCode: '9503', importerHistoryScore: 1, countryOfOrigin: 'Brazil', declaredValueUSD: 30000, isPastViolation: false },
    { id: 'E53305', description: 'Books and educational materials', hsCode: '4901', importerHistoryScore: 1, countryOfOrigin: 'India', declaredValueUSD: 15000, isPastViolation: false },
    { id: 'F64406', description: 'New sports bicycles', hsCode: '8712', importerHistoryScore: 2, countryOfOrigin: 'Germany', declaredValueUSD: 25000, isPastViolation: false },
    { id: 'G75507', description: 'Cotton towels and bed linen', hsCode: '6302', importerHistoryScore: 1, countryOfOrigin: 'Turkey', declaredValueUSD: 5000, isPastViolation: false },
    { id: 'H86608', description: 'Fresh fruit (oranges)', hsCode: '0805', importerHistoryScore: 2, countryOfOrigin: 'Nigeria', declaredValueUSD: 2000, isPastViolation: false },
    { id: 'I97709', description: 'Used clothing for resale', hsCode: '6309', importerHistoryScore: 3, countryOfOrigin: 'China', declaredValueUSD: 18000, isPastViolation: true },
];

// --- 2. RISK LOGIC IMPLEMENTATION ---

const calculateRisk = (shipment: Omit<Shipment, 'riskScore' | 'riskLevel'>): Shipment => {
    let score = 0;

    // 1. Importer History Risk (Weight: 30)
    // Score 1 (Good) -> 0 risk point; Score 5 (Bad) -> 30 risk points
    score += ((shipment.importerHistoryScore - 1) / 4) * RISK_WEIGHTS.importerHistory;

    // 2. Country Risk (Weight: 30)
    score += (COUNTRY_RISK_SCORES[shipment.countryOfOrigin] || 0) * RISK_WEIGHTS.countryRisk;

    // 3. Past Violations (Weight: 20)
    if (shipment.isPastViolation) {
        score += RISK_WEIGHTS.pastViolations;
    }

    // 4. Declared Value (Simple Value Variance Risk - Weight: 20)
    // Assume high value commodities (>$90k) carry more risk of tax evasion/misdeclaration
    if (shipment.declaredValueUSD > 90000) {
        score += RISK_WEIGHTS.valueVariance * 0.8;
    } else if (shipment.declaredValueUSD > 50000) {
        score += RISK_WEIGHTS.valueVariance * 0.4;
    }

    // Ensure score is between 0 and 100
    score = Math.min(100, Math.max(0, Math.round(score)));

    let riskLevel: 'Low' | 'Medium' | 'High';
    if (score >= 65) {
        riskLevel = 'High';
    } else if (score >= 35) {
        riskLevel = 'Medium';
    } else {
        riskLevel = 'Low';
    }

    return { ...shipment, riskScore: score, riskLevel };
};

// Calculate initial risk for all mock shipments
const initialData: Shipment[] = mockShipments.map(calculateRisk);

// --- 3. REACT COMPONENT ---

export default function CustomsDashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [riskFilter, setRiskFilter] = useState("all");

    // Filter and sort the data based on user inputs
    const filteredShipments = useMemo(() => {
        const filtered = initialData.filter((shipment) => {
            const matchesSearch = shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  shipment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  shipment.countryOfOrigin.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesFilter = riskFilter === "all" || shipment.riskLevel === riskFilter;

            return matchesSearch && matchesFilter;
        });

        // Sort by riskScore descending to prioritize high-risk items
        return filtered.sort((a, b) => b.riskScore - a.riskScore);
    }, [searchQuery, riskFilter]);

    // Calculate dynamic KPIs and stats from filtered data
    const riskStats = useMemo(() => {
        const counts = { Low: 0, Medium: 0, High: 0 };
        const totalScore = filteredShipments.reduce((sum, s) => sum + s.riskScore, 0);

        filteredShipments.forEach(shipment => {
            counts[shipment.riskLevel]++;
        });

        const highRiskCount = counts.High;
        const averageRiskScore = filteredShipments.length > 0 ? Math.round(totalScore / filteredShipments.length) : 0;
        
        return { highRiskCount, averageRiskScore, counts };
    }, [filteredShipments]);


    const getRiskBadgeVariant = (level: string) => {
        switch (level) {
            case "High":
                return "destructive";
            case "Medium":
                return "default"; // Assuming default for medium in ShadCN theme
            case "Low":
                return "secondary";
            default:
                return "default";
        }
    }

    // Helper to get text color based on score (for table)
    const getScoreTextColor = (score: number) => {
        if (score >= 65) return "text-red-600";
        if (score >= 35) return "text-yellow-600";
        return "text-green-600";
    }


    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <style jsx global>{`
                /* Defining custom colors for better clarity in the dashboard */
                :root {
                    --risk-high: #EF4444; /* Red-500 */
                    --risk-medium: #F59E0B; /* Amber-500 */
                    --risk-low: #10B981; /* Green-500 */
                }
            `}</style>
            
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-7 h-7 text-blue-600" />
                        <div>
                            <h1 className="text-xl font-bold text-blue-900">Customs Cargo Risk Management</h1>
                            <p className="text-xs text-gray-500">Predictive Modeling for Customs Prioritization</p>
                        </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600 hidden sm:block">
                        Total Shipments: {initialData.length}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* KPI Cards */}
                <div className="mb-8 grid gap-6 md:grid-cols-3">
                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Shipments In View</CardTitle>
                            <Package className="h-5 w-5 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{filteredShipments.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Filtered from {initialData.length} total records</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-l-4 border-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">High Risk Count</CardTitle>
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{riskStats.highRiskCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Requiring immediate attention</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{riskStats.averageRiskScore}</div>
                            <p className="text-xs text-muted-foreground mt-1">Out of 100 points (Filtered)</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Visualization Section */}
                <div className="mb-8 grid gap-6 lg:grid-cols-2">
                    {/* Risk Level Distribution Chart (Doughnut) */}
                    <Card className="lg:col-span-1 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">Risk Level Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RiskDistributionChart shipments={filteredShipments} />
                        </CardContent>
                    </Card>
                    
                    {/* Risk by Country Chart (Bar) */}
                    <Card className="lg:col-span-1 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">High Risk Shipments by Country</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CountryRiskChart shipments={filteredShipments} />
                        </CardContent>
                    </Card>
                </div>

                {/* Shipment Prioritization Table */}
                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Shipment Prioritization ({filteredShipments.length})
                        </CardTitle>
                        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search ID, Description, or Country..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-white text-foreground"
                                />
                            </div>
                            <Select value={riskFilter} onValueChange={setRiskFilter}>
                                <SelectTrigger className="w-full sm:w-[180px] bg-white text-foreground">
                                    <SelectValue placeholder="Filter by Risk" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['all', 'High', 'Medium', 'Low'].map(level => (
                                        <SelectItem key={level} value={level}>
                                            {level === 'all' ? 'All Risk Levels' : `${level} Risk`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-gray-200 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        {['Shipment ID', 'Risk Level', 'Risk Score', 'Importer History', 'Origin', 'Declared Value'].map(header => (
                                            <TableHead key={header} className="font-semibold text-gray-700">{header}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredShipments.length > 0 ? (
                                        filteredShipments.map((shipment) => (
                                            <TableRow 
                                                key={shipment.id} 
                                                className={`hover:bg-gray-100 ${shipment.riskLevel === 'High' ? 'bg-red-50/50 border-l-4 border-red-500' : ''}`}
                                            >
                                                <TableCell className="font-mono font-medium text-blue-800">{shipment.id}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getRiskBadgeVariant(shipment.riskLevel)} className="font-semibold">
                                                        {shipment.riskLevel}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`font-bold ${getScoreTextColor(shipment.riskScore)}`}>
                                                        {shipment.riskScore}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-gray-700">{shipment.importerHistoryScore} / 5</TableCell>
                                                <TableCell className="text-gray-700">{shipment.countryOfOrigin}</TableCell>
                                                <TableCell className="font-semibold text-gray-900">${shipment.declaredValueUSD.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No shipments found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 mt-12 bg-white">
                <div className="container mx-auto px-4 py-4 text-center">
                    <p className="text-sm text-gray-500">
                        © 2025 Cargo Risk Dashboard Prototype. Developed by AZI IKECHUKWU KENNETH.
                    </p>
                </div>
            </footer>
        </div>
    );
}