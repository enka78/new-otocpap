"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase, Category, Brand } from "@/lib/supabase";

interface CategoriesAndBrandsContextType {
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  clearCache: () => void;
}

const CategoriesAndBrandsContext = createContext<
  CategoriesAndBrandsContextType | undefined
>(undefined);

interface CategoriesAndBrandsProviderProps {
  children: ReactNode;
}

export function CategoriesAndBrandsProvider({
  children,
}: CategoriesAndBrandsProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if data exists in localStorage first
      const cachedCategories = localStorage.getItem("otocpap_categories");
      const cachedBrands = localStorage.getItem("otocpap_brands");
      const cacheTimestamp = localStorage.getItem(
        "otocpap_categories_brands_timestamp"
      );

      // Cache for 5 minutes
      const CACHE_DURATION = 5 * 60 * 1000;
      const now = Date.now();

      if (cachedCategories && cachedBrands && cacheTimestamp) {
        const timestamp = parseInt(cacheTimestamp);
        if (now - timestamp < CACHE_DURATION) {
          console.log("Using cached categories and brands");
          setCategories(JSON.parse(cachedCategories));
          setBrands(JSON.parse(cachedBrands));
          setLoading(false);
          return;
        }
      }

      console.log("Fetching fresh categories and brands data");

      // Fetch fresh data from Supabase
      const [categoriesResult, brandsResult] = await Promise.all([
        supabase
          .from("categories")
          .select("*")
          .order("order", { ascending: true }),
        supabase.from("brands").select("*").order("order", { ascending: true }),
      ]);

      console.log("Categories query result:", categoriesResult);
      console.log("Brands query result:", brandsResult);

      if (categoriesResult.error) {
        throw new Error(`Categories error: ${categoriesResult.error.message}`);
      }

      if (brandsResult.error) {
        throw new Error(`Brands error: ${brandsResult.error.message}`);
      }

      const categoriesData = categoriesResult.data || [];
      const brandsData = brandsResult.data || [];

      // Update state
      setCategories(categoriesData as unknown as Category[]);
      setBrands(brandsData as unknown as Brand[]);

      // Cache the data
      localStorage.setItem(
        "otocpap_categories",
        JSON.stringify(categoriesData)
      );
      localStorage.setItem("otocpap_brands", JSON.stringify(brandsData));
      localStorage.setItem(
        "otocpap_categories_brands_timestamp",
        now.toString()
      );

      console.log("Categories and brands cached successfully");
    } catch (err) {
      console.error("Error fetching categories and brands:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    // Clear cache and fetch fresh data
    localStorage.removeItem("otocpap_categories");
    localStorage.removeItem("otocpap_brands");
    localStorage.removeItem("otocpap_categories_brands_timestamp");
    await fetchData();
  };

  const clearCache = () => {
    localStorage.removeItem("otocpap_categories");
    localStorage.removeItem("otocpap_brands");
    localStorage.removeItem("otocpap_categories_brands_timestamp");
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value: CategoriesAndBrandsContextType = {
    categories,
    brands,
    loading,
    error,
    refreshData,
    clearCache,
  };

  return (
    <CategoriesAndBrandsContext.Provider value={value}>
      {children}
    </CategoriesAndBrandsContext.Provider>
  );
}

export function useCategoriesAndBrands() {
  const context = useContext(CategoriesAndBrandsContext);
  if (context === undefined) {
    throw new Error(
      "useCategoriesAndBrands must be used within a CategoriesAndBrandsProvider"
    );
  }
  return context;
}
