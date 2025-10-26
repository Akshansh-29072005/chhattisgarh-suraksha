import React from 'react';
import Icon from '../../../components/AppIcon';
import { getUserAchievements, getAchievementDetails, getReportCount } from '../../../utils/mediaStorage';

const AchievementsPanel = () => {
  const achievements = getUserAchievements();
  const reportCount = getReportCount();

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Award" size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Your Impact</h3>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {reportCount} Reports Submitted
          </span>
        </div>
      </div>

      <div className="p-4">
        {achievements.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="Target" size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Start submitting reports to earn achievements!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map(achievementId => {
              const achievement = getAchievementDetails(achievementId);
              return (
                <div
                  key={achievement.id}
                  className="flex items-center p-3 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <div className="mr-3 text-primary">
                    <Icon name={achievement.icon} size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
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
        )}

        {/* Next Achievement Preview */}
        {achievements.length < Object.keys(getAchievementDetails()).length && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
            <h4 className="text-sm font-medium text-foreground mb-2">Next Achievement</h4>
            <div className="flex items-center">
              <div className="mr-3 text-muted-foreground">
                <Icon name="Lock" size={18} />
              </div>
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((reportCount / 25) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Submit {25 - reportCount} more reports to unlock Master Reporter
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPanel;