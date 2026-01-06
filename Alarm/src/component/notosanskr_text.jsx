import React from 'react';
import { Text } from 'react-native';

const NotoSansKRText = ({ style, ...props }) => {
  return <Text {...props} style={[{ fontFamily: "NotoSansKR-Regular" }, style]} />;
};

export default NotoSansKRText;