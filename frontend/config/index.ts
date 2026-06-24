import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        // Android emulator
        return 'http://10.0.2.2:8080';
    } else if (Platform.OS === 'ios') {
        // iOS simulator
        return 'http://localhost:8080';
    } else {
        // Web
        return 'http://localhost:8080';
    }
};

export const BASE_URL = getBaseUrl();

export const CONFIG = {
    API_URL: BASE_URL,
    TOKEN_STORAGE_KEY: 'userToken',
    EMAIL_STORAGE_KEY: '@user_email',
};
