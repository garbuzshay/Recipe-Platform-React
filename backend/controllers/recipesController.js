import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../fireBase.js";
import Recipe from "../models/Recipe.js";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Function to parse ingredients
const parseIngredients = (ingredientsData) => {
  let ingredientsArray = [];
  // Validating the the data is indeed a string
  if (typeof ingredientsData !== 'string') {
    console.error( new Error('Invalid ingredients data. Expected a string.ingredientsData: '));
    console.error(ingredientsData)
    return null;
  }
  if (ingredientsData.includes(',')) {
    // Split by comma
    ingredientsArray = ingredientsData.split(',').map(ingredient => ingredient.trim());
  } else if (ingredientsData.includes('\n')) {
    // Split by newline
    ingredientsArray = ingredientsData.split('\n').map(ingredient => ingredient.trim());
  } else if (ingredientsData.includes('/s')) {
    // Split by space
    ingredientsArray = ingredientsData.split('/s').map(ingredient => ingredient.trim());
  } else {
    // Assume single ingredient
    ingredientsArray = [ingredientsData.trim()];
  }
  return ingredientsArray;
};

// Function to upload image to Firebase Storage
const uploadImage = async (imageData, name) => {
  try {
    let imageUrl = "";
    if (imageData.startsWith('data:image')) {
      // Extracting MIME type and base64 data from the image data
      const matches = imageData.match(/^data:(.+);base64,(.*)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 image data");
      }
      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");
      // Generate a unique filename using the provided name and current timestamp
      const filename = `${name}-${Date.now()}`;
      const storageRef = ref(storage, `recipeImages/${filename}`);
      const snapshot = await uploadBytes(storageRef, buffer, {
        contentType: mimeType,
      });
      imageUrl = await getDownloadURL(snapshot.ref);
    } else {
      // If imageData is a URL or any other format
      imageUrl = imageData;
    }
    
    return imageUrl;
  } catch (error) {
    throw new Error(`Error uploading image: ${error.message}`);
  }
};

/**
 * Controller class for managing recipe-related operations.
 */
class RecipeController {
  constructor() {
    this.createRecipe = this.createRecipe.bind(this);
    this.deleteRecipe = this.deleteRecipe.bind(this);
    this.getRecipe = this.getRecipe.bind(this);
    this.getRecipes = this.getRecipes.bind(this);
    this.updateRecipe = this.updateRecipe.bind(this);

    this.auth = getAuth();
  }

  // Function to create a new recipe
  async createRecipe(req, res) {
    try {
      const {
        name,
        description,
        ingredients,
        image,
        calories,
        fat,
        proteins,
        ...rest
      } = req.body;

      let imageUrl = "";

      // Check if there's an image file
      if (image) {
        imageUrl = await uploadImage(image, name);
      }

      // Split ingredients by newline and trim each ingredient
      const ingredientsArray = parseIngredients(ingredients);

      const nutritionalValues = { calories, fat, proteins };

      // Prepare the new recipe data with the image URL
      const newData = {
        name,
        description,
        ingredients: ingredientsArray,
        nutritionalValues,
        image: imageUrl,
        ...rest,
      };

      await setDoc(doc(collection(db, "recipe"), name), newData);
      res.status(200).send("Recipe created successfully");
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

  // Function to retrieve paginated recipes with optional search query
  async getRecipes(req, res) {
    try {
      const { page = 1, pageSize = 8, searchQuery, filterOwnedRecipes } = req.query;
      const recipesSnapshot = await getDocs(collection(db, "recipe"));
      let recipeArray = [];
      let recipe;
      const user = this.auth.currentUser;

      // Check if the collection is empty
      if (recipesSnapshot.empty) {
        console.error("No Recipes found");
        res.status(400).send("No Recipes found");
      } else {
        // Iterate through each document in the collection
        recipesSnapshot.forEach((doc) => {
          recipe = new Recipe(
            doc.id,
            doc.data().author,
            doc.data().name,
            doc.data().description,
            doc.data().ingredients,
            doc.data().preparation,
            doc.data().nutritionalValues,
            doc.data().image
          );
          recipeArray.push(recipe);
        });

        if (filterOwnedRecipes == "true") {
          recipeArray = recipeArray.filter((recipe) =>
            recipe.author == user.email
          );
        }

        // If searchQuery is provided, filter recipes based on the query
        if (searchQuery) {
          recipeArray = recipeArray.filter((recipe) =>
            recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Calculate start and end indices for pagination
        const startIndex = (+page - 1) * +pageSize;
        const endIndex = startIndex + +pageSize;

        // Get the subset of recipes based on pagination
        const paginatedRecipes = recipeArray.slice(startIndex, endIndex);

        res
          .status(200)
          .send({ data: paginatedRecipes, total: recipeArray.length });
      }
    } catch (error) {
      console.error(error.message);
      res.status(400).send(error.message);
    }
  }
  
  // Function to retrieve a single recipe by ID
  async getRecipe(req, res) {
    try {
      const { id } = req.params;
      // Retrieve the document corresponding to the recipe ID
      const recipeDoc = await getDoc(doc(db, "recipe", id));

      if (!recipeDoc.exists()) {
        res.status(404).send("Recipe not found");
      } else {
        // If the recipe document exists, construct a recipe object
        const recipe = {
          id: recipeDoc.id,
          ...recipeDoc.data(),
        };

        res.status(200).send(recipe);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
  
  // Function to update an existing recipe
  async updateRecipe(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        ingredients,
        image,
        calories,
        fat,
        proteins,
        ...rest
      } = req.body;

      let imageUrl = "";

      // Check if there's a new image file
      if (image) {
        imageUrl = await uploadImage(image,name);
      }

      // Split ingredients by newline and trim each ingredient
      const ingredientsArray = parseIngredients(ingredients);

      const nutritionalValues = { calories, fat, proteins };

      // Prepare the updated recipe data with the new image URL
      const updatedData = {
        name,
        description,
        ingredients: ingredientsArray,
        nutritionalValues,
        image: imageUrl,
        ...rest,
      };

      // Get a reference to the recipe document in Firestore
      const recipeRef = doc(db, "recipe", id);
      await updateDoc(recipeRef, updatedData);

      res.status(200).send({ id, message: "Recipe updated successfully" });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

  // Function to delete a recipe by ID
  async deleteRecipe(req, res) {
    try {
      const { id } = req.params;
      // Extract recipe ID from request parameters
      const recipeRef = doc(db, "recipe", id);
      // Delete the recipe document
      await deleteDoc(recipeRef);

      res.status(200).send({ id, message: "Recipe deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

}

export default new RecipeController();
