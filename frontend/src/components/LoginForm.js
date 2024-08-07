import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AiOutlineUser, AiOutlineLock } from 'react-icons/ai';
import { FaUserCircle } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

/*
 * Component for rendering the login form.
 */ 
const LoginForm = ({ handleToggleMode }) => {
  // Use the login function from AuthContext
  const { login } = useAuth(); 
  const { theme } = useTheme();
  const { isDarkMode } = theme;
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  // New state for error message
  const [error, setError] = useState(null); 

  // Handles form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Reset the error state
      setError(null);

      // Authentication logic using AuthContext login function
      await login({ username: userName, password });
      console.log('Login successful');
      // Redirect or update UI after successful login
      // For example, using react-router to navigate to the home page:
      // history.push('/home');
      // Or simply refresh the page to reflect the new state:
      window.location.reload();
    } catch (error) {
      // Set the error state with the error message
      setError('Invalid username or password');
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center bg-cover">
      {/* Flex container for the image and login */}
      <div className={`rounded-2xl shadow-lg w-full sm:max-w-4xl ${
        isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-zinc-100 border-white text-black"
      } bg-opacity-5 backdrop-filter backdrop-blur-lg border flex overflow-hidden`}>

        {/* Image container */}
        <div className="hidden sm:block w-1/2 h-auto">
          <img
            src="https://www.eatingwell.com/thmb/m5xUzIOmhWSoXZnY-oZcO9SdArQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/article_291139_the-top-10-healthiest-foods-for-kids_-02-4b745e57928c4786a61b47d8ba920058.jpg"
            alt="Healthy Foods"
            className="object-cover h-full w-full"
          />
        </div>
        {/* Login container */}
        <div className={`p-8 w-full sm:w-1/2 ${isDarkMode ? "bg-gray-800" : "bg-zinc-100"} bg-opacity-10 backdrop-filter backdrop-blur-lg border`}>
          {/* User Icon */}
          <div className="flex justify-center">
            <FaUserCircle size={120} style={{ color: 'green', opacity: '0.5' }} className="mb-4" />
          </div>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
        <div className="mb-4 flex items-center border-b border-green-500">
            <AiOutlineUser className="text-2xl mr-2 text-green-700" />
            <input
              type="text"
              id="userName"
              name="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full border-none p-2 bg-transparent"
              placeholder="Username"
              required
            />
          </div>
          <div className="mb-4 flex items-center border-b border-green-500">
            <AiOutlineLock className="text-2xl mr-2 text-green-700" />
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-none p-2 bg-transparent"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 bg-opacity-60 text-white p-2 rounded-2xl hover:bg-green-600 focus:outline-none focus:ring focus:border-green-300 mt-4"
          >
            LOGIN
          </button>
        </form>
        <div className={`mt-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="text-green-500 underline"
              onClick={handleToggleMode}
            >
              Register here.
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
