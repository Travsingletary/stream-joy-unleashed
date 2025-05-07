
import React, { useState } from 'react';
import { useProfiles } from '../../hooks/useProfiles';
import { Profile } from '../../types/profile';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogFooter } from "@/components/ui/dialog";
import { User, Upload } from 'lucide-react';
import { NotificationSettings } from '../notification/NotificationSettings';

interface ProfileEditFormProps {
  profile?: Profile;
  onClose: () => void;
  isEditing: boolean;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ profile, onClose, isEditing }) => {
  const { addProfile, updateProfile } = useProfiles();
  const [name, setName] = useState(profile?.name || '');
  const [avatar, setAvatar] = useState<string | undefined>(profile?.avatar);
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name
    if (!name.trim()) {
      setNameError('Profile name is required');
      return;
    }
    
    if (isEditing && profile) {
      updateProfile({
        ...profile,
        name,
        avatar
      });
    } else {
      addProfile({
        name,
        avatar,
        favorites: [],
        watchHistory: []
      });
    }
    
    onClose();
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 py-2">
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="w-24 h-24 border-2 border-steadystream-gold/30">
            {avatar ? (
              <AvatarImage src={avatar} alt={name} />
            ) : (
              <AvatarFallback className="bg-steadystream-gold/20 text-steadystream-gold text-2xl">
                {name ? getInitials(name) : <User />}
              </AvatarFallback>
            )}
          </Avatar>
          
          <Label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 text-steadystream-gold py-1 px-3 rounded-md border border-steadystream-gold/30 hover:bg-steadystream-gold/10 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Upload Image</span>
            </div>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarChange}
            />
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name" className="text-steadystream-gold-light">Profile Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) {
                setNameError('');
              }
            }} 
            placeholder="Enter profile name" 
            className={`bg-steadystream-black border-steadystream-gold/30 text-white ${nameError ? 'border-red-500' : ''}`}
          />
          {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
        </div>
        
        {isEditing && (
          <div className="pt-2">
            <NotificationSettings />
          </div>
        )}
      </div>
      
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose} className="border-steadystream-gold/30 text-steadystream-secondary">
          Cancel
        </Button>
        <Button type="submit" className="bg-gold-gradient hover:bg-gold-gradient-hover text-black">
          {isEditing ? 'Save Changes' : 'Create Profile'}
        </Button>
      </DialogFooter>
    </form>
  );
};
