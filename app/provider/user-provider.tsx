// app/provider/user-provider.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

// Define sample demo users (same as in app/page.tsx)
const demoUsers = [
  { id: 'user1', name: 'Alice' },
  { id: 'user2', name: 'Bob' },
  { id: 'user3', name: 'Charlie' },
];

// Define the shape of the context value
interface UserContextType {
  currentUser: string;
  setCurrentUser: (userId: string) => void;
  demoUsers: { id: string; name: string }[]; // Also provide the list of users
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create the provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from local storage or default to the first user
  const [currentUser, setCurrentUser] = useState<string>(() => {
    // Use a try-catch in case local storage is restricted
    try {
      const storedUser = localStorage.getItem('currentUser');
      // Check if the stored user ID is one of the demo users, otherwise default
      if (storedUser && demoUsers.some(user => user.id === storedUser)) {
        return storedUser;
      }
    } catch (error) {
       console.error("Failed to read currentUser from local storage", error);
    }
    return demoUsers[0].id;
  });

  // Effect to save the current user to local storage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem('currentUser', currentUser);
    } catch (error) {
         console.error("Failed to save currentUser to local storage", error);
    }
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, demoUsers }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the User Context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};