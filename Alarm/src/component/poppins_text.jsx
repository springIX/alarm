import React from 'react';
import { Text } from 'react-native';

const PoppinsText = ({ style, ...props }) => {
  return <Text {...props} style={[{ fontFamily: "Poppins-Regular" }, style]} />;
};

export default PoppinsText;