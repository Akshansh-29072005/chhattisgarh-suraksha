import React from 'react';
import Icon from '../AppIcon';
import { getUserAchievements, getAchievementDetails, ACHIEVEMENTS } from '../../utils/mediaStorage';

const AchievementBadges = () => {
  const userAchievements = getUserAchievements();

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Award" size={18} className="text-primary" />
        <h3 className="font-semibold text-foreground">Your Achievements</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.values(ACHIEVEMENTS).map((achievement) => {
          const isUnlocked = userAchievements.includes(achievement.id);
          
          return (
            <div
              key={achievement.id}
              className={`flex items-center p-4 rounded-lg border ${
                isUnlocked 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-muted/30'
              }`}
            >
              <div className={`mr-3 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon name={achievement.icon} size={24} />
              </div>
              <div>
                <h4 className={`font-medium ${
                  isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {achievement.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementBadges;