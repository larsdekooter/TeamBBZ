import AsyncStorage from "@react-native-async-storage/async-storage";

export const setItem = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log(error);
  }
};

export async function getItem(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value != null ? JSON.parse(value) : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function removeItem(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.log(e);
  }
}

export async function mergeItem(key: string, value: string) {
  try {
    await AsyncStorage.mergeItem(key, value);
  } catch (e) {
    console.log(e);
  }
}

export async function clear() {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.log(e);
  }
}

export async function getAllItems() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    return items.reduce((accumulator: { [key: string]: any }, [key, value]) => {
      accumulator[key] = JSON.parse(value as string);
      return accumulator;
    }, {});
  } catch (e) {
    console.log(e);
  }
}
