import React from "react";

/*
 * Modal component for adding a recipe to the meal planner.
 */
const Modal = ({ recipe, closeModal, addToPlanner }) => {
  const mealOptions = ["Breakfast", "Lunch", "Dinner"];
  return (
    <div className="modal bg-white w-44 p-4 rounded-lg shadow-md fixed top-1/2 left-0 z-10">
      <button
        className="close-modal-btn absolute top-2 left-2"
        onClick={closeModal}
      >
        x
      </button>

      <div className="text-center text-lg font-bold title mb-2 top">
        {`Add ${recipe.name} to:`}
      </div>

      {mealOptions.map((meal) => (
        <button
          key={meal}
          className="meal-option-btn text-green-500 py-1 px-2 mt-1 text-xs border border-green-500 px-3 rounded-full w-full max-w-full text-ellipsis whitespace-no-wrap AssistantFont font-semibold"
          onClick={() => {
            console.log(recipe);
            addToPlanner(meal, recipe);
            closeModal();
          }}
        >
          {meal.charAt(0).toUpperCase() + meal.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default Modal;
