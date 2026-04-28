/**
 * Navigation data constants — Category IDs and menu structure.
 * Shared between HeaderMegaMenu and HeaderMobileMenu.
 */

export const CATEGORY_IDS = {
  laptop:     [45, 46, 47, 48, 49, 50, 51],
  mouse:      [6, 7, 8, 9, 10],
  keyboard:   [1, 2, 3, 4, 5],
  gamingGear: [14, 15, 16],
  mousePad:   [11, 12, 13],
  headphone:  [42, 43],
  monitor:    [36, 37, 38, 39],
  case:       [17],
  cpu:        [18, 19],
  mainboard:  [20, 21, 22],
  psu:        [23, 24, 25, 26],
  storage:    [27, 28, 29],
  ram:        [30, 31, 32],
  phone:      [52, 53, 54],
  tablet:     [44],
  pc:         [40, 41],
};

/**
 * Build mega menu sections from translation keys.
 * Returns array of { titleKey, items: [{ list, brand?, labelKey }] }
 */
export const getMegaMenuSections = () => [
  {
    titleKey: "categories.laptops",
    items: [
      { list: CATEGORY_IDS.laptop, labelKey: "categories.allLaptops" },
    ],
  },
  {
    titleKey: "categories.gamingGear",
    items: [
      { list: CATEGORY_IDS.mouse, labelKey: "categories.mouse" },
      { list: CATEGORY_IDS.keyboard, labelKey: "categories.keyboard" },
      { list: CATEGORY_IDS.gamingGear, labelKey: "categories.gameGear" },
      { list: CATEGORY_IDS.mousePad, labelKey: "categories.mousePad" },
      { list: CATEGORY_IDS.headphone, labelKey: "categories.headphone" },
    ],
  },
  {
    titleKey: "categories.pcParts",
    items: [
      { list: CATEGORY_IDS.monitor, labelKey: "categories.monitor" },
      { list: CATEGORY_IDS.case, labelKey: "categories.case" },
      { list: CATEGORY_IDS.cpu, labelKey: "categories.cpu" },
      { list: CATEGORY_IDS.mainboard, labelKey: "categories.mainboard" },
      { list: CATEGORY_IDS.psu, labelKey: "categories.psu" },
      { list: CATEGORY_IDS.storage, labelKey: "categories.storage" },
      { list: CATEGORY_IDS.ram, labelKey: "categories.ram" },
    ],
  },
  {
    titleKey: "categories.smartDevice",
    items: [
      { list: CATEGORY_IDS.phone, brand: "iPhone", labelKey: "categories.iphone" },
      { list: CATEGORY_IDS.phone, brand: "Samsung", labelKey: "categories.samsung" },
      { list: CATEGORY_IDS.phone, brand: "Xiaomi", labelKey: "categories.xiaomi" },
      { list: CATEGORY_IDS.tablet, labelKey: "categories.ipad" },
    ],
  },
];

/** Support menu items */
export const getSupportLinks = () => [
  { to: "/track-order", labelKey: "support.trackOrder" },
  { to: "/faq",         labelKey: "support.faq" },
  { to: "/contact",     labelKey: "support.contactUs" },
  { to: "/warranty",    labelKey: "support.warranty" },
  { to: "/returns",     labelKey: "support.returns" },
];
