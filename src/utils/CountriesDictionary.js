// ==============================
// 🌍 CountriesDictionary.js
// Mapeia nomes comuns <-> backend <-> GeoJSON
// ==============================

// 🔹 Backend espera nomes oficiais (ex: "Russian Federation")
// ==============================
// 🌍 CountriesDictionary.js
// Nome comum → backend → GeoJSON
// ==============================

export const COMMON_TO_BACKEND = {
  // === Ásia ===
  China: "China",
  "People's Republic of China": "China",

  "South Korea": "Korea, Rep.",
  "Republic of Korea": "Korea, Rep.",

  "North Korea": "Korea, Dem. People's Rep.",
  "Dem. Rep. Korea": "Korea, Dem. People's Rep.",
  "Democratic People's Republic of Korea": "Korea, Dem. People's Rep.",
  "Korea, Dem. People's Rep.": "Korea, Dem. People's Rep.", // <- mantém o ponto final

  Iran: "Iran, Islamic Rep.",
  Vietnam: "Viet Nam",
  Syria: "Syrian Arab Republic",
  Laos: "Lao PDR",
  Kyrgyzstan: "Kyrgyz Republic",
  Turkey: "Turkiye",
  Yemen: "Yemen, Rep.",

  // === África ===
  Egypt: "Egypt, Arab Rep.",
  "Central African Rep.": "Central African Republic",
  "Dem. Rep. Congo": "Congo, Dem. Rep.",
  Congo: "Congo, Rep.",
  "Côte d'Ivoire": "Cote d'Ivoire",
  Gambia: "Gambia, The",
  eSwatini: "Eswatini",
  "S. Sudan": "South Sudan",
  Somaliland: "Somalia",
  "Solomon Is.": "Solomon Islands",

  // === Europa ===
  Russia: "Russian Federation",
  Slovakia: "Slovak Republic",
  Macedonia: "North Macedonia",
  "The Republic of North Macedonia": "North Macedonia",
  "Bosnia and Herz.": "Bosnia and Herzegovina",

  // === Américas ===
  "United States": "United States of America",
  "Dominican Rep.": "Dominican Republic",
  Venezuela: "Venezuela, RB",
};

// 🔹 GeoJSON usa nomes mais curtos (ex: "Russia")
export const COMMON_TO_GEOJSON = {
  China: "China",
  Russia: "Russia",
  "United States": "United States of America",
  "South Korea": "Korea, Republic of",
  "North Korea": "North Korea",
  "Korea, Dem. People's Rep.": "North Korea",
  "Democratic People's Republic of Korea": "North Korea",

  Iran: "Iran",
  Vietnam: "Vietnam",
  "Congo (Kinshasa)": "Democratic Republic of the Congo",
  "Congo (Brazzaville)": "Republic of the Congo",
  Egypt: "Egypt",
  Syria: "Syria",
  Laos: "Laos",
  "Central African Republic": "Central African Rep.",
};

// 🔹 Inversos (para exibir nomes amigáveis)
export const BACKEND_TO_COMMON = Object.fromEntries(
  Object.entries(COMMON_TO_BACKEND).map(([common, backend]) => [
    backend,
    common,
  ])
);
export const GEOJSON_TO_COMMON = Object.fromEntries(
  Object.entries(COMMON_TO_GEOJSON).map(([common, geojson]) => [
    geojson,
    common,
  ])
);

// ==============================
// 🧠 Funções utilitárias
// ==============================

// ==============================
// 🧠 Funções utilitárias
// ==============================

export function normalizeCountryName(name) {
  // normaliza pra formato do backend
  return COMMON_TO_BACKEND[name] || name;
}

export function getDisplayName(name) {
  // backend → nome comum pra UI
  const entry = Object.entries(COMMON_TO_BACKEND).find(
    ([common, backend]) => backend === name
  );
  return entry ? entry[0] : name;
}

// para o GeoJSON, mantemos o nome "comum"
export function getGeoJsonName(name) {
  return (
    {
      "Korea, Rep.": "South Korea",
      "Korea, Dem. People's Rep.": "North Korea",
      "Congo, Dem. Rep.": "Dem. Rep. Congo",
      "Congo, Rep.": "Congo",
      "Cote d'Ivoire": "Côte d'Ivoire",
      "Egypt, Arab Rep.": "Egypt",
      "Iran, Islamic Rep.": "Iran",
      "Lao PDR": "Laos",
      "Yemen, Rep.": "Yemen",
      "Gambia, The": "Gambia",
      "Venezuela, RB": "Venezuela",
      Turkiye: "Turkey",
      "Korea, Dem. People's Rep": "North Korea",
      "Dem. Rep. Korea": "North Korea",
    }[name] || name
  );
}
