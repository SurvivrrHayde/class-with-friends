import React from 'react'
import { TouchableOpacity, Image, StyleSheet } from 'react-native'
export default function BackButton({ goBack }) {
  return (
    <TouchableOpacity onPress={goBack}>
      <Image
        style={styles.image}
        source={require('../assets/chevron-left.png')}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 20,
    height: 20,
  },
})