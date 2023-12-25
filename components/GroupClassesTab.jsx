import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';

const GroupClassesTab = ({ route }) => {
  const { classesInfo } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClassUsers, setSelectedClassUsers] = useState([]);

  const handleListItemPress = (item) => {
    setSelectedClassUsers(item.userNames);
    setModalVisible(true);
  };

  return (
    <View>
      <FlatList
        data={classesInfo}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleListItemPress(item)}>
            <View>
              <Text>{`${item.className} - ${item.classSection} - ${item.userCount} members`}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View>
          <Text>User Names</Text>
          <FlatList
            data={selectedClassUsers}
            keyExtractor={(userName) => userName}
            renderItem={({ item }) => (
              <View>
                <Text>{item}</Text>
              </View>
            )}
          />
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text>Close Modal</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default GroupClassesTab;
