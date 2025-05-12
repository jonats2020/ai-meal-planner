import { Platform } from 'react-native';

// Typography styles for the app
const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  captionBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
};

export default Typography;
