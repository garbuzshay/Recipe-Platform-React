import firebase from '../fireBase.js';
import Recipe from '../models/Recipe.js';

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const db = getFirestore(firebase);

class RecipeController {
  async createRecipe(req, res) {
    try {
      const data = req.body;
      await addDoc(collection(db, 'recipe'), data);
      res.status(200).send('Recipe created successfully');
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

  async getRecipes(req, res) {
    console.log("getRecipes")
    try {
      const recipesSnapshot = await getDocs(collection(db, 'recipe'));
      const recipeArray = [];

      if (recipesSnapshot.empty) {
        res.status(400).send('No Recipes found');
      } else {
        recipesSnapshot.forEach((doc) => {
          const recipe = new Recipe(
            doc.id,
            doc.data().author,
            doc.data().name,
            doc.data().description,
            doc.data().ingredients,
            doc.data().preparation,
            doc.data().nutritionalValues,
            // doc.data().calories,
            // doc.data().fat,
            // doc.data().protein,
            doc.data().image,
          );
          recipeArray.push(recipe);
        });

        res.status(200).send(recipeArray);
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

  async getRecipe(req, res) {
    try {
      const { id } = req.params;
      const recipeDoc = await getDoc(doc(db, 'recipe', id));

      if (!recipeDoc.exists()) {
        res.status(404).send('Recipe not found');
      } else {
        const recipe = {
          id: recipeDoc.id,
          ...recipeDoc.data(),
        };

        res.status(200).send(recipe);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

  async updateRecipe(req, res) {
    try {
      const { id } = req.params;
      const { nameUser, nameRecipe, description, ingredients, preparation, calories, fat, protein, imageUrl } = req.body;

      // Add your validation logic here if needed

      const recipeRef = doc(db, 'recipe', id);
      await updateDoc(recipeRef, {
        nameUser,
        nameRecipe,
        description,
        ingredients,
        preparation,
        calories,
        fat,
        protein,
        imageUrl,
      });

      res.status(200).send({ id, message: 'Recipe updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

  async deleteRecipe(req, res) {
    try {
      const { id } = req.params;

      const recipeRef = doc(db, 'recipe', id);
      await deleteDoc(recipeRef);

      res.status(200).send({ id, message: 'Recipe deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
}

export default new RecipeController();