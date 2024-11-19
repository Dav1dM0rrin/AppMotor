import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, Alert } from 'react-native';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as FileSystem from 'expo-file-system';

const API_URL = 'https://api-control-motor.onrender.com';

export default function ControlScreen() {
    const [ledStatus, setLedStatus] = useState('off');
    const [MotorStatus, setMotorStatus] = useState('off');
    const [token, setToken] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false); // Estado para manejar la visibilidad del modal
    const params = useLocalSearchParams();
  
    useEffect(() => {
        const checkToken = async () => {
            if (Platform.OS === 'web') {
                const storedToken = localStorage.getItem('userToken');
                if (storedToken) {
                    setToken(storedToken);
                } else if (params.token) {
                    localStorage.setItem('userToken', params.token as string);
                    setToken(params.token as string);
                } else {
                    alert('No hay sesión activa');
                    router.replace('/');
                }
            } else {
                try {
                    const fileUri = FileSystem.documentDirectory + 'userToken.txt';
                    const storedToken = await FileSystem.readAsStringAsync(fileUri).catch(() => null);
                    if (storedToken) {
                        setToken(storedToken);
                    } else if (params.token) {
                        await FileSystem.writeAsStringAsync(fileUri, params.token as string);
                        setToken(params.token as string);
                    } else {
                        alert('No hay sesión activa');
                        router.replace('/');
                    }
                } catch (error) {
                    console.error('Error al verificar el token:', error);
                    alert('Error al verificar la sesión');
                    router.replace('/');
                }
            }
        };

        checkToken();
    }, [params.token]);

    const handleLogout = async () => {
        try {
            if (token) {
                await axios.post(
                    `${API_URL}/api/logout`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
            }

            if (Platform.OS === 'web') {
                localStorage.removeItem('userToken');
            } else {
                const fileUri = FileSystem.documentDirectory + 'userToken.txt';
                await FileSystem.deleteAsync(fileUri);
            }

            router.replace('/');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            if (Platform.OS === 'web') {
                localStorage.removeItem('userToken');
            } else {
                const fileUri = FileSystem.documentDirectory + 'userToken.txt';
                await FileSystem.deleteAsync(fileUri);
            }
            router.replace('/');
        }
    };

    const showLogoutModal = () => {
        setIsModalVisible(true); // Mostrar el modal
    };

    const hideLogoutModal = () => {
        setIsModalVisible(false); // Ocultar el modal
    };

    const controlLed = async (state: 'on' | 'off') => {
        try {
            const response = await axios.post(
                `${API_URL}/api/controlar_led`,
                { state },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.data.message) {
                setLedStatus(state);
                Alert.alert('Éxito', `LED ${state === 'on' ? 'encendido' : 'apagado'} correctamente`);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                Alert.alert('Error', 'Sesión expirada', [
                    { text: 'OK', onPress: () => router.replace('/') }
                ]);
            } else {
                Alert.alert('Error', 'No se pudo controlar el LED');
            }
        }
    };

    const controlMotor = async (state: 'on' | 'off') => {
        try {
            const response = await axios.post(
                `${API_URL}/api/controlar_motor`,
                { state },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.data.message) {
                setMotorStatus(state);
                Alert.alert('Éxito', `MOTOR ${state === 'on' ? 'encendido' : 'apagado'} correctamente`);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                Alert.alert('Error', 'Sesión expirada', [
                    { text: 'OK', onPress: () => router.replace('/') }
                ]);
            } else {
                Alert.alert('Error', 'No se pudo controlar el MOTOR');
            }
        }
    };

    // Función para navegar a la pantalla de reportes
    const navigateToReportes = () => {
        router.push(`/reporte?token=${token}`);  // Pasamos el token como parámetro
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Panel de Control</Text>
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={showLogoutModal} // Mostrar el modal cuando se presiona el botón de cerrar sesión
                >
                    <Feather name="log-out" size={24} color="#FF3B30" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>

            {/* Modal de confirmación */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={hideLogoutModal}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>¿Estás seguro que deseas cerrar sesión?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={hideLogoutModal} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLogout} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>Sí</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    Estado actual del Led: {' '}
                    <Text style={[ 
                        styles.statusValue,
                        { color: ledStatus === 'on' ? '#00CC66' : '#FF3B30' }
                    ]}>
                        {ledStatus === 'on' ? 'ENCENDIDO' : 'APAGADO'}
                    </Text>
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, ledStatus === 'on' ? styles.activeButton : null]}
                    onPress={() => controlLed('on')}
                >
                    <Text style={styles.buttonText}>ENCENDER</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, ledStatus === 'off' ? styles.inactiveButton : null]}
                    onPress={() => controlLed('off')}
                >
                    <Text style={styles.buttonText}>APAGAR</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    Estado actual del Motor: {' '}
                    <Text style={[ 
                        styles.statusValue,
                        { color: MotorStatus === 'on' ? '#00CC66' : '#FF3B30' }
                    ]}>
                        {MotorStatus === 'on' ? 'ENCENDIDO' : 'APAGADO'}
                    </Text>
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, MotorStatus === 'on' ? styles.activeButton : null]}
                    onPress={() => controlMotor('on')}
                >
                    <Text style={styles.buttonText}>ENCENDER</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, MotorStatus === 'off' ? styles.inactiveButton : null]}
                    onPress={() => controlMotor('off')}
                >
                    <Text style={styles.buttonText}>APAGAR</Text>
                </TouchableOpacity>
            </View>

            {/* Botón para ir a Reportes */}
            <TouchableOpacity
                style={styles.button}
                onPress={navigateToReportes}
            >
                <Text style={styles.buttonText}>IR A REPORTES</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#FF3B30',
    },
    statusContainer: {
        marginVertical: 20,
    },
    statusText: {
        fontSize: 18,
    },
    statusValue: {
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    activeButton: {
        backgroundColor: '#00CC66',
    },
    inactiveButton: {
        backgroundColor: '#FF3B30',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
});
