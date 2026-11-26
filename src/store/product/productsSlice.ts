import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductDTO } from "../../dto/product";
import { CategoryDTO } from "../../dto/common";

interface ProductState {
  products: ProductDTO[];
  categories: CategoryDTO[];
}

const initialState: ProductState = {
  products: [],
  categories: [],
};

const productsSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<ProductDTO[]>) => {
      state.products = action.payload;
    },
    setCategories: (state, action: PayloadAction<CategoryDTO[]>) => {
      state.categories = action.payload;
    },
    addProduct: (state, action: PayloadAction<ProductDTO>) => {
      state.products.unshift(action.payload);
    },
    updateProduct: (state, action: PayloadAction<ProductDTO>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<number>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
  },
});

export const {
  setProducts,
  setCategories,
  addProduct,
  updateProduct,
  deleteProduct,
} = productsSlice.actions;

export default productsSlice.reducer;