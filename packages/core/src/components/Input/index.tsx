import React from 'react';
import {TextInput, TextInputProps} from 'react-native';
import styles from './styles';
import {Colors} from '../../utils/values';

interface InputProps {
  error?: string;
}

const Input: React.FC<InputProps & TextInputProps> = ({
  error,
  style,
  ...props
}) => {
  return (
    <TextInput
      style={[styles.defaultInputStyles, style]}
      placeholderTextColor={Colors.whiteTransparent}
      selectionColor={Colors.primaryDark}
      {...props}
    />
  );
};

export default Input;
