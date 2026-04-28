/**
 * pcBuilderApi.jsx
 * API wrapper for PC Builder feature.
 * Falls back to rich mock data when backend endpoints are unavailable.
 */
import axiosInstance from "../custom/axios";

// ── Component categories ──────────────────────────────────────
export const PC_CATEGORIES = [
  { id: "cpu",       label: "CPU",          iconKey: "cpu",      required: true,  wattBase: 65  },
  { id: "mainboard", label: "Mainboard",    iconKey: "mainboard",required: true,  wattBase: 30  },
  { id: "ram",       label: "RAM",          iconKey: "ram",      required: true,  wattBase: 10  },
  { id: "gpu",       label: "GPU",          iconKey: "gpu",      required: false, wattBase: 150 },
  { id: "storage",   label: "SSD / HDD",   iconKey: "storage",  required: true,  wattBase: 5   },
  { id: "psu",       label: "PSU",          iconKey: "psu",      required: true,  wattBase: 0   },
  { id: "case",      label: "Case",         iconKey: "case",     required: true,  wattBase: 0   },
  { id: "cooler",    label: "Tản Nhiệt",    iconKey: "cooler",   required: false, wattBase: 5   },
  { id: "monitor",   label: "Màn Hình",     iconKey: "monitor",  required: false, wattBase: 35  },
];

// ── Mock component data ───────────────────────────────────────
const MOCK_COMPONENTS = {
  cpu: [
    { id: "cpu1", name: "Intel Core i5-13600K", brand: "Intel", price: 7_200_000, specs: "14 nhân / 20 luồng / 5.1GHz", watt: 125, socket: "LGA1700", image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/intel.svg", badge: "Best Value" },
    { id: "cpu2", name: "Intel Core i7-14700K", brand: "Intel", price: 11_500_000, specs: "20 nhân / 28 luồng / 5.6GHz", watt: 125, socket: "LGA1700", image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/intel.svg", badge: "Best Seller" },
    { id: "cpu3", name: "AMD Ryzen 5 7600X",    brand: "AMD",   price: 7_000_000, specs: "6 nhân / 12 luồng / 5.3GHz",  watt: 105, socket: "AM5",     image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amd.svg" },
    { id: "cpu4", name: "AMD Ryzen 7 7700X",    brand: "AMD",   price: 9_500_000, specs: "8 nhân / 16 luồng / 5.4GHz",  watt: 105, socket: "AM5",     image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amd.svg" },
    { id: "cpu5", name: "Intel Core i9-14900K", brand: "Intel", price: 18_000_000, specs: "24 nhân / 32 luồng / 6.0GHz", watt: 253, socket: "LGA1700", image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/intel.svg" },
  ],
  mainboard: [
    { id: "mb1", name: "ASUS ROG STRIX B760-F", brand: "ASUS", price: 6_500_000, specs: "ATX / DDR5 / WiFi 6E", watt: 0, socket: "LGA1700", image: "", badge: "Best Seller" },
    { id: "mb2", name: "MSI MAG X670E TOMAHAWK", brand: "MSI", price: 8_200_000, specs: "ATX / DDR5 / WiFi 6", watt: 0, socket: "AM5", image: "" },
    { id: "mb3", name: "Gigabyte B760M DS3H",  brand: "Gigabyte", price: 3_200_000, specs: "mATX / DDR4", watt: 0, socket: "LGA1700", image: "", badge: "Best Value" },
    { id: "mb4", name: "ASUS TUF GAMING X670E", brand: "ASUS", price: 9_000_000, specs: "ATX / DDR5 / WiFi 6E", watt: 0, socket: "AM5", image: "" },
  ],
  ram: [
    { id: "ram1", name: "Corsair Vengeance DDR5-5600 16GB", brand: "Corsair", price: 2_200_000, specs: "16GB (2×8) / DDR5 / 5600MHz", watt: 10, image: "", badge: "Best Value" },
    { id: "ram2", name: "Kingston Fury Beast DDR5-6000 32GB", brand: "Kingston", price: 4_500_000, specs: "32GB (2×16) / DDR5 / 6000MHz", watt: 10, image: "", badge: "Best Seller" },
    { id: "ram3", name: "G.Skill Trident Z5 DDR5-6400 32GB", brand: "G.Skill", price: 5_800_000, specs: "32GB (2×16) / DDR5 / 6400MHz", watt: 10, image: "" },
    { id: "ram4", name: "Corsair Vengeance DDR4-3600 16GB", brand: "Corsair", price: 1_500_000, specs: "16GB (2×8) / DDR4 / 3600MHz", watt: 8, image: "" },
  ],
  gpu: [
    { id: "gpu1", name: "NVIDIA RTX 4060 8GB", brand: "NVIDIA", price: 9_500_000, specs: "8GB GDDR6 / 128-bit / 165W", watt: 115, image: "", badge: "Best Value" },
    { id: "gpu2", name: "NVIDIA RTX 4070 12GB", brand: "NVIDIA", price: 15_000_000, specs: "12GB GDDR6X / 192-bit / 200W", watt: 200, image: "", badge: "Best Seller" },
    { id: "gpu3", name: "NVIDIA RTX 4080 Super 16GB", brand: "NVIDIA", price: 28_000_000, specs: "16GB GDDR6X / 256-bit / 320W", watt: 320, image: "" },
    { id: "gpu4", name: "AMD RX 7600 8GB", brand: "AMD", price: 7_200_000, specs: "8GB GDDR6 / 128-bit / 165W", watt: 165, image: "" },
    { id: "gpu5", name: "AMD RX 7900 XT 20GB", brand: "AMD", price: 22_000_000, specs: "20GB GDDR6 / 320-bit / 315W", watt: 315, image: "" },
  ],
  storage: [
    { id: "ssd1", name: "Samsung 980 Pro 1TB", brand: "Samsung", price: 2_800_000, specs: "NVMe PCIe 4.0 / 7000MB/s Read", watt: 5, image: "", badge: "Best Seller" },
    { id: "ssd2", name: "WD Black SN850X 2TB", brand: "WD", price: 4_500_000, specs: "NVMe PCIe 4.0 / 7300MB/s Read", watt: 5, image: "" },
    { id: "ssd3", name: "Kingston NV2 1TB", brand: "Kingston", price: 1_200_000, specs: "NVMe PCIe 4.0 / 3500MB/s Read", watt: 4, image: "", badge: "Best Value" },
    { id: "ssd4", name: "Seagate Barracuda 2TB HDD", brand: "Seagate", price: 1_400_000, specs: "SATA 3 / 5400RPM / 256MB Cache", watt: 6, image: "" },
  ],
  psu: [
    { id: "psu1", name: "Corsair RM750e 750W", brand: "Corsair", price: 2_500_000, specs: "750W / 80+ Gold / Full Modular", watt: 0, image: "", badge: "Best Seller" },
    { id: "psu2", name: "Seasonic Focus GX-850 850W", brand: "Seasonic", price: 3_200_000, specs: "850W / 80+ Gold / Full Modular", watt: 0, image: "" },
    { id: "psu3", name: "Cooler Master MWE 650W", brand: "Cooler Master", price: 1_800_000, specs: "650W / 80+ Bronze / Semi Modular", watt: 0, image: "", badge: "Best Value" },
    { id: "psu4", name: "ASUS ROG Thor 1000W", brand: "ASUS", price: 6_500_000, specs: "1000W / 80+ Platinum / Full Modular", watt: 0, image: "" },
  ],
  case: [
    { id: "case1", name: "Lian Li PC-O11 Dynamic", brand: "Lian Li", price: 3_500_000, specs: "Mid Tower / Kính cường lực / E-ATX", watt: 0, image: "", badge: "Best Seller" },
    { id: "case2", name: "NZXT H7 Flow", brand: "NZXT", price: 3_200_000, specs: "Mid Tower / ATX / Airflow", watt: 0, image: "" },
    { id: "case3", name: "Corsair 4000D Airflow", brand: "Corsair", price: 2_800_000, specs: "Mid Tower / ATX / High Airflow", watt: 0, image: "", badge: "Best Value" },
    { id: "case4", name: "Fractal Design Define 7", brand: "Fractal Design", price: 4_200_000, specs: "Full Tower / E-ATX / Silent", watt: 0, image: "" },
  ],
  cooler: [
    { id: "cool1", name: "Noctua NH-D15", brand: "Noctua", price: 2_200_000, specs: "Air / Dual Tower / 250W TDP", watt: 5, image: "", badge: "Best Seller" },
    { id: "cool2", name: "Corsair iCUE H150i Elite 360mm", brand: "Corsair", price: 4_500_000, specs: "AIO / 360mm / RGB", watt: 18, image: "" },
    { id: "cool3", name: "DeepCool AK620", brand: "DeepCool", price: 1_500_000, specs: "Air / Dual Tower / 260W TDP", watt: 5, image: "", badge: "Best Value" },
    { id: "cool4", name: "NZXT Kraken X63 280mm", brand: "NZXT", price: 3_800_000, specs: "AIO / 280mm / RGB", watt: 15, image: "" },
  ],
  monitor: [
    { id: "mon1", name: "ASUS TUF Gaming VG27AQ 27\"", brand: "ASUS", price: 7_500_000, specs: "27\" / IPS / 1440p / 165Hz / G-Sync", watt: 35, image: "", badge: "Best Seller" },
    { id: "mon2", name: "MSI G274QPX 27\"", brand: "MSI", price: 8_500_000, specs: "27\" / IPS / 1440p / 240Hz", watt: 40, image: "" },
    { id: "mon3", name: "LG 27GP850-B 27\"", brand: "LG", price: 6_800_000, specs: "27\" / Nano IPS / 1440p / 165Hz", watt: 35, image: "", badge: "Best Value" },
    { id: "mon4", name: "Samsung Odyssey G7 32\"", brand: "Samsung", price: 12_000_000, specs: "32\" / VA / 4K / 144Hz / Curved", watt: 50, image: "" },
  ],
};

// ── Preset builds ──────────────────────────────────────────────
export const PRESET_BUILDS = [
  {
    id: "entry",
    name: "Gaming Entry",
    description: "Chiến mọi game 1080p / 60–100fps",
    totalPrice: 16_800_000,
    color: "from-green-500 to-emerald-600",
    badge: "Tiết kiệm nhất",
    components: { cpu: "cpu1", mainboard: "mb3", ram: "ram4", gpu: "gpu1", storage: "ssd3", psu: "psu3", case: "case3", cooler: "cool3" },
  },
  {
    id: "mid",
    name: "Gaming Mid",
    description: "1440p / 144fps – Hiệu năng tốt nhất trong tầm giá",
    totalPrice: 28_500_000,
    color: "from-blue-500 to-violet-600",
    badge: "Phổ biến nhất",
    components: { cpu: "cpu2", mainboard: "mb1", ram: "ram1", gpu: "gpu2", storage: "ssd1", psu: "psu1", case: "case3", cooler: "cool1", monitor: "mon1" },
  },
  {
    id: "high",
    name: "Gaming High-End",
    description: "4K / 144fps – Không thỏa hiệp",
    totalPrice: 52_000_000,
    color: "from-violet-600 to-violet-700",
    badge: "Hiệu năng cao",
    components: { cpu: "cpu2", mainboard: "mb1", ram: "ram2", gpu: "gpu3", storage: "ssd2", psu: "psu2", case: "case1", cooler: "cool2", monitor: "mon2" },
  },
  {
    id: "workstation",
    name: "Workstation Pro",
    description: "Render / 3D / AI – Dành cho người làm chuyên nghiệp",
    totalPrice: 65_000_000,
    color: "from-amber-500 to-orange-600",
    badge: "Chuyên nghiệp",
    components: { cpu: "cpu5", mainboard: "mb2", ram: "ram3", gpu: "gpu5", storage: "ssd2", psu: "psu4", case: "case4", cooler: "cool2", monitor: "mon4" },
  },
];

// ── API functions ──────────────────────────────────────────────

/**
 * Get components by category from backend or fall back to mock.
 */
export const getComponentsByCategory = async (categoryId) => {
  try {
    const res = await axiosInstance.get(`/products?categorySlug=${categoryId}&limit=20`);
    if (res.data?.DT?.length) {
      return res.data.DT.map((p) => ({
        id: p.productID || p.id,
        name: p.productName || p.name,
        brand: p.brandName || p.brand || "",
        price: p.price || p.unitPrice || 0,
        specs: p.seriesName || p.description?.slice(0, 60) || "",
        watt: 0,
        image: p.image || p.imageUrl || "",
        badge: null,
      }));
    }
  } catch {
    // fallthrough to mock
  }
  return MOCK_COMPONENTS[categoryId] || [];
};

/**
 * Get all components at once (for initial load).
 */
export const getAllComponents = async () => {
  const result = {};
  for (const cat of PC_CATEGORIES) {
    result[cat.id] = await getComponentsByCategory(cat.id);
  }
  return result;
};

/**
 * Simple compatibility checker — warns on known incompatibilities.
 * Returns array of warning strings.
 */
export const checkCompatibility = (selected, allComponents) => {
  const warnings = [];
  const get = (catId) => {
    const id = selected[catId];
    if (!id) return null;
    return (allComponents[catId] || []).find((c) => c.id === id);
  };

  const cpu = get("cpu");
  const mb = get("mainboard");

  // Socket compatibility
  if (cpu && mb) {
    const cpuSocket = cpu.socket;
    const mbSocket = mb.socket;
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      warnings.push(`⚠️ CPU socket ${cpuSocket} không tương thích với Mainboard socket ${mbSocket}`);
    }
  }

  // PSU wattage check
  const psu = get("psu");
  if (psu) {
    const totalWatt = PC_CATEGORIES.reduce((sum, cat) => {
      const comp = get(cat.id);
      return sum + (comp?.watt || cat.wattBase || 0);
    }, 0);
    const psuWatt = parseInt(psu.name?.match(/(\d{3,4})W/)?.[1] || 0);
    if (psuWatt > 0 && totalWatt > psuWatt * 0.85) {
      warnings.push(`⚡ PSU ${psuWatt}W có thể không đủ cho cấu hình này (ước tính ${totalWatt}W). Khuyến nghị tối thiểu ${Math.ceil(totalWatt / 0.8 / 50) * 50}W.`);
    }
  }

  return warnings;
};

/**
 * Calculate total estimated wattage.
 */
export const calcTotalWatt = (selected, allComponents) => {
  let total = 0;
  for (const cat of PC_CATEGORIES) {
    const id = selected[cat.id];
    if (id) {
      const comp = (allComponents[cat.id] || []).find((c) => c.id === id);
      total += comp?.watt || cat.wattBase || 0;
    }
  }
  return total;
};

/**
 * Get preset builds.
 */
export const getPresetBuilds = () => PRESET_BUILDS;

/**
 * Resolve a preset into full component objects.
 */
export const resolvePreset = (preset, allComponents) => {
  const resolved = {};
  for (const [catId, compId] of Object.entries(preset.components)) {
    const comp = (allComponents[catId] || []).find((c) => c.id === compId);
    if (comp) resolved[catId] = comp;
  }
  return resolved;
};
