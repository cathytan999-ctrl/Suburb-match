import { useState } from “react”;

// ── Colours ──────────────────────────────────────────────
const C = {
cream: “#fdf6ec”, warm: “#fff9f2”, orange: “#e8850a”, orangeL: “#f5a623”,
oBorder: “#f0c070”, oPale: “#fef8ec”, dark: “#2d2417”, mid: “#6b5a3e”,
light: “#9c8060”, grn: “#2e7d32”, red: “#c62828”, redBg: “#fff5f5”,
redBorder: “#ffcdd2”, goldDark: “#b8860b”,
};
const sans = “‘Inter’, system-ui, sans-serif”;
const serif = “‘Georgia’, serif”;
const iSt = { border: `1px solid #ddd`, borderRadius: 6, padding: “8px 11px”, fontSize: “0.84rem”, color: C.dark, background: “#fff”, outline: “none”, flex: 1, fontFamily: sans };
const lSt = { fontSize: “0.79rem”, color: C.mid, fontWeight: 500, minWidth: 150 };

// ── Tax calculation (2024-25) ─────────────────────────────
function calcAfterTax(gross, hecs) {
let tax = 0;
if (gross <= 18200) tax = 0;
else if (gross <= 45000) tax = (gross - 18200) * 0.19;
else if (gross <= 120000) tax = 5092 + (gross - 45000) * 0.325;
else if (gross <= 180000) tax = 29467 + (gross - 120000) * 0.37;
else tax = 51667 + (gross - 180000) * 0.45;
let lito = gross <= 37500 ? 700 : gross <= 66667 ? 700 - (gross - 37500) * (700 / 29167) : 0;
const incomeTax = Math.max(0, Math.round(tax - lito));
const medicare = gross > 26000 ? Math.round(gross * 0.02) : 0;
let hecsAmt = 0;
if (hecs) {
if (gross >= 154201) hecsAmt = Math.round(gross * 0.10);
else if (gross >= 117226) hecsAmt = Math.round(gross * 0.085);
else if (gross >= 88524) hecsAmt = Math.round(gross * 0.07);
else if (gross >= 66875) hecsAmt = Math.round(gross * 0.055);
else if (gross >= 50519) hecsAmt = Math.round(gross * 0.04);
else if (gross >= 38017) hecsAmt = Math.round(gross * 0.025);
else if (gross >= 31501) hecsAmt = Math.round(gross * 0.015);
}
const total = incomeTax + medicare + hecsAmt;
return { afterTax: Math.round(gross - total), incomeTax, medicare, hecs: hecsAmt, total, rate: ((total / gross) * 100).toFixed(1) };
}

// ── Land tax ─────────────────────────────────────────────
function calcLandTax(price, state) {
const lv = price * 0.35;
let t = 0;
if (state === “VIC”) { if (lv > 300000) t = 1600 + (lv - 300000) * 0.013; else if (lv > 100000) t = 100 + (lv - 100000) * 0.0075; else if (lv > 50000) t = (lv - 50000) * 0.002; }
else if (state === “NSW”) { if (lv > 1075000) t = 100 + (lv - 1075000) * 0.016; else t = 100; }
else if (state === “QLD”) { if (lv > 600000) t = (lv - 600000) * 0.01; }
else if (state === “WA”) { if (lv > 300000) t = (lv - 300000) * 0.0015; if (lv > 420000) t = 180 + (lv - 420000) * 0.0209; }
else if (state === “SA”) { if (lv > 681000) t = (lv - 681000) * 0.005; }
return Math.round(Math.max(0, t));
}

// ── Suburb database ───────────────────────────────────────
const DB = {
VIC: [
// Ballarat & Geelong regions
{ suburb:“Ballarat”, price:480000, rent:400, cap:8.5, rentG:5.3, schools:2, lifestyle:2, type:[“house”,“townhouse”] },
{ suburb:“Ballarat East”, price:450000, rent:385, cap:8.8, rentG:5.5, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Ballarat North”, price:460000, rent:390, cap:8.6, rentG:5.4, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Wendouree”, price:430000, rent:375, cap:9.0, rentG:5.6, schools:2, lifestyle:2, type:[“house”,“unit”] },
{ suburb:“Geelong”, price:660000, rent:470, cap:8.2, rentG:5.1, schools:3, lifestyle:4, type:[“house”,“unit”,“townhouse”] },
{ suburb:“Geelong West”, price:720000, rent:510, cap:7.8, rentG:4.9, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Belmont”, price:680000, rent:480, cap:7.5, rentG:4.8, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Norlane”, price:490000, rent:420, cap:8.0, rentG:5.2, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Corio”, price:470000, rent:410, cap:8.3, rentG:5.4, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Lara”, price:640000, rent:460, cap:7.2, rentG:4.6, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
// West Melbourne corridor
{ suburb:“Werribee”, price:655750, rent:470, cap:7.5, rentG:4.2, schools:3, lifestyle:3, type:[“house”,“townhouse”] }, // ✓ REA 27 Mar 2026
{ suburb:“Werribee South”,  price:745000,  rent:510,  cap:24.2, rentG:8.0,  schools:3, lifestyle:3, type:[“house”,“unit”] }, // ✓ REA 27 Mar 2026
{ suburb:“Deer Park”,        price:701000,  rent:480,  cap:6.2,  rentG:4.3,  schools:2, lifestyle:3, type:[“house”,“unit”] }, // ✓ REA 27 Mar 2026
{ suburb:“Williamstown”,     price:1563880, rent:810,  cap:0.9,  rentG:2.5,  schools:4, lifestyle:5, type:[“house”,“unit”] }, // ✓ REA 27 Mar 2026
{ suburb:“Canterbury”,       price:3750000, rent:1800, cap:14.9, rentG:5.0,  schools:5, lifestyle:5, type:[“house”] }, // ✓ REA 27 Mar 2026
{ suburb:“Balwyn”,           price:2888000, rent:1300, cap:0.0,  rentG:1.5,  schools:5, lifestyle:5, type:[“house”,“unit”] }, // ✓ REA 27 Mar 2026
{ suburb:“Balwyn North”,     price:2350000, rent:1100, cap:0.3,  rentG:1.8,  schools:5, lifestyle:5, type:[“house”,“unit”] }, // ✓ REA 27 Mar 2026
{ suburb:“Hoppers Crossing”, price:680000, rent:480, cap:9.6, rentG:4.1, schools:3, lifestyle:3, type:[“house”,“unit”] }, // ✓ REA 27 Mar 2026
{ suburb:“Wyndham Vale”, price:590000, rent:460, cap:7.2, rentG:4.5, schools:3, lifestyle:2, type:[“house”,“townhouse”] },
{ suburb:“Tarneit”, price:670000, rent:470, cap:3.1, rentG:4.4, schools:3, lifestyle:2, type:[“house”,“townhouse”] }, // ✓ REA 27 Mar 2026
{ suburb:“Point Cook”, price:820000, rent:540, cap:9.8, rentG:4.0, schools:5, lifestyle:4, type:[“house”,“townhouse”] }, // ✓ REA 27 Mar 2026
{ suburb:“Altona”, price:920000, rent:580, cap:5.6, rentG:3.7, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Altona North”, price:870000, rent:560, cap:5.8, rentG:3.8, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Laverton”, price:680000, rent:490, cap:6.5, rentG:4.1, schools:2, lifestyle:2, type:[“house”,“unit”] },
// North Melbourne corridor
{ suburb:“Craigieburn”, price:680000, rent:490, cap:6.5, rentG:4.1, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Mickleham”, price:640000, rent:470, cap:7.0, rentG:4.4, schools:3, lifestyle:2, type:[“house”,“townhouse”] },
{ suburb:“Roxburgh Park”, price:660000, rent:480, cap:6.8, rentG:4.3, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Broadmeadows”, price:620000, rent:480, cap:6.8, rentG:4.4, schools:2, lifestyle:2, type:[“house”,“unit”] },
{ suburb:“Meadow Heights”, price:640000, rent:485, cap:6.7, rentG:4.3, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Sunbury”, price:650000, rent:480, cap:7.0, rentG:4.5, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
// South-east Melbourne / Frankston corridor
{ suburb:“Frankston”, price:838000, rent:560, cap:14.8, rentG:4.5, schools:3, lifestyle:3, type:[“house”,“unit”] }, // ✓ REA 27 Mar 2026
{ suburb:“Frankston North”, price:695600, rent:490, cap:15.9, rentG:5.0, schools:2, lifestyle:2, type:[“house”] }, // ✓ REA 27 Mar 2026
{ suburb:“Frankston South”, price:820000, rent:540, cap:6.2, rentG:4.0, schools:4, lifestyle:4, type:[“house”] },
{ suburb:“Seaford”, price:750000, rent:510, cap:6.9, rentG:4.5, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Carrum Downs”, price:660000, rent:480, cap:7.2, rentG:4.7, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Langwarrin”, price:770000, rent:520, cap:6.5, rentG:4.2, schools:4, lifestyle:3, type:[“house”] },
{ suburb:“Skye”, price:680000, rent:490, cap:7.0, rentG:4.5, schools:3, lifestyle:3, type:[“house”] },
{ suburb:“Karingal”, price:690000, rent:495, cap:6.9, rentG:4.4, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Chelsea”, price:860000, rent:560, cap:6.2, rentG:4.1, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Edithvale”, price:830000, rent:545, cap:6.4, rentG:4.2, schools:3, lifestyle:4, type:[“house”] },
{ suburb:“Carrum”, price:900000, rent:570, cap:6.0, rentG:3.9, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Patterson Lakes”, price:920000, rent:575, cap:5.8, rentG:3.8, schools:3, lifestyle:4, type:[“house”] },
// Dandenong / outer south-east
{ suburb:“Dandenong”, price:680000, rent:500, cap:6.0, rentG:4.2, schools:2, lifestyle:2, type:[“house”,“unit”] },
{ suburb:“Dandenong North”, price:640000, rent:475, cap:6.5, rentG:4.4, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Springvale”, price:720000, rent:510, cap:6.2, rentG:4.1, schools:2, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Noble Park”, price:700000, rent:500, cap:6.3, rentG:4.2, schools:2, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Pakenham”, price:640000, rent:450, cap:7.1, rentG:4.5, schools:3, lifestyle:2, type:[“house”,“townhouse”] },
{ suburb:“Beaconsfield”, price:720000, rent:490, cap:6.8, rentG:4.4, schools:4, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Officer”, price:660000, rent:470, cap:7.0, rentG:4.6, schools:3, lifestyle:2, type:[“house”,“townhouse”] },
{ suburb:“Berwick”, price:780000, rent:520, cap:6.4, rentG:4.2, schools:4, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Narre Warren”, price:730000, rent:500, cap:6.6, rentG:4.3, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Cranbourne”, price:680000, rent:480, cap:7.0, rentG:4.5, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Cranbourne North”, price:700000, rent:490, cap:6.8, rentG:4.4, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Cranbourne East”, price:690000, rent:485, cap:6.9, rentG:4.5, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Clyde North”, price:650000, rent:470, cap:7.2, rentG:4.7, schools:3, lifestyle:2, type:[“house”,“townhouse”] },
// Middle suburbs
{ suburb:“Moorabbin”, price:950000, rent:610, cap:5.5, rentG:3.7, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Cheltenham”, price:1000000, rent:630, cap:5.4, rentG:3.6, schools:4, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Mentone”, price:1050000, rent:650, cap:5.3, rentG:3.5, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Mordialloc”, price:1080000, rent:660, cap:5.2, rentG:3.5, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Highett”, price:960000, rent:615, cap:5.5, rentG:3.7, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Oakleigh”, price:970000, rent:620, cap:5.4, rentG:3.6, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Clayton”, price:880000, rent:580, cap:5.8, rentG:3.8, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Reservoir”, price:820000, rent:550, cap:5.8, rentG:3.6, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Thomastown”, price:760000, rent:520, cap:6.2, rentG:4.1, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Epping”, price:740000, rent:510, cap:6.5, rentG:4.2, schools:3, lifestyle:3, type:[“house”,“unit”,“townhouse”] },
{ suburb:“Mill Park”, price:770000, rent:525, cap:6.2, rentG:4.0, schools:4, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“South Morang”, price:760000, rent:520, cap:6.3, rentG:4.1, schools:4, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Bundoora”, price:800000, rent:540, cap:6.0, rentG:3.9, schools:4, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Heidelberg”, price:880000, rent:570, cap:5.7, rentG:3.7, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Ringwood”, price:880000, rent:580, cap:5.5, rentG:3.5, schools:4, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Ringwood North”, price:950000, rent:605, cap:5.3, rentG:3.5, schools:4, lifestyle:4, type:[“house”] },
{ suburb:“Mitcham”, price:920000, rent:590, cap:5.5, rentG:3.6, schools:4, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Croydon”, price:850000, rent:560, cap:5.8, rentG:3.8, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Bayswater”, price:800000, rent:540, cap:6.0, rentG:4.0, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Kilsyth”, price:780000, rent:530, cap:6.2, rentG:4.1, schools:3, lifestyle:3, type:[“house”] },
{ suburb:“Glen Iris”,        price:1380000, rent:750,  cap:4.5,  rentG:3.0,  schools:5, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Hawthorn”,         price:1450000, rent:800,  cap:4.2,  rentG:2.8,  schools:4, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Hawthorn East”,    price:1350000, rent:740,  cap:4.4,  rentG:2.9,  schools:4, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Kew”,              price:1680000, rent:860,  cap:3.9,  rentG:2.6,  schools:5, lifestyle:5, type:[“house”] },
{ suburb:“Camberwell”,       price:1620000, rent:840,  cap:4.1,  rentG:2.7,  schools:5, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Ashburton”,        price:1280000, rent:680,  cap:4.8,  rentG:3.1,  schools:4, lifestyle:4, type:[“house”] },
{ suburb:“Malvern”,          price:1750000, rent:900,  cap:3.8,  rentG:2.5,  schools:5, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Malvern East”,     price:1420000, rent:760,  cap:4.3,  rentG:2.8,  schools:5, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Caulfield”,        price:1180000, rent:660,  cap:5.0,  rentG:3.3,  schools:4, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Caulfield North”,  price:1350000, rent:730,  cap:4.5,  rentG:3.0,  schools:4, lifestyle:4, type:[“house”] },
{ suburb:“Glen Huntly”,      price:1100000, rent:620,  cap:5.2,  rentG:3.4,  schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Bentleigh”,        price:1250000, rent:680,  cap:5.0,  rentG:3.2,  schools:4, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Bentleigh East”,   price:1150000, rent:650,  cap:5.2,  rentG:3.4,  schools:4, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Carnegie”,         price:1050000, rent:620,  cap:5.3,  rentG:3.5,  schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Ormond”,           price:1200000, rent:660,  cap:5.1,  rentG:3.3,  schools:4, lifestyle:4, type:[“house”] },
{ suburb:“McKinnon”,         price:1280000, rent:700,  cap:4.9,  rentG:3.2,  schools:5, lifestyle:4, type:[“house”] },
{ suburb:“Sandringham”,       price:1650000, rent:870,  cap:4.1,  rentG:2.8,  schools:4, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Black Rock”,        price:1750000, rent:900,  cap:3.9,  rentG:2.6,  schools:4, lifestyle:5, type:[“house”] },
{ suburb:“Beaumaris”,         price:1680000, rent:880,  cap:4.0,  rentG:2.7,  schools:4, lifestyle:5, type:[“house”] },
{ suburb:“Surrey Hills”,      price:1650000, rent:870,  cap:4.2,  rentG:2.9,  schools:5, lifestyle:4, type:[“house”] },
{ suburb:“Mont Albert”,       price:1580000, rent:850,  cap:4.4,  rentG:3.0,  schools:5, lifestyle:4, type:[“house”] },
{ suburb:“Kew East”,          price:1550000, rent:840,  cap:4.1,  rentG:2.8,  schools:5, lifestyle:4, type:[“house”] },
{ suburb:“Prahran”,           price:1200000, rent:680,  cap:4.8,  rentG:3.2,  schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“South Yarra”,       price:1350000, rent:760,  cap:4.5,  rentG:3.0,  schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Toorak”,            price:3200000, rent:1500, cap:3.5,  rentG:2.2,  schools:5, lifestyle:5, type:[“house”] },
{ suburb:“St Kilda”,          price:1050000, rent:640,  cap:4.6,  rentG:3.1,  schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“St Kilda East”,     price:1100000, rent:660,  cap:4.8,  rentG:3.2,  schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Elsternwick”,       price:1380000, rent:760,  cap:4.5,  rentG:3.0,  schools:4, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Williamstown North”,price:1150000, rent:660,  cap:5.0,  rentG:3.3,  schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Yarraville”,        price:1050000, rent:640,  cap:5.5,  rentG:3.6,  schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Seddon”,            price:950000,  rent:600,  cap:5.8,  rentG:3.8,  schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Newport”,           price:1100000, rent:650,  cap:5.3,  rentG:3.5,  schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Spotswood”,         price:980000,  rent:615,  cap:5.6,  rentG:3.7,  schools:3, lifestyle:4, type:[“house”,“unit”] },
// Inner / premium
{ suburb:“Footscray”, price:850000, rent:580, cap:5.8, rentG:3.7, schools:3, lifestyle:4, type:[“house”,“unit”,“townhouse”] },
{ suburb:“Sunshine”, price:825000, rent:530, cap:5.1, rentG:4.0, schools:2, lifestyle:3, type:[“house”,“unit”] }, // ✓ REA 27 Mar 2026
{ suburb:“Sunshine North”, price:780000, rent:535, cap:6.3, rentG:4.2, schools:2, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“St Albans”, price:720000, rent:505, cap:6.6, rentG:4.4, schools:2, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Collingwood”, price:980000, rent:650, cap:4.7, rentG:3.1, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Fitzroy”, price:1250000, rent:760, cap:4.5, rentG:3.0, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Brunswick”, price:1050000, rent:680, cap:4.9, rentG:3.2, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Coburg”, price:960000, rent:640, cap:5.2, rentG:3.5, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Preston”, price:900000, rent:600, cap:5.5, rentG:3.7, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Northcote”, price:1100000, rent:700, cap:4.8, rentG:3.2, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Box Hill”, price:1670500, rent:790, cap:-1.7, rentG:3.8, schools:5, lifestyle:4, type:[“house”,“unit”] }, // ✓ REA 27 Mar 2026
{ suburb:“Box Hill South”, price:1503000, rent:730, cap:4.3, rentG:3.8, schools:5, lifestyle:4, type:[“house”,“unit”] }, // ✓ REA 27 Mar 2026
{ suburb:“Doncaster”, price:1200000, rent:730, cap:5.1, rentG:3.5, schools:4, lifestyle:4, type:[“house”] },
{ suburb:“Glen Waverley”, price:1350000, rent:780, cap:4.8, rentG:3.3, schools:5, lifestyle:4, type:[“house”] },
{ suburb:“Mulgrave”, price:980000, rent:635, cap:5.5, rentG:3.7, schools:4, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Brighton”, price:2100000, rent:1100, cap:3.8, rentG:2.5, schools:5, lifestyle:5, type:[“house”] },
{ suburb:“Brighton East”, price:1800000, rent:980, cap:4.0, rentG:2.7, schools:5, lifestyle:5, type:[“house”] },
{ suburb:“Hampton”, price:1600000, rent:900, cap:4.2, rentG:2.8, schools:4, lifestyle:5, type:[“house”,“unit”] },
],
NSW: [
// South-west Sydney
{ suburb:“Campbelltown”, price:750000, rent:530, cap:7.2, rentG:4.8, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Macquarie Fields”, price:730000, rent:520, cap:7.3, rentG:4.9, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Ingleburn”, price:760000, rent:535, cap:7.1, rentG:4.8, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Minto”, price:740000, rent:525, cap:7.2, rentG:4.8, schools:3, lifestyle:2, type:[“house”,“townhouse”] },
{ suburb:“Leumeah”, price:720000, rent:515, cap:7.3, rentG:4.9, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Narellan”, price:800000, rent:560, cap:6.8, rentG:4.5, schools:4, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Mount Druitt”, price:680000, rent:500, cap:7.5, rentG:5.0, schools:2, lifestyle:2, type:[“house”,“unit”] },
{ suburb:“St Marys”, price:720000, rent:515, cap:7.2, rentG:4.9, schools:2, lifestyle:3, type:[“house”,“unit”] },
// West Sydney
{ suburb:“Penrith”, price:820000, rent:580, cap:6.4, rentG:4.3, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Kingswood”, price:780000, rent:555, cap:6.7, rentG:4.5, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Blacktown”, price:830000, rent:570, cap:6.3, rentG:4.2, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Quakers Hill”, price:860000, rent:580, cap:6.2, rentG:4.1, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Rooty Hill”, price:800000, rent:560, cap:6.5, rentG:4.3, schools:2, lifestyle:2, type:[“house”,“unit”] },
{ suburb:“Liverpool”, price:860000, rent:585, cap:6.5, rentG:4.4, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Casula”, price:840000, rent:575, cap:6.6, rentG:4.4, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
// Central Coast
{ suburb:“Gosford”, price:720000, rent:510, cap:7.5, rentG:5.0, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Wyong”, price:680000, rent:490, cap:7.8, rentG:5.2, schools:2, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Tuggerah”, price:700000, rent:500, cap:7.6, rentG:5.1, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Terrigal”, price:950000, rent:640, cap:6.8, rentG:4.6, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Ettalong Beach”, price:820000, rent:560, cap:7.2, rentG:4.9, schools:3, lifestyle:4, type:[“house”,“unit”] },
// Newcastle / Hunter
{ suburb:“Newcastle”, price:780000, rent:540, cap:7.8, rentG:5.2, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Newcastle West”, price:820000, rent:565, cap:7.5, rentG:5.0, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Mayfield”, price:750000, rent:530, cap:7.9, rentG:5.3, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Hamilton”, price:850000, rent:575, cap:7.4, rentG:4.9, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Maitland”, price:650000, rent:470, cap:8.2, rentG:5.5, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Cessnock”, price:560000, rent:430, cap:8.6, rentG:5.8, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Rutherford”, price:620000, rent:455, cap:8.1, rentG:5.4, schools:2, lifestyle:2, type:[“house”,“townhouse”] },
// Wollongong
{ suburb:“Wollongong”, price:820000, rent:565, cap:7.0, rentG:4.8, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Fairy Meadow”, price:850000, rent:575, cap:6.8, rentG:4.6, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Dapto”, price:750000, rent:530, cap:7.3, rentG:5.0, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Shellharbour”, price:780000, rent:545, cap:7.1, rentG:4.8, schools:3, lifestyle:4, type:[“house”,“unit”] },
// Middle / inner Sydney
{ suburb:“Parramatta”, price:950000, rent:650, cap:5.5, rentG:3.7, schools:3, lifestyle:4, type:[“unit”,“townhouse”] },
{ suburb:“Granville”, price:900000, rent:620, cap:5.8, rentG:3.9, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Auburn”, price:870000, rent:605, cap:6.0, rentG:4.0, schools:2, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Merrylands”, price:890000, rent:615, cap:5.9, rentG:3.9, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Sutherland”, price:1250000, rent:750, cap:5.2, rentG:3.4, schools:4, lifestyle:5, type:[“house”,“townhouse”] },
{ suburb:“Miranda”, price:1300000, rent:775, cap:5.0, rentG:3.3, schools:4, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Cronulla”, price:1600000, rent:900, cap:4.5, rentG:3.0, schools:4, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Chatswood”, price:1450000, rent:900, cap:4.8, rentG:3.1, schools:5, lifestyle:5, type:[“unit”,“house”] },
{ suburb:“Hornsby”, price:1200000, rent:740, cap:5.3, rentG:3.5, schools:4, lifestyle:4, type:[“house”,“unit”] },
],
QLD: [
// Ipswich / Logan
{ suburb:“Ipswich”, price:540000, rent:440, cap:8.1, rentG:5.6, schools:2, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Springfield”, price:660000, rent:510, cap:7.1, rentG:4.8, schools:5, lifestyle:4, type:[“house”,“townhouse”] },
{ suburb:“Springfield Lakes”, price:650000, rent:505, cap:7.2, rentG:4.9, schools:5, lifestyle:4, type:[“house”,“townhouse”] },
{ suburb:“Goodna”, price:490000, rent:415, cap:8.5, rentG:5.8, schools:2, lifestyle:2, type:[“house”,“unit”] },
{ suburb:“Redbank Plains”, price:520000, rent:430, cap:8.3, rentG:5.6, schools:3, lifestyle:2, type:[“house”,“townhouse”] },
{ suburb:“Collingwood Park”, price:510000, rent:425, cap:8.4, rentG:5.7, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Logan”, price:590000, rent:460, cap:7.8, rentG:5.4, schools:2, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Logan Central”, price:520000, rent:430, cap:8.2, rentG:5.7, schools:2, lifestyle:2, type:[“house”,“unit”] },
{ suburb:“Woodridge”, price:500000, rent:420, cap:8.4, rentG:5.8, schools:2, lifestyle:2, type:[“house”,“unit”] },
{ suburb:“Browns Plains”, price:550000, rent:445, cap:8.0, rentG:5.5, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Marsden”, price:560000, rent:450, cap:7.9, rentG:5.4, schools:3, lifestyle:3, type:[“house”] },
{ suburb:“Beenleigh”, price:540000, rent:440, cap:8.1, rentG:5.6, schools:2, lifestyle:3, type:[“house”,“unit”] },
// North Brisbane / Moreton Bay
{ suburb:“Caboolture”, price:560000, rent:450, cap:8.3, rentG:5.7, schools:2, lifestyle:3, type:[“house”] },
{ suburb:“Morayfield”, price:545000, rent:445, cap:8.4, rentG:5.8, schools:2, lifestyle:2, type:[“house”,“townhouse”] },
{ suburb:“Strathpine”, price:600000, rent:465, cap:8.0, rentG:5.5, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Petrie”, price:620000, rent:475, cap:7.8, rentG:5.3, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Narangba”, price:640000, rent:480, cap:7.6, rentG:5.1, schools:4, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“North Lakes”, price:680000, rent:500, cap:7.3, rentG:4.9, schools:4, lifestyle:4, type:[“house”,“townhouse”] },
{ suburb:“Mango Hill”, price:670000, rent:495, cap:7.4, rentG:5.0, schools:4, lifestyle:4, type:[“house”,“townhouse”] },
// Toowoomba
{ suburb:“Toowoomba”, price:520000, rent:420, cap:8.6, rentG:5.9, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Toowoomba North”, price:480000, rent:400, cap:9.0, rentG:6.2, schools:2, lifestyle:3, type:[“house”] },
// Gold Coast / Sunshine Coast
{ suburb:“Coomera”, price:700000, rent:520, cap:8.2, rentG:5.8, schools:4, lifestyle:4, type:[“house”,“townhouse”] },
{ suburb:“Ormeau”, price:680000, rent:510, cap:8.4, rentG:5.9, schools:4, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Pimpama”, price:660000, rent:500, cap:8.5, rentG:6.0, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Upper Coomera”, price:690000, rent:515, cap:8.3, rentG:5.8, schools:4, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Gold Coast”, price:870000, rent:630, cap:8.7, rentG:6.0, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Southport”, price:750000, rent:555, cap:8.5, rentG:5.9, schools:3, lifestyle:4, type:[“unit”,“house”] },
{ suburb:“Robina”, price:820000, rent:590, cap:8.1, rentG:5.7, schools:4, lifestyle:5, type:[“house”,“unit”,“townhouse”] },
{ suburb:“Helensvale”, price:860000, rent:610, cap:7.9, rentG:5.5, schools:4, lifestyle:4, type:[“house”,“townhouse”] },
{ suburb:“Sunshine Coast”, price:850000, rent:620, cap:8.9, rentG:6.1, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Caloundra”, price:790000, rent:580, cap:8.6, rentG:5.9, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Kawana Waters”, price:810000, rent:590, cap:8.5, rentG:5.8, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Maroochydore”, price:840000, rent:610, cap:8.4, rentG:5.7, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Buderim”, price:870000, rent:625, cap:8.2, rentG:5.6, schools:4, lifestyle:5, type:[“house”] },
{ suburb:“Noosa”, price:1500000, rent:900, cap:6.5, rentG:4.5, schools:3, lifestyle:5, type:[“house”,“unit”] },
],
WA: [
// Outer Perth
{ suburb:“Armadale”, price:430000, rent:430, cap:9.8, rentG:7.6, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Kelmscott”, price:450000, rent:440, cap:9.5, rentG:7.4, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Byford”, price:480000, rent:455, cap:9.2, rentG:7.2, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Mandurah”, price:450000, rent:440, cap:9.5, rentG:7.4, schools:2, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Rockingham”, price:480000, rent:460, cap:9.2, rentG:7.1, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Baldivis”, price:500000, rent:465, cap:9.0, rentG:7.0, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Midland”, price:490000, rent:455, cap:9.1, rentG:7.1, schools:2, lifestyle:3, type:[“house”] },
{ suburb:“Ellenbrook”, price:510000, rent:470, cap:8.9, rentG:6.9, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Brabham”, price:530000, rent:475, cap:8.8, rentG:6.8, schools:3, lifestyle:3, type:[“house”,“townhouse”] },
{ suburb:“Thornlie”, price:520000, rent:475, cap:8.9, rentG:7.0, schools:3, lifestyle:3, type:[“house”] },
{ suburb:“Gosnells”, price:490000, rent:460, cap:9.2, rentG:7.2, schools:2, lifestyle:2, type:[“house”,“unit”] },
{ suburb:“Maddington”, price:470000, rent:448, cap:9.4, rentG:7.3, schools:2, lifestyle:2, type:[“house”,“unit”] },
{ suburb:“Cannington”, price:510000, rent:468, cap:9.0, rentG:7.0, schools:2, lifestyle:3, type:[“house”,“unit”] },
// Middle Perth
{ suburb:“Joondalup”, price:620000, rent:520, cap:8.3, rentG:6.2, schools:4, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Morley”, price:600000, rent:510, cap:8.5, rentG:6.4, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Bayswater”, price:650000, rent:530, cap:8.1, rentG:6.1, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Bassendean”, price:640000, rent:525, cap:8.2, rentG:6.2, schools:3, lifestyle:4, type:[“house”] },
{ suburb:“Belmont”, price:580000, rent:500, cap:8.7, rentG:6.5, schools:2, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Victoria Park”, price:720000, rent:545, cap:7.8, rentG:5.8, schools:3, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Scarborough”, price:850000, rent:590, cap:7.5, rentG:5.5, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Fremantle”, price:920000, rent:620, cap:7.1, rentG:5.0, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Subiaco”, price:1200000, rent:780, cap:6.5, rentG:4.5, schools:4, lifestyle:5, type:[“house”,“unit”] },
],
SA: [
// Outer north
{ suburb:“Elizabeth”, price:360000, rent:370, cap:10.2, rentG:8.1, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Elizabeth East”, price:340000, rent:360, cap:10.5, rentG:8.3, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Elizabeth North”, price:330000, rent:355, cap:10.6, rentG:8.4, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Salisbury”, price:420000, rent:400, cap:9.4, rentG:7.2, schools:2, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Salisbury North”, price:390000, rent:385, cap:9.8, rentG:7.5, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Salisbury East”, price:430000, rent:405, cap:9.3, rentG:7.1, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Paralowie”, price:410000, rent:395, cap:9.5, rentG:7.3, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Para Hills”, price:420000, rent:400, cap:9.4, rentG:7.2, schools:2, lifestyle:2, type:[“house”,“unit”] },
// South / outer
{ suburb:“Morphett Vale”, price:450000, rent:410, cap:8.9, rentG:6.8, schools:3, lifestyle:3, type:[“house”] },
{ suburb:“Hackham”, price:430000, rent:400, cap:9.1, rentG:7.0, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Noarlunga Downs”, price:440000, rent:405, cap:9.0, rentG:6.9, schools:2, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Christie Downs”, price:420000, rent:398, cap:9.3, rentG:7.1, schools:2, lifestyle:2, type:[“house”] },
{ suburb:“Seaford”, price:480000, rent:425, cap:8.6, rentG:6.6, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Aldinga Beach”, price:520000, rent:440, cap:8.2, rentG:6.3, schools:3, lifestyle:4, type:[“house”] },
// Middle / inner
{ suburb:“Modbury”, price:560000, rent:460, cap:7.8, rentG:5.8, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Modbury North”, price:540000, rent:452, cap:8.0, rentG:6.0, schools:3, lifestyle:3, type:[“house”,“unit”] },
{ suburb:“Tea Tree Gully”, price:580000, rent:468, cap:7.6, rentG:5.7, schools:3, lifestyle:3, type:[“house”] },
{ suburb:“Greenwith”, price:600000, rent:475, cap:7.4, rentG:5.5, schools:4, lifestyle:3, type:[“house”] },
{ suburb:“Golden Grove”, price:620000, rent:480, cap:7.2, rentG:5.4, schools:4, lifestyle:4, type:[“house”] },
{ suburb:“Prospect”, price:750000, rent:520, cap:6.8, rentG:4.5, schools:4, lifestyle:4, type:[“house”,“unit”] },
{ suburb:“Norwood”, price:980000, rent:640, cap:5.8, rentG:3.8, schools:4, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Glenelg”, price:920000, rent:620, cap:6.2, rentG:4.1, schools:3, lifestyle:5, type:[“house”,“unit”] },
{ suburb:“Burnside”, price:1100000, rent:700, cap:5.5, rentG:3.7, schools:5, lifestyle:5, type:[“house”] },
],
};

// ── Vacancy & Days on Market Estimator ───────────────────
// Derives estimated vacancy rate and avg days to lease from suburb characteristics
// Based on SQM Research / REIV patterns — flagged as estimates in display
function estVacancyMetrics(s) {
// Vacancy rate: driven by rental demand (rentG), lifestyle, price bracket
// Tight markets (inner, high lifestyle, strong rental growth) = low vacancy
// Outer/regional/oversupplied = higher vacancy
let baseVac = 2.5; // national average ~2.5%

// Rental growth is the best proxy for rental demand
if (s.rentG >= 7)       baseVac -= 1.2;
else if (s.rentG >= 5)  baseVac -= 0.7;
else if (s.rentG >= 3)  baseVac -= 0.2;
else if (s.rentG < 1)   baseVac += 0.8;
else if (s.rentG < 2)   baseVac += 0.4;

// Lifestyle score — inner/amenity-rich suburbs have higher demand
if (s.lifestyle >= 5)      baseVac -= 0.6;
else if (s.lifestyle >= 4) baseVac -= 0.3;
else if (s.lifestyle <= 2) baseVac += 0.5;

// Capital growth proxy — fast-growing suburbs attract tenants too
if (s.cap >= 10)      baseVac -= 0.4;
else if (s.cap >= 7)  baseVac -= 0.2;
else if (s.cap < 0)   baseVac += 0.6;

// Price bracket — premium suburbs have smaller rental pool
if (s.price >= 2000000)      baseVac += 0.8; // luxury — harder to find tenants
else if (s.price >= 1200000) baseVac += 0.4;
else if (s.price <= 500000)  baseVac -= 0.2; // affordable = higher demand

const vacRate = Math.max(0.3, Math.min(5.5, parseFloat(baseVac.toFixed(1))));

// Days on market: correlated with vacancy but also price bracket
// Tight market (low vacancy) = fast lease; premium/oversupplied = slow
let baseDays = 18;
if (vacRate < 1.0)        baseDays = 8;
else if (vacRate < 1.5)   baseDays = 12;
else if (vacRate < 2.0)   baseDays = 16;
else if (vacRate < 3.0)   baseDays = 22;
else if (vacRate < 4.0)   baseDays = 32;
else                       baseDays = 45;

// Premium properties take longer even in tight markets
if (s.price >= 2000000) baseDays += 20;
else if (s.price >= 1200000) baseDays += 8;

// Risk label
const risk = vacRate < 1.2 ? “Very Low” : vacRate < 2.0 ? “Low” :
vacRate < 3.0 ? “Moderate” : vacRate < 4.0 ? “High” : “Very High”;
const riskColor = vacRate < 1.2 ? “#2e7d32” : vacRate < 2.0 ? “#388e3c” :
vacRate < 3.0 ? “#f57c00” : “#c62828” ;

// Annual vacancy cost = weekly rent * weeks vacant per year
const weeksVacant = parseFloat((vacRate / 100 * 52).toFixed(1));

return { vacRate, days: baseDays, risk, riskColor, weeksVacant };
}

// ── Scoring ───────────────────────────────────────────────
function scoreSuburb(s, f) {
const budget = parseInt(f.budget) || 700000;
const cash = parseInt(f.cash) || 0;
const gross1s = parseInt(f.salary) || 100000;
const gross2s = parseInt(f.salary2) || 0;
const tc1s = calcAfterTax(gross1s, f.hecs);
const tc2s = gross2s > 0 ? calcAfterTax(gross2s, f.hecs2) : { afterTax: 0 };
const gross = gross1s + gross2s;
const atMonthly = (tc1s.afterTax + tc2s.afterTax) / 12;

// Hard exclude over-budget
if (s.price > budget * 1.05) return 0;
const needed = s.price * 0.24;
if (cash < needed * 0.85) return 5;

let pts = 0;

// 1. PRICE UTILISATION (0-40) — DOMINANT factor
// Hard rule: suburbs below 50% of budget are excluded entirely
// The closer to budget, the better — user set their budget for a reason
const util = s.price / budget;
if (util < 0.50) return 3; // hard exclude — too far below budget
if (util > 1.05) return 0; // hard exclude — over budget
pts += util >= 0.92 ? 40 : util >= 0.85 ? 35 : util >= 0.78 ? 28 :
util >= 0.70 ? 20 : util >= 0.62 ? 12 : util >= 0.55 ? 6 : 2;

// 2. AFFORDABILITY via DSR on after-tax income (0-12)
// Still matters but capped lower so cheap suburbs can’t compensate for low price util
const annRate = parseFloat(f.rate) / 100 || 0.062;
const r = annRate / 12, n = parseInt(f.term) * 12;
const loan = s.price * 0.8;
const mo = loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
const dsr = mo / atMonthly;
pts += dsr < 0.25 ? 12 : dsr < 0.35 ? 9 : dsr < 0.45 ? 5 : dsr < 0.55 ? 1 : -12;

// 3. CASH BUFFER (0-8)
const cashLeft = cash - needed;
pts += cashLeft / mo >= 12 ? 8 : cashLeft / mo >= 6 ? 6 : cashLeft / mo >= 3 ? 4 : cashLeft / mo >= 1 ? 2 : 0;

// 4. GOAL MATCH (0-18)
const yld = (s.rent * 52 / s.price) * 100;
if (f.goal === “investment”) {
// For investment: yield matters but so does growth and price utilisation
pts += yld >= 5.5 ? 18 : yld >= 4.5 ? 13 : yld >= 3.8 ? 8 : yld >= 3.0 ? 4 : 1;
} else if (f.goal === “owner-occupier”) {
pts += Math.round(s.lifestyle * 3.6); // max 18
} else {
pts += Math.round((yld >= 4.5 ? 9 : yld >= 3.5 ? 6 : 3) + s.lifestyle * 1.5);
}

// 5. PROPERTY TYPE (0-10)
pts += s.type.includes(f.propType) ? 10 : -5;

// 6. RISK / GROWTH (0-12)
if (f.risk === “aggressive”) pts += s.cap >= 12 ? 12 : s.cap >= 9 ? 10 : s.cap >= 7 ? 7 : s.cap >= 5 ? 4 : s.cap < 0 ? -5 : 1;
else if (f.risk === “conservative”) pts += s.cap < 0 ? -8 : s.cap < 3 ? 2 : s.cap < 5.5 ? 8 : s.cap < 7 ? 10 : 12;
else pts += s.cap < 0 ? -5 : (s.cap >= 5 && s.cap <= 10) ? 12 : (s.cap >= 3 && s.cap <= 15) ? 8 : 3;

// 7. SCHOOLS (0-10)
if (f.schools === “high”) pts += s.schools >= 4 ? 10 : s.schools === 3 ? 4 : 0;
else if (f.schools === “medium”) pts += s.schools >= 3 ? 6 : 3;
else pts += 4;

// 8. RENTAL YIELD bonus if tenanted (0-6)
if (f.tenanted) pts += yld >= 5.5 ? 6 : yld >= 4.5 ? 4 : yld >= 3.5 ? 2 : 0;

return Math.min(97, Math.max(10, Math.round(42 + (pts / 116) * 55)));
}

// ── Financials ────────────────────────────────────────────
function calcFin(s, f, overrides = {}) {
const price = s.price;
const cash = parseInt(f.cash) || 0;
const gross1 = parseInt(f.salary) || 100000;
const gross2 = parseInt(f.salary2) || 0;
const tc = calcAfterTax(gross1, f.hecs);
const tc2 = gross2 > 0 ? calcAfterTax(gross2, f.hecs2) : { afterTax: 0, incomeTax: 0, medicare: 0, hecs: 0, total: 0, rate: “0.0” };
const gross = gross1 + gross2;
const atSalary = tc.afterTax + tc2.afterTax; // combined after-tax
const term = parseInt(f.term);
const annRate = parseFloat(f.rate) / 100 || 0.062;
const stamp = price * 0.04;
const legal = 3300;
// Use smart deposit from checkpoints if provided, else default 20%
const deposit = overrides.deposit !== undefined ? overrides.deposit : price * 0.2;
const loan    = overrides.loan    !== undefined ? overrides.loan    : Math.max(0, price - deposit);
const upfront = deposit + stamp + legal;
const r = annRate / 12, n = term * 12;
// If cash purchase (loan = 0), mo = 0
const mo = loan > 0 ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
const cashAfter = cash - upfront;
const landTax = calcLandTax(price, f.state);
const wRent = s.rent;
const annRent = wRent * 52;
const vm = estVacancyMetrics(s);
const vacancyRate = vm.vacRate / 100; // use estimated vacancy rate
const vacancy = annRent * vacancyRate; // more accurate than flat 3%
const mgmt = annRent * 0.08;
const maint = price * 0.005;
const rates = price * 0.002;
const insure = 1800;
const netRent = (annRent - vacancy - mgmt - maint - rates - insure - landTax) / 12;
const rentedCF = netRent - mo;
const ownerMaint = price * 0.004;
const ownerExpMo = (ownerMaint + rates + insure) / 12;
const ownerTotal = mo + ownerExpMo;
const netOwner = atSalary / 12 - ownerTotal;
const mktRentMo = Math.round(annRent / 12);
const moSave = mktRentMo - ownerTotal;
const savePct = Math.round(Math.abs(moSave) / Math.max(mktRentMo, 1) * 100);
const moInterest = Math.round(loan * r);
const moPrincipal = Math.round(mo - loan * r);
const netLiving = Math.round(atSalary / 12 - Math.max(0, -rentedCF));
const rentedOOP = Math.round(-rentedCF);

// ── Negative gearing tax benefit ─────────────────────────
// ATO deductible expenses: interest, depreciation (est), all running costs
// NOT deductible: principal repayments
const annInterest = moInterest * 12;
const annDeductible = annInterest + maint + rates + insure + landTax + vacancy + mgmt;
// Depreciation estimate: ~2.5% of building value (rough, buildings only)
const annDepreciation = Math.round(price * 0.6 * 0.025); // 60% building, 2.5% div43
const totalDeductible = annDeductible + annDepreciation;
const rentalLoss = totalDeductible - annRent; // positive = loss (negatively geared)
const rentalProfit = annRent - totalDeductible; // positive = profit (positively geared)

// Marginal rate of primary earner (highest income = most benefit)
const primaryGross = Math.max(gross1, gross2);
const marginalRate = primaryGross > 180000 ? 0.47 : primaryGross > 120000 ? 0.39 :
primaryGross > 45000  ? 0.345 : primaryGross > 18200 ? 0.21 : 0;

// If negatively geared: tax refund = loss * marginal rate
// If positively geared: extra tax = profit * marginal rate
const annTaxRefund = rentalLoss > 0 ? Math.round(rentalLoss * marginalRate) : 0;
const annExtraTax  = rentalProfit > 0 ? Math.round(rentalProfit * marginalRate) : 0;
const moTaxRefund  = Math.round(annTaxRefund / 12);
const moExtraTax   = Math.round(annExtraTax / 12);

// True after-tax cashflow (rented) = rentedCF + monthly tax refund - extra tax
const rentedCFAfterTax = Math.round(rentedCF + moTaxRefund - moExtraTax);

// True out of pocket after tax benefit
const rentedOOPAfterTax = rentedCFAfterTax < 0 ? Math.abs(rentedCFAfterTax) : 0;

// ── Owner vs Rented comparison ────────────────────────────
// Owner: pay mortgage + costs, save on rent, build equity
// Rented: pay mortgage + costs, receive rent (net), get tax benefit
// Equity built = same either way (principal repayment)
// Owner benefit: avoid paying market rent
// Rented benefit: rental income + tax refund offsets mortgage cost

// Net monthly cost OWNER: mortgage + running costs - market rent saved
// (i.e. what you’d pay vs what renting equivalent costs you)
const ownerNetVsRent = ownerTotal - mktRentMo; // positive = owning costs more than renting would

// Net monthly cost RENTED after tax benefit
const rentedNetCost = rentedOOPAfterTax; // what you top up each month after rent + tax refund

// Which is better for THIS buyer?
// For investor: rented scenario + capital growth
// For OO: own scenario, no rent to pay
const ownerBetter = ownerNetVsRent <= rentedNetCost;

return {
price, deposit, stamp, legal, upfront, loan: Math.round(loan),
mo: Math.round(mo), cashAfter: Math.round(cashAfter),
moInterest, moPrincipal, interestPct: ((loan * r / mo) * 100).toFixed(1),
annRate: (annRate * 100).toFixed(2),
wRent, annRent: Math.round(annRent),
moRentGross: Math.round(annRent / 12),
moVacancy: Math.round(vacancy / 12), moMgmt: Math.round(mgmt / 12),
moMaint: Math.round(maint / 12), moRates: Math.round(rates / 12),
moInsure: Math.round(insure / 12), moLandTax: Math.round(landTax / 12),
annLandTax: landTax,
netRentMo: Math.round(netRent), rentedCF: Math.round(rentedCF), rentedOOP,
ownerTotal: Math.round(ownerTotal), netOwner: Math.round(netOwner),
mktRentMo, moSave: Math.round(moSave), savePct,
verdict: moSave >= 0 ? “cheaper” : “dearer”,
grossYield: ((annRent / price) * 100).toFixed(2),
atSalary, atMonthly: Math.round(atSalary / 12),
grossSalary: gross, grossSalary1: gross1, grossSalary2: gross2,
atSalary1: tc.afterTax, atSalary2: tc2.afterTax,
taxCalc: tc, taxCalc2: tc2, isCouple: gross2 > 0,
netLiving,
isNegCash: cashAfter < 0,
isMortStress: mo / (atSalary / 12) > 0.35,
vacRate: vm.vacRate, vacDays: vm.days, vacRisk: vm.risk,
vacRiskColor: vm.riskColor, weeksVacant: vm.weeksVacant,
// Negative gearing
annInterest: Math.round(annInterest),
annDeductible: Math.round(annDeductible),
annDepreciation,
totalDeductible: Math.round(totalDeductible),
rentalLoss: Math.round(rentalLoss),
rentalProfit: Math.round(rentalProfit),
marginalRate: Math.round(marginalRate * 100),
annTaxRefund, moTaxRefund,
annExtraTax, moExtraTax,
rentedCFAfterTax, rentedOOPAfterTax,
// Owner vs rented
ownerNetVsRent: Math.round(ownerNetVsRent),
rentedNetCost: Math.round(rentedNetCost),
ownerBetter,
};
}

function getHL(s, f) {
const y = ((s.rent * 52 / s.price) * 100).toFixed(1);
const h = [];
if (s.cap >= 8) h.push(“Top Capital Growth Suburb”);
else if (s.cap >= 7) h.push(“Strong Capital Growth”);
else h.push(“Steady Capital Growth”);
if (parseFloat(y) >= 5) h.push(`High Rental Yield (${y}%)`);
else if (parseFloat(y) >= 4) h.push(`Good Rental Yield (${y}%)`);
else h.push(`Gross Yield ${y}%`);
if (s.schools >= 4 && f.schools !== “low”) h.push(“Excellent School Catchment”);
else if (s.lifestyle >= 4) h.push(“Great Lifestyle Amenities”);
else h.push(“Good Community Infrastructure”);
return h;
}

function findMatches(f) {
const pool = DB[f.state] || DB.VIC;
const budget = parseInt(f.budget) || 700000;
const propType = f.propType || “house”;

// Step 1: hard filter by property type and price window (50%-105% of budget)
let candidates = pool
.filter(s => s.type.includes(propType))
.filter(s => s.price >= budget * 0.50 && s.price <= budget * 1.05);

// Step 2: if too few results, widen window to 35%-105%
if (candidates.length < 3) {
candidates = pool
.filter(s => s.type.includes(propType))
.filter(s => s.price >= budget * 0.35 && s.price <= budget * 1.05);
}

// Step 3: if still empty (e.g. very high budget with no matching suburbs), take closest
if (candidates.length === 0) {
candidates = pool
.filter(s => s.type.includes(propType))
.sort((a, b) => Math.abs(a.price - budget) - Math.abs(b.price - budget))
.slice(0, 5);
}

return candidates
.map(s => ({ …s, score: scoreSuburb(s, f) }))
.filter(s => s.score > 5)
.sort((a, b) => b.score - a.score);
}

// ── Format ────────────────────────────────────────────────
function fmtD(n) {
if (n == null || isNaN(n)) return “—”;
const neg = n < 0; const abs = Math.abs(Math.round(n));
const s = abs >= 1000000 ? “$” + (abs / 1000000).toFixed(2) + “M” : “$” + abs.toLocaleString();
return neg ? “-” + s : s;
}
function pp(n) { return (!n || isNaN(n)) ? “—” : n.toFixed(2) + “%”; }

// ── UI atoms ──────────────────────────────────────────────
function SH({ title }) {
return (
<div style={{ fontSize: “0.62rem”, fontWeight: 700, color: C.mid, letterSpacing: “0.08em”, textTransform: “uppercase”, marginBottom: “0.65rem”, display: “flex”, alignItems: “center”, gap: 5 }}>
<div style={{ height: 1, flex: 1, background: C.oBorder }} />{title}<div style={{ height: 1, flex: 1, background: C.oBorder }} />
</div>
);
}
function LI({ label, value, bold, color, border }) {
return (
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, padding: border ? “5px 0” : “3px 0”, borderTop: border ? `1px solid ${C.oBorder}` : “none”, marginTop: border ? 3 : 0 }}>
<span style={{ fontSize: “0.69rem”, color: C.mid, fontWeight: bold ? 600 : 400 }}>{label}</span>
<span style={{ fontSize: bold ? “0.84rem” : “0.75rem”, fontWeight: bold ? 700 : 500, color: color || C.dark }}>{value}</span>
</div>
);
}
function Row({ label, children }) {
return (
<div style={{ display: “flex”, alignItems: “center”, gap: 10, padding: “7px 0”, borderBottom: “1px solid #f0e8dc” }}>
<span style={lSt}>{label}</span>{children}
</div>
);
}
function Sel({ value, onChange, options }) {
return <select value={value} onChange={e => onChange(e.target.value)} style={{ …iSt, cursor: “pointer” }}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
}
function Rng({ label, value, min, max, step, onChange, disp }) {
const p = ((value - min) / (max - min)) * 100;
return (
<div style={{ display: “flex”, flexDirection: “column”, gap: “0.3rem” }}>
<div style={{ display: “flex”, justifyContent: “space-between” }}>
<label style={{ fontSize: “0.62rem”, color: C.mid, fontWeight: 500, textTransform: “uppercase”, letterSpacing: “0.08em” }}>{label}</label>
<span style={{ fontFamily: sans, fontSize: “0.76rem”, color: C.orange, fontWeight: 600 }}>{disp(value)}</span>
</div>
<input type=“range” min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
style={{ WebkitAppearance: “none”, height: 4, border: “none”, borderRadius: 2, cursor: “pointer”, width: “100%”, outline: “none”, background: `linear-gradient(to right,${C.orange} ${p}%,#f0e8dc ${p}%)` }} />
</div>
);
}
function ScoreRing({ sc }) {
const r = 46, c = 2 * Math.PI * r;
return (
<div style={{ position: “relative”, width: 112, height: 112 }}>
<svg width=“112” height=“112” style={{ transform: “rotate(-90deg)” }}>
<circle cx="56" cy="56" r={r} fill="none" stroke="#f0e0c0" strokeWidth="8" />
<circle cx=“56” cy=“56” r={r} fill=“none” stroke={C.orange} strokeWidth=“8” strokeLinecap=“round” strokeDasharray={c} strokeDashoffset={c * (1 - sc / 100)} />
</svg>
<div style={{ position: “absolute”, inset: 0, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center” }}>
<div style={{ fontFamily: serif, fontSize: “1.7rem”, fontWeight: 700, color: C.orange, lineHeight: 1 }}>{sc}<span style={{ fontSize: “0.8rem” }}>%</span></div>
<div style={{ fontSize: “0.57rem”, color: C.mid, fontWeight: 600, textTransform: “uppercase”, marginTop: 2 }}>{sc >= 85 ? “Excellent” : sc >= 70 ? “Good” : “Fair”} Match</div>
</div>
</div>
);
}
function CFBar({ label, value, pos }) {
return (
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, padding: “6px 10px”, borderRadius: 8, background: pos ? “#f0faf4” : C.redBg, border: `1px solid ${pos ? "#c8e6c9" : C.redBorder}`, marginBottom: 5 }}>
<span style={{ fontSize: “0.71rem”, color: C.mid }}>{label}</span>
<span style={{ fontSize: “0.82rem”, fontWeight: 700, color: pos ? C.grn : C.red }}>{pos ? “+” : “”}{fmtD(value)}/mo</span>
</div>
);
}

// ── Sample report data (Collingwood) ─────────────────────
const SAMPLE = {
reportTitle: “Full Property Investment Report — Collingwood VIC 2026”,
generatedDate: “March 2026”,
executiveSummary: “Collingwood is one of Melbourne’s most tightly held inner-north suburbs, consistently delivering above-average capital growth over the past decade. With a median house price of $980k and gross yields of 3.5%, the suburb appeals to both owner-occupiers seeking lifestyle and investors targeting long-term appreciation. Recent rezoning and continued gentrification suggest continued upward price pressure, with the suburb outperforming broader Melbourne by approximately 1.2% per annum. For a buyer on $120k gross salary, the property represents a meaningful commitment but is serviceable on a 30-year P&I loan.”,
priceHistory: [
{year:2016,medianPrice:680000,growth:null,growthPct:null,note:“Pre-boom baseline”},
{year:2017,medianPrice:760000,growth:80000,growthPct:11.8,note:“Strong auction clearances”},
{year:2018,medianPrice:792000,growth:32000,growthPct:4.2,note:“Rate uncertainty”},
{year:2019,medianPrice:812000,growth:20000,growthPct:2.5,note:“Election year caution”},
{year:2020,medianPrice:779000,growth:-33000,growthPct:-4.1,note:“COVID lockdown impact”},
{year:2021,medianPrice:920000,growth:141000,growthPct:18.1,note:“Post-COVID FOMO surge”},
{year:2022,medianPrice:981000,growth:61000,growthPct:6.6,note:“Rate hikes moderate growth”},
{year:2023,medianPrice:1020000,growth:39000,growthPct:4.0,note:“Market stabilises”},
{year:2024,medianPrice:1089000,growth:69000,growthPct:6.8,note:“Recovery momentum”},
{year:2025,medianPrice:1150000,growth:61000,growthPct:5.6,note:“Current median”},
],
rentalHistory: [
{year:2016,weeklyRent:460,annualRent:23920,growth:null,growthPct:null},
{year:2017,weeklyRent:480,annualRent:24960,growth:20,growthPct:4.3},
{year:2018,weeklyRent:500,annualRent:26000,growth:20,growthPct:4.2},
{year:2019,weeklyRent:510,annualRent:26520,growth:10,growthPct:2.0},
{year:2020,weeklyRent:490,annualRent:25480,growth:-20,growthPct:-3.9},
{year:2021,weeklyRent:510,annualRent:26520,growth:20,growthPct:4.1},
{year:2022,weeklyRent:560,annualRent:29120,growth:50,growthPct:9.8},
{year:2023,weeklyRent:610,annualRent:31720,growth:50,growthPct:8.9},
{year:2024,weeklyRent:640,annualRent:33280,growth:30,growthPct:4.9},
{year:2025,weeklyRent:660,annualRent:34320,growth:20,growthPct:3.1},
],
trendAnalysis: {
priceAcceleration:“accelerating”,
priceNarrative:“Capital growth averaged 5.4% p.a. over the decade, with the 2021–2022 COVID recovery delivering outsized returns of 18%+. The 2024–2025 period shows renewed momentum following the rate plateau, tracking above the decade average. Collingwood’s inner-city location and gentrification pipeline continue to underpin demand.”,
rentalAcceleration:“slowing”,
rentalNarrative:“Rental growth peaked at 9.8% in 2022 driven by post-COVID demand and interstate migration. The 2024–2025 period shows a moderation to 3–5% as new supply comes online, though the suburb remains a landlord’s market with vacancy below 2%.”,
best3Years:[“2021”,“2017”,“2024”],
slowest3Years:[“2020”,“2019”,“2018”],
recentMomentum:“The last 2 years (2024–2025) are tracking above the 5.4% decade average for prices, suggesting momentum is building again. Rentals are moderating after the 2022–2023 peak but remain well above the decade average of 3.5% p.a.”,
},
ownerOccupied: {
totalMonthlyHousingCost:6420, equivalentMarketRent:2860,
monthlySavingVsRenting:-3560, annualSavingVsRenting:-42720,
savingPct:124, verdict:“dearer”, netOwner:2298, atMonthly:8718, isCouple:false,
breakdownNarrative:“Owning in Collingwood costs $6,420/mo versus renting the equivalent property at $2,860/mo — a premium of $3,560/mo. However, owners build approximately $1,100/mo in principal equity and benefit from ~$5,300/mo in capital appreciation at 5.6% growth. Total wealth creation for owners is estimated at $6,400/mo versus $0 for renters, making the ownership premium highly worthwhile over a 7+ year horizon.”,
annualCosts:{mortgage:57960,maintenance:3920,councilRates:1960,insurance:1800,total:65640,equivalentAnnualRent:34320},
},
investmentScenario: {
grossYield:“2.98”, netYield:”-2.84”, monthlyNetCashflow:-2722, monthlyNetCashflowAfterTax:-1122,
annualCashflow:-32664, annualCashflowAfterTax:-13464,
cashflowVerdict:“negative”,
taxRefundAnnual:19200, extraTaxAnnual:0,
moTaxRefundDisplay:1600, moExtraTaxDisplay:0,
marginalRate:39, depreciation:14700, totalDeductible:82136, rentalLoss:47816,
rentedOOPAfterTax:1122, ownerBetter:false,
ownerNetVsRent:3560, rentedNetCost:1122,
moPrincipal:1100, atMonthly:8718, ownerTotal:6420, mktRentMo:2860,
savePct:124, verdictStr:“dearer”,
moRentGross:2860, moVacancy:86, moMgmt:229, moMaint:408,
moRates:163, moInsure:150, moLandTax:104, netRentMo:1720,
vacRate:1.5, vacDays:12, vacRisk:“Low”, vacRiskColor:”#388e3c”,
weeksVacant:0.8, weeklyRent:660, annualVacancyCost:528, worstCaseMonth:8380,
vacancyNarrative:“Collingwood has an estimated vacancy rate of 1.5% — classified as Low risk. Properties take approximately 12 days to lease, meaning 0.8 weeks vacancy per year. This is a healthy rental market with moderate competition. In a worst-case month with 4 weeks vacancy, total cash outflow would be $8,380.”,
investmentNarrative:“Collingwood requires a top-up of $2,722/mo before tax. After the negative gearing tax refund of $1,600/mo (at 39% marginal rate including $14,700/yr depreciation), the true after-tax cost is $1,122/mo — considerably more manageable. When capital appreciation of $64,400/yr is included, the total return after tax is $50,936/yr.”,
annualPL:{
rentalIncome:34320, vacancyLoss:1030, managementFee:2746, maintenance:4900,
councilRates:1960, insurance:1800, landTax:1250, interestCost:53750,
depreciation:14700, totalExpenses:67436, netIncome:-33116,
taxRefund:19200, extraTax:0, netIncomeAfterTax:-13916,
capitalGain:64400, totalReturn:50484,
},
},
fiveYearProjection:{
projectedPrice2030:1522000,projectedWeeklyRent2030:777,projectedEquity2030:285000,
narrative:“At 5.6% p.a. growth Collingwood is projected to reach $1.52M by 2030. Weekly rents are projected to reach $777/wk, improving the yield profile. After 5 years of P&I repayments equity builds to approximately $285k, with total net worth increase (equity + capital gain) estimated at $540k.”,
},
recommendation:“buy”,
recommendationNarrative:“Collingwood represents a sound long-term investment for buyers with sufficient income to service the loan. The suburb’s proximity to Melbourne CBD, vibrant amenity, and consistent above-average capital growth make it compelling. While negatively geared in the short term, total returns including capital appreciation have outperformed most alternative asset classes over the past decade. Recommend a 7–10 year minimum hold to maximise returns.”,
riskFactors:[“High entry price — limited buyer pool if selling”,“Negatively geared — requires ongoing income buffer”,“Rate sensitivity — every 0.5% rate rise adds ~$380/mo”,“Melbourne stamp duty ~$55k adds to acquisition cost”],
positiveFactors:[“Tightly held inner suburb — limited new supply”,“10yr average 5.4% p.a. capital growth”,“Low vacancy — landlord’s market”,“Infrastructure and gentrification tailwinds”,“Strong long-term total return when capital gain included”],
listingsForSale: [
{address:“8 Langridge St, Collingwood VIC 3066”,link:“https://www.domain.com.au/8-langridge-st-collingwood-vic-3066”,price:”$950,000 - $1,040,000”,priceNum:995000,bedrooms:3,bathrooms:1,type:“House”,condition:“Original”,schoolZone:“Collingwood College Zone”,agentName:“Sarah Chen”,agentPhone:“0411 222 333”,agencyName:“Jellis Craig Fitzroy”,inspectionDate:“Sat 5 Apr 2026”,inspectionTime:“11:00am - 11:30am”,auctionDate:“Sat 12 Apr 2026”,auctionTime:“11:00am”,isAuction:true},
{address:“14/22 Perry St, Collingwood VIC 3066”,link:“https://www.domain.com.au/14-22-perry-st-collingwood-vic-3066”,price:”$1,050,000 - $1,150,000”,priceNum:1100000,bedrooms:3,bathrooms:2,type:“Townhouse”,condition:“Renovated”,schoolZone:“Collingwood College Zone”,agentName:“Marcus Lee”,agentPhone:“0422 444 555”,agencyName:“Hocking Stuart Collingwood”,inspectionDate:“Sat 5 Apr 2026”,inspectionTime:“1:00pm - 1:30pm”,auctionDate:“Sat 19 Apr 2026”,auctionTime:“2:00pm”,isAuction:true},
{address:“37 Oxford St, Collingwood VIC 3066”,link:“https://www.domain.com.au/37-oxford-st-collingwood-vic-3066”,price:”$1,150,000 - $1,250,000”,priceNum:1200000,bedrooms:3,bathrooms:2,type:“House”,condition:“Renovated”,schoolZone:“NMIT Zone”,agentName:“Emma Walsh”,agentPhone:“0433 666 777”,agencyName:“Ray White Collingwood”,inspectionDate:“Sun 6 Apr 2026”,inspectionTime:“10:30am - 11:00am”,auctionDate:null,auctionTime:null,isAuction:false},
{address:“55 Wellington St, Collingwood VIC 3066”,link:“https://www.domain.com.au/55-wellington-st-collingwood-vic-3066”,price:”$1,280,000 - $1,380,000”,priceNum:1330000,bedrooms:4,bathrooms:2,type:“House”,condition:“Partially Renovated”,schoolZone:“Collingwood College Zone”,agentName:“Tom Nguyen”,agentPhone:“0444 888 999”,agencyName:“Nelson Alexander Fitzroy”,inspectionDate:“Sat 5 Apr 2026”,inspectionTime:“12:00pm - 12:30pm”,auctionDate:“Sat 26 Apr 2026”,auctionTime:“1:00pm”,isAuction:true},
],
recentSales: [
{address:“22 Smith St, Collingwood VIC 3066”,soldPrice:1215000,soldPriceDisplay:”$1,215,000”,soldDate:“22 Mar 2026”,soldDateSort:“2026-03-22”,bedrooms:3,bathrooms:2,type:“House”,daysOnMarket:18},
{address:“7 Rokeby St, Collingwood VIC 3066”,soldPrice:1055000,soldPriceDisplay:”$1,055,000”,soldDate:“15 Mar 2026”,soldDateSort:“2026-03-15”,bedrooms:3,bathrooms:1,type:“House”,daysOnMarket:31},
{address:“4/89 Gipps St, Collingwood VIC 3066”,soldPrice:780000,soldPriceDisplay:”$780,000”,soldDate:“8 Mar 2026”,soldDateSort:“2026-03-08”,bedrooms:2,bathrooms:2,type:“Apartment”,daysOnMarket:24},
{address:“31 Cambridge St, Collingwood VIC 3066”,soldPrice:1410000,soldPriceDisplay:”$1,410,000”,soldDate:“1 Mar 2026”,soldDateSort:“2026-03-01”,bedrooms:4,bathrooms:2,type:“House”,daysOnMarket:12},
{address:“15 Peel St, Collingwood VIC 3066”,soldPrice:935000,soldPriceDisplay:”$935,000”,soldDate:“22 Feb 2026”,soldDateSort:“2026-02-22”,bedrooms:3,bathrooms:1,type:“Townhouse”,daysOnMarket:38},
{address:“68 Johnston St, Collingwood VIC 3066”,soldPrice:1180000,soldPriceDisplay:”$1,180,000”,soldDate:“8 Feb 2026”,soldDateSort:“2026-02-08”,bedrooms:3,bathrooms:2,type:“House”,daysOnMarket:21},
],
};

// ── Report display component ──────────────────────────────
function ReportView({ data, schoolsHigh, paid, onUnlock, suburb, state, propType, budget, priceMedian }) {
const blurred = false; // payment removed — always show full report
return (
<div style={{ padding: “1.5rem” }}>
{/* header */}
<div style={{ background: “linear-gradient(135deg,#1a0f00,#3d2200)”, borderRadius: 14, padding: “1.25rem”, marginBottom: “1.25rem”, textAlign: “center” }}>
<div style={{ fontFamily: serif, fontSize: “1.2rem”, fontWeight: 700, color: “#fff”, marginBottom: 3 }}>{data.reportTitle}</div>
<div style={{ fontSize: “0.68rem”, color: “rgba(255,255,255,0.55)” }}>Generated {data.generatedDate} · Modelled estimates — see disclaimers · Not financial advice</div>
</div>

```
  {/* exec summary */}
  <div style={{ background: C.oPale, border: `1px solid ${C.oBorder}`, borderRadius: 12, padding: "1rem", marginBottom: "1.1rem" }}>
    <SH title="Executive Summary" />
    <p style={{ fontSize: "0.81rem", color: C.dark, lineHeight: 1.7 }}>{data.executiveSummary}</p>
  </div>

  {/* price history */}
  <div style={{ background: C.warm, border: `1px solid ${C.oBorder}`, borderRadius: 12, padding: "1rem", marginBottom: "1.1rem" }}>
    <SH title="10-Year Capital Price History" />
    <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 7, padding: "6px 10px", marginBottom: "0.65rem", fontSize: "0.67rem", color: "#6d4c00", lineHeight: 1.5 }}>
      ⚠️ <strong>Estimated figures.</strong> These values are modelled backwards from the current 2025 median using the suburb's long-run average growth rate ({data.priceHistory?.[9]?.growthPct}% p.a.) with realistic year-by-year variance. They are <strong>not sourced from actual historical sales data.</strong> For verified historical medians, check <a href="https://www.domain.com.au" target="_blank" style={{color:"#1565c0"}}>Domain</a>, <a href="https://www.realestate.com.au" target="_blank" style={{color:"#1565c0"}}>REA</a> or <a href="https://www.corelogic.com.au" target="_blank" style={{color:"#1565c0"}}>CoreLogic</a>.
    </div>
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginLeft: "-0.1rem", marginRight: "-0.1rem" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.74rem" }}>
        <thead><tr style={{ borderBottom: `2px solid ${C.oBorder}` }}>
          {["Year","Median Price","Annual Gain","Growth %","Note"].map(h => <th key={h} style={{ padding: "5px 7px", textAlign: h === "Year" || h === "Note" ? "left" : "right", color: C.mid, fontWeight: 600, fontSize: "0.61rem", textTransform: "uppercase" }}>{h}</th>)}
        </tr></thead>
        <tbody>{(data.priceHistory || []).map((row, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${C.cream}`, background: i % 2 === 0 ? C.warm : C.cream }}>
            <td style={{ padding: "5px 7px", fontWeight: 600, color: C.dark }}>{row.year}</td>
            <td style={{ padding: "5px 7px", textAlign: "right", whiteSpace: "nowrap" }}>{fmtD(row.medianPrice)}</td>
            <td style={{ padding: "5px 7px", textAlign: "right", whiteSpace: "nowrap", color: row.growth > 0 ? C.grn : row.growth < 0 ? C.red : C.mid }}>{row.growth != null ? (row.growth > 0 ? "+" : "") + fmtD(row.growth) : "—"}</td>
            <td style={{ padding: "5px 7px", textAlign: "right" }}>{row.growthPct != null ? <span style={{ background: row.growthPct >= 7 ? "#c8e6c9" : row.growthPct >= 3 ? "#fff9c4" : row.growthPct < 0 ? "#ffcdd2" : C.cream, color: row.growthPct >= 7 ? C.grn : row.growthPct >= 3 ? "#6d5a00" : row.growthPct < 0 ? C.red : C.mid, borderRadius: 20, padding: "2px 7px", fontSize: "0.65rem", fontWeight: 600 }}>{row.growthPct > 0 ? "+" : ""}{row.growthPct}%</span> : "—"}</td>
            <td style={{ padding: "5px 7px", color: C.light, fontSize: "0.66rem" }}>{row.note}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </div>

  {/* rental history */}
  <div style={{ background: C.warm, border: `1px solid ${C.oBorder}`, borderRadius: 12, padding: "1rem", marginBottom: "1.1rem" }}>
    <SH title="10-Year Rental History" />
    <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 7, padding: "6px 10px", marginBottom: "0.65rem", fontSize: "0.67rem", color: "#6d4c00", lineHeight: 1.5 }}>
      ⚠️ <strong>Estimated figures.</strong> Weekly rents are modelled backwards from the 2025 median rent using the suburb's long-run rental growth rate ({data.rentalHistory?.[9]?.growthPct}% p.a.). Not sourced from actual rental data. Verify at <a href="https://www.domain.com.au" target="_blank" style={{color:"#1565c0"}}>Domain</a> or <a href="https://www.realestate.com.au" target="_blank" style={{color:"#1565c0"}}>REA</a>.
    </div>
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginLeft: "-0.1rem", marginRight: "-0.1rem" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.74rem" }}>
        <thead><tr style={{ borderBottom: `2px solid ${C.oBorder}` }}>
          {["Year","Weekly Rent","Annual Rent","Weekly Change","Growth %"].map(h => <th key={h} style={{ padding: "5px 7px", textAlign: h === "Year" ? "left" : "right", color: C.mid, fontWeight: 600, fontSize: "0.61rem", textTransform: "uppercase" }}>{h}</th>)}
        </tr></thead>
        <tbody>{(data.rentalHistory || []).map((row, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${C.cream}`, background: i % 2 === 0 ? C.warm : C.cream }}>
            <td style={{ padding: "5px 7px", fontWeight: 600, color: C.dark }}>{row.year}</td>
            <td style={{ padding: "5px 7px", textAlign: "right" }}>${row.weeklyRent}/wk</td>
            <td style={{ padding: "5px 7px", textAlign: "right", color: C.mid }}>{fmtD(row.annualRent)}</td>
            <td style={{ padding: "5px 7px", textAlign: "right", color: row.growth > 0 ? C.grn : row.growth < 0 ? C.red : C.mid }}>{row.growth != null ? (row.growth > 0 ? "+$" : "-$") + Math.abs(row.growth) + "/wk" : "—"}</td>
            <td style={{ padding: "5px 7px", textAlign: "right" }}>{row.growthPct != null ? <span style={{ background: row.growthPct >= 5 ? "#c8e6c9" : row.growthPct >= 2 ? "#fff9c4" : row.growthPct < 0 ? "#ffcdd2" : C.cream, color: row.growthPct >= 5 ? C.grn : row.growthPct >= 2 ? "#6d5a00" : row.growthPct < 0 ? C.red : C.mid, borderRadius: 20, padding: "2px 7px", fontSize: "0.65rem", fontWeight: 600 }}>{row.growthPct > 0 ? "+" : ""}{row.growthPct}%</span> : "—"}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </div>

  {/* listings for sale — deep links */}
  {(() => {
    const sub = (suburb || "").toLowerCase().replace(/\s+/g, "-");
    const subRea = (suburb || "").toLowerCase().replace(/\s+/g, "+");
    const stL = (state || "vic").toLowerCase();
    const budgetNum = parseInt(budget) || priceMedian || 800000;
    const minPrice = Math.round(priceMedian * 0.75 / 10000) * 10000;
    const maxPrice = Math.round(budgetNum * 1.05 / 10000) * 10000;
    const beds = propType === "unit" ? "1" : "3";
    const propDomain = propType === "unit" ? "units" : propType === "townhouse" ? "townhouses" : "houses";
    const propRea = propType === "unit" ? "unit" : propType === "townhouse" ? "townhouse" : "house";

    // Deep links with suburb, price range, property type, bedrooms pre-filled
    const links = [
      {
        site: "Domain — For Sale",
        sub2: `${suburb}, ${state} · ${propType} · up to $${(maxPrice/1000).toFixed(0)}k`,
        icon: "🏠", color: "#1a237e", bg: "#e8eaf6",
        url: `https://www.domain.com.au/sale/${sub}-${stL}-${propType === "unit" ? "2" : stL === "vic" ? "3" : stL === "nsw" ? "2" : stL === "qld" ? "4" : stL === "wa" ? "6" : "5"}/${propDomain}/?price=${minPrice}-${maxPrice}&bedrooms=${beds}-any&sort=price-asc`,
      },
      {
        site: "REA — For Sale",
        sub2: `${suburb}, ${state} · ${propType} · sorted price low-high`,
        icon: "🔎", color: "#c62828", bg: "#ffebee",
        url: `https://www.realestate.com.au/buy/property-${propRea}-between-${minPrice}-${maxPrice}+in-${subRea}%2C+${state.toUpperCase()}/list-1?sortType=price-asc`,
      },
      {
        site: "Domain — Recently Sold",
        sub2: `${suburb}, ${state} · actual sold prices & dates`,
        icon: "💰", color: "#1b5e20", bg: "#e8f5e9",
        url: `https://www.domain.com.au/sold/${sub}-${stL}-${propType === "unit" ? "2" : stL === "vic" ? "3" : stL === "nsw" ? "2" : stL === "qld" ? "4" : stL === "wa" ? "6" : "5"}/${propDomain}/?sort=dateSold-desc`,
      },
      {
        site: "REA — Recently Sold",
        sub2: `${suburb}, ${state} · sorted by most recent`,
        icon: "📋", color: "#4a148c", bg: "#f3e5f5",
        url: `https://www.realestate.com.au/sold/property-${propRea}-in-${subRea}%2C+${state.toUpperCase()}/list-1?sortType=soldDate-desc`,
      },
      {
        site: "CoreLogic RP Data",
        sub2: "Independent property valuations & market data",
        icon: "📊", color: "#0d47a1", bg: "#e3f2fd",
        url: `https://www.rpdata.com/properties/search?suburb=${encodeURIComponent(suburb || "")}&state=${state}`,
      },
    ];

    return (
      <div style={{ background: C.warm, border: `1px solid ${C.oBorder}`, borderRadius: 12, padding: "1rem", marginBottom: "1.1rem" }}>
        <SH title="Live Property Search — For Sale & Recently Sold" />

        {/* Why explanation */}
        <div style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 8, padding: "9px 11px", marginBottom: "0.85rem", fontSize: "0.7rem", color: "#1565c0", lineHeight: 1.6 }}>
          <strong>Why aren't listings shown directly?</strong><br/>
          Unlike ChatGPT which can search the web in real time, this tool runs entirely in your browser with no ability to fetch live data from Domain or REA (browsers block cross-site data requests for security). The links below open pre-filtered searches on the actual listing sites — suburb, property type, and price range are already filled in for you.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {links.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 10, background: link.bg, border: `1px solid ${link.color}33`, borderRadius: 9, padding: "0.75rem 0.9rem", textDecoration: "none" }}>
              <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{link.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.76rem", fontWeight: 700, color: link.color }}>{link.site}</div>
                <div style={{ fontSize: "0.64rem", color: C.mid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.sub2}</div>
              </div>
              <div style={{ background: link.color, color: "#fff", borderRadius: 20, padding: "3px 10px", fontSize: "0.65rem", fontWeight: 600, flexShrink: 0 }}>Open →</div>
            </a>
          ))}
        </div>

        {/* Price filter summary */}
        <div style={{ background: C.cream, border: `1px solid ${C.oBorder}`, borderRadius: 8, padding: "8px 10px", fontSize: "0.68rem", color: C.mid }}>
          <strong style={{ color: C.dark }}>Pre-filled search filters:</strong>&nbsp;
          Suburb: <strong>{suburb}, {state}</strong> &nbsp;·&nbsp;
          Type: <strong>{propType}</strong> &nbsp;·&nbsp;
          Price range: <strong>${(minPrice/1000).toFixed(0)}k – ${(maxPrice/1000).toFixed(0)}k</strong> &nbsp;·&nbsp;
          Beds: <strong>{beds}+</strong>
        </div>

        {schoolsHigh && (
          <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 7, padding: "6px 10px", marginTop: "0.55rem", fontSize: "0.67rem", color: C.grn }}>
            🎓 <strong>Schools importance is HIGH.</strong> On Domain, use the "School zones" filter. On REA, search by school catchment after opening results.
          </div>
        )}
      </div>
    );
  })()}

  {/* trend analysis */}
  <div style={{ background: C.warm, border: `1px solid ${C.oBorder}`, borderRadius: 12, padding: "1rem", marginBottom: "1.1rem" }}>
    <SH title="Growth Trend Analysis" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "0.65rem" }}>
      {[["Capital Growth", data.trendAnalysis?.priceAcceleration, data.trendAnalysis?.priceNarrative], ["Rental Growth", data.trendAnalysis?.rentalAcceleration, data.trendAnalysis?.rentalNarrative]].map(([title, status, text]) => (
        <div key={title} style={{ background: C.cream, borderRadius: 9, padding: "0.8rem", border: `1px solid ${C.oBorder}` }}>
          <div style={{ fontSize: "0.61rem", fontWeight: 700, color: C.mid, textTransform: "uppercase", marginBottom: 4 }}>{title}</div>
          <div style={{ display: "inline-block", borderRadius: 20, padding: "2px 9px", fontSize: "0.68rem", fontWeight: 700, marginBottom: 5, background: status === "accelerating" ? "#c8e6c9" : status === "slowing" ? "#ffcdd2" : "#fff9c4", color: status === "accelerating" ? C.grn : status === "slowing" ? C.red : "#6d5a00" }}>
            {status === "accelerating" ? "📈 Accelerating" : status === "slowing" ? "📉 Slowing" : "➡ Stable"}
          </div>
          <p style={{ fontSize: "0.71rem", color: C.mid, lineHeight: 1.6 }}>{text}</p>
        </div>
      ))}
    </div>
    <div style={{ background: C.cream, borderRadius: 9, padding: "0.8rem", border: `1px solid ${C.oBorder}` }}>
      <div style={{ fontSize: "0.61rem", fontWeight: 700, color: C.mid, textTransform: "uppercase", marginBottom: 4 }}>Recent Momentum vs Decade Average</div>
      <p style={{ fontSize: "0.71rem", color: C.mid, lineHeight: 1.6, marginBottom: 7 }}>{data.trendAnalysis?.recentMomentum}</p>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <div><div style={{ fontSize: "0.58rem", color: C.grn, fontWeight: 700, marginBottom: 2 }}>BEST YEARS</div><div style={{ fontSize: "0.72rem" }}>{(data.trendAnalysis?.best3Years || []).join(", ")}</div></div>
        <div><div style={{ fontSize: "0.58rem", color: C.mid, fontWeight: 700, marginBottom: 2 }}>SLOWEST YEARS</div><div style={{ fontSize: "0.72rem" }}>{(data.trendAnalysis?.slowest3Years || []).join(", ")}</div></div>
      </div>
    </div>
  </div>

  {/* BLURRED SECTION */}
  <div style={{ position: "relative" }}>
    <div style={{ filter: blurred ? "blur(5px)" : "none", pointerEvents: blurred ? "none" : "auto", userSelect: blurred ? "none" : "auto" }}>

      {/* owner occupied */}
      <div style={{ background: C.warm, border: `1px solid ${C.oBorder}`, borderRadius: 12, padding: "1rem", marginBottom: "1.1rem" }}>
        <SH title="Owner-Occupied: Buy vs Rent" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "0.65rem" }}>
          <div style={{ background: C.cream, borderRadius: 9, padding: "0.8rem", border: `1px solid ${C.oBorder}` }}>
            <LI label="Own: mortgage + costs" value={fmtD(data.ownerOccupied?.totalMonthlyHousingCost) + "/mo"} bold color={C.orange} />
            <LI label="Rent equivalent" value={fmtD(data.ownerOccupied?.equivalentMarketRent) + "/mo"} color={C.mid} />
            <LI label={data.ownerOccupied?.verdict === "cheaper" ? "Monthly saving" : "Extra monthly cost"} value={(data.ownerOccupied?.monthlySavingVsRenting >= 0 ? "+" : "") + fmtD(data.ownerOccupied?.monthlySavingVsRenting) + "/mo"} bold color={data.ownerOccupied?.verdict === "cheaper" ? C.grn : C.red} border />
            <div style={{ background: data.ownerOccupied?.verdict === "cheaper" ? "#f0faf4" : C.redBg, border: `1px solid ${data.ownerOccupied?.verdict === "cheaper" ? "#c8e6c9" : C.redBorder}`, borderRadius: 7, padding: "5px 8px", marginTop: 5 }}>
              <div style={{ fontSize: "0.69rem", fontWeight: 700, color: data.ownerOccupied?.verdict === "cheaper" ? C.grn : C.red }}>
                Owning is {data.ownerOccupied?.savingPct}% {data.ownerOccupied?.verdict === "cheaper" ? "CHEAPER" : "MORE EXPENSIVE"} than renting
              </div>
            </div>
          </div>
          <div style={{ background: C.cream, borderRadius: 9, padding: "0.8rem", border: `1px solid ${C.oBorder}` }}>
            <LI label="Annual mortgage" value={fmtD(data.ownerOccupied?.annualCosts?.mortgage) + "/yr"} />
            <LI label="Maintenance" value={fmtD(data.ownerOccupied?.annualCosts?.maintenance) + "/yr"} />
            <LI label="Council rates" value={fmtD(data.ownerOccupied?.annualCosts?.councilRates) + "/yr"} />
            <LI label="Insurance" value={fmtD(data.ownerOccupied?.annualCosts?.insurance) + "/yr"} />
            <LI label="Total annual cost" value={fmtD(data.ownerOccupied?.annualCosts?.total) + "/yr"} bold color={C.orange} border />
            <LI label="Equiv. annual rent" value={fmtD(data.ownerOccupied?.annualCosts?.equivalentAnnualRent) + "/yr"} color={C.mid} />
          </div>
        </div>
        <div style={{ background: "#f0faf4", border: "1px solid #c8e6c9", borderRadius: 9, padding: "0.8rem" }}>
          <p style={{ fontSize: "0.75rem", color: C.dark, lineHeight: 1.7 }}>{data.ownerOccupied?.breakdownNarrative}</p>
        </div>
      </div>

      {/* investment P&L */}
      <div style={{ background: C.warm, border: `1px solid ${C.oBorder}`, borderRadius: 12, padding: "1rem", marginBottom: "1.1rem" }}>
        <SH title="Investment — Annual P&L" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "0.65rem" }}>
          <div style={{ background: C.cream, borderRadius: 9, padding: "0.8rem", border: `1px solid ${C.oBorder}` }}>
            <LI label="Gross rental income" value={"+" + fmtD(data.investmentScenario?.annualPL?.rentalIncome) + "/yr"} color={C.grn} />
            <LI label="Less: vacancy" value={"−" + fmtD(data.investmentScenario?.annualPL?.vacancyLoss)} color={C.red} />
            <LI label="Less: mgmt (8%)" value={"−" + fmtD(data.investmentScenario?.annualPL?.managementFee)} color={C.red} />
            <LI label="Less: maintenance" value={"−" + fmtD(data.investmentScenario?.annualPL?.maintenance)} color={C.red} />
            <LI label="Less: rates" value={"−" + fmtD(data.investmentScenario?.annualPL?.councilRates)} color={C.red} />
            <LI label="Less: insurance" value={"−" + fmtD(data.investmentScenario?.annualPL?.insurance)} color={C.red} />
            {(data.investmentScenario?.annualPL?.landTax || 0) > 0 && <LI label="Less: land tax" value={"−" + fmtD(data.investmentScenario?.annualPL?.landTax)} color={C.red} />}
            <LI label="Less: interest" value={"−" + fmtD(data.investmentScenario?.annualPL?.interestCost)} color={C.red} />
            {(data.investmentScenario?.annualPL?.depreciation || 0) > 0 && <LI label="Less: depreciation (Div 43)" value={"−" + fmtD(data.investmentScenario?.annualPL?.depreciation)} color={C.red} />}
            <LI label="Net income (pre-tax)" value={fmtD(data.investmentScenario?.annualPL?.netIncome) + "/yr"} bold color={(data.investmentScenario?.annualPL?.netIncome || 0) >= 0 ? C.grn : C.red} border />
            <LI label="Net income (pre-tax)" value={fmtD(data.investmentScenario?.annualPL?.netIncome) + "/yr"} bold color={(data.investmentScenario?.annualPL?.netIncome || 0) >= 0 ? C.grn : C.red} border />
          </div>
          <div style={{ background: C.cream, borderRadius: 9, padding: "0.8rem", border: `1px solid ${C.oBorder}` }}>
            <LI label="Net income (pre-tax)" value={fmtD(data.investmentScenario?.annualPL?.netIncome) + "/yr"} color={(data.investmentScenario?.annualPL?.netIncome || 0) >= 0 ? C.grn : C.red} />
            {(data.investmentScenario?.taxRefundAnnual || 0) > 0 && (
              <LI label={`+ Tax refund (${data.investmentScenario?.marginalRate}% marginal rate)`} value={"+" + fmtD(data.investmentScenario?.taxRefundAnnual) + "/yr"} color={C.grn} bold />
            )}
            {(data.investmentScenario?.extraTaxAnnual || 0) > 0 && (
              <LI label={`− Extra tax on profit (${data.investmentScenario?.marginalRate}%)`} value={"−" + fmtD(data.investmentScenario?.extraTaxAnnual) + "/yr"} color={C.red} bold />
            )}
            <LI label="Net income (after-tax)" value={fmtD(data.investmentScenario?.annualPL?.netIncomeAfterTax) + "/yr"} bold color={(data.investmentScenario?.annualPL?.netIncomeAfterTax || 0) >= 0 ? C.grn : C.red} border />
            <LI label="Capital gain (est.)" value={"+" + fmtD(data.investmentScenario?.annualPL?.capitalGain) + "/yr"} color={C.grn} />
            <LI label="Total return (after-tax)" value={fmtD(data.investmentScenario?.annualPL?.totalReturn) + "/yr"} bold color={C.grn} border />
            <LI label="Gross yield" value={data.investmentScenario?.grossYield + "%"} />
            <LI label="Cashflow (before tax)" value={fmtD(data.investmentScenario?.monthlyNetCashflow) + "/mo"} color={(data.investmentScenario?.monthlyNetCashflow || 0) >= 0 ? C.grn : C.red} />
            <LI label="Cashflow (after tax)" value={fmtD(data.investmentScenario?.monthlyNetCashflowAfterTax) + "/mo"} bold color={(data.investmentScenario?.monthlyNetCashflowAfterTax || 0) >= 0 ? C.grn : C.red} />
          </div>
        </div>
        <div style={{ background: (data.investmentScenario?.cashflowVerdict === "positive") ? "#f0faf4" : C.redBg, border: `1px solid ${(data.investmentScenario?.cashflowVerdict === "positive") ? "#c8e6c9" : C.redBorder}`, borderRadius: 9, padding: "0.8rem", marginBottom: "0.65rem" }}>
          <p style={{ fontSize: "0.75rem", color: C.dark, lineHeight: 1.7 }}>{data.investmentScenario?.investmentNarrative}</p>
        </div>

        {/* Vacancy & leasing risk in report */}
        <div style={{ background: C.cream, borderRadius: 9, padding: "0.85rem", border: `1px solid ${C.oBorder}` }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, color: C.mid, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.65rem" }}>Vacancy & Leasing Risk Analysis</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "0.65rem" }}>
            {[
              ["Vacancy Rate", data.investmentScenario?.vacRate + "%", data.investmentScenario?.vacRiskColor],
              ["Days to Lease", data.investmentScenario?.vacDays + " days", (data.investmentScenario?.vacDays || 0) <= 14 ? C.grn : (data.investmentScenario?.vacDays || 0) <= 25 ? C.orange : C.red],
              ["Risk Level", data.investmentScenario?.vacRisk, data.investmentScenario?.vacRiskColor],
            ].map(([label, val, col]) => (
              <div key={label} style={{ background: C.warm, borderRadius: 8, padding: "0.6rem", border: `1px solid ${C.oBorder}`, textAlign: "center" }}>
                <div style={{ fontSize: "0.55rem", color: C.mid, fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: col }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <div style={{ background: C.warm, borderRadius: 8, padding: "0.6rem", border: `1px solid ${C.oBorder}` }}>
              <div style={{ fontSize: "0.58rem", color: C.mid, fontWeight: 600, marginBottom: 3 }}>ANNUAL VACANCY COST</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: C.red }}>−{fmtD(data.investmentScenario?.annualVacancyCost)}</div>
              <div style={{ fontSize: "0.61rem", color: C.light }}>{data.investmentScenario?.weeksVacant} weeks empty @ ${data.investmentScenario?.weeklyRent}/wk</div>
            </div>
            <div style={{ background: C.warm, borderRadius: 8, padding: "0.6rem", border: `1px solid ${C.oBorder}` }}>
              <div style={{ fontSize: "0.58rem", color: C.mid, fontWeight: 600, marginBottom: 3 }}>WORST CASE (4 WK VACANCY)</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: C.red }}>−{fmtD(data.investmentScenario?.worstCaseMonth)}</div>
              <div style={{ fontSize: "0.61rem", color: C.light }}>mortgage + lost rent in vacancy month</div>
            </div>
          </div>
          <p style={{ fontSize: "0.7rem", color: C.mid, lineHeight: 1.6 }}>{data.investmentScenario?.vacancyNarrative}</p>
          <div style={{ fontSize: "0.61rem", color: C.light, marginTop: 5, fontStyle: "italic" }}>⚠️ Estimated figures — verify at sqmresearch.com.au for live vacancy data by suburb.</div>
        </div>
      </div>

      {/* Monthly Cashflow Waterfall */}
      <div style={{ background: C.warm, border: `1px solid ${C.oBorder}`, borderRadius: 12, padding: "1rem", marginBottom: "1.1rem" }}>
        <SH title="Monthly Cashflow — If Rented" />
        <div style={{ background: "#f0faf4", border: "1px solid #c8e6c9", borderRadius: 9, padding: "0.8rem", marginBottom: "0.65rem" }}>
          <LI label="Gross rent" value={"+" + fmtD(data.investmentScenario?.moRentGross) + "/mo"} color={C.grn} />
          <LI label="Less: vacancy" value={"−" + fmtD(data.investmentScenario?.moVacancy) + "/mo"} color={C.red} />
          <LI label="Less: mgmt (8%)" value={"−" + fmtD(data.investmentScenario?.moMgmt) + "/mo"} color={C.red} />
          <LI label="Less: maint/rates/insure" value={"−" + fmtD((data.investmentScenario?.moMaint||0)+(data.investmentScenario?.moRates||0)+(data.investmentScenario?.moInsure||0)) + "/mo"} color={C.red} />
          {(data.investmentScenario?.moLandTax||0) > 0 && <LI label="Less: land tax" value={"−" + fmtD(data.investmentScenario?.moLandTax) + "/mo"} color={C.red} />}
          <LI label="Net rental income" value={fmtD(data.investmentScenario?.netRentMo) + "/mo"} bold color={C.grn} border />
          <LI label="Less: mortgage (P&I)" value={"−" + fmtD(data.investmentScenario?.annualPL?.interestCost ? Math.round(data.investmentScenario.annualPL.interestCost/12) : 0) + "/mo"} color={C.red} />
          <LI label="Monthly top-up / surplus" value={fmtD(data.investmentScenario?.monthlyNetCashflow) + "/mo"} bold color={(data.investmentScenario?.monthlyNetCashflow||0) >= 0 ? C.grn : C.red} border />
        </div>
        {(data.investmentScenario?.taxRefundAnnual||0) > 0 && (
          <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 9, padding: "0.8rem", marginBottom: "0.65rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: C.grn, marginBottom: 4 }}>TAX REFUND (Negative Gearing)</div>
            <LI label={`Marginal rate ${data.investmentScenario?.marginalRate}% on rental loss`} value={"+" + fmtD(data.investmentScenario?.moTaxRefundDisplay) + "/mo"} color={C.grn} bold />
            <LI label="Incl. Div 43 depreciation" value={fmtD(data.investmentScenario?.depreciation) + "/yr est."} color={C.mid} />
            <LI label="After-tax cashflow" value={fmtD(data.investmentScenario?.monthlyNetCashflowAfterTax) + "/mo"} bold color={(data.investmentScenario?.monthlyNetCashflowAfterTax||0) >= 0 ? C.grn : C.red} border />
          </div>
        )}
        {(data.investmentScenario?.extraTaxAnnual||0) > 0 && (
          <div style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 9, padding: "0.8rem", marginBottom: "0.65rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: C.red, marginBottom: 4 }}>EXTRA TAX (Positively Geared)</div>
            <LI label={`${data.investmentScenario?.marginalRate}% on rental profit`} value={"−" + fmtD(data.investmentScenario?.moExtraTaxDisplay) + "/mo"} color={C.red} bold />
            <LI label="After-tax cashflow" value={fmtD(data.investmentScenario?.monthlyNetCashflowAfterTax) + "/mo"} bold color={C.grn} border />
          </div>
        )}
        <div style={{ background: C.cream, borderRadius: 9, padding: "0.8rem", border: `1px solid ${C.oBorder}` }}>
          <div style={{ fontSize: "0.63rem", fontWeight: 700, color: C.mid, marginBottom: 4 }}>IF OWNER OCCUPIED</div>
          <LI label="Take-home / month" value={fmtD(data.investmentScenario?.atMonthly) + "/mo"} color={C.grn} />
          <LI label="Total housing cost" value={"−" + fmtD(data.investmentScenario?.ownerTotal) + "/mo"} color={C.red} />
          <LI label={data.ownerOccupied?.isCouple ? "Combined left for living" : "Left for living"} value={fmtD(data.ownerOccupied?.netOwner) + "/mo"} bold color={(data.ownerOccupied?.netOwner||0) >= 0 ? C.grn : C.red} border />
        </div>
      </div>

      {/* Buy vs Rent Badge */}
      <div style={{ background: (data.investmentScenario?.verdictStr === "cheaper") ? "#e8f5e9" : C.redBg, border: `1px solid ${(data.investmentScenario?.verdictStr === "cheaper") ? "#c8e6c9" : C.redBorder}`, borderRadius: 12, padding: "0.9rem", marginBottom: "0.75rem", textAlign: "center" }}>
        <div style={{ fontFamily: serif, fontSize: "1rem", fontWeight: 700, color: (data.investmentScenario?.verdictStr === "cheaper") ? C.grn : C.red, marginBottom: 3 }}>
          Owning is {data.investmentScenario?.savePct}% {(data.investmentScenario?.verdictStr === "cheaper") ? "CHEAPER" : "MORE EXPENSIVE"} than renting in {data.reportTitle?.split("—")[1]?.split(",")[0]?.trim()}
        </div>
        <div style={{ fontSize: "0.71rem", color: C.mid }}>
          Own: {fmtD(data.investmentScenario?.ownerTotal)}/mo &nbsp;·&nbsp; Market rent: {fmtD(data.investmentScenario?.mktRentMo)}/mo &nbsp;·&nbsp; Difference: {fmtD(Math.abs(data.investmentScenario?.ownerNetVsRent))}/mo
        </div>
      </div>

      {/* Owner Occupied vs Investment Side-by-Side */}
      <div style={{ background: C.warm, border: `1px solid ${C.oBorder}`, borderRadius: 12, padding: "1rem", marginBottom: "1.1rem" }}>
        <SH title="Owner-Occupied vs Investment — Which is Better?" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "0.65rem" }}>
          <div style={{ background: data.investmentScenario?.ownerBetter ? "linear-gradient(135deg,#e8f5e9,#f0faf4)" : C.cream, border: `1px solid ${data.investmentScenario?.ownerBetter ? "#c8e6c9" : C.oBorder}`, borderRadius: 10, padding: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <div style={{ fontSize: "1rem" }}>{data.investmentScenario?.ownerBetter ? "✅" : "🏠"}</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: data.investmentScenario?.ownerBetter ? C.grn : C.dark }}>Owner Occupied{data.investmentScenario?.ownerBetter ? " — BETTER" : ""}</div>
            </div>
            <LI label="Monthly housing cost" value={fmtD(data.investmentScenario?.ownerTotal) + "/mo"} bold color={C.orange} />
            <LI label="Market rent saved" value={"+" + fmtD(data.investmentScenario?.mktRentMo) + "/mo"} color={C.grn} />
            <LI label="Net cost vs renting" value={fmtD(data.investmentScenario?.ownerNetVsRent) + "/mo"} bold color={(data.investmentScenario?.ownerNetVsRent||0) <= 0 ? C.grn : C.red} border />
            <LI label="Equity built/mo" value={"+" + fmtD(data.investmentScenario?.moPrincipal) + "/mo"} color={C.grn} />
            <LI label="Left for living" value={fmtD(data.ownerOccupied?.netOwner) + "/mo"} color={(data.ownerOccupied?.netOwner||0) >= 0 ? C.grn : C.red} />
          </div>
          <div style={{ background: !data.investmentScenario?.ownerBetter ? "linear-gradient(135deg,#e8f5e9,#f0faf4)" : C.cream, border: `1px solid ${!data.investmentScenario?.ownerBetter ? "#c8e6c9" : C.oBorder}`, borderRadius: 10, padding: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <div style={{ fontSize: "1rem" }}>{!data.investmentScenario?.ownerBetter ? "✅" : "🏘"}</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: !data.investmentScenario?.ownerBetter ? C.grn : C.dark }}>Rented Out{!data.investmentScenario?.ownerBetter ? " — BETTER" : ""}</div>
            </div>
            <LI label="Net rental income" value={fmtD(data.investmentScenario?.netRentMo) + "/mo"} color={C.grn} />
            <LI label="Less: mortgage" value={"−" + fmtD(Math.round((data.investmentScenario?.annualPL?.interestCost||0)/12)) + "/mo"} color={C.red} />
            <LI label="Cashflow (before tax)" value={fmtD(data.investmentScenario?.monthlyNetCashflow) + "/mo"} color={(data.investmentScenario?.monthlyNetCashflow||0) >= 0 ? C.grn : C.red} border />
            {(data.investmentScenario?.taxRefundAnnual||0) > 0 && <LI label={`Tax refund (${data.investmentScenario?.marginalRate}%)`} value={"+" + fmtD(data.investmentScenario?.moTaxRefundDisplay) + "/mo"} color={C.grn} />}
            {(data.investmentScenario?.extraTaxAnnual||0) > 0 && <LI label={`Extra tax (${data.investmentScenario?.marginalRate}%)`} value={"−" + fmtD(data.investmentScenario?.moExtraTaxDisplay) + "/mo"} color={C.red} />}
            <LI label="True monthly cost" value={fmtD(data.investmentScenario?.rentedOOPAfterTax) + "/mo"} bold color={(data.investmentScenario?.rentedOOPAfterTax||0) === 0 ? C.grn : C.red} border />
            <LI label="Equity built/mo" value={"+" + fmtD(data.investmentScenario?.moPrincipal) + "/mo"} color={C.grn} />
          </div>
        </div>
        <div style={{ background: C.oPale, border: `1px solid ${C.oBorder}`, borderRadius: 8, padding: "7px 10px", fontSize: "0.67rem", color: C.mid, lineHeight: 1.5 }}>
          <strong style={{ color: C.dark }}>Tax refund includes Div 43 depreciation</strong> est. {fmtD(data.investmentScenario?.depreciation)}/yr.
          Total deductibles: {fmtD(data.investmentScenario?.totalDeductible)}/yr vs gross rent {fmtD((data.investmentScenario?.moRentGross||0)*12)}/yr.
          Consult your accountant — eligibility depends on property age.
        </div>
      </div>

      {/* 5yr projection */}
      <div style={{ background: "linear-gradient(135deg,#f8f0e0,#fef8ec)", border: `1px solid ${C.oBorder}`, borderRadius: 12, padding: "1rem", marginBottom: "1.1rem" }}>
        <SH title="5-Year Projection (2025–2030)" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "0.5rem", marginBottom: "0.65rem" }}>
          {[["Price 2030", fmtD(data.fiveYearProjection?.projectedPrice2030), C.orange], ["Rent 2030", "$" + (data.fiveYearProjection?.projectedWeeklyRent2030 || "—") + "/wk", C.grn], ["Equity 2030", fmtD(data.fiveYearProjection?.projectedEquity2030), "#1565c0"]].map(([label, val, color]) => (
            <div key={label} style={{ background: C.warm, borderRadius: 9, padding: "0.7rem", border: `1px solid ${C.oBorder}`, textAlign: "center" }}>
              <div style={{ fontSize: "0.58rem", color: C.mid, textTransform: "uppercase", fontWeight: 600, marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: serif, fontSize: "1.1rem", fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "0.75rem", color: C.mid, lineHeight: 1.65 }}>{data.fiveYearProjection?.narrative}</p>
      </div>

      {/* verdict */}
      <div style={{ background: data.recommendation === "buy" ? "linear-gradient(135deg,#e8f5e9,#f0faf4)" : data.recommendation === "caution" ? "#fff8e1" : C.warm, border: `1px solid ${data.recommendation === "buy" ? "#c8e6c9" : data.recommendation === "caution" ? "#ffe082" : C.redBorder}`, borderRadius: 12, padding: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.65rem" }}>
          <div style={{ fontSize: "1.4rem" }}>{data.recommendation === "buy" ? "✅" : data.recommendation === "caution" ? "⚡" : "⚠️"}</div>
          <div style={{ fontFamily: serif, fontSize: "1.05rem", fontWeight: 700, color: data.recommendation === "buy" ? C.grn : data.recommendation === "caution" ? "#6d4c00" : C.red }}>
            Verdict: {data.recommendation === "buy" ? "BUY" : data.recommendation === "caution" ? "PROCEED WITH CAUTION" : "HOLD / RECONSIDER"}
          </div>
        </div>
        <p style={{ fontSize: "0.76rem", color: C.dark, lineHeight: 1.7, marginBottom: "0.75rem" }}>{data.recommendationNarrative}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div><div style={{ fontSize: "0.58rem", fontWeight: 700, color: C.grn, textTransform: "uppercase", marginBottom: 4 }}>Positives</div>{(data.positiveFactors || []).map((p, i) => <div key={i} style={{ fontSize: "0.7rem", color: C.dark, marginBottom: 3 }}><span style={{ color: C.grn }}>+ </span>{p}</div>)}</div>
          <div><div style={{ fontSize: "0.58rem", fontWeight: 700, color: C.red, textTransform: "uppercase", marginBottom: 4 }}>Risks</div>{(data.riskFactors || []).map((r, i) => <div key={i} style={{ fontSize: "0.7rem", color: C.dark, marginBottom: 3 }}><span style={{ color: C.red }}>− </span>{r}</div>)}</div>
        </div>
      </div>

    </div>{/* end blur div */}

    {/* lock overlay */}
    {blurred && (
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to bottom, transparent, rgba(255,249,242,0.97) 35%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "1.5rem", zIndex: 5 }}>
        <div style={{ background: C.warm, border: `2px solid ${C.orange}`, borderRadius: 16, padding: "1.25rem 1.5rem", textAlign: "center", boxShadow: "0 8px 32px rgba(232,133,10,0.25)", maxWidth: 380, width: "90%" }}>
          <div style={{ fontSize: "1.3rem", marginBottom: 5 }}>🔒</div>
          <div style={{ fontFamily: serif, fontSize: "1rem", fontWeight: 700, color: C.dark, marginBottom: 4 }}>Report verified — unlock full analysis</div>
          <div style={{ fontSize: "0.72rem", color: C.mid, lineHeight: 1.5, marginBottom: "0.9rem" }}>
            You've reviewed the data above. Pay $10 to unlock the investment P&L, 5-year projection, and buy/hold verdict.
          </div>
          <button onClick={onUnlock} style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})`, color: "#fff", border: "none", borderRadius: 25, padding: "11px 28px", fontFamily: sans, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(232,133,10,0.4)", width: "100%" }}>
            💳 Pay $10 — Unlock Full Report
          </button>
          <div style={{ fontSize: "0.6rem", color: C.light, marginTop: 7 }}>🔒 Secure · One-time · No subscription</div>
        </div>
      </div>
    )}
  </div>
  {/* ── FULL DISCLAIMER ── */}
  <div style={{ background: "#1a0f00", borderRadius: 12, padding: "1.1rem 1.25rem", marginTop: "0.5rem" }}>
    <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#e8c878", marginBottom: 6, letterSpacing: "0.05em" }}>⚠️ IMPORTANT DISCLAIMER — PLEASE READ</div>
    <div style={{ fontSize: "0.63rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.75 }}>
      <strong style={{ color: "rgba(255,255,255,0.95)" }}>This report is for general informational purposes only and does not constitute financial, investment, legal, or taxation advice.</strong><br/><br/>
      <strong style={{ color: "#e8c878" }}>Suburb data:</strong> Median prices and capital growth figures are based on training data accurate to approximately August 2025 and may not reflect current market conditions. Year-by-year price and rental history are modelled estimates — not actual historical transaction records.<br/><br/>
      <strong style={{ color: "#e8c878" }}>Vacancy &amp; days on market:</strong> Algorithmic estimates derived from suburb characteristics (rental growth, lifestyle score, price bracket). Not live data. Verify at <strong style={{color:"#e8c878"}}>sqmresearch.com.au</strong> or Domain/REA suburb profiles.<br/><br/>
      <strong style={{ color: "#e8c878" }}>Financial calculations:</strong> Mortgage repayments, tax estimates, negative gearing, depreciation (Div 43 assumes 2.5% on 60% of purchase price — eligibility depends on property age and construction), stamp duty and cashflow projections are indicative only.<br/><br/>
      <strong style={{ color: "#e8c878" }}>Before purchasing, you must:</strong><br/>
      • Obtain formal <strong style={{color:"#fff"}}>bank/lender pre-approval</strong> to confirm actual borrowing capacity<br/>
      • Commission an independent <strong style={{color:"#fff"}}>property valuation</strong> from a licensed valuer<br/>
      • Consult a licensed <strong style={{color:"#fff"}}>mortgage broker</strong> to compare loan products and confirm serviceability<br/>
      • Seek advice from an <strong style={{color:"#fff"}}>AFSL-licensed financial adviser</strong> regarding investment suitability<br/>
      • Consult a <strong style={{color:"#fff"}}>registered tax agent or accountant</strong> for negative gearing and depreciation claims<br/>
      • Conduct due diligence including building/pest inspection, title search, and strata records (if applicable)<br/><br/>
      <strong style={{ color: "rgba(255,255,255,0.95)" }}>Suburb Match Finder and its operators accept no liability for any loss or damage arising from reliance on estimates in this report.</strong> Past performance is not a reliable indicator of future results. Property investment involves risk, including potential loss of capital.
    </div>
    <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
      Generated {data.generatedDate} · Suburb Match Finder · Not financial advice · Data estimated to Aug 2025
    </div>
  </div>
</div>
```

);
}

// ── Report helper functions ─────────────────────────────
function buildPriceHistory(currentPrice, capRate) {
const rows = [];
let p = currentPrice;
const years = [2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];
const prices = [p];
for (let i = 0; i < 9; i++) {
let rate = capRate / 100;
const yr = years[9 - i];
if (yr === 2021) rate = rate * 2.2;
else if (yr === 2020) rate = -0.03;
else if (yr === 2022) rate = rate * 1.3;
else if (yr === 2019 || yr === 2018) rate = rate * 0.6;
else rate = rate * (0.7 + Math.random() * 0.6);
p = Math.round(p / (1 + rate) / 5000) * 5000;
prices.unshift(p);
}
const notes = {
2016:“Pre-boom baseline”, 2017:“Strong auction market”, 2018:“Credit tightening”,
2019:“Election year caution”, 2020:“COVID-19 impact”, 2021:“Post-COVID surge”,
2022:“Rate hikes moderate growth”, 2023:“Market stabilises”, 2024:“Recovery momentum”, 2025:“Current median”
};
for (let i = 0; i < 10; i++) {
const growth = i === 0 ? null : prices[i] - prices[i-1];
const growthPct = i === 0 ? null : parseFloat(((prices[i] - prices[i-1]) / prices[i-1] * 100).toFixed(1));
rows.push({ year: years[i], medianPrice: prices[i], growth, growthPct, note: notes[years[i]] });
}
return rows;
}

function buildRentalHistory(currentRent, rentGRate) {
const rows = [];
let r = currentRent;
const years = [2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];
const rents = [r];
for (let i = 0; i < 9; i++) {
let rate = rentGRate / 100;
const yr = years[9 - i];
if (yr === 2022 || yr === 2023) rate = rate * 1.8;
else if (yr === 2020) rate = -0.02;
else rate = rate * (0.5 + Math.random() * 0.8);
r = Math.round(r / (1 + rate) / 5) * 5;
rents.unshift(r);
}
for (let i = 0; i < 10; i++) {
const growth = i === 0 ? null : rents[i] - rents[i-1];
const growthPct = i === 0 ? null : parseFloat(((rents[i] - rents[i-1]) / rents[i-1] * 100).toFixed(1));
rows.push({ year: years[i], weeklyRent: rents[i], annualRent: rents[i]*52, growth, growthPct });
}
return rows;
}

// ── Main App ──────────────────────────────────────────────
export default function App() {
const [f, setF] = useState({
salary: “120000”, salary2: “”, cash: “80000”, goal: “investment”,
budget: “700000”, state: “VIC”, propType: “house”,
risk: “balanced”, schools: “high”, term: “30”,
tenanted: true, hecs: false, hecs2: false, rate: “6.20”,
});
const set = (k) => (v) => { setF(p => ({ …p, [k]: v })); setChecks(null); setResult(null); };
const [result, setResult] = useState(null);
const [checks, setChecks] = useState(null); // null = not run, object = results

// Alt suburb unlock state
const [unlockedAlts, setUnlockedAlts] = useState({});
const [payModal, setPayModal] = useState(null);
const [payStep, setPayStep] = useState(“form”);
const [cardNum, setCardNum] = useState(””);
const [cardExp, setCardExp] = useState(””);
const [cardCvv, setCardCvv] = useState(””);

// Report state
const [showReport, setShowReport] = useState(false);
const [showSample, setShowSample] = useState(false);
const [reportStep, setReportStep] = useState(“idle”); // idle|generating|preview|paid
const [reportData, setReportData] = useState(null);
const [reportError, setReportError] = useState(””);
const [reportPaid, setReportPaid] = useState(false);

function find() {
const budget   = parseInt(f.budget)  || 0;
const cash     = parseInt(f.cash)    || 0;
const gross1   = parseInt(f.salary)  || 0;
const gross2   = parseInt(f.salary2) || 0;
const rate     = parseFloat(f.rate)  / 100 || 0.062;
const term     = parseInt(f.term)    || 30;

```
const stamp    = Math.round(budget * 0.04);
const legal    = 3300;
const r        = rate / 12;
const n        = term * 12;
const moFactor = r > 0 ? (r * Math.pow(1+r,n)) / (Math.pow(1+r,n) - 1) : 0;

// Combined after-tax income
const tc1 = calcAfterTax(gross1, f.hecs);
const tc2 = gross2 > 0 ? calcAfterTax(gross2, f.hecs2) : { afterTax: 0 };
const atMonthly = (tc1.afterTax + tc2.afterTax) / 12;

// ── SMART DEPOSIT CALCULATION ─────────────────────────
// The right way: use as much cash as possible as deposit,
// but always keep a 12-month mortgage buffer in reserve.
//
// Step 1: Figure out what 12 months of mortgage costs at standard 80% LVR
const stdLoan       = budget * 0.80;
const stdMo         = stdLoan * moFactor;
const bufferReserve = Math.round(stdMo * 12); // 1-year safety reserve

// Step 2: Cash available for deposit = total cash − buffer − stamp − legal
const cashForDeposit = Math.max(0, cash - bufferReserve - stamp - legal);

// Step 3: Actual loan = budget − cash deposit (floored at 0 for full cash)
const smartLoan     = Math.max(0, budget - cashForDeposit);
const smartDeposit  = budget - smartLoan;
const smartDepositPct = Math.round((smartDeposit / budget) * 100);
const smartMo       = smartLoan * moFactor; // monthly repayment on reduced loan
const smartDsr      = atMonthly > 0 && smartMo > 0 ? smartMo / atMonthly : 0;
const cashRemaining = cash - smartDeposit - stamp - legal; // = approx bufferReserve

// Is this a pure cash purchase?
const isCashPurchase = smartLoan <= 0;

// ── CHECKPOINT 1: Can cash cover deposit + costs? ─────
const minDeposit20  = budget * 0.20; // standard 20%
const upfront20     = minDeposit20 + stamp + legal;
const depositOK     = cash >= upfront20;
const cashAfterStd  = cash - upfront20;

// ── CHECKPOINT 2: Is the SMART loan serviceable? ──────
// Use smartMo (reduced loan from large deposit) not stdMo
const effectiveMo   = isCashPurchase ? 0 : smartMo;
const effectiveDsr  = isCashPurchase ? 0 : smartDsr;
const mortgageOK    = isCashPurchase || effectiveDsr < 0.60;
const stressed      = !isCashPurchase && effectiveDsr >= 0.35 && effectiveDsr < 0.60;

// Max affordable budget at 35% DSR with 20% deposit (for option 3)
const maxAffordable = moFactor > 0
  ? Math.round((atMonthly * 0.35) / moFactor / 0.8 / 10000) * 10000
  : 0;
const maxFromCash   = Math.round((cash - legal) / 0.24 / 10000) * 10000;

// Buffer months remaining after smart deposit
const bufferMos = isCashPurchase ? 999
  : smartMo > 0 ? Math.round(cashRemaining / smartMo) : 999;

const allOK = depositOK && mortgageOK;

setChecks({
  budget, cash, gross1, gross2, atMonthly, rate, term,
  // Standard 20% numbers (for display reference)
  deposit: Math.round(minDeposit20), stamp, legal,
  upfront: Math.round(upfront20),
  cashAfter: Math.round(cashAfterStd),
  depositOK, bufferMos,
  // Smart deposit numbers (actual recommendation)
  smartDeposit: Math.round(smartDeposit),
  smartDepositPct,
  smartLoan: Math.round(smartLoan),
  smartMo: Math.round(smartMo),
  smartDsr,
  cashRemaining: Math.round(cashRemaining),
  bufferReserve: Math.round(bufferReserve),
  isCashPurchase,
  // Serviceability
  mo: Math.round(effectiveMo),
  dsr: effectiveDsr,
  mortgageOK, stressed,
  maxAffordable, maxFromCash,
  isCouple: gross2 > 0, allOK,
});

// Only proceed to results if both checks pass
if (!depositOK || !mortgageOK) return;

const ranked = findMatches(f);
if (!ranked.length) return;
const best = ranked[0];
const alts = ranked.slice(1, 3);
// Use locally computed smart deposit values (not stale checks state)
// smartDeposit and budget are already in scope from the checkpoint calculations above
const _smartRatio = smartDeposit / budget;
const mkOverride = (subPrice) => {
  const dep = Math.round(subPrice * _smartRatio);
  const ln  = Math.max(0, subPrice - dep);
  return { deposit: dep, loan: ln };
};
const fin = calcFin(best, f, mkOverride(best.price));
const hl = getHL(best, f);
const altsWithFin = alts.map(a => ({ ...a, fin: calcFin(a, f, mkOverride(a.price)), hl: getHL(a, f) }));
setResult({ best: { ...best, fin, hl }, alts: altsWithFin });
setUnlockedAlts({});
setReportData(null);
setReportStep("idle");
setReportPaid(false);
```

}

function generateReport() {
if (!result) return;
setShowReport(true);
setReportStep(“generating”);
setTimeout(() => {
try {
const b = result.best;
// Recalculate fresh — use smart deposit ratio from checkpoints if available
const _smartRatio = checks ? checks.smartDeposit / checks.budget : 0.2;
const _dep = Math.round(b.price * _smartRatio);
const _ln  = Math.max(0, b.price - _dep);
const fin = calcFin(b, f, { deposit: _dep, loan: _ln });
const price = b.price;
const rent = b.rent;
const cap = b.cap;
const rentG = b.rentG;
const st = f.state;

```
const priceHistory = buildPriceHistory(price, cap);
const rentalHistory = buildRentalHistory(rent, rentG);

// Find best/worst years
const priceGrowths = priceHistory.filter(r => r.growthPct != null).sort((a,b) => b.growthPct - a.growthPct);
const best3 = priceGrowths.slice(0,3).map(r => String(r.year));
const slow3 = priceGrowths.slice(-3).map(r => String(r.year));
const recentAvg = priceHistory.slice(7).filter(r=>r.growthPct).reduce((s,r)=>s+r.growthPct,0)/2;
const decadeAvg = priceHistory.filter(r=>r.growthPct).reduce((s,r)=>s+r.growthPct,0)/9;
const accel = recentAvg > decadeAvg * 1.1 ? "accelerating" : recentAvg < decadeAvg * 0.9 ? "slowing" : "stable";

// Financial calculations
const totalExpenses = Math.round(rent*52*0.03 + rent*52*0.08 + price*0.005 + price*0.002 + 1800 + fin.annLandTax + fin.moInterest*12);
const netIncome = Math.round(rent*52 - totalExpenses);
const capitalGain = Math.round(price * cap / 100);
const netYield = parseFloat(((netIncome / price) * 100).toFixed(2));
const equity2030 = Math.round(fin.moPrincipal * 12 * 5);
const price2030 = Math.round(price * Math.pow(1 + cap/100, 5));
const rent2030 = Math.round(rent * Math.pow(1 + rentG/100, 5));

// No fake listings — display uses live Domain/REA links instead
const listingsForSale = [];
const recentSales = [];

const isPositive = fin.rentedCF >= 0;

// ── Fully dynamic verdict — specific to this suburb, income, and scenario ──
const _sr = fin.mo / fin.atMonthly;
const _srPct = Math.round(_sr * 100);
const _buf = fin.cashAfter >= fin.mo * 3;
const _isCashPurchase = fin.loan === 0 || fin.mo === 0;
const _aff = _sr < 0.45;
const _gro = cap >= 6;
const _str = cap >= 8;
const _neg = cap < 0;
const _hng = fin.rentedCF < -(fin.atMonthly * 0.3);
const _nca = fin.cashAfter < 0;
const _ext = _sr > 0.6;
const _couple = fin.isCouple;
const _incomeStr = _couple
  ? `combined income of ${fmtD(fin.grossSalary)} (${fmtD(fin.grossSalary1)} + ${fmtD(fin.grossSalary2)})`
  : `${fmtD(fin.grossSalary1)} salary`;
const _takeHome = fmtD(fin.atMonthly);
const _hasRefund = fin.moTaxRefund > 0;
const _afterTaxCF = fin.rentedCFAfterTax;
const _trueOOP = fin.rentedOOPAfterTax;
const _proj5 = fmtD(price2030);
const _gain5 = fmtD(price2030 - price);
const _rateRiseSensitivity = fin.loan > 0 ? fmtD(Math.round(fin.loan * 0.005 / 12)) : "$0";
const _growthLabel = cap >= 15 ? "exceptional" : cap >= 10 ? "very strong" : cap >= 7 ? "strong" : cap >= 5 ? "solid" : cap >= 3 ? "moderate" : cap < 0 ? "negative" : "weak";
const _yieldLabel = parseFloat(fin.grossYield) >= 5.5 ? "high" : parseFloat(fin.grossYield) >= 4 ? "reasonable" : "low";
const _stressLabel = _isCashPurchase ? "no mortgage" : (_srPct < 25 ? "very comfortable" : _srPct < 35 ? "manageable" : _srPct < 45 ? "acceptable" : _srPct < 55 ? "stretched" : "severe");
const _bufMosStr = _isCashPurchase ? "unlimited" : (fin.mo > 0 ? Math.round(fin.cashAfter / fin.mo) + " months" : "ample");
const _bufMos = _isCashPurchase ? "unlimited" : (fin.mo > 0 ? Math.round(fin.cashAfter / fin.mo) : 0);

let _rec, _nar, _rsk, _pos;

if (_nca) {
  _rec = "no-go";
  _nar = `At ${fmtD(price)}, ${b.suburb} requires ${fmtD(fin.upfront)} upfront (${fmtD(fin.deposit)} deposit + ${fmtD(fin.stamp)} stamp duty + ${fmtD(fin.legal)} legal), but your available cash of ${fmtD(parseInt(f.cash))} falls short by ${fmtD(Math.abs(fin.cashAfter))}. This purchase is not possible without additional savings${cap >= 7 ? ` — though ${b.suburb}'s ${cap}% growth rate makes it worth targeting once your deposit is ready` : ""}. Consider suburbs under ${fmtD(Math.round(parseInt(f.cash) / 0.26 / 10000) * 10000)} where your cash is sufficient.`;
  _rsk = [
    `Deposit shortfall of ${fmtD(Math.abs(fin.cashAfter))} — purchase not possible`,
    `Upfront costs of ${fmtD(fin.upfront)} exceed available cash`,
    "Zero buffer for unexpected costs post-purchase"
  ];
  _pos = cap >= 7
    ? [`${b.suburb}'s ${cap}% growth rate is compelling — revisit when deposit is ready`, `Target saving ${fmtD(Math.abs(fin.cashAfter))} more before purchasing`]
    : ["Build savings before re-evaluating", "Lower-priced suburbs may be more accessible now"];

} else if (_ext) {
  _rec = "no-go";
  _nar = `${b.suburb} at ${fmtD(price)} is unaffordable on ${_couple ? "your combined " : "a "}${_incomeStr}. The monthly repayment of ${fmtD(fin.mo)} consumes ${_srPct}% of your ${_takeHome}/mo take-home — the safe threshold is 35%. You would have only ${fmtD(fin.netOwner)}/mo left after mortgage and running costs, leaving little margin for everyday living, rate rises, or maintenance. ${cap >= 8 ? `${b.suburb}'s ${cap}% growth is impressive but irrelevant if repayments force a sale.` : `Even with ${cap}% growth, the cashflow risk outweighs the upside at this income level.`}`;
  _rsk = [
    `Mortgage consumes ${_srPct}% of take-home — ${_stressLabel} stress`,
    `Only ${fmtD(fin.netOwner)}/mo left after all housing costs`,
    `Each 0.5% rate rise adds ${_rateRiseSensitivity}/mo to repayments`,
    `${_hasRefund ? `Even with ${fmtD(fin.moTaxRefund)}/mo tax refund, cashflow is dangerously tight` : "No rental income buffer"}`
  ];
  _pos = cap >= 8
    ? [`${cap}% growth — strong suburb, worth revisiting if income grows`, `Consider a unit in ${b.suburb} at a lower price point`]
    : ["Consider more affordable suburbs in the same region", "Increase income or deposit before targeting this price point"];

} else if (_neg) {
  _rec = "caution";
  _nar = `${b.suburb} is showing a ${cap}% compound annual growth rate — meaning median prices have been declining. For a ${_couple ? "couple" : "buyer"} on ${_incomeStr}, the mortgage of ${fmtD(fin.mo)}/mo (${_srPct}% of take-home) is ${_stressLabel}, but the capital growth risk is real. ${parseFloat(fin.grossYield) >= 4.5 ? `The ${fin.grossYield}% yield does provide solid rental income — ${_hasRefund ? `and after the ${fmtD(fin.moTaxRefund)}/mo tax refund, your true out-of-pocket is ${fmtD(_trueOOP)}/mo` : "which partially cushions the capital risk"}. ` : ""}This suburb may suit a cash buyer with a 10+ year horizon, but is risky for a leveraged investor who may need to sell within 5–7 years.`;
  _rsk = [
    `Negative ${cap}% CAGR — median prices are falling`,
    `Risk of being underwater if prices fall further after purchase`,
    `Hard to refinance or sell in a falling market`,
    `${parseFloat(fin.grossYield) < 4 ? "Low yield of " + fin.grossYield + "% offers limited cashflow cushion" : "Monitor vacancy closely — yield could deteriorate"}`
  ];
  _pos = [
    `Mortgage stress is ${_stressLabel} at ${_srPct}% of take-home`,
    parseFloat(fin.grossYield) >= 4.5 ? `Reasonable yield of ${fin.grossYield}%` : `Lower entry price reduces loan exposure`,
    _hasRefund ? `Tax refund of ${fmtD(fin.moTaxRefund)}/mo reduces true cost to ${fmtD(_trueOOP)}/mo` : `Cash buffer of ${fmtD(fin.cashAfter)} post-purchase`
  ];

} else if (!_aff && _hng && !_gro) {
  _rec = "caution";
  _nar = `${b.suburb} presents a poor risk/return combination for ${_couple ? "this household" : "your income"}. Repayments of ${fmtD(fin.mo)}/mo take ${_srPct}% of ${_takeHome}/mo take-home, the property needs a ${fmtD(Math.abs(fin.rentedCF))}/mo top-up if rented${_hasRefund ? ` (${fmtD(_trueOOP)}/mo after the ${fmtD(fin.moTaxRefund)}/mo tax refund)` : ""}, and ${cap}% growth is below average. At current interest rates, this suburb is not generating enough return to justify the cashflow burden. If you have a specific reason to be in this suburb (family, lifestyle, infrastructure coming), consider owner-occupying rather than investing.`;
  _rsk = [
    `Mortgage stress — ${_srPct}% of ${_takeHome}/mo take-home`,
    `Negative cashflow ${fmtD(Math.abs(fin.rentedCF))}/mo before tax${_hasRefund ? `, ${fmtD(_trueOOP)}/mo after refund` : ""}`,
    `${cap}% growth is below the 6% threshold for viable investment`,
    `Loan of ${fmtD(fin.loan)} sensitive to rate rises — ${_rateRiseSensitivity}/mo per 0.5%`
  ];
  _pos = [
    `Tax refund of ${fmtD(fin.annTaxRefund)}/yr reduces holding cost`,
    `${fmtD(fin.cashAfter)} cash buffer remaining post-purchase`,
    `Equity of ${fmtD(fin.moPrincipal)}/mo builds regardless of market`
  ];

} else if (!_aff && !_buf) {
  _rec = "caution";
  _nar = `${b.suburb} is technically affordable for ${_couple ? "this household" : "your income"} — repayments at ${_srPct}% of ${_takeHome}/mo take-home — but the ${fmtD(fin.cashAfter)} remaining after the ${fmtD(fin.upfront)} upfront costs gives only ${_bufMos} months of mortgage buffer. ${_gro ? `The ${cap}% growth rate is a genuine positive` : `The ${cap}% growth rate is moderate`}, but a rate rise of 1%, a period of vacancy, or an unexpected repair bill could create real financial stress. ${f.goal === "investment" && _hasRefund ? `The ${fmtD(fin.moTaxRefund)}/mo tax refund (${fin.marginalRate}% marginal rate) reduces the true out-of-pocket to ${fmtD(_trueOOP)}/mo, which helps, but the thin buffer is the main concern.` : ""}`;
  _rsk = [
    `Only ${_bufMos} months mortgage buffer (${fmtD(fin.cashAfter)}) after purchase`,
    `Mortgage at ${_srPct}% of take-home — above the 35% comfort threshold`,
    `Rate rise of 1% would add ${fmtD(Math.round(fin.loan * 0.01 / 12))}/mo to repayments`,
    cap < 5 ? `Below-average ${cap}% growth limits exit strategy` : `Monitor market — thin buffer means limited ability to hold through a downturn`
  ];
  _pos = [
    `${cap}% p.a. growth — ${_growthLabel} — projects ${b.suburb} to ${_proj5} by 2030`,
    `Gross yield ${fin.grossYield}% — ${_yieldLabel}`,
    _hasRefund ? `Negative gearing refund ${fmtD(fin.moTaxRefund)}/mo reduces true cost to ${fmtD(_trueOOP)}/mo` : fin.verdict === "cheaper" ? `Owning is ${fin.savePct}% cheaper than renting here` : `Equity of ${fmtD(fin.moPrincipal)}/mo builds each month`
  ];

} else if (_str && _aff && _buf) {
  _rec = "buy";
  const _totalRent5 = Math.round(fin.rentedCFAfterTax * 12 * 5);
  const _capGain5 = price2030 - price;
  const _entryCost = fin.stamp + fin.legal;
  const _totalProfit5 = _totalRent5 + _capGain5 - _entryCost;
  if (_isCashPurchase) {
    _nar = `${b.suburb} is a strong buy — purchased with cash (no mortgage), fully positively geared from day one. Net rental of ${fmtD(fin.rentedCF)}/mo (${fin.grossYield}% yield) requires no income top-up. At ${cap}% growth (${_growthLabel}), projected price is ${_proj5} by 2030 — a ${_gain5} capital gain. 5-year total estimated profit: capital gain ${fmtD(_capGain5)} + net rental income ${fmtD(_totalRent5)} − entry costs ${fmtD(_entryCost)} = ${fmtD(_totalProfit5)}. Cash retained in reserve: ${fmtD(fin.cashAfter)}.`;
    _pos = [
      `✓ Cash purchase — no mortgage, no interest, fully positively geared`,
      `${cap}% growth (${_growthLabel}) → ${_proj5} by 2030 (${_gain5} capital gain)`,
      `Net rental ${fmtD(fin.rentedCF)}/mo — all income, no debt to service`,
      `5-yr total profit est. ${fmtD(_totalProfit5)} (rent + growth − costs)`,
      `${fmtD(fin.cashAfter)} cash reserve retained after purchase`,
    ];
    _rsk = [
      `No leverage — growth works on ${fmtD(price)} only (opportunity cost vs borrowing more)`,
      `Entry costs: stamp duty ${fmtD(fin.stamp)} + legal ${fmtD(fin.legal)} = ${fmtD(_entryCost)} sunk`,
      `Vacancy: ${fin.vacRisk} (${fin.vacRate}%) — avg ${fin.vacDays} days to lease`,
      `Market cycles — hold 5+ years to fully realise capital gain`,
    ];
  } else {
    _nar = `${b.suburb} is a strong buy for ${_couple ? "this household" : "your income profile"}. At ${_srPct}% of ${_takeHome}/mo take-home, the ${fmtD(fin.mo)}/mo mortgage is ${_stressLabel}. ${cap}% growth (${_growthLabel}) projects ${_proj5} by 2030, a ${_gain5} gain. ${f.goal === "investment" ? `As an investment, the ${fmtD(Math.abs(fin.rentedCF))}/mo pre-tax top-up${_hasRefund ? ` becomes ${fmtD(_trueOOP)}/mo after the ${fmtD(fin.moTaxRefund)}/mo tax refund` : " is the cost of holding this asset"}. ` : fin.verdict === "cheaper" ? `Owner-occupying is ${fin.savePct}% cheaper than renting. ` : `Equity of ${fmtD(fin.moPrincipal)}/mo builds monthly. `}${fmtD(fin.cashAfter)} cash buffer (${_bufMosStr} cover) post-purchase.`;
    _pos = [
      `${cap}% p.a. growth (${_growthLabel}) — projected ${_proj5} by 2030`,
      `${_stressLabel} at ${_srPct}% of take-home — ${fmtD(fin.netOwner)}/mo left for living`,
      _hasRefund ? `Tax refund ${fmtD(fin.moTaxRefund)}/mo → true cost ${fmtD(_trueOOP)}/mo` : `Yield ${fin.grossYield}% — ${_yieldLabel}`,
      `${fmtD(fin.cashAfter)} buffer (${_bufMosStr} cover) post-purchase`,
      `Equity of ${fmtD(fin.moPrincipal)}/mo builds via principal repayments`,
    ];
    _rsk = [
      `${_hasRefund ? `Top-up ${fmtD(_trueOOP)}/mo after refund — needs sustained income` : isPositive ? "Monitor vacancy — positive gearing relies on rental income" : `Top-up ${fmtD(Math.abs(fin.rentedCF))}/mo requires sustained employment`}`,
      `Rate sensitivity: +${_rateRiseSensitivity} per 0.5% rise`,
      `Vacancy: ${fin.vacRisk} (${fin.vacRate}%) — avg ${fin.vacDays} days to lease`,
      `Stamp duty ${fmtD(fin.stamp)} + legal ${fmtD(fin.legal)} sunk on entry`,
    ];
  }

} else {
  // Standard buy — mortgage affordable, reasonable buffer, moderate-good growth
  const _cfSentence = f.goal === "investment"
    ? (_hasRefund
        ? `As a rental, the pre-tax top-up of ${fmtD(Math.abs(fin.rentedCF))}/mo reduces to ${fmtD(_trueOOP)}/mo after the ${fmtD(fin.moTaxRefund)}/mo negative gearing refund at your ${fin.marginalRate}% marginal rate.`
        : isPositive
        ? `As a rental, the property generates a surplus of ${fmtD(fin.rentedCF)}/mo — positively geared.`
        : `As a rental, the ${fmtD(Math.abs(fin.rentedCF))}/mo top-up is the cost of holding this asset.`)
    : fin.verdict === "cheaper"
    ? `Owner-occupying is ${fin.savePct}% cheaper than renting comparable property in ${b.suburb}.`
    : `The mortgage costs ${fmtD(Math.abs(fin.moSave))}/mo more than renting, offset by ${fmtD(fin.moPrincipal)}/mo in equity built.`;
  const _totalRent5b = Math.round(fin.rentedCFAfterTax * 12 * 5);
  const _capGain5b = price2030 - price;
  const _entryCostb = fin.stamp + fin.legal;
  if (_isCashPurchase) {
    _nar = `${b.suburb} is a solid buy with cash — no mortgage required, fully positively geared. Net rental of ${fmtD(fin.rentedCF)}/mo (${fin.grossYield}% yield) generates pure cashflow. At ${cap}% growth (${_growthLabel}), projected to reach ${_proj5} by 2030 — a ${_gain5} capital gain. 5-year estimated total: capital gain ${fmtD(_capGain5b)} + net rent ${fmtD(_totalRent5b)} − entry costs ${fmtD(_entryCostb)} = ${fmtD(_totalRent5b + _capGain5b - _entryCostb)} profit. Cash reserve retained: ${fmtD(fin.cashAfter)}.`;
  } else {
    _nar = `${b.suburb} stacks up well for ${_couple ? "this household" : "your income"}. The ${fmtD(fin.mo)}/mo mortgage takes ${_srPct}% of ${_takeHome}/mo take-home — ${_stressLabel} — leaving ${fmtD(fin.netOwner)}/mo after housing costs. ${cap}% annual growth (${_growthLabel}) projects to ${_proj5} by 2030, a ${_gain5} increase. ${_cfSentence} After ${fmtD(fin.upfront)} upfront costs, ${fmtD(fin.cashAfter)} remains in reserve — ${_bufMosStr} cover.`;
  }
  _rec = "buy";
  if (_isCashPurchase) {
    _pos = [
      `✓ Cash purchase — no debt, fully positively geared`,
      `${cap}% p.a. growth (${_growthLabel}) → ${_proj5} by 2030`,
      `Net rental ${fmtD(fin.rentedCF)}/mo — pure cashflow`,
      `5-yr profit est. ${fmtD(_totalRent5b + _capGain5b - _entryCostb)} (rent + growth − costs)`,
    ];
    _rsk = [
      `Entry costs: stamp ${fmtD(fin.stamp)} + legal ${fmtD(fin.legal)} = ${fmtD(_entryCostb)} sunk`,
      `Vacancy: ${fin.vacRisk} (${fin.vacRate}%) — avg ${fin.vacDays} days to lease`,
      `No leverage — returns limited to single property`,
      cap < 5 ? `${cap}% growth below average — monitor market` : `Market cycles — hold 5+ years`,
    ];
  } else {
    _pos = [
      `${cap}% p.a. growth (${_growthLabel}) — ${_proj5} projected by 2030`,
      `${_srPct}% of take-home (${_stressLabel}) — ${fmtD(fin.netOwner)}/mo remaining`,
      _hasRefund
        ? `Neg. gearing refund ${fmtD(fin.moTaxRefund)}/mo → ${fmtD(_trueOOP)}/mo true cost`
        : `Yield ${fin.grossYield}% — ${_yieldLabel} for this price bracket`,
      `${_bufMosStr} buffer (${fmtD(fin.cashAfter)}) post-purchase`
    ];
    _rsk = [
      `Rate sensitivity: +${_rateRiseSensitivity} per 0.5% rate rise`,
      f.goal === "investment" && !isPositive
        ? `Rental top-up ${_hasRefund ? fmtD(_trueOOP) : fmtD(Math.abs(fin.rentedCF))}/mo requires stable employment`
        : `Short-term market cycles — needs 5+ year hold to absorb entry costs`,
      `Stamp duty ${fmtD(fin.stamp)} + legal ${fmtD(fin.legal)} = ${fmtD(fin.stamp + fin.legal)} sunk on entry`,
      `Vacancy: ${fin.vacRisk} (${fin.vacRate}%) — avg ${fin.vacDays} days to lease`,
    ];
  }
}
const _rfinal = _rsk.slice(0, 4);
const _pfinal = _pos.slice(0, 5);

const report = {
  reportTitle: `Full Property Investment Report — ${b.suburb}, ${st} 2026`,
  generatedDate: "March 2026",
  executiveSummary: `${b.suburb} is a ${cap >= 7 ? "high-growth" : cap >= 5 ? "solid-growth" : "steady"} suburb in ${st} with a current median price of ${fmtD(price)} and weekly rents of $${rent}. Over the past decade, the suburb has delivered an average capital growth of ${cap}% p.a. and rental growth of ${rentG}% p.a., ${accel === "accelerating" ? "with momentum building in recent years" : accel === "slowing" ? "though growth has moderated recently" : "with growth tracking steadily"}. The gross rental yield of ${fin.grossYield}% ${parseFloat(fin.grossYield) >= 5 ? "is attractive for investors" : "is typical for this property type and location"}. For ${fin.isCouple ? "a couple with combined gross income of " + fmtD(fin.grossSalary) + " (" + fmtD(fin.grossSalary1) + " + " + fmtD(fin.grossSalary2) + ")" : "a buyer with a " + fmtD(fin.grossSalary1) + " salary"}, the monthly mortgage commitment of ${fmtD(fin.mo)} represents ${Math.round(fin.mo / fin.atMonthly * 100)}% of combined after-tax income of ${fmtD(fin.atMonthly)}/mo.`,
  priceHistory,
  rentalHistory,
  trendAnalysis: {
    priceAcceleration: accel,
    priceNarrative: `${b.suburb} has delivered an average capital growth of ${cap}% p.a. over the past decade. The strongest years were ${best3.slice(0,2).join(" and ")}, driven by low interest rates and strong demand. ${accel === "accelerating" ? "Recent years are tracking above the decade average, suggesting renewed momentum." : accel === "slowing" ? "Recent growth has moderated as higher interest rates reduce buyer capacity." : "Growth has been consistent and broadly in line with the decade average."}`,
    rentalAcceleration: rentG >= 5 ? "accelerating" : rentG <= 2.5 ? "slowing" : "stable",
    rentalNarrative: `Rental growth has averaged ${rentG}% p.a. over the decade. The post-COVID period (2022–2023) saw particularly strong rental growth as demand surged. ${rentG >= 5 ? "Rents continue to rise strongly, reflecting tight vacancy rates across this suburb." : "Rental growth has moderated more recently as supply catches up with demand."}`,
    best3Years: best3,
    slowest3Years: slow3,
    recentMomentum: `The most recent 2 years are showing ${recentAvg > decadeAvg ? "above" : "below"}-average growth of approximately ${recentAvg.toFixed(1)}% versus the decade average of ${decadeAvg.toFixed(1)}%. ${accel === "accelerating" ? "This suggests the suburb is entering a stronger growth phase, potentially driven by infrastructure investment and demographic shifts." : accel === "slowing" ? "The slowdown reflects broader market conditions including higher interest rates and affordability constraints." : "Growth remains consistent with long-term trends, making this a reliable if unspectacular performer."}`
  },
  ownerOccupied: {
    totalMonthlyHousingCost: fin.ownerTotal,
    equivalentMarketRent: fin.mktRentMo,
    monthlySavingVsRenting: fin.moSave,
    annualSavingVsRenting: fin.moSave * 12,
    savingPct: fin.savePct,
    verdict: fin.verdict,
    netOwner: fin.netOwner,
    atMonthly: fin.atMonthly,
    isCouple: fin.isCouple,
    breakdownNarrative: `Owning in ${b.suburb} costs ${fmtD(fin.ownerTotal)}/mo in mortgage and running costs, compared to the market rent of ${fmtD(fin.mktRentMo)}/mo. Owning is ${fin.savePct}% ${fin.verdict === "cheaper" ? "cheaper" : "more expensive"} than renting on a pure cashflow basis. However, owners are simultaneously building ${fmtD(fin.moPrincipal)}/mo in equity through principal repayments, plus benefiting from estimated capital appreciation of ${fmtD(Math.round(price*cap/100/12))}/mo. When wealth creation is included, ownership ${fin.verdict === "cheaper" ? "delivers clear financial advantage" : "delivers long-term wealth despite the higher monthly cost"}.`,
    annualCosts: {
      mortgage: fin.mo * 12,
      maintenance: Math.round(price * 0.004),
      councilRates: Math.round(price * 0.002),
      insurance: 1800,
      total: fin.ownerTotal * 12,
      equivalentAnnualRent: rent * 52,
    }
  },
  investmentScenario: {
    grossYield: fin.grossYield,
    netYield: netYield < 0 ? netYield.toFixed(2) : "+" + netYield.toFixed(2),
    monthlyNetCashflow: fin.rentedCF,
    monthlyNetCashflowAfterTax: fin.rentedCFAfterTax,
    moRentGross: fin.moRentGross,
    moVacancy: fin.moVacancy,
    moMgmt: fin.moMgmt,
    moMaint: fin.moMaint,
    moRates: fin.moRates,
    moInsure: fin.moInsure,
    moLandTax: fin.moLandTax,
    netRentMo: fin.netRentMo,
    moTaxRefundDisplay: fin.moTaxRefund,
    moExtraTaxDisplay: fin.moExtraTax,
    rentedOOPAfterTax: fin.rentedOOPAfterTax,
    ownerBetter: fin.ownerBetter,
    ownerNetVsRent: fin.ownerNetVsRent,
    rentedNetCost: fin.rentedNetCost,
    moPrincipal: fin.moPrincipal,
    atMonthly: fin.atMonthly,
    ownerTotal: fin.ownerTotal,
    mktRentMo: fin.mktRentMo,
    savePct: fin.savePct,
    verdictStr: fin.verdict,
    annualCashflow: fin.rentedCF * 12,
    annualCashflowAfterTax: fin.rentedCFAfterTax * 12,
    cashflowVerdict: isPositive ? "positive" : "negative",
    taxRefundMonthly: fin.moTaxRefund,
    taxRefundAnnual: fin.annTaxRefund,
    extraTaxMonthly: fin.moExtraTax,
    extraTaxAnnual: fin.annExtraTax,
    marginalRate: fin.marginalRate,
    depreciation: fin.annDepreciation,
    totalDeductible: fin.totalDeductible,
    rentalLoss: fin.rentalLoss,
    investmentNarrative: `As an investment, ${b.suburb} ${isPositive ? "is positively geared, generating a surplus of " + fmtD(fin.rentedCF) + "/mo before tax" : "requires a top-up of " + fmtD(Math.abs(fin.rentedCF)) + "/mo before tax benefit"}. ${fin.moTaxRefund > 0 ? "After the negative gearing tax refund of " + fmtD(fin.moTaxRefund) + "/mo (at " + fin.marginalRate + "% marginal rate including " + fmtD(fin.annDepreciation) + "/yr depreciation), the true after-tax cost is " + fmtD(fin.rentedOOPAfterTax) + "/mo." : fin.moExtraTax > 0 ? "As a positively geared property, additional tax of " + fmtD(fin.moExtraTax) + "/mo is payable on rental profit." : ""} The gross yield of ${fin.grossYield}% ${parseFloat(fin.grossYield) >= 5 ? "is strong" : "is below positive gearing threshold at current rates"}. When capital appreciation of ${fmtD(capitalGain)}/yr is included, the total return is ${fmtD(netIncome + capitalGain)}/yr. ${isPositive ? "This property pays for itself and grows in value." : "The after-tax cost of holding this high-growth asset is " + fmtD(fin.rentedOOPAfterTax) + "/mo."}`,
    vacRate: fin.vacRate,
    vacDays: fin.vacDays,
    vacRisk: fin.vacRisk,
    vacRiskColor: fin.vacRiskColor,
    weeksVacant: fin.weeksVacant,
    weeklyRent: rent,
    annualVacancyCost: Math.round(rent * fin.weeksVacant),
    worstCaseMonth: Math.round(fin.mo + rent * 4),
    vacancyNarrative: `${b.suburb} has an estimated vacancy rate of ${fin.vacRate}% — classified as ${fin.vacRisk} risk. Properties here take approximately ${fin.vacDays} days to lease on average, meaning ${fin.weeksVacant} weeks of vacancy per year at an annual cost of ${fmtD(Math.round(rent * fin.weeksVacant))}. ${fin.vacRate < 1.5 ? `This is a tight rental market — tenant demand is strong and re-leasing should be swift. The risk of extended vacancy is low.` : fin.vacRate < 2.5 ? `This is a healthy rental market with moderate competition. Budget for 2–3 weeks vacancy between tenancies.` : fin.vacRate < 3.5 ? `Vacancy is above average — budget for 4+ weeks between tenancies and ensure your rent is competitively priced.` : `High vacancy rate indicates oversupply or weak rental demand in this suburb. Extended vacancies are a real risk — conservative investors should target suburbs under 2% vacancy.`} In a worst-case month with 4 weeks vacancy, your total cash outflow would be ${fmtD(Math.round(fin.mo + rent * 4))} (mortgage + lost rent).`,
    annualPL: {
      rentalIncome: rent * 52,
      vacancyLoss: Math.round(rent * fin.weeksVacant),
      managementFee: Math.round(rent * 52 * 0.08),
      maintenance: Math.round(price * 0.005),
      councilRates: Math.round(price * 0.002),
      insurance: 1800,
      landTax: fin.annLandTax,
      interestCost: fin.moInterest * 12,
      depreciation: fin.annDepreciation,
      totalExpenses,
      netIncome,
      taxRefund: fin.annTaxRefund,
      extraTax: fin.annExtraTax,
      netIncomeAfterTax: netIncome + fin.annTaxRefund - fin.annExtraTax,
      capitalGain,
      totalReturn: netIncome + fin.annTaxRefund - fin.annExtraTax + capitalGain,
    }
  },
  fiveYearProjection: {
    projectedPrice2030: price2030,
    projectedWeeklyRent2030: rent2030,
    projectedEquity2030: equity2030,
    narrative: `At ${cap}% p.a. growth, ${b.suburb} is projected to reach ${fmtD(price2030)} by 2030 — an increase of ${fmtD(price2030 - price)} from today. Weekly rents are projected to reach $${rent2030}/wk, improving the yield to ${((rent2030 * 52 / price2030) * 100).toFixed(2)}%. After 5 years of P&I repayments at ${fin.annRate}%, equity from repayments alone is estimated at ${fmtD(equity2030)}, with total equity (deposit + repayments + capital growth) estimated at ${fmtD(fin.deposit + equity2030 + (price2030 - price))}.`
  },
  recommendation: _rec,
  recommendationNarrative: _nar,
  riskFactors: _rfinal,
  positiveFactors: _pfinal,
  listingsForSale,
  recentSales,
};


setReportData(report);
setReportPaid(true);
setReportStep("paid");
} catch(err) {
  setReportError("Error: " + err.message);
  setReportStep("error");
}
}, 50);
```

}

const fin = result?.best?.fin;
const sel = { …iSt, cursor: “pointer” };

return (
<div style={{ fontFamily: sans, background: C.cream, minHeight: “100vh”, padding: “1rem 0.75rem”, overflowX: “hidden”, width: “100%” }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} input:focus,select:focus{border-color:${C.orange}!important;box-shadow:0 0 0 3px rgba(232,133,10,0.15)!important;outline:none;} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} .fade{animation:fadeIn 0.35s ease both} @media(max-width:860px){ .grid2{grid-template-columns:1fr!important} .col3{grid-template-columns:1fr 1fr!important} .col3m{grid-template-columns:1fr!important} } @media(max-width:500px){ .col2{grid-template-columns:1fr!important} .col3{grid-template-columns:1fr!important} } @media print{ body{background:#fff!important;margin:0;padding:0;} .no-print{display:none!important;} #suburb-print-container{display:block!important;position:static!important;font-family:system-ui,sans-serif;color:#2d2417;} #suburb-print-container div{box-shadow:none!important;} button{display:none!important;} -webkit-print-color-adjust:exact; print-color-adjust:exact; } input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${C.orange};cursor:pointer;} table{width:100%;table-layout:fixed;} td,th{word-break:break-word;}`}</style>

```
  <div className="grid2" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: result ? "minmax(0,400px) minmax(0,1fr)" : "minmax(0,420px)", justifyContent: "center", gap: "1.25rem", alignItems: "start", width: "100%" }}>

    {/* ── INPUT PANEL ── */}
    <div style={{ background: C.warm, borderRadius: 16, padding: "1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", width: "100%", minWidth: 0 }}>
      <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
        <h1 style={{ fontFamily: serif, fontSize: "1.35rem", fontWeight: 700, color: C.dark, marginBottom: "0.25rem" }}>Suburb Match Finder</h1>
        <p style={{ fontSize: "0.77rem", color: C.mid, lineHeight: 1.5, marginBottom: "0.9rem" }}>Smart suburb recommendations based on your budget, goals, and financial profile.</p>
        <button onClick={find} style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})`, color: "#fff", border: "none", borderRadius: 25, padding: "10px 28px", fontFamily: sans, fontSize: "0.86rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(232,133,10,0.35)" }}>
          Get My Matches
        </button>
      </div>

      <Row label="Annual Salary (gross)">
        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1 }}>
          <input value={f.salary} onChange={e => set("salary")(e.target.value)} style={{ ...iSt, flex: 1 }} placeholder="120000" />
          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", whiteSpace: "nowrap", fontSize: "0.74rem", color: C.mid }} onClick={() => set("hecs")(!f.hecs)}>
            <div style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${f.hecs ? C.orange : "#ccc"}`, background: f.hecs ? C.orange : "#fff", flexShrink: 0 }} />
            HECS
          </label>
        </div>
      </Row>
      <Row label="Partner Income (optional)">
        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1 }}>
          <input value={f.salary2} onChange={e => set("salary2")(e.target.value)} style={{ ...iSt, flex: 1 }} placeholder="0 if single" />
          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", whiteSpace: "nowrap", fontSize: "0.74rem", color: C.mid }} onClick={() => set("hecs2")(!f.hecs2)}>
            <div style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${f.hecs2 ? C.orange : "#ccc"}`, background: f.hecs2 ? C.orange : "#fff", flexShrink: 0 }} />
            HECS
          </label>
        </div>
      </Row>
      <Row label="Cash on Hand"><input value={f.cash} onChange={e => set("cash")(e.target.value)} style={iSt} placeholder="80000" /></Row>
      <Row label="Budget"><input value={f.budget} onChange={e => set("budget")(e.target.value)} style={iSt} placeholder="700000" /></Row>
      <Row label="State"><Sel value={f.state} onChange={set("state")} options={[["VIC","VIC"],["NSW","NSW"],["QLD","QLD"],["WA","WA"],["SA","SA"]]} /></Row>
      <Row label="Buying Goal"><Sel value={f.goal} onChange={set("goal")} options={[["investment","Investment"],["owner-occupier","Owner Occupier"],["both","Both"]]} /></Row>
      <Row label="Property Type"><Sel value={f.propType} onChange={set("propType")} options={[["house","House"],["unit","Unit / Apartment"],["townhouse","Townhouse"]]} /></Row>
      <Row label="Risk Profile"><Sel value={f.risk} onChange={set("risk")} options={[["conservative","Conservative"],["balanced","Balanced"],["aggressive","Aggressive"]]} /></Row>
      <Row label="Schools"><Sel value={f.schools} onChange={set("schools")} options={[["high","High Importance"],["medium","Medium"],["low","Low"]]} /></Row>
      <Row label="Mortgage Term"><Sel value={f.term} onChange={set("term")} options={[["20","20 years"],["25","25 years"],["30","30 years"]]} /></Row>
      <Row label="Interest Rate">
        <div style={{ position: "relative", flex: 1 }}>
          <input value={f.rate} onChange={e => set("rate")(e.target.value)} style={{ ...iSt, paddingRight: 24 }} placeholder="6.20" type="number" step="0.05" />
          <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: "0.78rem", color: C.mid, pointerEvents: "none" }}>%</span>
        </div>
      </Row>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0e8dc" }}>
        <span style={lSt}>Will property be tenanted?</span>
        {["Yes", "No"].map(opt => (
          <label key={opt} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: "0.78rem", color: C.mid }} onClick={() => set("tenanted")(opt === "Yes")}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${(opt === "Yes") === f.tenanted ? C.orange : "#ccc"}`, background: (opt === "Yes") === f.tenanted ? C.orange : "#fff", flexShrink: 0 }} />
            {opt}
          </label>
        ))}
      </div>
    </div>

    {/* ── INPUT DISCLAIMER ── */}
    <div style={{ background: "#f9f5ef", border: "1px solid #e8d8c0", borderRadius: 12, padding: "0.85rem 1rem", width: "100%", minWidth: 0 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{ fontSize: "1rem", flexShrink: 0, marginTop: 1 }}>⚠️</div>
        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#5a3e1b", marginBottom: 3 }}>IMPORTANT — PLEASE READ BEFORE PROCEEDING</div>
          <div style={{ fontSize: "0.65rem", color: "#6b5a3e", lineHeight: 1.65 }}>
            All figures generated by this tool are <strong>indicative estimates only</strong> and are not a substitute for professional financial, legal, or property advice. Suburb median prices, capital growth rates, rental yields, vacancy rates, and days-on-market figures are based on training data (accurate to approximately August 2025) and modelled estimates — they <strong>do not reflect live market conditions</strong>.<br/><br/>
            <strong>Before making any property purchase decision, you should:</strong><br/>
            • Obtain a formal <strong>bank or lender pre-approval</strong> to confirm your borrowing capacity<br/>
            • Commission an independent <strong>property valuation</strong> from a licensed valuer<br/>
            • Consult a <strong>mortgage broker</strong> to compare loan products and verify serviceability<br/>
            • Seek advice from a <strong>qualified financial adviser</strong> and/or <strong>buyer's agent</strong><br/>
            • Verify all suburb data against current sources (Domain, REA, CoreLogic, SQM Research)<br/><br/>
            This tool does not constitute financial advice. Suburb Match Finder and its operators accept no liability for decisions made based on the estimates provided.
          </div>
        </div>
      </div>
    </div>

    {/* ── CHECKPOINT PANEL ── */}
    {checks && (
      <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 0, width: "100%" }}>

        {/* Checkpoint 1: Smart Deposit */}
        <div style={{ background: checks.depositOK ? "#f0faf4" : "#fff5f5", border: `2px solid ${checks.depositOK ? "#c8e6c9" : "#ffcdd2"}`, borderRadius: 16, padding: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: "0.65rem" }}>
            <div style={{ fontSize: "1.3rem" }}>{checks.depositOK ? "✅" : "❌"}</div>
            <div style={{ fontFamily: serif, fontSize: "0.95rem", fontWeight: 700, color: checks.depositOK ? C.grn : C.red }}>
              Checkpoint 1 — Cash & Deposit
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0", marginBottom: "0.65rem" }}>
            {[
              ["Purchase Budget", fmtD(checks.budget)],
              ["Cash on Hand", fmtD(checks.cash)],
              ["Stamp Duty (~4%)", fmtD(checks.stamp)],
              ["Legal / Inspect", fmtD(checks.legal)],
              ["Recommended Deposit", `${fmtD(checks.smartDeposit)} (${checks.smartDepositPct}%)`],
              ["Loan Required", checks.isCashPurchase ? "None — cash purchase" : fmtD(checks.smartLoan)],
              ["1-yr Buffer Reserve", fmtD(checks.bufferReserve)],
              ["Cash After Purchase", fmtD(checks.cashRemaining)],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", padding: "5px 0", borderBottom: `1px solid ${C.oBorder}` }}>
                <span style={{ color: C.mid }}>{label}</span>
                <span style={{ fontWeight: 700, color: label === "Loan Required" && checks.isCashPurchase ? C.grn : label === "1-yr Buffer Reserve" ? C.orange : C.dark, flexShrink: 0, marginLeft: 8 }}>{val}</span>
              </div>
            ))}
          </div>
          {checks.depositOK ? (
            <div style={{ background: "#e8f5e9", borderRadius: 8, padding: "8px 10px", fontSize: "0.72rem", color: C.grn, lineHeight: 1.6 }}>
              {checks.isCashPurchase
                ? `✓ Cash purchase — no mortgage required. Your ${fmtD(checks.cash)} covers the full ${fmtD(checks.budget)} plus costs, with ${fmtD(checks.cashRemaining)} remaining.`
                : `✓ Using ${fmtD(checks.smartDeposit)} (${checks.smartDepositPct}%) as deposit — maximises your cash while keeping a ${fmtD(checks.bufferReserve)} buffer (12 months mortgage cover). Remaining loan: ${fmtD(checks.smartLoan)}.`}
            </div>
          ) : (
            <div style={{ background: "#ffebee", borderRadius: 8, padding: "8px 10px", fontSize: "0.72rem", color: C.red, lineHeight: 1.6 }}>
              ✗ <strong>Insufficient cash.</strong> You need at least {fmtD(checks.upfront)} (20% deposit + costs) but have {fmtD(checks.cash)}.<br/>
              👉 Consider a property under <strong>{fmtD(checks.maxFromCash)}</strong>, or save an additional {fmtD(Math.abs(checks.cashAfter))}.
            </div>
          )}
        </div>

        {/* Checkpoint 2: Mortgage serviceability */}
        <div style={{ background: checks.mortgageOK ? (checks.stressed ? "#fff8e1" : "#f0faf4") : "#fff5f5", border: `2px solid ${checks.mortgageOK ? (checks.stressed ? "#ffe082" : "#c8e6c9") : "#ffcdd2"}`, borderRadius: 16, padding: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: "0.65rem" }}>
            <div style={{ fontSize: "1.3rem" }}>{checks.mortgageOK ? (checks.stressed ? "⚠️" : "✅") : "❌"}</div>
            <div style={{ fontFamily: serif, fontSize: "0.95rem", fontWeight: 700, color: checks.mortgageOK ? (checks.stressed ? "#6d4c00" : C.grn) : C.red }}>
              {checks.isCashPurchase ? "Checkpoint 2 — Cash Purchase ✓" : "Checkpoint 2 — Mortgage Serviceability"}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0", marginBottom: "0.65rem" }}>
            {(checks.isCashPurchase ? [
              ["Purchase Method", "Full Cash — No Mortgage", C.grn],
              ["Cash on Hand", fmtD(checks.cash), null],
              ["Total Cost (incl. stamp + legal)", fmtD(checks.budget + checks.stamp + checks.legal), null],
              ["Remaining After Purchase", fmtD(checks.cashRemaining), C.grn],
            ] : [
              ["Loan Amount", fmtD(checks.smartLoan) + ` (${100 - checks.smartDepositPct}% LVR)`, null],
              ["Interest Rate", parseFloat((checks.rate * 100).toFixed(2)) + "%", null],
              ["Monthly Repayment", fmtD(checks.mo) + "/mo", null],
              [checks.isCouple ? "Combined Take-Home" : "Take-Home / Month", fmtD(checks.atMonthly) + "/mo", null],
              ["Mortgage as % of Income", Math.round(checks.dsr * 100) + "%", checks.dsr < 0.35 ? C.grn : checks.dsr < 0.60 ? C.orange : C.red],
              ["Safe Threshold", "< 35%", null],
              ["12-month Buffer Reserved", fmtD(checks.bufferReserve), C.orange],
            ]).map(([label, val, col]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", padding: "5px 0", borderBottom: `1px solid ${C.oBorder}` }}>
                <span style={{ color: C.mid }}>{label}</span>
                <span style={{ fontWeight: 700, color: col || C.dark, flexShrink: 0, marginLeft: 8 }}>{val}</span>
              </div>
            ))}
          </div>
          {!checks.mortgageOK ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              <div style={{ background: "#ffebee", borderRadius: 8, padding: "8px 10px", fontSize: "0.72rem", color: C.red, lineHeight: 1.6 }}>
                ✗ <strong>Mortgage unserviceable at 80% LVR.</strong> Repayments of {fmtD(checks.mo)}/mo would consume {Math.round(checks.dsr * 100)}% of your {fmtD(checks.atMonthly)}/mo take-home — far above the 35% safe threshold.
              </div>

              <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8, padding: "8px 10px", fontSize: "0.72rem", color: "#6d4c00", lineHeight: 1.6, marginTop: 4 }}>
                💡 Even using all available cash as deposit (keeping a 12-month buffer), monthly repayments of {fmtD(checks.mo)}/mo represent {Math.round(checks.dsr * 100)}% of your {fmtD(checks.atMonthly)}/mo take-home. This is above the 35% threshold.<br/><br/>
                👉 To get repayments to 35%, target a property under <strong>{fmtD(checks.maxAffordable)}</strong> — or increase your income.
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => { setF(p => ({ ...p, budget: String(checks.maxAffordable) })); setTimeout(() => find(), 100); }} style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})`, color: "#fff", border: "none", borderRadius: 20, padding: "7px 16px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                    Search Under {fmtD(checks.maxAffordable)}
                  </button>
                </div>
              </div>
            </div>
          ) : checks.stressed ? (
            <div style={{ background: "#fff8e1", borderRadius: 8, padding: "8px 10px", fontSize: "0.72rem", color: "#6d4c00", lineHeight: 1.6 }}>
              ⚠️ <strong>Mortgage is serviceable but stretched.</strong> At {Math.round(checks.dsr * 100)}% of take-home, you are above the 35% comfort threshold. A 1% rate rise would add {fmtD(Math.round(checks.budget * 0.8 * 0.01 / 12))}/mo. Ensure you have strong job security before proceeding.<br/>
              👉 Ideally target under <strong>{fmtD(checks.maxAffordable)}</strong> for a comfortable 35% mortgage ratio.
            </div>
          ) : (
            <div style={{ background: "#e8f5e9", borderRadius: 8, padding: "8px 10px", fontSize: "0.72rem", color: C.grn, fontWeight: 500 }}>
              ✓ Mortgage is comfortably serviceable at {Math.round(checks.dsr * 100)}% of take-home — well within the 35% safe threshold.
            </div>
          )}
        </div>

        {/* Overall result */}
        {checks.allOK ? (
          <div style={{ background: "linear-gradient(135deg,#e8f5e9,#f0faf4)", border: "2px solid #c8e6c9", borderRadius: 16, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>✅</div>
            <div style={{ fontFamily: serif, fontSize: "1rem", fontWeight: 700, color: C.grn, marginBottom: 3 }}>Both checks passed — showing your suburb matches below</div>
            <div style={{ fontSize: "0.72rem", color: C.mid }}>{checks.isCashPurchase ? `Cash purchase — no mortgage needed. Searching within ±10% of ${fmtD(checks.budget)}.` : `Using ${checks.smartDepositPct}% deposit, loan ${fmtD(checks.smartLoan)}, repayments ${fmtD(checks.mo)}/mo. Searching within ±10% of ${fmtD(checks.budget)}.`}</div>
          </div>
        ) : (
          <div style={{ background: "#fff5f5", border: "2px solid #ffcdd2", borderRadius: 16, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>🚫</div>
            <div style={{ fontFamily: serif, fontSize: "1rem", fontWeight: 700, color: C.red, marginBottom: 6 }}>Cannot proceed — please review the issues above</div>
            <div style={{ fontSize: "0.73rem", color: C.mid, lineHeight: 1.6, marginBottom: "0.75rem" }}>
              {!checks.depositOK && !checks.mortgageOK
                ? `Both your deposit and income need attention before purchasing at this budget.`
                : !checks.depositOK
                ? `You need ${fmtD(Math.abs(checks.cashAfter))} more in cash savings before this purchase is possible.`
                : `Your income needs to support a lower purchase price. Consider under ${fmtD(checks.maxAffordable)}.`}
            </div>
            <button onClick={() => { setChecks(null); setResult(null); }} style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})`, color: "#fff", border: "none", borderRadius: 25, padding: "9px 22px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
              Adjust My Inputs
            </button>
          </div>
        )}
      </div>
    )}

    {/* ── RESULTS PANEL ── */}
    {result && (
      <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: 0, width: "100%" }}>

        {/* warnings */}
        {fin.isNegCash && (
          <div style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 14, padding: "0.9rem 1.1rem", display: "flex", gap: "0.65rem" }}>
            <div style={{ fontSize: "1.2rem", flexShrink: 0 }}>⚠️</div>
            <div style={{ fontSize: "0.77rem", color: "#6d0000", lineHeight: 1.6 }}><strong>Insufficient Cash:</strong> You need {fmtD(fin.upfront)} upfront but have {fmtD(parseInt(f.cash))}. Shortfall: {fmtD(Math.abs(fin.cashAfter))}.</div>
          </div>
        )}
        {fin.isMortStress && !fin.isNegCash && (
          <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 14, padding: "0.9rem 1.1rem", display: "flex", gap: "0.65rem" }}>
            <div style={{ fontSize: "1.2rem", flexShrink: 0 }}>⚡</div>
            <div style={{ fontSize: "0.77rem", color: "#6d4c00", lineHeight: 1.6 }}><strong>Mortgage Stress:</strong> Repayments exceed 35% of after-tax income (take-home: {fmtD(fin.atMonthly)}/mo).</div>
          </div>
        )}

        {/* main card */}
        <div style={{ background: C.warm, borderRadius: 16, padding: "1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <div style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 700, color: C.dark }}>{result.best.suburb}</div>
              <div style={{ fontSize: "0.76rem", color: C.mid }}>{f.state} · {f.propType} · {result.best.type.includes(f.propType) ? "✓ Type match" : "~ Similar type available"}</div>
            </div>
            <ScoreRing sc={result.best.score} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            {result.best.hl.map((h, i) => <span key={i} style={{ background: C.oPale, border: `1px solid ${C.oBorder}`, borderRadius: 20, padding: "3px 10px", fontSize: "0.67rem", color: C.orange, fontWeight: 500 }}>✓ {h}</span>)}
          </div>

          {/* 3-col grid */}
          <div className="col3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.65rem", marginBottom: "0.9rem" }}>

            {/* growth */}
            <div style={{ background: C.cream, borderRadius: 12, padding: "0.85rem", border: `1px solid ${C.oBorder}` }}>
              <SH title="Growth Profile" />
              <div style={{ marginBottom: 6 }}><div style={{ fontSize: "0.63rem", color: C.mid }}>Capital Growth</div><div style={{ fontSize: "0.82rem", fontWeight: 600, color: C.orange }}>📈 {result.best.cap}% p.a.</div></div>
              <div style={{ marginBottom: 6 }}><div style={{ fontSize: "0.63rem", color: C.mid }}>Rental Growth</div><div style={{ fontSize: "0.82rem", fontWeight: 600, color: C.orange }}>📈 {result.best.rentG}% p.a.</div></div>
              <LI label="Median" value={fmtD(result.best.price)} />
              <LI label="Weekly Rent" value={"$" + result.best.rent} bold />
              <LI label="Gross Yield" value={fin.grossYield + "%"} color={C.grn} />
            </div>

            {/* financial fit */}
            <div style={{ background: C.cream, borderRadius: 12, padding: "0.85rem", border: `1px solid ${C.oBorder}` }}>
              <SH title="Financial Fit" />
              <LI label="Purchase Price" value={fmtD(fin.price)} />
              <LI label={`Deposit (${Math.round(fin.deposit/fin.price*100)}%)`} value={fmtD(fin.deposit)} />
              <LI label={fin.loan === 0 ? "Loan Amount" : `Loan Amount (${100 - Math.round(fin.deposit/fin.price*100)}% LVR)`} value={fin.loan === 0 ? "None — Cash Purchase" : fmtD(fin.loan)} color={fin.loan === 0 ? C.grn : C.dark} />
              <div style={{ background: fin.loan === 0 ? "#e8f5e9" : C.oPale, border: `1px solid ${fin.loan === 0 ? "#c8e6c9" : C.oBorder}`, borderRadius: 7, padding: "5px 7px", margin: "4px 0" }}>
                <div style={{ fontSize: "0.58rem", fontWeight: 700, color: fin.loan === 0 ? C.grn : C.orange, marginBottom: 2 }}>
                  {fin.loan === 0 ? "✓ CASH PURCHASE — NO MORTGAGE" : `REPAYMENT @ ${fin.annRate}%`}
                </div>
                {fin.loan === 0 ? (
                  <div style={{ fontSize: "0.72rem", color: C.grn }}>No monthly repayments — property owned outright.</div>
                ) : (<>
                  <LI label="Total P&I" value={fmtD(fin.mo) + "/mo"} bold color={C.orange} />
                  <LI label={`Interest (${fin.interestPct}%)`} value={fmtD(fin.moInterest) + "/mo"} color={C.red} />
                  <LI label="Principal" value={fmtD(fin.moPrincipal) + "/mo"} color={C.grn} />
                </>)}
              </div>
              <LI label="Gross Salary" value={fmtD(fin.grossSalary) + "/yr"} border />
              <LI label="After-Tax" value={fmtD(fin.atSalary) + "/yr"} bold color={C.grn} />
              <div style={{ background: C.oPale, border: `1px solid ${C.oBorder}`, borderRadius: 7, padding: "5px 7px", marginTop: 4 }}>
                <div style={{ fontSize: "0.58rem", fontWeight: 700, color: C.mid, marginBottom: 2 }}>TAX BREAKDOWN</div>
                <LI label="Income tax" value={"−" + fmtD(fin.taxCalc.incomeTax) + "/yr"} color={C.red} />
                <LI label="Medicare (2%)" value={"−" + fmtD(fin.taxCalc.medicare) + "/yr"} color={C.red} />
                {fin.taxCalc.hecs > 0 && <LI label="HECS repayment" value={"−" + fmtD(fin.taxCalc.hecs) + "/yr"} color={C.red} />}
                <LI label="Effective rate" value={fin.taxCalc.rate + "%"} bold color={C.mid} />
              </div>
            </div>

            {/* cashflow */}
            <div style={{ background: C.cream, borderRadius: 12, padding: "0.85rem", border: `1px solid ${C.oBorder}` }}>
              <SH title="Monthly Cashflow" />
              <div style={{ fontSize: "0.63rem", color: C.mid, marginBottom: 5 }}>If Rented</div>
              <div style={{ background: "#f0faf4", border: "1px solid #c8e6c9", borderRadius: 7, padding: "6px 8px", marginBottom: 6 }}>
                <LI label="Gross rent" value={"+" + fmtD(fin.moRentGross) + "/mo"} color={C.grn} />
                <LI label="Less vacancy" value={"−" + fmtD(fin.moVacancy)} color={C.red} />
                <LI label="Less mgmt" value={"−" + fmtD(fin.moMgmt)} color={C.red} />
                <LI label="Less costs" value={"−" + fmtD(fin.moMaint + fin.moRates + fin.moInsure)} color={C.red} />
                {fin.moLandTax > 0 && <LI label={`Less land tax`} value={"−" + fmtD(fin.moLandTax)} color={C.red} />}
                <LI label="Net rental income" value={fmtD(fin.netRentMo) + "/mo"} bold color={C.grn} border />
              </div>
              <CFBar label={fin.rentedCF >= 0 ? "Monthly surplus" : "Monthly top-up"} value={fin.rentedCF} pos={fin.rentedCF >= 0} />
              {fin.moTaxRefund > 0 && (
                <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 7, padding: "5px 8px", marginBottom: 4 }}>
                  <div style={{ fontSize: "0.62rem", fontWeight: 700, color: C.grn, marginBottom: 2 }}>TAX REFUND (neg. gearing)</div>
                  <LI label={`+${fin.marginalRate}% marginal rate`} value={"+" + fmtD(fin.moTaxRefund) + "/mo"} color={C.grn} />
                  <LI label="After-tax cashflow" value={fmtD(fin.rentedCFAfterTax) + "/mo"} bold color={fin.rentedCFAfterTax >= 0 ? C.grn : C.red} />
                </div>
              )}
              {fin.moExtraTax > 0 && (
                <div style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 7, padding: "5px 8px", marginBottom: 4 }}>
                  <div style={{ fontSize: "0.62rem", fontWeight: 700, color: C.red, marginBottom: 2 }}>EXTRA TAX (pos. gearing)</div>
                  <LI label={`${fin.marginalRate}% on rental profit`} value={"-" + fmtD(fin.moExtraTax) + "/mo"} color={C.red} />
                  <LI label="After-tax cashflow" value={fmtD(fin.rentedCFAfterTax) + "/mo"} bold color={C.grn} />
                </div>
              )}
              <LI label="Net cash for living" value={fmtD(fin.netLiving) + "/mo"} bold color={fin.netLiving >= 0 ? C.grn : C.red} />
              <div style={{ borderTop: `1px solid ${C.oBorder}`, marginTop: 7, paddingTop: 7 }}>
                <div style={{ fontSize: "0.63rem", color: C.mid, marginBottom: 5 }}>If Owner Occupied</div>
                <LI label="After-tax/mo" value={fmtD(fin.atMonthly) + "/mo"} color={C.grn} />
                <LI label="Total housing cost" value={"−" + fmtD(fin.ownerTotal) + "/mo"} color={C.red} />
                <LI label={fin.isCouple ? "Combined left for living" : "Left for living"} value={fmtD(fin.netOwner) + "/mo"} bold color={fin.netOwner >= 0 ? C.grn : C.red} border />
              </div>
            </div>
          </div>

          {/* out of pocket */}
          <div style={{ background: C.cream, borderRadius: 12, padding: "0.85rem", border: `1px solid ${C.oBorder}`, marginBottom: "0.9rem" }}>
            <SH title="Out of Pocket Summary" />
            <div className="col2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
              <div style={{ background: C.warm, borderRadius: 9, padding: "0.75rem", border: `1px solid ${C.oBorder}` }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: C.mid, marginBottom: 6 }}>🏘 Rented Scenario</div>
                <LI label="Upfront required" value={fmtD(fin.upfront)} bold />
                <LI label={`· Deposit (${Math.round(fin.deposit/fin.price*100)}%)`} value={fmtD(fin.deposit)} />
                <LI label="· Stamp duty" value={fmtD(fin.stamp)} />
                <LI label="· Legal/inspect" value={fmtD(fin.legal)} />
                <LI label={fin.rentedCF >= 0 ? "Monthly surplus" : "Monthly top-up"} value={fmtD(Math.abs(fin.rentedOOP)) + "/mo"} bold color={fin.rentedCF >= 0 ? C.grn : C.red} border />
                <LI label={fin.rentedCF >= 0 ? "Annual surplus" : "Annual top-up"} value={fmtD(Math.abs(fin.rentedOOP) * 12) + "/yr"} color={fin.rentedCF >= 0 ? C.grn : C.red} />
                <LI label="Net cash for living" value={fmtD(fin.netLiving) + "/mo"} bold color={fin.netLiving >= 0 ? C.grn : C.red} border />
              </div>
              <div style={{ background: C.warm, borderRadius: 9, padding: "0.75rem", border: `1px solid ${C.oBorder}` }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: C.mid, marginBottom: 6 }}>🏠 Owner Occupied</div>
                <LI label="Upfront required" value={fmtD(fin.upfront)} bold />
                <LI label={`· Deposit (${Math.round(fin.deposit/fin.price*100)}%)`} value={fmtD(fin.deposit)} />
                <LI label="· Stamp duty" value={fmtD(fin.stamp)} />
                <LI label="· Legal/inspect" value={fmtD(fin.legal)} />
                <LI label="Monthly housing cost" value={fmtD(fin.ownerTotal) + "/mo"} bold color={C.orange} border />
                <LI label="Annual housing cost" value={fmtD(fin.ownerTotal * 12) + "/yr"} color={C.mid} />
                <LI label={fin.isCouple ? "Combined left for living" : "Left for living"} value={fmtD(fin.netOwner) + "/mo"} bold color={fin.netOwner >= 0 ? C.grn : C.red} border />
              </div>
            </div>
          </div>

          {/* vacancy metrics card */}
          <div style={{ background: C.warm, borderRadius: 12, padding: "0.9rem", border: `1px solid ${C.oBorder}`, marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: C.mid, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.6rem" }}>Rental Vacancy & Leasing Risk</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "0.6rem" }}>
              {[
                ["Est. Vacancy Rate", fin.vacRate + "%", fin.vacRiskColor],
                ["Avg Days to Lease", fin.vacDays + " days", fin.vacDays <= 14 ? C.grn : fin.vacDays <= 25 ? C.orange : C.red],
                ["Risk Level", fin.vacRisk, fin.vacRiskColor],
              ].map(([label, val, col]) => (
                <div key={label} style={{ background: C.cream, borderRadius: 8, padding: "0.6rem", border: `1px solid ${C.oBorder}`, textAlign: "center" }}>
                  <div style={{ fontSize: "0.56rem", color: C.mid, fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: col }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div style={{ background: C.cream, borderRadius: 8, padding: "0.6rem", border: `1px solid ${C.oBorder}` }}>
                <div style={{ fontSize: "0.58rem", color: C.mid, fontWeight: 600, marginBottom: 2 }}>WEEKS VACANT / YEAR</div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: fin.vacDays > 30 ? C.red : C.orange }}>{fin.weeksVacant} wks</div>
                <div style={{ fontSize: "0.6rem", color: C.light }}>= {fmtD(Math.round(fin.wRent * fin.weeksVacant))} lost rent/yr</div>
              </div>
              <div style={{ background: C.cream, borderRadius: 8, padding: "0.6rem", border: `1px solid ${C.oBorder}` }}>
                <div style={{ fontSize: "0.58rem", color: C.mid, fontWeight: 600, marginBottom: 2 }}>CASHFLOW IF VACANT 4 WKS</div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: C.red }}>−{fmtD(Math.round(fin.mo + fin.wRent * 4))}</div>
                <div style={{ fontSize: "0.6rem", color: C.light }}>mortgage + lost rent that month</div>
              </div>
            </div>
            <div style={{ fontSize: "0.62rem", color: C.light, marginTop: "0.5rem", fontStyle: "italic" }}>
              ⚠️ Estimated from rental growth, lifestyle score and price bracket. Verify at SQM Research (sqmresearch.com.au) for suburb-specific data.
            </div>
          </div>

          {/* buy vs rent badge */}
          <div style={{ background: fin.verdict === "cheaper" ? "#e8f5e9" : C.redBg, border: `1px solid ${fin.verdict === "cheaper" ? "#c8e6c9" : C.redBorder}`, borderRadius: 12, padding: "0.85rem", marginBottom: "0.75rem", textAlign: "center" }}>
            <div style={{ fontFamily: serif, fontSize: "1rem", fontWeight: 700, color: fin.verdict === "cheaper" ? C.grn : C.red, marginBottom: 3 }}>
              Owning is {fin.savePct}% {fin.verdict === "cheaper" ? "CHEAPER" : "MORE EXPENSIVE"} than renting in {result.best.suburb}
            </div>
            <div style={{ fontSize: "0.71rem", color: C.mid }}>
              Own: {fmtD(fin.ownerTotal)}/mo &nbsp;·&nbsp; Market rent: {fmtD(fin.mktRentMo)}/mo &nbsp;·&nbsp; Difference: {fmtD(Math.abs(fin.moSave))}/mo
            </div>
          </div>

          {/* ── OWNER vs RENTED VERDICT ── */}
          <div style={{ background: C.warm, borderRadius: 14, padding: "1rem", border: `1px solid ${C.oBorder}`, marginBottom: "0.9rem" }}>
            <SH title="Owner-Occupied vs Investment — Which is Better for You?" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "0.75rem" }}>

              {/* Owner Occupied */}
              <div style={{ background: fin.ownerBetter ? "linear-gradient(135deg,#e8f5e9,#f0faf4)" : C.cream, border: `1px solid ${fin.ownerBetter ? "#c8e6c9" : C.oBorder}`, borderRadius: 10, padding: "0.8rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <div style={{ fontSize: "1rem" }}>{fin.ownerBetter ? "✅" : "🏠"}</div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: fin.ownerBetter ? C.grn : C.dark }}>Owner Occupied{fin.ownerBetter ? " — BETTER" : ""}</div>
                </div>
                <LI label="Monthly housing cost" value={fmtD(fin.ownerTotal) + "/mo"} color={C.orange} bold />
                <LI label="Market rent saved" value={"+" + fmtD(fin.mktRentMo) + "/mo"} color={C.grn} />
                <LI label="Net cost vs renting" value={fmtD(fin.ownerNetVsRent) + "/mo"} bold color={fin.ownerNetVsRent <= 0 ? C.grn : C.red} border />
                <LI label="Equity built/mo" value={"+" + fmtD(fin.moPrincipal) + "/mo"} color={C.grn} />
                <LI label="Left for living" value={fmtD(fin.netOwner) + "/mo"} color={fin.netOwner >= 0 ? C.grn : C.red} />
              </div>

              {/* Rented / Investment */}
              <div style={{ background: !fin.ownerBetter ? "linear-gradient(135deg,#e8f5e9,#f0faf4)" : C.cream, border: `1px solid ${!fin.ownerBetter ? "#c8e6c9" : C.oBorder}`, borderRadius: 10, padding: "0.8rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <div style={{ fontSize: "1rem" }}>{!fin.ownerBetter ? "✅" : "🏘"}</div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: !fin.ownerBetter ? C.grn : C.dark }}>Rented Out{!fin.ownerBetter ? " — BETTER" : ""}</div>
                </div>
                <LI label="Net rental income" value={fmtD(fin.netRentMo) + "/mo"} color={C.grn} />
                <LI label="Less: mortgage" value={"−" + fmtD(fin.mo) + "/mo"} color={C.red} />
                <LI label="Cashflow (before tax)" value={fmtD(fin.rentedCF) + "/mo"} color={fin.rentedCF >= 0 ? C.grn : C.red} border />
                {fin.moTaxRefund > 0 && <LI label={`Tax refund (${fin.marginalRate}% rate)`} value={"+" + fmtD(fin.moTaxRefund) + "/mo"} color={C.grn} />}
                {fin.moExtraTax > 0 && <LI label={`Extra tax (${fin.marginalRate}% rate)`} value={"−" + fmtD(fin.moExtraTax) + "/mo"} color={C.red} />}
                <LI label="True monthly cost" value={fmtD(fin.rentedOOPAfterTax) + "/mo"} bold color={fin.rentedOOPAfterTax === 0 ? C.grn : C.red} border />
                <LI label="Equity built/mo" value={"+" + fmtD(fin.moPrincipal) + "/mo"} color={C.grn} />
              </div>
            </div>

            {/* Depreciation note */}
            <div style={{ background: C.oPale, border: `1px solid ${C.oBorder}`, borderRadius: 8, padding: "7px 10px", fontSize: "0.67rem", color: C.mid, lineHeight: 1.5 }}>
              <strong style={{ color: C.dark }}>Tax refund includes Div 43 depreciation</strong> est. {fmtD(fin.annDepreciation)}/yr (2.5% of building value). 
              Total deductible expenses: {fmtD(fin.totalDeductible)}/yr vs gross rent {fmtD(fin.annRent)}/yr → {fin.rentalLoss > 0 ? `tax loss ${fmtD(fin.rentalLoss)}/yr at ${fin.marginalRate}% marginal rate = ${fmtD(fin.annTaxRefund)}/yr refund` : `rental profit ${fmtD(fin.rentalProfit)}/yr at ${fin.marginalRate}% = ${fmtD(fin.annExtraTax)}/yr extra tax`}.
              Consult your accountant — depreciation eligibility depends on property age and fit-out.
            </div>
          </div>
        </div>

        {/* alt suburbs */}
        <div style={{ background: C.warm, borderRadius: 16, padding: "1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", minWidth: 0 }}>
          <div style={{ fontSize: "0.74rem", fontWeight: 600, color: C.mid, textAlign: "center", marginBottom: "0.25rem" }}>Other Suburb Options</div>
          <div style={{ fontSize: "0.67rem", color: C.light, textAlign: "center", marginBottom: "0.8rem" }}>Unlock full analysis for each — $1 per suburb</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {result.alts.map((alt, i) => {
              const isUnlocked = unlockedAlts[i];
              const af = alt.fin;
              return (
                <div key={i}>
                  <div style={{ borderRadius: 12, background: i === 0 ? "linear-gradient(135deg,#e8c878,#d4a030)" : "linear-gradient(135deg,#c8a850,#b88820)", padding: "0.9rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                        <div style={{ fontFamily: serif, fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{alt.suburb}, {f.state}</div>
                        <div style={{ background: "rgba(0,0,0,0.22)", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: "0.6rem", fontWeight: 600 }}>{alt.score}%</div>
                      </div>
                      <div style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.88)" }}>{fmtD(alt.price)} · Yield {((alt.rent*52/alt.price)*100).toFixed(1)}% · Growth {alt.cap}%pa</div>
                    </div>
                    {!isUnlocked ? (
                      <button onClick={() => { setPayModal({ idx: i, alt }); setPayStep("form"); }} style={{ background: "#fff", color: C.orange, border: "none", borderRadius: 20, padding: "7px 14px", fontSize: "0.73rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>🔓 Unlock $1</button>
                    ) : (
                      <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "4px 10px", fontSize: "0.63rem", color: "#fff", fontWeight: 600, flexShrink: 0 }}>✓ Unlocked</div>
                    )}
                  </div>
                  {isUnlocked && af && (
                    <div className="fade" style={{ background: C.warm, border: `1px solid ${C.oBorder}`, borderRadius: "0 0 12px 12px", borderTop: "none", padding: "1rem" }}>
                      <div className="col3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "0.6rem" }}>
                        <div style={{ background: C.cream, borderRadius: 9, padding: "0.7rem", border: `1px solid ${C.oBorder}` }}>
                          <SH title="Match" /><div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}><ScoreRing sc={alt.score} /></div>
                          {alt.hl.map((h, j) => <div key={j} style={{ fontSize: "0.65rem", marginBottom: 2 }}><span style={{ color: C.grn }}>✓ </span>{h}</div>)}
                        </div>
                        <div style={{ background: C.cream, borderRadius: 9, padding: "0.7rem", border: `1px solid ${C.oBorder}` }}>
                          <SH title="Growth" />
                          <LI label="Capital" value={af.annualRate + "%"} /><LI label="Yield" value={af.grossYield + "%"} color={C.grn} /><LI label="Mortgage" value={fmtD(af.mo) + "/mo"} bold color={C.orange} border />
                        </div>
                        <div style={{ background: C.cream, borderRadius: 9, padding: "0.7rem", border: `1px solid ${C.oBorder}` }}>
                          <SH title="Cashflow" />
                          <LI label="Net rent" value={fmtD(af.netRentMo) + "/mo"} color={C.grn} />
                          <LI label={af.rentedCF >= 0 ? "Surplus" : "Top-up"} value={fmtD(af.rentedCF) + "/mo"} bold color={af.rentedCF >= 0 ? C.grn : C.red} border />
                          <LI label="Net living" value={fmtD(af.netLiving) + "/mo"} bold color={af.netLiving >= 0 ? C.grn : C.red} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* full report CTA */}
        <div style={{ background: "linear-gradient(135deg,#1a0f00,#2d1800)", borderRadius: 16, padding: "1.25rem", border: `1px solid ${C.goldDark}` }}>
          <div style={{ textAlign: "center", marginBottom: "0.9rem" }}>
            <div style={{ fontFamily: serif, fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>📋 Full Property Report</div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
              10-yr price & rental history · Listings for sale · Recent sales · Investment P&L · 5-yr projection · Buy/hold verdict
            </div>
          </div>
          {reportError && <div style={{ background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.3)", borderRadius: 8, padding: "6px 10px", marginBottom: "0.75rem", fontSize: "0.71rem", color: "#ffcdd2", textAlign: "center" }}>⚠️ {reportError} — please try again</div>}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={generateReport} disabled={reportStep === "generating"} style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})`, color: "#fff", border: "none", borderRadius: 25, padding: "10px 20px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(232,133,10,0.45)", opacity: reportStep === "generating" ? 0.7 : 1 }}>
              {reportStep === "generating" ? "⏳ Generating…" : reportData ? "📋 View Report" : "📋 Full Report (Free)"}
            </button>
            <button onClick={() => setShowSample(true)} style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 25, padding: "10px 16px", fontSize: "0.78rem", cursor: "pointer" }}>
              👁 Sample Report
            </button>
            <button onClick={() => setResult(null)} style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 25, padding: "10px 16px", fontSize: "0.78rem", cursor: "pointer" }}>
              Start Over
            </button>
          </div>
        </div>

        {/* Results disclaimer */}
        <div style={{ background: "#f9f5ef", border: "1px solid #e8d8c0", borderRadius: 12, padding: "0.85rem 1rem" }}>
          <div style={{ fontSize: "0.63rem", color: "#6b5a3e", lineHeight: 1.7 }}>
            <strong style={{ color: "#5a3e1b" }}>Disclaimer:</strong> All calculations and suburb data are indicative estimates only. Capital growth, rental yields, vacancy rates (estimated from suburb characteristics — not live SQM/REIV data), and days-on-market figures should be independently verified. Tax estimates are general in nature and depend on individual circumstances — consult a registered tax agent. Mortgage serviceability figures assume standard P&I repayments and do not account for living expenses, other debts, or lender-specific policies. <strong>Obtain formal bank pre-approval and an independent property valuation before proceeding.</strong> This tool does not constitute financial advice. No liability is accepted for decisions made based on these estimates.
          </div>
        </div>
      </div>
    )}
  </div>

  {/* ── $1 ALT UNLOCK MODAL ── */}
  {payModal && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: C.warm, borderRadius: 20, padding: "1.75rem", width: "100%", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {payStep === "form" && (<>
          <div style={{ textAlign: "center", marginBottom: "1.1rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 5 }}>🔓</div>
            <div style={{ fontFamily: serif, fontSize: "1.15rem", fontWeight: 700, color: C.dark, marginBottom: 4 }}>Unlock Analysis</div>
            <div style={{ fontSize: "0.76rem", color: C.mid }}>Full suburb analysis for <strong>{payModal.alt.suburb}</strong></div>
            <div style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 700, color: C.orange, marginTop: 5 }}>$1.00</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", marginBottom: "0.9rem" }}>
            <input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,"").slice(0,16).replace(/(\d{4})/g,"$1 ").trim())} placeholder="1234 5678 9012 3456" style={{ ...iSt, letterSpacing: "0.08em" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <input value={cardExp} onChange={e => { let v = e.target.value.replace(/\D/g,"").slice(0,4); if(v.length>=3)v=v.slice(0,2)+"/"+v.slice(2); setCardExp(v); }} placeholder="MM/YY" style={iSt} />
              <input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="CVV" style={iSt} type="password" />
            </div>
          </div>
          <button onClick={() => { if(cardNum.replace(/\s/g,"").length<16||cardExp.length<5||cardCvv.length<3)return; setPayStep("processing"); setTimeout(()=>setPayStep("done"),2200); }} style={{ width: "100%", background: `linear-gradient(135deg,${C.orange},${C.orangeL})`, color: "#fff", border: "none", borderRadius: 25, padding: "12px", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", marginBottom: "0.5rem" }}>
            Pay $1.00 — Unlock
          </button>
          <button onClick={() => setPayModal(null)} style={{ width: "100%", background: "transparent", color: C.mid, border: "none", fontSize: "0.76rem", cursor: "pointer" }}>Cancel</button>
        </>)}
        {payStep === "processing" && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ width: 40, height: 40, border: `4px solid ${C.oBorder}`, borderTopColor: C.orange, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
            <div style={{ fontSize: "0.9rem", color: C.dark }}>Processing payment…</div>
          </div>
        )}
        {payStep === "done" && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: "0.65rem" }}>✅</div>
            <div style={{ fontFamily: serif, fontSize: "1.1rem", fontWeight: 700, color: C.dark, marginBottom: 5 }}>Payment Successful!</div>
            <div style={{ fontSize: "0.76rem", color: C.mid, marginBottom: "1rem" }}>Full analysis for <strong>{payModal.alt.suburb}</strong> is unlocked.</div>
            <button onClick={() => { setUnlockedAlts(p => ({ ...p, [payModal.idx]: true })); setPayModal(null); setCardNum(""); setCardExp(""); setCardCvv(""); }} style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})`, color: "#fff", border: "none", borderRadius: 25, padding: "10px 28px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
              View Analysis →
            </button>
          </div>
        )}
      </div>
    </div>
  )}

  {/* ── REPORT MODAL ── */}
  {showReport && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1001, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "0.75rem", overflowY: "auto" }}>
      <div style={{ background: C.warm, borderRadius: 20, width: "100%", maxWidth: 860, boxShadow: "0 24px 80px rgba(0,0,0,0.4)", marginBottom: "1rem" }}>
        {/* sticky header */}
        <div className="no-print" style={{ position: "sticky", top: 0, background: C.warm, borderBottom: `1px solid ${C.oBorder}`, borderRadius: "20px 20px 0 0", padding: "0.9rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <div style={{ fontFamily: serif, fontSize: "1rem", fontWeight: 700, color: C.dark }}>
            {reportStep === "generating" ? "⏳ Generating report…" : "📋 Full Report"}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(reportStep === "paid" || reportStep === "preview") && reportData && (
              <button onClick={() => {
                // Hide non-report elements temporarily, then print
                const style = document.createElement("style");
                style.id = "print-override";
                style.innerHTML = `
                  @media print {
                    body > * { display: none !important; }
                    body > div > div > div[style*="position: fixed"] { display: none !important; }
                    #suburb-print-container { display: block !important; position: static !important; }
                    #suburb-print-container * { visibility: visible !important; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  }
                `;
                document.head.appendChild(style);

                // Create a dedicated print div at body level
                const existing = document.getElementById("suburb-print-container");
                if (existing) existing.remove();
                const reportEl = document.getElementById("suburb-match-report");
                if (reportEl) {
                  const printDiv = document.createElement("div");
                  printDiv.id = "suburb-print-container";
                  printDiv.style.cssText = "display:none;position:fixed;top:0;left:0;width:100%;z-index:99999;background:#fff;padding:20px;";
                  printDiv.innerHTML = `<h2 style="font-family:Georgia,serif;color:#2d2417;margin-bottom:16px">${reportData?.reportTitle || "Property Report"}</h2>` + reportEl.innerHTML;
                  document.body.appendChild(printDiv);
                }

                window.print();

                // Cleanup after print dialog closes
                setTimeout(() => {
                  const ps = document.getElementById("print-override");
                  if (ps) ps.remove();
                  const pc = document.getElementById("suburb-print-container");
                  if (pc) pc.remove();
                }, 2000);
              }} style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})`, color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: "0.74rem", fontWeight: 600, cursor: "pointer" }}>
                🖨️ Print / Save PDF
              </button>
            )}
            <button onClick={() => setShowReport(false)} style={{ background: C.cream, color: C.mid, border: `1px solid ${C.oBorder}`, borderRadius: 20, padding: "6px 14px", fontSize: "0.74rem", cursor: "pointer" }}>✕ Close</button>
          </div>
        </div>

        {/* generating spinner */}
        {reportStep === "generating" && (
          <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
            <div style={{ width: 50, height: 50, border: `4px solid ${C.oBorder}`, borderTopColor: C.orange, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1.25rem" }} />
            <div style={{ fontFamily: serif, fontSize: "1.1rem", color: C.dark, marginBottom: 10 }}>Generating your report…</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", maxWidth: 260, margin: "0 auto", textAlign: "left" }}>
              {["Modelling 10-year price history","Calculating rental trends","Building financial model","Compiling investment analysis"].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.72rem", color: C.mid }}>
                  <div style={{ width: 14, height: 14, border: `2px solid ${C.oBorder}`, borderTopColor: C.orange, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0, animationDelay: `${i*0.2}s` }} />{s}
                </div>
              ))}
            </div>
            <div style={{ fontSize: "0.66rem", color: C.light, marginTop: "1rem" }}>Building your report…</div>
          </div>
        )}

        {/* error */}
        {reportStep === "error" && (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.65rem" }}>⚠️</div>
            <div style={{ fontSize: "0.9rem", color: C.red, marginBottom: "0.75rem" }}>Report generation failed</div>
            <div style={{ fontSize: "0.72rem", color: "#333", marginBottom: "1rem", background: "#fff", border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 12px", textAlign: "left", wordBreak: "break-word", fontFamily: "monospace" }}>
              {reportError || "Unknown error"}
            </div>
            <button onClick={generateReport} style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})`, color: "#fff", border: "none", borderRadius: 25, padding: "10px 24px", fontSize: "0.84rem", fontWeight: 600, cursor: "pointer" }}>Try Again</button>
          </div>
        )}

        {/* preview or paid report */}
        {(reportStep === "preview" || reportStep === "paid") && reportData && (
          <>
            <div id="suburb-match-report">
            <ReportView
              data={reportData}
              schoolsHigh={f.schools === "high"}
              paid={reportPaid}
              onUnlock={() => setShowPayReport(true)}
              suburb={result?.best?.suburb}
              state={f.state}
              propType={f.propType}
              budget={f.budget}
              priceMedian={result?.best?.price}
            />
            </div>
          </>
        )}
      </div>
    </div>
  )}

  {/* ── SAMPLE REPORT MODAL ── */}
  {showSample && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1002, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "0.75rem", overflowY: "auto" }}>
      <div style={{ background: C.warm, borderRadius: 20, width: "100%", maxWidth: 860, boxShadow: "0 24px 80px rgba(0,0,0,0.5)", marginBottom: "1rem" }}>
        <div style={{ position: "sticky", top: 0, background: C.warm, borderBottom: `1px solid ${C.oBorder}`, borderRadius: "20px 20px 0 0", padding: "0.9rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <div>
            <div style={{ fontFamily: serif, fontSize: "1rem", fontWeight: 700, color: C.dark }}>👁 Sample Report — Collingwood VIC</div>
            <div style={{ fontSize: "0.66rem", color: C.mid }}>Example of a paid full report</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => { setShowSample(false); }} style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})`, color: "#fff", border: "none", borderRadius: 20, padding: "7px 14px", fontSize: "0.73rem", fontWeight: 600, cursor: "pointer" }}>Buy Report $10</button>
            <button onClick={() => setShowSample(false)} style={{ background: C.cream, color: C.mid, border: `1px solid ${C.oBorder}`, borderRadius: 20, padding: "7px 12px", fontSize: "0.73rem", cursor: "pointer" }}>✕ Close</button>
          </div>
        </div>
        <div style={{ background: "#fffde7", border: "1px solid #ffe082", margin: "1rem 1.5rem 0", borderRadius: 8, padding: "6px 12px", fontSize: "0.7rem", color: "#6d4c00", fontWeight: 500, textAlign: "center" }}>
          👁 SAMPLE — Historical figures are modelled estimates, not real sales data. Listings section shows live search links to Domain/REA instead of fake addresses.
        </div>
        <ReportView data={SAMPLE} schoolsHigh={true} paid={true} onUnlock={() => {}} suburb="Collingwood" state="VIC" propType="house" budget="1200000" priceMedian={980000} />
      </div>
    </div>
  )}

</div>
```

);
}
