import * as FileSystem from 'expo-file-system';

const path = FileSystem.documentDirectory + 'appsettings/settings.json';

const readJSONFile = async () => {
    try {
        const content = await FileSystem.readAsStringAsync(path);
        const data = JSON.parse(content);
        console.log('Read data:', data);
        return data;
    } catch (error) {
        console.log('Error reading json file:', error);
        return null;
    }
};

const writeJSONFile = async (jsonData) => {
    try {
        const jsonString = JSON.stringify(jsonData);
        await FileSystem.writeAsStringAsync(path, jsonString);
        console.log('settings.json file updated');
    } catch (error) {
        console.log('Error writing to json file:', error);
    }
};