import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import UserClassesTab from '../components/UserClassesTab';
import GroupClassesTab from '../components/GroupClassesTab';

const Tab = createMaterialTopTabNavigator();

const GroupDetailScreen = ({ route }) => {
  const { groupId } = route.params;

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="UserClasses"
        component={() => <UserClassesTab groupId={groupId} />}
        options={{ title: 'Your Classes' }}
      />
      <Tab.Screen
        name="GroupClasses"
        component={() => <GroupClassesTab groupId={groupId} />}
        options={{ title: 'Group Classes' }}
      />
    </Tab.Navigator>
  );
};

export default GroupDetailScreen;
