
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles';
import { Profile } from '../types/profile';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, User, Edit, Trash, ArrowRight } from 'lucide-react';
import { ProfileEditForm } from '../components/profile/ProfileEditForm';

const ProfilesPage: React.FC = () => {
  const { profiles, currentProfile, switchProfile } = useProfiles();
  const navigate = useNavigate();
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);

  const handleProfileSelect = (profile: Profile) => {
    switchProfile(profile.id);
    navigate('/');
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
  };

  const handleDeletePrompt = (profile: Profile) => {
    setProfileToDelete(profile);
    setIsDeleteDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-steadystream-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-steadystream-gold">
            Steadystream Profiles
          </h1>
          <p className="text-steadystream-secondary mt-2">
            Select a profile to personalize your streaming experience
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className={`bg-black border-steadystream-gold/20 hover:border-steadystream-gold/50 transition-all ${currentProfile?.id === profile.id ? 'border-steadystream-gold border-2' : ''}`}>
              <CardHeader className="text-center p-4">
                <Avatar className="w-20 h-20 mx-auto border-2 border-steadystream-gold/30">
                  {profile.avatar ? (
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                  ) : (
                    <AvatarFallback className="bg-steadystream-gold/20 text-steadystream-gold text-xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <CardTitle className="text-steadystream-gold-light mt-2 text-lg">
                  {profile.name}
                </CardTitle>
                {currentProfile?.id === profile.id && (
                  <p className="text-xs text-steadystream-gold/70">Current Profile</p>
                )}
              </CardHeader>
              <CardFooter className="flex justify-between p-4 pt-0 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 text-xs border-steadystream-gold/30 text-steadystream-secondary hover:bg-steadystream-gold/10"
                  onClick={() => handleEditProfile(profile)}
                >
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 text-xs border-steadystream-gold/30 text-steadystream-secondary hover:bg-steadystream-gold/10"
                  onClick={() => handleDeletePrompt(profile)}
                >
                  <Trash className="h-3 w-3 mr-1" /> Delete
                </Button>
              </CardFooter>
              <Button 
                className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black rounded-t-none"
                onClick={() => handleProfileSelect(profile)}
              >
                Select <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Card>
          ))}

          {/* Add New Profile Card */}
          <Card className="bg-black border-steadystream-gold/10 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-steadystream-gold/30 transition-all min-h-[240px]" onClick={() => setIsCreatingProfile(true)}>
            <CardContent className="flex flex-col items-center justify-center h-full p-6">
              <PlusCircle className="h-16 w-16 text-steadystream-gold/30" />
              <p className="text-steadystream-secondary mt-4 text-center">Add New Profile</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editingProfile !== null} onOpenChange={(open) => !open && setEditingProfile(null)}>
        <DialogContent className="bg-black border-steadystream-gold/20 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-steadystream-gold-light">Edit Profile</DialogTitle>
            <DialogDescription className="text-steadystream-secondary">
              Make changes to your profile here.
            </DialogDescription>
          </DialogHeader>
          {editingProfile && <ProfileEditForm profile={editingProfile} onClose={() => setEditingProfile(null)} isEditing={true} />}
        </DialogContent>
      </Dialog>

      {/* Create Profile Dialog */}
      <Dialog open={isCreatingProfile} onOpenChange={setIsCreatingProfile}>
        <DialogContent className="bg-black border-steadystream-gold/20 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-steadystream-gold-light">Create New Profile</DialogTitle>
            <DialogDescription className="text-steadystream-secondary">
              Add a new profile to personalize your streaming experience.
            </DialogDescription>
          </DialogHeader>
          <ProfileEditForm onClose={() => setIsCreatingProfile(false)} isEditing={false} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-black border-steadystream-gold/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-steadystream-gold-light">Delete Profile</DialogTitle>
            <DialogDescription className="text-steadystream-secondary">
              Are you sure you want to delete this profile? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (profileToDelete) {
                  const { deleteProfile } = useProfiles();
                  deleteProfile(profileToDelete.id);
                  setIsDeleteDialogOpen(false);
                  setProfileToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilesPage;
