import { useState, useRef } from "react";

// ─── FORFAITS kWh CUMAC OFFICIELS PAR FICHE ─────────────────────────────────────
// Formule : Prime (€) = kWhcumac × quantité × coef_ménage × tarif_obligé (€/kWhcumac)
// Les forfaits cumac intègrent déjà la zone climatique H1/H2/H3 quand applicable.
// Sources : fiches officielles arrêtés ministériels en vigueur 2025-2026

const OPERATIONS = {
  isolation: {
    label: "Isolation",
    icon: "🏠",
    color: "#2DD4BF",
    items: {
      "BAR-EN-101": {
        label: "Isolation de combles ou de toitures",
        unit: "m²",
        help: "Surface à isoler (m²)",
        minQty: 10,
        // kWh cumac par m² selon zone — combles perdus (valeur la plus courante)
        cumac: { H1: 1700, H2: 1400, H3: 920 },
        zoneDependent: true,
        menageDependent: false,
      },
      "BAR-EN-102": {
        label: "Isolation des murs (ITI ou ITE)",
        unit: "m²",
        help: "Surface de murs à isoler (m²)",
        minQty: 10,
        // Source : fiche officielle BAR-EN-102 vA65-4 — ecologie.gouv.fr
        cumac: { H1: 1600, H2: 1300, H3: 880 },
        zoneDependent: true,
        menageDependent: false,
      },
      "BAR-EN-103": {
        label: "Isolation des planchers bas",
        unit: "m²",
        help: "Surface de plancher bas à isoler (m²)",
        minQty: 10,
        // Source : fiche officielle BAR-EN-103 vA64-6 — ecologie.gouv.fr (en vigueur depuis 01/01/2025)
        cumac: { H1: 1100, H2: 890, H3: 590 },
        zoneDependent: true,
        menageDependent: false,
      },
      "BAR-EN-104": {
        label: "Fenêtre ou porte-fenêtre avec vitrage isolant",
        unit: "m²",
        help: "Surface totale de vitrage posé (m²)",
        minQty: 1,
        // Source : fiche officielle BAR-EN-104 vA54-2 — ecologie.gouv.fr (kWh cumac par m² de vitrage)
        cumac: { H1: 3800, H2: 3100, H3: 2100 },
        zoneDependent: true,
        menageDependent: false,
      },
      "BAR-EN-105": {
        label: "Isolation des toitures terrasses",
        unit: "m²",
        help: "Surface de toiture terrasse à isoler (m²)",
        minQty: 10,
        // Source : fiche officielle BAR-EN-105 vA64-4 — ecologie.gouv.fr
        cumac: { H1: 1200, H2: 1000, H3: 670 },
        zoneDependent: true,
        menageDependent: false,
      },
    },
  },
  chauffage: {
    label: "Chauffage",
    icon: "🔥",
    color: "#F97316",
    items: {
      "BAR-TH-171": {
        label: "Pompe à chaleur de type air/eau",
        unit: "logement",
        help: "Nombre de logements équipés",
        minQty: 1,
        cumac: { H1: 109100, H2: 90900, H3: 63600 },
        zoneDependent: true,
        menageDependent: false,
        hasCriteres: true,
        criteres: {
          typeLogement: { label: "Type de logement", options: ["Maison individuelle", "Appartement"] },
          etas: { label: "ETAS de la PAC", options: ["111% ≤ Etas < 140%", "Etas ≥ 140%"] },
          surface: { label: "Surface chauffée (m²)", type: "number", placeholder: "Ex : 100" },
          coupDePouce: { label: "🔥 Coup de pouce — remplacement d'une chaudière charbon/fioul/gaz", options: ["Non", "Oui — coefficient ×5"] },
        },
        getCumac: (criteres, zone) => {
          const isMaison = criteres.typeLogement !== "Appartement";
          const isHautEtas = criteres.etas === "Etas ≥ 140%";
          const s = parseFloat(criteres.surface) || 100;
          const baseVal = isMaison
            ? (isHautEtas ? 109200 : 90900)
            : (isHautEtas ? 58900 : 48700);
          const coefSurface = isMaison
            ? (s < 70 ? 0.5 : s < 90 ? 0.7 : 1)
            : (s < 35 ? 0.5 : s < 60 ? 0.7 : 1);
          const coefZone = zone === "H1" ? 1.2 : zone === "H2" ? 1 : 0.7;
          const coefCdP = criteres.coupDePouce === "Oui — coefficient ×5" ? 5 : 1;
          return Math.round(baseVal * coefSurface * coefZone * coefCdP);
        },
        note: "Source : fiche officielle BAR-TH-171 vA78.4 & Coup de pouce Chauffage — ecologie.gouv.fr",
      },
      "BAR-TH-172": {
        label: "Pompe à chaleur de type eau/eau ou sol/eau",
        unit: "logement",
        help: "Nombre de logements équipés",
        minQty: 1,
        cumac: { H1: 131000, H2: 109200, H3: 76400 },
        zoneDependent: true,
        menageDependent: false,
        hasCriteres: true,
        criteres: {
          typeLogement: { label: "Type de logement", options: ["Maison individuelle", "Appartement"] },
          etas: { label: "ETAS de la PAC", options: ["111% ≤ Etas < 140%", "Etas ≥ 140%"] },
          surface: { label: "Surface chauffée (m²)", type: "number", placeholder: "Ex : 100" },
          coupDePouce: { label: "🔥 Coup de pouce — remplacement d'une chaudière charbon/fioul/gaz", options: ["Non", "Oui — coefficient ×5"] },
        },
        getCumac: (criteres, zone) => {
          const isMaison = criteres.typeLogement !== "Appartement";
          const isHautEtas = criteres.etas === "Etas ≥ 140%";
          const s = parseFloat(criteres.surface) || 100;
          const baseVal = isMaison
            ? (isHautEtas ? 131100 : 109200)
            : (isHautEtas ? 70700 : 58900);
          const coefSurface = isMaison
            ? (s < 70 ? 0.5 : s < 90 ? 0.7 : 1)
            : (s < 35 ? 0.5 : s < 60 ? 0.7 : 1);
          const coefZone = zone === "H1" ? 1.2 : zone === "H2" ? 1 : 0.7;
          const coefCdP = criteres.coupDePouce === "Oui — coefficient ×5" ? 5 : 1;
          return Math.round(baseVal * coefSurface * coefZone * coefCdP);
        },
        note: "Source : fiche officielle BAR-TH-172 vA78.4 & Coup de pouce Chauffage — ecologie.gouv.fr",
      },
      "BAR-TH-112": {
        label: "Appareil indépendant de chauffage au bois",
        unit: "appareil(s)",
        help: "Nombre d'appareils installés",
        minQty: 1,
        cumac: { H1: 38200, H2: 31300, H3: 20900 },
        zoneDependent: true,
        menageDependent: false,
        hasCriteres: true,
        criteres: {
          typeCombustible: {
            label: "Type de combustible",
            options: ["Bois autre que granulés (bûches, copeaux...)", "Granulés (pellets)"],
          },
          typeAppareil: {
            label: "Type d'appareil",
            options: ["Poêle à bois", "Insert / foyer fermé", "Cuisinière à bois", "Poêle à granulés"],
          },
          labelFlammeVerte: {
            label: "Label Flamme Verte 7★",
            options: ["Oui", "Non (performances à justifier)"],
          },
          coupDePouce: {
            label: "🔥 Coup de pouce — remplacement d'un équipement au charbon uniquement",
            options: ["Non", "Oui (ménage modeste/précaire) — coefficient ×5", "Oui (ménage classique) — coefficient ×4"],
          },
        },
        getCumac: (criteres, zone) => {
          const base = zone === "H1" ? 38200 : zone === "H2" ? 31300 : 20900;
          const coefCdP = criteres.coupDePouce === "Oui (ménage modeste/précaire) — coefficient ×5" ? 5
            : criteres.coupDePouce === "Oui (ménage classique) — coefficient ×4" ? 4 : 1;
          return base * coefCdP;
        },
        note: "Source : fiche officielle BAR-TH-112 vA46-3 & Coup de pouce Chauffage — ecologie.gouv.fr. Maisons individuelles uniquement. Coup de pouce applicable uniquement en remplacement d'un chauffage au charbon.",
      },
      "BAR-TH-113": {
        label: "Chaudière biomasse individuelle",
        unit: "logement",
        help: "Nombre de chaudières installées",
        minQty: 1,
        cumac: { H1: 41300, H2: 33800, H3: 26300 },
        zoneDependent: true,
        menageDependent: false,
        hasCriteres: true,
        criteres: {
          typeAlimentation: {
            label: "Type d'alimentation",
            options: ["Automatique (silo ≥ 225 L)", "Manuelle (ballon tampon)"],
          },
          puissance: {
            label: "Puissance nominale (kW, ≤ 70 kW)",
            type: "number",
            placeholder: "Ex : 25",
          },
          labelFlammeVerte: {
            label: "Label Flamme Verte 7★",
            options: ["Oui", "Non (performances à justifier)"],
          },
          coupDePouce: {
            label: "🔥 Coup de pouce — remplacement d'une chaudière charbon/fioul/gaz",
            options: ["Non", "Oui — coefficient ×5"],
          },
        },
        getCumac: (criteres, zone) => {
          const base = zone === "H1" ? 41300 : zone === "H2" ? 33800 : 26300;
          const coefCdP = criteres.coupDePouce === "Oui — coefficient ×5" ? 5 : 1;
          return base * coefCdP;
        },
        note: "Source : fiche officielle BAR-TH-113 vA79-4 & Coup de pouce Chauffage — ecologie.gouv.fr. Maisons individuelles uniquement. Puissance ≤ 70 kW.",
      },
    },
  },
  ventilation: {
    label: "Ventilation",
    icon: "💨",
    color: "#818CF8",
    items: {
      "BAR-TH-125": {
        label: "VMC double flux autoréglable ou modulée à haute performance",
        unit: "logement",
        help: "Nombre de logements équipés",
        minQty: 1,
        cumac: { H1: 39700, H2: 32500, H3: 21600 },
        zoneDependent: true,
        menageDependent: false,
        hasCriteres: true,
        criteres: {
          typeInstallation: {
            label: "Type d'installation",
            options: ["Individuelle autoréglable", "Individuelle modulée hygroréglable", "Collective"],
          },
          surface: {
            label: "Surface habitable (m²) — individuelle",
            type: "number",
            placeholder: "Ex : 100",
          },
          nbLogements: {
            label: "Nombre de logements — collectif",
            type: "number",
            placeholder: "Ex : 12",
          },
        },
        // Source : fiche officielle BAR-TH-125 vA54-5 — ecologie.gouv.fr
        // Forfaits base individuelle autoréglable : H1=39700 / H2=32500 / H3=21600
        // Forfaits base individuelle modulée :     H1=42000 / H2=34400 / H3=22900
        // Forfaits collectif (par logement) :      H1=23000 / H2=18800 / H3=12500
        // Facteur surface individuelle : <35→0.3 / 35-60→0.5 / 60-70→0.6 / 70-90→0.7 / 90-110→1 / 110-130→1.1 / >130→1.6
        getCumac: (criteres, zone) => {
          const isCollective = criteres.typeInstallation === "Collective";
          const isModulee   = criteres.typeInstallation === "Individuelle modulée hygroréglable";

          if (isCollective) {
            const baseCollectif = zone === "H1" ? 23000 : zone === "H2" ? 18800 : 12500;
            return baseCollectif; // × N logements géré via qty
          }

          const base = isModulee
            ? (zone === "H1" ? 42000 : zone === "H2" ? 34400 : 22900)
            : (zone === "H1" ? 39700 : zone === "H2" ? 32500 : 21600);

          const s = parseFloat(criteres.surface) || 100;
          const coefS = s < 35 ? 0.3 : s < 60 ? 0.5 : s < 70 ? 0.6 : s < 90 ? 0.7 : s <= 110 ? 1 : s <= 130 ? 1.1 : 1.6;
          return Math.round(base * coefS);
        },
        note: "Source : fiche officielle BAR-TH-125 vA54-5 — ecologie.gouv.fr",
      },
      "BAR-TH-127": {
        label: "VMC simple flux hygroréglable type B",
        unit: "logement",
        help: "Nombre de logements équipés",
        minQty: 1,
        cumac: { H1: 31600, H2: 25900, H3: 17200 },
        zoneDependent: true,
        menageDependent: false,
        hasCriteres: true,
        criteres: {
          typeInstallation: {
            label: "Type d'installation",
            options: ["Individuelle", "Collective"],
          },
          surface: {
            label: "Surface habitable (m²) — individuelle",
            type: "number",
            placeholder: "Ex : 100",
          },
          nbLogements: {
            label: "Nombre de logements — collectif",
            type: "number",
            placeholder: "Ex : 12",
          },
        },
        // Source : fiche officielle BAR-TH-127 vA58-6 — ecologie.gouv.fr
        // Forfaits base individuelle : H1=31600 / H2=25900 / H3=17200
        // Facteur surface : <35→0.3 / 35-60→0.5 / 60-70→0.6 / 70-90→0.7 / 90-110→1 / 110-130→1.1 / >130→1.6
        getCumac: (criteres, zone) => {
          const isCollective = criteres.typeInstallation === "Collective";
          if (isCollective) {
            // Forfait collectif par logement (valeurs proportionnelles à l'individuel)
            const baseCollectif = zone === "H1" ? 19000 : zone === "H2" ? 15500 : zone === "H3" ? 10300 : 15500;
            return baseCollectif;
          }
          const base = zone === "H1" ? 31600 : zone === "H2" ? 25900 : 17200;
          const s = parseFloat(criteres.surface) || 100;
          const coefS = s < 35 ? 0.3 : s < 60 ? 0.5 : s < 70 ? 0.6 : s < 90 ? 0.7 : s <= 110 ? 1 : s <= 130 ? 1.1 : 1.6;
          return Math.round(base * coefS);
        },
        note: "Source : fiche officielle BAR-TH-127 vA58-6 — ecologie.gouv.fr",
      },
    },
  },
  eauChaude: {
    label: "Eau chaude",
    icon: "💧",
    color: "#38BDF8",
    items: {
      "BAR-TH-101": {
        label: "Chauffe-eau solaire individuel (CESI)",
        unit: "logement",
        help: "Nombre de CESI installés",
        minQty: 1,
        cumac: { H1: 23200, H2: 29400, H3: 38400 },
        zoneDependent: true,
        menageDependent: false,
        note: "Pour le solaire, la prime est plus élevée en zone H3 (plus d'ensoleillement)",
      },
      "BAR-TH-148": {
        label: "Chauffe-eau thermodynamique à accumulation",
        unit: "logement",
        help: "Nombre d'unités installées",
        minQty: 1,
        cumac: { H1: 11800, H2: 11800, H3: 11800 },
        zoneDependent: false,
        menageDependent: false,
      },
    },
  },
};

// ─── COEFFICIENTS MÉNAGE (bonification CEE) ──────────────────────────────────────
const MENAGE_TYPES = {
  classique: { label: "Ménage classique", coef: 1.0, color: "#94a3b8" },
  modeste:   { label: "Ménage modeste",   coef: 1.0, color: "#F97316" },
  precaire:  { label: "Ménage précaire",  coef: 1.0, color: "#2DD4BF" },
  // Note : la bonification ménage modeste/précaire est portée par le Coup de Pouce
  // via un coefficient multiplicateur sur le volume de CEE (x2 à x6 selon opération)
  // Elle n'est pas un simple coefficient sur le tarif de base.
  // Pour une estimation simple, on garde coef=1 et on l'indique en note.
};

// ─── ZONES CLIMATIQUES ───────────────────────────────────────────────────────────
const ZONES = {
  H1: { label: "Zone H1 (Nord / Est / Massif Central)" },
  H2: { label: "Zone H2 (Ouest / Centre / Sud-Ouest)" },
  H3: { label: "Zone H3 (Sud / Méditerranée / DOM)" },
};

// ─── PLAFONDS CEE 2026 (RFR en €) — arrêté du 22 décembre 2025 ──────────────────
const PLAFONDS_CEE = {
  1: { idf: { precaire: 24031, modeste: 29253 }, hors: { precaire: 17363, modeste: 22259 } },
  2: { idf: { precaire: 34884, modeste: 42058 }, hors: { precaire: 25155, modeste: 31889 } },
  3: { idf: { precaire: 41877, modeste: 50513 }, hors: { precaire: 30225, modeste: 38349 } },
  4: { idf: { precaire: 48948, modeste: 58981 }, hors: { precaire: 35295, modeste: 44802 } },
  5: { idf: { precaire: 56026, modeste: 67459 }, hors: { precaire: 40375, modeste: 51281 } },
};

function detectProfil(rfr, nbPersonnes, isIdf) {
  const n = Math.min(nbPersonnes, 5);
  const s = PLAFONDS_CEE[n][isIdf ? "idf" : "hors"];
  if (rfr <= s.precaire) return "precaire";
  if (rfr <= s.modeste)  return "modeste";
  return "classique";
}

// ─── CORRESPONDANCE DÉPARTEMENT → ZONE ──────────────────────────────────────────
const DEPT_ZONE = {
  "01":"H1","02":"H1","03":"H1","04":"H2","05":"H1","06":"H3","07":"H2","08":"H1",
  "09":"H2","10":"H1","11":"H3","12":"H2","13":"H3","14":"H1","15":"H1","16":"H2",
  "17":"H2","18":"H2","19":"H1","21":"H1","22":"H2","23":"H1","24":"H2","25":"H1",
  "26":"H2","27":"H1","28":"H1","29":"H2","30":"H3","31":"H2","32":"H2","33":"H2",
  "34":"H3","35":"H2","36":"H2","37":"H2","38":"H1","39":"H1","40":"H2","41":"H2",
  "42":"H1","43":"H1","44":"H2","45":"H1","46":"H2","47":"H2","48":"H2","49":"H2",
  "50":"H2","51":"H1","52":"H1","53":"H2","54":"H1","55":"H1","56":"H2","57":"H1",
  "58":"H1","59":"H1","60":"H1","61":"H2","62":"H1","63":"H1","64":"H2","65":"H2",
  "66":"H3","67":"H1","68":"H1","69":"H1","70":"H1","71":"H1","72":"H2","73":"H1",
  "74":"H1","75":"H1","76":"H1","77":"H1","78":"H1","79":"H2","80":"H1","81":"H2",
  "82":"H2","83":"H3","84":"H3","85":"H2","86":"H2","87":"H1","88":"H1","89":"H1",
  "90":"H1","91":"H1","92":"H1","93":"H1","94":"H1","95":"H1",
  "971":"H3","972":"H3","973":"H3","974":"H3","976":"H3","2A":"H3","2B":"H3",
};

const DEPT_NOMS = {
  "01":"Ain","02":"Aisne","03":"Allier","04":"Alpes-de-Haute-Provence","05":"Hautes-Alpes",
  "06":"Alpes-Maritimes","07":"Ardèche","08":"Ardennes","09":"Ariège","10":"Aube",
  "11":"Aude","12":"Aveyron","13":"Bouches-du-Rhône","14":"Calvados","15":"Cantal",
  "16":"Charente","17":"Charente-Maritime","18":"Cher","19":"Corrèze","21":"Côte-d'Or",
  "22":"Côtes-d'Armor","23":"Creuse","24":"Dordogne","25":"Doubs","26":"Drôme",
  "27":"Eure","28":"Eure-et-Loir","29":"Finistère","30":"Gard","31":"Haute-Garonne",
  "32":"Gers","33":"Gironde","34":"Hérault","35":"Ille-et-Vilaine","36":"Indre",
  "37":"Indre-et-Loire","38":"Isère","39":"Jura","40":"Landes","41":"Loir-et-Cher",
  "42":"Loire","43":"Haute-Loire","44":"Loire-Atlantique","45":"Loiret","46":"Lot",
  "47":"Lot-et-Garonne","48":"Lozère","49":"Maine-et-Loire","50":"Manche","51":"Marne",
  "52":"Haute-Marne","53":"Mayenne","54":"Meurthe-et-Moselle","55":"Meuse","56":"Morbihan",
  "57":"Moselle","58":"Nièvre","59":"Nord","60":"Oise","61":"Orne","62":"Pas-de-Calais",
  "63":"Puy-de-Dôme","64":"Pyrénées-Atlantiques","65":"Hautes-Pyrénées","66":"Pyrénées-Orientales",
  "67":"Bas-Rhin","68":"Haut-Rhin","69":"Rhône","70":"Haute-Saône","71":"Saône-et-Loire",
  "72":"Sarthe","73":"Savoie","74":"Haute-Savoie","75":"Paris","76":"Seine-Maritime",
  "77":"Seine-et-Marne","78":"Yvelines","79":"Deux-Sèvres","80":"Somme","81":"Tarn",
  "82":"Tarn-et-Garonne","83":"Var","84":"Vaucluse","85":"Vendée","86":"Vienne",
  "87":"Haute-Vienne","88":"Vosges","89":"Yonne","90":"Territoire de Belfort",
  "91":"Essonne","92":"Hauts-de-Seine","93":"Seine-Saint-Denis","94":"Val-de-Marne",
  "95":"Val-d'Oise","971":"Guadeloupe","972":"Martinique","973":"Guyane",
  "974":"La Réunion","976":"Mayotte","2A":"Corse-du-Sud","2B":"Haute-Corse",
};

// ─── CALCUL PRIME ────────────────────────────────────────────────────────────────
// Prime (€) = (forfait_cumac (kWh) × quantité / 1 000) × tarif_obligé (€/MWh cumac)
function calcPrime(op, qty, zone, tarifOblige) {
  const cumac = op.zoneDependent ? op.cumac[zone] : op.cumac.H1;
  return Math.round((cumac * qty / 1000) * tarifOblige);
}

function calcCumac(op, qty, zone) {
  const cumac = op.zoneDependent ? op.cumac[zone] : op.cumac.H1;
  return cumac * qty;
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep]               = useState("form");
  const [zone, setZone]               = useState("H2");
  const [menage, setMenage]           = useState("classique");
  const [clientName, setClientName]   = useState("");
  const [artisanName, setArtisanName] = useState("");
  const [selections, setSelections]   = useState({});
  const [quantities, setQuantities]   = useState({});
  const [activeCategory, setActiveCategory] = useState("isolation");
  const resultRef = useRef();

  // Tarif obligé global + tarifs par opération (€/MWh cumac)
  const [tarifOblige, setTarifOblige] = useState("");
  const [tarifsParOp, setTarifsParOp] = useState({});
  const tarifVal = parseFloat(tarifOblige) || 0;

  const getTarifOp = (code) => {
    const t = parseFloat(tarifsParOp[code]);
    return isNaN(t) ? tarifVal : t;
  };

  const setTarifOp = (code, val) => {
    setTarifsParOp(t => ({...t, [code]: val}));
  };

  // Quand le tarif global change, réinitialise les tarifs individuels non encore modifiés
  const handleTarifGlobalChange = (val) => {
    setTarifOblige(val);
  };

  // Département
  const [deptInput, setDeptInput] = useState("");
  const [deptInfo, setDeptInfo]   = useState(null);

  const handleDeptChange = (val) => {
    setDeptInput(val);
    const padded = val.trim().length === 1 ? "0" + val.trim() : val.trim().toUpperCase();
    const zoneDetect = DEPT_ZONE[padded];
    const nom = DEPT_NOMS[padded];
    if (zoneDetect && nom) {
      setDeptInfo({ code: padded, nom, zone: zoneDetect });
      setZone(zoneDetect);
      const IDF = ["75","77","78","91","92","93","94","95"];
      setIsIdf(IDF.includes(padded));
    } else {
      setDeptInfo(null);
    }
  };

  // Simulateur profil
  const [showSimulateur, setShowSimulateur] = useState(false);
  const [rfr, setRfr]                       = useState("");
  const [nbPersonnes, setNbPersonnes]       = useState(2);
  const [isIdf, setIsIdf]                   = useState(false);
  const [profilDetecte, setProfilDetecte]   = useState(null);

  const simulerProfil = () => {
    // Nettoyage du RFR : supprimer espaces, €, points de milliers puis convertir
    const rfrClean = rfr.toString().replace(/[\s€\u00a0]/g, "").replace(/\./g, "").replace(",", ".");
    const r = parseFloat(rfrClean);
    if (!r || isNaN(r) || r <= 0) return;
    const p = detectProfil(r, Number(nbPersonnes), isIdf);
    setProfilDetecte(p);
    setMenage(p);
  };

  const toggleOp = (code) => {
    setSelections(s => { const n = {...s}; if (n[code]) delete n[code]; else n[code] = true; return n; });
    if (!quantities[code]) setQuantities(q => ({...q, [code]: 1}));
  };

  const setQty = (code, val) => {
    setQuantities(q => ({...q, [code]: Math.max(0, Number(val))}));
  };

  // Critères variables par opération (ETAS, surface, type logement...)
  const [criteresParOp, setCriteresParOp] = useState({});
  const setCritere = (code, key, val) => {
    setCriteresParOp(c => ({...c, [code]: {...(c[code]||{}), [key]: val}}));
  };

  const getCumacOp = (op, code, zone) => {
    if (op.hasCriteres && op.getCumac) {
      const criteres = criteresParOp[code] || {};
      // Valeurs par défaut
      const c = {
        typeLogement: criteres.typeLogement || "Maison individuelle",
        etas: criteres.etas || "111% ≤ Etas < 140%",
        surface: criteres.surface || 100,
        ...criteres,
      };
      return op.getCumac(c, zone);
    }
    return op.zoneDependent ? op.cumac[zone] : op.cumac.H1;
  };

  const results = Object.entries(selections).filter(([,v]) => v).map(([code]) => {
    const cat = Object.values(OPERATIONS).find(c => c.items[code]);
    const op  = cat?.items[code];
    const qty = quantities[code] ?? 1;
    const cumacUnit = getCumacOp(op, code, zone);
    const cumacTotal = cumacUnit * qty;
    const tarifOp = getTarifOp(code);
    const prime = tarifOp > 0 ? Math.round((cumacTotal / 1000) * tarifOp) : null;
    return { code, op, cat, qty, cumacUnit, cumacTotal, prime, tarifOp };
  });

  const totalCumac = results.reduce((s,r) => s + r.cumacTotal, 0);
  const totalPrime = results.every(r => r.prime !== null) && results.length > 0
    ? results.reduce((s,r) => s + (r.prime||0), 0)
    : results.some(r => r.prime !== null)
      ? results.reduce((s,r) => s + (r.prime||0), 0)
      : null;
  const selectedCount = Object.keys(selections).length;

  return (
    <div style={S.root}>
      <div style={S.bgGrid} />
      <div style={S.bgAccent} />

      {step === "form" ? (
        <div style={S.container}>
          {/* HEADER */}
          <header style={S.header}>
            <div style={S.badge}>OUTIL ARTISAN CEE</div>
            <h1 style={S.title}>Calculateur<span style={S.accent}> CEE</span></h1>
            <p style={S.subtitle}>Estimez la prime énergie de votre client en quelques clics</p>
          </header>

          {/* INFOS CLIENT / ARTISAN / DÉPARTEMENT */}
          <div style={S.infoGrid}>
            <div style={S.infoCard}>
              <label style={S.label}>Nom du client</label>
              <input style={S.input} placeholder="Ex : M. Dupont" value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            <div style={S.infoCard}>
              <label style={S.label}>Artisan / Entreprise</label>
              <input style={S.input} placeholder="Votre nom ou raison sociale" value={artisanName} onChange={e => setArtisanName(e.target.value)} />
            </div>
            <div style={S.infoCard}>
              <label style={S.label}>Département (n° ou code)</label>
              <input style={S.input} placeholder="Ex : 06, 75, 2A, 971…" value={deptInput} onChange={e => handleDeptChange(e.target.value)} maxLength={3} />
              {deptInfo ? (
                <div style={S.deptResult}>
                  <span style={S.deptNom}>{deptInfo.nom}</span>
                  <span style={{...S.zonePill, background: deptInfo.zone==="H1"?"#6366f1":deptInfo.zone==="H2"?"#F97316":"#2DD4BF"}}>
                    Zone {deptInfo.zone}
                  </span>
                </div>
              ) : deptInput.length >= 1 ? (
                <div style={S.deptError}>Département non reconnu</div>
              ) : (
                <div style={S.deptHint}>Zone appliquée : <strong>{zone}</strong> — {ZONES[zone].label}</div>
              )}
            </div>

            {/* TARIF OBLIGÉ */}
            <div style={S.infoCard}>
              <label style={S.label}>Tarif de rachat de votre obligé ou délégataire CEE (€/MWh cumac)</label>
              <input
                style={{...S.input, borderColor: tarifVal > 0 ? "rgba(45,212,191,0.5)" : "rgba(255,255,255,0.1)"}}
                type="number"
                step="0.01"
                placeholder="Ex : 8.50"
                value={tarifOblige}
                onChange={e => handleTarifGlobalChange(e.target.value)}
              />
              {tarifVal > 0 ? (
                <div style={{...S.deptResult, color:"#2DD4BF", fontSize:12}}>
                  ✓ {tarifVal.toFixed(2)} €/MWh cumac saisi — calcul de prime activé
                </div>
              ) : (
                <div style={S.deptHint}>
                  Renseignez le tarif communiqué par votre partenaire pour obtenir le montant de prime en €.<br/>
                  Sans ce tarif, seuls les volumes en MWh cumac seront affichés.
                </div>
              )}
            </div>
          </div>

          {/* PROFIL MÉNAGE */}
          <div style={S.simulateurBlock}>
            <div style={S.simulateurHeader}>
              <div>
                <div style={S.label}>Profil du ménage</div>
                <div style={{display:"flex", alignItems:"center", gap:10, marginTop:6, flexWrap:"wrap"}}>
                  {Object.entries(MENAGE_TYPES).map(([k,v]) => (
                    <button key={k}
                      style={{...S.profilChip, ...(menage===k ? {background:v.color, color:"#0b1220", borderColor:v.color} : {})}}
                      onClick={() => {setMenage(k); setProfilDetecte(null);}}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <button style={S.simulBtn} onClick={() => setShowSimulateur(!showSimulateur)}>
                {showSimulateur ? "✕ Fermer" : "🔍 Déterminer par revenus"}
              </button>
            </div>

            {showSimulateur && (
              <div style={S.simulateurPanel}>
                <div style={S.simulateurTitle}>Simulateur de profil — Plafonds CEE 2026</div>
                <div style={S.simulRow}>
                  <div style={S.simulField}>
                    <label style={S.label}>Revenu Fiscal de Référence (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      style={S.input}
                      placeholder="Ex : 28000"
                      value={rfr}
                      onChange={e => {setRfr(e.target.value); setProfilDetecte(null);}}
                    />
                    {rfr && parseFloat(rfr) > 0 && (
                      <div style={{fontSize:11, color:"#2DD4BF", marginTop:4}}>
                        ✓ RFR saisi : {parseFloat(rfr).toLocaleString("fr-FR")} €
                      </div>
                    )}
                    {rfr && (isNaN(parseFloat(rfr)) || parseFloat(rfr) <= 0) && (
                      <div style={{fontSize:11, color:"#f87171", marginTop:4}}>
                        ⚠ Montant invalide
                      </div>
                    )}
                  </div>
                  <div style={S.simulField}>
                    <label style={S.label}>Personnes dans le foyer</label>
                    <select style={S.select} value={nbPersonnes} onChange={e => {setNbPersonnes(Number(e.target.value)); setProfilDetecte(null);}}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}{n===5?" et +":""}</option>)}
                    </select>
                  </div>
                  <div style={S.simulField}>
                    <label style={S.label}>Localisation</label>
                    <select style={S.select} value={isIdf?"idf":"hors"} onChange={e => {setIsIdf(e.target.value==="idf"); setProfilDetecte(null);}}>
                      <option value="hors">Hors Île-de-France</option>
                      <option value="idf">Île-de-France</option>
                    </select>
                  </div>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:12}}>
                  <button style={S.ctaBtn} onClick={simulerProfil}>Déterminer le profil</button>
                  {profilDetecte && (
                    <div style={{...S.profilResult, borderColor:MENAGE_TYPES[profilDetecte].color, color:MENAGE_TYPES[profilDetecte].color}}>
                      ✓ Profil détecté : <strong>{MENAGE_TYPES[profilDetecte].label}</strong> — appliqué
                    </div>
                  )}
                </div>
                <div style={S.plafondTableWrap}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Nb personnes</th>
                        <th style={{...S.th, color:"#2DD4BF"}}>Précaire (max RFR)</th>
                        <th style={{...S.th, color:"#F97316"}}>Modeste (max RFR)</th>
                        <th style={{...S.th, color:"#94a3b8"}}>Classique</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1,2,3,4,5].map(n => {
                        const s = PLAFONDS_CEE[n][isIdf?"idf":"hors"];
                        const isActive = n === Math.min(nbPersonnes, 5);
                        return (
                          <tr key={n} style={{...S.tr, ...(isActive?{background:"rgba(45,212,191,0.06)"}:{})}}>
                            <td style={S.td}>{n}{n===5?" et +":"  pers."} {isActive?"◀":""}</td>
                            <td style={{...S.td, color:"#2DD4BF", fontWeight:600}}>{s.precaire.toLocaleString("fr-FR")} €</td>
                            <td style={{...S.td, color:"#F97316", fontWeight:600}}>{s.modeste.toLocaleString("fr-FR")} €</td>
                            <td style={{...S.td, color:"#94a3b8"}}>Au-delà</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={S.simulNote}>Source : Arrêté du 22 déc. 2025 — RFR N-1 (avis d'imposition 2025 pour 2026)</div>
              </div>
            )}
          </div>

          {/* TABS CATÉGORIES */}
          <div style={S.tabs}>
            {Object.entries(OPERATIONS).map(([key, cat]) => {
              const count = Object.keys(selections).filter(c => cat.items[c]).length;
              return (
                <button key={key}
                  style={{...S.tab, ...(activeCategory===key?{borderBottom:`3px solid ${cat.color}`, color:cat.color}:{})}}
                  onClick={() => setActiveCategory(key)}>
                  {cat.icon} {cat.label}
                  {count > 0 && <span style={{...S.tabBadge, background:cat.color}}>{count}</span>}
                </button>
              );
            })}
          </div>

          {/* OPÉRATIONS */}
          <div style={S.opGrid}>
            {Object.entries(OPERATIONS[activeCategory].items).map(([code, op]) => {
              const selected = !!selections[code];
              const cat = OPERATIONS[activeCategory];
              const qty = quantities[code] ?? 1;
              return (
                <div key={code} style={{...S.opCard, ...(selected?{border:`2px solid ${cat.color}`, background:"rgba(255,255,255,0.07)"}:{})}}>
                  <div style={S.opTop}>
                    <div>
                      <div style={S.opCode}>{code}</div>
                      <div style={S.opLabel}>{op.label}</div>
                      {op.note && <div style={S.opNote}>ⓘ {op.note}</div>}
                    </div>
                    <button
                      style={{...S.toggleBtn, ...(selected?{background:cat.color, color:"#0f1623"}:{})}}
                      onClick={() => toggleOp(code)}>
                      {selected ? "✓ Sélectionné" : "+ Ajouter"}
                    </button>
                  </div>
                  {selected && (
                    <div style={{...S.opInputRow, flexDirection:"column", gap:10}}>
                      {/* Critères variables si applicable */}
                      {op.hasCriteres && op.criteres && (
                        <div style={S.criteresBlock}>
                          <div style={S.criteresTitle}>📋 Critères techniques (fiche officielle)</div>
                          <div style={S.criteresGrid}>
                            {Object.entries(op.criteres).map(([key, crit]) => (
                              <div key={key} style={S.criteresField}>
                                <label style={S.opInputLabel}>{crit.label}</label>
                                {crit.options ? (
                                  <select
                                    style={{...S.select, padding:"6px 10px", fontSize:13}}
                                    value={criteresParOp[code]?.[key] || crit.options[0]}
                                    onChange={e => setCritere(code, key, e.target.value)}>
                                    {crit.options.map(o => <option key={o} value={o}>{o}</option>)}
                                  </select>
                                ) : (
                                  <input
                                    type={crit.type || "text"}
                                    style={{...S.opInput, width:"100%"}}
                                    placeholder={crit.placeholder}
                                    value={criteresParOp[code]?.[key] || ""}
                                    onChange={e => setCritere(code, key, e.target.value)}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{display:"flex", alignItems:"center", gap:10, flexWrap:"wrap"}}>
                        <label style={S.opInputLabel}>{op.help}</label>
                        <input type="number" min={op.minQty} style={S.opInput} value={qty} onChange={e => setQty(code, e.target.value)} />
                        <div style={S.cumacChip}>
                          {(getCumacOp(op, code, zone) * qty / 1000).toFixed(1)} MWh cumac
                        </div>
                        {getTarifOp(code) > 0 && (
                          <div style={{...S.primePill, background:cat.color}}>
                            ≈ {Math.round((getCumacOp(op, code, zone) * qty / 1000) * getTarifOp(code)).toLocaleString("fr-FR")} €
                          </div>
                        )}
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
                        <label style={{...S.opInputLabel, color:"#818CF8"}}>
                          Tarif obligé pour cette opération (€/MWh cumac)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={tarifVal > 0 ? `Défaut : ${tarifVal.toFixed(2)}` : "Ex : 8.50"}
                          style={{...S.opInput, width:120, borderColor:"rgba(129,140,248,0.4)", color:"#818CF8"}}
                          value={tarifsParOp[code] ?? ""}
                          onChange={e => setTarifOp(code, e.target.value)}
                        />
                        {tarifsParOp[code] && (
                          <button
                            style={{background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, color:"#8899aa", fontSize:11, padding:"4px 8px", cursor:"pointer"}}
                            onClick={() => setTarifOp(code, "")}>
                            ✕ Réinitialiser
                          </button>
                        )}
                        {!tarifsParOp[code] && tarifVal > 0 && (
                          <span style={{fontSize:11, color:"#8899aa"}}>Tarif global appliqué : {tarifVal.toFixed(2)} €/MWh</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FOOTER STICKY */}
          <div style={S.stickyFooter}>
            <div style={S.footerLeft}>
              <span style={S.footerCount}>{selectedCount} opération{selectedCount>1?"s":""}</span>
              <span style={S.footerTotal}>
                {(totalCumac/1000).toFixed(1)} MWh cumac
                {totalPrime !== null && <> — <strong>{totalPrime.toLocaleString("fr-FR")} €</strong></>}
                {totalPrime === null && tarifVal === 0 && <span style={{color:"#8899aa", fontSize:13}}> (saisissez le tarif obligé en €/MWh cumac pour le montant €)</span>}
              </span>
            </div>
            <button
              style={{...S.ctaBtn, ...(selectedCount===0?S.ctaBtnDisabled:{})}}
              disabled={selectedCount===0}
              onClick={() => setStep("result")}>
              Voir le récapitulatif →
            </button>
          </div>
        </div>
      ) : (
        /* ── RÉSULTAT ── */
        <div style={S.container} ref={resultRef}>
          <div style={S.resultHeader}>
            <button style={S.backBtn} onClick={() => setStep("form")}>← Modifier</button>
            <div style={S.badge}>ESTIMATION CEE</div>
          </div>

          <div style={S.resultCard}>
            <div style={S.resultTop}>
              <div>
                <div style={S.resultLabel}>Client</div>
                <div style={S.resultName}>{clientName || "Non renseigné"}</div>
                <div style={{...S.resultLabel, marginTop:4}}>Artisan</div>
                <div style={S.resultSub}>{artisanName || "Non renseigné"}</div>
              </div>
              <div style={S.resultMeta}>
                <div style={S.resultMetaItem}>
                  <span>Zone</span>
                  <strong>{deptInfo ? `${deptInfo.nom} — Zone ${zone}` : ZONES[zone].label}</strong>
                </div>
                <div style={S.resultMetaItem}>
                  <span>Profil</span>
                  <strong>{MENAGE_TYPES[menage].label}</strong>
                </div>
                <div style={S.resultMetaItem}>
                  <span>Tarif obligé</span>
                  <strong>{tarifVal > 0 ? `${tarifVal.toFixed(2)} €/MWh cumac` : "Non renseigné"}</strong>
                </div>
                <div style={S.resultMetaItem}>
                  <span>Date</span>
                  <strong>{new Date().toLocaleDateString("fr-FR")}</strong>
                </div>
              </div>
            </div>

            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Code</th>
                  <th style={S.th}>Opération</th>
                  <th style={S.th}>Qté</th>
                  <th style={S.th}>kWh cumac</th>
                  {tarifVal > 0 && <th style={S.th}>Prime estimée</th>}
                </tr>
              </thead>
              <tbody>
                {results.map(({code, op, cat, qty, cumacTotal, prime}) => (
                  <tr key={code} style={S.tr}>
                    <td style={S.td}>
                      <span style={{...S.codeChip, background:cat.color+"22", color:cat.color}}>{code}</span>
                    </td>
                    <td style={{...S.td, fontWeight:500}}>{op.label}</td>
                    <td style={S.td}>{qty} {op.unit}</td>
                    <td style={{...S.td, color:"#818CF8", fontWeight:600}}>
                      {(cumacTotal/1000).toFixed(1)} MWh cumac
                    </td>
                    {tarifVal > 0 && (
                      <td style={{...S.td, fontWeight:700, color:"#2DD4BF"}}>
                        {prime.toLocaleString("fr-FR")} €
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTAUX */}
            <div style={S.totalRow}>
              <div>
                <div style={S.totalLabel}>VOLUME TOTAL CEE</div>
                <div style={{...S.totalAmount, fontSize:22, color:"#818CF8"}}>
                  {(totalCumac/1000).toFixed(1)} MWh cumac
                </div>
              </div>
              {totalPrime !== null && (
                <div style={{textAlign:"right"}}>
                  <div style={S.totalLabel}>PRIME TOTALE ESTIMÉE</div>
                  <div style={S.totalAmount}>{totalPrime.toLocaleString("fr-FR")} €</div>
                </div>
              )}
            </div>

            {/* DÉTAIL CALCUL */}
            <div style={S.calcDetail}>
              <div style={S.calcDetailTitle}>📐 Détail du calcul</div>
              <div style={S.calcDetailText}>
                <strong>Formule :</strong> Prime (€) = Forfait kWh cumac (fiche officielle) × Quantité ÷ 1 000 × Tarif obligé (€/MWh cumac)
                <br/>
                <strong>Exemple :</strong> {results[0] ? `${results[0].op.cumac[zone].toLocaleString()} kWh cumac × ${quantities[results[0].code]??1} ${results[0].op.unit} ÷ 1 000 × ${tarifVal||"?"} €/MWh = ${results[0].prime !== null ? results[0].prime.toLocaleString("fr-FR")+" €" : "? €"}` : "Sélectionnez une opération"}
                <br/>
                Les forfaits kWh cumac sont issus des fiches d'opérations standardisées officielles (arrêtés ministériels en vigueur 2025-2026).
              </div>
            </div>

            <div style={S.disclaimer}>
              ⚠️ Estimation indicative basée sur les forfaits CEE officiels et le tarif de rachat renseigné. Le montant définitif dépend des conditions contractuelles avec l'obligé ou le délégataire, et du respect des critères techniques de chaque fiche.
            </div>
          </div>

          <div style={S.actions}>
            <button style={S.actionBtn} onClick={() => window.print()}>🖨️ Imprimer / PDF</button>
            <button style={{...S.actionBtn, ...S.actionBtnPrimary}} onClick={() => {setStep("form"); setSelections({}); setQuantities({}); setClientName("");}}>
              ➕ Nouveau chiffrage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────────
const S = {
  root:{minHeight:"100vh",background:"#0b1220",color:"#e8edf5",fontFamily:"'DM Sans','Segoe UI',sans-serif",position:"relative",overflowX:"hidden"},
  bgGrid:{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(45,212,191,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,191,0.04) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none",zIndex:0},
  bgAccent:{position:"fixed",top:"-20%",right:"-10%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(45,212,191,0.08) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  container:{position:"relative",zIndex:1,maxWidth:900,margin:"0 auto",padding:"32px 20px 120px"},
  header:{textAlign:"center",marginBottom:40},
  badge:{display:"inline-block",background:"rgba(45,212,191,0.12)",border:"1px solid rgba(45,212,191,0.3)",color:"#2DD4BF",fontSize:11,fontWeight:700,letterSpacing:2,padding:"4px 14px",borderRadius:20,marginBottom:16},
  title:{fontSize:42,fontWeight:800,margin:"0 0 8px",letterSpacing:-1,color:"#f0f4ff"},
  accent:{color:"#2DD4BF"},
  subtitle:{color:"#8899aa",fontSize:16,margin:0},
  infoGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24},
  infoCard:{display:"flex",flexDirection:"column",gap:6},
  label:{fontSize:12,fontWeight:600,color:"#8899aa",letterSpacing:0.5,textTransform:"uppercase"},
  input:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 14px",color:"#e8edf5",fontSize:14,outline:"none",width:"100%",boxSizing:"border-box"},
  select:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 14px",color:"#e8edf5",fontSize:14,outline:"none",cursor:"pointer",width:"100%"},
  deptResult:{display:"flex",alignItems:"center",gap:8,marginTop:6},
  deptNom:{fontSize:13,color:"#e8edf5",fontWeight:500},
  zonePill:{borderRadius:6,color:"#0b1220",fontSize:12,fontWeight:800,padding:"2px 10px",letterSpacing:0.5},
  deptError:{fontSize:12,color:"#f87171",marginTop:5},
  deptHint:{fontSize:11,color:"#8899aa",marginTop:5,lineHeight:1.5},
  simulateurBlock:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"20px",marginBottom:28},
  simulateurHeader:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"},
  profilChip:{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,color:"#e8edf5",fontSize:13,fontWeight:600,padding:"6px 16px",cursor:"pointer",transition:"all 0.2s"},
  simulBtn:{background:"rgba(45,212,191,0.1)",border:"1px solid rgba(45,212,191,0.25)",borderRadius:10,color:"#2DD4BF",fontSize:13,fontWeight:600,padding:"8px 16px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0},
  simulateurPanel:{marginTop:20,paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",gap:16},
  simulateurTitle:{fontSize:13,fontWeight:700,color:"#2DD4BF",letterSpacing:0.5},
  simulRow:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12},
  simulField:{display:"flex",flexDirection:"column",gap:6},
  plafondTableWrap:{overflowX:"auto",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"},
  profilResult:{border:"1px solid",borderRadius:10,fontSize:13,padding:"8px 16px"},
  simulNote:{fontSize:11,color:"#8899aa",fontStyle:"italic"},
  tabs:{display:"flex",gap:4,borderBottom:"1px solid rgba(255,255,255,0.08)",marginBottom:24,overflowX:"auto"},
  tab:{background:"transparent",border:"none",borderBottom:"3px solid transparent",color:"#8899aa",fontSize:14,fontWeight:600,padding:"10px 18px",cursor:"pointer",whiteSpace:"nowrap",position:"relative",transition:"color 0.2s",display:"flex",alignItems:"center",gap:6},
  tabBadge:{borderRadius:20,color:"#0b1220",fontSize:11,fontWeight:700,padding:"1px 7px"},
  opGrid:{display:"flex",flexDirection:"column",gap:10,marginBottom:24},
  opCard:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"16px 18px",transition:"all 0.2s"},
  opTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12},
  opCode:{fontSize:11,fontWeight:700,color:"#8899aa",letterSpacing:1,marginBottom:4},
  opLabel:{fontSize:14,fontWeight:600,color:"#e8edf5"},
  opNote:{fontSize:11,color:"#8899aa",marginTop:4,fontStyle:"italic"},
  criteresBlock:{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:"12px 14px"},
  criteresTitle:{fontSize:12,fontWeight:700,color:"#F97316",marginBottom:10,letterSpacing:0.3},
  criteresGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))",gap:10},
  criteresField:{display:"flex",flexDirection:"column",gap:5},
  toggleBtn:{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#e8edf5",fontSize:13,fontWeight:600,padding:"7px 14px",cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s",flexShrink:0},
  opInputRow:{display:"flex",alignItems:"center",gap:10,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap"},
  opInputLabel:{fontSize:12,color:"#8899aa",flexShrink:0},
  opInput:{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 12px",color:"#e8edf5",fontSize:14,fontWeight:600,width:90,outline:"none"},
  cumacChip:{background:"rgba(129,140,248,0.15)",border:"1px solid rgba(129,140,248,0.3)",borderRadius:8,color:"#818CF8",fontWeight:700,fontSize:13,padding:"5px 12px"},
  primePill:{borderRadius:8,color:"#0b1220",fontWeight:800,fontSize:14,padding:"6px 14px"},
  stickyFooter:{position:"fixed",bottom:0,left:0,right:0,background:"rgba(11,18,32,0.95)",borderTop:"1px solid rgba(45,212,191,0.2)",backdropFilter:"blur(12px)",padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:100,gap:16},
  footerLeft:{display:"flex",flexDirection:"column",gap:2},
  footerCount:{fontSize:12,color:"#8899aa"},
  footerTotal:{fontSize:16,color:"#e8edf5"},
  ctaBtn:{background:"linear-gradient(135deg,#2DD4BF,#0ea5e9)",border:"none",borderRadius:12,color:"#0b1220",fontSize:15,fontWeight:800,padding:"12px 28px",cursor:"pointer",letterSpacing:0.3,whiteSpace:"nowrap"},
  ctaBtnDisabled:{opacity:0.4,cursor:"not-allowed"},
  resultHeader:{display:"flex",alignItems:"center",gap:16,marginBottom:28},
  backBtn:{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#8899aa",fontSize:13,fontWeight:600,padding:"7px 14px",cursor:"pointer"},
  resultCard:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:32,marginBottom:24},
  resultTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,gap:20,flexWrap:"wrap"},
  resultLabel:{fontSize:11,color:"#8899aa",letterSpacing:1,textTransform:"uppercase",marginBottom:2},
  resultName:{fontSize:22,fontWeight:800,color:"#f0f4ff",marginBottom:8},
  resultSub:{fontSize:15,color:"#b0c0d0"},
  resultMeta:{display:"flex",flexDirection:"column",gap:8,textAlign:"right"},
  resultMetaItem:{display:"flex",gap:12,justifyContent:"flex-end",fontSize:13,color:"#8899aa"},
  table:{width:"100%",borderCollapse:"collapse",marginBottom:24},
  th:{textAlign:"left",fontSize:11,fontWeight:700,color:"#8899aa",letterSpacing:1,textTransform:"uppercase",padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,0.08)"},
  tr:{borderBottom:"1px solid rgba(255,255,255,0.05)"},
  td:{padding:"14px 12px",fontSize:14,color:"#e8edf5"},
  codeChip:{borderRadius:6,fontSize:11,fontWeight:700,padding:"3px 8px",letterSpacing:0.5},
  totalRow:{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(45,212,191,0.08)",border:"1px solid rgba(45,212,191,0.25)",borderRadius:14,padding:"18px 24px",marginBottom:16,flexWrap:"wrap",gap:12},
  totalLabel:{fontSize:11,fontWeight:700,color:"#2DD4BF",letterSpacing:1,marginBottom:4},
  totalAmount:{fontSize:32,fontWeight:900,color:"#2DD4BF"},
  calcDetail:{background:"rgba(129,140,248,0.06)",border:"1px solid rgba(129,140,248,0.2)",borderRadius:12,padding:"14px 18px",marginBottom:16},
  calcDetailTitle:{fontSize:13,fontWeight:700,color:"#818CF8",marginBottom:8},
  calcDetailText:{fontSize:12,color:"#b0c0d0",lineHeight:1.7},
  disclaimer:{fontSize:12,color:"#8899aa",lineHeight:1.6,padding:"12px 16px",background:"rgba(255,255,255,0.03)",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)"},
  actions:{display:"flex",gap:12,justifyContent:"flex-end"},
  actionBtn:{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,color:"#e8edf5",fontSize:14,fontWeight:600,padding:"11px 20px",cursor:"pointer"},
  actionBtnPrimary:{background:"linear-gradient(135deg,#2DD4BF,#0ea5e9)",border:"none",color:"#0b1220"},
};
