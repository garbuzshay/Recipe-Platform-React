import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RecipesApi from "../api/RecipesApi";

const RecipesContext = createContext();

export const RecipesProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialQuery = useMemo(() => searchParams.get("searchQuery") || "", [searchParams]);
  const initialPage = useMemo(() => parseInt(searchParams.get("page")) || 1, [searchParams]);
  const initialPageSize = useMemo(() => parseInt(searchParams.get("pageSize")) || 8, [searchParams]);

  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterOwnedRecipes, setFilterOwnedRecipes] = useState(false); // New state for filtering owned recipes

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recipes using searchQuery, page, pageSize, and filterOwnedRecipes
      const response = await RecipesApi.getRecipes({
        searchQuery,
        page,
        pageSize,
        filterOwnedRecipes
      });
      setRecipes(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      setError(error.message || "Error loading recipes");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page, pageSize, filterOwnedRecipes]);

  const memoizedFetchRecipes = useMemo(() => fetchRecipes, [fetchRecipes]);

  const updateSearchQuery = useCallback(
    (newQuery) => {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set("searchQuery", newQuery);
      newSearchParams.set("page", "1");
      navigate(`?${newSearchParams.toString()}`);
      setSearchQuery(newQuery);
      setPage(1);
    },
    [location.search, navigate]
  );

  
  const toggleFilterOwnedRecipes = useCallback(
    () => {
      setFilterOwnedRecipes((prev) => !prev);
      setPage(1);
    },
    []
  );
  const updatePage = useCallback(
    (newPage) => {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set("page", String(newPage));
      navigate(`?${newSearchParams.toString()}`);
      setPage(newPage);
    },
    [location.search, navigate]
  );

  const updatePageSize = useCallback(
    (newPageSize) => {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set("pageSize", String(newPageSize));
      navigate(`?${newSearchParams.toString()}`);
      setPageSize(newPageSize);
    },
    [location.search, navigate]
  );

  const editRecipe = useCallback(
    async (recipeId, updatedRecipe) => {
      try {
        setLoading(true);
        setError(null);
        await RecipesApi.updateRecipe(recipeId, updatedRecipe);
        await fetchRecipes();
      } catch (error) {
        setError(error.message || "Error editing recipe");
      } finally {
        setLoading(false);
      }
    },
    [fetchRecipes]
  );

  const deleteRecipe = useCallback(
    async (recipeId) => {
      try {
        setLoading(true);
        setError(null);
        await RecipesApi.deleteRecipe(recipeId);
        await fetchRecipes();
      } catch (error) {
        setError(error.message || "Error deleting recipe");
      } finally {
        setLoading(false);
      }
    },
    [fetchRecipes]
  );

  const contextValue = useMemo(
    () => ({
      recipes,
      searchQuery,
      page,
      pageSize,
      totalPages,
      loading,
      error,
      filterOwnedRecipes,
      toggleFilterOwnedRecipes,
      updateSearchQuery,
      updatePage,
      updatePageSize,
      editRecipe,
      deleteRecipe,
      fetchRecipes: memoizedFetchRecipes,
    }),
    [
      recipes,
      searchQuery,
      page,
      pageSize,
      totalPages,
      loading,
      error,
      filterOwnedRecipes,
      toggleFilterOwnedRecipes,
      updateSearchQuery,
      updatePage,
      updatePageSize,
      editRecipe,
      deleteRecipe,
      memoizedFetchRecipes,
    ]
  );

  return (
    <RecipesContext.Provider value={contextValue}>
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (!context) {
    throw new Error("useRecipes must be used within a RecipesProvider");
  }
  return context;
};
