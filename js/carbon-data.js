/** @type {Readonly<Object>} */
const CARBON_BENCHMARKS = Object.freeze({
  transport:  { name: "Transportation",      expected: 120, color: "#ef4444" },
  energy:     { name: "Home Energy",         expected: 130, color: "#f97316" },
  food:       { name: "Food & Diet",         expected: 250, color: "#eab308" },
  waste:      { name: "Waste & Recycling",   expected: 30,  color: "#22c55e" },
  goods:      { name: "Goods & Consumption", expected: 120, color: "#3b82f6" },
  water:      { name: "Water Usage",         expected: 80,  color: "#06b6d4" },
  technology: { name: "Technology",          expected: 70,  color: "#8b5cf6" },
  aviation:   { name: "Aviation",            expected: 900, color: "#6366f1" }
});

const DIET_EMISSIONS = Object.freeze({
  Vegan:       125,
  Vegetarian:  170,
  Mixed:       250,
  "High Meat": 350
});

const EF = Object.freeze({
  petrol:      2.31,   
  diesel:      2.68,   
  electric:    0.05,   
  electricity: 0.35,   
  naturalGas:  3.0,    
  foodWaste:   2.0,    
  waste:       4.0,    
  clothing:    20,     
  electronics: 80,    
  water:       0.01,  
  laptop:      3,      
  device:      12,     
  shortFlight: 150,    
  longFlight:  700    
});

const AVERAGE_MONTHLY_FOOTPRINT = 550;