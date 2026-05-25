import { useStockCategoryProducts } from "./useStockCategoryProducts";

/**
 * For routed admin product pages: fetch list + CRUD unless parent injects `items` prop.
 * @param {string} categoryKey — key of CATEGORY_IDS in useProductCRUD
 * @param {object} props — component props
 * @param {string} itemsPropName — e.g. "ram", "storage"
 */
export function useStockProductRouteProps(categoryKey, props, itemsPropName) {
  const hasInjected = props[itemsPropName] !== undefined;
  const {
    items: fetchedItems,
    loading,
    createProduct: hookCreate,
    updateProduct: hookUpdate,
  } = useStockCategoryProducts(categoryKey, { skip: hasInjected });

  return {
    items: hasInjected ? props[itemsPropName] : fetchedItems,
    parentLoading: hasInjected ? props.loading ?? false : loading,
    createProduct: props.createProduct ?? hookCreate,
    updateProduct: props.updateProduct ?? hookUpdate,
  };
}
