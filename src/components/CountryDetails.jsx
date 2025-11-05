import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import ReactCountryFlag from "react-country-flag";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { motion, AnimatePresence } from "framer-motion";

countries.registerLocale(enLocale);

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// paleta para múltiplos países comparados
const COLOR_PALETTE = [
  "#2563eb",
  "#f97316",
  "#40da78ff",
  "#9333ea",
  "#dc2626",
  "#d2f700ff",
  "#2a6111ff",
  "#03ebfcff",
  "#fc03a9ff",
  "#000000ff",
];

export default function CountryDetails({ country, indicator, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [compareCountries, setCompareCountries] = useState([]);
  const [compareData, setCompareData] = useState({});

  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);

  // ============================
  // 🔍 FILTRO DINÂMICO DE PAÍSES
  // ============================
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const all = Object.values(countries.getNames("en"));
      const matches = all
        .filter(
          (c) =>
            c.toLowerCase().includes(searchTerm.toLowerCase()) &&
            c !== country &&
            !compareCountries.includes(c)
        )
        .slice(0, 6);
      setFilteredCountries(matches);
    } else {
      setFilteredCountries([]);
    }
  }, [searchTerm, compareCountries, country]);

  // Fecha busca com ESC
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && setIsSearching(false);
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ============================
  // 📊 FETCH PRINCIPAL
  // ============================
  useEffect(() => {
    if (!country) return;
    setLoading(true);
    axios
      .get(
        `http://127.0.0.1:8000/data/all_data_merged?country=${encodeURIComponent(
          country
        )}&indicator=${encodeURIComponent(indicator)}`
      )
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setRows([data]);
      })
      .catch((err) => console.error("Error fetching main country:", err))
      .finally(() => setLoading(false));
  }, [country, indicator]);

  // ============================
  // 📊 FETCH COMPARAÇÕES
  // ============================
  useEffect(() => {
    compareCountries.forEach((c) => {
      if (compareData[c]) return; // já baixado
      axios
        .get(
          `http://127.0.0.1:8000/data/all_data_merged?country=${encodeURIComponent(
            c
          )}&indicator=${encodeURIComponent(indicator)}`
        )
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data[0] : res.data;
          setCompareData((prev) => ({ ...prev, [c]: data }));
        })
        .catch((err) => console.error(`Error fetching ${c}:`, err));
    });
  }, [compareCountries, indicator]);

  // ============================
  // ⚙️ UTILIDADES
  // ============================
  const getIso2 = (name) => {
    const a3 = countries.getAlpha3Code(name, "en");
    return a3 ? countries.alpha3ToAlpha2(a3) : null;
  };

  const extractSeries = (dataObj) => {
    if (!dataObj) return [];
    const regex = new RegExp(`^${indicator}_(\\d{4})$`);
    return Object.entries(dataObj)
      .filter(([k, v]) => regex.test(k) && v != null)
      .map(([k, v]) => ({
        year: k.match(regex)[1],
        value: Number(v),
      }))
      .sort((a, b) => a.year - b.year);
  };

  const mainSeries = useMemo(() => extractSeries(rows[0]), [rows, indicator]);

  const compareSeries = useMemo(() => {
    return compareCountries.map((name) => ({
      name,
      data: extractSeries(compareData[name]),
    }));
  }, [compareCountries, compareData, indicator]);

  const COLORS = COLOR_PALETTE;

  // ============================
  // 🧱 UI
  // ============================
  const open = !!country;

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal container={document.body}>
        {/* Overlay com fade */}
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9998] transition-opacity duration-300 data-[state=open]:opacity-100 data-[state=closed]:opacity-0" />

        {/* Conteúdo sempre centralizado */}
        <Dialog.Content
          aria-describedby="desc"
          className="fixed inset-0 flex items-center justify-center z-[9999] p-[4vh]"
        >
          {/* MODAL com animação de subida */}
          <motion.div
            initial={{ y: "5%", opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "5%", opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
            className="relative w-full h-full max-w-[1300px] max-h-[850px]
        bg-white rounded-3xl border border-slate-200/70
        shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)]
        overflow-hidden flex flex-col box-border"
          >
            {/* Botão Fechar */}
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="absolute top-5 right-5 z-[10000] flex items-center justify-center
            w-10 h-10 rounded-full bg-white text-slate-600 hover:text-slate-900
            border border-slate-200 shadow-sm transition-transform hover:scale-105"
              >
                ×
              </button>
            </Dialog.Close>

            {/* GRID PRINCIPAL */}
            <div className="grid grid-cols-[minmax(260px,30%)_1fr] flex-1 max-md:grid-cols-1 bg-gradient-to-br from-slate-50 to-white">
              {/* Painel esquerdo */}
              <aside className="p-6 flex flex-col gap-6 items-center max-md:py-8 relative">
                <h2 className="text-slate-500 uppercase tracking-wide font-semibold text-sm text-center">
                  {indicator.replaceAll("_", " ")}
                </h2>

                {/* Silhueta ou comparações */}
                <AnimatePresence mode="wait">
                  {compareCountries.length === 0 ? (
                    <motion.div
                      key="single"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="flex flex-col items-center gap-6"
                    >
                      {/* Bandeira + nome */}
                      <div className="flex items-center gap-3">
                        {getIso2(country) && (
                          <ReactCountryFlag
                            countryCode={getIso2(country)}
                            svg
                            style={{
                              width: "2em",
                              height: "2em",
                              borderRadius: "4px",
                              boxShadow: "0 0 4px rgba(0,0,0,0.1)",
                            }}
                          />
                        )}
                        <h1 className="text-slate-900 font-extrabold text-[clamp(16px,1.6vw,26px)] text-center break-words">
                          {country}
                        </h1>
                      </div>

                      {/* Silhueta */}
                      <div className="border border-slate-200 rounded-2xl h-[340px] w-[340px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-white overflow-hidden shadow-sm">
                        <ComposableMap
                          projection="geoEqualEarth"
                          projectionConfig={{ scale: 190 }}
                          width={340}
                          height={340}
                          style={{ width: "100%", height: "100%" }}
                        >
                          <Geographies geography={geoUrl}>
                            {({ geographies, path }) => {
                              const feature = geographies.find(
                                (g) => g.properties.name === country
                              );
                              if (!feature) return null;

                              const [[x0, y0], [x1, y1]] = path.bounds(feature);
                              const w = 320,
                                h = 320;
                              const scale =
                                0.9 * Math.min(w / (x1 - x0), h / (y1 - y0));
                              const cx = (x0 + x1) / 2,
                                cy = (y0 + y1) / 2;
                              const tx = 170 - scale * cx,
                                ty = 170 - scale * cy;

                              return (
                                <g
                                  transform={`translate(${tx},${ty}) scale(${scale})`}
                                >
                                  <Geography
                                    geography={feature}
                                    style={{
                                      default: {
                                        fill: "#2563eb",
                                        stroke: "#2563eb",
                                      },
                                      hover: { fill: "#2563eb" },
                                    }}
                                  />
                                </g>
                              );
                            }}
                          </Geographies>
                        </ComposableMap>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="multi"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        visible: {
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: {
                            duration: 0.25,
                            ease: "easeOut",
                            staggerChildren: 0.08,
                            delayChildren: 0.1,
                          },
                        },
                        hidden: { opacity: 0, scale: 0.95, y: 10 },
                      }}
                      className="flex flex-col items-center gap-3 w-[340px]"
                    >
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="w-full"
                      >
                        <CountryPill name={country} color={COLOR_PALETTE[0]} />
                      </motion.div>

                      {compareCountries.map((c, i) => (
                        <motion.div
                          key={c}
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="w-full"
                        >
                          <CountryPill
                            name={c}
                            color={
                              COLOR_PALETTE[(i + 1) % COLOR_PALETTE.length]
                            }
                            closable
                            onClose={() => {
                              setCompareCountries((prev) =>
                                prev.filter((x) => x !== c)
                              );
                              setCompareData((prev) => {
                                const copy = { ...prev };
                                delete copy[c];
                                return copy;
                              });
                            }}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botão / input de busca */}
                <div className="relative mt-4 w-[80%] flex justify-center">
                  {!isSearching ? (
                    <button
                      onClick={() => setIsSearching(true)}
                      className="px-6 py-2.5 rounded-full bg-[#134074] text-white text-sm font-medium shadow-sm transition hover:bg-[#0b2545] hover:scale-[1.03]"
                    >
                      Compare with other countries
                    </button>
                  ) : (
                    <div className="relative w-full flex flex-col items-center transition-all duration-300">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Type a country name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onBlur={() =>
                          setTimeout(() => setIsSearching(false), 150)
                        }
                        className="w-full px-4 py-2 rounded-full text-sm text-slate-800 border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#134074] bg-white placeholder:text-slate-400"
                      />
                      {filteredCountries.length > 0 && (
                        <ul className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {filteredCountries.map((c) => (
                            <li
                              key={c}
                              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                              onClick={() => {
                                setCompareCountries((prev) => [...prev, c]);
                                setSearchTerm("");
                                setFilteredCountries([]);
                                setIsSearching(false);
                              }}
                            >
                              {c}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </aside>

              {/* Painel direito */}
              <main className="p-8 flex flex-col min-w-0">
                <div className="rounded-2xl flex-1 bg-white border border-slate-200 p-5 relative min-h-[420px] shadow-sm">
                  {loading ? (
                    <div className="flex items-center justify-center h-full font-medium text-slate-500">
                      Loading data...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="year"
                          type="category"
                          allowDuplicatedCategory={false}
                          tick={{
                            fontWeight: 600,
                            fontSize: 12,
                            fill: "#334155",
                          }}
                          height={28}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{
                            fontWeight: 600,
                            fontSize: 12,
                            fill: "#334155",
                          }}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "13px",
                          }}
                        />
                        <Line
                          data={mainSeries}
                          dataKey="value"
                          type="monotone"
                          stroke={COLOR_PALETTE[0]}
                          strokeWidth={2.3}
                          dot={false}
                          name={country}
                        />
                        {compareSeries.map((s, i) => (
                          <Line
                            key={s.name}
                            data={s.data}
                            dataKey="value"
                            type="monotone"
                            stroke={
                              COLOR_PALETTE[(i + 1) % COLOR_PALETTE.length]
                            }
                            strokeWidth={2.3}
                            dot={false}
                            name={s.name}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </main>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// =========================
// COMPONENTE DE PÍLULA
// =========================
function CountryPill({ name, color, closable = false, onClose }) {
  const iso2 = (() => {
    const a3 = countries.getAlpha3Code(name, "en");
    return a3 ? countries.alpha3ToAlpha2(a3) : null;
  })();
  return (
    <div className="flex items-center justify-between w-full px-4 py-2 rounded-xl border border-slate-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3">
        {iso2 && (
          <ReactCountryFlag
            countryCode={iso2}
            svg
            style={{ width: "1.5em", height: "1.5em", borderRadius: "3px" }}
          />
        )}
        <span className="font-medium text-slate-700 text-sm">{name}</span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="w-3.5 h-3.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        {closable && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg leading-none"
            title="Remove comparison"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
