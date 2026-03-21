import React, { useState } from "react";

import logoRoccat from "../../assets/images/logo/logo_roccat.svg";
import logoMsi from "../../assets/images/logo/logo_msi.svg";
import logoRazer from "../../assets/images/logo/logo_razer.svg";
import logoThermaltake from "../../assets/images/logo/logo_thermaltake.svg";
import logoAdata from "../../assets/images/logo/logo_adata.svg";
import logoHp from "../../assets/images/logo/logo_hp.svg";
import logoGigabyte from "../../assets/images/logo/logo_gigabytes.svg";
import { useTranslation } from 'react-i18next';

const brands = [
  { name: "ROCCAT", img: logoRoccat },
  { name: "MSI", img: logoMsi },
  { name: "Razer", img: logoRazer },
  { name: "Thermaltake", img: logoThermaltake },
  { name: "ADATA", img: logoAdata },
  { name: "Hewlett Packard", img: logoHp },
  { name: "GIGABYTE", img: logoGigabyte },
];

function BrandLogoButton({ brand, onSelect }) {
  const [broken, setBroken] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(brand.name)}
      className="flex items-center justify-center border border-transparent hover:border-violet-200 rounded-md p-2 bg-white transition min-h-[48px]"
    >
      {broken ? (
        <span className="text-[11px] font-semibold text-violet-700 text-center leading-tight px-1">
          {brand.name}
        </span>
      ) : (
        <img
          src={brand.img}
          alt=""
          className="max-h-10 object-contain"
          onError={() => setBroken(true)}
        />
      )}
    </button>
  );
}

export default function BrandFilter({ allProducts, onSelectBrand }) {
  const { t } = useTranslation();

  // Hàm filter sản phẩm theo tên brand
  const handleBrandSelect = (brandName) => {
    if (!brandName) {
      // Nếu chọn "All Brands" thì trả hết sản phẩm
      onSelectBrand(allProducts);
    } else {
      const filtered = allProducts.filter(
        (product) => product.brandName === brandName
      );
      onSelectBrand(filtered);
    }
  };

  return (
    <div className="bg-[#f6f8ff] p-4 rounded-md">
      <h2 className="text-xl font-bold mb-4 text-center">{t('brand.brands')}</h2>

      <button
        onClick={() => handleBrandSelect(null)}
        className="w-full border border-gray-400 text-gray-400 font-semibold py-2 rounded-full mb-4"
      >
        {t('brand.all_brands')}
      </button>

      <div className="grid grid-cols-2 gap-4">
        {brands.map((brand) => (
          <BrandLogoButton key={brand.name} brand={brand} onSelect={handleBrandSelect} />
        ))}
      </div>
    </div>
  );
}

// Updated: 2025-10-12T16:06:37.030Z

// Updated: 2025-10-12T16:09:00.599Z
