import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './src/page/home';
import Setting from './src/page/setting';

const Stack = createNativeStackNavigator();
 
function App() {

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                <Stack.Screen 
                    name="Home" 
                    component={Home} 
                    options={{
                        animation: 'slide_from_left'
                    }}
                />
                <Stack.Screen name="Setting" component={Setting} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;