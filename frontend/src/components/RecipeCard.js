import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaTrashAlt, FaEdit } from 'react-icons/fa'; // Importing icons from FontAwesome
import { useAuth } from '../context/AuthContext'; // Import AuthContext to check user's admin status

/*
 * RecipeCard component displays a card with recipe information.
 */
const RecipeCard = ({
  title,
  author,
  imageSrc,
  description,
  ingredients,
  nutritionalValues,
  preparation,
  onAddToPlanner,
  onOpenPopup,
  onDelete,
  onEdit,
}) => {
  const { theme, getTheme } = useTheme();
  const { isDarkMode } = theme;
  const currentTheme = getTheme();

  // Get current user from AuthContext
  const { user } = useAuth(); 

  // Styles for card background and buttons based on theme
  // const cardStyle = {
  //   backgroundColor: theme[darkMode].secondary,
  //   color: darkMode === 'dark' ? '#FFFFFF' : '#333333',
  // };

  // Style for add to planner button based on theme
  const addToPlannerBtnStyle = {
    border: isDarkMode ? 'green-200' : 'gray-500', 
    text: isDarkMode ? 'white' : 'green-500', 
  };

  const isUserAdmin = user.isAdmin; 
  const isUserTheAuthor = author === user.email;
  
  return (
    <div className={`${currentTheme.card} rounded-lg shadow-md border-2 my-2 hover:scale-105 transition duration-200 recipe-card `}>
      <div className="p-4 flex flex-col h-full"> {/* Set height to full for the flex container */}
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-64 object-cover rounded-md mb-2"
          onClick={() => onOpenPopup({ title, imageSrc, description, ingredients, nutritionalValues, preparation })}
        />
        <div className="text-center text-lg font-semibold title mb-2">{title}</div>
        <p className="text-s description flex-grow mb-2">{description}</p>

        {/* Render delete and edit buttons only if the recipe was created by the current user or if the user is admin */}
        {(isUserTheAuthor || isUserAdmin) && (
          <div className="flex items-center justify-start mb-2">
            <button
              className={`delete-btn text-${addToPlannerBtnStyle.text} py-1 px-2 text-xs border border-${addToPlannerBtnStyle.border} rounded-full mr-2 flex items-center`}
              onClick={onDelete}
            >
              <FaTrashAlt className="mr-1" /> Delete
            </button>
            <button
              className={`edit-btn text-${addToPlannerBtnStyle.text} py-1 px-2 text-xs border border-${addToPlannerBtnStyle.border} rounded-full flex items-center`}
              onClick={onEdit}
            >
              <FaEdit className="mr-1" /> Edit
            </button>
          </div>
        )}

        <button
          className={`add-to-planner-btn text-${addToPlannerBtnStyle.text} py-1 px-2 text-xs border border-${addToPlannerBtnStyle.border} rounded-full mt-2`}
          onClick={onAddToPlanner}
        >
          + Add to Planner
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
