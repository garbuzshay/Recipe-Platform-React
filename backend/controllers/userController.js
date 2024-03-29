import { db } from '../fireBase.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    getAuth
  } from 'firebase/auth';
import User from '../models/User.js';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import FirestoreService from '../services/FirestoreService.js';
import { isAdmin } from '../services/UsersService.js';

/**
 * Controller class for managing user-related operations.
 */
class UserController {
    constructor() {
        // Explicitly bind the getUserByUsername function to the class instance
        this.registerUser = this.registerUser.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.getUserByUsername = this.getUserByUsername.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
        this.getCurrentUser = this.getCurrentUser.bind(this);

        this.firestoreService = new FirestoreService();
        this.auth = getAuth();
    }
    // Function to register a new user
    async registerUser(req, res) {
        try {
            const { username, password, displayName } = req.body;
                  
            // Check if the provided username is a valid email
            const email = this.toEmailAddress(username);

            // Check if the username is already taken
            const existingUserDoc = await this.firestoreService.getSingleDocByField('email', email);
            
            if (existingUserDoc) {
                return res.status(400).send('Username already exists. Please choose a different username.');
            }
        


            // Create a new user in Firebase Authentication
            const auth = getAuth();
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
        
             // Store additional user details in Firestore
            await this.firestoreService.setDocWithId(user.uid, { email: email, displayName, isAdmin: isAdmin(user) });
           
            const userModel = new User(user.uid, email, displayName, isAdmin(user));
        
            res.status(200).json(userModel);
        } catch (error) {
          let errorMessage = error.message;

          if (error) {
            if (error.code === 'auth/weak-password') {
              errorMessage = "Password should be at least 6 characters"
            }
            console.error(errorMessage);
            res.status(400).send(errorMessage);
          }
        }
      }
      
      // Function to log in a user
      async loginUser(req, res) {
        const { username, password } = req.body;
        try {
      
            // Check if the provided username is in email format
            const email = this.toEmailAddress(username);

            // Authenticate user using Firebase Authentication
            await signInWithEmailAndPassword(this.auth, email, password);
        
            const user = this.auth.currentUser;
        
            if (user) {
                 // Retrieve additional user details from Firestore
                const userDoc = await this.firestoreService.getSingleDocByField('email', user.email);

                // Construct a user model with retrieved details
                const userModel = new User(user.uid, user.email, userDoc ? userDoc.displayName : null, userDoc ? userDoc.isAdmin : isAdmin(user));
        
                res.status(200).json(userModel);
            } else {
                console.error(`Invalid username or password for username: ${username}`);
                res.status(401).send('Invalid username or password');
            }
        } catch (error) {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                console.error(`Invalid username or password for username: ${username}`);
                res.status(401).send('Invalid username or password');
            } else {
                // Log other errors
                console.error(`Error during login for username: ${username}`);
                console.error(error.message);
                res.status(500).send('Internal server error');
            }
        }
      }

      // Function to retrieve user data by username
      async getUserByUsername(username) {
        try {
            // Determine if the provided username is an email address
            const email = this.toEmailAddress(username);
            const existingUserDoc = await this.firestoreService.getSingleDocByField('email', email);

            return existingUserDoc.data();
        } catch (error) {
            console.error(error.message);
            return null;
        }
      }

  // Function to log out a user     
  async logoutUser(req, res) {
    try {
      await signOut(this.auth);

      res.status(200).send('Logout successful');
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  }

  // Function to retrieve current user data
  async getCurrentUser(req, res) {
    try {
      const user = this.auth.currentUser;

      if (user) {
        /// Retrieve additional user details from Firestore
        const userDoc = await this.firestoreService.getSingleDocByField('email', user.email);

        // Create a User model instance
        const userModel = new User(user.uid, user.email, userDoc ? userDoc.displayName : null, userDoc?.isAdmin);

        res.status(200).json(userModel);
      } else {
        res.status(401).send('User not authenticated');
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  }
  // Helper function to check if a string is in email format
  isEmail(username) {
    // Simple check to determine if the provided string is an email address
    return /\S+@\S+\.\S+/.test(username);
  }

  // Helper function to convert a string to an email address format
  toEmailAddress(username) {
    const lowerUsername = username.toLowerCase();
    const isEmailFormat = /\S+@\S+\.\S+/.test(lowerUsername);
    return isEmailFormat ? lowerUsername : `${lowerUsername}@mail.com`;
    
  }

}

export default new UserController();
