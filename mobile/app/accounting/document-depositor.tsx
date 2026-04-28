import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

const CATEGORIES = [
    { id: 'income', title: 'Income Depositor', icon: 'trending-up', color: '#10b981' },
    { id: 'expense', title: 'Expense Depositor', icon: 'trending-down', color: '#ef4444' },
    { id: 'bank_statement', title: 'Bank Statements', icon: 'list', color: '#3b82f6' },
];

export default function DocumentDepositor() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handlePickImage = async (useCamera: boolean) => {
        if (!selectedCategory) {
            Alert.alert('Selection Required', 'Please select a category first.');
            return;
        }

        const { status } = useCamera 
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera/gallery permissions to make this work!');
            return;
        }

        const result = useCamera
            ? await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            uploadFile(result.assets[0]);
        }
    };

    const uploadFile = async (asset: ImagePicker.ImagePickerAsset) => {
        setUploading(true);
        const formData = new FormData();
        
        const uri = Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri;
        const filename = asset.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('file', {
            uri: asset.uri,
            name: filename || 'upload.jpg',
            type,
        } as any);
        
        formData.append('category', selectedCategory!);

        try {
            await api.post('/document-depositor/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert('Success', 'Document uploaded successfully!');
            setSelectedCategory(null);
        } catch (error: any) {
            console.log(error);
            Alert.alert('Upload Failed', error.response?.data?.message || 'Something went wrong while uploading.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Document Depositor</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.sectionTitle}>Select Category</Text>
                    <View style={styles.grid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryCard,
                                    selectedCategory === cat.id && { borderColor: cat.color, borderWidth: 2 }
                                ]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: cat.color + '20' }]}>
                                    <Ionicons name={cat.icon as any} size={32} color={cat.color} />
                                </View>
                                <Text style={styles.catTitle}>{cat.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {selectedCategory && (
                        <View style={styles.uploadSection}>
                            <Text style={styles.uploadTitle}>Choose Upload Method</Text>
                            <View style={styles.uploadButtons}>
                                <TouchableOpacity 
                                    style={styles.methodBtn} 
                                    onPress={() => handlePickImage(true)}
                                    disabled={uploading}
                                >
                                    <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.methodGradient}>
                                        <Ionicons name="camera" size={24} color="#fff" />
                                        <Text style={styles.methodText}>Take Picture</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.methodBtn} 
                                    onPress={() => handlePickImage(false)}
                                    disabled={uploading}
                                >
                                    <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.methodGradient}>
                                        <Ionicons name="images" size={24} color="#fff" />
                                        <Text style={styles.methodText}>Gallery</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {uploading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text style={styles.loadingText}>Uploading Document...</Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    content: { padding: 20 },
    sectionTitle: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    categoryCard: {
        width: '47%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    iconContainer: {
        width: 64, height: 64, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
    },
    catTitle: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
    uploadSection: { marginTop: 40 },
    uploadTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    uploadButtons: { gap: 12 },
    methodBtn: { borderRadius: 16, overflow: 'hidden' },
    methodGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 12 },
    methodText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    loadingOverlay: { marginTop: 30, alignItems: 'center' },
    loadingText: { color: '#94a3b8', marginTop: 12 },
});
