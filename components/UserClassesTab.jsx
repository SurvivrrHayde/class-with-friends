import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import { StyleSheet } from 'react-native';

const UserClassesTab = ({ classesInfo }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClassUsers, setSelectedClassUsers] = useState([]);

  const handleListItemPress = (item) => {
    setSelectedClassUsers(item.userList);
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderText}>User Names</Text>
            <FlatList
              data={selectedClassUsers}
              keyExtractor={(userName) => userName}
              renderItem={({ item }) => (
                <View>
                  <Text>{item}</Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background color
  },
  modalContent: {
    width: '80%', // adjust the width as needed
    padding: 20,
    backgroundColor: '#fff', // white background color
    borderRadius: 10,
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#3498db', // blue background color
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff', // white text color
    fontWeight: 'bold',
  },
});

export default UserClassesTab;
