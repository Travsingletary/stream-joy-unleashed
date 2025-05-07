
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Profile, ProfileContextType } from '../types/profile';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { toast } from './use-toast';

const defaultProfile: Profile = {
  id: 'default',
  name: 'Default',
  favorites: [],
  watchHistory: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
};

const ProfileContext = createContext<ProfileContextType>({
  profiles: [defaultProfile],
  currentProfile: defaultProfile,
  addProfile: () => {},
  updateProfile: () => {},
  deleteProfile: () => {},
  switchProfile: () => {}
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>([defaultProfile]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(defaultProfile);
  const navigate = useNavigate();

  // Load profiles from localStorage on mount
  useEffect(() => {
    const storedProfiles = localStorage.getItem('steadystream_profiles');
    const storedCurrentProfileId = localStorage.getItem('steadystream_current_profile');
    
    if (storedProfiles) {
      const parsedProfiles = JSON.parse(storedProfiles) as Profile[];
      setProfiles(parsedProfiles);
      
      // Set the current profile
      if (storedCurrentProfileId) {
        const profile = parsedProfiles.find(p => p.id === storedCurrentProfileId);
        if (profile) {
          setCurrentProfile(profile);
        } else if (parsedProfiles.length > 0) {
          setCurrentProfile(parsedProfiles[0]);
        }
      } else if (parsedProfiles.length > 0) {
        setCurrentProfile(parsedProfiles[0]);
      }
    } else {
      // No profiles found, redirect to profile creation
      navigate('/profiles');
    }
  }, [navigate]);

  // Update localStorage when profiles change
  useEffect(() => {
    localStorage.setItem('steadystream_profiles', JSON.stringify(profiles));
  }, [profiles]);

  // Update localStorage when current profile changes
  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem('steadystream_current_profile', currentProfile.id);
    }
  }, [currentProfile]);

  const addProfile = (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = Date.now();
    const newProfile: Profile = {
      ...profileData,
      id: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setProfiles(prev => [...prev, newProfile]);
    toast({
      title: "Profile Added",
      description: `Profile "${newProfile.name}" has been created!`,
    });
    return newProfile;
  };

  const updateProfile = (updatedProfile: Profile) => {
    setProfiles(prev => 
      prev.map(profile => 
        profile.id === updatedProfile.id 
          ? { ...updatedProfile, updatedAt: Date.now() } 
          : profile
      )
    );
    
    if (currentProfile && currentProfile.id === updatedProfile.id) {
      setCurrentProfile({ ...updatedProfile, updatedAt: Date.now() });
    }
    
    toast({
      title: "Profile Updated",
      description: `Profile "${updatedProfile.name}" has been updated!`,
    });
  };

  const deleteProfile = (profileId: string) => {
    const profileToDelete = profiles.find(p => p.id === profileId);
    
    if (profiles.length <= 1) {
      toast({
        variant: "destructive",
        title: "Cannot Delete Profile",
        description: "You must have at least one profile.",
      });
      return;
    }
    
    setProfiles(prev => prev.filter(profile => profile.id !== profileId));
    
    // If the current profile is deleted, switch to another one
    if (currentProfile && currentProfile.id === profileId) {
      const newCurrentProfile = profiles.find(p => p.id !== profileId);
      if (newCurrentProfile) {
        setCurrentProfile(newCurrentProfile);
      }
    }
    
    if (profileToDelete) {
      toast({
        title: "Profile Deleted",
        description: `Profile "${profileToDelete.name}" has been deleted.`,
      });
    }
  };

  const switchProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
      toast({
        title: "Profile Switched",
        description: `Switched to "${profile.name}" profile.`,
      });
    }
  };

  const contextValue: ProfileContextType = {
    profiles,
    currentProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    switchProfile
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => useContext(ProfileContext);
