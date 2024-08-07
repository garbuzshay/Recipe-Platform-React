import React, { useState, useEffect } from "react";
import RecipeCard from "./RecipeCard";
import Modal from "./Modal.js";
import RecipePopup from "./RecipePopup.js";
import { useRecipes } from "../context/RecipesContext"; 
import { usePlanner } from "../context/PlannerContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import usePopupMessage from "../hooks/usePopupMessage.js";
import PopupMessage from "./PopupMessage.js";
import useConfirmationDialog from '../hooks/useConfirmationDialog'; 
import ConfirmationDialog from './ConfirmationDialog'; // Import the ConfirmationDialog component

/**
 * RecipeList component displays a list of recipes fetched from the context.
 * It allows users to view, add to planner, edit, and delete recipes.
 */
function RecipeList() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecipeForPopup, setSelectedRecipeForPopup] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);


  const { isVisible: isPopupVisible, message, showPopup } = usePopupMessage(); // Use the custom hook for popup message
  const { isVisible: isConfirmationVisible, showConfirmationDialog, handleConfirm, handleCancel } = useConfirmationDialog(); // Use the custom hook for confirmation dialog

  const { addRecipeToPlanner } = usePlanner();
  const {
    recipes,
    page,
    totalPages,
    loading,
    error,
    fetchRecipes,
    updatePage,
    deleteRecipe,
  } = useRecipes();

  useEffect(() => {
    // Fetch recipes from the context
    fetchRecipes();
  }, [fetchRecipes]);

  // Paginates through the recipe list (The page number to navigate to).
  const paginate = (pageNumber) => {
    // Update the page in the context
    updatePage(pageNumber);
  };

  // Opens a popup displaying the details of a recipe.
  const openPopup = (recipe) => {
    setSelectedRecipeForPopup(recipe);
  };

  // Closes the recipe popup.
  const closePopup = () => {
    setSelectedRecipeForPopup(null);
  };

  // Handles adding a recipe to the planner.
  const handleAddToPlanner = (recipe) => {
    setModalOpen(true);
    setSelectedRecipe(recipe);
  };

  // Adds a recipe to the planner.
  const addToPlanner = (meal, recipe) => {
    // window.alert(`Recipe ${recipe.name} added to ${meal}`);
    showPopup(`Recipe ${recipe.name} added to ${meal}`);
    addRecipeToPlanner(meal, recipe);
  };

  // Handles editing a recipe.
  const handleEditRecipe = (recipe) => {
    // Navigate to the edit page with the recipeId as a URL parameter
    navigate(`/edit/${recipe.id || recipe.name}`);
  };

  // Handles the confirmation dialog for deleting a recipe.
  const handleDeleteConfirmation = (recipeId) => {
    showConfirmationDialog(
      // Function to execute when the user confirms deletion
      async () => {
        await deleteRecipe(recipeId);
        showPopup('Recipe deleted successfully');
      },
      () => showPopup('Deletion cancelled')
    );
  };


  const { theme } = useTheme();
  const { isDarkMode } = theme;

  const nextPrevStyles = {
    backgroundColor: isDarkMode ? "#1A202C" : "#48BB78",
  };

  
  return (
    <div>
      <PopupMessage isVisible={isPopupVisible} message={message} onClose={showPopup} duration={3000} />
      <ConfirmationDialog isVisible={isConfirmationVisible} onConfirm={handleConfirm} onCancel={handleCancel} />
      <div className="grid grid-cols-1 p-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:grid-cols-2">
        {recipes?.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            author={recipe.author}
            title={recipe.name}
            imageSrc={recipe.image}
            description={recipe.description}
            ingredients={recipe.ingredients}
            nutritionalValues={recipe.nutritionalValues}
            preparation={recipe.preparation}
            onAddToPlanner={() => handleAddToPlanner(recipe)}
            onOpenPopup={() => openPopup(recipe)}
            onEdit={() => handleEditRecipe(recipe)}
            onDelete={() => handleDeleteConfirmation(recipe.id)}
          />
        ))}
      </div>
      <div className="flex justify-center mt-4">
        {page > 1 && (
          <button
            onClick={() => paginate(page - 1)}
            className="mr-2 px-4 py-2 text-white rounded shadow-md hover:bg-green-800"
            style={nextPrevStyles}
          >
            PREV
          </button>
        )}
        {page < totalPages && (
          <button
            onClick={() => paginate(page + 1)}
            className="px-4 py-2 text-white rounded shadow-md hover:bg-green-500"
            style={nextPrevStyles}
          >
            NEXT
          </button>
        )}
      </div>

      {modalOpen && (
        <Modal
          recipe={selectedRecipe}
          addToPlanner={addToPlanner}
          closeModal={() => {
            setModalOpen(false);
            setSelectedRecipe(null);
          }}
        />
      )}
      {selectedRecipeForPopup && (
        <RecipePopup
          title={selectedRecipeForPopup.name}
          imageSrc={selectedRecipeForPopup.image}
          description={selectedRecipeForPopup.description}
          ingredients={selectedRecipeForPopup.ingredients}
          nutritionalValues={selectedRecipeForPopup.nutritionalValues}
          preparation={selectedRecipeForPopup.preparation}
          onClose={closePopup}
        />
      )}

      
    </div>
  );
}

export default RecipeList;
