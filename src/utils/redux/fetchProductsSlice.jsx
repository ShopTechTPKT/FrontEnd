import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../custom/axios';

/**
 * fetchProducts — fetches all products from the real API.
 * Previously used MockProductService; now uses axiosInstance.
 */
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await axiosInstance.get('/products');
    const data = response.data?.result || response.data || [];
    const items = Array.isArray(data) ? data : [];
    return items.map((item) => ({
      ...item,
      inStock: (item.stock ?? item.stockQuantity ?? item.quantity ?? 1) > 0,
    }));
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export default productsSlice.reducer;
